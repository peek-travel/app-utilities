import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

/**
 * `<ody-copy-button>` — a button that copies its `value` to the clipboard,
 * showing a transient success (or error) state. Dispatches a `copy`
 * CustomEvent with `{ value, ok }`.
 *
 * The copy uses a synchronous `document.execCommand('copy')` as the source of
 * truth so it works inside cross-origin iframes (where the async Clipboard API
 * is blocked by default) and legacy contexts. The async
 * `navigator.clipboard.writeText` is used only as a best-effort enhancement
 * when the synchronous path can't run.
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

    // The async Clipboard API is preferred where allowed, but it CANNOT be the
    // source of truth: its promise settles after the user-gesture window, so a
    // fallback attempted then would fail. Do the synchronous copy now (works in
    // cross-origin iframes and legacy contexts), and only reach for the async
    // API when the sync path couldn't run — its late result never changes the UI.
    const ok = this.#execCopy(value);
    if (!ok) {
      const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
      if (clipboard && typeof clipboard.writeText === 'function') {
        // Best-effort only; may still copy where execCommand is disabled but
        // the async API is allowed. Its result never overrides the UI below.
        void clipboard.writeText(value).then(
          () => undefined,
          () => undefined,
        );
      }
    }
    this.#feedback(ok ? 'success' : 'error', value);
  };

  /**
   * Synchronous clipboard write. Must be called within the user-gesture window
   * (i.e. directly from the click handler, not from an async continuation).
   * Works in cross-origin iframes and legacy contexts where the async Clipboard
   * API is unavailable or blocked.
   */
  #execCopy(value: string): boolean {
    if (!value || typeof document === 'undefined') return false;
    const el = document.createElement('textarea');
    el.value = value;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    try {
      el.setSelectionRange(0, value.length);
    } catch {
      /* older browsers */
    }
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      /* blocked */
    }
    document.body.removeChild(el);
    return ok;
  }

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

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    // Clear the pending success/error-reset timer so a removed button isn't
    // retained until it fires.
    if (this.#timer) clearTimeout(this.#timer);
    this.#timer = undefined;
  }
}

define('ody-copy-button', OdyCopyButton);
