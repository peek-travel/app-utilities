import { define } from '../base.js';
import { OdySelectBase, type OdySelectOption } from '../select-base.js';

export type { OdySelectOption };

/**
 * `<ody-dropdown-single>` — a select-only combobox following the WAI-ARIA
 * combobox pattern. The trigger (`role="combobox"`) shows the selected option's
 * label or the `placeholder`; clicking it opens a `role="listbox"` panel whose
 * rows reuse the `.ody-option` look. Selection closes the panel.
 *
 * Options are supplied either as the {@link options} JS property or as a JSON
 * `options` attribute fallback (parsed on connect):
 * `options='[{"value":"a","label":"A","disabled":false}]'`.
 *
 * Attributes:
 * - `value` — the selected option value (reflected; also a JS property).
 * - `options` — JSON array fallback for {@link options}.
 * - `placeholder` — text shown when nothing is selected.
 * - `label` / `aria-label` — accessible name for the combobox trigger.
 * - `search-placeholder` — placeholder for the filter input when `searchable`.
 * - `disabled` — boolean; disables the trigger.
 * - `searchable` — boolean; renders a filter input atop the list.
 *
 * Keyboard: ArrowDown/ArrowUp (or Enter/Space) open and move the active option;
 * Home/End jump to the first/last; Enter selects and closes; Escape closes and
 * restores focus to the trigger; Tab closes; printable characters typeahead.
 *
 * Events: dispatches `change` as `CustomEvent<{ value: string }>` (bubbling) on
 * user selection only — not when the value is set programmatically.
 */
export class OdyDropdownSingle extends OdySelectBase {
  static observedAttributes = [
    'value', 'options', 'placeholder', 'label', 'aria-label',
    'search-placeholder', 'disabled', 'searchable',
  ];

  /** The selected option value. */
  get value(): string {
    return this.attr('value');
  }

  set value(next: string) {
    if (next) this.setAttribute('value', next);
    else this.removeAttribute('value');
  }

  protected get closeOnSelect(): boolean {
    return true;
  }

  protected get multiselectable(): boolean {
    return false;
  }

  protected isSelected(value: string): boolean {
    return this.value === value;
  }

  protected triggerContent(): string {
    const selected = this.options.find((o) => o.value === this.value);
    if (selected) return `<span class="ody-select__label">${this.esc(selected.label)}</span>`;
    return `<span class="ody-select__placeholder">${this.esc(this.attr('placeholder'))}</span>`;
  }

  protected commit(option: OdySelectOption): void {
    this.value = option.value;
    this.dispatchEvent(
      new CustomEvent('change', { detail: { value: option.value }, bubbles: true }),
    );
  }
}

define('ody-dropdown-single', OdyDropdownSingle);
