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
- **Keep the interactive HTML reference in sync.** `docs/html/peek.html`,
  `docs/html/cng.html`, and `docs/html/acme.html` are self-contained, interactive
  reference docs (left-nav, filter, light/dark toggle) for the top-level service
  classes and the data models each returns — `peek.html` covers the Peek domain,
  `cng.html` the CNG domain, `acme.html` the ACME domain. Whenever you add,
  remove, rename, or change a **service class**, a **public service method** (its
  name, parameters, return type, PII gating, validation, or error behavior), or a
  **data model** (any field, its type, or nullability) in the matching domain, you
  MUST update the corresponding HTML file in the same change so it never drifts
  from the code. The content lives in the `render({ … })` data object near the
  bottom of each file — edit the `services` and `models` arrays; service- and
  model-name references in signatures/types auto-link, so use the exact exported
  type names. Do not log these doc updates in `changelog.md` (they are not a
  caller-facing API change). The three files MUST stay structurally identical:
  same `<head>`, CSS, and `render()` renderer — **only** the `render({ … })` data
  object differs between them. When you change the renderer or styling, apply the
  identical change to all three. The load-bearing conventions the renderer and
  data must follow:
  - **Ordering is automatic — do not hand-order the arrays.** The renderer sorts
    at runtime: the root `*AccessService` (e.g. `PeekAccessService`) is always
    pinned first, every other service class is listed alphabetically, and every
    data model is listed alphabetically. Both the left-nav and the cards use this
    order. Just add a new entry anywhere in the array; it sorts into place.
  - **Only the root access service shows a `Constructor`.** Per-resource service
    classes are never constructed directly by callers, so document them with an
    `obtain` field naming the access-service accessor (e.g.
    `PeekAccessService.getBookingService()`), not a `ctor`. Reserve `ctor` for the
    root `*AccessService`.
  - Keep the root access-service card lean — no free-form "Behavior" `notes`
    block on it; put per-method detail on the methods themselves.
  - The access-service card lists only its `get…Service()` accessors (and genuine
    access-level methods like `verifyPeekAuthToken`) — never the deprecated
    short-form proxies. Its `example` should reach data through a service
    accessor (e.g. `peek.getProductService().getAllProducts()`), not a short-form.
  - **Model inheritance is expressed with `extends`, never by copying fields.**
    When a model type extends another (e.g. `PeekAccessServiceConfig extends
    BaseAccessServiceConfig`), give the child model an `extends: "ParentName"`
    key and list ONLY its own fields. The renderer links the parent and appends
    the parent's fields as inherited rows automatically (following the chain), so
    do not re-list inherited fields on the child. The parent must exist as its
    own model entry in the same file.
  - **Keep transport/implementation detail out of the copy.** These pages
    document the caller-facing surface — service classes, methods, and clean
    models — not how the package talks to the gateway. Do not mention GraphQL vs
    REST, "…gateway"/"transport" framing, raw HTTP verbs/endpoint paths, or the
    internal transport clients (e.g. `RestClient`). Describe behavior in terms a
    consumer cares about (what a method returns, when it throws, what defaults
    apply). The one deliberate exception is a single, low-key `GraphQLClient`
    reference in the `PeekAccessService` description; keep it deemphasized (do not
    reintroduce it into the hero subtitle or elsewhere).
- **`docs/html/ui.html` is the live UI-component reference** — the HTML twin of
  `docs/ui.md`, in the same shell (left-nav, filter, light/dark toggle) but with
  every `<ody-*>` component **rendered live**. It renders the real components by
  loading vendored build artifacts from `docs/html/assets/`: `odyssey.iife.js`
  (a classic-script IIFE bundle of `src/ui`, chosen over an ESM module so it also
  works when the file is opened over `file://`), plus `odyssey.css` and
  `tokens.css`. Keep `ui.html` in sync with `docs/ui.md` and the components, and
  **regenerate the vendored assets whenever `src/ui` changes**:

  ```bash
  npm run build   # tsup → dist/ui/index.js + dist/ui/{odyssey,tokens}.css
  node node_modules/esbuild/bin/esbuild dist/ui/index.js --bundle \
    --format=iife --global-name=OdysseyUI --outfile=docs/html/assets/odyssey.iife.js
  cp dist/ui/odyssey.css dist/ui/tokens.css docs/html/assets/
  ```

  The page catalog lives in the `render([...])` data at the bottom of `ui.html`
  (each component: tag, `use`, `demo` markup rendered live, attribute/property/
  event tables; a few need an `init` hook run after `whenOdysseyReady`). Add new
  platform/UI pages to `docs/index.html` too.
- Ensure test coverage remains above 95% (the Vitest gate enforces this on
  lines/functions/branches/statements).
- Unless told otherwise, after everything is done, run the linter and fix any
  errors.
- **Keep `changelog.md` up to date.** `changelog.md` is the consumer-facing
  changelog — it records only changes a **caller** can observe or act on, grouped
  by version. Any change that is potentially breaking for an existing consumer — a
  changed event contract, a removed/renamed attribute or serialization format, an
  altered default, a lifecycle/behavior change, or anything that requires callers
  to update their code — MUST be recorded there under the target version's header
  with (a) what changed, (b) why, and (c) the concrete action the caller has to
  take. Caller-visible fixes and new capabilities may be logged too, marked with
  their tag. **Do not** log internal-only work (refactors, test changes, invisible
  cleanups). Add the entry in the same change that makes the code change; never let
  `changelog.md` drift behind the code.

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
- **An access service exposes only its resource-service accessors.** The root
  `*AccessService` (`PeekAccessService` / `CngAccessService` / `AcmeAccessService`)
  should hand out the per-resource service classes via its `get…Service()`
  accessors (plus genuine access-level concerns like `verifyPeekAuthToken`), and
  nothing else. Do **not** add new top-level "short-form" proxy methods that
  delegate straight to a resource-service method (e.g. `getAllActivities()` →
  `getProductService().getAllActivities()`) — callers should reach those through
  the service accessor. The existing short-forms are retained for
  backwards-compatibility but are marked `@deprecated`; keep them deprecated,
  don't add more, and don't promote them in examples or docs.
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
- Update the matching `docs/html/*.html` reference (`peek`/`cng`/`acme`) if any
  service class, public method, or data model in that domain changed.
- Record any caller-visible change (and, for breaking ones, the caller's required action) in `changelog.md`.
