import { describe, expect, it } from "vitest";

import { toAvailabilityTime } from "../../../src/internal/peek/availability/availability-converter.js";
import type { AvailabilityTimeNode } from "../../../src/internal/peek/availability/availability-queries.js";

const NODE: AvailabilityTimeNode = {
  id: "slot-1",
  time: "10:00",
  from: "2026-01-02T10:00:00Z",
  end: "2026-01-02T11:00:00Z",
  duration: { name: "1h", length: { amount: 60, unit: "MINUTES" } },
  status: "AVAILABLE",
  price: { amount: "50.00", currency: "USD", formatted: "$50.00" },
  availability: [{ qty: 10, taken: 2, resourceOptionId: "r1" }],
};

describe("toAvailabilityTime", () => {
  it("maps every field one-to-one", () => {
    expect(toAvailabilityTime(NODE)).toEqual(NODE);
  });

  it("maps a missing price to null and missing availability to an empty list", () => {
    const result = toAvailabilityTime({
      ...NODE,
      price: null,
      availability: undefined as unknown as AvailabilityTimeNode["availability"],
    });
    expect(result.price).toBeNull();
    expect(result.availability).toEqual([]);
  });
});
