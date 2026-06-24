/**
 * Brand / fixed-colour icon library for the Odyssey Web Components.
 *
 * Generated from the Odyssey SVGs that bake in their own colours or gradients
 * (logos, illustrations, status art — see `brand-icons-data.ts` and
 * `scripts/generate-icons.mjs`). Unlike the themeable {@link iconSvg} set, these
 * keep their original colours and do NOT follow `currentColor`.
 *
 * Render one declaratively with `<ody-brand-icon name="…">`, or get the raw
 * markup via {@link brandIconSvg}.
 */
import { OdyElement, classes, define } from './base.js';
import { renderIconSvg } from './icons.js';
import { BRAND_ICONS } from './brand-icons-data.js';

const DEFAULT_VIEWBOX = '0 0 24 24';

/** Whether a named brand icon is known. */
export function hasBrandIcon(name: string): boolean {
  return name in BRAND_ICONS;
}

/** All brand icon names, sorted. */
export function brandIconNames(): string[] {
  return Object.keys(BRAND_ICONS).sort();
}

/**
 * Render a named brand icon as an `<svg>` string (keeping its baked-in colours).
 * Unknown names yield an empty `<svg>` so layout is preserved without throwing.
 */
export function brandIconSvg(name: string, className = ''): string {
  return renderIconSvg(BRAND_ICONS[name] ?? { viewBox: DEFAULT_VIEWBOX, body: '' }, className);
}

export type OdyBrandIconSize =
  | 'extra-small' | 'mid-small' | 'small' | 'base' | 'medium' | 'large' | 'free';

/**
 * `<ody-brand-icon>` — renders a named fixed-colour Odyssey brand icon.
 *
 * Attributes:
 * - `name` — brand icon name (see {@link brandIconNames}); unknown renders nothing.
 * - `size` — one of {@link OdyBrandIconSize} (default `base`); use `free` to
 *   size from the surrounding box (handy for larger illustrations).
 */
export class OdyBrandIcon extends OdyElement {
  static observedAttributes = ['name', 'size'];

  protected render(): void {
    const cls = classes('icon', `icon--size-${this.attr('size', 'base')}`);
    this.mount(`<span class="${cls}">${brandIconSvg(this.attr('name'), 'icon__svg')}</span>`);
  }
}

define('ody-brand-icon', OdyBrandIcon);
