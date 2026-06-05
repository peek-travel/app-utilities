import { describe, expect, it } from "vitest";

import {
  GraphQLClient,
  type GraphQLClientOptions,
} from "../../src/internal/graphql-client.js";
import { ResourcePoolService } from "../../src/internal/resource-pools/resource-pool-service.js";
import { noopLogger } from "../../src/logger.js";

interface RecordedCall {
  url: string;
  init: RequestInit;
}

function makeFetch(body: unknown): {
  fetchFn: typeof fetch;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return {
      status: 200,
      ok: true,
      json: async () => body,
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

const POOL = {
  id: "pool-1",
  name: "Ada",
  imageUrl: null,
  mode: "ALL",
  colorHex: null,
  quantity: null,
  category: "guide",
  capacity: 5,
  resourceTrackingMode: null,
  accountUser: { id: "u1", name: "Ada" },
};

describe("ResourcePoolService.getAll", () => {
  it("defaults to the ALL mode filter and converts the response", async () => {
    const { fetchFn, calls } = makeFetch({ data: { resourcePools: [POOL] } });

    const pools = await new ResourcePoolService(buildClient(fetchFn)).getAll();

    expect(pools).toHaveLength(1);
    expect(pools[0]!.id).toBe("pool-1");
    const variables = JSON.parse(calls[0]!.init.body as string).variables;
    expect(variables.filter.mode).toBe("ALL");
    expect(calls[0]!.url).toBe("https://gw.test/gql/app-1/sales");
  });

  it("passes through an explicit mode filter", async () => {
    const { fetchFn, calls } = makeFetch({ data: { resourcePools: [] } });

    const pools = await new ResourcePoolService(buildClient(fetchFn)).getAll(
      "ACTIVITY",
    );

    expect(pools).toEqual([]);
    expect(JSON.parse(calls[0]!.init.body as string).variables.filter.mode).toBe(
      "ACTIVITY",
    );
  });

  it("returns an empty list when a 200 response carries no data", async () => {
    const { fetchFn } = makeFetch({});
    const pools = await new ResourcePoolService(buildClient(fetchFn)).getAll();
    expect(pools).toEqual([]);
  });
});
