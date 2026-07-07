import { OdyElement, classes, define, reflectControlValue } from '../base.js';
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

  /**
   * Reflect `value` into the live control in place — the native field already
   * shows what the user typed, so rebuilding it (as a full re-render would)
   * needlessly drops focus and caret. Every other observed attribute changes
   * the chrome and still re-renders via the base implementation.
   */
  override attributeChangedCallback(name?: string, oldValue?: string | null, newValue?: string | null): void {
    if (name === 'value') {
      if (oldValue === newValue) return;
      const value = newValue ?? '';
      reflectControlValue(
        this.querySelector<HTMLInputElement | HTMLTextAreaElement>(
          '.ody-inline-input__field, .ody-inline-input__textarea',
        ),
        value,
      );
      this.#syncCounter(value);
      this.#syncClearButton(value);
      return;
    }
    super.attributeChangedCallback();
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

    const clearEl = this.#clearEnabled(value) ? this.#clearButtonHtml() : '';

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
    // Reflecting to the `value` attribute drives the counter and clear button
    // in place (see attributeChangedCallback) without a focus-dropping rebuild.
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

  /** Whether the clear button should be shown for the given value. */
  #clearEnabled(value: string): boolean {
    return !this.flag('no-clear') && !this.flag('disabled') && !this.flag('readonly') && value !== '';
  }

  /** Markup for the clear button (shared by render and the in-place sync). */
  #clearButtonHtml(): string {
    return `<button type="button" class="btn ody-inline-input__clear-button" aria-label="${this.localized('clear-label', 'clear')}">` +
      `${iconSvg('close', 'icon__svg clear-icon')}</button>`;
  }

  /** Add or remove the clear button in place as the value gains/loses content. */
  #syncClearButton(value: string): void {
    const existing = this.querySelector('.ody-inline-input__clear-button');
    if (this.#clearEnabled(value)) {
      if (existing) return;
      const control = this.querySelector('.ody-inline-input__field, .ody-inline-input__textarea');
      control?.insertAdjacentHTML('afterend', this.#clearButtonHtml());
      this.querySelector('.ody-inline-input__clear-button')?.addEventListener('click', this.#onClear);
    } else {
      existing?.remove();
    }
  }
}

define('ody-inline-input', OdyInlineInput);
