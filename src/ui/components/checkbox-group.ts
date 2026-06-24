import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

export type OdyCheckboxGroupSize = 'base' | 'small';

/** A single selectable option in a checkbox group. */
export interface OdyCheckboxOption {
  label: string;
  value: string;
}

/**
 * `<ody-checkbox-group>` — a list of checkboxes with an optional "select all"
 * parent. Options are supplied as a JSON array attribute and the set of
 * selected values is tracked internally.
 *
 * The parent checkbox reflects the children: checked when all are selected,
 * indeterminate when some are, and toggling it selects/clears every child.
 *
 * Attributes:
 * - `options` — JSON array, e.g. `options='[{"label":"A","value":"a"}]'`.
 * - `value` — comma-separated selected values (also a JS array property,
 *   {@link value}).
 * - `select-all-label` — when present, renders the parent select-all row.
 * - `size` — `base` | `small` (default `small`).
 * - `disabled` — boolean flag applied to every checkbox.
 *
 * Events: dispatches `change` as `CustomEvent<{ value: string[] }>`, bubbling.
 */
export class OdyCheckboxGroup extends OdyElement {
  static observedAttributes = ['options', 'value', 'select-all-label', 'size', 'disabled'];

  /** The selected option values. */
  get value(): string[] {
    const raw = this.attr('value');
    return raw ? raw.split(',').filter(Boolean) : [];
  }

  set value(next: string[]) {
    this.setAttribute('value', next.join(','));
  }

  /** Parsed `options`; malformed JSON yields an empty list. */
  get options(): OdyCheckboxOption[] {
    return parseOptions(this.attr('options'));
  }

  protected render(): void {
    const size = this.attr('size', 'small');
    const isDisabled = this.flag('disabled');
    const options = this.options;
    const selected = new Set(this.value);

    const selectAllLabel = this.attr('select-all-label');
    const allChecked = options.length > 0 && options.every((o) => selected.has(o.value));
    const someChecked = !allChecked && options.some((o) => selected.has(o.value));

    const mainRow = this.hasAttribute('select-all-label')
      ? `<div class="ody-checkbox-group__main">` +
          this.#checkboxMarkup({
            cls: 'ody-checkbox-group__select-all',
            label: selectAllLabel,
            checked: allChecked,
            indeterminate: someChecked,
            disabled: isDisabled,
            size,
          }) +
        `</div>`
      : '';

    const items = options
      .map((option) =>
        `<div class="ody-checkbox-group__item">` +
          this.#checkboxMarkup({
            cls: '',
            label: option.label,
            checked: selected.has(option.value),
            indeterminate: false,
            disabled: isDisabled,
            size,
            value: option.value,
          }) +
        `</div>`)
      .join('');

    this.mount(
      `<div class="ody-checkbox-group">` +
        mainRow +
        `<div class="ody-checkbox-group__items">${items}</div>` +
      `</div>`,
    );

    // Set the .indeterminate property (it has no HTML attribute).
    const main = this.querySelector<HTMLInputElement>('.ody-checkbox-group__select-all .ody-checkbox__input');
    if (main) main.indeterminate = someChecked;
    main?.addEventListener('change', this.#onSelectAll);

    for (const input of this.querySelectorAll<HTMLInputElement>(
      '.ody-checkbox-group__item .ody-checkbox__input',
    )) {
      input.addEventListener('change', this.#onItem);
    }
  }

  /** Render one checkbox (reused for the parent and each item). */
  #checkboxMarkup(opts: {
    cls: string;
    label: string;
    checked: boolean;
    indeterminate: boolean;
    disabled: boolean;
    size: string;
    value?: string;
  }): string {
    const wrapperCls = classes('ody-checkbox', opts.cls, opts.checked && 'ody-checkbox--checked');
    const inputCls = classes('ody-checkbox__input', `ody-checkbox__input--size-${opts.size}`);
    const mark = opts.indeterminate
      ? `<span class="ody-checkbox__mark">${iconSvg('minus', 'icon__svg')}</span>`
      : opts.checked
        ? `<span class="ody-checkbox__mark">${iconSvg('check', 'icon__svg')}</span>`
        : '';
    const valueAttr = opts.value !== undefined ? ` value="${this.esc(opts.value)}"` : '';
    return (
      `<div class="${wrapperCls}"><div class="ody-checkbox__container">` +
        `<span class="ody-checkbox__box">` +
          `<input class="${inputCls}" type="checkbox"${valueAttr}` +
            `${opts.checked ? ' checked' : ''}${opts.disabled ? ' disabled' : ''} />` +
          mark +
        `</span>` +
        `<label class="ody-checkbox__label">${this.esc(opts.label)}</label>` +
      `</div></div>`
    );
  }

  #onSelectAll = (event: Event): void => {
    event.stopPropagation();
    const checked = (event.target as HTMLInputElement).checked;
    this.value = checked ? this.options.map((o) => o.value) : [];
    this.#emit();
  };

  #onItem = (event: Event): void => {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    const selected = new Set(this.value);
    if (input.checked) selected.add(input.value);
    else selected.delete(input.value);
    // Preserve option order in the stored value.
    this.value = this.options.map((o) => o.value).filter((v) => selected.has(v));
    this.#emit();
  };

  #emit(): void {
    this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value }, bubbles: true }));
  }
}

/** Parse a JSON options string into a typed list, tolerating bad input. */
function parseOptions(raw: string): OdyCheckboxOption[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is OdyCheckboxOption =>
        typeof entry === 'object' && entry !== null && 'value' in entry)
      .map((entry) => ({ label: String(entry.label ?? entry.value), value: String(entry.value) }));
  } catch {
    return [];
  }
}

define('ody-checkbox-group', OdyCheckboxGroup);
