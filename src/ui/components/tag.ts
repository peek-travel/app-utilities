import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

export type OdyTagVariant = 'primary' | 'secondary';
export type OdyTagColor =
  | 'default' | 'info' | 'success' | 'warning' | 'danger' | 'teal' | 'lime'
  | 'purple' | 'pink' | 'turquoise' | 'yellow' | 'orange' | 'rose' | 'blue';
export type OdyTagSize = 'base' | 'small';

/**
 * `<ody-tag>` — a rounded label/pill. Label text is the element's child content.
 *
 * Attributes:
 * - `variant` — `primary` (filled) | `secondary` (outline) (default `primary`).
 * - `color` — semantic/accent colour (default `default`).
 * - `size` — `base` | `small` (default `base`).
 * - `icon` — optional leading icon name.
 * - `count` — optional trailing count.
 */
export class OdyTag extends OdyElement {
  static observedAttributes = ['variant', 'color', 'size', 'icon', 'count'];

  protected render(): void {
    const cls = classes(
      'ody-tag',
      `ody-tag--${this.attr('variant', 'primary')}`,
      `ody-tag--${this.attr('color', 'default')}`,
      this.attr('size', 'base') === 'small' && 'ody-tag--size-small',
    );
    const icon = this.attr('icon');
    const iconEl = icon ? `<span class="ody-tag__icon">${iconSvg(icon, 'icon__svg')}</span>` : '';
    const count = this.attr('count');
    const countEl = count ? `<span class="ody-tag__count">${this.esc(count)}</span>` : '';

    this.mount(
      `<span class="${cls}">${iconEl}<span class="ody-tag__label" data-ody-slot></span>${countEl}</span>`,
    );
  }
}

define('ody-tag', OdyTag);
