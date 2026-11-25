# UI components — the `./ui` subpath

> Part of the [`@peektravel/app-utilities` architecture overview](./ARCHITECTURE.md).

`src/ui/`

A second, **browser-only** public surface shipped under a separate subpath
export (`@peektravel/app-utilities/ui`) so the server library stays DOM-free:
framework-agnostic **Web Components** (Custom Elements) ported from the Peek
Odyssey design system, plus the Odyssey design tokens and component CSS.

```
src/ui/
  tokens.css            Odyssey design tokens as :root CSS custom properties
  odyssey.css           component styles (SCSS → token-var-based plain CSS)
  base.ts               OdyElement base class + classes()/escapeHtml()/define()/
                        registeredTags()/whenOdysseyReady()
  icons.ts              curated inline-SVG set (iconSvg/registerIcon/hasIcon)
  overlay.ts            portal()/removePortal()/position() helper for overlays
  i18n.ts               built-in-string localization (registerTranslation, terms)
  select-base.ts        shared combobox/listbox base for the dropdown components
  components/<name>.ts   one custom element per file, self-registering
  index.ts              barrel: side-effect registers all <ody-*>, re-exports
```

Load-bearing rules:
- **Light DOM, no Shadow DOM.** Each element extends `OdyElement` and renders
  its chrome into its own light DOM via `mount(chrome)`, so the global
  `odyssey.css` classes style it exactly as the Ember addon does and consumers
  can override with the same selectors. Consumer child content is preserved
  across re-renders through a `[data-ody-slot]` placeholder. The first render is
  deferred one microtask (so parser/`innerHTML` children are attached before the
  slot is captured); attribute-change re-renders are synchronous.
- **Child mutations are forwarded to the slot.** Because `mount()` relocates
  consumer children into the `[data-ody-slot]` node, a slotted child's real
  `parentNode` is that slot, not the host. Framework reconcilers (React, Vue,
  Angular, Svelte) mutate the DOM by calling `host.removeChild(child)` /
  `insertBefore` / `replaceChild` / `appendChild`, which would otherwise throw
  `NotFoundError`. `OdyElement` overrides these four methods: removal/insert/
  replace delegate to the target node's actual `parentNode` (so they also work
  while the slot is portaled to `document.body`), and `appendChild` routes into
  the current slot. Internal chrome/portal re-homing must use `OdyElement.adopt()`
  (a `super.appendChild`) to bypass this forwarding — the portal components
  (`modal`, `panel`, `popover`, `tooltip`) do, so their chrome node isn't routed
  into its own slot. `mount()` itself never passes through the overrides (it uses
  `this.innerHTML` and operates on the slot/fragment nodes directly).
- **Text fields update `value` in place, never re-render.** The native
  `<input>`/`<textarea>` already reflects what the user typed, so a destructive
  re-render on each keystroke would drop focus and caret. The controlled inputs
  (`ody-input`, `ody-inline-input`, `ody-search-input`, `ody-money-input`,
  `ody-percentage-input`) therefore `override attributeChangedCallback` to
  special-case `value`: they push it into the live control via
  `reflectControlValue` (a no-op when the control already holds it), skipping
  `render()`. Every other observed attribute changes chrome and still re-renders
  through the base. The selection controls follow the same principle:
  `ody-checkbox`, `ody-checkbox-group`, and `ody-radio-button-group` update the
  checked state in place on selection (shared `applyCheckboxState` in
  `checkbox-state.ts`) so focus/keyboard nav survives.
- **Re-render on reconnect; portal content survives a move.** `connectedCallback`
  re-renders when the element is reconnected (`#slot` already captured) — moving
  an element in the DOM (a framework keyed reorder) otherwise leaves it inert
  (no locale reactivity, no listeners). Portal components
  (`modal`/`panel`/`popover`/`tooltip`) call `reclaimPortaledSlot(node)` in
  `disconnectedCallback` to pull slotted content out of the portaled node before
  it is torn down, so the reconnect re-render can re-slot it.
- **Pre-upgrade properties are honored.** `connectedCallback` runs
  `#upgradeProperties()` — own properties that shadow a prototype accessor
  (a framework `el.value = …` set before the element upgraded) are deleted and
  re-assigned through the accessor.
- **Untrusted attribute values are neutralized at the sink.** `classes()`
  HTML-escapes its output (class fragments are built from raw attributes), and
  `cssColor()` allow-lists color tokens before they reach a `style="…"`
  declaration. Rich-data props (`options`/`presets`/`data`/`columns`/`rows`) are
  real getter+setter properties (accepting an array or JSON string) rather than
  getter-only accessors, so they are **not** reflected as JSON DOM attributes;
  `ody-checkbox-group` serializes its `value` attribute as a JSON array so
  comma-containing values round-trip.
- **Localization (`i18n.ts`).** Components' built-in strings (aria-labels,
  default placeholders, check-in-status labels) go through `OdyElement.term(key)`
  / `localized(attr, key)`, never hardcoded. The active language is resolved from
  the nearest `lang` attribute (DOM-driven, Shoelace-style); consumers call
  `registerTranslation(lang, terms)`; English is the bundled default. Reactivity
  is wired in `mount()` — each element registers a self-pruning locale callback,
  and one document-wide `MutationObserver` on `lang` plus `registerTranslation`
  trigger re-renders. Per-instance attribute overrides (`close-label`, …) win.
  Weekday/month names stay outside the catalog (they follow `Intl`).
- **Date display (`datepicker`).** The trigger label, calendar weekday/month
  names, and day aria-labels are formatted with `Intl.DateTimeFormat` for the
  resolved `lang` — never the raw ISO string. The `value` attribute and `change`
  payload stay ISO `yyyy-mm-dd` (range `start/end`); only presentation
  localizes. `display-format` (`short`/`medium`/`long`/`full`) maps to `Intl`
  `dateStyle`; a `formatDate` property overrides it. Date *math* still uses
  local `Date` parts (no `toISOString`).
- **Registration is a side effect** of importing `./ui` (or an individual
  component file). `package.json` `"sideEffects"` is therefore an allow-list
  (`**/ui/**`, `**/*.css`) rather than `false`, so bundlers don't tree-shake the
  registrations away. `define()` is **idempotent** (guards on
  `customElements.get(tag)`), records each tag in a module registry, and never
  throws on a re-import.
- **FOUC guard + readiness signal.** `odyssey.css` opens with a
  `:where(…all ody-* tags…):not(:defined) { visibility: hidden }` rule so an
  un-upgraded element never flashes as its raw text before registration
  (`visibility`, not `display`, so there's no reflow on upgrade; zero specificity
  via `:where` so consumers can override). The selector list is pinned to the
  runtime tag registry by the `test/ui/defined-guard.test.ts` **drift guard** —
  add a component's tag there when you register it. `whenOdysseyReady()` (backed
  by the same registry via `customElements.whenDefined`) resolves once every
  imported element has upgraded, and `registeredTags()` exposes the registry;
  both are exported from `./ui` for apps that register lazily.
- **React 19 safety at registration.** `define()` (in `base.ts`) runs
  `addReactSafeSetters` on the class before `customElements.define`: it walks the
  component's own prototypes (up to `OdyElement`) and gives every getter-only
  accessor a setter, so React 19 — which assigns JSX props as DOM *properties*
  (`el.searchable = true`) — can't throw `only a getter`. When the property name
  maps to an `observedAttribute` the setter **reflects** the value onto that
  attribute (booleans as presence, objects as JSON, scalars as strings) so the
  prop takes effect; otherwise it is a no-op for derived/imperative state
  (`isOpen`). The static `.d.ts` types keep these accessors read-only — the
  setters are a runtime-only safety net. Documented for consumers in the shipped
  `dist/ui/index.d.ts` TSDoc and the README.
- **Dependency-free & token-based.** No `ember-power-select`/`-calendar`,
  `svg-jar`, or bootstrap. Colours/spacing reference the `tokens.css` custom
  properties; icons are inlined; button variant colours (which live in a
  bootstrap base layer upstream) are reproduced from Odyssey tokens.
- **Scope:** ~48 components across display, layout, form-input, interactive,
  overlay, and data/selection tiers. The layout tier includes
  `ody-app-page-container` — the required wrapper for app **settings** UIs, sized
  to the two settings-host iframe widths (868px / 1310px), exposing an `ody-page`
  CSS container context, and shipping a **default responsive gutter**
  (`--gap24` → `--gap16` at/below 868px; `flush` opts out). It supersedes
  `ody-page-container` (kept, `@deprecated`, full-bleed/no-gutter). Likewise
  `ody-horizontal-divider` (default `margin-block: var(--gap16)`;
  `spacing="tight"|"none"`) supersedes the spacing-neutral `ody-divider`. Both
  successors are **self-spacing** primitives built on the `--gap8/16/24/32`
  scale published in `tokens.css`; PII/behavior is unaffected. The data/selection tier — `dropdown-single`,
  `dropdown-multi` (+ shared `select-base.ts`), `datepicker`, `table` — was
  **rebuilt from scratch** as lightweight vanilla components (rather than ported
  from their `ember-power-select` / `ember-power-calendar` originals), following
  WAI-ARIA APG combobox/listbox and grid/date-picker patterns: rich data crosses
  the boundary as JS **properties** (`options`, `columns`, `data`,
  `isDateDisallowed`), scalar config as reflected attributes, output as
  `CustomEvent`s. The datepicker does all date math from local `Date` parts (no
  `toISOString`/string parsing — avoids UTC drift) and ships no date library.
  Still **not** ported: `nested-multi-select`, `location-autocomplete` (Google
  Maps), `filter-menu`/`filter-menu-single`, `accordion-checkbox`,
  `datepicker-with-presets` — they'd reintroduce avoided dependencies or compose
  trivially from shipped parts. Composite/grouped components (tabs, radio/checkbox
  groups, toggle group, dropdowns) take a JSON `options`/`tabs` attribute and emit
  `CustomEvent`s.
- `examples/ui-gallery.html` demonstrates every component; `npm run sample`
  builds and serves it (`scripts/serve-examples.mjs`, a dependency-free static
  server) because browsers block ESM imports over `file://`.
