/**
 * Raw Peek GraphQL query/mutation and response shapes for promo codes.
 * Internal. The promo-code node matches the public {@link PromoCode} model
 * one-to-one, so no converter is needed.
 */
import type { PromoCode } from "../../models/promo-code.js";

/** Fetches a cursor-paginated page of promo codes. */
export const PROMO_CODES_QUERY = `
  query Sales($first: Int, $after: String) {
    promoCodes(first: $first, after: $after) {
      edges {
        node {
          id
          name
          percentAmount
          perTicketDiscount
          redemptionCode
          fixedAmount {
            amount
            currency
            formatted
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

/** Creates a promo code. Returns the new code's id/name or an InvalidDataError. */
export const CREATE_PROMO_CODE_MUTATION = `
  mutation Sales($input: CreatePromoCodeInput!) {
    createPromoCode(input: $input) {
      ... on InvalidDataError {
        message
      }
      ... on PromoCode {
        id
        name
      }
    }
  }
`;

/** `data` payload of {@link PROMO_CODES_QUERY}. */
export interface PromoCodesResponse {
  promoCodes: {
    edges: Array<{ node: PromoCode }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

/** `data` payload of {@link CREATE_PROMO_CODE_MUTATION}. */
export interface CreatePromoCodeResponse {
  createPromoCode: { message: string } | { id: string; name: string };
}

/** Variables for {@link CREATE_PROMO_CODE_MUTATION}. */
export interface CreatePromoCodeVariables {
  input: {
    code: string;
    name: string;
    maxRedeemCount?: number;
    fixedAmount?: { amount: string; currency: string };
    percentAmount?: string;
  };
}
