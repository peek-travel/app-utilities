import { describe, expect, it } from "vitest";

import { AvailabilityService } from "../../src/internal/availability/availability-service.js";
import {
  GraphQLClient,
  type GraphQLClientOptions,
} from "../../src/internal/graphql-client.js";
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

const SLOT = {
  id: "slot-1",
  time: "10:00",
  from: "2026-01-02T10:00:00Z",
  end: "2026-01-02T11:00:00Z",
  duration: { name: "1h", length: { amount: 60, unit: "MINUTES" } },
  status: "AVAILABLE",
  availability: [{ qty: 10, taken: 2, resourceOptionId: "r1" }],
};

describe("AvailabilityService.getAvailabilityTimes", () => {
  it("sends the query variables and returns the slots", async () => {
    const { fetchFn, calls } = makeFetch({ data: { availabilityTimes: [SLOT] } });

    const result = await new AvailabilityService(buildClient(fetchFn)).getAvailabilityTimes({
      activityId: "act-1",
      date: "2026-01-02",
      resourceOptionQuantities: [{ resourceOptionId: "r1", quantity: 2 }],
    });

    expect(result).toEqual([SLOT]);
    const variables = JSON.parse(calls[0]!.init.body as string).variables;
    expect(variables.activityId).toBe("act-1");
    expect(variables.date).toBe("2026-01-02");
    expect(variables.resourceOptionQuantities).toEqual([
      { resourceOptionId: "r1", quantity: 2 },
    ]);
  });

  it("returns an empty list when a 200 response carries no data", async () => {
    const { fetchFn } = makeFetch({});
    const result = await new AvailabilityService(buildClient(fetchFn)).getAvailabilityTimes({
      activityId: "act-1",
      date: "2026-01-02",
      resourceOptionQuantities: [],
    });
    expect(result).toEqual([]);
  });
});
