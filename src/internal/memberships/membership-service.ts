/**
 * Membership operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getMembershipService}.
 */
import { randomUUID } from "node:crypto";

import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type {
  Membership,
  MembershipPurchaseInput,
  PurchasedMembership,
} from "../../models/membership.js";
import { fromMembershipsResponse } from "./membership-converter.js";
import {
  CREATE_MEMBERSHIP_ORDER_FROM_QUOTE_MUTATION,
  CREATE_QUOTE_V2_MUTATION,
  MEMBERSHIPS_QUERY,
  type CreateMembershipOrderResponse,
  type CreateQuoteV2Response,
  type MembershipMember,
  type MembershipsResponse,
} from "./membership-queries.js";

const QUOTE_STATUS_CONFIRMED = "CONFIRMED";
const DEFAULT_BALANCE_AMOUNT = "0.00";
const DEFAULT_BALANCE_CURRENCY = "USD";
const DEFAULT_BALANCE_FORMATTED = "$0.00";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRY_REGEX = /^[A-Z]{2}$/i;
const PHONE_REGEX = /^[0-9+\s()\-.]+$/;

export class MembershipService {
  constructor(private readonly client: GraphQLClient) {}

  /** Returns all membership variants, flattened into {@link Membership} records. */
  async getAll(): Promise<Membership[]> {
    const body: GraphQLBody<MembershipsResponse> =
      await this.client.request<MembershipsResponse>(SALES_ENDPOINT, MEMBERSHIPS_QUERY, {});
    return fromMembershipsResponse(body.data);
  }

  /**
   * Purchases a membership via the two-step quote → order flow. Throws on
   * invalid input or when Peek returns errors.
   */
  async purchase(input: MembershipPurchaseInput): Promise<PurchasedMembership> {
    validatePurchaseInput(input);

    const quoteBody: GraphQLBody<CreateQuoteV2Response> =
      await this.client.request<CreateQuoteV2Response>(
        SALES_ENDPOINT,
        CREATE_QUOTE_V2_MUTATION,
        {
          input: {
            quoteInput: {
              membershipQuotes: [
                {
                  member: buildMember(input),
                  membershipVariantId: input.membershipVariantId,
                  refid: randomUUID(),
                  status: QUOTE_STATUS_CONFIRMED,
                },
              ],
            },
          },
        },
      );

    const quoteResult = quoteBody.data?.createQuoteV2;
    if (quoteResult?.errors && quoteResult.errors.length > 0) {
      throw new Error(`Failed to create membership quote: ${quoteResult.errors[0]!.detail}`);
    }
    const quoteId = quoteResult?.quote?.id;
    if (!quoteId) {
      throw new Error("Membership quote created but missing quote id");
    }

    const orderBody: GraphQLBody<CreateMembershipOrderResponse> =
      await this.client.request<CreateMembershipOrderResponse>(
        SALES_ENDPOINT,
        CREATE_MEMBERSHIP_ORDER_FROM_QUOTE_MUTATION,
        { input: { quoteId } },
      );

    const orderResult = orderBody.data?.createOrderFromQuote;
    if (orderResult?.errors && orderResult.errors.length > 0) {
      throw new Error(`Failed to create membership order: ${orderResult.errors[0]!.detail}`);
    }

    const order = orderResult?.order;
    const sale = order?.sales?.[0];
    if (!order || !sale) {
      throw new Error("Membership order created but no sales found");
    }

    return {
      orderId: order.id,
      membershipId: sale.id,
      displayId: sale.displayId,
      primaryMemberId: sale.primaryMember?.id ?? null,
      primaryMemberName: sale.primaryMember?.name ?? null,
      balanceAmount: sale.balance?.total?.amount ?? DEFAULT_BALANCE_AMOUNT,
      balanceCurrency: sale.balance?.total?.currency ?? DEFAULT_BALANCE_CURRENCY,
      balanceFormatted: sale.balance?.total?.formatted ?? DEFAULT_BALANCE_FORMATTED,
    };
  }
}

/** Builds the GraphQL member, including only non-empty optional fields. */
function buildMember(input: MembershipPurchaseInput): MembershipMember {
  const member: MembershipMember = { email: input.email };
  if (input.country?.trim()) member.country = input.country;
  if (input.formattedAddress?.trim()) member.formattedAddress = input.formattedAddress;
  if (input.membershipCode?.trim()) member.membershipCode = input.membershipCode;
  if (input.name?.trim()) member.name = input.name;
  if (input.phone?.trim()) member.phone = input.phone;
  return member;
}

function validatePurchaseInput(input: MembershipPurchaseInput): void {
  const errors: string[] = [];

  if (!input.membershipVariantId || input.membershipVariantId.trim().length === 0) {
    errors.push("membershipVariantId is required");
  }
  if (!input.email || input.email.trim().length === 0) {
    errors.push("email is required");
  } else if (!EMAIL_REGEX.test(input.email)) {
    errors.push("email is invalid");
  }
  if (input.country && !COUNTRY_REGEX.test(input.country)) {
    errors.push("country is invalid");
  }
  if (input.phone && !PHONE_REGEX.test(input.phone)) {
    errors.push("phone is invalid");
  }

  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }
}
