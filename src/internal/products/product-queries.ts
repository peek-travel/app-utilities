/**
 * Raw Peek GraphQL queries and response shapes for products. These are an
 * internal implementation detail of the package and are deliberately not
 * re-exported from the public entry point.
 */

/** Fetches all activities (primary bookable products). */
export const PRODUCTS_QUERY = `
  query Sales {
    activities {
      name
      legacyId
      id
      deletedAt
      type
      colorHex
      resourceOptions {
        id
        name
      }
    }
  }
`;

/** A single activity node as returned by {@link PRODUCTS_QUERY}. */
export interface ActivityNode {
  name: string;
  legacyId?: string;
  id: string;
  deletedAt?: string | null;
  type: string;
  colorHex: string;
  resourceOptions: Array<{ id: string; name: string }>;
}

/** The `data` payload of {@link PRODUCTS_QUERY}. */
export interface ProductsResponse {
  activities: ActivityNode[];
}

/** Fetches a single cursor-paginated page of item options (add-ons). */
export const ITEM_OPTIONS_QUERY = `
  query GetItemOptions($first: Int, $after: String) {
    itemOptions(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          name
          description
          item {
            id
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/** A single item option node as returned by {@link ITEM_OPTIONS_QUERY}. */
export interface ItemOptionNode {
  id: string;
  name: string;
  description: string | null;
  item: {
    id: string;
    name: string;
  };
}

/** The `data` payload of {@link ITEM_OPTIONS_QUERY}. */
export interface ItemOptionsData {
  itemOptions: {
    edges: Array<{ cursor: string; node: ItemOptionNode }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}
