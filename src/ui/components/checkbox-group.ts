import { OdyElement, classes, define } from '../base.js';
import { applyCheckboxState } from '../checkbox-state.js';
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
 * - `options` — JSON array, e.g. `options='[{"label":"A","value":"a"}]'`. Also
 *   a settable JS property ({@link options}): `el.options = [...]` (array or JSON
 *   string) mirrors `<ody-dropdown-*>`; the property is the source of truth and
 *   is not reflected back onto the attribute.
 * - `value` — selected values (also a JS array property, {@link value}). The
 *   reflected attribute is a JSON array (values with commas round-trip); a
 *   legacy comma-separated attribute is still accepted when read.
 * - `select-all-label` — when present, renders the parent select-all row.
 * - `size` — `base` | `small` (default `small`).
 * - `disabled` — boolean flag applied to every checkbox.
 *
 * Events: dispatches `change` as `CustomEvent<{ value: string[] }>`, bubbling.
 */
export class OdyCheckboxGroup extends OdyElement {
  static observedAttributes = ['options', 'value', 'select-all-label', 'size', 'disabled'];

  /** Options set via the JS property; when set it wins over the attribute. */
  #options: OdyCheckboxOption[] | null = null;

  /**
   * The selected option values. The reflected `value` attribute is serialized
   * as a JSON array so values containing commas round-trip; a legacy
   * comma-separated attribute is still read for backwards compatibility.
   */
  get value(): string[] {
    const raw = this.attr('value');
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      /* fall through to the legacy comma format */
    }
    return raw.split(',').filter(Boolean);
  }

  set value(next: string[]) {
    this.setAttribute('value', JSON.stringify(Array.isArray(next) ? next : []));
  }

  /** Options: the JS property wins, else the JSON `options` attribute. */
  get options(): OdyCheckboxOption[] {
    return this.#options ?? parseOptions(this.attr('options'));
  }

  /**
   * Accepts an array of `{ label, value }` (or a JSON string) and stores it as
   * the source of truth. Mirrors `<ody-dropdown-*>` so `el.options = [...]`
   * works, without reflecting a large JSON blob onto the DOM attribute.
   */
  set options(next: OdyCheckboxOption[] | string) {
    this.#options = coerceOptions(next);
    if (this.querySelector('.ody-checkbox-group')) this.render();
  }

  /**
   * Reflect a `value` change by updating each checkbox (and the select-all
   * parent) in place, so toggling an option keeps focus instead of rebuilding
   * the group. Other observed attributes still re-render via the base.
   */
  override attributeChangedCallback(name?: string, oldValue?: string | null, newValue?: string | null): void {
    if (name === 'value' && this.querySelector('.ody-checkbox-group')) {
      if (oldValue === newValue) return;
      this.#syncSelection();
      return;
    }
    super.attributeChangedCallback();
  }

  /** Recompute checked/indeterminate state for every checkbox in place. */
  #syncSelection(): void {
    const options = this.options;
    const selected = new Set(this.value);
    const allChecked = options.length > 0 && options.every((o) => selected.has(o.value));
    const someChecked = !allChecked && options.some((o) => selected.has(o.value));
    for (const cb of this.querySelectorAll('.ody-checkbox-group__item .ody-checkbox')) {
      const input = cb.querySelector<HTMLInputElement>('.ody-checkbox__input');
      applyCheckboxState(cb, input ? selected.has(input.value) : false, false);
    }
    applyCheckboxState(this.querySelector('.ody-checkbox-group__select-all'), allChecked, someChecked);
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

/** Coerce a property assignment (array or JSON string) into a typed list. */
function coerceOptions(next: OdyCheckboxOption[] | string | null | undefined): OdyCheckboxOption[] {
  if (Array.isArray(next)) return next;
  if (typeof next === 'string') return parseOptions(next);
  return [];
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
