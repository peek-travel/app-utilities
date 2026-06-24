import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

export type OdySearchInputSize = 'base' | 'small';

const DEFAULT_PLACEHOLDER = 'Search';

/**
 * `<ody-search-input>` — a text field with a leading search icon and a
 * focus-tracking container. Renders a native `<input>` in the light DOM.
 *
 * Attributes:
 * - `value` — current value (also a JS property; see {@link value}).
 * - `placeholder` — placeholder text (default `"Search"`).
 * - `size` — `base` | `small` (default `base`).
 * - `info-message` — neutral helper caption.
 * - `warning-message` — warning caption + ring.
 * - `disabled` — boolean flag.
 *
 * Events: dispatches `input` and `change` as `CustomEvent<{ value: string }>`,
 * bubbling. The container gains `ody-search-input--focused` while focused.
 */
export class OdySearchInput extends OdyElement {
  static observedAttributes = [
    'value', 'placeholder', 'size', 'info-message', 'warning-message', 'disabled',
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
    const isDisabled = this.flag('disabled');
    const warning = this.attr('warning-message');
    const info = this.attr('info-message');
    const value = this.value;
    const placeholder = this.attr('placeholder') || DEFAULT_PLACEHOLDER;

    const wrapperCls = classes(
      'ody-input', 'ody-search-input',
      info && 'ody-input--info',
      warning && 'ody-input--warning',
    );
    const containerCls = classes('ody-input__container', `ody-input__container--${size}`);

    const caption = warning || info;
    const footer = caption
      ? `<div class="ody-input__footer"><div class="ody-input__message__container">` +
          `<span class="${warning ? 'ody-input__warning' : 'ody-input__caption'}">${this.esc(caption)}</span>` +
        `</div></div>`
      : '';

    this.mount(
      `<div class="ody-search-input-container">` +
        `<div class="${wrapperCls}"${isDisabled ? ' aria-disabled="true"' : ''}>` +
          `<div class="${containerCls}">` +
            `<div class="ody-input__icon icon icon--size-small">${iconSvg('search', 'icon__svg')}</div>` +
            `<input class="ody-input__field" type="search" value="${this.esc(value)}"` +
              ` placeholder="${this.esc(placeholder)}"${isDisabled ? ' disabled' : ''} />` +
          `</div>` +
          footer +
        `</div>` +
      `</div>`,
    );

    const input = this.querySelector<HTMLInputElement>('.ody-input__field');
    input?.addEventListener('input', this.#onInput);
    input?.addEventListener('change', this.#onChange);
    input?.addEventListener('focus', this.#onFocus);
    input?.addEventListener('blur', this.#onBlur);
  }

  #container(): Element | null {
    return this.querySelector('.ody-input__container');
  }

  #onInput = (event: Event): void => {
    event.stopPropagation();
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.dispatchEvent(new CustomEvent('input', { detail: { value }, bubbles: true }));
  };

  #onChange = (event: Event): void => {
    event.stopPropagation();
    const value = (event.target as HTMLInputElement).value;
    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true }));
  };

  #onFocus = (): void => {
    this.#container()?.classList.add('ody-search-input--focused');
  };

  #onBlur = (): void => {
    this.#container()?.classList.remove('ody-search-input--focused');
  };
}

define('ody-search-input', OdySearchInput);
