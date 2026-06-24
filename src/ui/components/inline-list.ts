import { OdyElement, classes, define } from '../base.js';

export type OdyInlineListSeparator = 'line' | 'bullet';

/**
 * `<ody-inline-list>` — a horizontal list whose items are separated by a thin
 * rule or a bullet. Compose with nested `<ody-inline-list-item>` children.
 *
 * Attributes:
 * - `separator` — `line` | `bullet` (default `line`).
 * - `gap` — spacing in px between items (default `12`).
 *
 * Example:
 * ```html
 * <ody-inline-list separator="bullet" gap="8">
 *   <ody-inline-list-item>One</ody-inline-list-item>
 *   <ody-inline-list-item>Two</ody-inline-list-item>
 * </ody-inline-list>
 * ```
 */
export class OdyInlineList extends OdyElement {
  static observedAttributes = ['separator', 'gap'];

  protected render(): void {
    const separator = this.attr('separator', 'line') as OdyInlineListSeparator;
    const raw = Number.parseFloat(this.attr('gap', '12'));
    const gap = Number.isFinite(raw) ? raw : 12;
    const cls = classes('ody-inline-list', `ody-inline-list--${separator}`);
    this.mount(
      `<div class="${cls}" style="--ody-inline-list-gap:${gap}px" data-ody-slot></div>`,
    );
  }
}

/**
 * `<ody-inline-list-item>` — a single item inside an `<ody-inline-list>`. Item
 * content is the element's child content.
 */
export class OdyInlineListItem extends OdyElement {
  protected render(): void {
    this.mount(`<span class="ody-inline-list__item" data-ody-slot></span>`);
  }
}

define('ody-inline-list', OdyInlineList);
define('ody-inline-list-item', OdyInlineListItem);
