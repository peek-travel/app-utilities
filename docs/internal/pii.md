# Access options / PII — `fullCustomerAccess`

> Part of the [`@peektravel/app-utilities` architecture overview](./ARCHITECTURE.md).

`src/access-options.ts`

Every access service (`PeekAccessService`, `CngAccessService`, `AcmeAccessService`)
accepts an optional `accessOptions` config object — the public `AccessOptions`
type. Today it carries one flag, `fullCustomerAccess` (default `false`); it is an object
rather than a bare boolean so future cross-cutting flags slot in without changing
any downstream signatures. Each access service resolves it once
(`resolveAccessOptions`, which fills defaults) and threads the resolved value
into the resource services that read customer data.

When `fullCustomerAccess` is `false` (the default), two things happen:

1. **PII is never requested (filtered at the GraphQL layer, not in the
   converters).** The query *builders* omit the PII fields entirely, so the
   gateway never returns them and the pure converters map the now-absent fields
   to `null`/empty — the converters stay PII-agnostic. Affected:
   - **Bookings** (`booking-queries.ts`): `buildBookingQueryFields` /
     `buildBookingGuestsFields` / `buildBookingGuestsQuery` /
     `buildBookingsListingQuery` drop the primary-guest block
     (`customerName`/`email`/`phone`), the guest identity fields
     (name/country/DOB/email/phone/postalCode/`isGdpr`/`fieldResponses` — the
     guest list keeps only ids + participation/opt-in flags), the custom
     question answers (booking- and ticket-level), and the customer
     `bookingPortalUrl`. Operator-facing fields (notes, the operator custom
     status, the Peek Pro deep link, money, resources) always stay. The
     booking-metadata query (`metadata-queries.ts`, behind `getMetaData`) gates
     the `GuestFieldResponseValue` identity fields the same way — `name`/`email`/
     `dateOfBirth` are only selected with `fullCustomerAccess`; `notes`/`waiverSigned`
     always stay.
   - **Reviews** (`buildReviewsQuery`): drops the reviewer `name`/`email`; the
     review `comment`, rating, dates, and credited guides always stay.
   - **Waivers** (`parseWaiverWebhook`): the webhook delivers a *fixed* payload
     with no GraphQL selection to trim, so this is the one place filtering is
     applied at parse time — the participant `guestName` and the signed-document
     `fileUrl` are nulled. `parseWaiverWebhook(body, options?)` takes the same
     `AccessOptions`; `fromWaiverNode` stays a pure full mapping.

2. **Payment / booking-modification operations are disabled.** `BookingService`
   gates the operations that touch customer financial data —
   `getPaymentsOnFile`, `makePayment`, `refund`, `createInvoiceLink`,
   `addAddon`, `removeAddon` — throwing `PiiAccessDisabledError` (an exported
   typed error) before any network call. Non-payment reads/mutations
   (`getById`, `getGuests`, `cancel`, `appendNote`, `setCheckinStatus`,
   `updateCustomStatus`) and `create` (**including `markAsPaid`**) remain
   available.

The webhook **registration** query (`BOOKING_WEBHOOK_GQL_QUERY`) is deliberately
unaffected — it is the maximal selection built from the full field fragments and
pinned by the drift-guard test; `fullCustomerAccess` governs only the runtime read path.
