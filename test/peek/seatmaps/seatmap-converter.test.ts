import { describe, expect, it } from "vitest";

import {
  fromAssignableBookings,
  fromAssignedSeatmap,
  fromDeletedAssignments,
  fromSeatmapNodes,
  toAssignmentResponse,
} from "../../../src/internal/peek/seatmaps/seatmap-converter.js";
import type {
  RawAssignableBooking,
  RawAssignedSeatmapNode,
  RawSeatmapNode,
} from "../../../src/internal/peek/seatmaps/seatmap-queries.js";
import {
  UnknownSeatmapAssignmentParentError,
  UnknownSeatmapBlockStatusError,
  UnknownSeatmapDisplayTypeError,
} from "../../../src/errors.js";

/** A representative map node mirroring the shapes the gateway returns. */
function fullNode(): RawSeatmapNode {
  return {
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
      // A decorative SHAPE: width/height/label/type populated, no groups.
      {
        id: "css_krn56",
        display: {
          height: 60,
          label: "Stage",
          type: "SHAPE",
          width: 200,
          x: 672,
          y: 366,
        },
        groups: [],
      },
      // A seatable SECTION: width/height/label null, one group with blocks.
      {
        id: "css_km8d5",
        display: {
          height: null,
          label: null,
          type: "SECTION",
          width: null,
          x: 800,
          y: 432,
        },
        groups: [
          {
            assignableTo: ["GUEST"],
            name: "Table 12",
            id: "csg_yj9ge",
            display: { table: true, tableHeight: 80, tableWidth: 120, x: 176, y: 256 },
            blocks: [
              {
                display: { x: 0, y: 0 },
                fullBlockName: "Table 12, Seat 1",
                id: "csb_a7bk8",
                name: "1",
                order: 0,
                zone: { id: "csz_zy3de" },
              },
            ],
          },
        ],
      },
    ],
  };
}

describe("fromSeatmapNodes", () => {
  it("maps a seating-map node into the clean model", () => {
    const [map] = fromSeatmapNodes([fullNode()]);

    expect(map).toMatchObject({ id: "csm_8j734", name: "Dinner Theater" });
    expect(map.zones).toEqual([
      {
        id: "csz_z77an",
        name: "Premium",
        tickets: [{ id: "ro-1", name: "Adult - Premium" }],
      },
    ]);
    expect(map.sections).toHaveLength(2);
  });

  it("fills a section's shared display and leaves table fields null", () => {
    const [map] = fromSeatmapNodes([fullNode()]);
    const shape = map.sections[0];

    expect(shape.display).toEqual({
      x: 672,
      y: 366,
      width: 200,
      height: 60,
      label: "Stage",
      type: "SHAPE",
      // Fields a section never carries collapse to null.
      tableWidth: null,
      tableHeight: null,
      table: null,
    });
    expect(shape.groups).toEqual([]);
  });

  it("fills a SECTION display with null width/height/label", () => {
    const [map] = fromSeatmapNodes([fullNode()]);
    const section = map.sections[1];

    expect(section.display).toEqual({
      x: 800,
      y: 432,
      width: null,
      height: null,
      label: null,
      type: "SECTION",
      tableWidth: null,
      tableHeight: null,
      table: null,
    });
  });

  it("fills a group display with table fields and nulls section-only fields", () => {
    const [map] = fromSeatmapNodes([fullNode()]);
    const group = map.sections[1].groups[0];

    expect(group).toMatchObject({
      id: "csg_yj9ge",
      name: "Table 12",
      assignableTo: ["GUEST"],
    });
    expect(group.display).toEqual({
      x: 176,
      y: 256,
      table: true,
      tableWidth: 120,
      tableHeight: 80,
      // Section-only fields collapse to null on a group.
      width: null,
      height: null,
      label: null,
      type: null,
    });
  });

  it("maps a block, keeping only x/y on its display and resolving zoneId", () => {
    const [map] = fromSeatmapNodes([fullNode()]);
    const block = map.sections[1].groups[0].blocks[0];

    expect(block).toEqual({
      id: "csb_a7bk8",
      name: "1",
      fullBlockName: "Table 12, Seat 1",
      order: 0,
      zoneId: "csz_zy3de",
      display: {
        x: 0,
        y: 0,
        width: null,
        height: null,
        tableWidth: null,
        tableHeight: null,
        table: null,
        label: null,
        type: null,
      },
    });
  });

  it("accepts every known display type", () => {
    const node: RawSeatmapNode = {
      id: "m",
      name: "m",
      sections: [
        { id: "a", display: { x: 0, y: 0, type: "SHAPE" }, groups: [] },
        { id: "b", display: { x: 0, y: 0, type: "SECTION" }, groups: [] },
        { id: "c", display: { x: 0, y: 0, type: "LABEL" }, groups: [] },
      ],
    };
    const [map] = fromSeatmapNodes([node]);
    expect(map.sections.map((s) => s.display.type)).toEqual([
      "SHAPE",
      "SECTION",
      "LABEL",
    ]);
  });

  it("throws UnknownSeatmapDisplayTypeError on an unrecognized type", () => {
    const node: RawSeatmapNode = {
      id: "m",
      name: "m",
      sections: [{ id: "a", display: { x: 0, y: 0, type: "CIRCLE" }, groups: [] }],
    };

    let caught: unknown;
    try {
      fromSeatmapNodes([node]);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(UnknownSeatmapDisplayTypeError);
    expect((caught as UnknownSeatmapDisplayTypeError).type).toBe("CIRCLE");
  });

  it("treats a null group tableHeight as null (irregular table)", () => {
    const node: RawSeatmapNode = {
      id: "m",
      name: "m",
      sections: [
        {
          id: "a",
          display: { x: 0, y: 0, type: "SECTION" },
          groups: [
            {
              assignableTo: ["GUEST"],
              name: "Table 9",
              id: "g",
              display: { table: true, tableHeight: null, tableWidth: 60, x: -624, y: -256 },
              blocks: [],
            },
          ],
        },
      ],
    };
    const [map] = fromSeatmapNodes([node]);
    expect(map.sections[0].groups[0].display.tableHeight).toBeNull();
  });

  it("defaults a block's missing zone to a null zoneId", () => {
    const node: RawSeatmapNode = {
      id: "m",
      name: "m",
      sections: [
        {
          id: "a",
          display: { x: 0, y: 0, type: "SECTION" },
          groups: [
            {
              name: "g",
              id: "g",
              display: { x: 0, y: 0 },
              blocks: [
                {
                  display: { x: 0, y: 0 },
                  fullBlockName: "Unassigned",
                  id: "b",
                  name: "1",
                  order: 0,
                },
              ],
            },
          ],
        },
      ],
    };
    const [map] = fromSeatmapNodes([node]);
    expect(map.sections[0].groups[0].blocks[0].zoneId).toBeNull();
  });

  it("defaults missing optional collections to empty arrays", () => {
    const node: RawSeatmapNode = { id: "m", name: "m" };
    const [map] = fromSeatmapNodes([node]);

    expect(map.zones).toEqual([]);
    expect(map.sections).toEqual([]);
  });

  it("defaults missing group collections and assignableTo", () => {
    const node: RawSeatmapNode = {
      id: "m",
      name: "m",
      zones: [{ id: "z", name: "Z" }],
      sections: [
        {
          id: "a",
          display: { x: 0, y: 0, type: "SECTION" },
          groups: [{ name: "g", id: "g", display: { x: 0, y: 0 } }],
        },
      ],
    };
    const [map] = fromSeatmapNodes([node]);

    expect(map.zones[0].tickets).toEqual([]);
    expect(map.sections[0].groups[0].assignableTo).toEqual([]);
    expect(map.sections[0].groups[0].blocks).toEqual([]);
  });

  it("returns an empty list for no nodes", () => {
    expect(fromSeatmapNodes([])).toEqual([]);
  });
});

/** Wraps one seat with the given availability inside a full assigned-map node. */
function assignedNode(
  availability: NonNullable<
    NonNullable<
      NonNullable<RawAssignedSeatmapNode["sections"]>[number]["groups"]
    >[number]["blocks"]
  >[number]["availability"],
): RawAssignedSeatmapNode {
  return {
    id: "csm_8j734",
    name: "Dinner Theater",
    zones: [
      { id: "csz_z77an", name: "Premium", resourceOptions: [{ id: "ro-1", name: "Adult - Premium" }] },
    ],
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
                availability,
              },
            ],
          },
        ],
      },
    ],
  };
}

const TICKET_PARENT = {
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
};

/** Reaches the single seat's assignment data in an assigned-map result. */
function firstBlock(node: RawAssignedSeatmapNode) {
  return fromAssignedSeatmap(node).sections[0].groups[0].blocks[0];
}

describe("fromAssignedSeatmap", () => {
  it("carries the same structural data as the base map", () => {
    const map = fromAssignedSeatmap(assignedNode({ status: "AVAILABLE", assignments: [] }));
    expect(map).toMatchObject({ id: "csm_8j734", name: "Dinner Theater" });
    expect(map.zones[0].tickets[0]).toEqual({ id: "ro-1", name: "Adult - Premium" });
    const block = map.sections[0].groups[0].blocks[0];
    expect(block).toMatchObject({
      id: "csb_a7bk8",
      fullBlockName: "Table 12, Seat 1",
      order: 0,
      zoneId: "csz_zy3de",
    });
    expect(block.display).toMatchObject({ x: 0, y: 0 });
  });

  it("maps a GUEST assignment with full booking detail", () => {
    const block = firstBlock(
      assignedNode({ status: "OCCUPIED", assignments: [{ id: "asa_1", parent: TICKET_PARENT }] }),
    );
    expect(block.status).toBe("OCCUPIED");
    expect(block.assignedTo).toEqual([
      {
        occupiedBy: "GUEST",
        bookingId: "bk_1",
        bookingDisplayId: "ABC123",
        productId: "act-1",
        productName: "Dinner Theater",
        ticketId: "ro-1",
        ticketName: "Adult - Premium",
        guestName: "Ada Lovelace",
        startsAt: "2026-11-06T14:00:00",
        endsAt: "2026-11-06T16:00:00",
      },
    ]);
  });

  it("strips fractional seconds from booking startsAt/endsAt", () => {
    const parent = {
      ...TICKET_PARENT,
      booking: {
        ...TICKET_PARENT.booking,
        startsAt: "2026-11-02T19:00:00.000000",
        endsAt: "2026-11-02T21:30:00.500",
      },
    };
    const block = firstBlock(
      assignedNode({ status: "OCCUPIED", assignments: [{ id: "asa_1", parent }] }),
    );
    expect(block.assignedTo[0].startsAt).toBe("2026-11-02T19:00:00");
    expect(block.assignedTo[0].endsAt).toBe("2026-11-02T21:30:00");
  });

  it("nulls a GUEST guestName when primaryGuest is absent (PII off)", () => {
    const parent = { ...TICKET_PARENT, booking: { ...TICKET_PARENT.booking, primaryGuest: null } };
    const block = firstBlock(
      assignedNode({ status: "OCCUPIED", assignments: [{ id: "asa_1", parent }] }),
    );
    expect(block.assignedTo[0].guestName).toBeNull();
    // Non-PII booking detail still present.
    expect(block.assignedTo[0].bookingId).toBe("bk_1");
    expect(block.assignedTo[0].startsAt).toBe("2026-11-06T14:00:00");
  });

  it("maps an ACCOUNT_USER assignment with the staff name as guestName", () => {
    const block = firstBlock(
      assignedNode({
        status: "OCCUPIED",
        assignments: [{ id: "asa_2", parent: { __typename: "AccountUser", id: "au_1", name: "Grace Hopper" } }],
      }),
    );
    expect(block.assignedTo[0]).toMatchObject({
      occupiedBy: "ACCOUNT_USER",
      guestName: "Grace Hopper",
      bookingId: null,
      ticketId: null,
      startsAt: null,
    });
  });

  it("maps a FIELD_LOCATION assignment with all detail null", () => {
    const block = firstBlock(
      assignedNode({
        status: "OCCUPIED",
        assignments: [{ id: "asa_3", parent: { __typename: "FieldLocation", id: "fl_1" } }],
      }),
    );
    expect(block.assignedTo[0]).toEqual({
      occupiedBy: "FIELD_LOCATION",
      bookingId: null,
      bookingDisplayId: null,
      productId: null,
      productName: null,
      ticketId: null,
      ticketName: null,
      guestName: null,
      startsAt: null,
      endsAt: null,
    });
  });

  it("keeps every assignment when a seat has more than one", () => {
    const block = firstBlock(
      assignedNode({
        status: "OCCUPIED",
        assignments: [
          { id: "asa_1", parent: TICKET_PARENT },
          { id: "asa_2", parent: { __typename: "AccountUser", id: "au_1", name: "Grace Hopper" } },
        ],
      }),
    );
    expect(block.assignedTo).toHaveLength(2);
    expect(block.assignedTo.map((a) => a.occupiedBy)).toEqual(["GUEST", "ACCOUNT_USER"]);
  });

  it("drops a BlockedSeat parent and never populates assignedTo off OCCUPIED", () => {
    const blocked = firstBlock(
      assignedNode({
        status: "BLOCKED",
        assignments: [{ id: "asa_4", parent: { __typename: "BlockedSeat", id: "bs_1" } }],
      }),
    );
    expect(blocked.status).toBe("BLOCKED");
    expect(blocked.assignedTo).toEqual([]);

    // Even if a BlockedSeat somehow rides along an OCCUPIED status, it drops out.
    const occupied = firstBlock(
      assignedNode({
        status: "OCCUPIED",
        assignments: [
          { id: "asa_4", parent: { __typename: "BlockedSeat", id: "bs_1" } },
          { id: "asa_1", parent: TICKET_PARENT },
        ],
      }),
    );
    expect(occupied.assignedTo).toHaveLength(1);
    expect(occupied.assignedTo[0].occupiedBy).toBe("GUEST");
  });

  it("leaves assignedTo empty for an AVAILABLE seat", () => {
    const block = firstBlock(
      assignedNode({ status: "AVAILABLE", assignments: [{ id: "asa_1", parent: TICKET_PARENT }] }),
    );
    expect(block.assignedTo).toEqual([]);
  });

  it("throws on an unknown seat status", () => {
    expect(() => fromAssignedSeatmap(assignedNode({ status: "HELD", assignments: [] }))).toThrow(
      UnknownSeatmapBlockStatusError,
    );
  });

  it("throws on a missing seat status", () => {
    let caught: unknown;
    try {
      fromAssignedSeatmap(assignedNode({ assignments: [] }));
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(UnknownSeatmapBlockStatusError);
    expect((caught as UnknownSeatmapBlockStatusError).status).toBe("undefined");
  });

  it("throws on an unknown assignment parent typename", () => {
    let caught: unknown;
    try {
      fromAssignedSeatmap(
        assignedNode({
          status: "OCCUPIED",
          assignments: [{ id: "asa_x", parent: { __typename: "Robot", id: "r_1" } }],
        }),
      );
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(UnknownSeatmapAssignmentParentError);
    expect((caught as UnknownSeatmapAssignmentParentError).typename).toBe("Robot");
  });

  it("defaults missing optional collections to empty", () => {
    const map = fromAssignedSeatmap({ id: "m", name: "m" });
    expect(map.zones).toEqual([]);
    expect(map.sections).toEqual([]);
  });

  it("defaults missing groups/blocks collections to empty", () => {
    const map = fromAssignedSeatmap({
      id: "m",
      name: "m",
      sections: [
        { id: "s1", display: { x: 0, y: 0, type: "SECTION" } },
        {
          id: "s2",
          display: { x: 0, y: 0, type: "SECTION" },
          groups: [{ id: "g1", name: "g1", display: { x: 0, y: 0 } }],
        },
      ],
    });
    expect(map.sections[0].groups).toEqual([]);
    expect(map.sections[1].groups[0].blocks).toEqual([]);
  });

  it("nulls every booking-derived field when a Ticket carries no booking/snapshots", () => {
    const block = firstBlock(
      assignedNode({
        status: "OCCUPIED",
        assignments: [{ id: "asa_1", parent: { __typename: "Ticket", id: "t_1" } }],
      }),
    );
    expect(block.assignedTo[0]).toEqual({
      occupiedBy: "GUEST",
      bookingId: null,
      bookingDisplayId: null,
      productId: null,
      productName: null,
      ticketId: null,
      ticketName: null,
      guestName: null,
      startsAt: null,
      endsAt: null,
    });
  });

  it("nulls guestName when both name parts are blank", () => {
    const parent = {
      ...TICKET_PARENT,
      booking: { ...TICKET_PARENT.booking, primaryGuest: { firstName: "  ", lastName: null } },
    };
    const block = firstBlock(
      assignedNode({ status: "OCCUPIED", assignments: [{ id: "asa_1", parent }] }),
    );
    expect(block.assignedTo[0].guestName).toBeNull();
  });

  it("treats a null assignments list under OCCUPIED as empty", () => {
    const block = firstBlock(assignedNode({ status: "OCCUPIED", assignments: null }));
    expect(block.assignedTo).toEqual([]);
  });
});

const ASSIGNABLE_BOOKING: RawAssignableBooking = {
  id: "bk_1",
  displayId: "ABC123",
  startsAt: "2026-11-02T19:00:00.000000",
  endsAt: "2026-11-02T21:00:00.0",
  primaryGuest: { firstName: "Ada", lastName: "Lovelace" },
  tickets: [
    {
      hashid: "tkt_h1",
      resourceOptionSnapshot: { id: "ro-1", name: "Adult - Premium" },
      seatingAssignment: { id: "asa_1", block: { id: "csb_a7bk8", fullBlockName: "Table 12, Seat 1" } },
    },
  ],
};

describe("fromAssignableBookings", () => {
  it("maps a booking with an assigned ticket", () => {
    const [booking] = fromAssignableBookings([ASSIGNABLE_BOOKING]);
    expect(booking).toEqual({
      id: "bk_1",
      displayId: "ABC123",
      startsAt: "2026-11-02T19:00:00",
      endsAt: "2026-11-02T21:00:00",
      guestName: "Ada Lovelace",
      assignableTickets: [
        {
          assignableId: "tkt_h1",
          ticketId: "ro-1",
          ticketName: "Adult - Premium",
          currentlyAssignedTo: {
            assignmentId: "asa_1",
            blockId: "csb_a7bk8",
            blockName: "Table 12, Seat 1",
          },
        },
      ],
    });
  });

  it("nulls currentlyAssignedTo when a ticket has no seating assignment", () => {
    const [booking] = fromAssignableBookings([
      { ...ASSIGNABLE_BOOKING, tickets: [{ hashid: "tkt_h2", resourceOptionSnapshot: { id: "ro-2", name: "Child" } }] },
    ]);
    expect(booking.assignableTickets[0].currentlyAssignedTo).toBeNull();
  });

  it("nulls ticket snapshot fields and block fields when absent", () => {
    const [booking] = fromAssignableBookings([
      { ...ASSIGNABLE_BOOKING, tickets: [{ hashid: "tkt_h3", seatingAssignment: { id: "asa_3" } }] },
    ]);
    expect(booking.assignableTickets[0]).toEqual({
      assignableId: "tkt_h3",
      ticketId: null,
      ticketName: null,
      currentlyAssignedTo: { assignmentId: "asa_3", blockId: null, blockName: null },
    });
  });

  it("nulls guestName when primaryGuest is absent (PII off)", () => {
    const [booking] = fromAssignableBookings([{ ...ASSIGNABLE_BOOKING, primaryGuest: null }]);
    expect(booking.guestName).toBeNull();
  });

  it("defaults missing tickets and times to empty/null", () => {
    const [booking] = fromAssignableBookings([{ id: "bk_2", displayId: "X" }]);
    expect(booking.assignableTickets).toEqual([]);
    expect(booking.startsAt).toBeNull();
    expect(booking.endsAt).toBeNull();
  });

  it("returns an empty list for no nodes", () => {
    expect(fromAssignableBookings([])).toEqual([]);
  });
});

describe("toAssignmentResponse", () => {
  const ASSIGNMENTS = [
    { assignableId: "t_A1", blockId: "csb_A1" },
    { assignableId: "t_B1", blockId: "csb_B1" },
  ];

  const ok = (asaId: string, hashid: string) => ({
    __typename: "AssignmentResponse",
    assignments: [{ id: asaId, parent: { __typename: "Ticket", hashid } }],
  });

  it("returns SUCCESS with assignableId+assignmentId pairs when all succeed", () => {
    const data = { a0: ok("asa_1", "t_A1"), a1: ok("asa_2", "t_B1") };
    expect(toAssignmentResponse(data, ASSIGNMENTS)).toEqual({
      status: "SUCCESS",
      successfulAssignments: [
        { assignableId: "t_A1", assignmentId: "asa_1" },
        { assignableId: "t_B1", assignmentId: "asa_2" },
      ],
      failedAssignments: [],
    });
  });

  it("returns PARTIAL when some succeed and some fail", () => {
    const data = { a0: ok("asa_1", "t_A1"), a1: { __typename: "AssignBlocksErrorOverbooking" } };
    expect(toAssignmentResponse(data, ASSIGNMENTS)).toEqual({
      status: "PARTIAL",
      successfulAssignments: [{ assignableId: "t_A1", assignmentId: "asa_1" }],
      failedAssignments: ["t_B1"],
    });
  });

  it("returns FAILED when every assignment failed", () => {
    const data = {
      a0: { __typename: "AssignBlocksErrorInvalidType" },
      a1: { __typename: "AssignBlocksErrorOverbooking" },
    };
    expect(toAssignmentResponse(data, ASSIGNMENTS)).toEqual({
      status: "FAILED",
      successfulAssignments: [],
      failedAssignments: ["t_A1", "t_B1"],
    });
  });

  it("treats a missing/null aliased result as a failure", () => {
    expect(toAssignmentResponse({ a0: ok("asa_1", "t_A1") }, ASSIGNMENTS)).toEqual({
      status: "PARTIAL",
      successfulAssignments: [{ assignableId: "t_A1", assignmentId: "asa_1" }],
      failedAssignments: ["t_B1"],
    });
  });

  it("falls back to the input assignableId when the parent hashid is absent", () => {
    const data = { a0: { __typename: "AssignmentResponse", assignments: [{ id: "asa_9" }] } };
    expect(toAssignmentResponse(data, [ASSIGNMENTS[0]])).toEqual({
      status: "SUCCESS",
      successfulAssignments: [{ assignableId: "t_A1", assignmentId: "asa_9" }],
      failedAssignments: [],
    });
  });
});

describe("fromDeletedAssignments", () => {
  it("maps a deleted assignment to the clean model", () => {
    const nodes = [
      {
        id: "asa_1",
        block: { id: "csb_A1", fullBlockName: "Zone A · Row 1 · Seat 1" },
        parent: { __typename: "Ticket", hashid: "t_pmwj9xbb" },
      },
    ];
    expect(fromDeletedAssignments(nodes)).toEqual([
      {
        assignmentId: "asa_1",
        blockId: "csb_A1",
        blockName: "Zone A · Row 1 · Seat 1",
        ticketHashId: "t_pmwj9xbb",
      },
    ]);
  });

  it("nulls block and ticket fields when absent", () => {
    expect(fromDeletedAssignments([{ id: "asa_2" }])).toEqual([
      { assignmentId: "asa_2", blockId: null, blockName: null, ticketHashId: null },
    ]);
  });

  it("returns an empty list for no nodes", () => {
    expect(fromDeletedAssignments([])).toEqual([]);
  });
});
