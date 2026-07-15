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
