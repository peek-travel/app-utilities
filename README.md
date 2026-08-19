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

Before updating to a new version, consult [`changelog.md`](./changelog.md) —
it records every caller-visible change grouped by version, including any
breaking changes and the concrete action you need to take to migrate.

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
| `accessOptions` | `{ fullCustomerAccess: false }` | PII exposure — see [Access options / PII](#access-options--pii) |

### Access options / PII

Every access service accepts `accessOptions?: AccessOptions` — today a single
flag, `fullCustomerAccess` (default `false`). It's an object so future cross-cutting
flags can be added without breaking signatures.

With `fullCustomerAccess` **off** (the default):

- **Customer PII is never requested** (the GraphQL queries omit the fields, so
  they come back `null`/empty): booking guest identity (name/email/phone/DOB/
  postal code/GDPR + custom field responses — guests keep only ids and
  participation/opt-in flags), booking custom question answers, the customer
  `portalUrl`, and review reviewer `customerName`/`customerEmail`. Waiver
  webhooks (a fixed payload with no query to trim) instead have `guestName` and
  `fileUrl` redacted at parse time.
- **Payment / booking-modification operations are disabled** —
  `getPaymentsOnFile`, `makePayment`, `refund`, `createInvoiceLink`, `addAddon`,
  and `removeAddon` throw `PiiAccessDisabledError`. `create` (including
  `markAsPaid`) and non-payment reads/mutations remain available.

```ts
const peek = new PeekAccessService({
  installId, jwtSecret, issuer, appId, gatewayKey,
  accessOptions: { fullCustomerAccess: true }, // opt into PII + payment operations
});
```

### Errors

Two kinds of failures surface as exceptions:

**Typed gateway errors** (importable, branch on the class):

- `AdminAccountRequiredError` — gateway returned HTTP 418 (install lacks admin
  rights). Carries `.statusCode === 418`.
- `RateLimitError` — HTTP 429 after the configured `retryDelaysMs` backoff was
  exhausted. Carries `.statusCode === 429`.
- `PeekGraphQLError` — the response contained a GraphQL `errors` array (a
  resolver-level failure), preserved on `.graphqlErrors`.
- `PeekHttpError` — the gateway returned a non-2xx HTTP status (other than
  418/429) with no GraphQL `errors` array — a transport-level failure such as
  `401` (auth/secret wrong), `404` (wrong app id / not provisioned), or `5xx`.
  Carries `.statusCode`, `.url`, and the raw `.body` (parsed JSON when possible,
  otherwise the response text). Surfaced *before* the body is parsed as JSON, so
  a non-JSON error page reports its real status instead of a JSON parse error.
- `PiiAccessDisabledError` — a payment / booking-modification operation was
  called on an access service created without `fullCustomerAccess` (see [Access options
  / PII](#access-options--pii)). Carries `.operation` (the blocked method name).
- `InvalidPeekTokenError` — `verifyPeekAuthToken` (or `parseInstallWebhook` /
  `verifyInstallWebhook`)
  received a token whose signature is valid but whose `user` block has no `id`.
  Carries `.field` (`"user.id"`). Thrown alongside the `jsonwebtoken` errors.

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
  PeekHttpError,
} from '@peektravel/app-utilities';

try {
  await peek.getBookingService().makePayment({ /* … */ });
} catch (err) {
  if (err instanceof RateLimitError) {
    // back off and retry later
  } else if (err instanceof AdminAccountRequiredError) {
    // this install can't perform admin-only operations
  } else if (err instanceof PeekHttpError) {
    console.error(err.statusCode, err.url, err.body); // which config is wrong
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

## Webhooks

Receiver apps can consume Peek **booking**, **waiver**, and **install** webhooks
without hand-writing the payload handling. The booking and waiver webhooks have a
pure parser (construct nothing — no auth/network) that returns a clean model; the
install webhook delivers a signed token alongside a JSON body, so its helper
**verifies** the token before merging the two:

```ts
import {
  parseBookingWebhook,
  parseInstallWebhook,
  parseWaiverWebhook,
  type Booking,
  type InstallWebhook,
  type Waiver,
} from "@peektravel/app-utilities";

app.post("/booking-webhook", (req, res) => {
  const booking: Booking = parseBookingWebhook(req.body);
  res.sendStatus(200);
});

app.post("/waiver-webhook", (req, res) => {
  // guestName/fileUrl are redacted unless you opt into PII:
  const waiver: Waiver = parseWaiverWebhook(req.body, { fullCustomerAccess: true });
  res.sendStatus(200);
});

app.post("/install-webhook", async (req, res) => {
  let event: InstallWebhook;
  try {
    // Token rides in the `x-peek-auth` header (a `Bearer ` prefix is stripped for you):
    const token = req.header("x-peek-auth") ?? "";
    event = parseInstallWebhook(token, req.body, process.env.PEEK_INTERNAL_SECRET!);
  } catch {
    return res.sendStatus(401); // bad signature / issuer / audience / expired
  }
  switch (event.status) {
    case "installed":        await provision(event); break;
    case "uninstalled":      await deprovision(event); break;
    case "update_installed": await recordVersion(event); break;
    // `status` is null when Peek sends one this version doesn't know. Peek
    // doesn't redeliver a 2xx, so fail loudly rather than silently no-op.
    default: return res.status(500).json({ error: `unknown status: ${event.rawStatus}` });
  }
  res.sendStatus(200);
});
```

The booking and waiver parsers tolerate the delivery envelope / a bare node / a
JSON string and never throw on malformed input; **authenticating those deliveries
is the receiver's job**. `parseWaiverWebhook` also takes an optional
`AccessOptions` (`{ fullCustomerAccess }`) and redacts the participant `guestName`
+ document `fileUrl` by default — see [Access options / PII](#access-options--pii)
below.

`parseInstallWebhook(token, body, secret)` is different: the delivery carries a
signed `app_registry_v2` JWT plus a JSON body. Peek sends the token in the
`x-peek-auth` header — pass that value straight in (`token` accepts it with or
without a `Bearer ` prefix). It validates the HMAC signature,
expiry, issuer, and `"Joken"` audience (the same checks as `verifyPeekAuthToken`,
throwing the underlying `jsonwebtoken` error — or `InvalidPeekTokenError` when a
present `user` block has no `id`), then returns one flat, JSON-safe
`InstallWebhook`: `installId`, `accountId` (**also called the partner ID**),
`accountName`, `platform`, `isTest`, `timezone`, `apiUrl`, `status`, `rawStatus`,
`displayVersion`, and a **nullable** `user`. The **JSON body is the source of the
event data**; the fields it shares with the token (`installId` / `accountId` /
`status` / `displayVersion` / `user`) fall back to the **verified token** when
the body omits them. The token authenticates the whole delivery, so the body is
trusted within a verified request. This webhook is the only source of
`accountId`, `timezone`, and `apiUrl` in the package, since no GraphQL read
returns them — **persist them per install**. `status` and
`platform` are **nullable** — a value this version doesn't recognise stays `null`
(wire value on `rawStatus`) instead of being coerced, so a newer registry can't be
mistaken for an older one. (The older `verifyInstallWebhook(token, secret)` is
still exported but **`@deprecated`** — it reads only the token, missing the
account name/platform/test flag; `parseInstallEvent` has been **removed**.)

The booking and waiver webhooks differ on registration: a **booking** webhook's
payload shape is set by a GraphQL query configured **once in an external system**
(the App Store `broadcast_to_url` config) — this package documents and
drift-guards the exact query to paste there — whereas the **waiver** and
**install** webhooks have fixed payloads, so you just subscribe to their event
with no query. **The query to register and the full guide:
[`docs/webhooks.md`](docs/webhooks.md) (shipped).**

## UI components (`/ui`)

The package also ships framework-agnostic **Web Components** ported from the Peek
Odyssey design system, under a separate browser-only subpath so the server
library stays DOM-free. They work in any HTML page — no framework required.

```ts
// Registers every <ody-*> custom element as a side effect.
import '@peektravel/app-utilities/ui';
import '@peektravel/app-utilities/ui/tokens.css';
import '@peektravel/app-utilities/ui/odyssey.css';
```

```html
<ody-button variant="primary" left-icon="plus">New booking</ody-button>
<ody-tag color="success" icon="check">Confirmed</ody-tag>
<ody-alert variant="warning" heading="Heads up">This can't be undone.</ody-alert>
<ody-input label="Guest name" placeholder="Jane Doe"></ody-input>
```

Coverage spans display (button, tag, alert, card, status-dot, message, icon,
loading-spinner/bar, divider), layout (empty-state, breadcrumb, stat-summary,
inline-list, list-item, product-indicator, toggle-button, section, two-column,
collapsible-section), form inputs (input, inline/search/money/percentage input,
checkbox, radio-button-group, checkbox-group), interactive (accordion,
collapsible, tabs, copy-button, check-in-status, option, split-button,
table-header), overlays (modal, popover, tooltip, panel, toast), and data &
selection (dropdown-single, dropdown-multi, datepicker, table — all vanilla and
dependency-free, following WAI-ARIA combobox/listbox/grid patterns).

Interactive components reflect state and emit `CustomEvent`s; grouped components
(tabs, radio/checkbox groups, toggle group) take a JSON `options`/`tabs`
attribute. Exported classes/types and helpers (`iconSvg`, `registerIcon`,
`portal`, `position`, `toast`) are available from `@peektravel/app-utilities/ui`
for subclassing or typing.

### Using the components from React 19

React 19 sets JSX props on a custom element as DOM **properties**
(`el.searchable = true`), not attributes. That's handled for you: every
reflected/read-only accessor accepts assignment, so `<ody-dropdown-single
searchable options={items} />` and friends work without the
`Cannot set property … which has only a getter` crash that a getter-only
property would otherwise cause. Two things worth knowing:

- **Boolean and data props reflect to the attribute**, so they take effect as
  expected. Pass booleans as real booleans (`searchable={true}`) and rich data
  as values (`options={items}`) — the object is reflected as a JSON attribute.
- **Read-only state accessors are inert to assignment.** Props that mirror live
  internal state (`isOpen`, `isVisible`) ignore writes — drive them through the
  imperative methods on a `ref` (`ref.current.openPopover()`, `.show()`) and read
  them back through the component's `CustomEvent`s, not by setting the prop.
- **Dynamic children reconcile correctly.** Slotting components (`ody-card`,
  `ody-alert`, `ody-section`, …) forward child mutations to their internal slot,
  so conditional, keyed, `.map()`-ed, or reordered **direct** children work
  without a `NotFoundError` — no need to wrap dynamic children in a stable `<div>`.

TypeScript still types these accessors as read-only, so a direct
`el.isOpen = true` in TS is flagged — the setters are a runtime safety net for
framework-driven assignment, not an invitation to write to derived state.

**Try the gallery:** `npm run sample` builds the package and serves
`examples/ui-gallery.html`, which shows every component with its variants.

### Localization

Content you pass in (labels, headings, options, cell data) is already yours to
localize. The components' **own** built-in strings (aria-labels like "Close" /
"Clear", the date picker's "Select date" and month-nav labels, the dropdown
"Search" / "No options", the check-in-status labels) are translatable two ways:

```ts
import { registerTranslation } from '@peektravel/app-utilities/ui';

registerTranslation('es', {
  close: 'Cerrar', clear: 'Borrar', search: 'Buscar',
  checkInReturned: 'Devuelto', /* … */
});
```

Each component resolves its language from the nearest `lang` attribute
(`<html lang="es">` localizes everything; a subtree `lang` overrides it), and
re-renders automatically when the language or a registered bundle changes.
English is the built-in default. For a one-off, a per-instance attribute wins:
`<ody-panel close-label="Cerrar">`, `<ody-datepicker next-month-label="…">`,
`<ody-check-in-status label="…">`.

The **date picker** displays dates with `Intl.DateTimeFormat` for the resolved
`lang` — a readable, localized label (e.g. "Jun 15, 2026" / "15 jun 2026")
rather than the raw ISO string. Its `value` attribute and `change` payload stay
machine-readable ISO `yyyy-mm-dd` (range as `start/end`). Tune the displayed
form with `display-format` (`short` | `medium` | `long` | `full`) or take full
control with the `formatDate` property. Weekday/month names and day labels in
the calendar are likewise `Intl`-localized, so they aren't in the term catalog.

> A few Odyssey components remain unported: `nested-multi-select`,
> `location-autocomplete` (Google Maps API), `filter-menu` / `filter-menu-single`,
> `accordion-checkbox`, and `datepicker-with-presets`. The dropdowns, the single
> date picker, and the data table were rebuilt here as lightweight,
> dependency-free vanilla components rather than ported from their
> third-party-coupled Ember originals.

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
[Releasing](#releasing).

## Project layout

```
src/                       server library source (public API barrel: src/index.ts)
src/ui/                    Web Components + Odyssey CSS (barrel: src/ui/index.ts)
test/                      vitest unit tests (test/ui/* run under happy-dom)
examples/ui-gallery.html   component gallery (npm run sample)
dist/                      build output (generated, git-ignored)
docs/webhooks.md           booking-webhook consumer guide (shipped)
docs/internal/             maintainer docs (ARCHITECTURE.md — not shipped)
llms.txt                   AI-agent quickstart (shipped in the package)
```
