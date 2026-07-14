/**
 * Raw Peek GraphQL query, variables, and response shapes for listing the
 * add-ons (items + item options) attached to a single booking. Internal.
 *
 * The `SALES_ADDONS_QUERY` runs the `sales` query filtered by a booking's
 * display id (`filter.searchString`) and returns every item on the booking
 * together with its item options, refids, and reservation statuses — the
 * detail needed both to surface add-ons and to build add/cancel mutations.
 */

/** Reservation status for a live (confirmed) item or option. */
export const RESERVATION_STATUS_CONFIRMED = "CONFIRMED";
/** Reservation status marking an item or option as canceled. */
export const ADDON_OPTION_STATUS_CANCELED = "CANCELED";

/** Page size for the sales add-ons query (a single booking, so one page). */
const SALES_ADDONS_PAGE_SIZE = 100;

/**
 * GraphQL query fetching the items and item options for a single booking
 * matched by `filter.searchString` (the booking display id).
 */
export const SALES_ADDONS_QUERY = `
  query Sales($after: String, $first: Int, $filter: SalesFilter!, $orderBy: SalesOrdering) {
    sales(after: $after, first: $first, filter: $filter, orderBy: $orderBy) {
      pageInfo { endCursor hasNextPage }
      edges {
        node {
          order { id displayId }
          ... on Booking {
            displayId
            id
            refid
            reservationStatus
            items {
              id
              refid
              value { total { amount currency formatted } }
              reservationStatus
              options {
                refid
                reservationStatus
                price { amount currency formatted }
                itemOptionSnapshot { id name }
                itemSnapshot { id name }
              }
            }
          }
        }
      }
    }
  }
`;

/** Variables for {@link SALES_ADDONS_QUERY}. */
export interface SalesAddonsVariables {
  first: number;
  after: string | null;
  orderBy: { direction: string; field: string };
  filter: { searchString: string };
}

/** Builds the variables for the sales add-ons query from a booking display id. */
export function buildSalesAddonsVariables(searchString: string): SalesAddonsVariables {
  return {
    first: SALES_ADDONS_PAGE_SIZE,
    after: null,
    orderBy: { direction: "DESC", field: "STARTS_AT" },
    filter: { searchString },
  };
}

/** Raw money shape returned by the `sales` add-ons query. */
export interface AddonGqlPrice {
  amount: string;
  currency: string;
  formatted: string;
}

export interface SalesAddonItemOptionNode {
  refid: string;
  reservationStatus: string;
  price: AddonGqlPrice | null;
  itemOptionSnapshot: { id: string; name: string } | null;
  itemSnapshot: { id: string; name: string } | null;
}

export interface SalesAddonItemNode {
  id: string;
  refid: string;
  value: { total: AddonGqlPrice | null } | null;
  reservationStatus: string;
  options: SalesAddonItemOptionNode[] | null;
}

export interface SalesAddonBookingNode {
  id: string;
  displayId: string;
  refid: string;
  reservationStatus: string;
  order: { id: string; displayId: string } | null;
  items: SalesAddonItemNode[] | null;
}

export interface SalesAddonsResponse {
  sales: {
    pageInfo: { endCursor: string | null; hasNextPage: boolean };
    edges: Array<{ node: SalesAddonBookingNode }>;
  };
}
