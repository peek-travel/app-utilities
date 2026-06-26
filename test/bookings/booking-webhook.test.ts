import { describe, expect, it } from "vitest";

import {
  BOOKING_WEBHOOK_GQL_QUERY,
  parseBookingWebhook,
} from "../../src/internal/bookings/booking-webhook.js";
import type { BookingNode } from "../../src/internal/bookings/booking-queries.js";

/**
 * The exact selection set that must be registered with the live booking webhook
 * (the external `output_fields_gql_query` config — e.g. the connector's
 * `app.json`). This is the cross-system contract: if a field change here is
 * intentional, update this snapshot AND the external config + `docs/webhooks.md`;
 * if it is accidental, this catches it before release.
 */
const REGISTERED_WEBHOOK_QUERY =
  "{ displayId id primaryGuest { name email phone optinMarketing optinSms isGdpr postalCode } activitySnapshot { type name id } ticketQuantities { quantity resourceOptionSnapshot { name id } } reservationStatus checkinStatus returnStatus fulfillmentStatusOverride { status } timeSnapshot { id legacyId } purchasedAt purchasedAtUtc startsAt startsAtUtc endsAt endsAtUtc availabilityTimeId bookingPortalUrl operatorNotes value { convenienceFee { amount formatted } deposit { amount formatted } discount { amount formatted } discountedPrice { amount formatted } fees { amount formatted } flatPartnerFee { amount formatted } price { amount formatted } retailPrice { amount formatted } taxes { amount formatted } tips { amount formatted } total { formatted amount } } balance { total { amount formatted } } tips { price { amount formatted } } order { displayId id promoCodes { code } channelSnapshot { id name agent { name } } initialQuote { source { actor { app } } } } questionAnswers { answer questionText questionLocationSnapshot { latitude longitude } } tickets { questionAnswers { answer questionText } } resourcePoolAssignments { quantity resourcePool { name shortName resources { name } } resourceAssignments { resource { id name } } } bookingGuests { id name country dateOfBirth email isGdpr isParticipant optinSms optinMarketing phone postalCode fieldResponses { id text fieldLocation { field { name } } } } primaryGuest { id name country dateOfBirth email isGdpr isParticipant optinSms optinMarketing phone postalCode fieldResponses { id text fieldLocation { field { name } } } } }";

function webhookNode(): BookingNode {
  return {
    id: "bkg_1",
    displayId: "B-1",
    primaryGuest: { id: "g1", name: "Ada", email: "ada@example.com", phone: "+1" },
    activitySnapshot: { type: "RENTAL", name: "Kayak", id: "act-1" },
    ticketQuantities: [{ quantity: 2, resourceOptionSnapshot: { name: "Adult", id: "r1" } }],
    reservationStatus: "CONFIRMED",
    checkinStatus: "NONE",
    returnStatus: "NONE",
    value: { total: { amount: "100.00", formatted: "$100.00" } },
    balance: { total: { amount: "0.00", formatted: "$0.00" } },
    order: { id: "ord-1", initialQuote: { source: { actor: { app: "WIDGET" } } } },
  };
}

describe("BOOKING_WEBHOOK_GQL_QUERY", () => {
  it("is a single-line, paste-ready selection set", () => {
    expect(BOOKING_WEBHOOK_GQL_QUERY.startsWith("{")).toBe(true);
    expect(BOOKING_WEBHOOK_GQL_QUERY.endsWith("}")).toBe(true);
    expect(BOOKING_WEBHOOK_GQL_QUERY).not.toContain("\n");
    expect(BOOKING_WEBHOOK_GQL_QUERY).not.toContain("  ");
  });

  it("is the maximal selection (guests + price breakdown)", () => {
    expect(BOOKING_WEBHOOK_GQL_QUERY).toContain("bookingGuests {");
    expect(BOOKING_WEBHOOK_GQL_QUERY).toContain("fieldResponses {");
    expect(BOOKING_WEBHOOK_GQL_QUERY).toContain("taxes { amount formatted }");
    expect(BOOKING_WEBHOOK_GQL_QUERY).toContain("retailPrice { amount formatted }");
  });

  it("matches the query registered with the live webhook (drift guard)", () => {
    expect(BOOKING_WEBHOOK_GQL_QUERY).toBe(REGISTERED_WEBHOOK_QUERY);
  });
});

describe("parseBookingWebhook", () => {
  it("parses the { booking } envelope into a Booking", () => {
    const booking = parseBookingWebhook({ booking: webhookNode() });
    expect(booking.bookingId).toBe("bkg_1");
    expect(booking.displayId).toBe("B-1");
    expect(booking.source).toBe("website");
    expect(booking.customerName).toBe("Ada");
  });

  it("parses a bare booking node (no envelope)", () => {
    const booking = parseBookingWebhook(webhookNode());
    expect(booking.bookingId).toBe("bkg_1");
  });

  it("parses a JSON string body", () => {
    const booking = parseBookingWebhook(JSON.stringify({ booking: webhookNode() }));
    expect(booking.bookingId).toBe("bkg_1");
  });

  it("auto-detects guests when the payload carries them", () => {
    const node = webhookNode();
    node.bookingGuests = [{ id: "g1", name: "Ada", email: "ada@example.com" }];
    const booking = parseBookingWebhook({ booking: node });
    expect(booking.guests).toBeDefined();
    expect(booking.guests).toHaveLength(1);
  });

  it("omits guests when the payload does not carry them", () => {
    const booking = parseBookingWebhook({ booking: webhookNode() });
    expect(booking.guests).toBeUndefined();
  });

  it("auto-detects the price breakdown when the payload carries it", () => {
    const node = webhookNode();
    node.value = {
      total: { amount: "100.00", formatted: "$100.00" },
      taxes: { amount: "8.00", formatted: "$8.00" },
    };
    const booking = parseBookingWebhook({ booking: node });
    expect(booking.taxes).toEqual({ amount: "8.00", display: "$8.00" });
  });

  it("omits the price breakdown when only the total is present", () => {
    const booking = parseBookingWebhook({ booking: webhookNode() });
    expect(booking.taxes).toBeUndefined();
  });

  it("returns an empty-ish Booking for malformed input rather than throwing", () => {
    expect(() => parseBookingWebhook(null)).not.toThrow();
    expect(() => parseBookingWebhook("not json")).not.toThrow();
    expect(parseBookingWebhook(undefined).bookingId).toBe("");
  });
});
