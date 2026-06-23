import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';
import type { OdyButtonVariant, OdyButtonSize } from './button.js';

/**
 * `<ody-split-button>` — a primary action button joined to a dropdown toggle.
 * The primary label is the `text` attribute; clicking it dispatches a `primary`
 * CustomEvent. The toggle reveals a click-toggled panel whose content is the
 * element's child content; toggling dispatches a `toggle` CustomEvent with
 * `{ open }` and reflects the `open` boolean attribute.
 *
 * Attributes:
 * - `text` — primary button label.
 * - `variant` — button variant (default `secondary`).
 * - `size` — `base` | `small` (default `base`).
 * - `icon` — toggle icon name (default `chevron-down`).
 * - `open` — boolean; whether the dropdown panel is shown (reflected).
 */
export class OdySplitButton extends OdyElement {
  static observedAttributes = ['text', 'variant', 'size', 'icon', 'open'];

  protected render(): void {
    const variant = this.attr('variant', 'secondary') as OdyButtonVariant;
    const size = this.attr('size', 'base') as OdyButtonSize;
    const open = this.flag('open');
    const leftCls = classes('ody-button', 'btn', `btn-${variant}`, `ody-button--size-${size}`, 'interaction', 'split-button__left-button');
    const rightCls = classes(
      'ody-button', 'btn', `btn-${variant}`, `ody-button--size-${size}`, 'interaction', 'split-button__right-button',
      open && 'ody-button--active',
    );

    this.mount(
      `<div class="split-button-container">` +
        `<button type="button" class="${leftCls}">` +
          `<span class="ody-button__label">${this.esc(this.attr('text'))}</span>` +
        `</button>` +
        `<button type="button" class="${rightCls}" aria-expanded="${open ? 'true' : 'false'}" aria-label="${this.localized('toggle-menu-label', 'toggleMenu')}">` +
          `<span class="icon">${iconSvg(this.attr('icon', 'chevron-down'), 'icon__svg')}</span>` +
        `</button>` +
        `<div class="split-button__panel"${open ? '' : ' hidden'} data-ody-slot></div>` +
      `</div>`,
    );

    this.querySelector('.split-button__left-button')?.addEventListener('click', this.#onPrimary);
    this.querySelector('.split-button__right-button')?.addEventListener('click', this.#onToggle);
  }

  readonly #onPrimary = (): void => {
    this.dispatchEvent(new CustomEvent('primary', { bubbles: true }));
  };

  readonly #onToggle = (): void => {
    const next = !this.flag('open');
    if (next) this.setAttribute('open', '');
    else this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('toggle', { detail: { open: next }, bubbles: true }));
  };
}

define('ody-split-button', OdySplitButton);
