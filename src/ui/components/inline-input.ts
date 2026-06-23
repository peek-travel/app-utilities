import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

export type OdyInlineInputSize = 'base' | 'small';

/**
 * `<ody-inline-input>` — the thin "inline" variant of {@link OdyInput}. Same
 * native-control behaviour, but with the compact `ody-inline-input__group`
 * chrome (a borderless label/field row used inside tables and forms).
 *
 * Attributes mirror `<ody-input>`: `label`, `placeholder`, `value`, `size`,
 * `icon`, `caption`, `warning`, `info`, `maxlength`, `textarea`, `readonly`,
 * `disabled`, `full-width`, `max-content`, `no-clear`.
 *
 * Events: `input` and `change` as `CustomEvent<{ value: string }>`, bubbling.
 */
export class OdyInlineInput extends OdyElement {
  static observedAttributes = [
    'label', 'placeholder', 'value', 'size', 'icon', 'caption', 'warning',
    'info', 'maxlength', 'textarea', 'readonly', 'disabled', 'full-width',
    'max-content', 'no-clear',
  ];

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
      'ody-inline-input',
      info && 'ody-inline-input--info',
      warning && 'ody-inline-input--warning',
      this.flag('max-content') && 'ody-inline-input--max-content',
      this.flag('full-width') && 'ody-inline-input--full-width',
    );

    const label = this.attr('label');
    const labelEl = label
      ? `<label class="${classes('ody-inline-input__label', `ody-inline-input__label--${size}`)}">` +
          `<span>${this.esc(label)}</span></label>`
      : '';

    const icon = this.attr('icon');
    const iconEl = icon
      ? `<div class="ody-inline-input__icon icon icon--size-small">${iconSvg(icon, 'icon__svg')}</div>`
      : '';

    const maxlength = this.attr('maxlength');
    const maxlengthAttr = maxlength ? ` maxlength="${this.esc(maxlength)}"` : '';

    const groupCls = classes(
      'ody-inline-input__group',
      isTextarea && 'ody-inline-input__group--textarea',
      isReadonly && 'ody-inline-input__group--readonly',
      `ody-inline-input__group--${size}`,
    );

    const field = isTextarea
      ? `<textarea class="ody-inline-input__textarea" rows="3"${maxlengthAttr}` +
          `${isReadonly ? ' readonly' : ''}${isDisabled ? ' disabled' : ''}>` +
          `${this.esc(value)}</textarea>`
      : `<input class="ody-inline-input__field" type="text" value="${this.esc(value)}"` +
          ` placeholder="${this.esc(this.attr('placeholder'))}"${maxlengthAttr}` +
          `${isReadonly ? ' readonly' : ''}${isDisabled ? ' disabled' : ''} />`;

    const clearEnabled =
      !this.flag('no-clear') && !isDisabled && !isReadonly && value !== '';
    const clearEl = clearEnabled
      ? `<button type="button" class="btn ody-inline-input__clear-button" aria-label="${this.localized('clear-label', 'clear')}">` +
          `${iconSvg('close', 'icon__svg clear-icon')}</button>`
      : '';

    const showCounter = !isReadonly && !isDisabled && maxlength !== '';
    const footerNeeded = showCounter || caption !== '' || warning !== '' || info !== '';
    const footer = footerNeeded
      ? `<div class="ody-inline-input-footer">` +
          `<div class="ody-inline-input-footer__message">` +
            (caption ? `<span class="ody-inline-input-footer__message__caption">${this.esc(caption)}</span>` : '') +
            (warning ? `<span class="ody-inline-input-footer__message__warning">${this.esc(warning)}</span>` : '') +
            (info ? `<span class="ody-inline-input-footer__message__info">${this.esc(info)}</span>` : '') +
          `</div>` +
          (showCounter
            ? `<div class="ody-inline-input-footer__length-message">${value.length} / ${this.esc(maxlength)}</div>`
            : '') +
        `</div>`
      : '';

    this.mount(
      `<div class="${wrapperCls}"${isDisabled ? ' aria-disabled="true"' : ''}>` +
        labelEl +
        `<div class="${groupCls}"${isDisabled ? ' aria-disabled="true"' : ''}>` +
          `<span class="ody-inline-input__leading" data-ody-slot></span>` +
          iconEl + field + clearEl +
        `</div>` +
        footer +
      `</div>`,
    );

    const control = this.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      '.ody-inline-input__field, .ody-inline-input__textarea',
    );
    control?.addEventListener('input', this.#onInput);
    control?.addEventListener('change', this.#onChange);
    this.querySelector('.ody-inline-input__clear-button')?.addEventListener('click', this.#onClear);
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

  #syncCounter(value: string): void {
    const counter = this.querySelector('.ody-inline-input-footer__length-message');
    const max = this.attr('maxlength');
    if (counter && max) counter.textContent = `${value.length} / ${max}`;
  }
}

define('ody-inline-input', OdyInlineInput);
