import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';
import { portal, removePortal } from '../overlay.js';

export type OdyModalSize = 'base' | 'small' | 'medium' | 'large' | 'full';

const KEY_ESCAPE = 'Escape';
const EVENT_CLOSE = 'close';

/**
 * `<ody-modal>` — an overlay dialog that blocks the rest of the page until
 * dismissed. The backdrop and dialog are portaled to `document.body` so they
 * escape any clipping ancestor. Body content is the element's child content.
 *
 * Attributes:
 * - `open` — boolean; when present the modal is shown (mirrors {@link open}/{@link close}).
 * - `heading` — optional title shown in the header.
 * - `size` — `base` | `small` | `medium` | `large` | `full` (default `base`).
 * - `icon` — optional named icon shown before the heading.
 *
 * Behaviour: clicking the backdrop or pressing Escape closes the modal and
 * dispatches a `close` {@link CustomEvent}.
 */
export class OdyModal extends OdyElement {
  static observedAttributes = ['open', 'heading', 'size', 'icon'];

  #backdrop: HTMLElement | null = null;
  #dialog: HTMLElement | null = null;
  #onKeydown = (e: KeyboardEvent): void => {
    if (e.key === KEY_ESCAPE && this.flag('open')) this.close();
  };

  /** Open the modal (sets the `open` attribute). */
  open(): void {
    this.setAttribute('open', '');
  }

  /** Close the modal, removing the `open` attribute and dispatching `close`. */
  close(): void {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent(EVENT_CLOSE, { bubbles: true }));
  }

  protected render(): void {
    // Reclaim portaled nodes so the base `mount` can recover slotted content
    // (which lives inside the dialog) before it rebuilds the markup.
    if (this.#dialog) this.appendChild(this.#dialog);
    if (this.#backdrop) removePortal(this.#backdrop);

    const isOpen = this.flag('open');
    const size = this.attr('size', 'base');
    const heading = this.attr('heading');
    const icon = this.attr('icon');

    // The dialog keeps the slotted body, so it lives inside the element; the
    // backdrop is a sibling. Both are portaled to body below.
    const iconEl = icon
      ? `<span class="ody-modal__header__icon icon icon--size-medium">${iconSvg(icon, 'icon__svg')}</span>`
      : '';
    const headingEl = heading || icon
      ? `<div class="ody-modal__header">` +
          iconEl +
          `<p class="ody-modal__header__title title">${this.esc(heading)}</p>` +
          `<button type="button" class="ody-modal__header__button" data-ody-modal-close aria-label="${this.localized('close-label', 'close')}">` +
            `${iconSvg('close', 'icon__svg')}</button>` +
        `</div>`
      : '';

    this.mount(
      `<div class="${classes('ody-modal-backdrop', !isOpen && 'ody-modal-backdrop--hidden')}" data-ody-modal-backdrop></div>` +
      `<div class="${classes('ody-modal', `ody-modal--size-${size}`, isOpen && 'ody-modal--open')}" role="dialog" aria-modal="true" tabindex="-1">` +
        headingEl +
        `<div class="ody-modal__content-wrapper" data-ody-slot></div>` +
      `</div>`,
    );

    const backdrop = this.querySelector<HTMLElement>('[data-ody-modal-backdrop]')!;
    const dialog = this.querySelector<HTMLElement>('.ody-modal')!;
    this.#backdrop = backdrop;
    this.#dialog = dialog;
    // Wire listeners before portaling; the close button leaves `this` once the
    // dialog is moved to `document.body`.
    backdrop.addEventListener('click', this.#onBackdrop);
    dialog.querySelector('[data-ody-modal-close]')?.addEventListener('click', this.#onCloseClick);
    portal(backdrop);
    portal(dialog);
  }

  #onBackdrop = (e: MouseEvent): void => {
    if (e.target === this.#backdrop) this.close();
  };

  #onCloseClick = (): void => {
    this.close();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('keydown', this.#onKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.#onKeydown);
    if (this.#backdrop) removePortal(this.#backdrop);
    if (this.#dialog) removePortal(this.#dialog);
    this.#backdrop = null;
    this.#dialog = null;
  }
}

define('ody-modal', OdyModal);
