import { describe, expect, it } from "vitest";

import {
  buildBookingGuestsQuery,
  buildBookingsListingQuery,
} from "../../../src/internal/peek/bookings/booking-queries.js";

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

  it("requests customer PII fields when fullCustomerAccess is true", () => {
    const query = collapse(buildBookingsListingQuery(true, false, true));
    expect(query).toContain("primaryGuest { name email phone");
    expect(query).toContain("bookingPortalUrl");
    expect(query).toContain("questionAnswers {");
    expect(query).toContain("questionLocationSnapshot { latitude longitude }");
    // Guest identity fields present in the guests section.
    expect(query).toContain("bookingGuests { id name country dateOfBirth email");
    expect(query).toContain("fieldResponses {");
  });

  it("omits all customer PII fields when fullCustomerAccess is false", () => {
    const query = collapse(buildBookingsListingQuery(true, false, false));
    // No primary-guest identity block, portal URL, or custom question answers.
    expect(query).not.toContain("primaryGuest { name");
    expect(query).not.toContain("bookingPortalUrl");
    expect(query).not.toContain("questionAnswers {");
    expect(query).not.toContain("questionLocationSnapshot");
    expect(query).not.toContain("fieldResponses {");
    expect(query).not.toContain("dateOfBirth");
    // Operator-facing + structural fields still present.
    expect(query).toContain("operatorNotes");
    expect(query).toContain("resourcePoolAssignments {");
    // Guests section keeps only ids + participation/opt-in flags.
    expect(query).toContain("bookingGuests { id isParticipant optinSms optinMarketing }");
  });
});

describe("buildBookingGuestsQuery", () => {
  it("selects guest identity fields when fullCustomerAccess is true", () => {
    const query = collapse(buildBookingGuestsQuery(true));
    expect(query).toContain("bookingGuests { id name country dateOfBirth email isGdpr");
    expect(query).toContain("phone postalCode fieldResponses {");
  });

  it("selects only ids + flags when fullCustomerAccess is false", () => {
    const query = collapse(buildBookingGuestsQuery(false));
    expect(query).toContain("bookingGuests { id isParticipant optinSms optinMarketing }");
    expect(query).toContain("primaryGuest { id isParticipant optinSms optinMarketing }");
    expect(query).not.toContain("name");
    expect(query).not.toContain("email");
    expect(query).not.toContain("fieldResponses");
  });
});
