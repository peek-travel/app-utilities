import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

export type OdyButtonVariant = 'primary' | 'secondary' | 'ghost' | 'tertiary' | 'danger';
export type OdyButtonAppearance = 'success' | 'interaction' | 'danger' | 'grey';
export type OdyButtonSize = 'base' | 'small';

/**
 * `<ody-button>` — the Odyssey button. The text label is the element's child
 * content; icons and state are driven by attributes.
 *
 * Attributes:
 * - `variant` — `primary` | `secondary` | `ghost` | `tertiary` | `danger` (default `primary`).
 * - `appearance` — colour intent `interaction` | `success` | `danger` | `grey` (default `interaction`).
 * - `size` — `base` | `small` (default `base`).
 * - `type` — native button type `button` | `submit` (default `button`).
 * - `left-icon` / `right-icon` — named icons placed beside the label.
 * - `loading`, `icon-only`, `active`, `disabled`, `icon-rotate` — boolean flags.
 */
export class OdyButton extends OdyElement {
  static observedAttributes = [
    'variant', 'appearance', 'size', 'type', 'left-icon', 'right-icon',
    'loading', 'icon-only', 'active', 'disabled', 'icon-rotate',
  ];

  protected render(): void {
    const variant = this.attr('variant', 'primary');
    const appearance = this.attr('appearance', 'interaction');
    const size = this.attr('size', 'base');
    const isActive = this.flag('active');
    const isDisabled = this.flag('disabled');
    const isLoading = this.flag('loading');

    const cls = classes(
      'ody-button', 'btn', `btn-${variant}`, `ody-button--size-${size}`, appearance,
      isLoading && 'ody-button--loading',
      this.flag('icon-only') && 'ody-button--icon-only',
      isActive && 'ody-button--active',
      isDisabled && 'ody-button--disabled',
      this.flag('icon-rotate') && 'ody-button--rotate',
    );

    const left = this.attr('left-icon');
    const right = this.attr('right-icon');
    const leftIcon = left ? `<span class="ody-button__left-icon">${iconSvg(left, 'icon__svg')}</span>` : '';
    const rightIcon = right ? `<span class="ody-button__right-icon">${iconSvg(right, 'icon__svg')}</span>` : '';
    const spinner = isLoading
      ? `<span class="ody-button__loading-wrapper">${iconSvg('spinner', 'icon__svg ody-spin')}</span>`
      : '';

    this.mount(
      `<button type="${this.esc(this.attr('type', 'button'))}" class="${cls}"` +
        `${isDisabled ? ' disabled' : ''} aria-expanded="${isActive ? 'true' : 'false'}">` +
        `${leftIcon}<span class="ody-button__label" data-ody-slot></span>${rightIcon}${spinner}` +
      `</button>`,
    );
  }
}

define('ody-button', OdyButton);
