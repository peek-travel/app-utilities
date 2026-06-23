# @peektravel/app-utilities

GraphQL JS mapping utilities extracted from the Peek Pro Autopilot connector.
The package owns the GraphQL queries, authentication, transport, and the
conversion into clean TypeScript data models — callers work only with the
high-level `PeekAccessService` and the plain data shapes it returns.

## Install

This package is published to the **public npm registry**. Install (and later
update) it like any other dependency — no registry config or auth token needed:

```bash
npm install @peektravel/app-utilities
npm update  @peektravel/app-utilities
```

See [Releasing](#releasing) for how new versions are published.

## Usage

Configure one access service per install with everything it needs to
authenticate and reach the gateway. It mints and caches a short-lived JWT on
demand and hands out per-resource services that own the resource-specific calls.

```ts
import { PeekAccessService, type Product } from '@peektravel/app-utilities';

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

Two kinds of failures surface as exceptions:

**Typed gateway errors** (importable, branch on the class):

- `AdminAccountRequiredError` — gateway returned HTTP 418 (install lacks admin
  rights). Carries `.statusCode === 418`.
- `RateLimitError` — HTTP 429 after the configured `retryDelaysMs` backoff was
  exhausted. Carries `.statusCode === 429`.
- `PeekGraphQLError` — the response contained a GraphQL `errors` array, preserved
  on `.graphqlErrors`.

**Plain `Error` validation/precondition failures** thrown by the service layer
*before* any network call — e.g. an empty config field, a `bookingId` that
doesn't resolve to a `b_…` id, a non-positive-integer `quantity`, a malformed
currency, or a "booking not found". Branch on `.message` only as a last resort;
prefer guarding inputs to the documented formats below.

```ts
import {
  PeekAccessService,
  RateLimitError,
  AdminAccountRequiredError,
  PeekGraphQLError,
} from '@peektravel/app-utilities';

try {
  await peek.getBookingService().makePayment({ /* … */ });
} catch (err) {
  if (err instanceof RateLimitError) {
    // back off and retry later
  } else if (err instanceof AdminAccountRequiredError) {
    // this install can't perform admin-only operations
  } else if (err instanceof PeekGraphQLError) {
    console.error(err.graphqlErrors); // raw gateway errors
  } else {
    throw err; // validation / precondition failure
  }
}
```

## Conventions & input formats

These rules are enforced in the service layer (a violation throws a plain
`Error` before any request):

- **Booking ids** are normalized internally — lowercased with `-` → `_` — so
  `B-ABC123` and `b_abc123` are equivalent. Payment/refund operations require an
  id that resolves to the `b_…` form.
- **Quantities** (add-ons, etc.) are **positive-integer strings**: `"1"`, `"2"`.
- **Currency** is a 3-letter uppercase ISO code: `"USD"`, `"EUR"`.
- **Amounts** are numeric strings: `"25.00"`.
- **Payment source ids** are `ps_…`, or one of `cash/cash`, `custom/other`,
  `custom/voucher`. **Payment ids** (refunds) are `pmt_…`.
- **Idempotency keys** are required on `makePayment`, `refund`, and any
  `create({ markAsPaid: true })`; pass a stable UUID (`crypto.randomUUID()`).
- **`create()` takes pre-resolved ids only** — no free-text matching. Resolve
  `activityId` + ticket `resourceOptionId`s from `getProductService()` and
  `availabilityTimeId` from `getAvailabilityService()`.
- **Add-on option ids** are ticket ids on products whose `type` is
  `ADD_ON_PRODUCT_TYPE`.

## Recipes

**Find an activity and its add-ons**

```ts
import { ADD_ON_PRODUCT_TYPE, type Product } from '@peektravel/app-utilities';

const products: Product[] = await peek.getProductService().getAllProducts();
const activities = products.filter((p) => p.type !== ADD_ON_PRODUCT_TYPE);
const addons = products.filter((p) => p.type === ADD_ON_PRODUCT_TYPE);
```

**Create a paid booking end-to-end**

```ts
import { randomUUID } from 'node:crypto';

const products = await peek.getProductService().getAllProducts();
const activity = products.find((p) => p.name === 'Sunset Kayak Tour')!;

const [slot] = await peek.getAvailabilityService().getAvailabilityTimes({
  activityId: activity.productId,
  date: '2026-06-20',
  resourceOptionQuantities: [{ resourceOptionId: activity.tickets[0]!.id, quantity: 2 }],
});

const created = await peek.getBookingService().create({
  activityId: activity.productId,
  availabilityTimeId: slot.availabilityTimeId,
  tickets: [{ resourceOptionId: activity.tickets[0]!.id, quantity: 2 }],
  guest: { name: 'Sam Rivera', email: 'sam@example.com' },
  markAsPaid: true,
  idempotencyKey: randomUUID(),
});
console.log(created.bookingId, created.balanceFormatted);
```

**Add an add-on to an existing booking**

```ts
const { updatedBookingAddons } = await peek
  .getBookingService()
  .addAddon('b_abc123', { addonOptionId: 'io_helmet', quantity: '2' });
```

**Look up a booking with guests and balance**

```ts
const booking = await peek.getBookingService().getById('b_abc123', {
  includeGuests: true,
  includePriceBreakdown: true,
});
if (booking) {
  console.log(booking.displayId, booking.outstandingBalanceDisplay);
}
```

The package ships dual ESM + CommonJS builds with bundled type declarations, so
both `import` and `require` consumers (including the Node 22 / CommonJS Firebase
Functions runtime) resolve correctly. Its only runtime dependency is
`jsonwebtoken`.

## Releasing

Releases are automated. Pushing a `v*.*.*` git tag triggers
`.github/workflows/publish.yml`, which typechecks, lints, runs the test suite
(95% coverage gate), then publishes to the public npm registry. `npm publish`
runs `prepublishOnly` first, so the build plus `publint` + `attw` checks gate
every release.

To cut a release:

```bash
npm version patch          # or minor / major — bumps package.json and creates a git tag
git push --follow-tags     # pushes the commit + tag; the workflow publishes
```

The workflow asserts the tag matches the `package.json` version, so the two
never drift. Publish auth uses an `NPM_TOKEN` repository secret (an npm
automation token with publish rights to the `@peektravel` scope), exposed to
`npm publish` as `NODE_AUTH_TOKEN`. Consumers then pick the new version up with
a normal `npm update` (see [Install](#install)).

> One-time setup: add an `NPM_TOKEN` secret to the repository (Settings →
> Secrets and variables → Actions). Generate it on npmjs.com as an **Automation**
> token so it bypasses 2FA in CI.

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

### Release checks

`prepublishOnly` builds the package and runs [`publint`](https://publint.dev)
and [`@arethetypeswrong/cli`](https://github.com/arethetypeswrong/arethetypeswrong.github.io)
to verify the `exports` map and type resolution are correct for both module
systems. The publish workflow runs these automatically — see
[Releasing](#releasing-github-packages).

## Project layout

```
src/                       source (public API barrel: src/index.ts)
test/                      vitest unit tests
dist/                      build output (generated, git-ignored)
docs/internal/             maintainer docs (ARCHITECTURE.md — not shipped)
llms.txt                   AI-agent quickstart (shipped in the package)
```
