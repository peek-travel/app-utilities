import { describe, expect, it } from "vitest";

import {
  UnknownSeatmapBlockStatusError,
  UnknownSeatmapDisplayTypeError,
} from "../../../src/errors.js";
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
    const service = new SeatmapService(buildClient(fetchFn), { fullCustomerAccess: false });

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
    const service = new SeatmapService(buildClient(fetchFn), { fullCustomerAccess: false });

    expect(await service.getSeatmapForProduct("missing")).toEqual([]);
  });

  it("returns an empty list when the activity has no seating maps", async () => {
    const { fetchFn } = makeFetch(() =>
      jsonResponse({ data: { activity: { seatingMaps: null } } }),
    );
    const service = new SeatmapService(buildClient(fetchFn), { fullCustomerAccess: false });

    expect(await service.getSeatmapForProduct("act-1")).toEqual([]);
  });

  it("throws on a blank product id without hitting the network", async () => {
    const { fetchFn, calls } = makeFetch(() => jsonResponse({ data: {} }));
    const service = new SeatmapService(buildClient(fetchFn), { fullCustomerAccess: false });

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
    const service = new SeatmapService(buildClient(fetchFn), { fullCustomerAccess: false });

    await expect(service.getSeatmapForProduct("act-1")).rejects.toBeInstanceOf(
      UnknownSeatmapDisplayTypeError,
    );
  });
});

/** A seat-assignments response with one map holding one occupied GUEST seat. */
function assignmentsResponse() {
  return {
    data: {
      activity: {
        seatingMaps: [
          {
            id: "csm_8j734",
            name: "Dinner Theater",
            zones: [],
            sections: [
          {
            id: "css_km8d5",
            display: { x: 800, y: 432, type: "SECTION", width: null, height: null, label: null },
            groups: [
              {
                assignableTo: ["GUEST"],
                name: "Table 12",
                id: "csg_yj9ge",
                display: { x: 176, y: 256, table: true, tableWidth: 120, tableHeight: 80 },
                blocks: [
                  {
                    fullBlockName: "Table 12, Seat 1",
                    name: "1",
                    id: "csb_a7bk8",
                    order: 0,
                    zone: { id: "csz_zy3de" },
                    display: { x: 0, y: 0 },
                    availability: {
                      status: "OCCUPIED",
                      assignments: [
                        {
                          id: "asa_1",
                          parent: {
                            __typename: "Ticket",
                            id: "t_1",
                            resourceOptionSnapshot: { id: "ro-1", name: "Adult - Premium" },
                            booking: {
                              id: "bk_1",
                              displayId: "ABC123",
                              activityId: "act-1",
                              activitySnapshot: { id: "act-1", name: "Dinner Theater" },
                              startsAt: "2026-11-06T14:00:00",
                              endsAt: "2026-11-06T16:00:00",
                              primaryGuest: { firstName: "Ada", lastName: "Lovelace" },
                            },
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        ],
          },
        ],
      },
    },
  };
}

describe("SeatmapService.getSeatMapAssignments", () => {
  it("returns the product's maps with seat occupancy and sends id + half-open range", async () => {
    const { fetchFn, calls } = makeFetch(() => jsonResponse(assignmentsResponse()));
    const service = new SeatmapService(buildClient(fetchFn), { fullCustomerAccess: true });

    const maps = await service.getSeatMapAssignments(
      "act-1",
      "2026-11-06T14:00:00",
      "2026-11-06T16:00:00",
    );

    expect(maps).toHaveLength(1);
    const block = maps[0].sections[0].groups[0].blocks[0];
    expect(block.status).toBe("OCCUPIED");
    expect(block.assignedTo[0]).toMatchObject({ occupiedBy: "GUEST", guestName: "Ada Lovelace" });

    const sent = JSON.parse(calls[0].init.body as string);
    expect(calls[0].url).toContain("/sales");
    expect(sent.variables).toEqual({
      id: "act-1",
      range: "[2026-11-06T14:00:00,2026-11-06T16:00:00)",
    });
  });

  it("selects primaryGuest only when fullCustomerAccess is on", async () => {
    const { fetchFn, calls } = makeFetch(() => jsonResponse(assignmentsResponse()));
    const withPii = new SeatmapService(buildClient(fetchFn), { fullCustomerAccess: true });
    await withPii.getSeatMapAssignments("csm_1", "2026-11-06T14:00", "2026-11-06T16:00");
    expect(JSON.parse(calls[0].init.body as string).query).toContain("primaryGuest");

    const { fetchFn: fetchNoPii, calls: callsNoPii } = makeFetch(() =>
      jsonResponse(assignmentsResponse()),
    );
    const noPii = new SeatmapService(buildClient(fetchNoPii), { fullCustomerAccess: false });
    await noPii.getSeatMapAssignments("csm_1", "2026-11-06T14:00", "2026-11-06T16:00");
    expect(JSON.parse(callsNoPii[0].init.body as string).query).not.toContain("primaryGuest");
  });

  it("normalizes flexible datetime inputs (adds seconds, strips tz/fractional)", async () => {
    const cases: Array<[string, string, string]> = [
      ["2026-11-06T14:00", "2026-11-06T16:00", "[2026-11-06T14:00:00,2026-11-06T16:00:00)"],
      ["2026-11-06T14:00:00Z", "2026-11-06T16:00:00Z", "[2026-11-06T14:00:00,2026-11-06T16:00:00)"],
      ["2026-11-06T14:00:00+05:30", "2026-11-06T16:00:00-0800", "[2026-11-06T14:00:00,2026-11-06T16:00:00)"],
      ["2026-11-06T14:00:00.123", "2026-11-06T16:00:30.9", "[2026-11-06T14:00:00,2026-11-06T16:00:30)"],
    ];
    for (const [start, end, expected] of cases) {
      const { fetchFn, calls } = makeFetch(() => jsonResponse(assignmentsResponse()));
      const service = new SeatmapService(buildClient(fetchFn), { fullCustomerAccess: false });
      await service.getSeatMapAssignments("csm_1", start, end);
      expect(JSON.parse(calls[0].init.body as string).variables.range).toBe(expected);
    }
  });

  it("returns an empty list when the activity is not found or has no maps", async () => {
    const { fetchFn } = makeFetch(() => jsonResponse({ data: { activity: null } }));
    const service = new SeatmapService(buildClient(fetchFn), { fullCustomerAccess: false });
    expect(
      await service.getSeatMapAssignments("missing", "2026-11-06T14:00", "2026-11-06T16:00"),
    ).toEqual([]);

    const { fetchFn: fetchNoMaps } = makeFetch(() =>
      jsonResponse({ data: { activity: { seatingMaps: null } } }),
    );
    const svc = new SeatmapService(buildClient(fetchNoMaps), { fullCustomerAccess: false });
    expect(
      await svc.getSeatMapAssignments("act-1", "2026-11-06T14:00", "2026-11-06T16:00"),
    ).toEqual([]);
  });

  it("throws on a blank product id without hitting the network", async () => {
    const { fetchFn, calls } = makeFetch(() => jsonResponse({ data: {} }));
    const service = new SeatmapService(buildClient(fetchFn), { fullCustomerAccess: false });
    await expect(
      service.getSeatMapAssignments("  ", "2026-11-06T14:00", "2026-11-06T16:00"),
    ).rejects.toThrow("A non-empty product id is required.");
    expect(calls).toHaveLength(0);
  });

  it("throws on an unparseable or out-of-range datetime without hitting the network", async () => {
    const { fetchFn, calls } = makeFetch(() => jsonResponse({ data: {} }));
    const service = new SeatmapService(buildClient(fetchFn), { fullCustomerAccess: false });

    await expect(
      service.getSeatMapAssignments("csm_1", "11/06/2026 2pm", "2026-11-06T16:00"),
    ).rejects.toThrow("rangeStart");
    await expect(
      service.getSeatMapAssignments("csm_1", "2026-11-06T14:00", "2026-13-06T16:00"),
    ).rejects.toThrow("rangeEnd");
    await expect(
      service.getSeatMapAssignments("csm_1", "", "2026-11-06T16:00"),
    ).rejects.toThrow("rangeStart is required.");
    expect(calls).toHaveLength(0);
  });

  it("throws when the range bounds fall on different dates", async () => {
    const { fetchFn, calls } = makeFetch(() => jsonResponse(assignmentsResponse()));
    const service = new SeatmapService(buildClient(fetchFn), { fullCustomerAccess: false });

    await expect(
      service.getSeatMapAssignments("act-1", "2026-11-06T14:00", "2026-11-07T02:00"),
    ).rejects.toThrow("rangeStart and rangeEnd must fall on the same date.");
    expect(calls).toHaveLength(0);

    // Same date, different times is fine.
    await expect(
      service.getSeatMapAssignments("act-1", "2026-11-06T23:00:00Z", "2026-11-06T23:30"),
    ).resolves.toBeDefined();
    expect(calls).toHaveLength(1);
  });

  it("propagates an unknown seat status from the converter", async () => {
    const bad = assignmentsResponse();
    bad.data.activity.seatingMaps[0].sections[0].groups[0].blocks[0].availability.status = "HELD";
    const { fetchFn } = makeFetch(() => jsonResponse(bad));
    const service = new SeatmapService(buildClient(fetchFn), { fullCustomerAccess: false });
    await expect(
      service.getSeatMapAssignments("csm_1", "2026-11-06T14:00", "2026-11-06T16:00"),
    ).rejects.toBeInstanceOf(UnknownSeatmapBlockStatusError);
  });
});
