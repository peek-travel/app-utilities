/**
 * Public webhook surface for waivers.
 *
 * Unlike bookings, a waiver webhook needs **no GraphQL registration query** —
 * Peek delivers a fixed payload (the App Store `waiver_webhook_data` output
 * format, with `output_fields_gql_query` left null), so there is nothing to
 * register beyond subscribing to the `agreement_signature_created` event. The
 * package's only job is to parse the delivered payload into a clean
 * {@link Waiver}.
 *
 * Like the booking parser, this is a pure transform — no auth, no network, no
 * client — so it is a standalone function rather than a method on
 * `PeekAccessService` (the receiver may not hold gateway credentials).
 */
import type { Waiver } from "../../models/waiver.js";

/** The envelope key the webhook delivery wraps the waiver node under. */
const PAYLOAD_WAIVER_KEY = "waiver";

/** Raw, snake_case waiver payload as delivered by the webhook. Internal. */
interface WaiverNode {
  agreement_template_id?: string;
  booking_id?: string;
  file_url?: string;
  signed_at?: string;
  signed_by_guardian?: boolean;
  waiver_data?: {
    participant_name?: string | null;
    participant_optin_marketing?: boolean;
    participant_optin_sms?: boolean;
  } | null;
}

/**
 * Parses a delivered waiver webhook payload into a clean {@link Waiver}.
 *
 * Accepts the raw request body — either the `{ waiver: … }` envelope or a bare
 * waiver node, and a JSON string is parsed first. Never throws on malformed
 * input: a missing/garbled body yields a {@link Waiver} with empty fields.
 */
export function parseWaiverWebhook(payload: unknown): Waiver {
  return fromWaiverNode(extractWaiverNode(payload));
}

/** Pure mapping of a raw waiver node into the clean {@link Waiver} model. */
export function fromWaiverNode(node: WaiverNode | null | undefined): Waiver {
  const data = node ?? {};
  const waiverData = data.waiver_data ?? {};
  return {
    templateId: data.agreement_template_id || "",
    bookingId: data.booking_id || "",
    fileUrl: data.file_url || "",
    signedAt: data.signed_at || "",
    isSignedByGuardian: Boolean(data.signed_by_guardian),
    guestName: waiverData.participant_name || null,
    isOptinMarketing: Boolean(waiverData.participant_optin_marketing),
    isOptinSms: Boolean(waiverData.participant_optin_sms),
  };
}

/** Narrows the raw request body down to the waiver node, tolerating both shapes. */
function extractWaiverNode(payload: unknown): WaiverNode {
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
  const inner = record[PAYLOAD_WAIVER_KEY];
  if (inner && typeof inner === "object") return inner as WaiverNode;
  return record as WaiverNode;
}
