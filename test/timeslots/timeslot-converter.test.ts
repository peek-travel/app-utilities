import { describe, expect, it } from "vitest";

import {
  fromTimeslotNode,
  fromTimeslotNodes,
} from "../../src/internal/timeslots/timeslot-converter.js";
import type { TimeslotNode } from "../../src/internal/timeslots/timeslot-queries.js";

const fullNode: TimeslotNode = {
  id: "ts-1",
  bookingCount: 2,
  availableSpots: 8,
  maxPartySize: 4,
  totalCapacity: 10,
  checkedInCount: 1,
  manifestNotes: "VIP",
  minuteLength: 90,
  status: "OPEN",
  date: "2026-01-02",
  start: "2026-01-02T10:00:00Z",
  resourceAllocations: [
    {
      quantity: 1,
      resourcePool: {
        id: "pool-1",
        name: "Ada",
        category: "guide",
        capacity: 5,
        accountUser: { id: "u1" },
      },
    },
  ],
};

describe("fromTimeslotNode", () => {
  it("maps a full node, including assigned resources", () => {
    expect(fromTimeslotNode(fullNode, "act-1")).toEqual({
      id: "ts-1",
      productId: "act-1",
      totalCapacity: 10,
      availableCapacity: 8,
      maxPartySize: 4,
      bookingCount: 2,
      checkedInCount: 1,
      status: "OPEN",
      notes: "VIP",
      durationMin: 90,
      date: "2026-01-02",
      startTime: "2026-01-02T10:00:00Z",
      assignedResources: [
        {
          id: "pool-1",
          name: "Ada",
          capacity: 5,
          category: "guide",
          quantity: 1,
          accountUserId: "u1",
        },
      ],
    });
  });

  it("returns a zeroed timeslot for a missing node", () => {
    expect(fromTimeslotNode(null, "act-1")).toEqual({
      id: "",
      productId: "act-1",
      totalCapacity: 0,
      availableCapacity: 0,
      maxPartySize: 0,
      bookingCount: 0,
      checkedInCount: 0,
      status: "",
      notes: null,
      durationMin: 0,
      date: "",
      startTime: null,
      assignedResources: [],
    });
  });

  it("applies defaults for nullish fields and a null resource pool", () => {
    const node = {
      id: "",
      bookingCount: null,
      availableSpots: null,
      maxPartySize: null,
      totalCapacity: null,
      checkedInCount: null,
      manifestNotes: null,
      minuteLength: null,
      status: null,
      date: null,
      resourceAllocations: [{ quantity: null, resourcePool: null }],
    } as unknown as TimeslotNode;

    expect(fromTimeslotNode(node, "act-1")).toEqual({
      id: "",
      productId: "act-1",
      totalCapacity: 0,
      availableCapacity: 0,
      maxPartySize: 0,
      bookingCount: 0,
      checkedInCount: 0,
      status: "",
      notes: null,
      durationMin: 0,
      date: "",
      startTime: null,
      assignedResources: [
        { id: "", name: "", capacity: 0, category: "", quantity: 0, accountUserId: null },
      ],
    });
  });

  it("treats missing resourceAllocations as no assigned resources", () => {
    const node = { ...fullNode, resourceAllocations: null } as unknown as TimeslotNode;
    expect(fromTimeslotNode(node, "act-1").assignedResources).toEqual([]);
  });
});

describe("fromTimeslotNodes", () => {
  it("maps each node with the product id", () => {
    const result = fromTimeslotNodes([fullNode, { ...fullNode, id: "ts-2" }], "act-1");
    expect(result.map((t) => t.id)).toEqual(["ts-1", "ts-2"]);
    expect(result.every((t) => t.productId === "act-1")).toBe(true);
  });

  it("returns an empty list for no nodes", () => {
    expect(fromTimeslotNodes([], "act-1")).toEqual([]);
  });
});
