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

  /** The selected option value. */
  get value(): string {
    return this.attr('value');
  }

  set value(next: string) {
    this.setAttribute('value', next);
  }

  /** Parsed `options`; malformed JSON yields an empty list. */
  get options(): OdyRadioOption[] {
    return parseOptions(this.attr('options'));
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
