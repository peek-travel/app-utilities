import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

export type OdyCheckboxSize = 'base' | 'small';

/**
 * `<ody-checkbox>` — a single checkbox with an optional label. Renders a native
 * `<input type="checkbox">` in the light DOM. The Ember addon paints the
 * check/indeterminate marks with server-hosted background SVGs; to stay
 * standalone we overlay the bundled `check` / `minus` icons instead.
 *
 * Attributes:
 * - `label` — text shown beside the box.
 * - `size` — `base` | `small` (default `small`).
 * - `checked`, `indeterminate`, `disabled` — boolean flags.
 *
 * Reflects: `checked`. Events: dispatches `change` as
 * `CustomEvent<{ checked: boolean; value: boolean }>`, bubbling.
 */
export class OdyCheckbox extends OdyElement {
  static observedAttributes = ['label', 'size', 'checked', 'indeterminate', 'disabled'];

  /** Whether the box is checked (mirrors the `checked` attribute). */
  get checked(): boolean {
    return this.flag('checked');
  }

  set checked(next: boolean) {
    if (next) this.setAttribute('checked', '');
    else this.removeAttribute('checked');
  }

  /** Convenience alias for {@link checked}. */
  get value(): boolean {
    return this.checked;
  }

  set value(next: boolean) {
    this.checked = next;
  }

  protected render(): void {
    const size = this.attr('size', 'small');
    const isChecked = this.flag('checked');
    const isIndeterminate = this.flag('indeterminate');
    const isDisabled = this.flag('disabled');

    const wrapperCls = classes('ody-checkbox', isChecked && 'ody-checkbox--checked');
    const inputCls = classes('ody-checkbox__input', `ody-checkbox__input--size-${size}`);

    const mark = isIndeterminate
      ? `<span class="ody-checkbox__mark">${iconSvg('minus', 'icon__svg')}</span>`
      : isChecked
        ? `<span class="ody-checkbox__mark">${iconSvg('check', 'icon__svg')}</span>`
        : '';

    const label = this.attr('label');
    const labelEl = label
      ? `<label class="ody-checkbox__label"${isDisabled ? ' disabled' : ''}>${this.esc(label)}</label>`
      : '';

    this.mount(
      `<div class="${wrapperCls}">` +
        `<div class="ody-checkbox__container">` +
          `<span class="ody-checkbox__box">` +
            `<input class="${inputCls}" type="checkbox"` +
              `${isChecked ? ' checked' : ''}${isDisabled ? ' disabled' : ''} />` +
            mark +
          `</span>` +
          labelEl +
          `<span data-ody-slot></span>` +
        `</div>` +
      `</div>`,
    );

    const input = this.querySelector<HTMLInputElement>('.ody-checkbox__input');
    if (input) input.indeterminate = isIndeterminate;
    input?.addEventListener('change', this.#onChange);
  }

  #onChange = (event: Event): void => {
    event.stopPropagation();
    const checked = (event.target as HTMLInputElement).checked;
    this.checked = checked;
    this.dispatchEvent(
      new CustomEvent('change', { detail: { checked, value: checked }, bubbles: true }),
    );
  };
}

define('ody-checkbox', OdyCheckbox);
