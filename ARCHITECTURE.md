# Architecture — `@peek-pro/gql-js-mapper`

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

Recurring patterns inside services:
- **Cursor pagination** is handled internally and transparently — e.g.
  `ProductService` gathers every add-on page; `BookingService.fetchPaginated`
  walks `pageInfo.hasNextPage`/`endCursor`. Callers get a single flat array.
- **Composition** — `BookingService.addAddon` resolves an add-on's parent item
  through `ProductService`; `TimeslotService.assignGuide` resolves guides
  through the resource-pool + account-user services using the pure
  `matchGuideToResourcePool` matcher (`timeslots/guide-matcher.ts`).
- **Multi-step mutations** — booking creation (`createQuoteV2` →
  `createOrderFromQuote`) and add-on insertion (`createQuoteFromOrder` →
  `updateQuoteV2` → `amendOrder`) are orchestrated as ordered request chains
  with per-step error checks.
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

### Verified current state (this review)
- `tsc --noEmit` — clean.
- `eslint .` — clean.
- `vitest run` — **202 tests across 23 files pass.**
- Coverage — 99.86% lines / 96.66% branches / 100% functions (above thresholds).
- `tsup` build — produces ESM, CJS, and both `.d.ts` flavors successfully.

## Flagged issues & unusual configuration

These are observations, not blockers. Nothing here breaks the build.

1. **No `prepare`/`prepack` script — only `prepublishOnly`.** The package builds
   `dist/` only on `npm publish`. Installing it directly from a **git URL** (a
   common pattern for private/internal packages) would yield a package with no
   `dist/`, since `dist/` is git-ignored. If anyone consumes this from git rather
   than a published tarball, add a `prepare` script. *(Most likely the intent is
   registry-only distribution, in which case this is fine.)*

2. **No registry / `.npmrc` for a scoped restricted package.** `publishConfig`
   sets `access: "restricted"` but no `registry`, and there is no committed
   `.npmrc`. Publishing and the README's `npm install @peek-pro/gql-js-mapper`
   both depend on the consumer's ambient npm auth being configured for the
   `@peek-pro` scope. Worth documenting where this is meant to be published
   (public npm private package vs. a private registry).

3. **`version` is still `0.0.0`** and `license` is `UNLICENSED`. Expected for a
   pre-release internal package; just note it must be bumped before any publish
   (and `0.0.0` cannot be re-published).

4. **No CI configuration** (`.github/workflows` etc.). The repo has the full
   `typecheck` / `lint` / `test` / `check:*` script suite but nothing runs them
   automatically on push/PR. Recommend wiring these into CI.

5. **Transport response-handling order is slightly fragile.** In
   `GraphQLClient.request`, the body is parsed with `response.json()` and the
   GraphQL `errors` array is checked *before* `response.ok`. A non-2xx response
   whose body is **not valid JSON** (e.g. an HTML 500/502 from a proxy) would
   throw a raw `SyntaxError` from `json()` rather than the intended
   `"GraphQL request failed with HTTP <status>"` error. Consider checking
   `response.ok` / content-type before parsing, or guarding the `json()` call.

6. **Minimal package metadata.** No `repository`, `author`, `bugs`, `homepage`,
   or `keywords` fields. Cosmetic, but `repository` in particular is helpful for
   internal discoverability.

7. **Repo directory vs. package name mismatch.** The checkout is
   `peek-gql-js-mapper` while the package is `@peek-pro/gql-js-mapper`. Harmless,
   but can be mildly confusing.

8. **`jsonwebtoken` for HMAC-only signing.** It's the single runtime dependency
   and pulls a fair amount of transitive weight for what is effectively an
   HMAC-SHA `sign()`. Not a problem, just noting it's the one thing standing
   between this and a zero-runtime-dependency library; Node's built-in `crypto`
   could sign the JWT if footprint ever matters.

9. **No validation that `leewaySeconds < ttlSeconds`.** If a caller sets leeway
   ≥ TTL, the cached token's `expiresAtMs` would be in the past and a fresh JWT
   would be minted on every request. Low risk (defaults are sane), but unguarded.
