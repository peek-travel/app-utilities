/**
 * Pure, I/O-free mapping from raw review nodes to the clean {@link Review}
 * model. No network, no logging, no clock access.
 */
import type {
  Guide,
  ProductReviewSummary,
  Review,
} from "../../../models/peek/review.js";
import type {
  ActivityReviewSummaryNode,
  ReviewNode,
} from "./review-queries.js";

/** Length of an ISO `YYYY-MM-DD` date prefix. */
const ISO_DATE_LENGTH = 10;

/** Extracts the `YYYY-MM-DD` date prefix from an ISO date-time string. */
export function toDateOnly(isoDateTime: string): string {
  return isoDateTime.slice(0, ISO_DATE_LENGTH);
}

/** Maps a raw review node to the clean {@link Review} model. */
export function fromReviewNode(node: ReviewNode): Review {
  const guides: Guide[] = (node.guides ?? []).map((guide) => ({
    id: guide.id,
    name: guide.name,
  }));

  return {
    id: node.id,
    productId: node.activity?.id ?? "",
    productName: node.activity?.name ?? "",
    guides,
    customerName: node.name ?? null,
    customerEmail: node.email ?? null,
    activityDate: toDateOnly(node.purchasedFor),
    reviewDate: toDateOnly(node.reviewedAt),
    rating: node.rating,
    comment: node.comment ?? null,
  };
}

/**
 * Maps a raw activity node to a clean {@link ProductReviewSummary}. A missing
 * `reviewMeta` (an activity with no reviews) collapses to a null average and
 * zero counts.
 */
export function fromActivityReviewSummaryNode(
  node: ActivityReviewSummaryNode,
): ProductReviewSummary {
  const meta = node.reviewMeta;
  return {
    productId: node.id,
    productName: node.name,
    avgRating: meta?.avgRating ?? null,
    countTotal: meta?.count ?? 0,
    countOneStar: meta?.oneStar ?? 0,
    countTwoStar: meta?.twoStar ?? 0,
    countThreeStar: meta?.threeStar ?? 0,
    countFourStar: meta?.fourStar ?? 0,
    countFiveStar: meta?.fiveStar ?? 0,
  };
}

/** Maps every activity node to a {@link ProductReviewSummary}. */
export function fromActivityReviewSummaryNodes(
  nodes: ActivityReviewSummaryNode[],
): ProductReviewSummary[] {
  return nodes.map(fromActivityReviewSummaryNode);
}
