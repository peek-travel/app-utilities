import { describe, expect, it } from "vitest";

import {
  convertGuests,
  fromBookingNode,
} from "../../src/internal/bookings/booking-converter.js";
import type { BookingNode } from "../../src/internal/bookings/booking-queries.js";

function fullNode(): BookingNode {
  return {
    id: "bkg_1",
    displayId: "B-1",
    primaryGuest: {
      id: "g1",
      name: "Ada",
      email: "ada@example.com",
      phone: "+1",
      country: "US",
      dateOfBirth: "1990-01-01",
      isGdpr: true,
      isParticipant: true,
      optinSms: true,
      optinMarketing: false,
      postalCode: "12345",
      fieldResponses: [
        { id: "f1", text: "peanuts", fieldLocation: { field: { name: "Allergies" } } },
      ],
    },
    activitySnapshot: { type: "RENTAL", name: "Kayak", id: "act-1" },
    ticketQuantities: [
      { quantity: 2, resourceOptionSnapshot: { name: "Adult", id: "r1" } },
      { quantity: 1, resourceOptionSnapshot: { name: "Child", id: "r2" } },
    ],
    reservationStatus: "CANCELED",
    checkinStatus: "CHECKED_IN",
    returnStatus: "RETURNED",
    fulfillmentStatusOverride: { status: "NO_SHOW" },
    timeSnapshot: { id: "ts", legacyId: "legacy-ts" },
    purchasedAt: "2026-01-01T09:00:00Z",
    purchasedAtUtc: "2026-01-01T09:00:00Z",
    startsAt: "2026-01-02T10:00:00Z",
    startsAtUtc: "2026-01-02T10:00:00Z",
    endsAt: "2026-01-02T11:30:00Z",
    endsAtUtc: "2026-01-02T11:30:00Z",
    availabilityTimeId: "avail-1",
    bookingPortalUrl: "https://portal/b1",
    operatorNotes: "VIP",
    value: {
      total: { amount: "100.00", formatted: "$100.00" },
      convenienceFee: { amount: "2.00", formatted: "$2.00" },
      price: { amount: "90.00", formatted: "$90.00" },
    },
    balance: { total: { amount: "10.00", formatted: "$10.00" } },
    tips: [{ price: { amount: "5.00", formatted: "$5.00" } }],
    order: {
      id: "ord-1",
      promoCodes: [{ code: "SUMMER" }],
      channelSnapshot: { id: "ch-1", name: "Acme", agent: { name: "Jane" } },
      initialQuote: { source: { actor: { app: "WIDGET" } } },
    },
    questionAnswers: [
      {
        answer: "yes",
        questionText: "Waiver?",
        questionLocationSnapshot: { latitude: "1.0", longitude: "2.0" },
      },
    ],
    tickets: [
      { questionAnswers: [{ answer: "blue", questionText: "Color?" }] },
      { questionAnswers: null },
    ],
    resourcePoolAssignments: [
      {
        quantity: 1,
        resourcePool: { name: "Guides", shortName: "G" },
        resourceAssignments: [{ resource: { id: "res-1", name: "Ada" } }],
      },
    ],
    bookingGuests: [
      {
        id: "g1",
        name: "Ada",
        email: "ada@example.com",
        phone: "+1",
        country: "US",
        dateOfBirth: "1990-01-01",
        isGdpr: true,
        isParticipant: true,
        optinSms: true,
        optinMarketing: false,
        postalCode: "12345",
        fieldResponses: [
          { id: "f1", text: "peanuts", fieldLocation: { field: { name: "Allergies" } } },
        ],
      },
    ],
  };
}

describe("fromBookingNode", () => {
  it("maps a fully-populated node with guests and price breakdown", () => {
    const booking = fromBookingNode(fullNode(), true, true);

    expect(booking.bookingId).toBe("bkg_1");
    expect(booking.displayId).toBe("B-1");
    expect(booking.source).toBe("website");
    expect(booking.sourceApp).toBe("WIDGET");
    expect(booking.sourceDescription).toBe("Website Booking Flow");
    expect(booking.customerName).toBe("Ada");
    expect(booking.isRentalProduct).toBe(true);
    expect(booking.timeslotId).toBe("legacy-ts");
    expect(booking.totalTickets).toBe(3);
    expect(booking.ticketDescription).toBe("2x Adult, 1x Child");
    expect(booking.tickets).toHaveLength(2);
    expect(booking.isCanceled).toBe(true);
    expect(booking.isNoShow).toBe(true);
    expect(booking.isCheckedIn).toBe(true);
    expect(booking.isReturned).toBe(true);
    expect(booking.durationMin).toBe(90);
    expect(booking.notes).toBe("VIP");
    expect(booking.valueDisplay).toBe("$100.00");
    expect(booking.outstandingBalanceAmount).toBe("10.00");
    expect(booking.promoCodes).toEqual(["SUMMER"]);
    expect(booking.tips).toEqual([{ display: "$5.00", amount: "5.00" }]);
    expect(booking.resources).toEqual([{ quantity: 1, name: "Guides", shortName: "G" }]);
    expect(booking.resourcePoolAssignments).toEqual([{ id: "res-1", name: "Ada" }]);
    expect(booking.resellerId).toBe("ch-1");
    expect(booking.resellerName).toBe("Acme - Jane");
    expect(booking.orderId).toBe("ord-1");
    expect(booking.convenienceFee).toEqual({ amount: "2.00", display: "$2.00" });
    expect(booking.price).toEqual({ amount: "90.00", display: "$90.00" });
    expect(booking.taxes).toBeUndefined();
    expect(booking.customQuestionAnswers).toEqual([
      { question: "Waiver?", answer: "yes", latitude: "1.0", longitude: "2.0" },
    ]);
    expect(booking.customGuestQuestionAnswers).toEqual([
      { question: "Color?", answer: "blue" },
    ]);
    expect(booking.guests).toHaveLength(1);
    expect(booking.guests?.[0]).toMatchObject({
      id: "g1",
      isPrimary: true,
      dateOfBirth: new Date("1990-01-01"),
      metadata: [{ id: "f1", name: "Allergies", value: "peanuts" }],
    });
  });

  it("applies defaults for an empty node", () => {
    const booking = fromBookingNode(undefined);
    expect(booking).toMatchObject({
      bookingId: "",
      displayId: "",
      source: "unknown",
      sourceApp: "unknown",
      sourceDescription: "unknown",
      customerName: "",
      customerEmail: null,
      productId: "unknown",
      productName: "unknown",
      isRentalProduct: false,
      timeslotId: null,
      totalTickets: 0,
      ticketDescription: "",
      tickets: [],
      isCanceled: false,
      durationMin: 0,
      notes: "",
      promoCodes: [],
      tips: [],
      resources: [],
      resourcePoolAssignments: [],
      resellerId: null,
      resellerName: null,
      orderId: "",
      customQuestionAnswers: [],
      customGuestQuestionAnswers: [],
    });
    expect(booking.guests).toBeUndefined();
    expect(booking.convenienceFee).toBeUndefined();
  });

  it("maps an unknown app and non-rental type to defaults", () => {
    const node: BookingNode = {
      activitySnapshot: { type: "ACTIVITY", name: "Tour", id: "a" },
      order: { initialQuote: { source: { actor: { app: "NOT_A_SOURCE" } } } },
    };
    const booking = fromBookingNode(node);
    expect(booking.source).toBe("unknown");
    expect(booking.sourceDescription).toBe("unknown");
    expect(booking.sourceApp).toBe("NOT_A_SOURCE");
    expect(booking.isRentalProduct).toBe(false);
  });

  it("uses just the channel name when there is no agent", () => {
    const node: BookingNode = {
      order: { channelSnapshot: { id: "ch", name: "Acme", agent: null } },
    };
    expect(fromBookingNode(node).resellerName).toBe("Acme");
  });

  it("omits price breakdown and guests when not requested", () => {
    const booking = fromBookingNode(fullNode(), false, false);
    expect(booking.convenienceFee).toBeUndefined();
    expect(booking.guests).toBeUndefined();
  });

  it("falls back gracefully for present-but-empty nested fields", () => {
    const node: BookingNode = {
      id: "b",
      ticketQuantities: [{}],
      tips: [{}],
      value: {},
      order: { channelSnapshot: { id: "ch", agent: {} } },
      resourcePoolAssignments: [{ resourceAssignments: [{}] }],
      tickets: [
        { questionAnswers: [{ answer: undefined as unknown as string, questionText: "q" }] },
      ],
    };
    const booking = fromBookingNode(node, false, true);

    expect(booking.totalTickets).toBe(0);
    expect(booking.ticketDescription).toBe("0x Unknown");
    expect(booking.tickets).toEqual([{ name: "Unknown", quantity: 0, ticketId: "unknown" }]);
    expect(booking.tips).toEqual([{ display: "", amount: "" }]);
    expect(booking.resources).toEqual([{ quantity: 0, name: "", shortName: "" }]);
    expect(booking.resourcePoolAssignments).toEqual([{ id: "", name: "" }]);
    expect(booking.valueDisplay).toBe("");
    expect(booking.resellerName).toBe("");
    expect(booking.customGuestQuestionAnswers).toEqual([]);
    expect(booking.convenienceFee).toBeUndefined();
  });

  it("omits question coordinates when the location is incomplete", () => {
    const node: BookingNode = {
      questionAnswers: [
        { answer: "a", questionText: "q", questionLocationSnapshot: { latitude: "1.0" } },
      ],
    };
    expect(fromBookingNode(node).customQuestionAnswers).toEqual([
      { question: "q", answer: "a" },
    ]);
  });
});

describe("convertGuests", () => {
  it("appends the primary guest when not already present", () => {
    const guests = convertGuests({
      primaryGuest: { id: "p1", name: "Primary" },
      bookingGuests: [{ id: "g2", name: "Other" }],
    });
    expect(guests.map((g) => [g.id, g.isPrimary])).toEqual([
      ["g2", false],
      ["p1", true],
    ]);
  });

  it("returns an empty list when there are no guests and no primary id", () => {
    expect(convertGuests({})).toEqual([]);
  });
});
