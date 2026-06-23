import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

/**
 * `<ody-option>` — a selectable menu/list option row. The option's label/content
 * is the element's child content. An optional sub-menu affordance (a trailing
 * icon button) is shown when `sub-menu` is present; clicking it dispatches a
 * `submenu` CustomEvent. Clicking the row dispatches a `select` CustomEvent.
 *
 * Attributes:
 * - `selected` — boolean; marks the option as selected.
 * - `disabled` — boolean; disables interaction.
 * - `sub-menu` — boolean; shows the trailing sub-menu trigger.
 * - `trigger-icon` — icon name for the sub-menu trigger (default `chevron-right`).
 */
export class OdyOption extends OdyElement {
  static observedAttributes = ['selected', 'disabled', 'sub-menu', 'trigger-icon'];

  protected render(): void {
    const cls = classes(
      'ody-option',
      this.flag('selected') && 'ody-option--selected',
      this.flag('disabled') && 'ody-option--disabled',
    );
    const trigger = this.flag('sub-menu')
      ? `<div class="ody-option__popover">` +
          `<button type="button" class="ody-option__popover__popover-trigger" aria-label="${this.localized('open-submenu-label', 'openSubMenu')}">` +
            `${iconSvg(this.attr('trigger-icon', 'chevron-right'), 'icon__svg')}` +
          `</button>` +
        `</div>`
      : '';

    this.mount(
      `<div class="ody-option-container">` +
        `<div class="${cls}" role="button" tabindex="0">` +
          `<div class="ody-option__content-group">` +
            `<div class="ody-option__content-group__content" data-ody-slot></div>` +
          `</div>` +
          trigger +
        `</div>` +
      `</div>`,
    );

    if (!this.flag('disabled')) {
      this.querySelector('.ody-option')?.addEventListener('click', this.#onSelect);
    }
    this.querySelector('.ody-option__popover__popover-trigger')?.addEventListener('click', this.#onSubMenu);
  }

  readonly #onSelect = (): void => {
    this.dispatchEvent(new CustomEvent('select', { bubbles: true }));
  };

  readonly #onSubMenu = (event: Event): void => {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('submenu', { bubbles: true }));
  };
}

define('ody-option', OdyOption);
