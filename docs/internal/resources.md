# Per-resource services

> Part of the [`@peektravel/app-utilities` architecture overview](./ARCHITECTURE.md).

`src/internal/peek/<resource>/`

Every Peek resource lives under `src/internal/peek/` (mirrored by the CNG
resources under `src/internal/cng/` — see [the CNG accessor](./rest-accessors.md)); the shared plumbing
(`token-manager.ts`, `http-transport.ts`) stays at `src/internal/`.

Each resource follows the same **three-file triad**:

| File | Role |
| --- | --- |
| `*-queries.ts` | Raw GraphQL query/mutation strings, the matching response interfaces, and small variable-builder/normalizer helpers. **Internal only** — never re-exported. |
| `*-converter.ts` | Pure, I/O-free functions mapping raw GraphQL nodes → clean models. Easy to unit-test. |
| `*-service.ts` | Public class holding the business logic; calls the shared client, then runs the converter. |

Resources: `products`, `custom-questions`, `account-users`, `resource-pools`,
`timeslots`, `resellers`, `promo-codes`, `pricing`, `daily-notes`,
`availability`, `memberships`, `bookings`, `reviews`, `seatmaps`. Clean data
shapes are split by brand: Peek models in `src/models/peek/`, CNG models in
`src/models/cng/`.

Seating maps are their own resource triad under `src/internal/peek/seatmaps/` —
`seatmap-queries.ts` (query string and raw nodes, internal), the pure
`seatmap-converter.ts`, and `SeatmapService`. `getSeatmapForProduct(productId)`
returns every `Seatmap` configured on an activity (`Seatmap[]`, empty when the
activity is missing or has none); it is unaffected by `fullCustomerAccess`
(seating maps are structural layout, not customer data). A map carries `zones`
(pricing tiers, each with a nullable `colorHex` and mapping to
`SeatmapTicket[]`) and a tree of
`SeatmapSection` → `SeatmapGroup` (tables) → `SeatmapBlock` (seats). All three
rendered levels share one `SeatmapDisplay` geometry type: only `x`/`y` are
always present, and every other field (`width`/`height`/`label`/`type` on
sections; `table`/`tableWidth`/`tableHeight` on groups) collapses to `null`
where the gateway does not select it. `SeatmapDisplay.type` is narrowed to
`SeatmapDisplayType` (`"SHAPE" | "SECTION" | "LABEL"`); a non-null value outside
that set makes the converter throw the exported `UnknownSeatmapDisplayTypeError`
rather than silently widen the model.

`getSeatmapIdsForProduct(productId)` is the lightweight sibling of
`getSeatmapForProduct`: a trimmed query selecting only each map's `id`/`name`
(no zones/sections/groups/blocks), mapped by the pure `fromSeatmapSummaryNodes`
to `SeatmapSummary[]` (empty when the activity is missing or has none). Same
validation and non-PII posture as the full read; use it when a caller only needs
to list the maps assigned to a product. `SeatmapSummary` is exported from
`src/index.ts`.

`getSeatMapAssignments(productId, rangeStart, rangeEnd)` reads a product's maps
through the same `activity(id).seatingMaps` entry as the plain read (the gateway
has no top-level `seatingMap(id)`), with every seat enriched by its occupancy
over a datetime range, returning `AssignedSeatmap[]` (empty when the activity is
missing or has no maps). The query selects the same structural fields as the
plain read plus each seat's `availability(datetimeRange)`; the
assignment-enriched tree is
modeled by interface inheritance — `AssignedSeatmap`/`AssignedSeatmapSection`/
`AssignedSeatmapGroup`/`AssignedSeatmapBlock` each `extends` its base and narrows
the child collection, and `AssignedSeatmapBlock` adds `status`
(`SeatmapBlockStatus`) and `assignedTo` (`SeatmapAssignment[]`). An occupant's
kind (`SeatmapOccupantType`) is derived from the assignment parent's
`__typename` (`Ticket`→GUEST, `AccountUser`→ACCOUNT_USER,
`FieldLocation`→FIELD_LOCATION; `BlockedSeat` is not an occupant and drops out);
an unknown status or parent throws `UnknownSeatmapBlockStatusError` /
`UnknownSeatmapAssignmentParentError`. `rangeStart`/`rangeEnd` are normalized in
the service to the gateway's naive `YYYY-MM-DDTHH:MM:SS` form (seconds added when
omitted, timezone and fractional seconds stripped, components range-checked) and
sent as a half-open `[start,end)` range; the two bounds must fall on the same
date (the service throws otherwise). A guest's name is **customer PII**:
`SeatmapService` resolves `fullCustomerAccess` (threaded from `PeekAccessService`
like `BookingService`/`ReviewService`) and the query omits `primaryGuest` when it
is off, so a GUEST occupant's `guestName` is `null`; staff (`AccountUser`) names
are not gated. The plain `getSeatmapForProduct` read is unaffected — it returns
the base `SeatmapBlock` without `status`/`assignedTo`.

`assignableBookings(productId, rangeStart, rangeEnd)` reads the confirmed
bookings on a product that overlap a range (via `bookings(filter: { activityIds,
overlapsRange, reservationStatuses: [CONFIRMED] })`), returning
`AssignableBooking[]` — each with `assignableTickets` (`AssignableTicket`, keyed
by the ticket `hashid` as `assignableId`) and, per ticket, the seat it currently
holds (`CurrentSeatAssignment`, `null` when unassigned — the assignable case).
Range bounds are parsed and validated by the same shared `buildNaiveRange`
helper as `getSeatMapAssignments` (normalize both bounds, enforce same date,
emit the half-open `[start,end)` literal) and booking `startsAt`/`endsAt` have
fractional seconds stripped. `notes` carries the operator-facing booking notes
(`operatorNotes`, empty string when none — always selected, not PII-gated).
`guestName` is the same PII-gated primary-guest name. The query and converter
live in the seatmaps triad alongside the
seatmap-read code and reuse its `stripFractionalSeconds`/`joinGuestName` helpers;
the models (`AssignableBooking`, `AssignableTicket`, `CurrentSeatAssignment`) are
named to avoid colliding with the existing `Booking`/`Ticket` models.

`assignTicketsToSeats(assignments)` is the one seatmap **write**: it batches one
aliased `assignBlocks` call per {@link SeatmapBlockAssignment} into a single
mutation (the query module builds the aliases, variable declarations, and
variables; `assignBlocksAlias` keeps the service/converter in sync). The service
validates up front — non-empty list, each `assignableId` prefixed `t_`, each
`blockId` prefixed `csb_` — throwing before any network call. The converter
(`toAssignmentResponse`) classifies each aliased result: a `__typename` of
`AssignmentResponse` is a success, every other union member (the
`AssignBlocksError*` types, or a missing result) is a per-assignment failure,
yielding `SUCCESS`/`FAILED`/`PARTIAL`. Successes are returned as
`SuccessfulAssignment` pairs — the requested `assignableId` (read back from the
result's `parent.Ticket.hashid`, falling back to the input) and the created
`assignmentId` (the `asa_…` from `assignments[].id`); failures list the
`assignableId`. Per-assignment errors are reported in the `AssignmentResponse`,
not thrown — only transport/GraphQL-level failures throw (via the shared client).

`deleteSeatAssignments(assignmentIds)` is the companion write: a single
`deleteAssignments(assignmentIds: [ID!]!)` mutation. The service validates up
front — non-empty list, each id prefixed `asa_` — then inspects the union result:
a `DeleteAssignmentsSuccess` maps (via `fromDeletedAssignments`) to the returned
`DeletedSeatAssignment[]` (the now-deleted assignments, for reloading state),
while any other member (e.g. `AssignBlocksErrorInvalidBlockCount`) throws the
exported `SeatmapDeleteError` carrying the gateway `message`.

`ProductService` exposes three top-level product filters in addition to the combined `getAllProducts()`:
- `getAllActivities()` — fetches only the `activities` connection (one request, no add-on pagination).
- `getAllAddons()` — fetches only the `itemOptions` connection, paginated.

Custom questions are their own resource triad under
`src/internal/peek/custom-questions/` — `custom-question-queries.ts` (query
strings and raw nodes, internal), the pure `custom-question-converter.ts`, and
`CustomQuestionService`. Both reads map to the shared `CustomQuestion[]` model
(each with `options: CustomQuestionOption[]` for choice-style questions), via the
`... on ChoiceQuestion` inline fragment; the converter maps `question.text` →
`questionText`, `hint` → `hintText`, and `answerDefaultValue` → `defaultValue`:

- `CustomQuestionService.getAll()` reads the **account-wide** `questions` catalog
  across all activities. The catalog carries no per-activity configuration, so
  `order` is `0` and `isRequired` is `false` on every entry; the converter entry
  point is `fromQuestionNodes`. Obtain the service via
  `PeekAccessService.getCustomQuestionService()`.
- `ProductService.getCustomQuestions(productId)` reuses the same queries/converter
  module for the **single-activity** read (the `activity(id)` →
  `questionActivityConfigurations` query), lifting `order`/`isRequired` from the
  configuration node via `fromQuestionConfigurations`. It throws on a blank
  `productId` before any network call and returns `[]` for an unknown activity.

These are **question definitions, not customer answers**, so they carry no PII
and are unaffected by `fullCustomerAccess`. `CustomQuestion`/`CustomQuestionOption`
are exported from `src/index.ts`.

`ProductService` also surfaces each activity's `currency` on the clean
`Product` (empty string for add-ons, which have none) — the field pricing
consumers need to set the currency on fixed-price overrides.

For catalog/listing consumers, each activity `Product` additionally carries
`imageUrl`, `description`, and a `meetingLocation` object
(`ProductMeetingLocation { summary, address, url }`). All are nullable: the
scalars are `string | null`, and `meetingLocation` itself is `null` when Peek
reports none of the three underlying fields (`infoMeetingLocation` → `summary`,
`meetingLocationFormattedAddress` → `address`, `meetingLocationUrl` → `url`).
Add-ons always report `null` for all three. `ProductMeetingLocation` is exported
from `src/index.ts` alongside `Product`/`ProductTicket`.

Each `Product.tickets[]` (a `ProductTicket`) additionally carries `minPrice`
and `maxPrice` (`PricingMoney | null`), mapped from the resourceOption's
`priceRange { min max }`. They are `null` for add-on options (no range) and
when Peek reports none. The shared, internal `toPricingMoney` helper
(`src/internal/peek/money.ts`) maps a raw gateway money node
(`{ amount, currency, formatted }`) into `PricingMoney`, carrying `formatted`
across as the optional `displayPrice` display string; both the products and
pricing converters reuse it so that mapping lives in one place.

`pricing` is a **write-only, primitives-only** triad
(`src/internal/peek/pricing/`, model `src/models/peek/pricing.ts`). It wraps the
four Peek pricing mutations — `createPricingEngine`, `updatePricingEngine`,
`deletePricingEngine`, and `upsertPricingOverridesActivityContexts` (used for
both upsert and clear) — behind `PricingService`
(`createEngine`/`updateEngine`/`deleteEngine`/`upsertOverrides`/`clearOverrides`).
It deliberately does **not** own the domain logic that decides *what* the
overrides are (segmenting an activity across time windows, ordering tiers,
computing `spotsTaken` bounds, sunrise/sunset resolution): callers build a clean
`UpsertOverridesInput` and the service sends it faithfully. The only transforms
it applies are strip-the-`mode`-tag on each resource-option override (clean
`{mode:"fixed",price}` / `{mode:"percentage",percentageAdjustment}` → the bare
`price` / `percentageAdjustment` wire key, in `pricing-queries.ts`) and, on the
response, the inverse plus filter-`__typename` normalization (in
`pricing-converter.ts`). `deleteEngine` is idempotent — a `NotFoundError`
resolves. Validation (engine/date-range presence, currency format, numeric
amounts, `percentageAdjustment > -100`) lives in the service. The consumer-facing
guide is `docs/external/pricing-api.md` — **keep it in sync** whenever this
surface changes.

`availability` is a full triad (`src/internal/peek/availability/`, model
`src/models/peek/availability-time.ts`): `AvailabilityService.getAvailabilityTimes`
reads `availabilityTimes` and `availability-converter.ts` maps each raw node to
an `AvailabilityTime`. Each slot carries a per-ticket `price`
(`Money | null`). `Money` (`src/models/peek/money.ts`, `{ amount, currency,
formatted }`) is the shared, public clean-money model reused across resources
(booking add-ons, availability prices); it is distinct from the pricing domain's
`PricingMoney` (which renames `formatted` → optional `displayPrice`). The
internal `toPricingMoney` helper and `PricingMoney` are unaffected.

`waivers` is a **webhook-only resource**: it has no GraphQL reads (so no
queries/service/converter triad), just `src/internal/peek/waivers/waiver-webhook.ts`
and the `src/models/peek/waiver.ts` model. See the webhook notes below.

A resource may split into more than one triad when it carries a distinct
sub-domain. `bookings` does: alongside `booking-queries`/`booking-converter`,
the add-on flows live in `addon-queries.ts` (the `sales` add-ons query + raw
node shapes) and `addon-converter.ts` (raw node → the internal `AddonItem`
detail model and the clean public `BookingAddon`).

`bookings` carries a third sub-domain for **custom-field metadata** —
`metadata-queries.ts` + `metadata-converter.ts`, surfaced by
`BookingService.getMetaData(bookingId)` → `MetaData[]` (`[]` when the booking is
not found or has no matching fields — the per-booking envelope was dropped in
favour of returning the entries directly). Its query is
a variant of the single-booking read: it reuses the shared `sales(...)` envelope
(`buildSalesQuery`, extracted in `booking-queries.ts` and now shared by the
listing/guests/payments/metadata readers) and the shared `buildBookingsVariables`
(filtering by `bookingFilter.ids`), selecting only the `fieldResponses` tree. The
clean model (`src/models/peek/booking-metadata.ts`) flattens each response's
field (id/name/slug/type), prompt (label/hint/required), and `refid`, and carries
one typed `value: MetaDataValue | null` — a **discriminated union keyed by
`kind`**, one variant per gateway `…FieldResponseValue` type. The pure converter
discriminates on the value's `__typename` (selected in the query); an
unrecognized/future variant maps to `null` (never coerced). Numeric `Int` → `number`,
`Decimal` → `string` (no float loss), `Date`/`Time` → ISO string. The parent
`MetaData` carries a `displayValue` — a display-safe human string the converter
renders per kind (booleans → `Yes`/`No`, amount+unit → `"3 hours"`, percent →
`"12.5%"`, location → comma-joined parts, meta → `JSON.stringify`, and the `html`
variant **HTML-escaped** via the local `escapeHtml`); it is always present, `""`
when the value is absent. `fromValueNode` returns the typed value paired with its
`displayValue`, which `fromFieldResponseNode` lifts onto the `MetaData`.
`MetaData`, `MetaDataValue`, and the unit/type aliases
(`MetaDataBarcodeType`/`MetaDataDurationUnit`/`MetaDataVolumeUnit`/`MetaDataWeightUnit`)
are exported from `src/index.ts`.

**Integrator scoping.** `getMetaData` returns only the fields whose `slug` starts
with `integrators:<integrator>:` (case-sensitive exact prefix), stripping that
prefix off each returned `slug` (pure `filterMetaDataByIntegrator`). The
integrator is **per `BookingService`**, supplied by
`PeekAccessService.getBookingService(integrator?)`; when omitted it defaults to
the install's `issuer`. The accessor memoizes one `BookingService` per resolved
integrator string (a `Map`), so the no-arg/default call and a `getBookingService(issuer)`
call share an instance. The consumer-facing docs deliberately describe the param
only as "do not set unless Peek engineering created a custom integrator id" and
do **not** reveal the issuer default.

**Writing metadata.** The `upsertBookingFieldResponses` mutation
(`metadata-queries.ts`) is surfaced through **eight fixed-`fieldName` setters** on
`BookingService` — `setMetaDataGuest`, `setMetaDataAttachment`,
`setMetaDataManifestUrl`, `setMetaDataReservationId`, `setMetaDataBookingStatus`,
`setMetaDataAssignedProduct`, `setMetaDataAssignedEmployee`,
`setMetaDataInsurancePurchased`. Each hard-codes its `fieldName` (the caller only
supplies the value) and funnels through one private `upsertFieldResponse` helper
that validates the booking id, injects the service `integrator`, and maps the
result union (`UpsertBookingFieldResponsesSuccess` / `BookingNotFoundError` /
`GenericError`, discriminated by `__typename`) into a clean `SetMetaDataResult`
(`{ success, bookingId, message }`) via the pure `toSetMetaDataResult` — the error
variants resolve to `success: false` rather than throwing. `guest` takes
`SetMetaDataGuestInput[]` (name/email required; DOB/waiver/notes optional) and
`attachment` takes `SetMetaDataAttachmentInput[]` (name/attachmentUrl required);
the other six take a single `string`/`boolean`. The setters are **not PII-gated**
(operator-facing writes of caller-supplied data). `SetMetaDataGuestInput`,
`SetMetaDataAttachmentInput`, and `SetMetaDataResult` are exported from
`src/index.ts`.

`bookings` also carries the webhook surface (`booking-webhook.ts`). A Peek
booking webhook's payload shape is defined by the GraphQL field selection
registered with it, so the registered query and the parser must stay in lockstep.
Crucially, that registration is done **once in an external system** (the App
Store `broadcast_to_url` config), not from consumer code — so the package
registers nothing at runtime, and the two halves split:

- **The query is a setup-time artifact, not a runtime API.**
  `BOOKING_WEBHOOK_GQL_QUERY` is the single maximal selection set (guests + full
  price breakdown always included) built from the same field fragments the read
  path uses (`bookingQueryFields`, `bookingGuestsFields`, `PRICE_BREAKDOWN_FIELDS`,
  exported from `booking-queries` for reuse). It is the bare selection set (no
  `query`/`sales` wrapper — the webhook system supplies that; whitespace
  collapsed so it drops into a JSON config string). It is **internal** —
  surfaced for humans/AI through `docs/webhooks.md` and pinned by a drift-guard
  test that snapshots the exact string, so a field change is caught here before
  it diverges from the external config (e.g. the connector's `app.json`).
- **The parser is the only public runtime export.** The pure
  `parseBookingWebhook(body)` unwraps the `{booking:…}` delivery envelope (or a
  bare node / JSON string) and runs the existing `fromBookingNode` converter,
  auto-detecting guests/price-breakdown from the payload (nothing to keep in sync
  with the registered query) and never throwing on malformed input. Parsing needs
  no auth, network, or client, so it is a **standalone function, not a method on
  `PeekAccessService`** (a receiver may not hold gateway credentials).

The **waiver** webhook (`waivers/waiver-webhook.ts`) is the simpler sibling and
deliberately diverges from the booking shape because the upstream webhook does
too: it has **no GraphQL query** (the App Store `waiver_webhook_data` output
format ships a fixed payload, `output_fields_gql_query` is null), so there is no
query constant and no drift-guard — only a parser. `parseWaiverWebhook(body)`
unwraps the `{waiver:…}` envelope (or a bare node / JSON string) and runs the
pure `fromWaiverNode` converter, which maps the fixed `snake_case` payload to the
flat clean `Waiver` model (defaulting missing fields to `""`/`null`/`false`, so
it never throws). Same standalone-pure-function rationale as bookings. Because
there are no reads, `waivers` carries no queries/service triad — just the
webhook module and the model.

The **install** webhook (`installs/install-webhook.ts` + `install-converter.ts`)
is the third and most distinct. A single delivery carries **two payloads at
once**: a **signed `app_registry_v2` JWT** (the security boundary, delivered in
the `x-peek-auth` request header) and a plain **JSON body** (the event payload).
`parseInstallWebhook(token, body, secret)` *verifies* the token (signature +
expiry + issuer + `Joken` audience, via the shared `peek-auth-token.ts` core) and
merges both into one flat `InstallWebhook` (`src/models/peek/install.ts`). The
`token` argument accepts the raw header value — the shared `verifyPeekJwt` core
strips a leading `Bearer ` scheme prefix (case-insensitive) before verification
(see [the access service](./access-and-auth.md) / `peek-auth-token.ts`), so no token entry point makes the caller unwrap
it. Standalone-function rationale as above, with an
extra reason: the receiver has no per-install service to inherit a secret from
yet (the webhook can precede the first session or describe a tear-down), so the
app secret is passed directly. `installs` carries no queries/service triad — just
the parser, the pure `install-converter.ts` helpers (`extractInstallWebhookBody`,
`toInstallStatus`, `toPeekPlatform`), and the model.

`verifyInstallWebhook(token, secret)` (returning `InstallWebhookClaims` in the
shared `auth-token.ts` model) is retained but **`@deprecated`**: it reads only the
signed token, so it cannot report the account **name**, **platform**, **test**
flag, **timezone**, or **apiUrl** that live in the JSON body. It exists solely for
backwards compatibility; new callers use `parseInstallWebhook`.

Three design rules hold this together and are load-bearing:

- **`installId` comes only from the token `sub`.** The body `install_id` never
  sets it; it is only compared. A non-empty body `install_id` that is not equal to
  `sub` throws `InstallWebhookError` (`reason: "install_id_mismatch"`), and a
  verified token with no `sub` throws it with `reason: "missing_subject"`. The
  check lives in `resolveInstallId` in `install-webhook.ts`; the converter stays
  pure.
- **A delivered `apiUrl` must be a Peek-owned domain.** When the body carries a
  non-empty `apiUrl`, its host must be `peek.com` (production) or `peeklabs.com`
  (sandbox), or a subdomain of either, or `parseInstallWebhook` throws
  `InstallWebhookError` (`reason: "invalid_api_url"`) — a spoofed webhook must not
  be able to point the app's API calls at a foreign gateway. An absent `apiUrl`
  is not validated. The check (`assertAllowedApiUrl`, with the allow-list in
  `ALLOWED_API_URL_DOMAINS`) lives in `install-webhook.ts`; a scheme-less value is
  parsed as `https`, and the converter stays pure.
- **The JSON body is the source of the other event data; the JWT authenticates
  it and is the fallback.** `accountName`, `platform`, `isTest`, `timezone`,
  `apiUrl` are body-only, and `accountId`, `status`, `displayVersion`, `user`
  (from `modified_by`) fall back to the verified token when the body omits them.
  The install token does not reliably carry those four, so reading it first
  returned empty core fields — the body is where the data lives. The token does
  carry `sub`, and the registry sets the body `install_id` to the same value, so
  a real delivery passes the install-id check. `user` resolution is defensive on the body path (a
  `modified_by` without an `id` is treated as absent) but keeps the strict
  `mapPeekTokenUser` `id` check on the token path.
- **`InstallWebhook` is flat and JSON-safe.** The shape the parser returns is the
  shape a consumer persists and later rehydrates, so there is exactly one
  representation of "who this install is and what happened" and no mapping layer.
  Do not add methods, nested objects, or non-JSON types to it.
- **`status` and `platform` are nullable, and unknown values are never coerced.**
  The package does not defend against malformed input here (the sender is
  first-party); it defends against the contract *growing*. An unrecognised value
  maps to `null` with the wire value kept on `InstallWebhook.rawStatus`. Coercion
  would be unsafe: Peek treats any 2xx as delivered and does not redeliver, so a
  status quietly mapped onto a no-op loses a lifecycle transition permanently,
  and a defaulted platform points the install at the wrong gateway. When a new
  status or platform ships, extend `INSTALL_STATUSES` / `PEEK_PLATFORMS` — both
  are `as const` arrays that the unions derive from, so the type follows the
  runtime list automatically.

`accountId` deserves a note: it is what Peek elsewhere calls the **partner ID**,
and this webhook is its *only* source. No GraphQL query in this package selects an
account id (the gateway routes by `appId` + `installId`); the account id lives on
the install webhook alone — the session peek-auth token does not carry one
(`PeekAuthTokenUser.id` is the acting **user**, not the account). A consumer that
loses it cannot re-fetch it.
The detailed `AddonItem`
model (refids + reservation statuses) is **internal only** — consumers see just
the grouped `BookingAddons`; the internal model exists solely so add/remove can
build their mutation payloads.

Recurring patterns inside services:
- **Cursor pagination** is handled internally and transparently — e.g.
  `ProductService` gathers every add-on page; `BookingService.fetchPaginated`
  walks `pageInfo.hasNextPage`/`endCursor`. Callers get a single flat array.
- **Offset/count review reads** — `ReviewService.getReviews(productId,
  reviewCount?, reviewOffset?)` fronts a `reviews` connection that returns
  newest-first (descending `reviewedAt`) with only per-edge `cursor`s (no
  `pageInfo`). It fetches a **single page** of up to `reviewCount` reviews
  (default 50, validated 1–50), skipping the first `reviewOffset` newest reviews
  (default 0, validated non-negative integer). No pagination loop, no cache, no
  date filtering — callers slice the newest-first list by count and offset.

  The gateway cursor is the base64 of `range:<start>..<end>,<offset>` where
  `<offset>` is the absolute index of the object in the result set.
  `reviews/review-cursor.ts` is a small pure module that encodes/decodes that
  format (the only place `Buffer` base64 is used). Because the cursor resumes
  *after* a given offset, a non-zero `reviewOffset` is sent as `encodeCursor(
  reviewOffset - 1, reviewCount)`; an offset of 0 sends no cursor. This is the
  one resource whose triad carries a fourth helper file (`review-cursor.ts`)
  alongside queries/converter/service.

  `ReviewService.getAllReviewSummaries()` is a second, aggregate read on the same
  service: a single `activities { id name reviewMeta { … } }` query (the same
  `activities` connection `ProductService` reads) mapped by the pure
  `fromActivityReviewSummaryNodes` into `ProductReviewSummary[]` — per-activity
  average rating and per-star counts. It carries no per-review detail or PII, so
  it is unaffected by `fullCustomerAccess`; an activity with no reviews maps to a
  `null` `avgRating` and zero counts. `ProductReviewSummary` is exported from
  `src/index.ts`.
- **Composition** — `BookingService.addAddon` resolves an add-on's parent item
  through `ProductService`; `TimeslotService.assignGuide` resolves guides
  through the resource-pool + account-user services using the pure
  `matchGuideToResourcePool` matcher (`timeslots/guide-matcher.ts`).
- **Multi-step mutations** — booking creation (`createQuoteV2` →
  `createOrderFromQuote`) and both add-on mutations (`createQuoteFromOrder` →
  `updateQuoteV2` → `amendOrder`) are orchestrated as ordered request chains
  with per-step error checks. When `CreateBookingInput.parentOrderId` is set,
  `create` instead takes the **amendment path** (`createViaAmend`):
  `createQuoteFromOrder` seeds a quote bound to that order, `updateQuoteV2` adds
  the new booking to it in the **sparse** input shape (same field names as the
  strict quote but with `reservationStatus: "CONFIRMED"` stamped explicitly at
  the booking and ticket level, since sparse drops those defaults), and
  `amendOrder` applies it — `createOrderFromQuote` is never called because it
  always mints a *new* order. The amended order holds every pre-existing booking
  plus the new one, so `create` locates the new booking by the client-generated
  `refid` it carried through the quote (the expanded `amendOrder` selection reads
  back `sales { … on Booking { id displayId refid balance } }`), never by list
  position; a missing refid match is a hard error. `markAsPaid` then charges that
  booking's own balance, not the order total. When `CreateBookingInput.listPrice` is set, the pure
  `bookings/list-price.ts` (`distributeListPrice`) splits that total across the
  expanded ticket seats in integer cents — `floor(total / n)` for the first n-1,
  the remainder to the last — and `create` attaches a per-ticket
  `price { amount, currency }` to the `createQuoteV2` tickets, resolving the
  currency from the activity via `ProductService.getAllProducts()` (fallback
  `"USD"`, in parallel with the question-answer read). A malformed `listPrice`
  throws before any network call. When `CreateBookingInput.promoCode` is a
  non-empty string (trimmed via `resolvePromoCode`), `create` attaches it to the
  `createQuoteV2` `quoteInput` as `promoCodes: [{ code, refid, isEnabled: true }]`
  with a fresh `refid`; it is rejected up front when combined with `parentOrderId`
  (the amendment path creates no quote) so the code is never silently dropped.
  When `CreateBookingInput.customQuestionAnswers`
  is supplied, `create` first fetches the activity's custom questions
  (`ProductService.getCustomQuestions`) and runs the pure resolver in
  `bookings/custom-question-answer.ts` (`resolveCustomQuestionAnswers`) to match
  each answer (by id or lenient text) and validate its value by question type.
  Every resolved answer carries `questionAnswerText` (required by the gateway):
  the raw value for text, the option's exact label for select-one/location
  (which also set `questionAnswerOptionId`), and `"Yes"`/`"No"` for a checkbox
  (which also sets `isChecked`). Options are matched by id or lenient label.
  Per-guest questions are rejected (`not yet supported`). When
  `CreateBookingInput.requireRequiredQuestions` is set, the resolver also runs
  even if no answers were supplied and throws for the first required,
  non-per-guest question left unanswered. When
  `CreateBookingInput.acceptAllCustomQuestionIds` is set, a `cq_…` id that is not
  in the activity's question list is accepted as a plain text answer rather than
  throwing (by-name answers are unaffected — they still must match a question);
  the service uses `isCustomQuestionId` to skip the `getCustomQuestions` fetch
  entirely when every answer is by id and no required-coverage check is enforced.
  This runs
  before the first `createQuoteV2`, so a bad answer fails before any quote
  exists; the service then tags each resolved answer with a fresh `refid` and
  attaches them as the quote's `questionAnswers`. `addAddon` and `removeAddon` first call
  `listAddons` (the `sales` add-ons query) to derive the order id from the
  booking and reuse existing item/option refids — `addAddon` reuses a
  non-canceled add-on's item refid rather than minting a duplicate, and
  `removeAddon` cancels options by their existing refids, marking the parent
  add-on canceled only when all of its options end up canceled. Both finish by
  re-listing and returning the booking's refreshed add-ons.
- **Input validation** lives in the service (3-letter currency,
  positive-integer quantities, allowed payment sources, etc.).
  `normalizeBookingId` lowercases and converts `-` → `_`. Every booking/order id
  accepted as a parameter is format-checked **before** normalization by
  `assertBookingId`/`assertOrderId`: an id is valid only as a lowercase db id
  with `_` (`b_abc123` / `o_abc123`) or an uppercase display id with `-`
  (`B-ABC123` / `O-ABC123`) — bookings prefixed `b`, orders `o`. Mixed forms
  (`B_abc123`, `o-Ab123`), a missing prefix, or the wrong resource's id are
  rejected. Validating pre-normalization is deliberate: normalization would
  erase the case/separator distinction the check relies on.
