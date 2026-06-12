# @peek-travel/app-utilities

GraphQL JS mapping utilities extracted from the Peek Pro Autopilot connector.
The package owns the GraphQL queries, authentication, transport, and the
conversion into clean TypeScript data models — callers work only with the
high-level `PeekAccessService` and the plain data shapes it returns.

## Install

This package is published to **GitHub Packages** (a private registry), not the
public npm registry. Point the `@peek-travel` scope at GitHub Packages once per
consuming project by adding an `.npmrc` next to its `package.json`:

```ini
@peek-travel:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

Then install (and later update) it like any other dependency:

```bash
npm install @peek-travel/app-utilities
npm update  @peek-travel/app-utilities
```

`NPM_TOKEN` must be a GitHub token with the `read:packages` scope. Locally that's
a personal access token in your environment; in cloud builds (Firebase
Functions / Google Cloud Build, CI) set it as a build secret/env var. See
[Releasing](#releasing-github-packages) for how new versions are published.

## Usage

Configure one access service per install with everything it needs to
authenticate and reach the gateway. It mints and caches a short-lived JWT on
demand and hands out per-resource services that own the resource-specific calls.

```ts
import { PeekAccessService, type Product } from '@peek-travel/app-utilities';

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

## Releasing (GitHub Packages)

Releases are automated. Pushing a `v*.*.*` git tag triggers
`.github/workflows/publish.yml`, which typechecks, lints, runs the test suite
(95% coverage gate), then publishes to GitHub Packages. `npm publish` runs
`prepublishOnly` first, so the build plus `publint` + `attw` checks gate every
release.

To cut a release:

```bash
npm version patch          # or minor / major — bumps package.json and creates a git tag
git push --follow-tags     # pushes the commit + tag; the workflow publishes
```

The workflow asserts the tag matches the `package.json` version, so the two
never drift. The repo's built-in `GITHUB_TOKEN` (with `packages: write`) handles
publish auth — no personal token needed in CI. Consumers then pick the new
version up with a normal `npm update` (see [Install](#install)).

> One-time setup: the package scope `@peek-travel` must match the GitHub org
> that owns the package, and the repo needs the GitHub Actions permission to
> write packages (granted by the `packages: write` permission in the workflow).

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
src/        source (public API barrel: src/index.ts)
test/       vitest unit tests
dist/       build output (generated, git-ignored)
```
