/**
 * Shared base class and helpers for the Odyssey Web Components.
 *
 * The components render into the **light DOM** (no Shadow DOM) on purpose: the
 * shipped `odyssey.css` global classes then style them exactly as the Ember
 * addon does, and consuming apps can override with the same selectors. The base
 * handles the common plumbing — re-rendering when an observed attribute
 * changes, and preserving consumer-provided child content ("slotted" nodes)
 * across those re-renders.
 *
 * It also localizes **built-in** strings: {@link term} resolves a term for the
 * element's language (the nearest `lang` ancestor), and components re-render
 * automatically when the language or a registered bundle changes.
 */
import {
  notifyLocaleChange,
  onLocaleChange,
  resolveLang,
  translate,
  type OdyTermKey,
} from './i18n.js';

export abstract class OdyElement extends HTMLElement {
  /** Consumer-provided light-DOM children, captured once (the default slot). */
  #slot: DocumentFragment | null = null;
  /** Self-pruning re-render hook subscribed to locale changes (set on mount). */
  #localeCb: (() => void) | null = null;

  connectedCallback(): void {
    // Defer the first render to a microtask so children provided via the parser
    // or `innerHTML` are attached before we capture the default slot (their
    // timing relative to `connectedCallback` varies across DOM implementations).
    // Attribute-change re-renders, after the slot is captured, run synchronously.
    queueMicrotask(() => {
      if (this.isConnected && this.#slot === null) this.render();
    });
  }

  attributeChangedCallback(): void {
    // Ignore attribute mutations until the first render has captured the slot.
    if (this.#slot !== null) this.render();
  }

  /** Build the component's inner markup; implementations call {@link mount}. */
  protected abstract render(): void;

  /**
   * Replace the element's inner markup with `chrome`, then re-insert any
   * consumer-provided child nodes into the placeholder element marked with a
   * `data-ody-slot` attribute (if the chrome declares one). Idempotent — safe
   * to call on every attribute change without losing the original children.
   */
  protected mount(chrome: string): void {
    this.#bindLocale();
    const slot = this.#captureSlot();
    // Reclaim nodes mounted by a previous render so they survive the reset.
    const previous = this.querySelector('[data-ody-slot]');
    if (previous) {
      while (previous.firstChild) slot.appendChild(previous.firstChild);
    }
    this.innerHTML = chrome;
    const target = this.querySelector('[data-ody-slot]');
    if (target) target.appendChild(slot);
  }

  #captureSlot(): DocumentFragment {
    if (this.#slot === null) {
      this.#slot = document.createDocumentFragment();
      while (this.firstChild) this.#slot.appendChild(this.firstChild);
    }
    return this.#slot;
  }

  /** Read a string attribute with a fallback. */
  protected attr(name: string, fallback = ''): string {
    return this.getAttribute(name) ?? fallback;
  }

  /** Whether a boolean attribute is present and not explicitly `"false"`. */
  protected flag(name: string): boolean {
    return this.hasAttribute(name) && this.getAttribute(name) !== 'false';
  }

  /** Escape a string for safe interpolation into chrome markup. */
  protected esc(value: string): string {
    return escapeHtml(value);
  }

  /** Translate a built-in term key for this element's resolved language. */
  protected term(key: OdyTermKey): string {
    return translate(resolveLang(this), key);
  }

  /**
   * A per-instance attribute override (e.g. `close-label`) when present,
   * otherwise the localized built-in term. Result is HTML-escaped for safe
   * interpolation into chrome (e.g. inside an `aria-label="…"`).
   */
  protected localized(attrName: string, key: OdyTermKey): string {
    return escapeHtml(this.getAttribute(attrName) ?? this.term(key));
  }

  /**
   * Subscribe this instance to locale changes the first time it renders, so a
   * `<html lang>` change or a {@link registerTranslation} call re-renders it.
   * The callback self-prunes once the element is detached.
   */
  #bindLocale(): void {
    if (this.#localeCb) return;
    wireLocaleObserver();
    const cb = (): void => {
      if (this.isConnected) {
        this.render();
      } else if (this.#localeCb) {
        unsubscribeLocale(this.#localeCb);
        this.#localeCb = null;
      }
    };
    this.#localeCb = cb;
    unsubscribers.set(cb, onLocaleChange(cb));
  }

  disconnectedCallback(): void {
    if (this.#localeCb) {
      unsubscribeLocale(this.#localeCb);
      this.#localeCb = null;
    }
  }
}

/** Unsubscribe a previously-registered locale callback. */
function unsubscribeLocale(cb: () => void): void {
  unsubscribers.get(cb)?.();
  unsubscribers.delete(cb);
}
const unsubscribers = new WeakMap<() => void, () => void>();

let localeObserverWired = false;
/** Wire a single document-wide observer that re-renders on `lang` changes. */
function wireLocaleObserver(): void {
  if (localeObserverWired || typeof document === 'undefined') return;
  localeObserverWired = true;
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => notifyLocaleChange());
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ['lang'],
    });
  }
}

/** HTML-escape a string (ampersand, angle brackets, quotes). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Join class-name fragments, dropping falsy entries. Keeps component templates
 * readable when classes are conditional.
 */
export function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Register a custom element under `tag`, guarding against double registration
 * (and against running in a non-DOM environment such as a Node import).
 */
export function define(tag: string, ctor: CustomElementConstructor): void {
  if (typeof customElements === 'undefined') return;
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}
