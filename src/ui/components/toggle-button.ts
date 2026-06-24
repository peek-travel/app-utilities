import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

export type OdyToggleButtonSize = 'base' | 'small';

/** A single option in an {@link OdyToggleButton} group. */
export interface OdyToggleOption {
  /** Value emitted in the `change` event when selected. */
  value: string;
  /** Visible label (omit for an icon-only button). */
  label?: string;
  /** Optional leading icon name. */
  leftIcon?: string;
  /** Optional trailing icon name. */
  rightIcon?: string;
  /** Render as an icon-only square button. */
  iconOnly?: boolean;
  /** Disable this individual option. */
  disabled?: boolean;
}

/**
 * `<ody-toggle-button>` — a segmented control of mutually-exclusive buttons.
 * Selecting an option emits a `change` `CustomEvent` whose `detail` is
 * `{ value }`; the `selected` attribute reflects the active value.
 *
 * Attributes:
 * - `options` — JSON array of {@link OdyToggleOption} (e.g.
 *   `options='[{"value":"day","label":"Day"},{"value":"week","label":"Week"}]'`).
 * - `selected` — the currently-selected option value.
 * - `size` — `base` | `small` (default `base`).
 * - `disabled` — disables the whole group.
 */
export class OdyToggleButton extends OdyElement {
  static observedAttributes = ['options', 'selected', 'size', 'disabled'];

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.#handleClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#handleClick);
  }

  #handleClick = (event: Event): void => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(
      '.ody-toggle-button__button',
    );
    if (!target || target.disabled) return;
    const value = target.getAttribute('data-value') ?? '';
    this.setAttribute('selected', value);
    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true }));
  };

  #parseOptions(): OdyToggleOption[] {
    const raw = this.attr('options');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as OdyToggleOption[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  protected render(): void {
    const size = this.attr('size', 'base') as OdyToggleButtonSize;
    const selected = this.attr('selected');
    const groupDisabled = this.flag('disabled');

    const buttons = this.#parseOptions()
      .map((opt) => {
        const isSelected = selected !== '' && selected === opt.value;
        const isDisabled = groupDisabled || Boolean(opt.disabled);
        const cls = classes(
          'ody-toggle-button__button',
          'btn',
          isSelected && 'ody-toggle-button__button--selected',
          `ody-toggle-button__button--size-${size}`,
          opt.iconOnly && 'ody-toggle-button__button--icon-only',
        );
        const left = opt.leftIcon
          ? `<span class="ody-toggle-button__button__left-icon">${iconSvg(opt.leftIcon, 'icon__svg')}</span>`
          : '';
        const right = opt.rightIcon
          ? `<span class="ody-toggle-button__button__right-icon">${iconSvg(opt.rightIcon, 'icon__svg')}</span>`
          : '';
        const label = opt.label ? this.esc(opt.label) : '';
        return (
          `<button type="button" class="${cls}" data-value="${this.esc(opt.value)}"` +
            `${isDisabled ? ' disabled' : ''} aria-pressed="${isSelected ? 'true' : 'false'}">` +
            `${left}${label}${right}` +
          `</button>`
        );
      })
      .join('');

    this.mount(`<div class="ody-toggle-button" aria-label="${this.localized('aria-label', 'toggleGroup')}">${buttons}</div>`);
  }
}

define('ody-toggle-button', OdyToggleButton);
