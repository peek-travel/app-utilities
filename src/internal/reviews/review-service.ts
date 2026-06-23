/**
 * Review operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getReviewService}.
 */
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type { Review } from "../../models/review.js";
import { fromReviewNode, toDateOnly } from "./review-converter.js";
import { decodeOffset, encodeCursor } from "./review-cursor.js";
import {
  REVIEWS_QUERY,
  buildReviewsVariables,
  type ReviewEdge,
  type ReviewsResponse,
} from "./review-queries.js";

/** Default page size for cursor-paginated reviews. */
const DEFAULT_PAGE_SIZE = 50;
/** Maximum allowed span, in days, between `startDate` and `endDate`. */
const MAX_RANGE_DAYS = 31;
/** Milliseconds in a day. */
const DAY_MS = 86_400_000;
/** Matches an ISO `YYYY-MM-DD` date string. */
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const ERROR_PRODUCT_ID_REQUIRED = "productId is required";
const ERROR_INVALID_DATE = "startDate and endDate must be ISO YYYY-MM-DD dates";
const ERROR_START_AFTER_END = "startDate must not be after endDate";
const ERROR_RANGE_TOO_LARGE = `The range between startDate and endDate must not exceed ${MAX_RANGE_DAYS} days`;

/** Tuning options for a {@link ReviewService}. */
export interface ReviewServiceOptions {
  /** Page size for cursor pagination. Default: 50. */
  pageSize?: number;
}

/**
 * Per-activity cursor cache. Cursors are not stable across queries (their
 * encoded offset shifts when reviews are added), so the cache stores decoded
 * page-boundary offsets together with the id of the topmost review (`headId`)
 * at the time they were recorded. On reuse the offsets are re-anchored by
 * re-finding `headId` and shifting every offset by where it now sits.
 */
interface CursorCacheEntry {
  /** Id of the topmost (newest) review when the offsets were recorded. */
  headId: string;
  /** oldest-review-date on a page → that page's last (oldest) absolute offset. */
  offsets: Map<string, number>;
}

/**
 * Reviews are returned by the gateway newest-first (descending `reviewedAt`),
 * a page at a time, with no server-side date filter. {@link
 * ReviewService.getReviews} walks backwards in time, collecting reviews whose
 * review date falls within the requested window, and stops as soon as it pages
 * past the older bound.
 *
 * To avoid re-paginating from the newest review on every call, the service
 * keeps an in-memory, per-activity {@link CursorCacheEntry}. Because the
 * gateway cursor encodes an unstable absolute offset, the cache stores decoded
 * offsets plus the current head review id; on a later cached call it pulls from
 * the top, re-finds the head to learn how far offsets have shifted, re-anchors
 * them, and then jumps straight to the requested window.
 *
 * Obtain an instance via {@link PeekAccessService.getReviewService}.
 */
export class ReviewService {
  private readonly pageSize: number;
  private readonly cursorCache = new Map<string, CursorCacheEntry>();

  constructor(
    private readonly client: GraphQLClient,
    options: ReviewServiceOptions = {},
  ) {
    this.pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  }

  /**
   * Returns the reviews for an activity whose review date falls within
   * `[startDate, endDate]` (inclusive), newest-first.
   *
   * Because the gateway has no date filter, the window is found by paginating
   * backwards (newest-first). When `useCache` is true (the default) the service
   * re-anchors its cached offsets against the current head review and jumps to
   * the closest cached page just newer than `endDate` instead of walking from
   * the newest review. Every call refreshes the cache.
   *
   * @param productId - The activity (product) id to fetch reviews for.
   * @param startDate - Older bound (`YYYY-MM-DD`), inclusive.
   * @param endDate - More recent bound (`YYYY-MM-DD`), inclusive.
   * @param useCache - Re-anchor and jump using the cursor cache. Default: true.
   *
   * @throws {Error} when `productId` is empty, either date is not `YYYY-MM-DD`,
   * `startDate` is after `endDate`, or the window exceeds 31 days.
   *
   * @example
   * ```ts
   * const reviews = await peek
   *   .getReviewService()
   *   .getReviews("87cdf37f-1872-42cb-b0bd-518312624fc1", "2025-08-01", "2025-08-31");
   * ```
   */
  async getReviews(
    productId: string,
    startDate: string,
    endDate: string,
    useCache = true,
  ): Promise<Review[]> {
    this.validate(productId, startDate, endDate);

    const prior = useCache ? this.cursorCache.get(productId) : undefined;

    const reviews: Review[] = [];
    const seenIds = new Set<string>();
    const freshOffsets = new Map<string, number>();

    let newHeadId: string | null = null;
    // Offset at which the prior head was re-found this call (= how far offsets
    // shifted). Null until found; stays null when there is no prior entry.
    let headShift: number | null = prior ? null : 0;
    let after: string | null = null;
    let lastOffset = -1;
    let jumpAttempted = false;

    for (;;) {
      const edges = await this.fetchPage(productId, after);
      if (edges.length === 0) {
        break;
      }

      let pagedPastStart = false;
      for (const edge of edges) {
        const offset = decodeOffset(edge.cursor);
        const id = edge.node.id;
        if (newHeadId === null) {
          newHeadId = id;
        }
        if (prior && headShift === null && id === prior.headId) {
          headShift = offset;
        }
        lastOffset = offset;

        const review = fromReviewNode(edge.node);
        if (review.reviewDate > endDate) {
          continue; // newer than the window — keep paging back
        }
        if (review.reviewDate < startDate) {
          pagedPastStart = true; // older than the window — nothing left to find
          break;
        }
        if (!seenIds.has(id)) {
          seenIds.add(id);
          reviews.push(review);
        }
      }

      // Record this page's boundary: its oldest review date → its last offset.
      const lastEdge = edges[edges.length - 1]!;
      freshOffsets.set(toDateOnly(lastEdge.node.reviewedAt), decodeOffset(lastEdge.cursor));

      if (pagedPastStart || edges.length < this.pageSize) {
        break;
      }

      // Once the head is re-anchored, jump (at most once) to the cached page
      // just newer than endDate, skipping the pages in between.
      if (prior && !jumpAttempted && headShift !== null) {
        jumpAttempted = true;
        const target = closestOffsetAboveEnd(prior.offsets, endDate, headShift);
        if (target !== null && target > lastOffset) {
          after = encodeCursor(target, this.pageSize);
          continue;
        }
      }
      after = lastEdge.cursor;
    }

    this.refreshCache(productId, newHeadId, prior, headShift, freshOffsets);
    return reviews;
  }

  /** Fetches a single page of review edges, resuming after `after`. */
  private async fetchPage(
    productId: string,
    after: string | null,
  ): Promise<ReviewEdge[]> {
    const body: GraphQLBody<ReviewsResponse> =
      await this.client.request<ReviewsResponse>(
        SALES_ENDPOINT,
        REVIEWS_QUERY,
        buildReviewsVariables({ activityId: productId, first: this.pageSize, after }),
      );
    return body.data?.reviews?.edges ?? [];
  }

  /**
   * Rewrites the cache entry for an activity. Prior offsets are carried over
   * (re-anchored by `headShift`) only when the prior head was re-found this
   * call; otherwise they are dropped as unreliable. Fresh boundaries always win.
   */
  private refreshCache(
    productId: string,
    newHeadId: string | null,
    prior: CursorCacheEntry | undefined,
    headShift: number | null,
    freshOffsets: Map<string, number>,
  ): void {
    if (newHeadId === null) {
      return; // nothing fetched — leave any existing entry untouched
    }
    const offsets = new Map<string, number>();
    if (prior && headShift !== null) {
      for (const [date, offset] of prior.offsets) {
        offsets.set(date, offset + headShift);
      }
    }
    for (const [date, offset] of freshOffsets) {
      offsets.set(date, offset);
    }
    this.cursorCache.set(productId, { headId: newHeadId, offsets });
  }

  private validate(productId: string, startDate: string, endDate: string): void {
    if (!productId) {
      throw new Error(ERROR_PRODUCT_ID_REQUIRED);
    }
    if (!ISO_DATE_REGEX.test(startDate) || !ISO_DATE_REGEX.test(endDate)) {
      throw new Error(ERROR_INVALID_DATE);
    }
    const startMs = Date.parse(startDate);
    const endMs = Date.parse(endDate);
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      throw new Error(ERROR_INVALID_DATE);
    }
    if (startMs > endMs) {
      throw new Error(ERROR_START_AFTER_END);
    }
    if ((endMs - startMs) / DAY_MS > MAX_RANGE_DAYS) {
      throw new Error(ERROR_RANGE_TOO_LARGE);
    }
  }
}

/**
 * Returns the re-anchored offset of the cached page whose oldest review date is
 * the closest one still newer than `endDate`, so pagination can resume just
 * above the window without skipping any in-range review. Returns null when no
 * cached date qualifies.
 */
function closestOffsetAboveEnd(
  offsets: Map<string, number>,
  endDate: string,
  headShift: number,
): number | null {
  let bestDate: string | null = null;
  let bestOffset: number | null = null;
  for (const [date, offset] of offsets) {
    if (date > endDate && (bestDate === null || date < bestDate)) {
      bestDate = date;
      bestOffset = offset;
    }
  }
  return bestOffset === null ? null : bestOffset + headShift;
}
