import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

/**
 * `<ody-copy-button>` — a button that copies its `value` to the clipboard via
 * `navigator.clipboard.writeText`, showing a transient success (or error) state.
 * Dispatches a `copy` CustomEvent with `{ value, ok }`.
 *
 * Attributes:
 * - `value` — the text copied to the clipboard.
 * - `label` — optional button label (icon-only when omitted).
 * - `success-duration` — ms the success/error state is shown (default 1200).
 */
export class OdyCopyButton extends OdyElement {
  static observedAttributes = ['value', 'label'];

  #state: 'idle' | 'success' | 'error' = 'idle';
  #timer: ReturnType<typeof setTimeout> | undefined;

  protected render(): void {
    const label = this.attr('label');
    const icon = this.#state === 'success' ? 'check-filled' : this.#state === 'error' ? 'danger' : 'copy';
    const appearance = this.#state === 'success' ? 'success' : this.#state === 'error' ? 'danger' : 'interaction';
    const cls = classes(
      'ody-button', 'btn', 'btn-secondary', 'ody-button--size-base', appearance,
      !label && 'ody-button--icon-only',
    );
    const labelEl = label ? `<span class="ody-button__label">${this.esc(label)}</span>` : '';

    this.mount(
      `<button type="button" class="${cls}" data-test-ody-copy-button>` +
        `<span class="ody-button__left-icon">${iconSvg(icon, 'icon__svg')}</span>${labelEl}` +
      `</button>`,
    );

    this.querySelector('button')?.addEventListener('click', this.#onClick);
  }

  readonly #onClick = (): void => {
    const value = this.attr('value');
    const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (!clipboard || typeof clipboard.writeText !== 'function') {
      this.#feedback('error', value);
      return;
    }
    void clipboard.writeText(value).then(
      () => this.#feedback('success', value),
      () => this.#feedback('error', value),
    );
  };

  #feedback(state: 'success' | 'error', value: string): void {
    this.#state = state;
    this.render();
    this.dispatchEvent(new CustomEvent('copy', { detail: { value, ok: state === 'success' }, bubbles: true }));
    if (this.#timer) clearTimeout(this.#timer);
    const duration = Number.parseInt(this.attr('success-duration', '1200'), 10);
    this.#timer = setTimeout(() => {
      this.#state = 'idle';
      if (this.isConnected) this.render();
    }, Number.isFinite(duration) ? duration : 1200);
  }
}

define('ody-copy-button', OdyCopyButton);
