import { OdyElement, define } from '../base.js';
import { iconSvg } from '../icons.js';

/**
 * `<ody-message>` — a small inline status message with an optional leading
 * icon. Message text is the element's child content.
 *
 * Attributes:
 * - `icon` — optional leading icon name.
 */
export class OdyMessage extends OdyElement {
  static observedAttributes = ['icon'];

  protected render(): void {
    const icon = this.attr('icon');
    const iconEl = icon
      ? `<span class="ody-message__icon icon icon--size-small">${iconSvg(icon, 'icon__svg')}</span>`
      : '';
    this.mount(
      `<span class="ody-message-container">${iconEl}<span class="ody-message" data-ody-slot></span></span>`,
    );
  }
}

define('ody-message', OdyMessage);
