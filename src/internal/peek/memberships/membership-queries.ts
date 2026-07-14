/**
 * Raw Peek GraphQL query and response shape for memberships. Internal.
 */

/** Fetches all memberships with their variants. */
export const MEMBERSHIPS_QUERY = `
  query Sales {
    memberships {
      name
      id
      membershipVariants {
        id
        description
        imageUrl
        externalName
        internalName
      }
    }
  }
`;

/** A single membership variant node. */
export interface MembershipVariantNode {
  id: string;
  description: string | null;
  imageUrl: string | null;
  externalName: string;
  internalName: string;
}

/** A single membership node as returned by {@link MEMBERSHIPS_QUERY}. */
export interface MembershipNode {
  name: string;
  id: string;
  membershipVariants: MembershipVariantNode[];
}

/** The `data` payload of {@link MEMBERSHIPS_QUERY}. */
export interface MembershipsResponse {
  memberships: MembershipNode[];
}

/** Creates a quote (used here to start a membership purchase). */
export const CREATE_QUOTE_V2_MUTATION = `
  mutation CreateQuoteV2($input: CreateQuoteV2Input!) {
    createQuoteV2(input: $input) {
      errors { detail value code }
      quote { id }
    }
  }
`;

/** Creates a membership order from a quote. */
export const CREATE_MEMBERSHIP_ORDER_FROM_QUOTE_MUTATION = `
  mutation CreateOrderFromQuote($input: CreateOrderFromQuoteInput!) {
    createOrderFromQuote(input: $input) {
      errors { code detail value }
      order {
        id
        sales {
          id
          displayId
          ... on SoldMembership {
            id
            displayId
            primaryMember { name id }
            balance { total { amount currency formatted } }
          }
        }
      }
    }
  }
`;

/** Member details attached to a membership quote. */
export interface MembershipMember {
  email: string;
  country?: string;
  formattedAddress?: string;
  membershipCode?: string;
  name?: string;
  phone?: string;
}

interface MutationError {
  code: string;
  detail: string;
  value: string | null;
}

/** `data` payload of {@link CREATE_QUOTE_V2_MUTATION}. */
export interface CreateQuoteV2Response {
  createQuoteV2: { errors: MutationError[] | null; quote: { id: string } | null };
}

/** A sold membership returned by the order mutation. */
export interface SoldMembershipSale {
  id: string;
  displayId: string;
  primaryMember?: { id: string; name: string } | null;
  balance?: { total: { amount: string; currency: string; formatted: string } } | null;
}

/** `data` payload of {@link CREATE_MEMBERSHIP_ORDER_FROM_QUOTE_MUTATION}. */
export interface CreateMembershipOrderResponse {
  createOrderFromQuote: {
    errors: MutationError[] | null;
    order: { id: string; sales: SoldMembershipSale[] } | null;
  };
}
