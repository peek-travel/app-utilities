import { OdyElement, classes, define } from '../base.js';

export type OdyPercentageInputSize = 'base' | 'small';

const MIN_VALUE = 0;
const MAX_VALUE = 100;

/** Characters that are never valid in a percentage field. */
const NON_NUMERIC_KEY = /[a-zA-Z_^%$#!~@,&()+-]/;

/**
 * `<ody-percentage-input>` — a numeric field constrained to 0–100 with a
 * trailing `%`. Keystrokes that are letters/symbols or would push the value
 * outside the range are blocked; on blur the value is clamped and normalised.
 *
 * Attributes:
 * - `value` — the percentage string (also a JS property; see {@link value}).
 * - `label`, `size`, `warning` — passed through to the field chrome.
 * - `readonly`, `disabled` — boolean flags.
 *
 * Events: `input` (per keystroke) and `change` (on blur, after clamping),
 * each `CustomEvent<{ value: string }>`, bubbling.
 */
export class OdyPercentageInput extends OdyElement {
  static observedAttributes = ['value', 'label', 'size', 'warning', 'readonly', 'disabled'];

  #value = '';

  /** Current percentage value. */
  get value(): string {
    return this.hasAttribute('value') ? this.attr('value') : this.#value;
  }

  set value(next: string) {
    this.#value = next;
    this.setAttribute('value', next);
  }

  protected render(): void {
    const size = this.attr('size', 'base');
    const isReadonly = this.flag('readonly');
    const isDisabled = this.flag('disabled');
    const warning = this.attr('warning');
    const value = this.value;

    const wrapperCls = classes('ody-input', 'ody-percentage-input', warning && 'ody-input--warning');
    const containerCls = classes(
      'ody-input__container',
      isReadonly && 'ody-input__container--readonly',
      `ody-input__container--${size}`,
    );

    const label = this.attr('label');
    const labelEl = label ? `<label class="ody-input__label">${this.esc(label)}</label>` : '';
    const footer = warning
      ? `<div class="ody-input__footer"><div class="ody-input__message__container">` +
          `<span class="ody-input__warning">${this.esc(warning)}</span></div></div>`
      : '';

    this.mount(
      `<div class="ody-percentage-input-container">` +
        `<div class="${wrapperCls}"${isDisabled ? ' aria-disabled="true"' : ''}>` +
          labelEl +
          `<div class="${containerCls}">` +
            `<input class="ody-input__field" type="text" inputmode="numeric" value="${this.esc(value)}"` +
              `${isReadonly ? ' readonly' : ''}${isDisabled ? ' disabled' : ''} />` +
            `<span class="ody-percentage-input__percent">%</span>` +
          `</div>` +
          footer +
        `</div>` +
      `</div>`,
    );

    const input = this.querySelector<HTMLInputElement>('.ody-input__field');
    input?.addEventListener('keypress', this.#onKeypress);
    input?.addEventListener('input', this.#onInput);
    input?.addEventListener('blur', this.#onBlur);
  }

  #onKeypress = (event: KeyboardEvent): void => {
    if (NON_NUMERIC_KEY.test(event.key)) {
      event.preventDefault();
      return;
    }
    const input = event.target as HTMLInputElement;
    // selectionStart/End are always numbers on a text input (never null).
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? start;
    const next = input.value.slice(0, start) + event.key + input.value.slice(end);
    const num = Number(next);
    if (num > MAX_VALUE || num < MIN_VALUE) event.preventDefault();
  };

  #onInput = (event: Event): void => {
    event.stopPropagation();
    const value = (event.target as HTMLInputElement).value;
    this.#value = value;
    this.dispatchEvent(new CustomEvent('input', { detail: { value }, bubbles: true }));
  };

  #onBlur = (event: Event): void => {
    const value = this.#clamp((event.target as HTMLInputElement).value);
    this.value = value;
    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true }));
  };

  /** Sanitise to digits/decimal, then clamp into the 0–100 range. */
  #clamp(raw: string): string {
    const cleaned = raw.replace(/[^\d.]/g, '');
    let num = Number(cleaned);
    if (!Number.isFinite(num)) num = MIN_VALUE;
    if (num >= MAX_VALUE) num = MAX_VALUE;
    if (cleaned === '' || num <= MIN_VALUE) num = MIN_VALUE;
    return `${num}`;
  }
}

define('ody-percentage-input', OdyPercentageInput);
