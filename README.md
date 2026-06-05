# @peek-pro/gql-js-mapper

GraphQL JS mapping utilities extracted from the Peek Pro Autopilot connector.
The package owns the GraphQL queries, authentication, transport, and the
conversion into clean TypeScript data models — callers work only with the
high-level `PeekAccessService` and the plain data shapes it returns.

## Install

```bash
npm install @peek-pro/gql-js-mapper
```

## Usage

Configure one access service per install with everything it needs to
authenticate and reach the gateway. It mints and caches a short-lived JWT on
demand and hands out per-resource services that own the resource-specific calls.

```ts
import { PeekAccessService, type Product } from '@peek-pro/gql-js-mapper';

const peek = new PeekAccessService({
  installId: 'install-123', // JWT subject
  jwtSecret: process.env.PEEK_INTERNAL_SECRET!, // signs the JWT
  issuer: process.env.APP_NAME!, // JWT issuer
  appId: process.env.PEEK_APP_ID!, // gateway path segment
  gatewayKey: process.env.PEEK_GATEWAY_KEY!, // pk-api-key header
});

const products: Product[] = await peek.getProductService().getAllProducts();
```

The access service is the authenticated root; each `get<Resource>Service()`
returns a (memoized) service that owns that resource's calls.

`getAllProducts()` returns a single flat list of activities **and** add-ons
(add-ons tagged with `ADD_ON_PRODUCT_TYPE`), gathering all cursor-paginated
add-on pages for you.

## Resources

| Accessor | Methods |
| --- | --- |
| `getProductService()` | `getAllProducts()` |
| `getAccountUserService()` | `getAll()`, `getById(userId)` |
| `getResourcePoolService()` | `getAll(mode?)` |
| `getTimeslotService()` | `getForDay()`, `getById()`, `setAvailability()`, `setNotes()`, `assignGuide()` |
| `getResellerService()` | `getAllChannels(agentsPerChannel?)` |
| `getPromoCodeService()` | `getAll()`, `create(input)` |
| `getDailyNoteService()` | `getToday()`, `update(note)` |
| `getAvailabilityService()` | `getAvailabilityTimes(query)` |
| `getMembershipService()` | `getAll()`, `purchase(input)` |
| `getBookingService()` | `getById()`, `searchByTimeRange()`, `searchByTimeslot()`, `getGuests()`, `getPaymentsOnFile()`, `appendNote()`, `setCheckinStatus()`, `cancel()`, `makePayment()`, `refund()`, `createInvoiceLink()`, `addAddon()`, `create()` |

### Optional configuration

| Option | Default | Purpose |
| --- | --- | --- |
| `baseUrl` | Peek production gateway | Override the GraphQL gateway base URL |
| `tokenTtlSeconds` | `3600` | JWT lifetime |
| `tokenRefreshLeewaySeconds` | `60` | Re-mint this long before expiry |
| `retryDelaysMs` | `[1000, 2000, 4000]` | Backoff for HTTP 429 retries |
| `logger` | no-op | Inject a `Logger` for diagnostics |
| `fetch` | global `fetch` | Custom fetch (e.g. for tests) |
| `itemOptionsPageSize` | `50` | Add-on pagination page size |

### Errors

- `AdminAccountRequiredError` — gateway returned HTTP 418.
- `RateLimitError` — HTTP 429 after retries were exhausted.
- `PeekGraphQLError` — the response contained a GraphQL `errors` array
  (preserved on `.graphqlErrors`).

The package ships dual ESM + CommonJS builds with bundled type declarations, so
both `import` and `require` consumers (including the Node 22 / CommonJS Firebase
Functions runtime) resolve correctly. Its only runtime dependency is
`jsonwebtoken`.

## Development

```bash
npm install        # install dependencies
npm run build      # bundle ESM + CJS + .d.ts into dist/ (tsup)
npm run dev        # rebuild on change
npm test           # run unit tests (vitest)
npm run test:coverage
npm run typecheck  # tsc --noEmit
npm run lint       # eslint (flat config)
```

### Before publishing

`prepublishOnly` builds the package and runs [`publint`](https://publint.dev)
and [`@arethetypeswrong/cli`](https://github.com/arethetypeswrong/arethetypeswrong.github.io)
to verify the `exports` map and type resolution are correct for both module
systems.

## Project layout

```
src/        source (public API barrel: src/index.ts)
test/       vitest unit tests
dist/       build output (generated, git-ignored)
```
