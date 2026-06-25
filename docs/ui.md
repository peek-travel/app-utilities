# Odyssey Web Components — `@peektravel/app-utilities/ui`

AI reference for the Odyssey UI components shipped under the `/ui` subpath. This
is the **guide**; the authoritative, always-current contract is
`dist/ui/index.d.ts` — read its TSDoc via go-to-definition before relying on any
shape here. Document only what this file describes; never invent attributes,
properties, or events.

---

## 1. Overview

- **Framework-agnostic Custom Elements** (`<ody-*>`). Work in plain HTML, React,
  Vue, Angular, Svelte — anything that renders DOM.
- **Light DOM** (no Shadow DOM). The shipped `odyssey.css` global classes style
  them; consuming apps can override with the same selectors.
- **Dependency-free.** Native `Date`, `Intl`, `fetch`/`navigator.clipboard`,
  `customElements`. No date or popup libraries.
- **Ported from the Peek Odyssey design system** (originally an Ember addon).
- Importing the module **registers** every element as a side effect; the named
  exports (classes + types) are only for subclassing or type-checking.

---

## 2. Setup

```ts
// Registers every <ody-*> element as a side effect (do this once, app entry):
import '@peektravel/app-utilities/ui';
// Design tokens (CSS custom properties — colours, fonts, z-index):
import '@peektravel/app-utilities/ui/tokens.css';
// Component styles:
import '@peektravel/app-utilities/ui/odyssey.css';
```

CSS can also be linked instead of imported:

```html
<link rel="stylesheet" href="…/@peektravel/app-utilities/ui/tokens.css" />
<link rel="stylesheet" href="…/@peektravel/app-utilities/ui/odyssey.css" />
```

Named exports for advanced use:

```ts
import {
  toast, registerTranslation, registerIcon,
  iconNames, iconSvg, brandIconNames, brandIconSvg,
  OdyTable, type OdyTableColumn, // …classes + types
} from '@peektravel/app-utilities/ui';
```

---

## 3. Core conventions (read this — it is how all components work)

### 3.1 Scalar config = HTML attributes
Strings and booleans are **attributes**. Boolean attributes are "on" when
present (and not literally `="false"`):

```html
<ody-button variant="primary" size="small" disabled>Save</ody-button>
```

### 3.2 Rich data = JS properties (cannot be attributes)
Arrays, objects, and functions are set on the **element object**, not as
attributes:

```js
const table = document.querySelector('ody-table');
table.columns = [{ key: 'name', label: 'Name' }];   // array
table.data    = [{ name: 'Alice' }];                  // array
datepicker.isDateDisallowed = (d) => d.getDay() === 0; // function
datepicker.formatDate       = (d) => d.toDateString(); // function
```

Several composite components also accept a **JSON-string attribute fallback** so
they work declaratively in plain HTML:

| Component | JS property | JSON attribute fallback |
|---|---|---|
| `ody-dropdown-single` / `ody-dropdown-multi` | `el.options = [...]` | `options='[{"value":"a","label":"A"}]'` |
| `ody-tabs` | — | `tabs='[{"id":"a","label":"A"}]'` |
| `ody-toggle-button` | — | `options='[{"value":"a","label":"A"}]'` |
| `ody-radio-button-group` / `ody-checkbox-group` | `el.options` (getter) | `options='[{"value":"a","label":"A"}]'` |
| `ody-datepicker` | — | `presets='[{"label":"…","value":"…"}]'` |
| `ody-table` | `el.columns`, `el.data` | none — JS only |

### 3.3 Output = `CustomEvent` (read `event.detail`)
Components emit bubbling `CustomEvent`s. Listen with `addEventListener`; read
data from `event.detail`. Event names are **custom** (e.g. `change`,
`sort-change`) — see each component.

```js
el.addEventListener('change', (e) => console.log(e.detail.value));
```

### 3.4 Content = light-DOM children (the default slot)
Most components render your child nodes into an internal `[data-ody-slot]`
placeholder. So the element's children become its body/label content:

```html
<ody-button>This text is the label</ody-button>
<ody-alert heading="Saved">This is the body content.</ody-alert>
```

### 3.5 Framework usage

**Vanilla HTML / JS** — declarative; set rich data and add listeners via the
element reference.

**React** (especially < 19) does not set DOM properties or bind custom events
from JSX attributes. Use lowercase tag names, a `ref` to set properties, and
`addEventListener` for events:

```jsx
function Guests({ columns, rows, onSort }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    el.columns = columns;          // JS property
    el.data = rows;                // JS property
    const handler = (e) => onSort(e.detail);  // { key, direction }
    el.addEventListener('sort-change', handler);
    return () => el.removeEventListener('sort-change', handler);
  }, [columns, rows, onSort]);
  return <ody-table ref={ref} selectable sortable />;
}
```

**Vue / Angular** support custom elements natively: bind properties with
`:prop` / `[prop]` and events with `@event` / `(event)`. (Configure Vue's
`compilerOptions.isCustomElement` / Angular's `CUSTOM_ELEMENTS_SCHEMA`.)

---

## 4. When to use what

| Need | Use |
|---|---|
| Action / submit | `ody-button`; primary + menu → `ody-split-button` |
| Single choice from a list | `ody-dropdown-single` (or native `<select>`) |
| Multiple choices from a list | `ody-dropdown-multi` (or native `<select multiple>`) |
| Mutually-exclusive segmented control | `ody-toggle-button` or `ody-radio-button-group` |
| Several independent toggles | `ody-checkbox-group` (with optional select-all) |
| Single boolean | `ody-checkbox` |
| Free text / multi-line | `ody-input` (`textarea`), compact → `ody-inline-input` |
| Search field | `ody-search-input` |
| Currency amount | `ody-money-input` |
| Percentage 0–100 | `ody-percentage-input` |
| Date / date range | `ody-datepicker` |
| Tabular data, sorting, selection | `ody-table` |
| Tab navigation | `ody-tabs` |
| Transient feedback | `toast()` (+ `ody-toast-host`) |
| Confirm / blocking dialog | `ody-modal` |
| Slide-in side detail panel | `ody-panel` |
| Click-to-open floating menu | `ody-popover` |
| Hover/focus hint | `ody-tooltip` |
| Status / contextual message | `ody-alert`, `ody-message`, `ody-status-dot`, `ody-check-in-status` |
| Labels / pills | `ody-tag` |
| Empty / error / no-results view | `ody-empty-state` |
| KPI figures | `ody-stat-summary` + `ody-stat` |
| Expand/collapse | `ody-accordion`, `ody-collapsible`, `ody-collapsible-section` |
| Full-page wrapper for an **app settings UI** | `ody-page-container` (required — see below) |
| Master/detail page layout | `ody-two-column` |
| Row/column section layout | `ody-section-rows` / `ody-section-columns` |
| Progress | `ody-loading-bar`, `ody-loading-spinner` |
| Themeable icon | `ody-icon`; brand/logo art → `ody-brand-icon` |

---

## 5. Component catalog

Conventions below: **Attributes** are HTML attributes; **Properties (JS)** must
be set on the element object; **Events** bubble and are read via `event.detail`;
**Slots / content** describes what child nodes do. Defaults are noted.

---

### Display tier

#### `<ody-icon>`
**Use when** you need a themeable inline SVG that inherits text colour.
**Attributes**
- `name` — icon name (see `iconNames()`); unknown names render nothing.
- `size` — `extra-small` | `mid-small` | `small` | `base` | `medium` | `large` | `free` (default `base`).
- `disabled` — boolean; dims the icon.
**Example**
```html
<ody-icon name="search" size="medium"></ody-icon>
```

#### `<ody-button>`
**Use when** triggering an action. Label is the child content.
**Attributes**
- `variant` — `primary` | `secondary` | `ghost` | `tertiary` | `danger` (default `primary`).
- `appearance` — `interaction` | `success` | `danger` | `grey` (default `interaction`).
- `size` — `base` | `small` (default `base`).
- `type` — `button` | `submit` (default `button`).
- `left-icon` / `right-icon` — icon names beside the label.
- `loading`, `icon-only`, `active`, `disabled`, `icon-rotate` — boolean flags.
**Slots / content** — child nodes are the label.
**Example**
```html
<ody-button variant="primary" left-icon="plus">Add item</ody-button>
<ody-button icon-only left-icon="search" aria-label="Search"></ody-button>
```
*(No custom event — listen for native `click`.)*

#### `<ody-tag>`
**Use when** showing a status pill / label. Label is the child content.
**Attributes**
- `variant` — `primary` (filled) | `secondary` (outline) (default `primary`).
- `color` — `default` | `info` | `success` | `warning` | `danger` | `teal` | `lime` | `purple` | `pink` | `turquoise` | `yellow` | `orange` | `rose` | `blue` (default `default`).
- `size` — `base` | `small` (default `base`).
- `icon` — optional leading icon name.
- `count` — optional trailing count.
**Example**
```html
<ody-tag color="success" icon="check">Confirmed</ody-tag>
<ody-tag variant="secondary" color="purple" count="4">Tasks</ody-tag>
```

#### `<ody-alert>`
**Use when** showing a contextual message box. Body is the child content.
**Attributes**
- `variant` — `info` | `success` | `warning` | `danger` (default `info`).
- `heading` — optional bold heading beside the icon.
**Slots / content** — child nodes are the body.
**Example**
```html
<ody-alert variant="warning" heading="Careful">This cannot be undone.</ody-alert>
```

#### `<ody-card>`
**Use when** grouping content in a bordered container. Reach for the plain
`no-bar` card by default; add a left accent bar only when the bar's colour
carries meaning (e.g. status).
**Attributes**
- `no-bar` — boolean; omits the accent bar, rendering a plain bordered
  container. **This is the default card to use.**
- `bar-color` — CSS colour for the accent bar (default neutral-200). Ignored
  when `no-bar` is set.
- `clickable` — boolean; adds pointer affordance (handle `click` yourself).
**Slots / content** — child nodes are the card content.
**Example**
```html
<!-- Default: plain bordered card -->
<ody-card no-bar><p>Card body</p></ody-card>

<!-- Accent bar when the colour is meaningful -->
<ody-card bar-color="var(--color-interaction-300)"><p>Card body</p></ody-card>
```

#### `<ody-divider>`
**Use when** you need a 1px horizontal rule. No attributes, no content.
```html
<ody-divider></ody-divider>
```

#### `<ody-status-dot>`
**Use when** showing a coloured dot beside a label. Label is the child content.
**Attributes**
- `color` — `green` | `blue` | `orange` (default `green`).
**Example**
```html
<ody-status-dot color="blue">Pending</ody-status-dot>
```

#### `<ody-message>`
**Use when** showing a small inline status message. Text is the child content.
**Attributes**
- `icon` — optional leading icon name.
**Example**
```html
<ody-message icon="info">Saved as draft.</ody-message>
```

#### `<ody-loading-spinner>`
**Use when** indicating indeterminate loading. Optional label is the child content.
**Attributes**
- `size` — `small` | `base` | `large` (default `base`).
**Example**
```html
<ody-loading-spinner size="large">Loading…</ody-loading-spinner>
```

#### `<ody-loading-bar>`
**Use when** showing determinate progress.
**Attributes**
- `value` — fill percentage, clamped 0–100 (default `0`).
- `color` — CSS colour for the fill (default interaction-300).
- `label` — optional caption shown above the bar with the percentage.
**Example**
```html
<ody-loading-bar value="35" label="Uploading photos"></ody-loading-bar>
```

---

### Layout / structure tier

#### `<ody-empty-state>`
**Use when** rendering an empty / error / no-results placeholder. Child content
(e.g. an action button) renders below the messages.
**Attributes**
- `variant` — `default` | `error` | `no-results` | `no-search` | `not-authorized` (default `default`); selects a fallback icon.
- `img-src` / `img-alt` — render a custom image instead of the icon.
- `icon` — override the illustration with a named icon.
- `label` — bold primary message.
- `caption` — secondary message.
**Example**
```html
<ody-empty-state variant="no-results" label="No results" caption="Try another search.">
  <ody-button>Clear filters</ody-button>
</ody-empty-state>
```

#### `<ody-breadcrumb>` + `<ody-breadcrumb-item>`
**Use when** showing a breadcrumb trail. Compose items as children.
`ody-breadcrumb` has no attributes (renders the `<nav><ol>` chrome).
`ody-breadcrumb-item` **Attributes**: `current` — boolean; marks the active page
(`aria-current="page"`). Each item's child content is the crumb label/link.
**Example**
```html
<ody-breadcrumb>
  <ody-breadcrumb-item><a href="/">Home</a></ody-breadcrumb-item>
  <ody-breadcrumb-item current>Details</ody-breadcrumb-item>
</ody-breadcrumb>
```

#### `<ody-stat-summary>` + `<ody-stat>` + `<ody-stat-summary-detail>` + `<ody-stat-detail>`
**Use when** displaying a row of KPI figures with an optional detail strip.
- `ody-stat-summary` — no attributes; wraps `ody-stat` children.
- `ody-stat` **Attributes**: `label`, `value` (falls back to child content if omitted), `sub`, `tone` (`default` | `success` | `warning`).
- `ody-stat-summary-detail` — no attributes; the divider + detail strip; place as a **sibling immediately after** the stat summary; wraps `ody-stat-detail` children.
- `ody-stat-detail` **Attributes**: `value` (bold value appended after the child-content label).
**Example**
```html
<ody-stat-summary>
  <ody-stat label="Revenue" value="$12,400" sub="last 30 days"></ody-stat>
  <ody-stat label="Bookings" value="312" tone="success"></ody-stat>
</ody-stat-summary>
<ody-stat-summary-detail>
  <ody-stat-detail value="$1,030">Avg / booking</ody-stat-detail>
</ody-stat-summary-detail>
```

#### `<ody-inline-list>` + `<ody-inline-list-item>`
**Use when** rendering a horizontal separated list. Compose items as children.
- `ody-inline-list` **Attributes**: `separator` (`line` | `bullet`, default `line`), `gap` (px between items, default `12`).
- `ody-inline-list-item` — no attributes; child content is the item.
**Example**
```html
<ody-inline-list separator="bullet" gap="8">
  <ody-inline-list-item>Draft</ody-inline-list-item>
  <ody-inline-list-item>Updated 3d ago</ody-inline-list-item>
</ody-inline-list>
```

#### `<ody-list-item>`
**Use when** a clickable list row with a trailing chevron. Row content is the
child content.
**Attributes**
- `item-id` — id emitted in the `select` event.
- `active-item-id` — when equal to `item-id`, the row renders active.
- `active` — boolean; force the active style.
**Events**
- `select` → `{ itemId }` — on click or Enter/Space.
**Example**
```html
<ody-list-item item-id="1" active-item-id="1"><strong>Sunset Kayak</strong></ody-list-item>
```

#### `<ody-product-indicator>`
**Use when** showing a product name with a coloured bar and optional detail.
Extra content (e.g. a tag) is the child content.
**Attributes**
- `name` — product name (bold).
- `detail` — secondary detail line.
- `bar-color` — CSS colour for the bar (default neutral-400).
- `text-color` — CSS colour for the name.
- `size` — `base` | `small` (default `base`).
- `indicator-id` — emitted in `select` (when `clickable`).
- `clickable` — boolean; makes the whole indicator a button.
**Events**
- `select` → `{ id }` — only when `clickable`.
**Example**
```html
<ody-product-indicator name="Sunset Kayak Tour" detail="2 hours · Max 12"
  bar-color="var(--color-turquoise-300)"></ody-product-indicator>
```

#### `<ody-toggle-button>`
**Use when** a segmented control of mutually-exclusive options.
**Attributes**
- `options` — JSON array of `{ value, label?, leftIcon?, rightIcon?, iconOnly?, disabled? }`.
- `selected` — the currently-selected option value (reflected on change).
- `size` — `base` | `small` (default `base`).
- `disabled` — boolean; disables the whole group.
**Events**
- `change` → `{ value }`.
**Example**
```html
<ody-toggle-button selected="week"
  options='[{"value":"day","label":"Day"},{"value":"week","label":"Week"}]'></ody-toggle-button>
```

#### `<ody-section-columns>` + `<ody-section-column-item>`
**Use when** laying out children in a row.
- `ody-section-columns` **Attributes**: `gap-size` (`8` | `16` | `24` | `32` px, default `16`), `vertical-align` (`center` | `top` | `bottom`, default `bottom`).
- `ody-section-column-item` **Attributes** (boolean): `no-grow`, `individual-scroll`, `stretch`, `with-padding`. Child content is the column body.
**Example**
```html
<ody-section-columns gap-size="24" vertical-align="top">
  <ody-section-column-item stretch>Left</ody-section-column-item>
  <ody-section-column-item no-grow>Right</ody-section-column-item>
</ody-section-columns>
```

#### `<ody-section-rows>` + `<ody-section-row-item>`
**Use when** stacking children vertically with optional row headers.
- `ody-section-rows` **Attributes**: `gap-size` (`8` | `16` | `24` | `32` px, default `16`).
- `ody-section-row-item` **Attributes**: `title`, `description`, `description-icon` (icon name), `no-divider` (boolean). Child content is the row body.
**Example**
```html
<ody-section-rows gap-size="16">
  <ody-section-row-item title="General" description="Basic details" description-icon="info">
    Row body
  </ody-section-row-item>
  <ody-section-row-item title="Advanced" no-divider>More</ody-section-row-item>
</ody-section-rows>
```

#### `<ody-two-column>` + parts
**Use when** a master/detail layout. The secondary panel shows only when
`secondary-open` is present.
- `ody-two-column` **Attributes**: `secondary-open` (boolean).
- `ody-two-column-main` — no attributes; primary content area.
- `ody-two-column-secondary` — no attributes; detail panel (hidden unless parent open).
- `ody-two-column-secondary-header` **Attributes**: `title`. **Events**: `close` (clicking the close button).
**Example**
```html
<ody-two-column secondary-open>
  <ody-two-column-main>…list…</ody-two-column-main>
  <ody-two-column-secondary>
    <ody-two-column-secondary-header title="Details"></ody-two-column-secondary-header>
    …detail…
  </ody-two-column-secondary>
</ody-two-column>
```

#### `<ody-page-container>`
> [!IMPORTANT]
> **Every app settings UI must wrap its content in `<ody-page-container>`.** It is
> the standard responsive page wrapper that keeps the settings page sized to the
> two widths the settings host iframe renders at — **868px** (narrow) and
> **1310px** (wide).
>
> **Design for 868px first — it is the default.** Optimise every settings layout
> for the narrow 868px width, then make sure it *also* renders correctly when the
> host expands it to 1310px (e.g. progressively widen or add columns; never
> assume the extra width is present). Do **not** design 1310px-first and let it
> degrade — 868px is the baseline that must always look right.

**Use when** building the top-level layout of an app settings page (or any
full-page UI embedded in the settings host).
The container is `width: 100%`, so it fills whichever of the two widths the
parent iframe gives it; a `max-width` of `1310px` caps and centres it if it is
ever embedded somewhere wider. Content is **full-bleed** (edge-to-edge, no side
gutters). It also establishes a CSS **container context** named `ody-page`, so
the content inside can adapt between the two widths with container queries
instead of viewport media queries — treat 868px as the base styles and use a
container query to *enhance* for the wider view.
**Attributes** — none; the width is driven entirely by the parent.
**Slots / content** — child nodes are the page content.
**Example**
```html
<ody-page-container>
  <ody-section-rows gap-size="24">
    …settings UI…
  </ody-section-rows>
</ody-page-container>
```
```css
/* Base styles target the default 868px width… */
.my-settings-grid { grid-template-columns: 1fr; }
/* …then progressively enhance for the expanded 1310px view. */
@container ody-page (min-width: 1310px) {
  .my-settings-grid { grid-template-columns: 1fr 1fr; }
}
```

#### `<ody-collapsible-section>` + `<ody-collapsible-collapsed>` + `<ody-collapsible-content>`
**Use when** a titled section that expands/collapses on header click.
- `ody-collapsible-section` **Attributes**: `header-text`, `secondary-header-text`, `icon` (icon name), `expanded` (boolean; reflected). **Events**: `expanded` → `{ expanded }`.
- `ody-collapsible-collapsed` — teaser shown only while collapsed.
- `ody-collapsible-content` — body shown only while expanded.
**Example**
```html
<ody-collapsible-section header-text="Booking details" secondary-header-text="(3 items)" icon="info">
  <ody-collapsible-collapsed>Tap to see more</ody-collapsible-collapsed>
  <ody-collapsible-content>…full content…</ody-collapsible-content>
</ody-collapsible-section>
```

---

### Form inputs

All text inputs render a native control in the light DOM (form-friendly) and
expose a JS `value` property mirroring the `value` attribute.

#### `<ody-input>`
**Use when** a standard text field (or multi-line textarea).
**Attributes**
- `label`, `placeholder`, `value`, `caption`.
- `size` — `base` | `small` (default `base`).
- `icon` — leading icon name.
- `warning` / `info` — message text; also sets the state ring.
- `maxlength` — when set, shows a character counter.
- `textarea` — boolean; render a `<textarea>`.
- `readonly`, `disabled`, `full-width`, `max-content` — boolean flags.
- `no-clear` — boolean; suppress the clear button.
**Properties (JS)** — `value: string` (get/set).
**Events**
- `input` → `{ value }` — every keystroke.
- `change` → `{ value }` — on native change / clear.
**Example**
```html
<ody-input label="Name" placeholder="Full name" maxlength="40"></ody-input>
<ody-input textarea label="Notes" full-width></ody-input>
```

#### `<ody-inline-input>`
**Use when** the compact, borderless inline variant of `ody-input` (e.g. inside
tables/forms). Same attributes, properties, and events as `ody-input`.
**Example**
```html
<ody-inline-input label="Qty" value="2" size="small"></ody-inline-input>
```

#### `<ody-search-input>`
**Use when** a search field with a leading search icon.
**Attributes**
- `value`, `placeholder` (default `"Search"`).
- `size` — `base` | `small` (default `base`).
- `info-message` — neutral helper caption.
- `warning-message` — warning caption + ring.
- `disabled` — boolean.
**Properties (JS)** — `value: string`.
**Events** — `input` → `{ value }`; `change` → `{ value }`.
**Example**
```html
<ody-search-input placeholder="Search bookings"></ody-search-input>
```

#### `<ody-money-input>`
**Use when** entering a currency amount. On blur the value is sanitised, clamped
to `max-amount`, and rounded to the currency precision (JPY → 0 decimals, else 2).
**Attributes**
- `value` — amount string.
- `currency` — ISO code for symbol + precision (default `USD`).
- `max-amount` — optional upper clamp applied on blur.
- `label`, `size`, `warning`.
- `readonly`, `disabled` — boolean.
**Properties (JS)** — `value: string` (get/set); `precision: number` (read-only).
**Events** — `input` → `{ value }` (per keystroke); `change` → `{ value }` (on blur, after formatting).
**Example**
```html
<ody-money-input label="Price" currency="USD" value="49.99" max-amount="500"></ody-money-input>
```

#### `<ody-percentage-input>`
**Use when** entering a percentage 0–100 with a trailing `%`. Invalid keystrokes
are blocked; on blur the value is clamped/normalised.
**Attributes**
- `value`, `label`, `size`, `warning`.
- `readonly`, `disabled` — boolean.
**Properties (JS)** — `value: string`.
**Events** — `input` → `{ value }` (per keystroke); `change` → `{ value }` (on blur, after clamping).
**Example**
```html
<ody-percentage-input label="Discount" value="10"></ody-percentage-input>
```

#### `<ody-checkbox>`
**Use when** a single boolean toggle. Optional label and extra child content.
**Attributes**
- `label` — text beside the box.
- `size` — `base` | `small` (default `small`).
- `checked`, `indeterminate`, `disabled` — boolean (`checked` is reflected).
**Properties (JS)** — `checked: boolean`; `value: boolean` (alias of `checked`).
**Events** — `change` → `{ checked, value }` (both boolean, equal).
**Example**
```html
<ody-checkbox label="I agree" checked></ody-checkbox>
```

#### `<ody-radio-button-group>`
**Use when** mutually-exclusive radio options.
**Attributes**
- `options` — JSON array of `{ label, value }`.
- `value` — selected option value.
- `size` — `base` | `small` (default `base`).
- `disabled` — boolean; applies to every option.
**Properties (JS)** — `value: string`; `options: OdyRadioOption[]` (read-only getter, parses the attribute).
**Events** — `change` → `{ value }`.
**Example**
```html
<ody-radio-button-group value="m"
  options='[{"label":"Monthly","value":"m"},{"label":"Yearly","value":"y"}]'></ody-radio-button-group>
```

#### `<ody-checkbox-group>`
**Use when** several toggles, optionally with a "select all" parent (checked
when all selected, indeterminate when some).
**Attributes**
- `options` — JSON array of `{ label, value }`.
- `value` — comma-separated selected values.
- `select-all-label` — when present, renders the parent select-all row.
- `size` — `base` | `small` (default `small`).
- `disabled` — boolean.
**Properties (JS)** — `value: string[]` (get returns array, set takes array); `options: OdyCheckboxOption[]` (read-only getter).
**Events** — `change` → `{ value: string[] }`.
**Example**
```html
<ody-checkbox-group select-all-label="All toppings" value="cheese,olives"
  options='[{"label":"Cheese","value":"cheese"},{"label":"Olives","value":"olives"},{"label":"Basil","value":"basil"}]'></ody-checkbox-group>
```

---

### Interactive

#### `<ody-accordion>`
**Use when** an expand/collapse panel with a header. Body is the child content.
**Attributes**
- `title` — header label text.
- `open` — boolean; expanded state (reflected, toggled on header click).
- `sticky` — boolean; pins the header while scrolling.
**Events** — `toggle` → `{ open }`.
**Example**
```html
<ody-accordion title="Itinerary" open><p>Day 1…</p></ody-accordion>
```

#### `<ody-collapsible>`
**Use when** a lightweight inline collapsible. Body is the child content.
**Attributes**
- `label` — header label text.
- `open` — boolean (reflected, toggled on header click).
**Events** — `toggle` → `{ open }`.
**Example**
```html
<ody-collapsible label="Show more"><p>Hidden details…</p></ody-collapsible>
```

#### `<ody-tabs>`
**Use when** tab navigation. Renders only the tab list; you swap the panels.
**Attributes**
- `tabs` — JSON array of `{ id, label, disabled? }`.
- `active` — id of the active tab (reflected, defaults to the first tab).
- `size` — `base` | `small` (default `base`).
- `position` — `top` | `left` (default `top`).
**Events** — `change` → `{ id }`.
**Example**
```html
<ody-tabs active="overview"
  tabs='[{"id":"overview","label":"Overview"},{"id":"notes","label":"Notes","disabled":true}]'></ody-tabs>
```

#### `<ody-copy-button>`
**Use when** copying text to the clipboard with transient success feedback.
**Attributes**
- `value` — text copied to the clipboard.
- `label` — optional label (icon-only when omitted).
- `success-duration` — ms the success/error state shows (default `1200`).
**Events** — `copy` → `{ value, ok }` (`ok: boolean` — `false` if the clipboard API is unavailable or write failed).
**Example**
```html
<ody-copy-button value="ABC-123" label="Copy code"></ody-copy-button>
```

#### `<ody-check-in-status>`
**Use when** showing a fulfillment/check-in status with an icon + label.
**Attributes**
- `status` — `IN_PROGRESS` | `NO_SHOW` | `NONE` | `OVERDUE` | `RESERVED` | `RETURNED` (default `RESERVED`); selects icon, colour, and default (localized) label.
- `label` — overrides the status's default label.
- `optional-text` — secondary line below the label.
**Example**
```html
<ody-check-in-status status="RETURNED" optional-text="2:30 PM"></ody-check-in-status>
```

#### `<ody-option>`
**Use when** a selectable menu/list row (e.g. inside a popover menu). Label is
the child content.
**Attributes**
- `selected` — boolean; marks selected.
- `disabled` — boolean; disables interaction.
- `sub-menu` — boolean; shows a trailing sub-menu trigger.
- `trigger-icon` — icon name for the sub-menu trigger (default `chevron-right`).
**Events**
- `select` — clicking the row (no detail).
- `submenu` — clicking the sub-menu trigger (no detail).
**Example**
```html
<ody-option>Duplicate</ody-option>
<ody-option sub-menu>Move to…</ody-option>
```

#### `<ody-split-button>`
**Use when** a primary action joined to a dropdown toggle. Panel content is the
child content.
**Attributes**
- `text` — primary button label.
- `variant` — button variant (default `secondary`).
- `size` — `base` | `small` (default `base`).
- `icon` — toggle icon name (default `chevron-down`).
- `open` — boolean; whether the panel is shown (reflected).
**Events**
- `primary` — clicking the main button (no detail).
- `toggle` → `{ open }` — clicking the dropdown toggle.
**Example**
```html
<ody-split-button text="Save" variant="primary">
  <ody-option>Save and close</ody-option>
</ody-split-button>
```

#### `<ody-table-header>`
**Use when** a single sortable column header (standalone; for full tables use
`ody-table`). Clicking cycles none → desc → asc → none.
**Attributes**
- `column-name` — header text.
- `column-id` — passed through in the `sort` event.
- `direction` — `UNSET` | `ASC` | `DESC` (reflected, default `UNSET`).
- `static` — boolean; non-interactive header, no sort affordance.
- `rounded-left` / `rounded-right` — boolean; round the matching corners.
**Events** — `sort` → `{ direction, columnId }` (`direction` is `UNSET` | `ASC` | `DESC`).
**Example**
```html
<ody-table-header column-name="Date" column-id="date" direction="ASC"></ody-table-header>
```

---

### Overlays

All overlay panels are portaled to `document.body` so they escape clipping
ancestors.

#### `<ody-modal>`
**Use when** a blocking dialog. Body is the child content.
**Attributes**
- `open` — boolean; shown when present (mirrors `open()` / `close()`).
- `heading` — optional title.
- `size` — `base` | `small` | `medium` | `large` | `full` (default `base`).
- `icon` — optional named icon before the heading.
**Properties / methods (JS)** — `open()`, `close()`.
**Events** — `close` (clicking the backdrop, the close button, or pressing Escape).
**Example**
```html
<ody-modal id="m" heading="Confirm"><p>Are you sure?</p></ody-modal>
<script>document.getElementById('m').open();</script>
```

#### `<ody-popover>`
**Use when** a click-toggled floating panel anchored to a trigger.
**Attributes**
- `for` — id of an external trigger element (overrides a slotted trigger).
- `placement` — `top` | `bottom` | `left` | `right` (default `bottom`).
**Properties / methods (JS)** — `isOpen` (read-only), `open()`, `close()`, `toggle()`.
**Events** — `open`, `close` (no detail).
**Slots / content** — the **trigger** is the child marked `[data-ody-popover-trigger]` (else the first element child unless `for` is set); the **content** is the child marked `[data-ody-popover-content]` (else the remaining children).
**Example**
```html
<ody-popover placement="bottom">
  <ody-button data-ody-popover-trigger variant="secondary">Menu</ody-button>
  <div data-ody-popover-content><ody-option>Edit</ody-option></div>
</ody-popover>
```

#### `<ody-tooltip>`
**Use when** a hover/focus hint anchored to a trigger.
**Attributes**
- `text` — the tooltip text (alternative to slotted content).
- `placement` — `top` | `bottom` | `left` | `right` (default `top`).
- `for` — id of an external trigger element.
**Properties / methods (JS)** — `isVisible` (read-only), `show()`, `hide()`.
**Slots / content** — the **trigger** is `for` (external) or the first slotted child; tooltip text is `text` or extra slotted children.
**Example**
```html
<ody-tooltip text="Helpful hint" placement="top">
  <ody-button icon-only left-icon="info" aria-label="Info"></ody-button>
</ody-tooltip>
```

#### `<ody-panel>`
**Use when** a side panel that slides in from the right. Body is the child content.
**Attributes**
- `open` — boolean; toggles the slide-in (mirrors `open()` / `close()`).
- `heading` — optional panel title.
- `full-height` — boolean; spans the full viewport height.
**Properties / methods (JS)** — `open()`, `close()`.
**Events** — `close` (clicking the overlay or the close button).
**Example**
```html
<ody-panel id="p" heading="Details"><p>Body…</p></ody-panel>
<script>document.getElementById('p').open();</script>
```

#### `<ody-toast-host>` + `toast()`
**Use when** transient feedback. You normally never write `<ody-toast-host>`
yourself — call the exported `toast()` function, which lazily creates and
portals a singleton host.
**`toast(message, options?)`** — `options: { variant?, title?, timeout? }`:
- `variant` — `info` | `success` | `warning` | `danger` (default `info`).
- `title` — optional bold title above the message.
- `timeout` — auto-dismiss ms; `0` disables auto-dismiss (default `4000`).
Returns `{ dismiss: () => void }` to remove the toast early.
`ody-toast-host` has a `push(message, options)` method with the same signature.
**Example**
```js
import { toast } from '@peektravel/app-utilities/ui';
const t = toast('Saved successfully', { variant: 'success', title: 'Done' });
// t.dismiss();
```

---

### Data & selection

#### `<ody-dropdown-single>`
**Use when** single choice from a list (select-only combobox, WAI-ARIA pattern).
**Attributes**
- `value` — selected option value (reflected; also a JS property).
- `options` — JSON array fallback (`[{"value":"a","label":"A","disabled":false}]`).
- `placeholder` — text when nothing is selected.
- `label` / `aria-label` — accessible name for the trigger.
- `search-placeholder` — placeholder for the filter input when `searchable`.
- `disabled` — boolean.
- `searchable` — boolean; renders a filter input atop the list.
**Properties (JS)** — `value: string`; `options: OdySelectOption[]` (`{ value, label, disabled? }`); `disabled: boolean` (read-only).
**Events** — `change` → `{ value: string }` (user selection only; **not** on programmatic set).
**Keyboard** — ArrowDown/Up (or Enter/Space) open + move; Home/End jump; Enter selects + closes; Escape closes; Tab closes; printable chars typeahead.
**Example**
```html
<ody-dropdown-single label="Fruit" placeholder="Pick a fruit" searchable
  options='[{"value":"apple","label":"Apple"},{"value":"cherry","label":"Cherry","disabled":true}]'></ody-dropdown-single>
```

#### `<ody-dropdown-multi>`
**Use when** multiple choices from a list (multi-select listbox combobox). The
trigger shows selected options as removable chips.
**Attributes** — same set as `ody-dropdown-single`; `value` is comma-delimited.
**Properties (JS)** — `value: string[]` (get returns array, set takes array); `options: OdySelectOption[]`; `disabled` (read-only).
**Events** — `change` → `{ value: string[] }` (user selection only; **not** on programmatic set). Toggling an option keeps the panel open.
**Keyboard** — ArrowDown/Up move; Home/End jump; Space/Enter toggles; Escape/Tab close.
**Example**
```html
<ody-dropdown-multi label="Toppings" placeholder="Choose toppings" searchable value="cheese"
  options='[{"value":"cheese","label":"Cheese"},{"value":"olives","label":"Olives"}]'></ody-dropdown-multi>
```

#### `<ody-datepicker>`
**Use when** picking a date or date range. Dependency-free calendar (native
`Date`/`Intl`). The displayed text is localized; the `value` attribute and
`change` payload always stay machine-readable ISO `yyyy-mm-dd`.
**Attributes**
- `value` — `yyyy-mm-dd` (single), or `yyyy-mm-dd/yyyy-mm-dd` (range mode).
- `min` / `max` — inclusive bounds `yyyy-mm-dd`.
- `range` — boolean; enables start/end range selection.
- `first-day-of-week` — `0`–`6` (0 = Sunday, default `0`).
- `placeholder` — trigger text when no value.
- `presets` — JSON array of `{ label, value }` shortcut buttons (`value` is single or range form).
- `display-format` — `short` | `medium` | `long` | `full` (default `medium`); how the trigger label is shown (via `Intl.DateTimeFormat` for the element's `lang`).
**Properties (JS)**
- `isDateDisallowed?: (date: Date) => boolean` — disable arbitrary days.
- `formatDate?: (date: Date) => string` — full control of the trigger label (wins over `display-format`).
- `isOpen` (read-only); methods `openPopover()`, `closePopover()`.
**Events** — `change` on **user** selection only (never on programmatic set):
- single mode → `{ value }` (ISO).
- range mode → `{ value, start, end }` (all ISO; `value` is `start/end`).
**Example**
```html
<ody-datepicker value="2026-06-15" display-format="full"></ody-datepicker>
<ody-datepicker range value="2026-06-10/2026-07-04" min="2026-04-01" max="2026-09-30"
  presets='[{"label":"This month","value":"2026-06-01/2026-06-30"}]'></ody-datepicker>
```
```js
const dp = document.querySelector('ody-datepicker');
dp.isDateDisallowed = (d) => d.getDay() === 0;       // disable Sundays
dp.formatDate = (d) => d.toLocaleDateString('en-GB'); // custom label
```

#### `<ody-table>`
**Use when** tabular data with sortable headers and optional checkbox selection.
Rich data is supplied through **JS properties** only.
**Properties (JS)**
- `columns: OdyTableColumn[]` — `{ key, label, sortable?, align?, render? }`. If omitted, columns auto-generate from the keys of the first data row. `align` is `left` | `center` | `right` (default `left`). `render(cellEl, row)` populates a custom cell element.
- `data: OdyTableRow[]` (alias `rows`) — row objects (`Record<string, unknown>`).
- `selected: OdyTableRow[]` — getter of currently selected rows; setter replaces the selection.
**Attributes**
- `selectable` — boolean; adds a leading checkbox column with header select-all (indeterminate when partial).
- `sortable` — boolean; globally enables sorting (per-column opt-in via `column.sortable`).
- `sort-key` — the column key currently sorted (reflected).
- `sort-direction` — `ascending` | `descending` (reflected).
- `sticky-header` — boolean; pins the header while the body scrolls.
**Events** (all bubble)
- `sort-change` → `{ key, direction }` — `direction` is `ascending` | `descending` | `null` (cleared).
- `selection-change` → `{ selected: OdyTableRow[] }`.
- `row-click` → `{ row, index }`.
**Example**
```html
<ody-table id="t" selectable sortable sticky-header></ody-table>
```
```js
const t = document.getElementById('t');
t.columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'age',  label: 'Age',  sortable: true, align: 'right' },
];
t.data = [{ name: 'Alice', age: 42 }, { name: 'Bob', age: 25 }];
t.addEventListener('sort-change', (e) => console.log(e.detail)); // { key, direction }
t.addEventListener('selection-change', (e) => console.log(e.detail.selected));
```

---

## 6. Icons

Two separate libraries.

### Themeable icons — `<ody-icon>` (inherit `currentColor`)
Use for UI glyphs that should follow text colour. See `<ody-icon>` above for the
element. Programmatic API (named exports):

| Function | Purpose |
|---|---|
| `iconNames(): string[]` | All registered themeable names, sorted (discover at runtime). |
| `hasIcon(name): boolean` | Whether a name is known. |
| `iconSvg(name, className?): string` | Raw `<svg>` string; unknown names → empty `<svg>`. |
| `renderIconSvg(icon, className?): string` | Build `<svg>` from `OdyIconData` (`{ viewBox, body }`). |
| `registerIcon(name, innerSvg, viewBox?)` | Register/override an icon (`viewBox` default `'0 0 24 24'`). |

```js
import { registerIcon, iconNames } from '@peektravel/app-utilities/ui';
registerIcon('star', '<path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>');
console.log(iconNames()); // discover available names
```

### Brand / fixed-colour icons — `<ody-brand-icon>` (keep baked-in colours)
Use for logos, illustrations, and status art that must keep their original
colours/gradients (do **not** follow `currentColor`).
`<ody-brand-icon>` **Attributes**: `name` (see `brandIconNames()`; unknown
renders nothing), `size` (same scale as `ody-icon`, default `base`; `free` sizes
from the surrounding box).

| Function | Purpose |
|---|---|
| `brandIconNames(): string[]` | All brand icon names, sorted. |
| `hasBrandIcon(name): boolean` | Whether a name is known. |
| `brandIconSvg(name, className?): string` | Raw `<svg>` string; unknown → empty `<svg>`. |

```html
<ody-brand-icon name="empty-state-default" size="free"></ody-brand-icon>
```

**Which to use** — text-coloured glyph → themeable (`ody-icon` / `iconSvg`);
multi-colour logo or illustration → brand (`ody-brand-icon` / `brandIconSvg`).

---

## 7. Localization

Built-in strings (aria-labels, default placeholders, status labels — **not**
your content) are localized.

**Register bundles** once:
```ts
import { registerTranslation } from '@peektravel/app-utilities/ui';
registerTranslation('es', { close: 'Cerrar', clear: 'Borrar', search: 'Buscar' });
```
Re-registering merges into the existing bundle and re-renders mounted components.

**Language resolution** — a component reads the nearest ancestor `lang`
attribute (so `<html lang="es">` localizes everything), falling back region →
base language → English. A `<html lang>` change re-renders automatically.

**Per-instance override** — an attribute wins over the registry for that
instance, e.g. `close-label`, `clear-label`, `search-placeholder`,
`previous-month-label`, `next-month-label`, `open-submenu-label`,
`toggle-menu-label`:
```html
<ody-panel close-label="Cerrar" heading="Detalles">…</ody-panel>
```

**Term keys** (`OdyTerms`): `close`, `clear`, `search`, `noOptions`,
`previousMonth`, `nextMonth`, `selectDate`, `openSubMenu`, `toggleMenu`,
`breadcrumb`, `radioGroup`, `toggleGroup`, `checkInInProgress`, `checkInNoShow`,
`checkInOverdue`, `checkInReserved`, `checkInReturned`, `checkInNone`.

**Datepicker** — calendar weekday/month names and the trigger display are
`Intl`-localized for the resolved `lang` (controlled by `display-format` /
`formatDate`); the `value` and `change` payload stay ISO `yyyy-mm-dd`.

---

## 8. Theming (CSS custom properties)

`tokens.css` defines the design tokens used by the components; override them in
your own CSS to retheme. Categories:

- **Colours** — `--color-<name>-<shade>`. Semantic: `interaction`, `info`,
  `success`, `warning`, `danger` (shades `100`–`400`). Neutrals:
  `--color-neutral-0/50/100/200/250/300/350/400`. Accents: `blue`, `green`,
  `teal`, `lime`, `purple`, `pink`, `rose`, `turquoise`, `yellow`, `orange`,
  `orange-alt` (typically shades `200`/`300`). Plus `--color-box-shadow`.
- **Typography** — `--ody-font-family`, `--ody-line-height`,
  `--ody-line-height-150`, and weights `--ody-font-weight-thin` …
  `--ody-font-weight-black` (`extra-light`, `light`, `normal`, `medium`,
  `semi-bold`, `bold`, `extra-bold`).
- **Layout / elevation** — `--layout-top-bar-height`,
  `--layout-breadcrumb-height`, `--ody-shadow-base`, `--ody-overlay`.
- **Z-index** — `--ody-z-general`, `--ody-z-side-nav`, `--ody-z-top-bar`,
  `--ody-z-modal`, `--ody-z-over-modal`, `--ody-z-tooltip`, `--ody-z-wormhole`.

```css
:root { --color-interaction-300: #0066ff; --ody-font-family: 'Inter', sans-serif; }
```

Many components also accept colours inline via attributes (`bar-color`,
`text-color`, `color`) — pass any CSS colour, including a token reference:
```html
<ody-card bar-color="var(--color-success-300)">…</ody-card>
```

---

## 9. Not included (and what to use instead)

These Odyssey components were **not** ported:

| Not ported | Use instead |
|---|---|
| `nested-multi-select` | `ody-dropdown-multi` for flat lists; for grouping, compose multiple dropdowns or build with `ody-checkbox-group` + `ody-collapsible-section`. |
| `location-autocomplete` | A native `<input>` wired to your own geocoding/autocomplete; render results with `ody-option` rows in an `ody-popover`. |
| `filter-menu` / `filter-menu-single` | `ody-popover` (trigger + panel) containing `ody-checkbox-group` (multi) or `ody-radio-button-group` / `ody-dropdown-single` (single). |
| `accordion-checkbox` | `ody-collapsible-section` (or `ody-accordion`) with an `ody-checkbox-group` inside. |
| `datepicker-with-presets` | `ody-datepicker` with the `presets` attribute (presets are built in). |
