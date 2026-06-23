import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

export type OdyIconSize =
  | 'extra-small'
  | 'mid-small'
  | 'small'
  | 'base'
  | 'medium'
  | 'large'
  | 'free';

/**
 * `<ody-icon>` — renders a named inline SVG from the bundled icon set.
 *
 * Attributes:
 * - `name` — icon name (see `icons.ts`); unknown names render nothing.
 * - `size` — one of {@link OdyIconSize} (default `base`).
 * - `disabled` — dims the icon.
 */
export class OdyIcon extends OdyElement {
  static observedAttributes = ['name', 'size', 'disabled'];

  protected render(): void {
    const size = this.attr('size', 'base');
    const cls = classes(
      'icon',
      `icon--size-${size}`,
      this.flag('disabled') && 'icon--disabled',
    );
    this.mount(`<span class="${cls}">${iconSvg(this.attr('name'), 'icon__svg')}</span>`);
  }
}

define('ody-icon', OdyIcon);
