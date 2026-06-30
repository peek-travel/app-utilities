import { describe, expect, it, vi } from "vitest";

import {
  AdminAccountRequiredError,
  PeekGraphQLError,
  RateLimitError,
} from "../../src/errors.js";
import {
  GraphQLClient,
  type GraphQLClientOptions,
} from "../../src/internal/graphql-client.js";
import { ProductService } from "../../src/internal/products/product-service.js";
import { noopLogger, type Logger } from "../../src/logger.js";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as unknown as Response;
}

interface RecordedCall {
  url: string;
  init: RequestInit;
}

type Handler = (query: string, variables: Record<string, unknown>) => Response;

function makeFetch(handler: Handler): {
  fetchFn: typeof fetch;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const body = JSON.parse(init.body as string);
    return handler(body.query as string, body.variables);
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

const ACTIVITY = {
  name: "Kayak Tour",
  id: "act-1",
  type: "ACTIVITY",
  colorHex: "#1A2B3C",
  resourceOptions: [{ id: "r1", name: "Single" }],
};

function addOnNode(optionId: string, optionName: string) {
  return {
    id: optionId,
    name: optionName,
    description: null,
    item: { id: "item-1", name: "Safety Gear" },
  };
}

const emptyItemOptions = {
  data: { itemOptions: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } } },
};

describe("ProductService.getAllProducts", () => {
  it("combines activities and add-ons, paginating item options across pages", async () => {
    let itemOptionsPage = 0;
    const { fetchFn, calls } = makeFetch((query, variables) => {
      if (query.includes("activities")) {
        // Query should be whitespace-collapsed (single line, no double spaces).
        expect(query).not.toMatch(/\n/);
        expect(query).not.toMatch(/ {2,}/);
        return jsonResponse({ data: { activities: [ACTIVITY] } });
      }

      itemOptionsPage += 1;
      if (itemOptionsPage === 1) {
        expect(variables.after).toBeNull();
        return jsonResponse({
          data: {
            itemOptions: {
              edges: [{ cursor: "c1", node: addOnNode("opt-1", "Helmet") }],
              pageInfo: { hasNextPage: true, endCursor: "c1" },
            },
          },
        });
      }
      expect(variables.after).toBe("c1");
      return jsonResponse({
        data: {
          itemOptions: {
            edges: [{ cursor: "c2", node: addOnNode("opt-2", "Life Vest") }],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      });
    });

    const service = new ProductService(buildClient(fetchFn));
    const products = await service.getAllProducts();

    expect(products).toEqual([
      {
        productId: "act-1",
        name: "Kayak Tour",
        type: "ACTIVITY",
        color: "#1A2B3C",
        tickets: [{ id: "r1", name: "Single" }],
      },
      {
        productId: "item-1",
        name: "Safety Gear",
        type: "ADD-ON",
        color: "#FFFFFF",
        tickets: [
          { id: "opt-1", name: "Helmet" },
          { id: "opt-2", name: "Life Vest" },
        ],
      },
    ]);

    // 1 activities call + 2 item-option pages.
    expect(calls).toHaveLength(3);
    expect(calls[0]!.url).toBe("https://gw.test/gql/app-1/sales");
    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers["X-Peek-Auth"]).toBe("Bearer tok-123");
    expect(headers["pk-api-key"]).toBe("gw-key");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("uses the configured item-options page size", async () => {
    const { fetchFn, calls } = makeFetch((query) =>
      query.includes("activities")
        ? jsonResponse({ data: { activities: [] } })
        : jsonResponse(emptyItemOptions),
    );

    const service = new ProductService(buildClient(fetchFn), {
      itemOptionsPageSize: 7,
    });
    await service.getAllProducts();

    const itemCall = calls.find((c) =>
      (JSON.parse(c.init.body as string).query as string).includes("itemOptions"),
    );
    expect(JSON.parse(itemCall!.init.body as string).variables.first).toBe(7);
  });

  it("returns an empty list when a 200 response carries no data", async () => {
    const { fetchFn } = makeFetch(() => jsonResponse({}));
    const service = new ProductService(buildClient(fetchFn));

    await expect(service.getAllProducts()).resolves.toEqual([]);
  });

  it("retries on HTTP 429 then succeeds", async () => {
    let activitiesCalls = 0;
    const { fetchFn } = makeFetch((query) => {
      if (query.includes("activities")) {
        activitiesCalls += 1;
        return activitiesCalls === 1
          ? jsonResponse({}, 429)
          : jsonResponse({ data: { activities: [] } });
      }
      return jsonResponse(emptyItemOptions);
    });

    const service = new ProductService(buildClient(fetchFn, { retryDelaysMs: [5] }));

    await expect(service.getAllProducts()).resolves.toEqual([]);
    expect(activitiesCalls).toBe(2);
  });

  it("throws RateLimitError when retries are exhausted", async () => {
    const { fetchFn } = makeFetch(() => jsonResponse({}, 429));
    const service = new ProductService(buildClient(fetchFn, { retryDelaysMs: [1] }));

    await expect(service.getAllProducts()).rejects.toBeInstanceOf(RateLimitError);
  });

  it("maps HTTP 418 to AdminAccountRequiredError and logs", async () => {
    const logger: Logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const { fetchFn } = makeFetch((query) =>
      query.includes("activities") ? jsonResponse({}, 418) : jsonResponse(emptyItemOptions),
    );
    const service = new ProductService(buildClient(fetchFn, { logger }));

    await expect(service.getAllProducts()).rejects.toBeInstanceOf(
      AdminAccountRequiredError,
    );
    expect(logger.info).toHaveBeenCalledWith(
      "Making GraphQL request",
      expect.objectContaining({ endpointName: "sales" }),
    );
    expect(logger.warn).toHaveBeenCalled();
  });

  it("throws PeekGraphQLError carrying the raw errors", async () => {
    const graphqlErrors = [{ message: "boom" }];
    const { fetchFn } = makeFetch((query) =>
      query.includes("activities")
        ? jsonResponse({ errors: graphqlErrors })
        : jsonResponse(emptyItemOptions),
    );
    const service = new ProductService(buildClient(fetchFn));

    await expect(service.getAllProducts()).rejects.toMatchObject({
      name: "PeekGraphQLError",
      graphqlErrors,
    });
    await expect(service.getAllProducts().catch((e) => e)).resolves.toBeInstanceOf(
      PeekGraphQLError,
    );
  });

  it("throws a generic error for other non-2xx responses", async () => {
    const { fetchFn } = makeFetch((query) =>
      query.includes("activities") ? jsonResponse({}, 500) : jsonResponse(emptyItemOptions),
    );
    const service = new ProductService(buildClient(fetchFn));

    await expect(service.getAllProducts()).rejects.toThrow(/HTTP 500/);
  });
});

const RENTAL = {
  name: "Test Rental",
  id: "rental-1",
  type: "RENTAL",
  colorHex: "#1EC6CE",
  resourceOptions: [{ id: "r2", name: "Bikes" }],
};

describe("ProductService.getAllActivities", () => {
  it("returns only ACTIVITY-typed products, making one request", async () => {
    const { fetchFn, calls } = makeFetch((query) => {
      expect(query).not.toContain("itemOptions");
      return jsonResponse({ data: { activities: [ACTIVITY, RENTAL] } });
    });

    const service = new ProductService(buildClient(fetchFn));
    const products = await service.getAllActivities();

    expect(products).toEqual([
      {
        productId: "act-1",
        name: "Kayak Tour",
        type: "ACTIVITY",
        color: "#1A2B3C",
        tickets: [{ id: "r1", name: "Single" }],
      },
    ]);
    expect(calls).toHaveLength(1);
  });

  it("returns empty list when no ACTIVITY-typed products exist", async () => {
    const { fetchFn } = makeFetch(() =>
      jsonResponse({ data: { activities: [RENTAL] } }),
    );
    const service = new ProductService(buildClient(fetchFn));
    await expect(service.getAllActivities()).resolves.toEqual([]);
  });
});

describe("ProductService.getAllRentals", () => {
  it("returns only RENTAL-typed products, making one request", async () => {
    const { fetchFn, calls } = makeFetch((query) => {
      expect(query).not.toContain("itemOptions");
      return jsonResponse({ data: { activities: [ACTIVITY, RENTAL] } });
    });

    const service = new ProductService(buildClient(fetchFn));
    const products = await service.getAllRentals();

    expect(products).toEqual([
      {
        productId: "rental-1",
        name: "Test Rental",
        type: "RENTAL",
        color: "#1EC6CE",
        tickets: [{ id: "r2", name: "Bikes" }],
      },
    ]);
    expect(calls).toHaveLength(1);
  });

  it("returns empty list when no RENTAL-typed products exist", async () => {
    const { fetchFn } = makeFetch(() =>
      jsonResponse({ data: { activities: [ACTIVITY] } }),
    );
    const service = new ProductService(buildClient(fetchFn));
    await expect(service.getAllRentals()).resolves.toEqual([]);
  });
});

describe("ProductService.getAllAddons", () => {
  it("returns only add-on products, paginating across pages", async () => {
    let page = 0;
    const { fetchFn, calls } = makeFetch((query) => {
      expect(query).not.toContain("activities");
      page += 1;
      if (page === 1) {
        return jsonResponse({
          data: {
            itemOptions: {
              edges: [{ cursor: "c1", node: { id: "opt-1", name: "Helmet", description: null, item: { id: "item-1", name: "Safety Gear" } } }],
              pageInfo: { hasNextPage: true, endCursor: "c1" },
            },
          },
        });
      }
      return jsonResponse(emptyItemOptions);
    });

    const service = new ProductService(buildClient(fetchFn));
    const products = await service.getAllAddons();

    expect(products).toEqual([
      {
        productId: "item-1",
        name: "Safety Gear",
        type: "ADD-ON",
        color: "#FFFFFF",
        tickets: [{ id: "opt-1", name: "Helmet" }],
      },
    ]);
    expect(calls).toHaveLength(2);
  });

  it("returns empty list when no add-ons exist", async () => {
    const { fetchFn } = makeFetch(() => jsonResponse(emptyItemOptions));
    const service = new ProductService(buildClient(fetchFn));
    await expect(service.getAllAddons()).resolves.toEqual([]);
  });
});
