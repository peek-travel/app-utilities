/**
 * Clean data models for Peek activity reviews.
 */

/** A guide credited on a review. */
export interface Guide {
  /** Guide id (e.g. `u_y6e4r`). */
  id: string;
  /** Guide display name. */
  name: string;
}

/** A single customer review for an activity (product). */
export interface Review {
  /** Review id (e.g. `rvw_359erv`). */
  id: string;
  /** Activity (product) id the review is for. */
  productId: string;
  /** Activity (product) name. */
  productName: string;
  /** Guides credited on the review. May be empty. */
  guides: Guide[];
  /** Customer name. May be null. */
  customerName: string | null;
  /** Customer email. May be null. */
  customerEmail: string | null;
  /** Activity date (`YYYY-MM-DD`), derived from `purchasedFor`. */
  activityDate: string;
  /** Review date (`YYYY-MM-DD`), derived from `reviewedAt`. */
  reviewDate: string;
  /** Star rating, 1–5. */
  rating: number;
  /** Free-text review. May be null. */
  comment: string | null;
}

/**
 * Aggregate review statistics for a single activity (product), as returned by
 * {@link ReviewService.getAllReviewSummaries}. Carries no per-review detail or
 * PII — just the rating distribution and average.
 */
export interface ProductReviewSummary {
  /** Activity (product) id the summary is for. */
  productId: string;
  /** Activity (product) name. */
  productName: string;
  /** Average star rating as a decimal, or `null` when there are no ratings. */
  avgRating: number | null;
  /** Total number of reviews. */
  countTotal: number;
  /** Number of 1-star reviews. */
  countOneStar: number;
  /** Number of 2-star reviews. */
  countTwoStar: number;
  /** Number of 3-star reviews. */
  countThreeStar: number;
  /** Number of 4-star reviews. */
  countFourStar: number;
  /** Number of 5-star reviews. */
  countFiveStar: number;
}
