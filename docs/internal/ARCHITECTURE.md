# Architecture — `@peektravel/app-utilities`

A small, dependency-light TypeScript library that wraps the Peek "backoffice"
GraphQL gateway. It hides the raw GraphQL queries, authentication, HTTP
transport, retry logic, and response shapes behind a single authenticated entry
point (`PeekAccessService`) that hands out per-resource services returning clean,
plain-object data models.

Consumers never see GraphQL. They construct one access service per install and
call typed methods like `peek.getProductService().getAllProducts()` or directly
via the top-level short-forms like `peek.getAllProducts()` and
`peek.getAllActivities()`.

The package also ships **sibling accessors for other backoffices** —
`CngAccessService` and `AcmeAccessService` (both REST, not GraphQL). They reuse
this package's auth (`TokenManager`), retry/backoff loop, `Logger`, base error
types, tooling, and the Odyssey UI — differing only in transport (REST vs
GraphQL) and gateway routing (`cng_backoffice_api-v1` /
`acme_backoffice_api-v1` vs `peek_backoffice_api-v1`). See "CNG accessor" and
"ACME accessor" below.

## Layers

```
                consumer code
                      │
                      ▼
            ┌──────────────────────┐
            │  PeekAccessService   │  public root; validates config,
            │  (src/peek-access-   │  wires transport + token manager,
            │   service.ts)        │  lazily memoizes resource services
            └──────────┬───────────┘
                       │ owns
        ┌──────────────┼───────────────────────────┐
        ▼              ▼                             ▼
 ┌─────────────┐ ┌──────────────┐         ┌────────────────────────┐
 │ TokenManager│ │ GraphQLClient│◄────────│ per-resource services  │
 │ mints/caches│ │ HTTP+retry+  │  shared │ (products, bookings,   │
 │ the JWT     │ │ error mapping│  client │ timeslots, …)          │
 └─────────────┘ └──────┬───────┘         └───────────┬────────────┘
                        │                             │ uses
                        ▼                             ▼
                 Peek GraphQL gateway      ┌──────────────────────────┐
                                           │ queries  + converters    │
                                           │ (raw GraphQL → models)   │
                                           └──────────────────────────┘
```

### 1. `PeekAccessService` — the authenticated root
`src/peek-access-service.ts`

- Validates the required config fields and throws on any empty value:
  `installId`, `jwtSecret`, `issuer` always; `appId` and `gatewayKey` only in the
  legacy `baseUrl` mode (both are unneeded when `apiUrl` is set — see the
  endpoint-URL note below).
- Constructs a single shared `TokenManager` and `GraphQLClient`.
- Exposes one `get<Resource>Service()` accessor per resource. Each is **lazily
  created and memoized** — repeated calls return the same instance.
- Exposes **top-level short-form methods** that delegate directly to the
  underlying service, e.g. `peek.getAllProducts()` → `peek.getProductService().getAllProducts()`. Every public service method has a named proxy on `PeekAccessService`; the names are prefixed with the resource noun where disambiguation is needed (e.g. `getBookingById`, `getTimeslotById`).
- Exposes `verifyPeekAuthToken(token)` to verify HMAC-signed JWTs issued by
  the Peek app registry (`iss: "app_registry_v2"`, `aud: "Joken"`), returning
  a fully typed `PeekAuthTokenClaims` (including the nested `PeekAuthTokenUser`,
  which is now nullable). Throws `JsonWebTokenError` / `TokenExpiredError` /
  `NotBeforeError` from `jsonwebtoken` on failure. Claim *extraction* is
  defensive and never throws: the shared `mapPeekTokenUser` returns `null` for
  an absent `user` block and normalizes every field independently (a sentinel
  `""`/`"null"` id becomes `null`), so `verifyInstallWebhook` inherits the same
  tolerance. The signature-check core (issuer + audience + user mapping) lives
  in the internal `peek-auth-token.ts` module, shared with the standalone
  `verifyInstallWebhook` (§ install webhooks) so the two can't drift apart. That
  core (`verifyPeekJwt`) also strips a leading `Bearer ` prefix from the token,
  so every entry point in the family accepts the raw `x-peek-auth` header value.
- Composes dependencies between services where needed:
  - `TimeslotService` receives the resource-pool and account-user services (for
    guide resolution).
  - `BookingService` receives the product service (for add-on → parent-item
    resolution).
- Optional config: `apiUrl` (see the endpoint-URL note below), `mode` (`"v2"` —
  see below), `baseUrl`, `tokenTtlSeconds` (3600), `tokenRefreshLeewaySeconds`
  (60), `retryDelaysMs` (`[1000, 2000, 4000]`), `logger` (no-op default),
  `fetch` (global default), `itemOptionsPageSize` (50), and `accessOptions`
  (see "Access options / PII" below).
- **Endpoint URL — `apiUrl` (preferred) vs. `baseUrl`/`appId` (deprecated).**
  The install webhook's `apiUrl` is the install's app endpoint. When the config
  carries `apiUrl`, the transport uses it **as given**: `GraphQLClient` POSTs
  every call to that exact URL (Peek is single-endpoint, so `endpointName` is
  logging-only), and the CNG/ACME `RestClient` treats it as the base and appends
  only the REST `path`. No app-id/slug segment is inserted, so `appId` is unused
  (and `gatewayKey` isn't required — the registry endpoint authenticates on the
  JWT, like v2). When `apiUrl` is absent the transports fall back to the legacy
  `baseUrl/appId/[slug/]endpoint` construction with a hardcoded default
  `baseUrl` — **deprecated**; the fallback will be removed and a URL will become
  required. `createAccessServiceForInstall` (§ below) is the front door for the
  `apiUrl` path.
- **v2 mode** (`mode: "v2"`, legacy `baseUrl` path only): the endpoint URL becomes
  `baseUrl/appId/peek_backoffice_api-v1/endpointName` and the default `baseUrl`
  switches to `https://app-registry.peeklabs.com/installations-api`.
  A custom `baseUrl` still overrides the default in v2 mode; `apiUrl`, when set,
  supersedes `mode`/`baseUrl` entirely. All other behaviour (JWT auth, headers,
  retries, resource services) is unchanged.

### 2. `TokenManager` — auth
`src/internal/token-manager.ts`

- Signs a short-lived HMAC JWT with `jsonwebtoken` (`subject = installId`,
  `issuer = app name`, `expiresIn = ttlSeconds`). Payload is empty.
- Caches the token and re-mints it once it is within `leewaySeconds` of expiry.

### 3. `GraphQLClient` — transport
`src/internal/peek/graphql-client.ts`

The place that touches the network for Peek. The retry/backoff loop and 418/429
mapping are **shared** with the CNG transport in
`src/internal/http-transport.ts` (`requestWithRetry`): both clients build their
own `url`/`init`, log their own "Making … request" line, and pass a per-response
callback that handles the transport-specific success/error parsing.
Responsibilities:

- Builds the endpoint URL as `${baseUrl}/${appId}/${endpointName}`, or
  `${baseUrl}/${appId}/${endpointPathPrefix}/${endpointName}` when an
  `endpointPathPrefix` is set (v2 mode inserts `peek_backoffice_api-v1`). Today
  every operation routes through the single `sales` endpoint
  (`gateway-endpoints.ts`).
- Sets headers: `X-Peek-Auth: Bearer <jwt>`, `pk-api-key: <gatewayKey>`,
  `Content-Type: application/json`.
- Collapses query whitespace (`\s+` → single space) before sending.
- Retries HTTP 429 using the configured backoff delays, then throws
  `RateLimitError`.
- Reads the response body via the shared `parseBody` helper (`text()` → try
  `JSON.parse`, falling back to raw text) *before* branching on status, so a
  non-JSON error page never throws a `SyntaxError` that hides the real status.
- Maps known failures to typed errors:
  - HTTP 418 → `AdminAccountRequiredError`
  - HTTP 429 (after retries) → `RateLimitError`
  - GraphQL `errors` array present → `PeekGraphQLError` (raw errors preserved on
    `.graphqlErrors`)
  - other non-2xx → `PeekHttpError` (carries `.statusCode`, `.url`, and raw
    `.body`).

### 4. Per-resource services
`src/internal/peek/<resource>/`

Every Peek resource lives under `src/internal/peek/` (mirrored by the CNG
resources under `src/internal/cng/` — see §5b); the shared plumbing
(`token-manager.ts`, `http-transport.ts`) stays at `src/internal/`.

Each resource follows the same **three-file triad**:

| File | Role |
| --- | --- |
| `*-queries.ts` | Raw GraphQL query/mutation strings, the matching response interfaces, and small variable-builder/normalizer helpers. **Internal only** — never re-exported. |
| `*-converter.ts` | Pure, I/O-free functions mapping raw GraphQL nodes → clean models. Easy to unit-test. |
| `*-service.ts` | Public class holding the business logic; calls the shared client, then runs the converter. |

Resources: `products`, `account-users`, `resource-pools`, `timeslots`,
`resellers`, `promo-codes`, `pricing`, `daily-notes`, `availability`,
`memberships`, `bookings`, `reviews`. Clean data shapes are split by brand: Peek
models in `src/models/peek/`, CNG models in `src/models/cng/`.

`ProductService` exposes three top-level product filters in addition to the combined `getAllProducts()`:
- `getAllActivities()` — fetches only the `activities` connection (one request, no add-on pagination).
- `getAllAddons()` — fetches only the `itemOptions` connection, paginated.

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

`waivers` is a **webhook-only resource**: it has no GraphQL reads (so no
queries/service/converter triad), just `src/internal/peek/waivers/waiver-webhook.ts`
and the `src/models/peek/waiver.ts` model. See the webhook notes below.

A resource may split into more than one triad when it carries a distinct
sub-domain. `bookings` does: alongside `booking-queries`/`booking-converter`,
the add-on flows live in `addon-queries.ts` (the `sales` add-ons query + raw
node shapes) and `addon-converter.ts` (raw node → the internal `AddonItem`
detail model and the clean public `BookingAddon`).

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
(see §1 / `peek-auth-token.ts`), so no token entry point makes the caller unwrap
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

- **The JSON body is the source of the event data; the JWT authenticates it and
  is the fallback.** Every field is read from the body first: `accountName`,
  `platform`, `isTest`, `timezone`, `apiUrl` are body-only, and `installId`,
  `accountId`, `status`, `displayVersion`, `user` (from `modified_by`) fall back
  to the verified token when the body omits them. The real install token does not
  actually carry those five, so reading it first returned empty core fields — the
  body is where the data lives. The signature still authenticates the whole
  delivery (only Peek can mint a valid token), so the body is trusted within a
  verified request. `user` resolution is defensive on the body path (a
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
- **Composition** — `BookingService.addAddon` resolves an add-on's parent item
  through `ProductService`; `TimeslotService.assignGuide` resolves guides
  through the resource-pool + account-user services using the pure
  `matchGuideToResourcePool` matcher (`timeslots/guide-matcher.ts`).
- **Multi-step mutations** — booking creation (`createQuoteV2` →
  `createOrderFromQuote`) and both add-on mutations (`createQuoteFromOrder` →
  `updateQuoteV2` → `amendOrder`) are orchestrated as ordered request chains
  with per-step error checks. `addAddon` and `removeAddon` first call
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

### 4b. Access options / PII
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
     `bookingPortalUrl`. Operator-facing fields (notes, the Peek Pro deep link,
     money, resources) always stay.
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
   (`getById`, `getGuests`, `cancel`, `appendNote`, `setCheckinStatus`) and
   `create` (**including `markAsPaid`**) remain available.

The webhook **registration** query (`BOOKING_WEBHOOK_GQL_QUERY`) is deliberately
unaffected — it is the maximal selection built from the full field fragments and
pinned by the drift-guard test; `fullCustomerAccess` governs only the runtime read path.

### 5. Public API surface
`src/index.ts`

The barrel re-exports only the public contract: `PeekAccessService` + its config,
the `createAccessServiceForInstall` factory (+ its `InstallAccessTarget` /
`InstallAccessConfig` / `InstallAccessService` types — builds the right access
service for an install's `platform`, wired to its `apiUrl`),
the `AccessOptions` type (see §4b), each resource service class (and the
options/result types callers need), all data-model **types** (including
`PeekAuthTokenClaims`, `PeekAuthTokenUser`, and the install-webhook
`InstallWebhookClaims`/`InstallWebhookAccount`), the `Logger` interface +
`noopLogger`, and the typed error classes (`AdminAccountRequiredError`,
`RateLimitError`, `PeekGraphQLError`, `PeekHttpError`, `PiiAccessDisabledError`,
`CngApiError`, `AcmeApiError`). Query strings and raw response interfaces are deliberately kept
internal — including the booking-webhook registration query
(`BOOKING_WEBHOOK_GQL_QUERY` stays internal, documented via `docs/webhooks.md`).
The webhook-related public exports are the two parsers `parseBookingWebhook` and
`parseWaiverWebhook` plus the install-webhook parser `parseInstallWebhook` and the
`@deprecated` `verifyInstallWebhook` (and the `Waiver` / `InstallWebhook` /
`InstallStatus` / `InstallWebhookClaims` model types and the `INSTALL_STATUSES`
constant; see the webhook notes above).

### 5b. CNG accessor (REST)
`src/cng-access-service.ts`, `src/internal/cng/`, `src/models/cng/product.ts`

A second, brand-parallel accessor for the **CNG** backoffice — REST, not
GraphQL. Deliberately low-churn: it sits alongside the Peek code and shares the
plumbing rather than forking the package.

- **`CngAccessService`** — validates four config fields (`installId`,
  `jwtSecret`, `issuer`, `appId`; **no `gatewayKey`** — the CNG gateway needs no
  `pk-api-key`). Builds the shared `TokenManager` and a `RestClient`, defaults
  the base URL to the app-registry installations API, and exposes
  `getProductService()` + the short-form `getAllActivities()`.
- **`RestClient`** (`src/internal/cng/rest-client.ts`) — the REST sibling of
  `GraphQLClient`. Builds `${baseUrl}/${appId}/${extendableSlug}/${path}` with
  `extendableSlug = cng_backoffice_api-v1`, GETs it with `X-Peek-Auth: Bearer`
  (no `pk-api-key`, no `{query,variables}` body), and runs through the shared
  `requestWithRetry` loop. Reads the body with the shared `parseBody` helper
  (`http-transport.ts`) — JSON with a raw-text fallback when unparseable — the
  same helper the Peek `GraphQLClient` and ACME `RestClient` use; non-2xx (other
  than 418/429) → `CngApiError` (status + body).
- **Products triad** (`src/internal/cng/products/`) — same shape as every Peek
  resource: `product-queries.ts` (raw REST `ProductNode`/`ProductsResponse`
  interfaces, internal), `product-converter.ts` (pure `fromProductNodes` →
  `Activity`), `product-service.ts` (`CngProductService.getAllActivities()`,
  tolerating a `{ products: [...] }` envelope or a bare array). Endpoint segments
  live in `src/internal/cng/endpoints.ts`.
- **Model** `src/models/cng/product.ts` — `Activity`/`ActivityTicket`, mirroring
  the Peek `Product` shape so both brands read uniformly.
- **Shared, not duplicated:** the config contract (`BaseAccessServiceConfig` +
  the `createTokenManager`/`requireNonEmpty` helpers and shared TTL/leeway/retry
  defaults, all in `src/access-service-config.ts`), `TokenManager`,
  `Logger`/`noopLogger`, the `AdminAccountRequiredError`/`RateLimitError` base
  errors, the `requestWithRetry` transport core, the build/test tooling, and the
  Odyssey UI. Each accessor's config just extends the base: `PeekAccessServiceConfig`
  adds `gatewayKey`/`mode`/`itemOptionsPageSize`; `CngAccessServiceConfig` adds
  nothing. So the only real per-accessor difference is the transport built and the
  services exposed.
- **Public exports:** `CngAccessService` + `CngAccessServiceConfig`,
  `CngProductService`, the `Activity`/`ActivityTicket` types, and `CngApiError`
  (added to the errors export). REST paths and raw response interfaces stay
  internal.

> ⚠️ **Guessed response shape.** The real `commerce-config/products` payload is
> not yet confirmed. `ProductNode`, the converter mapping, and the `Activity`
> field set are best-guess placeholders (snake_case REST fields, defensive
> defaults). Confirm against a live sample and adjust — touch only
> `cng/products/product-queries.ts`, `product-converter.ts`, and
> `models/cng/product.ts`.

### 5c. ACME accessor (REST)
`src/acme-access-service.ts`, `src/internal/acme/`, `src/models/acme/product.ts`

A third, brand-parallel accessor for the **ACME** backoffice, built by cloning
the CNG accessor. Same auth/transport/tooling reuse as CNG (§5b) — only the
routing, endpoint, and response shape differ:

- **`AcmeAccessService`** — identical to `CngAccessService`: validates the same
  four config fields (`installId`, `jwtSecret`, `issuer`, `appId`; no
  `gatewayKey`), builds the shared `TokenManager` + a `RestClient`, defaults to
  the app-registry base URL, and exposes `getProductService()` +
  `getAllActivities()`.
- **`RestClient`** (`src/internal/acme/rest-client.ts`) — the CNG REST client
  cloned with `extendableSlug = acme_backoffice_api-v1` (same `-v1` separator
  as CNG/Peek), logging `"Making ACME request"` and throwing
  `AcmeApiError` on non-2xx.
- **Products triad** (`src/internal/acme/products/`) — `product-queries.ts`
  (raw `TemplateNode`/`TemplatesResponse` for the `{ list: [...] }` envelope,
  plus the `PUBLISHED_REVIEW_STATE` constant, internal), `product-converter.ts`
  (pure `fromTemplateNodes` → `AcmeActivity`, **filtering to published
  templates only** and mapping `colorCategory.backgroundColor` → `color`),
  `product-service.ts` (`AcmeProductService.getAllActivities()`, tolerating a
  `{ list: [...] }` envelope or a bare array). Endpoint segments live in
  `src/internal/acme/endpoints.ts` — the template-names path
  `v2/b2b/event/templates/names?pageSize=-1&page=1`.
- **Model** `src/models/acme/product.ts` — `AcmeActivity`/`AcmeActivityTicket`,
  mirroring the CNG `Activity` shape. ACME exposes no tickets today, so
  `tickets` is always empty; only `id`/`name`/`color` are populated.
- **Public exports:** `AcmeAccessService` + `AcmeAccessServiceConfig`,
  `AcmeProductService`, the `AcmeActivity`/`AcmeActivityTicket` types, and
  `AcmeApiError` (added to the errors export). Distinct type names avoid the
  collision with CNG's `Activity`. REST paths and raw response interfaces stay
  internal.

### 6. UI components — the `./ui` subpath
`src/ui/`

A second, **browser-only** public surface shipped under a separate subpath
export (`@peektravel/app-utilities/ui`) so the server library stays DOM-free:
framework-agnostic **Web Components** (Custom Elements) ported from the Peek
Odyssey design system, plus the Odyssey design tokens and component CSS.

```
src/ui/
  tokens.css            Odyssey design tokens as :root CSS custom properties
  odyssey.css           component styles (SCSS → token-var-based plain CSS)
  base.ts               OdyElement base class + classes()/escapeHtml()/define()
  icons.ts              curated inline-SVG set (iconSvg/registerIcon/hasIcon)
  overlay.ts            portal()/removePortal()/position() helper for overlays
  i18n.ts               built-in-string localization (registerTranslation, terms)
  select-base.ts        shared combobox/listbox base for the dropdown components
  components/<name>.ts   one custom element per file, self-registering
  index.ts              barrel: side-effect registers all <ody-*>, re-exports
```

Load-bearing rules:
- **Light DOM, no Shadow DOM.** Each element extends `OdyElement` and renders
  its chrome into its own light DOM via `mount(chrome)`, so the global
  `odyssey.css` classes style it exactly as the Ember addon does and consumers
  can override with the same selectors. Consumer child content is preserved
  across re-renders through a `[data-ody-slot]` placeholder. The first render is
  deferred one microtask (so parser/`innerHTML` children are attached before the
  slot is captured); attribute-change re-renders are synchronous.
- **Child mutations are forwarded to the slot.** Because `mount()` relocates
  consumer children into the `[data-ody-slot]` node, a slotted child's real
  `parentNode` is that slot, not the host. Framework reconcilers (React, Vue,
  Angular, Svelte) mutate the DOM by calling `host.removeChild(child)` /
  `insertBefore` / `replaceChild` / `appendChild`, which would otherwise throw
  `NotFoundError`. `OdyElement` overrides these four methods: removal/insert/
  replace delegate to the target node's actual `parentNode` (so they also work
  while the slot is portaled to `document.body`), and `appendChild` routes into
  the current slot. Internal chrome/portal re-homing must use `OdyElement.adopt()`
  (a `super.appendChild`) to bypass this forwarding — the portal components
  (`modal`, `panel`, `popover`, `tooltip`) do, so their chrome node isn't routed
  into its own slot. `mount()` itself never passes through the overrides (it uses
  `this.innerHTML` and operates on the slot/fragment nodes directly).
- **Text fields update `value` in place, never re-render.** The native
  `<input>`/`<textarea>` already reflects what the user typed, so a destructive
  re-render on each keystroke would drop focus and caret. The controlled inputs
  (`ody-input`, `ody-inline-input`, `ody-search-input`, `ody-money-input`,
  `ody-percentage-input`) therefore `override attributeChangedCallback` to
  special-case `value`: they push it into the live control via
  `reflectControlValue` (a no-op when the control already holds it), skipping
  `render()`. Every other observed attribute changes chrome and still re-renders
  through the base. The selection controls follow the same principle:
  `ody-checkbox`, `ody-checkbox-group`, and `ody-radio-button-group` update the
  checked state in place on selection (shared `applyCheckboxState` in
  `checkbox-state.ts`) so focus/keyboard nav survives.
- **Re-render on reconnect; portal content survives a move.** `connectedCallback`
  re-renders when the element is reconnected (`#slot` already captured) — moving
  an element in the DOM (a framework keyed reorder) otherwise leaves it inert
  (no locale reactivity, no listeners). Portal components
  (`modal`/`panel`/`popover`/`tooltip`) call `reclaimPortaledSlot(node)` in
  `disconnectedCallback` to pull slotted content out of the portaled node before
  it is torn down, so the reconnect re-render can re-slot it.
- **Pre-upgrade properties are honored.** `connectedCallback` runs
  `#upgradeProperties()` — own properties that shadow a prototype accessor
  (a framework `el.value = …` set before the element upgraded) are deleted and
  re-assigned through the accessor.
- **Untrusted attribute values are neutralized at the sink.** `classes()`
  HTML-escapes its output (class fragments are built from raw attributes), and
  `cssColor()` allow-lists color tokens before they reach a `style="…"`
  declaration. Rich-data props (`options`/`presets`/`data`/`columns`/`rows`) are
  real getter+setter properties (accepting an array or JSON string) rather than
  getter-only accessors, so they are **not** reflected as JSON DOM attributes;
  `ody-checkbox-group` serializes its `value` attribute as a JSON array so
  comma-containing values round-trip.
- **Localization (`i18n.ts`).** Components' built-in strings (aria-labels,
  default placeholders, check-in-status labels) go through `OdyElement.term(key)`
  / `localized(attr, key)`, never hardcoded. The active language is resolved from
  the nearest `lang` attribute (DOM-driven, Shoelace-style); consumers call
  `registerTranslation(lang, terms)`; English is the bundled default. Reactivity
  is wired in `mount()` — each element registers a self-pruning locale callback,
  and one document-wide `MutationObserver` on `lang` plus `registerTranslation`
  trigger re-renders. Per-instance attribute overrides (`close-label`, …) win.
  Weekday/month names stay outside the catalog (they follow `Intl`).
- **Date display (`datepicker`).** The trigger label, calendar weekday/month
  names, and day aria-labels are formatted with `Intl.DateTimeFormat` for the
  resolved `lang` — never the raw ISO string. The `value` attribute and `change`
  payload stay ISO `yyyy-mm-dd` (range `start/end`); only presentation
  localizes. `display-format` (`short`/`medium`/`long`/`full`) maps to `Intl`
  `dateStyle`; a `formatDate` property overrides it. Date *math* still uses
  local `Date` parts (no `toISOString`).
- **Registration is a side effect** of importing `./ui` (or an individual
  component file). `package.json` `"sideEffects"` is therefore an allow-list
  (`**/ui/**`, `**/*.css`) rather than `false`, so bundlers don't tree-shake the
  registrations away.
- **React 19 safety at registration.** `define()` (in `base.ts`) runs
  `addReactSafeSetters` on the class before `customElements.define`: it walks the
  component's own prototypes (up to `OdyElement`) and gives every getter-only
  accessor a setter, so React 19 — which assigns JSX props as DOM *properties*
  (`el.searchable = true`) — can't throw `only a getter`. When the property name
  maps to an `observedAttribute` the setter **reflects** the value onto that
  attribute (booleans as presence, objects as JSON, scalars as strings) so the
  prop takes effect; otherwise it is a no-op for derived/imperative state
  (`isOpen`). The static `.d.ts` types keep these accessors read-only — the
  setters are a runtime-only safety net. Documented for consumers in `docs/ui.md`
  §3.5 and the README.
- **Dependency-free & token-based.** No `ember-power-select`/`-calendar`,
  `svg-jar`, or bootstrap. Colours/spacing reference the `tokens.css` custom
  properties; icons are inlined; button variant colours (which live in a
  bootstrap base layer upstream) are reproduced from Odyssey tokens.
- **Scope:** ~48 components across display, layout, form-input, interactive,
  overlay, and data/selection tiers. The layout tier includes
  `ody-app-page-container` — the required wrapper for app **settings** UIs, sized
  to the two settings-host iframe widths (868px / 1310px), exposing an `ody-page`
  CSS container context, and shipping a **default responsive gutter**
  (`--gap24` → `--gap16` at/below 868px; `flush` opts out). It supersedes
  `ody-page-container` (kept, `@deprecated`, full-bleed/no-gutter). Likewise
  `ody-horizontal-divider` (default `margin-block: var(--gap16)`;
  `spacing="tight"|"none"`) supersedes the spacing-neutral `ody-divider`. Both
  successors are **self-spacing** primitives built on the `--gap8/16/24/32`
  scale published in `tokens.css`; PII/behavior is unaffected. The data/selection tier — `dropdown-single`,
  `dropdown-multi` (+ shared `select-base.ts`), `datepicker`, `table` — was
  **rebuilt from scratch** as lightweight vanilla components (rather than ported
  from their `ember-power-select` / `ember-power-calendar` originals), following
  WAI-ARIA APG combobox/listbox and grid/date-picker patterns: rich data crosses
  the boundary as JS **properties** (`options`, `columns`, `data`,
  `isDateDisallowed`), scalar config as reflected attributes, output as
  `CustomEvent`s. The datepicker does all date math from local `Date` parts (no
  `toISOString`/string parsing — avoids UTC drift) and ships no date library.
  Still **not** ported: `nested-multi-select`, `location-autocomplete` (Google
  Maps), `filter-menu`/`filter-menu-single`, `accordion-checkbox`,
  `datepicker-with-presets` — they'd reintroduce avoided dependencies or compose
  trivially from shipped parts. Composite/grouped components (tabs, radio/checkbox
  groups, toggle group, dropdowns) take a JSON `options`/`tabs` attribute and emit
  `CustomEvent`s.
- `examples/ui-gallery.html` demonstrates every component; `npm run sample`
  builds and serves it (`scripts/serve-examples.mjs`, a dependency-free static
  server) because browsers block ESM imports over `file://`.

## Build & tooling

- **Bundler:** `tsup` (`tsup.config.ts`) emits a dual **ESM + CJS** build plus
  bundled `.d.ts`/`.d.cts`, with sourcemaps, tree-shaking, no minify. Two
  entries: the server library (`src/index.ts` → `dist/index.*`) and the UI
  components (`src/ui/index.ts` → `dist/ui/index.*`). An `onSuccess` step copies
  `tokens.css` + `odyssey.css` into `dist/ui/`.
- **Package entry points:** modern `exports` map with separate `import`/`require`
  conditions and their own type declarations; legacy `main` (`./dist/index.cjs`),
  `module`, and `types` provided as fallbacks. The UI surface adds `./ui`
  (dual import/require + types) and the two CSS assets `./ui/odyssey.css` /
  `./ui/tokens.css`. `"sideEffects"` is an allow-list (`**/ui/**`, `**/*.css`)
  so custom-element registration survives tree-shaking while the server code
  stays tree-shakable. The dual build supports both `import` and `require`
  consumers (notably the Node 22 / CommonJS Firebase Functions runtime).
- **TypeScript:** `NodeNext` module resolution, `ES2022` target, full `strict`
  plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `noUnusedLocals/Parameters`,
  `verbatimModuleSyntax`, `isolatedModules`. Source imports use explicit `.js`
  extensions (required by NodeNext ESM).
- **Lint:** ESLint flat config with `@eslint/js` + `typescript-eslint` recommended.
- **Tests:** Vitest, Node environment by default. Coverage via `v8` with **95%
  thresholds** on lines/functions/branches/statements (covers `src/ui/**` too).
  Server tests inject a fake `fetch` (and sometimes a fake `GraphQLClient`) to
  exercise transport, retries, error mapping, pagination, and converters without
  real network calls. UI tests opt into a DOM via a per-file
  `// @vitest-environment happy-dom` directive (`happy-dom` is a devDependency).
- **Publish guard:** `prepublishOnly` runs the build then `publint` and
  `@arethetypeswrong/cli` (`attw`) to verify the `exports` map / type resolution
  for both module systems. `attw` runs with `--profile node16` (subpath exports
  like `./ui` are invisible to legacy node10 classic resolution, which this
  Node≥18 package doesn't target) and `--exclude-entrypoints ui/odyssey.css
  ui/tokens.css` (CSS assets have no type declarations to resolve). `files: ["dist", "llms.txt"]` whitelists the build
  output plus the AI-agent quickstart (`README.md`, `LICENSE`, and
  `package.json` are always included by npm regardless); this maintainer doc
  under `docs/internal/` is intentionally **not** shipped.
  `publishConfig.access: "restricted"` marks it a private scoped package.
- **Distribution:** published to **GitHub Packages** (private registry), not
  public npm. Releases are automated by `.github/workflows/publish.yml`, which
  runs on a `v*.*.*` tag push: typecheck → lint → test (coverage gate) →
  `npm publish` (publish runs `prepublishOnly` = build + `publint` + `attw`).
  Consumers add a scoped `.npmrc` (`@peek-travel:registry=https://npm.pkg.github.com`)
  and a `read:packages` token, then `npm install` / `npm update` normally —
  including in cloud builds (Firebase Functions). See the README "Releasing" and
  "Install" sections.

### Verified current state (this review)
- `tsc --noEmit` — clean.
- `eslint .` — clean.
- `vitest run` — **247 tests across 28 files pass.**
- Coverage — 99.89% lines / 96.11% branches / 100% functions (above thresholds).
- `tsup` build — produces ESM, CJS, and both `.d.ts` flavors successfully.
- `attw --pack` / `publint` — no problems.

## Flagged issues & unusual configuration

These are observations, not blockers. Nothing here breaks the build.

1. **No `prepare` script — registry distribution only.** `dist/` is built on
   publish (`prepublishOnly`), not on install, and is git-ignored. Installing
   this directly from a **git URL** would therefore yield a package with no
   `dist/`; that path is unsupported. Consumption is via GitHub Packages only.

2. **Consumers must configure the `@peek-travel` scope.** `publishConfig` sets
   `registry: https://npm.pkg.github.com`, but each consuming project still needs
   an `.npmrc` mapping the `@peek-travel` scope to that registry plus a
   `read:packages` token (a `NPM_TOKEN` env var in cloud builds). Documented in
   the README "Install" section.

3. **`version` is `0.1.0`** and `license` is `UNLICENSED`. Expected for an
   internal package; bump the version per release (`npm version` + tag push)
   so consumers pick changes up via `npm update`.

4. **CI runs on release only.** `.github/workflows/publish.yml` runs the full
   `typecheck` / `lint` / `test` / `check:*` gate on a version-tag push before
   publishing, but nothing runs them automatically on every push/PR. Consider
   adding a separate PR-validation workflow.

5. **Transport response-handling order is slightly fragile.** In
   `GraphQLClient.request`, the body is parsed with `response.json()` and the
   GraphQL `errors` array is checked *before* `response.ok`. A non-2xx response
   whose body is **not valid JSON** (e.g. an HTML 500/502 from a proxy) would
   throw a raw `SyntaxError` from `json()` rather than the intended
   `"GraphQL request failed with HTTP <status>"` error. Consider checking
   `response.ok` / content-type before parsing, or guarding the `json()` call.

6. **Minimal package metadata.** `repository` is set (required for GitHub
   Packages to link the package to its repo); `author`, `bugs`, `homepage`, and
   `keywords` are still absent. Cosmetic.

7. **`jsonwebtoken` for HMAC-only signing.** It's the single runtime dependency
   and pulls a fair amount of transitive weight for what is effectively an
   HMAC-SHA `sign()`. Not a problem, just noting it's the one thing standing
   between this and a zero-runtime-dependency library; Node's built-in `crypto`
   could sign the JWT if footprint ever matters.

8. **No validation that `leewaySeconds < ttlSeconds`.** If a caller sets leeway
   ≥ TTL, the cached token's `expiresAtMs` would be in the past and a fresh JWT
   would be minted on every request. Low risk (defaults are sane), but unguarded.
