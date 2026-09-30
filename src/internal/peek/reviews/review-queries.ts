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
/**
 * Builds the reviews query. Without `fullCustomerAccess`, the reviewer's `name` and
 * `email` are not requested (they come back absent → `null` in the converter);
 * the review `comment`, rating, dates, and credited guides are always selected.
 */
export function buildReviewsQuery(fullCustomerAccess: boolean): string {
  return `
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
          ${fullCustomerAccess ? "name\n          email" : ""}
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
}

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

/** `data` payload of {@link buildReviewsQuery}. */
export interface ReviewsResponse {
  reviews: { edges: ReviewEdge[] } | null;
}

/**
 * Fetches every activity with its aggregate review statistics. The `activities`
 * connection is the same list `getAllProducts` reads; here only the id, name,
 * and `reviewMeta` rating distribution are selected. Carries no PII, so it is
 * unaffected by `fullCustomerAccess`.
 */
export const REVIEW_SUMMARIES_QUERY = `
  query ReviewSummaries {
    activities {
      id
      name
      reviewMeta {
        avgRating
        count
        fiveStar
        fourStar
        threeStar
        twoStar
        oneStar
      }
    }
  }
`;

/** An activity's aggregate review statistics as returned by the gateway. */
export interface ReviewMetaNode {
  avgRating: number | null;
  count: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

/** A single activity node as returned by {@link REVIEW_SUMMARIES_QUERY}. */
export interface ActivityReviewSummaryNode {
  id: string;
  name: string;
  reviewMeta: ReviewMetaNode | null;
}

/** The `data` payload of {@link REVIEW_SUMMARIES_QUERY}. */
export interface ReviewSummariesResponse {
  activities: ActivityReviewSummaryNode[];
}

/** Variables for {@link buildReviewsQuery}. */
export interface ReviewsVariables {
  first: number;
  filter: { activityIds: string[] };
  after: string | null;
}

/** Builds the variables for {@link buildReviewsQuery}. */
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
