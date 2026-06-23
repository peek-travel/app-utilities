import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

export type OdyAlertVariant = 'info' | 'success' | 'warning' | 'danger';

const VARIANT_ICON: Record<OdyAlertVariant, string> = {
  info: 'info',
  success: 'check-filled',
  warning: 'warning',
  danger: 'danger',
};

/**
 * `<ody-alert>` — a contextual message box. The body is the element's child
 * content; the bold heading line is set via the `heading` attribute.
 *
 * Attributes:
 * - `variant` — `info` | `success` | `warning` | `danger` (default `info`).
 * - `heading` — optional bold message shown beside the icon.
 */
export class OdyAlert extends OdyElement {
  static observedAttributes = ['variant', 'heading'];

  protected render(): void {
    const variant = this.attr('variant', 'info') as OdyAlertVariant;
    const icon = VARIANT_ICON[variant] ?? VARIANT_ICON.info;
    const heading = this.attr('heading');
    const headingEl = heading ? `<p class="ody-alert__message">${this.esc(heading)}</p>` : '';

    this.mount(
      `<div class="ody-alert-container">` +
        `<div class="${classes('ody-alert', `ody-alert--${variant}`)}">` +
          `<div class="ody-alert__message-container">` +
            `<span class="ody-alert__icon icon icon--size-medium">${iconSvg(icon, 'icon__svg')}</span>` +
            headingEl +
          `</div>` +
          `<div class="ody-alert__body" data-ody-slot></div>` +
        `</div>` +
      `</div>`,
    );
  }
}

define('ody-alert', OdyAlert);
