/**
 * Review operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getReviewService}.
 */
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type { Review } from "../../models/review.js";
import { fromReviewNode } from "./review-converter.js";
import { encodeCursor } from "./review-cursor.js";
import {
  REVIEWS_QUERY,
  buildReviewsVariables,
  type ReviewsResponse,
} from "./review-queries.js";

/** Number of reviews returned when `reviewCount` is omitted. */
const DEFAULT_REVIEW_COUNT = 50;
/** Smallest allowed `reviewCount`. */
const MIN_REVIEW_COUNT = 1;
/** Largest allowed `reviewCount` (a single gateway page). */
const MAX_REVIEW_COUNT = 50;

const ERROR_PRODUCT_ID_REQUIRED = "productId is required";
const ERROR_INVALID_REVIEW_COUNT = `reviewCount must be an integer between ${MIN_REVIEW_COUNT} and ${MAX_REVIEW_COUNT}`;
const ERROR_INVALID_REVIEW_OFFSET = "reviewOffset must be a non-negative integer";

/**
 * Reads activity reviews from the gateway, which returns them newest-first
 * (descending `reviewedAt`). {@link ReviewService.getReviews} fetches a single
 * page of up to `reviewCount` reviews, skipping the first `reviewOffset` of
 * them via the connection cursor.
 *
 * Obtain an instance via {@link PeekAccessService.getReviewService}.
 */
export class ReviewService {
  constructor(private readonly client: GraphQLClient) {}

  /**
   * Returns up to `reviewCount` reviews for an activity in **descending order
   * by review date (newest first)**, skipping the `reviewOffset` newest reviews
   * before collecting.
   *
   * The gateway cursor resumes *after* a given absolute offset, so to skip the
   * first `reviewOffset` reviews the request is anchored on the review just
   * before the window. A `reviewOffset` of 0 needs no cursor and is sent
   * without one.
   *
   * @param productId - The activity (product) id to fetch reviews for.
   * @param reviewCount - How many reviews to return (1–50). Default: 50.
   * @param reviewOffset - How many of the newest reviews to skip first
   *   (0-based). Default: 0 (start at the newest review).
   *
   * @throws {Error} when `productId` is empty, `reviewCount` is not an integer
   * in 1–50, or `reviewOffset` is not a non-negative integer.
   *
   * @example
   * ```ts
   * const reviews = await peek
   *   .getReviewService()
   *   .getReviews("87cdf37f-1872-42cb-b0bd-518312624fc1", 25, 50);
   * ```
   */
  async getReviews(
    productId: string,
    reviewCount: number = DEFAULT_REVIEW_COUNT,
    reviewOffset = 0,
  ): Promise<Review[]> {
    this.validate(productId, reviewCount, reviewOffset);

    const after =
      reviewOffset > 0 ? encodeCursor(reviewOffset - 1, reviewCount) : null;

    const body: GraphQLBody<ReviewsResponse> =
      await this.client.request<ReviewsResponse>(
        SALES_ENDPOINT,
        REVIEWS_QUERY,
        buildReviewsVariables({ activityId: productId, first: reviewCount, after }),
      );

    const edges = body.data?.reviews?.edges ?? [];
    return edges.map((edge) => fromReviewNode(edge.node));
  }

  private validate(
    productId: string,
    reviewCount: number,
    reviewOffset: number,
  ): void {
    if (!productId) {
      throw new Error(ERROR_PRODUCT_ID_REQUIRED);
    }
    if (
      !Number.isInteger(reviewCount) ||
      reviewCount < MIN_REVIEW_COUNT ||
      reviewCount > MAX_REVIEW_COUNT
    ) {
      throw new Error(ERROR_INVALID_REVIEW_COUNT);
    }
    if (!Number.isInteger(reviewOffset) || reviewOffset < 0) {
      throw new Error(ERROR_INVALID_REVIEW_OFFSET);
    }
  }
}
