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

### `[breaking]` Token `user` and all its fields are now nullable; sentinel ids normalize to `null`

- **What:** `PeekAuthTokenClaims.user` (from `verifyPeekAuthToken`) can now be
  `null`, and every field on `PeekAuthTokenUser` — `id`, `email`, `isAdmin`,
  `locale`, `name`, `platform` — is now nullable (`string | null` / `boolean |
  null` / `PeekPlatform | null`). A `user` block missing from the token yields
  `user: null`; a field that is absent, `null`, or a sentinel string (`""` or the
  literal `"null"`, case-insensitive) is normalized to `null`; an unrecognized
  `platform` also becomes `null`. This applies uniformly to `verifyPeekAuthToken`,
  `parseInstallWebhook`, and `verifyInstallWebhook`.
- **Why:** real `app_registry_v2` tokens do not guarantee a `user` block, and Peek
  has been observed to send `""` or `"null"` for `user.id`. The old code passed
  `"null"` straight through (so callers keyed users by the literal string
  `"null"`) and threw on an empty id. `user.id` is the signed-in **person's** id —
  not the account or partner id (that is `InstallWebhook.accountId`) — so its
  absence is not an error.
- **Caller action:** null-check `claims.user` before use, and treat every user
  field as possibly `null`. If you relied on a non-null `user.id`, handle `null`
  (do not persist the literal `"null"`). If you branched on the old thrown error
  for a missing id, see the removal below.

### `[breaking]` `InvalidPeekTokenError` removed

- **What:** the `InvalidPeekTokenError` class is no longer exported and is never
  thrown. It previously signaled a signature-valid token whose `user` block had no
  `id`.
- **Why:** a missing/empty `user.id` is no longer treated as an error — it maps to
  `user.id === null` (see above). With nothing left to throw it, the public error
  became dead surface.
- **Caller action:** remove any `import { InvalidPeekTokenError }` and any
  `instanceof InvalidPeekTokenError` / `.field === "user.id"` branch; check for a
  `null` `user`/`user.id` instead. Signature/expiry/issuer/audience failures still
  throw the `jsonwebtoken` errors (`JsonWebTokenError` / `TokenExpiredError` /
  `NotBeforeError`) unchanged.

### `[fix]` `parseInstallWebhook` now reads the event from the JSON body (token is the fallback)

- **What:** `parseInstallWebhook` now sources every field from the delivered
  **JSON body** first, falling back to the **verified token** only for the fields
  the token also carries (`installId`, `accountId`, `status`, `displayVersion`,
  `user`). Previously those five were read from the token *first*, so when the
  token omitted them — which the real `app_registry_v2` install token does — the
  event came back with empty `installId`/`accountId`/`displayVersion`, a `null`
  `status`, and a `null` `user`, even though the body carried all of them. The
  acting `user` is now read from the body's `modified_by`, falling back to the
  token's `user`.
- **Why:** the install webhook's data lives in the JSON body; the token is the
  signature/authenticity boundary. Reading the token first produced empty core
  fields for a normal delivery. The token still authenticates the whole request
  (only Peek can mint a valid one), so the body is trusted within a verified
  request.
- **Caller action:** none — this fills fields that were previously empty. If you
  worked around the bug (e.g. re-parsing `req.body` yourself for the account id),
  you can drop that; `event.installId`/`accountId`/`status`/`displayVersion`/`user`
  are now populated from the body.

### `[additive]` `InstallWebhook` gains `timezone` and `apiUrl`

- **What:** the `InstallWebhook` returned by `parseInstallWebhook` has two new
  string fields: `timezone` (the account's IANA zone from the body's
  `account.timezone`, e.g. `"America/New_York"`) and `apiUrl` (the per-install
  backoffice API base URL from the body's `api.url`). Both default to `""` when a
  delivery omits them.
- **Why:** both are per-install facts with no source other than this event — the
  account timezone is needed for correct date/time handling, and the API URL
  identifies the gateway serving the install.
- **Caller action:** none — additive. **Persist both per install** (alongside
  `installId`/`accountId`/`platform`); they cannot be re-fetched later. Every
  install event is a full snapshot, so **upsert by `installId`** and take the
  latest values — the registry pushes changes (e.g. a new `apiUrl`) via
  `update_installed` events.

### `[additive]` Target an install by its `apiUrl` — new `apiUrl` config + `createAccessServiceForInstall`

- **What:** every access service config (`PeekAccessService`, `CngAccessService`,
  `AcmeAccessService`) accepts a new **`apiUrl`** field — the install's app
  endpoint from the install webhook. When set it is used **as given**: for Peek
  it is the sole request URL (every call POSTs to it, unmodified); for CNG/ACME it
  is the base and only the REST path is appended. No app-id/gateway segment is
  inserted, so `appId` is not required alongside it. A new helper
  **`createAccessServiceForInstall(install, config)`** builds the right service
  for `install.platform` (`peek`/`cng`/`acme`) wired to `install.apiUrl` in one
  call (throwing on an unknown/`null` platform).
- **Why:** the endpoint the registry hands you is the one to hit — it varies per
  install (sandbox vs. production, region, per-app path) and the registry can
  change it via an `update_installed` event. Any app id in the path is the
  registry's own traffic tag and opaque to callers, so the URL is used
  unmodified rather than reconstructed from `appId`.
- **Caller action:** none — additive. To adopt: persist `event.apiUrl` (and
  `platform`) from the install webhook, then either pass `apiUrl` in the config or
  call `createAccessServiceForInstall({ platform, apiUrl, installId }, { jwtSecret, issuer, … })`.

### `[deprecated]` `baseUrl` + `appId` URL controls and the hardcoded gateway defaults

- **What:** the `baseUrl` and `appId` config fields (and the **hardcoded default**
  gateway base URL each service falls back to when `baseUrl` is omitted) are now
  deprecated in favour of `apiUrl`. `appId` was only ever a URL path segment;
  with `apiUrl` it is unused.
- **Why:** a single compiled-in default base URL cannot be correct for every
  install, and reconstructing the URL from `baseUrl`/`appId` fights the registry's
  own routing. Sourcing the endpoint from the webhook's `apiUrl` is the correct,
  per-install model.
- **Caller action — do this now:** move to `apiUrl` (see the entry above).
- **⚠️ Breaking change coming:** in a **future release the hardcoded base-URL
  fallbacks will be removed and a URL will become required** — constructing an
  access service without an `apiUrl` (or a `baseUrl`) will throw. Migrate to
  `apiUrl` now so the removal is a no-op for you.

### `[deprecated]` Self-spacing UI primitives replace `ody-page-container` and `ody-divider`

- **What:** `<ody-app-page-container>` (responsive default gutter; `flush` opts
  out) replaces `<ody-page-container>`, and `<ody-horizontal-divider>` (default
  `margin-block`; `spacing="tight"|"none"`) replaces `<ody-divider>`. New spacing
  tokens `--gap8/16/24/32` in `tokens.css`. The old tags are `@deprecated` but
  unchanged.
- **Caller action:** rename the tags and **drop any padding/margins you added
  around the old ones** — the successors provide it, so leaving yours doubles the
  spacing.

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
