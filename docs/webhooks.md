# Webhooks

A guide for wiring a receiver app up to Peek "backoffice" webhooks using
`@peektravel/app-utilities`. Three webhook types are supported today —
**booking**, **waiver**, and **install-status** — and each has a helper that
turns the delivered payload into a clean data model. They differ in one important
way: a booking webhook is configured with a GraphQL query (so the package
documents the exact query to register), a waiver webhook has a fixed payload (so
there's nothing to register beyond subscribing to the event), and an
install-status webhook delivers a **signed token** (so the helper *verifies* it
rather than just parsing it).

| Webhook | Register | Handle the delivery |
| --- | --- | --- |
| Booking | paste a GraphQL query into the external config (below) | `parseBookingWebhook(body)` → `Booking` |
| Waiver | subscribe to the event — **no query needed** | `parseWaiverWebhook(body)` → `Waiver` |
| Install-status | subscribe to the event — **no query needed** | `verifyInstallWebhook(token, secret)` → `InstallWebhookClaims` |

The booking and waiver parsers are pure transforms — no auth, no network,
construct nothing; **authenticating those deliveries is the receiver's job**. The
install-status webhook is different: its payload *is* a signed JWT, so
`verifyInstallWebhook` checks the signature for you.

# Booking webhooks

## The problem this solves

A Peek booking webhook is unusual: its payload shape is **not fixed**. The
webhook is configured with a GraphQL field selection (`output_fields_gql_query`);
each time it fires, the gateway runs that selection against the booking and POSTs
the result to your receiver. So two things must agree — the registered selection
and the code that parses the payload.

That registration is done **once, in an external system** (the Peek App Store
`broadcast_to_url` config / your app's `app.json`), not from your application
code. So the two halves split cleanly:

| Half | Where it lives | This package provides |
| --- | --- | --- |
| Register the query | external config, set once | the canonical query string to paste (below) |
| Parse the delivery | your receiver's code | `parseBookingWebhook(body)` → a clean `Booking` |

The query string below and the parser are derived from the **same** field
selection this package uses for booking reads, and a test pins the string, so the
two can't silently drift.

## Step 1 — register this query (external, one-time)

Paste the following into the webhook's `output_fields_gql_query` field (with
`output_format: "gql"`). It is the **maximal** selection — it includes guests and
the full price breakdown, so one registration captures everything; the parser
auto-detects whatever a given payload carries.

```
{ displayId id primaryGuest { name email phone optinMarketing optinSms isGdpr postalCode } activitySnapshot { type name id } ticketQuantities { quantity resourceOptionSnapshot { name id } } reservationStatus checkinStatus returnStatus fulfillmentStatusOverride { status } timeSnapshot { id legacyId } purchasedAt purchasedAtUtc startsAt startsAtUtc endsAt endsAtUtc availabilityTimeId bookingPortalUrl operatorNotes value { convenienceFee { amount formatted } deposit { amount formatted } discount { amount formatted } discountedPrice { amount formatted } fees { amount formatted } flatPartnerFee { amount formatted } price { amount formatted } retailPrice { amount formatted } taxes { amount formatted } tips { amount formatted } total { formatted amount } } balance { total { amount formatted } } tips { price { amount formatted } } order { displayId id promoCodes { code } channelSnapshot { id name agent { name } } initialQuote { source { actor { app name } } } } questionAnswers { answer questionText questionLocationSnapshot { latitude longitude } } tickets { questionAnswers { answer questionText } } resourcePoolAssignments { quantity resourcePool { name shortName resources { name } } resourceAssignments { resource { id name } } } bookingGuests { id name country dateOfBirth email isGdpr isParticipant optinSms optinMarketing phone postalCode fieldResponses { id text fieldLocation { field { name } } } } primaryGuest { id name country dateOfBirth email isGdpr isParticipant optinSms optinMarketing phone postalCode fieldResponses { id text fieldLocation { field { name } } } } }
```

> This package owns this string internally and snapshots it in
> `test/bookings/booking-webhook.test.ts`. If the booking fields ever change, the
> test fails here first — update the test snapshot, this doc, and the external
> config together.

## Step 2 — parse the delivered webhook into a `Booking`

This is the only part that lives in your code. Hand the raw request body to
`parseBookingWebhook`; it returns the same clean
[`Booking`](../README.md#resources) model the read services return.

```ts
import { parseBookingWebhook, type Booking } from "@peektravel/app-utilities";

app.post("/booking-webhook", (req, res) => {
  const booking: Booking = parseBookingWebhook(req.body);
  // booking.bookingId, booking.customerName, booking.startsAt, booking.isCanceled, …
  res.sendStatus(200);
});
```

`parseBookingWebhook`:

- **Needs no auth, network, or `PeekAccessService`** — it is a pure transform.
  Construct nothing; just call it. (This is why it's a standalone function, not a
  method on the access service, and why the receiver needs no gateway
  credentials to parse.)
- **Tolerates the delivery envelope.** It accepts the `{ booking: … }` wrapper
  the webhook sends, a bare booking node, or a JSON string body.
- **Auto-detects** guests and the price breakdown from the payload, so there is
  nothing to keep in sync with the registered query — `booking.guests` and
  `booking.taxes`/`booking.fees`/… populate when present.
- **Never throws on malformed input** — a missing/garbled body yields a `Booking`
  with empty fields rather than an exception, so a bad delivery can't crash your
  handler.

## Notes

- The webhook fires on booking **create** and **update**; both deliver the same
  booking payload, and `parseBookingWebhook` handles them identically. It does
  not currently surface which event fired.
- Authenticating the delivery (verifying it really came from Peek) is the
  receiver's responsibility and out of scope for this parser.

# Waiver webhooks

A waiver webhook fires when a participant signs a liability agreement. Unlike the
booking webhook, its payload is **fixed** — Peek delivers a predefined shape (the
`waiver_webhook_data` output format), so there is **no GraphQL query to
register**.

## Step 1 — subscribe to the event (external, one-time)

Register the webhook for the `agreement_signature_created` event in the external
config. Leave `output_fields_gql_query` null; the `output_format` is
`waiver_webhook_data`. There is nothing query-shaped to paste.

## Step 2 — parse the delivered webhook into a `Waiver`

```ts
import { parseWaiverWebhook, type Waiver } from "@peektravel/app-utilities";

app.post("/waiver-webhook", (req, res) => {
  // PII (guestName, fileUrl) is redacted unless you opt in:
  const waiver: Waiver = parseWaiverWebhook(req.body, { fullCustomerAccess: true });
  // waiver.bookingId, waiver.templateId, waiver.fileUrl, waiver.signedAt,
  // waiver.guestName, waiver.isSignedByGuardian, …
  res.sendStatus(200);
});
```

`parseWaiverWebhook` mirrors the booking parser: a pure transform (no
auth/network/`PeekAccessService`), it tolerates the `{ waiver: … }` envelope / a
bare node / a JSON string, maps the raw `snake_case` payload to the clean
camelCase [`Waiver`](#waiver-webhooks) model, and never throws on malformed input
(missing fields become `""` / `null` / `false`).

**PII:** `parseWaiverWebhook(body, options?)` takes the same `AccessOptions` as
the access services. By **default** (`fullCustomerAccess` unset/`false`) the participant
`guestName` and the signed-document `fileUrl` are redacted (`null`/`""`); pass
`{ fullCustomerAccess: true }` to keep them. The booking parser
`parseBookingWebhook(body)` is unaffected — a booking webhook carries whatever
its registered selection includes.

The resulting `Waiver` is flat:

| Field | Type | From |
| --- | --- | --- |
| `templateId` | `string` | `agreement_template_id` |
| `bookingId` | `string` | `booking_id` |
| `fileUrl` | `string` | `file_url` |
| `signedAt` | `string` | `signed_at` (ISO) |
| `isSignedByGuardian` | `boolean` | `signed_by_guardian` |
| `guestName` | `string \| null` | `waiver_data.participant_name` |
| `isOptinMarketing` | `boolean` | `waiver_data.participant_optin_marketing` |
| `isOptinSms` | `boolean` | `waiver_data.participant_optin_sms` |

Authenticating the delivery is the receiver's responsibility, as with bookings.

# Install-status webhooks

## The problem this solves

Peek's app registry notifies your app of install lifecycle changes — installed,
uninstalled, status changed — by POSTing a **signed `app_registry_v2` JWT**.
Unlike a booking or waiver webhook, the whole payload *is* the token, so
verifying its signature is the point: it proves the notification really came from
Peek before your app acts on it (for example, de-provisioning an uninstall).
Hand-rolling that check (issuer, audience, expiry, HMAC) is exactly the
security-critical boilerplate `verifyInstallWebhook` removes.

## Step 1 — subscribe to the event (external, one-time)

Nothing to register in code: subscribe your endpoint to the install-status event
in the App Store config. There is no GraphQL selection to paste.

## Step 2 — verify the delivered token

Extract the JWT from the delivery (the request body, or the `Authorization`
header with the `Bearer ` prefix stripped) and pass it — plus your app's signing
secret (the same `jwtSecret` you construct `PeekAccessService` with) — to
`verifyInstallWebhook`:

```ts
import { verifyInstallWebhook, type InstallWebhookClaims } from "@peektravel/app-utilities";

app.post("/webhooks/install", (req, res) => {
  let claims: InstallWebhookClaims;
  try {
    claims = verifyInstallWebhook(req.body /* raw JWT string */, process.env.PEEK_INTERNAL_SECRET!);
  } catch {
    return res.sendStatus(401); // signature/issuer/audience/expiry failed
  }

  if (claims.status === "uninstalled") {
    // tear down this install's resources
  }
  res.sendStatus(200);
});
```

`verifyInstallWebhook` validates the HMAC signature, the token expiry, the
`"app_registry_v2"` issuer, and the `"Joken"` audience — the same checks as
[`PeekAccessService.verifyPeekAuthToken`](../README.md#access-options--pii) — then
maps the payload to the clean `InstallWebhookClaims`. It throws the underlying
`jsonwebtoken` error (`JsonWebTokenError` / `TokenExpiredError` /
`NotBeforeError`) on any verification failure, so a single `try/catch` → `401`
covers every bad-token case.

The signature checks are strict (they are the security boundary); claim
*extraction* is defensive, so a validly-signed token that omits an optional field
yields an empty value rather than throwing. The resulting `InstallWebhookClaims`:

| Field | Type | From | Notes |
| --- | --- | --- | --- |
| `installId` | `string` | `sub` | Peek-assigned install UUID |
| `account.id` | `string` | `account.id` | account that owns the install |
| `status` | `string` | `status` | e.g. `"installed"`, `"uninstalled"` |
| `displayVersion` | `string` | `display_version` | `""` when absent |
| `user` | `PeekAuthTokenUser \| null` | `user` | `null` for system-initiated events |

Unlike `verifyPeekAuthToken`, `user` is nullable: install lifecycle events are
often system-initiated (no acting user), so the verifier tolerates `user: null`.
