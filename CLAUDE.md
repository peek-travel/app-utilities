# Project Guidelines

`@peektravel/app-utilities` is a small, dependency-light TypeScript **library**
that wraps the Peek "backoffice" GraphQL gateway. It was extracted from the
Peek Pro Autopilot connector so the connector can become a thin consumer.
Callers only ever touch `PeekAccessService`, the per-resource services it hands
out, and the clean data models — never raw GraphQL.

- If anything about a request is unclear or ambiguous, ask for clarification
  before starting any work. Don't guess at intent or proceed on assumptions when
  the goal, scope, or approach is uncertain.
- Before making any changes, review `docs/internal/ARCHITECTURE.md`.
- Once you've made all the code changes, update `docs/internal/ARCHITECTURE.md` to reflect
  major changes (new resources, new triads, changed public surface).
- **Keep the external guides in sync.** If you change the pricing engine/override
  surface (`PricingService`, the `src/models/peek/pricing.ts` models, or the
  products `currency` field), update `docs/external/pricing-api.md` — it documents
  that API for consumers and must not drift. Likewise `docs/webhooks.md` for the
  webhook surface and `llms.txt` for any change to the public entry points.
- Ensure test coverage remains above 95% (the Vitest gate enforces this on
  lines/functions/branches/statements).
- Unless told otherwise, after everything is done, run the linter and fix any
  errors.

# Architecture conventions

Preserve the structure described in `docs/internal/ARCHITECTURE.md`. The load-bearing rules:

- **Three-file triad per resource** under `src/internal/<resource>/`:
  - `*-queries.ts` — raw GraphQL strings, matching response interfaces, and
    small variable-builder/normalizer helpers. **Internal only — never
    re-exported from `src/index.ts`.**
  - `*-converter.ts` — **pure, I/O-free** functions mapping raw GraphQL nodes →
    clean models. No network, no logging, no `Date.now()`.
  - `*-service.ts` — the public class with the business logic; calls the shared
    `GraphQLClient`, then runs the converter.
- A resource may split into more than one triad when it carries a distinct
  sub-domain (e.g. `bookings` has `booking-*` plus `addon-*`).
- **Public API surface (`src/index.ts`) exposes only the clean contract**:
  `PeekAccessService` + config, the resource service classes and the
  option/result types callers need, the data-model **types**, `Logger` /
  `noopLogger`, and the typed error classes. Query strings, raw response
  interfaces, and internal detail models (e.g. the add-on `AddonItem`) stay
  internal — add a model to `index.ts` only if a consumer genuinely needs it.
- **Stay dependency-light.** `jsonwebtoken` is the only runtime dependency.
  Prefer Node built-ins (`node:crypto` `randomUUID`, native `fetch`) over adding
  a package; flag it for the user before introducing a new runtime dependency.
- **NodeNext ESM**: relative imports must carry explicit `.js` extensions.
- The dual **ESM + CJS** build (`tsup`) plus `publint` + `attw` must stay green —
  the connector consumes this from a CommonJS Firebase Functions runtime.

# `fullCustomerAccess` (the PII switch)

This is the single most consequential option in the package — getting it wrong
either leaks customer PII into an app that isn't entitled to it, or silently
returns `null` where a caller expected a guest name. Treat it as load-bearing.

## What it is

`AccessOptions` (`src/access-options.ts`) is a cross-cutting options object
passed **once**, at access-service construction, via the `accessOptions` config
field. Today it carries a single flag:

```ts
new PeekAccessService({ …auth, accessOptions: { fullCustomerAccess: true } });
```

- **Default is `false`** — PII off. Omitting `accessOptions`, passing `{}`, or
  passing `undefined` all resolve to `{ fullCustomerAccess: false }` via
  `resolveAccessOptions()`. Always resolve through that helper; never read
  `options?.fullCustomerAccess` directly.
- It is an **object, not a bare boolean**, so future cross-cutting flags slot in
  without changing any downstream signature. Keep it that way.
- It is **per access service, not per call**. There is deliberately no
  per-method override — an install either has customer-data entitlement or it
  doesn't. Do not add a call-level parameter for it.
- Only `PeekAccessService` actually consumes it today: it resolves once in the
  constructor and threads the *resolved* value into `BookingService` and
  `ReviewService`. `CngAccessService` / `AcmeAccessService` accept the same
  config shape but have no PII surface, so the flag is inert there.
- `parseWaiverWebhook(body, options?)` takes the same `AccessOptions` directly —
  webhook parsers are pure and have no access service to inherit from.

## What `false` (the default) does

**1. PII is never requested — filtered at the GraphQL layer, not in converters.**
The query *builders* omit the fields, so the gateway never returns them and the
pure converters map the absent fields to `null`/empty. Converters stay
PII-agnostic; do not add PII branching to a converter.

- **Bookings** (`booking-queries.ts`): drops the primary-guest block
  (`customerName`/`email`/`phone`/`postalCode`/`isGdpr`/opt-ins), the guest
  identity fields (name/country/DOB/email/phone/postalCode/`isGdpr`/
  `fieldResponses` — the guest list keeps only ids and participation/opt-in
  flags), the booking- and ticket-level custom `questionAnswers`, and the
  customer `bookingPortalUrl`. Operator-facing fields (notes, the Peek Pro deep
  link, money, resources, structural ids) always stay.
- **Reviews** (`buildReviewsQuery`): drops the reviewer `name`/`email`. The
  review comment, rating, dates, and credited guides always stay.
- **Waivers** (`parseWaiverWebhook`): the webhook payload is fixed — there is no
  selection to trim — so this is the **one** place filtering happens at parse
  time: participant `guestName` and the signed-document `fileUrl` are nulled.
  `fromWaiverNode` itself stays a pure, full mapping.

**2. Payment / booking-modification operations are disabled.** `BookingService`
gates every operation that touches customer financial data —
`getPaymentsOnFile`, `makePayment`, `refund`, `createInvoiceLink`, `addAddon`,
`removeAddon` — throwing the exported `PiiAccessDisabledError` (carrying
`.operation`) **before any network call**. Still available: `create` (including
`markAsPaid`), `getById`, `getGuests`, `searchByTimeRange`, `searchByTimeslot`,
`cancel`, `appendNote`, `setCheckinStatus`, `listAddons`.

## Rules when changing code

- **Adding a field that could identify or contact a customer** (name, email,
  phone, address, DOB, government/loyalty ids, free-text answers, customer-facing
  URLs containing a token) → gate it in the query builder behind
  `fullCustomerAccess`, make the model field nullable, and add builder tests for
  both branches. When in doubt, gate it.
- **Adding a booking operation that reads or moves money** → route it through
  the existing `assertPiiAccess`-style guard in `BookingService` so it throws
  `PiiAccessDisabledError` before the request.
- **Never** filter PII in a converter, in the service after the response lands,
  or by post-processing a model — the point is that the data never crosses the
  network.
- The booking **webhook registration query** (`BOOKING_WEBHOOK_GQL_QUERY`) is
  deliberately unaffected: it is the maximal selection, built from the full field
  fragments and pinned by the drift-guard test. Gating changes the *runtime read
  path* only. If you reorder fields in a builder, the drift-guard test will fail —
  keep new PII groups positioned so the maximal selection's order stays stable.
- Any change here must be reflected in **all four** docs: `README.md`
  ("Access options / PII"), `llms.txt`, `docs/webhooks.md`, and
  `docs/internal/ARCHITECTURE.md` §4b.

# Coding Standards

- Except for log messages, do not put static strings directly in the code.
  Declare them as `const` (e.g. the `ERROR_*` and status constants at the top of
  the booking service) and share them where useful.
- Look for opportunities to simplify by extracting helper functions instead of
  duplicating logic; review new code for obvious duplication once complete.
- Don't put `await` inside a loop for independent work — use `Promise.all()`
  (see `addAddon` resolving the booking sale and parent item in parallel).
  Genuinely sequential work is the exception: cursor pagination
  (`BookingService.fetchPaginated`) must await each page to get the next cursor.
- Keep converters pure so they can be unit-tested without a client. Tests inject
  a fake `fetch` (and sometimes a fake `GraphQLClient`) — never hit the real
  network.
- Input validation lives in the service layer (id prefixes, currency format,
  positive-integer quantities, etc.); `normalizeBookingId` lowercases and
  converts `-` → `_`.

# Versioning

**Do not change the `version` in `package.json` unless the user explicitly asks
for it.** Code changes alone do not warrant a version bump. The package follows
`major.minor.patch` semver independently of the connector. Note `0.0.0` is the
pre-release placeholder and cannot be re-published once a real version ships.

# Build / test commands

The canonical npm scripts:

```bash
npm run typecheck      # tsc --noEmit
npm run lint           # eslint .   (lint:fix to autofix)
npm run test           # vitest run
npm run test:coverage  # vitest run --coverage  (enforces the 95% gate)
npm run build          # tsup — dual ESM+CJS + .d.ts/.d.cts
npm run check:exports  # attw --pack .   (type-resolution for both module systems)
npm run check:publint  # publint
```

Sandbox quirks (this environment): `npm install` fails on a dependency
install-script spawn — use `npm install --ignore-scripts`. If the
`node_modules/.bin/*` shims fail to resolve, invoke the real binaries directly:
`node node_modules/typescript/bin/tsc --noEmit`,
`node node_modules/vitest/vitest.mjs run --coverage`,
`node node_modules/eslint/bin/eslint.js .`,
`node node_modules/tsup/dist/cli-default.js`.

# Review Checklist

## Once complete
- Review the new code for obvious duplication; simplify with helper functions.
- Run the linter, the type checker, and the unit tests (with coverage).
- Update `docs/internal/ARCHITECTURE.md` if the public surface, resources, or build changed.
- Update `docs/external/pricing-api.md` if the pricing surface changed, and
  `llms.txt` if the public entry points changed.
