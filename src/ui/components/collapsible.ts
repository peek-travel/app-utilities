import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

/**
 * `<ody-collapsible>` — a lightweight inline collapsible. The header is an
 * inline label + chevron; clicking it toggles the `open` boolean attribute and
 * dispatches a `toggle` CustomEvent with `{ open }`. The body content is the
 * element's child content and is shown only when expanded.
 *
 * Attributes:
 * - `label` — header label text.
 * - `open` — boolean; whether the content is expanded (reflected, toggled on click).
 */
export class OdyCollapsible extends OdyElement {
  static observedAttributes = ['label', 'open'];

  protected render(): void {
    const expanded = this.flag('open');
    const headerCls = classes('ody-collapsible__header', expanded && 'ody-collapsible__header--expanded');
    const contentCls = classes('ody-collapsible__content', expanded && 'ody-collapsible__content--active');
    const wrapperCls = classes('ody-collapsible', expanded && 'ody-collapsible--expanded');

    this.mount(
      `<div class="ody-collapsible-container">` +
        `<div class="${wrapperCls}">` +
          `<div class="${headerCls}" role="button" tabindex="0" aria-expanded="${expanded ? 'true' : 'false'}">` +
            `<div class="ody-collapsible__header__label">${this.esc(this.attr('label'))}</div>` +
            `<div class="ody-collapsible__header__icon">${iconSvg('chevron-down', 'icon__svg')}</div>` +
          `</div>` +
          `<div class="${contentCls}" data-ody-slot></div>` +
        `</div>` +
      `</div>`,
    );

    const header = this.querySelector('.ody-collapsible__header');
    header?.addEventListener('click', this.#toggle);
  }

  readonly #toggle = (): void => {
    const next = !this.flag('open');
    if (next) this.setAttribute('open', '');
    else this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('toggle', { detail: { open: next }, bubbles: true }));
  };
}

define('ody-collapsible', OdyCollapsible);
