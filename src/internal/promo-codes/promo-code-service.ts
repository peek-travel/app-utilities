/**
 * Promo-code operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getPromoCodeService}.
 */
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type {
  CreatePromoCodeInput,
  CreatedPromoCode,
  PromoCode,
} from "../../models/promo-code.js";
import {
  CREATE_PROMO_CODE_MUTATION,
  PROMO_CODES_QUERY,
  type CreatePromoCodeResponse,
  type CreatePromoCodeVariables,
  type PromoCodesResponse,
} from "./promo-code-queries.js";

/** Default page size for cursor-paginated promo codes. */
const DEFAULT_PAGE_SIZE = 50;
/** Default currency for fixed-amount discounts. */
const DEFAULT_CURRENCY = "USD";
/** ISO currency codes are three uppercase letters. */
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

/** Tuning options for a {@link PromoCodeService}. */
export interface PromoCodeServiceOptions {
  /** Page size for cursor pagination. Default: 50. */
  pageSize?: number;
}

export class PromoCodeService {
  private readonly pageSize: number;

  constructor(
    private readonly client: GraphQLClient,
    options: PromoCodeServiceOptions = {},
  ) {
    this.pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  }

  /** Returns all promo codes, walking the cursor pagination to the end. */
  async getAll(): Promise<PromoCode[]> {
    const all: PromoCode[] = [];
    let after: string | null = null;

    for (;;) {
      const body: GraphQLBody<PromoCodesResponse> =
        await this.client.request<PromoCodesResponse>(SALES_ENDPOINT, PROMO_CODES_QUERY, {
          first: this.pageSize,
          after,
        });

      const connection = body.data?.promoCodes;
      for (const edge of connection?.edges ?? []) {
        all.push(edge.node);
      }

      const pageInfo = connection?.pageInfo;
      if (pageInfo?.hasNextPage && pageInfo.endCursor) {
        after = pageInfo.endCursor;
      } else {
        break;
      }
    }

    return all;
  }

  /**
   * Creates a promo code. Throws on invalid input or when Peek returns an
   * InvalidDataError.
   */
  async create(input: CreatePromoCodeInput): Promise<CreatedPromoCode> {
    if (!input.name) throw new Error("name is required");
    if (!input.code) throw new Error("code is required");
    if (!input.amount) throw new Error("amount is required");
    if (!input.discountType) throw new Error("discountType is required");
    if (input.discountType !== "percent" && input.discountType !== "fixed") {
      throw new Error("discountType must be either 'percent' or 'fixed'");
    }
    if (Number.isNaN(parseFloat(input.amount))) {
      throw new Error("amount must be a valid number");
    }
    const currency = input.currency || DEFAULT_CURRENCY;
    if (!CURRENCY_PATTERN.test(currency)) {
      throw new Error("currency must be 3 uppercase letters");
    }

    const variables: CreatePromoCodeVariables = {
      input: {
        code: input.code,
        name: input.name,
        maxRedeemCount: input.maxRedemptions
          ? parseInt(String(input.maxRedemptions), 10)
          : undefined,
      },
    };
    if (input.discountType === "fixed") {
      variables.input.fixedAmount = { amount: input.amount, currency };
    } else {
      variables.input.percentAmount = input.amount;
    }

    const body: GraphQLBody<CreatePromoCodeResponse> =
      await this.client.request<CreatePromoCodeResponse>(
        SALES_ENDPOINT,
        CREATE_PROMO_CODE_MUTATION,
        variables,
      );

    const result = body.data?.createPromoCode;
    if (result && "message" in result) {
      throw new Error(result.message);
    }
    if (!result) {
      throw new Error("createPromoCode returned no data");
    }
    return { id: result.id, name: result.name };
  }
}
