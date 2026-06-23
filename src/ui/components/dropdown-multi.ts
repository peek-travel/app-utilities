import { define } from '../base.js';
import { iconSvg } from '../icons.js';
import { OdySelectBase, type OdySelectOption } from '../select-base.js';

export type { OdySelectOption };

/**
 * `<ody-dropdown-multi>` — a multi-select listbox combobox following the
 * WAI-ARIA listbox pattern (`aria-multiselectable="true"`). The trigger shows
 * the selected options as `.ody-tag` chips (or `placeholder` when empty);
 * clicking it opens the panel. Each option carries a checkbox-style check mark
 * and `aria-selected`. Toggling an option keeps the panel open.
 *
 * Options are supplied either as the {@link options} JS property or as a JSON
 * `options` attribute fallback (parsed on connect).
 *
 * Attributes:
 * - `value` — comma-delimited selected values (reflected; the JS {@link value}
 *   property reads/writes a `string[]`).
 * - `options` — JSON array fallback for {@link options}.
 * - `placeholder` — text shown when nothing is selected.
 * - `label` / `aria-label` — accessible name for the combobox trigger.
 * - `search-placeholder` — placeholder for the filter input when `searchable`.
 * - `disabled` — boolean; disables the trigger.
 * - `searchable` — boolean; renders a filter input atop the list.
 *
 * Keyboard: ArrowDown/ArrowUp (or Enter/Space) open and move the active option;
 * Home/End jump to the first/last; Space or Enter toggles the active option;
 * Escape closes and restores focus to the trigger; Tab closes.
 *
 * Events: dispatches `change` as `CustomEvent<{ value: string[] }>` (bubbling)
 * on user selection only — not when the value is set programmatically.
 */
export class OdyDropdownMulti extends OdySelectBase {
  static observedAttributes = [
    'value', 'options', 'placeholder', 'label', 'aria-label',
    'search-placeholder', 'disabled', 'searchable',
  ];

  /** The selected option values as an array. */
  get value(): string[] {
    const raw = this.attr('value');
    return raw ? raw.split(',').map((v) => v.trim()).filter(Boolean) : [];
  }

  set value(next: string[]) {
    const list = Array.isArray(next) ? next : [];
    if (list.length > 0) this.setAttribute('value', list.join(','));
    else this.removeAttribute('value');
  }

  protected get closeOnSelect(): boolean {
    return false;
  }

  protected get multiselectable(): boolean {
    return true;
  }

  protected isSelected(value: string): boolean {
    return this.value.includes(value);
  }

  protected triggerContent(): string {
    const selected = this.value;
    if (selected.length === 0) {
      return `<span class="ody-select__placeholder">${this.esc(this.attr('placeholder'))}</span>`;
    }
    const byValue = new Map(this.options.map((o) => [o.value, o.label]));
    const chips = selected
      .map((value) => {
        const label = byValue.get(value) ?? value;
        return (
          `<span class="ody-tag ody-tag--primary ody-tag--default ody-tag--size-small ody-select__chip">` +
            `<span class="ody-tag__label">${this.esc(label)}</span>` +
            `<button type="button" class="ody-select__chip-remove" aria-label="Remove ${this.esc(label)}"` +
              ` data-value="${this.esc(value)}">${iconSvg('close', 'icon__svg')}</button>` +
          `</span>`
        );
      })
      .join('');
    return `<span class="ody-select__chips">${chips}</span>`;
  }

  protected override render(): void {
    super.render();
    for (const btn of this.querySelectorAll<HTMLButtonElement>('.ody-select__chip-remove')) {
      btn.addEventListener('click', this.#onChipRemove);
    }
  }

  protected commit(option: OdySelectOption): void {
    const current = this.value;
    const next = current.includes(option.value)
      ? current.filter((v) => v !== option.value)
      : [...current, option.value];
    this.value = next;
    this.#emit(next);
  }

  readonly #onChipRemove = (event: Event): void => {
    event.stopPropagation();
    const value = (event.currentTarget as HTMLElement).dataset.value;
    const next = this.value.filter((v) => v !== value);
    this.value = next;
    this.#emit(next);
    this.render();
  };

  #emit(value: string[]): void {
    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true }));
  }
}

define('ody-dropdown-multi', OdyDropdownMulti);
