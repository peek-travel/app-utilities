/**
 * Raw Peek GraphQL queries and response shapes for account users. Internal —
 * not re-exported from the public entry point.
 */

/** Fetches a cursor-paginated page of account users. */
export const USER_QUERY = `
  query Sales($first: Int, $after: String) {
    accountUsers(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          name
          email
          phone
          status
          assignedActivities {
            id
            name
          }
        }
      }
    }
  }
`;

/** Fetches account users matching a filter (e.g. by id). */
export const USER_BY_FILTER_QUERY = `
  query Sales($first: Int, $filter: AccountUsersFilter) {
    accountUsers(first: $first, filter: $filter) {
      edges {
        cursor
        node {
          id
          name
          email
          phone
          status
          assignedActivities {
            id
            name
          }
        }
      }
    }
  }
`;

/** A single account-user node as returned by the account-user queries. */
export interface AccountUserNode {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  assignedActivities: Array<{ id: string; name: string }>;
}

/** The `data` payload of the account-user queries. */
export interface AccountUsersResponse {
  accountUsers: {
    pageInfo?: { endCursor: string | null; hasNextPage: boolean };
    edges: Array<{ cursor: string; node: AccountUserNode }>;
  };
}
