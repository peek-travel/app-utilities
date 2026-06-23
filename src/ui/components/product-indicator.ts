import { OdyElement, classes, define } from '../base.js';

export type OdyProductIndicatorSize = 'base' | 'small';

/**
 * `<ody-product-indicator>` — a coloured vertical bar beside a product name and
 * optional detail line. Extra content (e.g. a tag) is the element's child
 * content, rendered after the name/detail.
 *
 * Attributes:
 * - `name` — the product name (bold line).
 * - `detail` — a secondary detail line.
 * - `bar-color` — CSS colour for the accent bar (default neutral-400).
 * - `text-color` — CSS colour for the name text.
 * - `size` — `base` | `small` (default `base`).
 * - `indicator-id` — when set together with `clickable`, emitted in the `select`
 *   event `detail` as `{ id }`.
 * - `clickable` — makes the whole indicator a button that emits `select`.
 */
export class OdyProductIndicator extends OdyElement {
  static observedAttributes = [
    'name', 'detail', 'bar-color', 'text-color', 'size', 'indicator-id', 'clickable',
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.#handleClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#handleClick);
  }

  #handleClick = (): void => {
    if (!this.flag('clickable')) return;
    this.dispatchEvent(
      new CustomEvent('select', { detail: { id: this.attr('indicator-id') }, bubbles: true }),
    );
  };

  protected render(): void {
    const size = this.attr('size', 'base') as OdyProductIndicatorSize;
    const clickable = this.flag('clickable');
    const cls = classes(
      'ody-product-indicator-container',
      `ody-product-indicator-container--size-${size}`,
      clickable && 'ody-product-indicator-clickable',
    );

    const barColor = this.attr('bar-color');
    const barStyle = barColor ? ` style="background-color:${this.esc(barColor)}"` : '';
    const bar = `<div class="ody-product-indicator__bar"${barStyle}></div>`;

    const textColor = this.attr('text-color');
    const textStyle = textColor ? ` style="color:${this.esc(textColor)}"` : '';
    const name = this.attr('name');
    const nameEl = `<div class="ody-product-indicator__name"${textStyle}>${this.esc(name)}</div>`;

    const detail = this.attr('detail');
    const detailEl = detail
      ? `<div class="ody-product-indicator__detail">${this.esc(detail)}</div>`
      : '';

    const role = clickable ? ' role="button"' : '';

    this.mount(
      `<div class="${cls}"${role}>` +
        `<div class="ody-product-indicator">` +
          bar +
          `<div class="ody-product-indicator__content">` +
            nameEl +
            detailEl +
            `<div class="ody-product-indicator__extra" data-ody-slot></div>` +
          `</div>` +
        `</div>` +
      `</div>`,
    );
  }
}

define('ody-product-indicator', OdyProductIndicator);
