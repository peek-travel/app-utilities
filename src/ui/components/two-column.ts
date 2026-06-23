import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

/**
 * `<ody-two-column>` — a master/detail layout: a main content area beside an
 * optional secondary panel. Compose with `<ody-two-column-main>` and
 * `<ody-two-column-secondary>` children. The secondary panel is shown only when
 * the `secondary-open` attribute is present.
 *
 * Attributes:
 * - `secondary-open` — when present, reveals the secondary panel.
 *
 * Example:
 * ```html
 * <ody-two-column secondary-open>
 *   <ody-two-column-main>…list…</ody-two-column-main>
 *   <ody-two-column-secondary>
 *     <ody-two-column-secondary-header title="Details"></ody-two-column-secondary-header>
 *     …detail…
 *   </ody-two-column-secondary>
 * </ody-two-column>
 * ```
 */
export class OdyTwoColumn extends OdyElement {
  static observedAttributes = ['secondary-open'];

  protected render(): void {
    const cls = classes(
      'ody-two-column',
      this.flag('secondary-open') && 'ody-two-column--secondary-open',
    );
    this.mount(`<div class="${cls}" data-ody-slot></div>`);
  }
}

/**
 * `<ody-two-column-main>` — the primary content area inside `<ody-two-column>`.
 */
export class OdyTwoColumnMain extends OdyElement {
  protected render(): void {
    this.mount(`<section class="ody-two-column__main-content" data-ody-slot></section>`);
  }
}

/**
 * `<ody-two-column-secondary>` — the secondary/detail panel inside
 * `<ody-two-column>`. Hidden unless the parent has `secondary-open`.
 */
export class OdyTwoColumnSecondary extends OdyElement {
  protected render(): void {
    this.mount(`<section class="ody-two-column__secondary" data-ody-slot></section>`);
  }
}

/**
 * `<ody-two-column-secondary-header>` — a title bar with a close button for the
 * secondary panel. Clicking the close button emits a `close` `CustomEvent`.
 *
 * Attributes:
 * - `title` — the header title text.
 */
export class OdyTwoColumnSecondaryHeader extends OdyElement {
  static observedAttributes = ['title'];

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
    if (target?.closest('.ody-two-column__secondary__close-button')) {
      this.dispatchEvent(new CustomEvent('close', { bubbles: true }));
    }
  };

  protected render(): void {
    this.mount(
      `<header class="ody-two-column__secondary__header">` +
        `<span class="ody-two-column__secondary__header__title">${this.esc(this.attr('title'))}</span>` +
        `<button type="button" class="ody-button btn btn-ghost ody-two-column__secondary__close-button" aria-label="${this.localized('close-label', 'close')}">` +
          `<span class="icon">${iconSvg('close', 'icon__svg')}</span>` +
        `</button>` +
      `</header>`,
    );
  }
}

define('ody-two-column', OdyTwoColumn);
define('ody-two-column-main', OdyTwoColumnMain);
define('ody-two-column-secondary', OdyTwoColumnSecondary);
define('ody-two-column-secondary-header', OdyTwoColumnSecondaryHeader);
