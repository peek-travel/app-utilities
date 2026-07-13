import { describe, expect, it } from "vitest";

import { buildBookingsListingQuery } from "../../src/internal/bookings/booking-queries.js";

/** Collapses whitespace so selection sets can be matched regardless of layout. */
function collapse(query: string): string {
  return query.replace(/\s+/g, " ").trim();
}

describe("buildBookingsListingQuery", () => {
  it("injects the per-ticket value selection when the price breakdown is requested", () => {
    const query = collapse(buildBookingsListingQuery(false, true));
    expect(query).toContain(
      "ticketQuantities { value { price { amount formatted } total { amount formatted } }",
    );
    // The booking-level breakdown still lands on the booking node's `value`.
    expect(query).toContain("value { convenienceFee { amount formatted }");
  });

  it("omits the per-ticket value selection when the breakdown is not requested", () => {
    const query = collapse(buildBookingsListingQuery(false, false));
    expect(query).toContain("ticketQuantities { quantity resourceOptionSnapshot");
    expect(query).not.toContain("ticketQuantities { value {");
    expect(query).not.toContain("convenienceFee");
  });
});
