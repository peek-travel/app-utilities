import { OdyElement, classes, define } from '../base.js';

export type OdyMoneyInputSize = 'base' | 'small';

const DEFAULT_PRECISION = 2;

/** Currencies whose minor-unit precision differs from the default of 2. */
const CURRENCY_PRECISION: Record<string, number> = {
  JPY: 0,
};

/** Map an ISO currency code to a leading symbol (falls back to the code). */
const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$', CAD: '$', AUD: '$', NZD: '$', MXN: '$',
  EUR: '€', GBP: '£', JPY: '¥',
};

/**
 * `<ody-money-input>` — a currency amount field. Renders a native `<input>`
 * with a leading currency symbol; on blur the value is sanitised to digits and
 * a decimal point, clamped to `max-amount`, and rounded to the currency's
 * precision (JPY → 0 decimals, everything else → 2).
 *
 * Attributes:
 * - `value` — the amount string (also a JS property; see {@link value}).
 * - `currency` — ISO code used for the symbol + precision (default `USD`).
 * - `max-amount` — optional upper clamp applied on blur.
 * - `label`, `size`, `warning` — passed through to the field chrome.
 * - `readonly`, `disabled` — boolean flags.
 *
 * Events: `input` (per keystroke) and `change` (on blur, after formatting),
 * each `CustomEvent<{ value: string }>`, bubbling.
 */
export class OdyMoneyInput extends OdyElement {
  static observedAttributes = [
    'value', 'currency', 'max-amount', 'label', 'size', 'warning', 'readonly', 'disabled',
  ];

  #value = '';

  /** Current amount value. */
  get value(): string {
    return this.hasAttribute('value') ? this.attr('value') : this.#value;
  }

  set value(next: string) {
    this.#value = next;
    this.setAttribute('value', next);
  }

  /** Decimal precision for the configured currency. */
  get precision(): number {
    return CURRENCY_PRECISION[this.attr('currency', 'USD')] ?? DEFAULT_PRECISION;
  }

  protected render(): void {
    const size = this.attr('size', 'base');
    const isReadonly = this.flag('readonly');
    const isDisabled = this.flag('disabled');
    const warning = this.attr('warning');
    const currency = this.attr('currency', 'USD');
    const symbol = CURRENCY_SYMBOL[currency] ?? currency;
    const value = this.value;

    const wrapperCls = classes('ody-input', 'ody-money-input', warning && 'ody-input--warning');
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
      `<div class="ody-money-input-container">` +
        `<div class="${wrapperCls}"${isDisabled ? ' aria-disabled="true"' : ''}>` +
          labelEl +
          `<div class="${containerCls}">` +
            `<span class="ody-money-input__currency">${this.esc(symbol)}</span>` +
            `<input class="ody-input__field" type="text" inputmode="decimal" value="${this.esc(value)}"` +
              `${isReadonly ? ' readonly' : ''}${isDisabled ? ' disabled' : ''} />` +
          `</div>` +
          footer +
        `</div>` +
      `</div>`,
    );

    const input = this.querySelector<HTMLInputElement>('.ody-input__field');
    input?.addEventListener('input', this.#onInput);
    input?.addEventListener('blur', this.#onBlur);
  }

  #onInput = (event: Event): void => {
    event.stopPropagation();
    const value = (event.target as HTMLInputElement).value;
    this.#value = value;
    this.dispatchEvent(new CustomEvent('input', { detail: { value }, bubbles: true }));
  };

  #onBlur = (event: Event): void => {
    const raw = (event.target as HTMLInputElement).value;
    const value = this.#format(raw);
    this.value = value;
    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true }));
  };

  /** Sanitise, clamp to `max-amount`, and round to the currency precision. */
  #format(raw: string): string {
    const cleaned = raw.replace(/[^\d.]/g, '');
    let amount = Number.parseFloat(cleaned);
    if (!Number.isFinite(amount)) amount = 0;

    const max = Number.parseFloat(this.attr('max-amount'));
    if (Number.isFinite(max) && amount > max) amount = max;

    return amount.toFixed(this.precision);
  }
}

define('ody-money-input', OdyMoneyInput);
