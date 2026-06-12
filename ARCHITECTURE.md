# Architecture — `@peek-travel/app-utilities`

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
`bookings`. Clean data shapes live in `src/models/`.

A resource may split into more than one triad when it carries a distinct
sub-domain. `bookings` does: alongside `booking-queries`/`booking-converter`,
the add-on flows live in `addon-queries.ts` (the `sales` add-ons query + raw
node shapes) and `addon-converter.ts` (raw node → the internal `AddonItem`
detail model and the clean public `BookingAddon`). The detailed `AddonItem`
model (refids + reservation statuses) is **internal only** — consumers see just
the grouped `BookingAddons`; the internal model exists solely so add/remove can
build their mutation payloads.

Recurring patterns inside services:
- **Cursor pagination** is handled internally and transparently — e.g.
  `ProductService` gathers every add-on page; `BookingService.fetchPaginated`
  walks `pageInfo.hasNextPage`/`endCursor`. Callers get a single flat array.
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
internal.

## Build & tooling

- **Bundler:** `tsup` (`tsup.config.ts`) emits a dual **ESM + CJS** build plus
  bundled `.d.ts`/`.d.cts`, with sourcemaps, tree-shaking, no minify.
- **Package entry points:** modern `exports` map with separate `import`/`require`
  conditions and their own type declarations; legacy `main` (`./dist/index.cjs`),
  `module`, and `types` provided as fallbacks. `"sideEffects": false` enables
  tree-shaking. The dual build is intended to support both `import` and
  `require` consumers (notably the Node 22 / CommonJS Firebase Functions runtime).
- **TypeScript:** `NodeNext` module resolution, `ES2022` target, full `strict`
  plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `noUnusedLocals/Parameters`,
  `verbatimModuleSyntax`, `isolatedModules`. Source imports use explicit `.js`
  extensions (required by NodeNext ESM).
- **Lint:** ESLint flat config with `@eslint/js` + `typescript-eslint` recommended.
- **Tests:** Vitest, Node environment. Coverage via `v8` with **95% thresholds**
  on lines/functions/branches/statements. Tests inject a fake `fetch` (and
  sometimes a fake `GraphQLClient`) to exercise transport, retries, error
  mapping, pagination, and converters without real network calls.
- **Publish guard:** `prepublishOnly` runs the build then `publint` and
  `@arethetypeswrong/cli` (`attw`) to verify the `exports` map / type resolution
  for both module systems. `files: ["dist"]` whitelists only the build output;
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
- `vitest run` — **223 tests across 24 files pass.**
- Coverage — 99.87% lines / 96.21% branches / 100% functions (above thresholds).
- `tsup` build — produces ESM, CJS, and both `.d.ts` flavors successfully.

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

7. **Repo / directory / package name all differ.** The checkout and repo are
   `peek-gql-js-mapper` while the package is `@peek-travel/app-utilities`.
   Harmless (GitHub Packages links them via the `repository` field), but can be
   mildly confusing.

8. **`jsonwebtoken` for HMAC-only signing.** It's the single runtime dependency
   and pulls a fair amount of transitive weight for what is effectively an
   HMAC-SHA `sign()`. Not a problem, just noting it's the one thing standing
   between this and a zero-runtime-dependency library; Node's built-in `crypto`
   could sign the JWT if footprint ever matters.

9. **No validation that `leewaySeconds < ttlSeconds`.** If a caller sets leeway
   ≥ TTL, the cached token's `expiresAtMs` would be in the past and a fresh JWT
   would be minted on every request. Low risk (defaults are sane), but unguarded.
