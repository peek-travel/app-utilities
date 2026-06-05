import { describe, expect, it } from "vitest";

import { fromBookingGuestsResponse } from "../../src/internal/bookings/booking-guest-converter.js";
import type { BookingGuestsResponse } from "../../src/internal/bookings/booking-queries.js";

function response(node: BookingGuestsResponse["sales"]["edges"][number]["node"]): BookingGuestsResponse {
  return { sales: { edges: [{ node }] } };
}

describe("fromBookingGuestsResponse", () => {
  it("merges booking guests and flags the primary", () => {
    const guests = fromBookingGuestsResponse(
      response({
        displayId: "B-1",
        id: "bkg_1",
        primaryGuest: { id: "g1" },
        bookingGuests: [{ id: "g1" }, { id: "g2" }],
      }),
    );
    expect(guests.map((g) => [g.id, g.isPrimary])).toEqual([
      ["g1", true],
      ["g2", false],
    ]);
  });

  it("appends the primary guest when missing from booking guests", () => {
    const guests = fromBookingGuestsResponse(
      response({
        displayId: "B-1",
        id: "bkg_1",
        primaryGuest: { id: "p1" },
        bookingGuests: [{ id: "g2" }],
      }),
    );
    expect(guests.map((g) => g.id)).toEqual(["g2", "p1"]);
  });

  it("returns an empty list when the booking has no guests at all", () => {
    expect(
      fromBookingGuestsResponse(response({ displayId: "B-1", id: "bkg_1" })),
    ).toEqual([]);
  });

  it("returns an empty list when there are no edges", () => {
    expect(fromBookingGuestsResponse({ sales: { edges: [] } })).toEqual([]);
    expect(fromBookingGuestsResponse(undefined)).toEqual([]);
  });
});
