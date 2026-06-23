import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

export type OdyInputSize = 'base' | 'small';
export type OdyInputState = 'warning' | 'info';

/**
 * `<ody-input>` — the Odyssey text field. Renders a native `<input>` (or
 * `<textarea>`) in the light DOM so it stays form-friendly and accessible.
 *
 * Attributes:
 * - `label` — optional caption shown above the field.
 * - `placeholder` — native placeholder text.
 * - `value` — current value (also a JS property; see {@link value}).
 * - `size` — `base` | `small` (default `base`).
 * - `icon` — optional leading icon name.
 * - `caption` — neutral helper text in the footer.
 * - `warning` / `info` — message text; also sets the `warning`/`info` state ring.
 * - `maxlength` — when set, shows a character counter.
 * - `textarea` — render a multi-line `<textarea>` instead of an `<input>`.
 * - `readonly`, `disabled`, `full-width`, `max-content` — boolean flags.
 * - `no-clear` — suppress the clear button even when there is a value.
 *
 * Events: dispatches `input` (on every keystroke) and `change` (on the native
 * change / clear) as `CustomEvent<{ value: string }>`, bubbling.
 */
export class OdyInput extends OdyElement {
  static observedAttributes = [
    'label', 'placeholder', 'value', 'size', 'icon', 'caption', 'warning',
    'info', 'maxlength', 'textarea', 'readonly', 'disabled', 'full-width',
    'max-content', 'no-clear',
  ];

  /** Internal value backing store, kept in sync with the `value` attribute. */
  #value = '';

  /** Current field value. */
  get value(): string {
    return this.hasAttribute('value') ? this.attr('value') : this.#value;
  }

  set value(next: string) {
    this.#value = next;
    this.setAttribute('value', next);
  }

  protected render(): void {
    const size = this.attr('size', 'base');
    const isTextarea = this.flag('textarea');
    const isReadonly = this.flag('readonly');
    const isDisabled = this.flag('disabled');
    const warning = this.attr('warning');
    const info = this.attr('info');
    const caption = this.attr('caption');
    const value = this.value;

    const wrapperCls = classes(
      'ody-input',
      info && 'ody-input--info',
      warning && 'ody-input--warning',
      this.flag('max-content') && 'ody-input--max-content',
      this.flag('full-width') && 'ody-input--full-width',
    );

    const label = this.attr('label');
    const labelEl = label
      ? `<label class="ody-input__label">${this.esc(label)}</label>`
      : '';

    const icon = this.attr('icon');
    const iconEl = icon
      ? `<div class="ody-input__icon icon icon--size-small">${iconSvg(icon, 'icon__svg')}</div>`
      : '';

    const maxlength = this.attr('maxlength');
    const maxlengthAttr = maxlength ? ` maxlength="${this.esc(maxlength)}"` : '';

    const containerCls = classes(
      'ody-input__container',
      isTextarea && 'ody-input__container--textarea',
      isReadonly && 'ody-input__container--readonly',
      `ody-input__container--${size}`,
    );

    const field = isTextarea
      ? `<textarea class="ody-input__textarea" rows="3"${maxlengthAttr}` +
          `${isReadonly ? ' readonly' : ''}${isDisabled ? ' disabled' : ''}>` +
          `${this.esc(value)}</textarea>`
      : `<input class="ody-input__field" type="text" value="${this.esc(value)}"` +
          ` placeholder="${this.esc(this.attr('placeholder'))}"${maxlengthAttr}` +
          `${isReadonly ? ' readonly' : ''}${isDisabled ? ' disabled' : ''} />`;

    const clearEnabled =
      !this.flag('no-clear') && !isDisabled && !isReadonly && value !== '';
    const clearEl = clearEnabled
      ? `<button type="button" class="btn ody-input__clear-button" aria-label="${this.localized('clear-label', 'clear')}">` +
          `${iconSvg('close', 'icon__svg clear-icon')}</button>`
      : '';

    const showCounter = !isReadonly && !isDisabled && maxlength !== '';
    const messages = classes(
      caption && 'has-caption',
      warning && 'has-warning',
      info && 'has-info',
    );
    const footerNeeded = showCounter || messages !== '';
    const footer = footerNeeded
      ? `<div class="ody-input__footer">` +
          `<div class="ody-input__message__container">` +
            (caption ? `<span class="ody-input__caption">${this.esc(caption)}</span>` : '') +
            (warning ? `<span class="ody-input__warning">${this.esc(warning)}</span>` : '') +
            (info ? `<span class="ody-input__info">${this.esc(info)}</span>` : '') +
          `</div>` +
          (showCounter
            ? `<div class="ody-input__length-message">${value.length} / ${this.esc(maxlength)}</div>`
            : '') +
        `</div>`
      : '';

    this.mount(
      `<div class="${wrapperCls}"${isDisabled ? ' aria-disabled="true"' : ''}>` +
        labelEl +
        `<div class="${containerCls}"${isDisabled ? ' aria-disabled="true"' : ''}>` +
          `<span class="ody-input__leading" data-ody-slot></span>` +
          iconEl + field + clearEl +
        `</div>` +
        footer +
      `</div>`,
    );

    const control = this.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      '.ody-input__field, .ody-input__textarea',
    );
    control?.addEventListener('input', this.#onInput);
    control?.addEventListener('change', this.#onChange);
    this.querySelector('.ody-input__clear-button')?.addEventListener('click', this.#onClear);
  }

  #onInput = (event: Event): void => {
    event.stopPropagation();
    const value = (event.target as HTMLInputElement).value;
    this.#syncCounter(value);
    this.value = value;
    this.dispatchEvent(new CustomEvent('input', { detail: { value }, bubbles: true }));
  };

  #onChange = (event: Event): void => {
    event.stopPropagation();
    const value = (event.target as HTMLInputElement).value;
    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true }));
  };

  #onClear = (): void => {
    this.value = '';
    this.dispatchEvent(new CustomEvent('input', { detail: { value: '' }, bubbles: true }));
    this.dispatchEvent(new CustomEvent('change', { detail: { value: '' }, bubbles: true }));
  };

  /** Update the live character counter without a full re-render. */
  #syncCounter(value: string): void {
    const counter = this.querySelector('.ody-input__length-message');
    const max = this.attr('maxlength');
    if (counter && max) counter.textContent = `${value.length} / ${max}`;
  }
}

define('ody-input', OdyInput);
