import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

/** Gap between section children, in pixels. */
export type OdySectionGap = '8' | '16' | '24' | '32';
/** Vertical alignment for columns. */
export type OdySectionVerticalAlign = 'center' | 'top' | 'bottom';

const GAP_VALUES = new Set(['8', '16', '24', '32']);

function gapClass(prefix: string, value: string, fallback = '16'): string {
  const gap = GAP_VALUES.has(value) ? value : fallback;
  return `${prefix}--gap${gap}`;
}

/**
 * `<ody-section-columns>` — lays out child `<ody-section-column-item>` elements
 * in a row.
 *
 * Attributes:
 * - `gap-size` — `8` | `16` | `24` | `32` px (default `16`).
 * - `vertical-align` — `center` | `top` | `bottom` (default `bottom`).
 */
export class OdySectionColumns extends OdyElement {
  static observedAttributes = ['gap-size', 'vertical-align'];

  protected render(): void {
    const cls = classes(
      'ody-section',
      'ody-section-columns',
      gapClass('ody-section-columns', this.attr('gap-size', '16')),
      `ody-section-columns--vertical-align-${this.attr('vertical-align', 'bottom')}`,
    );
    this.mount(`<div class="${cls}" data-ody-slot></div>`);
  }
}

/**
 * `<ody-section-column-item>` — a column inside `<ody-section-columns>`.
 *
 * Attributes (boolean flags):
 * - `no-grow` — size to content instead of filling.
 * - `individual-scroll` — scroll this column independently.
 * - `stretch` — stretch to the row's height.
 * - `with-padding` — add 16px internal padding.
 */
export class OdySectionColumnItem extends OdyElement {
  static observedAttributes = ['no-grow', 'individual-scroll', 'stretch', 'with-padding'];

  protected render(): void {
    const cls = classes(
      'ody-section-columns__item',
      this.flag('no-grow') && 'ody-section-columns__item--no-grow',
      this.flag('individual-scroll') && 'ody-section-columns__item--individual-scroll',
      this.flag('stretch') && 'ody-section-columns__item--stretch',
      this.flag('with-padding') && 'ody-section-columns__item--with-padding',
    );
    this.mount(`<div class="${cls}" data-ody-slot></div>`);
  }
}

/**
 * `<ody-section-rows>` — stacks child `<ody-section-row-item>` elements
 * vertically.
 *
 * Attributes:
 * - `gap-size` — `8` | `16` | `24` | `32` px (default `16`).
 */
export class OdySectionRows extends OdyElement {
  static observedAttributes = ['gap-size'];

  protected render(): void {
    const cls = classes(
      'ody-section',
      'ody-section-rows',
      gapClass('ody-section-rows', this.attr('gap-size', '16')),
    );
    this.mount(`<section class="${cls}" data-ody-slot></section>`);
  }
}

/**
 * `<ody-section-row-item>` — a row inside `<ody-section-rows>`, optionally with
 * a title/description header and a trailing divider.
 *
 * Attributes:
 * - `title` — bold header line.
 * - `description` — secondary header line.
 * - `description-icon` — named icon shown before the description.
 * - `no-divider` — suppress the trailing divider.
 */
export class OdySectionRowItem extends OdyElement {
  static observedAttributes = ['title', 'description', 'description-icon', 'no-divider'];

  protected render(): void {
    const title = this.attr('title');
    const description = this.attr('description');
    const descriptionIcon = this.attr('description-icon');

    const titleEl = title ? `<h3 class="paragraph-1-bold">${this.esc(title)}</h3>` : '';
    const iconEl = descriptionIcon
      ? `<span class="icon icon--size-small">${iconSvg(descriptionIcon, 'icon__svg')}</span>`
      : '';
    const descEl = description
      ? `<p class="paragraph-2-regular ody-section-rows__description">${iconEl}${this.esc(description)}</p>`
      : '';
    const header = title || description
      ? `<div class="ody-section-rows__header">${titleEl}${descEl}</div>`
      : '';
    const divider = this.flag('no-divider') ? '' : `<div class="ody-divider"></div>`;

    this.mount(
      `<section class="ody-section-rows ody-section-rows__item">` +
        header +
        `<div data-ody-slot></div>` +
        divider +
      `</section>`,
    );
  }
}

define('ody-section-columns', OdySectionColumns);
define('ody-section-column-item', OdySectionColumnItem);
define('ody-section-rows', OdySectionRows);
define('ody-section-row-item', OdySectionRowItem);
