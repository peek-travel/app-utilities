/**
 * Pure, I/O-free mapping from raw review nodes to the clean {@link Review}
 * model. No network, no logging, no clock access.
 */
import type { Guide, Review } from "../../models/review.js";
import type { ReviewNode } from "./review-queries.js";

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
