import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';
import { portal } from '../overlay.js';

export type OdyToastVariant = 'info' | 'success' | 'warning' | 'danger';

/** Options for {@link toast}. */
export interface OdyToastOptions {
  /** Visual intent (default `info`). */
  variant?: OdyToastVariant;
  /** Optional bold title shown above the message. */
  title?: string;
  /** Auto-dismiss delay in ms; `0` disables auto-dismiss (default `4000`). */
  timeout?: number;
}

const VARIANT_ICON: Record<OdyToastVariant, string> = {
  info: 'info',
  success: 'check-filled',
  warning: 'warning',
  danger: 'danger',
};

const HOST_TAG = 'ody-toast-host';
const DEFAULT_TIMEOUT = 4000;
const REMOVE_DELAY = 400;

/**
 * `<ody-toast-host>` — the stacking container that holds active toasts. It is
 * portaled to `document.body`. You normally never write this tag yourself;
 * {@link toast} lazily creates and portals one for you.
 */
export class OdyToastHost extends OdyElement {
  protected render(): void {
    this.mount(`<div class="toast-notification-container" data-ody-slot></div>`);
  }

  /** Render and stack a toast, returning a handle to dismiss it early. */
  push(message: string, options: OdyToastOptions = {}): { dismiss: () => void } {
    const variant = options.variant ?? 'info';
    const timeout = options.timeout ?? DEFAULT_TIMEOUT;
    // The first render is deferred to a microtask; build the container eagerly
    // so a `toast()` call made synchronously after creation still stacks.
    if (!this.querySelector('.toast-notification-container')) this.render();
    const container = this.querySelector('.toast-notification-container')!;

    const el = document.createElement('div');
    el.className = classes('toast-notification', `toast-notification--${variant}`);
    const title = options.title
      ? `<h1 class="toast-notification__title">${this.esc(options.title)}</h1>`
      : '';
    el.innerHTML =
      `<div class="toast-notification__header__container">` +
        `<div class="toast-notification__header">` +
          `<span class="toast-notification__icon icon">${iconSvg(VARIANT_ICON[variant], 'icon__svg')}</span>` +
          title +
        `</div>` +
        `<button type="button" class="toast-notification__close-button" aria-label="${this.localized('close-label', 'close')}">` +
          `${iconSvg('close', 'icon__svg')}</button>` +
      `</div>` +
      `<div class="toast-notification__body__container">` +
        `<p class="toast-notification__body">${this.esc(message)}</p>` +
      `</div>`;
    container.appendChild(el);

    // Trigger the slide-in transition after the node is laid out.
    requestAnimationFrame(() => el.classList.add('toast-notification--visible'));

    let timer: ReturnType<typeof setTimeout> | undefined;
    const dismiss = (): void => {
      if (timer !== undefined) clearTimeout(timer);
      el.classList.remove('toast-notification--visible');
      setTimeout(() => el.remove(), REMOVE_DELAY);
    };

    el.querySelector('.toast-notification__close-button')?.addEventListener('click', dismiss);
    if (timeout > 0) timer = setTimeout(dismiss, timeout);

    return { dismiss };
  }
}

define(HOST_TAG, OdyToastHost);

let hostEl: OdyToastHost | null = null;

/** Resolve (creating + portaling if needed) the singleton toast host. */
function ensureHost(): OdyToastHost {
  if (hostEl && hostEl.isConnected) return hostEl;
  const existing = document.querySelector(HOST_TAG) as OdyToastHost | null;
  hostEl = existing ?? (document.createElement(HOST_TAG) as OdyToastHost);
  portal(hostEl);
  return hostEl;
}

/**
 * Show a toast notification, lazily creating an {@link OdyToastHost} portaled to
 * `document.body` on first use. Returns a handle whose `dismiss()` removes the
 * toast early.
 *
 * ```ts
 * import { toast } from '@peektravel/app-utilities/ui';
 * toast('Saved!', { variant: 'success' });
 * ```
 */
export function toast(message: string, options?: OdyToastOptions): { dismiss: () => void } {
  return ensureHost().push(message, options);
}
