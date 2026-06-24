import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

/**
 * `<ody-list-item>` — a clickable list row with content on the left and a
 * forward chevron on the right. The row content is the element's child content.
 * Clicking (or pressing Enter/Space) emits a `select` `CustomEvent` whose
 * `detail` is `{ itemId }`.
 *
 * Attributes:
 * - `item-id` — identifier emitted in the `select` event.
 * - `active-item-id` — when it equals `item-id`, the row renders active.
 * - `active` — force the active style regardless of the ids.
 */
export class OdyListItem extends OdyElement {
  static observedAttributes = ['item-id', 'active-item-id', 'active'];

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.#handleClick);
    this.addEventListener('keydown', this.#handleKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#handleClick);
    this.removeEventListener('keydown', this.#handleKeydown);
  }

  #handleClick = (): void => {
    this.dispatchEvent(
      new CustomEvent('select', { detail: { itemId: this.attr('item-id') }, bubbles: true }),
    );
  };

  #handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.#handleClick();
    }
  };

  #isActive(): boolean {
    if (this.flag('active')) return true;
    const id = this.attr('item-id');
    const activeId = this.attr('active-item-id');
    return Boolean(id) && id === activeId;
  }

  protected render(): void {
    const cls = classes('list-item', this.#isActive() && 'list-item--active');
    this.mount(
      `<div class="${cls}" tabindex="0">` +
        `<div class="list-item__content-container">` +
          `<div class="list-item__content" data-ody-slot></div>` +
        `</div>` +
        `<div class="list-item__icon-container">` +
          `<span class="icon icon--size-base">${iconSvg('chevron-right', 'icon__svg')}</span>` +
        `</div>` +
      `</div>`,
    );
  }
}

define('ody-list-item', OdyListItem);
