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
