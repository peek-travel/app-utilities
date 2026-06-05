import { describe, expect, it } from "vitest";

import {
  GraphQLClient,
  type GraphQLClientOptions,
} from "../../src/internal/graphql-client.js";
import { ResellerService } from "../../src/internal/resellers/reseller-service.js";
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
    return { status: 200, ok: true, json: async () => body } as unknown as Response;
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

const CHANNEL = {
  id: "ch-1",
  name: "Acme",
  notes: null,
  pricingModel: "NET",
  state: "ACTIVE",
  type: "RESELLER",
  agents: { edges: [] },
};

describe("ResellerService.getAllChannels", () => {
  it("defaults to 10 agents per channel and converts the response", async () => {
    const { fetchFn, calls } = makeFetch({ data: { channels: [CHANNEL] } });

    const channels = await new ResellerService(buildClient(fetchFn)).getAllChannels();

    expect(channels.map((c) => c.id)).toEqual(["ch-1"]);
    expect(JSON.parse(calls[0]!.init.body as string).variables.first).toBe(10);
    expect(calls[0]!.url).toBe("https://gw.test/gql/app-1/sales");
  });

  it("passes through a custom agents-per-channel limit", async () => {
    const { fetchFn, calls } = makeFetch({ data: { channels: [] } });

    const channels = await new ResellerService(buildClient(fetchFn)).getAllChannels(3);

    expect(channels).toEqual([]);
    expect(JSON.parse(calls[0]!.init.body as string).variables.first).toBe(3);
  });

  it("returns an empty list when a 200 response carries no data", async () => {
    const { fetchFn } = makeFetch({});
    const channels = await new ResellerService(buildClient(fetchFn)).getAllChannels();
    expect(channels).toEqual([]);
  });
});
