import { OdyElement, classes, define } from '../base.js';

/** Vertical rhythm for `<ody-horizontal-divider>`. */
export type OdyDividerSpacing = 'tight' | 'none';

/**
 * `<ody-divider>` — a 1px horizontal rule that fills its container width.
 *
 * @deprecated Use `<ody-horizontal-divider>` instead. This element renders with
 * **zero** vertical margin, so every consumer has to add spacing around it.
 * `<ody-horizontal-divider>` carries a sensible default `margin-block` (with
 * `spacing="tight"` / `spacing="none"` opt-outs). Kept for backwards
 * compatibility; it will not change its spacing-neutral behaviour.
 */
export class OdyDivider extends OdyElement {
  protected render(): void {
    this.mount('<span class="ody-divider"></span>');
  }
}

/**
 * `<ody-horizontal-divider>` — a 1px horizontal rule that fills its container
 * width **and carries its own vertical rhythm**. A separator whose only job is
 * to separate should not render with zero separation, so this defaults to
 * `margin-block: var(--gap16)`.
 *
 * Attributes:
 * - `spacing` — `tight` (`--gap8`) | `none` (`0`); default is the normal
 *   `--gap16` rhythm.
 *
 * Example:
 * ```html
 * <ody-horizontal-divider></ody-horizontal-divider>
 * <ody-horizontal-divider spacing="tight"></ody-horizontal-divider>
 * ```
 */
export class OdyHorizontalDivider extends OdyElement {
  static observedAttributes = ['spacing'];

  protected render(): void {
    const spacing = this.attr('spacing');
    const cls = classes(
      'ody-horizontal-divider',
      spacing === 'tight' && 'ody-horizontal-divider--tight',
      spacing === 'none' && 'ody-horizontal-divider--none',
    );
    this.mount(`<span class="${cls}"></span>`);
  }
}

define('ody-divider', OdyDivider);
define('ody-horizontal-divider', OdyHorizontalDivider);
