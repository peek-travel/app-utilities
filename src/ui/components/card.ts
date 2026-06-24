import { OdyElement, classes, define } from '../base.js';

/**
 * `<ody-card>` — a bordered content container with an accent bar on the left.
 * Card content is the element's child content.
 *
 * Attributes:
 * - `bar-color` — CSS colour for the accent bar (default neutral-200).
 * - `clickable` — adds pointer affordance (emit your own click handling).
 * - `no-bar` — omits the accent bar entirely, rendering a plain bordered
 *   container (the default generic card).
 */
export class OdyCard extends OdyElement {
  static observedAttributes = ['bar-color', 'clickable', 'no-bar'];

  protected render(): void {
    const noBar = this.flag('no-bar');
    const barColor = this.attr('bar-color');
    const barStyle = barColor ? ` style="background-color:${this.esc(barColor)}"` : '';
    const cls = classes(
      'ody-card__container',
      this.flag('clickable') && 'ody-card--clickable',
      noBar && 'ody-card--no-bar',
    );

    const bar = noBar ? '' : `<div class="ody-card__container__bar"${barStyle}></div>`;

    this.mount(
      `<div class="${cls}" style="display:flex">` +
        bar +
        `<div class="ody-card__container__content" data-ody-slot></div>` +
      `</div>`,
    );
  }
}

define('ody-card', OdyCard);
