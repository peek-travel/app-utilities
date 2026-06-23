import { OdyElement, classes, define } from '../base.js';

/**
 * `<ody-card>` — a bordered content container with an accent bar on the left.
 * Card content is the element's child content.
 *
 * Attributes:
 * - `bar-color` — CSS colour for the accent bar (default neutral-200).
 * - `clickable` — adds pointer affordance (emit your own click handling).
 */
export class OdyCard extends OdyElement {
  static observedAttributes = ['bar-color', 'clickable'];

  protected render(): void {
    const barColor = this.attr('bar-color');
    const barStyle = barColor ? ` style="background-color:${this.esc(barColor)}"` : '';
    const cls = classes('ody-card__container', this.flag('clickable') && 'ody-card--clickable');

    this.mount(
      `<div class="${cls}" style="display:flex">` +
        `<div class="ody-card__container__bar"${barStyle}></div>` +
        `<div class="ody-card__container__content" data-ody-slot></div>` +
      `</div>`,
    );
  }
}

define('ody-card', OdyCard);
