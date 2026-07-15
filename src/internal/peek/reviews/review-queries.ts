/**
 * Raw Peek GraphQL query and response shapes for activity reviews. Internal —
 * never re-exported from the public barrel.
 */

/**
 * Fetches a page of reviews, newest-first, optionally filtered by activity and
 * resumed from a cursor. The gateway returns up to `first` reviews per page in
 * descending `reviewedAt` order; pagination walks backwards in time via the
 * last edge's `cursor` as the next `after`.
 */
export const REVIEWS_QUERY = `
  query Reviews($first: Int, $filter: ReviewFilter, $after: String) {
    reviews(first: $first, filter: $filter, after: $after) {
      edges {
        node {
          activity {
            id
            name
          }
          guides {
            id
            name
          }
          id
          name
          email
          rating
          comment
          reviewedAt
          purchasedFor
        }
        cursor
      }
    }
  }
`;

/** A guide node as returned by the gateway. */
export interface ReviewGuideNode {
  id: string;
  name: string;
}

/** A single review node as returned by the gateway. */
export interface ReviewNode {
  activity: { id: string; name: string } | null;
  guides: ReviewGuideNode[] | null;
  id: string;
  name: string | null;
  email: string | null;
  rating: number;
  comment: string | null;
  reviewedAt: string;
  purchasedFor: string;
}

/** A single edge in the reviews connection. */
export interface ReviewEdge {
  node: ReviewNode;
  cursor: string;
}

/** `data` payload of {@link REVIEWS_QUERY}. */
export interface ReviewsResponse {
  reviews: { edges: ReviewEdge[] } | null;
}

/** Variables for {@link REVIEWS_QUERY}. */
export interface ReviewsVariables {
  first: number;
  filter: { activityIds: string[] };
  after: string | null;
}

/** Builds the variables for {@link REVIEWS_QUERY}. */
export function buildReviewsVariables(params: {
  activityId: string;
  first: number;
  after: string | null;
}): ReviewsVariables {
  return {
    first: params.first,
    filter: { activityIds: [params.activityId] },
    after: params.after,
  };
}
