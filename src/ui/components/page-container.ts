import { OdyElement, define } from '../base.js';

/**
 * `<ody-page-container>` — the standard responsive page wrapper. **Every app
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

define('ody-page-container', OdyPageContainer);
