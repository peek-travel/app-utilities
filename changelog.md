# Changelog

Consumer-facing changelog for `@peektravel/app-utilities`. It records only
changes a **caller** can observe or needs to act on — new capabilities, behavior
changes, and breaking changes — grouped by version, newest first. Internal
refactors, test-only changes, and invisible cleanups are intentionally omitted.

Each entry states **what** changed, **why**, and — when relevant — the **caller
action** required. Entries tagged `[breaking]` change observable behavior an
existing consumer could depend on; `[fix]` corrects broken behavior with no
action needed; `[additive]` only adds capability.

---

## 0.7.2

### `[additive]` Self-spacing UI primitives: `ody-app-page-container` and `ody-horizontal-divider`

- **What:** two new `./ui` web components that carry their own spacing, plus a
  published spacing scale:
  - `<ody-app-page-container>` — the responsive settings-page wrapper, now with a
    **default responsive gutter** (`var(--gap24)`, tightening to `var(--gap16)`
    at/below 868px). It keeps the same 868/1310px widths and `ody-page` container
    context as `ody-page-container`. A `flush` boolean attribute opts back into
    edge-to-edge, full-bleed content.
  - `<ody-horizontal-divider>` — a 1px rule with a default `margin-block:
    var(--gap16)`, plus `spacing="tight"` (`--gap8`) / `spacing="none"` (`0`).
  - `tokens.css` now publishes the spacing scale (`--gap8/16/24/32`) and the two
    canonical page widths (`--layout-page-width-narrow` = 868px,
    `--layout-page-width-wide` = 1310px) so consumers can reach for tokens
    instead of magic numbers.
- **Why:** components that are mandatory page primitives (`ody-page-container`) or
  whose whole purpose is spacing (`ody-divider`) shipped spacing-neutral, forcing
  every app to re-solve edge padding in a wrapper `<div>` and to add margins
  around every divider. Baking sensible defaults in — with explicit opt-outs —
  removes that boilerplate and keeps spacing consistent across apps.
- **Caller action:** none — additive. The existing `<ody-page-container>` and
  `<ody-divider>` are unchanged and still exported. They are now **deprecated**;
  migrate at your leisure by renaming the tag (`ody-page-container` →
  `ody-app-page-container`, adding `flush` only if you relied on the full-bleed
  layout; `ody-divider` → `ody-horizontal-divider`, adding `spacing="none"` to
  keep zero margin).

## 0.7.1

### `[additive]` Peek token verifiers accept the raw `x-peek-auth` header value

- **What:** every Peek token entry point — `PeekAccessService.verifyPeekAuthToken`,
  `parseInstallWebhook`, and the deprecated `verifyInstallWebhook` — now strips a
  leading `Bearer ` prefix from the `token` argument, so you can pass the
  `x-peek-auth` request header value straight in without unwrapping it. A bare
  JWT still works unchanged.
- **Why:** Peek delivers these tokens in the `x-peek-auth` header, sometimes with
  a `Bearer ` scheme prefix. The docs didn't say where the token lives (the old
  install example passed a non-existent `req.token`), and each caller was left to
  strip the scheme. Handling it in the shared verifier removes both papercuts and
  keeps the behavior uniform across the token family.
- **Caller action:** none — additive. Read the token from the `x-peek-auth`
  header and pass it as-is, e.g. `parseInstallWebhook(req.header("x-peek-auth") ??
  "", req.body, secret)` or `peek.verifyPeekAuthToken(req.header("x-peek-auth") ??
  "")`.

## 0.7.0

Adds a single verify-and-parse call for the install webhook, which delivers
**two** payloads at once — a signed JWT and a JSON body. Previously
`verifyInstallWebhook` covered only the token half; now one call verifies the
token and merges in the body, returning a flat object.

### `[additive]` `parseInstallWebhook` — verify + parse the install webhook in one call

- **What:** new `parseInstallWebhook(token, body, secret): InstallWebhook`
  verifies the signed install token **and** merges in the JSON body, returning a
  single flat record: `installId`, `accountId` (the **partner ID**),
  `accountName`, `platform`, `isTest`, `status`, `rawStatus`, `displayVersion`,
  and `user` (nullable). The `InstallWebhook` type is exported; `InstallStatus`
  and the `INSTALL_STATUSES` constant are unchanged.
- **Why:** the install webhook delivers both a signed JWT (which authenticates
  the notification and carries `account.id`, install id, status, version, and the
  acting user) and a JSON body (the only source of the account **name**,
  **platform**, and **test** flag). The signed token had a verifier but the body
  did not, so callers hand-rolled the body parsing and stitched the two shapes
  together. `parseInstallWebhook` does both, making the **verified** token
  authoritative for the fields it carries (`installId`, `accountId`, `status`,
  `displayVersion`, `user`) and trusting the unsigned body only for `accountName`
  / `platform` / `isTest`. This webhook is the sole source of the account id
  anywhere in the system — no GraphQL read returns one.
- **Caller action:** none — additive. Call
  `parseInstallWebhook(token, req.body, secret)` with the webhook's signed token
  and your app's `jwtSecret`. Persist the whole flat object as a unit (JSON-safe),
  and **handle a `null` `status`**: an unrecognised status maps to `null` with the
  wire value on `rawStatus` rather than being coerced, and because Peek treats any
  2xx as delivered and does not redeliver, responding successfully to one silently
  drops a lifecycle transition. `platform` is nullable for the same reason.
  Verification can throw (`JsonWebTokenError` / `TokenExpiredError` /
  `NotBeforeError`), so wrap the call in `try/catch` → `401`.

### `[breaking]` `parseInstallEvent` removed — use `parseInstallWebhook`

- **What:** the `parseInstallEvent(body): InstallEvent` parser and its
  `InstallEvent` / `InstallIdentity` types (shipped in 0.6.1) are removed.
- **Why:** it read only the unauthenticated JSON body and returned a different,
  nested shape. `parseInstallWebhook` verifies the token **and** merges the body,
  covering everything `parseInstallEvent` did and more.
- **Caller action:** replace `parseInstallEvent(req.body)` with
  `parseInstallWebhook(token, req.body, secret)` and read the flat result
  (`event.accountId` / `event.installId`) instead of the old nested
  `event.identity.*`; swap the `InstallEvent` / `InstallIdentity` types for
  `InstallWebhook`.

### `[deprecated]` `verifyInstallWebhook` superseded by `parseInstallWebhook`

- **What:** `verifyInstallWebhook(token, secret): InstallWebhookClaims` is now
  marked `@deprecated`. It still verifies the token and returns the same
  `InstallWebhookClaims` (unchanged), but it reads only the token, so it cannot
  report the account `name`, `platform`, or `isTest` the JSON body carries.
- **Why:** `parseInstallWebhook` runs the identical signature check and returns
  every field, so there is no longer a reason to call the token-only verifier.
- **Caller action:** none required — it keeps working. Migrate to
  `parseInstallWebhook(token, body, secret)` to get the account name/platform/
  test flag and the flat shape; note the fields move (`claims.account.id` →
  `event.accountId`).

---

## 0.6.1

A **stricter `user.id` check** on verified Peek tokens.

### `[fix]` `verifyPeekAuthToken` now rejects a token with no `user.id`

- **What:** `verifyPeekAuthToken` (and `verifyInstallWebhook`, when the payload
  carries a user block) now throws the new, exported `InvalidPeekTokenError`
  when the signature is valid but the `user` block has no `id`. The error's
  `.field` is `"user.id"`. Previously such a token decoded to claims whose
  `user.id` was an empty/`undefined` string.
- **Why:** the `user.id` is the authenticated end-user identity callers key
  authorization and audit off of; silently returning a blank id let a malformed
  token flow through as if a real user were present.
- **Caller action:** none required for well-formed tokens. Callers that catch
  verification failures may add `InvalidPeekTokenError` (importable, branch with
  `instanceof`) to their handling; it is thrown alongside the existing
  `jsonwebtoken` errors.

---

## 0.6.0

Two threads: new **product-catalog fields** on the Peek `Product` model, and a
**framework-integration & safety pass** over the `@peektravel/app-utilities/ui`
Web Components (issues that surface when the components are driven by a framework
— React 19, Vue, Angular, Svelte — or fed data-derived attributes).

### `[additive]` Product catalog: `imageUrl`, `description`, `meetingLocation`

- **What:** activity `Product`s now expose nullable `imageUrl`, `description`,
  and `meetingLocation` (`ProductMeetingLocation { summary, address, url }`);
  add-ons report `null`. `ProductMeetingLocation` is exported from the package
  alongside `Product`/`ProductTicket`.
- **Why:** catalog / listing / marketplace consumers needed description, imagery,
  and meeting-point data that was previously operator-manual.
- **Caller action:** none — purely additive; existing `Product` consumers are
  unaffected.

### `[fix]` DOM XSS: enum-ish attributes could break out of `class="…"`

- **What:** `classes()` (`src/ui/base.ts`) now HTML-escapes its output. Many
  components build a class fragment from a raw, unvalidated attribute
  (`ody-tag--${color}`, `--size-${size}`, `variant`, `appearance`, `placement`,
  …). Previously a value containing a `"` broke out of the `class` attribute and
  injected live markup (e.g. `color='"><img src=x onerror=…>'`).
- **Why:** DOM XSS when any class-driving attribute is data-derived.
- **Caller action:** none. Escaping is a no-op for legitimate class tokens
  (`[a-z0-9_-]`); only intentional markup injection through a class attribute
  stops working.

### `[fix]` CSS injection via `style` color values

- **What:** `bar-color` (`<ody-card>`, `<ody-product-indicator>`), `text-color`
  (`<ody-product-indicator>`), and `color` (`<ody-loading-bar>`) now pass through
  `cssColor()` (`src/ui/base.ts`), which drops values that aren't a safe CSS
  color token before they reach a `style="…"` declaration.
- **Why:** a value like `red;position:fixed;inset:0;width:100vw;height:100vh`
  previously injected extra CSS declarations (overlay / clickjacking).
- **Caller action:** minimal. The allow-list still accepts hex, `rgb()/rgba()`,
  `hsl()`, named colors, `var(--…)`, `color-mix(…)`, `oklch(…)`, etc. A value
  that is **not** a recognizable color token is now ignored (falls back to the
  default) instead of being written verbatim — use standard color syntax.

### `[breaking]` Duplicate `change` event removed on money / percentage inputs

- **What:** `<ody-money-input>` and `<ody-percentage-input>` now swallow the
  native `change` from their internal `<input>`. Previously a consumer listening
  for `change` received **two** events: the component's `CustomEvent<{value}>`
  **and** the input's native `change` (whose `detail` is `null`).
- **Why:** the native event bubbled up unstopped; `e.detail.value` on it threw.
- **Caller action:** you now receive exactly one `change` — the
  `CustomEvent<{ value }>`. Remove any code that filtered out / worked around the
  detail-less duplicate. Behavior for correct code (reading `e.detail.value` on
  the CustomEvent) is unchanged.

### `[fix]` money / percentage inputs no longer drop focus while typing

- **What:** both now reflect a `value` change into the live control in place
  (via `reflectControlValue`) instead of a full re-render, matching
  `<ody-input>`. The `value` getter also stays current while typing.
- **Why:** a framework-controlled `value` binding rebuilt the `<input>` on every
  keystroke, dropping focus and caret.
- **Caller action:** none.

### `[fix]` Selection no longer drops focus (checkbox / radio / checkbox-group)

- **What:** `<ody-checkbox>`, `<ody-radio-button-group>`, and
  `<ody-checkbox-group>` update the checked state in place on selection instead
  of rebuilding. (Shared helper: `src/ui/checkbox-state.ts`.)
- **Why:** the previous full re-render replaced the focused control — worst for
  `<ody-radio-button-group>`, where it made keyboard (arrow-key) navigation
  impossible.
- **Caller action:** none.

### `[additive]` `options` / `presets` settable as a JS property

- **What:** `<ody-toggle-button>` gains an `options` property and
  `<ody-datepicker>` gains a `presets` property. Each accepts an **array or a
  JSON string**.
- **Why:** previously these were attribute-only, so a framework array binding
  (`options={items}`) stringified to `[object Object]` and rendered nothing.
- **Caller action:** none required. You can now write `el.options = [...]`
  directly. The old `options={JSON.stringify(arr)}` string workaround still works
  (the setter accepts a JSON string), and the JSON attribute still works.

### `[breaking]` `options` is no longer reflected to a DOM attribute

- **What:** `<ody-checkbox-group>` and `<ody-radio-button-group>` now keep
  `options` in an internal field (like `<ody-dropdown-*>`) instead of serializing
  the array into the `options` DOM attribute when set via the property.
- **Why:** the JSON blob bloated the DOM, re-parsed on every render, and silently
  dropped non-JSON-safe fields.
- **Caller action:** if you read the `options` **attribute** back after setting
  the property, or have a CSS/`querySelector` hook on `[options]`, read the
  `.options` **property** instead. Setting via the attribute in markup still
  works.

### `[breaking]` `<ody-checkbox-group>` `value` attribute is now a JSON array

- **What:** the reflected `value` attribute is serialized as a JSON array (e.g.
  `["a","b"]`) instead of comma-joined (`a,b`), so option values containing a
  comma round-trip. A legacy comma-separated attribute is still accepted when
  read.
- **Why:** commas in option values corrupted the comma-joined serialization.
- **Caller action:** the `.value` **property** (a `string[]`) and the `change`
  event `detail.value` are **unchanged**. Only if you parse the raw `value`
  **attribute** string yourself, expect JSON now (or keep passing comma-separated
  in markup — it's still read).

### `[fix]` Moving an element in the DOM no longer breaks it

- **What:** `OdyElement` now re-renders on reconnect. Portal components
  (`<ody-modal>`, `<ody-panel>`, `<ody-popover>`, `<ody-tooltip>`) reclaim their
  slotted content before teardown so it survives.
- **Why:** a framework keyed-reorder / move (disconnect→reconnect) previously
  left the element inert — it stopped reacting to `lang`/translation changes, and
  portal components came back **empty**.
- **Caller action:** none.

### `[additive]` Pre-upgrade property assignments are applied

- **What:** `OdyElement` upgrades own properties that shadow a prototype accessor
  on connect, so `el.value = …` / `el.data = …` set **before** the `/ui` bundle
  registers the element (SSR hydration, code-splitting, lazy registration) is no
  longer silently dropped.
- **Caller action:** none.

### `[additive]` `<ody-datepicker>` function props are reactive

- **What:** reassigning `isDateDisallowed` / `formatDate` now re-renders the
  picker.
- **Caller action:** none.
