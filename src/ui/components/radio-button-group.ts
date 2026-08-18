import { OdyElement, classes, define } from '../base.js';

export type OdyRadioButtonGroupSize = 'base' | 'small';

/** A single selectable option in a radio-button group. */
export interface OdyRadioOption {
  label: string;
  value: string;
}

let groupSeq = 0;

/**
 * `<ody-radio-button-group>` — a fieldset of native radio inputs. Options are
 * supplied as a JSON array attribute and the current selection is tracked
 * internally.
 *
 * Attributes:
 * - `options` — JSON array, e.g. `options='[{"label":"A","value":"a"}]'`.
 * - `value` — the selected option value (also a JS property; see {@link value}).
 * - `size` — `base` | `small` (default `base`).
 * - `disabled` — boolean flag applied to every option.
 *
 * Events: dispatches `change` as `CustomEvent<{ value: string }>`, bubbling.
 */
export class OdyRadioButtonGroup extends OdyElement {
  static observedAttributes = ['options', 'value', 'size', 'disabled'];

  readonly #name = `ody-radio-button-group-${(groupSeq += 1)}`;

  /** Options set via the JS property; when set it wins over the attribute. */
  #options: OdyRadioOption[] | null = null;

  /** The selected option value. */
  get value(): string {
    return this.attr('value');
  }

  set value(next: string) {
    this.setAttribute('value', next);
  }

  /** Options: the JS property wins, else the JSON `options` attribute. */
  get options(): OdyRadioOption[] {
    return this.#options ?? parseOptions(this.attr('options'));
  }

  set options(next: OdyRadioOption[] | string) {
    this.#options = coerceOptions(next);
    if (this.querySelector('.ody-radio-button-group')) this.render();
  }

  /**
   * Reflect a `value` change by re-checking the matching radio in place instead
   * of rebuilding the fieldset — a full re-render would replace the focused
   * radio and break keyboard (arrow-key) navigation between options.
   */
  override attributeChangedCallback(name?: string, oldValue?: string | null, newValue?: string | null): void {
    if (name === 'value' && this.querySelector('.ody-radio-button-input__field')) {
      if (oldValue === newValue) return;
      const selected = this.value;
      for (const input of this.querySelectorAll<HTMLInputElement>('.ody-radio-button-input__field')) {
        input.checked = input.value === selected;
      }
      return;
    }
    super.attributeChangedCallback();
  }

  protected render(): void {
    const size = this.attr('size', 'base');
    const isDisabled = this.flag('disabled');
    const selected = this.value;

    const rows = this.options
      .map((option) => {
        const checked = option.value === selected;
        const rowCls = classes('ody-radio-button-input', size === 'small' && 'ody-radio-button-input--small');
        return (
          `<div class="${rowCls}">` +
            `<input class="ody-radio-button-input__field" type="radio" name="${this.#name}"` +
              ` value="${this.esc(option.value)}"${checked ? ' checked' : ''}` +
              `${isDisabled ? ' disabled' : ''} />` +
            `<label class="ody-radio-button-input__label">${this.esc(option.label)}</label>` +
          `</div>`
        );
      })
      .join('');

    const cls = classes('ody-radio-button-group', size === 'small' && 'ody-radio-button-group--small');

    this.mount(`<fieldset class="${cls}" aria-label="${this.localized('aria-label', 'radioGroup')}">${rows}</fieldset>`);

    for (const input of this.querySelectorAll<HTMLInputElement>('.ody-radio-button-input__field')) {
      input.addEventListener('change', this.#onChange);
    }
  }

  #onChange = (event: Event): void => {
    event.stopPropagation();
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true }));
  };
}

/** Coerce a property assignment (array or JSON string) into a typed list. */
function coerceOptions(next: OdyRadioOption[] | string | null | undefined): OdyRadioOption[] {
  if (Array.isArray(next)) return next;
  if (typeof next === 'string') return parseOptions(next);
  return [];
}

/** Parse a JSON options string into a typed list, tolerating bad input. */
function parseOptions(raw: string): OdyRadioOption[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is OdyRadioOption =>
        typeof entry === 'object' && entry !== null && 'value' in entry)
      .map((entry) => ({ label: String(entry.label ?? entry.value), value: String(entry.value) }));
  } catch {
    return [];
  }
}

define('ody-radio-button-group', OdyRadioButtonGroup);
