import { describe, expect, it } from "vitest";

import type { AccountUserService } from "../../src/internal/account-users/account-user-service.js";
import {
  GraphQLClient,
  type GraphQLClientOptions,
} from "../../src/internal/graphql-client.js";
import type { ResourcePoolService } from "../../src/internal/resource-pools/resource-pool-service.js";
import {
  TimeslotService,
  type TimeslotServiceDeps,
} from "../../src/internal/timeslots/timeslot-service.js";
import { noopLogger } from "../../src/logger.js";
import type { ResourcePool } from "../../src/models/resource-pool.js";

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

function deps(
  pools: ResourcePool[] = [],
  users: Array<{ id: string; name: string }> = [],
): TimeslotServiceDeps {
  return {
    resourcePoolService: { getAll: async () => pools } as unknown as ResourcePoolService,
    accountUserService: { getAll: async () => users } as unknown as AccountUserService,
  };
}

function guidePool(id: string, name: string, accountUserId?: string): ResourcePool {
  return {
    id,
    name,
    imageUrl: null,
    mode: "ALL",
    colorHex: null,
    quantity: null,
    category: "guide",
    capacity: null,
    resourceTrackingMode: null,
    accountUser: accountUserId ? { id: accountUserId, name } : null,
  };
}

const timeslotNode = {
  id: "act-1|ts-1",
  bookingCount: 1,
  availableSpots: 9,
  maxPartySize: 4,
  totalCapacity: 10,
  checkedInCount: 0,
  manifestNotes: null,
  minuteLength: 60,
  status: "OPEN",
  date: "2026-01-02",
  resourceAllocations: [],
};

describe("TimeslotService.getForDay", () => {
  it("normalizes the date, builds filter variables, and converts nodes", async () => {
    const { fetchFn, calls } = makeFetch(() => ({
      data: { timeslots: { timeslots: [timeslotNode] } },
    }));

    const result = await new TimeslotService(buildClient(fetchFn), deps()).getForDay(
      "act-1",
      "2026-01-02T10:00:00Z",
      "withBookings",
    );

    expect(result.map((t) => t.id)).toEqual(["act-1|ts-1"]);
    expect(result[0]!.productId).toBe("act-1");

    const params = JSON.parse(calls[0]!.init.body as string).variables.params;
    expect(params.activityIds).toEqual(["act-1"]);
    expect(params.dateRange).toBe("[2026-01-02,2026-01-02]");
    expect(params.hasBookings).toBe(true);
  });

  it("omits hasBookings for the default 'all' filter", async () => {
    const { fetchFn, calls } = makeFetch(() => ({
      data: { timeslots: { timeslots: [] } },
    }));

    await new TimeslotService(buildClient(fetchFn), deps()).getForDay("act-1", "2026-01-02");

    const params = JSON.parse(calls[0]!.init.body as string).variables.params;
    expect(params.hasBookings).toBeUndefined();
  });

  it("sets hasBookings false for 'withoutBookings'", async () => {
    const { fetchFn, calls } = makeFetch(() => ({
      data: { timeslots: { timeslots: [] } },
    }));

    await new TimeslotService(buildClient(fetchFn), deps()).getForDay(
      "act-1",
      "2026-01-02",
      "withoutBookings",
    );

    expect(JSON.parse(calls[0]!.init.body as string).variables.params.hasBookings).toBe(
      false,
    );
  });

  it("returns an empty list when a 200 response carries no data", async () => {
    const { fetchFn } = makeFetch(() => ({}));
    const result = await new TimeslotService(buildClient(fetchFn), deps()).getForDay(
      "act-1",
      "2026-01-02",
    );
    expect(result).toEqual([]);
  });
});

describe("TimeslotService.getById", () => {
  it("returns the timeslot with the product id parsed from the timeslot id", async () => {
    const { fetchFn } = makeFetch(() => ({
      data: { timeslot: { timeslot: timeslotNode } },
    }));

    const timeslot = await new TimeslotService(buildClient(fetchFn), deps()).getById(
      "act-1|ts-1",
    );

    expect(timeslot?.id).toBe("act-1|ts-1");
    expect(timeslot?.productId).toBe("act-1");
  });

  it("returns null when there is no timeslot", async () => {
    const { fetchFn } = makeFetch(() => ({ data: { timeslot: null } }));
    const timeslot = await new TimeslotService(buildClient(fetchFn), deps()).getById("x");
    expect(timeslot).toBeNull();
  });
});

describe("TimeslotService update operations", () => {
  it("setAvailability sends status and returns the updated values", async () => {
    const { fetchFn, calls } = makeFetch(() => ({
      data: { updateTimeslot: { timeslot: { id: "ts-1", manifestNotes: null, status: "CLOSED" } } },
    }));

    const result = await new TimeslotService(buildClient(fetchFn), deps()).setAvailability(
      "ts-1",
      "CLOSED",
    );

    expect(result).toEqual({ manifestNotes: null, status: "CLOSED" });
    expect(JSON.parse(calls[0]!.init.body as string).variables.input).toEqual({
      id: "ts-1",
      status: "CLOSED",
    });
  });

  it("setNotes sends manifestNotes and defaults missing fields to null", async () => {
    const { fetchFn, calls } = makeFetch(() => ({ data: {} }));

    const result = await new TimeslotService(buildClient(fetchFn), deps()).setNotes(
      "ts-1",
      "Bring sunscreen",
    );

    expect(result).toEqual({ manifestNotes: null, status: null });
    expect(JSON.parse(calls[0]!.init.body as string).variables.input).toEqual({
      id: "ts-1",
      manifestNotes: "Bring sunscreen",
    });
  });
});

describe("TimeslotService.assignGuide", () => {
  it("matches guides and returns the allocation request id on success", async () => {
    const { fetchFn, calls } = makeFetch(() => ({
      data: {
        resourceAllocationBulkRequest: {
          __typename: "ResourceAllocationRequest",
          id: "req-1",
        },
      },
    }));
    const service = new TimeslotService(
      buildClient(fetchFn),
      deps([guidePool("pool-1", "Ada", "u1"), guidePool("pool-eq", "Kayak")], []),
    );

    const result = await service.assignGuide({
      timeslotIds: ["ts-1"],
      guideIds: ["u1"],
      action: "assign",
    });

    expect(result).toEqual({
      status: "success",
      resourceAllocationRequestId: "req-1",
      errors: null,
    });
    const input = JSON.parse(calls[0]!.init.body as string).variables.input;
    expect(input).toEqual({
      timeslotIds: ["ts-1"],
      resourcePoolIds: ["pool-1"],
      status: "ACTIVE",
    });
  });

  it("uses REMOVAL status when unassigning", async () => {
    const { fetchFn, calls } = makeFetch(() => ({
      data: {
        resourceAllocationBulkRequest: { __typename: "ResourceAllocationRequest", id: "r" },
      },
    }));
    const service = new TimeslotService(
      buildClient(fetchFn),
      deps([guidePool("pool-1", "Ada")]),
    );

    await service.assignGuide({ timeslotIds: ["ts-1"], guideIds: ["pool-1"], action: "unassign" });

    expect(JSON.parse(calls[0]!.init.body as string).variables.input.status).toBe("REMOVAL");
  });

  it("returns an error result on a GenericError response", async () => {
    const { fetchFn } = makeFetch(() => ({
      data: {
        resourceAllocationBulkRequest: { __typename: "GenericError", message: "nope" },
      },
    }));
    const service = new TimeslotService(buildClient(fetchFn), deps([guidePool("pool-1", "Ada")]));

    const result = await service.assignGuide({
      timeslotIds: ["ts-1"],
      guideIds: ["pool-1"],
      action: "assign",
    });

    expect(result).toEqual({
      status: "error",
      resourceAllocationRequestId: null,
      errors: [{ message: "nope" }],
    });
  });

  it("falls back to a generic message when no data is returned", async () => {
    const { fetchFn } = makeFetch(() => ({}));
    const service = new TimeslotService(buildClient(fetchFn), deps([guidePool("pool-1", "Ada")]));

    const result = await service.assignGuide({
      timeslotIds: ["ts-1"],
      guideIds: ["pool-1"],
      action: "assign",
    });

    expect(result.status).toBe("error");
    expect(result.errors).toEqual([{ message: "Unknown error" }]);
  });

  it("throws when timeslots or guides are empty", async () => {
    const { fetchFn } = makeFetch(() => ({}));
    const service = new TimeslotService(buildClient(fetchFn), deps());

    await expect(
      service.assignGuide({ timeslotIds: [], guideIds: ["u1"], action: "assign" }),
    ).rejects.toThrow(/at least one timeslot and one guide/i);
  });

  it("throws on an invalid action", async () => {
    const { fetchFn } = makeFetch(() => ({}));
    const service = new TimeslotService(buildClient(fetchFn), deps());

    await expect(
      service.assignGuide({
        timeslotIds: ["ts-1"],
        guideIds: ["u1"],
        action: "delete" as unknown as "assign",
      }),
    ).rejects.toThrow(/invalid action/i);
  });

  it("throws when a guide cannot be matched", async () => {
    const { fetchFn } = makeFetch(() => ({}));
    const service = new TimeslotService(buildClient(fetchFn), deps([guidePool("pool-1", "Ada")]));

    await expect(
      service.assignGuide({ timeslotIds: ["ts-1"], guideIds: ["ghost"], action: "assign" }),
    ).rejects.toThrow(/Guide not found: ghost/);
  });
});
