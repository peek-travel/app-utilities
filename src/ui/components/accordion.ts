import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

/**
 * `<ody-accordion>` — an expand/collapse panel with a clickable header.
 *
 * The header label is set via the `title` attribute (or a `[data-ody-slot]`
 * header child is not used here — the body content is the element's child
 * content). Clicking the header toggles the `open` boolean attribute and
 * dispatches a `toggle` CustomEvent with `{ open }`.
 *
 * Attributes:
 * - `title` — header label text.
 * - `open` — boolean; whether the body is expanded (reflected, toggled on click).
 * - `sticky` — boolean; pins the header to the top while scrolling.
 */
export class OdyAccordion extends OdyElement {
  static observedAttributes = ['title', 'open', 'sticky'];

  protected render(): void {
    const expanded = this.flag('open');
    const containerCls = classes('ody-accordion', this.flag('sticky') && 'ody-accordion--sticky-header');
    const icon = expanded ? 'chevron-up' : 'chevron-down';
    const bodyCls = classes('ody-accordion__body-container', !expanded && 'ody-accordion__body-container--hidden');

    this.mount(
      `<div class="${containerCls}">` +
        `<div class="ody-accordion__header-container" tabindex="0" role="button" aria-expanded="${expanded ? 'true' : 'false'}">` +
          `<div class="ody-accordion__content-container">` +
            `<div class="ody-accordion__content-container__title">${this.esc(this.attr('title'))}</div>` +
          `</div>` +
          `<div class="ody-accordion__icon-container">${iconSvg(icon, 'icon__svg')}</div>` +
        `</div>` +
        `<div class="${bodyCls}" data-ody-slot></div>` +
      `</div>`,
    );

    const header = this.querySelector('.ody-accordion__header-container');
    header?.addEventListener('click', this.#toggle);
  }

  readonly #toggle = (): void => {
    const next = !this.flag('open');
    if (next) this.setAttribute('open', '');
    else this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('toggle', { detail: { open: next }, bubbles: true }));
  };
}

define('ody-accordion', OdyAccordion);
