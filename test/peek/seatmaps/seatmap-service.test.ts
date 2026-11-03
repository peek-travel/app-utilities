import { describe, expect, it } from "vitest";

import { UnknownSeatmapDisplayTypeError } from "../../../src/errors.js";
import {
  GraphQLClient,
  type GraphQLClientOptions,
} from "../../../src/internal/peek/graphql-client.js";
import { peekApiEndpoints } from "../../../src/internal/peek/gateway-endpoints.js";
import { SeatmapService } from "../../../src/internal/peek/seatmaps/seatmap-service.js";
import { noopLogger } from "../../../src/logger.js";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => JSON.stringify(body),
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
    baseApiUrl: "https://gw.test/gql/app-1",
    endpoints: peekApiEndpoints(false),
    gatewayKey: "gw-key",
    getToken: () => "tok-123",
    retryDelaysMs: [],
    logger: noopLogger,
    fetchFn,
    ...overrides,
  });
}

const SEATMAP_NODE = {
  id: "csm_8j734",
  name: "Dinner Theater",
  zones: [
    {
      id: "csz_z77an",
      name: "Premium",
      resourceOptions: [{ id: "ro-1", name: "Adult - Premium" }],
    },
  ],
  sections: [
    {
      id: "css_km8d5",
      display: { label: null, x: 800, y: 432, width: null, height: null, type: "SECTION" },
      groups: [
        {
          assignableTo: ["GUEST"],
          name: "Table 12",
          id: "csg_yj9ge",
          display: { x: 176, y: 256, tableWidth: 120, tableHeight: 80, table: true },
          blocks: [
            {
              fullBlockName: "Table 12, Seat 1",
              name: "1",
              id: "csb_a7bk8",
              order: 0,
              zone: { id: "csz_zy3de" },
              display: { x: 0, y: 0 },
            },
          ],
        },
      ],
    },
  ],
};

describe("SeatmapService.getSeatmapForProduct", () => {
  it("returns every seating map on the product", async () => {
    const { fetchFn, calls } = makeFetch(() =>
      jsonResponse({ data: { activity: { seatingMaps: [SEATMAP_NODE] } } }),
    );
    const service = new SeatmapService(buildClient(fetchFn));

    const maps = await service.getSeatmapForProduct("act-1");

    expect(maps).toHaveLength(1);
    expect(maps[0].id).toBe("csm_8j734");
    expect(maps[0].zones[0].tickets[0]).toEqual({ id: "ro-1", name: "Adult - Premium" });
    expect(maps[0].sections[0].groups[0].blocks[0].zoneId).toBe("csz_zy3de");

    // Reaches the sales endpoint with the product id as the `id` variable.
    expect(calls[0].url).toContain("/sales");
    const sent = JSON.parse(calls[0].init.body as string);
    expect(sent.variables).toEqual({ id: "act-1" });
  });

  it("returns an empty list when the activity is not found", async () => {
    const { fetchFn } = makeFetch(() => jsonResponse({ data: { activity: null } }));
    const service = new SeatmapService(buildClient(fetchFn));

    expect(await service.getSeatmapForProduct("missing")).toEqual([]);
  });

  it("returns an empty list when the activity has no seating maps", async () => {
    const { fetchFn } = makeFetch(() =>
      jsonResponse({ data: { activity: { seatingMaps: null } } }),
    );
    const service = new SeatmapService(buildClient(fetchFn));

    expect(await service.getSeatmapForProduct("act-1")).toEqual([]);
  });

  it("throws on a blank product id without hitting the network", async () => {
    const { fetchFn, calls } = makeFetch(() => jsonResponse({ data: {} }));
    const service = new SeatmapService(buildClient(fetchFn));

    await expect(service.getSeatmapForProduct("  ")).rejects.toThrow(
      "A non-empty product id is required.",
    );
    expect(calls).toHaveLength(0);
  });

  it("propagates an unknown display type from the converter", async () => {
    const { fetchFn } = makeFetch(() =>
      jsonResponse({
        data: {
          activity: {
            seatingMaps: [
              {
                id: "m",
                name: "m",
                sections: [{ id: "a", display: { x: 0, y: 0, type: "CIRCLE" }, groups: [] }],
              },
            ],
          },
        },
      }),
    );
    const service = new SeatmapService(buildClient(fetchFn));

    await expect(service.getSeatmapForProduct("act-1")).rejects.toBeInstanceOf(
      UnknownSeatmapDisplayTypeError,
    );
  });
});
