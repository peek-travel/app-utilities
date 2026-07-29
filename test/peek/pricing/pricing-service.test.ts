import { describe, expect, it } from "vitest";

import {
  GraphQLClient,
  type GraphQLClientOptions,
} from "../../../src/internal/peek/graphql-client.js";
import { PricingService } from "../../../src/internal/peek/pricing/pricing-service.js";
import { noopLogger } from "../../../src/logger.js";
import type {
  UpsertOverridesInput,
} from "../../../src/models/peek/pricing.js";

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

/** Reads the `variables.input` sent on the first recorded call. */
function sentInput(calls: RecordedCall[]): Record<string, unknown> {
  return JSON.parse(calls[0]!.init.body as string).variables.input;
}

const UPSERT_INPUT: UpsertOverridesInput = {
  engineId: "eng-1",
  dateRange: "[2025-07-04,2025-07-04]",
  activities: [
    {
      activityId: "act-1",
      overrides: [
        {
          order: 0,
          resourceOptions: [
            { id: "r1", mode: "fixed", price: { amount: "80.00", currency: "USD" } },
          ],
          filters: [
            { spotsTaken: { minSpots: 4 } },
            { startTimeRange: "[09:00:00,11:00:00]" },
          ],
        },
        {
          order: 1,
          resourceOptions: [{ id: "r1", mode: "percentage", percentageAdjustment: "-25" }],
          filters: [],
        },
      ],
    },
  ],
};

function upsertSuccess(activityContexts: unknown[] = []) {
  return {
    data: {
      upsertPricingOverridesActivityContexts: {
        __typename: "UpsertPricingOverridesActivityContextsSuccess",
        activityContexts,
      },
    },
  };
}

describe("PricingService.createEngine", () => {
  it("creates an unfiltered engine and returns the id", async () => {
    const { fetchFn, calls } = makeFetch(() => ({
      data: {
        createPricingEngine: {
          __typename: "CreatePricingEngineSuccess",
          engine: { id: "eng-9" },
        },
      },
    }));

    const result = await new PricingService(buildClient(fetchFn)).createEngine({
      name: "Schedule",
    });

    expect(result).toEqual({ id: "eng-9" });
    expect(sentInput(calls)).toEqual({ name: "Schedule" });
  });

  it("scopes the engine to activity ids when provided", async () => {
    const { fetchFn, calls } = makeFetch(() => ({
      data: {
        createPricingEngine: {
          __typename: "CreatePricingEngineSuccess",
          engine: { id: "eng-9" },
        },
      },
    }));

    await new PricingService(buildClient(fetchFn)).createEngine({
      name: "Schedule",
      activityIds: ["act-1", "act-2"],
    });

    expect(sentInput(calls)).toEqual({
      name: "Schedule",
      filters: [{ activityIds: ["act-1", "act-2"] }],
    });
  });

  it("throws the InvalidDataError message", async () => {
    const { fetchFn } = makeFetch(() => ({
      data: {
        createPricingEngine: { __typename: "InvalidDataError", message: "bad name" },
      },
    }));

    await expect(
      new PricingService(buildClient(fetchFn)).createEngine({ name: "x" }),
    ).rejects.toThrow("bad name");
  });

  it("throws when the mutation returns no data", async () => {
    const { fetchFn } = makeFetch(() => ({}));
    await expect(
      new PricingService(buildClient(fetchFn)).createEngine({ name: "x" }),
    ).rejects.toThrow(/no data/);
  });

  it("requires a name", async () => {
    const { fetchFn } = makeFetch(() => ({}));
    await expect(
      new PricingService(buildClient(fetchFn)).createEngine({ name: "" }),
    ).rejects.toThrow(/name is required/);
  });
});

describe("PricingService.updateEngine", () => {
  it("updates name and scope, returning the echoed engine", async () => {
    const { fetchFn, calls } = makeFetch(() => ({
      data: {
        updatePricingEngine: {
          __typename: "UpdatePricingEngineSuccess",
          engine: { id: "eng-1", name: "Renamed" },
        },
      },
    }));

    const result = await new PricingService(buildClient(fetchFn)).updateEngine({
      engineId: "eng-1",
      name: "Renamed",
      activityIds: ["act-1"],
    });

    expect(result).toEqual({ id: "eng-1", name: "Renamed" });
    expect(sentInput(calls)).toEqual({
      id: "eng-1",
      name: "Renamed",
      filters: [{ activityIds: ["act-1"] }],
    });
  });

  it("clears the scope filter when no activity ids are given", async () => {
    const { fetchFn, calls } = makeFetch(() => ({
      data: {
        updatePricingEngine: {
          __typename: "UpdatePricingEngineSuccess",
          engine: { id: "eng-1", name: "Renamed" },
        },
      },
    }));

    await new PricingService(buildClient(fetchFn)).updateEngine({
      engineId: "eng-1",
      name: "Renamed",
    });

    expect(sentInput(calls).filters).toEqual([]);
  });

  it("throws on NotFoundError", async () => {
    const { fetchFn } = makeFetch(() => ({
      data: {
        updatePricingEngine: {
          __typename: "NotFoundError",
          id: "eng-1",
          message: "not found",
        },
      },
    }));

    await expect(
      new PricingService(buildClient(fetchFn)).updateEngine({ engineId: "eng-1", name: "x" }),
    ).rejects.toThrow("not found");
  });

  it("throws when the mutation returns no data", async () => {
    const { fetchFn } = makeFetch(() => ({}));
    await expect(
      new PricingService(buildClient(fetchFn)).updateEngine({ engineId: "eng-1", name: "x" }),
    ).rejects.toThrow(/no data/);
  });

  it.each([
    [{ engineId: "", name: "x" }, /engineId is required/],
    [{ engineId: "eng-1", name: "" }, /name is required/],
  ])("rejects invalid input (%#)", async (input, pattern) => {
    const { fetchFn } = makeFetch(() => ({}));
    await expect(
      new PricingService(buildClient(fetchFn)).updateEngine(input),
    ).rejects.toThrow(pattern);
  });
});

describe("PricingService.deleteEngine", () => {
  it("resolves on success and sends the engine id", async () => {
    const { fetchFn, calls } = makeFetch(() => ({
      data: {
        deletePricingEngine: {
          __typename: "DeletePricingEngineSuccess",
          engine: { id: "eng-1", name: "Schedule" },
        },
      },
    }));

    await expect(
      new PricingService(buildClient(fetchFn)).deleteEngine("eng-1"),
    ).resolves.toBeUndefined();
    expect(JSON.parse(calls[0]!.init.body as string).variables.id).toBe("eng-1");
  });

  it("resolves (idempotent) when the engine was already gone", async () => {
    const { fetchFn } = makeFetch(() => ({
      data: {
        deletePricingEngine: {
          __typename: "NotFoundError",
          id: "eng-1",
          message: "not found",
        },
      },
    }));

    await expect(
      new PricingService(buildClient(fetchFn)).deleteEngine("eng-1"),
    ).resolves.toBeUndefined();
  });

  it("requires an engine id", async () => {
    const { fetchFn } = makeFetch(() => ({}));
    await expect(
      new PricingService(buildClient(fetchFn)).deleteEngine(""),
    ).rejects.toThrow(/engineId is required/);
  });
});

describe("PricingService.upsertOverrides", () => {
  it("maps mode-tagged resource options to the raw wire shape, passing filters through", async () => {
    const { fetchFn, calls } = makeFetch(() => upsertSuccess());

    await new PricingService(buildClient(fetchFn)).upsertOverrides(UPSERT_INPUT);

    expect(sentInput(calls)).toEqual({
      engineId: "eng-1",
      dateRange: "[2025-07-04,2025-07-04]",
      activities: [
        {
          activityId: "act-1",
          overrides: [
            {
              order: 0,
              resourceOptions: [
                { id: "r1", price: { amount: "80.00", currency: "USD" } },
              ],
              filters: [
                { spotsTaken: { minSpots: 4 } },
                { startTimeRange: "[09:00:00,11:00:00]" },
              ],
            },
            {
              order: 1,
              resourceOptions: [{ id: "r1", percentageAdjustment: "-25" }],
              filters: [],
            },
          ],
        },
      ],
    });
  });

  it("strips a caller-supplied displayPrice from the fixed-price wire input", async () => {
    const { fetchFn, calls } = makeFetch(() => upsertSuccess());

    await new PricingService(buildClient(fetchFn)).upsertOverrides({
      engineId: "eng-1",
      dateRange: "[2025-07-04,2025-07-04]",
      activities: [
        {
          activityId: "act-1",
          overrides: [
            {
              order: 0,
              resourceOptions: [
                {
                  id: "r1",
                  mode: "fixed",
                  price: { amount: "80.00", currency: "USD", displayPrice: "$80.00" },
                },
              ],
              filters: [],
            },
          ],
        },
      ],
    });

    const sent = sentInput(calls) as {
      activities: Array<{ overrides: Array<{ resourceOptions: unknown[] }> }>;
    };
    expect(sent.activities[0]!.overrides[0]!.resourceOptions[0]).toEqual({
      id: "r1",
      price: { amount: "80.00", currency: "USD" },
    });
  });

  it("returns the resolved activity contexts", async () => {
    const { fetchFn } = makeFetch(() =>
      upsertSuccess([
        {
          date: "2025-07-04",
          activity: { id: "act-1", name: "Tour" },
          engine: { id: "eng-1", name: "Schedule" },
          overrides: [
            {
              order: 0,
              resourceOptions: [
                {
                  resourceOption: { id: "r1", name: "Adult" },
                  override: { percentageAdjustment: "-25" },
                },
              ],
              filters: [],
            },
          ],
        },
      ]),
    );

    const result = await new PricingService(buildClient(fetchFn)).upsertOverrides(UPSERT_INPUT);

    expect(result.activityContexts[0]?.overrides[0]?.resourceOptions[0]?.override).toEqual({
      mode: "percentage",
      percentageAdjustment: "-25",
    });
  });

  it("throws the InvalidDataError message", async () => {
    const { fetchFn } = makeFetch(() => ({
      data: {
        upsertPricingOverridesActivityContexts: {
          __typename: "InvalidDataError",
          message: "overlapping ranges",
        },
      },
    }));

    await expect(
      new PricingService(buildClient(fetchFn)).upsertOverrides(UPSERT_INPUT),
    ).rejects.toThrow("overlapping ranges");
  });

  it("throws when the mutation returns no data", async () => {
    const { fetchFn } = makeFetch(() => ({}));
    await expect(
      new PricingService(buildClient(fetchFn)).upsertOverrides(UPSERT_INPUT),
    ).rejects.toThrow(/no data/);
  });

  it.each([
    [{ ...UPSERT_INPUT, engineId: "" }, /engineId is required/],
    [{ ...UPSERT_INPUT, dateRange: "" }, /dateRange is required/],
    [
      { ...UPSERT_INPUT, activities: undefined as unknown as UpsertOverridesInput["activities"] },
      /activities is required/,
    ],
    [
      {
        ...UPSERT_INPUT,
        activities: [{ activityId: "", overrides: [] }],
      },
      /activityId is required/,
    ],
    [
      {
        ...UPSERT_INPUT,
        activities: [
          {
            activityId: "act-1",
            overrides: [
              {
                order: 0,
                resourceOptions: [{ id: "", mode: "percentage", percentageAdjustment: "-5" }],
                filters: [],
              },
            ],
          },
        ],
      },
      /resource-option id is required/,
    ],
    [
      {
        ...UPSERT_INPUT,
        activities: [
          {
            activityId: "act-1",
            overrides: [
              {
                order: 0,
                resourceOptions: [{ id: "r1", mode: "fixed", price: { amount: "10", currency: "usd" } }],
                filters: [],
              },
            ],
          },
        ],
      },
      /currency must be 3 uppercase letters/,
    ],
    [
      {
        ...UPSERT_INPUT,
        activities: [
          {
            activityId: "act-1",
            overrides: [
              {
                order: 0,
                resourceOptions: [{ id: "r1", mode: "fixed", price: { amount: "abc", currency: "USD" } }],
                filters: [],
              },
            ],
          },
        ],
      },
      /price amount must be a valid number/,
    ],
    [
      {
        ...UPSERT_INPUT,
        activities: [
          {
            activityId: "act-1",
            overrides: [
              {
                order: 0,
                resourceOptions: [{ id: "r1", mode: "percentage", percentageAdjustment: "nope" }],
                filters: [],
              },
            ],
          },
        ],
      },
      /percentageAdjustment must be a valid number/,
    ],
    [
      {
        ...UPSERT_INPUT,
        activities: [
          {
            activityId: "act-1",
            overrides: [
              {
                order: 0,
                resourceOptions: [{ id: "r1", mode: "percentage", percentageAdjustment: "-100" }],
                filters: [],
              },
            ],
          },
        ],
      },
      /percentageAdjustment must be greater than -100/,
    ],
  ])("rejects invalid input (%#)", async (input, pattern) => {
    const { fetchFn } = makeFetch(() => upsertSuccess());
    await expect(
      new PricingService(buildClient(fetchFn)).upsertOverrides(input as UpsertOverridesInput),
    ).rejects.toThrow(pattern);
  });
});

describe("PricingService.clearOverrides", () => {
  it("sends empty overrides for each activity id", async () => {
    const { fetchFn, calls } = makeFetch(() => upsertSuccess());

    await new PricingService(buildClient(fetchFn)).clearOverrides({
      engineId: "eng-1",
      dateRange: "[2025-07-04,2025-07-04]",
      activityIds: ["act-1", "act-2"],
    });

    expect(sentInput(calls)).toEqual({
      engineId: "eng-1",
      dateRange: "[2025-07-04,2025-07-04]",
      activities: [
        { activityId: "act-1", overrides: [] },
        { activityId: "act-2", overrides: [] },
      ],
    });
  });

  it.each([
    [{ engineId: "", dateRange: "[d,d]", activityIds: ["a"] }, /engineId is required/],
    [{ engineId: "eng-1", dateRange: "", activityIds: ["a"] }, /dateRange is required/],
    [
      { engineId: "eng-1", dateRange: "[d,d]", activityIds: undefined as unknown as string[] },
      /activities is required/,
    ],
    [{ engineId: "eng-1", dateRange: "[d,d]", activityIds: [""] }, /activityId is required/],
  ])("rejects invalid input (%#)", async (input, pattern) => {
    const { fetchFn } = makeFetch(() => upsertSuccess());
    await expect(
      new PricingService(buildClient(fetchFn)).clearOverrides(input),
    ).rejects.toThrow(pattern);
  });
});
