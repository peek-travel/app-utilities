import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

export type OdySpinnerSize = 'small' | 'base' | 'large';

/**
 * `<ody-loading-spinner>` — an animated spinner with an optional label
 * (the element's child content).
 *
 * Attributes:
 * - `size` — `small` | `base` | `large` (default `base`).
 */
export class OdyLoadingSpinner extends OdyElement {
  static observedAttributes = ['size'];

  protected render(): void {
    const size = this.attr('size', 'base');
    const cls = classes('loading-spinner', size !== 'base' && `loading-spinner--size-${size}`);
    this.mount(
      `<span class="loading-spinner-container">` +
        `<span class="${cls}">${iconSvg('spinner', 'icon__svg')}</span>` +
        `<span class="loading-spinner__label-field" data-ody-slot></span>` +
      `</span>`,
    );
  }
}

define('ody-loading-spinner', OdyLoadingSpinner);
