import { OdyElement, classes, define } from '../base.js';

/**
 * `<ody-page-container>` —
 * @deprecated Use `<ody-app-page-container>` instead. This element is
 * **full-bleed** — it ships no side gutters, so every settings UI has to add
 * its own edge padding. `<ody-app-page-container>` bakes in responsive gutters
 * (with a `flush` opt-out) while keeping the same widths and container context.
 * Kept for backwards compatibility; it will not change its full-bleed behaviour.
 *
 * The standard responsive page wrapper. **Every app
 * settings UI must wrap its content in this element** so the page matches the
 * two canonical iframe widths the settings host renders at: **868px** (narrow)
 * and **1310px** (wide).
 *
 * **Design for 868px first — it is the default.** Optimise every settings
 * layout for the narrow 868px width, then ensure it *also* renders correctly
 * when the host expands it to 1310px. Treat 868px as the baseline that must
 * always look right and progressively enhance for the wider view; never design
 * 1310px-first and let it degrade, and never assume the extra width is present.
 *
 * The container is `width: 100%`, so it simply fills whichever of those two
 * widths the parent iframe gives it; a `max-width` of 1310px caps it (and
 * centres it) if it is ever embedded somewhere wider. Content is **full-bleed**
 * — it spans the container edge-to-edge with no side gutters.
 *
 * It also establishes a CSS **container context** named `ody-page`, so the
 * settings content inside can adapt between the two widths with container
 * queries instead of viewport media queries — base styles target 868px, then
 * enhance for 1310px:
 *
 * ```css
 * .my-settings-grid { grid-template-columns: 1fr; }            // default 868px
 * @container ody-page (min-width: 1310px) {                    // expanded view
 *   .my-settings-grid { grid-template-columns: 1fr 1fr; }
 * }
 * ```
 *
 * No attributes — the width is driven entirely by the parent.
 *
 * Example:
 * ```html
 * <ody-page-container>
 *   …settings UI…
 * </ody-page-container>
 * ```
 */
export class OdyPageContainer extends OdyElement {
  protected render(): void {
    this.mount(`<div class="ody-page-container" data-ody-slot></div>`);
  }
}

/**
 * `<ody-app-page-container>` — the standard responsive page wrapper for an app
 * settings UI, and the padded successor to `<ody-page-container>`. It does
 * everything that element does — fills the parent iframe (`width: 100%`), caps
 * and centres at 1310px, and establishes the `ody-page` CSS **container
 * context** so content can adapt between the two canonical widths (**868px**
 * narrow, **1310px** wide) with container queries — but it also ships a
 * **default responsive gutter** so consumers stop re-solving edge padding in a
 * wrapper `<div>` on every screen: `var(--gap24)` at the wide width, tightening
 * to `var(--gap16)` at/below 868px.
 *
 * **Design for 868px first — it is the default.** Optimise every settings
 * layout for the narrow 868px width, then ensure it *also* renders correctly at
 * 1310px; never design 1310px-first and let it degrade.
 *
 * ```css
 * .my-settings-grid { grid-template-columns: 1fr; }            // default 868px
 * @container ody-page (min-width: 1310px) {                    // expanded view
 *   .my-settings-grid { grid-template-columns: 1fr 1fr; }
 * }
 * ```
 *
 * Attributes:
 * - `flush` — remove the default gutter and render edge-to-edge, for the rare
 *   layout that truly wants full-bleed content.
 *
 * Example:
 * ```html
 * <ody-app-page-container>
 *   …settings UI…
 * </ody-app-page-container>
 * ```
 */
export class OdyAppPageContainer extends OdyElement {
  static observedAttributes = ['flush'];

  protected render(): void {
    const cls = classes(
      'ody-app-page-container',
      this.flag('flush') && 'ody-app-page-container--flush',
    );
    this.mount(`<div class="${cls}" data-ody-slot></div>`);
  }
}

define('ody-page-container', OdyPageContainer);
define('ody-app-page-container', OdyAppPageContainer);
