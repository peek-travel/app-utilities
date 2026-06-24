import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

/**
 * `<ody-collapsible-section>` — a titled section that expands/collapses on
 * header click. Place the expandable body in an `<ody-collapsible-content>`
 * child and the optional always-visible-when-collapsed teaser in an
 * `<ody-collapsible-collapsed>` child. Toggling emits an `expanded`
 * `CustomEvent` whose `detail` is `{ expanded }`.
 *
 * Attributes:
 * - `header-text` — the header label.
 * - `secondary-header-text` — lighter text after the header label.
 * - `icon` — optional named icon before the header label.
 * - `expanded` — open initially / reflects the open state.
 *
 * Example:
 * ```html
 * <ody-collapsible-section header-text="Details" icon="info">
 *   <ody-collapsible-collapsed>Tap to see more</ody-collapsible-collapsed>
 *   <ody-collapsible-content>…full content…</ody-collapsible-content>
 * </ody-collapsible-section>
 * ```
 */
export class OdyCollapsibleSection extends OdyElement {
  static observedAttributes = ['header-text', 'secondary-header-text', 'icon', 'expanded'];

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.#handleClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#handleClick);
  }

  #handleClick = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.ody-collapsible__header')) return;
    const next = !this.flag('expanded');
    if (next) this.setAttribute('expanded', '');
    else this.removeAttribute('expanded');
    this.dispatchEvent(new CustomEvent('expanded', { detail: { expanded: next }, bubbles: true }));
  };

  protected render(): void {
    const expanded = this.flag('expanded');
    const icon = this.attr('icon');
    const iconEl = icon ? `<span class="icon">${iconSvg(icon, 'icon__svg')}</span>` : '';
    const secondary = this.attr('secondary-header-text');
    const secondaryEl = secondary
      ? `<span class="ody-collapsible-section__secondary-header-text">${this.esc(secondary)}</span>`
      : '';
    const chevron = iconSvg(expanded ? 'chevron-up' : 'chevron-down', 'icon__svg');

    const rootCls = classes(
      'ody-collapsible-section',
      expanded && 'ody-collapsible-section--expanded',
    );

    this.mount(
      `<div class="${rootCls}">` +
        `<div class="ody-collapsible-container">` +
          `<div class="ody-collapsible">` +
            `<button type="button" class="ody-collapsible__header" aria-expanded="${expanded ? 'true' : 'false'}">` +
              `<span class="ody-collapsible__header__label">` +
                iconEl +
                `<span>${this.esc(this.attr('header-text'))}</span>` +
                secondaryEl +
              `</span>` +
              `<span class="ody-collapsible__header__icon icon">${chevron}</span>` +
            `</button>` +
            `<div class="ody-collapsible__body" data-ody-slot></div>` +
          `</div>` +
        `</div>` +
      `</div>`,
    );
  }
}

/**
 * `<ody-collapsible-collapsed>` — teaser content shown only while the parent
 * `<ody-collapsible-section>` is collapsed.
 */
export class OdyCollapsibleCollapsed extends OdyElement {
  protected render(): void {
    this.mount(`<div class="ody-collapsible-section__collapsed-content" data-ody-slot></div>`);
  }
}

/**
 * `<ody-collapsible-content>` — the body shown only while the parent
 * `<ody-collapsible-section>` is expanded.
 */
export class OdyCollapsibleContent extends OdyElement {
  protected render(): void {
    this.mount(`<div class="ody-collapsible__content" data-ody-slot></div>`);
  }
}

define('ody-collapsible-section', OdyCollapsibleSection);
define('ody-collapsible-collapsed', OdyCollapsibleCollapsed);
define('ody-collapsible-content', OdyCollapsibleContent);
