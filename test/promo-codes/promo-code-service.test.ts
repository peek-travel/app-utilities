import { describe, expect, it } from "vitest";

import {
  GraphQLClient,
  type GraphQLClientOptions,
} from "../../src/internal/graphql-client.js";
import { PromoCodeService } from "../../src/internal/promo-codes/promo-code-service.js";
import { noopLogger } from "../../src/logger.js";
import type { CreatePromoCodeInput, PromoCode } from "../../src/models/promo-code.js";

interface RecordedCall {
  url: string;
  init: RequestInit;
}

type Handler = (query: string, variables: Record<string, unknown>) => unknown;

function makeFetch(handler: Handler): {
  fetchFn: typeof fetch;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const body = JSON.parse(init.body as string);
    return {
      status: 200,
      ok: true,
      json: async () => handler(body.query as string, body.variables),
    } as unknown as Response;
  }) as unknown as typeof fetch;
  return { fetchFn, calls };
}

function buildClient(
  fetchFn: typeof fetch,
  overrides: Partial<GraphQLClientOptions> = {},
): GraphQLClient {
  return new GraphQLClient({
    baseUrl: "https://gw.test/gql",
    appId: "app-1",
    gatewayKey: "gw-key",
    getToken: () => "tok-123",
    retryDelaysMs: [],
    logger: noopLogger,
    fetchFn,
    ...overrides,
  });
}

function promoCode(id: string): PromoCode {
  return {
    id,
    name: `Code ${id}`,
    percentAmount: 10,
    perTicketDiscount: false,
    redemptionCode: id.toUpperCase(),
    fixedAmount: null,
  };
}

const VALID_INPUT: CreatePromoCodeInput = {
  name: "Summer",
  code: "SUMMER",
  amount: "10",
  discountType: "percent",
};

describe("PromoCodeService.getAll", () => {
  it("paginates across pages", async () => {
    let page = 0;
    const { fetchFn } = makeFetch((_query, variables) => {
      page += 1;
      if (page === 1) {
        expect(variables.after).toBeNull();
        return {
          data: {
            promoCodes: {
              edges: [{ node: promoCode("p1") }],
              pageInfo: { hasNextPage: true, endCursor: "c1" },
            },
          },
        };
      }
      expect(variables.after).toBe("c1");
      return {
        data: {
          promoCodes: {
            edges: [{ node: promoCode("p2") }],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      };
    });

    const codes = await new PromoCodeService(buildClient(fetchFn)).getAll();
    expect(codes.map((c) => c.id)).toEqual(["p1", "p2"]);
  });

  it("returns an empty list when a 200 response carries no data, honoring pageSize", async () => {
    const { fetchFn, calls } = makeFetch(() => ({}));
    const codes = await new PromoCodeService(buildClient(fetchFn), { pageSize: 5 }).getAll();
    expect(codes).toEqual([]);
    expect(JSON.parse(calls[0]!.init.body as string).variables.first).toBe(5);
  });
});

describe("PromoCodeService.create", () => {
  it("maps a percent discount and returns the created id/name", async () => {
    const { fetchFn, calls } = makeFetch(() => ({
      data: { createPromoCode: { id: "p1", name: "Summer" } },
    }));

    const result = await new PromoCodeService(buildClient(fetchFn)).create({
      ...VALID_INPUT,
      maxRedemptions: 100,
    });

    expect(result).toEqual({ id: "p1", name: "Summer" });
    const input = JSON.parse(calls[0]!.init.body as string).variables.input;
    expect(input).toEqual({
      code: "SUMMER",
      name: "Summer",
      maxRedeemCount: 100,
      percentAmount: "10",
    });
  });

  it("maps a fixed discount with default USD currency", async () => {
    const { fetchFn, calls } = makeFetch(() => ({
      data: { createPromoCode: { id: "p2", name: "Flat" } },
    }));

    await new PromoCodeService(buildClient(fetchFn)).create({
      name: "Flat",
      code: "FLAT",
      amount: "5",
      discountType: "fixed",
    });

    const input = JSON.parse(calls[0]!.init.body as string).variables.input;
    expect(input.fixedAmount).toEqual({ amount: "5", currency: "USD" });
    expect(input.maxRedeemCount).toBeUndefined();
  });

  it("throws the InvalidDataError message from Peek", async () => {
    const { fetchFn } = makeFetch(() => ({
      data: { createPromoCode: { message: "code already exists" } },
    }));

    await expect(
      new PromoCodeService(buildClient(fetchFn)).create(VALID_INPUT),
    ).rejects.toThrow("code already exists");
  });

  it("throws when the mutation returns no data", async () => {
    const { fetchFn } = makeFetch(() => ({}));
    await expect(
      new PromoCodeService(buildClient(fetchFn)).create(VALID_INPUT),
    ).rejects.toThrow(/no data/);
  });

  it.each([
    [{ ...VALID_INPUT, name: "" }, /name is required/],
    [{ ...VALID_INPUT, code: "" }, /code is required/],
    [{ ...VALID_INPUT, amount: "" }, /amount is required/],
    [{ ...VALID_INPUT, discountType: "" as unknown as "percent" }, /discountType is required/],
    [{ ...VALID_INPUT, discountType: "bogus" as unknown as "percent" }, /must be either 'percent' or 'fixed'/],
    [{ ...VALID_INPUT, amount: "abc" }, /amount must be a valid number/],
    [{ ...VALID_INPUT, discountType: "fixed" as const, currency: "usd" }, /3 uppercase letters/],
  ])("rejects invalid input (%#)", async (input, pattern) => {
    const { fetchFn } = makeFetch(() => ({}));
    await expect(
      new PromoCodeService(buildClient(fetchFn)).create(input as CreatePromoCodeInput),
    ).rejects.toThrow(pattern);
  });
});
