# Webhooks

A guide for wiring a receiver app up to Peek "backoffice" webhooks using
`@peektravel/app-utilities`. Three webhook types are supported today —
**booking**, **waiver**, and **install** — and each has a helper that turns the
delivered payload into a clean data model. They differ in one important way: a
booking webhook is configured with a GraphQL query (so the package documents the
exact query to register), a waiver webhook has a fixed payload (so there's nothing
to register beyond subscribing to the event), and an install webhook delivers a
**signed token alongside a JSON body** (so the helper *verifies* the token before
merging the two).

| Webhook | Register | Handle the delivery |
| --- | --- | --- |
| Booking | paste a GraphQL query into the external config (below) | `parseBookingWebhook(body)` → `Booking` |
| Waiver | subscribe to the event — **no query needed** | `parseWaiverWebhook(body)` → `Waiver` |
| Install | subscribe to the event — **no query needed** | `parseInstallWebhook(token, body, secret)` → `InstallWebhook` |

The booking and waiver parsers are pure transforms — no auth, no network,
construct nothing; **authenticating those deliveries is the receiver's job**. The
install webhook is different: it carries a signed JWT, so `parseInstallWebhook`
checks the signature for you before returning the merged event.

**The install webhook delivers two payloads at once.** A signed
`app_registry_v2` JWT authenticates the notification; a plain JSON body alongside
it carries the **event data** — the full account block (name, platform,
timezone, test flag), the per-install `api.url`, the acting user, and the install
id / status / version. `parseInstallWebhook` verifies the token and reads the
event from the body — falling back to the token for the fields it also carries —
merging both into one flat `InstallWebhook`, so you make a single call.

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

# Install webhooks

## The problem this solves

Peek's app registry notifies your app of install lifecycle changes — installed,
uninstalled, updated — with a single POST that carries **two payloads at once**:
a **signed `app_registry_v2` JWT** and a plain **JSON body**.

- The **JWT** is the security boundary. Verifying its signature proves the
  notification really came from Peek before your app acts on it (for example,
  de-provisioning an uninstall) — it authenticates the whole delivery, body
  included.
- The **JSON body** is the event payload. It carries the full account block
  (name, platform, timezone, test flag), the per-install `api.url`, the acting
  user, and the install id / status / version.

This webhook is also where an app first learns **who the install belongs to** —
and the only place it ever learns it: no GraphQL read returns the account id, so
whatever you persist from this delivery is all you will ever have.

`parseInstallWebhook(token, body, secret)` verifies the token (issuer, audience,
expiry, HMAC — the security-critical boilerplate you'd otherwise hand-roll) and
reads the event from the body, **falling back to the token** for the fields it
also carries (`installId`, `accountId`, `status`, `displayVersion`, `user`),
returning one flat, JSON-safe `InstallWebhook` you store as a unit.

## Step 1 — subscribe to the event (external, one-time)

Nothing to register in code: subscribe your endpoint to the install event in the
App Store config. There is no GraphQL selection to paste.

## Step 2 — verify and parse the delivery

Peek delivers the signed token in the **`x-peek-auth` request header**. Pass that
header value as-is, along with the JSON body and your app's signing secret (the
same `jwtSecret` you construct `PeekAccessService` with — conventionally
`PEEK_INTERNAL_SECRET`), to `parseInstallWebhook`. You do **not** need to strip a
`Bearer ` prefix: `parseInstallWebhook` tolerates the header value with or
without it.

```ts
import { parseInstallWebhook, type InstallWebhook } from "@peektravel/app-utilities";

app.post("/webhooks/install", async (req, res) => {
  let event: InstallWebhook;
  try {
    // `x-peek-auth` carries the token (a `Bearer ` prefix, if any, is stripped for you):
    const token = req.header("x-peek-auth") ?? "";
    event = parseInstallWebhook(token, req.body, process.env.PEEK_INTERNAL_SECRET!);
  } catch {
    return res.sendStatus(401); // signature/issuer/audience/expiry failed
  }

  switch (event.status) {
    case "installed":
      await provision(event);
      break;
    case "uninstalled":
      await deprovision(event);
      break;
    case "update_installed":
      await recordVersion(event);
      break;
    default:
      // Peek sent a status this package version does not know. Fail loudly —
      // a 2xx here is a silently dropped lifecycle transition.
      return res.status(500).json({ error: `unknown status: ${event.rawStatus}` });
  }

  res.sendStatus(200);
});
```

`parseInstallWebhook` validates the HMAC signature, the token expiry, the
`"app_registry_v2"` issuer, and the `"Joken"` audience — the same checks as
[`PeekAccessService.verifyPeekAuthToken`](../README.md#access-options--pii). It
throws the underlying `jsonwebtoken` error (`JsonWebTokenError` /
`TokenExpiredError` / `NotBeforeError`) on any verification failure, so a single
`try/catch` → `401` covers every bad-token case. The signature checks are strict
(they are the security boundary); claim *extraction* is defensive, so a
validly-signed token or a missing/garbled body yields empty fields rather than
throwing.

The resulting `InstallWebhook` is flat:

| Field | Type | Source | From | Notes |
| --- | --- | --- | --- | --- |
| `installId` | `string` | body → token | `install_id` / `sub` | Peek-assigned install UUID |
| `accountId` | `string` | body → token | `account.id` | **also called the partner ID** |
| `accountName` | `string` | body | `account.name` | partner display name; `""` when absent |
| `platform` | `PeekPlatform \| null` | body | `account.platform` | **persist per install** — see below; `null` when unrecognised |
| `isTest` | `boolean` | body | `account.is_test` | defaults to `false` |
| `timezone` | `string` | body | `account.timezone` | IANA zone (e.g. `America/New_York`); **persist per install**; `""` when absent |
| `apiUrl` | `string` | body | `api.url` | per-install backoffice API base URL; **persist per install**; `""` when absent |
| `status` | `InstallStatus \| null` | body → token | `status` | `null` when unrecognised — see below |
| `rawStatus` | `string` | body → token | `status` | always the wire value, for logging |
| `displayVersion` | `string` | body → token | `display_version` | `""` when absent |
| `user` | `PeekAuthTokenUser \| null` | body → token | `modified_by` / `user` | `null` for system-initiated events |

The **JSON body is the source of the event data**; the fields it shares with the
token (`installId`, `accountId`, `status`, `displayVersion`, `user`) fall back to
the **verified token** when the body omits them. The token authenticates the
whole delivery — only Peek can mint a valid one — so the body is trusted within a
verified request. Unlike `verifyPeekAuthToken`, `user` is nullable: install
lifecycle events are often system-initiated (no acting user), so the parser
tolerates a missing `modified_by`/`user`.

> **Migrating from `verifyInstallWebhook` / `parseInstallEvent`?**
> `verifyInstallWebhook(token, secret)` still works but is `@deprecated` — it
> reads only the token, so it can't report the account name/platform/test flag.
> `parseInstallEvent(body)` has been **removed**. Replace both with
> `parseInstallWebhook(token, body, secret)`; the return is now flat, so read
> `event.accountId` directly instead of `event.identity.accountId` or
> `claims.account.id`.

## Persist `platform` per install

`event.platform` is not cosmetic. It decides which APIs the install is served by,
and therefore which access service you construct for it:

| `platform` | Access service | Gateway |
| --- | --- | --- |
| `"peek"` | `PeekAccessService` | Peek backoffice GraphQL |
| `"cng"` | `CngAccessService` | CNG backoffice REST |
| `"acme"` | `AcmeAccessService` | ACME backoffice REST |

Two installs of the same app can sit on different platforms, so this cannot be
inferred from app-level config — it is per install, it has no source other than
this event, and it must be stored alongside `installId` and `accountId`.

## Also persist `timezone` and `apiUrl` per install

Like `platform`, these are per-install facts with **no source other than this
event**, so persist them alongside `installId`/`accountId`:

- **`timezone`** — the account's IANA zone (e.g. `America/New_York`). Downstream
  date/time handling for the install (scheduling, day boundaries, display) needs
  the account's own zone, not the server's.
- **`apiUrl`** — the per-install backoffice API base URL Peek serves this
  install from. Store it so later calls target the correct gateway URL.

Both default to `""` when a delivery omits them, so treat empty as "not
reported" and keep any value you previously stored.

## Why `status` and `platform` can be `null`

`parseInstallWebhook` never throws on the *body* (only token verification can
throw). The sender is first-party and the payload contract is Peek's own, so a
malformed body is not the failure worth designing for. The failure that *is* real
is the contract **growing** — a new status, or a fourth platform.

Both are therefore reported as `null` rather than coerced into a known value,
with the wire value preserved on `rawStatus`. Coercing would be actively
dangerous: Peek treats any 2xx as delivered and does not redeliver, so quietly
mapping an unknown status onto a no-op loses a lifecycle transition permanently,
and defaulting an unknown platform would point that install at the wrong gateway.
Give both a `default:` branch that fails loudly.
