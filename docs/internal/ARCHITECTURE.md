# Architecture — `@peektravel/app-utilities`

A small, dependency-light TypeScript library that wraps the Peek "backoffice"
GraphQL gateway. It hides the raw GraphQL queries, authentication, HTTP
transport, retry logic, and response shapes behind a single authenticated entry
point (`PeekAccessService`) that hands out per-resource services returning clean,
plain-object data models.

Consumers never see GraphQL. They construct one access service per install and
call typed methods like `peek.getProductService().getAllProducts()`.

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

- Validates the five required config fields (`installId`, `jwtSecret`, `issuer`,
  `appId`, `gatewayKey`) and throws on any empty value.
- Constructs a single shared `TokenManager` and `GraphQLClient`.
- Exposes one `get<Resource>Service()` accessor per resource. Each is **lazily
  created and memoized** — repeated calls return the same instance.
- Composes dependencies between services where needed:
  - `TimeslotService` receives the resource-pool and account-user services (for
    guide resolution).
  - `BookingService` receives the product service (for add-on → parent-item
    resolution).
- Optional config: `baseUrl`, `tokenTtlSeconds` (3600), `tokenRefreshLeewaySeconds`
  (60), `retryDelaysMs` (`[1000, 2000, 4000]`), `logger` (no-op default),
  `fetch` (global default), `itemOptionsPageSize` (50).

### 2. `TokenManager` — auth
`src/internal/token-manager.ts`

- Signs a short-lived HMAC JWT with `jsonwebtoken` (`subject = installId`,
  `issuer = app name`, `expiresIn = ttlSeconds`). Payload is empty.
- Caches the token and re-mints it once it is within `leewaySeconds` of expiry.

### 3. `GraphQLClient` — transport
`src/internal/graphql-client.ts`

The only place that touches the network. Responsibilities:

- Builds the endpoint URL as `${baseUrl}/${appId}/${endpointName}`. Today every
  operation routes through the single `sales` endpoint (`gateway-endpoints.ts`).
- Sets headers: `X-Peek-Auth: Bearer <jwt>`, `pk-api-key: <gatewayKey>`,
  `Content-Type: application/json`.
- Collapses query whitespace (`\s+` → single space) before sending.
- Retries HTTP 429 using the configured backoff delays, then throws
  `RateLimitError`.
- Maps known failures to typed errors:
  - HTTP 418 → `AdminAccountRequiredError`
  - HTTP 429 (after retries) → `RateLimitError`
  - GraphQL `errors` array present → `PeekGraphQLError` (raw errors preserved on
    `.graphqlErrors`)
  - other non-2xx → generic `Error` with the status.

### 4. Per-resource services
`src/internal/<resource>/`

Each resource follows the same **three-file triad**:

| File | Role |
| --- | --- |
| `*-queries.ts` | Raw GraphQL query/mutation strings, the matching response interfaces, and small variable-builder/normalizer helpers. **Internal only** — never re-exported. |
| `*-converter.ts` | Pure, I/O-free functions mapping raw GraphQL nodes → clean models. Easy to unit-test. |
| `*-service.ts` | Public class holding the business logic; calls the shared client, then runs the converter. |

Resources: `products`, `account-users`, `resource-pools`, `timeslots`,
`resellers`, `promo-codes`, `daily-notes`, `availability`, `memberships`,
`bookings`, `reviews`. Clean data shapes live in `src/models/`.

`waivers` is a **webhook-only resource**: it has no GraphQL reads (so no
queries/service/converter triad), just `src/internal/waivers/waiver-webhook.ts`
and the `src/models/waiver.ts` model. See the webhook notes below.

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
webhook module and the model. The detailed `AddonItem`
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
- **Input validation** lives in the service (booking id prefix `b_`/`B-`,
  3-letter currency, positive-integer quantities, allowed payment sources, etc.).
  `normalizeBookingId` lowercases and converts `-` → `_`.

### 5. Public API surface
`src/index.ts`

The barrel re-exports only the public contract: `PeekAccessService` + its config,
each resource service class (and the options/result types callers need), all
data-model **types**, the `Logger` interface + `noopLogger`, and the three typed
error classes. Query strings and raw response interfaces are deliberately kept
internal — including the booking-webhook registration query
(`BOOKING_WEBHOOK_GQL_QUERY` stays internal, documented via `docs/webhooks.md`).
The webhook-related public exports are the two parsers `parseBookingWebhook` and
`parseWaiverWebhook` (plus the `Waiver` model type; see the webhook notes above).

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
- **Dependency-free & token-based.** No `ember-power-select`/`-calendar`,
  `svg-jar`, or bootstrap. Colours/spacing reference the `tokens.css` custom
  properties; icons are inlined; button variant colours (which live in a
  bootstrap base layer upstream) are reproduced from Odyssey tokens.
- **Scope:** ~46 components across display, layout, form-input, interactive,
  overlay, and data/selection tiers. The layout tier includes
  `ody-page-container` — the required full-bleed wrapper for app **settings**
  UIs, sized to the two settings-host iframe widths (868px / 1310px) and
  exposing an `ody-page` CSS container context for the content within. The data/selection tier — `dropdown-single`,
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
