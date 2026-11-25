# Architecture — `@peektravel/app-utilities`

A small, dependency-light TypeScript library that wraps the Peek "backoffice"
GraphQL gateway. It hides the raw GraphQL queries, authentication, HTTP
transport, retry logic, and response shapes behind a single authenticated entry
point (`PeekAccessService`) that hands out per-resource services returning clean,
plain-object data models.

Consumers never see GraphQL. They construct one access service per install and
call typed methods on the per-resource services, e.g.
`peek.getProductService().getAllProducts()`.

The package also ships **sibling accessors for other backoffices** —
`CngAccessService` and `AcmeAccessService` (both REST, not GraphQL). They reuse
this package's auth (`TokenManager`), retry/backoff loop, `Logger`, base error
types, tooling, and the Odyssey UI — differing only in transport (REST vs
GraphQL) and gateway routing (`cng_backoffice_api-v1` /
`acme_backoffice_api-v1` vs `peek_backoffice_api-v1`). See
[REST accessors — CNG & ACME](./rest-accessors.md).

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

## Detailed topics

This overview stays intentionally short. Each area of the codebase has its own
focused doc in this folder — read the one you need rather than the whole thing:

- **[Access service & authentication](./access-and-auth.md)** —
  `PeekAccessService` (config validation, base-URL/slug resolution, v1/v2
  modes, JWT verification), the `TokenManager`, and the public API surface
  re-exported from `src/index.ts`.
- **[Transport & SDK identity](./transport.md)** — the Peek `GraphQLClient`, the
  retry/backoff + error-mapping core shared with the REST transports, and the
  `x-peek-sdk` header / `?sdk=js-<version>` query string (the version lives,
  front and center, in `src/version.ts`).
- **[Per-resource services](./resources.md)** — the three-file triad pattern
  (`*-queries` / `*-converter` / `*-service`) and every Peek resource (products,
  bookings, timeslots, seatmaps, pricing, reviews, custom questions, …), plus the
  booking / waiver / install **webhook** surfaces.
- **[Access options / PII](./pii.md)** — the load-bearing `fullCustomerAccess`
  switch: what it gates, how PII is filtered at the query-builder layer (never in
  converters), and which payment/booking-modification operations it disables.
- **[REST accessors — CNG & ACME](./rest-accessors.md)** — the brand-parallel
  `CngAccessService` / `AcmeAccessService` (REST, not GraphQL) that reuse the Peek
  auth, transport core, and tooling.
- **[UI components](./ui.md)** — the browser-only `./ui` subpath: the Odyssey
  Web Components, design tokens, and their load-bearing rendering rules.
- **[Build, tooling & flagged issues](./build-and-tooling.md)** — bundler,
  package entry points, TypeScript / lint / test configuration, publishing, and
  standing caveats.

## Keeping these docs current

When you change the code, update the matching topic doc in the **same change** so
it never drifts — a new resource or triad goes in
[per-resource services](./resources.md); a public-surface change in
[access & authentication](./access-and-auth.md); a PII/`fullCustomerAccess`
change in [Access options / PII](./pii.md) (and the other three PII docs listed
in `CLAUDE.md`); a build/tooling change in
[build & tooling](./build-and-tooling.md).
