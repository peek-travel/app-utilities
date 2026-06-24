import { OdyElement, define } from '../base.js';
import { iconSvg } from '../icons.js';

/**
 * Built-in empty-state variants. Each maps to a default icon when no explicit
 * `icon`/`img-src` is supplied — mirroring the Odyssey `empty-state-*` SVGs.
 */
export type OdyEmptyStateVariant =
  | 'default'
  | 'error'
  | 'no-results'
  | 'no-search'
  | 'not-authorized';

const VARIANT_ICON: Record<OdyEmptyStateVariant, string> = {
  default: 'info',
  error: 'danger',
  'no-results': 'info',
  'no-search': 'search',
  'not-authorized': 'warning',
};

/**
 * `<ody-empty-state>` — a centred placeholder for empty/error/no-results views.
 * The element's child content is rendered below the label/caption (e.g. an
 * action button).
 *
 * Attributes:
 * - `variant` — `default` | `error` | `no-results` | `no-search` | `not-authorized`
 *   (default `default`); selects a fallback illustration icon.
 * - `img-src` / `img-alt` — render a custom image instead of the icon.
 * - `icon` — override the illustration with a named icon.
 * - `label` — bold primary message.
 * - `caption` — secondary message.
 */
export class OdyEmptyState extends OdyElement {
  static observedAttributes = ['variant', 'img-src', 'img-alt', 'icon', 'label', 'caption'];

  protected render(): void {
    const variant = this.attr('variant', 'default') as OdyEmptyStateVariant;
    const imgSrc = this.attr('img-src');
    const explicitIcon = this.attr('icon');
    const icon = explicitIcon || (VARIANT_ICON[variant] ?? VARIANT_ICON.default);

    let media = '';
    if (imgSrc) {
      const alt = this.attr('img-alt');
      media = `<img class="ody-empty-state__image" src="${this.esc(imgSrc)}" alt="${this.esc(alt)}" />`;
    } else {
      media = `<span class="ody-empty-state__image ody-empty-state__icon">${iconSvg(icon, 'icon__svg')}</span>`;
    }

    const label = this.attr('label');
    const caption = this.attr('caption');
    const labelEl = label ? `<div class="ody-empty-state__label">${this.esc(label)}</div>` : '';
    const captionEl = caption ? `<div class="ody-empty-state__caption">${this.esc(caption)}</div>` : '';

    this.mount(
      `<div class="ody-empty-state">` +
        media +
        `<div class="ody-empty-state__messages-container">` +
          labelEl +
          captionEl +
          `<div class="ody-empty-state__block" data-ody-slot></div>` +
        `</div>` +
      `</div>`,
    );
  }
}

define('ody-empty-state', OdyEmptyState);
