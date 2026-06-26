/**
 * Public webhook surface for bookings.
 *
 * A Peek "backoffice" booking webhook's payload shape is defined by a GraphQL
 * field selection registered with the hook. That registration happens once, in
 * an external system (the App Store `broadcast_to_url` config) — not from
 * consumer code — so this package registers nothing at runtime. It owns the two
 * pieces that must agree:
 *
 *  - {@link BOOKING_WEBHOOK_GQL_QUERY} — the canonical selection to paste into
 *    that external config. A setup-time artifact surfaced through
 *    `docs/webhooks.md` and pinned by a drift-guard test; **internal**, not part
 *    of the runtime public API.
 *  - {@link parseBookingWebhook} — the only runtime export; turns a delivered
 *    payload into a clean {@link Booking} using the very same converter as the
 *    read path.
 *
 * Parsing an inbound webhook needs no auth, no network, and no client — it is a
 * pure transform — so it is exported as a standalone function rather than a
 * method on `PeekAccessService` (the receiver may not hold gateway credentials).
 */
import type { Booking } from "../../models/booking.js";
import { fromBookingNode } from "./booking-converter.js";
import {
  bookingGuestsFields,
  bookingQueryFields,
  PRICE_BREAKDOWN_FIELDS,
  type BookingNode,
} from "./booking-queries.js";

/** The envelope key the webhook delivery wraps the booking node under. */
const PAYLOAD_BOOKING_KEY = "booking";

/** The `value` sub-field that anchors the price-breakdown injection. */
const VALUE_OPEN_TOKEN = "value {";

/**
 * Price-breakdown field names that only appear on `value` when the breakdown was
 * requested — their presence is how {@link parseBookingWebhook} auto-detects it.
 */
const PRICE_BREAKDOWN_KEYS = [
  "convenienceFee",
  "deposit",
  "discount",
  "discountedPrice",
  "fees",
  "flatPartnerFee",
  "price",
  "retailPrice",
  "taxes",
] as const;

/**
 * The canonical GraphQL selection set to register with the booking webhook — the
 * value that goes in the external `output_fields_gql_query` config.
 *
 * It is the **maximal** selection (guests + full price breakdown included), so a
 * single registration captures everything and {@link parseBookingWebhook}
 * auto-detects whatever the payload actually carries. It is the bare selection
 * set (`{ … }`), not a wrapped `query`, because the webhook system supplies the
 * operation around it; whitespace is collapsed so it drops into a JSON config
 * string.
 *
 * Internal: the webhook is configured in an external system, so this is a
 * setup-time artifact (see `docs/webhooks.md`), not a runtime API. A drift-guard
 * test snapshots it so the documented string can't silently rot.
 */
export const BOOKING_WEBHOOK_GQL_QUERY = buildMaximalWebhookQuery();

function buildMaximalWebhookQuery(): string {
  const fields = bookingQueryFields.replace(
    VALUE_OPEN_TOKEN,
    `${VALUE_OPEN_TOKEN} ${PRICE_BREAKDOWN_FIELDS}`,
  );
  return `{ ${fields} ${bookingGuestsFields} }`.replace(/\s+/g, " ").trim();
}

/**
 * Parses a delivered booking webhook payload into a clean {@link Booking}.
 *
 * Accepts the raw request body — either the `{ booking: … }` envelope or a bare
 * booking node, and a JSON string is parsed first. Which optional field groups
 * are present is auto-detected from the payload, so there is nothing to keep in
 * sync with the registered query.
 */
export function parseBookingWebhook(payload: unknown): Booking {
  const node = extractBookingNode(payload);
  return fromBookingNode(node, hasGuests(node), hasPriceBreakdown(node));
}

/** Narrows the raw request body down to the booking node, tolerating both shapes. */
function extractBookingNode(payload: unknown): BookingNode {
  let body: unknown = payload;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return {};
    }
  }
  if (!body || typeof body !== "object") return {};
  const record = body as Record<string, unknown>;
  const inner = record[PAYLOAD_BOOKING_KEY];
  if (inner && typeof inner === "object") return inner as BookingNode;
  return record as BookingNode;
}

function hasGuests(node: BookingNode): boolean {
  return Array.isArray(node.bookingGuests);
}

function hasPriceBreakdown(node: BookingNode): boolean {
  const value = node.value;
  if (!value) return false;
  return PRICE_BREAKDOWN_KEYS.some((key) => key in value);
}
