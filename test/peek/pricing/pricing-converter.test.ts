import { describe, expect, it } from "vitest";

import { fromActivityContexts } from "../../../src/internal/peek/pricing/pricing-converter.js";
import type { RawActivityContext } from "../../../src/internal/peek/pricing/pricing-queries.js";
import {
  SPOTS_TAKEN_FILTER_TYPENAME,
  START_TIME_RANGE_FILTER_TYPENAME,
} from "../../../src/internal/peek/pricing/pricing-queries.js";

describe("fromActivityContexts", () => {
  it("maps a full context: fixed + percentage overrides and both filter kinds", () => {
    const raw: RawActivityContext[] = [
      {
        date: "2025-07-04",
        activity: { id: "act-1", name: "Kayak Tour" },
        engine: { id: "eng-1", name: "Schedule" },
        overrides: [
          {
            order: 0,
            resourceOptions: [
              {
                resourceOption: { id: "r1", name: "Adult" },
                override: {
                  price: { amount: "80.00", currency: "USD", formatted: "$80.00" },
                },
              },
            ],
            filters: [
              {
                __typename: SPOTS_TAKEN_FILTER_TYPENAME,
                minSpots: 4,
                maxSpots: 9,
              },
              {
                __typename: START_TIME_RANGE_FILTER_TYPENAME,
                startTimeRange: "[09:00:00,11:00:00]",
              },
            ],
          },
          {
            order: 1,
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
    ];

    expect(fromActivityContexts(raw)).toEqual([
      {
        date: "2025-07-04",
        activity: { id: "act-1", name: "Kayak Tour" },
        engine: { id: "eng-1", name: "Schedule" },
        overrides: [
          {
            order: 0,
            resourceOptions: [
              {
                resourceOption: { id: "r1", name: "Adult" },
                override: {
                  mode: "fixed",
                  price: { amount: "80.00", currency: "USD", displayPrice: "$80.00" },
                },
              },
            ],
            filters: [
              { spotsTaken: { minSpots: 4, maxSpots: 9 } },
              { startTimeRange: "[09:00:00,11:00:00]" },
            ],
          },
          {
            order: 1,
            resourceOptions: [
              {
                resourceOption: { id: "r1", name: "Adult" },
                override: { mode: "percentage", percentageAdjustment: "-25" },
              },
            ],
            filters: [],
          },
        ],
      },
    ]);
  });

  it("drops null spots bounds, keeping only the present side", () => {
    const raw: RawActivityContext[] = [
      {
        date: "2025-07-04",
        activity: { id: "act-1", name: "Tour" },
        engine: { id: "eng-1", name: "Schedule" },
        overrides: [
          {
            order: 0,
            resourceOptions: [],
            filters: [
              { __typename: SPOTS_TAKEN_FILTER_TYPENAME, minSpots: 4, maxSpots: null },
            ],
          },
          {
            order: 1,
            resourceOptions: [],
            filters: [
              { __typename: SPOTS_TAKEN_FILTER_TYPENAME, minSpots: null, maxSpots: 3 },
            ],
          },
        ],
      },
    ];

    const [context] = fromActivityContexts(raw);
    expect(context?.overrides[0]?.filters).toEqual([{ spotsTaken: { minSpots: 4 } }]);
    expect(context?.overrides[1]?.filters).toEqual([{ spotsTaken: { maxSpots: 3 } }]);
  });

  it("maps a cleared context (no overrides)", () => {
    const raw: RawActivityContext[] = [
      {
        date: "2025-07-04",
        activity: { id: "act-1", name: "Tour" },
        engine: { id: "eng-1", name: "Schedule" },
        overrides: [],
      },
    ];

    expect(fromActivityContexts(raw)).toEqual([
      {
        date: "2025-07-04",
        activity: { id: "act-1", name: "Tour" },
        engine: { id: "eng-1", name: "Schedule" },
        overrides: [],
      },
    ]);
  });

  it("returns an empty list for no contexts", () => {
    expect(fromActivityContexts([])).toEqual([]);
  });
});
