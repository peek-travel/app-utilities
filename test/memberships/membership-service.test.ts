import { describe, expect, it } from "vitest";

import {
  GraphQLClient,
  type GraphQLClientOptions,
} from "../../src/internal/graphql-client.js";
import { MembershipService } from "../../src/internal/memberships/membership-service.js";
import { noopLogger } from "../../src/logger.js";

function makeFetch(body: unknown): typeof fetch {
  return (async () =>
    ({ status: 200, ok: true, json: async () => body }) as unknown as Response) as unknown as typeof fetch;
}

function buildClient(fetchFn: typeof fetch, overrides: Partial<GraphQLClientOptions> = {}): GraphQLClient {
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

describe("MembershipService.getAll", () => {
  it("flattens membership variants from the response", async () => {
    const fetchFn = makeFetch({
      data: {
        memberships: [
          {
            id: "m1",
            name: "Gold",
            membershipVariants: [
              {
                id: "v1",
                description: null,
                imageUrl: null,
                externalName: "Gold",
                internalName: "gold",
              },
            ],
          },
        ],
      },
    });

    const memberships = await new MembershipService(buildClient(fetchFn)).getAll();
    expect(memberships).toEqual([
      {
        id: "m1",
        membershipVariantId: "v1",
        description: null,
        externalName: "Gold",
        imageUrl: null,
        internalName: "gold",
        displayName: "Gold",
      },
    ]);
  });

  it("returns an empty list when a 200 response carries no data", async () => {
    const memberships = await new MembershipService(buildClient(makeFetch({}))).getAll();
    expect(memberships).toEqual([]);
  });
});

interface RecordedCall {
  query: string;
  variables: Record<string, unknown>;
}

type RoutingHandler = (query: string) => unknown;

function makeRoutingService(handler: RoutingHandler): {
  service: MembershipService;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  const fetchFn = (async (_url: string, init: RequestInit) => {
    const body = JSON.parse(init.body as string);
    calls.push({ query: body.query as string, variables: body.variables });
    return { status: 200, ok: true, json: async () => handler(body.query as string) } as unknown as Response;
  }) as unknown as typeof fetch;
  return { service: new MembershipService(buildClient(fetchFn)), calls };
}

const VALID_PURCHASE = { membershipVariantId: "mv-1", email: "ada@example.com" };

describe("MembershipService.purchase", () => {
  it("runs the quote then order flow and returns the membership", async () => {
    const { service, calls } = makeRoutingService((query) =>
      query.includes("createQuoteV2")
        ? { data: { createQuoteV2: { errors: null, quote: { id: "q-1" } } } }
        : {
            data: {
              createOrderFromQuote: {
                errors: null,
                order: {
                  id: "ord-1",
                  sales: [
                    {
                      id: "mem-1",
                      displayId: "M-1",
                      primaryMember: { id: "pm-1", name: "Ada" },
                      balance: { total: { amount: "0.00", currency: "USD", formatted: "$0.00" } },
                    },
                  ],
                },
              },
            },
          },
    );

    const result = await service.purchase({
      ...VALID_PURCHASE,
      country: "US",
      phone: "+1 555-1234",
      name: "Ada",
      formattedAddress: "1 Main St",
      membershipCode: "GOLD",
    });

    expect(result).toEqual({
      orderId: "ord-1",
      membershipId: "mem-1",
      displayId: "M-1",
      primaryMemberId: "pm-1",
      primaryMemberName: "Ada",
      balanceAmount: "0.00",
      balanceCurrency: "USD",
      balanceFormatted: "$0.00",
    });

    const quoteCall = calls.find((c) => c.query.includes("createQuoteV2"))!;
    const quote = (quoteCall.variables.input as {
      quoteInput: { membershipQuotes: Array<{ member: object; membershipVariantId: string; refid: string; status: string }> };
    }).quoteInput.membershipQuotes[0]!;
    expect(quote.membershipVariantId).toBe("mv-1");
    expect(quote.status).toBe("CONFIRMED");
    expect(typeof quote.refid).toBe("string");
    expect(quote.member).toEqual({
      email: "ada@example.com",
      country: "US",
      formattedAddress: "1 Main St",
      membershipCode: "GOLD",
      name: "Ada",
      phone: "+1 555-1234",
    });
    expect(calls.find((c) => c.query.includes("createOrderFromQuote"))!.variables.input).toEqual({
      quoteId: "q-1",
    });
  });

  it("defaults the balance when missing", async () => {
    const { service } = makeRoutingService((query) =>
      query.includes("createQuoteV2")
        ? { data: { createQuoteV2: { errors: null, quote: { id: "q-1" } } } }
        : { data: { createOrderFromQuote: { errors: null, order: { id: "ord-1", sales: [{ id: "m", displayId: "M" }] } } } },
    );
    const result = await service.purchase(VALID_PURCHASE);
    expect(result).toMatchObject({
      primaryMemberId: null,
      primaryMemberName: null,
      balanceAmount: "0.00",
      balanceCurrency: "USD",
      balanceFormatted: "$0.00",
    });
  });

  it("throws when the quote has errors", async () => {
    const { service } = makeRoutingService(() => ({
      data: { createQuoteV2: { errors: [{ code: "X", detail: "bad variant", value: null }], quote: null } },
    }));
    await expect(service.purchase(VALID_PURCHASE)).rejects.toThrow(/quote: bad variant/);
  });

  it("throws when the quote id is missing", async () => {
    const { service } = makeRoutingService(() => ({
      data: { createQuoteV2: { errors: null, quote: null } },
    }));
    await expect(service.purchase(VALID_PURCHASE)).rejects.toThrow(/missing quote id/);
  });

  it("throws when the order has errors", async () => {
    const { service } = makeRoutingService((query) =>
      query.includes("createQuoteV2")
        ? { data: { createQuoteV2: { errors: null, quote: { id: "q-1" } } } }
        : { data: { createOrderFromQuote: { errors: [{ code: "X", detail: "declined", value: null }], order: null } } },
    );
    await expect(service.purchase(VALID_PURCHASE)).rejects.toThrow(/order: declined/);
  });

  it("throws when the order has no sales", async () => {
    const { service } = makeRoutingService((query) =>
      query.includes("createQuoteV2")
        ? { data: { createQuoteV2: { errors: null, quote: { id: "q-1" } } } }
        : { data: { createOrderFromQuote: { errors: null, order: { id: "ord-1", sales: [] } } } },
    );
    await expect(service.purchase(VALID_PURCHASE)).rejects.toThrow(/no sales found/);
  });

  it.each([
    [{ membershipVariantId: "", email: "a@b.co" }, /membershipVariantId is required/],
    [{ membershipVariantId: "mv", email: "" }, /email is required/],
    [{ membershipVariantId: "mv", email: "bad" }, /email is invalid/],
    [{ membershipVariantId: "mv", email: "a@b.co", country: "USA" }, /country is invalid/],
    [{ membershipVariantId: "mv", email: "a@b.co", phone: "abc!" }, /phone is invalid/],
  ])("rejects invalid input (%#)", async (input, pattern) => {
    const { service } = makeRoutingService(() => ({}));
    await expect(service.purchase(input)).rejects.toThrow(pattern);
  });
});
