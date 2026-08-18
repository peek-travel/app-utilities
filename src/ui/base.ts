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
    // Apply any property assigned before the element upgraded (SSR hydration,
    // code-splitting, lazy registration) so a framework's pre-upgrade
    // `el.value = …` / `el.options = …` isn't silently shadowed and dropped.
    this.#upgradeProperties();
    if (this.#slot === null) {
      // First connect: defer the render to a microtask so children provided via
      // the parser or `innerHTML` are attached before we capture the default
      // slot (their timing relative to `connectedCallback` varies across DOM
      // implementations). Attribute-change re-renders, after the slot is
      // captured, run synchronously.
      queueMicrotask(() => {
        if (this.isConnected && this.#slot === null) this.render();
      });
    } else {
      // Reconnect (the element was moved in the DOM — a framework keyed reorder
      // or a move between containers fires disconnect→connect). The first render
      // already captured the slot, so re-render now to restore the locale
      // subscription, re-attach event listeners, and (for portal components)
      // rebuild chrome that `disconnectedCallback` tore down. Without this, a
      // moved element silently stops reacting to `lang` changes and comes back
      // empty.
      this.render();
    }
  }

  /** Re-apply own properties that shadow a prototype accessor (pre-upgrade sets). */
  #upgradeProperties(): void {
    const self = this as unknown as Record<string, unknown>;
    for (const key of Object.getOwnPropertyNames(this)) {
      let proto: object | null = Object.getPrototypeOf(this);
      while (proto && proto !== HTMLElement.prototype) {
        const desc = Object.getOwnPropertyDescriptor(proto, key);
        if (desc && (desc.get || desc.set)) {
          const value = self[key];
          delete self[key];
          self[key] = value;
          break;
        }
        proto = Object.getPrototypeOf(proto);
      }
    }
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

  /**
   * Move slotted content out of a portaled chrome node (dialog/panel/bubble)
   * back into the captured slot fragment, so it survives `disconnectedCallback`
   * tearing that node down and is re-slotted by the re-render on reconnect.
   * Portal components call this before `removePortal(...)`; without it, moving
   * the element in the DOM would permanently lose the consumer's content.
   */
  protected reclaimPortaledSlot(node: ParentNode | null | undefined): void {
    if (this.#slot === null || !node) return;
    const slot = node.querySelector('[data-ody-slot]');
    if (slot) while (slot.firstChild) this.#slot.appendChild(slot.firstChild);
  }

  /**
   * The element that actually holds slotted (consumer-provided) children right
   * now, or `null` before the first render, for a non-slotting component, or
   * while the slot is portaled out of the host (e.g. an open modal). See the
   * child-mutation overrides below for why this is needed.
   */
  #slotTarget(): Element | null {
    return this.#slot !== null ? this.querySelector('[data-ody-slot]') : null;
  }

  // --- Framework-reconciler child mutations -------------------------------
  //
  // `mount()` physically relocates the consumer's light-DOM children into the
  // internal `[data-ody-slot]` node, so a slotted child's real `parentNode` is
  // that slot div, not the host `<ody-*>` element. Framework reconcilers
  // (React, Vue, Angular, Svelte, …) don't track parent pointers — to move or
  // remove a node they call `host.removeChild(child)` /
  // `host.insertBefore(node, ref)` where `host` is the element from their
  // virtual tree. Because the child no longer lives directly under the host,
  // those calls would throw `NotFoundError` (or reorder into the wrong place).
  //
  // These overrides forward the operation to wherever the node actually lives
  // (the slot), so reconciler operations succeed regardless of the relocation.
  // For removal/insertion/replacement we key off the target node's real
  // `parentNode`, which also works while the slot is portaled to `document.body`
  // (open modal/panel/popover). Internal chrome mutations use {@link adopt} to
  // bypass this forwarding; `mount()` itself never routes through here (it uses
  // `this.innerHTML` and operates on the slot/fragment nodes directly).

  override appendChild<T extends Node>(node: T): T {
    const slot = this.#slotTarget();
    return slot ? slot.appendChild(node) : super.appendChild(node);
  }

  override insertBefore<T extends Node>(node: T, child: Node | null): T {
    // A reference node that lives in the slot: insert alongside it there.
    if (child && child.parentNode && child.parentNode !== this) {
      return child.parentNode.insertBefore(node, child);
    }
    const slot = this.#slotTarget();
    return slot ? slot.insertBefore(node, child) : super.insertBefore(node, child);
  }

  override removeChild<T extends Node>(child: T): T {
    // Delegate to wherever the child actually lives (the slot), not the host.
    if (child.parentNode && child.parentNode !== this) {
      return child.parentNode.removeChild(child);
    }
    return super.removeChild(child);
  }

  override replaceChild<T extends Node>(node: Node, child: T): T {
    if (child.parentNode && child.parentNode !== this) {
      return child.parentNode.replaceChild(node, child);
    }
    return super.replaceChild(node, child);
  }

  /**
   * Append an element the component owns (chrome / portaled nodes) as a direct
   * host child, bypassing the slot-forwarding {@link appendChild} override.
   * Portal-based components use this to re-home a portaled node before a
   * re-render rebuilds the chrome.
   */
  protected adopt(node: Node): void {
    super.appendChild(node);
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

/** Characters permitted in a CSS color value interpolated into a `style="…"`. */
const SAFE_CSS_COLOR = /^[a-zA-Z0-9#(),.%\s-]+$/;

/**
 * Return `value` when it is a safe CSS color token, otherwise `fallback`. A
 * consumer-supplied color attribute (`bar-color`, `text-color`, `color`) is
 * dropped straight into a `style="…"` declaration; without this a value like
 * `"red;position:fixed;inset:0;width:100vw;height:100vh"` would inject extra CSS
 * declarations (overlay / clickjacking). The allow-list still accepts hex,
 * `rgb()/rgba()/hsl()`, named colors, `var(--…)`, `color-mix(…)`, `oklch(…)`,
 * etc. — it only rejects the structural characters (`;{}:`) an injection needs.
 */
export function cssColor(value: string, fallback = ''): string {
  return value && SAFE_CSS_COLOR.test(value) ? value : fallback;
}

/**
 * Join class-name fragments, dropping falsy entries. Keeps component templates
 * readable when classes are conditional.
 *
 * The result is HTML-escaped because it is always interpolated into a
 * `class="…"` attribute (or assigned to `el.className`). Many components build
 * a class fragment from a raw, unvalidated attribute (`ody-tag--${attr('color')}`,
 * `--size-${attr('size')}`, …); without escaping, a value containing a `"` would
 * break out of the attribute and inject markup (DOM XSS). Legitimate class tokens
 * contain none of the escaped characters, so this is a no-op for real class names.
 */
export function classes(...parts: Array<string | false | null | undefined>): string {
  return escapeHtml(parts.filter(Boolean).join(' '));
}

/**
 * Push a controlled `value` into a native input/textarea in place. Skips the
 * write when the control already holds it (user typing has updated it) so the
 * caret and selection are never disturbed. Used by the text-field components to
 * reflect `value` changes without a destructive re-render.
 */
export function reflectControlValue(
  control: HTMLInputElement | HTMLTextAreaElement | null,
  value: string,
): void {
  if (control && control.value !== value) control.value = value;
}

/** camelCase → kebab-case, mapping a property name to its attribute name. */
function attrNameFor(propName: string): string {
  return propName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** Reflect a property value assigned from a framework onto its backing attribute. */
function reflectToAttribute(el: HTMLElement, attr: string, value: unknown): void {
  if (value === null || value === undefined || value === false) {
    el.removeAttribute(attr);
  } else if (value === true) {
    el.setAttribute(attr, '');
  } else if (typeof value === 'object') {
    el.setAttribute(attr, JSON.stringify(value));
  } else {
    el.setAttribute(attr, String(value));
  }
}

/**
 * Make a component's getter-only accessors safe to *assign* to.
 *
 * React 19 (and other frameworks that bind to the DOM property, not the
 * attribute) set a JSX prop as an element **property** — `el.searchable = true`
 * — whenever a property of that name exists on the element. Our components
 * expose getter-only accessors for reflected attributes (`searchable`,
 * `disabled`, `options`) and for read-only state (`isOpen`, `isVisible`), and
 * assigning to a getter-only accessor throws `Cannot set property … which has
 * only a getter`, crashing the render.
 *
 * So before registering a component we give every getter-only accessor a setter:
 *
 * - when the property maps to one of the element's `observedAttributes`, the
 *   setter **reflects** the value onto that attribute, so the prop actually
 *   takes effect (`<ody-dropdown-single searchable />` enables search);
 * - otherwise it is a **no-op** — the accessor exposes derived or imperative
 *   state (e.g. `isOpen`), which is driven by methods/refs, not by assignment.
 *
 * Runs once per registered class; the added setter makes the second pass over a
 * shared base prototype a no-op (the accessor then already has a setter). The
 * static TypeScript types are unchanged — the setter is a runtime safety net, so
 * a TS consumer still sees these as read-only. See the README "Using the
 * components from React 19" note.
 */
function addReactSafeSetters(ctor: CustomElementConstructor): void {
  const observed = new Set<string>(
    (ctor as unknown as { observedAttributes?: string[] }).observedAttributes ?? [],
  );
  let proto: object | null = ctor.prototype;
  while (
    proto &&
    proto !== OdyElement.prototype &&
    proto !== HTMLElement.prototype &&
    proto !== Object.prototype
  ) {
    for (const [name, desc] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
      if (typeof desc.get !== 'function' || desc.set) continue;
      const attr = attrNameFor(name);
      const set = observed.has(attr)
        ? function reflectingSetter(this: HTMLElement, value: unknown): void {
            reflectToAttribute(this, attr, value);
          }
        : function ignoringSetter(): void {
            /* derived / imperative state — assignment is intentionally ignored */
          };
      Object.defineProperty(proto, name, { ...desc, set });
    }
    proto = Object.getPrototypeOf(proto);
  }
}

/**
 * Register a custom element under `tag`, guarding against double registration
 * (and against running in a non-DOM environment such as a Node import).
 */
export function define(tag: string, ctor: CustomElementConstructor): void {
  if (typeof customElements === 'undefined') return;
  if (customElements.get(tag)) return;
  addReactSafeSetters(ctor);
  customElements.define(tag, ctor);
}
