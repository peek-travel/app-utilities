import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';
import { portal, removePortal } from '../overlay.js';

const EVENT_CLOSE = 'close';

/**
 * `<ody-panel>` — a side panel that slides in from the right when `open` is set
 * and slides out when it is removed. The panel and its overlay are portaled to
 * `document.body`. Body content is the element's child content.
 *
 * Attributes:
 * - `open` — boolean; toggles the slide-in (mirrors {@link open}/{@link close}).
 * - `heading` — optional panel title.
 * - `full-height` — boolean; spans the full viewport height.
 *
 * Clicking the overlay or the close button closes the panel and dispatches a
 * `close` {@link CustomEvent}.
 */
export class OdyPanel extends OdyElement {
  static observedAttributes = ['open', 'heading', 'full-height'];

  #panel: HTMLElement | null = null;
  #overlay: HTMLElement | null = null;

  /** Open the panel (sets the `open` attribute). */
  open(): void {
    this.setAttribute('open', '');
  }

  /** Close the panel, removing `open` and dispatching `close`. */
  close(): void {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent(EVENT_CLOSE, { bubbles: true }));
  }

  protected render(): void {
    if (this.#panel) this.appendChild(this.#panel);
    if (this.#overlay) removePortal(this.#overlay);

    const isOpen = this.flag('open');
    const heading = this.attr('heading');

    this.mount(
      `<div class="${classes('ody-panel__overlay', isOpen && 'ody-panel__overlay--visible')}" data-ody-panel-overlay></div>` +
      `<div class="${classes('ody-panel', this.flag('full-height') && 'ody-panel--full-height', isOpen && 'ody-panel--open')}" role="dialog">` +
        `<div class="ody-panel__content-container">` +
          `<div class="ody-panel__header">` +
            `<div class="ody-panel__header__title-container">` +
              `<h1 class="ody-panel__header__title">${this.esc(heading)}</h1>` +
            `</div>` +
            `<div class="ody-panel__header__action-container">` +
              `<button type="button" class="ody-panel__header__close" data-ody-panel-close aria-label="${this.localized('close-label', 'close')}">` +
                `${iconSvg('close', 'icon__svg')}</button>` +
            `</div>` +
          `</div>` +
          `<div class="ody-panel__content"><div class="ody-panel__body" data-ody-slot></div></div>` +
        `</div>` +
      `</div>`,
    );

    const panel = this.querySelector<HTMLElement>('.ody-panel')!;
    const overlay = this.querySelector<HTMLElement>('[data-ody-panel-overlay]')!;
    this.#panel = panel;
    this.#overlay = overlay;
    // Wire listeners before portaling; the close button leaves `this` once the
    // panel is moved to `document.body`.
    overlay.addEventListener('click', this.#onClose);
    panel.querySelector('[data-ody-panel-close]')!.addEventListener('click', this.#onClose);
    portal(panel);
    portal(overlay);
  }

  #onClose = (): void => {
    this.close();
  };

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.#panel) removePortal(this.#panel);
    if (this.#overlay) removePortal(this.#overlay);
    this.#panel = null;
    this.#overlay = null;
  }
}

define('ody-panel', OdyPanel);
