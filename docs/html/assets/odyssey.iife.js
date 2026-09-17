"use strict";
var OdysseyUI = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // dist/ui/index.js
  var index_exports = {};
  __export(index_exports, {
    OdyAccordion: () => OdyAccordion,
    OdyAlert: () => OdyAlert,
    OdyAppPageContainer: () => OdyAppPageContainer,
    OdyBrandIcon: () => OdyBrandIcon,
    OdyBreadcrumb: () => OdyBreadcrumb,
    OdyBreadcrumbItem: () => OdyBreadcrumbItem,
    OdyButton: () => OdyButton,
    OdyCard: () => OdyCard,
    OdyCheckInStatus: () => OdyCheckInStatus,
    OdyCheckbox: () => OdyCheckbox,
    OdyCheckboxGroup: () => OdyCheckboxGroup,
    OdyCollapsible: () => OdyCollapsible,
    OdyCollapsibleCollapsed: () => OdyCollapsibleCollapsed,
    OdyCollapsibleContent: () => OdyCollapsibleContent,
    OdyCollapsibleSection: () => OdyCollapsibleSection,
    OdyCopyButton: () => OdyCopyButton,
    OdyDatePicker: () => OdyDatePicker,
    OdyDivider: () => OdyDivider,
    OdyDropdownMulti: () => OdyDropdownMulti,
    OdyDropdownSingle: () => OdyDropdownSingle,
    OdyElement: () => OdyElement,
    OdyEmptyState: () => OdyEmptyState,
    OdyHorizontalDivider: () => OdyHorizontalDivider,
    OdyIcon: () => OdyIcon,
    OdyInlineInput: () => OdyInlineInput,
    OdyInlineList: () => OdyInlineList,
    OdyInlineListItem: () => OdyInlineListItem,
    OdyInput: () => OdyInput,
    OdyListItem: () => OdyListItem,
    OdyLoadingBar: () => OdyLoadingBar,
    OdyLoadingSpinner: () => OdyLoadingSpinner,
    OdyMessage: () => OdyMessage,
    OdyModal: () => OdyModal,
    OdyMoneyInput: () => OdyMoneyInput,
    OdyOption: () => OdyOption,
    OdyPageContainer: () => OdyPageContainer,
    OdyPanel: () => OdyPanel,
    OdyPercentageInput: () => OdyPercentageInput,
    OdyPopover: () => OdyPopover,
    OdyProductIndicator: () => OdyProductIndicator,
    OdyRadioButtonGroup: () => OdyRadioButtonGroup,
    OdySearchInput: () => OdySearchInput,
    OdySectionColumnItem: () => OdySectionColumnItem,
    OdySectionColumns: () => OdySectionColumns,
    OdySectionRowItem: () => OdySectionRowItem,
    OdySectionRows: () => OdySectionRows,
    OdySelectBase: () => OdySelectBase,
    OdySplitButton: () => OdySplitButton,
    OdyStat: () => OdyStat,
    OdyStatDetail: () => OdyStatDetail,
    OdyStatSummary: () => OdyStatSummary,
    OdyStatSummaryDetail: () => OdyStatSummaryDetail,
    OdyStatusDot: () => OdyStatusDot,
    OdyTable: () => OdyTable,
    OdyTableHeader: () => OdyTableHeader,
    OdyTabs: () => OdyTabs,
    OdyTag: () => OdyTag,
    OdyToastHost: () => OdyToastHost,
    OdyToggleButton: () => OdyToggleButton,
    OdyTooltip: () => OdyTooltip,
    OdyTwoColumn: () => OdyTwoColumn,
    OdyTwoColumnMain: () => OdyTwoColumnMain,
    OdyTwoColumnSecondary: () => OdyTwoColumnSecondary,
    OdyTwoColumnSecondaryHeader: () => OdyTwoColumnSecondaryHeader,
    brandIconNames: () => brandIconNames,
    brandIconSvg: () => brandIconSvg,
    classes: () => classes,
    define: () => define,
    escapeHtml: () => escapeHtml,
    hasBrandIcon: () => hasBrandIcon,
    hasIcon: () => hasIcon,
    iconNames: () => iconNames,
    iconSvg: () => iconSvg,
    parseOptions: () => parseOptions3,
    portal: () => portal,
    position: () => position,
    registerIcon: () => registerIcon,
    registerTranslation: () => registerTranslation,
    registeredTags: () => registeredTags,
    removePortal: () => removePortal,
    renderIconSvg: () => renderIconSvg,
    toast: () => toast,
    whenOdysseyReady: () => whenOdysseyReady
  });
  var DEFAULT_LANG = "en";
  var EN = {
    close: "Close",
    clear: "Clear",
    search: "Search",
    noOptions: "No options",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    selectDate: "Select date",
    openSubMenu: "Open sub-menu",
    toggleMenu: "Toggle menu",
    breadcrumb: "Breadcrumb",
    radioGroup: "Radio button group",
    toggleGroup: "Toggle button",
    checkInInProgress: "In progress",
    checkInNoShow: "No show",
    checkInOverdue: "Overdue",
    checkInReserved: "Reserved",
    checkInReturned: "Returned",
    checkInNone: "None"
  };
  var registry = /* @__PURE__ */ new Map([[DEFAULT_LANG, EN]]);
  var listeners = /* @__PURE__ */ new Set();
  var lower = (lang) => lang.toLowerCase();
  function registerTranslation(lang, terms) {
    const code = lower(lang);
    registry.set(code, { ...registry.get(code), ...terms });
    notifyLocaleChange();
  }
  function translate(lang, key) {
    const code = lower(lang);
    const base = code.split("-")[0] ?? code;
    return registry.get(code)?.[key] ?? registry.get(base)?.[key] ?? EN[key] ?? key;
  }
  function resolveLang(el) {
    const owner = el.closest("[lang]");
    return owner instanceof HTMLElement && owner.lang || DEFAULT_LANG;
  }
  function onLocaleChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
  function notifyLocaleChange() {
    for (const fn of [...listeners]) fn();
  }
  var OdyElement = class extends HTMLElement {
    /** Consumer-provided light-DOM children, captured once (the default slot). */
    #slot = null;
    /** Self-pruning re-render hook subscribed to locale changes (set on mount). */
    #localeCb = null;
    connectedCallback() {
      this.#upgradeProperties();
      if (this.#slot === null) {
        queueMicrotask(() => {
          if (this.isConnected && this.#slot === null) this.render();
        });
      } else {
        this.render();
      }
    }
    /** Re-apply own properties that shadow a prototype accessor (pre-upgrade sets). */
    #upgradeProperties() {
      const self = this;
      for (const key of Object.getOwnPropertyNames(this)) {
        let proto = Object.getPrototypeOf(this);
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
    attributeChangedCallback() {
      if (this.#slot !== null) this.render();
    }
    /**
     * Replace the element's inner markup with `chrome`, then re-insert any
     * consumer-provided child nodes into the placeholder element marked with a
     * `data-ody-slot` attribute (if the chrome declares one). Idempotent — safe
     * to call on every attribute change without losing the original children.
     */
    mount(chrome) {
      this.#bindLocale();
      const slot = this.#captureSlot();
      const previous = this.querySelector("[data-ody-slot]");
      if (previous) {
        while (previous.firstChild) slot.appendChild(previous.firstChild);
      }
      this.innerHTML = chrome;
      const target = this.querySelector("[data-ody-slot]");
      if (target) target.appendChild(slot);
    }
    #captureSlot() {
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
    reclaimPortaledSlot(node) {
      if (this.#slot === null || !node) return;
      const slot = node.querySelector("[data-ody-slot]");
      if (slot) while (slot.firstChild) this.#slot.appendChild(slot.firstChild);
    }
    /**
     * The element that actually holds slotted (consumer-provided) children right
     * now, or `null` before the first render, for a non-slotting component, or
     * while the slot is portaled out of the host (e.g. an open modal). See the
     * child-mutation overrides below for why this is needed.
     */
    #slotTarget() {
      return this.#slot !== null ? this.querySelector("[data-ody-slot]") : null;
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
    appendChild(node) {
      const slot = this.#slotTarget();
      return slot ? slot.appendChild(node) : super.appendChild(node);
    }
    insertBefore(node, child) {
      if (child && child.parentNode && child.parentNode !== this) {
        return child.parentNode.insertBefore(node, child);
      }
      const slot = this.#slotTarget();
      return slot ? slot.insertBefore(node, child) : super.insertBefore(node, child);
    }
    removeChild(child) {
      if (child.parentNode && child.parentNode !== this) {
        return child.parentNode.removeChild(child);
      }
      return super.removeChild(child);
    }
    replaceChild(node, child) {
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
    adopt(node) {
      super.appendChild(node);
    }
    /** Read a string attribute with a fallback. */
    attr(name, fallback = "") {
      return this.getAttribute(name) ?? fallback;
    }
    /** Whether a boolean attribute is present and not explicitly `"false"`. */
    flag(name) {
      return this.hasAttribute(name) && this.getAttribute(name) !== "false";
    }
    /** Escape a string for safe interpolation into chrome markup. */
    esc(value) {
      return escapeHtml(value);
    }
    /** Translate a built-in term key for this element's resolved language. */
    term(key) {
      return translate(resolveLang(this), key);
    }
    /**
     * A per-instance attribute override (e.g. `close-label`) when present,
     * otherwise the localized built-in term. Result is HTML-escaped for safe
     * interpolation into chrome (e.g. inside an `aria-label="…"`).
     */
    localized(attrName, key) {
      return escapeHtml(this.getAttribute(attrName) ?? this.term(key));
    }
    /**
     * Subscribe this instance to locale changes the first time it renders, so a
     * `<html lang>` change or a {@link registerTranslation} call re-renders it.
     * The callback self-prunes once the element is detached.
     */
    #bindLocale() {
      if (this.#localeCb) return;
      wireLocaleObserver();
      const cb = () => {
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
    disconnectedCallback() {
      if (this.#localeCb) {
        unsubscribeLocale(this.#localeCb);
        this.#localeCb = null;
      }
    }
  };
  function unsubscribeLocale(cb) {
    unsubscribers.get(cb)?.();
    unsubscribers.delete(cb);
  }
  var unsubscribers = /* @__PURE__ */ new WeakMap();
  var localeObserverWired = false;
  function wireLocaleObserver() {
    if (localeObserverWired || typeof document === "undefined") return;
    localeObserverWired = true;
    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(() => notifyLocaleChange());
      observer.observe(document.documentElement, {
        subtree: true,
        attributes: true,
        attributeFilter: ["lang"]
      });
    }
  }
  function escapeHtml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  var SAFE_CSS_COLOR = /^[a-zA-Z0-9#(),.%\s-]+$/;
  function cssColor(value, fallback = "") {
    return value && SAFE_CSS_COLOR.test(value) ? value : fallback;
  }
  function classes(...parts) {
    return escapeHtml(parts.filter(Boolean).join(" "));
  }
  function reflectControlValue(control, value) {
    if (control && control.value !== value) control.value = value;
  }
  function attrNameFor(propName) {
    return propName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  }
  function reflectToAttribute(el, attr, value) {
    if (value === null || value === void 0 || value === false) {
      el.removeAttribute(attr);
    } else if (value === true) {
      el.setAttribute(attr, "");
    } else if (typeof value === "object") {
      el.setAttribute(attr, JSON.stringify(value));
    } else {
      el.setAttribute(attr, String(value));
    }
  }
  function addReactSafeSetters(ctor) {
    const observed = new Set(
      ctor.observedAttributes ?? []
    );
    let proto = ctor.prototype;
    while (proto && proto !== OdyElement.prototype && proto !== HTMLElement.prototype && proto !== Object.prototype) {
      for (const [name, desc] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
        if (typeof desc.get !== "function" || desc.set) continue;
        const attr = attrNameFor(name);
        const set = observed.has(attr) ? function reflectingSetter(value) {
          reflectToAttribute(this, attr, value);
        } : function ignoringSetter() {
        };
        Object.defineProperty(proto, name, { ...desc, set });
      }
      proto = Object.getPrototypeOf(proto);
    }
  }
  var registered = [];
  function define(tag, ctor) {
    if (typeof customElements === "undefined") return;
    if (customElements.get(tag)) return;
    addReactSafeSetters(ctor);
    customElements.define(tag, ctor);
    registered.push(tag);
  }
  function registeredTags() {
    return registered.slice();
  }
  function whenOdysseyReady() {
    if (typeof customElements === "undefined") return Promise.resolve();
    return Promise.all(registered.map((tag) => customElements.whenDefined(tag))).then(() => void 0);
  }
  var THEMEABLE_ICONS = {
    "activities": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M11.25 4.583C10.7913 4.583 10.399 4.42333 10.073 4.104C9.74633 3.78467 9.583 3.396 9.583 2.938C9.583 2.47933 9.74633 2.08333 10.073 1.75C10.399 1.41667 10.7913 1.25 11.25 1.25C11.7087 1.25 12.101 1.41667 12.427 1.75C12.7537 2.08333 12.917 2.47933 12.917 2.938C12.917 3.396 12.7537 3.78467 12.427 4.104C12.101 4.42333 11.7087 4.583 11.25 4.583ZM10.771 19.167V14.146L9.125 12.562L8.292 16.167L2.5 15L2.833 13.25L6.812 14.083L8.125 7.479L6.729 8.021V10.875H4.979V6.896L8.25 5.479C8.70867 5.285 9.06267 5.153 9.312 5.083C9.56267 5.01367 9.792 4.979 10 4.979C10.3053 4.979 10.5867 5.05533 10.844 5.208C11.1007 5.36133 11.3053 5.56967 11.458 5.833L12.271 7.146C12.6317 7.72933 13.1177 8.205 13.729 8.573C14.3403 8.941 15.0417 9.125 15.833 9.125V10.875C14.903 10.875 14.0453 10.6873 13.26 10.312C12.4753 9.93733 11.8193 9.43733 11.292 8.812L10.812 11.208L12.521 12.875V19.167H10.771Z" fill="currentColor"/>'
    },
    "add-on": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10.875 11.542H12.625V9.12499H15.042V7.37499H12.625V4.95799H10.875V7.37499H8.458V9.12499H10.875V11.542ZM6.917 14.833C6.431 14.833 6.01767 14.663 5.677 14.323C5.337 13.9823 5.167 13.569 5.167 13.083V3.41699C5.167 2.93099 5.337 2.51766 5.677 2.17699C6.01767 1.83699 6.431 1.66699 6.917 1.66699H16.583C17.069 1.66699 17.4823 1.83699 17.823 2.17699C18.163 2.51766 18.333 2.93099 18.333 3.41699V13.083C18.333 13.569 18.163 13.9823 17.823 14.323C17.4823 14.663 17.069 14.833 16.583 14.833H6.917ZM6.917 13.083H16.583V3.41699H6.917V13.083ZM3.417 18.333C2.931 18.333 2.51767 18.163 2.177 17.823C1.837 17.4823 1.667 17.069 1.667 16.583V5.16699H3.417V16.583H14.833V18.333H3.417Z" fill="currentColor"/>'
    },
    "address": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10 13.708C11.3333 12.6247 12.3473 11.5693 13.042 10.542C13.736 9.51399 14.083 8.55566 14.083 7.66699C14.083 6.88899 13.9443 6.22933 13.667 5.68799C13.389 5.14599 13.045 4.70833 12.635 4.37499C12.2257 4.04166 11.7847 3.79866 11.312 3.64599C10.84 3.49333 10.4027 3.41699 10 3.41699C9.61133 3.41699 9.17733 3.49333 8.698 3.64599C8.21867 3.79866 7.77433 4.04166 7.365 4.37499C6.955 4.70833 6.611 5.14599 6.333 5.68799C6.05567 6.22933 5.917 6.88899 5.917 7.66699C5.917 8.55566 6.264 9.51399 6.958 10.542C7.65267 11.5693 8.66667 12.6247 10 13.708ZM10 15.917C8.028 14.4583 6.56267 13.0487 5.604 11.688C4.646 10.3267 4.167 8.98633 4.167 7.66699C4.167 6.68099 4.34067 5.81266 4.688 5.06199C5.03467 4.31266 5.48933 3.68799 6.052 3.18799C6.61467 2.68799 7.24333 2.30933 7.938 2.05199C8.632 1.79533 9.31933 1.66699 10 1.66699C10.6947 1.66699 11.3857 1.79533 12.073 2.05199C12.7603 2.30933 13.3853 2.68799 13.948 3.18799C14.5107 3.68799 14.9653 4.31266 15.312 5.06199C15.6593 5.81266 15.833 6.68099 15.833 7.66699C15.833 8.98633 15.354 10.3267 14.396 11.688C13.4373 13.0487 11.972 14.4583 10 15.917ZM10 9.24999C10.472 9.24999 10.8747 9.08333 11.208 8.74999C11.5413 8.41666 11.708 8.01399 11.708 7.54199C11.708 7.06933 11.5413 6.66633 11.208 6.33299C10.8747 5.99966 10.472 5.83299 10 5.83299C9.528 5.83299 9.12533 5.99966 8.792 6.33299C8.45867 6.66633 8.292 7.06933 8.292 7.54199C8.292 8.01399 8.45867 8.41666 8.792 8.74999C9.12533 9.08333 9.528 9.24999 10 9.24999ZM4.167 18.333V16.583H15.833V18.333H4.167Z" fill="currentColor"/>'
    },
    "adjust-settings": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10.833 7.417V5.667H13.292V2.5H15.042V5.667H17.5V7.417H10.833ZM13.292 17.5V9.167H15.042V17.5H13.292ZM4.958 17.5V14.333H2.5V12.583H9.167V14.333H6.708V17.5H4.958ZM4.958 10.833V2.5H6.708V10.833H4.958Z" fill="currentColor"/>'
    },
    "alert-filled": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10 18.3332C8.84727 18.3332 7.76394 18.1143 6.75005 17.6765C5.73616 17.2393 4.85422 16.6457 4.10422 15.8957C3.35422 15.1457 2.76061 14.2637 2.32338 13.2498C1.88561 12.2359 1.66672 11.1526 1.66672 9.99984C1.66672 8.84706 1.88561 7.76373 2.32338 6.74984C2.76061 5.73595 3.35422 4.854 4.10422 4.104C4.85422 3.354 5.73616 2.76011 6.75005 2.32234C7.76394 1.88511 8.84727 1.6665 10 1.6665C11.1528 1.6665 12.2362 1.88511 13.25 2.32234C14.2639 2.76011 15.1459 3.354 15.8959 4.104C16.6459 4.854 17.2395 5.73595 17.6767 6.74984C18.1145 7.76373 18.3334 8.84706 18.3334 9.99984C18.3334 11.1526 18.1145 12.2359 17.6767 13.2498C17.2395 14.2637 16.6459 15.1457 15.8959 15.8957C15.1459 16.6457 14.2639 17.2393 13.25 17.6765C12.2362 18.1143 11.1528 18.3332 10 18.3332ZM9.16672 10.8332H10.8334V5.83317H9.16672V10.8332ZM10 14.1665C10.2362 14.1665 10.4342 14.0865 10.5942 13.9265C10.7537 13.7671 10.8334 13.5693 10.8334 13.3332C10.8334 13.0971 10.7537 12.899 10.5942 12.739C10.4342 12.5796 10.2362 12.4998 10 12.4998C9.76394 12.4998 9.56616 12.5796 9.40672 12.739C9.24672 12.899 9.16672 13.0971 9.16672 13.3332C9.16672 13.5693 9.24672 13.7671 9.40672 13.9265C9.56616 14.0865 9.76394 14.1665 10 14.1665Z" fill="currentColor"/>'
    },
    "alert": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.12501 10.792H10.875V5.85399H9.12501V10.792ZM10 14.188C10.236 14.188 10.441 14.108 10.615 13.948C10.7883 13.788 10.875 13.576 10.875 13.312C10.875 13.076 10.7883 12.8713 10.615 12.698C10.441 12.5247 10.236 12.438 10 12.438C9.76401 12.438 9.55901 12.5247 9.38501 12.698C9.21167 12.8713 9.12501 13.076 9.12501 13.312C9.12501 13.576 9.21167 13.788 9.38501 13.948C9.55901 14.108 9.76401 14.188 10 14.188ZM10 18.333C8.84734 18.333 7.76401 18.1143 6.75001 17.677C5.73601 17.2397 4.85401 16.646 4.10401 15.896C3.35401 15.146 2.76034 14.264 2.32301 13.25C1.88567 12.236 1.66701 11.1527 1.66701 9.99999C1.66701 8.84733 1.88567 7.76399 2.32301 6.74999C2.76034 5.73599 3.35401 4.85399 4.10401 4.10399C4.85401 3.35399 5.73601 2.76033 6.75001 2.32299C7.76401 1.88566 8.84734 1.66699 10 1.66699C11.1527 1.66699 12.236 1.88566 13.25 2.32299C14.264 2.76033 15.146 3.35399 15.896 4.10399C16.646 4.85399 17.2397 5.73599 17.677 6.74999C18.1143 7.76399 18.333 8.84733 18.333 9.99999C18.333 11.1527 18.1143 12.236 17.677 13.25C17.2397 14.264 16.646 15.146 15.896 15.896C15.146 16.646 14.264 17.2397 13.25 17.677C12.236 18.1143 11.1527 18.333 10 18.333ZM10 16.583C11.8193 16.583 13.3713 15.9407 14.656 14.656C15.9407 13.3713 16.583 11.8193 16.583 9.99999C16.583 8.18066 15.9407 6.62866 14.656 5.34399C13.3713 4.05933 11.8193 3.41699 10 3.41699C8.18067 3.41699 6.62867 4.05933 5.34401 5.34399C4.05934 6.62866 3.41701 8.18066 3.41701 9.99999C3.41701 11.8193 4.05934 13.3713 5.34401 14.656C6.62867 15.9407 8.18067 16.583 10 16.583Z" fill="currentColor"/>'
    },
    "attachment": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M6.25 14.583C4.972 14.583 3.88867 14.1387 3 13.25C2.11133 12.3613 1.667 11.278 1.667 9.99999C1.667 8.72199 2.11133 7.63866 3 6.74999C3.88867 5.86133 4.972 5.41699 6.25 5.41699H14.958C15.8887 5.41699 16.684 5.73966 17.344 6.38499C18.0033 7.03099 18.333 7.81933 18.333 8.74999C18.333 9.68066 18.0067 10.469 17.354 11.115C16.7013 11.7603 15.9097 12.083 14.979 12.083H7.125C6.54167 12.083 6.04167 11.8817 5.625 11.479C5.20833 11.0763 5 10.5833 5 9.99999C5 9.41666 5.20833 8.92366 5.625 8.52099C6.04167 8.11833 6.54167 7.91699 7.125 7.91699H15V9.24999H7.125C6.903 9.24999 6.71533 9.32299 6.562 9.46899C6.40933 9.61499 6.333 9.79199 6.333 9.99999C6.333 10.208 6.40933 10.385 6.562 10.531C6.71533 10.677 6.903 10.75 7.125 10.75H14.958C15.5273 10.75 16.01 10.5557 16.406 10.167C16.802 9.77766 17 9.30533 17 8.74999C17 8.19466 16.802 7.72233 16.406 7.33299C16.01 6.94433 15.5273 6.74999 14.958 6.74999H6.271C5.35433 6.74999 4.58 7.06599 3.948 7.69799C3.316 8.32999 3 9.09733 3 9.99999C3 10.9027 3.316 11.67 3.948 12.302C4.58 12.934 5.34733 13.25 6.25 13.25H15V14.583H6.25Z" fill="currentColor"/>'
    },
    "back": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M7.5 16L2 10.5L7.5 5L8.562 6.062L4.875 9.75H18V11.25H4.875L8.562 14.938L7.5 16Z" fill="currentColor"/>'
    },
    "bold": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M12.6875 9.82508C13.4958 9.26675 14.0625 8.35008 14.0625 7.50008C14.0625 5.61675 12.6041 4.16675 10.7291 4.16675H5.52081V15.8334H11.3875C13.1291 15.8334 14.4791 14.4167 14.4791 12.6751C14.4791 11.4084 13.7625 10.3251 12.6875 9.82508ZM8.02081 6.25008H10.5208C11.2125 6.25008 11.7708 6.80841 11.7708 7.50008C11.7708 8.19175 11.2125 8.75008 10.5208 8.75008H8.02081V6.25008ZM10.9375 13.7501H8.02081V11.2501H10.9375C11.6291 11.2501 12.1875 11.8084 12.1875 12.5001C12.1875 13.1917 11.6291 13.7501 10.9375 13.7501Z" fill="currentColor"/>'
    },
    "bookmark": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M5.917 14.812L10 13.083L14.083 14.812V4.25H5.917V14.812ZM4.167 17.5V4.25C4.167 3.764 4.337 3.35067 4.677 3.01C5.01767 2.67 5.431 2.5 5.917 2.5H14.083C14.569 2.5 14.9823 2.67 15.323 3.01C15.663 3.35067 15.833 3.764 15.833 4.25V17.5L10 14.979L4.167 17.5Z" fill="currentColor"/>'
    },
    "bullets-list": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M3.812 11.292C3.45133 11.292 3.146 11.167 2.896 10.917C2.646 10.667 2.521 10.3613 2.521 10C2.521 9.63867 2.646 9.333 2.896 9.083C3.146 8.833 3.45133 8.708 3.812 8.708C4.17333 8.708 4.479 8.833 4.729 9.083C4.979 9.333 5.104 9.63867 5.104 10C5.104 10.3613 4.979 10.667 4.729 10.917C4.479 11.167 4.17333 11.292 3.812 11.292ZM3.812 6.312C3.45133 6.312 3.146 6.18734 2.896 5.938C2.646 5.68734 2.521 5.38167 2.521 5.021C2.521 4.65967 2.646 4.354 2.896 4.104C3.146 3.854 3.45133 3.729 3.812 3.729C4.17333 3.729 4.479 3.854 4.729 4.104C4.979 4.354 5.104 4.65967 5.104 5.021C5.104 5.38167 4.979 5.68734 4.729 5.938C4.479 6.18734 4.17333 6.312 3.812 6.312ZM3.812 16.25C3.45133 16.25 3.146 16.125 2.896 15.875C2.646 15.625 2.521 15.3193 2.521 14.958C2.521 14.5973 2.646 14.292 2.896 14.042C3.146 13.792 3.45133 13.667 3.812 13.667C4.17333 13.667 4.479 13.792 4.729 14.042C4.979 14.292 5.104 14.5973 5.104 14.958C5.104 15.3193 4.979 15.625 4.729 15.875C4.479 16.125 4.17333 16.25 3.812 16.25ZM6.646 15.833V14.083H17.5V15.833H6.646ZM6.646 10.875V9.125H17.5V10.875H6.646ZM6.646 5.896V4.146H17.5V5.896H6.646Z" fill="currentColor"/>'
    },
    "calculate": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M5.25 7.708H9.417V6.438H5.25V7.708ZM10.792 14.333H14.958V13.042H10.792V14.333ZM10.792 12.292H14.958V11H10.792V12.292ZM6.688 14.958H7.979V13.312H9.625V12.021H7.979V10.375H6.688V12.021H5.042V13.312H6.688V14.958ZM11.688 9.188L12.854 8.021L14.021 9.188L14.938 8.271L13.771 7.104L14.938 5.938L14.021 5.021L12.854 6.188L11.688 5.021L10.771 5.938L11.938 7.104L10.771 8.271L11.688 9.188ZM4.25 17.5C3.764 17.5 3.35067 17.33 3.01 16.99C2.67 16.6493 2.5 16.236 2.5 15.75V4.25C2.5 3.764 2.67 3.35067 3.01 3.01C3.35067 2.67 3.764 2.5 4.25 2.5H15.75C16.236 2.5 16.6493 2.67 16.99 3.01C17.33 3.35067 17.5 3.764 17.5 4.25V15.75C17.5 16.236 17.33 16.6493 16.99 16.99C16.6493 17.33 16.236 17.5 15.75 17.5H4.25ZM4.25 15.75H15.75V4.25H4.25V15.75Z" fill="currentColor"/>'
    },
    "calendar": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M15.8333 3.33335H15V1.66669H13.3333V3.33335H6.66667V1.66669H5V3.33335H4.16667C3.24167 3.33335 2.50833 4.08335 2.50833 5.00002L2.5 16.6667C2.5 17.5834 3.24167 18.3334 4.16667 18.3334H15.8333C16.75 18.3334 17.5 17.5834 17.5 16.6667V5.00002C17.5 4.08335 16.75 3.33335 15.8333 3.33335ZM15.8333 16.6667H4.16667V8.33335H15.8333V16.6667ZM15.8333 6.66669H4.16667V5.00002H15.8333V6.66669ZM7.5 11.6667H5.83333V10H7.5V11.6667ZM10.8333 11.6667H9.16667V10H10.8333V11.6667ZM14.1667 11.6667H12.5V10H14.1667V11.6667ZM7.5 15H5.83333V13.3334H7.5V15ZM10.8333 15H9.16667V13.3334H10.8333V15ZM14.1667 15H12.5V13.3334H14.1667V15Z" fill="currentColor"/>'
    },
    "cancel": {
      "viewBox": "0 0 16 16",
      "body": '<path d="M8 16C6.90267 16 5.868 15.7917 4.896 15.375C3.924 14.9583 3.07333 14.3853 2.344 13.656C1.61467 12.9267 1.04167 12.076 0.625 11.104C0.208333 10.132 0 9.09733 0 8C0 6.88867 0.208333 5.85033 0.625 4.885C1.04167 3.92033 1.61467 3.07333 2.344 2.344C3.07333 1.61467 3.924 1.04167 4.896 0.625C5.868 0.208333 6.90267 0 8 0C9.11133 0 10.1497 0.208333 11.115 0.625C12.0797 1.04167 12.9267 1.61467 13.656 2.344C14.3853 3.07333 14.9583 3.92033 15.375 4.885C15.7917 5.85033 16 6.88867 16 8C16 9.09733 15.7917 10.132 15.375 11.104C14.9583 12.076 14.3853 12.9267 13.656 13.656C12.9267 14.3853 12.0797 14.9583 11.115 15.375C10.1497 15.7917 9.11133 16 8 16ZM8 14.5C9.80533 14.5 11.34 13.868 12.604 12.604C13.868 11.34 14.5 9.80533 14.5 8C14.5 7.236 14.375 6.51367 14.125 5.833C13.875 5.15233 13.5277 4.53433 13.083 3.979L3.979 13.083C4.53433 13.5277 5.15233 13.875 5.833 14.125C6.51367 14.375 7.236 14.5 8 14.5ZM2.917 12.021L12.021 2.917C11.4657 2.47233 10.8477 2.125 10.167 1.875C9.48633 1.625 8.764 1.5 8 1.5C6.19467 1.5 4.66 2.132 3.396 3.396C2.132 4.66 1.5 6.19467 1.5 8C1.5 8.764 1.625 9.48633 1.875 10.167C2.125 10.8477 2.47233 11.4657 2.917 12.021Z" fill="currentColor"/>'
    },
    "carat-back": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M13.333 18.333L5 9.99999L13.333 1.66699L14.854 3.20799L8.062 9.99999L14.854 16.792L13.333 18.333Z" fill="currentColor"/>'
    },
    "carat-down": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M3 8.28114L10 15.3L17 8.28113L15.7055 7L10 12.7209L4.29449 7L3 8.28114Z" fill="currentColor"/>'
    },
    "carat-forward": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M6.521 18.333L5 16.792L11.792 9.99999L5 3.20799L6.521 1.66699L14.854 9.99999L6.521 18.333Z" fill="currentColor"/>'
    },
    "carat-up": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M3 14.0189L10 7L17 14.0189L15.7055 15.3L10 9.57911L4.29449 15.3L3 14.0189Z" fill="currentColor"/>'
    },
    "carats-back": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9 15L4 10L9 5L10.062 6.062L6.125 10L10.062 13.938L9 15ZM14.938 15L9.938 10L14.938 5L16 6.062L12.062 10L16 13.938L14.938 15Z" fill="currentColor"/>'
    },
    "carats-forward": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M5.062 15L4 13.938L7.938 10L4 6.062L5.062 5L10.062 10L5.062 15ZM11 15L9.938 13.938L13.875 10L9.938 6.062L11 5L16 10L11 15Z" fill="currentColor"/>'
    },
    "card": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M3.417 16.667C2.931 16.667 2.51767 16.4967 2.177 16.156C1.837 15.816 1.667 15.403 1.667 14.917V5.08301C1.667 4.59701 1.837 4.18401 2.177 3.84401C2.51767 3.50334 2.931 3.33301 3.417 3.33301H16.583C17.069 3.33301 17.4823 3.50334 17.823 3.84401C18.163 4.18401 18.333 4.59701 18.333 5.08301V14.917C18.333 15.403 18.163 15.816 17.823 16.156C17.4823 16.4967 17.069 16.667 16.583 16.667H3.417ZM3.417 6.64601H16.583V5.08301H3.417V6.64601ZM3.417 10.083V14.917H16.583V10.083H3.417ZM3.417 14.917V5.08301V14.917Z" fill="currentColor"/>'
    },
    "cart": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M5.875 18.333C5.403 18.333 5.00033 18.1663 4.667 17.833C4.33367 17.4997 4.167 17.097 4.167 16.625C4.167 16.153 4.33367 15.7503 4.667 15.417C5.00033 15.0837 5.403 14.917 5.875 14.917C6.347 14.917 6.74967 15.0837 7.083 15.417C7.41633 15.7503 7.583 16.153 7.583 16.625C7.583 17.097 7.41633 17.4997 7.083 17.833C6.74967 18.1663 6.347 18.333 5.875 18.333ZM14.146 18.333C13.674 18.333 13.2713 18.1663 12.938 17.833C12.6047 17.4997 12.438 17.097 12.438 16.625C12.438 16.153 12.6047 15.7503 12.938 15.417C13.2713 15.0837 13.674 14.917 14.146 14.917C14.618 14.917 15.0207 15.0837 15.354 15.417C15.6873 15.7503 15.854 16.153 15.854 16.625C15.854 17.097 15.6873 17.4997 15.354 17.833C15.0207 18.1663 14.618 18.333 14.146 18.333ZM5.229 5.06199L7.167 9.14599H12.958L15.188 5.06199H5.229ZM4.396 3.31199H16.75C17.1113 3.31199 17.3613 3.45799 17.5 3.74999C17.6387 4.04199 17.6317 4.32666 17.479 4.60399L14.479 9.99999C14.3263 10.278 14.118 10.4967 13.854 10.656C13.59 10.816 13.2983 10.896 12.979 10.896H6.812L5.958 12.458H15.896V14.208H5.854C5.22933 14.208 4.75033 13.927 4.417 13.365C4.08367 12.8023 4.06967 12.2433 4.375 11.688L5.458 9.68799L2.5 3.41699H0.833V1.66699H3.604L4.396 3.31199Z" fill="currentColor"/>'
    },
    "cash": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M3.57766 16.5217C3.07554 16.5217 2.63206 16.3293 2.24724 15.9445C1.86241 15.5597 1.67 15.1162 1.67 14.6141V5.40886C1.67 4.90594 1.86241 4.46206 2.24724 4.07724C2.63206 3.69241 3.07554 3.5 3.57766 3.5H16.4323C16.9345 3.5 17.3779 3.69241 17.7628 4.07724C18.1476 4.46206 18.34 4.90594 18.34 5.40886V14.6141C18.34 15.1162 18.1476 15.5597 17.7628 15.9445C17.3779 16.3293 16.9345 16.5217 16.4323 16.5217H3.57766ZM5.08402 14.9154H14.926C14.926 14.4132 15.1015 13.9862 15.4526 13.6344C15.8045 13.2833 16.2315 13.1077 16.7336 13.1077V6.91522C16.2315 6.91522 15.8045 6.73526 15.4526 6.37534C15.1015 6.01542 14.926 5.59284 14.926 5.10759H5.08402C5.08402 5.60891 4.90848 6.03551 4.55739 6.38739C4.20551 6.73928 3.7785 6.91522 3.27638 6.91522V13.1077C3.7785 13.1077 4.20551 13.2833 4.55739 13.6344C4.90848 13.9862 5.08402 14.4132 5.08402 14.9154Z" fill="currentColor"/><path d="M8.375 13.325H9.146C9.146 13.5617 9.23267 13.7597 9.406 13.919C9.58 14.079 9.785 14.159 10.021 14.159C10.257 14.159 10.462 14.079 10.636 13.919C10.8093 13.7597 10.896 13.5617 10.896 13.325H11.729C11.9517 13.325 12.1427 13.2453 12.302 13.086C12.462 12.926 12.542 12.728 12.542 12.492V9.971C12.542 9.735 12.462 9.53366 12.302 9.367C12.1427 9.20033 11.9517 9.117 11.729 9.117H9.25V8.409H11.667C11.903 8.409 12.1077 8.322 12.281 8.148C12.455 7.97466 12.542 7.77 12.542 7.534C12.542 7.298 12.455 7.093 12.281 6.919C12.1077 6.74566 11.903 6.659 11.667 6.659H10.896C10.896 6.42233 10.8093 6.22766 10.636 6.075C10.462 5.92233 10.257 5.846 10.021 5.846C9.785 5.846 9.58 5.92233 9.406 6.075C9.23267 6.22766 9.146 6.42233 9.146 6.659H8.354C8.118 6.659 7.91667 6.74233 7.75 6.909C7.58333 7.07566 7.5 7.277 7.5 7.513V10.034C7.5 10.27 7.58333 10.4677 7.75 10.627C7.91667 10.787 8.118 10.867 8.354 10.867H10.792V11.575H8.375C8.139 11.575 7.93433 11.662 7.761 11.836C7.587 12.0093 7.5 12.214 7.5 12.45C7.5 12.686 7.587 12.891 7.761 13.065C7.93433 13.2383 8.139 13.325 8.375 13.325Z" fill="currentColor"/>'
    },
    "channels": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M7.5 11.6667C7.5 9.58335 8.22916 7.81252 9.6875 6.35419C11.1458 4.89585 12.9167 4.16669 15 4.16669V5.83335C13.375 5.83335 11.9967 6.39919 10.865 7.53085C9.73278 8.66308 9.16666 10.0417 9.16666 11.6667H7.5ZM10.8333 11.6667C10.8333 10.5139 11.2397 9.53113 12.0525 8.71835C12.8647 7.90613 13.8472 7.50002 15 7.50002V9.16669C14.3056 9.16669 13.7153 9.40974 13.2292 9.89585C12.7431 10.382 12.5 10.9722 12.5 11.6667H10.8333ZM4.16666 5.00002C3.70833 5.00002 3.31583 4.83669 2.98916 4.51002C2.66305 4.18391 2.5 3.79169 2.5 3.33335C2.5 2.87502 2.66305 2.48252 2.98916 2.15585C3.31583 1.82974 3.70833 1.66669 4.16666 1.66669C4.625 1.66669 5.01722 1.82974 5.34333 2.15585C5.67 2.48252 5.83333 2.87502 5.83333 3.33335C5.83333 3.79169 5.67 4.18391 5.34333 4.51002C5.01722 4.83669 4.625 5.00002 4.16666 5.00002ZM1.66666 9.16669V7.08335C1.66666 6.73613 1.78833 6.44113 2.03166 6.19835C2.27444 5.95502 2.56944 5.83335 2.91666 5.83335H5.41666C6.04166 5.83335 6.58 5.6353 7.03166 5.23919C7.48277 4.84363 7.76389 4.34724 7.875 3.75002H9.54166C9.45833 4.58335 9.15278 5.31946 8.625 5.95835C8.09722 6.59724 7.44444 7.04169 6.66666 7.29169V9.16669H1.66666ZM15.8333 14.1667C15.375 14.1667 14.9825 14.0036 14.6558 13.6775C14.3297 13.3509 14.1667 12.9584 14.1667 12.5C14.1667 12.0417 14.3297 11.6492 14.6558 11.3225C14.9825 10.9964 15.375 10.8334 15.8333 10.8334C16.2917 10.8334 16.6842 10.9964 17.0108 11.3225C17.3369 11.6492 17.5 12.0417 17.5 12.5C17.5 12.9584 17.3369 13.3509 17.0108 13.6775C16.6842 14.0036 16.2917 14.1667 15.8333 14.1667ZM13.3333 18.3334V16.4584C12.5556 16.2084 11.9028 15.7639 11.375 15.125C10.8472 14.4861 10.5417 13.75 10.4583 12.9167H12.125C12.2361 13.5139 12.5172 14.0106 12.9683 14.4067C13.42 14.8022 13.9583 15 14.5833 15H17.0833C17.4306 15 17.7256 15.1217 17.9683 15.365C18.2117 15.6078 18.3333 15.9028 18.3333 16.25V18.3334H13.3333Z" fill="currentColor"/>'
    },
    "check-circle": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M8.85401 13.812L14.729 7.93799L13.5 6.72899L8.87501 11.354L6.52101 8.99999L5.29201 10.229L8.85401 13.812ZM10 18.333C8.84734 18.333 7.76401 18.1143 6.75001 17.677C5.73601 17.2397 4.85401 16.646 4.10401 15.896C3.35401 15.146 2.76034 14.264 2.32301 13.25C1.88567 12.236 1.66701 11.1527 1.66701 9.99999C1.66701 8.84733 1.88567 7.76399 2.32301 6.74999C2.76034 5.73599 3.35401 4.85399 4.10401 4.10399C4.85401 3.35399 5.73601 2.76033 6.75001 2.32299C7.76401 1.88566 8.84734 1.66699 10 1.66699C11.1527 1.66699 12.236 1.88566 13.25 2.32299C14.264 2.76033 15.146 3.35399 15.896 4.10399C16.646 4.85399 17.2397 5.73599 17.677 6.74999C18.1143 7.76399 18.333 8.84733 18.333 9.99999C18.333 11.1527 18.1143 12.236 17.677 13.25C17.2397 14.264 16.646 15.146 15.896 15.896C15.146 16.646 14.264 17.2397 13.25 17.677C12.236 18.1143 11.1527 18.333 10 18.333ZM10 16.583C11.8193 16.583 13.3713 15.9407 14.656 14.656C15.9407 13.3713 16.583 11.8193 16.583 9.99999C16.583 8.18066 15.9407 6.62866 14.656 5.34399C13.3713 4.05933 11.8193 3.41699 10 3.41699C8.18067 3.41699 6.62867 4.05933 5.34401 5.34399C4.05934 6.62866 3.41701 8.18066 3.41701 9.99999C3.41701 11.8193 4.05934 13.3713 5.34401 14.656C6.62867 15.9407 8.18067 16.583 10 16.583Z" fill="currentColor"/>'
    },
    "check-filled": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10 18.3334C8.84727 18.3334 7.76394 18.1145 6.75005 17.6767C5.73616 17.2395 4.85422 16.6459 4.10422 15.8959C3.35422 15.1459 2.76061 14.264 2.32338 13.2501C1.88561 12.2362 1.66672 11.1529 1.66672 10.0001C1.66672 8.8473 1.88561 7.76397 2.32338 6.75008C2.76061 5.73619 3.35422 4.85425 4.10422 4.10425C4.85422 3.35425 5.73616 2.76036 6.75005 2.32258C7.76394 1.88536 8.84727 1.66675 10 1.66675C11.1528 1.66675 12.2362 1.88536 13.25 2.32258C14.2639 2.76036 15.1459 3.35425 15.8959 4.10425C16.6459 4.85425 17.2395 5.73619 17.6767 6.75008C18.1145 7.76397 18.3334 8.8473 18.3334 10.0001C18.3334 11.1529 18.1145 12.2362 17.6767 13.2501C17.2395 14.264 16.6459 15.1459 15.8959 15.8959C15.1459 16.6459 14.2639 17.2395 13.25 17.6767C12.2362 18.1145 11.1528 18.3334 10 18.3334ZM8.83338 13.8334L14.7084 7.95841L13.5417 6.79175L8.83338 11.5001L6.45838 9.12508L5.29172 10.2917L8.83338 13.8334Z" fill="currentColor"/>'
    },
    "check": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M7.97899 15L3.20799 10.229L4.47899 8.958L8.02099 12.5L15.542 4.979L16.771 6.208L7.97899 15Z" fill="currentColor"/>'
    },
    "checkin-status": {
      "viewBox": "0 0 18 13",
      "body": '<path d="M0.688477 4.583V2.833H8.18848V4.583H0.688477ZM0.688477 11.167V9.417H8.18848V11.167H0.688477ZM12.5835 6.292L9.56248 3.271L10.7925 2.042L12.5625 3.812L16.1045 0.270996L17.3335 1.521L12.5835 6.292ZM12.5835 12.833L9.56248 9.812L10.7925 8.583L12.5625 10.354L16.1045 6.812L17.3335 8.062L12.5835 12.833Z" fill="currentColor"/>'
    },
    "checklist": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M1.688 7.583V5.833H9.188V7.583H1.688ZM1.688 14.167V12.417H9.188V14.167H1.688ZM13.583 9.292L10.562 6.271L11.792 5.042L13.562 6.812L17.104 3.271L18.333 4.521L13.583 9.292ZM13.583 15.833L10.562 12.812L11.792 11.583L13.562 13.354L17.104 9.812L18.333 11.062L13.583 15.833Z" fill="currentColor"/>'
    },
    "clock": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M12.125 13.854L9.125 10.854V6.62499H10.875V10.125L13.354 12.604L12.125 13.854ZM9.125 5.10399V3.35399H10.875V5.10399H9.125ZM14.896 10.875V9.12499H16.646V10.875H14.896ZM9.125 16.646V14.896H10.875V16.646H9.125ZM3.354 10.875V9.12499H5.104V10.875H3.354ZM10 18.333C8.84733 18.333 7.764 18.1143 6.75 17.677C5.736 17.2397 4.854 16.646 4.104 15.896C3.354 15.146 2.76033 14.264 2.323 13.25C1.88567 12.236 1.667 11.1527 1.667 9.99999C1.667 8.84733 1.88567 7.76399 2.323 6.74999C2.76033 5.73599 3.354 4.85399 4.104 4.10399C4.854 3.35399 5.736 2.76033 6.75 2.32299C7.764 1.88566 8.84733 1.66699 10 1.66699C11.1527 1.66699 12.236 1.88566 13.25 2.32299C14.264 2.76033 15.146 3.35399 15.896 4.10399C16.646 4.85399 17.2397 5.73599 17.677 6.74999C18.1143 7.76399 18.333 8.84733 18.333 9.99999C18.333 11.1527 18.1143 12.236 17.677 13.25C17.2397 14.264 16.646 15.146 15.896 15.896C15.146 16.646 14.264 17.2397 13.25 17.677C12.236 18.1143 11.1527 18.333 10 18.333ZM10 16.583C11.8333 16.583 13.389 15.9443 14.667 14.667C15.9443 13.389 16.583 11.8333 16.583 9.99999C16.583 8.16666 15.9443 6.61099 14.667 5.33299C13.389 4.05566 11.8333 3.41699 10 3.41699C8.16667 3.41699 6.611 4.05566 5.333 5.33299C4.05567 6.61099 3.417 8.16666 3.417 9.99999C3.417 11.8333 4.05567 13.389 5.333 14.667C6.611 15.9443 8.16667 16.583 10 16.583Z" fill="currentColor"/>'
    },
    "close": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M5.375 15.854L4.146 14.625L8.771 10L4.146 5.375L5.375 4.146L10 8.771L14.625 4.146L15.854 5.375L11.229 10L15.854 14.625L14.625 15.854L10 11.229L5.375 15.854Z" fill="currentColor"/>'
    },
    "computer": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M3.417 14.875C2.931 14.875 2.51767 14.705 2.177 14.365C1.837 14.0243 1.667 13.611 1.667 13.125V4.25C1.667 3.764 1.837 3.35067 2.177 3.01C2.51767 2.67 2.931 2.5 3.417 2.5H16.583C17.069 2.5 17.4823 2.67 17.823 3.01C18.163 3.35067 18.333 3.764 18.333 4.25V13.125C18.333 13.611 18.163 14.0243 17.823 14.365C17.4823 14.705 17.069 14.875 16.583 14.875H3.417ZM3.417 13.125H16.583V4.25H3.417V13.125ZM1.708 17.5C1.472 17.5 1.26733 17.4133 1.094 17.24C0.92 17.066 0.833 16.861 0.833 16.625C0.833 16.389 0.92 16.184 1.094 16.01C1.26733 15.8367 1.472 15.75 1.708 15.75H18.292C18.528 15.75 18.7327 15.8367 18.906 16.01C19.08 16.184 19.167 16.389 19.167 16.625C19.167 16.861 19.08 17.066 18.906 17.24C18.7327 17.4133 18.528 17.5 18.292 17.5H1.708Z" fill="currentColor"/>'
    },
    "configuration": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M7.646 18.333L7.333 15.708C7.19433 15.6247 7.04167 15.5347 6.875 15.438C6.70833 15.3407 6.55567 15.2503 6.417 15.167L3.979 16.188L1.625 12.125L3.708 10.542C3.708 10.4587 3.708 10.3683 3.708 10.271C3.708 10.1737 3.708 10.0833 3.708 9.99999C3.708 9.91666 3.708 9.82633 3.708 9.72899C3.708 9.63166 3.708 9.54133 3.708 9.45799L1.625 7.87499L3.979 3.81199L6.417 4.83299C6.55567 4.74966 6.70833 4.65966 6.875 4.56299C7.04167 4.46566 7.19433 4.37533 7.333 4.29199L7.646 1.66699H12.354L12.667 4.29199C12.8057 4.37533 12.9583 4.46566 13.125 4.56299C13.2917 4.65966 13.4443 4.74966 13.583 4.83299L16.021 3.81199L18.375 7.87499L16.312 9.45799C16.312 9.54133 16.312 9.63166 16.312 9.72899C16.312 9.82633 16.312 9.91666 16.312 9.99999C16.312 10.0833 16.312 10.1737 16.312 10.271C16.312 10.3683 16.312 10.4587 16.312 10.542L18.375 12.125L16.021 16.188L13.583 15.167C13.4443 15.2503 13.2917 15.3407 13.125 15.438C12.9583 15.5347 12.8057 15.6247 12.667 15.708L12.354 18.333H7.646ZM10 12.979C10.8193 12.979 11.5207 12.6873 12.104 12.104C12.6873 11.5207 12.979 10.8193 12.979 9.99999C12.979 9.18066 12.6873 8.47933 12.104 7.89599C11.5207 7.31266 10.8193 7.02099 10 7.02099C9.18067 7.02099 8.47933 7.31266 7.896 7.89599C7.31267 8.47933 7.021 9.18066 7.021 9.99999C7.021 10.8193 7.31267 11.5207 7.896 12.104C8.47933 12.6873 9.18067 12.979 10 12.979ZM10 11.229C9.66667 11.229 9.37833 11.1077 9.135 10.865C8.89233 10.6217 8.771 10.3333 8.771 9.99999C8.771 9.66666 8.89233 9.37833 9.135 9.13499C9.37833 8.89233 9.66667 8.77099 10 8.77099C10.3333 8.77099 10.6217 8.89233 10.865 9.13499C11.1077 9.37833 11.229 9.66666 11.229 9.99999C11.229 10.3333 11.1077 10.6217 10.865 10.865C10.6217 11.1077 10.3333 11.229 10 11.229ZM9.167 16.583H10.833L11.083 14.417C11.4863 14.3057 11.8753 14.139 12.25 13.917C12.6247 13.6943 12.965 13.4303 13.271 13.125L15.292 13.979L16.125 12.604L14.354 11.25C14.4233 11.0553 14.472 10.854 14.5 10.646C14.528 10.4373 14.542 10.222 14.542 9.99999C14.542 9.80533 14.528 9.60733 14.5 9.40599C14.472 9.20466 14.4303 8.99299 14.375 8.77099L16.146 7.39599L15.312 6.02099L13.292 6.89599C12.972 6.57666 12.628 6.30933 12.26 6.09399C11.892 5.87866 11.5067 5.71533 11.104 5.60399L10.833 3.41699H9.167L8.896 5.60399C8.49333 5.71533 8.108 5.87866 7.74 6.09399C7.372 6.30933 7.035 6.56966 6.729 6.87499L4.708 6.02099L3.875 7.39599L5.625 8.74999C5.56967 8.97199 5.528 9.18733 5.5 9.39599C5.472 9.60399 5.458 9.80533 5.458 9.99999C5.458 10.1947 5.472 10.3927 5.5 10.594C5.528 10.7953 5.56967 11.007 5.625 11.229L3.875 12.604L4.708 13.979L6.729 13.125C7.035 13.4303 7.372 13.6907 7.74 13.906C8.108 14.1213 8.49333 14.2847 8.896 14.396L9.167 16.583Z" fill="currentColor"/>'
    },
    "copy": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M7.75 14.833C7.264 14.833 6.85067 14.663 6.51 14.323C6.17 13.9823 6 13.569 6 13.083V3.41699C6 2.93099 6.17 2.51766 6.51 2.17699C6.85067 1.83699 7.264 1.66699 7.75 1.66699H14.917C15.403 1.66699 15.816 1.83699 16.156 2.17699C16.4967 2.51766 16.667 2.93099 16.667 3.41699V13.083C16.667 13.569 16.4967 13.9823 16.156 14.323C15.816 14.663 15.403 14.833 14.917 14.833H7.75ZM7.75 13.083H14.917V3.41699H7.75V13.083ZM4.25 18.333C3.764 18.333 3.35067 18.163 3.01 17.823C2.67 17.4823 2.5 17.069 2.5 16.583V5.06199H4.25V16.583H13.271V18.333H4.25Z" fill="currentColor"/>'
    },
    "custom-columns": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M3.417 14.917H6.625V5.08301H3.417V14.917ZM8.375 14.917H11.625V5.08301H8.375V14.917ZM13.375 14.917H16.583V5.08301H13.375V14.917ZM3.417 16.667C2.931 16.667 2.51767 16.4967 2.177 16.156C1.837 15.816 1.667 15.403 1.667 14.917V5.08301C1.667 4.59701 1.837 4.18401 2.177 3.84401C2.51767 3.50334 2.931 3.33301 3.417 3.33301H16.583C17.069 3.33301 17.4823 3.50334 17.823 3.84401C18.163 4.18401 18.333 4.59701 18.333 5.08301V14.917C18.333 15.403 18.163 15.816 17.823 16.156C17.4823 16.4967 17.069 16.667 16.583 16.667H3.417Z" fill="currentColor"/>'
    },
    "customers": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M0.833 16.667V14.271C0.833 13.785 0.958 13.3473 1.208 12.958C1.458 12.5693 1.78467 12.2777 2.188 12.083C3.02133 11.6663 3.896 11.354 4.812 11.146C5.72933 10.9373 6.646 10.833 7.562 10.833C8.47933 10.833 9.396 10.9407 10.312 11.156C11.2293 11.3713 12.1047 11.6803 12.938 12.083C13.3407 12.2777 13.667 12.5693 13.917 12.958C14.167 13.3473 14.292 13.785 14.292 14.271V16.667H0.833ZM14.042 10.917C14.778 11.0003 15.4513 11.1427 16.062 11.344C16.6733 11.5453 17.2567 11.7917 17.812 12.083C18.326 12.361 18.6803 12.6737 18.875 13.021C19.0697 13.3683 19.167 13.785 19.167 14.271V16.667H15.917V14.083C15.917 13.5277 15.7607 12.9617 15.448 12.385C15.1353 11.809 14.6667 11.3197 14.042 10.917ZM7.562 9.97901C6.618 9.97901 5.82667 9.65968 5.188 9.02101C4.54867 8.38168 4.229 7.59001 4.229 6.64601C4.229 5.70134 4.54867 4.90968 5.188 4.27101C5.82667 3.63168 6.618 3.31201 7.562 3.31201C8.50667 3.31201 9.29867 3.63168 9.938 4.27101C10.5767 4.90968 10.896 5.70134 10.896 6.64601C10.896 7.59001 10.5767 8.38168 9.938 9.02101C9.29867 9.65968 8.50667 9.97901 7.562 9.97901ZM15.896 6.64601C15.896 7.59001 15.5767 8.38168 14.938 9.02101C14.2987 9.65968 13.5067 9.97901 12.562 9.97901C12.4093 9.97901 12.1977 9.95834 11.927 9.91701C11.6563 9.87501 11.4447 9.83334 11.292 9.79201C11.6527 9.34734 11.9337 8.85768 12.135 8.32301C12.337 7.78834 12.438 7.22934 12.438 6.64601C12.438 6.07668 12.337 5.52468 12.135 4.99001C11.9337 4.45534 11.6527 3.96568 11.292 3.52101C11.5 3.45168 11.7153 3.39968 11.938 3.36501C12.16 3.32968 12.368 3.31201 12.562 3.31201C13.5067 3.31201 14.2987 3.63168 14.938 4.27101C15.5767 4.90968 15.896 5.70134 15.896 6.64601ZM2.583 14.917H12.542V14.271C12.542 14.1183 12.5073 13.9897 12.438 13.885C12.368 13.781 12.2777 13.7083 12.167 13.667C11.4443 13.3337 10.6837 13.0697 9.885 12.875C9.087 12.6803 8.31267 12.583 7.562 12.583C6.81267 12.583 6.03867 12.677 5.24 12.865C4.44133 13.0523 3.68067 13.3197 2.958 13.667C2.84733 13.7083 2.75733 13.781 2.688 13.885C2.618 13.9897 2.583 14.1183 2.583 14.271V14.917ZM7.562 8.22901C8.02067 8.22901 8.39933 8.07968 8.698 7.78101C8.99667 7.48234 9.146 7.10401 9.146 6.64601C9.146 6.18734 8.99667 5.80868 8.698 5.51001C8.39933 5.21135 8.02067 5.06201 7.562 5.06201C7.104 5.06201 6.72567 5.21135 6.427 5.51001C6.12833 5.80868 5.979 6.18734 5.979 6.64601C5.979 7.10401 6.12833 7.48234 6.427 7.78101C6.72567 8.07968 7.104 8.22901 7.562 8.22901Z" fill="currentColor"/>'
    },
    "danger": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M2.70985 18C1.94502 18 1.46331 17.1763 1.83827 16.5097L9.12842 3.54947C9.51073 2.86982 10.4893 2.86982 10.8716 3.54947L18.1617 16.5097C18.5367 17.1763 18.055 18 17.2902 18H2.70985ZM3.646 16.5H16.354L10 4.917L3.646 16.5ZM10 15.5C10.208 15.5 10.385 15.427 10.531 15.281C10.677 15.135 10.75 14.958 10.75 14.75C10.75 14.542 10.677 14.365 10.531 14.219C10.385 14.073 10.208 14 10 14C9.792 14 9.615 14.073 9.469 14.219C9.323 14.365 9.25 14.542 9.25 14.75C9.25 14.958 9.323 15.135 9.469 15.281C9.615 15.427 9.792 15.5 10 15.5ZM9.25 13H10.75V9H9.25V13Z" fill="currentColor"/>'
    },
    "dashboard": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M15.8333 2.5H4.16667C3.25 2.5 2.5 3.25 2.5 4.16667V15.8333C2.5 16.75 3.25 17.5 4.16667 17.5H15.8333C16.75 17.5 17.5 16.75 17.5 15.8333V4.16667C17.5 3.25 16.75 2.5 15.8333 2.5ZM4.16667 15.8333V4.16667H9.16667V15.8333H4.16667ZM15.8333 15.8333H10.8333V10H15.8333V15.8333ZM15.8333 8.33333H10.8333V4.16667H15.8333V8.33333Z" fill="currentColor"/>'
    },
    "delete": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M5.896 17.5C5.41 17.5 4.99667 17.33 4.656 16.99C4.316 16.6493 4.146 16.236 4.146 15.75V5.125H3.333V3.375H7.542V2.5H12.458V3.375H16.667V5.125H15.833V15.75C15.833 16.236 15.663 16.6493 15.323 16.99C14.9823 17.33 14.569 17.5 14.083 17.5H5.896ZM14.083 5.125H5.896V15.75H14.083V5.125ZM7.458 14H9.208V6.875H7.458V14ZM10.771 14H12.521V6.875H10.771V14Z" fill="currentColor"/>'
    },
    "devices": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M1.667 16.667V14.042H3.312V5.08301C3.312 4.59701 3.48233 4.18401 3.823 3.84401C4.163 3.50334 4.576 3.33301 5.062 3.33301H17.458V5.08301H5.062V14.042H10.083V16.667H1.667ZM12.688 16.667C12.4513 16.667 12.2497 16.5837 12.083 16.417C11.9163 16.2503 11.833 16.0557 11.833 15.833V7.64601C11.833 7.41001 11.9163 7.21567 12.083 7.06301C12.2497 6.90967 12.4513 6.83301 12.688 6.83301H17.542C17.764 6.83301 17.9513 6.90967 18.104 7.06301C18.2567 7.21567 18.333 7.41001 18.333 7.64601V15.833C18.333 16.0557 18.2567 16.2503 18.104 16.417C17.9513 16.5837 17.764 16.667 17.542 16.667H12.688ZM13.583 14.042H16.583V8.58301H13.583V14.042Z" fill="currentColor"/>'
    },
    "dispute": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M2.5 16C2.09722 16 1.74653 15.853 1.44792 15.5591C1.14931 15.2652 1 14.9119 1 14.4992V5.4941C1 5.08137 1.14931 4.72917 1.44792 4.4375C1.74653 4.14583 2.09722 4 2.5 4H15.5C15.9028 4 16.2535 4.14687 16.5521 4.44062C16.8507 4.73437 17 5.0875 17 5.5V10H2.5V14.5H11V16H2.5ZM2.5 7H15.5V5.5H2.5V7Z" fill="currentColor"/><path d="M15.75 15.8107L17.5178 17.5784L18.5784 16.5178L16.8107 14.75L18.5784 12.9822L17.5178 11.9216L15.75 13.6893L13.9822 11.9216L12.9216 12.9822L14.6893 14.75L12.9216 16.5178L13.9822 17.5784L15.75 15.8107Z" fill="currentColor"/>'
    },
    "drag-indicator": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M7.542 16.667C7.06933 16.667 6.66633 16.5003 6.333 16.167C5.99967 15.8337 5.833 15.4307 5.833 14.958C5.833 14.486 5.99967 14.0833 6.333 13.75C6.66633 13.4167 7.06933 13.25 7.542 13.25C8.014 13.25 8.41667 13.4167 8.75 13.75C9.08333 14.0833 9.25 14.486 9.25 14.958C9.25 15.4307 9.08333 15.8337 8.75 16.167C8.41667 16.5003 8.014 16.667 7.542 16.667ZM7.542 11.708C7.06933 11.708 6.66633 11.5413 6.333 11.208C5.99967 10.8747 5.833 10.472 5.833 10C5.833 9.52801 5.99967 9.12534 6.333 8.79201C6.66633 8.45867 7.06933 8.29201 7.542 8.29201C8.014 8.29201 8.41667 8.45867 8.75 8.79201C9.08333 9.12534 9.25 9.52801 9.25 10C9.25 10.472 9.08333 10.8747 8.75 11.208C8.41667 11.5413 8.014 11.708 7.542 11.708ZM7.542 6.75001C7.06933 6.75001 6.66633 6.58334 6.333 6.25001C5.99967 5.91667 5.833 5.51401 5.833 5.04201C5.833 4.56934 5.99967 4.16634 6.333 3.83301C6.66633 3.49967 7.06933 3.33301 7.542 3.33301C8.014 3.33301 8.41667 3.49967 8.75 3.83301C9.08333 4.16634 9.25 4.56934 9.25 5.04201C9.25 5.51401 9.08333 5.91667 8.75 6.25001C8.41667 6.58334 8.014 6.75001 7.542 6.75001ZM12.458 6.75001C11.986 6.75001 11.5833 6.58334 11.25 6.25001C10.9167 5.91667 10.75 5.51401 10.75 5.04201C10.75 4.56934 10.9167 4.16634 11.25 3.83301C11.5833 3.49967 11.986 3.33301 12.458 3.33301C12.9307 3.33301 13.3337 3.49967 13.667 3.83301C14.0003 4.16634 14.167 4.56934 14.167 5.04201C14.167 5.51401 14.0003 5.91667 13.667 6.25001C13.3337 6.58334 12.9307 6.75001 12.458 6.75001ZM12.458 11.708C11.986 11.708 11.5833 11.5413 11.25 11.208C10.9167 10.8747 10.75 10.472 10.75 10C10.75 9.52801 10.9167 9.12534 11.25 8.79201C11.5833 8.45867 11.986 8.29201 12.458 8.29201C12.9307 8.29201 13.3337 8.45867 13.667 8.79201C14.0003 9.12534 14.167 9.52801 14.167 10C14.167 10.472 14.0003 10.8747 13.667 11.208C13.3337 11.5413 12.9307 11.708 12.458 11.708ZM12.458 16.667C11.986 16.667 11.5833 16.5003 11.25 16.167C10.9167 15.8337 10.75 15.4307 10.75 14.958C10.75 14.486 10.9167 14.0833 11.25 13.75C11.5833 13.4167 11.986 13.25 12.458 13.25C12.9307 13.25 13.3337 13.4167 13.667 13.75C14.0003 14.0833 14.167 14.486 14.167 14.958C14.167 15.4307 14.0003 15.8337 13.667 16.167C13.3337 16.5003 12.9307 16.667 12.458 16.667Z" fill="currentColor"/>'
    },
    "edit": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M4.25 15.75H5.479L13.5 7.729L12.896 7.104L12.271 6.5L4.25 14.521V15.75ZM2.5 17.5V13.771L13.479 2.792C13.8263 2.44466 14.2397 2.271 14.719 2.271C15.1983 2.271 15.6113 2.44466 15.958 2.792L17.208 4.042C17.5413 4.37533 17.708 4.78833 17.708 5.281C17.708 5.77433 17.5413 6.18766 17.208 6.521L6.229 17.5H2.5ZM13.5 7.729L12.896 7.104L12.271 6.5V6.479L13.5 7.729Z" fill="currentColor"/>'
    },
    "emv-reader": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M7.167 12.062C7.27767 11.7427 7.361 11.4093 7.417 11.062C7.47233 10.7153 7.5 10.3613 7.5 10C7.5 9.63867 7.47233 9.28467 7.417 8.938C7.361 8.59067 7.27767 8.25733 7.167 7.938L5.75 8.5C5.83333 8.736 5.896 8.979 5.938 9.229C5.97933 9.479 6 9.736 6 10C6 10.264 5.97933 10.521 5.938 10.771C5.896 11.021 5.83333 11.264 5.75 11.5L7.167 12.062ZM9.896 13.167C10.0907 12.681 10.24 12.1773 10.344 11.656C10.448 11.1353 10.5 10.5833 10.5 10C10.5 9.41667 10.448 8.86467 10.344 8.344C10.24 7.82267 10.0907 7.319 9.896 6.833L8.5 7.396C8.65267 7.78467 8.77433 8.19767 8.865 8.635C8.955 9.073 9 9.528 9 10C9 10.472 8.955 10.927 8.865 11.365C8.77433 11.8023 8.65267 12.2153 8.5 12.604L9.896 13.167ZM12.646 14.25C12.9233 13.6247 13.135 12.958 13.281 12.25C13.427 11.542 13.5 10.792 13.5 10C13.5 9.208 13.427 8.458 13.281 7.75C13.135 7.042 12.9233 6.37533 12.646 5.75L11.25 6.292C11.486 6.81933 11.67 7.399 11.802 8.031C11.934 8.663 12 9.31933 12 10C12 10.6807 11.934 11.337 11.802 11.969C11.67 12.601 11.486 13.1807 11.25 13.708L12.646 14.25ZM10 18C8.90267 18 7.868 17.7917 6.896 17.375C5.924 16.9583 5.07333 16.3853 4.344 15.656C3.61467 14.9267 3.04167 14.076 2.625 13.104C2.20833 12.132 2 11.0973 2 10C2 8.88867 2.20833 7.85033 2.625 6.885C3.04167 5.92033 3.61467 5.07333 4.344 4.344C5.07333 3.61467 5.924 3.04167 6.896 2.625C7.868 2.20833 8.90267 2 10 2C11.1113 2 12.1497 2.20833 13.115 2.625C14.0797 3.04167 14.9267 3.61467 15.656 4.344C16.3853 5.07333 16.9583 5.92033 17.375 6.885C17.7917 7.85033 18 8.88867 18 10C18 11.0973 17.7917 12.132 17.375 13.104C16.9583 14.076 16.3853 14.9267 15.656 15.656C14.9267 16.3853 14.0797 16.9583 13.115 17.375C12.1497 17.7917 11.1113 18 10 18ZM10 16.5C11.8053 16.5 13.34 15.868 14.604 14.604C15.868 13.34 16.5 11.8053 16.5 10C16.5 8.19467 15.868 6.66 14.604 5.396C13.34 4.132 11.8053 3.5 10 3.5C8.19467 3.5 6.66 4.132 5.396 5.396C4.132 6.66 3.5 8.19467 3.5 10C3.5 11.8053 4.132 13.34 5.396 14.604C6.66 15.868 8.19467 16.5 10 16.5Z" fill="currentColor"/>'
    },
    "extension": {
      "viewBox": "0 0 20 20",
      "body": '<g id="extension"><mask id="mask0_3751_25358" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20"><rect id="Bounding box" width="20" height="20" fill="currentColor"/></mask><g mask="url(#mask0_3751_25358)"><path id="extension_2" d="M7.29167 17.5H4.25C3.76389 17.5 3.35069 17.3299 3.01042 16.9896C2.67014 16.6493 2.5 16.2361 2.5 15.75V12.7292C3.19444 12.7292 3.79514 12.5139 4.30208 12.0833C4.80903 11.6528 5.0625 11.1042 5.0625 10.4375C5.0625 9.77083 4.80903 9.22222 4.30208 8.79167C3.79514 8.36111 3.19444 8.14583 2.5 8.14583V5.08333C2.5 4.59722 2.67014 4.18403 3.01042 3.84375C3.35069 3.50347 3.76389 3.33333 4.25 3.33333H7.5C7.5 2.72222 7.69444 2.22222 8.08333 1.83333C8.47222 1.44444 8.97222 1.25 9.58333 1.25C10.1944 1.25 10.6944 1.44444 11.0833 1.83333C11.4722 2.22222 11.6667 2.72222 11.6667 3.33333H14.9167C15.4028 3.33333 15.816 3.50347 16.1562 3.84375C16.4965 4.18403 16.6667 4.59722 16.6667 5.08333V8.35417C17.2778 8.35417 17.7778 8.54861 18.1667 8.9375C18.5556 9.32639 18.75 9.82639 18.75 10.4375C18.75 11.0486 18.5556 11.5486 18.1667 11.9375C17.7778 12.3264 17.2778 12.5208 16.6667 12.5208V15.75C16.6667 16.2361 16.4965 16.6493 16.1562 16.9896C15.816 17.3299 15.4028 17.5 14.9167 17.5H11.875C11.875 16.7917 11.6493 16.1875 11.1979 15.6875C10.7465 15.1875 10.2083 14.9375 9.58333 14.9375C8.95833 14.9375 8.42014 15.1875 7.96875 15.6875C7.51736 16.1875 7.29167 16.7917 7.29167 17.5ZM4.25 15.75H5.91667C6.26389 14.8333 6.80208 14.1771 7.53125 13.7812C8.26042 13.3854 8.94444 13.1875 9.58333 13.1875C10.2222 13.1875 10.9062 13.3854 11.6354 13.7812C12.3646 14.1771 12.9028 14.8333 13.25 15.75H14.9167V10.7708H16.6667C16.7639 10.7708 16.8438 10.7396 16.9062 10.6771C16.9688 10.6146 17 10.5347 17 10.4375C17 10.3403 16.9688 10.2604 16.9062 10.1979C16.8438 10.1354 16.7639 10.1042 16.6667 10.1042H14.9167V5.08333H9.91667V3.33333C9.91667 3.23611 9.88542 3.15625 9.82292 3.09375C9.76042 3.03125 9.68056 3 9.58333 3C9.48611 3 9.40625 3.03125 9.34375 3.09375C9.28125 3.15625 9.25 3.23611 9.25 3.33333V5.08333H4.25V6.75C5.01389 7.06944 5.63194 7.55903 6.10417 8.21875C6.57639 8.87847 6.8125 9.61806 6.8125 10.4375C6.8125 11.2569 6.57292 11.9896 6.09375 12.6354C5.61458 13.2812 5 13.7778 4.25 14.125V15.75Z" fill="currentColor"/></g></g>'
    },
    "first-page": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M5 14V6H6.5V14H5ZM13 14L9 10L13 6L14.062 7.062L11.125 10L14.062 12.938L13 14Z" fill="currentColor"/>'
    },
    "fullscreen-exit": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M6.604 15.833V13.396H4.167V11.646H8.354V15.833H6.604ZM4.167 8.35399V6.60399H6.604V4.16699H8.354V8.35399H4.167ZM11.646 15.833V11.646H15.833V13.396H13.396V15.833H11.646ZM11.646 8.35399V4.16699H13.396V6.60399H15.833V8.35399H11.646Z" fill="currentColor"/>'
    },
    "fullscreen": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M4.167 15.833V11.646H5.917V14.083H8.354V15.833H4.167ZM4.167 8.35399V4.16699H8.354V5.91699H5.917V8.35399H4.167ZM11.646 15.833V14.083H14.083V11.646H15.833V15.833H11.646ZM14.083 8.35399V5.91699H11.646V4.16699H15.833V8.35399H14.083Z" fill="currentColor"/>'
    },
    "giftcard": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M3.417 14.146V15.75H16.583V14.146H3.417ZM3.417 4.99999H5.021C4.96567 4.87466 4.92733 4.75299 4.906 4.63499C4.88533 4.51699 4.875 4.38166 4.875 4.22899C4.875 3.52099 5.12833 2.91699 5.635 2.41699C6.14233 1.91699 6.75 1.66699 7.458 1.66699C7.88867 1.66699 8.281 1.78133 8.635 2.00999C8.98967 2.23933 9.30567 2.51366 9.583 2.83299L10 3.33299L10.417 2.83299C10.6943 2.51366 11.0137 2.23933 11.375 2.00999C11.7363 1.78133 12.132 1.66699 12.562 1.66699C13.2707 1.66699 13.875 1.91699 14.375 2.41699C14.875 2.91699 15.125 3.52099 15.125 4.22899C15.125 4.38166 15.118 4.51699 15.104 4.63499C15.09 4.75299 15.0553 4.87466 15 4.99999H16.583C17.069 4.99999 17.4823 5.16999 17.823 5.50999C18.163 5.85066 18.333 6.26399 18.333 6.74999V15.75C18.333 16.236 18.163 16.6493 17.823 16.99C17.4823 17.33 17.069 17.5 16.583 17.5H3.417C2.931 17.5 2.51767 17.33 2.177 16.99C1.837 16.6493 1.667 16.236 1.667 15.75V6.74999C1.667 6.26399 1.837 5.85066 2.177 5.50999C2.51767 5.16999 2.931 4.99999 3.417 4.99999ZM3.417 11.625H16.583V6.74999H12.583L14.25 9.04199L12.833 10.083L10 6.24999L7.167 10.083L5.75 9.04199L7.417 6.74999H3.417V11.625ZM7.438 5.04199C7.674 5.04199 7.86833 4.96566 8.021 4.81299C8.17367 4.65966 8.25 4.46499 8.25 4.22899C8.25 3.99299 8.17367 3.79866 8.021 3.64599C7.86833 3.49333 7.674 3.41699 7.438 3.41699C7.20133 3.41699 7.00667 3.49333 6.854 3.64599C6.70133 3.79866 6.625 3.99299 6.625 4.22899C6.625 4.46499 6.70133 4.65966 6.854 4.81299C7.00667 4.96566 7.20133 5.04199 7.438 5.04199ZM12.542 5.04199C12.778 5.04199 12.9723 4.96566 13.125 4.81299C13.2777 4.65966 13.354 4.46499 13.354 4.22899C13.354 3.99299 13.2777 3.79866 13.125 3.64599C12.9723 3.49333 12.778 3.41699 12.542 3.41699C12.306 3.41699 12.1113 3.49333 11.958 3.64599C11.8053 3.79866 11.729 3.99299 11.729 4.22899C11.729 4.46499 11.8053 4.65966 11.958 4.81299C12.1113 4.96566 12.306 5.04199 12.542 5.04199Z" fill="currentColor"/>'
    },
    "help": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.95801 15.021C10.264 15.021 10.521 14.9167 10.729 14.708C10.9377 14.5 11.042 14.2433 11.042 13.938C11.042 13.632 10.9377 13.375 10.729 13.167C10.521 12.9583 10.264 12.854 9.95801 12.854C9.65267 12.854 9.39601 12.9583 9.18801 13.167C8.97934 13.375 8.87501 13.632 8.87501 13.938C8.87501 14.2433 8.97934 14.5 9.18801 14.708C9.39601 14.9167 9.65267 15.021 9.95801 15.021ZM9.16701 11.771H10.792C10.792 11.2983 10.844 10.9337 10.948 10.677C11.052 10.4203 11.347 10.0557 11.833 9.58299C12.1803 9.23566 12.4583 8.89899 12.667 8.57299C12.875 8.24633 12.979 7.85399 12.979 7.39599C12.979 6.61799 12.6977 6.02066 12.135 5.60399C11.573 5.18733 10.896 4.97899 10.104 4.97899C9.29867 4.97899 8.64234 5.18733 8.13501 5.60399C7.62834 6.02066 7.27767 6.52766 7.08301 7.12499L8.54201 7.70799C8.61134 7.47199 8.75701 7.20466 8.97901 6.90599C9.20101 6.60733 9.56201 6.45799 10.062 6.45799C10.4927 6.45799 10.8193 6.57266 11.042 6.80199C11.264 7.03133 11.375 7.28466 11.375 7.56199C11.375 7.82599 11.2883 8.08299 11.115 8.33299C10.941 8.58299 10.736 8.80533 10.5 8.99999C9.87467 9.54133 9.49634 9.95099 9.36501 10.229C9.23301 10.507 9.16701 11.021 9.16701 11.771ZM10 18.333C8.86134 18.333 7.78501 18.1143 6.77101 17.677C5.75701 17.2397 4.87167 16.646 4.11501 15.896C3.35767 15.146 2.76034 14.264 2.32301 13.25C1.88567 12.236 1.66701 11.1527 1.66701 9.99999C1.66701 8.84733 1.88567 7.76399 2.32301 6.74999C2.76034 5.73599 3.35767 4.85399 4.11501 4.10399C4.87167 3.35399 5.75701 2.76033 6.77101 2.32299C7.78501 1.88566 8.86134 1.66699 10 1.66699C11.1667 1.66699 12.257 1.88566 13.271 2.32299C14.285 2.76033 15.167 3.35399 15.917 4.10399C16.667 4.85399 17.2573 5.73599 17.688 6.74999C18.118 7.76399 18.333 8.84733 18.333 9.99999C18.333 11.1527 18.118 12.236 17.688 13.25C17.2573 14.264 16.667 15.146 15.917 15.896C15.167 16.646 14.285 17.2397 13.271 17.677C12.257 18.1143 11.1667 18.333 10 18.333ZM10 16.583C11.8473 16.583 13.4063 15.9407 14.677 14.656C15.9477 13.3713 16.583 11.8193 16.583 9.99999C16.583 8.18066 15.9477 6.62866 14.677 5.34399C13.4063 4.05933 11.8473 3.41699 10 3.41699C8.19467 3.41699 6.64601 4.05933 5.35401 5.34399C4.06267 6.62866 3.41701 8.18066 3.41701 9.99999C3.41701 11.8193 4.06267 13.3713 5.35401 14.656C6.64601 15.9407 8.19467 16.583 10 16.583Z" fill="currentColor"/>'
    },
    "history": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M12.208 13.521L9.062 10.333V5.833H10.812V9.646L13.438 12.292L12.208 13.521ZM10.021 17.5C8.07633 17.5 6.39233 16.8647 4.969 15.594C3.545 14.3233 2.736 12.7293 2.542 10.812H4.292C4.472 12.2427 5.10733 13.4233 6.198 14.354C7.288 15.2847 8.56233 15.75 10.021 15.75C11.6183 15.75 12.9723 15.191 14.083 14.073C15.1943 12.955 15.75 11.5973 15.75 10C15.75 8.40267 15.1943 7.045 14.083 5.927C12.9723 4.809 11.6183 4.25 10.021 4.25C9.06233 4.25 8.15933 4.47233 7.312 4.917C6.46533 5.361 5.778 5.979 5.25 6.771H7.438V8.521H2.5V3.396H4.25V5.188C4.94467 4.29867 5.79867 3.62833 6.812 3.177C7.826 2.72567 8.89567 2.5 10.021 2.5C11.0483 2.5 12.017 2.69433 12.927 3.083C13.837 3.47233 14.632 4.00733 15.312 4.688C15.9927 5.368 16.5277 6.163 16.917 7.073C17.3057 7.983 17.5 8.95167 17.5 9.979C17.5 11.021 17.3057 11.9967 16.917 12.906C16.5277 13.816 15.9927 14.6113 15.312 15.292C14.632 15.972 13.8407 16.51 12.938 16.906C12.0347 17.302 11.0623 17.5 10.021 17.5Z" fill="currentColor"/>'
    },
    "iOS-tablet": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M4.25 19.167C3.764 19.167 3.35067 18.9967 3.01 18.656C2.67 18.316 2.5 17.903 2.5 17.417V2.58301C2.5 2.09701 2.67 1.68401 3.01 1.34401C3.35067 1.00334 3.764 0.833008 4.25 0.833008H15.75C16.236 0.833008 16.6493 1.00334 16.99 1.34401C17.33 1.68401 17.5 2.09701 17.5 2.58301V17.417C17.5 17.903 17.33 18.316 16.99 18.656C16.6493 18.9967 16.236 19.167 15.75 19.167H4.25ZM4.25 13.042H15.75V5.20801H4.25V13.042ZM4.25 14.792V17.417H15.75V14.792H4.25ZM4.25 3.45801H15.75V2.58301H4.25V3.45801ZM10.021 16.979C10.257 16.979 10.4617 16.8923 10.635 16.719C10.809 16.545 10.896 16.34 10.896 16.104C10.896 15.868 10.809 15.6633 10.635 15.49C10.4617 15.316 10.257 15.229 10.021 15.229C9.785 15.229 9.58 15.316 9.406 15.49C9.23267 15.6633 9.146 15.868 9.146 16.104C9.146 16.34 9.23267 16.545 9.406 16.719C9.58 16.8923 9.785 16.979 10.021 16.979Z" fill="currentColor"/>'
    },
    "icon-add": {
      "viewBox": "0 0 12 12",
      "body": '<path d="M5.125 11.833V6.87499H0.167V5.12499H5.125V0.166992H6.875V5.12499H11.833V6.87499H6.875V11.833H5.125Z" fill="currentColor"/>'
    },
    "icon-arrow-left": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M13.333 18.333L5 9.99999L13.333 1.66699L14.854 3.20799L8.062 9.99999L14.854 16.792L13.333 18.333Z" fill="currentColor"/>'
    },
    "icon-arrow-right": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M6.521 18.333L5 16.792L11.792 9.99999L5 3.20799L6.521 1.66699L14.854 9.99999L6.521 18.333Z" fill="currentColor"/>'
    },
    "icon-calendar": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M15.8333 3.33329H15V1.66663H13.3333V3.33329H6.66667V1.66663H5V3.33329H4.16667C3.24167 3.33329 2.50833 4.08329 2.50833 4.99996L2.5 16.6666C2.5 17.5833 3.24167 18.3333 4.16667 18.3333H15.8333C16.75 18.3333 17.5 17.5833 17.5 16.6666V4.99996C17.5 4.08329 16.75 3.33329 15.8333 3.33329ZM15.8333 16.6666H4.16667V8.33329H15.8333V16.6666ZM15.8333 6.66663H4.16667V4.99996H15.8333V6.66663ZM7.5 11.6666H5.83333V9.99996H7.5V11.6666ZM10.8333 11.6666H9.16667V9.99996H10.8333V11.6666ZM14.1667 11.6666H12.5V9.99996H14.1667V11.6666ZM7.5 15H5.83333V13.3333H7.5V15ZM10.8333 15H9.16667V13.3333H10.8333V15ZM14.1667 15H12.5V13.3333H14.1667V15Z" fill="currentColor"/>'
    },
    "icon-filter": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.49996 16C9.36129 16 9.24329 15.9513 9.14596 15.854C9.04863 15.7567 8.99996 15.6387 8.99996 15.5V10.771L4.10396 4.812C3.97929 4.64533 3.96196 4.46833 4.05196 4.281C4.14263 4.09367 4.29196 4 4.49996 4H15.5C15.708 4 15.8573 4.09367 15.948 4.281C16.038 4.46833 16.0206 4.64533 15.896 4.812L11 10.771V15.5C11 15.6387 10.9513 15.7567 10.854 15.854C10.7566 15.9513 10.6386 16 10.5 16H9.49996ZM9.99996 9.625L13.375 5.5H6.60396L9.99996 9.625Z" fill="currentColor"/>'
    },
    "icon-house": {
      "viewBox": "0 0 19 14",
      "body": '<path d="M9.75 3.65625L4 8.40625V13.5C4 13.7812 4.21875 14 4.5 14H8C8.25 14 8.46875 13.7812 8.46875 13.5V10.5C8.46875 10.25 8.71875 10 8.96875 10H10.9688C11.25 10 11.4688 10.25 11.4688 10.5V13.5C11.4688 13.7812 11.7188 14 11.9688 14H15.5C15.75 14 16 13.7812 16 13.5V8.375L10.2188 3.65625C10.1562 3.59375 10.0625 3.5625 10 3.5625C9.90625 3.5625 9.8125 3.59375 9.75 3.65625ZM18.8438 6.875L16.25 4.71875V0.40625C16.25 0.1875 16.0625 0.03125 15.875 0.03125H14.125C13.9062 0.03125 13.75 0.1875 13.75 0.40625V2.65625L10.9375 0.34375C10.6875 0.15625 10.3438 0.03125 10 0.03125C9.625 0.03125 9.28125 0.15625 9.03125 0.34375L1.125 6.875C1.03125 6.9375 0.96875 7.0625 0.96875 7.15625C0.96875 7.25 1.03125 7.34375 1.0625 7.40625L1.875 8.375C1.9375 8.46875 2.03125 8.5 2.15625 8.5C2.25 8.5 2.34375 8.46875 2.40625 8.40625L9.75 2.375C9.8125 2.3125 9.90625 2.28125 10 2.28125C10.0625 2.28125 10.1562 2.3125 10.2188 2.375L17.5625 8.40625C17.625 8.46875 17.7188 8.5 17.8125 8.5C17.9375 8.5 18.0312 8.46875 18.0938 8.375L18.9062 7.40625C18.9688 7.34375 19 7.25 19 7.15625C19 7.0625 18.9375 6.9375 18.8438 6.875Z" fill="currentColor"/>'
    },
    "icon-info-filled": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.25 14H10.75V9H9.25V14ZM10 7.5C10.208 7.5 10.385 7.427 10.531 7.281C10.677 7.135 10.75 6.958 10.75 6.75C10.75 6.542 10.677 6.365 10.531 6.219C10.385 6.073 10.208 6 10 6C9.792 6 9.615 6.073 9.469 6.219C9.323 6.365 9.25 6.542 9.25 6.75C9.25 6.958 9.323 7.135 9.469 7.281C9.615 7.427 9.792 7.5 10 7.5ZM10 18C8.90267 18 7.868 17.7917 6.896 17.375C5.924 16.9583 5.07333 16.3853 4.344 15.656C3.61467 14.9267 3.04167 14.076 2.625 13.104C2.20833 12.132 2 11.0973 2 10C2 8.88867 2.20833 7.85033 2.625 6.885C3.04167 5.92033 3.61467 5.07333 4.344 4.344C5.07333 3.61467 5.924 3.04167 6.896 2.625C7.868 2.20833 8.90267 2 10 2C11.1113 2 12.1497 2.20833 13.115 2.625C14.0797 3.04167 14.9267 3.61467 15.656 4.344C16.3853 5.07333 16.9583 5.92033 17.375 6.885C17.7917 7.85033 18 8.88867 18 10C18 11.0973 17.7917 12.132 17.375 13.104C16.9583 14.076 16.3853 14.9267 15.656 15.656C14.9267 16.3853 14.0797 16.9583 13.115 17.375C12.1497 17.7917 11.1113 18 10 18Z" fill="currentColor"/>'
    },
    "icon-info": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.12501 14.167H10.875V9.16699H9.12501V14.167ZM10 7.47899C10.236 7.47899 10.441 7.39233 10.615 7.21899C10.7883 7.04499 10.875 6.83999 10.875 6.60399C10.875 6.36799 10.7883 6.16333 10.615 5.98999C10.441 5.81599 10.236 5.72899 10 5.72899C9.76401 5.72899 9.55901 5.81599 9.38501 5.98999C9.21167 6.16333 9.12501 6.36799 9.12501 6.60399C9.12501 6.83999 9.21167 7.04499 9.38501 7.21899C9.55901 7.39233 9.76401 7.47899 10 7.47899ZM10 18.333C8.84734 18.333 7.76401 18.1143 6.75001 17.677C5.73601 17.2397 4.85401 16.646 4.10401 15.896C3.35401 15.146 2.76034 14.264 2.32301 13.25C1.88567 12.236 1.66701 11.1527 1.66701 9.99999C1.66701 8.84733 1.88567 7.76399 2.32301 6.74999C2.76034 5.73599 3.35401 4.85399 4.10401 4.10399C4.85401 3.35399 5.73601 2.76033 6.75001 2.32299C7.76401 1.88566 8.84734 1.66699 10 1.66699C11.1527 1.66699 12.236 1.88566 13.25 2.32299C14.264 2.76033 15.146 3.35399 15.896 4.10399C16.646 4.85399 17.2397 5.73599 17.677 6.74999C18.1143 7.76399 18.333 8.84733 18.333 9.99999C18.333 11.1527 18.1143 12.236 17.677 13.25C17.2397 14.264 16.646 15.146 15.896 15.896C15.146 16.646 14.264 17.2397 13.25 17.677C12.236 18.1143 11.1527 18.333 10 18.333ZM10 16.583C11.8193 16.583 13.3713 15.9407 14.656 14.656C15.9407 13.3713 16.583 11.8193 16.583 9.99999C16.583 8.18066 15.9407 6.62866 14.656 5.34399C13.3713 4.05933 11.8193 3.41699 10 3.41699C8.18067 3.41699 6.62867 4.05933 5.34401 5.34399C4.05934 6.62866 3.41701 8.18066 3.41701 9.99999C3.41701 11.8193 4.05934 13.3713 5.34401 14.656C6.62867 15.9407 8.18067 16.583 10 16.583Z" fill="currentColor"/>'
    },
    "icon-information": {
      "viewBox": "0 0 16 17",
      "body": '<path d="M8 0.75C3.71875 0.75 0.25 4.25 0.25 8.5C0.25 12.7812 3.71875 16.25 8 16.25C12.25 16.25 15.75 12.7812 15.75 8.5C15.75 4.25 12.25 0.75 8 0.75ZM8 4.1875C8.71875 4.1875 9.3125 4.78125 9.3125 5.5C9.3125 6.25 8.71875 6.8125 8 6.8125C7.25 6.8125 6.6875 6.25 6.6875 5.5C6.6875 4.78125 7.25 4.1875 8 4.1875ZM9.75 12.125C9.75 12.3438 9.5625 12.5 9.375 12.5H6.625C6.40625 12.5 6.25 12.3438 6.25 12.125V11.375C6.25 11.1875 6.40625 11 6.625 11H7V9H6.625C6.40625 9 6.25 8.84375 6.25 8.625V7.875C6.25 7.6875 6.40625 7.5 6.625 7.5H8.625C8.8125 7.5 9 7.6875 9 7.875V11H9.375C9.5625 11 9.75 11.1875 9.75 11.375V12.125Z" fill="currentColor"/>'
    },
    "icon-settings": {
      "viewBox": "0 0 18 18",
      "body": '<path d="M6.646 17.333L6.333 14.708C6.19433 14.6247 6.04167 14.5347 5.875 14.438C5.70833 14.3407 5.55567 14.2503 5.417 14.167L2.979 15.188L0.625 11.125L2.708 9.54199C2.708 9.45866 2.708 9.36833 2.708 9.27099C2.708 9.17366 2.708 9.08333 2.708 8.99999C2.708 8.91666 2.708 8.82633 2.708 8.72899C2.708 8.63166 2.708 8.54133 2.708 8.45799L0.625 6.87499L2.979 2.81199L5.417 3.83299C5.55567 3.74966 5.70833 3.65966 5.875 3.56299C6.04167 3.46566 6.19433 3.37533 6.333 3.29199L6.646 0.666992H11.354L11.667 3.29199C11.8057 3.37533 11.9583 3.46566 12.125 3.56299C12.2917 3.65966 12.4443 3.74966 12.583 3.83299L15.021 2.81199L17.375 6.87499L15.312 8.45799C15.312 8.54133 15.312 8.63166 15.312 8.72899C15.312 8.82633 15.312 8.91666 15.312 8.99999C15.312 9.08333 15.312 9.17366 15.312 9.27099C15.312 9.36833 15.312 9.45866 15.312 9.54199L17.375 11.125L15.021 15.188L12.583 14.167C12.4443 14.2503 12.2917 14.3407 12.125 14.438C11.9583 14.5347 11.8057 14.6247 11.667 14.708L11.354 17.333H6.646ZM9 11.979C9.81933 11.979 10.5207 11.6873 11.104 11.104C11.6873 10.5207 11.979 9.81933 11.979 8.99999C11.979 8.18066 11.6873 7.47933 11.104 6.89599C10.5207 6.31266 9.81933 6.02099 9 6.02099C8.18067 6.02099 7.47933 6.31266 6.896 6.89599C6.31267 7.47933 6.021 8.18066 6.021 8.99999C6.021 9.81933 6.31267 10.5207 6.896 11.104C7.47933 11.6873 8.18067 11.979 9 11.979ZM9 10.229C8.66667 10.229 8.37833 10.1077 8.135 9.86499C7.89233 9.62166 7.771 9.33333 7.771 8.99999C7.771 8.66666 7.89233 8.37833 8.135 8.13499C8.37833 7.89233 8.66667 7.77099 9 7.77099C9.33333 7.77099 9.62167 7.89233 9.865 8.13499C10.1077 8.37833 10.229 8.66666 10.229 8.99999C10.229 9.33333 10.1077 9.62166 9.865 9.86499C9.62167 10.1077 9.33333 10.229 9 10.229ZM8.167 15.583H9.833L10.083 13.417C10.4863 13.3057 10.8753 13.139 11.25 12.917C11.6247 12.6943 11.965 12.4303 12.271 12.125L14.292 12.979L15.125 11.604L13.354 10.25C13.4233 10.0553 13.472 9.85399 13.5 9.64599C13.528 9.43733 13.542 9.22199 13.542 8.99999C13.542 8.80533 13.528 8.60733 13.5 8.40599C13.472 8.20466 13.4303 7.99299 13.375 7.77099L15.146 6.39599L14.312 5.02099L12.292 5.89599C11.972 5.57666 11.628 5.30933 11.26 5.09399C10.892 4.87866 10.5067 4.71533 10.104 4.60399L9.833 2.41699H8.167L7.896 4.60399C7.49333 4.71533 7.108 4.87866 6.74 5.09399C6.372 5.30933 6.035 5.56966 5.729 5.87499L3.708 5.02099L2.875 6.39599L4.625 7.74999C4.56967 7.97199 4.528 8.18733 4.5 8.39599C4.472 8.60399 4.458 8.80533 4.458 8.99999C4.458 9.19466 4.472 9.39266 4.5 9.59399C4.528 9.79533 4.56967 10.007 4.625 10.229L2.875 11.604L3.708 12.979L5.729 12.125C6.035 12.4303 6.372 12.6907 6.74 12.906C7.108 13.1213 7.49333 13.2847 7.896 13.396L8.167 15.583Z" fill="currentColor"/>'
    },
    "icon-spinner": {
      "viewBox": "0 0 16 16",
      "body": '<g clip-path="url(#clip0_2523_15837)"><path d="M7.99997 2.49775C8.68971 2.49775 9.24885 1.93861 9.24885 1.24888C9.24885 0.559141 8.68971 0 7.99997 0C7.31024 0 6.7511 0.559141 6.7511 1.24888C6.7511 1.93861 7.31024 2.49775 7.99997 2.49775Z" fill="currentColor"/><path opacity="0.6" d="M7.99997 16C8.68971 16 9.24885 15.4409 9.24885 14.7511C9.24885 14.0614 8.68971 13.5023 7.99997 13.5023C7.31024 13.5023 6.7511 14.0614 6.7511 14.7511C6.7511 15.4409 7.31024 16 7.99997 16Z" fill="currentColor"/><path opacity="0.3" d="M11.3756 3.39796C12.0653 3.39796 12.6245 2.83882 12.6245 2.14908C12.6245 1.45935 12.0653 0.900208 11.3756 0.900208C10.6858 0.900208 10.1267 1.45935 10.1267 2.14908C10.1267 2.83882 10.6858 3.39796 11.3756 3.39796Z" fill="currentColor"/><path opacity="0.7" d="M4.62448 15.0999C5.31422 15.0999 5.87336 14.5408 5.87336 13.851C5.87336 13.1613 5.31422 12.6022 4.62448 12.6022C3.93475 12.6022 3.37561 13.1613 3.37561 13.851C3.37561 14.5408 3.93475 15.0999 4.62448 15.0999Z" fill="currentColor"/><path opacity="0.95" d="M4.62448 3.39796C5.31422 3.39796 5.87336 2.83882 5.87336 2.14908C5.87336 1.45935 5.31422 0.900208 4.62448 0.900208C3.93475 0.900208 3.37561 1.45935 3.37561 2.14908C3.37561 2.83882 3.93475 3.39796 4.62448 3.39796Z" fill="currentColor"/><path opacity="0.5" d="M11.3756 15.0999C12.0653 15.0999 12.6245 14.5408 12.6245 13.851C12.6245 13.1613 12.0653 12.6022 11.3756 12.6022C10.6858 12.6022 10.1267 13.1613 10.1267 13.851C10.1267 14.5408 10.6858 15.0999 11.3756 15.0999Z" fill="currentColor"/><path opacity="0.85" d="M1.24887 9.24891C1.93861 9.24891 2.49775 8.68977 2.49775 8.00003C2.49775 7.3103 1.93861 6.75116 1.24887 6.75116C0.55914 6.75116 0 7.3103 0 8.00003C0 8.68977 0.55914 9.24891 1.24887 9.24891Z" fill="currentColor"/><path opacity="0.3" d="M14.7511 9.24891C15.4409 9.24891 16 8.68977 16 8.00003C16 7.3103 15.4409 6.75116 14.7511 6.75116C14.0614 6.75116 13.5023 7.3103 13.5023 8.00003C13.5023 8.68977 14.0614 9.24891 14.7511 9.24891Z" fill="currentColor"/><path opacity="0.9" d="M2.14908 5.87336C2.83882 5.87336 3.39796 5.31422 3.39796 4.62448C3.39796 3.93475 2.83882 3.37561 2.14908 3.37561C1.45935 3.37561 0.900208 3.93475 0.900208 4.62448C0.900208 5.31422 1.45935 5.87336 2.14908 5.87336Z" fill="currentColor"/><path opacity="0.4" d="M13.851 12.6245C14.5408 12.6245 15.0999 12.0653 15.0999 11.3756C15.0999 10.6858 14.5408 10.1267 13.851 10.1267C13.1613 10.1267 12.6022 10.6858 12.6022 11.3756C12.6022 12.0653 13.1613 12.6245 13.851 12.6245Z" fill="currentColor"/><path opacity="0.8" d="M2.14908 12.6245C2.83882 12.6245 3.39796 12.0653 3.39796 11.3756C3.39796 10.6858 2.83882 10.1267 2.14908 10.1267C1.45935 10.1267 0.900208 10.6858 0.900208 11.3756C0.900208 12.0653 1.45935 12.6245 2.14908 12.6245Z" fill="currentColor"/><path opacity="0.3" d="M13.851 5.87336C14.5408 5.87336 15.0999 5.31422 15.0999 4.62448C15.0999 3.93475 14.5408 3.37561 13.851 3.37561C13.1613 3.37561 12.6022 3.93475 12.6022 4.62448C12.6022 5.31422 13.1613 5.87336 13.851 5.87336Z" fill="currentColor"/></g><defs><clipPath id="clip0_2523_15837"><rect width="16" height="16" fill="currentColor"/></clipPath></defs>'
    },
    "image": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M15.8333 2.5H4.16667C3.25 2.5 2.5 3.25 2.5 4.16667V15.8333C2.5 16.75 3.25 17.5 4.16667 17.5H15.8333C16.75 17.5 17.5 16.75 17.5 15.8333V4.16667C17.5 3.25 16.75 2.5 15.8333 2.5ZM15.8333 15.8333H4.16667V12.0167L4.99167 12.8417L8.325 9.50833L11.6583 12.8417L14.9917 9.51667L15.8333 10.3583V15.8333ZM15.8333 7.99167L14.9917 7.15L11.6583 10.4917L8.325 7.15833L4.99167 10.4917L4.16667 9.65833V4.16667H15.8333V7.99167Z" fill="currentColor"/>'
    },
    "in-progress": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10 18.3334C8.84727 18.3334 7.76394 18.1145 6.75005 17.6767C5.73616 17.2395 4.85422 16.6459 4.10422 15.8959C3.35422 15.1459 2.76061 14.264 2.32338 13.2501C1.88561 12.2362 1.66672 11.1529 1.66672 10.0001C1.66672 8.8473 1.88561 7.76397 2.32338 6.75008C2.76061 5.73619 3.35422 4.85425 4.10422 4.10425C4.85422 3.35425 5.73616 2.76036 6.75005 2.32258C7.76394 1.88536 8.84727 1.66675 10 1.66675C11.1528 1.66675 12.2362 1.88536 13.25 2.32258C14.2639 2.76036 15.1459 3.35425 15.8959 4.10425C16.6459 4.85425 17.2395 5.73619 17.6767 6.75008C18.1145 7.76397 18.3334 8.8473 18.3334 10.0001C18.3334 11.1529 18.1145 12.2362 17.6767 13.2501C17.2395 14.264 16.6459 15.1459 15.8959 15.8959C15.1459 16.6459 14.2639 17.2395 13.25 17.6767C12.2362 18.1145 11.1528 18.3334 10 18.3334ZM5.83338 11.2501C6.18061 11.2501 6.47561 11.1284 6.71838 10.8851C6.96172 10.6423 7.08338 10.3473 7.08338 10.0001C7.08338 9.65286 6.96172 9.35786 6.71838 9.11508C6.47561 8.87175 6.18061 8.75008 5.83338 8.75008C5.48616 8.75008 5.19116 8.87175 4.94838 9.11508C4.70505 9.35786 4.58338 9.65286 4.58338 10.0001C4.58338 10.3473 4.70505 10.6423 4.94838 10.8851C5.19116 11.1284 5.48616 11.2501 5.83338 11.2501ZM10 11.2501C10.3473 11.2501 10.6423 11.1284 10.885 10.8851C11.1284 10.6423 11.25 10.3473 11.25 10.0001C11.25 9.65286 11.1284 9.35786 10.885 9.11508C10.6423 8.87175 10.3473 8.75008 10 8.75008C9.65283 8.75008 9.35783 8.87175 9.11505 9.11508C8.87172 9.35786 8.75005 9.65286 8.75005 10.0001C8.75005 10.3473 8.87172 10.6423 9.11505 10.8851C9.35783 11.1284 9.65283 11.2501 10 11.2501ZM14.1667 11.2501C14.5139 11.2501 14.8089 11.1284 15.0517 10.8851C15.295 10.6423 15.4167 10.3473 15.4167 10.0001C15.4167 9.65286 15.295 9.35786 15.0517 9.11508C14.8089 8.87175 14.5139 8.75008 14.1667 8.75008C13.8195 8.75008 13.5245 8.87175 13.2817 9.11508C13.0384 9.35786 12.9167 9.65286 12.9167 10.0001C12.9167 10.3473 13.0384 10.6423 13.2817 10.8851C13.5245 11.1284 13.8195 11.2501 14.1667 11.2501Z" fill="currentColor"/>'
    },
    "info-filled": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.25 14H10.75V9H9.25V14ZM10 7.5C10.208 7.5 10.385 7.427 10.531 7.281C10.677 7.135 10.75 6.958 10.75 6.75C10.75 6.542 10.677 6.365 10.531 6.219C10.385 6.073 10.208 6 10 6C9.792 6 9.615 6.073 9.469 6.219C9.323 6.365 9.25 6.542 9.25 6.75C9.25 6.958 9.323 7.135 9.469 7.281C9.615 7.427 9.792 7.5 10 7.5ZM10 18C8.90267 18 7.868 17.7917 6.896 17.375C5.924 16.9583 5.07333 16.3853 4.344 15.656C3.61467 14.9267 3.04167 14.076 2.625 13.104C2.20833 12.132 2 11.0973 2 10C2 8.88867 2.20833 7.85033 2.625 6.885C3.04167 5.92033 3.61467 5.07333 4.344 4.344C5.07333 3.61467 5.924 3.04167 6.896 2.625C7.868 2.20833 8.90267 2 10 2C11.1113 2 12.1497 2.20833 13.115 2.625C14.0797 3.04167 14.9267 3.61467 15.656 4.344C16.3853 5.07333 16.9583 5.92033 17.375 6.885C17.7917 7.85033 18 8.88867 18 10C18 11.0973 17.7917 12.132 17.375 13.104C16.9583 14.076 16.3853 14.9267 15.656 15.656C14.9267 16.3853 14.0797 16.9583 13.115 17.375C12.1497 17.7917 11.1113 18 10 18Z" fill="currentColor"/>'
    },
    "info": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.12501 14.167H10.875V9.16699H9.12501V14.167ZM10 7.47899C10.236 7.47899 10.441 7.39233 10.615 7.21899C10.7883 7.04499 10.875 6.83999 10.875 6.60399C10.875 6.36799 10.7883 6.16333 10.615 5.98999C10.441 5.81599 10.236 5.72899 10 5.72899C9.76401 5.72899 9.55901 5.81599 9.38501 5.98999C9.21167 6.16333 9.12501 6.36799 9.12501 6.60399C9.12501 6.83999 9.21167 7.04499 9.38501 7.21899C9.55901 7.39233 9.76401 7.47899 10 7.47899ZM10 18.333C8.84734 18.333 7.76401 18.1143 6.75001 17.677C5.73601 17.2397 4.85401 16.646 4.10401 15.896C3.35401 15.146 2.76034 14.264 2.32301 13.25C1.88567 12.236 1.66701 11.1527 1.66701 9.99999C1.66701 8.84733 1.88567 7.76399 2.32301 6.74999C2.76034 5.73599 3.35401 4.85399 4.10401 4.10399C4.85401 3.35399 5.73601 2.76033 6.75001 2.32299C7.76401 1.88566 8.84734 1.66699 10 1.66699C11.1527 1.66699 12.236 1.88566 13.25 2.32299C14.264 2.76033 15.146 3.35399 15.896 4.10399C16.646 4.85399 17.2397 5.73599 17.677 6.74999C18.1143 7.76399 18.333 8.84733 18.333 9.99999C18.333 11.1527 18.1143 12.236 17.677 13.25C17.2397 14.264 16.646 15.146 15.896 15.896C15.146 16.646 14.264 17.2397 13.25 17.677C12.236 18.1143 11.1527 18.333 10 18.333ZM10 16.583C11.8193 16.583 13.3713 15.9407 14.656 14.656C15.9407 13.3713 16.583 11.8193 16.583 9.99999C16.583 8.18066 15.9407 6.62866 14.656 5.34399C13.3713 4.05933 11.8193 3.41699 10 3.41699C8.18067 3.41699 6.62867 4.05933 5.34401 5.34399C4.05934 6.62866 3.41701 8.18066 3.41701 9.99999C3.41701 11.8193 4.05934 13.3713 5.34401 14.656C6.62867 15.9407 8.18067 16.583 10 16.583Z" fill="currentColor"/>'
    },
    "invite-link": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.125 14.167H5.833C4.68033 14.167 3.69767 13.7607 2.885 12.948C2.073 12.1353 1.667 11.1527 1.667 10C1.667 8.84734 2.073 7.86467 2.885 7.05201C3.69767 6.23934 4.68033 5.83301 5.833 5.83301H9.125V7.58301H5.833C5.139 7.58301 4.56267 7.81234 4.104 8.27101C3.646 8.72901 3.417 9.30534 3.417 10C3.417 10.6947 3.646 11.271 4.104 11.729C4.56267 12.1877 5.139 12.417 5.833 12.417H9.125V14.167ZM6.667 10.875V9.12501H13.333V10.875H6.667ZM18.333 10H16.583C16.583 9.30534 16.354 8.72901 15.896 8.27101C15.4373 7.81234 14.861 7.58301 14.167 7.58301H10.875V5.83301H14.167C15.3197 5.83301 16.3023 6.23934 17.115 7.05201C17.927 7.86467 18.333 8.84734 18.333 10ZM14.083 16.667V14.208H11.625V12.458H14.083V10H15.833V12.458H18.292V14.208H15.833V16.667H14.083Z" fill="currentColor"/>'
    },
    "italic": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M8.33333 4.16675V6.66675H10.175L7.325 13.3334H5V15.8334H11.6667V13.3334H9.825L12.675 6.66675H15V4.16675H8.33333Z" fill="currentColor"/>'
    },
    "last-page": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M6.062 14L5 12.938L7.937 10L5 7.062L6.062 6L10.062 10L6.062 14ZM12.562 14V6H14.062V14H12.562Z" fill="currentColor"/>'
    },
    "link": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.125 14.167H5.833C4.68033 14.167 3.69767 13.7607 2.885 12.948C2.073 12.1353 1.667 11.1527 1.667 10C1.667 8.84734 2.073 7.86467 2.885 7.05201C3.69767 6.23934 4.68033 5.83301 5.833 5.83301H9.125V7.58301H5.833C5.139 7.58301 4.56267 7.81234 4.104 8.27101C3.646 8.72901 3.417 9.30534 3.417 10C3.417 10.6947 3.646 11.271 4.104 11.729C4.56267 12.1877 5.139 12.417 5.833 12.417H9.125V14.167ZM6.667 10.875V9.12501H13.333V10.875H6.667ZM10.875 14.167V12.417H14.167C14.861 12.417 15.4373 12.1877 15.896 11.729C16.354 11.271 16.583 10.6947 16.583 10C16.583 9.30534 16.354 8.72901 15.896 8.27101C15.4373 7.81234 14.861 7.58301 14.167 7.58301H10.875V5.83301H14.167C15.3197 5.83301 16.3023 6.23934 17.115 7.05201C17.927 7.86467 18.333 8.84734 18.333 10C18.333 11.1527 17.927 12.1353 17.115 12.948C16.3023 13.7607 15.3197 14.167 14.167 14.167H10.875Z" fill="currentColor"/>'
    },
    "location": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.188 16.542V14.938C8.72933 14.938 8.34033 14.778 8.021 14.458C7.70167 14.1387 7.542 13.75 7.542 13.292V12.458L3.583 8.49999C3.52767 8.74999 3.486 8.99999 3.458 9.24999C3.43067 9.49999 3.417 9.74999 3.417 9.99999C3.417 11.6667 3.96533 13.1217 5.062 14.365C6.15933 15.6077 7.53467 16.3333 9.188 16.542ZM14.854 14.438C15.4233 13.8267 15.854 13.1423 16.146 12.385C16.4373 11.6283 16.583 10.8333 16.583 9.99999C16.583 8.65266 16.2117 7.42366 15.469 6.31299C14.7257 5.20166 13.729 4.40299 12.479 3.91699V4.22899C12.479 4.68766 12.3193 5.07666 12 5.39599C11.6807 5.71533 11.2917 5.87499 10.833 5.87499H9.188V7.52099C9.188 7.75699 9.108 7.95499 8.948 8.11499C8.788 8.27433 8.59 8.35399 8.354 8.35399H6.708V9.99999H11.646C11.882 9.99999 12.08 10.0763 12.24 10.229C12.3993 10.3817 12.479 10.576 12.479 10.812V13.292H13.292C13.6527 13.292 13.9753 13.396 14.26 13.604C14.5453 13.8127 14.7433 14.0907 14.854 14.438ZM10 18.333C8.84733 18.333 7.764 18.1143 6.75 17.677C5.736 17.2397 4.854 16.646 4.104 15.896C3.354 15.146 2.76033 14.264 2.323 13.25C1.88567 12.236 1.667 11.1527 1.667 9.99999C1.667 8.84733 1.88567 7.76399 2.323 6.74999C2.76033 5.73599 3.354 4.85399 4.104 4.10399C4.854 3.35399 5.736 2.76033 6.75 2.32299C7.764 1.88566 8.84733 1.66699 10 1.66699C11.1527 1.66699 12.236 1.88566 13.25 2.32299C14.264 2.76033 15.146 3.35399 15.896 4.10399C16.646 4.85399 17.2397 5.73599 17.677 6.74999C18.1143 7.76399 18.333 8.84733 18.333 9.99999C18.333 11.1527 18.1143 12.236 17.677 13.25C17.2397 14.264 16.646 15.146 15.896 15.896C15.146 16.646 14.264 17.2397 13.25 17.677C12.236 18.1143 11.1527 18.333 10 18.333Z" fill="currentColor"/>'
    },
    "mail": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M3.417 16.667C2.931 16.667 2.51767 16.4967 2.177 16.156C1.837 15.816 1.667 15.403 1.667 14.917V5.08301C1.667 4.59701 1.837 4.18401 2.177 3.84401C2.51767 3.50334 2.931 3.33301 3.417 3.33301H16.583C17.069 3.33301 17.4823 3.50334 17.823 3.84401C18.163 4.18401 18.333 4.59701 18.333 5.08301V14.917C18.333 15.403 18.163 15.816 17.823 16.156C17.4823 16.4967 17.069 16.667 16.583 16.667H3.417ZM10 10.938L3.417 6.83301V14.917H16.583V6.83301L10 10.938ZM10 9.20801L16.625 5.08301H3.396L10 9.20801ZM3.417 14.917C3.431 14.917 3.438 14.917 3.438 14.917H3.417Z" fill="currentColor"/>'
    },
    "marketing": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.771 15.021C8.42367 14.9517 7.28833 14.4343 6.365 13.469C5.441 12.5037 4.979 11.3473 4.979 9.99999C4.979 8.61133 5.46867 7.42733 6.448 6.44799C7.42733 5.46866 8.61133 4.97899 10 4.97899C11.3473 4.97899 12.5037 5.44099 13.469 6.36499C14.4343 7.28833 14.9517 8.42366 15.021 9.77099L13.167 9.20799C12.9723 8.49999 12.5867 7.90999 12.01 7.43799C11.434 6.96533 10.764 6.72899 10 6.72899C9.09733 6.72899 8.32633 7.04866 7.687 7.68799C7.04833 8.32666 6.729 9.09733 6.729 9.99999C6.729 10.764 6.965 11.434 7.437 12.01C7.90967 12.5867 8.5 12.9723 9.208 13.167L9.771 15.021ZM10 18.333C8.84733 18.333 7.764 18.1143 6.75 17.677C5.736 17.2397 4.854 16.646 4.104 15.896C3.354 15.146 2.76033 14.264 2.323 13.25C1.88567 12.236 1.667 11.1527 1.667 9.99999C1.667 8.84733 1.88567 7.76399 2.323 6.74999C2.76033 5.73599 3.354 4.85399 4.104 4.10399C4.854 3.35399 5.736 2.76033 6.75 2.32299C7.764 1.88566 8.84733 1.66699 10 1.66699C11.1527 1.66699 12.236 1.88566 13.25 2.32299C14.264 2.76033 15.146 3.35399 15.896 4.10399C16.646 4.85399 17.2397 5.73599 17.677 6.74999C18.1143 7.76399 18.333 8.84733 18.333 9.99999C18.333 10.1253 18.3297 10.2503 18.323 10.375C18.3157 10.4997 18.3053 10.6247 18.292 10.75L16.583 10.229V9.99999C16.583 8.16666 15.9443 6.61099 14.667 5.33299C13.389 4.05566 11.8333 3.41699 10 3.41699C8.16667 3.41699 6.611 4.05566 5.333 5.33299C4.05567 6.61099 3.417 8.16666 3.417 9.99999C3.417 11.8333 4.05567 13.389 5.333 14.667C6.611 15.9443 8.16667 16.583 10 16.583H10.229L10.75 18.292C10.6247 18.3053 10.4997 18.3157 10.375 18.323C10.2503 18.3297 10.1253 18.333 10 18.333ZM17.104 18.75L13.542 15.188L12.5 18.333L10 9.99999L18.333 12.5L15.188 13.542L18.75 17.104L17.104 18.75Z" fill="currentColor"/>'
    },
    "member": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10 9.97901C9.05533 9.97901 8.26367 9.65968 7.625 9.02101C6.98633 8.38168 6.667 7.59001 6.667 6.64601C6.667 5.70134 6.98633 4.90968 7.625 4.27101C8.26367 3.63168 9.05533 3.31201 10 3.31201C10.9447 3.31201 11.7363 3.63168 12.375 4.27101C13.0137 4.90968 13.333 5.70134 13.333 6.64601C13.333 7.59001 13.0137 8.38168 12.375 9.02101C11.7363 9.65968 10.9447 9.97901 10 9.97901ZM10 8.22901C10.4587 8.22901 10.837 8.07968 11.135 7.78101C11.4337 7.48234 11.583 7.10401 11.583 6.64601C11.583 6.18734 11.4337 5.80868 11.135 5.51001C10.837 5.21135 10.4587 5.06201 10 5.06201C9.54133 5.06201 9.163 5.21135 8.865 5.51001C8.56633 5.80868 8.417 6.18734 8.417 6.64601C8.417 7.10401 8.56633 7.48234 8.865 7.78101C9.163 8.07968 9.54133 8.22901 10 8.22901Z" fill="currentColor"/><path d="M3.271 14.271V16.667H11.2087L9.23458 14.917H5.021V14.271C5.021 14.1184 5.05566 13.9934 5.125 13.896C5.19433 13.7987 5.28466 13.7224 5.396 13.667C6.118 13.3337 6.875 13.0697 7.667 12.875C8.45833 12.6804 9.236 12.583 10 12.583C10.764 12.583 11.5417 12.677 12.333 12.865L12.75 11.156C11.8333 10.9407 10.9167 10.833 10 10.833C9.08333 10.833 8.17 10.9407 7.26 11.156C6.35066 11.3714 5.47233 11.6804 4.625 12.083C4.22233 12.2777 3.896 12.5694 3.646 12.958C3.396 13.3474 3.271 13.785 3.271 14.271Z" fill="currentColor"/><path d="M12.292 18.408L13.146 15.867L11 14.367H13.604L14.375 11.7L15.125 14.367H17.708L15.604 15.867L16.416 18.408L14.354 16.825L12.292 18.408Z" fill="currentColor"/>'
    },
    "membership": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M7.938 11.479L8.792 8.93799L6.646 7.43799H9.25L10.021 4.77099L10.771 7.43799H13.354L11.25 8.93799L12.062 11.479L10 9.89599L7.938 11.479ZM4.958 19.167V12.667C4.43067 12.0697 4.028 11.403 3.75 10.667C3.472 9.93033 3.333 9.15233 3.333 8.33299C3.333 6.48566 3.98233 4.91299 5.281 3.61499C6.57967 2.31633 8.15267 1.66699 10 1.66699C11.8473 1.66699 13.4203 2.31633 14.719 3.61499C16.0177 4.91299 16.667 6.48566 16.667 8.33299C16.667 9.15233 16.528 9.93033 16.25 10.667C15.972 11.403 15.5693 12.0697 15.042 12.667V19.167L10 17.479L4.958 19.167ZM10 13.25C11.3747 13.25 12.538 12.7743 13.49 11.823C14.4413 10.8717 14.917 9.70833 14.917 8.33299C14.917 6.95833 14.4413 5.79533 13.49 4.84399C12.538 3.89266 11.3747 3.41699 10 3.41699C8.62533 3.41699 7.462 3.89266 6.51 4.84399C5.55867 5.79533 5.083 6.95833 5.083 8.33299C5.083 9.70833 5.55867 10.8717 6.51 11.823C7.462 12.7743 8.62533 13.25 10 13.25ZM6.708 16.729L10 15.729L13.292 16.729V14.125C12.778 14.403 12.2467 14.6183 11.698 14.771C11.1493 14.9237 10.5833 15 10 15C9.41667 15 8.84733 14.9237 8.292 14.771C7.736 14.6183 7.208 14.403 6.708 14.125V16.729Z" fill="currentColor"/>'
    },
    "menu": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M1 16V14H19V16H1ZM1 11V9H19V11H1ZM1 6V4H19V6H1Z" fill="currentColor"/>'
    },
    "message": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M5 11.667H11.708V9.91699H5V11.667ZM5 9.20799H15V7.45799H5V9.20799ZM5 6.74999H15V4.99999H5V6.74999ZM1.667 18.333V3.41699C1.667 2.93099 1.837 2.51766 2.177 2.17699C2.51767 1.83699 2.931 1.66699 3.417 1.66699H16.583C17.069 1.66699 17.4823 1.83699 17.823 2.17699C18.163 2.51766 18.333 2.93099 18.333 3.41699V13.25C18.333 13.736 18.163 14.1493 17.823 14.49C17.4823 14.83 17.069 15 16.583 15H5L1.667 18.333ZM3.417 14.104L4.271 13.25H16.583V3.41699H3.417V14.104Z" fill="currentColor"/>'
    },
    "minus": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M4.167 10.833V9.08301H15.833V10.833H4.167Z" fill="currentColor"/>'
    },
    "more": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M4.958 11.625C4.514 11.625 4.132 11.4653 3.812 11.146C3.49267 10.8267 3.333 10.4447 3.333 10C3.333 9.55533 3.49267 9.17333 3.812 8.854C4.132 8.53467 4.514 8.375 4.958 8.375C5.40267 8.375 5.78467 8.53467 6.104 8.854C6.42333 9.17333 6.583 9.55533 6.583 10C6.583 10.4447 6.42333 10.8267 6.104 11.146C5.78467 11.4653 5.40267 11.625 4.958 11.625ZM10 11.625C9.55533 11.625 9.17333 11.4653 8.854 11.146C8.53467 10.8267 8.375 10.4447 8.375 10C8.375 9.55533 8.53467 9.17333 8.854 8.854C9.17333 8.53467 9.55533 8.375 10 8.375C10.4447 8.375 10.8267 8.53467 11.146 8.854C11.4653 9.17333 11.625 9.55533 11.625 10C11.625 10.4447 11.4653 10.8267 11.146 11.146C10.8267 11.4653 10.4447 11.625 10 11.625ZM15.042 11.625C14.5973 11.625 14.2153 11.4653 13.896 11.146C13.5767 10.8267 13.417 10.4447 13.417 10C13.417 9.55533 13.5767 9.17333 13.896 8.854C14.2153 8.53467 14.5973 8.375 15.042 8.375C15.486 8.375 15.868 8.53467 16.188 8.854C16.5073 9.17333 16.667 9.55533 16.667 10C16.667 10.4447 16.5073 10.8267 16.188 11.146C15.868 11.4653 15.486 11.625 15.042 11.625Z" fill="currentColor"/>'
    },
    "my-app": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10.021 16.979C10.257 16.979 10.4617 16.8923 10.635 16.719C10.809 16.545 10.896 16.34 10.896 16.104C10.896 15.868 10.809 15.6633 10.635 15.49C10.4617 15.316 10.257 15.229 10.021 15.229C9.785 15.229 9.58 15.316 9.406 15.49C9.23267 15.6633 9.146 15.868 9.146 16.104C9.146 16.34 9.23267 16.545 9.406 16.719C9.58 16.8923 9.785 16.979 10.021 16.979ZM5.917 13.042H14.083V5.20801H5.917V13.042ZM5.917 19.167C5.431 19.167 5.01767 18.9967 4.677 18.656C4.337 18.316 4.167 17.903 4.167 17.417V2.58301C4.167 2.09701 4.337 1.68401 4.677 1.34401C5.01767 1.00334 5.431 0.833008 5.917 0.833008H14.083C14.569 0.833008 14.9823 1.00334 15.323 1.34401C15.663 1.68401 15.833 2.09701 15.833 2.58301V17.417C15.833 17.903 15.663 18.316 15.323 18.656C14.9823 18.9967 14.569 19.167 14.083 19.167H5.917ZM5.917 3.45801H14.083V2.58301H5.917V3.45801ZM5.917 2.58301V3.45801V2.58301ZM5.917 14.792V17.417H14.083V14.792H5.917ZM5.917 17.417V14.792V17.417Z" fill="currentColor"/>'
    },
    "new-release": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M15.792 7.66701L14.708 5.31201L12.396 4.25001L14.708 3.18801L15.792 0.833008L16.875 3.18801L19.188 4.25001L16.875 5.31201L15.792 7.66701ZM15.792 19.167L14.708 16.833L12.396 15.771L14.708 14.708L15.792 12.354L16.875 14.708L19.188 15.771L16.875 16.833L15.792 19.167ZM7.625 16.833L5.521 12.146L0.833 10L5.521 7.87501L7.625 3.18801L9.75 7.87501L14.417 10L9.75 12.146L7.625 16.833ZM7.625 12.562L8.438 10.833L10.146 10L8.438 9.18801L7.625 7.45801L6.833 9.18801L5.104 10L6.833 10.833L7.625 12.562Z" fill="currentColor"/>'
    },
    "new-window": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M4.5 17C4.08333 17 3.72933 16.854 3.438 16.562C3.146 16.2707 3 15.9167 3 15.5V4.5C3 4.08333 3.146 3.72933 3.438 3.438C3.72933 3.146 4.08333 3 4.5 3H10V4.5H4.5V15.5H15.5V10H17V15.5C17 15.9167 16.854 16.2707 16.562 16.562C16.2707 16.854 15.9167 17 15.5 17H4.5ZM8.062 13L7 11.938L14.438 4.5H12V3H17V8H15.5V5.562L8.062 13Z" fill="currentColor"/>'
    },
    "no-show": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10 18.3334C8.84727 18.3334 7.76394 18.1145 6.75005 17.6767C5.73616 17.2395 4.85422 16.6459 4.10422 15.8959C3.35422 15.1459 2.76061 14.264 2.32338 13.2501C1.88561 12.2362 1.66672 11.1529 1.66672 10.0001C1.66672 8.8473 1.88561 7.76397 2.32338 6.75008C2.76061 5.73619 3.35422 4.85425 4.10422 4.10425C4.85422 3.35425 5.73616 2.76036 6.75005 2.32258C7.76394 1.88536 8.84727 1.66675 10 1.66675C11.1528 1.66675 12.2362 1.88536 13.25 2.32258C14.2639 2.76036 15.1459 3.35425 15.8959 4.10425C16.6459 4.85425 17.2395 5.73619 17.6767 6.75008C18.1145 7.76397 18.3334 8.8473 18.3334 10.0001C18.3334 11.1529 18.1145 12.2362 17.6767 13.2501C17.2395 14.264 16.6459 15.1459 15.8959 15.8959C15.1459 16.6459 14.2639 17.2395 13.25 17.6767C12.2362 18.1145 11.1528 18.3334 10 18.3334ZM5.83338 10.8334H14.1667V9.16675H5.83338V10.8334Z" fill="currentColor"/>'
    },
    "note": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M5.833 14.167H7.708L12.542 9.33301L10.667 7.45801L5.833 12.292V14.167ZM13.167 8.72901L14.042 7.79201C14.1253 7.69467 14.167 7.59401 14.167 7.49001C14.167 7.38534 14.1253 7.29134 14.042 7.20801L12.771 5.95801C12.7017 5.87467 12.6113 5.83301 12.5 5.83301C12.3887 5.83301 12.2913 5.87467 12.208 5.95801L11.271 6.83301L13.167 8.72901ZM4.25 17.5C3.764 17.5 3.35067 17.33 3.01 16.99C2.67 16.6493 2.5 16.236 2.5 15.75V4.25001C2.5 3.76401 2.67 3.35067 3.01 3.01001C3.35067 2.67001 3.764 2.50001 4.25 2.50001H7.667C7.83367 2.00001 8.132 1.59734 8.562 1.29201C8.99267 0.986008 9.472 0.833008 10 0.833008C10.528 0.833008 11.0073 0.986008 11.438 1.29201C11.868 1.59734 12.1663 2.00001 12.333 2.50001H15.75C16.236 2.50001 16.6493 2.67001 16.99 3.01001C17.33 3.35067 17.5 3.76401 17.5 4.25001V15.75C17.5 16.236 17.33 16.6493 16.99 16.99C16.6493 17.33 16.236 17.5 15.75 17.5H4.25ZM10 3.62501C10.1667 3.62501 10.3127 3.56267 10.438 3.43801C10.5627 3.31267 10.625 3.16667 10.625 3.00001C10.625 2.83334 10.5627 2.68734 10.438 2.56201C10.3127 2.43734 10.1667 2.37501 10 2.37501C9.83333 2.37501 9.68733 2.43734 9.562 2.56201C9.43733 2.68734 9.375 2.83334 9.375 3.00001C9.375 3.16667 9.43733 3.31267 9.562 3.43801C9.68733 3.56267 9.83333 3.62501 10 3.62501ZM4.25 15.75H15.75V4.25001H4.25V15.75ZM4.25 4.22901V15.75V4.22901Z" fill="currentColor"/>'
    },
    "notifications": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M3.33299 15.833V14.083H4.97899V8.35399C4.97899 7.21533 5.32633 6.19799 6.02099 5.30199C6.71499 4.40599 7.61066 3.81933 8.70799 3.54199V2.95799C8.70799 2.59733 8.83299 2.29199 9.08299 2.04199C9.33299 1.79199 9.63866 1.66699 9.99999 1.66699C10.3613 1.66699 10.667 1.79199 10.917 2.04199C11.167 2.29199 11.292 2.59733 11.292 2.95799V3.54199C12.3893 3.81933 13.2817 4.40599 13.969 5.30199C14.6563 6.19799 15 7.21533 15 8.35399V14.083H16.667V15.833H3.33299ZM9.99999 18.333C9.52799 18.333 9.13199 18.1733 8.81199 17.854C8.49266 17.5347 8.33299 17.139 8.33299 16.667H11.667C11.667 17.139 11.5073 17.5347 11.188 17.854C10.868 18.1733 10.472 18.333 9.99999 18.333ZM6.72899 14.083H13.25V8.35399C13.25 7.45133 12.934 6.68399 12.302 6.05199C11.67 5.41999 10.9027 5.10399 9.99999 5.10399C9.08333 5.10399 8.30899 5.41999 7.67699 6.05199C7.04499 6.68399 6.72899 7.45133 6.72899 8.35399V14.083Z" fill="currentColor"/>'
    },
    "numbered-list": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M2.08334 14.1667H3.75001V14.5834H2.91668V15.4167H3.75001V15.8334H2.08334V16.6667H4.58334V13.3334H2.08334V14.1667ZM2.91668 6.66671H3.75001V3.33337H2.08334V4.16671H2.91668V6.66671ZM2.08334 9.16671H3.58334L2.08334 10.9167V11.6667H4.58334V10.8334H3.08334L4.58334 9.08337V8.33337H2.08334V9.16671ZM6.25001 4.16671V5.83337H17.9167V4.16671H6.25001ZM6.25001 15.8334H17.9167V14.1667H6.25001V15.8334ZM6.25001 10.8334H17.9167V9.16671H6.25001V10.8334Z" fill="currentColor"/>'
    },
    "pay": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.146 17.5V15.75C8.368 15.5553 7.72567 15.2047 7.219 14.698C6.71167 14.1913 6.34 13.535 6.104 12.729L7.708 12.062C7.93067 12.7707 8.24333 13.2917 8.646 13.625C9.04867 13.9583 9.56267 14.125 10.188 14.125C10.7987 14.125 11.2777 13.9897 11.625 13.719C11.9723 13.4477 12.146 13.069 12.146 12.583C12.146 12.069 11.9757 11.6697 11.635 11.385C11.295 11.1003 10.625 10.7983 9.625 10.479C8.50033 10.1183 7.70167 9.688 7.229 9.188C6.757 8.688 6.521 8.028 6.521 7.208C6.521 6.444 6.771 5.77733 7.271 5.208C7.771 4.63867 8.396 4.30533 9.146 4.208V2.5H10.896V4.208C11.5207 4.31933 12.0657 4.56933 12.531 4.958C12.9963 5.34733 13.347 5.85433 13.583 6.479L11.958 7.188C11.778 6.72933 11.5387 6.389 11.24 6.167C10.9413 5.94433 10.5487 5.833 10.062 5.833C9.52067 5.833 9.08667 5.958 8.76 6.208C8.434 6.458 8.271 6.79133 8.271 7.208C8.271 7.62467 8.45833 7.96167 8.833 8.219C9.20833 8.47567 9.93067 8.76367 11 9.083C11.972 9.361 12.6977 9.78467 13.177 10.354C13.6563 10.9233 13.896 11.6527 13.896 12.542C13.896 13.4167 13.6357 14.1387 13.115 14.708C12.5937 15.2773 11.854 15.6387 10.896 15.792V17.5H9.146Z" fill="currentColor"/>'
    },
    "payment-other": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.229 15.812H10.75V14.75C11.5833 14.5973 12.2083 14.2953 12.625 13.844C13.0417 13.3927 13.25 12.8127 13.25 12.104C13.25 11.396 13.052 10.8127 12.656 10.354C12.26 9.89599 11.6387 9.52099 10.792 9.22899C9.93067 8.93766 9.354 8.68066 9.062 8.45799C8.77067 8.23599 8.625 7.96533 8.625 7.64599C8.625 7.29866 8.75 7.03133 9 6.84399C9.25 6.65599 9.59733 6.56199 10.042 6.56199C10.4307 6.56199 10.757 6.65599 11.021 6.84399C11.285 7.03133 11.4723 7.31266 11.583 7.68799L12.979 7.14599C12.8403 6.64599 12.5627 6.21533 12.146 5.85399C11.7293 5.49266 11.278 5.28433 10.792 5.22899V4.18799H9.271V5.22899C8.60433 5.38166 8.06967 5.67699 7.667 6.11499C7.26367 6.55233 7.062 7.06266 7.062 7.64599C7.062 8.27066 7.253 8.79833 7.635 9.22899C8.017 9.65966 8.618 10.0207 9.438 10.312C10.354 10.632 10.965 10.917 11.271 11.167C11.5763 11.417 11.729 11.7293 11.729 12.104C11.729 12.4933 11.5833 12.8023 11.292 13.031C11 13.2603 10.611 13.375 10.125 13.375C9.653 13.375 9.25033 13.2293 8.917 12.938C8.58367 12.646 8.34067 12.2293 8.188 11.688L6.75 12.229C6.94467 12.9237 7.24667 13.4723 7.656 13.875C8.066 14.2777 8.59033 14.5553 9.229 14.708V15.812ZM10 18.333C8.84733 18.333 7.764 18.1143 6.75 17.677C5.736 17.2397 4.854 16.646 4.104 15.896C3.354 15.146 2.76033 14.264 2.323 13.25C1.88567 12.236 1.667 11.1527 1.667 9.99999C1.667 8.84733 1.88567 7.76399 2.323 6.74999C2.76033 5.73599 3.354 4.85399 4.104 4.10399C4.854 3.35399 5.736 2.76033 6.75 2.32299C7.764 1.88566 8.84733 1.66699 10 1.66699C11.1527 1.66699 12.236 1.88566 13.25 2.32299C14.264 2.76033 15.146 3.35399 15.896 4.10399C16.646 4.85399 17.2397 5.73599 17.677 6.74999C18.1143 7.76399 18.333 8.84733 18.333 9.99999C18.333 11.1527 18.1143 12.236 17.677 13.25C17.2397 14.264 16.646 15.146 15.896 15.896C15.146 16.646 14.264 17.2397 13.25 17.677C12.236 18.1143 11.1527 18.333 10 18.333ZM10 16.583C11.8193 16.583 13.3713 15.9407 14.656 14.656C15.9407 13.3713 16.583 11.8193 16.583 9.99999C16.583 8.18066 15.9407 6.62866 14.656 5.34399C13.3713 4.05933 11.8193 3.41699 10 3.41699C8.18067 3.41699 6.62867 4.05933 5.344 5.34399C4.05933 6.62866 3.417 8.18066 3.417 9.99999C3.417 11.8193 4.05933 13.3713 5.344 14.656C6.62867 15.9407 8.18067 16.583 10 16.583Z" fill="currentColor"/>'
    },
    "peek-capital": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.97512 7.09243C10.3712 7.50549 10.8553 7.71202 11.4273 7.71202C11.9992 7.71202 12.483 7.50549 12.8785 7.09243C13.2741 6.67877 13.4718 6.17328 13.4718 5.57596C13.4718 4.97865 13.2741 4.47346 12.8785 4.0604C12.483 3.64735 11.9992 3.44082 11.4273 3.44082C10.8553 3.44082 10.3712 3.64735 9.97512 4.0604C9.57959 4.47346 9.38183 4.97865 9.38183 5.57596C9.38183 6.17328 9.57959 6.67877 9.97512 7.09243Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M5.46623 9.51312C5.77646 9.83771 6.13226 10 6.53364 10H16.4664C16.8677 10 17.2235 9.83771 17.5338 9.51312C17.8446 9.18914 18 8.81757 18 8.39841V2.60159C18 2.18243 17.8446 1.81086 17.5338 1.48688C17.2235 1.16229 16.8677 1 16.4664 1H6.53364C6.13226 1 5.77646 1.16229 5.46623 1.48688C5.15541 1.81086 5 2.18243 5 2.60159V8.39841C5 8.81757 5.15541 9.18914 5.46623 9.51312ZM15.0055 8.39841H7.99454C7.99454 7.97865 7.8514 7.61959 7.56512 7.32123C7.27943 7.02227 6.9356 6.87279 6.53364 6.87279V4.12721C6.9356 4.12721 7.27943 3.97773 7.56512 3.67877C7.8514 3.38042 7.99454 3.02135 7.99454 2.60159H15.0055C15.0055 3.02135 15.1486 3.38042 15.4349 3.67877C15.7206 3.97773 16.0644 4.12721 16.4664 4.12721V6.87279C16.0644 6.87279 15.7206 7.02227 15.4349 7.32123C15.1486 7.61959 15.0055 7.97865 15.0055 8.39841Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.1168 17.6955L10.6672 19L16 17.2835V16.5451C16 15.9501 15.7973 15.4521 15.392 15.0511C14.9861 14.6506 14.4944 14.4503 13.9168 14.4503H12.7C12.7 14.0499 12.5861 13.6722 12.3584 13.3173C12.1307 12.9624 11.828 12.7108 11.4504 12.5624L7.3672 11H2V18.7083H6.1168V17.6955ZM4.7168 17.2662H3.4V12.4421H4.7168V17.2662ZM14.5336 16.2361L10.6336 17.5068L6.1168 16.2361V12.4421H7.1168L10.9504 13.8842C11.0501 13.9183 11.1363 13.9897 11.2088 14.0985C11.2808 14.2073 11.3168 14.3245 11.3168 14.4503C10.8277 14.4503 10.4779 14.4391 10.2672 14.4166C10.056 14.3935 9.8616 14.3534 9.684 14.2963L8.2504 13.7985L7.8168 15.1887L9.1832 15.6691C9.37253 15.7378 9.59493 15.7922 9.8504 15.8323C10.1059 15.8724 10.4003 15.8925 10.7336 15.8925H13.9168C14.0501 15.8925 14.1725 15.924 14.284 15.9872C14.3949 16.0499 14.4781 16.1328 14.5336 16.2361Z" fill="currentColor"/>'
    },
    "percent": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M6.292 9.25001C5.472 9.25001 4.774 8.96167 4.198 8.38501C3.62133 7.80901 3.333 7.11134 3.333 6.29201C3.333 5.47201 3.62133 4.77401 4.198 4.19801C4.774 3.62134 5.472 3.33301 6.292 3.33301C7.11133 3.33301 7.809 3.62134 8.385 4.19801C8.96167 4.77401 9.25 5.47201 9.25 6.29201C9.25 7.11134 8.96167 7.80901 8.385 8.38501C7.809 8.96167 7.11133 9.25001 6.292 9.25001ZM6.292 7.50001C6.62533 7.50001 6.91 7.38201 7.146 7.14601C7.382 6.91001 7.5 6.62534 7.5 6.29201C7.5 5.95867 7.382 5.67401 7.146 5.43801C6.91 5.20134 6.62533 5.08301 6.292 5.08301C5.95867 5.08301 5.674 5.20134 5.438 5.43801C5.20133 5.67401 5.083 5.95867 5.083 6.29201C5.083 6.62534 5.20133 6.91001 5.438 7.14601C5.674 7.38201 5.95867 7.50001 6.292 7.50001ZM13.708 16.667C12.8887 16.667 12.191 16.3787 11.615 15.802C11.0383 15.226 10.75 14.528 10.75 13.708C10.75 12.8887 11.0383 12.191 11.615 11.615C12.191 11.0383 12.8887 10.75 13.708 10.75C14.528 10.75 15.226 11.0383 15.802 11.615C16.3787 12.191 16.667 12.8887 16.667 13.708C16.667 14.528 16.3787 15.226 15.802 15.802C15.226 16.3787 14.528 16.667 13.708 16.667ZM13.708 14.917C14.0413 14.917 14.326 14.7987 14.562 14.562C14.7987 14.326 14.917 14.0413 14.917 13.708C14.917 13.3747 14.7987 13.09 14.562 12.854C14.326 12.618 14.0413 12.5 13.708 12.5C13.3747 12.5 13.09 12.618 12.854 12.854C12.618 13.09 12.5 13.3747 12.5 13.708C12.5 14.0413 12.618 14.326 12.854 14.562C13.09 14.7987 13.3747 14.917 13.708 14.917ZM4.562 16.667L3.333 15.438L15.438 3.33301L16.667 4.56201L4.562 16.667Z" fill="currentColor"/>'
    },
    "phone": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M16.646 17.5C14.8267 17.5 13.0663 17.104 11.365 16.312C9.663 15.5207 8.156 14.4687 6.844 13.156C5.53133 11.844 4.47933 10.337 3.688 8.635C2.896 6.93367 2.5 5.17333 2.5 3.354C2.5 3.118 2.58667 2.91667 2.76 2.75C2.934 2.58333 3.139 2.5 3.375 2.5H6.833C7.02767 2.5 7.198 2.56267 7.344 2.688C7.48933 2.81267 7.576 2.97233 7.604 3.167L8.188 6.146C8.21533 6.32667 8.20833 6.49333 8.167 6.646C8.125 6.79867 8.04867 6.93067 7.938 7.042L5.917 9.104C6.44433 10.0487 7.142 10.9583 8.01 11.833C8.878 12.7083 9.833 13.4583 10.875 14.083L12.833 12.083C12.9723 11.9443 13.1253 11.8507 13.292 11.802C13.4587 11.7533 13.639 11.743 13.833 11.771L16.833 12.396C17.0277 12.424 17.1873 12.5107 17.312 12.656C17.4373 12.802 17.5 12.9723 17.5 13.167V16.625C17.5 16.861 17.4167 17.066 17.25 17.24C17.0833 17.4133 16.882 17.5 16.646 17.5ZM5.083 7.438L6.396 6.125L6.042 4.25H4.292C4.36133 4.80533 4.455 5.34367 4.573 5.865C4.691 6.38567 4.861 6.91 5.083 7.438ZM15.75 15.708V13.958L13.833 13.562L12.521 14.917C13.0623 15.125 13.597 15.2917 14.125 15.417C14.653 15.5417 15.1947 15.6387 15.75 15.708Z" fill="currentColor"/>'
    },
    "pin": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M13 10L15 12V13.5H10.75V18.25L10 19L9.25 18.25V13.5H5V12L7 10V4.5H6V3H14V4.5H13V10ZM7.125 12H12.875L11.5 10.625V4.5H8.5V10.625L7.125 12Z" fill="currentColor"/>'
    },
    "plus": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.12499 15.833V10.875H4.16699V9.12499H9.12499V4.16699H10.875V9.12499H15.833V10.875H10.875V15.833H9.12499Z" fill="currentColor"/>'
    },
    "print": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M13.25 6.708V4.25H6.75V6.708H5V2.5H15V6.708H13.25ZM3.417 8.458C3.417 8.458 3.50367 8.458 3.677 8.458C3.851 8.458 4.06267 8.458 4.312 8.458H15.771C16.021 8.458 16.219 8.458 16.365 8.458C16.5103 8.458 16.583 8.458 16.583 8.458H3.417ZM15 10.646C15.236 10.646 15.441 10.559 15.615 10.385C15.7883 10.2117 15.875 10.007 15.875 9.771C15.875 9.535 15.7883 9.33 15.615 9.156C15.441 8.98267 15.236 8.896 15 8.896C14.764 8.896 14.559 8.98267 14.385 9.156C14.2117 9.33 14.125 9.535 14.125 9.771C14.125 10.007 14.2117 10.2117 14.385 10.385C14.559 10.559 14.764 10.646 15 10.646ZM13.25 15.75V12.833H6.75V15.75H13.25ZM15 17.5H5V14.438H1.667V9.271C1.667 8.56233 1.917 7.958 2.417 7.458C2.917 6.958 3.521 6.708 4.229 6.708H15.771C16.479 6.708 17.083 6.958 17.583 7.458C18.083 7.958 18.333 8.56233 18.333 9.271V14.438H15V17.5ZM16.583 12.688V9.354C16.583 9.104 16.5103 8.89233 16.365 8.719C16.219 8.545 16.021 8.458 15.771 8.458H4.312C4.06267 8.458 3.851 8.545 3.677 8.719C3.50367 8.89233 3.417 9.104 3.417 9.354V12.688H5V11.083H15V12.688H16.583Z" fill="currentColor"/>'
    },
    "products": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M3.417 16.667C2.931 16.667 2.51767 16.4967 2.177 16.156C1.837 15.816 1.667 15.403 1.667 14.917V11.562C2.111 11.59 2.49633 11.4477 2.823 11.135C3.149 10.823 3.312 10.4447 3.312 10C3.312 9.55534 3.149 9.18034 2.823 8.87501C2.49633 8.56967 2.111 8.43067 1.667 8.45801V5.08301C1.667 4.59701 1.837 4.18401 2.177 3.84401C2.51767 3.50334 2.931 3.33301 3.417 3.33301H16.583C17.069 3.33301 17.4823 3.50334 17.823 3.84401C18.163 4.18401 18.333 4.59701 18.333 5.08301V8.45801C17.889 8.43067 17.5037 8.56967 17.177 8.87501C16.851 9.18034 16.688 9.55534 16.688 10C16.688 10.4447 16.851 10.823 17.177 11.135C17.5037 11.4477 17.889 11.59 18.333 11.562V14.917C18.333 15.403 18.163 15.816 17.823 16.156C17.4823 16.4967 17.069 16.667 16.583 16.667H3.417ZM3.417 14.917H16.583V12.833C16.083 12.5277 15.6837 12.1283 15.385 11.635C15.087 11.1423 14.938 10.5973 14.938 10C14.938 9.40267 15.087 8.85767 15.385 8.36501C15.6837 7.87167 16.083 7.47234 16.583 7.16701V5.08301H3.417V7.16701C3.917 7.47234 4.31633 7.87167 4.615 8.36501C4.913 8.85767 5.062 9.40267 5.062 10C5.062 10.5973 4.913 11.1423 4.615 11.635C4.31633 12.1283 3.917 12.5277 3.417 12.833V14.917ZM10.021 14.167C10.257 14.167 10.4617 14.08 10.635 13.906C10.809 13.7327 10.896 13.528 10.896 13.292C10.896 13.056 10.809 12.851 10.635 12.677C10.4617 12.5037 10.257 12.417 10.021 12.417C9.785 12.417 9.58 12.5037 9.406 12.677C9.23267 12.851 9.146 13.056 9.146 13.292C9.146 13.528 9.23267 13.7327 9.406 13.906C9.58 14.08 9.785 14.167 10.021 14.167ZM10.021 10.875C10.257 10.875 10.4617 10.7883 10.635 10.615C10.809 10.441 10.896 10.236 10.896 10C10.896 9.76401 10.809 9.55901 10.635 9.38501C10.4617 9.21167 10.257 9.12501 10.021 9.12501C9.785 9.12501 9.58 9.21167 9.406 9.38501C9.23267 9.55901 9.146 9.76401 9.146 10C9.146 10.236 9.23267 10.441 9.406 10.615C9.58 10.7883 9.785 10.875 10.021 10.875ZM10.021 7.58301C10.257 7.58301 10.4617 7.49634 10.635 7.32301C10.809 7.14901 10.896 6.94401 10.896 6.70801C10.896 6.47201 10.809 6.26734 10.635 6.09401C10.4617 5.92001 10.257 5.83301 10.021 5.83301C9.785 5.83301 9.58 5.92001 9.406 6.09401C9.23267 6.26734 9.146 6.47201 9.146 6.70801C9.146 6.94401 9.23267 7.14901 9.406 7.32301C9.58 7.49634 9.785 7.58301 10.021 7.58301Z" fill="currentColor"/>'
    },
    "promo-code": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10.8444 14.5729L13.7611 11.6563C13.9138 11.5035 14.0355 11.3229 14.1261 11.1146C14.2161 10.9063 14.2611 10.684 14.2611 10.4479C14.2611 9.9757 14.0944 9.57292 13.7611 9.23958C13.4277 8.90625 13.025 8.73958 12.5527 8.73958C12.2888 8.73958 12.0286 8.81597 11.7719 8.96875C11.5147 9.12153 11.2055 9.37847 10.8444 9.73958C10.4277 9.35069 10.1013 9.08681 9.86523 8.94792C9.62912 8.80903 9.38607 8.73958 9.13607 8.73958C8.66385 8.73958 8.26107 8.90625 7.92773 9.23958C7.5944 9.57292 7.42773 9.9757 7.42773 10.4479C7.42773 10.684 7.47273 10.9063 7.56273 11.1146C7.65329 11.3229 7.77496 11.5035 7.92773 11.6563L10.8444 14.5729ZM10.7194 18.3229C10.4833 18.3229 10.2611 18.2776 10.0527 18.1871C9.8444 18.0971 9.66385 17.9757 9.51107 17.8229L2.17773 10.4896C2.02496 10.3368 1.90357 10.1563 1.81357 9.94792C1.72301 9.73958 1.67773 9.51736 1.67773 9.28125V3.32292C1.67773 2.86458 1.84107 2.47208 2.16773 2.14542C2.49385 1.81931 2.88607 1.65625 3.3444 1.65625H9.30273C9.53885 1.65625 9.76107 1.70125 9.9694 1.79125C10.1777 1.88181 10.3583 2.00347 10.5111 2.15625L17.8444 9.51042C18.1638 9.82986 18.3236 10.2221 18.3236 10.6871C18.3236 11.1526 18.1638 11.5451 17.8444 11.8646L11.8861 17.8229C11.7333 17.9757 11.5563 18.0971 11.3552 18.1871C11.1536 18.2776 10.9416 18.3229 10.7194 18.3229ZM10.6986 16.6563L16.6569 10.6979L9.30273 3.32292H3.3444V9.28125L10.6986 16.6563ZM5.42773 6.65625C5.77496 6.65625 6.06996 6.53458 6.31273 6.29125C6.55607 6.04847 6.67773 5.75347 6.67773 5.40625C6.67773 5.05903 6.55607 4.76403 6.31273 4.52125C6.06996 4.27792 5.77496 4.15625 5.42773 4.15625C5.08051 4.15625 4.78551 4.27792 4.54273 4.52125C4.2994 4.76403 4.17773 5.05903 4.17773 5.40625C4.17773 5.75347 4.2994 6.04847 4.54273 6.29125C4.78551 6.53458 5.08051 6.65625 5.42773 6.65625Z" fill="currentColor"/>'
    },
    "promotion": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M1.667 18.333L5.917 6.5L13.5 14.083L1.667 18.333ZM4.562 15.438L10.333 13.396L6.604 9.688L4.562 15.438ZM12.25 10.417L11.333 9.5L15.938 4.896C16.382 4.45133 16.913 4.23266 17.531 4.24C18.149 4.24666 18.6803 4.47233 19.125 4.917L19.625 5.417L18.729 6.312L18.208 5.792C18.014 5.59733 17.7883 5.50333 17.531 5.51C17.2743 5.51733 17.0487 5.618 16.854 5.812L12.25 10.417ZM8.917 7.062L8 6.146L8.5 5.646C8.68067 5.46533 8.771 5.257 8.771 5.021C8.771 4.785 8.68067 4.57666 8.5 4.396L7.958 3.854L8.854 2.958L9.375 3.479C9.81967 3.90966 10.0487 4.42 10.062 5.01C10.076 5.60066 9.861 6.118 9.417 6.562L8.917 7.062ZM10.562 8.729L9.646 7.812L12.625 4.833C12.8197 4.639 12.917 4.41333 12.917 4.156C12.917 3.89933 12.8197 3.67366 12.625 3.479L11.312 2.167L12.208 1.271L13.521 2.583C13.9657 3.02766 14.188 3.559 14.188 4.177C14.188 4.795 13.9657 5.32633 13.521 5.771L10.562 8.729ZM13.917 12.062L13 11.146L14.396 9.75C14.84 9.30533 15.3607 9.07966 15.958 9.073C16.5553 9.06566 17.0763 9.28433 17.521 9.729L18.938 11.146L18.021 12.062L16.625 10.667C16.4443 10.4863 16.2257 10.396 15.969 10.396C15.7117 10.396 15.4927 10.4863 15.312 10.667L13.917 12.062Z" fill="currentColor"/>'
    },
    "qr-code": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M2.5 9.125V2.5H9.125V9.125H2.5ZM4.25 7.375H7.375V4.25H4.25V7.375ZM2.5 17.5V10.875H9.125V17.5H2.5ZM4.25 15.75H7.417V12.625H4.25V15.75ZM10.875 9.125V2.5H17.5V9.125H10.875ZM12.625 7.375H15.75V4.25H12.625V7.375ZM15.854 17.5V15.833H17.5V17.5H15.854ZM10.875 12.521V10.875H12.542V12.521H10.875ZM12.542 14.167V12.521H14.208V14.167H12.542ZM10.875 15.833V14.167H12.542V15.833H10.875ZM12.542 17.5V15.833H14.208V17.5H12.542ZM14.208 15.833V14.167H15.854V15.833H14.208ZM14.208 12.521V10.875H15.854V12.521H14.208ZM15.854 14.167V12.521H17.5V14.167H15.854Z" fill="currentColor"/>'
    },
    "refresh": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M4.20799 6.50001L7.58299 9.87501L6.35399 11.104L5.08299 9.83301V10C5.08299 11.3473 5.56566 12.5037 6.53099 13.469C7.49633 14.4343 8.65266 14.917 9.99999 14.917C10.3613 14.917 10.726 14.8753 11.094 14.792C11.462 14.7087 11.8057 14.5837 12.125 14.417L13.438 15.729C12.91 16.0483 12.3507 16.2847 11.76 16.438C11.17 16.5907 10.5833 16.667 9.99999 16.667C8.15266 16.667 6.57966 16.0177 5.28099 14.719C3.98233 13.4203 3.33299 11.8473 3.33299 10V9.83301L2.06199 11.104L0.832993 9.87501L4.20799 6.50001ZM15.792 13.479L12.417 10.104L13.646 8.87501L14.917 10.146V10C14.917 8.65267 14.4343 7.49634 13.469 6.53101C12.5037 5.56567 11.3473 5.08301 9.99999 5.08301C9.63866 5.08301 9.27766 5.12467 8.91699 5.20801C8.55566 5.29134 8.21533 5.40934 7.89599 5.56201L6.58299 4.25001C7.11099 3.94467 7.66666 3.71567 8.24999 3.56301C8.83333 3.40967 9.41666 3.33301 9.99999 3.33301C11.8473 3.33301 13.4203 3.98234 14.719 5.28101C16.0177 6.57967 16.667 8.15267 16.667 10V10.146L17.938 8.87501L19.167 10.104L15.792 13.479Z" fill="currentColor"/>'
    },
    "refund": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.312 15.5V14.5C9.02067 14.4307 8.61467 14.2433 8.094 13.938C7.57267 13.632 7.18733 13.0417 6.938 12.167L8.25 11.625C8.278 11.7083 8.417 12.0033 8.667 12.51C8.917 13.0174 9.403 13.271 10.125 13.271C10.4863 13.271 10.837 13.1703 11.177 12.969C11.5177 12.7677 11.688 12.4447 11.688 12C11.688 11.6253 11.5453 11.3233 11.26 11.094C10.9753 10.8647 10.5207 10.639 9.896 10.417C9.46533 10.2643 8.92 10.0177 8.26 9.67702C7.60067 9.33702 7.271 8.71535 7.271 7.81202C7.271 7.77068 7.36133 7.43068 7.542 6.79202C7.722 6.15268 8.319 5.72202 9.333 5.50002V4.50002H10.708V5.47902C11.444 5.60435 11.9613 5.88235 12.26 6.31302C12.5587 6.74302 12.736 7.04835 12.792 7.22902L11.562 7.75002C11.5207 7.61135 11.389 7.40302 11.167 7.12502C10.9443 6.84702 10.576 6.70802 10.062 6.70802C9.78467 6.70802 9.47933 6.78802 9.146 6.94802C8.81267 7.10802 8.646 7.38935 8.646 7.79202C8.646 8.16668 8.816 8.45135 9.156 8.64602C9.49667 8.84068 10.021 9.05602 10.729 9.29202C11.6597 9.61135 12.2813 10.0037 12.594 10.469C12.906 10.9343 13.062 11.4447 13.062 12C13.062 12.514 12.958 12.9307 12.75 13.25C12.542 13.5693 12.3023 13.8227 12.031 14.01C11.7603 14.198 11.4967 14.3267 11.24 14.396C10.9827 14.4653 10.7987 14.507 10.688 14.521V15.5H9.312Z" fill="currentColor"/><path d="M10 2.6C14.0869 2.6 17.4 5.91309 17.4 10C17.4 14.0869 14.0869 17.4 10 17.4C6.25224 17.4 3.1552 14.614 2.667 11H1.05493C1.55238 15.5 5.36745 19 10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1C6.93334 1 4.22492 2.53378 2.6 4.87608V2.79998H1V7.59998H5.8V5.99998H3.7732C5.08983 3.95462 7.38672 2.6 10 2.6Z" fill="currentColor"/>'
    },
    "rentals": {
      "viewBox": "0 0 20 20",
      "body": '<path fill-rule="evenodd" clip-rule="evenodd" d="M4.906 5.11501C5.39933 5.59367 5.99333 5.83301 6.688 5.83301C7.20133 5.83301 7.67 5.68734 8.094 5.39601C8.51733 5.10401 8.82633 4.71501 9.021 4.22901H13.271V5.85401H15.021V4.22901H15.833V2.47901H9.021C8.82633 1.99301 8.52067 1.59734 8.104 1.29201C7.68733 0.986008 7.21533 0.833008 6.688 0.833008C5.97933 0.833008 5.382 1.07634 4.896 1.56301C4.41 2.04901 4.167 2.64601 4.167 3.35401C4.167 4.04867 4.41333 4.63567 4.906 5.11501ZM7.219 3.87501C7.073 4.01367 6.896 4.08301 6.688 4.08301C6.47933 4.08301 6.302 4.01367 6.156 3.87501C6.01067 3.73634 5.938 3.56267 5.938 3.35401C5.938 3.14601 6.01067 2.96567 6.156 2.81301C6.302 2.65967 6.47933 2.58301 6.688 2.58301C6.896 2.58301 7.073 2.65967 7.219 2.81301C7.365 2.96567 7.438 3.14601 7.438 3.35401C7.438 3.56267 7.365 3.73634 7.219 3.87501Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6 16.812L11.5 18.5L18 16.5V16C18 15.1667 17.7083 14.4583 17.125 13.875C16.5417 13.2917 15.8333 13 15 13H14C14 12.5 13.8783 12.0833 13.635 11.75C13.3923 11.4167 13.0417 11.1667 12.583 11L7 9H1V18H6V16.812ZM4.5 16.5H2.5V10.5H4.5V16.5ZM16.396 15.438L11.5 16.938L6 15.25V10.5H6.75L12.083 12.417C12.2083 12.4583 12.309 12.5277 12.385 12.625C12.4617 12.7223 12.5 12.8473 12.5 13C11.5693 13 10.8783 12.9793 10.427 12.938C9.97567 12.896 9.59033 12.8127 9.271 12.688L8.271 12.292L7.75 13.708L8.833 14.146C9.15233 14.2707 9.54833 14.361 10.021 14.417C10.493 14.4723 11.097 14.5 11.833 14.5H15C15.292 14.5 15.5627 14.5833 15.812 14.75C16.0627 14.9167 16.2573 15.146 16.396 15.438Z" fill="currentColor"/>'
    },
    "reports": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M5.812 14.167H7.562V8.292H5.812V14.167ZM9.125 14.167H10.875V5.833H9.125V14.167ZM12.438 14.167H14.188V10.771H12.438V14.167ZM4.25 17.5C3.764 17.5 3.35067 17.33 3.01 16.99C2.67 16.6493 2.5 16.236 2.5 15.75V4.25C2.5 3.764 2.67 3.35067 3.01 3.01C3.35067 2.67 3.764 2.5 4.25 2.5H15.75C16.236 2.5 16.6493 2.67 16.99 3.01C17.33 3.35067 17.5 3.764 17.5 4.25V15.75C17.5 16.236 17.33 16.6493 16.99 16.99C16.6493 17.33 16.236 17.5 15.75 17.5H4.25ZM4.25 15.75H15.75V4.25H4.25V15.75Z" fill="currentColor"/>'
    },
    "resellers": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M14.958 5.08299C14.486 5.08299 14.0833 4.91633 13.75 4.58299C13.4167 4.24966 13.25 3.84699 13.25 3.37499C13.25 2.90299 13.4167 2.50033 13.75 2.16699C14.0833 1.83366 14.486 1.66699 14.958 1.66699C15.4307 1.66699 15.8337 1.83366 16.167 2.16699C16.5003 2.50033 16.667 2.90299 16.667 3.37499C16.667 3.84699 16.5003 4.24966 16.167 4.58299C15.8337 4.91633 15.4307 5.08299 14.958 5.08299ZM14.25 8.45799V7.93799C14.25 7.60466 14.177 7.27133 14.031 6.93799C13.885 6.60466 13.6873 6.31966 13.438 6.08299C13.7153 5.99966 13.9687 5.94433 14.198 5.91699C14.4273 5.88899 14.6807 5.87499 14.958 5.87499C15.3747 5.87499 15.7777 5.91666 16.167 5.99999C16.5557 6.08333 16.9307 6.20133 17.292 6.35399C17.6113 6.49266 17.8647 6.70799 18.052 6.99999C18.2393 7.29199 18.333 7.60466 18.333 7.93799V8.45799H14.25ZM5.042 5.08299C4.56933 5.08299 4.16633 4.91633 3.833 4.58299C3.49967 4.24966 3.333 3.84699 3.333 3.37499C3.333 2.90299 3.49967 2.50033 3.833 2.16699C4.16633 1.83366 4.56933 1.66699 5.042 1.66699C5.514 1.66699 5.91667 1.83366 6.25 2.16699C6.58333 2.50033 6.75 2.90299 6.75 3.37499C6.75 3.84699 6.58333 4.24966 6.25 4.58299C5.91667 4.91633 5.514 5.08299 5.042 5.08299ZM1.667 8.45799V7.93799C1.667 7.60466 1.76067 7.29199 1.948 6.99999C2.13533 6.70799 2.38867 6.49266 2.708 6.35399C3.06933 6.20133 3.44433 6.08333 3.833 5.99999C4.22233 5.91666 4.62533 5.87499 5.042 5.87499C5.31933 5.87499 5.57267 5.88899 5.802 5.91699C6.03133 5.94433 6.28467 5.99966 6.562 6.08299C6.31267 6.31966 6.115 6.60466 5.969 6.93799C5.823 7.27133 5.75 7.60466 5.75 7.93799V8.45799H1.667ZM10 5.08299C9.528 5.08299 9.12533 4.91633 8.792 4.58299C8.45867 4.24966 8.292 3.84699 8.292 3.37499C8.292 2.90299 8.45867 2.50033 8.792 2.16699C9.12533 1.83366 9.528 1.66699 10 1.66699C10.472 1.66699 10.8747 1.83366 11.208 2.16699C11.5413 2.50033 11.708 2.90299 11.708 3.37499C11.708 3.84699 11.5413 4.24966 11.208 4.58299C10.8747 4.91633 10.472 5.08299 10 5.08299ZM6.625 8.45799V7.93799C6.625 7.60466 6.71867 7.29199 6.906 6.99999C7.094 6.70799 7.34767 6.49266 7.667 6.35399C8.02767 6.20133 8.40267 6.08333 8.792 5.99999C9.18067 5.91666 9.58333 5.87499 10 5.87499C10.4167 5.87499 10.8193 5.91666 11.208 5.99999C11.5973 6.08333 11.9723 6.20133 12.333 6.35399C12.6523 6.49266 12.906 6.70799 13.094 6.99999C13.2813 7.29199 13.375 7.60466 13.375 7.93799V8.45799H6.625ZM14.167 14.958C13.6943 14.958 13.2913 14.7913 12.958 14.458C12.6247 14.1247 12.458 13.722 12.458 13.25C12.458 12.778 12.6247 12.3753 12.958 12.042C13.2913 11.7087 13.6943 11.542 14.167 11.542C14.639 11.542 15.0417 11.7087 15.375 12.042C15.7083 12.3753 15.875 12.778 15.875 13.25C15.875 13.722 15.7083 14.1247 15.375 14.458C15.0417 14.7913 14.639 14.958 14.167 14.958ZM10.792 18.333V17.812C10.792 17.4787 10.8857 17.1663 11.073 16.875C11.2603 16.5837 11.5137 16.3683 11.833 16.229C12.1803 16.0763 12.5553 15.9583 12.958 15.875C13.3607 15.7917 13.7637 15.75 14.167 15.75C14.5697 15.75 14.9723 15.7917 15.375 15.875C15.7777 15.9583 16.1527 16.0763 16.5 16.229C16.8193 16.3683 17.0727 16.5837 17.26 16.875C17.448 17.1663 17.542 17.4787 17.542 17.812V18.333H10.792ZM5.833 14.958C5.361 14.958 4.95833 14.7913 4.625 14.458C4.29167 14.1247 4.125 13.722 4.125 13.25C4.125 12.778 4.29167 12.3753 4.625 12.042C4.95833 11.7087 5.361 11.542 5.833 11.542C6.30567 11.542 6.70867 11.7087 7.042 12.042C7.37533 12.3753 7.542 12.778 7.542 13.25C7.542 13.722 7.37533 14.1247 7.042 14.458C6.70867 14.7913 6.30567 14.958 5.833 14.958ZM2.458 18.333V17.812C2.458 17.4787 2.552 17.1663 2.74 16.875C2.92733 16.5837 3.18067 16.3683 3.5 16.229C3.86133 16.0763 4.23633 15.9583 4.625 15.875C5.01367 15.7917 5.41633 15.75 5.833 15.75C6.24967 15.75 6.65267 15.7917 7.042 15.875C7.43067 15.9583 7.80567 16.0763 8.167 16.229C8.48633 16.3683 8.73967 16.5837 8.927 16.875C9.11433 17.1663 9.208 17.4787 9.208 17.812V18.333H2.458ZM10 13.396L7.438 10.833L8.375 9.89599L9.333 10.854V9.12499H10.667V10.854L11.625 9.89599L12.562 10.833L10 13.396Z" fill="currentColor"/>'
    },
    "sales": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M4.20801 17.5C3.95801 17.5 3.73234 17.427 3.53101 17.281C3.32967 17.135 3.19434 16.944 3.12501 16.708L0.812007 8.29199C0.756674 8.09732 0.795007 7.91666 0.927007 7.74999C1.05901 7.58332 1.22934 7.49999 1.43801 7.49999H5.62501L9.27101 2.08299C9.35434 1.97232 9.45501 1.87866 9.57301 1.80199C9.69101 1.72599 9.82634 1.68799 9.97901 1.68799C10.1317 1.68799 10.2707 1.72266 10.396 1.79199C10.5207 1.86132 10.618 1.95832 10.688 2.08299L14.333 7.49999H18.542C18.764 7.49999 18.941 7.58332 19.073 7.74999C19.205 7.91666 19.2433 8.09732 19.188 8.29199L16.854 16.708C16.7847 16.944 16.6527 17.135 16.458 17.281C16.264 17.427 16.0487 17.5 15.812 17.5H4.20801ZM7.72901 7.49999H12.208L9.97901 4.16699L7.72901 7.49999ZM10 14.167C10.4587 14.167 10.851 14.0037 11.177 13.677C11.5037 13.351 11.667 12.9587 11.667 12.5C11.667 12.0413 11.5037 11.649 11.177 11.323C10.851 10.9963 10.4587 10.833 10 10.833C9.54134 10.833 9.14901 10.9963 8.82301 11.323C8.49634 11.649 8.33301 12.0413 8.33301 12.5C8.33301 12.9587 8.49634 13.351 8.82301 13.677C9.14901 14.0037 9.54134 14.167 10 14.167ZM4.66701 15.75H15.312L17.125 9.24999H2.87501L4.66701 15.75Z" fill="currentColor"/>'
    },
    "save": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M17 6V15.5C17 15.9167 16.854 16.2707 16.562 16.562C16.2707 16.854 15.9167 17 15.5 17H4.5C4.08333 17 3.72933 16.854 3.438 16.562C3.146 16.2707 3 15.9167 3 15.5V4.5C3 4.08333 3.146 3.72933 3.438 3.438C3.72933 3.146 4.08333 3 4.5 3H14L17 6ZM15.5 6.625L13.375 4.5H4.5V15.5H15.5V6.625ZM10 14.75C10.6253 14.75 11.1567 14.5313 11.594 14.094C12.0313 13.6567 12.25 13.1253 12.25 12.5C12.25 11.8747 12.0313 11.3433 11.594 10.906C11.1567 10.4687 10.6253 10.25 10 10.25C9.37467 10.25 8.84333 10.4687 8.406 10.906C7.96867 11.3433 7.75 11.8747 7.75 12.5C7.75 13.1253 7.96867 13.6567 8.406 14.094C8.84333 14.5313 9.37467 14.75 10 14.75ZM5.5 8.5H12.5V5.5H5.5V8.5Z" fill="currentColor"/>'
    },
    "search": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M16.292 17.5L11.125 12.333C10.667 12.6803 10.1703 12.941 9.635 13.115C9.10033 13.2883 8.54133 13.375 7.958 13.375C6.44467 13.375 5.15667 12.8507 4.094 11.802C3.03133 10.7533 2.5 9.472 2.5 7.958C2.5 6.44467 3.03133 5.15667 4.094 4.094C5.15667 3.03133 6.44467 2.5 7.958 2.5C9.472 2.5 10.7533 3.03133 11.802 4.094C12.8507 5.15667 13.375 6.44467 13.375 7.958C13.375 8.54133 13.2917 9.10033 13.125 9.635C12.9583 10.1703 12.6943 10.66 12.333 11.104L17.5 16.292L16.292 17.5ZM7.958 11.625C8.972 11.625 9.83667 11.2673 10.552 10.552C11.2673 9.83667 11.625 8.972 11.625 7.958C11.625 6.93067 11.2707 6.05567 10.562 5.333C9.854 4.611 8.986 4.25 7.958 4.25C6.93067 4.25 6.05567 4.611 5.333 5.333C4.611 6.05567 4.25 6.93067 4.25 7.958C4.25 8.986 4.611 9.854 5.333 10.562C6.05567 11.2707 6.93067 11.625 7.958 11.625Z" fill="currentColor"/>'
    },
    "seat": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M12.417 16.729H6.75C6.264 16.729 5.85067 16.559 5.51 16.219C5.17 15.8783 5 15.465 5 14.979V5.89599H6.75V14.979H12.417V16.729ZM9.688 4.99999C9.22933 4.99999 8.83667 4.83666 8.51 4.50999C8.184 4.18399 8.021 3.79166 8.021 3.33299C8.021 2.87499 8.184 2.48266 8.51 2.15599C8.83667 1.82999 9.22933 1.66699 9.688 1.66699C10.146 1.66699 10.5383 1.82999 10.865 2.15599C11.191 2.48266 11.354 2.87499 11.354 3.33299C11.354 3.79166 11.191 4.18399 10.865 4.50999C10.5383 4.83666 10.146 4.99999 9.688 4.99999ZM13.25 18.333V14.146H9.271C8.79833 14.146 8.399 13.9827 8.073 13.656C7.74633 13.33 7.583 12.9307 7.583 12.458V7.93799C7.583 7.35399 7.788 6.85733 8.198 6.44799C8.60733 6.03799 9.104 5.83299 9.688 5.83299C10.2707 5.83299 10.767 6.03799 11.177 6.44799C11.587 6.85733 11.792 7.35399 11.792 7.93799V11.583H13.312C13.7847 11.583 14.184 11.7463 14.51 12.073C14.8367 12.399 15 12.7983 15 13.271V18.333H13.25Z" fill="currentColor"/>'
    },
    "send": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M2.5 16.667V3.33301L18.333 10L2.5 16.667ZM4.25 14.042L13.812 10L4.25 5.95801V8.72901L9.25 10L4.25 11.271V14.042ZM4.25 14.042V5.95801V8.72901V11.271V14.042Z" fill="currentColor"/>'
    },
    "share": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M2.5 15.833V12.562C2.5 11.3953 2.90967 10.4023 3.729 9.58299C4.54833 8.76366 5.54133 8.35399 6.708 8.35399H14.167L11.208 5.39599L12.438 4.16699L17.5 9.22899L12.438 14.292L11.208 13.062L14.167 10.104H6.708C6.028 10.104 5.44833 10.3437 4.969 10.823C4.48967 11.3023 4.25 11.882 4.25 12.562V15.833H2.5Z" fill="currentColor"/>'
    },
    "sort-down": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M4.9895 11.6565L6.2395 10.4275L9.1145 13.3025L9.1145 3.34351L10.8645 3.34351L10.8645 13.3025L13.7395 10.4275L14.9895 11.6565L9.9895 16.6565L4.9895 11.6565Z" fill="currentColor"/>'
    },
    "sort-up": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M14.9897 8.34351L13.7397 9.57251L10.8647 6.69751V16.6565H9.11475V6.69751L6.23975 9.57251L4.98975 8.34351L9.98975 3.34351L14.9897 8.34351Z" fill="currentColor"/>'
    },
    "sort": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M18 14L14 18L10 14L11.062 12.938L13.25 15.125L13.25 3L14.75 3L14.75 15.125L16.938 12.938L18 14ZM10 6L8.938 7.062L6.75 4.875L6.75 17L5.25 17L5.25 4.875L3.062 7.062L2 6L6 2L10 6Z" fill="currentColor"/>'
    },
    "spinner": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.99999 4.49775C10.6897 4.49775 11.2489 3.93861 11.2489 3.24888C11.2489 2.55914 10.6897 2 9.99999 2C9.31025 2 8.75111 2.55914 8.75111 3.24888C8.75111 3.93861 9.31025 4.49775 9.99999 4.49775Z" fill="currentColor"/><path opacity="0.6" d="M9.99999 18C10.6897 18 11.2489 17.4408 11.2489 16.7511C11.2489 16.0614 10.6897 15.5022 9.99999 15.5022C9.31025 15.5022 8.75111 16.0614 8.75111 16.7511C8.75111 17.4408 9.31025 18 9.99999 18Z" fill="currentColor"/><path opacity="0.3" d="M13.3756 5.39793C14.0653 5.39793 14.6245 4.83879 14.6245 4.14905C14.6245 3.45932 14.0653 2.90018 13.3756 2.90018C12.6859 2.90018 12.1267 3.45932 12.1267 4.14905C12.1267 4.83879 12.6859 5.39793 13.3756 5.39793Z" fill="currentColor"/><path opacity="0.7" d="M6.6245 17.0999C7.31423 17.0999 7.87337 16.5408 7.87337 15.851C7.87337 15.1613 7.31423 14.6022 6.6245 14.6022C5.93477 14.6022 5.37563 15.1613 5.37563 15.851C5.37563 16.5408 5.93477 17.0999 6.6245 17.0999Z" fill="currentColor"/><path opacity="0.95" d="M6.6245 5.39793C7.31423 5.39793 7.87337 4.83879 7.87337 4.14905C7.87337 3.45932 7.31423 2.90018 6.6245 2.90018C5.93477 2.90018 5.37563 3.45932 5.37563 4.14905C5.37563 4.83879 5.93477 5.39793 6.6245 5.39793Z" fill="currentColor"/><path opacity="0.5" d="M13.3756 17.0999C14.0653 17.0999 14.6245 16.5408 14.6245 15.851C14.6245 15.1613 14.0653 14.6022 13.3756 14.6022C12.6859 14.6022 12.1267 15.1613 12.1267 15.851C12.1267 16.5408 12.6859 17.0999 13.3756 17.0999Z" fill="currentColor"/><path opacity="0.85" d="M3.24887 11.2489C3.93861 11.2489 4.49775 10.6898 4.49775 10.0001C4.49775 9.31033 3.93861 8.75119 3.24887 8.75119C2.55914 8.75119 2 9.31033 2 10.0001C2 10.6898 2.55914 11.2489 3.24887 11.2489Z" fill="currentColor"/><path opacity="0.3" d="M16.7511 11.2489C17.4409 11.2489 18 10.6898 18 10.0001C18 9.31033 17.4409 8.75119 16.7511 8.75119C16.0614 8.75119 15.5023 9.31033 15.5023 10.0001C15.5023 10.6898 16.0614 11.2489 16.7511 11.2489Z" fill="currentColor"/><path opacity="0.9" d="M4.14907 7.87336C4.8388 7.87336 5.39794 7.31422 5.39794 6.62448C5.39794 5.93475 4.8388 5.37561 4.14907 5.37561C3.45933 5.37561 2.90019 5.93475 2.90019 6.62448C2.90019 7.31422 3.45933 7.87336 4.14907 7.87336Z" fill="currentColor"/><path opacity="0.4" d="M15.8511 14.6245C16.5408 14.6245 17.1 14.0653 17.1 13.3756C17.1 12.6859 16.5408 12.1267 15.8511 12.1267C15.1613 12.1267 14.6022 12.6859 14.6022 13.3756C14.6022 14.0653 15.1613 14.6245 15.8511 14.6245Z" fill="currentColor"/><path opacity="0.8" d="M4.14907 14.6245C4.8388 14.6245 5.39794 14.0653 5.39794 13.3756C5.39794 12.6859 4.8388 12.1267 4.14907 12.1267C3.45933 12.1267 2.90019 12.6859 2.90019 13.3756C2.90019 14.0653 3.45933 14.6245 4.14907 14.6245Z" fill="currentColor"/><path opacity="0.3" d="M15.8511 7.87336C16.5408 7.87336 17.1 7.31422 17.1 6.62448C17.1 5.93475 16.5408 5.37561 15.8511 5.37561C15.1613 5.37561 14.6022 5.93475 14.6022 6.62448C14.6022 7.31422 15.1613 7.87336 15.8511 7.87336Z" fill="currentColor"/>'
    },
    "split": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.125 18.333V14.167C9.125 13.5557 9.045 13.052 8.885 12.656C8.72567 12.26 8.44467 11.8817 8.042 11.521L9.271 10.292C9.43767 10.4447 9.566 10.5697 9.656 10.667C9.74667 10.7637 9.86133 10.8887 10 11.042C10.1947 10.8193 10.389 10.611 10.583 10.417C10.7777 10.2223 10.9793 10.0417 11.188 9.87499C12.0073 9.22233 12.5663 8.48266 12.865 7.65599C13.163 6.82999 13.2983 5.94466 13.271 4.99999L12.021 6.24999L10.792 5.02099L14.146 1.66699L17.5 5.02099L16.271 6.24999L15.021 4.99999C15.0483 6.33333 14.8363 7.51399 14.385 8.54199C13.9337 9.56933 13.2567 10.4443 12.354 11.167C11.896 11.5417 11.535 11.927 11.271 12.323C11.007 12.719 10.875 13.3337 10.875 14.167V18.333H9.125ZM5.083 6.60399C5.04167 6.33999 5.014 6.08666 5 5.84399C4.986 5.60066 4.979 5.31933 4.979 4.99999L3.729 6.24999L2.5 5.02099L5.854 1.66699L9.208 5.02099L8 6.22899L6.729 4.95799C6.729 5.23599 6.73267 5.47233 6.74 5.66699C6.74667 5.86099 6.757 6.03466 6.771 6.18799L5.083 6.60399ZM6.75 10.333C6.5 10.083 6.264 9.77066 6.042 9.39599C5.81933 9.02066 5.64567 8.65266 5.521 8.29199L7.229 7.87499C7.31233 8.06966 7.42333 8.27466 7.562 8.48999C7.70133 8.70466 7.84733 8.90233 8 9.08299L6.75 10.333Z" fill="currentColor"/>'
    },
    "square": {
      "viewBox": "0 0 27 28",
      "body": '<path fill-rule="evenodd" clip-rule="evenodd" d="M4.41853 1.97081e-07H22.0246C23.1966 -0.000359773 24.3209 0.49241 25.1498 1.36987C25.9787 2.24733 26.4444 3.43757 26.4444 4.67867V23.3199C26.4444 25.9047 24.4655 28 22.0246 28H4.41853C1.97803 27.9992 0 25.9042 0 23.3199V4.67867C0 2.09471 1.97823 1.97081e-07 4.41853 1.97081e-07ZM20.2451 22.9097C21.0153 22.9097 21.6397 22.2485 21.6397 21.433L21.6359 6.56833C21.6359 5.75278 21.0115 5.09165 20.2412 5.09165H6.2044C5.83431 5.09165 5.4794 5.24742 5.21783 5.52464C4.95626 5.80187 4.80949 6.17782 4.80982 6.56969V21.433C4.80982 22.2485 5.43419 22.9097 6.2044 22.9097H20.2451Z" fill="currentColor"/><path d="M10.2762 17.9971C9.81571 17.9932 9.44433 17.5968 9.44435 17.109V10.8924C9.44328 10.6561 9.53115 10.4291 9.68854 10.2616C9.84593 10.0941 10.0598 10 10.283 10H16.1613C16.3843 10.0004 16.598 10.0946 16.7554 10.262C16.9126 10.4294 17.0006 10.6562 16.9999 10.8924V17.1076C17.0006 17.3437 16.9126 17.5705 16.7554 17.7379C16.598 17.9053 16.3843 17.9996 16.1613 18L10.2762 17.9971Z" fill="currentColor"/>'
    },
    "text-size": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M7.08331 3.75V6.25H11.25V16.25H13.75V6.25H17.9166V3.75H7.08331ZM2.08331 10.4167H4.58331V16.25H7.08331V10.4167H9.58331V7.91667H2.08331V10.4167Z" fill="currentColor"/>'
    },
    "tips": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M11.667 10.667C11.0143 10.667 10.462 10.4413 10.01 9.99001C9.55867 9.53801 9.333 8.98567 9.333 8.33301C9.333 7.68034 9.55867 7.12834 10.01 6.67701C10.462 6.22567 11.0143 6.00001 11.667 6.00001C12.3197 6.00001 12.8717 6.22567 13.323 6.67701C13.7743 7.12834 14 7.68034 14 8.33301C14 8.98567 13.7743 9.53801 13.323 9.99001C12.8717 10.4413 12.3197 10.667 11.667 10.667ZM6.083 13.167C5.625 13.167 5.219 12.9897 4.865 12.635C4.51033 12.281 4.333 11.875 4.333 11.417V5.08301C4.333 4.62501 4.51033 4.21901 4.865 3.86501C5.219 3.51034 5.625 3.33301 6.083 3.33301H17.417C17.875 3.33301 18.281 3.51034 18.635 3.86501C18.9897 4.21901 19.167 4.62501 19.167 5.08301V11.417C19.167 11.875 18.9897 12.281 18.635 12.635C18.281 12.9897 17.875 13.167 17.417 13.167H6.083ZM7.75 11.417H15.75C15.75 10.9583 15.9133 10.566 16.24 10.24C16.566 9.91334 16.9583 9.75001 17.417 9.75001V6.75001C16.9583 6.75001 16.566 6.58667 16.24 6.26001C15.9133 5.93401 15.75 5.54167 15.75 5.08301H7.75C7.75 5.54167 7.58667 5.93401 7.26 6.26001C6.934 6.58667 6.54167 6.75001 6.083 6.75001V9.75001C6.54167 9.75001 6.934 9.91334 7.26 10.24C7.58667 10.566 7.75 10.9583 7.75 11.417ZM16.667 16.667H2.583C2.097 16.667 1.684 16.4967 1.344 16.156C1.00333 15.816 0.833 15.403 0.833 14.917V5.83301H2.583V14.917H16.667V16.667Z" fill="currentColor"/>'
    },
    "up-arrow": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.12501 13.271V6.70801L6.95801 8.87501L5.70801 7.62501L10 3.33301L14.292 7.62501L13.042 8.87501L10.875 6.70801V13.271H9.12501ZM5.08301 16.667C4.59701 16.667 4.18401 16.4967 3.84401 16.156C3.50334 15.816 3.33301 15.403 3.33301 14.917V12.5H5.08301V14.917H14.917V12.5H16.667V14.917C16.667 15.403 16.4967 15.816 16.156 16.156C15.816 16.4967 15.403 16.667 14.917 16.667H5.08301Z" fill="currentColor"/>'
    },
    "user": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10 9.97901C9.05533 9.97901 8.26367 9.65968 7.625 9.02101C6.98633 8.38168 6.667 7.59001 6.667 6.64601C6.667 5.70134 6.98633 4.90968 7.625 4.27101C8.26367 3.63168 9.05533 3.31201 10 3.31201C10.9447 3.31201 11.7363 3.63168 12.375 4.27101C13.0137 4.90968 13.333 5.70134 13.333 6.64601C13.333 7.59001 13.0137 8.38168 12.375 9.02101C11.7363 9.65968 10.9447 9.97901 10 9.97901ZM3.271 16.667V14.271C3.271 13.785 3.396 13.3473 3.646 12.958C3.896 12.5693 4.22233 12.2777 4.625 12.083C5.47233 11.6803 6.35067 11.3713 7.26 11.156C8.17 10.9407 9.08333 10.833 10 10.833C10.9167 10.833 11.8333 10.9407 12.75 11.156C13.6667 11.3713 14.5417 11.6803 15.375 12.083C15.7777 12.2777 16.104 12.5693 16.354 12.958C16.604 13.3473 16.729 13.785 16.729 14.271V16.667H3.271ZM5.021 14.917H14.979V14.271C14.979 14.1183 14.9443 13.9863 14.875 13.875C14.8057 13.7637 14.7153 13.6943 14.604 13.667C13.882 13.3197 13.125 13.0523 12.333 12.865C11.5417 12.677 10.764 12.583 10 12.583C9.236 12.583 8.45833 12.6803 7.667 12.875C6.875 13.0697 6.118 13.3337 5.396 13.667C5.28467 13.7223 5.19433 13.7987 5.125 13.896C5.05567 13.9933 5.021 14.1183 5.021 14.271V14.917ZM10 8.22901C10.4587 8.22901 10.837 8.07968 11.135 7.78101C11.4337 7.48234 11.583 7.10401 11.583 6.64601C11.583 6.18734 11.4337 5.80868 11.135 5.51001C10.837 5.21135 10.4587 5.06201 10 5.06201C9.54133 5.06201 9.163 5.21135 8.865 5.51001C8.56633 5.80868 8.417 6.18734 8.417 6.64601C8.417 7.10401 8.56633 7.48234 8.865 7.78101C9.163 8.07968 9.54133 8.22901 10 8.22901Z" fill="currentColor"/>'
    },
    "voucher": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M3.417 16.667C2.931 16.667 2.51767 16.4967 2.177 16.156C1.837 15.816 1.667 15.403 1.667 14.917V11.562C2.111 11.59 2.49633 11.4477 2.823 11.135C3.149 10.823 3.312 10.4447 3.312 10C3.312 9.55534 3.149 9.18034 2.823 8.87501C2.49633 8.56967 2.111 8.43067 1.667 8.45801V5.08301C1.667 4.59701 1.837 4.18401 2.177 3.84401C2.51767 3.50334 2.931 3.33301 3.417 3.33301H16.583C17.069 3.33301 17.4823 3.50334 17.823 3.84401C18.163 4.18401 18.333 4.59701 18.333 5.08301V8.45801C17.889 8.43067 17.5037 8.56967 17.177 8.87501C16.851 9.18034 16.688 9.55534 16.688 10C16.688 10.4447 16.851 10.823 17.177 11.135C17.5037 11.4477 17.889 11.59 18.333 11.562V14.917C18.333 15.403 18.163 15.816 17.823 16.156C17.4823 16.4967 17.069 16.667 16.583 16.667H3.417ZM3.417 14.917H16.583V12.833C16.069 12.5417 15.6663 12.1423 15.375 11.635C15.0837 11.1283 14.938 10.5833 14.938 10C14.938 9.41667 15.087 8.87167 15.385 8.36501C15.6837 7.85767 16.083 7.45834 16.583 7.16701V5.08301H3.417V7.16701C3.931 7.45834 4.33367 7.85767 4.625 8.36501C4.91633 8.87167 5.062 9.41667 5.062 10C5.062 10.5833 4.91633 11.1283 4.625 11.635C4.33367 12.1423 3.931 12.5417 3.417 12.833V14.917ZM7.646 13.521L10 11.729L12.354 13.521L11.479 10.646L13.812 8.79201H10.938L10 5.91701L9.062 8.79201H6.188L8.521 10.646L7.646 13.521Z" fill="currentColor"/>'
    },
    "waiver-complete": {
      "viewBox": "0 0 20 20",
      "body": '<path fill-rule="evenodd" clip-rule="evenodd" d="M6.6875 16.6667C6.35417 16.6667 6.0625 16.5417 5.8125 16.2917C5.5625 16.0417 5.4375 15.75 5.4375 15.4167V13.3333H8.02083V9.74048L9.27083 8.5V13.3333H14.375V14.4792C14.375 14.7569 14.4618 14.9826 14.6354 15.1562C14.809 15.3299 15.0347 15.4167 15.3125 15.4167C15.5903 15.4167 15.816 15.3299 15.9896 15.1562C16.1632 14.9826 16.25 14.7569 16.25 14.4792V4.58333H13.2235L14.4844 3.33333H17.5V14.4792C17.5 15.0903 17.2882 15.6076 16.8646 16.0312C16.441 16.4549 15.9236 16.6667 15.3125 16.6667H6.6875ZM13.4167 15.4167H6.6875V15.0729V14.5833H13.125C13.125 14.7639 13.1528 14.9271 13.2083 15.0729C13.2639 15.2187 13.3333 15.3333 13.4167 15.4167Z" fill="currentColor"/><path d="M12.5 3.18333L11.325 2L5.83333 7.49167L3.675 5.34167L2.5 6.51667L5.83333 9.85L12.5 3.18333Z" fill="currentColor"/>'
    },
    "waiver": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M6.6875 16.6667C6.35417 16.6667 6.0625 16.5417 5.8125 16.2917C5.5625 16.0417 5.4375 15.75 5.4375 15.4167V13.3334H8.02083V10.6875C7.49306 10.7292 6.96528 10.6563 6.4375 10.4688C5.90972 10.2813 5.4375 9.98615 5.02083 9.58337V8.37504H3.97917L1.25 5.64587C1.75 5.17365 2.34722 4.78823 3.04167 4.48962C3.73611 4.19101 4.44444 4.04171 5.16667 4.04171C5.58333 4.04171 6.05903 4.10768 6.59375 4.23962C7.12847 4.37157 7.60417 4.58337 8.02083 4.87504V3.33337H17.5V14.4792C17.5 15.0903 17.2882 15.6077 16.8646 16.0313C16.441 16.4549 15.9236 16.6667 15.3125 16.6667H6.6875ZM9.27083 13.3334H14.375V14.4792C14.375 14.757 14.4618 14.9827 14.6354 15.1563C14.809 15.3299 15.0347 15.4167 15.3125 15.4167C15.5903 15.4167 15.816 15.3299 15.9896 15.1563C16.1632 14.9827 16.25 14.757 16.25 14.4792V4.58337H9.27083V5.77087L14.2917 10.7917V11.6875H13.3958L10.7708 9.06254L10.4167 9.47921C10.2361 9.68754 10.0556 9.84726 9.875 9.95837C9.69444 10.0695 9.49306 10.1737 9.27083 10.2709V13.3334ZM4.54167 7.12504H6.27083V8.97921C6.50694 9.13198 6.73958 9.24657 6.96875 9.32296C7.19792 9.39935 7.43056 9.43754 7.66667 9.43754C8.01389 9.43754 8.36806 9.34379 8.72917 9.15629C9.09028 8.96879 9.35417 8.77782 9.52083 8.58337L9.875 8.16671L8.4375 6.72921C7.99306 6.28476 7.49306 5.93407 6.9375 5.67712C6.38194 5.42018 5.79167 5.29171 5.16667 5.29171C4.79167 5.29171 4.45139 5.33685 4.14583 5.42712C3.84028 5.5174 3.52778 5.63893 3.20833 5.79171L4.54167 7.12504ZM6.6875 15.4167H13.4167C13.3333 15.3334 13.2639 15.2188 13.2083 15.073C13.1528 14.9271 13.125 14.7639 13.125 14.5834H6.6875V15.4167ZM6.6875 15.4167V14.5834C6.6875 14.7639 6.6875 14.9271 6.6875 15.073C6.6875 15.2188 6.6875 15.3334 6.6875 15.4167Z" fill="currentColor"/>'
    }
  };
  var FALLBACKS = {
    "chevron-down": '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/>',
    "chevron-up": '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 15l6-6 6 6"/>',
    "chevron-right": '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/>',
    "chevron-left": '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6"/>',
    "arrow-up-down": '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 4v16M7 4L4 7M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3"/>',
    close: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18"/>',
    check: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4 10-10"/>',
    "check-filled": '<path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.2l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/>',
    info: '<path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>',
    warning: '<path fill="currentColor" d="M12 2L1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z"/>',
    danger: '<path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
    copy: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 9h10v10H9zM5 15H4V5h10v1"/>',
    search: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M11 11m-7 0a7 7 0 1014 0 7 7 0 10-14 0M21 21l-5-5"/>',
    spinner: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 3a9 9 0 109 9" opacity="0.9"/>',
    plus: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 5v14M5 12h14"/>',
    minus: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M5 12h14"/>',
    calendar: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 7a1 1 0 011-1h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7zM4 10h16M8 4v4M16 4v4"/>'
  };
  var DEFAULT_VIEWBOX = "0 0 24 24";
  var ICONS = {
    // Hand-drawn fallbacks first; the generated Odyssey set wins on name overlap.
    ...Object.fromEntries(
      Object.entries(FALLBACKS).map(([name, body]) => [name, { viewBox: DEFAULT_VIEWBOX, body }])
    ),
    ...THEMEABLE_ICONS
  };
  function registerIcon(name, innerSvg, viewBox = DEFAULT_VIEWBOX) {
    ICONS[name] = { viewBox, body: innerSvg };
  }
  function hasIcon(name) {
    return name in ICONS;
  }
  function iconNames() {
    return Object.keys(ICONS).sort();
  }
  function renderIconSvg(icon, className = "") {
    const [, , w = "24", h = "24"] = icon.viewBox.split(" ");
    const cls = className ? ` class="${className}"` : "";
    return `<svg${cls} viewBox="${icon.viewBox}" width="${w}" height="${h}" aria-hidden="true" focusable="false">${icon.body}</svg>`;
  }
  function iconSvg(name, className = "") {
    return renderIconSvg(ICONS[name] ?? { viewBox: DEFAULT_VIEWBOX, body: "" }, className);
  }
  var OdyIcon = class extends OdyElement {
    static observedAttributes = ["name", "size", "disabled"];
    render() {
      const size = this.attr("size", "base");
      const cls = classes(
        "icon",
        `icon--size-${size}`,
        this.flag("disabled") && "icon--disabled"
      );
      this.mount(`<span class="${cls}">${iconSvg(this.attr("name"), "icon__svg")}</span>`);
    }
  };
  define("ody-icon", OdyIcon);
  var OdyButton = class extends OdyElement {
    static observedAttributes = [
      "variant",
      "appearance",
      "size",
      "type",
      "left-icon",
      "right-icon",
      "loading",
      "icon-only",
      "active",
      "disabled",
      "icon-rotate"
    ];
    render() {
      const variant = this.attr("variant", "primary");
      const appearance = this.attr("appearance", "interaction");
      const size = this.attr("size", "base");
      const isActive = this.flag("active");
      const isDisabled = this.flag("disabled");
      const isLoading = this.flag("loading");
      const cls = classes(
        "ody-button",
        "btn",
        `btn-${variant}`,
        `ody-button--size-${size}`,
        appearance,
        isLoading && "ody-button--loading",
        this.flag("icon-only") && "ody-button--icon-only",
        isActive && "ody-button--active",
        isDisabled && "ody-button--disabled",
        this.flag("icon-rotate") && "ody-button--rotate"
      );
      const left = this.attr("left-icon");
      const right = this.attr("right-icon");
      const leftIcon = left ? `<span class="ody-button__left-icon">${iconSvg(left, "icon__svg")}</span>` : "";
      const rightIcon = right ? `<span class="ody-button__right-icon">${iconSvg(right, "icon__svg")}</span>` : "";
      const spinner = isLoading ? `<span class="ody-button__loading-wrapper">${iconSvg("spinner", "icon__svg ody-spin")}</span>` : "";
      this.mount(
        `<button type="${this.esc(this.attr("type", "button"))}" class="${cls}"${isDisabled ? " disabled" : ""} aria-expanded="${isActive ? "true" : "false"}">${leftIcon}<span class="ody-button__label" data-ody-slot></span>${rightIcon}${spinner}</button>`
      );
    }
  };
  define("ody-button", OdyButton);
  var OdyTag = class extends OdyElement {
    static observedAttributes = ["variant", "color", "size", "icon", "count"];
    render() {
      const cls = classes(
        "ody-tag",
        `ody-tag--${this.attr("variant", "primary")}`,
        `ody-tag--${this.attr("color", "default")}`,
        this.attr("size", "base") === "small" && "ody-tag--size-small"
      );
      const icon = this.attr("icon");
      const iconEl = icon ? `<span class="ody-tag__icon">${iconSvg(icon, "icon__svg")}</span>` : "";
      const count = this.attr("count");
      const countEl = count ? `<span class="ody-tag__count">${this.esc(count)}</span>` : "";
      this.mount(
        `<span class="${cls}">${iconEl}<span class="ody-tag__label" data-ody-slot></span>${countEl}</span>`
      );
    }
  };
  define("ody-tag", OdyTag);
  var VARIANT_ICON = {
    info: "info",
    success: "check-filled",
    warning: "warning",
    danger: "danger"
  };
  var OdyAlert = class extends OdyElement {
    static observedAttributes = ["variant", "heading"];
    render() {
      const variant = this.attr("variant", "info");
      const icon = VARIANT_ICON[variant] ?? VARIANT_ICON.info;
      const heading = this.attr("heading");
      const headingEl = heading ? `<p class="ody-alert__message">${this.esc(heading)}</p>` : "";
      this.mount(
        `<div class="ody-alert-container"><div class="${classes("ody-alert", `ody-alert--${variant}`)}"><div class="ody-alert__message-container"><span class="ody-alert__icon icon icon--size-medium">${iconSvg(icon, "icon__svg")}</span>` + headingEl + `</div><div class="ody-alert__body" data-ody-slot></div></div></div>`
      );
    }
  };
  define("ody-alert", OdyAlert);
  var OdyCard = class extends OdyElement {
    static observedAttributes = ["bar-color", "clickable", "no-bar"];
    render() {
      const noBar = this.flag("no-bar");
      const barColor = cssColor(this.attr("bar-color"));
      const barStyle = barColor ? ` style="background-color:${barColor}"` : "";
      const cls = classes(
        "ody-card__container",
        this.flag("clickable") && "ody-card--clickable",
        noBar && "ody-card--no-bar"
      );
      const bar = noBar ? "" : `<div class="ody-card__container__bar"${barStyle}></div>`;
      this.mount(
        `<div class="${cls}" style="display:flex">` + bar + `<div class="ody-card__container__content" data-ody-slot></div></div>`
      );
    }
  };
  define("ody-card", OdyCard);
  var OdyDivider = class extends OdyElement {
    render() {
      this.mount('<span class="ody-divider"></span>');
    }
  };
  var OdyHorizontalDivider = class extends OdyElement {
    static observedAttributes = ["spacing"];
    render() {
      const spacing = this.attr("spacing");
      const cls = classes(
        "ody-horizontal-divider",
        spacing === "tight" && "ody-horizontal-divider--tight",
        spacing === "none" && "ody-horizontal-divider--none"
      );
      this.mount(`<span class="${cls}"></span>`);
    }
  };
  define("ody-divider", OdyDivider);
  define("ody-horizontal-divider", OdyHorizontalDivider);
  var OdyStatusDot = class extends OdyElement {
    static observedAttributes = ["color"];
    render() {
      const dotClass = classes("status-dot", `status-dot--${this.attr("color", "green")}`);
      this.mount(
        `<span class="status-dot-container"><span class="${dotClass}"></span><span class="status-dot__label" data-ody-slot></span></span>`
      );
    }
  };
  define("ody-status-dot", OdyStatusDot);
  var OdyMessage = class extends OdyElement {
    static observedAttributes = ["icon"];
    render() {
      const icon = this.attr("icon");
      const iconEl = icon ? `<span class="ody-message__icon icon icon--size-small">${iconSvg(icon, "icon__svg")}</span>` : "";
      this.mount(
        `<span class="ody-message-container">${iconEl}<span class="ody-message" data-ody-slot></span></span>`
      );
    }
  };
  define("ody-message", OdyMessage);
  var OdyLoadingSpinner = class extends OdyElement {
    static observedAttributes = ["size"];
    render() {
      const size = this.attr("size", "base");
      const cls = classes("loading-spinner", size !== "base" && `loading-spinner--size-${size}`);
      this.mount(
        `<span class="loading-spinner-container"><span class="${cls}">${iconSvg("spinner", "icon__svg")}</span><span class="loading-spinner__label-field" data-ody-slot></span></span>`
      );
    }
  };
  define("ody-loading-spinner", OdyLoadingSpinner);
  var OdyLoadingBar = class extends OdyElement {
    static observedAttributes = ["value", "color", "label"];
    render() {
      const raw = Number.parseFloat(this.attr("value", "0"));
      const value = Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0;
      const color = cssColor(this.attr("color"), "var(--color-interaction-300)");
      const label = this.attr("label");
      const text = label ? `<div class="loading-bar__text-container"><span>${this.esc(label)}</span><span>${value}%</span></div>` : "";
      this.mount(
        `<div class="loading-bar-container"><div class="loading-bar">${text}<div class="loading-bar__progress-container"><div class="loading-bar__progress" style="width:${value}%;background-color:${this.esc(color)}"></div></div></div></div>`
      );
    }
  };
  define("ody-loading-bar", OdyLoadingBar);
  var VARIANT_ICON2 = {
    default: "info",
    error: "danger",
    "no-results": "info",
    "no-search": "search",
    "not-authorized": "warning"
  };
  var OdyEmptyState = class extends OdyElement {
    static observedAttributes = ["variant", "img-src", "img-alt", "icon", "label", "caption"];
    render() {
      const variant = this.attr("variant", "default");
      const imgSrc = this.attr("img-src");
      const explicitIcon = this.attr("icon");
      const icon = explicitIcon || (VARIANT_ICON2[variant] ?? VARIANT_ICON2.default);
      let media = "";
      if (imgSrc) {
        const alt = this.attr("img-alt");
        media = `<img class="ody-empty-state__image" src="${this.esc(imgSrc)}" alt="${this.esc(alt)}" />`;
      } else {
        media = `<span class="ody-empty-state__image ody-empty-state__icon">${iconSvg(icon, "icon__svg")}</span>`;
      }
      const label = this.attr("label");
      const caption = this.attr("caption");
      const labelEl = label ? `<div class="ody-empty-state__label">${this.esc(label)}</div>` : "";
      const captionEl = caption ? `<div class="ody-empty-state__caption">${this.esc(caption)}</div>` : "";
      this.mount(
        `<div class="ody-empty-state">` + media + `<div class="ody-empty-state__messages-container">` + labelEl + captionEl + `<div class="ody-empty-state__block" data-ody-slot></div></div></div>`
      );
    }
  };
  define("ody-empty-state", OdyEmptyState);
  var OdyBreadcrumb = class extends OdyElement {
    render() {
      this.mount(
        `<nav class="breadcrumbs" aria-label="${this.localized("aria-label", "breadcrumb")}"><ol class="breadcrumb" data-ody-slot></ol></nav>`
      );
    }
  };
  var OdyBreadcrumbItem = class extends OdyElement {
    static observedAttributes = ["current"];
    render() {
      const isCurrent = this.flag("current");
      const cls = classes("breadcrumb__item", isCurrent && "active");
      const current = isCurrent ? ' aria-current="page"' : "";
      this.mount(`<li class="${cls}"${current} data-ody-slot></li>`);
    }
  };
  define("ody-breadcrumb", OdyBreadcrumb);
  define("ody-breadcrumb-item", OdyBreadcrumbItem);
  var OdyStatSummary = class extends OdyElement {
    render() {
      this.mount(
        `<div class="ody-stat-summary"><div class="ody-stat-summary__stats" data-ody-slot></div></div>`
      );
    }
  };
  var OdyStat = class extends OdyElement {
    static observedAttributes = ["label", "value", "sub", "tone"];
    render() {
      const label = this.attr("label");
      const value = this.attr("value");
      const sub = this.attr("sub");
      const tone = this.attr("tone", "default");
      const labelEl = label ? `<div class="ody-stat-summary__stat__label">${this.esc(label)}</div>` : "";
      const valueCls = classes(
        "ody-stat-summary__stat__value",
        tone !== "default" && `ody-stat-summary__stat__value--${tone}`
      );
      const valueEl = value ? `<div class="${valueCls}">${this.esc(value)}</div>` : `<div class="${valueCls}" data-ody-slot></div>`;
      const subEl = sub ? `<div class="ody-stat-summary__stat__sub">${this.esc(sub)}</div>` : "";
      this.mount(`<div class="ody-stat-summary__stat">${labelEl}${valueEl}${subEl}</div>`);
    }
  };
  var OdyStatDetail = class extends OdyElement {
    static observedAttributes = ["value"];
    render() {
      const value = this.attr("value");
      const valueEl = value ? `<span class="ody-stat-summary__detail-item__value">${this.esc(value)}</span>` : "";
      this.mount(
        `<span class="ody-stat-summary__detail-item"><span data-ody-slot></span>${valueEl}</span>`
      );
    }
  };
  var OdyStatSummaryDetail = class extends OdyElement {
    render() {
      this.mount(
        `<div class="ody-stat-summary__divider"></div><div class="ody-stat-summary__detail" data-ody-slot></div>`
      );
    }
  };
  define("ody-stat-summary", OdyStatSummary);
  define("ody-stat", OdyStat);
  define("ody-stat-detail", OdyStatDetail);
  define("ody-stat-summary-detail", OdyStatSummaryDetail);
  var OdyInlineList = class extends OdyElement {
    static observedAttributes = ["separator", "gap"];
    render() {
      const separator = this.attr("separator", "line");
      const raw = Number.parseFloat(this.attr("gap", "12"));
      const gap = Number.isFinite(raw) ? raw : 12;
      const cls = classes("ody-inline-list", `ody-inline-list--${separator}`);
      this.mount(
        `<div class="${cls}" style="--ody-inline-list-gap:${gap}px" data-ody-slot></div>`
      );
    }
  };
  var OdyInlineListItem = class extends OdyElement {
    render() {
      this.mount(`<span class="ody-inline-list__item" data-ody-slot></span>`);
    }
  };
  define("ody-inline-list", OdyInlineList);
  define("ody-inline-list-item", OdyInlineListItem);
  var OdyListItem = class extends OdyElement {
    static observedAttributes = ["item-id", "active-item-id", "active"];
    connectedCallback() {
      super.connectedCallback();
      this.addEventListener("click", this.#handleClick);
      this.addEventListener("keydown", this.#handleKeydown);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener("click", this.#handleClick);
      this.removeEventListener("keydown", this.#handleKeydown);
    }
    #handleClick = () => {
      this.dispatchEvent(
        new CustomEvent("select", { detail: { itemId: this.attr("item-id") }, bubbles: true })
      );
    };
    #handleKeydown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.#handleClick();
      }
    };
    #isActive() {
      if (this.flag("active")) return true;
      const id = this.attr("item-id");
      const activeId = this.attr("active-item-id");
      return Boolean(id) && id === activeId;
    }
    render() {
      const cls = classes("list-item", this.#isActive() && "list-item--active");
      this.mount(
        `<div class="${cls}" tabindex="0"><div class="list-item__content-container"><div class="list-item__content" data-ody-slot></div></div><div class="list-item__icon-container"><span class="icon icon--size-base">${iconSvg("chevron-right", "icon__svg")}</span></div></div>`
      );
    }
  };
  define("ody-list-item", OdyListItem);
  var OdyProductIndicator = class extends OdyElement {
    static observedAttributes = [
      "name",
      "detail",
      "bar-color",
      "text-color",
      "size",
      "indicator-id",
      "clickable"
    ];
    connectedCallback() {
      super.connectedCallback();
      this.addEventListener("click", this.#handleClick);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener("click", this.#handleClick);
    }
    #handleClick = () => {
      if (!this.flag("clickable")) return;
      this.dispatchEvent(
        new CustomEvent("select", { detail: { id: this.attr("indicator-id") }, bubbles: true })
      );
    };
    render() {
      const size = this.attr("size", "base");
      const clickable = this.flag("clickable");
      const cls = classes(
        "ody-product-indicator-container",
        `ody-product-indicator-container--size-${size}`,
        clickable && "ody-product-indicator-clickable"
      );
      const barColor = cssColor(this.attr("bar-color"));
      const barStyle = barColor ? ` style="background-color:${barColor}"` : "";
      const bar = `<div class="ody-product-indicator__bar"${barStyle}></div>`;
      const textColor = cssColor(this.attr("text-color"));
      const textStyle = textColor ? ` style="color:${textColor}"` : "";
      const name = this.attr("name");
      const nameEl = `<div class="ody-product-indicator__name"${textStyle}>${this.esc(name)}</div>`;
      const detail = this.attr("detail");
      const detailEl = detail ? `<div class="ody-product-indicator__detail">${this.esc(detail)}</div>` : "";
      const role = clickable ? ' role="button"' : "";
      this.mount(
        `<div class="${cls}"${role}><div class="ody-product-indicator">` + bar + `<div class="ody-product-indicator__content">` + nameEl + detailEl + `<div class="ody-product-indicator__extra" data-ody-slot></div></div></div></div>`
      );
    }
  };
  define("ody-product-indicator", OdyProductIndicator);
  var OdyToggleButton = class extends OdyElement {
    static observedAttributes = ["options", "selected", "size", "disabled"];
    /** Options set via the JS property; when set it wins over the attribute. */
    #options = null;
    /** Options: the JS property wins, else the JSON `options` attribute. */
    get options() {
      return this.#options ?? this.#parseOptions();
    }
    set options(next) {
      this.#options = coerceToggleOptions(next);
      if (this.querySelector(".ody-toggle-button")) this.render();
    }
    connectedCallback() {
      super.connectedCallback();
      this.addEventListener("click", this.#handleClick);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener("click", this.#handleClick);
    }
    #handleClick = (event) => {
      const target = event.target?.closest(
        ".ody-toggle-button__button"
      );
      if (!target || target.disabled) return;
      const value = target.getAttribute("data-value") ?? "";
      this.setAttribute("selected", value);
      this.dispatchEvent(new CustomEvent("change", { detail: { value }, bubbles: true }));
    };
    #parseOptions() {
      const raw = this.attr("options");
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    render() {
      const size = this.attr("size", "base");
      const selected = this.attr("selected");
      const groupDisabled = this.flag("disabled");
      const buttons = this.options.map((opt) => {
        const isSelected = selected !== "" && selected === opt.value;
        const isDisabled = groupDisabled || Boolean(opt.disabled);
        const cls = classes(
          "ody-toggle-button__button",
          "btn",
          isSelected && "ody-toggle-button__button--selected",
          `ody-toggle-button__button--size-${size}`,
          opt.iconOnly && "ody-toggle-button__button--icon-only"
        );
        const left = opt.leftIcon ? `<span class="ody-toggle-button__button__left-icon">${iconSvg(opt.leftIcon, "icon__svg")}</span>` : "";
        const right = opt.rightIcon ? `<span class="ody-toggle-button__button__right-icon">${iconSvg(opt.rightIcon, "icon__svg")}</span>` : "";
        const label = opt.label ? this.esc(opt.label) : "";
        return `<button type="button" class="${cls}" data-value="${this.esc(opt.value)}"${isDisabled ? " disabled" : ""} aria-pressed="${isSelected ? "true" : "false"}">${left}${label}${right}</button>`;
      }).join("");
      this.mount(`<div class="ody-toggle-button" aria-label="${this.localized("aria-label", "toggleGroup")}">${buttons}</div>`);
    }
  };
  function coerceToggleOptions(next) {
    if (Array.isArray(next)) return next;
    if (typeof next === "string" && next) {
      try {
        const parsed = JSON.parse(next);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }
  define("ody-toggle-button", OdyToggleButton);
  var GAP_VALUES = /* @__PURE__ */ new Set(["8", "16", "24", "32"]);
  function gapClass(prefix, value, fallback = "16") {
    const gap = GAP_VALUES.has(value) ? value : fallback;
    return `${prefix}--gap${gap}`;
  }
  var OdySectionColumns = class extends OdyElement {
    static observedAttributes = ["gap-size", "vertical-align"];
    render() {
      const cls = classes(
        "ody-section",
        "ody-section-columns",
        gapClass("ody-section-columns", this.attr("gap-size", "16")),
        `ody-section-columns--vertical-align-${this.attr("vertical-align", "bottom")}`
      );
      this.mount(`<div class="${cls}" data-ody-slot></div>`);
    }
  };
  var OdySectionColumnItem = class extends OdyElement {
    static observedAttributes = ["no-grow", "individual-scroll", "stretch", "with-padding"];
    render() {
      const cls = classes(
        "ody-section-columns__item",
        this.flag("no-grow") && "ody-section-columns__item--no-grow",
        this.flag("individual-scroll") && "ody-section-columns__item--individual-scroll",
        this.flag("stretch") && "ody-section-columns__item--stretch",
        this.flag("with-padding") && "ody-section-columns__item--with-padding"
      );
      this.mount(`<div class="${cls}" data-ody-slot></div>`);
    }
  };
  var OdySectionRows = class extends OdyElement {
    static observedAttributes = ["gap-size"];
    render() {
      const cls = classes(
        "ody-section",
        "ody-section-rows",
        gapClass("ody-section-rows", this.attr("gap-size", "16"))
      );
      this.mount(`<section class="${cls}" data-ody-slot></section>`);
    }
  };
  var OdySectionRowItem = class extends OdyElement {
    static observedAttributes = ["title", "description", "description-icon", "no-divider"];
    render() {
      const title = this.attr("title");
      const description = this.attr("description");
      const descriptionIcon = this.attr("description-icon");
      const titleEl = title ? `<h3 class="paragraph-1-bold">${this.esc(title)}</h3>` : "";
      const iconEl = descriptionIcon ? `<span class="icon icon--size-small">${iconSvg(descriptionIcon, "icon__svg")}</span>` : "";
      const descEl = description ? `<p class="paragraph-2-regular ody-section-rows__description">${iconEl}${this.esc(description)}</p>` : "";
      const header = title || description ? `<div class="ody-section-rows__header">${titleEl}${descEl}</div>` : "";
      const divider = this.flag("no-divider") ? "" : `<div class="ody-divider"></div>`;
      this.mount(
        `<section class="ody-section-rows ody-section-rows__item">` + header + `<div data-ody-slot></div>` + divider + `</section>`
      );
    }
  };
  define("ody-section-columns", OdySectionColumns);
  define("ody-section-column-item", OdySectionColumnItem);
  define("ody-section-rows", OdySectionRows);
  define("ody-section-row-item", OdySectionRowItem);
  var OdyTwoColumn = class extends OdyElement {
    static observedAttributes = ["secondary-open"];
    render() {
      const cls = classes(
        "ody-two-column",
        this.flag("secondary-open") && "ody-two-column--secondary-open"
      );
      this.mount(`<div class="${cls}" data-ody-slot></div>`);
    }
  };
  var OdyTwoColumnMain = class extends OdyElement {
    render() {
      this.mount(`<section class="ody-two-column__main-content" data-ody-slot></section>`);
    }
  };
  var OdyTwoColumnSecondary = class extends OdyElement {
    render() {
      this.mount(`<section class="ody-two-column__secondary" data-ody-slot></section>`);
    }
  };
  var OdyTwoColumnSecondaryHeader = class extends OdyElement {
    static observedAttributes = ["title"];
    connectedCallback() {
      super.connectedCallback();
      this.addEventListener("click", this.#handleClick);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener("click", this.#handleClick);
    }
    #handleClick = (event) => {
      const target = event.target;
      if (target?.closest(".ody-two-column__secondary__close-button")) {
        this.dispatchEvent(new CustomEvent("close", { bubbles: true }));
      }
    };
    render() {
      this.mount(
        `<header class="ody-two-column__secondary__header"><span class="ody-two-column__secondary__header__title">${this.esc(this.attr("title"))}</span><button type="button" class="ody-button btn btn-ghost ody-two-column__secondary__close-button" aria-label="${this.localized("close-label", "close")}"><span class="icon">${iconSvg("close", "icon__svg")}</span></button></header>`
      );
    }
  };
  define("ody-two-column", OdyTwoColumn);
  define("ody-two-column-main", OdyTwoColumnMain);
  define("ody-two-column-secondary", OdyTwoColumnSecondary);
  define("ody-two-column-secondary-header", OdyTwoColumnSecondaryHeader);
  var OdyPageContainer = class extends OdyElement {
    render() {
      this.mount(`<div class="ody-page-container" data-ody-slot></div>`);
    }
  };
  var OdyAppPageContainer = class extends OdyElement {
    static observedAttributes = ["flush"];
    render() {
      const cls = classes(
        "ody-app-page-container",
        this.flag("flush") && "ody-app-page-container--flush"
      );
      this.mount(`<div class="${cls}" data-ody-slot></div>`);
    }
  };
  define("ody-page-container", OdyPageContainer);
  define("ody-app-page-container", OdyAppPageContainer);
  var OdyCollapsibleSection = class extends OdyElement {
    static observedAttributes = ["header-text", "secondary-header-text", "icon", "expanded"];
    connectedCallback() {
      super.connectedCallback();
      this.addEventListener("click", this.#handleClick);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener("click", this.#handleClick);
    }
    #handleClick = (event) => {
      const target = event.target;
      if (!target?.closest(".ody-collapsible__header")) return;
      const next = !this.flag("expanded");
      if (next) this.setAttribute("expanded", "");
      else this.removeAttribute("expanded");
      this.dispatchEvent(new CustomEvent("expanded", { detail: { expanded: next }, bubbles: true }));
    };
    render() {
      const expanded = this.flag("expanded");
      const icon = this.attr("icon");
      const iconEl = icon ? `<span class="icon">${iconSvg(icon, "icon__svg")}</span>` : "";
      const secondary = this.attr("secondary-header-text");
      const secondaryEl = secondary ? `<span class="ody-collapsible-section__secondary-header-text">${this.esc(secondary)}</span>` : "";
      const chevron = iconSvg(expanded ? "chevron-up" : "chevron-down", "icon__svg");
      const rootCls = classes(
        "ody-collapsible-section",
        expanded && "ody-collapsible-section--expanded"
      );
      this.mount(
        `<div class="${rootCls}"><div class="ody-collapsible-container"><div class="ody-collapsible"><button type="button" class="ody-collapsible__header" aria-expanded="${expanded ? "true" : "false"}"><span class="ody-collapsible__header__label">` + iconEl + `<span>${this.esc(this.attr("header-text"))}</span>` + secondaryEl + `</span><span class="ody-collapsible__header__icon icon">${chevron}</span></button><div class="ody-collapsible__body" data-ody-slot></div></div></div></div>`
      );
    }
  };
  var OdyCollapsibleCollapsed = class extends OdyElement {
    render() {
      this.mount(`<div class="ody-collapsible-section__collapsed-content" data-ody-slot></div>`);
    }
  };
  var OdyCollapsibleContent = class extends OdyElement {
    render() {
      this.mount(`<div class="ody-collapsible__content" data-ody-slot></div>`);
    }
  };
  define("ody-collapsible-section", OdyCollapsibleSection);
  define("ody-collapsible-collapsed", OdyCollapsibleCollapsed);
  define("ody-collapsible-content", OdyCollapsibleContent);
  var OdyInput = class extends OdyElement {
    static observedAttributes = [
      "label",
      "placeholder",
      "value",
      "size",
      "icon",
      "caption",
      "warning",
      "info",
      "maxlength",
      "textarea",
      "readonly",
      "disabled",
      "full-width",
      "max-content",
      "no-clear"
    ];
    /** Internal value backing store, kept in sync with the `value` attribute. */
    #value = "";
    /** Current field value. */
    get value() {
      return this.hasAttribute("value") ? this.attr("value") : this.#value;
    }
    set value(next) {
      this.#value = next;
      this.setAttribute("value", next);
    }
    /**
     * Reflect `value` into the live control in place — the native field already
     * shows what the user typed, so rebuilding it (as a full re-render would)
     * needlessly drops focus and caret. Every other observed attribute changes
     * the chrome and still re-renders via the base implementation.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "value") {
        if (oldValue === newValue) return;
        const value = newValue ?? "";
        reflectControlValue(
          this.querySelector(
            ".ody-input__field, .ody-input__textarea"
          ),
          value
        );
        this.#syncCounter(value);
        this.#syncClearButton(value);
        return;
      }
      super.attributeChangedCallback();
    }
    render() {
      const size = this.attr("size", "base");
      const isTextarea = this.flag("textarea");
      const isReadonly = this.flag("readonly");
      const isDisabled = this.flag("disabled");
      const warning = this.attr("warning");
      const info = this.attr("info");
      const caption = this.attr("caption");
      const value = this.value;
      const wrapperCls = classes(
        "ody-input",
        info && "ody-input--info",
        warning && "ody-input--warning",
        this.flag("max-content") && "ody-input--max-content",
        this.flag("full-width") && "ody-input--full-width"
      );
      const label = this.attr("label");
      const labelEl = label ? `<label class="ody-input__label">${this.esc(label)}</label>` : "";
      const icon = this.attr("icon");
      const iconEl = icon ? `<div class="ody-input__icon icon icon--size-small">${iconSvg(icon, "icon__svg")}</div>` : "";
      const maxlength = this.attr("maxlength");
      const maxlengthAttr = maxlength ? ` maxlength="${this.esc(maxlength)}"` : "";
      const containerCls = classes(
        "ody-input__container",
        isTextarea && "ody-input__container--textarea",
        isReadonly && "ody-input__container--readonly",
        `ody-input__container--${size}`
      );
      const field = isTextarea ? `<textarea class="ody-input__textarea" rows="3"${maxlengthAttr}${isReadonly ? " readonly" : ""}${isDisabled ? " disabled" : ""}>${this.esc(value)}</textarea>` : `<input class="ody-input__field" type="text" value="${this.esc(value)}" placeholder="${this.esc(this.attr("placeholder"))}"${maxlengthAttr}${isReadonly ? " readonly" : ""}${isDisabled ? " disabled" : ""} />`;
      const clearEl = this.#clearEnabled(value) ? this.#clearButtonHtml() : "";
      const showCounter = !isReadonly && !isDisabled && maxlength !== "";
      const messages = classes(
        caption && "has-caption",
        warning && "has-warning",
        info && "has-info"
      );
      const footerNeeded = showCounter || messages !== "";
      const footer = footerNeeded ? `<div class="ody-input__footer"><div class="ody-input__message__container">` + (caption ? `<span class="ody-input__caption">${this.esc(caption)}</span>` : "") + (warning ? `<span class="ody-input__warning">${this.esc(warning)}</span>` : "") + (info ? `<span class="ody-input__info">${this.esc(info)}</span>` : "") + `</div>` + (showCounter ? `<div class="ody-input__length-message">${value.length} / ${this.esc(maxlength)}</div>` : "") + `</div>` : "";
      this.mount(
        `<div class="${wrapperCls}"${isDisabled ? ' aria-disabled="true"' : ""}>` + labelEl + `<div class="${containerCls}"${isDisabled ? ' aria-disabled="true"' : ""}><span class="ody-input__leading" data-ody-slot></span>` + iconEl + field + clearEl + `</div>` + footer + `</div>`
      );
      const control = this.querySelector(
        ".ody-input__field, .ody-input__textarea"
      );
      control?.addEventListener("input", this.#onInput);
      control?.addEventListener("change", this.#onChange);
      this.querySelector(".ody-input__clear-button")?.addEventListener("click", this.#onClear);
    }
    #onInput = (event) => {
      event.stopPropagation();
      const value = event.target.value;
      this.value = value;
      this.dispatchEvent(new CustomEvent("input", { detail: { value }, bubbles: true }));
    };
    #onChange = (event) => {
      event.stopPropagation();
      const value = event.target.value;
      this.dispatchEvent(new CustomEvent("change", { detail: { value }, bubbles: true }));
    };
    #onClear = () => {
      this.value = "";
      this.dispatchEvent(new CustomEvent("input", { detail: { value: "" }, bubbles: true }));
      this.dispatchEvent(new CustomEvent("change", { detail: { value: "" }, bubbles: true }));
    };
    /** Update the live character counter without a full re-render. */
    #syncCounter(value) {
      const counter = this.querySelector(".ody-input__length-message");
      const max = this.attr("maxlength");
      if (counter && max) counter.textContent = `${value.length} / ${max}`;
    }
    /** Whether the clear button should be shown for the given value. */
    #clearEnabled(value) {
      return !this.flag("no-clear") && !this.flag("disabled") && !this.flag("readonly") && value !== "";
    }
    /** Markup for the clear button (shared by render and the in-place sync). */
    #clearButtonHtml() {
      return `<button type="button" class="btn ody-input__clear-button" aria-label="${this.localized("clear-label", "clear")}">${iconSvg("close", "icon__svg clear-icon")}</button>`;
    }
    /** Add or remove the clear button in place as the value gains/loses content. */
    #syncClearButton(value) {
      const existing = this.querySelector(".ody-input__clear-button");
      if (this.#clearEnabled(value)) {
        if (existing) return;
        const control = this.querySelector(".ody-input__field, .ody-input__textarea");
        control?.insertAdjacentHTML("afterend", this.#clearButtonHtml());
        this.querySelector(".ody-input__clear-button")?.addEventListener("click", this.#onClear);
      } else {
        existing?.remove();
      }
    }
  };
  define("ody-input", OdyInput);
  var OdyInlineInput = class extends OdyElement {
    static observedAttributes = [
      "label",
      "placeholder",
      "value",
      "size",
      "icon",
      "caption",
      "warning",
      "info",
      "maxlength",
      "textarea",
      "readonly",
      "disabled",
      "full-width",
      "max-content",
      "no-clear"
    ];
    #value = "";
    /** Current field value. */
    get value() {
      return this.hasAttribute("value") ? this.attr("value") : this.#value;
    }
    set value(next) {
      this.#value = next;
      this.setAttribute("value", next);
    }
    /**
     * Reflect `value` into the live control in place — the native field already
     * shows what the user typed, so rebuilding it (as a full re-render would)
     * needlessly drops focus and caret. Every other observed attribute changes
     * the chrome and still re-renders via the base implementation.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "value") {
        if (oldValue === newValue) return;
        const value = newValue ?? "";
        reflectControlValue(
          this.querySelector(
            ".ody-inline-input__field, .ody-inline-input__textarea"
          ),
          value
        );
        this.#syncCounter(value);
        this.#syncClearButton(value);
        return;
      }
      super.attributeChangedCallback();
    }
    render() {
      const size = this.attr("size", "base");
      const isTextarea = this.flag("textarea");
      const isReadonly = this.flag("readonly");
      const isDisabled = this.flag("disabled");
      const warning = this.attr("warning");
      const info = this.attr("info");
      const caption = this.attr("caption");
      const value = this.value;
      const wrapperCls = classes(
        "ody-inline-input",
        info && "ody-inline-input--info",
        warning && "ody-inline-input--warning",
        this.flag("max-content") && "ody-inline-input--max-content",
        this.flag("full-width") && "ody-inline-input--full-width"
      );
      const label = this.attr("label");
      const labelEl = label ? `<label class="${classes("ody-inline-input__label", `ody-inline-input__label--${size}`)}"><span>${this.esc(label)}</span></label>` : "";
      const icon = this.attr("icon");
      const iconEl = icon ? `<div class="ody-inline-input__icon icon icon--size-small">${iconSvg(icon, "icon__svg")}</div>` : "";
      const maxlength = this.attr("maxlength");
      const maxlengthAttr = maxlength ? ` maxlength="${this.esc(maxlength)}"` : "";
      const groupCls = classes(
        "ody-inline-input__group",
        isTextarea && "ody-inline-input__group--textarea",
        isReadonly && "ody-inline-input__group--readonly",
        `ody-inline-input__group--${size}`
      );
      const field = isTextarea ? `<textarea class="ody-inline-input__textarea" rows="3"${maxlengthAttr}${isReadonly ? " readonly" : ""}${isDisabled ? " disabled" : ""}>${this.esc(value)}</textarea>` : `<input class="ody-inline-input__field" type="text" value="${this.esc(value)}" placeholder="${this.esc(this.attr("placeholder"))}"${maxlengthAttr}${isReadonly ? " readonly" : ""}${isDisabled ? " disabled" : ""} />`;
      const clearEl = this.#clearEnabled(value) ? this.#clearButtonHtml() : "";
      const showCounter = !isReadonly && !isDisabled && maxlength !== "";
      const footerNeeded = showCounter || caption !== "" || warning !== "" || info !== "";
      const footer = footerNeeded ? `<div class="ody-inline-input-footer"><div class="ody-inline-input-footer__message">` + (caption ? `<span class="ody-inline-input-footer__message__caption">${this.esc(caption)}</span>` : "") + (warning ? `<span class="ody-inline-input-footer__message__warning">${this.esc(warning)}</span>` : "") + (info ? `<span class="ody-inline-input-footer__message__info">${this.esc(info)}</span>` : "") + `</div>` + (showCounter ? `<div class="ody-inline-input-footer__length-message">${value.length} / ${this.esc(maxlength)}</div>` : "") + `</div>` : "";
      this.mount(
        `<div class="${wrapperCls}"${isDisabled ? ' aria-disabled="true"' : ""}>` + labelEl + `<div class="${groupCls}"${isDisabled ? ' aria-disabled="true"' : ""}><span class="ody-inline-input__leading" data-ody-slot></span>` + iconEl + field + clearEl + `</div>` + footer + `</div>`
      );
      const control = this.querySelector(
        ".ody-inline-input__field, .ody-inline-input__textarea"
      );
      control?.addEventListener("input", this.#onInput);
      control?.addEventListener("change", this.#onChange);
      this.querySelector(".ody-inline-input__clear-button")?.addEventListener("click", this.#onClear);
    }
    #onInput = (event) => {
      event.stopPropagation();
      const value = event.target.value;
      this.value = value;
      this.dispatchEvent(new CustomEvent("input", { detail: { value }, bubbles: true }));
    };
    #onChange = (event) => {
      event.stopPropagation();
      const value = event.target.value;
      this.dispatchEvent(new CustomEvent("change", { detail: { value }, bubbles: true }));
    };
    #onClear = () => {
      this.value = "";
      this.dispatchEvent(new CustomEvent("input", { detail: { value: "" }, bubbles: true }));
      this.dispatchEvent(new CustomEvent("change", { detail: { value: "" }, bubbles: true }));
    };
    #syncCounter(value) {
      const counter = this.querySelector(".ody-inline-input-footer__length-message");
      const max = this.attr("maxlength");
      if (counter && max) counter.textContent = `${value.length} / ${max}`;
    }
    /** Whether the clear button should be shown for the given value. */
    #clearEnabled(value) {
      return !this.flag("no-clear") && !this.flag("disabled") && !this.flag("readonly") && value !== "";
    }
    /** Markup for the clear button (shared by render and the in-place sync). */
    #clearButtonHtml() {
      return `<button type="button" class="btn ody-inline-input__clear-button" aria-label="${this.localized("clear-label", "clear")}">${iconSvg("close", "icon__svg clear-icon")}</button>`;
    }
    /** Add or remove the clear button in place as the value gains/loses content. */
    #syncClearButton(value) {
      const existing = this.querySelector(".ody-inline-input__clear-button");
      if (this.#clearEnabled(value)) {
        if (existing) return;
        const control = this.querySelector(".ody-inline-input__field, .ody-inline-input__textarea");
        control?.insertAdjacentHTML("afterend", this.#clearButtonHtml());
        this.querySelector(".ody-inline-input__clear-button")?.addEventListener("click", this.#onClear);
      } else {
        existing?.remove();
      }
    }
  };
  define("ody-inline-input", OdyInlineInput);
  var DEFAULT_PLACEHOLDER = "Search";
  var OdySearchInput = class extends OdyElement {
    static observedAttributes = [
      "value",
      "placeholder",
      "size",
      "info-message",
      "warning-message",
      "disabled"
    ];
    #value = "";
    /** Current field value. */
    get value() {
      return this.hasAttribute("value") ? this.attr("value") : this.#value;
    }
    set value(next) {
      this.#value = next;
      this.setAttribute("value", next);
    }
    /**
     * Reflect `value` into the live control in place — the native field already
     * shows what the user typed, so rebuilding it (as a full re-render would)
     * needlessly drops focus, caret and the `--focused` state. Every other
     * observed attribute changes the chrome and still re-renders via the base.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "value") {
        if (oldValue === newValue) return;
        reflectControlValue(this.querySelector(".ody-input__field"), newValue ?? "");
        return;
      }
      super.attributeChangedCallback();
    }
    render() {
      const size = this.attr("size", "base");
      const isDisabled = this.flag("disabled");
      const warning = this.attr("warning-message");
      const info = this.attr("info-message");
      const value = this.value;
      const placeholder = this.attr("placeholder") || DEFAULT_PLACEHOLDER;
      const wrapperCls = classes(
        "ody-input",
        "ody-search-input",
        info && "ody-input--info",
        warning && "ody-input--warning"
      );
      const containerCls = classes("ody-input__container", `ody-input__container--${size}`);
      const caption = warning || info;
      const footer = caption ? `<div class="ody-input__footer"><div class="ody-input__message__container"><span class="${warning ? "ody-input__warning" : "ody-input__caption"}">${this.esc(caption)}</span></div></div>` : "";
      this.mount(
        `<div class="ody-search-input-container"><div class="${wrapperCls}"${isDisabled ? ' aria-disabled="true"' : ""}><div class="${containerCls}"><div class="ody-input__icon icon icon--size-small">${iconSvg("search", "icon__svg")}</div><input class="ody-input__field" type="search" value="${this.esc(value)}" placeholder="${this.esc(placeholder)}"${isDisabled ? " disabled" : ""} /></div>` + footer + `</div></div>`
      );
      const input = this.querySelector(".ody-input__field");
      input?.addEventListener("input", this.#onInput);
      input?.addEventListener("change", this.#onChange);
      input?.addEventListener("focus", this.#onFocus);
      input?.addEventListener("blur", this.#onBlur);
    }
    #container() {
      return this.querySelector(".ody-input__container");
    }
    #onInput = (event) => {
      event.stopPropagation();
      const value = event.target.value;
      this.value = value;
      this.dispatchEvent(new CustomEvent("input", { detail: { value }, bubbles: true }));
    };
    #onChange = (event) => {
      event.stopPropagation();
      const value = event.target.value;
      this.dispatchEvent(new CustomEvent("change", { detail: { value }, bubbles: true }));
    };
    #onFocus = () => {
      this.#container()?.classList.add("ody-search-input--focused");
    };
    #onBlur = () => {
      this.#container()?.classList.remove("ody-search-input--focused");
    };
  };
  define("ody-search-input", OdySearchInput);
  var DEFAULT_PRECISION = 2;
  var CURRENCY_PRECISION = {
    JPY: 0
  };
  var CURRENCY_SYMBOL = {
    USD: "$",
    CAD: "$",
    AUD: "$",
    NZD: "$",
    MXN: "$",
    EUR: "\u20AC",
    GBP: "\xA3",
    JPY: "\xA5"
  };
  var OdyMoneyInput = class extends OdyElement {
    static observedAttributes = [
      "value",
      "currency",
      "max-amount",
      "label",
      "size",
      "warning",
      "readonly",
      "disabled"
    ];
    #value = "";
    /** Current amount value. */
    get value() {
      return this.hasAttribute("value") ? this.attr("value") : this.#value;
    }
    set value(next) {
      this.#value = next;
      this.setAttribute("value", next);
    }
    /** Decimal precision for the configured currency. */
    get precision() {
      return CURRENCY_PRECISION[this.attr("currency", "USD")] ?? DEFAULT_PRECISION;
    }
    /**
     * Reflect a `value` change into the live control in place instead of a full
     * re-render, so a framework-controlled `value` binding never drops focus or
     * caret while the user is typing. Other observed attributes change the chrome
     * and still re-render via the base implementation.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "value") {
        if (oldValue === newValue) return;
        reflectControlValue(this.querySelector(".ody-input__field"), newValue ?? "");
        return;
      }
      super.attributeChangedCallback();
    }
    render() {
      const size = this.attr("size", "base");
      const isReadonly = this.flag("readonly");
      const isDisabled = this.flag("disabled");
      const warning = this.attr("warning");
      const currency = this.attr("currency", "USD");
      const symbol = CURRENCY_SYMBOL[currency] ?? currency;
      const value = this.value;
      const wrapperCls = classes("ody-input", "ody-money-input", warning && "ody-input--warning");
      const containerCls = classes(
        "ody-input__container",
        isReadonly && "ody-input__container--readonly",
        `ody-input__container--${size}`
      );
      const label = this.attr("label");
      const labelEl = label ? `<label class="ody-input__label">${this.esc(label)}</label>` : "";
      const footer = warning ? `<div class="ody-input__footer"><div class="ody-input__message__container"><span class="ody-input__warning">${this.esc(warning)}</span></div></div>` : "";
      this.mount(
        `<div class="ody-money-input-container"><div class="${wrapperCls}"${isDisabled ? ' aria-disabled="true"' : ""}>` + labelEl + `<div class="${containerCls}"><span class="ody-money-input__currency">${this.esc(symbol)}</span><input class="ody-input__field" type="text" inputmode="decimal" value="${this.esc(value)}"${isReadonly ? " readonly" : ""}${isDisabled ? " disabled" : ""} /></div>` + footer + `</div></div>`
      );
      const input = this.querySelector(".ody-input__field");
      input?.addEventListener("input", this.#onInput);
      input?.addEventListener("blur", this.#onBlur);
      input?.addEventListener("change", this.#onNativeChange);
    }
    #onNativeChange = (event) => {
      event.stopPropagation();
    };
    #onInput = (event) => {
      event.stopPropagation();
      const value = event.target.value;
      this.value = value;
      this.dispatchEvent(new CustomEvent("input", { detail: { value }, bubbles: true }));
    };
    #onBlur = (event) => {
      const raw = event.target.value;
      const value = this.#format(raw);
      this.value = value;
      this.dispatchEvent(new CustomEvent("change", { detail: { value }, bubbles: true }));
    };
    /** Sanitise, clamp to `max-amount`, and round to the currency precision. */
    #format(raw) {
      const cleaned = raw.replace(/[^\d.]/g, "");
      let amount = Number.parseFloat(cleaned);
      if (!Number.isFinite(amount)) amount = 0;
      const max = Number.parseFloat(this.attr("max-amount"));
      if (Number.isFinite(max) && amount > max) amount = max;
      return amount.toFixed(this.precision);
    }
  };
  define("ody-money-input", OdyMoneyInput);
  var MIN_VALUE = 0;
  var MAX_VALUE = 100;
  var NON_NUMERIC_KEY = /[a-zA-Z_^%$#!~@,&()+-]/;
  var OdyPercentageInput = class extends OdyElement {
    static observedAttributes = ["value", "label", "size", "warning", "readonly", "disabled"];
    #value = "";
    /** Current percentage value. */
    get value() {
      return this.hasAttribute("value") ? this.attr("value") : this.#value;
    }
    set value(next) {
      this.#value = next;
      this.setAttribute("value", next);
    }
    /**
     * Reflect a `value` change into the live control in place instead of a full
     * re-render, so a framework-controlled `value` binding never drops focus or
     * caret while the user is typing. Other observed attributes change the chrome
     * and still re-render via the base implementation.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "value") {
        if (oldValue === newValue) return;
        reflectControlValue(this.querySelector(".ody-input__field"), newValue ?? "");
        return;
      }
      super.attributeChangedCallback();
    }
    render() {
      const size = this.attr("size", "base");
      const isReadonly = this.flag("readonly");
      const isDisabled = this.flag("disabled");
      const warning = this.attr("warning");
      const value = this.value;
      const wrapperCls = classes("ody-input", "ody-percentage-input", warning && "ody-input--warning");
      const containerCls = classes(
        "ody-input__container",
        isReadonly && "ody-input__container--readonly",
        `ody-input__container--${size}`
      );
      const label = this.attr("label");
      const labelEl = label ? `<label class="ody-input__label">${this.esc(label)}</label>` : "";
      const footer = warning ? `<div class="ody-input__footer"><div class="ody-input__message__container"><span class="ody-input__warning">${this.esc(warning)}</span></div></div>` : "";
      this.mount(
        `<div class="ody-percentage-input-container"><div class="${wrapperCls}"${isDisabled ? ' aria-disabled="true"' : ""}>` + labelEl + `<div class="${containerCls}"><input class="ody-input__field" type="text" inputmode="numeric" value="${this.esc(value)}"${isReadonly ? " readonly" : ""}${isDisabled ? " disabled" : ""} /><span class="ody-percentage-input__percent">%</span></div>` + footer + `</div></div>`
      );
      const input = this.querySelector(".ody-input__field");
      input?.addEventListener("keypress", this.#onKeypress);
      input?.addEventListener("input", this.#onInput);
      input?.addEventListener("blur", this.#onBlur);
      input?.addEventListener("change", this.#onNativeChange);
    }
    #onNativeChange = (event) => {
      event.stopPropagation();
    };
    #onKeypress = (event) => {
      if (NON_NUMERIC_KEY.test(event.key)) {
        event.preventDefault();
        return;
      }
      const input = event.target;
      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? start;
      const next = input.value.slice(0, start) + event.key + input.value.slice(end);
      const num = Number(next);
      if (num > MAX_VALUE || num < MIN_VALUE) event.preventDefault();
    };
    #onInput = (event) => {
      event.stopPropagation();
      const value = event.target.value;
      this.value = value;
      this.dispatchEvent(new CustomEvent("input", { detail: { value }, bubbles: true }));
    };
    #onBlur = (event) => {
      const value = this.#clamp(event.target.value);
      this.value = value;
      this.dispatchEvent(new CustomEvent("change", { detail: { value }, bubbles: true }));
    };
    /** Sanitise to digits/decimal, then clamp into the 0–100 range. */
    #clamp(raw) {
      const cleaned = raw.replace(/[^\d.]/g, "");
      let num = Number(cleaned);
      if (!Number.isFinite(num)) num = MIN_VALUE;
      if (num >= MAX_VALUE) num = MAX_VALUE;
      if (cleaned === "" || num <= MIN_VALUE) num = MIN_VALUE;
      return `${num}`;
    }
  };
  define("ody-percentage-input", OdyPercentageInput);
  function applyCheckboxState(root, checked, indeterminate) {
    if (!root) return;
    root.classList.toggle("ody-checkbox--checked", checked);
    const input = root.querySelector(".ody-checkbox__input");
    if (input) {
      input.checked = checked;
      input.indeterminate = indeterminate;
    }
    const box = root.querySelector(".ody-checkbox__box");
    box?.querySelector(".ody-checkbox__mark")?.remove();
    const icon = indeterminate ? "minus" : checked ? "check" : "";
    if (icon && box) {
      const mark = document.createElement("span");
      mark.className = "ody-checkbox__mark";
      mark.innerHTML = iconSvg(icon, "icon__svg");
      box.appendChild(mark);
    }
  }
  var OdyCheckbox = class extends OdyElement {
    static observedAttributes = ["label", "size", "checked", "indeterminate", "disabled"];
    /** Whether the box is checked (mirrors the `checked` attribute). */
    get checked() {
      return this.flag("checked");
    }
    set checked(next) {
      if (next) this.setAttribute("checked", "");
      else this.removeAttribute("checked");
    }
    /** Convenience alias for {@link checked}. */
    get value() {
      return this.checked;
    }
    set value(next) {
      this.checked = next;
    }
    /**
     * Reflect `checked` / `indeterminate` in place instead of a full re-render, so
     * selecting the box (mouse or keyboard) never rebuilds the native `<input>`
     * and drops focus. Other observed attributes still re-render via the base.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if ((name === "checked" || name === "indeterminate") && this.querySelector(".ody-checkbox__input")) {
        if (oldValue === newValue) return;
        this.#syncChecked();
        return;
      }
      super.attributeChangedCallback();
    }
    /** Update the live control, wrapper class, and check/minus mark in place. */
    #syncChecked() {
      applyCheckboxState(
        this.querySelector(".ody-checkbox"),
        this.flag("checked"),
        this.flag("indeterminate")
      );
    }
    render() {
      const size = this.attr("size", "small");
      const isChecked = this.flag("checked");
      const isIndeterminate = this.flag("indeterminate");
      const isDisabled = this.flag("disabled");
      const wrapperCls = classes("ody-checkbox", isChecked && "ody-checkbox--checked");
      const inputCls = classes("ody-checkbox__input", `ody-checkbox__input--size-${size}`);
      const mark = isIndeterminate ? `<span class="ody-checkbox__mark">${iconSvg("minus", "icon__svg")}</span>` : isChecked ? `<span class="ody-checkbox__mark">${iconSvg("check", "icon__svg")}</span>` : "";
      const label = this.attr("label");
      const labelEl = label ? `<label class="ody-checkbox__label"${isDisabled ? " disabled" : ""}>${this.esc(label)}</label>` : "";
      this.mount(
        `<div class="${wrapperCls}"><div class="ody-checkbox__container"><span class="ody-checkbox__box"><input class="${inputCls}" type="checkbox"${isChecked ? " checked" : ""}${isDisabled ? " disabled" : ""} />` + mark + `</span>` + labelEl + `<span data-ody-slot></span></div></div>`
      );
      const input = this.querySelector(".ody-checkbox__input");
      if (input) input.indeterminate = isIndeterminate;
      input?.addEventListener("change", this.#onChange);
    }
    #onChange = (event) => {
      event.stopPropagation();
      const checked = event.target.checked;
      this.checked = checked;
      this.dispatchEvent(
        new CustomEvent("change", { detail: { checked, value: checked }, bubbles: true })
      );
    };
  };
  define("ody-checkbox", OdyCheckbox);
  var groupSeq = 0;
  var OdyRadioButtonGroup = class extends OdyElement {
    static observedAttributes = ["options", "value", "size", "disabled"];
    #name = `ody-radio-button-group-${groupSeq += 1}`;
    /** Options set via the JS property; when set it wins over the attribute. */
    #options = null;
    /** The selected option value. */
    get value() {
      return this.attr("value");
    }
    set value(next) {
      this.setAttribute("value", next);
    }
    /** Options: the JS property wins, else the JSON `options` attribute. */
    get options() {
      return this.#options ?? parseOptions(this.attr("options"));
    }
    set options(next) {
      this.#options = coerceOptions(next);
      if (this.querySelector(".ody-radio-button-group")) this.render();
    }
    /**
     * Reflect a `value` change by re-checking the matching radio in place instead
     * of rebuilding the fieldset — a full re-render would replace the focused
     * radio and break keyboard (arrow-key) navigation between options.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "value" && this.querySelector(".ody-radio-button-input__field")) {
        if (oldValue === newValue) return;
        const selected = this.value;
        for (const input of this.querySelectorAll(".ody-radio-button-input__field")) {
          input.checked = input.value === selected;
        }
        return;
      }
      super.attributeChangedCallback();
    }
    render() {
      const size = this.attr("size", "base");
      const isDisabled = this.flag("disabled");
      const selected = this.value;
      const rows = this.options.map((option) => {
        const checked = option.value === selected;
        const rowCls = classes("ody-radio-button-input", size === "small" && "ody-radio-button-input--small");
        return `<div class="${rowCls}"><input class="ody-radio-button-input__field" type="radio" name="${this.#name}" value="${this.esc(option.value)}"${checked ? " checked" : ""}${isDisabled ? " disabled" : ""} /><label class="ody-radio-button-input__label">${this.esc(option.label)}</label></div>`;
      }).join("");
      const cls = classes("ody-radio-button-group", size === "small" && "ody-radio-button-group--small");
      this.mount(`<fieldset class="${cls}" aria-label="${this.localized("aria-label", "radioGroup")}">${rows}</fieldset>`);
      for (const input of this.querySelectorAll(".ody-radio-button-input__field")) {
        input.addEventListener("change", this.#onChange);
      }
    }
    #onChange = (event) => {
      event.stopPropagation();
      const value = event.target.value;
      this.value = value;
      this.dispatchEvent(new CustomEvent("change", { detail: { value }, bubbles: true }));
    };
  };
  function coerceOptions(next) {
    if (Array.isArray(next)) return next;
    if (typeof next === "string") return parseOptions(next);
    return [];
  }
  function parseOptions(raw) {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((entry) => typeof entry === "object" && entry !== null && "value" in entry).map((entry) => ({ label: String(entry.label ?? entry.value), value: String(entry.value) }));
    } catch {
      return [];
    }
  }
  define("ody-radio-button-group", OdyRadioButtonGroup);
  var OdyCheckboxGroup = class extends OdyElement {
    static observedAttributes = ["options", "value", "select-all-label", "size", "disabled"];
    /** Options set via the JS property; when set it wins over the attribute. */
    #options = null;
    /**
     * The selected option values. The reflected `value` attribute is serialized
     * as a JSON array so values containing commas round-trip; a legacy
     * comma-separated attribute is still read for backwards compatibility.
     */
    get value() {
      const raw = this.attr("value");
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {
      }
      return raw.split(",").filter(Boolean);
    }
    set value(next) {
      this.setAttribute("value", JSON.stringify(Array.isArray(next) ? next : []));
    }
    /** Options: the JS property wins, else the JSON `options` attribute. */
    get options() {
      return this.#options ?? parseOptions2(this.attr("options"));
    }
    /**
     * Accepts an array of `{ label, value }` (or a JSON string) and stores it as
     * the source of truth. Mirrors `<ody-dropdown-*>` so `el.options = [...]`
     * works, without reflecting a large JSON blob onto the DOM attribute.
     */
    set options(next) {
      this.#options = coerceOptions2(next);
      if (this.querySelector(".ody-checkbox-group")) this.render();
    }
    /**
     * Reflect a `value` change by updating each checkbox (and the select-all
     * parent) in place, so toggling an option keeps focus instead of rebuilding
     * the group. Other observed attributes still re-render via the base.
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "value" && this.querySelector(".ody-checkbox-group")) {
        if (oldValue === newValue) return;
        this.#syncSelection();
        return;
      }
      super.attributeChangedCallback();
    }
    /** Recompute checked/indeterminate state for every checkbox in place. */
    #syncSelection() {
      const options = this.options;
      const selected = new Set(this.value);
      const allChecked = options.length > 0 && options.every((o) => selected.has(o.value));
      const someChecked = !allChecked && options.some((o) => selected.has(o.value));
      for (const cb of this.querySelectorAll(".ody-checkbox-group__item .ody-checkbox")) {
        const input = cb.querySelector(".ody-checkbox__input");
        applyCheckboxState(cb, input ? selected.has(input.value) : false, false);
      }
      applyCheckboxState(this.querySelector(".ody-checkbox-group__select-all"), allChecked, someChecked);
    }
    render() {
      const size = this.attr("size", "small");
      const isDisabled = this.flag("disabled");
      const options = this.options;
      const selected = new Set(this.value);
      const selectAllLabel = this.attr("select-all-label");
      const allChecked = options.length > 0 && options.every((o) => selected.has(o.value));
      const someChecked = !allChecked && options.some((o) => selected.has(o.value));
      const mainRow = this.hasAttribute("select-all-label") ? `<div class="ody-checkbox-group__main">` + this.#checkboxMarkup({
        cls: "ody-checkbox-group__select-all",
        label: selectAllLabel,
        checked: allChecked,
        indeterminate: someChecked,
        disabled: isDisabled,
        size
      }) + `</div>` : "";
      const items = options.map((option) => `<div class="ody-checkbox-group__item">` + this.#checkboxMarkup({
        cls: "",
        label: option.label,
        checked: selected.has(option.value),
        indeterminate: false,
        disabled: isDisabled,
        size,
        value: option.value
      }) + `</div>`).join("");
      this.mount(
        `<div class="ody-checkbox-group">` + mainRow + `<div class="ody-checkbox-group__items">${items}</div></div>`
      );
      const main = this.querySelector(".ody-checkbox-group__select-all .ody-checkbox__input");
      if (main) main.indeterminate = someChecked;
      main?.addEventListener("change", this.#onSelectAll);
      for (const input of this.querySelectorAll(
        ".ody-checkbox-group__item .ody-checkbox__input"
      )) {
        input.addEventListener("change", this.#onItem);
      }
    }
    /** Render one checkbox (reused for the parent and each item). */
    #checkboxMarkup(opts) {
      const wrapperCls = classes("ody-checkbox", opts.cls, opts.checked && "ody-checkbox--checked");
      const inputCls = classes("ody-checkbox__input", `ody-checkbox__input--size-${opts.size}`);
      const mark = opts.indeterminate ? `<span class="ody-checkbox__mark">${iconSvg("minus", "icon__svg")}</span>` : opts.checked ? `<span class="ody-checkbox__mark">${iconSvg("check", "icon__svg")}</span>` : "";
      const valueAttr = opts.value !== void 0 ? ` value="${this.esc(opts.value)}"` : "";
      return `<div class="${wrapperCls}"><div class="ody-checkbox__container"><span class="ody-checkbox__box"><input class="${inputCls}" type="checkbox"${valueAttr}${opts.checked ? " checked" : ""}${opts.disabled ? " disabled" : ""} />` + mark + `</span><label class="ody-checkbox__label">${this.esc(opts.label)}</label></div></div>`;
    }
    #onSelectAll = (event) => {
      event.stopPropagation();
      const checked = event.target.checked;
      this.value = checked ? this.options.map((o) => o.value) : [];
      this.#emit();
    };
    #onItem = (event) => {
      event.stopPropagation();
      const input = event.target;
      const selected = new Set(this.value);
      if (input.checked) selected.add(input.value);
      else selected.delete(input.value);
      this.value = this.options.map((o) => o.value).filter((v) => selected.has(v));
      this.#emit();
    };
    #emit() {
      this.dispatchEvent(new CustomEvent("change", { detail: { value: this.value }, bubbles: true }));
    }
  };
  function coerceOptions2(next) {
    if (Array.isArray(next)) return next;
    if (typeof next === "string") return parseOptions2(next);
    return [];
  }
  function parseOptions2(raw) {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((entry) => typeof entry === "object" && entry !== null && "value" in entry).map((entry) => ({ label: String(entry.label ?? entry.value), value: String(entry.value) }));
    } catch {
      return [];
    }
  }
  define("ody-checkbox-group", OdyCheckboxGroup);
  var OdyAccordion = class extends OdyElement {
    static observedAttributes = ["title", "open", "sticky"];
    render() {
      const expanded = this.flag("open");
      const containerCls = classes("ody-accordion", this.flag("sticky") && "ody-accordion--sticky-header");
      const icon = expanded ? "chevron-up" : "chevron-down";
      const bodyCls = classes("ody-accordion__body-container", !expanded && "ody-accordion__body-container--hidden");
      this.mount(
        `<div class="${containerCls}"><div class="ody-accordion__header-container" tabindex="0" role="button" aria-expanded="${expanded ? "true" : "false"}"><div class="ody-accordion__content-container"><div class="ody-accordion__content-container__title">${this.esc(this.attr("title"))}</div></div><div class="ody-accordion__icon-container">${iconSvg(icon, "icon__svg")}</div></div><div class="${bodyCls}" data-ody-slot></div></div>`
      );
      const header = this.querySelector(".ody-accordion__header-container");
      header?.addEventListener("click", this.#toggle);
    }
    #toggle = () => {
      const next = !this.flag("open");
      if (next) this.setAttribute("open", "");
      else this.removeAttribute("open");
      this.dispatchEvent(new CustomEvent("toggle", { detail: { open: next }, bubbles: true }));
    };
  };
  define("ody-accordion", OdyAccordion);
  var OdyCollapsible = class extends OdyElement {
    static observedAttributes = ["label", "open"];
    render() {
      const expanded = this.flag("open");
      const headerCls = classes("ody-collapsible__header", expanded && "ody-collapsible__header--expanded");
      const contentCls = classes("ody-collapsible__content", expanded && "ody-collapsible__content--active");
      const wrapperCls = classes("ody-collapsible", expanded && "ody-collapsible--expanded");
      this.mount(
        `<div class="ody-collapsible-container"><div class="${wrapperCls}"><div class="${headerCls}" role="button" tabindex="0" aria-expanded="${expanded ? "true" : "false"}"><div class="ody-collapsible__header__label">${this.esc(this.attr("label"))}</div><div class="ody-collapsible__header__icon">${iconSvg("chevron-down", "icon__svg")}</div></div><div class="${contentCls}" data-ody-slot></div></div></div>`
      );
      const header = this.querySelector(".ody-collapsible__header");
      header?.addEventListener("click", this.#toggle);
    }
    #toggle = () => {
      const next = !this.flag("open");
      if (next) this.setAttribute("open", "");
      else this.removeAttribute("open");
      this.dispatchEvent(new CustomEvent("toggle", { detail: { open: next }, bubbles: true }));
    };
  };
  define("ody-collapsible", OdyCollapsible);
  var OdyTabs = class extends OdyElement {
    static observedAttributes = ["tabs", "active", "size", "position"];
    #parseTabs() {
      const raw = this.attr("tabs");
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((t) => Boolean(t) && typeof t.id === "string");
      } catch {
        return [];
      }
    }
    render() {
      const tabs = this.#parseTabs();
      const size = this.attr("size", "base");
      const active = this.attr("active") || (tabs[0]?.id ?? "");
      const listCls = classes("tab-list", this.attr("position") === "left" && "tab-list--left");
      const items = tabs.map((t) => {
        const isActive = t.id === active;
        const cls = classes(
          "tab-item",
          `tab-item--size-${size}`,
          isActive && "tab-item--active",
          t.disabled && "tab-item--disabled"
        );
        return `<button type="button" role="tab" class="${cls}" data-tab-id="${this.esc(t.id)}" aria-selected="${isActive ? "true" : "false"}"${t.disabled ? " disabled" : ""}>${this.esc(t.label)}</button>`;
      }).join("");
      this.mount(`<div class="${listCls}" role="tablist">${items}</div>`);
      for (const btn of this.querySelectorAll(".tab-item")) {
        btn.addEventListener("click", this.#onClick);
      }
    }
    #onClick = (event) => {
      const btn = event.currentTarget;
      if (btn.hasAttribute("disabled")) return;
      const id = btn.getAttribute("data-tab-id") ?? "";
      this.setAttribute("active", id);
      this.dispatchEvent(new CustomEvent("change", { detail: { id }, bubbles: true }));
    };
  };
  define("ody-tabs", OdyTabs);
  var OdyCopyButton = class extends OdyElement {
    static observedAttributes = ["value", "label"];
    #state = "idle";
    #timer;
    render() {
      const label = this.attr("label");
      const icon = this.#state === "success" ? "check-filled" : this.#state === "error" ? "danger" : "copy";
      const appearance = this.#state === "success" ? "success" : this.#state === "error" ? "danger" : "interaction";
      const cls = classes(
        "ody-button",
        "btn",
        "btn-secondary",
        "ody-button--size-base",
        appearance,
        !label && "ody-button--icon-only"
      );
      const labelEl = label ? `<span class="ody-button__label">${this.esc(label)}</span>` : "";
      this.mount(
        `<button type="button" class="${cls}" data-test-ody-copy-button><span class="ody-button__left-icon">${iconSvg(icon, "icon__svg")}</span>${labelEl}</button>`
      );
      this.querySelector("button")?.addEventListener("click", this.#onClick);
    }
    #onClick = () => {
      const value = this.attr("value");
      const ok = this.#execCopy(value);
      if (!ok) {
        const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : void 0;
        if (clipboard && typeof clipboard.writeText === "function") {
          void clipboard.writeText(value).then(
            () => void 0,
            () => void 0
          );
        }
      }
      this.#feedback(ok ? "success" : "error", value);
    };
    /**
     * Synchronous clipboard write. Must be called within the user-gesture window
     * (i.e. directly from the click handler, not from an async continuation).
     * Works in cross-origin iframes and legacy contexts where the async Clipboard
     * API is unavailable or blocked.
     */
    #execCopy(value) {
      if (!value || typeof document === "undefined") return false;
      const el = document.createElement("textarea");
      el.value = value;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.top = "0";
      el.style.left = "0";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      try {
        el.setSelectionRange(0, value.length);
      } catch {
      }
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
      }
      document.body.removeChild(el);
      return ok;
    }
    #feedback(state, value) {
      this.#state = state;
      this.render();
      this.dispatchEvent(new CustomEvent("copy", { detail: { value, ok: state === "success" }, bubbles: true }));
      if (this.#timer) clearTimeout(this.#timer);
      const duration = Number.parseInt(this.attr("success-duration", "1200"), 10);
      this.#timer = setTimeout(() => {
        this.#state = "idle";
        if (this.isConnected) this.render();
      }, Number.isFinite(duration) ? duration : 1200);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      if (this.#timer) clearTimeout(this.#timer);
      this.#timer = void 0;
    }
  };
  define("ody-copy-button", OdyCopyButton);
  var STATUS_META = {
    IN_PROGRESS: { icon: "spinner", color: "var(--color-info-300)", term: "checkInInProgress" },
    NO_SHOW: { icon: "close", color: "var(--color-danger-300)", term: "checkInNoShow" },
    OVERDUE: { icon: "warning", color: "var(--color-warning-300)", term: "checkInOverdue" },
    RESERVED: { icon: "info", color: "var(--color-neutral-300)", term: "checkInReserved" },
    RETURNED: { icon: "check-filled", color: "var(--color-success-300)", term: "checkInReturned" },
    NONE: { icon: "info", color: "var(--color-neutral-300)", term: "checkInNone" }
  };
  var DEFAULT_STATUS = "RESERVED";
  var OdyCheckInStatus = class extends OdyElement {
    static observedAttributes = ["status", "label", "optional-text"];
    render() {
      const status = this.attr("status", DEFAULT_STATUS);
      const meta = STATUS_META[status] ?? STATUS_META[DEFAULT_STATUS];
      const label = this.attr("label") || this.term(meta.term);
      const optional = this.attr("optional-text");
      const optionalEl = optional ? `<div class="check-in-status__inner-content__optional-text">${this.esc(optional)}</div>` : "";
      this.mount(
        `<div class="check-in-status-container"><div class="check-in-status"><span class="icon" style="color:${meta.color}">${iconSvg(meta.icon, "icon__svg")}</span><div class="check-in-status__inner-content"><div class="${classes("check-in-status__inner-content__status-label")}">${this.esc(label)}</div>` + optionalEl + `</div></div></div>`
      );
    }
  };
  define("ody-check-in-status", OdyCheckInStatus);
  var OdyOption = class extends OdyElement {
    static observedAttributes = ["selected", "disabled", "sub-menu", "trigger-icon"];
    render() {
      const cls = classes(
        "ody-option",
        this.flag("selected") && "ody-option--selected",
        this.flag("disabled") && "ody-option--disabled"
      );
      const trigger = this.flag("sub-menu") ? `<div class="ody-option__popover"><button type="button" class="ody-option__popover__popover-trigger" aria-label="${this.localized("open-submenu-label", "openSubMenu")}">${iconSvg(this.attr("trigger-icon", "chevron-right"), "icon__svg")}</button></div>` : "";
      this.mount(
        `<div class="ody-option-container"><div class="${cls}" role="button" tabindex="0"><div class="ody-option__content-group"><div class="ody-option__content-group__content" data-ody-slot></div></div>` + trigger + `</div></div>`
      );
      if (!this.flag("disabled")) {
        this.querySelector(".ody-option")?.addEventListener("click", this.#onSelect);
      }
      this.querySelector(".ody-option__popover__popover-trigger")?.addEventListener("click", this.#onSubMenu);
    }
    #onSelect = () => {
      this.dispatchEvent(new CustomEvent("select", { bubbles: true }));
    };
    #onSubMenu = (event) => {
      event.stopPropagation();
      this.dispatchEvent(new CustomEvent("submenu", { bubbles: true }));
    };
  };
  define("ody-option", OdyOption);
  var OdySplitButton = class extends OdyElement {
    static observedAttributes = ["text", "variant", "size", "icon", "open"];
    render() {
      const variant = this.attr("variant", "secondary");
      const size = this.attr("size", "base");
      const open = this.flag("open");
      const leftCls = classes("ody-button", "btn", `btn-${variant}`, `ody-button--size-${size}`, "interaction", "split-button__left-button");
      const rightCls = classes(
        "ody-button",
        "btn",
        `btn-${variant}`,
        `ody-button--size-${size}`,
        "interaction",
        "split-button__right-button",
        open && "ody-button--active"
      );
      this.mount(
        `<div class="split-button-container"><button type="button" class="${leftCls}"><span class="ody-button__label">${this.esc(this.attr("text"))}</span></button><button type="button" class="${rightCls}" aria-expanded="${open ? "true" : "false"}" aria-label="${this.localized("toggle-menu-label", "toggleMenu")}"><span class="icon">${iconSvg(this.attr("icon", "chevron-down"), "icon__svg")}</span></button><div class="split-button__panel"${open ? "" : " hidden"} data-ody-slot></div></div>`
      );
      this.querySelector(".split-button__left-button")?.addEventListener("click", this.#onPrimary);
      this.querySelector(".split-button__right-button")?.addEventListener("click", this.#onToggle);
    }
    #onPrimary = () => {
      this.dispatchEvent(new CustomEvent("primary", { bubbles: true }));
    };
    #onToggle = () => {
      const next = !this.flag("open");
      if (next) this.setAttribute("open", "");
      else this.removeAttribute("open");
      this.dispatchEvent(new CustomEvent("toggle", { detail: { open: next }, bubbles: true }));
    };
  };
  define("ody-split-button", OdySplitButton);
  var NEXT_DIRECTION = {
    UNSET: "DESC",
    DESC: "ASC",
    ASC: "UNSET"
  };
  var DIRECTION_ICON = {
    UNSET: "arrow-up-down",
    DESC: "chevron-down",
    ASC: "chevron-up"
  };
  var OdyTableHeader = class extends OdyElement {
    static observedAttributes = ["column-name", "column-id", "direction", "static", "rounded-left", "rounded-right"];
    #direction() {
      const raw = this.attr("direction", "UNSET").toUpperCase();
      return raw === "ASC" || raw === "DESC" ? raw : "UNSET";
    }
    render() {
      const name = this.esc(this.attr("column-name"));
      const roundedLeft = this.flag("rounded-left") && "table-header-container--rounded-left";
      const roundedRight = this.flag("rounded-right") && "table-header-container--rounded-right";
      if (this.flag("static")) {
        const cls2 = classes("table-header-container", "table-header-container--static", roundedLeft, roundedRight);
        this.mount(`<div class="${cls2}"><span class="table-header__text">${name}</span></div>`);
        return;
      }
      const direction = this.#direction();
      const active = direction !== "UNSET";
      const cls = classes(
        "table-header-container",
        "table-header-container--has-hover",
        roundedLeft,
        roundedRight,
        active && "table-header-container--active"
      );
      this.mount(
        `<div class="${cls}" tabindex="0" role="button"><div class="table-header__inner-content"><div class="table-header__text">${name}</div><span class="icon icon--size-medium">${iconSvg(DIRECTION_ICON[direction], "icon__svg")}</span></div></div>`
      );
      this.querySelector(".table-header-container")?.addEventListener("click", this.#onClick);
    }
    #onClick = () => {
      const next = NEXT_DIRECTION[this.#direction()];
      this.setAttribute("direction", next);
      this.dispatchEvent(
        new CustomEvent("sort", { detail: { direction: next, columnId: this.attr("column-id") }, bubbles: true })
      );
    };
  };
  define("ody-table-header", OdyTableHeader);
  function portal(node) {
    if (node.parentNode !== document.body) document.body.appendChild(node);
    return node;
  }
  function removePortal(node) {
    if (node.parentNode) node.parentNode.removeChild(node);
  }
  function position(anchor, floating, placement = "bottom", gap = 8) {
    const a = anchor.getBoundingClientRect();
    const f = floating.getBoundingClientRect();
    const vw = window.innerWidth || Infinity;
    const vh = window.innerHeight || Infinity;
    let resolved = placement;
    if (placement === "bottom" && a.bottom + gap + f.height > vh && a.top - gap - f.height >= 0) {
      resolved = "top";
    } else if (placement === "top" && a.top - gap - f.height < 0 && a.bottom + gap + f.height <= vh) {
      resolved = "bottom";
    } else if (placement === "right" && a.right + gap + f.width > vw && a.left - gap - f.width >= 0) {
      resolved = "left";
    } else if (placement === "left" && a.left - gap - f.width < 0 && a.right + gap + f.width <= vw) {
      resolved = "right";
    }
    const scrollX = window.scrollX || 0;
    const scrollY = window.scrollY || 0;
    let top = 0;
    let left = 0;
    switch (resolved) {
      case "top":
        top = a.top - f.height - gap;
        left = a.left + (a.width - f.width) / 2;
        break;
      case "bottom":
        top = a.bottom + gap;
        left = a.left + (a.width - f.width) / 2;
        break;
      case "left":
        top = a.top + (a.height - f.height) / 2;
        left = a.left - f.width - gap;
        break;
      case "right":
        top = a.top + (a.height - f.height) / 2;
        left = a.right + gap;
        break;
    }
    return { top: top + scrollY, left: left + scrollX, placement: resolved };
  }
  var KEY_ESCAPE = "Escape";
  var EVENT_CLOSE = "close";
  var OdyModal = class extends OdyElement {
    static observedAttributes = ["open", "heading", "size", "icon"];
    #backdrop = null;
    #dialog = null;
    #onKeydown = (e) => {
      if (e.key === KEY_ESCAPE && this.flag("open")) this.close();
    };
    /** Open the modal (sets the `open` attribute). */
    open() {
      this.setAttribute("open", "");
    }
    /** Close the modal, removing the `open` attribute and dispatching `close`. */
    close() {
      this.removeAttribute("open");
      this.dispatchEvent(new CustomEvent(EVENT_CLOSE, { bubbles: true }));
    }
    render() {
      if (this.#dialog) this.adopt(this.#dialog);
      if (this.#backdrop) removePortal(this.#backdrop);
      const isOpen = this.flag("open");
      const size = this.attr("size", "base");
      const heading = this.attr("heading");
      const icon = this.attr("icon");
      const iconEl = icon ? `<span class="ody-modal__header__icon icon icon--size-medium">${iconSvg(icon, "icon__svg")}</span>` : "";
      const headingEl = heading || icon ? `<div class="ody-modal__header">` + iconEl + `<p class="ody-modal__header__title title">${this.esc(heading)}</p><button type="button" class="ody-modal__header__button" data-ody-modal-close aria-label="${this.localized("close-label", "close")}">${iconSvg("close", "icon__svg")}</button></div>` : "";
      this.mount(
        `<div class="${classes("ody-modal-backdrop", !isOpen && "ody-modal-backdrop--hidden")}" data-ody-modal-backdrop></div><div class="${classes("ody-modal", `ody-modal--size-${size}`, isOpen && "ody-modal--open")}" role="dialog" aria-modal="true" tabindex="-1">` + headingEl + `<div class="ody-modal__content-wrapper" data-ody-slot></div></div>`
      );
      const backdrop = this.querySelector("[data-ody-modal-backdrop]");
      const dialog = this.querySelector(".ody-modal");
      this.#backdrop = backdrop;
      this.#dialog = dialog;
      backdrop.addEventListener("click", this.#onBackdrop);
      dialog.querySelector("[data-ody-modal-close]")?.addEventListener("click", this.#onCloseClick);
      portal(backdrop);
      portal(dialog);
    }
    #onBackdrop = (e) => {
      if (e.target === this.#backdrop) this.close();
    };
    #onCloseClick = () => {
      this.close();
    };
    connectedCallback() {
      super.connectedCallback();
      document.addEventListener("keydown", this.#onKeydown);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      document.removeEventListener("keydown", this.#onKeydown);
      this.reclaimPortaledSlot(this.#dialog);
      if (this.#backdrop) removePortal(this.#backdrop);
      if (this.#dialog) removePortal(this.#dialog);
      this.#backdrop = null;
      this.#dialog = null;
    }
  };
  define("ody-modal", OdyModal);
  var EVENT_OPEN = "open";
  var EVENT_CLOSE2 = "close";
  var OdyPopover = class extends OdyElement {
    static observedAttributes = ["placement", "for"];
    #panel = null;
    #trigger = null;
    #visible = false;
    /** Whether the popover panel is currently shown. */
    get isOpen() {
      return this.#visible;
    }
    /** Show the popover and position it against its trigger. */
    open() {
      const panel = this.#panel;
      const trigger = this.#trigger;
      if (this.#visible || !panel || !trigger) return;
      this.#visible = true;
      portal(panel);
      panel.classList.add("ody-popover__container--open");
      const placement = this.attr("placement", "bottom");
      const { top, left } = position(trigger, panel, placement);
      panel.style.position = "absolute";
      panel.style.top = `${top}px`;
      panel.style.left = `${left}px`;
      document.addEventListener("click", this.#onOutsideClick, true);
      this.dispatchEvent(new CustomEvent(EVENT_OPEN, { bubbles: true }));
    }
    /** Hide the popover. */
    close() {
      if (!this.#visible) return;
      this.#visible = false;
      this.#panel?.classList.remove("ody-popover__container--open");
      if (this.#panel) removePortal(this.#panel);
      document.removeEventListener("click", this.#onOutsideClick, true);
      this.dispatchEvent(new CustomEvent(EVENT_CLOSE2, { bubbles: true }));
    }
    /** Toggle the popover open/closed. */
    toggle() {
      if (this.#visible) this.close();
      else this.open();
    }
    #onOutsideClick = (e) => {
      const target = e.target;
      if (this.#panel?.contains(target) || this.#trigger?.contains(target)) return;
      this.close();
    };
    #onTriggerClick = () => {
      this.toggle();
    };
    render() {
      if (this.#visible) this.close();
      this.#trigger?.removeEventListener("click", this.#onTriggerClick);
      if (this.#panel) {
        this.adopt(this.#panel);
        this.#panel.classList.remove("ody-popover__container--open");
      }
      const trigger = this.querySelector("[data-ody-popover-trigger-slot]")?.firstElementChild;
      const slot = this.querySelector("[data-ody-slot]");
      if (trigger && slot) slot.insertBefore(trigger, slot.firstChild);
      this.#visible = false;
      this.mount(
        `<div class="ody-popover__wrapper"><span class="ody-popover__trigger" data-ody-popover-trigger-slot></span><div class="${classes("ody-popover__container")}"><div data-ody-slot></div></div></div>`
      );
      const contentSlot = this.querySelector("[data-ody-slot]");
      const forId = this.attr("for");
      const explicitTrigger = contentSlot?.querySelector("[data-ody-popover-trigger]");
      const triggerSlot = this.querySelector("[data-ody-popover-trigger-slot]");
      if (forId) {
        this.#trigger = document.getElementById(forId);
      } else if (explicitTrigger) {
        triggerSlot.appendChild(explicitTrigger);
        this.#trigger = explicitTrigger;
      } else if (contentSlot?.firstElementChild) {
        const first = contentSlot.firstElementChild;
        triggerSlot.appendChild(first);
        this.#trigger = first;
      }
      this.#panel = this.querySelector(".ody-popover__container");
      this.#trigger?.addEventListener("click", this.#onTriggerClick);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      document.removeEventListener("click", this.#onOutsideClick, true);
      this.#trigger?.removeEventListener("click", this.#onTriggerClick);
      this.reclaimPortaledSlot(this.#panel);
      if (this.#panel) removePortal(this.#panel);
      this.#panel = null;
      this.#trigger = null;
    }
  };
  define("ody-popover", OdyPopover);
  var OdyTooltip = class extends OdyElement {
    static observedAttributes = ["text", "placement", "for"];
    #bubble = null;
    #trigger = null;
    #visible = false;
    /** Whether the tooltip is currently shown. */
    get isVisible() {
      return this.#visible;
    }
    /** Show the tooltip and position it against its trigger. */
    show() {
      const bubble = this.#bubble;
      const trigger = this.#trigger;
      if (this.#visible || !bubble || !trigger) return;
      this.#visible = true;
      portal(bubble);
      bubble.classList.add("ody-tooltip--visible");
      const placement = this.attr("placement", "top");
      const { top, left } = position(trigger, bubble, placement);
      bubble.style.position = "absolute";
      bubble.style.top = `${top}px`;
      bubble.style.left = `${left}px`;
    }
    /** Hide the tooltip. */
    hide() {
      if (!this.#visible) return;
      this.#visible = false;
      this.#bubble?.classList.remove("ody-tooltip--visible");
      if (this.#bubble) removePortal(this.#bubble);
    }
    #onEnter = () => this.show();
    #onLeave = () => this.hide();
    render() {
      if (this.#visible) this.hide();
      this.#unbind();
      if (this.#bubble) {
        this.adopt(this.#bubble);
        this.#bubble.classList.remove("ody-tooltip--visible");
      }
      const slotted = this.querySelector("[data-ody-tooltip-trigger-slot]")?.firstElementChild;
      const slotEl = this.querySelector("[data-ody-slot]");
      if (slotted && slotEl) slotEl.insertBefore(slotted, slotEl.firstChild);
      this.#visible = false;
      const placement = this.attr("placement", "top");
      const text = this.attr("text");
      this.mount(
        `<span class="ody-tooltip__trigger" data-ody-tooltip-trigger-slot></span><p class="${classes("ody-tooltip", `ody-tooltip--${placement}`)}" role="tooltip"><span data-ody-slot>${this.esc(text)}</span></p>`
      );
      const triggerSlot = this.querySelector("[data-ody-tooltip-trigger-slot]");
      const contentSlot = this.querySelector("[data-ody-slot]");
      const forId = this.attr("for");
      if (forId) {
        this.#trigger = document.getElementById(forId);
      } else if (contentSlot?.firstElementChild) {
        const first = contentSlot.firstElementChild;
        triggerSlot.appendChild(first);
        this.#trigger = first;
      }
      this.#bubble = this.querySelector(".ody-tooltip");
      this.#bind();
    }
    #bind() {
      if (!this.#trigger) return;
      this.#trigger.addEventListener("mouseenter", this.#onEnter);
      this.#trigger.addEventListener("focusin", this.#onEnter);
      this.#trigger.addEventListener("mouseleave", this.#onLeave);
      this.#trigger.addEventListener("focusout", this.#onLeave);
    }
    #unbind() {
      if (!this.#trigger) return;
      this.#trigger.removeEventListener("mouseenter", this.#onEnter);
      this.#trigger.removeEventListener("focusin", this.#onEnter);
      this.#trigger.removeEventListener("mouseleave", this.#onLeave);
      this.#trigger.removeEventListener("focusout", this.#onLeave);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      this.#unbind();
      this.reclaimPortaledSlot(this.#bubble);
      if (this.#bubble) removePortal(this.#bubble);
      this.#bubble = null;
      this.#trigger = null;
    }
  };
  define("ody-tooltip", OdyTooltip);
  var EVENT_CLOSE3 = "close";
  var OdyPanel = class extends OdyElement {
    static observedAttributes = ["open", "heading", "full-height"];
    #panel = null;
    #overlay = null;
    /** Open the panel (sets the `open` attribute). */
    open() {
      this.setAttribute("open", "");
    }
    /** Close the panel, removing `open` and dispatching `close`. */
    close() {
      this.removeAttribute("open");
      this.dispatchEvent(new CustomEvent(EVENT_CLOSE3, { bubbles: true }));
    }
    render() {
      if (this.#panel) this.adopt(this.#panel);
      if (this.#overlay) removePortal(this.#overlay);
      const isOpen = this.flag("open");
      const heading = this.attr("heading");
      this.mount(
        `<div class="${classes("ody-panel__overlay", isOpen && "ody-panel__overlay--visible")}" data-ody-panel-overlay></div><div class="${classes("ody-panel", this.flag("full-height") && "ody-panel--full-height", isOpen && "ody-panel--open")}" role="dialog"><div class="ody-panel__content-container"><div class="ody-panel__header"><div class="ody-panel__header__title-container"><h1 class="ody-panel__header__title">${this.esc(heading)}</h1></div><div class="ody-panel__header__action-container"><button type="button" class="ody-panel__header__close" data-ody-panel-close aria-label="${this.localized("close-label", "close")}">${iconSvg("close", "icon__svg")}</button></div></div><div class="ody-panel__content"><div class="ody-panel__body" data-ody-slot></div></div></div></div>`
      );
      const panel = this.querySelector(".ody-panel");
      const overlay = this.querySelector("[data-ody-panel-overlay]");
      this.#panel = panel;
      this.#overlay = overlay;
      overlay.addEventListener("click", this.#onClose);
      panel.querySelector("[data-ody-panel-close]").addEventListener("click", this.#onClose);
      portal(panel);
      portal(overlay);
    }
    #onClose = () => {
      this.close();
    };
    disconnectedCallback() {
      super.disconnectedCallback();
      this.reclaimPortaledSlot(this.#panel);
      if (this.#panel) removePortal(this.#panel);
      if (this.#overlay) removePortal(this.#overlay);
      this.#panel = null;
      this.#overlay = null;
    }
  };
  define("ody-panel", OdyPanel);
  var VARIANT_ICON3 = {
    info: "info",
    success: "check-filled",
    warning: "warning",
    danger: "danger"
  };
  var HOST_TAG = "ody-toast-host";
  var DEFAULT_TIMEOUT = 4e3;
  var REMOVE_DELAY = 400;
  var OdyToastHost = class extends OdyElement {
    /** Per-toast cleanups (cancel rAF + auto-dismiss timer) run on host teardown. */
    #pending = /* @__PURE__ */ new Set();
    render() {
      this.mount(`<div class="toast-notification-container" data-ody-slot></div>`);
    }
    /** Render and stack a toast, returning a handle to dismiss it early. */
    push(message, options = {}) {
      const variant = options.variant ?? "info";
      const timeout = options.timeout ?? DEFAULT_TIMEOUT;
      if (!this.querySelector(".toast-notification-container")) this.render();
      const container = this.querySelector(".toast-notification-container");
      const el = document.createElement("div");
      el.className = classes("toast-notification", `toast-notification--${variant}`);
      const title = options.title ? `<h1 class="toast-notification__title">${this.esc(options.title)}</h1>` : "";
      el.innerHTML = `<div class="toast-notification__header__container"><div class="toast-notification__header"><span class="toast-notification__icon icon">${iconSvg(VARIANT_ICON3[variant], "icon__svg")}</span>` + title + `</div><button type="button" class="toast-notification__close-button" aria-label="${this.localized("close-label", "close")}">${iconSvg("close", "icon__svg")}</button></div><div class="toast-notification__body__container"><p class="toast-notification__body">${this.esc(message)}</p></div>`;
      container.appendChild(el);
      const raf = requestAnimationFrame(() => el.classList.add("toast-notification--visible"));
      let timer;
      const cleanup = () => {
        cancelAnimationFrame(raf);
        if (timer !== void 0) clearTimeout(timer);
        this.#pending.delete(cleanup);
      };
      const dismiss = () => {
        cleanup();
        el.classList.remove("toast-notification--visible");
        setTimeout(() => el.remove(), REMOVE_DELAY);
      };
      el.querySelector(".toast-notification__close-button")?.addEventListener("click", dismiss);
      if (timeout > 0) timer = setTimeout(dismiss, timeout);
      this.#pending.add(cleanup);
      return { dismiss };
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      for (const cleanup of [...this.#pending]) cleanup();
      this.#pending.clear();
    }
  };
  define(HOST_TAG, OdyToastHost);
  var hostEl = null;
  function ensureHost() {
    if (hostEl && hostEl.isConnected) return hostEl;
    const existing = document.querySelector(HOST_TAG);
    hostEl = existing ?? document.createElement(HOST_TAG);
    portal(hostEl);
    return hostEl;
  }
  function toast(message, options) {
    return ensureHost().push(message, options);
  }
  var panelSeq = 0;
  var OdySelectBase = class extends OdyElement {
    /** Internal options backing store, kept in sync with the `options` attribute. */
    #options = null;
    /** Whether the popup panel is currently open. */
    open = false;
    /** Index of the active (virtually-focused) option, or -1 when none. */
    activeIndex = -1;
    /** Current search/filter query when `searchable`. */
    query = "";
    /** Stable id suffix used to wire up `aria-controls` / `aria-activedescendant`. */
    uid = `ody-select-${panelSeq += 1}`;
    /** Typeahead buffer and its reset timer (printable-character matching). */
    #typeahead = "";
    #typeaheadTimer = null;
    /** Parsed `options`: the JS property wins, else the JSON attribute fallback. */
    get options() {
      return this.#options ?? parseOptions3(this.attr("options"));
    }
    set options(next) {
      this.#options = Array.isArray(next) ? next : [];
      if (this.isRendered) this.render();
    }
    /** Whether the dropdown is disabled. */
    get disabled() {
      return this.flag("disabled");
    }
    /** Whether the filter input is shown. */
    get searchable() {
      return this.flag("searchable");
    }
    /** True once the first render has happened (so setters can re-render safely). */
    get isRendered() {
      return this.querySelector('[role="combobox"]') !== null;
    }
    /** Options after applying the current search query (case-insensitive). */
    get visibleOptions() {
      const q = this.query.trim().toLowerCase();
      if (!q) return this.options;
      return this.options.filter((o) => o.label.toLowerCase().includes(q));
    }
    connectedCallback() {
      super.connectedCallback();
      if (this.open) document.addEventListener("click", this.#onOutsideClick, true);
    }
    // ---- Rendering -----------------------------------------------------------
    render() {
      const listId = `${this.uid}-listbox`;
      const isDisabled = this.disabled;
      const triggerCls = classes("ody-select__trigger", this.open && "ody-select__trigger--open");
      const carat = iconSvg(this.open ? "chevron-up" : "chevron-down", "icon__svg");
      const ariaLabel = this.attr("aria-label") || this.attr("label");
      const activeId = this.activeIndex >= 0 ? `${this.uid}-opt-${this.activeIndex}` : "";
      const searchLabel = this.getAttribute("search-placeholder") ?? this.term("search");
      const searchEl = this.searchable ? `<div class="ody-select__search"><span class="ody-select__search-icon">${iconSvg("search", "icon__svg")}</span><input class="ody-select__search-input" type="text" role="searchbox" placeholder="${this.esc(searchLabel)}" value="${this.esc(this.query)}" aria-label="${this.esc(searchLabel)}" /></div>` : "";
      this.mount(
        `<div class="ody-select${isDisabled ? " ody-select--disabled" : ""}"><div class="${triggerCls}" role="combobox" tabindex="${isDisabled ? "-1" : "0"}" aria-expanded="${this.open ? "true" : "false"}" aria-controls="${listId}" aria-haspopup="listbox"${ariaLabel ? ` aria-label="${this.esc(ariaLabel)}"` : ""}${activeId ? ` aria-activedescendant="${activeId}"` : ""}${isDisabled ? ' aria-disabled="true"' : ""}><span class="ody-select__value">${this.triggerContent()}</span><span class="ody-select__carat">${carat}</span></div><div class="ody-select__panel${this.open ? " ody-select__panel--open" : ""}">` + searchEl + `<ul class="ody-select__list" id="${listId}" role="listbox" aria-multiselectable="${this.multiselectable ? "true" : "false"}">` + this.#optionRows() + `</ul></div></div>`
      );
      this.#wire();
    }
    /** Render the option `<li role="option">` rows for the visible options. */
    #optionRows() {
      const visible = this.visibleOptions;
      if (visible.length === 0) {
        return `<li class="ody-select__empty" role="presentation">${this.esc(this.term("noOptions"))}</li>`;
      }
      return visible.map((option, index) => {
        const selected = this.isSelected(option.value);
        const active = index === this.activeIndex;
        const cls = classes(
          "ody-option",
          "ody-select__option",
          selected && "ody-option--selected",
          option.disabled && "ody-option--disabled",
          active && "ody-select__option--active"
        );
        const check = this.multiselectable ? `<span class="ody-select__check">${selected ? iconSvg("check", "icon__svg") : ""}</span>` : selected ? `<span class="ody-select__check">${iconSvg("check", "icon__svg")}</span>` : `<span class="ody-select__check"></span>`;
        return `<li class="${cls}" id="${this.uid}-opt-${index}" role="option" aria-selected="${selected ? "true" : "false"}"${option.disabled ? ' aria-disabled="true"' : ""} data-index="${index}">` + check + `<span class="ody-select__option-label">${this.esc(option.label)}</span></li>`;
      }).join("");
    }
    /** Attach DOM + document listeners after each render. */
    #wire() {
      this.querySelector('[role="combobox"]')?.addEventListener("click", this.#onTriggerClick);
      this.querySelector('[role="combobox"]')?.addEventListener("keydown", this.#onKeydown);
      for (const li of this.querySelectorAll(".ody-select__option")) {
        li.addEventListener("click", this.#onOptionClick);
      }
      const search = this.querySelector(".ody-select__search-input");
      if (search) {
        search.addEventListener("input", this.#onSearchInput);
        search.addEventListener("keydown", this.#onKeydown);
        if (this.open) queueMicrotask(() => search.focus());
      }
    }
    // ---- Panel open/close ----------------------------------------------------
    /** Open the panel and start listening for outside clicks. */
    openPanel() {
      if (this.open || this.disabled) return;
      this.open = true;
      if (this.activeIndex < 0) this.activeIndex = this.#firstSelectableIndex();
      this.render();
      document.addEventListener("click", this.#onOutsideClick, true);
    }
    /** Close the panel; optionally restore focus to the trigger. */
    closePanel(focusTrigger = false) {
      if (!this.open) return;
      this.open = false;
      this.query = "";
      this.render();
      document.removeEventListener("click", this.#onOutsideClick, true);
      if (focusTrigger) this.querySelector('[role="combobox"]')?.focus();
    }
    // ---- Event handlers ------------------------------------------------------
    #onTriggerClick = () => {
      if (this.open) this.closePanel();
      else this.openPanel();
    };
    #onOptionClick = (event) => {
      const li = event.currentTarget;
      const index = Number(li.dataset.index);
      const option = this.visibleOptions[index];
      if (!option || option.disabled) return;
      this.activeIndex = index;
      this.commit(option);
      if (this.closeOnSelect) this.closePanel(true);
      else this.render();
    };
    #onSearchInput = (event) => {
      this.query = event.target.value;
      this.activeIndex = this.#firstSelectableIndex();
      this.render();
    };
    #onOutsideClick = (event) => {
      if (!this.contains(event.target)) this.closePanel();
    };
    #onKeydown = (event) => {
      const key = event.key;
      if (!this.open) {
        if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter" || key === " ") {
          event.preventDefault();
          this.openPanel();
          return;
        }
        return;
      }
      switch (key) {
        case "ArrowDown":
          event.preventDefault();
          this.#move(1);
          return;
        case "ArrowUp":
          event.preventDefault();
          this.#move(-1);
          return;
        case "Home":
          event.preventDefault();
          this.#moveTo(this.#firstSelectableIndex());
          return;
        case "End":
          event.preventDefault();
          this.#moveTo(this.#lastSelectableIndex());
          return;
        case "Enter":
          event.preventDefault();
          this.#chooseActive(true);
          return;
        case " ":
          if (this.searchable && event.target instanceof HTMLInputElement) return;
          event.preventDefault();
          this.#chooseActive(true);
          return;
        case "Escape":
          event.preventDefault();
          this.closePanel(true);
          return;
        case "Tab":
          this.closePanel();
          return;
        default:
          if (!this.searchable && isPrintable(event)) this.#typeaheadMatch(key);
      }
    };
    // ---- Keyboard helpers ----------------------------------------------------
    #move(delta) {
      const options = this.visibleOptions;
      if (options.length === 0) return;
      let next = this.activeIndex;
      for (let i = 0; i < options.length; i += 1) {
        next = (next + delta + options.length) % options.length;
        if (!options[next]?.disabled) break;
      }
      this.#moveTo(next);
    }
    #moveTo(index) {
      if (index < 0) return;
      this.activeIndex = index;
      this.render();
      this.querySelector(`#${this.uid}-opt-${index}`)?.scrollIntoView({ block: "nearest" });
    }
    #chooseActive(focusTrigger) {
      const option = this.visibleOptions[this.activeIndex];
      if (!option || option.disabled) return;
      this.commit(option);
      if (this.closeOnSelect) this.closePanel(focusTrigger);
      else this.render();
    }
    #firstSelectableIndex() {
      return this.visibleOptions.findIndex((o) => !o.disabled);
    }
    #lastSelectableIndex() {
      const options = this.visibleOptions;
      for (let i = options.length - 1; i >= 0; i -= 1) {
        if (!options[i]?.disabled) return i;
      }
      return -1;
    }
    #typeaheadMatch(char) {
      this.#typeahead += char.toLowerCase();
      if (this.#typeaheadTimer) clearTimeout(this.#typeaheadTimer);
      this.#typeaheadTimer = setTimeout(() => {
        this.#typeahead = "";
      }, 500);
      const options = this.visibleOptions;
      const match = options.findIndex(
        (o) => !o.disabled && o.label.toLowerCase().startsWith(this.#typeahead)
      );
      if (match >= 0) this.#moveTo(match);
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      document.removeEventListener("click", this.#onOutsideClick, true);
      if (this.#typeaheadTimer) clearTimeout(this.#typeaheadTimer);
    }
  };
  function parseOptions3(raw) {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((entry) => typeof entry === "object" && entry !== null && "value" in entry).map((entry) => ({
        value: String(entry.value),
        label: String(entry.label ?? entry.value),
        disabled: entry.disabled === true
      }));
    } catch {
      return [];
    }
  }
  function isPrintable(event) {
    return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
  }
  var OdyDropdownSingle = class extends OdySelectBase {
    static observedAttributes = [
      "value",
      "options",
      "placeholder",
      "label",
      "aria-label",
      "search-placeholder",
      "disabled",
      "searchable"
    ];
    /** The selected option value. */
    get value() {
      return this.attr("value");
    }
    set value(next) {
      if (next) this.setAttribute("value", next);
      else this.removeAttribute("value");
    }
    get closeOnSelect() {
      return true;
    }
    get multiselectable() {
      return false;
    }
    isSelected(value) {
      return this.value === value;
    }
    triggerContent() {
      const selected = this.options.find((o) => o.value === this.value);
      if (selected) return `<span class="ody-select__label">${this.esc(selected.label)}</span>`;
      return `<span class="ody-select__placeholder">${this.esc(this.attr("placeholder"))}</span>`;
    }
    commit(option) {
      this.value = option.value;
      this.dispatchEvent(
        new CustomEvent("change", { detail: { value: option.value }, bubbles: true })
      );
    }
  };
  define("ody-dropdown-single", OdyDropdownSingle);
  var OdyDropdownMulti = class extends OdySelectBase {
    static observedAttributes = [
      "value",
      "options",
      "placeholder",
      "label",
      "aria-label",
      "search-placeholder",
      "disabled",
      "searchable"
    ];
    /** The selected option values as an array. */
    get value() {
      const raw = this.attr("value");
      return raw ? raw.split(",").map((v) => v.trim()).filter(Boolean) : [];
    }
    set value(next) {
      const list = Array.isArray(next) ? next : [];
      if (list.length > 0) this.setAttribute("value", list.join(","));
      else this.removeAttribute("value");
    }
    get closeOnSelect() {
      return false;
    }
    get multiselectable() {
      return true;
    }
    isSelected(value) {
      return this.value.includes(value);
    }
    triggerContent() {
      const selected = this.value;
      if (selected.length === 0) {
        return `<span class="ody-select__placeholder">${this.esc(this.attr("placeholder"))}</span>`;
      }
      const byValue = new Map(this.options.map((o) => [o.value, o.label]));
      const chips = selected.map((value) => {
        const label = byValue.get(value) ?? value;
        return `<span class="ody-tag ody-tag--primary ody-tag--default ody-tag--size-small ody-select__chip"><span class="ody-tag__label">${this.esc(label)}</span><button type="button" class="ody-select__chip-remove" aria-label="Remove ${this.esc(label)}" data-value="${this.esc(value)}">${iconSvg("close", "icon__svg")}</button></span>`;
      }).join("");
      return `<span class="ody-select__chips">${chips}</span>`;
    }
    render() {
      super.render();
      for (const btn of this.querySelectorAll(".ody-select__chip-remove")) {
        btn.addEventListener("click", this.#onChipRemove);
      }
    }
    commit(option) {
      const current = this.value;
      const next = current.includes(option.value) ? current.filter((v) => v !== option.value) : [...current, option.value];
      this.value = next;
      this.#emit(next);
    }
    #onChipRemove = (event) => {
      event.stopPropagation();
      const value = event.currentTarget.dataset.value;
      const next = this.value.filter((v) => v !== value);
      this.value = next;
      this.#emit(next);
      this.render();
    };
    #emit(value) {
      this.dispatchEvent(new CustomEvent("change", { detail: { value }, bubbles: true }));
    }
  };
  define("ody-dropdown-multi", OdyDropdownMulti);
  var DATE_STYLES = ["short", "medium", "long", "full"];
  var SUNDAY_REF = new Date(2023, 0, 1);
  var RANGE_SEP = "/";
  var DATE_ATTR = "data-date";
  var EVENT_CHANGE = "change";
  function parseLocalDate(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const date = new Date(year, month - 1, day);
    if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
  }
  function formatLocalDate(date) {
    const y = String(date.getFullYear()).padStart(4, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }
  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }
  function addMonths(date, months) {
    const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
    const max = daysInMonth(target.getFullYear(), target.getMonth() + 1);
    return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), max));
  }
  var OdyDatePicker = class extends OdyElement {
    static observedAttributes = [
      "value",
      "min",
      "max",
      "range",
      "first-day-of-week",
      "placeholder",
      "presets",
      "display-format"
    ];
    /** Presets set via the JS property; when set it wins over the attribute. */
    #presets = null;
    #isDateDisallowed;
    #formatDate;
    /** Preset list: the JS property wins, else the JSON `presets` attribute. */
    get presets() {
      return this.#presets ?? this.#parsePresets();
    }
    set presets(next) {
      this.#presets = coerceDatePresets(next);
      if (this.querySelector(".ody-datepicker__trigger")) this.render();
    }
    /** Disable arbitrary days; not an attribute (functions can't serialize). */
    get isDateDisallowed() {
      return this.#isDateDisallowed;
    }
    set isDateDisallowed(fn) {
      this.#isDateDisallowed = fn;
      if (this.querySelector(".ody-datepicker__trigger")) this.render();
    }
    /** Custom trigger-label formatter; wins over `display-format`/`Intl`. */
    get formatDate() {
      return this.#formatDate;
    }
    set formatDate(fn) {
      this.#formatDate = fn;
      if (this.querySelector(".ody-datepicker__trigger")) this.render();
    }
    #open = false;
    /** First day of the currently displayed month (local). */
    #viewDate = /* @__PURE__ */ new Date();
    /** Day cell that currently holds `tabindex=0`. */
    #focusDate = /* @__PURE__ */ new Date();
    /** In range mode, the pending start once the user picks the first endpoint. */
    #rangeStart = null;
    // ---- value helpers -------------------------------------------------------
    #isRange() {
      return this.flag("range");
    }
    #firstDayOfWeek() {
      const n = Number(this.attr("first-day-of-week", "0"));
      return Number.isInteger(n) && n >= 0 && n <= 6 ? n : 0;
    }
    #minDate() {
      return parseLocalDate(this.attr("min"));
    }
    #maxDate() {
      return parseLocalDate(this.attr("max"));
    }
    /** The selected single date (single mode). */
    #selectedSingle() {
      if (this.#isRange()) return null;
      return parseLocalDate(this.attr("value"));
    }
    /** The selected `[start, end]` (range mode); either may be `null`. */
    #selectedRange() {
      if (!this.#isRange()) return [null, null];
      const raw = this.attr("value");
      if (!raw) return [null, null];
      const [s, e] = raw.split(RANGE_SEP);
      return [parseLocalDate(s ?? ""), parseLocalDate(e ?? "")];
    }
    #parsePresets() {
      const raw = this.attr("presets");
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
          (p) => Boolean(p) && typeof p.label === "string" && typeof p.value === "string"
        );
      } catch {
        return [];
      }
    }
    /** Whether `date` is outside min/max or rejected by `isDateDisallowed`. */
    #isDisabled(date) {
      const min = this.#minDate();
      const max = this.#maxDate();
      if (min && date < min) return true;
      if (max && date > max) return true;
      if (this.isDateDisallowed?.(date)) return true;
      return false;
    }
    /** Pick the day that should hold focus: selected, else today, else 1st. */
    #initialFocus() {
      const [rs] = this.#selectedRange();
      const selected = this.#isRange() ? rs : this.#selectedSingle();
      if (selected) return selected;
      const today = /* @__PURE__ */ new Date();
      const monthStart = new Date(this.#viewDate.getFullYear(), this.#viewDate.getMonth(), 1);
      if (today.getFullYear() === monthStart.getFullYear() && today.getMonth() === monthStart.getMonth()) {
        return today;
      }
      return monthStart;
    }
    /** The element's resolved BCP-47 language (nearest `lang` ancestor). */
    #locale() {
      return resolveLang(this);
    }
    /** `Intl` options derived from the `display-format` attribute. */
    #displayOptions() {
      const style = this.attr("display-format", "medium");
      return { dateStyle: DATE_STYLES.includes(style) ? style : "medium" };
    }
    /** Locale-aware display string for a single date (custom `formatDate` wins). */
    #formatDisplay(date) {
      if (this.formatDate) return this.formatDate(date);
      return new Intl.DateTimeFormat(this.#locale(), this.#displayOptions()).format(date);
    }
    /** Locale-aware display string for a date range. */
    #formatDisplayRange(a, b) {
      if (this.formatDate) return `${this.formatDate(a)} \u2013 ${this.formatDate(b)}`;
      const fmt = new Intl.DateTimeFormat(this.#locale(), this.#displayOptions());
      const range = fmt.formatRange;
      return range ? range.call(fmt, a, b) : `${fmt.format(a)} \u2013 ${fmt.format(b)}`;
    }
    /** Human-readable trigger label for the current value. */
    #triggerLabel() {
      if (this.#isRange()) {
        const [s, e] = this.#selectedRange();
        if (s && e) return this.#formatDisplayRange(s, e);
        if (s) return this.#formatDisplay(s);
      } else {
        const single = this.#selectedSingle();
        if (single) return this.#formatDisplay(single);
      }
      return this.getAttribute("placeholder") ?? this.term("selectDate");
    }
    // ---- public-ish lifecycle ------------------------------------------------
    /** Whether the popover is currently shown. */
    get isOpen() {
      return this.#open;
    }
    /** Show the popover and focus the roving day. */
    openPopover() {
      if (this.#open) return;
      this.#open = true;
      const [rs] = this.#selectedRange();
      const anchor = this.#isRange() ? rs : this.#selectedSingle();
      if (anchor) this.#viewDate = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      this.#rangeStart = null;
      this.#focusDate = this.#initialFocus();
      document.addEventListener("click", this.#onOutsideClick, true);
      this.render();
      this.#focusActiveDay();
    }
    /** Hide the popover. */
    closePopover() {
      if (!this.#open) return;
      this.#open = false;
      this.#rangeStart = null;
      document.removeEventListener("click", this.#onOutsideClick, true);
      this.render();
    }
    #focusActiveDay() {
      const cell = this.querySelector(`.ody-datepicker__day[tabindex="0"]`);
      cell?.focus();
    }
    // ---- selection -----------------------------------------------------------
    #commitSingle(date) {
      this.setAttribute("value", formatLocalDate(date));
      this.dispatchEvent(
        new CustomEvent(EVENT_CHANGE, { detail: { value: formatLocalDate(date) }, bubbles: true })
      );
    }
    #commitRange(start, end) {
      const [a, b] = start <= end ? [start, end] : [end, start];
      const value = `${formatLocalDate(a)}${RANGE_SEP}${formatLocalDate(b)}`;
      this.setAttribute("value", value);
      this.dispatchEvent(
        new CustomEvent(EVENT_CHANGE, {
          detail: { value, start: formatLocalDate(a), end: formatLocalDate(b) },
          bubbles: true
        })
      );
    }
    #selectDay(date) {
      if (this.#isDisabled(date)) return;
      if (this.#isRange()) {
        if (this.#rangeStart === null) {
          this.#rangeStart = date;
          this.removeAttribute("value");
          this.#focusDate = date;
          this.render();
          this.#focusActiveDay();
        } else {
          this.#commitRange(this.#rangeStart, date);
          this.#rangeStart = null;
          this.closePopover();
          this.#focusTrigger();
        }
      } else {
        this.#commitSingle(date);
        this.closePopover();
        this.#focusTrigger();
      }
    }
    #focusTrigger() {
      this.querySelector(".ody-datepicker__trigger")?.focus();
    }
    // ---- event handlers ------------------------------------------------------
    #onOutsideClick = (e) => {
      if (this.contains(e.target)) return;
      this.closePopover();
    };
    #onTriggerClick = () => {
      if (this.#open) this.closePopover();
      else this.openPopover();
    };
    #onPrevMonth = () => {
      this.#viewDate = addMonths(this.#viewDate, -1);
      this.render();
    };
    #onNextMonth = () => {
      this.#viewDate = addMonths(this.#viewDate, 1);
      this.render();
    };
    #onDayClick = (e) => {
      const cell = e.currentTarget;
      const date = parseLocalDate(cell.getAttribute(DATE_ATTR) ?? "");
      if (date) this.#selectDay(date);
    };
    #onPresetClick = (e) => {
      const btn = e.currentTarget;
      const value = btn.getAttribute("data-value") ?? "";
      if (this.#isRange()) {
        const [s, e2] = value.split(RANGE_SEP);
        const start = parseLocalDate(s ?? "");
        const end = parseLocalDate(e2 ?? "");
        if (start && end) {
          this.#rangeStart = null;
          this.#commitRange(start, end);
          this.closePopover();
          this.#focusTrigger();
        }
      } else {
        const date = parseLocalDate(value);
        if (date) this.#selectDay(date);
      }
    };
    #onGridKeydown = (e) => {
      let next = null;
      const cur = this.#focusDate;
      switch (e.key) {
        case "ArrowLeft":
          next = addDays(cur, -1);
          break;
        case "ArrowRight":
          next = addDays(cur, 1);
          break;
        case "ArrowUp":
          next = addDays(cur, -7);
          break;
        case "ArrowDown":
          next = addDays(cur, 7);
          break;
        case "Home":
          next = addDays(cur, -((cur.getDay() - this.#firstDayOfWeek() + 7) % 7));
          break;
        case "End":
          next = addDays(cur, 6 - (cur.getDay() - this.#firstDayOfWeek() + 7) % 7);
          break;
        case "PageUp":
          next = addMonths(cur, e.shiftKey ? -12 : -1);
          break;
        case "PageDown":
          next = addMonths(cur, e.shiftKey ? 12 : 1);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          this.#selectDay(cur);
          return;
        case "Escape":
          e.preventDefault();
          this.closePopover();
          this.#focusTrigger();
          return;
        default:
          return;
      }
      e.preventDefault();
      this.#focusDate = next;
      this.#viewDate = new Date(next.getFullYear(), next.getMonth(), 1);
      this.render();
      this.#focusActiveDay();
    };
    // ---- rendering -----------------------------------------------------------
    #renderWeekdayHeader() {
      const first = this.#firstDayOfWeek();
      const locale = this.#locale();
      const shortFmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
      const longFmt = new Intl.DateTimeFormat(locale, { weekday: "long" });
      const cells = [];
      for (let i = 0; i < 7; i++) {
        const idx = (first + i) % 7;
        const ref = new Date(SUNDAY_REF.getFullYear(), 0, SUNDAY_REF.getDate() + idx);
        cells.push(
          `<th scope="col" abbr="${this.esc(longFmt.format(ref))}" class="ody-datepicker__weekday">${this.esc(shortFmt.format(ref))}</th>`
        );
      }
      return `<tr>${cells.join("")}</tr>`;
    }
    #renderWeeks() {
      const year = this.#viewDate.getFullYear();
      const month = this.#viewDate.getMonth();
      const first = this.#firstDayOfWeek();
      const total = daysInMonth(year, month + 1);
      const startWeekday = new Date(year, month, 1).getDay();
      const lead = (startWeekday - first + 7) % 7;
      const [rangeStartSel, rangeEndSel] = this.#selectedRange();
      const single = this.#selectedSingle();
      const today = /* @__PURE__ */ new Date();
      const dayLabelFmt = new Intl.DateTimeFormat(this.#locale(), { dateStyle: "full" });
      const rows = [];
      let cells = [];
      for (let i = 0; i < lead; i++) {
        cells.push('<td class="ody-datepicker__pad"></td>');
      }
      for (let day = 1; day <= total; day++) {
        const date = new Date(year, month, day);
        const disabled = this.#isDisabled(date);
        const isFocus = isSameDay(date, this.#focusDate);
        const isToday = isSameDay(date, today);
        let selected = false;
        let inRange = false;
        if (this.#isRange()) {
          const start = this.#rangeStart ?? rangeStartSel;
          const end = this.#rangeStart ? null : rangeEndSel;
          if (start && isSameDay(date, start)) selected = true;
          if (end && isSameDay(date, end)) selected = true;
          if (start && end && date > start && date < end) inRange = true;
        } else if (single && isSameDay(date, single)) {
          selected = true;
        }
        const cls = classes(
          "ody-datepicker__day",
          selected && "ody-datepicker__day--selected",
          inRange && "ody-datepicker__day--in-range",
          isToday && !selected && "ody-datepicker__day--today",
          disabled && "ody-datepicker__day--disabled"
        );
        cells.push(
          `<td role="gridcell" class="${cls}" ${DATE_ATTR}="${formatLocalDate(date)}" tabindex="${isFocus ? "0" : "-1"}" aria-label="${this.esc(dayLabelFmt.format(date))}" aria-selected="${selected ? "true" : "false"}"${disabled ? ' aria-disabled="true"' : ""}>${day}</td>`
        );
        if (cells.length === 7) {
          rows.push(`<tr>${cells.join("")}</tr>`);
          cells = [];
        }
      }
      if (cells.length > 0) {
        while (cells.length < 7) cells.push('<td class="ody-datepicker__pad"></td>');
        rows.push(`<tr>${cells.join("")}</tr>`);
      }
      return rows.join("");
    }
    #renderPresets() {
      const presets = this.presets;
      if (presets.length === 0) return "";
      const buttons = presets.map(
        (p) => `<button type="button" class="ody-datepicker__preset" data-value="${this.esc(p.value)}">${this.esc(p.label)}</button>`
      ).join("");
      return `<div class="ody-datepicker__presets">${buttons}</div>`;
    }
    #renderPopover() {
      const title = new Intl.DateTimeFormat(this.#locale(), {
        month: "long",
        year: "numeric"
      }).format(this.#viewDate);
      const nav = `<div class="ody-datepicker__nav"><button type="button" class="ody-datepicker__nav-btn" data-nav="prev" aria-label="${this.localized("previous-month-label", "previousMonth")}">${iconSvg("chevron-left", "icon__svg")}</button><span class="ody-datepicker__title" aria-live="polite">${this.esc(title)}</span><button type="button" class="ody-datepicker__nav-btn" data-nav="next" aria-label="${this.localized("next-month-label", "nextMonth")}">${iconSvg("chevron-right", "icon__svg")}</button></div>`;
      const grid = `<table role="grid" class="ody-datepicker__grid" aria-label="${this.esc(title)}"><thead>${this.#renderWeekdayHeader()}</thead><tbody>${this.#renderWeeks()}</tbody></table>`;
      return `<div class="ody-datepicker__popover-container"><div class="ody-datepicker__popover">${this.#renderPresets()}<div class="ody-datepicker__main">${nav}${grid}</div></div></div>`;
    }
    render() {
      const caret = this.#open ? "chevron-up" : "chevron-down";
      const trigger = `<button type="button" class="ody-datepicker__trigger" aria-haspopup="dialog" aria-expanded="${this.#open ? "true" : "false"}"><span class="ody-datepicker__trigger-icon">${iconSvg("calendar", "icon__svg")}</span><span class="ody-datepicker__trigger-label">${this.esc(this.#triggerLabel())}</span><span class="ody-datepicker__trigger-caret">${iconSvg(caret, "icon__svg")}</span></button>`;
      this.mount(
        `<div class="ody-datepicker ${this.#open ? "ody-datepicker--open" : ""}">${trigger}${this.#open ? this.#renderPopover() : ""}<span hidden data-ody-slot></span></div>`
      );
      this.querySelector(".ody-datepicker__trigger")?.addEventListener("click", this.#onTriggerClick);
      if (!this.#open) return;
      this.querySelector('[data-nav="prev"]')?.addEventListener("click", this.#onPrevMonth);
      this.querySelector('[data-nav="next"]')?.addEventListener("click", this.#onNextMonth);
      for (const cell of this.querySelectorAll(".ody-datepicker__day")) {
        cell.addEventListener("click", this.#onDayClick);
      }
      for (const btn of this.querySelectorAll(".ody-datepicker__preset")) {
        btn.addEventListener("click", this.#onPresetClick);
      }
      this.querySelector(".ody-datepicker__grid")?.addEventListener(
        "keydown",
        this.#onGridKeydown
      );
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      document.removeEventListener("click", this.#onOutsideClick, true);
    }
  };
  function coerceDatePresets(next) {
    if (Array.isArray(next)) return next;
    if (typeof next === "string" && next) {
      try {
        const parsed = JSON.parse(next);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }
  define("ody-datepicker", OdyDatePicker);
  var ALIGN_HEADER = {
    left: "",
    center: "ody-table__header-content--centered",
    right: "ody-table__header-content--right"
  };
  var ALIGN_CELL = {
    left: "",
    center: "ody-table__cell-content--center",
    right: "ody-table__cell-content--right"
  };
  var NEXT_DIRECTION2 = {
    none: "ascending",
    ascending: "descending",
    descending: null
  };
  var DIRECTION_ICON2 = {
    none: "arrow-up-down",
    ascending: "chevron-up",
    descending: "chevron-down"
  };
  var ATTR_SELECTABLE = "selectable";
  var ATTR_SORTABLE = "sortable";
  var ATTR_SORT_KEY = "sort-key";
  var ATTR_SORT_DIRECTION = "sort-direction";
  var ATTR_STICKY_HEADER = "sticky-header";
  var DIR_ASC = "ascending";
  var DIR_DESC = "descending";
  var OdyTable = class extends OdyElement {
    static observedAttributes = [
      ATTR_SELECTABLE,
      ATTR_SORTABLE,
      ATTR_SORT_KEY,
      ATTR_SORT_DIRECTION,
      ATTR_STICKY_HEADER
    ];
    #columns = [];
    #data = [];
    #selected = /* @__PURE__ */ new Set();
    /** True once a property has been set, so we don't render before data arrives. */
    #ready = false;
    /** Column definitions; setting re-renders. */
    get columns() {
      return this.#columns;
    }
    set columns(next) {
      this.#columns = Array.isArray(next) ? next : [];
      this.#ready = true;
      this.render();
    }
    /** Row data; setting re-renders. */
    get data() {
      return this.#data;
    }
    set data(next) {
      this.#data = Array.isArray(next) ? next : [];
      for (const row of [...this.#selected]) {
        if (!this.#data.includes(row)) this.#selected.delete(row);
      }
      this.#ready = true;
      this.render();
    }
    /** Alias for {@link data}. */
    get rows() {
      return this.data;
    }
    set rows(next) {
      this.data = next;
    }
    /** The currently selected rows (read-only). */
    get selected() {
      return this.#data.filter((row) => this.#selected.has(row));
    }
    set selected(next) {
      this.#selected = new Set(Array.isArray(next) ? next : []);
      this.#ready = true;
      this.render();
    }
    /** Resolve the columns to render, auto-generating from the first row if needed. */
    #resolveColumns() {
      if (this.#columns.length > 0) return this.#columns;
      const first = this.#data[0];
      if (!first) return [];
      return Object.keys(first).map((key) => ({ key, label: key }));
    }
    /** Apply client-side sorting (string/number aware), returning a new array. */
    #sortedData() {
      const key = this.attr(ATTR_SORT_KEY);
      const direction = this.attr(ATTR_SORT_DIRECTION);
      if (!key || direction !== DIR_ASC && direction !== DIR_DESC) return this.#data;
      const factor = direction === DIR_ASC ? 1 : -1;
      return [...this.#data].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * factor;
        return String(av ?? "").localeCompare(String(bv ?? "")) * factor;
      });
    }
    render() {
      if (!this.#ready) return;
      const columns = this.#resolveColumns();
      const rows = this.#sortedData();
      const selectable = this.flag(ATTR_SELECTABLE);
      const sortable = this.flag(ATTR_SORTABLE);
      const stickyHeader = this.flag(ATTR_STICKY_HEADER);
      const sortKey = this.attr(ATTR_SORT_KEY);
      const sortDir = this.attr(ATTR_SORT_DIRECTION);
      const headerCells = columns.map((col) => this.#headerCell(col, sortable, stickyHeader, sortKey, sortDir));
      const selectAll = this.#selectAllState(rows);
      const checkHeader = selectable ? `<th class="${classes("ody-table__header", stickyHeader && "ody-table__header--sticky-header")} ody-table__check"><div class="ody-table__header-content ody-table__header-content--checkable" data-ody-select-all>` + this.#checkbox(selectAll === true, selectAll === null) + `</div></th>` : "";
      const bodyRows = rows.map((row, index) => this.#bodyRow(row, index, columns, selectable)).join("");
      this.mount(
        `<div class="ody-table-container"><table class="ody-table"><thead class="ody-table__head"><tr>${checkHeader}${headerCells.join("")}</tr></thead><tbody>${bodyRows}</tbody></table></div>`
      );
      this.#wire(rows, columns, selectable, sortable);
    }
    #headerCell(col, globalSortable, stickyHeader, sortKey, sortDir) {
      const align = col.align ?? "left";
      const canSort = globalSortable && col.sortable === true;
      const isSorted = canSort && sortKey === col.key && (sortDir === DIR_ASC || sortDir === DIR_DESC);
      const direction = isSorted ? sortDir : "none";
      const cls = classes(
        "ody-table__header",
        canSort && "ody-table__header--sortable",
        isSorted && "ody-table__header--sorted",
        stickyHeader && "ody-table__header--sticky-header"
      );
      const contentCls = classes("ody-table__header-content", ALIGN_HEADER[align]);
      const ariaSort = isSorted ? ` aria-sort="${sortDir}"` : "";
      const icon = canSort ? `<span class="icon icon--size-medium">${iconSvg(DIRECTION_ICON2[direction], "icon__svg")}</span>` : "";
      return `<th class="${cls}"${ariaSort} data-key="${escapeHtml(col.key)}"><div class="${contentCls}"><span class="ody-table__header-label">${this.esc(col.label)}</span>${icon}</div></th>`;
    }
    #bodyRow(row, index, columns, selectable) {
      const checkCell = selectable ? `<td class="ody-table__data ody-table__check"><div class="ody-table__cell-content ody-table__cell-content--checkable" data-ody-row-check>` + this.#checkbox(this.#selected.has(row), false) + `</div></td>` : "";
      const cells = columns.map((col) => {
        const align = col.align ?? "left";
        const contentCls = classes("ody-table__cell-content", ALIGN_CELL[align]);
        const inner = col.render ? "" : this.esc(String(row[col.key] ?? ""));
        return `<td class="ody-table__data"><div class="${contentCls}">${inner}</div></td>`;
      }).join("");
      return `<tr class="ody-table__row" data-row-index="${index}">${checkCell}${cells}</tr>`;
    }
    /** A standalone checkbox marked up like `<ody-checkbox>` (no nested upgrade needed). */
    #checkbox(checked, indeterminate) {
      const wrapperCls = classes("ody-checkbox", checked && "ody-checkbox--checked");
      const mark = indeterminate ? `<span class="ody-checkbox__mark">${iconSvg("minus", "icon__svg")}</span>` : checked ? `<span class="ody-checkbox__mark">${iconSvg("check", "icon__svg")}</span>` : "";
      return `<div class="${wrapperCls}"><div class="ody-checkbox__container"><span class="ody-checkbox__box"><input class="ody-checkbox__input ody-checkbox__input--size-small" type="checkbox"${checked ? " checked" : ""} />` + mark + `</span></div></div>`;
    }
    /** `true` = all selected, `false` = none, `null` = some (indeterminate). */
    #selectAllState(rows) {
      if (rows.length === 0) return false;
      const count = rows.filter((row) => this.#selected.has(row)).length;
      if (count === 0) return false;
      if (count === rows.length) return true;
      return null;
    }
    #wire(rows, columns, selectable, sortable) {
      if (sortable) {
        this.querySelectorAll(".ody-table__header--sortable[data-key]").forEach((th) => {
          const key = th.getAttribute("data-key");
          th.addEventListener("click", () => this.#onSort(key));
        });
      }
      const selectAll = this.querySelector("[data-ody-select-all] input");
      if (selectAll) {
        selectAll.indeterminate = this.#selectAllState(rows) === null;
        selectAll.addEventListener("change", () => this.#onSelectAll(rows));
      }
      this.querySelectorAll("tbody .ody-table__row").forEach((tr) => {
        const index = Number(tr.getAttribute("data-row-index"));
        const row = rows[index];
        if (!row) return;
        if (selectable) {
          const input = tr.querySelector("[data-ody-row-check] input");
          input?.addEventListener("change", (event) => {
            event.stopPropagation();
            this.#onRowToggle(row, input.checked);
          });
        }
        const dataCells = tr.querySelectorAll(".ody-table__data:not(.ody-table__check)");
        columns.forEach((col, columnIndex) => {
          if (!col.render) return;
          const content = dataCells[columnIndex]?.querySelector(".ody-table__cell-content");
          if (content) col.render(content, row);
        });
        tr.addEventListener("click", () => {
          this.dispatchEvent(
            new CustomEvent("row-click", { detail: { row, index }, bubbles: true })
          );
        });
      });
    }
    #onSort(key) {
      const current = this.attr(ATTR_SORT_KEY) === key && (this.attr(ATTR_SORT_DIRECTION) === DIR_ASC || this.attr(ATTR_SORT_DIRECTION) === DIR_DESC) ? this.attr(ATTR_SORT_DIRECTION) : "none";
      const next = NEXT_DIRECTION2[current];
      if (next === null) {
        this.removeAttribute(ATTR_SORT_KEY);
        this.removeAttribute(ATTR_SORT_DIRECTION);
      } else {
        this.setAttribute(ATTR_SORT_KEY, key);
        this.setAttribute(ATTR_SORT_DIRECTION, next);
      }
      this.dispatchEvent(
        new CustomEvent("sort-change", {
          detail: { key, direction: next },
          bubbles: true
        })
      );
      this.render();
    }
    #onSelectAll(rows) {
      const allSelected = this.#selectAllState(rows) === true;
      if (allSelected) {
        for (const row of rows) this.#selected.delete(row);
      } else {
        for (const row of rows) this.#selected.add(row);
      }
      this.#emitSelection();
      this.render();
    }
    #onRowToggle(row, checked) {
      if (checked) this.#selected.add(row);
      else this.#selected.delete(row);
      this.#emitSelection();
      this.render();
    }
    #emitSelection() {
      this.dispatchEvent(
        new CustomEvent("selection-change", {
          detail: { selected: this.selected },
          bubbles: true
        })
      );
    }
  };
  define("ody-table", OdyTable);
  var BRAND_ICONS = {
    "ai": {
      "viewBox": "0 0 20 20",
      "body": '<g id="Icon / New Release"><g id="Vector"><path d="M15.792 7.66603L14.708 5.31103L12.396 4.24903L14.708 3.18703L15.792 0.832031L16.875 3.18703L19.188 4.24903L16.875 5.31103L15.792 7.66603ZM15.792 19.166L14.708 16.832L12.396 15.77L14.708 14.707L15.792 12.353L16.875 14.707L19.188 15.77L16.875 16.832L15.792 19.166ZM7.62501 16.832L5.52101 12.145L0.833008 9.99903L5.52101 7.87403L7.62501 3.18703L9.75001 7.87403L14.417 9.99903L9.75001 12.145L7.62501 16.832ZM7.62501 12.561L8.43801 10.832L10.146 9.99903L8.43801 9.18703L7.62501 7.45703L6.83301 9.18703L5.10401 9.99903L6.83301 10.832L7.62501 12.561Z" fill="#1EC6CE"/><path d="M15.792 7.66603L14.708 5.31103L12.396 4.24903L14.708 3.18703L15.792 0.832031L16.875 3.18703L19.188 4.24903L16.875 5.31103L15.792 7.66603ZM15.792 19.166L14.708 16.832L12.396 15.77L14.708 14.707L15.792 12.353L16.875 14.707L19.188 15.77L16.875 16.832L15.792 19.166ZM7.62501 16.832L5.52101 12.145L0.833008 9.99903L5.52101 7.87403L7.62501 3.18703L9.75001 7.87403L14.417 9.99903L9.75001 12.145L7.62501 16.832ZM7.62501 12.561L8.43801 10.832L10.146 9.99903L8.43801 9.18703L7.62501 7.45703L6.83301 9.18703L5.10401 9.99903L6.83301 10.832L7.62501 12.561Z" fill="url(#paint0_linear_2873_13940)"/></g></g><defs><linearGradient id="paint0_linear_2873_13940" x1="10.0105" y1="1.20773" x2="-1.1419" y2="17.842" gradientUnits="userSpaceOnUse"><stop stop-color="#6CCDDC"/><stop offset="1" stop-color="#FFF200"/></linearGradient></defs>'
    },
    "arrow-down": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M4.9895 11.6565L6.2395 10.4275L9.1145 13.3025L9.1145 3.34351L10.8645 3.34351L10.8645 13.3025L13.7395 10.4275L14.9895 11.6565L9.9895 16.6565L4.9895 11.6565Z" fill="#3957EA"/>'
    },
    "arrow-up-down": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M18 14L14 18L10 14L11.062 12.938L13.25 15.125L13.25 3L14.75 3L14.75 15.125L16.938 12.938L18 14ZM10 6L8.938 7.062L6.75 4.875L6.75 17L5.25 17L5.25 4.875L3.062 7.062L2 6L6 2L10 6Z" fill="#656A81"/>'
    },
    "arrow-up": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M14.9897 8.34351L13.7397 9.57251L10.8647 6.69751V16.6565H9.11475V6.69751L6.23975 9.57251L4.98975 8.34351L9.98975 3.34351L14.9897 8.34351Z" fill="#3957EA"/>'
    },
    "cancel-send": {
      "viewBox": "0 0 15 14",
      "body": '<path d="M9.8125 11.75L10.9792 10.5833L12.1458 11.75L12.75 11.1458L11.5833 9.97917L12.75 8.8125L12.1458 8.20833L10.9792 9.375L9.8125 8.20833L9.20833 8.8125L10.375 9.97917L9.20833 11.1458L9.8125 11.75ZM0 12V0L11.2917 4.5C10.7361 4.5 10.2708 4.53819 9.89583 4.61458C9.52083 4.69097 9.09028 4.84028 8.60417 5.0625L1.5 2.22917V4.5L6 6L1.5 7.5V9.77083L5.875 8.04167C5.76389 8.31944 5.67708 8.60764 5.61458 8.90625C5.55208 9.20486 5.51389 9.5 5.5 9.79167L0 12ZM11 14C9.88889 14 8.94444 13.6111 8.16667 12.8333C7.38889 12.0556 7 11.1111 7 10C7 8.88889 7.38889 7.94444 8.16667 7.16667C8.94444 6.38889 9.88889 6 11 6C12.1111 6 13.0556 6.38889 13.8333 7.16667C14.6111 7.94444 15 8.88889 15 10C15 11.1111 14.6111 12.0556 13.8333 12.8333C13.0556 13.6111 12.1111 14 11 14ZM1.5 7.5V2.22917V9.77083V7.5Z" fill="#E5243C"/>'
    },
    "chat": {
      "viewBox": "0 0 40 40",
      "body": '<g id="Feature Icon"><path id="Vector" d="M10.8333 23.5063H22.4125V22.0963H10.8333V23.5063ZM10.8333 18.3783H29.1667V16.9679H10.8333V18.3783ZM10.8333 13.25H29.1667V11.8396H10.8333V13.25ZM5 34.4617V8.43583C5 7.75306 5.23528 7.17639 5.70583 6.70583C6.17639 6.23528 6.75306 6 7.43583 6H32.5642C33.2469 6 33.8236 6.23528 34.2942 6.70583C34.7647 7.17639 35 7.75306 35 8.43583V26.8975C35 27.5803 34.7647 28.1569 34.2942 28.6275C33.8236 29.0981 33.2469 29.3333 32.5642 29.3333H10.1283L5 34.4617ZM9.51083 27.9229H32.5642C32.8206 27.9229 33.0556 27.8161 33.2692 27.6025C33.4828 27.3889 33.5896 27.1539 33.5896 26.8975V8.43583C33.5896 8.17945 33.4828 7.94444 33.2692 7.73083C33.0556 7.51722 32.8206 7.41042 32.5642 7.41042H7.43583C7.17944 7.41042 6.94444 7.51722 6.73083 7.73083C6.51722 7.94444 6.41042 8.17945 6.41042 8.43583V31.1017L9.51083 27.9229Z" fill="url(#paint0_linear_3287_198)"/></g><defs><linearGradient id="paint0_linear_3287_198" x1="11.5" y1="10" x2="46.1493" y2="17.8785" gradientUnits="userSpaceOnUse"><stop stop-color="#6CCAD9"/><stop offset="1" stop-color="#FFFBB9"/></linearGradient></defs>'
    },
    "checkbox-background-hover": {
      "viewBox": "0 0 18 14",
      "body": '<path d="M6.40625 12.75C6.71875 13.0625 7.25 13.0625 7.5625 12.75L16.75 3.5625C17.0625 3.25 17.0625 2.71875 16.75 2.40625L15.625 1.28125C15.3125 0.96875 14.8125 0.96875 14.5 1.28125L7 8.78125L3.46875 5.28125C3.15625 4.96875 2.65625 4.96875 2.34375 5.28125L1.21875 6.40625C0.90625 6.71875 0.90625 7.25 1.21875 7.5625L6.40625 12.75Z" fill="#1F37AD"/>'
    },
    "checkbox-background-indeterminate-hover": {
      "viewBox": "0 0 16 16",
      "body": '<path d="M14 6.5H2C1.4375 6.5 1 6.96875 1 7.5V8.5C1 9.0625 1.4375 9.5 2 9.5H14C14.5312 9.5 15 9.0625 15 8.5V7.5C15 6.96875 14.5312 6.5 14 6.5Z" fill="#1F37AD"/>'
    },
    "checkbox-background-indeterminate": {
      "viewBox": "0 0 16 16",
      "body": '<path d="M14 6.5H2C1.4375 6.5 1 6.96875 1 7.5V8.5C1 9.0625 1.4375 9.5 2 9.5H14C14.5312 9.5 15 9.0625 15 8.5V7.5C15 6.96875 14.5312 6.5 14 6.5Z" fill="#3957EA"/>'
    },
    "checkbox-background": {
      "viewBox": "0 0 18 14",
      "body": '<path d="M6.40625 12.75C6.71875 13.0625 7.25 13.0625 7.5625 12.75L16.75 3.5625C17.0625 3.25 17.0625 2.71875 16.75 2.40625L15.625 1.28125C15.3125 0.96875 14.8125 0.96875 14.5 1.28125L7 8.78125L3.46875 5.28125C3.15625 4.96875 2.65625 4.96875 2.34375 5.28125L1.21875 6.40625C0.90625 6.71875 0.90625 7.25 1.21875 7.5625L6.40625 12.75Z" fill="#3957EA"/>'
    },
    "circle": {
      "viewBox": "0 0 20 20",
      "body": '<mask id="mask0_5628_89916" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20"><rect width="20" height="20" fill="#D9D9D9"/></mask><g mask="url(#mask0_5628_89916)"><path d="M10 18C8.90267 18 7.868 17.7917 6.896 17.375C5.924 16.9583 5.07333 16.3853 4.344 15.656C3.61467 14.9267 3.04167 14.076 2.625 13.104C2.20833 12.132 2 11.0973 2 10C2 8.88867 2.20833 7.85033 2.625 6.885C3.04167 5.92033 3.61467 5.07333 4.344 4.344C5.07333 3.61467 5.924 3.04167 6.896 2.625C7.868 2.20833 8.90267 2 10 2C11.1113 2 12.1497 2.20833 13.115 2.625C14.0797 3.04167 14.9267 3.61467 15.656 4.344C16.3853 5.07333 16.9583 5.92033 17.375 6.885C17.7917 7.85033 18 8.88867 18 10C18 11.0973 17.7917 12.132 17.375 13.104C16.9583 14.076 16.3853 14.9267 15.656 15.656C14.9267 16.3853 14.0797 16.9583 13.115 17.375C12.1497 17.7917 11.1113 18 10 18ZM10 16.5C11.8053 16.5 13.34 15.868 14.604 14.604C15.868 13.34 16.5 11.8053 16.5 10C16.5 8.19467 15.868 6.66 14.604 5.396C13.34 4.132 11.8053 3.5 10 3.5C8.19467 3.5 6.66 4.132 5.396 5.396C4.132 6.66 3.5 8.19467 3.5 10C3.5 11.8053 4.132 13.34 5.396 14.604C6.66 15.868 8.19467 16.5 10 16.5Z" fill="currentColor"/></g>'
    },
    "display": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M5.75 11C5.958 11 6.135 10.927 6.281 10.781C6.427 10.635 6.5 10.458 6.5 10.25C6.5 10.042 6.427 9.865 6.281 9.719C6.135 9.573 5.958 9.5 5.75 9.5C5.542 9.5 5.365 9.573 5.219 9.719C5.073 9.865 5 10.042 5 10.25C5 10.458 5.073 10.635 5.219 10.781C5.365 10.927 5.542 11 5.75 11ZM5.75 8.5C5.958 8.5 6.135 8.427 6.281 8.281C6.427 8.135 6.5 7.958 6.5 7.75C6.5 7.542 6.427 7.365 6.281 7.219C6.135 7.073 5.958 7 5.75 7C5.542 7 5.365 7.073 5.219 7.219C5.073 7.365 5 7.542 5 7.75C5 7.958 5.073 8.135 5.219 8.281C5.365 8.427 5.542 8.5 5.75 8.5ZM8 11H15V9.5H8V11ZM8 8.5H15V7H8V8.5ZM7 17V15H3.5C3.08333 15 2.72933 14.854 2.438 14.562C2.146 14.2707 2 13.9167 2 13.5V4.5C2 4.08333 2.146 3.72933 2.438 3.438C2.72933 3.146 3.08333 3 3.5 3H16.5C16.9167 3 17.2707 3.146 17.562 3.438C17.854 3.72933 18 4.08333 18 4.5V13.5C18 13.9167 17.854 14.2707 17.562 14.562C17.2707 14.854 16.9167 15 16.5 15H13V17H7ZM3.5 13.5H16.5V4.5H3.5V13.5Z" fill="#414159"/>'
    },
    "download": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10 13.271L5.70801 8.97901L6.95801 7.72901L9.12501 9.89601V3.33301H10.875V9.89601L13.042 7.72901L14.292 8.97901L10 13.271ZM5.08301 16.667C4.59701 16.667 4.18401 16.4967 3.84401 16.156C3.50334 15.816 3.33301 15.403 3.33301 14.917V12.5H5.08301V14.917H14.917V12.5H16.667V14.917C16.667 15.403 16.4967 15.816 16.156 16.156C15.816 16.4967 15.403 16.667 14.917 16.667H5.08301Z" fill="#656A81"/>'
    },
    "empty-state-error": {
      "viewBox": "0 0 300 147",
      "body": '<path d="M297.887 76.755C302.497 83.3023 302.46 103.738 266.995 107.428C249.155 109.283 261.166 133.37 239.078 143.251C214.943 154.049 171.785 133.61 148.048 133.61C115.156 133.61 51.4743 160.253 29.394 136.209C16.8034 122.497 36.1389 105.948 18.9051 100.077C4.8576 95.2925 -5.11447 84.0712 2.79849 76.1124L288.288 73.4424L297.887 76.755Z" fill="url(#paint0_linear_3234_5687)"/><path d="M286.468 75.464C293.578 80.6881 291.971 100.001 258.981 103.189C242.384 104.793 253.557 125.606 233.011 134.145C210.559 143.476 170.411 125.814 148.33 125.814C117.732 125.814 58.4917 148.837 37.9522 128.06C26.2386 116.211 44.2265 101.91 28.1957 96.837C15.1267 92.7033 7.4411 82.3405 14.8014 75.4623H286.468V75.464Z" fill="url(#paint1_linear_3234_5687)"/><path d="M276.427 75.4623C282.946 79.9301 281.474 96.4478 251.22 99.1743C236.001 100.545 246.248 118.347 227.407 125.651C206.819 133.633 170.003 118.526 149.754 118.526C121.696 118.526 67.3723 138.219 48.5373 120.448C37.7966 110.314 54.2919 98.083 39.5893 93.7438C27.6049 90.2074 20.5575 81.3447 27.3078 75.4623H276.427Z" fill="url(#paint2_linear_3234_5687)"/><path d="M95.6171 37.0091C103.454 37.0091 109.806 30.6457 109.806 22.7973C109.806 14.9489 103.453 8.58551 95.6171 8.58551C87.7816 8.58551 81.4286 14.9489 81.4286 22.7973C81.4286 30.6457 87.7816 37.0091 95.6171 37.0091Z" fill="url(#paint3_linear_3234_5687)"/><path d="M71.0372 47.103C71.0372 48.1226 55.6226 70.325 57.123 74.0367C81.262 80.0301 113.2 77.5868 136.872 78.4465C140.018 78.5596 147.16 78.8844 150.593 79.0072C163.01 79.458 221.705 79.1332 221.705 79.1332L145.747 9.68695C145.747 9.68695 80.1279 45.8991 71.0372 47.103Z" fill="#F4FCCD"/><path d="M66.0708 48.3666C63.2783 64.2008 80.5691 77.5901 80.5691 77.5901L154.867 77.9957C154.867 77.9957 156.55 68.8141 140.845 63.047C131.572 59.7878 157.273 38.4676 143.365 33.363C132.442 28.7771 145.744 9.68695 145.744 9.68695L66.0724 48.3666H66.0708Z" fill="url(#paint4_linear_3234_5687)"/><path d="M20.8454 84.5804C12.7679 83.5236 2.94641 75.8707 2.94641 75.8707L297.892 76.7385L287.654 78.4707C287.654 78.4707 257.496 85.9798 238.113 86.1995C220.208 86.4015 189.772 83.9744 168.425 83.2941C153.793 82.8272 118.023 79.8717 93.0093 80.1997C68.7283 80.5197 35.8083 86.534 20.8486 84.5788L20.8454 84.5804Z" fill="url(#paint5_linear_3234_5687)"/><path opacity="0.5" d="M43.5957 20.6677C44.1667 20.4996 44.7507 20.3041 45.2105 19.9325C45.9897 19.3023 46.2333 18.239 45.901 17.4246C45.5671 16.6102 44.7282 16.0543 43.7876 15.8588C43.5957 15.8184 43.3892 15.7893 43.2472 15.6697C43.0697 15.5194 43.0488 15.269 43.0165 15.0395C42.8132 13.5513 41.7872 12.2456 40.3321 11.6251C38.8769 11.0046 37.0249 11.0806 35.4826 11.8255C35.523 10.3518 33.4806 8.92498 32.2835 8.6729C31.1462 8.43537 28.4698 8.65674 27.8632 9.65052C26.5162 8.53878 24.1415 8.89105 22.5653 10.0286C20.9892 11.1662 20.0648 12.8872 19.4001 14.579C17.1609 14.1928 14.5297 15.8685 14.0603 17.9788C13.0197 17.4197 10.0965 19.6367 13.8812 19.989C35.7004 22.0267 42.5309 20.9812 43.5973 20.6661L43.5957 20.6677Z" fill="#1EC6CE"/><path d="M185.291 76.8564C182.96 69.8063 241.46 21.63 241.46 21.63C241.46 21.63 268.923 63.4542 297.893 76.7385C297.896 76.7352 190.01 77.2426 185.291 76.8564Z" fill="#F4FCCD"/><path d="M177.29 76.8306C184.977 67.5052 241.453 21.63 241.453 21.63C241.453 21.63 238.475 35.1647 244.872 41.7802C249.652 47.2936 233.284 51.4723 230.525 56.3604C228.089 60.6813 249.239 69.7788 243.002 76.8306C240.965 76.8306 181.989 77.2168 177.288 76.8306H177.29Z" fill="url(#paint6_linear_3234_5687)"/><path opacity="0.5" d="M267.232 24.041C266.818 23.8745 266.395 23.6871 266.085 23.351C265.559 22.7822 265.48 21.8579 265.814 21.1679C266.148 20.4812 266.837 20.032 267.568 19.8978C267.716 19.8704 267.876 19.8526 267.994 19.7556C268.142 19.6312 268.184 19.4179 268.231 19.224C268.532 17.9507 269.437 16.8664 270.599 16.3849C271.761 15.9033 273.153 16.0375 274.245 16.7339C274.361 15.4654 276.045 14.3101 276.978 14.1372C277.862 13.9723 279.861 14.2616 280.222 15.1406C281.353 14.2341 283.11 14.6219 284.187 15.6577C285.267 16.6935 285.794 18.2076 286.128 19.6862C287.858 19.4341 289.679 20.9708 289.826 22.8064C290.668 22.3621 292.657 24.3755 289.761 24.5419C273.069 25.5018 268.008 24.3545 267.234 24.0426L267.232 24.041Z" fill="#1EC6CE"/><path d="M175.675 62.9017L174.16 74.5168H177.19L175.675 62.9017Z" fill="#D4ED84"/><path d="M175.62 66.4874L175.793 76.8646" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M175.721 72.4695L176.529 71.3949" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M175.677 70.0246L175.017 68.7981" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M175.647 68.2148L176.013 67.436" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M175.741 73.9351L174.91 72.7054" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M168.084 61.1905L166.225 75.4346H169.94L168.084 61.1905Z" fill="#537C09"/><path d="M168.013 65.5858L168.226 78.3142" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M168.134 72.9219L169.126 71.6049" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M168.088 69.926L167.276 68.4249" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M168.047 67.7042L168.495 66.7509" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M168.162 74.7221L167.142 73.2128" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M171.079 57.97L168.884 74.798H173.273L171.079 57.97Z" fill="#D4ED84"/><path d="M170.993 63.1619L171.243 78.1994" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M171.14 71.8296L172.311 70.2735" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M171.079 68.2891L170.122 66.5148" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M171.033 65.6649L171.562 64.5402" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M171.172 73.956L169.968 72.1737" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M257.42 58.2074L255.153 75.5831H259.687L257.42 58.2074Z" fill="#537C09"/><path d="M257.336 63.5689L257.593 79.096" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M257.484 72.5177L258.694 70.9131" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M257.425 68.8642L256.439 67.0302" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M257.377 66.156L257.925 64.9926" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M257.521 74.7137L256.278 72.8732" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M252.378 63.4897L250.653 76.7158H254.102L252.378 63.4897Z" fill="#537C09"/><path d="M252.314 67.5715L252.509 79.3901" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M252.421 74.3842L253.342 73.1609" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M252.374 71.6015L251.624 70.207" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M252.348 69.538L252.764 68.6525" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M252.452 76.0549L251.504 74.6539" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M22.8589 76.1423C21.0085 68.5864 25.9741 58.1719 36.8651 56.1731C39.8803 44.5322 64.4146 21.6317 64.4146 21.6317C64.4146 21.6317 103.344 70.3315 111.041 76.1843C111.044 76.1811 22.8589 76.1439 22.8589 76.1439V76.1423Z" fill="#F4FCCD"/><path d="M2.90625 76.1422L64.4195 21.63C64.4195 21.63 55.5627 38.1008 62.1222 41.2033C67.3362 43.9407 76.5543 50.6305 71.1435 59.5906C66.5393 67.2192 61.1849 70.3121 68.8801 76.1616C68.8833 76.1616 2.90625 76.1406 2.90625 76.1406L2.90625 76.1422Z" fill="url(#paint7_linear_3234_5687)"/><path opacity="0.16" d="M85.5876 102.971C85.5876 102.971 71.0974 108.673 61.5405 111.534C63.8071 113.513 93.8346 121.045 140.307 121.045C167.962 121.045 206.349 124.157 230.399 122.819C234.55 122.588 234.55 116.596 234.55 116.596C234.55 116.596 233.563 112.851 232.311 112.653C214.525 109.843 196.381 110.771 178.422 109.489C163.053 108.394 147.84 105.681 132.483 104.409C117.023 103.136 85.5876 102.973 85.5876 102.973V102.971Z" fill="black" stroke="black" stroke-width="2.85714" stroke-miterlimit="10"/><path d="M79.9037 85.6647C94.3052 85.5387 119.628 89.0145 154.141 91.9247C197.924 98.6969 227.553 103.546 241.669 107.321C230.27 109.048 219.53 105.455 208.551 103.47C197.571 101.486 191.666 100.699 181.895 100.319C159.008 99.4305 136.063 98.5353 113.416 95.1031C100.639 93.1673 87.8344 90.3831 79.9021 85.6631L79.9037 85.6647Z" fill="#BD5B00"/><path d="M113.915 80.0607C116.199 80.901 118.484 81.738 120.768 82.5783C121.826 82.9677 122.894 83.3572 124.011 83.5042C126.713 83.8613 129.412 82.7561 131.706 81.2791C132.677 81.7801 133.818 81.7607 134.9 81.8964C136.213 82.0628 137.483 82.4765 138.782 82.7302C142.716 83.4994 146.803 82.7884 150.775 83.3459C151.87 83.501 152.973 83.7579 153.937 84.3057C156.594 85.8182 157.097 89.0564 156.974 92.3238C156.945 93.1026 156.432 98.0295 155.966 99.1735C155.966 99.1735 142.647 98.3203 134.521 97.6352C124.64 96.8014 108.68 94.1562 108.68 94.1562C108.503 93.8492 108.922 88.9449 108.964 88.5878C109.199 86.5793 109.451 84.5045 110.453 82.7447C111.455 80.985 113.286 79.8248 113.917 80.0591L113.915 80.0607Z" fill="#284A7D" stroke="#284A7D" stroke-width="2.85714" stroke-miterlimit="10"/><path d="M113.913 80.0608C116.198 80.9011 118.482 81.7381 120.766 82.5784C121.825 82.9678 122.893 83.3573 124.009 83.5043C126.711 83.8614 129.41 82.7562 131.704 81.2792C132.742 81.8141 134.924 84.0473 142.71 84.7033C152.217 85.5048 148.006 98.3059 148.431 98.6711C148.431 98.6711 142.645 98.3204 134.521 97.6353C124.64 96.8015 108.68 94.1563 108.68 94.1563C108.503 93.8493 108.922 88.945 108.962 88.5895C109.198 86.581 109.45 84.5062 110.451 82.7465C111.453 80.9867 113.281 79.8265 113.912 80.0608H113.913Z" fill="#3D5C9B" stroke="#3D5C9B" stroke-width="2.85714" stroke-miterlimit="10"/><path d="M79.9016 85.6647C79.1998 92.5516 81.7762 100.046 87.1467 104.406C116.889 106.426 234.394 116.916 234.394 116.916C239.788 114.334 240.101 112.01 241.531 107.547C238.263 107.935 186.132 99.3497 162.132 97.325C126.4 94.3113 79.9 85.6647 79.9 85.6647H79.9016Z" fill="#F9AA00" stroke="#F9AA00" stroke-width="2.85714" stroke-miterlimit="10"/><path d="M130.835 56.7306C132.076 56.1796 134.647 57.2525 135.464 58.0572C138.827 61.3698 145.346 69.9696 145.663 70.4592C151.08 66.7912 159.541 62.3507 161.737 59.2401C161.887 59.03 162.298 59.0252 162.439 59.2401C162.505 59.3338 162.513 59.2837 162.503 59.4017C162.447 59.9785 162.271 60.7186 162.013 61.2341C162.416 60.8317 163.132 60.9352 163.566 61.302C164.002 61.6688 164.228 62.2246 164.439 62.753C164.644 63.2669 164.846 63.8017 164.815 64.3512C164.749 65.4451 163.657 66.2611 162.594 66.5084C159.143 67.3099 150.231 74.9046 144.99 77.1474C139.671 79.4242 135.988 67.2533 133.789 65.1381C133.337 64.7002 130.959 58.2043 130.835 56.7322V56.7306Z" fill="#BA8A65" stroke="#BA8A65" stroke-width="2.85714" stroke-miterlimit="10"/><path opacity="0.1" d="M130.835 56.7306C132.076 56.1796 134.647 57.2525 135.464 58.0572C138.827 61.3698 145.346 69.9696 145.663 70.4592L144.99 77.1458C139.671 79.4226 135.988 67.2517 133.789 65.1365C133.337 64.6986 130.959 58.2027 130.835 56.7306Z" fill="black" stroke="black" stroke-width="2.85714" stroke-miterlimit="10"/><path d="M121.271 57.7227C122.003 55.2149 123.389 51.7876 123.621 49.1892C124.768 49.4381 124.902 50.8827 125.917 51.4789C127.133 52.1932 128.387 52.9316 129.782 53.1191C129.91 53.1368 130.057 53.1611 130.124 53.2693C130.17 53.3404 130.166 53.4325 130.163 53.5166C130.061 55.5962 129.957 57.6937 129.418 59.7071C129.123 60.8075 128.693 61.9014 128.735 63.0374C128.743 63.2152 128.735 63.4366 128.577 63.5157C128.516 63.548 128.442 63.5497 128.371 63.5464C126.201 63.5044 124.06 62.6124 122.499 61.1113C121.965 60.5958 121.479 60.0028 120.824 59.6586C120.876 58.7892 121.043 57.9264 121.272 57.7195L121.271 57.7227Z" fill="#BA8A65"/><path d="M113.263 80.321C118.59 84.0989 127.346 84.49 130.983 81.89C131.845 81.2743 131.314 79.8992 131.48 78.6146C131.935 75.0871 133.064 74.0965 134.166 70.7129C134.166 70.7129 135.405 64.8229 134.476 62.2747C133.547 59.7296 132.009 56.6497 130.125 56.6497C129.761 58.529 129.98 60.7444 127.473 60.9367C125.531 61.0837 121.652 60.1158 121.257 57.3946C119.565 57.6112 119.084 57.7372 117.277 57.818C118.684 59.547 118.928 60.2564 118.74 62.4815C118.524 65.0475 114.912 67.1175 114.912 67.1175C115.812 71.8553 112.286 79.845 113.262 80.3242L113.263 80.321Z" fill="white" stroke="white" stroke-width="1.42857" stroke-miterlimit="10"/><path d="M96.8863 109.287L94.9891 108.924L161.712 63.4559L162.486 64.5094L96.8863 109.287Z" fill="#202024" stroke="#202024" stroke-width="2.85714" stroke-miterlimit="10"/><path d="M109.975 60.1772C111.343 58.4935 113.709 57.797 117.278 57.8196C117.278 57.8196 118.933 59.8993 118.839 61.9725C118.783 63.2523 116.937 65.5969 116.161 66.253C110.649 70.9164 106.921 74.0157 107.434 75.9144C107.884 77.5901 113.508 84.5804 115.15 85.9814C117.212 87.7476 123.171 92.2382 120.438 93.8815C118.13 95.2712 114.029 90.6271 112.491 89.5041C109.005 86.9623 100.068 77.9181 99.6627 76.2247C98.8754 72.925 106.067 64.9829 109.973 60.1756L109.975 60.1772Z" fill="#BA8A65" stroke="#BA8A65" stroke-width="2.85714" stroke-miterlimit="10"/><path opacity="0.1" d="M107.434 75.9144C107.884 77.5885 113.508 84.5804 115.151 85.9814C117.212 87.7476 123.172 92.2382 120.439 93.8815C118.13 95.2712 114.028 90.6271 112.492 89.5041C109.004 86.9623 100.068 77.9181 99.6633 76.2246L107.434 75.9128V75.9144Z" fill="black" stroke="black" stroke-width="2.85714" stroke-miterlimit="10"/><path opacity="0.1" d="M123.355 50.8778C124.034 55.2084 128.022 56.9665 128.918 56.9633C130.145 56.9633 129.997 56.2539 130.049 55.6447C130.134 54.6299 130.121 54.1209 130.102 54.0789C130.071 54.003 129.986 53.969 129.91 53.9448C129.189 53.6911 128.469 53.4422 127.748 53.1885C127.206 52.9979 126.664 52.8088 126.149 52.5567C125.72 52.3467 125.312 52.093 124.904 51.8409C124.339 51.4854 123.749 50.8843 123.355 50.8778Z" fill="black"/><path d="M122.688 41.8644C120.654 43.4592 121.557 45.9946 121.51 46.0269C121.436 46.0802 121.067 46.119 120.96 46.2402C120.662 46.5698 120.586 46.9189 120.744 47.4505C120.902 47.9821 121.15 48.3328 121.693 48.441C121.976 48.4976 122.296 48.4362 122.417 48.1728C122.82 49.1876 124.25 52.4048 124.742 52.93C125.288 53.5133 129.157 54.5023 129.762 54.4635C130.572 54.4134 131.635 53.8284 131.941 53.0803C132.661 51.3335 132.684 46.363 132.655 45.8718C132.567 44.3173 130.862 42.8355 130.22 42.2085C128.468 40.4908 123.698 41.0693 122.689 41.8627L122.688 41.8644Z" fill="#BA8A65"/><path d="M132.383 49.2037C132.193 47.814 130.673 49.4008 129.803 49.4557C128.492 49.5414 127.54 50.7388 126.741 49.9567C124.802 48.0531 124.451 47.2678 123.96 45.7424C123.521 44.3689 123.741 42.9469 125.125 42.6076C126.509 42.2731 128.214 43.3719 129.694 43.4963C131.173 43.6207 131.091 42.9695 130.282 42.2085C128.493 40.5279 123.757 41.0725 122.747 41.8659C120.713 43.4608 121.445 45.8248 121.46 45.8781C121.46 45.8781 122.086 45.8232 122.423 46.8735C122.763 47.9319 122.489 48.3634 122.489 48.3634C122.712 49.3701 124.309 52.4047 124.801 52.9315C125.348 53.5149 129.216 54.5038 129.821 54.4666C130.631 54.4165 131.692 53.8316 132.001 53.0834C132.004 53.0834 132.612 50.8616 132.383 49.202V49.2037Z" fill="#202024" stroke="#202024" stroke-width="2.85714" stroke-miterlimit="10"/><path d="M129.689 45.6342C129.901 46.2951 130.656 47.3098 130.92 47.7817C130.494 48.0742 129.938 48.4668 129.489 48.6171" stroke="#202024" stroke-width="1.42857" stroke-miterlimit="10"/><path d="M128.59 50.9828C128.288 50.2055 131.828 49.0938 131.817 50.1974C131.936 50.5594 131.073 50.5853 130.36 50.784C129.39 51.0555 128.806 51.6291 128.59 50.9828Z" fill="white"/><path d="M120.327 44.9055C121.706 45.1252 134.039 41.8999 135.088 41.3925C135.917 40.9918 135.33 40.3648 134.661 40.3163C133.631 40.2436 131.282 40.7122 130.25 40.7962C129.91 39.9576 129.521 39.0979 128.846 38.5453C126.301 36.464 120.299 39.3322 119.861 43.1118C119.794 43.6839 119.959 44.3124 120.327 44.9071V44.9055Z" fill="#1EC6CE"/><path d="M133.002 64.7841L129.188 65.3335C129.448 66.2756 130.286 68.1258 131.572 68.003C132.858 67.8786 133.061 65.8054 133.002 64.7841Z" fill="#F2F3FA" stroke="#DADCE7" stroke-width="1.42857"/><path d="M197.987 101.804C197.987 101.804 196.74 63.27 200.829 52.2238C204.92 41.1775 219.861 34.2292 228.398 32.8039C236.935 31.3787 244.406 30.4884 250.275 29.7758C256.144 29.0631 257.746 21.9371 249.386 23.1845C241.027 24.432 239.604 29.7758 236.58 29.2425C233.557 28.7077 235.158 25.6795 232.489 25.5017C229.821 25.324 226.264 31.7375 223.595 29.7774C220.927 27.8173 223.773 24.6114 230.71 19.4437C237.647 14.2777 234.059 9.83885 227.864 11.0702C215.324 13.5651 205.453 30.49 203.318 30.6677C201.184 30.8455 203.141 26.1255 200.828 25.5906C198.516 25.0557 197.448 30.8455 196.025 30.8455C194.602 30.8455 195.668 18.1963 196.025 13.9206C196.381 9.64494 188.911 8.75458 186.42 13.3857C183.929 18.0185 181.974 28.1728 178.416 29.598C174.859 31.0232 172.902 25.3224 171.836 23.7194C170.768 22.1164 168.813 22.829 168.99 25.6795C169.168 28.5299 168.146 31.0022 166.144 26.9269C163.299 21.1372 157.784 15.8807 153.516 16.5933C149.247 17.3059 156.539 21.4038 155.828 23.1845C155.116 24.9669 150.08 21.9904 146.134 23.2734C139.285 25.5001 137.151 31.2899 143.199 30.3995C143.199 30.3995 154.752 25.9768 173.081 34.5863C190.275 42.6625 192.41 60.4778 192.765 70.8114C193.121 81.145 193.887 101.229 193.887 101.229L197.985 101.804H197.987Z" fill="#67C9FC"/><path d="M165.588 58.9346C167.193 58.9346 168.493 58.0042 168.493 56.8565C168.493 55.7089 167.193 54.7785 165.588 54.7785C163.983 54.7785 162.682 55.7089 162.682 56.8565C162.682 58.0042 163.983 58.9346 165.588 58.9346Z" fill="#67C9FC"/><path d="M226.374 54.2848C227.054 53.3613 226.558 51.839 225.267 50.8848C223.976 49.9306 222.378 49.9057 221.698 50.8292C221.017 51.7527 221.513 53.2749 222.804 54.2291C224.095 55.1834 225.693 55.2083 226.374 54.2848Z" fill="#67C9FC"/><path d="M245.952 17.0247C247.561 16.222 248.402 14.6374 247.829 13.4854C247.256 12.3334 245.487 12.0503 243.878 12.853C242.268 13.6557 241.428 15.2403 242.001 16.3923C242.573 17.5443 244.342 17.8274 245.952 17.0247Z" fill="#67C9FC"/><path d="M158.689 43.4431C160.042 43.4431 161.138 42.5127 161.138 41.365C161.138 40.2174 160.042 39.287 158.689 39.287C157.337 39.287 156.24 40.2174 156.24 41.365C156.24 42.5127 157.337 43.4431 158.689 43.4431Z" fill="#67C9FC"/><path d="M230.42 42.1532C231.068 41.2061 230.687 39.818 229.571 39.0529C228.455 38.2877 227.026 38.4352 226.379 39.3822C225.732 40.3293 226.112 41.7173 227.228 42.4825C228.344 43.2477 229.773 43.1002 230.42 42.1532Z" fill="#67C9FC"/><path d="M241.101 4.82575C242.272 4.1484 242.757 2.79356 242.184 1.79965C241.612 0.805739 240.198 0.549126 239.026 1.22648C237.855 1.90384 237.37 3.25867 237.943 4.25258C238.516 5.24649 239.93 5.50311 241.101 4.82575Z" fill="#67C9FC"/><path d="M158.012 4.80052C158.99 4.80052 159.783 4.00616 159.783 3.02627C159.783 2.04637 158.99 1.25201 158.012 1.25201C157.033 1.25201 156.24 2.04637 156.24 3.02627C156.24 4.00616 157.033 4.80052 158.012 4.80052Z" fill="#67C9FC"/><path d="M170.144 46.4486C170.633 46.4486 171.03 46.0514 171.03 45.5615C171.03 45.0716 170.633 44.6744 170.144 44.6744C169.655 44.6744 169.258 45.0716 169.258 45.5615C169.258 46.0514 169.655 46.4486 170.144 46.4486Z" fill="#67C9FC"/><path d="M208.928 54.3309C209.172 54.3309 209.37 54.1327 209.37 53.8882C209.37 53.6437 209.172 53.4454 208.928 53.4454C208.684 53.4454 208.486 53.6437 208.486 53.8882C208.486 54.1327 208.684 54.3309 208.928 54.3309Z" fill="#67C9FC"/><path d="M259.975 16.5901C260.219 16.5901 260.417 16.3919 260.417 16.1473C260.417 15.9028 260.219 15.7046 259.975 15.7046C259.731 15.7046 259.533 15.9028 259.533 16.1473C259.533 16.3919 259.731 16.5901 259.975 16.5901Z" fill="#67C9FC"/><path d="M178.173 54.3309C178.662 54.3309 179.059 53.9337 179.059 53.4438C179.059 52.9538 178.662 52.5566 178.173 52.5566C177.684 52.5566 177.287 52.9538 177.287 53.4438C177.287 53.9337 177.684 54.3309 178.173 54.3309Z" fill="#67C9FC"/><path d="M217.374 46.4486C217.863 46.4486 218.26 46.0514 218.26 45.5615C218.26 45.0716 217.863 44.6744 217.374 44.6744C216.885 44.6744 216.488 45.0716 216.488 45.5615C216.488 46.0514 216.885 46.4486 217.374 46.4486Z" fill="#67C9FC"/><path d="M251.968 8.83864C252.457 8.83864 252.853 8.44146 252.853 7.95152C252.853 7.46157 252.457 7.06439 251.968 7.06439C251.478 7.06439 251.082 7.46157 251.082 7.95152C251.082 8.44146 251.478 8.83864 251.968 8.83864Z" fill="#67C9FC"/><path d="M141.315 39.0466C142.184 38.2977 142.425 37.1529 141.855 36.4894C141.284 35.826 140.118 35.8952 139.25 36.6441C138.382 37.3929 138.14 38.5378 138.71 39.2012C139.281 39.8647 140.447 39.7954 141.315 39.0466Z" fill="#67C9FC"/><path d="M140.556 9.67915C142.011 8.42369 142.416 6.50409 141.46 5.39161C140.504 4.27913 138.548 4.39504 137.093 5.6505C135.637 6.90596 135.232 8.82555 136.188 9.93803C137.145 11.0505 139.1 10.9346 140.556 9.67915Z" fill="#67C9FC"/><path d="M127.514 45.9369C127.75 45.9369 127.942 45.7447 127.942 45.5076C127.942 45.2705 127.75 45.0783 127.514 45.0783C127.277 45.0783 127.085 45.2705 127.085 45.5076C127.085 45.7447 127.277 45.9369 127.514 45.9369Z" fill="#202024"/><path d="M130.942 45.1079C131.179 45.1079 131.371 44.9158 131.371 44.6787C131.371 44.4416 131.179 44.2494 130.942 44.2494C130.706 44.2494 130.514 44.4416 130.514 44.6787C130.514 44.9158 130.706 45.1079 130.942 45.1079Z" fill="#202024"/><path d="M30.3785 50.9942L27.2939 74.638H33.463L30.3785 50.9942Z" fill="#537C09"/><path d="M30.2605 58.29L30.609 79.4178" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M30.4613 70.4673L32.1068 68.2842" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M30.3773 65.4952L29.035 62.9987" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M30.3141 61.8093L31.061 60.2258" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M30.5114 73.4551L28.8207 70.9505" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M19.1754 49.4187L16.0908 73.0657H22.2599L19.1754 49.4187Z" fill="#537C09"/><path d="M19.0574 56.7177L19.4058 77.8423" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M19.2649 68.895L20.9104 66.7087" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M19.1808 63.9213L17.8386 61.428" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M19.1176 60.2338L19.8645 58.6503" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M19.3082 71.8829L17.6176 69.3783" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M25.1026 57.377L22.9747 73.6959H27.2321L25.1042 57.377H25.1026Z" fill="#D4ED84"/><path d="M25.0238 62.4137L25.2658 76.9955" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M25.1644 70.8196L26.3002 69.3104" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M25.1077 67.3859L24.1801 65.6633" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M25.0641 64.8424L25.5771 63.7484" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M25.2024 72.8799L24.0328 71.1509" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M84.9258 58.6728L82.714 75.6251H87.1375L84.9258 58.6728Z" fill="#D4ED84"/><path d="M84.8434 63.9051L85.0934 79.0525" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M84.9907 72.6358L86.1716 71.07" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M84.9293 69.0711L83.9662 67.2823" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M84.8835 66.4275L85.4192 65.2916" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M85.0253 74.7769L83.8121 72.9816" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M77.4525 56.2538L75.2407 73.2078H79.6643L77.4525 56.2538Z" fill="#537C09"/><path d="M77.3702 61.4861L77.6203 76.6319" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M77.5175 70.2169L78.6984 68.6495" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M77.4544 66.6505L76.4929 64.8633" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M77.5454 72.3595L76.3323 70.5642" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M81.7022 62.6254L80.176 74.3261H83.2283L81.7022 62.6254Z" fill="#537C09"/><path d="M81.6492 66.2369L81.8218 76.6917" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M81.7496 72.2626L82.5627 71.1799" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M81.7045 69.8015L81.0398 68.567" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M81.676 67.9772L82.0438 67.1918" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M81.7716 73.7411L80.9327 72.5017" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M88.2857 56.1068L86.0756 73.0608H90.4975L88.2857 56.1068Z" fill="#537C09"/><path d="M88.205 61.3407L88.4566 76.4865" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M88.3523 70.0681L89.5348 68.5023" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M88.2909 66.5051L87.3278 64.718" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M88.2452 63.8615L88.7776 62.7255" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M88.3869 72.2109L87.1737 70.4156" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M91.0434 62.509L89.4237 74.9272H92.6615L91.0434 62.509Z" fill="#D4ED84"/><path d="M90.984 66.3434L91.1695 77.4382" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M91.0912 72.736L91.9575 71.5887" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M91.0459 70.1263L90.3409 68.8174" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M91.0109 68.1889L91.4013 67.3567" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><path d="M91.1162 74.3065L90.2273 72.9912" stroke="black" stroke-width="0.714286" stroke-miterlimit="10" stroke-linecap="round"/><defs><linearGradient id="paint0_linear_3234_5687" x1="150.838" y1="75.3425" x2="150.831" y2="135.642" gradientUnits="userSpaceOnUse"><stop offset="0.553117" stop-color="#CCF3FE"/><stop offset="1" stop-color="#67C9FC"/></linearGradient><linearGradient id="paint1_linear_3234_5687" x1="168.473" y1="140.716" x2="169.3" y2="90.2858" gradientUnits="userSpaceOnUse"><stop stop-color="#67C9FC"/><stop offset="1" stop-color="#CCF3FE"/></linearGradient><linearGradient id="paint2_linear_3234_5687" x1="152.13" y1="75.4623" x2="152.13" y2="116.139" gradientUnits="userSpaceOnUse"><stop stop-color="#CCF3FE"/><stop offset="1" stop-color="#67C9FC"/></linearGradient><linearGradient id="paint3_linear_3234_5687" x1="95.622" y1="20.6369" x2="95.5864" y2="37.0091" gradientUnits="userSpaceOnUse"><stop stop-color="#FFE795"/><stop offset="1" stop-color="#FFF9DB"/></linearGradient><linearGradient id="paint4_linear_3234_5687" x1="139.791" y1="47.5603" x2="94.2474" y2="63.6207" gradientUnits="userSpaceOnUse"><stop stop-color="#D4ED84"/><stop offset="1" stop-color="#8ABA1A"/></linearGradient><linearGradient id="paint5_linear_3234_5687" x1="33.2932" y1="77.4705" x2="281.231" y2="83.9484" gradientUnits="userSpaceOnUse"><stop stop-color="#F9AA00"/><stop offset="1" stop-color="#FFE795"/></linearGradient><linearGradient id="paint6_linear_3234_5687" x1="212.844" y1="39.6472" x2="210.599" y2="77.4523" gradientUnits="userSpaceOnUse"><stop stop-color="#8ABA1A"/><stop offset="1" stop-color="#537C09"/></linearGradient><linearGradient id="paint7_linear_3234_5687" x1="31.3495" y1="43.4575" x2="47.6092" y2="81.5039" gradientUnits="userSpaceOnUse"><stop stop-color="#8ABA1A"/><stop offset="1" stop-color="#537C09"/></linearGradient></defs>'
    },
    "empty-state-no-results": {
      "viewBox": "0 0 250 159",
      "body": '<path d="M132.32 15.3566C109.233 24.5905 105.74 31.677 91.5695 37.3431C75.3097 43.6981 61.1816 28.7067 40.6635 36.9115C25.7915 42.859 19.5065 58.5817 19.1066 74.1532C18.5744 94.9146 37.4328 112.24 61.2304 112.851C76.0116 113.229 89.2188 107.069 97.2339 97.3723C108.216 107.769 123.789 114.456 141.205 114.901C175.367 115.778 203.68 92.326 204.445 62.5224C204.884 45.412 196.149 29.9278 182.163 19.6754C171.788 12.071 153.665 7.01325 132.32 15.3566Z" fill="url(#paint0_linear_98_50755)" fill-opacity="0.5"/><path d="M97.1663 79.5717C103.1 79.5717 107.911 74.7612 107.911 68.8271C107.911 62.893 103.1 58.0825 97.1663 58.0825C91.2322 58.0825 86.4216 62.893 86.4216 68.8271C86.4216 74.7612 91.2322 79.5717 97.1663 79.5717Z" fill="url(#paint1_linear_98_50755)"/><path d="M138.328 84.4116C141.941 81.6277 146.575 78.6933 150.606 76.9601C153.987 75.5063 157.629 74.3799 161.01 72.9261C162.788 72.1624 164.564 71.3976 166.342 70.6339C170.422 68.8793 173.364 67.7113 177.61 66.4058C175.937 68.9571 179 69.1321 175.599 72.5357C174.755 73.3805 175.133 74.6338 175.502 75.7697C175.871 76.9067 176.677 77.8507 177.57 78.6453C178.408 79.3909 179.391 80.1088 179.698 81.1882C180.042 82.3956 179.405 83.6894 178.517 84.578C177.63 85.4665 176.506 86.0755 175.533 86.8669C174.265 87.8973 173.255 89.2445 172.621 90.7505C172.511 91.0119 172.397 91.2967 172.155 91.4428C171.99 91.5431 171.79 91.5623 171.597 91.5772C166.723 91.9644 161.842 91.1687 157.018 90.3762C151.703 89.5026 146.217 88.564 141.699 85.6296C140.939 85.1358 138.737 84.8083 138.328 84.4116Z" fill="url(#paint2_linear_98_50755)"/><path d="M177.713 66.4058C181.461 68.4025 185.538 71.4204 188.834 74.0902C191.673 76.091 213.985 89.4082 213.985 89.4082C213.985 89.4082 200.884 89.4082 195.825 89.4082C191.88 89.4082 182.294 90.2172 178.986 89.4164C176.205 88.7444 173.369 88.2982 170.515 88.0842C170.297 83.4092 170.325 78.6576 171.572 74.1445C171.942 72.8059 172.423 71.4843 173.17 70.3108C174.378 68.4142 176.013 66.8626 177.713 66.4058Z" fill="url(#paint3_linear_98_50755)"/><path d="M106.011 75.5525C106.011 75.5525 138.484 83.3461 156.465 86.4287C168.569 88.5035 173.495 85.492 190.648 84.3721C193.02 84.2178 246.524 117.789 246.524 117.789C246.524 117.789 197.545 113.494 197.366 117.789C188.869 116.557 178.92 115.649 170.35 115.117C158.858 114.401 147.366 113.685 135.873 112.969C117.088 111.8 98.1794 110.633 79.4929 112.883C78.7347 112.974 77.7283 113.425 77.9568 114.154C83.0915 109.552 87.0126 103.78 90.8806 98.0722C95.3949 91.4075 99.9092 84.7429 104.425 78.0782C105.065 77.1324 106.011 75.5525 106.011 75.5525Z" fill="url(#paint4_linear_98_50755)"/><path d="M0 122.839C0 122.839 39.4222 93.2671 42.6002 91.0727C45.7782 88.8784 54.3249 82.5269 56.8809 81.5493C57.7813 81.2058 63.3852 81.9185 64.1827 81.9185C70.068 81.9185 71.7297 82.7887 77.674 82.6843C79.5702 82.651 82.0097 83.0339 83.9059 83.0339C85.7325 83.0339 89.4886 81.4146 90.2498 81.0696C95.9868 78.4727 99.7111 77.5541 105.677 75.5354C106.317 75.319 106.741 75.944 107.426 76.5039C109.433 78.1383 110.329 79.3535 113.166 79.93C113.909 80.0814 115.863 80.0662 115.901 80.6534C115.926 81.0514 113.678 81.2829 112.938 81.5054C109.909 82.4134 113.655 84.3126 114.637 84.7333C117.549 85.9818 119.97 86.7914 123.216 87.9219C129.858 89.9876 136.309 91.9246 143.21 92.7933C145.143 93.0369 150.904 93.9918 152.183 94.1522C154.769 94.4776 156.606 94.6622 159.123 94.8937C165.692 95.4991 178.966 96.7355 178.737 97.1834C178.543 97.5617 166.921 97.7933 162.139 98.6271C161.263 98.78 166.627 101.162 171.812 101.875C178.133 102.743 246.672 117.556 246.672 117.556L187.501 115.891C187.501 115.891 184.795 119.877 180.994 121.036C160.352 119.587 144.126 124.007 123.451 124.854C116.727 125.13 110.006 125.528 103.278 125.532C84.7488 125.546 46.8945 122.839 46.8945 122.839H0Z" fill="url(#paint5_linear_98_50755)"/><path opacity="0.502" d="M183.164 56.9836C183.726 56.6347 184.296 56.2531 184.654 55.6955C185.259 54.7495 185.097 53.4267 184.392 52.5514C183.689 51.6763 182.531 51.2354 181.409 51.2502C181.179 51.2535 180.938 51.2705 180.734 51.1672C180.476 51.0342 180.348 50.7451 180.22 50.4836C179.387 48.7762 177.716 47.5008 175.85 47.1448C173.982 46.7887 171.961 47.3606 170.557 48.6427C170.001 46.8892 167.154 45.7301 165.721 45.7443C164.362 45.757 161.489 46.7162 161.223 48.0508C159.274 47.0882 156.788 48.1174 155.506 49.8722C154.223 51.627 153.902 53.902 153.857 56.0758C151.218 56.1996 148.987 58.865 149.33 61.4855C147.947 61.0941 147.182 62.7811 143.208 63.5398C141.384 63.8878 131.3 65.3036 127.28 65.8812C171.044 62.999 181.848 57.7994 183.164 56.9836Z" fill="#1EC6CE"/><path opacity="0.502" d="M128.867 50.7303C129.257 49.7371 127.735 48.7832 126.832 49.0861C126.893 47.889 125.611 47.0379 124.372 47.1651C123.459 47.2579 122.875 47.6171 122.558 48.7962C122.097 48.2267 121.598 47.6968 120.865 47.7021C120.133 47.7075 119.236 48.4137 119.347 49.1381C118.54 48.9177 117.619 49.2032 117.078 49.8407C116.537 50.4782 116.406 51.4348 116.756 52.1933C115.847 52.1234 114.712 52.175 114.32 52.9987C114.222 53.2061 114.188 53.4383 114.098 53.6498C113.65 54.6907 105.337 56.0522 105.337 56.0522C105.337 56.0522 127.801 53.4483 128.867 50.7303Z" fill="#1EC6CE"/><path opacity="0.502" d="M66.6005 59.1648C65.3115 58.8809 62.833 58.2111 62.1768 57.0662C61.68 56.1993 61.9851 55.2278 61.5229 54.342C61.0607 53.4562 59.7826 52.8802 58.9787 53.4736C58.1889 48.1134 54.6029 47.3546 51.4591 47.8667C51.1464 47.9179 50.8201 47.9935 50.5181 47.8949C50.2161 47.7964 49.9963 47.5432 49.782 47.3104C48.281 45.6905 46.224 44.5936 44.0421 44.2518C42.7879 44.0553 37.1568 44.137 37.0336 48.9948C36.93 53.0701 39.1415 54.8069 40.4998 55.2602C54.8353 60.0451 79.1998 60.9154 79.1998 60.9154C79.1998 60.9154 67.8895 59.4488 66.6005 59.1648Z" fill="#1EC6CE"/><path d="M107.282 84.3735C120.042 88.1175 134.582 92.6453 147.049 97.2761C158.653 101.586 187.502 109.64 196.882 113.016C209.899 117.701 250 131.7 250 131.7H168.886L90.0119 133.258C90.0119 133.258 92.2425 128.276 80.3069 126.011C82.5269 117.881 86.1952 110.15 91.0893 103.29C93.9147 99.3297 97.1351 95.669 100.348 92.0173C102.987 89.0179 104.369 85.4646 107.282 84.3735Z" fill="url(#paint6_linear_98_50755)"/><path d="M12.2563 133.343C31.1956 123.07 87.3837 92.633 107.284 84.3718C120.25 95.923 139.861 98.8664 140.229 102.264C140.462 104.422 137.106 105.605 130.957 106.878C95.4876 114.222 92.6637 109.908 92.408 113.057C92.0977 116.875 118.328 122.102 118.704 125.64C118.97 128.151 113.206 133.254 96.3426 133.254C79.4508 133.254 47.2593 133.343 47.2593 133.343H12.2563Z" fill="url(#paint7_linear_98_50755)"/><path opacity="0.25" d="M77.198 98.4537C77.198 97.4503 81.1962 96.6377 86.1266 96.6377C91.0571 96.6377 90.3488 99.7597 90.9693 100.547C92.0982 101.98 102.558 107.534 97.6279 107.534C92.6975 107.534 77.198 99.457 77.198 98.4537Z" fill="#16121A"/><path opacity="0.25" d="M63.8711 97.7317C63.8711 96.7284 67.1883 95.4617 72.1187 95.4617C73.6321 95.2347 76.6436 98.9121 77.264 99.699C78.393 101.132 92.6364 108.325 87.706 108.325C85.551 108.325 80.7265 106.493 75.9777 104.347C75.2667 104.025 74.0861 111.904 72.1187 110.973C71.529 110.694 72.6874 102.807 72.1187 102.529C67.5681 100.298 63.8711 98.1754 63.8711 97.7317Z" fill="#16121A"/><path d="M82.1745 88.9393C82.1624 88.7895 82.1685 88.8485 80.8065 88.9378C79.39 89.0301 78.3564 89.1573 78.3685 89.3086C78.3806 89.4584 79.2054 89.5689 80.6203 89.4599C81.9233 89.3585 82.1851 89.0892 82.1745 88.9393Z" fill="#05619E"/><path d="M79.6329 96.6687L81.2083 96.6097C81.2083 96.6097 81.7031 89.7967 81.7107 88.4983C81.128 88.5906 79.9522 88.5936 79.418 88.7329C79.3348 88.7556 79.6329 96.6687 79.6329 96.6687Z" fill="#DEA77A"/><path d="M78.9512 72.9679C78.8982 72.6561 79.2856 72.4579 79.5611 72.302C79.6322 72.2611 79.7124 72.2324 79.776 72.1794C79.8365 72.1295 79.8789 72.0614 79.9152 71.9918C80.1134 71.6089 80.1891 71.1549 80.0241 70.7569C80.2602 70.7584 80.4464 70.766 80.6461 70.6389C80.8459 70.5118 80.9639 70.4361 81.1077 70.2484C81.1485 70.1955 81.259 70.0744 81.3105 70.0078C81.374 70.2908 81.2742 71.1246 81.8704 71.503C82.3259 71.792 82.5696 71.3774 83.0009 71.503C83.3398 71.6029 82.0883 73.2191 81.0275 73.4915C80.4509 73.6398 80.3208 72.7832 79.7366 72.9043C79.5338 72.9452 79.0995 72.8423 78.9512 72.9679Z" fill="#DEA77A"/><path d="M81.3607 70.522C81.3607 70.522 80.7584 70.3464 80.4981 70.5371C80.3589 70.64 80.2045 70.7051 80.0396 70.7565C80.0895 70.9502 80.1243 71.1742 80.1031 71.3967C80.4935 71.3089 80.9324 71.1818 81.1246 71.0138C81.3047 70.8564 81.3607 70.522 81.3607 70.522Z" fill="#CC8F5E"/><path d="M83.5629 71.5208C83.6976 71.5738 84.1607 72.111 84.2439 72.229C84.424 72.4833 84.8689 72.4697 84.8704 72.9887C84.8719 73.5184 84.8749 75.6416 84.881 76.6464C84.8886 77.7057 85.0959 78.1446 85.3108 78.8165C85.3411 78.9103 85.7739 80.0817 85.7739 80.0817C85.7739 80.0817 85.282 80.1119 84.766 80.1422C84.3014 80.1709 83.7899 80.2118 83.4797 80.2315C83.1392 80.2527 82.8138 80.2239 82.4279 80.2481C81.8937 80.2814 80.2669 80.3208 80.2669 80.3208C80.2669 80.3208 80.4016 77.8465 80.3168 77.1413C80.167 75.9019 79.6767 75.2602 79.2696 73.6531C79.1515 73.1855 79.2317 72.7738 79.1894 72.4273C79.1667 72.2442 79.5798 72.1761 79.8598 72.0777C79.9082 72.0611 81.1068 73.3549 81.1068 73.3549L82.0708 71.5723C83.9518 71.1546 83.3919 71.4542 83.5629 71.5208Z" fill="#FBD3CA"/><path d="M78.9881 76.0138C78.861 75.9079 78.7354 75.8004 78.6083 75.6945C78.4463 75.5583 78.2844 75.4221 78.1104 75.3041C77.8864 75.1512 77.5641 74.9348 77.5368 74.9288C77.5111 74.9227 77.4899 74.894 77.4748 74.9151C77.393 75.0438 77.496 75.575 78.0771 76.0032C78.7066 76.4678 79.321 76.5798 79.3982 76.489C79.4587 76.4148 79.0032 76.0153 78.9881 76.0138Z" fill="#C9993E"/><path d="M77.554 77.6113C76.4523 78.0093 76.0498 77.1649 76.0195 77.0348C75.9166 76.5914 75.844 75.8695 75.9423 75.4246C76.2647 73.9673 76.4629 72.5024 76.7898 71.0466C76.8382 70.8286 76.8518 70.6032 76.8291 70.3883C76.8064 70.1658 77.0138 70.0644 76.9744 70.3686C76.9608 70.4806 76.9638 70.5653 77.0077 70.5744C77.0516 70.5699 77.1424 70.187 77.215 70.2127C77.2665 70.2067 77.1046 70.7288 77.1575 70.7681C77.2211 70.7878 77.3376 70.1234 77.4012 70.1492C77.5101 70.1355 77.377 70.7363 77.436 70.7439C77.4829 70.7681 77.5828 70.3141 77.6433 70.3383C77.7311 70.3701 77.5449 71.0148 77.5994 71.0299C77.6267 71.0617 77.7629 70.694 77.7629 70.694C77.7629 70.694 77.8779 70.411 77.9838 70.4836C78.0353 70.5063 77.9399 70.7454 77.8809 70.8438C77.6509 71.2266 77.265 71.8335 77.2604 72.0802C77.2483 72.7642 77.2529 75.1446 77.1 75.7091C77.2423 75.4064 77.4557 75.1371 77.7159 74.9282C78.0686 75.3353 78.3954 75.4579 78.8388 75.7621C78.8646 75.7802 79.2036 76.0799 79.193 76.1086C79.1793 76.1343 78.2017 77.3768 77.554 77.6113Z" fill="#DEA77A" stroke="#DEA77A" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M81.7745 80.2857C81.9061 79.2445 81.6035 77.0336 81.5641 76.7748C81.3795 75.549 81.1116 73.4409 81.1101 73.3562" stroke="#EC6446" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M82.5495 74.8686C82.4224 74.7687 82.2953 74.6673 82.1682 74.5674C82.0063 74.4388 81.8428 74.3117 81.6673 74.1997C81.4418 74.0559 81.068 73.897 81.0392 73.8985C81.012 73.9 80.9833 73.8561 80.9681 73.8788C80.8834 74.0045 81.0741 74.5235 81.6582 74.9261C82.2908 75.3634 82.9884 75.374 82.999 75.3422C83.0323 75.256 82.5662 74.8701 82.5495 74.8686Z" fill="#C9993E"/><path d="M77.6394 74.8335C77.544 74.9833 77.2217 75.3919 77.2217 75.3919C77.2217 75.3919 77.2323 76.0457 77.2474 76.1667C77.2474 76.1667 77.3079 77.5015 77.3064 77.6846C77.5274 77.1216 77.7483 75.6068 77.8709 75.1513C77.9254 74.9546 77.8754 74.953 77.6394 74.8335Z" fill="#CC8F5E"/><path d="M83.2125 74.6564C82.7872 74.2826 81.911 73.9118 81.4207 73.6304C81.2709 73.8664 80.8956 74.3719 80.7382 74.608C80.5793 74.8486 80.9501 75.4252 80.5974 76.0502C80.5732 76.0941 80.5475 76.141 80.5505 76.1909C80.5536 76.2393 80.5823 76.2832 80.6096 76.3226C80.8139 76.6116 81.3193 76.713 81.5735 76.9612C81.8913 76.7841 82.8811 75.0801 83.2125 74.6564Z" fill="#DEA77A"/><path d="M79.0677 72.4712C78.6409 73.2082 78.1506 74.0708 77.5635 74.7775C77.5377 74.8078 77.4727 74.9198 77.4727 74.9198L79.384 76.5027C79.384 76.5027 80.1966 75.743 80.7672 74.5581C80.8095 74.4688 79.4899 72.5393 79.4339 72.4576C79.3779 72.3744 79.0919 72.4304 79.0677 72.4712Z" fill="#F9927B"/><path d="M73.2632 74.4802C73.3071 74.4802 73.351 74.4045 73.3948 74.4045C73.3494 74.4045 73.3071 74.4802 73.2632 74.4802Z" fill="#F09F92"/><path d="M72.5029 74.478C72.5468 74.478 72.5907 74.4023 72.6346 74.4023C72.5892 74.4023 72.5453 74.478 72.5029 74.478Z" fill="#DB8476"/><path d="M86.4451 88.565C86.433 88.4152 85.9669 88.3865 85.1225 88.4954C83.7151 88.677 82.8767 88.8056 82.8888 88.957C82.9009 89.1083 83.5728 89.2717 84.9817 89.1007C85.976 88.9782 86.4572 88.7164 86.4451 88.565Z" fill="#05619E"/><path d="M83.8918 96.4417H85.3672C85.3672 96.4417 85.8424 89.5697 85.85 88.2712C85.2855 88.3772 84.0295 88.2909 83.4937 88.4301C83.412 88.4513 83.8918 96.4417 83.8918 96.4417Z" fill="#DEA77A"/><path d="M85.7104 80.0801C85.9646 80.4524 86.3899 88.4987 86.3899 88.4987C86.3899 88.4987 85.4108 88.5456 84.7298 88.5926C83.7385 88.6607 82.9395 88.8892 82.9395 88.8892C82.9395 88.8892 83.2255 84.0768 82.9788 82.901C82.2706 85.1634 82.1299 88.8952 82.1299 88.8952C82.1299 88.8952 80.609 88.8892 80.1398 88.9331C79.6828 88.9754 78.4268 89.2388 78.4268 89.2388L80.3169 80.351C80.3169 80.351 81.9861 80.345 82.7972 80.2542C83.8082 80.1407 84.6511 80.0635 85.7104 80.0801Z" fill="#3D5C9B" stroke="#3D5C9B" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M81.9275 73.9646C81.9396 74.5744 81.8881 75.1919 81.7898 75.7942C81.7338 76.1407 81.7686 76.7007 81.6036 76.905C81.3933 77.1653 81.0331 75.0315 80.7698 74.5215C80.9181 74.3792 81.2056 73.9404 81.3191 73.783C81.363 73.7209 81.8927 74.0085 81.9275 73.9646Z" fill="#CC8F5E"/><path d="M82.9885 75.3644C82.5708 74.9861 81.4676 74.1447 80.9712 73.8783C81.3041 73.3698 81.9246 72.6813 82.2575 72.1728C82.4679 71.852 82.7721 71.4207 83.1504 71.3541C83.3063 71.3268 83.5892 71.3723 83.7376 71.4267C84.1462 71.575 84.5532 71.8035 84.7363 72.1985C84.9346 72.6268 85.0148 72.9416 84.7121 73.3123C84.1946 73.9449 83.4016 74.8605 82.9885 75.3644Z" fill="#F9927B"/><path opacity="0.0902" d="M82.9411 83.2795C81.3582 86.2229 80.4607 88.9606 80.4607 88.9606L81.3944 88.9394H82.1723C82.1738 88.9394 82.3358 85.8522 82.9411 83.2795Z" fill="black" fill-opacity="0.6"/><path d="M78.9359 68.6458C79.0479 68.9939 79.2113 69.5644 79.0146 69.923C79.0645 69.9579 79.0857 70.0199 79.1054 70.0774C79.1886 70.3074 79.3112 70.5223 79.4671 70.7085C79.635 70.9097 79.9241 70.9869 80.136 71.0278C80.3932 71.0777 81.0667 70.8356 81.2013 70.7039C81.3875 70.5254 81.4465 70.2499 81.4556 69.9927C81.4677 69.6839 81.4223 69.3722 81.3239 69.0786C81.277 68.9394 81.218 68.8047 81.1726 68.6655C81.0606 68.331 81.0197 67.9739 81.053 67.6228C80.316 67.7938 79.7349 67.8483 79.0494 68.1676C78.9889 68.1963 78.7588 68.1464 78.7271 68.2069C78.8738 68.2675 78.8648 68.6231 78.9359 68.6458Z" fill="#DEA77A"/><path d="M79.3971 68.8013C78.7358 68.7347 78.0063 68.5576 77.6462 67.9977C77.3995 67.6133 77.4252 67.0731 77.7067 66.7129C77.9882 66.3527 78.5315 66.1424 78.9643 66.2922C79.1262 66.3482 79.2942 66.4829 79.4637 66.5071C79.6332 66.5313 79.7391 66.4511 79.7784 66.2846C79.7921 66.2241 79.8919 65.9487 80.2097 65.9517C80.3611 65.9532 80.5048 66.0183 80.6183 66.1197C80.8529 66.33 80.6864 66.7704 80.9028 66.9989C81.039 67.1442 81.2676 67.1381 81.4658 67.1321C81.7927 67.1215 82.1301 67.1396 82.4237 67.2849C82.7158 67.4302 82.9534 67.7283 82.9368 68.0552C82.9216 68.3458 82.7113 68.5985 82.4555 68.7362C82.1998 68.8739 81.9032 68.9148 81.6126 68.939C81.8033 68.9541 81.9364 69.1614 81.9259 69.3521C81.9153 69.5428 81.7957 69.7123 81.6565 69.8439C81.4764 70.0149 81.3478 70.0286 81.1041 69.9817C80.8605 69.9347 80.5396 69.7879 80.6713 69.5761C80.697 69.5337 80.75 69.4717 80.7636 69.4248C80.806 69.284 80.6456 69.3476 80.6774 69.2447C80.694 69.1917 80.8241 68.9844 80.7818 68.8588C80.7379 68.7347 80.576 68.8225 80.3959 68.8255C80.2612 68.8285 79.7678 68.8376 79.3971 68.8013Z" fill="black"/><path d="M79.7732 69.5745L79.5916 69.9725L79.7565 70.036" stroke="black" stroke-width="0.286698" stroke-miterlimit="10"/><path d="M80.5549 70.1089L79.8694 70.3525C79.8694 70.3525 79.9814 70.5341 80.2644 70.4948C80.5549 70.4524 80.5549 70.1089 80.5549 70.1089Z" fill="white"/><path d="M79.4215 69.6942C79.4215 69.6942 79.7227 69.5398 79.6727 69.2492C79.6031 68.8543 79.2399 68.8739 79.2399 68.8739L77.4058 69.0495L77.7508 70.4206L79.4215 69.6942Z" fill="#504D52"/><path d="M78.2974 69.761C78.2974 69.761 78.535 69.5552 78.485 69.2646C78.4154 68.8696 78.0961 68.9831 78.0961 68.9831L76.156 69.307L76.501 70.6781L78.2974 69.761Z" fill="#504D52"/><path d="M76.3888 70.7263C76.689 70.6594 76.8615 70.2872 76.7742 69.8947C76.6868 69.5023 76.3726 69.2384 76.0724 69.3053C75.7722 69.3721 75.5996 69.7444 75.687 70.1368C75.7743 70.5292 76.0885 70.7931 76.3888 70.7263Z" fill="#333333"/><path d="M77.7147 70.4294C78.0149 70.3626 78.1875 69.9903 78.1001 69.5979C78.0127 69.2055 77.6985 68.9415 77.3983 69.0084C77.0981 69.0752 76.9256 69.4475 77.0129 69.8399C77.1003 70.2323 77.4145 70.4962 77.7147 70.4294Z" fill="#333333"/><path d="M77.6788 70.2723C77.9374 70.2147 78.0884 69.9048 78.0161 69.5801C77.9438 69.2554 77.6756 69.0389 77.417 69.0964C77.1584 69.154 77.0073 69.4639 77.0796 69.7886C77.1519 70.1133 77.4201 70.3298 77.6788 70.2723Z" fill="white"/><path d="M76.3528 70.5689C76.6114 70.5113 76.7625 70.2014 76.6902 69.8767C76.6179 69.552 76.3497 69.3355 76.0911 69.3931C75.8324 69.4506 75.6814 69.7605 75.7537 70.0852C75.826 70.4099 76.0942 70.6265 76.3528 70.5689Z" fill="white"/><path opacity="0.2118" d="M82.6448 80.6129C82.6448 81.0261 82.6721 81.418 82.6857 81.8084C82.6721 81.8039 82.1863 81.9552 82.1636 81.2258C82.1439 80.6356 82.5192 80.6084 82.6448 80.6129Z" stroke="black" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M81.1147 73.349L82.0364 71.5799L82.5554 71.4709L81.2282 73.915L81.1147 73.349Z" fill="#EC6446"/><path d="M81.1339 73.3683L80.1609 72.3362L79.8703 72.0698L79.4526 72.2923L81.2278 73.9146L81.1339 73.3683Z" fill="#EC6446"/><path d="M79.6151 71.7565C79.5168 71.5613 79.4592 71.3283 79.4048 71.1164C79.3276 70.8107 79.2186 70.4869 79.2777 70.1766C79.2958 70.0828 79.2867 70.1055 79.3109 70.0132C79.3321 69.9345 79.3669 69.8225 79.3957 69.7711C79.4683 69.6455 79.4547 69.3821 79.373 69.3897C79.314 69.37 79.2671 69.8694 79.1944 69.8664C79.1142 69.8921 79.0461 69.5198 79.0037 69.3337C78.9614 69.1476 78.8464 68.8131 78.7722 68.8555C78.7192 68.8676 78.7722 68.969 78.7873 69.0341C78.8479 69.3034 78.9916 69.8225 78.916 69.8331C78.8524 69.8392 78.7601 69.4684 78.7192 69.2838C78.6738 69.0825 78.5482 68.7965 78.4832 68.8116C78.4302 68.8237 78.7737 69.8498 78.7041 69.8437C78.6057 69.88 78.3772 68.8903 78.294 68.91C78.2123 68.9402 78.3409 69.3473 78.3984 69.5259C78.4514 69.6909 78.5785 69.9284 78.4786 69.9542C78.4241 69.9723 78.2198 69.2369 78.1714 69.2535C78.0988 69.2807 78.1532 69.482 78.1926 69.5955C78.409 70.2084 78.5346 70.8228 78.751 71.4357C78.8403 71.6899 78.9114 72.0123 78.9856 72.2711C79.0749 72.5843 79.146 72.9278 79.2111 73.2472C79.3911 74.1324 79.6741 74.9269 79.8542 75.8137C79.9223 76.1497 79.9904 76.4857 80.0888 76.8489C80.1327 77.0441 80.3218 77.1424 80.4717 77.2529C80.6215 77.3634 80.8591 77.4073 81.0392 77.3604C81.363 77.2756 81.8427 76.9154 81.7338 76.4509C81.6475 76.0559 80.393 73.2835 79.6151 71.7565Z" fill="#DEA77A" stroke="#DEA77A" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M80.9712 73.878L81.2073 73.5315L83.2775 75.0161L82.9885 75.3641C82.9885 75.3641 82.5057 74.9404 81.9246 74.5167C81.7566 74.3941 81.5795 74.2655 81.4449 74.1762C81.1467 73.9734 80.9712 73.878 80.9712 73.878Z" fill="#EC6446"/><path d="M77.4683 74.9244C77.4683 74.9244 77.5243 74.8261 77.5515 74.7913C77.5969 74.7337 77.7452 74.5476 77.7452 74.5476L79.6565 76.2138L79.3856 76.4998C79.3856 76.4998 78.2824 75.5873 78.1447 75.4768C77.8466 75.2377 77.4683 74.9244 77.4683 74.9244Z" fill="#EC6446"/><path d="M78.8102 97.1141C78.0278 97.6695 77.7614 97.6831 77.6025 98.4534C77.6404 98.4428 80.8032 98.1386 81.4146 98.0841C81.3768 97.5424 81.3435 97.1171 81.2951 96.4407C81.0605 96.4452 80.944 96.5406 80.5217 96.5814C80.0708 96.6268 79.7953 96.5663 79.5623 96.5996C79.3928 96.6934 78.7708 97.1368 78.8102 97.1141Z" fill="#202024"/><path d="M86.3315 96.4811C87.179 96.9321 87.4438 96.9124 87.6996 97.657C87.6602 97.6509 84.4837 97.7523 83.8708 97.775C83.8406 97.2333 83.8194 96.8065 83.78 96.1301C84.0146 96.1043 84.1417 96.1845 84.5639 96.1724C85.0164 96.1603 85.248 96.1104 85.4825 96.1134C85.6656 96.183 86.3739 96.4993 86.3315 96.4811Z" fill="#202024"/><path d="M64.1571 85.32C62.4471 84.8342 61.2167 83.3557 60.846 81.4398C60.4722 79.5164 60.4026 77.2827 60.8732 75.9707C61.1774 75.1217 62.2488 75.0128 62.3759 75.83C62.4198 76.116 62.2155 81.6714 64.2373 82.425C64.2994 79.7086 64.2283 76.0206 64.3266 73.3057C64.425 70.5908 64.3902 67.3902 65.7658 67.313C67.2519 67.313 67.0673 69.81 67.0673 70.8738C67.0673 75.2216 67.4047 77.1738 67.1626 81.3218C67.553 81.3702 68.0494 80.27 68.1251 79.8917C68.4641 78.165 68.6003 76.8953 69.7231 77.2252C70.6796 77.5067 70.0969 82.1738 67.4441 84.8266C67.2625 85.0082 67.5394 89.8342 67.8618 95.945C66.6723 96.455 65.4979 96.9998 64.3418 97.5794C64.4583 93.2316 64.4522 88.8808 64.1571 85.32Z" fill="#D4ED84"/><path d="M68.0461 93.6622C67.5331 92.9268 67.0413 92.1837 66.5736 91.4331C66.041 90.5811 65.534 89.711 65.3494 88.7924C65.9653 89.54 66.5388 90.3042 67.0685 91.082C67.7359 92.0627 68.3488 93.0811 69.3673 93.9059C69.1993 93.3081 69.0328 92.7089 68.8648 92.1111C68.718 91.589 68.5728 91.0669 68.4865 90.5388C68.314 89.487 68.5364 88.2506 68.4487 87.3668C68.88 88.0493 68.9057 89.0829 69.2356 89.9259C69.6457 90.9731 70.0573 92.0203 70.4674 93.069C70.5991 91.586 70.1844 90.109 69.9983 88.6289C69.8727 87.6256 69.6881 86.6768 69.9363 85.6099C70.3282 87.6059 70.755 89.6171 71.781 91.5027C72.0928 89.49 71.6024 87.4425 72.0352 85.4419C72.4469 87.5091 72.002 89.6943 73.146 91.6268L74.1766 87.1065C74.3325 88.8908 74.0994 90.7098 73.9466 92.5091C74.5428 91.4558 75.3237 90.451 76.265 89.5248C75.9926 90.4177 75.6476 91.3 75.2344 92.1671C75.0664 92.5197 74.8864 92.8708 74.6669 93.2113C74.1297 94.0466 73.3564 94.826 73.1158 95.7294C72.3909 95.6462 71.6493 95.6992 70.9184 95.7537C70.3161 95.7975 69.7123 95.8414 69.11 95.8853C68.8013 94.8835 68.4698 94.3402 68.0461 93.6622Z" fill="#537C09"/><path opacity="0.25" d="M174.483 94.9646C174.289 93.8606 175.635 93.7056 177.013 93.2453C178.634 92.7038 182.727 95.6074 183.561 96.3537C184.745 95.3394 185.86 95.0121 187.872 96.3537C188.126 96.5227 188.464 96.8608 188.802 97.4525C189.14 97.8752 191.93 101.51 191.93 101.51C191.93 101.51 187.865 99.0092 187.703 99.2276C187.5 99.502 189.309 103.961 189.309 103.961C189.309 103.961 186.411 100.786 186.182 100.918C185.744 101.17 187.534 105.905 187.534 105.905C187.534 105.905 184.289 102.116 183.908 101.848C183.692 101.793 185.344 102.587 183.908 103.696C182.276 104.669 181.502 102.413 181.304 103.037C180.723 104.863 181.299 107.415 179.556 106.776C176.056 105.493 179.645 102.384 178.376 101.021C174.847 97.046 174.568 95.4528 174.483 94.9646Z" fill="#16121A"/><path d="M174.756 94.4718C174.558 94.0103 174.345 93.5572 174.119 93.1093C174.087 93.045 174.051 92.9791 173.987 92.9453C173.864 92.8777 173.718 92.9706 173.603 93.0518C173.241 93.3104 172.804 93.5032 172.364 93.444C171.925 93.3831 171.51 92.9977 171.546 92.5548C171.576 92.1524 171.955 91.8481 172.349 91.7653C172.743 91.6825 173.15 91.7704 173.544 91.8583C173.26 90.8811 172.974 89.904 172.69 88.9286C172.577 88.5381 172.462 88.1442 172.442 87.7367C172.371 86.3319 173.622 84.9981 175.03 84.9812C175.27 84.9778 175.52 85.0133 175.72 85.1485C175.874 85.255 175.984 85.414 176.078 85.5746C176.719 86.6649 176.844 87.9683 177.032 89.2193C177.256 90.7172 177.59 92.1981 178.031 93.6452C176.929 93.7517 175.967 94.6358 174.756 94.4718Z" fill="#8ABA1A" stroke="#8ABA1A" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M177.055 88.5398C177.161 87.2093 177.54 85.9008 178.159 84.7175C177.641 84.5687 177.026 84.731 176.592 84.4132C176.152 84.0903 176.16 83.3515 176.559 82.9779C176.957 82.6043 177.618 82.6009 178.076 82.8985C178.534 83.196 178.793 83.7387 178.84 84.283C179.707 83.9026 180.794 84.0987 181.476 84.7547C182.157 85.4106 182.392 86.4908 182.044 87.3716C181.783 88.0309 181.247 88.5398 180.693 88.981C179.525 89.9074 178.194 90.6293 176.781 91.1043C176.876 90.1559 177.001 89.2126 177.055 88.5398Z" fill="#8ABA1A" stroke="#8ABA1A" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M172.537 87.9193C171.683 88.1898 171.12 88.1813 170.256 87.9497C169.313 87.6961 168.728 87.5795 168.314 86.8948C167.633 85.7672 168.241 84.8374 168.858 84.3894C169.279 84.0834 169.911 84.3522 170.106 84.1308C170.304 83.9059 170.185 83.4039 170.412 83.0641C170.638 82.7243 171.096 82.5079 171.468 82.6752C171.599 82.7327 171.707 82.8308 171.798 82.9406C172.079 83.2737 172.219 83.7352 172.119 84.1578C172.02 84.5822 171.661 84.9456 171.23 85.0048C172.238 85.4748 173.046 86.3555 173.424 87.4003C173.032 87.5727 172.696 87.8686 172.537 87.9193Z" fill="#8ABA1A" stroke="#8ABA1A" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M173.586 88.7528C173.774 88.222 174.217 87.7452 174.156 87.1857C174.114 86.8036 173.837 86.4401 173.942 86.0699C174.051 85.6811 174.504 85.5289 174.832 85.294C174.903 85.2432 174.974 85.1418 174.914 85.0809C174.885 85.0522 174.839 85.0488 174.799 85.0488C174.567 85.0505 174.32 85.0556 174.116 85.1638C173.426 85.5306 172.812 86.0598 172.552 86.7952C172.292 87.5305 172.479 88.3048 172.723 89.0453C172.993 89.8719 173.101 90.5414 173.428 91.3224C173.554 91.1939 173.331 89.478 173.586 88.7528Z" fill="#D4ED84" stroke="#D4ED84" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M168.507 84.7071C168.627 84.5871 169.209 83.9109 169.41 84.8356C169.442 84.9827 169.363 85.1331 169.248 85.2312C169.133 85.3292 168.991 85.3952 168.888 85.505C168.663 85.7451 168.676 86.1373 168.835 86.4247C168.994 86.7121 169.266 86.9166 169.538 87.1009C169.579 87.1297 169.621 87.1584 169.652 87.1973C169.767 87.3477 169.64 87.5844 169.459 87.6385C169.278 87.6926 169.084 87.6148 168.923 87.5168C168.612 87.3241 168.358 87.0401 168.201 86.7104C168.046 86.3824 167.975 86.0832 168.017 85.7231C168.063 85.3258 168.379 84.8339 168.507 84.7071Z" fill="#D4ED84" stroke="#D4ED84" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M170.639 83.7557C170.925 83.5106 170.91 83.2283 170.911 83.2046C170.915 83.0998 171.089 82.9984 171.175 83.0575C171.205 83.0778 171.337 83.1674 171.373 83.1775C171.611 83.2485 171.674 83.0271 171.655 82.9155C171.64 82.8208 171.371 82.6011 171.285 82.6011C171.048 82.6011 170.703 82.6941 170.477 82.9848C170.252 83.2756 170.277 83.5376 170.232 83.8098C170.22 83.8622 170.445 83.9214 170.639 83.7557Z" fill="#D4ED84" stroke="#D4ED84" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M171.196 82.9964C171.103 82.8628 171.013 82.7242 170.928 82.5839C170.908 82.5518 170.89 82.518 170.881 82.4791C170.873 82.4419 170.878 82.4013 170.881 82.3641C170.89 82.288 170.901 82.2103 170.93 82.1376C171.013 81.9263 171.248 81.791 171.473 81.8147C171.698 81.8384 171.895 82.0142 171.956 82.2323C172.017 82.4503 171.943 82.6971 171.779 82.8544C171.616 83.0133 171.373 83.0758 171.196 82.9964Z" fill="#F3A2F2" stroke="#F2A2F2" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M179.909 85.0469C180.553 85.2397 180.992 85.0081 181.107 84.7291C181.176 84.5635 180.918 84.3454 180.815 84.3099C180.382 84.1628 180.084 84.0918 179.645 84.0918C179.205 84.0935 178.6 84.3792 178.27 84.6716C177.866 85.0317 177.665 85.7029 177.52 86.2252C177.647 86.1357 178.999 84.7765 179.909 85.0469Z" fill="#D4ED84" stroke="#D4ED84" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M176.496 84.0059C176.624 83.8706 176.754 83.7337 176.856 83.5765C176.91 83.4936 176.954 83.4057 177.013 83.3263C177.143 83.1505 177.338 83.022 177.552 82.9746C177.603 82.9628 178.053 82.9104 178.061 82.858C178.068 82.8174 177.101 82.3931 176.506 83.0304C176.284 83.2688 176.219 83.5579 176.276 83.8774C176.298 84.0025 176.423 84.0836 176.496 84.0059Z" fill="#D4ED84" stroke="#D4ED84" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M182.121 92.7968C181.555 91.6245 181.013 90.4405 180.497 89.2466C179.909 87.8914 179.35 86.5029 179.146 85.0413C179.826 86.2319 180.458 87.4474 181.043 88.6862C181.779 90.2477 182.455 91.8706 183.578 93.1826C183.393 92.2298 183.21 91.277 183.024 90.3242C182.862 89.4927 182.702 88.6613 182.607 87.8199C182.417 86.1454 182.662 84.175 182.565 82.7682C183.041 83.854 183.069 85.5019 183.433 86.8438C183.886 88.5117 184.34 90.1811 184.792 91.849C184.937 89.4877 184.48 87.1348 184.275 84.7786C184.136 83.1806 183.932 81.669 184.206 79.9713C184.639 83.149 185.109 86.3516 186.241 89.3547C186.585 86.1504 186.044 82.8896 186.522 79.7019C186.976 82.9943 186.485 86.4747 187.747 89.5509L188.884 82.3525C189.056 85.1943 188.799 88.091 188.63 90.9544C189.288 89.2766 190.149 87.6769 191.188 86.202C190.887 87.6237 190.506 89.0288 190.051 90.409C189.865 90.971 189.667 91.5314 189.425 92.0718C188.832 93.4021 187.979 94.6426 187.714 96.0826C186.914 95.9512 186.096 96.036 185.29 96.1208C184.625 96.1907 183.959 96.2605 183.295 96.3303C182.954 94.739 182.589 93.8743 182.121 92.7968Z" fill="#537C09"/><path d="M147.462 78.1281C147.507 77.1249 146.207 76.6519 145.279 76.269C145.036 76.1685 144.776 76.1062 144.556 75.9658C144.346 75.8324 144.185 75.6349 144.045 75.4287C143.271 74.3026 142.855 72.8992 143.217 71.5807C142.472 71.676 141.891 71.773 141.212 71.4508C140.535 71.1285 140.131 70.9345 139.604 70.4008C139.455 70.2501 139.062 69.914 138.872 69.7217C138.785 70.6365 139.421 73.2249 137.693 74.6508C136.371 75.7406 132.676 74.3615 131.368 74.9298C130.339 75.3768 129.634 74.8812 129.098 75.7475C132.378 76.8893 137.683 80.1396 141.127 80.5866C143 80.8291 143.078 78.0813 144.96 78.232C145.618 78.2857 146.947 77.7919 147.462 78.1281Z" fill="#F09F92"/><path d="M139.17 69.3856C139.827 70.1687 140.743 70.5863 141.637 71.0835C142.117 71.3503 142.627 71.4959 143.166 71.5946C143.086 72.2235 143.063 72.9443 143.218 73.6338C141.955 73.5091 141.383 73.1106 140.503 72.1958C140.222 71.903 139.86 71.1979 139.73 70.8132C139.551 70.2883 138.997 69.1794 139.17 69.3856Z" fill="#ED978A"/><path d="M146.618 67.605C146.862 65.0646 145.168 62.8242 142.835 62.6008C140.502 62.3774 138.414 64.2557 138.171 66.796C137.928 69.3364 139.622 71.5768 141.954 71.8002C144.287 72.0236 146.375 70.1453 146.618 67.605Z" fill="#FFA596"/><path d="M128.055 66.5251C125.014 65.6554 118.91 66.4784 120.752 73.0742C121.551 75.9381 125.617 77.0522 128.297 76.6433C129.177 76.347 129.637 75.4582 130.491 75.0978C131.276 74.7652 132.173 74.9973 132.998 75.2087C134.2 75.5171 135.503 75.7683 136.659 75.3144C137.741 74.8882 138.535 73.8625 138.798 72.7277C139.062 71.5946 139.169 70.6278 138.623 69.6004C138.996 69.9331 140.564 69.0477 140.947 68.7272C142.366 67.5421 143.811 66.3259 144.762 64.7406C145.801 65.917 147.524 66.5702 149.079 66.3623C149.616 66.2912 150.8 66.1266 151.365 65.6606C152.579 64.6574 153.499 63.0825 152.545 61.8351C151.129 60.9099 149.514 62.6442 148.014 62.2752C145.68 61.7017 146.874 60.0991 142.314 59.1877C139.323 58.59 136.179 60.2151 135.056 61.4886C133.308 63.4706 130.99 67.3637 128.055 66.5251Z" fill="black" stroke="black" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M129.741 75.3403C129.336 75.5586 128.705 76.0905 128.43 76.4578C127.444 77.778 127.406 79.0272 127.602 80.6628C127.799 82.2983 128.626 84.4363 129.17 85.9904C129.755 87.6606 129.847 88.9011 130.214 92.0318C130.557 94.9598 130.23 96.4429 129.864 98.2482C129.516 99.9617 129.097 101.668 128.75 103.382C129.386 103.053 134.03 102.897 136.027 102.774C137.193 102.703 144.052 102.576 145.716 102.231C147.344 101.894 143.455 93.6275 144.784 91.8066C145.636 90.6371 147.154 89.7795 147.757 88.2618C148.365 86.7302 148.025 85.8882 147.866 84.5749C147.18 82.7661 146.842 81.1011 146.719 80.4133C146.45 78.9059 146.492 77.6273 146.492 76.5202C146.492 75.9346 145.25 75.7804 144.243 75.6834C143.725 75.6331 142.214 79.4188 140.92 79.2784C139.848 79.1624 136.746 75.4408 136.746 75.4408C130.665 74.8639 130.258 75.0614 129.741 75.3403Z" fill="#A1CAF6"/><path d="M148.536 87.7351C148.893 87.3505 149.25 86.9659 149.608 86.5795C150.064 86.0875 150.521 85.5954 151.026 85.1536C151.674 84.5836 152.601 83.7745 152.685 83.7451C152.767 83.7173 152.821 83.6151 152.876 83.6792C153.186 84.0552 152.824 84.9925 151.163 86.5726C149.361 88.2844 148.671 88.5806 148.396 88.3242C148.17 88.118 148.489 87.7473 148.536 87.7351Z" fill="#3D5C9B"/><path d="M154.241 90.3166C155.064 90.5037 155.915 90.6337 156.75 90.5193C157.015 90.4829 157.286 90.4188 157.497 90.256C157.819 90.0065 157.944 89.5768 157.987 89.1714C158.14 87.7351 157.682 86.2849 157.197 84.9231C155.61 80.4618 155.115 75.6921 153.515 71.2342C153.276 70.5689 153.145 69.862 153.133 69.1759C153.119 68.4673 152.426 68.2282 152.665 69.1707C152.753 69.5172 152.776 69.7875 152.642 69.8308C152.5 69.8325 152.065 68.6613 151.849 68.7722C151.686 68.774 152.401 70.3558 152.249 70.4996C152.057 70.5862 151.431 68.5418 151.237 68.6457C150.887 68.6457 151.542 70.484 151.362 70.5308C151.223 70.6243 150.729 69.2348 150.551 69.3353C150.288 69.4687 151.128 71.4282 150.962 71.4941C150.887 71.605 150.315 70.5013 150.315 70.5013C150.315 70.5013 149.842 69.6558 149.539 69.9244C149.388 70.0162 149.78 70.7317 150.005 71.0159C150.88 72.1299 152.046 73.7083 152.157 74.4845C152.464 76.6311 153.037 78.5335 153.105 80.538C153.167 82.3919 153.666 84.315 154.368 86.0302C153.801 85.1328 153.027 84.367 152.122 83.8108C151.173 85.2298 150.191 85.7426 148.914 86.874C148.839 86.9398 148.484 87.5064 148.531 87.593C148.579 87.6814 152.109 89.8332 154.241 90.3166Z" fill="#F7AEA3" stroke="#F7AEA3" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M139.422 90.2491C139.662 90.2491 139.856 90.0552 139.856 89.816C139.856 89.5767 139.662 89.3828 139.422 89.3828C139.183 89.3828 138.989 89.5767 138.989 89.816C138.989 90.0552 139.183 90.2491 139.422 90.2491Z" stroke="#E4B660" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M134.457 85.9818C134.814 85.5971 135.171 85.2125 135.529 84.8261C135.985 84.3341 136.442 83.842 136.946 83.4002C137.594 82.8302 138.691 82.1441 138.781 82.1389C138.866 82.1355 138.953 82.0852 139.006 82.1493C139.317 82.5253 138.615 83.0832 136.953 84.6615C135.151 86.3733 134.597 86.7718 134.322 86.5154C134.096 86.3109 134.408 85.9939 134.457 85.9818Z" fill="#3D5C9B"/><path d="M152.325 83.4885C152.682 83.9217 153.859 85.0842 153.859 85.0842C153.859 85.0842 154.079 87.146 154.081 87.5323C154.081 87.5323 154.328 89.8522 154.401 90.4274C153.486 88.7399 152.284 85.9644 151.717 84.5818C151.471 83.9823 151.629 83.9598 152.325 83.4885Z" fill="#F09F92"/><path d="M134.613 85.6698C135.805 84.3271 137.047 83.2425 138.481 82.1631C139.046 82.8474 140.127 83.9667 140.715 84.651C141.311 85.3475 142.12 86.6521 143.478 88.4817C143.573 88.6082 143.67 88.7468 143.681 88.9045C143.691 89.0587 143.618 89.2059 143.546 89.3411C143.014 90.3338 141.463 90.8484 140.761 91.7286C140.162 90.8727 139.093 89.9388 137.868 88.7295C136.792 87.6692 135.889 86.5621 134.613 85.6698Z" fill="#F09F92"/><path d="M146.914 76.6243C148.548 78.7779 150.426 81.3005 152.552 83.2981C152.642 83.383 152.924 83.6134 152.867 83.7243C152.853 83.7503 151.601 84.6183 150.513 85.7739C149.388 86.9677 148.425 88.449 148.375 88.3156C148.077 87.5273 147.041 85.3616 146.86 84.9735C145.951 83.0036 145.809 80.9176 145.811 78.7484C145.811 78.4331 145.613 77.0037 145.757 76.723C145.899 76.4406 146.822 76.503 146.914 76.6243Z" fill="#E0F0FD"/><path d="M144.689 68.0046C144.689 68.0046 143.679 67.6373 143.726 66.7035C143.788 65.4301 144.942 65.3538 144.942 65.3538L150.788 65.1875L150.237 69.6402L144.689 68.0046Z" fill="#504D52"/><path d="M148.256 67.7779C148.256 67.7779 147.424 67.2234 147.471 66.2879C147.534 65.0144 148.585 65.2483 148.585 65.2483L154.819 65.5117L154.268 69.9644L148.256 67.7779Z" fill="#504D52"/><path d="M156.65 67.9372C156.771 66.6675 156.081 65.5627 155.109 65.4696C154.136 65.3764 153.249 66.3302 153.128 67.5999C153.006 68.8696 153.696 69.9744 154.669 70.0675C155.641 70.1607 156.528 69.2069 156.65 67.9372Z" fill="#333333"/><path d="M152.358 67.5251C152.479 66.2554 151.79 65.1506 150.817 65.0575C149.845 64.9643 148.958 65.9181 148.836 67.1878C148.715 68.4575 149.404 69.5623 150.377 69.6554C151.349 69.7486 152.236 68.7948 152.358 67.5251Z" fill="#333333"/><path d="M152.122 67.3888C152.222 66.3372 151.625 65.4197 150.788 65.3395C149.951 65.2594 149.19 66.0468 149.09 67.0984C148.989 68.15 149.586 69.0674 150.423 69.1476C151.26 69.2278 152.021 68.4403 152.122 67.3888Z" fill="white"/><path d="M156.413 67.7991C156.514 66.7476 155.917 65.8301 155.079 65.7499C154.242 65.6698 153.482 66.4572 153.381 67.5088C153.28 68.5604 153.877 69.4778 154.715 69.558C155.552 69.6382 156.312 68.8507 156.413 67.7991Z" fill="white"/><path d="M138.425 82.0056C138.624 83.9288 139.081 86.2868 139.625 88.1406C139.939 89.2113 140.045 90.9855 140.646 91.5659C141.41 92.3057 141.318 87.6988 141.947 85.9888C141.426 85.5972 140.873 84.8678 140.488 84.3862C140.339 84.2008 138.551 82.1286 138.425 82.0056Z" fill="#ED978A"/><path d="M145.173 74.4151C145.409 73.7637 145.655 73.1088 145.741 72.421C145.868 71.4265 145.653 70.4199 145.348 69.467C145.254 69.1759 145.291 69.2487 145.176 68.9645C145.081 68.7272 144.925 68.3841 144.813 68.2351C144.535 67.8678 144.476 67.0327 144.735 67.0258C144.913 66.9409 145.258 68.495 145.481 68.4569C145.745 68.5037 145.814 67.3047 145.873 66.7035C145.932 66.1006 146.166 65.0004 146.415 65.1078C146.585 65.1234 146.457 65.4665 146.438 65.6779C146.355 66.5476 146.102 68.242 146.348 68.2438C146.549 68.2351 146.696 67.0344 146.753 66.435C146.815 65.7835 147.1 64.8324 147.314 64.8549C147.486 64.8705 146.805 68.2368 147.022 68.1901C147.344 68.268 147.68 65.0628 147.945 65.087C148.214 65.1512 147.971 66.4835 147.858 67.0691C147.754 67.6097 147.451 68.4049 147.772 68.4465C147.95 68.4794 148.307 66.085 148.463 66.1197C148.702 66.1786 148.612 66.8335 148.529 67.206C148.087 69.2227 147.645 71.2376 147.204 73.2543C147.02 74.0894 146.838 74.9245 146.708 75.7683C146.55 76.7905 146.471 77.8214 146.391 78.8522C146.171 81.7127 145.951 84.5731 145.729 87.4319C145.646 88.5147 145.561 89.601 145.395 90.7844C145.334 91.4168 144.776 91.7997 144.347 92.2051C143.917 92.6105 143.189 92.8427 142.6 92.7664C141.547 92.6278 140.36 91.5242 140.627 90.7029C140.776 90.2386 143.324 79.5279 145.173 74.4151Z" fill="#F7AEA3" stroke="#F7AEA3" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M134.242 86.3942C135.41 85.0393 137.543 83.1837 139.004 82.1511C137.754 80.6819 135.535 78.7536 134.286 77.2826C133.497 76.354 132.371 75.1169 131.153 75.0546C130.653 75.0286 129.781 75.2833 129.334 75.512C128.107 76.1409 127.634 77.2619 127.548 78.6375C127.484 79.6476 128.185 80.3493 128.525 80.6213C130.549 82.243 132.746 84.9683 134.242 86.3942Z" fill="#E0F0FD"/><path d="M144.429 68.2732L144.719 68.9991L144.221 69.2608" stroke="black" stroke-width="0.286698" stroke-miterlimit="10"/><path d="M142.165 69.4583L144.373 70.1288C144.373 70.1288 144.042 70.723 143.141 70.6364C142.216 70.548 142.165 69.4583 142.165 69.4583Z" fill="white"/><path d="M130.079 121.899L133.148 152.068H136.807L136.656 120.505L130.079 121.899Z" fill="#F7AEA3" stroke="#F7AEA3" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M143.684 121.899L146.835 150.106L150.4 149.924L149.914 120.505L143.684 121.899Z" fill="#F7AEA3" stroke="#F7AEA3" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M128.955 103.169C128.363 104.321 128.25 105.653 128.224 106.949C128.089 113.439 127.788 118.122 128.053 124.609C128.053 124.609 130.444 124.961 133.049 124.817C136.04 124.651 138.261 123.715 138.261 123.715C138.03 114.928 138.348 114.78 138.668 110.981C140.874 117.871 140.461 119.152 141.79 123.303C141.79 123.303 144.122 123.76 147.106 123.457C149.98 123.164 151.957 122.307 151.957 122.307C148.078 114.223 146.051 101.907 146.051 101.907C146.051 101.907 140.79 102.542 138.204 102.575C134.967 102.614 132.285 102.701 128.955 103.169Z" fill="#6195E3" stroke="#6195E3" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M138.54 98.6519C138.779 98.6519 138.973 98.458 138.973 98.2188C138.973 97.9796 138.779 97.7856 138.54 97.7856C138.301 97.7856 138.107 97.9796 138.107 98.2188C138.107 98.458 138.301 98.6519 138.54 98.6519Z" stroke="#6195E3" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M139.019 94.492C139.259 94.492 139.452 94.2981 139.452 94.0589C139.452 93.8197 139.259 93.6257 139.019 93.6257C138.78 93.6257 138.586 93.8197 138.586 94.0589C138.586 94.2981 138.78 94.492 139.019 94.492Z" stroke="#6195E3" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M140.462 83.1456C140.701 83.1456 140.895 82.9517 140.895 82.7124C140.895 82.4732 140.701 82.2793 140.462 82.2793C140.222 82.2793 140.029 82.4732 140.029 82.7124C140.029 82.9517 140.222 83.1456 140.462 83.1456Z" stroke="#6195E3" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M131.116 102.907C130.725 107.006 130.617 121.581 130.946 124.838" stroke="black" stroke-opacity="0.3" stroke-width="0.573396" stroke-miterlimit="10"/><path d="M137.275 150.501L132.468 150.429L132.433 152.774L137.24 152.846L137.275 150.501Z" fill="white"/><path d="M129.191 153.112C126.288 154.862 125.346 154.832 124.575 157.54C124.712 157.512 135.917 157.381 138.082 157.37C138.095 155.422 138.096 153.89 138.113 151.459C137.286 151.404 136.849 151.708 135.357 151.731C133.761 151.755 132.938 151.614 132.11 151.661C131.485 151.941 129.046 153.186 129.191 153.112Z" fill="black"/><path d="M151.281 149.811L146.423 149.932L146.482 152.301L151.339 152.181L151.281 149.811Z" fill="white"/><path d="M154.91 152.561C157.851 154.319 158.801 154.288 159.588 157.022C159.449 156.995 148.126 156.894 145.937 156.89C145.918 154.922 145.913 153.373 145.889 150.917C146.725 150.858 147.168 151.166 148.675 151.183C150.289 151.203 151.12 151.059 151.956 151.104C152.587 151.383 155.056 152.634 154.91 152.561Z" fill="black"/><path opacity="0.2" d="M138.931 111.802C140.978 118.517 140.466 119.153 141.795 123.304C141.795 123.304 144.127 123.762 147.111 123.459C147.111 123.459 141.561 114.985 138.931 111.802Z" fill="black" stroke="black" stroke-width="0.573396" stroke-miterlimit="10"/><defs><linearGradient id="paint0_linear_98_50755" x1="19.4807" y1="59.6753" x2="199.94" y2="62.546" gradientUnits="userSpaceOnUse"><stop stop-color="#DAFFF5"/><stop offset="1" stop-color="#1EC6CE"/></linearGradient><linearGradient id="paint1_linear_98_50755" x1="95.7614" y1="78.6626" x2="97.2458" y2="66.121" gradientUnits="userSpaceOnUse"><stop stop-color="#FFF9DB"/><stop offset="1" stop-color="#FFE795"/></linearGradient><linearGradient id="paint2_linear_98_50755" x1="167.032" y1="73.0093" x2="148.475" y2="83.8834" gradientUnits="userSpaceOnUse"><stop stop-color="#EFC65D"/><stop offset="1" stop-color="#CA9429"/></linearGradient><linearGradient id="paint3_linear_98_50755" x1="174.229" y1="73.6844" x2="187.625" y2="90.8124" gradientUnits="userSpaceOnUse"><stop stop-color="#FED766"/><stop offset="1" stop-color="#FFF5CB"/></linearGradient><linearGradient id="paint4_linear_98_50755" x1="181.461" y1="92.8891" x2="94.5959" y2="72.0051" gradientUnits="userSpaceOnUse"><stop stop-color="#FED766"/><stop offset="1" stop-color="#FFF9DB"/></linearGradient><linearGradient id="paint5_linear_98_50755" x1="162.996" y1="94.7046" x2="93.6851" y2="82.5979" gradientUnits="userSpaceOnUse"><stop stop-color="#EFC65D"/><stop offset="1" stop-color="#CA9429"/></linearGradient><linearGradient id="paint6_linear_98_50755" x1="134.846" y1="104.39" x2="158.454" y2="129.814" gradientUnits="userSpaceOnUse"><stop stop-color="#FDD665"/><stop offset="1" stop-color="#FFF9DB"/></linearGradient><linearGradient id="paint7_linear_98_50755" x1="101.401" y1="120.885" x2="90.9595" y2="96.672" gradientUnits="userSpaceOnUse"><stop offset="0.0171405" stop-color="#CA9429"/><stop offset="1" stop-color="#EFC65D"/></linearGradient></defs>'
    },
    "empty-state-no-search": {
      "viewBox": "0 0 1000 680",
      "body": '<g id="State=Empty (Positive or Neutral) 2"><path id="Vector" d="M809.434 123.616C722.909 117.027 662.738 143.484 571.864 113.101C451.552 72.8782 430.97 12.136 281.785 0.770307C137.601 -10.2081 11.7875 97.452 0.772499 241.234C-10.2366 385.021 97.7187 510.484 241.908 521.462C314.841 527.019 391.323 484.067 523.35 486.602C618.395 488.427 717.277 530.246 778.025 533.778C891.741 540.385 990.711 457.622 999.384 344.358C1008.06 231.094 923.014 132.265 809.434 123.616Z" fill="url(#paint0_linear_8267_132316)"/><path id="Vector_2" d="M42.0885 463.384C42.0885 463.384 213.027 335.234 255.893 335.234C298.758 335.234 429.997 437.249 429.997 437.249C429.997 437.249 641.7 269.023 716.975 269.023C792.25 269.023 988.031 463.378 988.031 463.378H42.0885V463.384Z" fill="#3D5C9B"/><path id="Vector_3" opacity="0.4" d="M715.837 269.023C715.837 269.023 681.674 307.092 692.66 329.208C703.851 351.751 739.656 369.319 735.949 394.345C729.912 435.09 704.416 463.384 704.416 463.384H988.023C988.023 463.384 795.407 269.029 715.837 269.029V269.023Z" fill="black"/><path id="Vector_4" opacity="0.4" d="M255.893 335.228C255.675 338.25 243.583 357.332 248.249 370.616C254.804 389.299 277.811 400.547 271.662 422.586C263.73 450.997 249.379 457.898 249.379 457.898L42.0885 463.378C128.614 398.376 227.302 335.228 255.893 335.228Z" fill="black"/><path id="Vector_5" d="M988.041 463.384C1012.8 481.814 1007.21 549.944 892.331 561.192C834.543 566.848 873.448 640.277 801.904 670.401C723.728 703.319 583.934 641.01 507.047 641.01C400.503 641.01 194.231 722.23 122.71 648.931C81.9273 607.13 144.558 556.68 88.7352 538.783C43.2336 524.196 16.4669 487.641 42.098 463.378H988.041V463.384Z" fill="url(#paint1_linear_8267_132316)"/><path id="Vector_6" d="M191.964 394.603L374.588 463.384L72.7991 463.272L191.964 394.603Z" fill="#6195E3"/><path id="Vector_7" d="M763.719 357.948L449.209 463.384L655.819 473.846L899.575 481.538L961.286 463.077L763.719 357.948Z" fill="#6195E3"/><path id="Vector_8" opacity="0.2" d="M191.978 394.603C191.978 394.603 195.502 402.53 195.502 424.358C195.502 446.186 163.34 462.163 163.34 462.163L73.4017 462.357L191.978 394.603Z" fill="#191952"/><path id="Vector_9" d="M68.677 463.384C80.457 446.937 101.081 433.523 124.511 432.25C147.942 430.977 171.166 436.703 192.572 444.525C206.135 449.483 219.657 455.392 234.479 456.296C241.428 456.724 249.165 460.514 255.203 463.343C255.203 463.349 68.677 463.384 68.677 463.384Z" fill="#A1CAF6"/><path id="Vector_10" opacity="0.2" d="M764.129 356.923C764.129 356.923 751.645 371.689 762.42 390.594C773.195 409.5 744.216 430.142 762.049 448.986C779.882 467.829 843.631 467.692 843.631 467.692L961.286 463.077L764.129 356.923Z" fill="#191952"/><path id="Vector_11" d="M623.421 464.615C652.179 452.529 681.479 439.447 712.475 436.517C724.549 435.379 736.74 435.671 748.753 434.051C768.038 431.447 786.489 423.968 805.85 422.051C834.083 419.253 861.986 428.403 888.918 437.444C896.129 439.865 903.436 442.332 909.752 446.601C916.072 450.875 921.386 456.043 922.716 463.625L623.421 464.609V464.615Z" fill="#A1CAF6"/><path id="Vector_12" d="M961.286 463.076C984.487 479.045 978.691 539.623 871.025 549.366C816.862 554.27 853.326 617.887 786.271 643.99C713 672.512 581.974 618.523 509.912 618.523C410.054 618.523 216.721 688.899 149.689 625.39C111.461 589.169 170.165 545.457 117.848 529.95C75.1969 517.315 50.1146 485.639 74.1354 464.615L952.029 463.076H961.286Z" fill="url(#paint2_linear_8267_132316)"/><path id="Vector_13" d="M924.659 464.615C945.887 478.227 941.092 528.55 842.578 536.857C793.02 541.035 826.386 595.271 765.035 617.523C697.995 641.841 578.111 595.816 512.175 595.816C420.811 595.816 243.916 655.813 182.584 601.672C147.61 570.795 201.323 533.533 153.447 520.312C114.423 509.538 91.4739 482.537 113.455 464.615H924.659Z" fill="url(#paint3_linear_8267_132316)"/><g id="Group"><path id="Vector_14" d="M830.27 428.29C830.27 428.29 802.709 456.924 800.721 477.273C800.721 477.273 809.529 473.154 826.328 475.031C826.328 475.031 825.293 465.133 826.258 453.433C827.228 437.783 830.27 428.295 830.27 428.295V428.29Z" fill="#FFF2D4"/><path id="Vector_15" d="M832.813 427.421L861.721 483.921L830.13 483.792L832.813 427.421Z" fill="#FFF2D4"/><path id="Vector_16" d="M829.045 485.517L832.14 425.097C832.14 425.097 832.122 424.587 832.605 424.616C833.005 424.64 832.922 425.097 832.922 425.097L830.133 485.47L829.045 485.511V485.517Z" fill="#B07B4F"/><path id="Vector_17" d="M796.068 488.896C796.068 488.896 799.652 496.296 806.101 501.189C810.061 504.193 855.256 502.985 857.681 501.629C860.852 499.857 862.941 492.634 862.941 492.634L796.068 488.896Z" fill="#CA9429"/><path id="Vector_18" d="M815.817 490.005C818.094 488.18 820.124 485.957 821.365 485.845C821.813 485.804 836.505 485.247 847.397 486.449C848.615 486.584 849.409 486.866 849.662 490.786C849.674 490.95 816.258 490.005 815.811 490.005H815.817Z" fill="#EFC65D"/><path id="Vector_19" d="M861.624 492.564C861.836 492.153 861.601 491.373 860.912 491.261C858.8 490.921 820.53 489.959 815.811 490.006C829.744 491.173 853.287 492.341 861.624 492.564Z" fill="#EFC65D"/><path id="Vector_20" d="M857.875 483.909C857.875 483.909 858.487 489.126 860.658 491.291" stroke="black" stroke-width="0.771381" stroke-miterlimit="10" stroke-linecap="round"/><path id="Vector_21" d="M832.121 425.643C826.866 428.289 822.635 479.021 829.149 483.604" stroke="black" stroke-width="0.771381" stroke-miterlimit="10" stroke-linecap="round"/></g><g id="Group_2"><path id="Vector_22" d="M241.666 463.239C242.343 471.43 241.619 478.36 241.619 478.36C253.381 477.045 259.548 479.932 259.548 479.932C258.159 465.691 238.865 445.647 238.865 445.647C238.865 445.647 240.99 452.29 241.672 463.245L241.666 463.239Z" fill="#FFF2D4"/><path id="Vector_23" d="M238.945 484.492L216.833 484.586L237.068 445.031L238.945 484.492Z" fill="#FFF2D4"/><path id="Vector_24" d="M238.943 485.671L236.989 443.412C236.989 443.412 236.936 443.095 237.213 443.078C237.554 443.054 237.536 443.412 237.536 443.412L239.702 485.706L238.937 485.677L238.943 485.671Z" fill="#B07B4F"/><path id="Vector_25" d="M215.995 490.688C215.995 490.688 217.454 495.746 219.672 496.984C221.373 497.934 253.006 498.779 255.777 496.679C260.29 493.252 262.803 488.071 262.803 488.071L215.989 490.688H215.995Z" fill="#CA9429"/><path id="Vector_26" d="M225.27 489.385C225.452 486.639 226.005 486.445 226.858 486.351C234.484 485.512 244.77 485.9 245.081 485.929C245.946 486.005 247.37 487.566 248.965 488.839C248.653 488.839 225.264 489.502 225.27 489.385Z" fill="#EFC65D"/><path id="Vector_27" d="M248.972 488.845C245.665 488.81 218.881 489.485 217.404 489.725C216.921 489.802 216.763 490.347 216.91 490.641C222.747 490.482 239.222 489.667 248.978 488.851L248.972 488.845Z" fill="#EFC65D"/><path id="Vector_28" d="M217.58 489.743C219.104 488.223 219.528 484.574 219.528 484.574" stroke="black" stroke-width="0.771381" stroke-miterlimit="10" stroke-linecap="round"/><path id="Vector_29" d="M239.641 484.363C244.201 481.153 241.241 445.642 237.564 443.788" stroke="black" stroke-width="0.771381" stroke-miterlimit="10" stroke-linecap="round"/></g><path id="Vector_30" d="M310.982 263.94C352.929 263.94 386.934 230.03 386.934 188.2C386.934 146.37 352.929 112.46 310.982 112.46C269.035 112.46 235.03 146.37 235.03 188.2C235.03 230.03 269.035 263.94 310.982 263.94Z" fill="url(#paint4_linear_8267_132316)"/><path id="Vector_31" opacity="0.65" d="M810.274 247.244C804.21 245.912 792.55 242.77 789.463 237.399C787.126 233.332 788.562 228.775 786.387 224.619C784.213 220.464 778.201 217.762 774.419 220.546C770.704 195.4 753.834 191.841 739.045 194.243C737.574 194.483 736.039 194.838 734.619 194.376C733.198 193.913 732.164 192.726 731.156 191.633C724.094 184.034 714.418 178.888 704.154 177.285C698.254 176.363 671.764 176.746 671.185 199.535C670.698 218.653 681.101 226.8 687.49 228.927C754.927 251.373 869.543 255.456 869.543 255.456C869.543 255.456 816.337 248.576 810.274 247.244Z" fill="#1EC6CE"/><path id="Vector_32" opacity="0.65" d="M47.9836 268.58C45.6711 267.149 43.3292 265.584 41.8563 263.297C39.3678 259.418 40.0346 253.993 42.9329 250.403C45.8251 246.814 50.5844 245.005 55.2023 245.066C56.1449 245.08 57.1385 245.15 57.9759 244.726C59.0364 244.181 59.5648 242.995 60.0886 241.922C63.5178 234.92 70.3873 229.689 78.0633 228.229C85.7454 226.769 94.0564 229.114 99.8293 234.372C102.118 227.181 113.827 222.427 119.718 222.485C125.307 222.537 137.123 226.471 138.219 231.945C146.235 227.997 156.456 232.218 161.733 239.415C167.009 246.612 168.326 255.942 168.512 264.857C179.364 265.365 188.541 276.296 187.132 287.043C192.82 285.438 195.966 292.357 212.308 295.469C219.808 296.896 261.283 302.702 277.814 305.071C97.8266 293.251 53.3969 271.926 47.9836 268.58Z" fill="#1EC6CE"/><path id="Vector_33" opacity="0.65" d="M432.646 143.925C429.879 138.099 438.678 131.723 444.265 133.176C443.399 125.986 450.798 120.328 458.337 120.584C463.892 120.767 467.572 122.691 469.974 129.667C472.529 126.044 475.323 122.645 479.754 122.375C484.184 122.105 489.898 125.992 489.524 130.404C494.309 128.743 499.995 130.083 503.529 133.703C507.062 137.322 508.248 143.034 506.447 147.75C511.914 146.954 518.794 146.797 521.502 151.6C522.186 152.809 522.483 154.195 523.116 155.432C526.252 161.522 577.06 166.3 577.06 166.3C577.06 166.3 440.21 159.868 432.646 143.925Z" fill="#1EC6CE"/><g id="Group_3"><path id="Vector_34" d="M637.188 451.047C637.94 451.747 641.041 454.467 643.587 455.026C644.914 455.315 650.609 455.217 651.98 455.751C652.963 455.996 653.047 456.977 653.047 457.486C653.047 457.918 651.98 458.692 651.243 458.447C650.828 458.309 651.169 458.27 650.997 458.447C650.791 458.658 650.801 458.633 650.506 458.692C649.464 458.903 648.723 459.285 647.691 459.03C644.879 458.334 642.127 457.393 639.474 456.227C638.589 455.84 637.714 455.423 636.918 454.879C635.719 454.056 634.746 452.968 633.778 451.885C632.716 450.694 631.655 449.513 630.662 448.263C629.89 447.298 628.868 444.73 628.927 444.534C629.026 444.21 630.79 445.377 631.325 445.44C631.655 445.499 636.043 449.988 637.183 451.052L637.188 451.047Z" fill="#F7AEA3"/><path id="Vector_35" d="M497.039 141.17C497.039 141.17 640.295 344.775 651.746 462.123C651.746 462.123 616.671 399.92 519.768 410.735C519.768 410.735 525.744 353.632 520.171 286.154C514.564 195.911 497.039 141.17 497.039 141.17Z" fill="#FFF2D4"/><path id="Vector_36" d="M482.259 136.146L315.531 462.031L497.735 461.257L482.259 136.146Z" fill="#FFF2D4"/><path id="Vector_37" d="M504.026 474.38L486.167 122.768C486.167 122.768 486.285 119.822 483.484 120.008C481.184 120.16 481.641 122.768 481.641 122.768L497.736 474.13L504.026 474.38Z" fill="#B07B4F"/><path id="Vector_38" d="M580.296 497.1C567.16 486.569 555.439 473.739 548.299 473.101C545.723 472.871 460.969 469.666 398.147 476.576C391.13 477.35 386.554 478.987 385.07 501.589C385.011 502.555 577.721 497.1 580.296 497.1Z" fill="#EFC65D"/><path id="Vector_39" d="M316.086 511.862C314.872 509.486 316.214 504.977 320.18 504.34C332.368 502.379 553.075 496.812 580.296 497.096C499.931 503.815 364.159 510.559 316.081 511.857L316.086 511.862Z" fill="#EFC65D"/><path id="Vector_40" d="M544.861 493.621L544.345 477.792L472.289 478.826L471.793 494.704L544.861 493.621Z" fill="white"/><path id="Vector_41" d="M467.532 494.763L467.916 478.889L458.475 479.021L457.969 494.944L467.532 494.763Z" fill="white"/><path id="Vector_42" d="M575.572 493.195C575.572 493.195 571.001 488.495 565.934 484.04C554.99 474.42 550.749 473.156 548.758 473.156L549.486 493.567L575.572 493.195Z" fill="white"/><path id="Vector_43" d="M337.769 461.933C337.769 461.933 334.236 492.019 321.704 504.516" stroke="black" stroke-width="1.54276" stroke-miterlimit="10" stroke-linecap="round"/><path id="Vector_44" d="M486.303 125.89C516.615 141.165 541.01 433.754 503.439 460.194" stroke="black" stroke-width="1.54276" stroke-miterlimit="10" stroke-linecap="round"/><path id="Vector_45" d="M628 439.683C628.28 440.8 629.115 442.981 629.882 443.848C628.403 443.902 626.653 442.883 625.184 443.049C625.071 440.712 624.83 438.384 624.471 436.076C625.518 436.909 626.599 437.693 627.715 438.423C627.705 438.987 627.96 439.521 628 439.683Z" fill="#F09F92"/><path id="Vector_46" d="M630.545 430.483C630.747 430.885 630.698 432.36 630.899 432.762C631.327 433.615 632.216 434.291 632.482 434.811C632.659 435.164 631.578 434.899 631.558 435.178C631.479 436.35 632.585 436.957 632.747 438.295C632.821 438.908 631.636 440.623 629.764 440.452C628.978 440.383 625.783 438.29 624.422 437.247C623.361 436.433 622.751 435.071 622.859 433.742C622.884 433.439 622.943 433.13 623.071 432.851C623.189 432.606 623.346 432.385 623.518 432.174C624.162 431.39 624.958 430.714 625.877 430.283C626.796 429.846 627.843 429.66 628.85 429.827C629.022 429.851 630.314 430.018 630.55 430.488L630.545 430.483Z" fill="#F7AEA3"/><path id="Vector_47" d="M628.03 436.506C628.3 436.977 629.141 437.055 629.627 436.742C630.188 436.384 630.876 436.036 631.313 435.531C631.411 435.414 631.745 435.482 631.819 435.614C632.605 437.036 632.91 437.207 633.092 438.104C633.416 439.667 631.878 440.991 630.807 440.991C629.45 440.991 627.809 440.706 627.077 438.663C626.969 438.364 626.806 436.898 626.6 435.722C626.585 435.624 627.445 435.595 627.47 435.497C627.514 435.311 627.745 436.016 628.03 436.506Z" fill="black"/><path id="Union" fill-rule="evenodd" clip-rule="evenodd" d="M624.662 443.263C625.084 442.902 625.634 442.677 626.188 442.623C629.781 442.26 631.501 445.059 631.643 445.902C631.667 446.048 631.723 446.263 631.792 446.524C631.954 447.135 632.182 448.002 632.213 448.857C632.242 449.72 632.585 450.236 632.938 450.767C633.254 451.243 633.579 451.731 633.693 452.493C634.356 456.963 635.226 461.687 635.811 464.015C635.997 464.745 636.558 467.44 636.248 467.94C635.88 468.519 627.274 468.381 625.903 468.18V468.176C625.866 468.17 625.829 468.164 625.791 468.159C625.095 468.051 624.39 467.888 623.774 467.543C623.497 467.388 623.299 467.403 623.147 467.415C622.944 467.43 622.826 467.439 622.716 467.024C622.688 466.92 622.648 466.817 622.606 466.705C622.474 466.359 622.307 465.92 622.307 465.066C622.307 464.85 622.318 464.602 622.344 464.319C622.358 464.17 622.371 463.997 622.384 463.801C622.439 462.936 622.482 461.645 622.532 460.124C622.69 455.343 622.923 448.278 623.844 444.953C624.071 444.059 624.34 443.454 624.659 443.265C624.66 443.264 624.661 443.264 624.662 443.263Z" fill="#007494"/><path id="Vector_48" d="M630.244 431.327C630.617 431.199 632.44 430.685 632.553 428.847C632.662 427.161 630.573 426.269 629.226 426.7C627.108 427.382 624.081 429.381 622.656 431.087C622.376 431.425 621.172 432.988 622.454 435.463C622.926 436.374 623.639 437.355 624.567 437.786C624.509 436.904 624.253 434.963 624.282 434.806C624.391 434.267 624.784 433.919 625.3 433.919C625.85 433.919 626.204 434.365 626.381 434.889C626.573 434.713 627.349 434.243 627.349 434.243C627.349 434.243 626.7 433.204 626.548 432.714C626.44 432.361 627.251 431.63 627.669 431.493C628.288 431.302 629.738 431.503 630.244 431.332V431.327Z" fill="black"/><path id="Vector_49" d="M639.624 479.829C641.723 484.49 641.457 489.988 641.959 495.07C639.207 495.036 636.297 495.159 633.56 495.315C633.693 492.61 633.702 489.018 633.373 486.269C632.857 481.878 631.447 479.368 629.309 477.06C628.994 476.717 628.636 476.389 628.488 475.948C628.37 475.6 628.41 475.232 628.439 474.865C628.591 473.184 628.832 471.331 630.095 470.209C630.715 469.655 631.577 468.134 631.577 468.134C631.577 468.134 632.56 468.134 633.051 468.134C634.28 468.135 635.99 467.733 636.246 467.889C636.619 468.105 637.55 475.232 639.624 479.829Z" fill="#EC6446"/><path id="Vector_50" d="M627.564 486.288C623.795 492.169 622.242 493.291 619.662 497.319C617.736 497.104 615.794 497.045 613.858 497.138C613.607 497.148 613.268 497.256 613.293 497.506C613.357 496.579 618.984 488.219 620.37 484.553C621.859 480.618 622.434 475.467 622.198 471.615C622.075 469.699 622.591 467.023 622.743 467.023C623.471 467.028 624.149 467.734 624.842 467.954C626.768 468.562 630.086 467.864 632.086 468.134C632.592 468.198 630.828 481.201 627.569 486.288H627.564Z" fill="#B64129"/><path id="Vector_51" d="M694.244 490.73C694.244 490.73 673.559 533.401 636.371 561.634C613.529 578.973 352.872 571.979 338.875 564.158C320.599 553.95 308.553 512.288 308.553 512.288L694.244 490.73Z" fill="#CA9429"/><path id="Vector_52" opacity="0.2" d="M658.616 541.539C658.616 541.539 639.018 561.336 630.825 564.615C581.478 578.462 351.606 570.769 339.264 564.615C330.007 560 323.836 547.692 323.836 547.692L658.616 541.539Z" fill="#414159"/><path id="Shirt " opacity="0.1" d="M625.929 468.176C625.197 468.068 624.45 467.906 623.801 467.543C623.152 467.181 622.934 467.749 622.743 467.024C622.605 466.519 622.212 466.044 622.371 464.319C622.685 460.908 622.745 444.412 624.686 443.265C626.971 441.922 628.519 457.198 629.34 461.398C630.2 465.838 627.295 468.377 625.929 468.176Z" fill="#202024"/><path id="Arm" d="M638.243 454.571C634.626 452.414 632.871 448.17 629.834 445.255C629.264 444.706 628.552 444.176 627.76 444.26C626.93 444.353 626.325 445.127 626.06 445.916C625.706 446.95 625.76 448.117 626.203 449.121C626.773 450.4 627.903 451.327 628.881 452.336C630.345 453.855 631.54 455.673 633.265 456.894C635.471 458.452 638.277 458.844 640.843 459.722C643.688 460.697 646.303 462.294 649.182 463.157C649.836 463.353 650.544 463.51 651.202 463.304C651.856 463.098 652.401 462.412 652.215 461.755C652.008 461.035 651.129 460.78 650.386 460.648C649.988 460.579 649.585 460.501 649.187 460.432C649.104 460.417 649.015 460.403 648.942 460.359C648.686 460.197 648.77 459.78 648.996 459.584C649.222 459.383 649.274 459.099 649.53 458.937L649.284 458.692C649.146 458.467 648.996 458.202 648.996 458.202C644.877 458.222 641.388 456.448 638.243 454.571Z" fill="#ED978A"/></g></g><defs><linearGradient id="paint0_linear_8267_132316" x1="499.996" y1="0" x2="499.996" y2="534.148" gradientUnits="userSpaceOnUse"><stop stop-color="#1EC6CE"/><stop offset="1" stop-color="#DAFFF5"/></linearGradient><linearGradient id="paint1_linear_8267_132316" x1="15.4276" y1="532.307" x2="1174.04" y2="527.666" gradientUnits="userSpaceOnUse"><stop stop-color="#CCF3FE"/><stop offset="0.630679" stop-color="#8DD9FD"/><stop offset="1" stop-color="#67C9FC"/></linearGradient><linearGradient id="paint2_linear_8267_132316" x1="897.981" y1="495.363" x2="166.972" y2="495.363" gradientUnits="userSpaceOnUse"><stop stop-color="#67C9FC"/><stop offset="1" stop-color="#CCF3FE"/></linearGradient><linearGradient id="paint3_linear_8267_132316" x1="71.9046" y1="795.178" x2="987.996" y2="481.49" gradientUnits="userSpaceOnUse"><stop stop-color="#CCF3FE"/><stop offset="1" stop-color="#67C9FC"/></linearGradient><linearGradient id="paint4_linear_8267_132316" x1="310.982" y1="112.46" x2="310.982" y2="263.94" gradientUnits="userSpaceOnUse"><stop stop-color="#FFE795"/><stop offset="1" stop-color="#FFF9DB"/></linearGradient></defs>'
    },
    "empty-state-not-authorized": {
      "viewBox": "0 0 400 287",
      "body": '<path d="M76.224 74.7898C110.834 72.1429 134.903 82.7705 171.253 70.5661C219.378 54.409 227.611 30.0096 287.285 25.4442C344.959 21.0343 395.285 64.2801 399.691 122.035C404.095 179.793 360.912 230.19 303.236 234.6C274.063 236.832 243.47 219.579 190.659 220.597C152.64 221.33 113.087 238.128 88.7878 239.547C43.3011 242.201 3.71274 208.956 0.243469 163.459C-3.22583 117.963 30.7915 78.264 76.224 74.7898Z" fill="url(#paint0_linear_2844_120954)" fill-opacity="0.5"/><path d="M173.355 113.409C188.24 113.409 200.307 101.196 200.307 86.1295C200.307 71.0632 188.24 58.8496 173.355 58.8496C158.469 58.8496 146.402 71.0632 146.402 86.1295C146.402 101.196 158.469 113.409 173.355 113.409Z" fill="url(#paint1_linear_2844_120954)"/><path opacity="0.5" d="M367.298 82.0699C368.041 81.6083 368.794 81.1035 369.268 80.3659C370.067 79.1145 369.853 77.3647 368.921 76.2068C367.992 75.0492 366.462 74.4659 364.977 74.4855C364.674 74.4899 364.355 74.5124 364.086 74.3757C363.745 74.1998 363.575 73.8174 363.407 73.4715C362.304 71.2128 360.096 69.5256 357.628 69.0548C355.159 68.5837 352.487 69.3402 350.632 71.0362C349.896 68.7166 346.132 67.1834 344.238 67.2021C342.441 67.2189 338.643 68.4878 338.291 70.2533C335.714 68.9799 332.428 70.3413 330.732 72.6626C329.036 74.9839 328.613 77.9935 328.553 80.869C325.064 81.0328 322.114 84.5587 322.567 88.0251C320.739 87.5073 319.728 89.739 314.474 90.7426C312.064 91.203 298.731 93.0758 293.417 93.8399C351.275 90.0272 365.558 83.1489 367.298 82.0699Z" fill="#1EC6CE"/><path opacity="0.5" d="M60.0934 112.108C62.394 112.092 66.8626 111.851 68.3972 110.137C69.5591 108.838 69.3919 107.07 70.5017 105.727C71.6114 104.384 73.9996 103.867 75.1544 105.171C78.4481 96.3153 84.8372 96.3251 90.0104 98.3418C90.5249 98.5429 91.0536 98.7905 91.6043 98.7322C92.1549 98.6739 92.6217 98.322 93.0716 98.0028C96.219 95.7855 100.124 94.6624 103.968 94.8729C106.177 94.9938 115.747 97.1808 114.192 105.512C112.888 112.501 108.487 114.659 106.007 114.939C79.8304 117.887 37.9789 110.512 37.9789 110.512C37.9789 110.512 57.7928 112.123 60.0934 112.108Z" fill="#1EC6CE"/><path d="M274.861 217.453C265.323 217.453 249.893 223.044 234.003 230.909C229.225 218.667 178.285 210.789 116.147 210.789C50.8545 210.789 0 220.536 0 233.864C0 247.191 11.5283 256.938 116.147 256.938C125.354 256.938 134.315 256.723 142.916 256.319C166.04 255.228 197.084 255.399 181.317 266.25C176.361 269.658 175.002 274.403 175.602 277.064C179.516 294.308 252.319 283.727 281.905 276.549C308.355 270.13 324.368 261.53 324.368 245.119C324.368 228.708 302.077 217.459 274.861 217.459V217.453Z" fill="#A1CAF6"/><path d="M364.208 227.299C364.435 236.182 211.626 240.075 211.4 231.192C211.173 222.309 245.605 191.541 287.804 190.468C330.003 189.396 363.981 218.416 364.208 227.299Z" fill="#FDD665"/><path d="M236.712 66.2388C237.514 67.4894 281.882 133.77 269.661 207.395L243.488 209.35C243.488 209.35 265.392 148.832 234.261 67.5936C233.238 64.9269 235.909 64.9882 236.712 66.2388Z" fill="#CA9429"/><path d="M298.94 111.327C298.94 111.327 288.821 52.7766 233.997 65.5889C233.997 65.5889 233.88 67.5813 236.502 68.2311C238.744 68.7828 241.378 68.5008 242.554 69.402C245.103 71.3514 243.632 73.3376 246.187 75.0725C248.741 76.8074 252.325 75.894 254.665 77.6227C257.005 79.3515 255.228 81.6932 258.211 83.7224C261.194 85.7515 264.092 83.6794 266.511 85.8864C268.931 88.0933 266.469 89.2212 269.887 91.8144C273.305 94.4136 275.81 92.0289 278.45 94.2358C281.09 96.4427 278.322 98.1286 281.782 100.121C285.243 102.113 287.057 100.121 289.868 102.156C292.68 104.191 292.031 107.477 294.322 108.991C296.612 110.506 298.946 111.327 298.946 111.327H298.94Z" fill="#41B658"/><path d="M313.579 52.0506C313.579 52.0506 265.371 17.3654 235.215 64.9488C235.215 64.9488 236.532 66.4507 238.853 65.0714C240.838 63.8944 242.523 61.8468 243.993 61.6629C247.178 61.2645 247.521 63.7166 250.553 63.1587C253.585 62.607 255.509 59.4376 258.388 59.0392C261.267 58.6407 261.634 61.5465 265.187 60.9089C268.74 60.2714 269.353 56.7526 272.624 56.63C275.895 56.5073 274.927 59.0392 279.178 58.4936C283.435 57.9541 283.558 54.4966 286.982 54.2207C290.406 53.9449 289.616 57.0897 293.475 56.0844C297.334 55.079 297.242 52.3878 300.667 51.8667C304.097 51.3456 305.935 54.1472 308.63 53.62C311.325 53.0928 313.567 52.0445 313.567 52.0445L313.579 52.0506Z" fill="#41B658"/><path d="M278.029 0.0061303C278.029 0.0061303 219.897 12.0767 234.519 66.4893C234.519 66.4893 236.516 66.5383 237.073 63.89C237.551 61.6341 237.184 59.0042 238.041 57.7965C239.903 55.1789 241.937 56.5827 243.579 53.9773C245.22 51.372 244.198 47.8102 245.845 45.4133C247.493 43.0225 249.888 44.7144 251.818 41.6615C253.747 38.6087 251.579 35.7826 253.704 33.2876C255.83 30.7925 257.031 33.2201 259.511 29.7136C261.992 26.2071 259.53 23.7794 261.643 21.0699C263.756 18.3603 265.539 21.0699 267.407 17.5449C269.282 14.02 267.23 12.2667 269.171 9.39163C271.113 6.51651 274.415 7.04985 275.848 4.70807C277.282 2.3663 278.029 0 278.029 0V0.0061303Z" fill="#41B658"/><path d="M211.197 141.297C211.197 141.297 183.938 88.515 235.375 65.5938C235.375 65.5938 236.667 67.1141 234.971 69.2106C233.519 71.0007 231.246 72.3739 230.848 73.8022C229.991 76.898 232.361 77.5969 231.375 80.5149C230.383 83.4391 226.977 84.8797 226.162 87.669C225.347 90.4583 228.165 91.2491 227.02 94.6759C225.874 98.1027 222.303 98.1947 221.709 101.419C221.108 104.644 223.755 104.049 222.597 108.181C221.439 112.313 218.003 111.933 217.237 115.286C216.465 118.639 219.687 118.314 218.131 121.986C216.576 125.658 213.929 125.174 212.912 128.491C211.902 131.807 214.401 134.039 213.488 136.632C212.576 139.225 211.21 141.291 211.21 141.291L211.197 141.297Z" fill="#41B658"/><path d="M167.223 103.377C167.223 103.377 183.743 46.3096 236.821 65.099C236.821 65.099 236.717 67.0913 234.04 67.4469C231.756 67.7473 229.164 67.1771 227.896 67.9373C225.146 69.5925 226.39 71.732 223.658 73.1665C220.926 74.601 217.465 73.3075 214.953 74.7665C212.442 76.2255 213.942 78.745 210.757 80.437C207.566 82.129 204.919 79.7443 202.267 81.6692C199.615 83.5941 201.942 84.9857 198.261 87.1865C194.579 89.3872 192.35 86.7451 189.483 88.6455C186.616 90.5459 189.183 92.5321 185.526 94.126C181.869 95.7198 180.282 93.5436 177.262 95.2539C174.243 96.9643 174.524 100.305 172.08 101.556C169.636 102.806 167.223 103.364 167.223 103.364V103.377Z" fill="#41B658"/><path d="M159.268 43.6956C159.268 43.6956 211.194 14.8832 235.586 65.6666C235.586 65.6666 234.104 67.0092 231.96 65.3663C230.128 63.9685 228.689 61.731 227.256 61.3754C224.138 60.6091 223.513 63 220.566 62.0988C217.62 61.1976 216.076 57.826 213.265 57.0903C210.453 56.3547 209.743 59.1992 206.294 58.1509C202.839 57.0965 202.643 53.5409 199.403 53.0321C196.168 52.5294 196.836 55.1532 192.671 54.1171C188.505 53.0811 188.787 49.6359 185.418 48.9616C182.049 48.2872 182.465 51.5056 178.747 50.0528C175.029 48.5999 175.439 45.9393 172.095 45.0259C168.75 44.1064 166.594 46.675 163.978 45.8412C161.363 45.0075 159.262 43.6956 159.262 43.6956H159.268Z" fill="#41B658"/><path opacity="0.1" d="M20.1198 229.965C8.12813 231.127 3.868 244.677 27.0794 247.387C50.2907 250.097 103.289 252.035 171.72 241.973C187.438 239.662 202.396 236.547 203.87 230.352C205.804 222.222 192.264 217.189 192.264 217.189L40.2335 229.191C40.2335 229.191 32.1116 228.804 20.1198 229.965Z" fill="black"/><path d="M231.62 217.486L229.629 209.498L233.604 209.32L233.065 217.486H231.62Z" fill="#292A2B"/><path d="M215.086 182.346C221.754 185.249 217.698 197.603 223.21 201.703C225.277 203.242 238.088 208.506 238.285 210.72C238.334 211.285 238.242 211.893 237.793 212.345C237.184 212.967 236.095 213.143 235.098 213.281C233.505 213.499 231.838 213.718 230.282 213.366C228.725 213.015 227.323 211.912 227.477 210.663C227.581 209.779 228.449 209.028 229.482 208.634C230.515 208.239 231.697 208.154 232.847 208.144C233.634 208.14 234.471 208.178 235.111 208.529C235.88 208.957 236.169 209.722 236.409 210.43C237.436 213.499 236.409 215.975 232.847 218.35" stroke="#CA9429" stroke-width="1.53139" stroke-miterlimit="10" stroke-linecap="round"/><path d="M234.034 209.321C234.034 208.745 232.956 208.285 231.62 208.285C230.285 208.285 229.207 208.751 229.207 209.321C229.207 209.462 229.274 209.603 229.397 209.726C229.764 210.1 230.622 210.357 231.62 210.357C232.95 210.357 234.034 209.891 234.034 209.321Z" fill="black"/><path opacity="0.1" fill-rule="evenodd" clip-rule="evenodd" d="M314.704 220.464C315.702 219.192 318.277 218.933 321.86 218.573C322.826 218.475 323.865 218.371 324.966 218.237C328.865 217.764 331.716 217.192 334.07 216.719C336.708 216.19 338.723 215.785 340.892 215.785C353.748 215.785 360.188 221.023 360.188 225.594C360.188 227.353 357.591 228.108 354.446 229.021C353.433 229.316 352.364 229.626 351.305 229.993C348.935 230.813 345.685 230.084 342.166 229.295C339.459 228.688 336.593 228.046 333.848 228.046C330.774 228.046 327.211 228.837 323.811 229.591C319.336 230.585 315.143 231.516 312.716 230.498C310.445 229.545 311.842 226.996 313.052 224.788C313.364 224.218 313.664 223.67 313.885 223.178C313.735 223.184 313.576 223.188 313.409 223.192C312.397 223.216 311.087 223.247 309.648 223.755C308.547 224.143 307.355 224.734 306.066 225.373C303.021 226.882 299.436 228.659 295.253 228.659C292.163 228.659 289.552 227.485 287.044 226.356C285.584 225.7 284.16 225.059 282.695 224.674C278.206 223.493 274.426 221.769 274.426 219.77C274.426 216.215 284.089 215.785 295.253 215.785C304.503 215.785 312.302 217.764 314.704 220.464Z" fill="#202024"/><path d="M348.299 197.474L348.74 217.281L351.453 219.402L354.02 217.771C354.02 217.771 353.702 217.134 354.29 213.682C354.878 210.231 355.68 204.364 355.754 202.164C355.827 199.963 354.143 195.193 354.143 195.193L348.299 197.468V197.474Z" fill="#8C715D"/><path d="M328.213 194.391C328.213 194.391 327.478 198.204 327.11 200.699C326.743 203.194 324.396 217.06 324.396 217.06L326.522 219.629L329.015 218.293C329.015 218.293 328.96 217.79 330.063 215.442C331.165 213.094 333.217 207.883 334.093 205.027C334.969 202.17 334.093 194.391 334.093 194.391H328.207H328.213Z" fill="#8C715D"/><path d="M336.27 197.426C336.601 193.025 342.622 185.668 344.38 182.806C345.073 181.684 346.028 195.238 347.786 198.432C347.786 198.432 351.327 198.812 353.949 198.812C356.57 198.812 359.033 198.138 359.033 198.138C357.826 192.197 357.471 187.514 358.782 184.62C363.4 174.444 359.664 163.82 359.664 163.82L336.135 163.207C336.135 163.207 325.789 189.181 325.244 195.348C325.244 195.348 327.504 196.274 330.096 196.844C333.091 197.506 336.405 197.69 336.27 197.42V197.426Z" fill="#6195E3"/><path d="M354.014 124.151L353.082 116.764L346.173 118.836L344.084 130.502C344.084 130.502 348.519 134.02 351.233 131.93C353.946 129.84 354.02 124.151 354.02 124.151H354.014Z" fill="#9A7761"/><path d="M352.934 120.263L354.018 120.171L354.349 119.693L355.231 120.116C355.231 120.116 354.753 118.504 354.643 118.393C354.533 118.283 355.415 118.173 355.415 118.173L353.767 114.973L352.615 116.763L352.946 120.269L352.934 120.263Z" fill="#292A2B"/><path d="M318.785 147.189C318.228 146.931 316.261 146.196 315.312 145.65C314.822 145.368 314.167 146.03 314.638 146.428C314.945 146.686 316.329 147.765 316.219 148.231C316.114 148.648 311.79 148.74 311.049 148.776C310.307 148.813 310.369 149.665 311.153 149.708C311.937 149.751 313.033 149.8 313.033 149.917C313.033 150.033 312.519 150.456 310.693 150.517C309.909 150.542 309.94 151.382 310.681 151.382C311.422 151.382 312.917 151.271 312.917 151.547C312.917 151.731 311.918 151.94 311.3 152.019C310.681 152.099 310.773 152.681 311.392 152.657C312.176 152.632 314.265 152.51 314.283 152.62C314.314 152.847 312.923 153.215 312.635 153.215C312.219 153.215 312.09 153.717 312.684 153.699C313.977 153.65 318.154 153.252 318.969 152.626C319.906 151.903 320.556 151.541 320.556 149.972C320.556 148.402 319.349 147.44 318.791 147.183L318.785 147.189Z" fill="#9A7761" stroke="#9A7761" stroke-width="1.53139" stroke-miterlimit="10"/><path d="M333.607 136.988C333.607 136.988 331.671 143.603 329.099 145.43C326.936 146.968 319.365 148.194 319.365 148.194L319.641 151.499C319.641 151.499 325.062 153.558 330.489 153.166C337.638 152.651 338.581 142.377 338.581 142.377L340.976 137.411L333.607 136.988Z" fill="#9A7761" stroke="#9A7761" stroke-width="1.53139" stroke-miterlimit="10"/><path d="M344.812 126.418C344.812 126.418 337.228 127.012 332.83 136.772C333.982 139.831 338.018 142.448 338.576 142.381C336.456 149.351 335.905 156.554 336.126 163.212C336.512 163.984 352.07 166.522 357.786 163.549C363.501 160.576 357.835 125.093 357.835 125.093L353.963 123.775C353.963 123.775 352.585 132.744 347.672 132.082C344.083 131.598 344.812 126.424 344.812 126.424V126.418Z" fill="#F9927B"/><path d="M338.596 191.473C338.596 191.473 342.547 176.344 343.245 176.344C343.943 176.344 344.378 182.799 344.378 182.799L338.596 191.473Z" fill="#3D5C9B"/><path d="M344.595 112.705C344.595 112.705 342.138 115.789 341.477 116.077C340.815 116.365 340.779 117.579 341.477 117.8C342.175 118.02 342.102 119.118 341.477 120.662C340.852 122.207 341.005 124.402 342.782 125.358C344.558 126.315 347.474 126.407 348.772 125.928C351.596 124.88 351.541 118.259 351.688 117.818C351.835 117.377 353.103 118.247 353.685 116.96C354.267 115.672 353.593 114.538 352.056 114.318C350.518 114.097 345.146 111.816 345.146 111.816L344.595 112.705Z" fill="#9A7761" stroke="#9A7761" stroke-width="1.53139" stroke-miterlimit="10"/><path d="M345.251 114.967C345.519 114.967 345.735 114.75 345.735 114.482C345.735 114.215 345.519 113.998 345.251 113.998C344.984 113.998 344.768 114.215 344.768 114.482C344.768 114.75 344.984 114.967 345.251 114.967Z" fill="black"/><path d="M346.127 112.833C346.127 112.833 346.642 113.79 346.856 114.115C347.199 114.648 347.805 114.47 347.511 113.753C347.321 113.287 346.593 112.705 346.593 112.705L346.127 112.447V112.833Z" fill="#292A2B"/><path opacity="0.5" d="M358.328 131.236C358.328 131.236 360.331 129.655 363.958 140.058C362.389 142.823 357.305 143.479 356.546 143.049C355.786 142.62 357.354 131.347 357.354 131.347L358.328 131.236Z" fill="#292A2B" stroke="#292A2B" stroke-width="1.53139" stroke-miterlimit="10"/><path d="M358.869 141.457C358.869 141.457 359.39 149.745 359.359 152.994C359.304 157.978 354.018 167.18 354.018 167.18L358.446 169.08C358.446 169.08 365.252 156.948 365.472 153.969C365.693 150.989 364.498 138.588 364.498 138.588L358.869 141.457Z" fill="#9A7761" stroke="#9A7761" stroke-width="1.53139" stroke-miterlimit="10"/><path d="M357.847 125.088C357.847 125.088 362.827 128.129 366.453 138.532C364.885 141.297 357.143 142.376 357.143 142.376L357.234 125.113L357.847 125.082V125.088Z" fill="#F9927B"/><path d="M366.172 137.74C366.27 137.998 366.362 138.261 366.453 138.531C364.885 141.296 357.143 142.375 357.143 142.375V141.578L366.172 137.74Z" fill="#EC6446"/><path d="M359.029 169.33L358.539 169.784L352.996 167.479L352.959 166.725L359.029 169.33Z" fill="#3D5C9B"/><path d="M339.056 141.308C338.927 141.578 338.866 141.762 338.449 142.405C335.558 140.94 333.494 138.574 332.826 136.772L333.157 136.061C333.157 136.061 336.949 140.235 339.05 141.308H339.056Z" fill="#EC6446"/><path d="M341.815 118.933C341.815 119.239 341.815 119.546 341.486 120.667C340.867 122.212 341.014 124.407 342.791 125.363C344.567 126.319 347.483 126.411 348.781 125.933C351.605 124.885 351.679 118.282 351.697 117.823C351.74 116.615 351.795 114.322 351.795 114.322L350.981 114.426C350.981 114.426 350.57 116.56 350.294 117.375C349.804 118.828 348.837 121.403 347.593 120.318C344.714 117.804 341.815 118.013 341.823 118.227L341.815 118.933Z" fill="#292A2B" stroke="#292A2B" stroke-width="1.53139" stroke-miterlimit="10"/><path d="M342.502 119.625C342.502 119.625 342.594 120.6 343.494 120.833C344.395 121.066 345.111 120.299 345.35 120.06L342.508 119.625H342.502Z" fill="white" stroke="#221F20" stroke-width="1.53139" stroke-miterlimit="10"/><path d="M351.117 114.316C350.547 114.641 340.085 111.27 340.636 110.393C341.188 109.516 345.659 110.651 345.659 110.651L351.123 112.189C351.123 112.189 351.693 113.992 351.123 114.316H351.117Z" fill="#3D5C9B"/><path d="M354.017 115.678C354.495 113.661 355.481 109.223 352.076 108.156C348.67 107.09 345.662 110.651 345.662 110.651C345.662 110.651 350.538 112.889 351.126 114.317C352.082 114.17 353.411 114.697 354.024 115.672L354.017 115.678Z" fill="#6195E3"/><path d="M323.86 216.014C323.082 216.425 323.168 218.258 321.618 219.404C320.069 220.55 316.191 222.138 315.419 222.549C314.647 222.96 315.419 223.407 315.419 223.407H329.043C329.043 223.407 328.877 221.936 329.288 220.385C329.698 218.834 329.943 217.773 330.065 217.73C330.188 217.687 328.883 217.528 327.946 218.264C327.009 218.999 326.274 218.956 326.194 218.019C326.114 217.081 325.055 215.732 323.866 216.02L323.86 216.014Z" fill="#292A2B"/><path d="M347.69 215.976C346.912 216.387 347.402 218.263 345.853 219.403C344.303 220.544 340.425 222.137 339.654 222.548C338.882 222.959 339.654 223.406 339.654 223.406L354.606 223.247C354.606 223.247 354.851 221.941 354.71 220.341C354.569 218.741 354.937 216.731 354.545 216.424C354.153 216.117 353.118 217.527 352.18 218.263C351.243 218.999 350.3 218.95 350.428 218.018C350.735 215.793 348.879 215.694 347.696 215.976H347.69Z" fill="#292A2B"/><path d="M281.47 217.327C281.47 217.327 281.495 214.556 280.643 212.803C279.792 211.05 279.461 209.762 279.461 209.762L284.024 209.131C284.024 209.131 284.41 213.563 285.507 214.691C286.603 215.819 287.596 217.027 287.596 217.027L285.672 218.345L281.464 217.327H281.47Z" fill="white"/><path d="M286.801 216.199C286.801 216.199 292.405 218.406 292.767 218.737C293.128 219.068 293.508 219.313 292.767 219.399C292.026 219.485 282.598 219.479 281.961 219.399C281.324 219.32 280.914 217.474 281.134 216.843C281.355 216.211 286.415 217.45 286.605 217.45C286.794 217.45 286.794 216.205 286.794 216.205L286.801 216.199Z" fill="#F99BD9"/><path d="M300.593 217.278C300.593 217.278 300.618 214.507 299.766 212.754C298.915 211.001 298.584 209.713 298.584 209.713L303.148 209.082C303.148 209.082 303.533 213.514 304.63 214.642C305.726 215.77 306.719 216.978 306.719 216.978L304.795 218.296L300.587 217.278H300.593Z" fill="white"/><path d="M305.931 216.15C305.931 216.15 311.536 218.357 311.898 218.688C312.259 219.019 312.639 219.265 311.898 219.35C311.157 219.436 301.729 219.43 301.092 219.35C300.455 219.271 300.045 217.426 300.265 216.794C300.486 216.163 305.545 217.401 305.735 217.401C305.925 217.401 305.925 216.157 305.925 216.157L305.931 216.15Z" fill="#F99BD9"/><path d="M286.209 156.98C286.209 156.98 285.4 160.573 284.744 161.456C284.089 162.338 282.398 165.857 283.789 173.416C285.179 180.974 283.348 187.798 282.031 190.434C280.714 193.07 276.53 200.959 278.803 211.632C282.76 211.926 286.901 211.632 288.04 211.632C289.78 196.999 294.27 190.942 294.27 190.942C294.27 190.942 291.997 204.588 298.227 211.926C303.728 212.147 306.803 211.706 306.803 211.706C306.803 211.706 304.898 193.284 305.559 186.541C306.221 179.797 299.403 156.98 299.403 156.98H286.209Z" fill="#ABFAF0"/><path d="M287.169 171.797C287.2 172.6 289.485 181.759 289.258 190.249C289.043 198.451 285.705 198.537 286.434 211.448C286.434 211.448 287.671 211.632 288.045 211.632C289.105 202.73 291.181 197.005 292.645 193.884C293.589 191.874 294.281 190.942 294.281 190.942C294.281 190.942 292.817 178.344 287.169 171.797Z" fill="#1EC6CE"/><path d="M315.017 128.295C315.403 128.185 317.253 127.786 318.49 129.08C319.727 130.373 318.71 131.152 318.508 131.029C318.49 131.268 318.165 131.569 317.883 131.471C317.834 131.734 317.547 132.102 317.106 131.857C317.148 132.145 317.087 134.315 316.285 134.505C315.482 134.695 316.45 131.311 315.513 130.986C314.576 130.662 314.937 133.144 314.986 133.512C315.041 133.935 314.514 134.585 314.251 133.972C314.079 133.567 313.608 132.593 313.449 131.839C313.357 131.403 313.246 130.545 313.645 129.724C314.012 128.97 314.619 128.412 315.004 128.307L315.017 128.295Z" fill="#F1DBCB" stroke="#F1DBCB" stroke-width="1.53139" stroke-miterlimit="10"/><path d="M315.51 136.223C316.183 136.223 316.729 135.677 316.729 135.003C316.729 134.329 316.183 133.783 315.51 133.783C314.837 133.783 314.291 134.329 314.291 135.003C314.291 135.677 314.837 136.223 315.51 136.223Z" stroke="#202024" stroke-width="1.53139" stroke-miterlimit="10"/><path d="M316.96 137.088C316.96 136.285 316.311 135.635 315.508 135.635C314.706 135.635 314.057 136.285 314.057 137.088C314.057 137.848 314.639 138.461 315.38 138.528V140.208H314.761V140.582H315.398V140.919H314.761V141.422H316.023V138.436C316.568 138.228 316.96 137.701 316.96 137.082V137.088ZM315.092 136.413C315.092 136.211 315.251 136.052 315.453 136.052C315.655 136.052 315.815 136.211 315.815 136.413C315.815 136.616 315.655 136.775 315.453 136.775C315.251 136.775 315.092 136.616 315.092 136.413Z" fill="#F9AA00"/><path d="M285.718 129.572L285.025 126.556L289.589 126.004L291.304 129.265C291.304 129.265 294.924 133.091 293.387 134.133C291.849 135.175 285.718 129.566 285.718 129.566V129.572Z" fill="#E1C5B6"/><path d="M293.142 122.668C293.197 123.103 293.234 123.33 293.301 123.845C293.889 128.069 291.108 127.094 287.512 126.867C286.783 126.818 285.626 126.677 284.878 126.481C282.183 125.77 280.443 121.258 280.443 117.776C280.443 113.405 282.385 114.067 285.993 114.067C289.16 114.067 291.543 116.997 292.799 120.577C293.074 121.362 294.391 121.552 294.391 122.006C294.391 122.459 293.105 122.392 293.142 122.668Z" fill="#F1DBCB" stroke="#F1DBCB" stroke-width="1.53139" stroke-miterlimit="10"/><path d="M294.028 118.506C294.028 118.506 295.387 115.153 292.196 112.192C289.887 110.046 285.801 112.566 284.992 113.154C284.533 111.493 281.035 108.655 278.585 111.309C276.257 113.841 278.971 116.955 279.767 116.955C279.584 117.298 279.173 124.52 282.965 125.562C282.616 123.931 283.026 121.847 282.953 121.626C282.646 121.639 280.992 121.001 281.593 119.567C282.193 118.132 283.381 118.96 283.804 119.346C284.135 118.941 284.833 118.39 284.815 117.274C285.562 117.672 286.879 118.481 289.029 118.224C290.977 117.991 291.436 117.262 291.755 117.108C293.06 116.924 294.028 118.5 294.028 118.5V118.506Z" fill="black" stroke="black" stroke-width="1.53139" stroke-miterlimit="10"/><path d="M293.549 124.293C293.549 124.293 292.447 124.373 291.068 123.711C291.123 125.274 292.557 125.63 293.427 125.936C293.427 125.936 293.531 125.654 293.58 125.219C293.629 124.784 293.549 124.287 293.549 124.287V124.293Z" fill="black"/><path d="M293.568 124.495C293.568 124.495 292.502 124.569 291.369 124.029C291.633 125.163 292.766 125.488 293.482 125.746C293.482 125.746 293.538 125.58 293.574 125.225C293.611 124.869 293.562 124.495 293.562 124.495H293.568Z" fill="white"/><path d="M291.372 120.578C291.602 120.578 291.788 120.391 291.788 120.161C291.788 119.931 291.602 119.744 291.372 119.744C291.142 119.744 290.955 119.931 290.955 120.161C290.955 120.391 291.142 120.578 291.372 120.578Z" fill="black"/><path d="M291.553 118.732C290.187 118.119 289.623 119.633 289.623 119.633C289.623 119.633 290.138 119.222 290.591 118.996C291.044 118.769 291.553 118.732 291.553 118.732Z" fill="black"/><path d="M285.695 129.253C284.378 129.879 280.929 134.243 280.782 138.498C280.635 142.752 286.209 156.987 286.209 156.987C286.209 156.987 293.873 159.371 299.404 156.987C300.647 152.99 299.404 144.371 299.404 144.371C299.404 144.371 306.001 146.277 306.736 145.836C307.471 145.394 312.96 136.236 313.333 132.337C312.984 130.124 313.725 129.633 314.467 128.561C309.548 130.541 305.082 137.217 303.618 137.658C302.154 138.099 292.948 130.259 291.049 129.112C292.078 130.614 292.219 133.22 292.219 133.22C292.219 133.22 287.49 131.387 285.695 129.259V129.253Z" fill="#A72CAB"/><path d="M290.174 153.093C290.174 153.093 291.105 156.446 291.981 156.666C292.863 156.887 302.333 152.688 302.48 151.934C302.627 151.18 296.067 136.51 295.087 136.412C294.107 136.308 285.99 140.74 285.99 140.74L290.174 153.093Z" fill="#F9F9F9" stroke="#202024" stroke-width="3.06279" stroke-miterlimit="10"/><path d="M291.824 137.552L288.979 138.957L289.361 139.732L292.206 138.327L291.824 137.552Z" fill="#DFE24F"/><path d="M288.557 135.781C291.381 141.501 293.47 147.153 293.911 147.3C294.352 147.447 296.808 140.55 296.955 140.183C297.102 139.815 299.449 140.808 299.449 141.543C299.449 142.279 298.566 154.527 295.712 155.226C292.857 155.925 283.871 149.396 281.929 143.56C279.988 137.73 285.74 130.061 288.563 135.781H288.557Z" fill="#DD63CA"/><path d="M299.145 141.034C299.145 141.034 299.182 139.115 298.098 138.748C297.014 138.38 296.744 138.49 296.744 138.49L297.112 140.102L299.145 141.034Z" fill="#F1DBCB"/><path d="M38.9354 234.085L36.041 202.973L208.702 190.271C208.702 190.271 205.415 208.317 186.343 225.099L38.9354 234.085Z" fill="#A1F1CF"/><path d="M33.2375 204.07L32.7168 197.756L131.761 190.148L126.53 168.508L175.179 166.473L192.466 183.527L215.296 182.356L212.833 190.693L33.2375 204.07Z" fill="#4DC89B"/><path d="M130.807 172.069L135.487 189.332L158.537 187.867L151.683 170.818L130.807 172.069Z" fill="white"/><path d="M154.17 170.642L161.196 187.905L189.686 185.796L174.397 169.637L154.17 170.642Z" fill="white"/><path d="M26.8412 230.307L27.417 234.077L21.8672 235.781L22.1122 239.043C22.1122 239.043 31.0739 238.877 33.2791 237.308C35.4843 235.738 36.5073 229.547 36.5073 229.547L26.835 230.295L26.8412 230.307Z" fill="#656A81"/><path d="M22.0514 234.06C22.2781 234.783 22.6272 236.052 22.5599 236.769C22.5047 237.327 21.935 237.125 21.935 237.125C20.9304 237.021 18.3148 234.697 18.4128 233.686C18.5108 232.674 19.4113 231.945 20.4159 232.049C21.4205 232.153 21.7452 233.091 22.0514 234.054V234.06Z" fill="#656A81"/><path d="M20.2935 239.773C20.7039 239.136 21.4574 238.057 22.0577 237.658C22.5232 237.345 22.7315 237.916 22.7315 237.916C23.295 238.755 23.1725 242.256 22.3333 242.82C21.4941 243.384 20.3548 243.157 19.7912 242.317C19.2277 241.477 19.7422 240.625 20.2935 239.773Z" fill="#656A81"/><path d="M17.6953 205.848C16.948 207.215 17.0215 209.281 17.0215 209.281L18.5468 226.685C18.5468 226.685 18.8531 229.541 20.7765 230.761C22.7979 232.043 25.5667 231.889 25.5667 231.889L39.6616 230.878L36.9725 203.457L21.3829 204.101C21.3829 204.101 18.6509 204.101 17.6953 205.854V205.848Z" fill="#414159"/><defs><linearGradient id="paint0_linear_2844_120954" x1="339.969" y1="171.036" x2="44.1041" y2="168.588" gradientUnits="userSpaceOnUse"><stop stop-color="#1EC6CE"/><stop offset="1" stop-color="#DAFFF5"/></linearGradient><linearGradient id="paint1_linear_2844_120954" x1="169.831" y1="111.101" x2="173.644" y2="79.2697" gradientUnits="userSpaceOnUse"><stop stop-color="#FFF9DB"/><stop offset="1" stop-color="#FFE795"/></linearGradient></defs>'
    },
    "expand-content": {
      "viewBox": "0 0 20 20",
      "body": '<g id="Left Icon"><mask id="mask0_3070_15983" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20"><rect id="Bounding box" width="20" height="20" fill="#D9D9D9"/></mask><g mask="url(#mask0_3070_15983)"><path id="expand_content" d="M5 15V10H6.5V13.5H10V15H5ZM13.5 10V6.5H10V5H15V10H13.5Z" fill="#3957EA"/></g></g>'
    },
    "expand-less": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M6.27588 13L5.21338 11.9375L10.2134 6.9375L15.2134 11.9375L14.1509 13L10.2134 9.0625L6.27588 13Z" fill="#3957EA"/>'
    },
    "expand-more": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10 13.0625L5 8.0625L6.0625 7L10 10.9375L13.9375 7L15 8.0625L10 13.0625Z" fill="#3957EA"/>'
    },
    "export-gray": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.99903 13.27L5.70703 8.97803L6.95703 7.72803L9.12403 9.89503V3.33203H10.874V9.89503L13.041 7.72803L14.291 8.97803L9.99903 13.27ZM5.08203 16.666C4.59603 16.666 4.18303 16.4957 3.84303 16.155C3.50236 15.815 3.33203 15.402 3.33203 14.916V12.499H5.08203V14.916H14.916V12.499H16.666V14.916C16.666 15.402 16.4957 15.815 16.155 16.155C15.815 16.4957 15.402 16.666 14.916 16.666H5.08203Z" fill="#656A81"/>'
    },
    "export": {
      "viewBox": "0 0 14 14",
      "body": '<path d="M6.99903 10.271L2.70703 5.979L3.95703 4.729L6.12403 6.896V0.333H7.87403V6.896L10.041 4.729L11.291 5.979L6.99903 10.271ZM2.08203 13.667C1.59603 13.667 1.18303 13.4967 0.843031 13.156C0.502365 12.816 0.332031 12.403 0.332031 11.917V9.5H2.08203V11.917H11.916V9.5H13.666V11.917C13.666 12.403 13.4957 12.816 13.155 13.156C12.815 13.4967 12.402 13.667 11.916 13.667H2.08203Z" fill="#3957EA"/>'
    },
    "eye": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10 13.5C10.972 13.5 11.7983 13.1597 12.479 12.479C13.1597 11.7983 13.5 10.972 13.5 10C13.5 9.028 13.1597 8.20167 12.479 7.521C11.7983 6.84033 10.972 6.5 10 6.5C9.028 6.5 8.20167 6.84033 7.521 7.521C6.84033 8.20167 6.5 9.028 6.5 10C6.5 10.972 6.84033 11.7983 7.521 12.479C8.20167 13.1597 9.028 13.5 10 13.5ZM10 12C9.44467 12 8.97233 11.8057 8.583 11.417C8.19433 11.0277 8 10.5553 8 10C8 9.44467 8.19433 8.97233 8.583 8.583C8.97233 8.19433 9.44467 8 10 8C10.5553 8 11.0277 8.19433 11.417 8.583C11.8057 8.97233 12 9.44467 12 10C12 10.5553 11.8057 11.0277 11.417 11.417C11.0277 11.8057 10.5553 12 10 12ZM10 16C8.014 16 6.20833 15.455 4.583 14.365C2.95833 13.2743 1.764 11.8193 1 10C1.764 8.18067 2.95833 6.72567 4.583 5.635C6.20833 4.545 8.014 4 10 4C11.986 4 13.7917 4.545 15.417 5.635C17.0417 6.72567 18.236 8.18067 19 10C18.236 11.8193 17.0417 13.2743 15.417 14.365C13.7917 15.455 11.986 16 10 16ZM10 14.5C11.5553 14.5 12.9927 14.0973 14.312 13.292C15.632 12.486 16.646 11.3887 17.354 10C16.646 8.61133 15.632 7.514 14.312 6.708C12.9927 5.90267 11.5553 5.5 10 5.5C8.44467 5.5 7.00733 5.90267 5.688 6.708C4.368 7.514 3.354 8.61133 2.646 10C3.354 11.3887 4.368 12.486 5.688 13.292C7.00733 14.0973 8.44467 14.5 10 14.5Z" fill="#3957EA"/>'
    },
    "guides": {
      "viewBox": "0 0 15 16",
      "body": '<path d="M5.625 2.97674C5.2125 2.97674 4.85938 2.83101 4.56563 2.53954C4.27188 2.24806 4.125 1.89767 4.125 1.48837C4.125 1.07907 4.27188 0.728682 4.56563 0.437209C4.85938 0.145736 5.2125 0 5.625 0C6.0375 0 6.39063 0.145736 6.68438 0.437209C6.97813 0.728682 7.125 1.07907 7.125 1.48837C7.125 1.89767 6.97813 2.24806 6.68438 2.53954C6.39063 2.83101 6.0375 2.97674 5.625 2.97674ZM0.75 16L2.8125 5.50698L1.5 6.06512V8.55814H0V5.06047L3.9375 3.46047C4.275 3.32403 4.61875 3.30853 4.96875 3.41395C5.31875 3.51938 5.5875 3.73333 5.775 4.05581L6.4875 5.24651C6.825 5.79225 7.27813 6.23256 7.84688 6.56744C8.41563 6.90233 9.05 7.06977 9.75 7.06977V8.55814C8.925 8.55814 8.15938 8.3845 7.45312 8.03721C6.74687 7.68992 6.15 7.21861 5.6625 6.62326L5.2125 8.85581L6.75 10.3814V16H5.25V11.5349L3.6375 10.0465L2.325 16H0.75ZM11.0625 16V5.5814H8.25V0.372093H15V5.5814H12.1875V16H11.0625ZM12.0187 4.8186L13.875 2.97674L12.0187 1.13488L11.2125 1.93488L11.7 2.4186H9.375V3.53488H11.7L11.2125 4.0186L12.0187 4.8186Z" fill="#656A81"/>'
    },
    "icon-call-to-book": {
      "viewBox": "0 0 20 20",
      "body": '<g id="Icon / Phone"><path id="Vector" d="M16.646 17.5C14.8267 17.5 13.0663 17.104 11.365 16.312C9.663 15.5207 8.156 14.4687 6.844 13.156C5.53133 11.844 4.47933 10.337 3.688 8.635C2.896 6.93367 2.5 5.17333 2.5 3.354C2.5 3.118 2.58667 2.91667 2.76 2.75C2.934 2.58333 3.139 2.5 3.375 2.5H6.833C7.02767 2.5 7.198 2.56267 7.344 2.688C7.48933 2.81267 7.576 2.97233 7.604 3.167L8.188 6.146C8.21533 6.32667 8.20833 6.49333 8.167 6.646C8.125 6.79867 8.04867 6.93067 7.938 7.042L5.917 9.104C6.44433 10.0487 7.142 10.9583 8.01 11.833C8.878 12.7083 9.833 13.4583 10.875 14.083L12.833 12.083C12.9723 11.9443 13.1253 11.8507 13.292 11.802C13.4587 11.7533 13.639 11.743 13.833 11.771L16.833 12.396C17.0277 12.424 17.1873 12.5107 17.312 12.656C17.4373 12.802 17.5 12.9723 17.5 13.167V16.625C17.5 16.861 17.4167 17.066 17.25 17.24C17.0833 17.4133 16.882 17.5 16.646 17.5ZM5.083 7.438L6.396 6.125L6.042 4.25H4.292C4.36133 4.80533 4.455 5.34367 4.573 5.865C4.691 6.38567 4.861 6.91 5.083 7.438ZM15.75 15.708V13.958L13.833 13.562L12.521 14.917C13.0623 15.125 13.597 15.2917 14.125 15.417C14.653 15.5417 15.1947 15.6387 15.75 15.708Z" fill="#656A81"/></g>'
    },
    "icon-chevron-down": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M3 7.28114L10 14.3L17 7.28113L15.7055 6L10 11.7209L4.29449 6L3 7.28114Z" fill="#656A81"/>'
    },
    "icon-chevron-left": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M13.333 18.333L5 9.99999L13.333 1.66699L14.854 3.20799L8.062 9.99999L14.854 16.792L13.333 18.333Z" fill="#656A81"/>'
    },
    "icon-chevron-right": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M6.521 18.333L5 16.792L11.792 9.99999L5 3.20799L6.521 1.66699L14.854 9.99999L6.521 18.333Z" fill="#656A81"/>'
    },
    "icon-chevron-up": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M3 13.0189L10 6L17 13.0189L15.7055 14.3L10 8.57911L4.29449 14.3L3 13.0189Z" fill="#656A81"/>'
    },
    "icon-danger": {
      "viewBox": "0 0 20 17",
      "body": '<path d="M18.7812 14.2812L11.2812 1.25C10.7188 0.28125 9.25 0.25 8.6875 1.25L1.1875 14.2812C0.625 15.25 1.34375 16.5 2.5 16.5H17.4688C18.625 16.5 19.3438 15.2812 18.7812 14.2812ZM10 11.5625C10.7812 11.5625 11.4375 12.2188 11.4375 13C11.4375 13.8125 10.7812 14.4375 10 14.4375C9.1875 14.4375 8.5625 13.8125 8.5625 13C8.5625 12.2188 9.1875 11.5625 10 11.5625ZM8.625 6.40625C8.59375 6.1875 8.78125 6 9 6H10.9688C11.1875 6 11.375 6.1875 11.3438 6.40625L11.125 10.6562C11.0938 10.875 10.9375 11 10.75 11H9.21875C9.03125 11 8.875 10.875 8.84375 10.6562L8.625 6.40625Z" fill="#C71F1F"/>'
    },
    "icon-double-chevron-right": {
      "viewBox": "0 0 12 10",
      "body": '<path d="M1.062 10L0 8.938L3.938 5L0 1.062L1.062 0L6.062 5L1.062 10ZM7 10L5.938 8.938L9.875 5L5.938 1.062L7 0L12 5L7 10Z" fill="#3957EA"/>'
    },
    "icon-more": {
      "viewBox": "0 0 14 4",
      "body": '<path d="M1.95801 3.625C1.51401 3.625 1.13201 3.46533 0.812008 3.146C0.492675 2.82667 0.333008 2.44467 0.333008 2C0.333008 1.55533 0.492675 1.17333 0.812008 0.854C1.13201 0.534667 1.51401 0.375 1.95801 0.375C2.40267 0.375 2.78467 0.534667 3.10401 0.854C3.42334 1.17333 3.58301 1.55533 3.58301 2C3.58301 2.44467 3.42334 2.82667 3.10401 3.146C2.78467 3.46533 2.40267 3.625 1.95801 3.625ZM7.00001 3.625C6.55534 3.625 6.17334 3.46533 5.85401 3.146C5.53467 2.82667 5.37501 2.44467 5.37501 2C5.37501 1.55533 5.53467 1.17333 5.85401 0.854C6.17334 0.534667 6.55534 0.375 7.00001 0.375C7.44467 0.375 7.82667 0.534667 8.14601 0.854C8.46534 1.17333 8.62501 1.55533 8.62501 2C8.62501 2.44467 8.46534 2.82667 8.14601 3.146C7.82667 3.46533 7.44467 3.625 7.00001 3.625ZM12.042 3.625C11.5973 3.625 11.2153 3.46533 10.896 3.146C10.5767 2.82667 10.417 2.44467 10.417 2C10.417 1.55533 10.5767 1.17333 10.896 0.854C11.2153 0.534667 11.5973 0.375 12.042 0.375C12.486 0.375 12.868 0.534667 13.188 0.854C13.5073 1.17333 13.667 1.55533 13.667 2C13.667 2.44467 13.5073 2.82667 13.188 3.146C12.868 3.46533 12.486 3.625 12.042 3.625Z" fill="#656A81"/>'
    },
    "icon-no-dates": {
      "viewBox": "0 0 20 20",
      "body": '<g id="Icon / No Dates"><path id="Vector" d="M8.312 15.5L7.25 14.438L8.938 12.75L7.25 11.062L8.312 10L10 11.688L11.688 10L12.75 11.062L11.062 12.75L12.75 14.438L11.688 15.5L10 13.812L8.312 15.5ZM4.5 18C4.08333 18 3.72933 17.8507 3.438 17.552C3.146 17.2533 3 16.9027 3 16.5V5.5C3 5.09733 3.146 4.74667 3.438 4.448C3.72933 4.14933 4.08333 4 4.5 4H6V2H7.5V4H12.5V2H14V4H15.5C15.9167 4 16.2707 4.14933 16.562 4.448C16.854 4.74667 17 5.09733 17 5.5V16.5C17 16.9027 16.854 17.2533 16.562 17.552C16.2707 17.8507 15.9167 18 15.5 18H4.5ZM4.5 16.5H15.5V9H4.5V16.5ZM4.5 7.5H15.5V5.5H4.5V7.5Z" fill="#656A81"/></g>'
    },
    "icon-success": {
      "viewBox": "0 0 16 17",
      "body": '<path d="M15.75 8.5C15.75 4.25 12.25 0.75 8 0.75C3.71875 0.75 0.25 4.25 0.25 8.5C0.25 12.7812 3.71875 16.25 8 16.25C12.25 16.25 15.75 12.7812 15.75 8.5ZM7.09375 12.625C6.90625 12.8125 6.5625 12.8125 6.375 12.625L3.125 9.375C2.9375 9.1875 2.9375 8.84375 3.125 8.65625L3.84375 7.96875C4.03125 7.75 4.34375 7.75 4.53125 7.96875L6.75 10.1562L11.4375 5.46875C11.625 5.25 11.9375 5.25 12.125 5.46875L12.8438 6.15625C13.0312 6.34375 13.0312 6.6875 12.8438 6.875L7.09375 12.625Z" fill="#357B49"/>'
    },
    "icon-warning": {
      "viewBox": "0 0 18 18",
      "body": '<path d="M8.12499 9.79199H9.87499V4.85399H8.12499V9.79199ZM8.99999 13.188C9.23599 13.188 9.44099 13.108 9.61499 12.948C9.78833 12.788 9.87499 12.576 9.87499 12.312C9.87499 12.076 9.78833 11.8713 9.61499 11.698C9.44099 11.5247 9.23599 11.438 8.99999 11.438C8.76399 11.438 8.55899 11.5247 8.38499 11.698C8.21166 11.8713 8.12499 12.076 8.12499 12.312C8.12499 12.576 8.21166 12.788 8.38499 12.948C8.55899 13.108 8.76399 13.188 8.99999 13.188ZM8.99999 17.333C7.84733 17.333 6.76399 17.1143 5.74999 16.677C4.73599 16.2397 3.85399 15.646 3.10399 14.896C2.35399 14.146 1.76033 13.264 1.32299 12.25C0.885659 11.236 0.666992 10.1527 0.666992 8.99999C0.666992 7.84733 0.885659 6.76399 1.32299 5.74999C1.76033 4.73599 2.35399 3.85399 3.10399 3.10399C3.85399 2.35399 4.73599 1.76033 5.74999 1.32299C6.76399 0.885659 7.84733 0.666992 8.99999 0.666992C10.1527 0.666992 11.236 0.885659 12.25 1.32299C13.264 1.76033 14.146 2.35399 14.896 3.10399C15.646 3.85399 16.2397 4.73599 16.677 5.74999C17.1143 6.76399 17.333 7.84733 17.333 8.99999C17.333 10.1527 17.1143 11.236 16.677 12.25C16.2397 13.264 15.646 14.146 14.896 14.896C14.146 15.646 13.264 16.2397 12.25 16.677C11.236 17.1143 10.1527 17.333 8.99999 17.333ZM8.99999 15.583C10.8193 15.583 12.3713 14.9407 13.656 13.656C14.9407 12.3713 15.583 10.8193 15.583 8.99999C15.583 7.18066 14.9407 5.62866 13.656 4.34399C12.3713 3.05933 10.8193 2.41699 8.99999 2.41699C7.18066 2.41699 5.62866 3.05933 4.34399 4.34399C3.05933 5.62866 2.41699 7.18066 2.41699 8.99999C2.41699 10.8193 3.05933 12.3713 4.34399 13.656C5.62866 14.9407 7.18066 15.583 8.99999 15.583Z" fill="#EC8D21"/>'
    },
    "improver": {
      "viewBox": "0 0 32 32",
      "body": '<g id="Feature Icon"><path id="Vector" d="M16.001 21.7123C16.1617 21.7123 16.2957 21.6583 16.403 21.5503C16.5103 21.4423 16.564 21.308 16.564 21.1473C16.564 20.9866 16.51 20.8526 16.402 20.7453C16.294 20.638 16.1597 20.5843 15.999 20.5843C15.8383 20.5843 15.7043 20.6383 15.597 20.7463C15.4897 20.8543 15.436 20.9886 15.436 21.1493C15.436 21.31 15.49 21.444 15.598 21.5513C15.706 21.6586 15.8403 21.7123 16.001 21.7123ZM16.001 16.5653C16.1617 16.5653 16.2957 16.5113 16.403 16.4033C16.5103 16.2953 16.564 16.161 16.564 16.0003C16.564 15.8396 16.51 15.7056 16.402 15.5983C16.294 15.491 16.1597 15.4373 15.999 15.4373C15.8383 15.4373 15.7043 15.4913 15.597 15.5993C15.4897 15.7073 15.436 15.8416 15.436 16.0023C15.436 16.163 15.49 16.297 15.598 16.4043C15.706 16.5116 15.8403 16.5653 16.001 16.5653ZM16.001 11.4183C16.1617 11.4183 16.2957 11.3643 16.403 11.2563C16.5103 11.1483 16.564 11.014 16.564 10.8533C16.564 10.6926 16.51 10.5586 16.402 10.4513C16.294 10.344 16.1597 10.2903 15.999 10.2903C15.8383 10.2903 15.7043 10.3443 15.597 10.4523C15.4897 10.5603 15.436 10.6946 15.436 10.8553C15.436 11.016 15.49 11.15 15.598 11.2573C15.706 11.3646 15.8403 11.4183 16.001 11.4183ZM26.0513 25.3346H5.94867C5.42156 25.3346 4.965 25.1416 4.579 24.7556C4.193 24.3696 4 23.9131 4 23.386V20.02C4.80978 19.668 5.46744 19.1351 5.973 18.4213C6.47878 17.7077 6.73167 16.9011 6.73167 16.0013C6.73167 15.1015 6.47878 14.2911 5.973 13.57C5.46744 12.8491 4.80978 12.32 4 11.9826V8.61664C4 8.08953 4.193 7.63297 4.579 7.24697C4.965 6.86097 5.42156 6.66797 5.94867 6.66797H26.0513C26.5784 6.66797 27.035 6.86097 27.421 7.24697C27.807 7.63297 28 8.08953 28 8.61664V11.9826C27.1902 12.32 26.5326 12.8491 26.027 13.57C25.5212 14.2911 25.2683 15.1015 25.2683 16.0013C25.2683 16.9011 25.5212 17.7077 26.027 18.4213C26.5326 19.1351 27.1902 19.668 28 20.02V23.386C28 23.9131 27.807 24.3696 27.421 24.7556C27.035 25.1416 26.5784 25.3346 26.0513 25.3346ZM26.0513 24.2063C26.2907 24.2063 26.4872 24.1294 26.641 23.9756C26.7948 23.8219 26.8717 23.6253 26.8717 23.386V20.7363C26.0461 20.2223 25.3844 19.5499 24.8867 18.719C24.3891 17.8879 24.1403 16.982 24.1403 16.0013C24.1403 15.0206 24.3891 14.1147 24.8867 13.2836C25.3844 12.4527 26.0461 11.7803 26.8717 11.2663V8.61664C26.8717 8.3773 26.7948 8.18075 26.641 8.02697C26.4872 7.87319 26.2907 7.7963 26.0513 7.7963H5.94867C5.70933 7.7963 5.51278 7.87319 5.359 8.02697C5.20522 8.18075 5.12833 8.3773 5.12833 8.61664V11.2663C5.96878 11.7803 6.63411 12.4527 7.12433 13.2836C7.61456 14.1147 7.85967 15.0206 7.85967 16.0013C7.85967 16.982 7.61456 17.8879 7.12433 18.719C6.63411 19.5499 5.96878 20.2223 5.12833 20.7363V23.386C5.12833 23.6253 5.20522 23.8219 5.359 23.9756C5.51278 24.1294 5.70933 24.2063 5.94867 24.2063H26.0513Z" fill="url(#paint0_linear_3287_13929)"/></g><defs><linearGradient id="paint0_linear_3287_13929" x1="12.8" y1="10.8012" x2="28" y2="25.3346" gradientUnits="userSpaceOnUse"><stop stop-color="#6195E3"/><stop offset="1" stop-color="#A1CAF6"/></linearGradient></defs>'
    },
    "insights": {
      "viewBox": "0 0 40 40",
      "body": '<path id="paid_2" d="M19.2288 31.1133H20.6817V29.1237C21.9681 29.0604 23.1514 28.6449 24.2317 27.8771C25.3122 27.1093 25.8525 25.9587 25.8525 24.4254C25.8525 23.1774 25.4764 22.1556 24.7242 21.36C23.9722 20.5644 22.6097 19.7921 20.6367 19.0429C18.8078 18.3704 17.6244 17.7888 17.0867 17.2979C16.5489 16.8074 16.28 16.1097 16.28 15.205C16.28 14.3192 16.631 13.5796 17.3329 12.9862C18.0349 12.3929 18.9517 12.0963 20.0833 12.0963C20.9208 12.0963 21.6374 12.2833 22.2329 12.6575C22.8285 13.0319 23.3306 13.535 23.7392 14.1667L24.9788 13.6367C24.5335 12.8356 23.94 12.1882 23.1983 11.6946C22.4564 11.201 21.6453 10.921 20.765 10.8546V8.89333H19.3121V10.8546C17.8549 11.0649 16.7465 11.5819 15.9871 12.4058C15.2279 13.23 14.8483 14.1631 14.8483 15.205C14.8483 16.4267 15.2339 17.3975 16.005 18.1175C16.7758 18.8375 18.0647 19.5369 19.8717 20.2158C21.6958 20.9258 22.9172 21.5636 23.5358 22.1292C24.1544 22.6947 24.4638 23.4601 24.4638 24.4254C24.4638 25.594 24.0258 26.4521 23.15 26.9996C22.2744 27.5468 21.3099 27.8204 20.2563 27.8204C19.2571 27.8204 18.3499 27.5379 17.5346 26.9729C16.7196 26.4076 16.0813 25.6154 15.6196 24.5963L14.3333 25.1304C14.8661 26.2485 15.5372 27.1129 16.3467 27.7238C17.1561 28.3346 18.1168 28.7735 19.2288 29.0404V31.1133ZM20 35C17.9339 35 15.9919 34.6053 14.1742 33.8158C12.3564 33.0261 10.7676 31.9515 9.40792 30.5921C8.04847 29.2324 6.97389 27.6436 6.18417 25.8258C5.39472 24.0081 5 22.0661 5 20C5 17.9294 5.39472 15.9818 6.18417 14.1571C6.97389 12.3324 8.04847 10.7447 9.40792 9.39417C10.7676 8.04389 12.3564 6.97389 14.1742 6.18417C15.9919 5.39472 17.9339 5 20 5C22.0706 5 24.0182 5.39472 25.8429 6.18417C27.6676 6.97389 29.2553 8.04389 30.6058 9.39417C31.9561 10.7447 33.0261 12.3324 33.8158 14.1571C34.6053 15.9818 35 17.9294 35 20C35 22.0661 34.6053 24.0081 33.8158 25.8258C33.0261 27.6436 31.9561 29.2324 30.6058 30.5921C29.2553 31.9515 27.6676 33.0261 25.8429 33.8158C24.0182 34.6053 22.0706 35 20 35ZM20 33.5896C23.785 33.5896 26.9963 32.2699 29.6338 29.6304C32.271 26.9907 33.5896 23.7806 33.5896 20C33.5896 16.215 32.271 13.0037 29.6338 10.3662C26.9963 7.72903 23.785 6.41042 20 6.41042C16.2194 6.41042 13.0093 7.72903 10.3696 10.3662C7.73014 13.0037 6.41042 16.215 6.41042 20C6.41042 23.7806 7.73014 26.9907 10.3696 29.6304C13.0093 32.2699 16.2194 33.5896 20 33.5896Z" fill="url(#paint0_linear_3000_45586)"/><defs><linearGradient id="paint0_linear_3000_45586" x1="9" y1="10.5" x2="35" y2="35" gradientUnits="userSpaceOnUse"><stop stop-color="#537C09"/><stop offset="1" stop-color="#F4FCCD"/></linearGradient></defs>'
    },
    "manifest": {
      "viewBox": "0 0 20 20",
      "body": '<mask id="mask0_5289_88463" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20"><rect width="20" height="20" fill="#D9D9D9"/></mask><g mask="url(#mask0_5289_88463)"><path d="M16.583 17.5H4.25C3.764 17.5 3.35067 17.33 3.01 16.99C2.67 16.6493 2.5 16.236 2.5 15.75V4.25C2.5 3.764 2.67 3.35067 3.01 3.01C3.35067 2.67 3.764 2.5 4.25 2.5H16.583C17.069 2.5 17.4823 2.67 17.823 3.01C18.163 3.35067 18.333 3.764 18.333 4.25V15.75C18.333 16.236 18.163 16.6493 17.823 16.99C17.4823 17.33 17.069 17.5 16.583 17.5ZM4.25 6.646H16.583V4.25H4.25V6.646ZM6.667 8.396H4.25V15.75H6.667V8.396ZM14.167 8.396V15.75H16.583V8.396H14.167ZM12.417 8.396H8.417V15.75H12.417V8.396Z" fill="currentColor"/></g>'
    },
    "marketer": {
      "viewBox": "0 0 40 40",
      "body": '<g id="Feature Icon"><path id="Vector" d="M8.14068 18.7905L12.5961 20.6805C13.1444 19.5835 13.7455 18.5105 14.3994 17.4613C15.0533 16.4121 15.7726 15.4033 16.5573 14.4346L13.7028 13.8909C13.5319 13.8481 13.3664 13.8534 13.2061 13.9067C13.0458 13.9603 12.9015 14.0512 12.7732 14.1792L8.14068 18.7905ZM13.7069 21.563L18.6753 26.5276C20.1125 25.8481 21.5055 25.0501 22.8544 24.1334C24.2036 23.2167 25.4486 22.1878 26.5894 21.0467C28.4741 19.1623 29.8871 17.2045 30.8282 15.1734C31.7696 13.1426 32.3304 10.6499 32.5107 7.69548C29.5418 7.87548 27.0503 8.43257 25.0361 9.36673C23.0219 10.3009 21.0725 11.7103 19.1878 13.5951C18.0469 14.7359 17.0182 15.9862 16.1015 17.3459C15.1848 18.7056 14.3866 20.1113 13.7069 21.563ZM22.989 17.1922C22.5268 16.7441 22.2957 16.1934 22.2957 15.5401C22.2957 14.8865 22.5268 14.3285 22.989 13.8663C23.4512 13.4041 24.015 13.173 24.6803 13.173C25.3455 13.173 25.9093 13.4041 26.3715 13.8663C26.8337 14.3285 27.0648 14.8865 27.0648 15.5401C27.0648 16.1934 26.8337 16.7441 26.3715 17.1922C25.9093 17.6544 25.3455 17.8855 24.6803 17.8855C24.015 17.8855 23.4512 17.6544 22.989 17.1922ZM21.394 32.0759L26.0265 27.4646C26.1548 27.3363 26.2421 27.1885 26.2882 27.0213C26.3346 26.8538 26.3435 26.6917 26.3148 26.5351L25.7498 23.6805C24.7812 24.451 23.776 25.1627 22.734 25.8155C21.6918 26.4683 20.6151 27.076 19.504 27.6388L21.394 32.0759ZM33.8994 6.33548C34 9.51854 33.5229 12.3869 32.4682 14.9405C31.4137 17.4944 29.7911 19.8596 27.6003 22.0363C27.4892 22.1474 27.3851 22.2549 27.2882 22.3588C27.1915 22.4627 27.0876 22.5631 26.9765 22.6601L27.6836 26.2359C27.7547 26.649 27.7315 27.0446 27.614 27.423C27.4965 27.801 27.2961 28.1319 27.0128 28.4155L20.9015 34.5221L18.1323 27.9851L12.1994 22.0734L5.68359 19.2509L11.7657 13.1717C12.0635 12.8884 12.4021 12.6826 12.7815 12.5542C13.1607 12.4262 13.5568 12.4048 13.9698 12.4901L17.5886 13.208C17.6997 13.1113 17.7983 13.012 17.8844 12.9101C17.9705 12.8081 18.0691 12.7088 18.1803 12.6121C20.3714 10.421 22.7397 8.80201 25.2853 7.75506C27.8308 6.70812 30.7022 6.23493 33.8994 6.33548ZM8.43484 26.8992C9.08651 26.2334 9.87512 25.9078 10.8007 25.9226C11.7262 25.937 12.5219 26.2701 13.1878 26.9217C13.8394 27.5734 14.1637 28.362 14.1607 29.2876C14.1573 30.2134 13.8298 31.0092 13.1782 31.6751C12.5935 32.2456 11.6948 32.7306 10.4823 33.1301C9.26957 33.5298 7.81457 33.8087 6.11734 33.9667C6.2754 32.2695 6.55498 30.8099 6.95609 29.588C7.35693 28.366 7.84984 27.4698 8.43484 26.8992ZM9.42068 27.9422C9.06901 28.3124 8.74859 28.8827 8.45943 29.653C8.16998 30.4233 7.96484 31.2931 7.84401 32.2626C8.81318 32.1273 9.6829 31.9138 10.4532 31.6222C11.2237 31.3305 11.7941 31.0016 12.1644 30.6355C12.5561 30.2666 12.7541 29.8153 12.7586 29.2817C12.7628 28.7484 12.5711 28.2859 12.1836 27.8942C11.7919 27.5067 11.3293 27.3199 10.7957 27.3338C10.2623 27.3477 9.80401 27.5505 9.42068 27.9422Z" fill="url(#paint0_linear_3287_13767)"/></g><defs><linearGradient id="paint0_linear_3287_13767" x1="12.9998" y1="10.501" x2="33.9126" y2="34.5222" gradientUnits="userSpaceOnUse"><stop stop-color="#107E64"/><stop offset="1" stop-color="#A1F1CF"/></linearGradient></defs>'
    },
    "peek-site": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M15.0003 15.666H4.33366C3.93366 15.666 3.66699 15.3993 3.66699 14.9993V4.33269C3.66699 3.93269 3.93366 3.66602 4.33366 3.66602H15.0003C15.4003 3.66602 15.667 3.93269 15.667 4.33269V14.9993C15.667 15.3993 15.4003 15.666 15.0003 15.666Z" fill="#FFF200"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4.33333 4.33334V15H15V4.33334H4.33333ZM3.37859 3.3786C3.63711 3.12008 3.98183 3 4.33333 3H15C15.3515 3 15.6962 3.12008 15.9547 3.3786C16.2133 3.63712 16.3333 3.98184 16.3333 4.33334V15C16.3333 15.3515 16.2133 15.6962 15.9547 15.9547C15.6962 16.2132 15.3515 16.3333 15 16.3333H4.33333C3.98183 16.3333 3.63711 16.2132 3.37859 15.9547C3.12007 15.6962 3 15.3515 3 15V4.33334C3 3.98184 3.12007 3.63712 3.37859 3.3786Z" fill="#FFF400"/><path d="M6.33366 13.6653C6.70185 13.6653 7.00032 13.3669 7.00032 12.9987C7.00032 12.6305 6.70185 12.332 6.33366 12.332C5.96547 12.332 5.66699 12.6305 5.66699 12.9987C5.66699 13.3669 5.96547 13.6653 6.33366 13.6653Z" fill="#151515"/><path d="M8.55631 13.6653C8.9245 13.6653 9.22298 13.3669 9.22298 12.9987C9.22298 12.6305 8.9245 12.332 8.55631 12.332C8.18812 12.332 7.88965 12.6305 7.88965 12.9987C7.88965 13.3669 8.18812 13.6653 8.55631 13.6653Z" fill="#151515"/><path d="M10.778 13.6653C11.1462 13.6653 11.4447 13.3669 11.4447 12.9987C11.4447 12.6305 11.1462 12.332 10.778 12.332C10.4098 12.332 10.1113 12.6305 10.1113 12.9987C10.1113 13.3669 10.4098 13.6653 10.778 13.6653Z" fill="#151515"/><path d="M13.0007 13.6653C13.3688 13.6653 13.6673 13.3669 13.6673 12.9987C13.6673 12.6305 13.3688 12.332 13.0007 12.332C12.6325 12.332 12.334 12.6305 12.334 12.9987C12.334 13.3669 12.6325 13.6653 13.0007 13.6653Z" fill="#151515"/>'
    },
    "receipt": {
      "viewBox": "0 0 20 20",
      "body": '<mask id="path-1-inside-1_5289_88370" fill="white"><path d="M5.083 18.333C4.361 18.333 3.75333 18.0867 3.26 17.594C2.76733 17.1007 2.521 16.493 2.521 15.771V13.083H4.979V1.66699L6.229 2.91699L7.479 1.66699L8.729 2.91699L9.979 1.66699L11.229 2.91699L12.479 1.66699L13.729 2.91699L14.979 1.66699L16.229 2.91699L17.479 1.66699V15.771C17.479 16.493 17.2327 17.1007 16.74 17.594C16.2467 18.0867 15.639 18.333 14.917 18.333H5.083ZM14.917 16.583C15.153 16.583 15.3473 16.5067 15.5 16.354C15.6527 16.2013 15.729 16.007 15.729 15.771V4.22899H6.729V13.083H14.104V15.771C14.104 16.007 14.1803 16.2013 14.333 16.354C14.4857 16.5067 14.6803 16.583 14.917 16.583ZM7.479 7.58299V5.83299H12.5V7.58299H7.479ZM7.479 10.104V8.35399H12.5V10.104H7.479ZM14.146 7.58299C13.91 7.58299 13.705 7.49633 13.531 7.32299C13.3577 7.14899 13.271 6.94399 13.271 6.70799C13.271 6.47199 13.3577 6.26733 13.531 6.09399C13.705 5.91999 13.91 5.83299 14.146 5.83299C14.382 5.83299 14.5867 5.91999 14.76 6.09399C14.934 6.26733 15.021 6.47199 15.021 6.70799C15.021 6.94399 14.934 7.14899 14.76 7.32299C14.5867 7.49633 14.382 7.58299 14.146 7.58299ZM14.146 10.104C13.91 10.104 13.705 10.0173 13.531 9.84399C13.3577 9.66999 13.271 9.46499 13.271 9.22899C13.271 8.99299 13.3577 8.78833 13.531 8.61499C13.705 8.44099 13.91 8.35399 14.146 8.35399C14.382 8.35399 14.5867 8.44099 14.76 8.61499C14.934 8.78833 15.021 8.99299 15.021 9.22899C15.021 9.46499 14.934 9.66999 14.76 9.84399C14.5867 10.0173 14.382 10.104 14.146 10.104ZM5.083 16.583H12.354V14.833H4.271V15.771C4.271 16.007 4.34733 16.2013 4.5 16.354C4.65267 16.5067 4.847 16.583 5.083 16.583ZM4.271 16.583C4.271 16.583 4.271 16.5067 4.271 16.354C4.271 16.2013 4.271 16.007 4.271 15.771V14.833V16.583Z"/></mask><path d="M5.083 18.333C4.361 18.333 3.75333 18.0867 3.26 17.594C2.76733 17.1007 2.521 16.493 2.521 15.771V13.083H4.979V1.66699L6.229 2.91699L7.479 1.66699L8.729 2.91699L9.979 1.66699L11.229 2.91699L12.479 1.66699L13.729 2.91699L14.979 1.66699L16.229 2.91699L17.479 1.66699V15.771C17.479 16.493 17.2327 17.1007 16.74 17.594C16.2467 18.0867 15.639 18.333 14.917 18.333H5.083ZM14.917 16.583C15.153 16.583 15.3473 16.5067 15.5 16.354C15.6527 16.2013 15.729 16.007 15.729 15.771V4.22899H6.729V13.083H14.104V15.771C14.104 16.007 14.1803 16.2013 14.333 16.354C14.4857 16.5067 14.6803 16.583 14.917 16.583ZM7.479 7.58299V5.83299H12.5V7.58299H7.479ZM7.479 10.104V8.35399H12.5V10.104H7.479ZM14.146 7.58299C13.91 7.58299 13.705 7.49633 13.531 7.32299C13.3577 7.14899 13.271 6.94399 13.271 6.70799C13.271 6.47199 13.3577 6.26733 13.531 6.09399C13.705 5.91999 13.91 5.83299 14.146 5.83299C14.382 5.83299 14.5867 5.91999 14.76 6.09399C14.934 6.26733 15.021 6.47199 15.021 6.70799C15.021 6.94399 14.934 7.14899 14.76 7.32299C14.5867 7.49633 14.382 7.58299 14.146 7.58299ZM14.146 10.104C13.91 10.104 13.705 10.0173 13.531 9.84399C13.3577 9.66999 13.271 9.46499 13.271 9.22899C13.271 8.99299 13.3577 8.78833 13.531 8.61499C13.705 8.44099 13.91 8.35399 14.146 8.35399C14.382 8.35399 14.5867 8.44099 14.76 8.61499C14.934 8.78833 15.021 8.99299 15.021 9.22899C15.021 9.46499 14.934 9.66999 14.76 9.84399C14.5867 10.0173 14.382 10.104 14.146 10.104ZM5.083 16.583H12.354V14.833H4.271V15.771C4.271 16.007 4.34733 16.2013 4.5 16.354C4.65267 16.5067 4.847 16.583 5.083 16.583ZM4.271 16.583C4.271 16.583 4.271 16.5067 4.271 16.354C4.271 16.2013 4.271 16.007 4.271 15.771V14.833V16.583Z" fill="currentColor"/><path d="M3.771 14.833V15.771H4.771V14.833H3.771ZM3.26 17.594L2.55241 18.3006L2.55337 18.3016L3.26 17.594ZM2.521 13.083V12.083H1.521V13.083H2.521ZM4.979 13.083V14.083H5.979V13.083H4.979ZM4.979 1.66699L5.68611 0.959885L3.979 -0.747221V1.66699H4.979ZM6.229 2.91699L5.52189 3.6241L6.229 4.33121L6.93611 3.6241L6.229 2.91699ZM7.479 1.66699L8.18611 0.959885L7.479 0.252779L6.77189 0.959885L7.479 1.66699ZM8.729 2.91699L8.02189 3.6241L8.729 4.33121L9.43611 3.6241L8.729 2.91699ZM9.979 1.66699L10.6861 0.959885L9.979 0.252779L9.27189 0.959885L9.979 1.66699ZM11.229 2.91699L10.5219 3.6241L11.229 4.33121L11.9361 3.6241L11.229 2.91699ZM12.479 1.66699L13.1861 0.959885L12.479 0.252779L11.7719 0.959885L12.479 1.66699ZM13.729 2.91699L13.0219 3.6241L13.729 4.33121L14.4361 3.6241L13.729 2.91699ZM14.979 1.66699L15.6861 0.959885L14.979 0.252779L14.2719 0.959885L14.979 1.66699ZM16.229 2.91699L15.5219 3.6241L16.229 4.33121L16.9361 3.6241L16.229 2.91699ZM17.479 1.66699H18.479V-0.747221L16.7719 0.959885L17.479 1.66699ZM16.74 17.594L17.4466 18.3016L17.4476 18.3006L16.74 17.594ZM15.729 4.22899H16.729V3.22899H15.729V4.22899ZM6.729 4.22899V3.22899H5.729V4.22899H6.729ZM6.729 13.083H5.729V14.083H6.729V13.083ZM14.104 13.083H15.104V12.083H14.104V13.083ZM7.479 7.58299H6.479V8.58299H7.479V7.58299ZM7.479 5.83299V4.83299H6.479V5.83299H7.479ZM12.5 5.83299H13.5V4.83299H12.5V5.83299ZM12.5 7.58299V8.58299H13.5V7.58299H12.5ZM7.479 10.104H6.479V11.104H7.479V10.104ZM7.479 8.35399V7.35399H6.479V8.35399H7.479ZM12.5 8.35399H13.5V7.35399H12.5V8.35399ZM12.5 10.104V11.104H13.5V10.104H12.5ZM13.531 7.32299L12.8225 8.02875L12.8253 8.03146L13.531 7.32299ZM14.76 6.09399L14.0515 6.79975L14.0543 6.80245L14.76 6.09399ZM13.531 9.84399L12.8225 10.5497L12.8253 10.5525L13.531 9.84399ZM14.76 8.61499L14.0515 9.32075L14.0543 9.32345L14.76 8.61499ZM12.354 16.583V17.583H13.354V16.583H12.354ZM12.354 14.833H13.354V13.833H12.354V14.833ZM4.271 14.833V13.833H3.271V14.833H4.271ZM5.083 17.333C4.61546 17.333 4.26515 17.1845 3.96663 16.8864L2.55337 18.3016C3.24152 18.9888 4.10654 19.333 5.083 19.333V17.333ZM3.96758 16.8874C3.66947 16.5888 3.521 16.2385 3.521 15.771H1.521C1.521 16.7475 1.8652 17.6125 2.55242 18.3006L3.96758 16.8874ZM3.521 15.771V13.083H1.521V15.771H3.521ZM2.521 14.083H4.979V12.083H2.521V14.083ZM5.979 13.083V1.66699H3.979V13.083H5.979ZM4.27189 2.3741L5.52189 3.6241L6.93611 2.20989L5.68611 0.959885L4.27189 2.3741ZM6.93611 3.6241L8.18611 2.3741L6.77189 0.959885L5.52189 2.20989L6.93611 3.6241ZM6.77189 2.3741L8.02189 3.6241L9.43611 2.20989L8.18611 0.959885L6.77189 2.3741ZM9.43611 3.6241L10.6861 2.3741L9.27189 0.959885L8.02189 2.20989L9.43611 3.6241ZM9.27189 2.3741L10.5219 3.6241L11.9361 2.20989L10.6861 0.959885L9.27189 2.3741ZM11.9361 3.6241L13.1861 2.3741L11.7719 0.959885L10.5219 2.20989L11.9361 3.6241ZM11.7719 2.3741L13.0219 3.6241L14.4361 2.20989L13.1861 0.959885L11.7719 2.3741ZM14.4361 3.6241L15.6861 2.3741L14.2719 0.959885L13.0219 2.20989L14.4361 3.6241ZM14.2719 2.3741L15.5219 3.6241L16.9361 2.20989L15.6861 0.959885L14.2719 2.3741ZM16.9361 3.6241L18.1861 2.3741L16.7719 0.959885L15.5219 2.20989L16.9361 3.6241ZM16.479 1.66699V15.771H18.479V1.66699H16.479ZM16.479 15.771C16.479 16.2385 16.3305 16.5888 16.0324 16.8874L17.4476 18.3006C18.1348 17.6125 18.479 16.7475 18.479 15.771H16.479ZM16.0334 16.8864C15.7349 17.1845 15.3845 17.333 14.917 17.333V19.333C15.8935 19.333 16.7585 18.9888 17.4466 18.3016L16.0334 16.8864ZM14.917 17.333H5.083V19.333H14.917V17.333ZM14.917 17.583C15.391 17.583 15.8485 17.4197 16.2071 17.0611L14.7929 15.6469C14.8104 15.6294 14.8389 15.6088 14.8741 15.595C14.9076 15.5818 14.9261 15.583 14.917 15.583V17.583ZM16.2071 17.0611C16.5657 16.7025 16.729 16.245 16.729 15.771H14.729C14.729 15.7801 14.7278 15.7616 14.741 15.7281C14.7548 15.6929 14.7754 15.6644 14.7929 15.6469L16.2071 17.0611ZM16.729 15.771V4.22899H14.729V15.771H16.729ZM15.729 3.22899H6.729V5.22899H15.729V3.22899ZM5.729 4.22899V13.083H7.729V4.22899H5.729ZM6.729 14.083H14.104V12.083H6.729V14.083ZM13.104 13.083V15.771H15.104V13.083H13.104ZM13.104 15.771C13.104 16.245 13.2673 16.7025 13.6259 17.0611L15.0401 15.6469C15.0576 15.6644 15.0782 15.6929 15.092 15.7281C15.1052 15.7616 15.104 15.7801 15.104 15.771H13.104ZM13.6259 17.0611C13.985 17.4202 14.4432 17.583 14.917 17.583V15.583C14.9072 15.583 14.9253 15.5817 14.9586 15.5948C14.9936 15.6085 15.0223 15.6291 15.0401 15.6469L13.6259 17.0611ZM8.479 7.58299V5.83299H6.479V7.58299H8.479ZM7.479 6.83299H12.5V4.83299H7.479V6.83299ZM11.5 5.83299V7.58299H13.5V5.83299H11.5ZM12.5 6.58299H7.479V8.58299H12.5V6.58299ZM8.479 10.104V8.35399H6.479V10.104H8.479ZM7.479 9.35399H12.5V7.35399H7.479V9.35399ZM11.5 8.35399V10.104H13.5V8.35399H11.5ZM12.5 9.10399H7.479V11.104H12.5V9.10399ZM14.146 6.58299C14.1536 6.58299 14.1766 6.58507 14.2046 6.59692C14.2319 6.60845 14.2423 6.62008 14.2367 6.61453L12.8253 8.03146C13.1782 8.38303 13.6337 8.58299 14.146 8.58299V6.58299ZM14.2395 6.61724C14.2339 6.61167 14.2455 6.62208 14.2571 6.64935C14.2689 6.67739 14.271 6.70042 14.271 6.70799H12.271C12.271 7.22031 12.471 7.67582 12.8225 8.02874L14.2395 6.61724ZM14.271 6.70799C14.271 6.71556 14.2689 6.73889 14.2568 6.76743C14.2451 6.79522 14.233 6.80616 14.2381 6.8011L12.8239 5.38689C12.4711 5.73966 12.271 6.19554 12.271 6.70799H14.271ZM14.2381 6.8011C14.2439 6.79535 14.2334 6.80709 14.2059 6.81878C14.1776 6.83081 14.1541 6.83299 14.146 6.83299V4.83299C13.6324 4.83299 13.1765 5.03427 12.8239 5.38689L14.2381 6.8011ZM14.146 6.83299C14.1379 6.83299 14.1141 6.83081 14.0853 6.81855C14.0572 6.80662 14.0463 6.79449 14.0515 6.79974L15.4685 5.38824C15.116 5.03443 14.6597 4.83299 14.146 4.83299V6.83299ZM14.0543 6.80245C14.0595 6.80769 14.0474 6.79675 14.0354 6.7687C14.0232 6.73985 14.021 6.71607 14.021 6.70799H16.021C16.021 6.19428 15.8196 5.73799 15.4657 5.38553L14.0543 6.80245ZM14.021 6.70799C14.021 6.6999 14.0232 6.67643 14.0352 6.64808C14.0469 6.62055 14.0586 6.61014 14.0529 6.61589L15.4671 8.0301C15.8197 7.67749 16.021 7.22157 16.021 6.70799H14.021ZM14.0529 6.61589C14.0478 6.62094 14.0588 6.60892 14.0866 6.59715C14.1151 6.58506 14.1384 6.58299 14.146 6.58299V8.58299C14.6585 8.58299 15.1143 8.38287 15.4671 8.0301L14.0529 6.61589ZM14.146 9.10399C14.1536 9.10399 14.1766 9.10607 14.2046 9.11792C14.2319 9.12945 14.2423 9.14108 14.2367 9.13553L12.8253 10.5525C13.1782 10.904 13.6337 11.104 14.146 11.104V9.10399ZM14.2395 9.13824C14.2339 9.13267 14.2455 9.14308 14.2571 9.17035C14.2689 9.19839 14.271 9.22142 14.271 9.22899H12.271C12.271 9.74131 12.471 10.1968 12.8225 10.5497L14.2395 9.13824ZM14.271 9.22899C14.271 9.23656 14.2689 9.25989 14.2568 9.28843C14.2451 9.31622 14.233 9.32716 14.2381 9.3221L12.8239 7.90789C12.4711 8.26066 12.271 8.71654 12.271 9.22899H14.271ZM14.2381 9.3221C14.2439 9.31635 14.2334 9.32809 14.2059 9.33978C14.1776 9.35181 14.1541 9.35399 14.146 9.35399V7.35399C13.6324 7.35399 13.1765 7.55527 12.8239 7.90789L14.2381 9.3221ZM14.146 9.35399C14.1379 9.35399 14.1141 9.35181 14.0853 9.33955C14.0572 9.32762 14.0463 9.31549 14.0515 9.32074L15.4685 7.90924C15.116 7.55543 14.6597 7.35399 14.146 7.35399V9.35399ZM14.0543 9.32345C14.0595 9.32869 14.0474 9.31775 14.0354 9.2897C14.0232 9.26085 14.021 9.23707 14.021 9.22899H16.021C16.021 8.71528 15.8196 8.25899 15.4657 7.90653L14.0543 9.32345ZM14.021 9.22899C14.021 9.2209 14.0232 9.19743 14.0352 9.16908C14.0469 9.14155 14.0586 9.13114 14.0529 9.13689L15.4671 10.5511C15.8197 10.1985 16.021 9.74257 16.021 9.22899H14.021ZM14.0529 9.13689C14.0478 9.14194 14.0588 9.12992 14.0866 9.11815C14.1151 9.10606 14.1384 9.10399 14.146 9.10399V11.104C14.6585 11.104 15.1143 10.9039 15.4671 10.5511L14.0529 9.13689ZM5.083 17.583H12.354V15.583H5.083V17.583ZM13.354 16.583V14.833H11.354V16.583H13.354ZM12.354 13.833H4.271V15.833H12.354V13.833ZM3.271 15.771C3.271 16.245 3.43431 16.7025 3.79289 17.0611L5.20711 15.6469C5.22462 15.6644 5.24518 15.6929 5.25902 15.7281C5.27217 15.7616 5.271 15.7801 5.271 15.771H3.271ZM3.79289 17.0611C4.15147 17.4197 4.60895 17.583 5.083 17.583V15.583C5.07393 15.583 5.09237 15.5818 5.12585 15.595C5.16108 15.6088 5.18959 15.6294 5.20711 15.6469L3.79289 17.0611ZM4.271 16.583C5.271 16.583 5.271 16.583 5.271 16.583C5.271 16.583 5.271 16.583 5.271 16.583C5.271 16.583 5.271 16.583 5.271 16.583C5.271 16.583 5.271 16.583 5.271 16.583C5.271 16.583 5.271 16.583 5.271 16.583C5.271 16.583 5.271 16.583 5.271 16.583C5.271 16.583 5.271 16.583 5.271 16.5829C5.271 16.5829 5.271 16.5829 5.271 16.5829C5.271 16.5829 5.271 16.5829 5.271 16.5829C5.271 16.5829 5.271 16.5829 5.271 16.5829C5.271 16.5829 5.271 16.5829 5.271 16.5829C5.271 16.5829 5.271 16.5829 5.271 16.5829C5.271 16.5829 5.271 16.5829 5.271 16.5828C5.271 16.5828 5.271 16.5828 5.271 16.5828C5.271 16.5828 5.271 16.5828 5.271 16.5828C5.271 16.5828 5.271 16.5828 5.271 16.5828C5.271 16.5828 5.271 16.5828 5.271 16.5827C5.271 16.5827 5.271 16.5827 5.271 16.5827C5.271 16.5827 5.271 16.5827 5.271 16.5827C5.271 16.5827 5.271 16.5827 5.271 16.5826C5.271 16.5826 5.271 16.5826 5.271 16.5826C5.271 16.5826 5.271 16.5826 5.271 16.5826C5.271 16.5826 5.271 16.5825 5.271 16.5825C5.271 16.5825 5.271 16.5825 5.271 16.5825C5.271 16.5825 5.271 16.5825 5.271 16.5824C5.271 16.5824 5.271 16.5824 5.271 16.5824C5.271 16.5824 5.271 16.5824 5.271 16.5824C5.271 16.5823 5.271 16.5823 5.271 16.5823C5.271 16.5823 5.271 16.5823 5.271 16.5823C5.271 16.5822 5.271 16.5822 5.271 16.5822C5.271 16.5822 5.271 16.5822 5.271 16.5822C5.271 16.5821 5.271 16.5821 5.271 16.5821C5.271 16.5821 5.271 16.5821 5.271 16.582C5.271 16.582 5.271 16.582 5.271 16.582C5.271 16.582 5.271 16.5819 5.271 16.5819C5.271 16.5819 5.271 16.5819 5.271 16.5819C5.271 16.5818 5.271 16.5818 5.271 16.5818C5.271 16.5818 5.271 16.5818 5.271 16.5817C5.271 16.5817 5.271 16.5817 5.271 16.5817C5.271 16.5816 5.271 16.5816 5.271 16.5816C5.271 16.5816 5.271 16.5815 5.271 16.5815C5.271 16.5815 5.271 16.5815 5.271 16.5815C5.271 16.5814 5.271 16.5814 5.271 16.5814C5.271 16.5814 5.271 16.5813 5.271 16.5813C5.271 16.5813 5.271 16.5813 5.271 16.5812C5.271 16.5812 5.271 16.5812 5.271 16.5811C5.271 16.5811 5.271 16.5811 5.271 16.5811C5.271 16.581 5.271 16.581 5.271 16.581C5.271 16.581 5.271 16.5809 5.271 16.5809C5.271 16.5809 5.271 16.5808 5.271 16.5808C5.271 16.5808 5.271 16.5808 5.271 16.5807C5.271 16.5807 5.271 16.5807 5.271 16.5806C5.271 16.5806 5.271 16.5806 5.271 16.5805C5.271 16.5805 5.271 16.5805 5.271 16.5804C5.271 16.5804 5.271 16.5804 5.271 16.5803C5.271 16.5803 5.271 16.5803 5.271 16.5803C5.271 16.5802 5.271 16.5802 5.271 16.5802C5.271 16.5801 5.271 16.5801 5.271 16.5801C5.271 16.58 5.271 16.58 5.271 16.58C5.271 16.5799 5.271 16.5799 5.271 16.5798C5.271 16.5798 5.271 16.5798 5.271 16.5797C5.271 16.5797 5.271 16.5797 5.271 16.5796C5.271 16.5796 5.271 16.5796 5.271 16.5795C5.271 16.5795 5.271 16.5795 5.271 16.5794C5.271 16.5794 5.271 16.5793 5.271 16.5793C5.271 16.5793 5.271 16.5792 5.271 16.5792C5.271 16.5791 5.271 16.5791 5.271 16.5791C5.271 16.579 5.271 16.579 5.271 16.579C5.271 16.5789 5.271 16.5789 5.271 16.5788C5.271 16.5788 5.271 16.5788 5.271 16.5787C5.271 16.5787 5.271 16.5786 5.271 16.5786C5.271 16.5785 5.271 16.5785 5.271 16.5785C5.271 16.5784 5.271 16.5784 5.271 16.5783C5.271 16.5783 5.271 16.5783 5.271 16.5782C5.271 16.5782 5.271 16.5781 5.271 16.5781C5.271 16.578 5.271 16.578 5.271 16.5779C5.271 16.5779 5.271 16.5779 5.271 16.5778C5.271 16.5778 5.271 16.5777 5.271 16.5777C5.271 16.5776 5.271 16.5776 5.271 16.5775C5.271 16.5775 5.271 16.5774 5.271 16.5774C5.271 16.5774 5.271 16.5773 5.271 16.5773C5.271 16.5772 5.271 16.5772 5.271 16.5771C5.271 16.5771 5.271 16.577 5.271 16.577C5.271 16.5769 5.271 16.5769 5.271 16.5768C5.271 16.5768 5.271 16.5767 5.271 16.5767C5.271 16.5766 5.271 16.5766 5.271 16.5765C5.271 16.5765 5.271 16.5764 5.271 16.5764C5.271 16.5763 5.271 16.5763 5.271 16.5762C5.271 16.5762 5.271 16.5761 5.271 16.5761C5.271 16.576 5.271 16.576 5.271 16.5759C5.271 16.5759 5.271 16.5758 5.271 16.5758C5.271 16.5757 5.271 16.5757 5.271 16.5756C5.271 16.5755 5.271 16.5755 5.271 16.5754C5.271 16.5754 5.271 16.5753 5.271 16.5753C5.271 16.5752 5.271 16.5752 5.271 16.5751C5.271 16.5751 5.271 16.575 5.271 16.5749C5.271 16.5749 5.271 16.5748 5.271 16.5748C5.271 16.5747 5.271 16.5747 5.271 16.5746C5.271 16.5745 5.271 16.5745 5.271 16.5744C5.271 16.5744 5.271 16.5743 5.271 16.5743C5.271 16.5742 5.271 16.5741 5.271 16.5741C5.271 16.574 5.271 16.574 5.271 16.5739C5.271 16.5738 5.271 16.5738 5.271 16.5737C5.271 16.5737 5.271 16.5736 5.271 16.5735C5.271 16.5735 5.271 16.5734 5.271 16.5734C5.271 16.5733 5.271 16.5732 5.271 16.5732C5.271 16.5731 5.271 16.5731 5.271 16.573C5.271 16.5729 5.271 16.5729 5.271 16.5728C5.271 16.5727 5.271 16.5727 5.271 16.5726C5.271 16.5725 5.271 16.5725 5.271 16.5724C5.271 16.5724 5.271 16.5723 5.271 16.5722C5.271 16.5722 5.271 16.5721 5.271 16.572C5.271 16.572 5.271 16.5719 5.271 16.5718C5.271 16.5718 5.271 16.5717 5.271 16.5716C5.271 16.5716 5.271 16.5715 5.271 16.5714C5.271 16.5714 5.271 16.5713 5.271 16.5712C5.271 16.5712 5.271 16.5711 5.271 16.571C5.271 16.571 5.271 16.5709 5.271 16.5708C5.271 16.5708 5.271 16.5707 5.271 16.5706C5.271 16.5706 5.271 16.5705 5.271 16.5704C5.271 16.5703 5.271 16.5703 5.271 16.5702C5.271 16.5701 5.271 16.5701 5.271 16.57C5.271 16.5699 5.271 16.5698 5.271 16.5698C5.271 16.5697 5.271 16.5696 5.271 16.5696C5.271 16.5695 5.271 16.5694 5.271 16.5693C5.271 16.5693 5.271 16.5692 5.271 16.5691C5.271 16.5691 5.271 16.569 5.271 16.5689C5.271 16.5688 5.271 16.5688 5.271 16.5687C5.271 16.5686 5.271 16.5685 5.271 16.5685C5.271 16.5684 5.271 16.5683 5.271 16.5682C5.271 16.5682 5.271 16.5681 5.271 16.568C5.271 16.5679 5.271 16.5678 5.271 16.5678C5.271 16.5677 5.271 16.5676 5.271 16.5675C5.271 16.5675 5.271 16.5674 5.271 16.5673C5.271 16.5672 5.271 16.5672 5.271 16.5671C5.271 16.567 5.271 16.5669 5.271 16.5668C5.271 16.5668 5.271 16.5667 5.271 16.5666C5.271 16.5665 5.271 16.5664 5.271 16.5664C5.271 16.5663 5.271 16.5662 5.271 16.5661C5.271 16.566 5.271 16.566 5.271 16.5659C5.271 16.5658 5.271 16.5657 5.271 16.5656C5.271 16.5655 5.271 16.5655 5.271 16.5654C5.271 16.5653 5.271 16.5652 5.271 16.5651C5.271 16.565 5.271 16.565 5.271 16.5649C5.271 16.5648 5.271 16.5647 5.271 16.5646C5.271 16.5645 5.271 16.5645 5.271 16.5644C5.271 16.5643 5.271 16.5642 5.271 16.5641C5.271 16.564 5.271 16.5639 5.271 16.5639C5.271 16.5638 5.271 16.5637 5.271 16.5636C5.271 16.5635 5.271 16.5634 5.271 16.5633C5.271 16.5632 5.271 16.5632 5.271 16.5631C5.271 16.563 5.271 16.5629 5.271 16.5628C5.271 16.5627 5.271 16.5626 5.271 16.5625C5.271 16.5625 5.271 16.5624 5.271 16.5623C5.271 16.5622 5.271 16.5621 5.271 16.562C5.271 16.5619 5.271 16.5618 5.271 16.5617C5.271 16.5616 5.271 16.5616 5.271 16.5615C5.271 16.5614 5.271 16.5613 5.271 16.5612C5.271 16.5611 5.271 16.561 5.271 16.5609C5.271 16.5608 5.271 16.5607 5.271 16.5606C5.271 16.5605 5.271 16.5604 5.271 16.5603C5.271 16.5603 5.271 16.5602 5.271 16.5601C5.271 16.56 5.271 16.5599 5.271 16.5598C5.271 16.5597 5.271 16.5596 5.271 16.5595C5.271 16.5594 5.271 16.5593 5.271 16.5592C5.271 16.5591 5.271 16.559 5.271 16.5589C5.271 16.5588 5.271 16.5587 5.271 16.5586C5.271 16.5585 5.271 16.5584 5.271 16.5583C5.271 16.5582 5.271 16.5581 5.271 16.558C5.271 16.5579 5.271 16.5578 5.271 16.5577C5.271 16.5576 5.271 16.5575 5.271 16.5574C5.271 16.5573 5.271 16.5572 5.271 16.5571C5.271 16.557 5.271 16.5569 5.271 16.5568C5.271 16.5567 5.271 16.5566 5.271 16.5565C5.271 16.5564 5.271 16.5563 5.271 16.5562C5.271 16.5561 5.271 16.556 5.271 16.5559C5.271 16.5558 5.271 16.5557 5.271 16.5556C5.271 16.5555 5.271 16.5554 5.271 16.5553C5.271 16.5552 5.271 16.5551 5.271 16.555C5.271 16.5549 5.271 16.5548 5.271 16.5547C5.271 16.5546 5.271 16.5545 5.271 16.5544C5.271 16.5543 5.271 16.5542 5.271 16.5541C5.271 16.554 5.271 16.5538 5.271 16.5537C5.271 16.5536 5.271 16.5535 5.271 16.5534C5.271 16.5533 5.271 16.5532 5.271 16.5531C5.271 16.553 5.271 16.5529 5.271 16.5528C5.271 16.5527 5.271 16.5526 5.271 16.5524C5.271 16.5523 5.271 16.5522 5.271 16.5521C5.271 16.552 5.271 16.5519 5.271 16.5518C5.271 16.5517 5.271 16.5516 5.271 16.5515C5.271 16.5513 5.271 16.5512 5.271 16.5511C5.271 16.551 5.271 16.5509 5.271 16.5508C5.271 16.5507 5.271 16.5506 5.271 16.5505C5.271 16.5503 5.271 16.5502 5.271 16.5501C5.271 16.55 5.271 16.5499 5.271 16.5498C5.271 16.5497 5.271 16.5495 5.271 16.5494C5.271 16.5493 5.271 16.5492 5.271 16.5491C5.271 16.549 5.271 16.5489 5.271 16.5487C5.271 16.5486 5.271 16.5485 5.271 16.5484C5.271 16.5483 5.271 16.5482 5.271 16.548C5.271 16.5479 5.271 16.5478 5.271 16.5477C5.271 16.5476 5.271 16.5475 5.271 16.5473C5.271 16.5472 5.271 16.5471 5.271 16.547C5.271 16.5469 5.271 16.5468 5.271 16.5466C5.271 16.5465 5.271 16.5464 5.271 16.5463C5.271 16.5462 5.271 16.546 5.271 16.5459C5.271 16.5458 5.271 16.5457 5.271 16.5456C5.271 16.5454 5.271 16.5453 5.271 16.5452C5.271 16.5451 5.271 16.545 5.271 16.5448C5.271 16.5447 5.271 16.5446 5.271 16.5445C5.271 16.5443 5.271 16.5442 5.271 16.5441C5.271 16.544 5.271 16.5439 5.271 16.5437C5.271 16.5436 5.271 16.5435 5.271 16.5434C5.271 16.5432 5.271 16.5431 5.271 16.543C5.271 16.5429 5.271 16.5427 5.271 16.5426C5.271 16.5425 5.271 16.5424 5.271 16.5422C5.271 16.5421 5.271 16.542 5.271 16.5419C5.271 16.5417 5.271 16.5416 5.271 16.5415C5.271 16.5414 5.271 16.5412 5.271 16.5411C5.271 16.541 5.271 16.5408 5.271 16.5407C5.271 16.5406 5.271 16.5405 5.271 16.5403C5.271 16.5402 5.271 16.5401 5.271 16.5399C5.271 16.5398 5.271 16.5397 5.271 16.5396C5.271 16.5394 5.271 16.5393 5.271 16.5392C5.271 16.539 5.271 16.5389 5.271 16.5388C5.271 16.5386 5.271 16.5385 5.271 16.5384C5.271 16.5382 5.271 16.5381 5.271 16.538C5.271 16.5378 5.271 16.5377 5.271 16.5376C5.271 16.5374 5.271 16.5373 5.271 16.5372C5.271 16.537 5.271 16.5369 5.271 16.5368C5.271 16.5366 5.271 16.5365 5.271 16.5364C5.271 16.5362 5.271 16.5361 5.271 16.536C5.271 16.5358 5.271 16.5357 5.271 16.5356C5.271 16.5354 5.271 16.5353 5.271 16.5352C5.271 16.535 5.271 16.5349 5.271 16.5347C5.271 16.5346 5.271 16.5345 5.271 16.5343C5.271 16.5342 5.271 16.5341 5.271 16.5339C5.271 16.5338 5.271 16.5336 5.271 16.5335C5.271 16.5334 5.271 16.5332 5.271 16.5331C5.271 16.533 5.271 16.5328 5.271 16.5327C5.271 16.5325 5.271 16.5324 5.271 16.5323C5.271 16.5321 5.271 16.532 5.271 16.5318C5.271 16.5317 5.271 16.5316 5.271 16.5314C5.271 16.5313 5.271 16.5311 5.271 16.531C5.271 16.5308 5.271 16.5307 5.271 16.5306C5.271 16.5304 5.271 16.5303 5.271 16.5301C5.271 16.53 5.271 16.5298 5.271 16.5297C5.271 16.5296 5.271 16.5294 5.271 16.5293C5.271 16.5291 5.271 16.529 5.271 16.5288C5.271 16.5287 5.271 16.5285 5.271 16.5284C5.271 16.5282 5.271 16.5281 5.271 16.528C5.271 16.5278 5.271 16.5277 5.271 16.5275C5.271 16.5274 5.271 16.5272 5.271 16.5271C5.271 16.5269 5.271 16.5268 5.271 16.5266C5.271 16.5265 5.271 16.5263 5.271 16.5262C5.271 16.526 5.271 16.5259 5.271 16.5257C5.271 16.5256 5.271 16.5254 5.271 16.5253C5.271 16.5251 5.271 16.525 5.271 16.5248C5.271 16.5247 5.271 16.5245 5.271 16.5244C5.271 16.5242 5.271 16.5241 5.271 16.5239C5.271 16.5238 5.271 16.5236 5.271 16.5235C5.271 16.5233 5.271 16.5232 5.271 16.523C5.271 16.5229 5.271 16.5227 5.271 16.5226C5.271 16.5224 5.271 16.5223 5.271 16.5221C5.271 16.522 5.271 16.5218 5.271 16.5216C5.271 16.5215 5.271 16.5213 5.271 16.5212C5.271 16.521 5.271 16.5209 5.271 16.5207C5.271 16.5206 5.271 16.5204 5.271 16.5202C5.271 16.5201 5.271 16.5199 5.271 16.5198C5.271 16.5196 5.271 16.5195 5.271 16.5193C5.271 16.5192 5.271 16.519 5.271 16.5188C5.271 16.5187 5.271 16.5185 5.271 16.5184C5.271 16.5182 5.271 16.518 5.271 16.5179C5.271 16.5177 5.271 16.5176 5.271 16.5174C5.271 16.5172 5.271 16.5171 5.271 16.5169C5.271 16.5168 5.271 16.5166 5.271 16.5164C5.271 16.5163 5.271 16.5161 5.271 16.516C5.271 16.5158 5.271 16.5156 5.271 16.5155C5.271 16.5153 5.271 16.5152 5.271 16.515C5.271 16.5148 5.271 16.5147 5.271 16.5145C5.271 16.5143 5.271 16.5142 5.271 16.514C5.271 16.5139 5.271 16.5137 5.271 16.5135C5.271 16.5134 5.271 16.5132 5.271 16.513C5.271 16.5129 5.271 16.5127 5.271 16.5125C5.271 16.5124 5.271 16.5122 5.271 16.512C5.271 16.5119 5.271 16.5117 5.271 16.5115C5.271 16.5114 5.271 16.5112 5.271 16.511C5.271 16.5109 5.271 16.5107 5.271 16.5105C5.271 16.5104 5.271 16.5102 5.271 16.51C5.271 16.5099 5.271 16.5097 5.271 16.5095C5.271 16.5094 5.271 16.5092 5.271 16.509C5.271 16.5088 5.271 16.5087 5.271 16.5085C5.271 16.5083 5.271 16.5082 5.271 16.508C5.271 16.5078 5.271 16.5077 5.271 16.5075C5.271 16.5073 5.271 16.5071 5.271 16.507C5.271 16.5068 5.271 16.5066 5.271 16.5065C5.271 16.5063 5.271 16.5061 5.271 16.5059C5.271 16.5058 5.271 16.5056 5.271 16.5054C5.271 16.5052 5.271 16.5051 5.271 16.5049C5.271 16.5047 5.271 16.5045 5.271 16.5044C5.271 16.5042 5.271 16.504 5.271 16.5038C5.271 16.5037 5.271 16.5035 5.271 16.5033C5.271 16.5031 5.271 16.503 5.271 16.5028C5.271 16.5026 5.271 16.5024 5.271 16.5023C5.271 16.5021 5.271 16.5019 5.271 16.5017C5.271 16.5016 5.271 16.5014 5.271 16.5012C5.271 16.501 5.271 16.5008 5.271 16.5007C5.271 16.5005 5.271 16.5003 5.271 16.5001C5.271 16.4999 5.271 16.4998 5.271 16.4996C5.271 16.4994 5.271 16.4992 5.271 16.499C5.271 16.4989 5.271 16.4987 5.271 16.4985C5.271 16.4983 5.271 16.4981 5.271 16.498C5.271 16.4978 5.271 16.4976 5.271 16.4974C5.271 16.4972 5.271 16.497 5.271 16.4969C5.271 16.4967 5.271 16.4965 5.271 16.4963C5.271 16.4961 5.271 16.4959 5.271 16.4958C5.271 16.4956 5.271 16.4954 5.271 16.4952C5.271 16.495 5.271 16.4948 5.271 16.4947C5.271 16.4945 5.271 16.4943 5.271 16.4941C5.271 16.4939 5.271 16.4937 5.271 16.4935C5.271 16.4934 5.271 16.4932 5.271 16.493C5.271 16.4928 5.271 16.4926 5.271 16.4924C5.271 16.4922 5.271 16.492 5.271 16.4919C5.271 16.4917 5.271 16.4915 5.271 16.4913C5.271 16.4911 5.271 16.4909 5.271 16.4907C5.271 16.4905 5.271 16.4903 5.271 16.4902C5.271 16.49 5.271 16.4898 5.271 16.4896C5.271 16.4894 5.271 16.4892 5.271 16.489C5.271 16.4888 5.271 16.4886 5.271 16.4884C5.271 16.4882 5.271 16.4881 5.271 16.4879C5.271 16.4877 5.271 16.4875 5.271 16.4873C5.271 16.4871 5.271 16.4869 5.271 16.4867C5.271 16.4865 5.271 16.4863 5.271 16.4861C5.271 16.4859 5.271 16.4857 5.271 16.4855C5.271 16.4853 5.271 16.4852 5.271 16.485C5.271 16.4848 5.271 16.4846 5.271 16.4844C5.271 16.4842 5.271 16.484 5.271 16.4838C5.271 16.4836 5.271 16.4834 5.271 16.4832C5.271 16.483 5.271 16.4828 5.271 16.4826C5.271 16.4824 5.271 16.4822 5.271 16.482C5.271 16.4818 5.271 16.4816 5.271 16.4814C5.271 16.4812 5.271 16.481 5.271 16.4808C5.271 16.4806 5.271 16.4804 5.271 16.4802C5.271 16.48 5.271 16.4798 5.271 16.4796C5.271 16.4794 5.271 16.4792 5.271 16.479C5.271 16.4788 5.271 16.4786 5.271 16.4784C5.271 16.4782 5.271 16.478 5.271 16.4778C5.271 16.4776 5.271 16.4774 5.271 16.4772C5.271 16.477 5.271 16.4768 5.271 16.4766C5.271 16.4764 5.271 16.4762 5.271 16.476C5.271 16.4758 5.271 16.4756 5.271 16.4754C5.271 16.4752 5.271 16.475 5.271 16.4748C5.271 16.4745 5.271 16.4743 5.271 16.4741C5.271 16.4739 5.271 16.4737 5.271 16.4735C5.271 16.4733 5.271 16.4731 5.271 16.4729C5.271 16.4727 5.271 16.4725 5.271 16.4723C5.271 16.4721 5.271 16.4719 5.271 16.4717C5.271 16.4714 5.271 16.4712 5.271 16.471C5.271 16.4708 5.271 16.4706 5.271 16.4704C5.271 16.4702 5.271 16.47 5.271 16.4698C5.271 16.4696 5.271 16.4694 5.271 16.4691C5.271 16.4689 5.271 16.4687 5.271 16.4685C5.271 16.4683 5.271 16.4681 5.271 16.4679C5.271 16.4677 5.271 16.4675 5.271 16.4672C5.271 16.467 5.271 16.4668 5.271 16.4666C5.271 16.4664 5.271 16.4662 5.271 16.466C5.271 16.4658 5.271 16.4655 5.271 16.4653C5.271 16.4651 5.271 16.4649 5.271 16.4647C5.271 16.4645 5.271 16.4643 5.271 16.464C5.271 16.4638 5.271 16.4636 5.271 16.4634C5.271 16.4632 5.271 16.463 5.271 16.4628C5.271 16.4625 5.271 16.4623 5.271 16.4621C5.271 16.4619 5.271 16.4617 5.271 16.4615C5.271 16.4612 5.271 16.461 5.271 16.4608C5.271 16.4606 5.271 16.4604 5.271 16.4601C5.271 16.4599 5.271 16.4597 5.271 16.4595C5.271 16.4593 5.271 16.4591 5.271 16.4588C5.271 16.4586 5.271 16.4584 5.271 16.4582C5.271 16.458 5.271 16.4577 5.271 16.4575C5.271 16.4573 5.271 16.4571 5.271 16.4569C5.271 16.4566 5.271 16.4564 5.271 16.4562C5.271 16.456 5.271 16.4557 5.271 16.4555C5.271 16.4553 5.271 16.4551 5.271 16.4549C5.271 16.4546 5.271 16.4544 5.271 16.4542C5.271 16.454 5.271 16.4537 5.271 16.4535C5.271 16.4533 5.271 16.4531 5.271 16.4528C5.271 16.4526 5.271 16.4524 5.271 16.4522C5.271 16.4519 5.271 16.4517 5.271 16.4515C5.271 16.4513 5.271 16.451 5.271 16.4508C5.271 16.4506 5.271 16.4503 5.271 16.4501C5.271 16.4499 5.271 16.4497 5.271 16.4494C5.271 16.4492 5.271 16.449 5.271 16.4488C5.271 16.4485 5.271 16.4483 5.271 16.4481C5.271 16.4478 5.271 16.4476 5.271 16.4474C5.271 16.4472 5.271 16.4469 5.271 16.4467C5.271 16.4465 5.271 16.4462 5.271 16.446C5.271 16.4458 5.271 16.4455 5.271 16.4453C5.271 16.4451 5.271 16.4448 5.271 16.4446C5.271 16.4444 5.271 16.4442 5.271 16.4439C5.271 16.4437 5.271 16.4435 5.271 16.4432C5.271 16.443 5.271 16.4428 5.271 16.4425C5.271 16.4423 5.271 16.4421 5.271 16.4418C5.271 16.4416 5.271 16.4414 5.271 16.4411C5.271 16.4409 5.271 16.4406 5.271 16.4404C5.271 16.4402 5.271 16.4399 5.271 16.4397C5.271 16.4395 5.271 16.4392 5.271 16.439C5.271 16.4388 5.271 16.4385 5.271 16.4383C5.271 16.4381 5.271 16.4378 5.271 16.4376C5.271 16.4373 5.271 16.4371 5.271 16.4369C5.271 16.4366 5.271 16.4364 5.271 16.4361C5.271 16.4359 5.271 16.4357 5.271 16.4354C5.271 16.4352 5.271 16.4349 5.271 16.4347C5.271 16.4345 5.271 16.4342 5.271 16.434C5.271 16.4337 5.271 16.4335 5.271 16.4333C5.271 16.433 5.271 16.4328 5.271 16.4325C5.271 16.4323 5.271 16.4321 5.271 16.4318C5.271 16.4316 5.271 16.4313 5.271 16.4311C5.271 16.4308 5.271 16.4306 5.271 16.4304C5.271 16.4301 5.271 16.4299 5.271 16.4296C5.271 16.4294 5.271 16.4291 5.271 16.4289C5.271 16.4287 5.271 16.4284 5.271 16.4282C5.271 16.4279 5.271 16.4277 5.271 16.4274C5.271 16.4272 5.271 16.4269 5.271 16.4267C5.271 16.4264 5.271 16.4262 5.271 16.4259C5.271 16.4257 5.271 16.4255 5.271 16.4252C5.271 16.425 5.271 16.4247 5.271 16.4245C5.271 16.4242 5.271 16.424 5.271 16.4237C5.271 16.4235 5.271 16.4232 5.271 16.423C5.271 16.4227 5.271 16.4225 5.271 16.4222C5.271 16.422 5.271 16.4217 5.271 16.4215C5.271 16.4212 5.271 16.421 5.271 16.4207C5.271 16.4205 5.271 16.4202 5.271 16.42C5.271 16.4197 5.271 16.4195 5.271 16.4192C5.271 16.419 5.271 16.4187 5.271 16.4185C5.271 16.4182 5.271 16.4179 5.271 16.4177C5.271 16.4174 5.271 16.4172 5.271 16.4169C5.271 16.4167 5.271 16.4164 5.271 16.4162C5.271 16.4159 5.271 16.4157 5.271 16.4154C5.271 16.4151 5.271 16.4149 5.271 16.4146C5.271 16.4144 5.271 16.4141 5.271 16.4139C5.271 16.4136 5.271 16.4134 5.271 16.4131C5.271 16.4128 5.271 16.4126 5.271 16.4123C5.271 16.4121 5.271 16.4118 5.271 16.4116C5.271 16.4113 5.271 16.411 5.271 16.4108C5.271 16.4105 5.271 16.4103 5.271 16.41C5.271 16.4097 5.271 16.4095 5.271 16.4092C5.271 16.409 5.271 16.4087 5.271 16.4084C5.271 16.4082 5.271 16.4079 5.271 16.4077C5.271 16.4074 5.271 16.4071 5.271 16.4069C5.271 16.4066 5.271 16.4064 5.271 16.4061C5.271 16.4058 5.271 16.4056 5.271 16.4053C5.271 16.405 5.271 16.4048 5.271 16.4045C5.271 16.4043 5.271 16.404 5.271 16.4037C5.271 16.4035 5.271 16.4032 5.271 16.4029C5.271 16.4027 5.271 16.4024 5.271 16.4021C5.271 16.4019 5.271 16.4016 5.271 16.4013C5.271 16.4011 5.271 16.4008 5.271 16.4005C5.271 16.4003 5.271 16.4 5.271 16.3997C5.271 16.3995 5.271 16.3992 5.271 16.3989C5.271 16.3987 5.271 16.3984 5.271 16.3981C5.271 16.3979 5.271 16.3976 5.271 16.3973C5.271 16.3971 5.271 16.3968 5.271 16.3965C5.271 16.3963 5.271 16.396 5.271 16.3957C5.271 16.3955 5.271 16.3952 5.271 16.3949C5.271 16.3946 5.271 16.3944 5.271 16.3941C5.271 16.3938 5.271 16.3936 5.271 16.3933C5.271 16.393 5.271 16.3927 5.271 16.3925C5.271 16.3922 5.271 16.3919 5.271 16.3917C5.271 16.3914 5.271 16.3911 5.271 16.3908C5.271 16.3906 5.271 16.3903 5.271 16.39C5.271 16.3897 5.271 16.3895 5.271 16.3892C5.271 16.3889 5.271 16.3887 5.271 16.3884C5.271 16.3881 5.271 16.3878 5.271 16.3876C5.271 16.3873 5.271 16.387 5.271 16.3867C5.271 16.3864 5.271 16.3862 5.271 16.3859C5.271 16.3856 5.271 16.3853 5.271 16.3851C5.271 16.3848 5.271 16.3845 5.271 16.3842C5.271 16.384 5.271 16.3837 5.271 16.3834C5.271 16.3831 5.271 16.3828 5.271 16.3826C5.271 16.3823 5.271 16.382 5.271 16.3817C5.271 16.3814 5.271 16.3812 5.271 16.3809C5.271 16.3806 5.271 16.3803 5.271 16.38C5.271 16.3798 5.271 16.3795 5.271 16.3792C5.271 16.3789 5.271 16.3786 5.271 16.3784C5.271 16.3781 5.271 16.3778 5.271 16.3775C5.271 16.3772 5.271 16.3769 5.271 16.3767C5.271 16.3764 5.271 16.3761 5.271 16.3758C5.271 16.3755 5.271 16.3752 5.271 16.375C5.271 16.3747 5.271 16.3744 5.271 16.3741C5.271 16.3738 5.271 16.3735 5.271 16.3732C5.271 16.373 5.271 16.3727 5.271 16.3724C5.271 16.3721 5.271 16.3718 5.271 16.3715C5.271 16.3712 5.271 16.371 5.271 16.3707C5.271 16.3704 5.271 16.3701 5.271 16.3698C5.271 16.3695 5.271 16.3692 5.271 16.3689C5.271 16.3687 5.271 16.3684 5.271 16.3681C5.271 16.3678 5.271 16.3675 5.271 16.3672C5.271 16.3669 5.271 16.3666 5.271 16.3663C5.271 16.3661 5.271 16.3658 5.271 16.3655C5.271 16.3652 5.271 16.3649 5.271 16.3646C5.271 16.3643 5.271 16.364 5.271 16.3637C5.271 16.3634 5.271 16.3631 5.271 16.3629C5.271 16.3626 5.271 16.3623 5.271 16.362C5.271 16.3617 5.271 16.3614 5.271 16.3611C5.271 16.3608 5.271 16.3605 5.271 16.3602C5.271 16.3599 5.271 16.3596 5.271 16.3593C5.271 16.359 5.271 16.3587 5.271 16.3584C5.271 16.3581 5.271 16.3579 5.271 16.3576C5.271 16.3573 5.271 16.357 5.271 16.3567C5.271 16.3564 5.271 16.3561 5.271 16.3558C5.271 16.3555 5.271 16.3552 5.271 16.3549C5.271 16.3546 5.271 16.3543 5.271 16.354H3.271C3.271 16.3543 3.271 16.3546 3.271 16.3549C3.271 16.3552 3.271 16.3555 3.271 16.3558C3.271 16.3561 3.271 16.3564 3.271 16.3567C3.271 16.357 3.271 16.3573 3.271 16.3576C3.271 16.3579 3.271 16.3581 3.271 16.3584C3.271 16.3587 3.271 16.359 3.271 16.3593C3.271 16.3596 3.271 16.3599 3.271 16.3602C3.271 16.3605 3.271 16.3608 3.271 16.3611C3.271 16.3614 3.271 16.3617 3.271 16.362C3.271 16.3623 3.271 16.3626 3.271 16.3629C3.271 16.3631 3.271 16.3634 3.271 16.3637C3.271 16.364 3.271 16.3643 3.271 16.3646C3.271 16.3649 3.271 16.3652 3.271 16.3655C3.271 16.3658 3.271 16.3661 3.271 16.3663C3.271 16.3666 3.271 16.3669 3.271 16.3672C3.271 16.3675 3.271 16.3678 3.271 16.3681C3.271 16.3684 3.271 16.3687 3.271 16.3689C3.271 16.3692 3.271 16.3695 3.271 16.3698C3.271 16.3701 3.271 16.3704 3.271 16.3707C3.271 16.371 3.271 16.3712 3.271 16.3715C3.271 16.3718 3.271 16.3721 3.271 16.3724C3.271 16.3727 3.271 16.373 3.271 16.3732C3.271 16.3735 3.271 16.3738 3.271 16.3741C3.271 16.3744 3.271 16.3747 3.271 16.375C3.271 16.3752 3.271 16.3755 3.271 16.3758C3.271 16.3761 3.271 16.3764 3.271 16.3767C3.271 16.3769 3.271 16.3772 3.271 16.3775C3.271 16.3778 3.271 16.3781 3.271 16.3784C3.271 16.3786 3.271 16.3789 3.271 16.3792C3.271 16.3795 3.271 16.3798 3.271 16.38C3.271 16.3803 3.271 16.3806 3.271 16.3809C3.271 16.3812 3.271 16.3814 3.271 16.3817C3.271 16.382 3.271 16.3823 3.271 16.3826C3.271 16.3828 3.271 16.3831 3.271 16.3834C3.271 16.3837 3.271 16.384 3.271 16.3842C3.271 16.3845 3.271 16.3848 3.271 16.3851C3.271 16.3853 3.271 16.3856 3.271 16.3859C3.271 16.3862 3.271 16.3864 3.271 16.3867C3.271 16.387 3.271 16.3873 3.271 16.3876C3.271 16.3878 3.271 16.3881 3.271 16.3884C3.271 16.3887 3.271 16.3889 3.271 16.3892C3.271 16.3895 3.271 16.3897 3.271 16.39C3.271 16.3903 3.271 16.3906 3.271 16.3908C3.271 16.3911 3.271 16.3914 3.271 16.3917C3.271 16.3919 3.271 16.3922 3.271 16.3925C3.271 16.3927 3.271 16.393 3.271 16.3933C3.271 16.3936 3.271 16.3938 3.271 16.3941C3.271 16.3944 3.271 16.3946 3.271 16.3949C3.271 16.3952 3.271 16.3955 3.271 16.3957C3.271 16.396 3.271 16.3963 3.271 16.3965C3.271 16.3968 3.271 16.3971 3.271 16.3973C3.271 16.3976 3.271 16.3979 3.271 16.3981C3.271 16.3984 3.271 16.3987 3.271 16.3989C3.271 16.3992 3.271 16.3995 3.271 16.3997C3.271 16.4 3.271 16.4003 3.271 16.4005C3.271 16.4008 3.271 16.4011 3.271 16.4013C3.271 16.4016 3.271 16.4019 3.271 16.4021C3.271 16.4024 3.271 16.4027 3.271 16.4029C3.271 16.4032 3.271 16.4035 3.271 16.4037C3.271 16.404 3.271 16.4043 3.271 16.4045C3.271 16.4048 3.271 16.405 3.271 16.4053C3.271 16.4056 3.271 16.4058 3.271 16.4061C3.271 16.4064 3.271 16.4066 3.271 16.4069C3.271 16.4071 3.271 16.4074 3.271 16.4077C3.271 16.4079 3.271 16.4082 3.271 16.4084C3.271 16.4087 3.271 16.409 3.271 16.4092C3.271 16.4095 3.271 16.4097 3.271 16.41C3.271 16.4103 3.271 16.4105 3.271 16.4108C3.271 16.411 3.271 16.4113 3.271 16.4116C3.271 16.4118 3.271 16.4121 3.271 16.4123C3.271 16.4126 3.271 16.4128 3.271 16.4131C3.271 16.4134 3.271 16.4136 3.271 16.4139C3.271 16.4141 3.271 16.4144 3.271 16.4146C3.271 16.4149 3.271 16.4151 3.271 16.4154C3.271 16.4157 3.271 16.4159 3.271 16.4162C3.271 16.4164 3.271 16.4167 3.271 16.4169C3.271 16.4172 3.271 16.4174 3.271 16.4177C3.271 16.4179 3.271 16.4182 3.271 16.4185C3.271 16.4187 3.271 16.419 3.271 16.4192C3.271 16.4195 3.271 16.4197 3.271 16.42C3.271 16.4202 3.271 16.4205 3.271 16.4207C3.271 16.421 3.271 16.4212 3.271 16.4215C3.271 16.4217 3.271 16.422 3.271 16.4222C3.271 16.4225 3.271 16.4227 3.271 16.423C3.271 16.4232 3.271 16.4235 3.271 16.4237C3.271 16.424 3.271 16.4242 3.271 16.4245C3.271 16.4247 3.271 16.425 3.271 16.4252C3.271 16.4255 3.271 16.4257 3.271 16.4259C3.271 16.4262 3.271 16.4264 3.271 16.4267C3.271 16.4269 3.271 16.4272 3.271 16.4274C3.271 16.4277 3.271 16.4279 3.271 16.4282C3.271 16.4284 3.271 16.4287 3.271 16.4289C3.271 16.4291 3.271 16.4294 3.271 16.4296C3.271 16.4299 3.271 16.4301 3.271 16.4304C3.271 16.4306 3.271 16.4308 3.271 16.4311C3.271 16.4313 3.271 16.4316 3.271 16.4318C3.271 16.4321 3.271 16.4323 3.271 16.4325C3.271 16.4328 3.271 16.433 3.271 16.4333C3.271 16.4335 3.271 16.4337 3.271 16.434C3.271 16.4342 3.271 16.4345 3.271 16.4347C3.271 16.4349 3.271 16.4352 3.271 16.4354C3.271 16.4357 3.271 16.4359 3.271 16.4361C3.271 16.4364 3.271 16.4366 3.271 16.4369C3.271 16.4371 3.271 16.4373 3.271 16.4376C3.271 16.4378 3.271 16.4381 3.271 16.4383C3.271 16.4385 3.271 16.4388 3.271 16.439C3.271 16.4392 3.271 16.4395 3.271 16.4397C3.271 16.4399 3.271 16.4402 3.271 16.4404C3.271 16.4406 3.271 16.4409 3.271 16.4411C3.271 16.4414 3.271 16.4416 3.271 16.4418C3.271 16.4421 3.271 16.4423 3.271 16.4425C3.271 16.4428 3.271 16.443 3.271 16.4432C3.271 16.4435 3.271 16.4437 3.271 16.4439C3.271 16.4442 3.271 16.4444 3.271 16.4446C3.271 16.4448 3.271 16.4451 3.271 16.4453C3.271 16.4455 3.271 16.4458 3.271 16.446C3.271 16.4462 3.271 16.4465 3.271 16.4467C3.271 16.4469 3.271 16.4472 3.271 16.4474C3.271 16.4476 3.271 16.4478 3.271 16.4481C3.271 16.4483 3.271 16.4485 3.271 16.4488C3.271 16.449 3.271 16.4492 3.271 16.4494C3.271 16.4497 3.271 16.4499 3.271 16.4501C3.271 16.4503 3.271 16.4506 3.271 16.4508C3.271 16.451 3.271 16.4513 3.271 16.4515C3.271 16.4517 3.271 16.4519 3.271 16.4522C3.271 16.4524 3.271 16.4526 3.271 16.4528C3.271 16.4531 3.271 16.4533 3.271 16.4535C3.271 16.4537 3.271 16.454 3.271 16.4542C3.271 16.4544 3.271 16.4546 3.271 16.4549C3.271 16.4551 3.271 16.4553 3.271 16.4555C3.271 16.4557 3.271 16.456 3.271 16.4562C3.271 16.4564 3.271 16.4566 3.271 16.4569C3.271 16.4571 3.271 16.4573 3.271 16.4575C3.271 16.4577 3.271 16.458 3.271 16.4582C3.271 16.4584 3.271 16.4586 3.271 16.4588C3.271 16.4591 3.271 16.4593 3.271 16.4595C3.271 16.4597 3.271 16.4599 3.271 16.4601C3.271 16.4604 3.271 16.4606 3.271 16.4608C3.271 16.461 3.271 16.4612 3.271 16.4615C3.271 16.4617 3.271 16.4619 3.271 16.4621C3.271 16.4623 3.271 16.4625 3.271 16.4628C3.271 16.463 3.271 16.4632 3.271 16.4634C3.271 16.4636 3.271 16.4638 3.271 16.464C3.271 16.4643 3.271 16.4645 3.271 16.4647C3.271 16.4649 3.271 16.4651 3.271 16.4653C3.271 16.4655 3.271 16.4658 3.271 16.466C3.271 16.4662 3.271 16.4664 3.271 16.4666C3.271 16.4668 3.271 16.467 3.271 16.4672C3.271 16.4675 3.271 16.4677 3.271 16.4679C3.271 16.4681 3.271 16.4683 3.271 16.4685C3.271 16.4687 3.271 16.4689 3.271 16.4691C3.271 16.4694 3.271 16.4696 3.271 16.4698C3.271 16.47 3.271 16.4702 3.271 16.4704C3.271 16.4706 3.271 16.4708 3.271 16.471C3.271 16.4712 3.271 16.4714 3.271 16.4717C3.271 16.4719 3.271 16.4721 3.271 16.4723C3.271 16.4725 3.271 16.4727 3.271 16.4729C3.271 16.4731 3.271 16.4733 3.271 16.4735C3.271 16.4737 3.271 16.4739 3.271 16.4741C3.271 16.4743 3.271 16.4745 3.271 16.4748C3.271 16.475 3.271 16.4752 3.271 16.4754C3.271 16.4756 3.271 16.4758 3.271 16.476C3.271 16.4762 3.271 16.4764 3.271 16.4766C3.271 16.4768 3.271 16.477 3.271 16.4772C3.271 16.4774 3.271 16.4776 3.271 16.4778C3.271 16.478 3.271 16.4782 3.271 16.4784C3.271 16.4786 3.271 16.4788 3.271 16.479C3.271 16.4792 3.271 16.4794 3.271 16.4796C3.271 16.4798 3.271 16.48 3.271 16.4802C3.271 16.4804 3.271 16.4806 3.271 16.4808C3.271 16.481 3.271 16.4812 3.271 16.4814C3.271 16.4816 3.271 16.4818 3.271 16.482C3.271 16.4822 3.271 16.4824 3.271 16.4826C3.271 16.4828 3.271 16.483 3.271 16.4832C3.271 16.4834 3.271 16.4836 3.271 16.4838C3.271 16.484 3.271 16.4842 3.271 16.4844C3.271 16.4846 3.271 16.4848 3.271 16.485C3.271 16.4852 3.271 16.4853 3.271 16.4855C3.271 16.4857 3.271 16.4859 3.271 16.4861C3.271 16.4863 3.271 16.4865 3.271 16.4867C3.271 16.4869 3.271 16.4871 3.271 16.4873C3.271 16.4875 3.271 16.4877 3.271 16.4879C3.271 16.4881 3.271 16.4882 3.271 16.4884C3.271 16.4886 3.271 16.4888 3.271 16.489C3.271 16.4892 3.271 16.4894 3.271 16.4896C3.271 16.4898 3.271 16.49 3.271 16.4902C3.271 16.4903 3.271 16.4905 3.271 16.4907C3.271 16.4909 3.271 16.4911 3.271 16.4913C3.271 16.4915 3.271 16.4917 3.271 16.4919C3.271 16.492 3.271 16.4922 3.271 16.4924C3.271 16.4926 3.271 16.4928 3.271 16.493C3.271 16.4932 3.271 16.4934 3.271 16.4935C3.271 16.4937 3.271 16.4939 3.271 16.4941C3.271 16.4943 3.271 16.4945 3.271 16.4947C3.271 16.4948 3.271 16.495 3.271 16.4952C3.271 16.4954 3.271 16.4956 3.271 16.4958C3.271 16.4959 3.271 16.4961 3.271 16.4963C3.271 16.4965 3.271 16.4967 3.271 16.4969C3.271 16.497 3.271 16.4972 3.271 16.4974C3.271 16.4976 3.271 16.4978 3.271 16.498C3.271 16.4981 3.271 16.4983 3.271 16.4985C3.271 16.4987 3.271 16.4989 3.271 16.499C3.271 16.4992 3.271 16.4994 3.271 16.4996C3.271 16.4998 3.271 16.4999 3.271 16.5001C3.271 16.5003 3.271 16.5005 3.271 16.5007C3.271 16.5008 3.271 16.501 3.271 16.5012C3.271 16.5014 3.271 16.5016 3.271 16.5017C3.271 16.5019 3.271 16.5021 3.271 16.5023C3.271 16.5024 3.271 16.5026 3.271 16.5028C3.271 16.503 3.271 16.5031 3.271 16.5033C3.271 16.5035 3.271 16.5037 3.271 16.5038C3.271 16.504 3.271 16.5042 3.271 16.5044C3.271 16.5045 3.271 16.5047 3.271 16.5049C3.271 16.5051 3.271 16.5052 3.271 16.5054C3.271 16.5056 3.271 16.5058 3.271 16.5059C3.271 16.5061 3.271 16.5063 3.271 16.5065C3.271 16.5066 3.271 16.5068 3.271 16.507C3.271 16.5071 3.271 16.5073 3.271 16.5075C3.271 16.5077 3.271 16.5078 3.271 16.508C3.271 16.5082 3.271 16.5083 3.271 16.5085C3.271 16.5087 3.271 16.5088 3.271 16.509C3.271 16.5092 3.271 16.5094 3.271 16.5095C3.271 16.5097 3.271 16.5099 3.271 16.51C3.271 16.5102 3.271 16.5104 3.271 16.5105C3.271 16.5107 3.271 16.5109 3.271 16.511C3.271 16.5112 3.271 16.5114 3.271 16.5115C3.271 16.5117 3.271 16.5119 3.271 16.512C3.271 16.5122 3.271 16.5124 3.271 16.5125C3.271 16.5127 3.271 16.5129 3.271 16.513C3.271 16.5132 3.271 16.5134 3.271 16.5135C3.271 16.5137 3.271 16.5139 3.271 16.514C3.271 16.5142 3.271 16.5143 3.271 16.5145C3.271 16.5147 3.271 16.5148 3.271 16.515C3.271 16.5152 3.271 16.5153 3.271 16.5155C3.271 16.5156 3.271 16.5158 3.271 16.516C3.271 16.5161 3.271 16.5163 3.271 16.5164C3.271 16.5166 3.271 16.5168 3.271 16.5169C3.271 16.5171 3.271 16.5172 3.271 16.5174C3.271 16.5176 3.271 16.5177 3.271 16.5179C3.271 16.518 3.271 16.5182 3.271 16.5184C3.271 16.5185 3.271 16.5187 3.271 16.5188C3.271 16.519 3.271 16.5192 3.271 16.5193C3.271 16.5195 3.271 16.5196 3.271 16.5198C3.271 16.5199 3.271 16.5201 3.271 16.5202C3.271 16.5204 3.271 16.5206 3.271 16.5207C3.271 16.5209 3.271 16.521 3.271 16.5212C3.271 16.5213 3.271 16.5215 3.271 16.5216C3.271 16.5218 3.271 16.522 3.271 16.5221C3.271 16.5223 3.271 16.5224 3.271 16.5226C3.271 16.5227 3.271 16.5229 3.271 16.523C3.271 16.5232 3.271 16.5233 3.271 16.5235C3.271 16.5236 3.271 16.5238 3.271 16.5239C3.271 16.5241 3.271 16.5242 3.271 16.5244C3.271 16.5245 3.271 16.5247 3.271 16.5248C3.271 16.525 3.271 16.5251 3.271 16.5253C3.271 16.5254 3.271 16.5256 3.271 16.5257C3.271 16.5259 3.271 16.526 3.271 16.5262C3.271 16.5263 3.271 16.5265 3.271 16.5266C3.271 16.5268 3.271 16.5269 3.271 16.5271C3.271 16.5272 3.271 16.5274 3.271 16.5275C3.271 16.5277 3.271 16.5278 3.271 16.528C3.271 16.5281 3.271 16.5282 3.271 16.5284C3.271 16.5285 3.271 16.5287 3.271 16.5288C3.271 16.529 3.271 16.5291 3.271 16.5293C3.271 16.5294 3.271 16.5296 3.271 16.5297C3.271 16.5298 3.271 16.53 3.271 16.5301C3.271 16.5303 3.271 16.5304 3.271 16.5306C3.271 16.5307 3.271 16.5308 3.271 16.531C3.271 16.5311 3.271 16.5313 3.271 16.5314C3.271 16.5316 3.271 16.5317 3.271 16.5318C3.271 16.532 3.271 16.5321 3.271 16.5323C3.271 16.5324 3.271 16.5325 3.271 16.5327C3.271 16.5328 3.271 16.533 3.271 16.5331C3.271 16.5332 3.271 16.5334 3.271 16.5335C3.271 16.5336 3.271 16.5338 3.271 16.5339C3.271 16.5341 3.271 16.5342 3.271 16.5343C3.271 16.5345 3.271 16.5346 3.271 16.5347C3.271 16.5349 3.271 16.535 3.271 16.5352C3.271 16.5353 3.271 16.5354 3.271 16.5356C3.271 16.5357 3.271 16.5358 3.271 16.536C3.271 16.5361 3.271 16.5362 3.271 16.5364C3.271 16.5365 3.271 16.5366 3.271 16.5368C3.271 16.5369 3.271 16.537 3.271 16.5372C3.271 16.5373 3.271 16.5374 3.271 16.5376C3.271 16.5377 3.271 16.5378 3.271 16.538C3.271 16.5381 3.271 16.5382 3.271 16.5384C3.271 16.5385 3.271 16.5386 3.271 16.5388C3.271 16.5389 3.271 16.539 3.271 16.5392C3.271 16.5393 3.271 16.5394 3.271 16.5396C3.271 16.5397 3.271 16.5398 3.271 16.5399C3.271 16.5401 3.271 16.5402 3.271 16.5403C3.271 16.5405 3.271 16.5406 3.271 16.5407C3.271 16.5408 3.271 16.541 3.271 16.5411C3.271 16.5412 3.271 16.5414 3.271 16.5415C3.271 16.5416 3.271 16.5417 3.271 16.5419C3.271 16.542 3.271 16.5421 3.271 16.5422C3.271 16.5424 3.271 16.5425 3.271 16.5426C3.271 16.5427 3.271 16.5429 3.271 16.543C3.271 16.5431 3.271 16.5432 3.271 16.5434C3.271 16.5435 3.271 16.5436 3.271 16.5437C3.271 16.5439 3.271 16.544 3.271 16.5441C3.271 16.5442 3.271 16.5443 3.271 16.5445C3.271 16.5446 3.271 16.5447 3.271 16.5448C3.271 16.545 3.271 16.5451 3.271 16.5452C3.271 16.5453 3.271 16.5454 3.271 16.5456C3.271 16.5457 3.271 16.5458 3.271 16.5459C3.271 16.546 3.271 16.5462 3.271 16.5463C3.271 16.5464 3.271 16.5465 3.271 16.5466C3.271 16.5468 3.271 16.5469 3.271 16.547C3.271 16.5471 3.271 16.5472 3.271 16.5473C3.271 16.5475 3.271 16.5476 3.271 16.5477C3.271 16.5478 3.271 16.5479 3.271 16.548C3.271 16.5482 3.271 16.5483 3.271 16.5484C3.271 16.5485 3.271 16.5486 3.271 16.5487C3.271 16.5489 3.271 16.549 3.271 16.5491C3.271 16.5492 3.271 16.5493 3.271 16.5494C3.271 16.5495 3.271 16.5497 3.271 16.5498C3.271 16.5499 3.271 16.55 3.271 16.5501C3.271 16.5502 3.271 16.5503 3.271 16.5505C3.271 16.5506 3.271 16.5507 3.271 16.5508C3.271 16.5509 3.271 16.551 3.271 16.5511C3.271 16.5512 3.271 16.5513 3.271 16.5515C3.271 16.5516 3.271 16.5517 3.271 16.5518C3.271 16.5519 3.271 16.552 3.271 16.5521C3.271 16.5522 3.271 16.5523 3.271 16.5524C3.271 16.5526 3.271 16.5527 3.271 16.5528C3.271 16.5529 3.271 16.553 3.271 16.5531C3.271 16.5532 3.271 16.5533 3.271 16.5534C3.271 16.5535 3.271 16.5536 3.271 16.5537C3.271 16.5538 3.271 16.554 3.271 16.5541C3.271 16.5542 3.271 16.5543 3.271 16.5544C3.271 16.5545 3.271 16.5546 3.271 16.5547C3.271 16.5548 3.271 16.5549 3.271 16.555C3.271 16.5551 3.271 16.5552 3.271 16.5553C3.271 16.5554 3.271 16.5555 3.271 16.5556C3.271 16.5557 3.271 16.5558 3.271 16.5559C3.271 16.556 3.271 16.5561 3.271 16.5562C3.271 16.5563 3.271 16.5564 3.271 16.5565C3.271 16.5566 3.271 16.5567 3.271 16.5568C3.271 16.5569 3.271 16.557 3.271 16.5571C3.271 16.5572 3.271 16.5573 3.271 16.5574C3.271 16.5575 3.271 16.5576 3.271 16.5577C3.271 16.5578 3.271 16.5579 3.271 16.558C3.271 16.5581 3.271 16.5582 3.271 16.5583C3.271 16.5584 3.271 16.5585 3.271 16.5586C3.271 16.5587 3.271 16.5588 3.271 16.5589C3.271 16.559 3.271 16.5591 3.271 16.5592C3.271 16.5593 3.271 16.5594 3.271 16.5595C3.271 16.5596 3.271 16.5597 3.271 16.5598C3.271 16.5599 3.271 16.56 3.271 16.5601C3.271 16.5602 3.271 16.5603 3.271 16.5603C3.271 16.5604 3.271 16.5605 3.271 16.5606C3.271 16.5607 3.271 16.5608 3.271 16.5609C3.271 16.561 3.271 16.5611 3.271 16.5612C3.271 16.5613 3.271 16.5614 3.271 16.5615C3.271 16.5616 3.271 16.5616 3.271 16.5617C3.271 16.5618 3.271 16.5619 3.271 16.562C3.271 16.5621 3.271 16.5622 3.271 16.5623C3.271 16.5624 3.271 16.5625 3.271 16.5625C3.271 16.5626 3.271 16.5627 3.271 16.5628C3.271 16.5629 3.271 16.563 3.271 16.5631C3.271 16.5632 3.271 16.5632 3.271 16.5633C3.271 16.5634 3.271 16.5635 3.271 16.5636C3.271 16.5637 3.271 16.5638 3.271 16.5639C3.271 16.5639 3.271 16.564 3.271 16.5641C3.271 16.5642 3.271 16.5643 3.271 16.5644C3.271 16.5645 3.271 16.5645 3.271 16.5646C3.271 16.5647 3.271 16.5648 3.271 16.5649C3.271 16.565 3.271 16.565 3.271 16.5651C3.271 16.5652 3.271 16.5653 3.271 16.5654C3.271 16.5655 3.271 16.5655 3.271 16.5656C3.271 16.5657 3.271 16.5658 3.271 16.5659C3.271 16.566 3.271 16.566 3.271 16.5661C3.271 16.5662 3.271 16.5663 3.271 16.5664C3.271 16.5664 3.271 16.5665 3.271 16.5666C3.271 16.5667 3.271 16.5668 3.271 16.5668C3.271 16.5669 3.271 16.567 3.271 16.5671C3.271 16.5672 3.271 16.5672 3.271 16.5673C3.271 16.5674 3.271 16.5675 3.271 16.5675C3.271 16.5676 3.271 16.5677 3.271 16.5678C3.271 16.5678 3.271 16.5679 3.271 16.568C3.271 16.5681 3.271 16.5682 3.271 16.5682C3.271 16.5683 3.271 16.5684 3.271 16.5685C3.271 16.5685 3.271 16.5686 3.271 16.5687C3.271 16.5688 3.271 16.5688 3.271 16.5689C3.271 16.569 3.271 16.5691 3.271 16.5691C3.271 16.5692 3.271 16.5693 3.271 16.5693C3.271 16.5694 3.271 16.5695 3.271 16.5696C3.271 16.5696 3.271 16.5697 3.271 16.5698C3.271 16.5698 3.271 16.5699 3.271 16.57C3.271 16.5701 3.271 16.5701 3.271 16.5702C3.271 16.5703 3.271 16.5703 3.271 16.5704C3.271 16.5705 3.271 16.5706 3.271 16.5706C3.271 16.5707 3.271 16.5708 3.271 16.5708C3.271 16.5709 3.271 16.571 3.271 16.571C3.271 16.5711 3.271 16.5712 3.271 16.5712C3.271 16.5713 3.271 16.5714 3.271 16.5714C3.271 16.5715 3.271 16.5716 3.271 16.5716C3.271 16.5717 3.271 16.5718 3.271 16.5718C3.271 16.5719 3.271 16.572 3.271 16.572C3.271 16.5721 3.271 16.5722 3.271 16.5722C3.271 16.5723 3.271 16.5724 3.271 16.5724C3.271 16.5725 3.271 16.5725 3.271 16.5726C3.271 16.5727 3.271 16.5727 3.271 16.5728C3.271 16.5729 3.271 16.5729 3.271 16.573C3.271 16.5731 3.271 16.5731 3.271 16.5732C3.271 16.5732 3.271 16.5733 3.271 16.5734C3.271 16.5734 3.271 16.5735 3.271 16.5735C3.271 16.5736 3.271 16.5737 3.271 16.5737C3.271 16.5738 3.271 16.5738 3.271 16.5739C3.271 16.574 3.271 16.574 3.271 16.5741C3.271 16.5741 3.271 16.5742 3.271 16.5743C3.271 16.5743 3.271 16.5744 3.271 16.5744C3.271 16.5745 3.271 16.5745 3.271 16.5746C3.271 16.5747 3.271 16.5747 3.271 16.5748C3.271 16.5748 3.271 16.5749 3.271 16.5749C3.271 16.575 3.271 16.5751 3.271 16.5751C3.271 16.5752 3.271 16.5752 3.271 16.5753C3.271 16.5753 3.271 16.5754 3.271 16.5754C3.271 16.5755 3.271 16.5755 3.271 16.5756C3.271 16.5757 3.271 16.5757 3.271 16.5758C3.271 16.5758 3.271 16.5759 3.271 16.5759C3.271 16.576 3.271 16.576 3.271 16.5761C3.271 16.5761 3.271 16.5762 3.271 16.5762C3.271 16.5763 3.271 16.5763 3.271 16.5764C3.271 16.5764 3.271 16.5765 3.271 16.5765C3.271 16.5766 3.271 16.5766 3.271 16.5767C3.271 16.5767 3.271 16.5768 3.271 16.5768C3.271 16.5769 3.271 16.5769 3.271 16.577C3.271 16.577 3.271 16.5771 3.271 16.5771C3.271 16.5772 3.271 16.5772 3.271 16.5773C3.271 16.5773 3.271 16.5774 3.271 16.5774C3.271 16.5774 3.271 16.5775 3.271 16.5775C3.271 16.5776 3.271 16.5776 3.271 16.5777C3.271 16.5777 3.271 16.5778 3.271 16.5778C3.271 16.5779 3.271 16.5779 3.271 16.5779C3.271 16.578 3.271 16.578 3.271 16.5781C3.271 16.5781 3.271 16.5782 3.271 16.5782C3.271 16.5783 3.271 16.5783 3.271 16.5783C3.271 16.5784 3.271 16.5784 3.271 16.5785C3.271 16.5785 3.271 16.5785 3.271 16.5786C3.271 16.5786 3.271 16.5787 3.271 16.5787C3.271 16.5788 3.271 16.5788 3.271 16.5788C3.271 16.5789 3.271 16.5789 3.271 16.579C3.271 16.579 3.271 16.579 3.271 16.5791C3.271 16.5791 3.271 16.5791 3.271 16.5792C3.271 16.5792 3.271 16.5793 3.271 16.5793C3.271 16.5793 3.271 16.5794 3.271 16.5794C3.271 16.5795 3.271 16.5795 3.271 16.5795C3.271 16.5796 3.271 16.5796 3.271 16.5796C3.271 16.5797 3.271 16.5797 3.271 16.5797C3.271 16.5798 3.271 16.5798 3.271 16.5798C3.271 16.5799 3.271 16.5799 3.271 16.58C3.271 16.58 3.271 16.58 3.271 16.5801C3.271 16.5801 3.271 16.5801 3.271 16.5802C3.271 16.5802 3.271 16.5802 3.271 16.5803C3.271 16.5803 3.271 16.5803 3.271 16.5803C3.271 16.5804 3.271 16.5804 3.271 16.5804C3.271 16.5805 3.271 16.5805 3.271 16.5805C3.271 16.5806 3.271 16.5806 3.271 16.5806C3.271 16.5807 3.271 16.5807 3.271 16.5807C3.271 16.5808 3.271 16.5808 3.271 16.5808C3.271 16.5808 3.271 16.5809 3.271 16.5809C3.271 16.5809 3.271 16.581 3.271 16.581C3.271 16.581 3.271 16.581 3.271 16.5811C3.271 16.5811 3.271 16.5811 3.271 16.5811C3.271 16.5812 3.271 16.5812 3.271 16.5812C3.271 16.5813 3.271 16.5813 3.271 16.5813C3.271 16.5813 3.271 16.5814 3.271 16.5814C3.271 16.5814 3.271 16.5814 3.271 16.5815C3.271 16.5815 3.271 16.5815 3.271 16.5815C3.271 16.5815 3.271 16.5816 3.271 16.5816C3.271 16.5816 3.271 16.5816 3.271 16.5817C3.271 16.5817 3.271 16.5817 3.271 16.5817C3.271 16.5818 3.271 16.5818 3.271 16.5818C3.271 16.5818 3.271 16.5818 3.271 16.5819C3.271 16.5819 3.271 16.5819 3.271 16.5819C3.271 16.5819 3.271 16.582 3.271 16.582C3.271 16.582 3.271 16.582 3.271 16.582C3.271 16.5821 3.271 16.5821 3.271 16.5821C3.271 16.5821 3.271 16.5821 3.271 16.5822C3.271 16.5822 3.271 16.5822 3.271 16.5822C3.271 16.5822 3.271 16.5822 3.271 16.5823C3.271 16.5823 3.271 16.5823 3.271 16.5823C3.271 16.5823 3.271 16.5823 3.271 16.5824C3.271 16.5824 3.271 16.5824 3.271 16.5824C3.271 16.5824 3.271 16.5824 3.271 16.5824C3.271 16.5825 3.271 16.5825 3.271 16.5825C3.271 16.5825 3.271 16.5825 3.271 16.5825C3.271 16.5825 3.271 16.5826 3.271 16.5826C3.271 16.5826 3.271 16.5826 3.271 16.5826C3.271 16.5826 3.271 16.5826 3.271 16.5826C3.271 16.5827 3.271 16.5827 3.271 16.5827C3.271 16.5827 3.271 16.5827 3.271 16.5827C3.271 16.5827 3.271 16.5827 3.271 16.5827C3.271 16.5828 3.271 16.5828 3.271 16.5828C3.271 16.5828 3.271 16.5828 3.271 16.5828C3.271 16.5828 3.271 16.5828 3.271 16.5828C3.271 16.5828 3.271 16.5828 3.271 16.5828C3.271 16.5829 3.271 16.5829 3.271 16.5829C3.271 16.5829 3.271 16.5829 3.271 16.5829C3.271 16.5829 3.271 16.5829 3.271 16.5829C3.271 16.5829 3.271 16.5829 3.271 16.5829C3.271 16.5829 3.271 16.5829 3.271 16.5829C3.271 16.5829 3.271 16.5829 3.271 16.5829C3.271 16.583 3.271 16.583 3.271 16.583C3.271 16.583 3.271 16.583 3.271 16.583C3.271 16.583 3.271 16.583 3.271 16.583C3.271 16.583 3.271 16.583 3.271 16.583C3.271 16.583 3.271 16.583 3.271 16.583C3.271 16.583 3.271 16.583 3.271 16.583C3.271 16.583 3.271 16.583 4.271 16.583ZM5.271 16.354C5.271 16.3537 5.271 16.3534 5.271 16.3531C5.271 16.3528 5.271 16.3525 5.271 16.3522C5.271 16.3519 5.271 16.3516 5.271 16.3513C5.271 16.351 5.271 16.3507 5.271 16.3504C5.271 16.3501 5.271 16.3498 5.271 16.3495C5.271 16.3492 5.271 16.3489 5.271 16.3486C5.271 16.3483 5.271 16.348 5.271 16.3477C5.271 16.3474 5.271 16.3471 5.271 16.3468C5.271 16.3465 5.271 16.3462 5.271 16.3459C5.271 16.3456 5.271 16.3453 5.271 16.345C5.271 16.3447 5.271 16.3444 5.271 16.3441C5.271 16.3438 5.271 16.3435 5.271 16.3432C5.271 16.3429 5.271 16.3426 5.271 16.3423C5.271 16.342 5.271 16.3417 5.271 16.3414C5.271 16.3411 5.271 16.3408 5.271 16.3405C5.271 16.3402 5.271 16.3399 5.271 16.3396C5.271 16.3393 5.271 16.339 5.271 16.3386C5.271 16.3383 5.271 16.338 5.271 16.3377C5.271 16.3374 5.271 16.3371 5.271 16.3368C5.271 16.3365 5.271 16.3362 5.271 16.3359C5.271 16.3356 5.271 16.3353 5.271 16.335C5.271 16.3347 5.271 16.3344 5.271 16.3341C5.271 16.3338 5.271 16.3335 5.271 16.3332C5.271 16.3329 5.271 16.3326 5.271 16.3322C5.271 16.3319 5.271 16.3316 5.271 16.3313C5.271 16.331 5.271 16.3307 5.271 16.3304C5.271 16.3301 5.271 16.3298 5.271 16.3295C5.271 16.3292 5.271 16.3289 5.271 16.3286C5.271 16.3283 5.271 16.328 5.271 16.3277C5.271 16.3273 5.271 16.327 5.271 16.3267C5.271 16.3264 5.271 16.3261 5.271 16.3258C5.271 16.3255 5.271 16.3252 5.271 16.3249C5.271 16.3246 5.271 16.3243 5.271 16.324C5.271 16.3236 5.271 16.3233 5.271 16.323C5.271 16.3227 5.271 16.3224 5.271 16.3221C5.271 16.3218 5.271 16.3215 5.271 16.3212C5.271 16.3209 5.271 16.3206 5.271 16.3202C5.271 16.3199 5.271 16.3196 5.271 16.3193C5.271 16.319 5.271 16.3187 5.271 16.3184C5.271 16.3181 5.271 16.3178 5.271 16.3174C5.271 16.3171 5.271 16.3168 5.271 16.3165C5.271 16.3162 5.271 16.3159 5.271 16.3156C5.271 16.3153 5.271 16.315 5.271 16.3146C5.271 16.3143 5.271 16.314 5.271 16.3137C5.271 16.3134 5.271 16.3131 5.271 16.3128C5.271 16.3125 5.271 16.3121 5.271 16.3118C5.271 16.3115 5.271 16.3112 5.271 16.3109C5.271 16.3106 5.271 16.3103 5.271 16.31C5.271 16.3096 5.271 16.3093 5.271 16.309C5.271 16.3087 5.271 16.3084 5.271 16.3081C5.271 16.3078 5.271 16.3074 5.271 16.3071C5.271 16.3068 5.271 16.3065 5.271 16.3062C5.271 16.3059 5.271 16.3056 5.271 16.3052C5.271 16.3049 5.271 16.3046 5.271 16.3043C5.271 16.304 5.271 16.3037 5.271 16.3034C5.271 16.303 5.271 16.3027 5.271 16.3024C5.271 16.3021 5.271 16.3018 5.271 16.3015C5.271 16.3011 5.271 16.3008 5.271 16.3005C5.271 16.3002 5.271 16.2999 5.271 16.2996C5.271 16.2992 5.271 16.2989 5.271 16.2986C5.271 16.2983 5.271 16.298 5.271 16.2977C5.271 16.2973 5.271 16.297 5.271 16.2967C5.271 16.2964 5.271 16.2961 5.271 16.2957C5.271 16.2954 5.271 16.2951 5.271 16.2948C5.271 16.2945 5.271 16.2942 5.271 16.2938C5.271 16.2935 5.271 16.2932 5.271 16.2929C5.271 16.2926 5.271 16.2922 5.271 16.2919C5.271 16.2916 5.271 16.2913 5.271 16.291C5.271 16.2906 5.271 16.2903 5.271 16.29C5.271 16.2897 5.271 16.2894 5.271 16.289C5.271 16.2887 5.271 16.2884 5.271 16.2881C5.271 16.2878 5.271 16.2874 5.271 16.2871C5.271 16.2868 5.271 16.2865 5.271 16.2862C5.271 16.2858 5.271 16.2855 5.271 16.2852C5.271 16.2849 5.271 16.2845 5.271 16.2842C5.271 16.2839 5.271 16.2836 5.271 16.2833C5.271 16.2829 5.271 16.2826 5.271 16.2823C5.271 16.282 5.271 16.2816 5.271 16.2813C5.271 16.281 5.271 16.2807 5.271 16.2803C5.271 16.28 5.271 16.2797 5.271 16.2794C5.271 16.2791 5.271 16.2787 5.271 16.2784C5.271 16.2781 5.271 16.2778 5.271 16.2774C5.271 16.2771 5.271 16.2768 5.271 16.2765C5.271 16.2761 5.271 16.2758 5.271 16.2755C5.271 16.2752 5.271 16.2748 5.271 16.2745C5.271 16.2742 5.271 16.2739 5.271 16.2735C5.271 16.2732 5.271 16.2729 5.271 16.2726C5.271 16.2722 5.271 16.2719 5.271 16.2716C5.271 16.2713 5.271 16.2709 5.271 16.2706C5.271 16.2703 5.271 16.2699 5.271 16.2696C5.271 16.2693 5.271 16.269 5.271 16.2686C5.271 16.2683 5.271 16.268 5.271 16.2677C5.271 16.2673 5.271 16.267 5.271 16.2667C5.271 16.2663 5.271 16.266 5.271 16.2657C5.271 16.2654 5.271 16.265 5.271 16.2647C5.271 16.2644 5.271 16.2641 5.271 16.2637C5.271 16.2634 5.271 16.2631 5.271 16.2627C5.271 16.2624 5.271 16.2621 5.271 16.2617C5.271 16.2614 5.271 16.2611 5.271 16.2608C5.271 16.2604 5.271 16.2601 5.271 16.2598C5.271 16.2594 5.271 16.2591 5.271 16.2588C5.271 16.2585 5.271 16.2581 5.271 16.2578C5.271 16.2575 5.271 16.2571 5.271 16.2568C5.271 16.2565 5.271 16.2561 5.271 16.2558C5.271 16.2555 5.271 16.2551 5.271 16.2548C5.271 16.2545 5.271 16.2541 5.271 16.2538C5.271 16.2535 5.271 16.2532 5.271 16.2528C5.271 16.2525 5.271 16.2522 5.271 16.2518C5.271 16.2515 5.271 16.2512 5.271 16.2508C5.271 16.2505 5.271 16.2502 5.271 16.2498C5.271 16.2495 5.271 16.2492 5.271 16.2488C5.271 16.2485 5.271 16.2482 5.271 16.2478C5.271 16.2475 5.271 16.2472 5.271 16.2468C5.271 16.2465 5.271 16.2462 5.271 16.2458C5.271 16.2455 5.271 16.2451 5.271 16.2448C5.271 16.2445 5.271 16.2441 5.271 16.2438C5.271 16.2435 5.271 16.2431 5.271 16.2428C5.271 16.2425 5.271 16.2421 5.271 16.2418C5.271 16.2415 5.271 16.2411 5.271 16.2408C5.271 16.2405 5.271 16.2401 5.271 16.2398C5.271 16.2394 5.271 16.2391 5.271 16.2388C5.271 16.2384 5.271 16.2381 5.271 16.2378C5.271 16.2374 5.271 16.2371 5.271 16.2368C5.271 16.2364 5.271 16.2361 5.271 16.2357C5.271 16.2354 5.271 16.2351 5.271 16.2347C5.271 16.2344 5.271 16.234 5.271 16.2337C5.271 16.2334 5.271 16.233 5.271 16.2327C5.271 16.2324 5.271 16.232 5.271 16.2317C5.271 16.2313 5.271 16.231 5.271 16.2307C5.271 16.2303 5.271 16.23 5.271 16.2296C5.271 16.2293 5.271 16.229 5.271 16.2286C5.271 16.2283 5.271 16.2279 5.271 16.2276C5.271 16.2273 5.271 16.2269 5.271 16.2266C5.271 16.2262 5.271 16.2259 5.271 16.2256C5.271 16.2252 5.271 16.2249 5.271 16.2245C5.271 16.2242 5.271 16.2239 5.271 16.2235C5.271 16.2232 5.271 16.2228 5.271 16.2225C5.271 16.2221 5.271 16.2218 5.271 16.2215C5.271 16.2211 5.271 16.2208 5.271 16.2204C5.271 16.2201 5.271 16.2198 5.271 16.2194C5.271 16.2191 5.271 16.2187 5.271 16.2184C5.271 16.218 5.271 16.2177 5.271 16.2174C5.271 16.217 5.271 16.2167 5.271 16.2163C5.271 16.216 5.271 16.2156 5.271 16.2153C5.271 16.2149 5.271 16.2146 5.271 16.2143C5.271 16.2139 5.271 16.2136 5.271 16.2132C5.271 16.2129 5.271 16.2125 5.271 16.2122C5.271 16.2118 5.271 16.2115 5.271 16.2112C5.271 16.2108 5.271 16.2105 5.271 16.2101C5.271 16.2098 5.271 16.2094 5.271 16.2091C5.271 16.2087 5.271 16.2084 5.271 16.208C5.271 16.2077 5.271 16.2074 5.271 16.207C5.271 16.2067 5.271 16.2063 5.271 16.206C5.271 16.2056 5.271 16.2053 5.271 16.2049C5.271 16.2046 5.271 16.2042 5.271 16.2039C5.271 16.2035 5.271 16.2032 5.271 16.2028C5.271 16.2025 5.271 16.2021 5.271 16.2018C5.271 16.2014 5.271 16.2011 5.271 16.2008C5.271 16.2004 5.271 16.2001 5.271 16.1997C5.271 16.1994 5.271 16.199 5.271 16.1987C5.271 16.1983 5.271 16.198 5.271 16.1976C5.271 16.1973 5.271 16.1969 5.271 16.1966C5.271 16.1962 5.271 16.1959 5.271 16.1955C5.271 16.1952 5.271 16.1948 5.271 16.1945C5.271 16.1941 5.271 16.1938 5.271 16.1934C5.271 16.1931 5.271 16.1927 5.271 16.1924C5.271 16.192 5.271 16.1917 5.271 16.1913C5.271 16.191 5.271 16.1906 5.271 16.1903C5.271 16.1899 5.271 16.1895 5.271 16.1892C5.271 16.1888 5.271 16.1885 5.271 16.1881C5.271 16.1878 5.271 16.1874 5.271 16.1871C5.271 16.1867 5.271 16.1864 5.271 16.186C5.271 16.1857 5.271 16.1853 5.271 16.185C5.271 16.1846 5.271 16.1843 5.271 16.1839C5.271 16.1836 5.271 16.1832 5.271 16.1828C5.271 16.1825 5.271 16.1821 5.271 16.1818C5.271 16.1814 5.271 16.1811 5.271 16.1807C5.271 16.1804 5.271 16.18 5.271 16.1797C5.271 16.1793 5.271 16.1789 5.271 16.1786C5.271 16.1782 5.271 16.1779 5.271 16.1775C5.271 16.1772 5.271 16.1768 5.271 16.1765C5.271 16.1761 5.271 16.1757 5.271 16.1754C5.271 16.175 5.271 16.1747 5.271 16.1743C5.271 16.174 5.271 16.1736 5.271 16.1733C5.271 16.1729 5.271 16.1725 5.271 16.1722C5.271 16.1718 5.271 16.1715 5.271 16.1711C5.271 16.1708 5.271 16.1704 5.271 16.17C5.271 16.1697 5.271 16.1693 5.271 16.169C5.271 16.1686 5.271 16.1683 5.271 16.1679C5.271 16.1675 5.271 16.1672 5.271 16.1668C5.271 16.1665 5.271 16.1661 5.271 16.1657C5.271 16.1654 5.271 16.165 5.271 16.1647C5.271 16.1643 5.271 16.1639 5.271 16.1636C5.271 16.1632 5.271 16.1629 5.271 16.1625C5.271 16.1621 5.271 16.1618 5.271 16.1614C5.271 16.1611 5.271 16.1607 5.271 16.1603C5.271 16.16 5.271 16.1596 5.271 16.1593C5.271 16.1589 5.271 16.1585 5.271 16.1582C5.271 16.1578 5.271 16.1575 5.271 16.1571C5.271 16.1567 5.271 16.1564 5.271 16.156C5.271 16.1557 5.271 16.1553 5.271 16.1549C5.271 16.1546 5.271 16.1542 5.271 16.1538C5.271 16.1535 5.271 16.1531 5.271 16.1528C5.271 16.1524 5.271 16.152 5.271 16.1517C5.271 16.1513 5.271 16.1509 5.271 16.1506C5.271 16.1502 5.271 16.1498 5.271 16.1495C5.271 16.1491 5.271 16.1488 5.271 16.1484C5.271 16.148 5.271 16.1477 5.271 16.1473C5.271 16.1469 5.271 16.1466 5.271 16.1462C5.271 16.1458 5.271 16.1455 5.271 16.1451C5.271 16.1447 5.271 16.1444 5.271 16.144C5.271 16.1437 5.271 16.1433 5.271 16.1429C5.271 16.1426 5.271 16.1422 5.271 16.1418C5.271 16.1415 5.271 16.1411 5.271 16.1407C5.271 16.1404 5.271 16.14 5.271 16.1396C5.271 16.1393 5.271 16.1389 5.271 16.1385C5.271 16.1382 5.271 16.1378 5.271 16.1374C5.271 16.1371 5.271 16.1367 5.271 16.1363C5.271 16.136 5.271 16.1356 5.271 16.1352C5.271 16.1349 5.271 16.1345 5.271 16.1341C5.271 16.1337 5.271 16.1334 5.271 16.133C5.271 16.1326 5.271 16.1323 5.271 16.1319C5.271 16.1315 5.271 16.1312 5.271 16.1308C5.271 16.1304 5.271 16.1301 5.271 16.1297C5.271 16.1293 5.271 16.129 5.271 16.1286C5.271 16.1282 5.271 16.1278 5.271 16.1275C5.271 16.1271 5.271 16.1267 5.271 16.1264C5.271 16.126 5.271 16.1256 5.271 16.1253C5.271 16.1249 5.271 16.1245 5.271 16.1241C5.271 16.1238 5.271 16.1234 5.271 16.123C5.271 16.1227 5.271 16.1223 5.271 16.1219C5.271 16.1215 5.271 16.1212 5.271 16.1208C5.271 16.1204 5.271 16.1201 5.271 16.1197C5.271 16.1193 5.271 16.1189 5.271 16.1186C5.271 16.1182 5.271 16.1178 5.271 16.1174C5.271 16.1171 5.271 16.1167 5.271 16.1163C5.271 16.116 5.271 16.1156 5.271 16.1152C5.271 16.1148 5.271 16.1145 5.271 16.1141C5.271 16.1137 5.271 16.1133 5.271 16.113C5.271 16.1126 5.271 16.1122 5.271 16.1118C5.271 16.1115 5.271 16.1111 5.271 16.1107C5.271 16.1103 5.271 16.11 5.271 16.1096C5.271 16.1092 5.271 16.1088 5.271 16.1085C5.271 16.1081 5.271 16.1077 5.271 16.1073C5.271 16.107 5.271 16.1066 5.271 16.1062C5.271 16.1058 5.271 16.1055 5.271 16.1051C5.271 16.1047 5.271 16.1043 5.271 16.104C5.271 16.1036 5.271 16.1032 5.271 16.1028C5.271 16.1024 5.271 16.1021 5.271 16.1017C5.271 16.1013 5.271 16.1009 5.271 16.1006C5.271 16.1002 5.271 16.0998 5.271 16.0994C5.271 16.099 5.271 16.0987 5.271 16.0983C5.271 16.0979 5.271 16.0975 5.271 16.0972C5.271 16.0968 5.271 16.0964 5.271 16.096C5.271 16.0956 5.271 16.0953 5.271 16.0949C5.271 16.0945 5.271 16.0941 5.271 16.0937C5.271 16.0934 5.271 16.093 5.271 16.0926C5.271 16.0922 5.271 16.0918 5.271 16.0915C5.271 16.0911 5.271 16.0907 5.271 16.0903C5.271 16.0899 5.271 16.0896 5.271 16.0892C5.271 16.0888 5.271 16.0884 5.271 16.088C5.271 16.0877 5.271 16.0873 5.271 16.0869C5.271 16.0865 5.271 16.0861 5.271 16.0857C5.271 16.0854 5.271 16.085 5.271 16.0846C5.271 16.0842 5.271 16.0838 5.271 16.0835C5.271 16.0831 5.271 16.0827 5.271 16.0823C5.271 16.0819 5.271 16.0815 5.271 16.0812C5.271 16.0808 5.271 16.0804 5.271 16.08C5.271 16.0796 5.271 16.0792 5.271 16.0789C5.271 16.0785 5.271 16.0781 5.271 16.0777C5.271 16.0773 5.271 16.0769 5.271 16.0766C5.271 16.0762 5.271 16.0758 5.271 16.0754C5.271 16.075 5.271 16.0746 5.271 16.0742C5.271 16.0739 5.271 16.0735 5.271 16.0731C5.271 16.0727 5.271 16.0723 5.271 16.0719C5.271 16.0715 5.271 16.0712 5.271 16.0708C5.271 16.0704 5.271 16.07 5.271 16.0696C5.271 16.0692 5.271 16.0688 5.271 16.0685C5.271 16.0681 5.271 16.0677 5.271 16.0673C5.271 16.0669 5.271 16.0665 5.271 16.0661C5.271 16.0658 5.271 16.0654 5.271 16.065C5.271 16.0646 5.271 16.0642 5.271 16.0638C5.271 16.0634 5.271 16.063 5.271 16.0627C5.271 16.0623 5.271 16.0619 5.271 16.0615C5.271 16.0611 5.271 16.0607 5.271 16.0603C5.271 16.0599 5.271 16.0595 5.271 16.0592C5.271 16.0588 5.271 16.0584 5.271 16.058C5.271 16.0576 5.271 16.0572 5.271 16.0568C5.271 16.0564 5.271 16.056 5.271 16.0556C5.271 16.0553 5.271 16.0549 5.271 16.0545C5.271 16.0541 5.271 16.0537 5.271 16.0533C5.271 16.0529 5.271 16.0525 5.271 16.0521C5.271 16.0517 5.271 16.0513 5.271 16.051C5.271 16.0506 5.271 16.0502 5.271 16.0498C5.271 16.0494 5.271 16.049 5.271 16.0486C5.271 16.0482 5.271 16.0478 5.271 16.0474C5.271 16.047 5.271 16.0466 5.271 16.0463C5.271 16.0459 5.271 16.0455 5.271 16.0451C5.271 16.0447 5.271 16.0443 5.271 16.0439C5.271 16.0435 5.271 16.0431 5.271 16.0427C5.271 16.0423 5.271 16.0419 5.271 16.0415C5.271 16.0411 5.271 16.0407 5.271 16.0404C5.271 16.04 5.271 16.0396 5.271 16.0392C5.271 16.0388 5.271 16.0384 5.271 16.038C5.271 16.0376 5.271 16.0372 5.271 16.0368C5.271 16.0364 5.271 16.036 5.271 16.0356C5.271 16.0352 5.271 16.0348 5.271 16.0344C5.271 16.034 5.271 16.0336 5.271 16.0332C5.271 16.0328 5.271 16.0324 5.271 16.0321C5.271 16.0317 5.271 16.0313 5.271 16.0309C5.271 16.0305 5.271 16.0301 5.271 16.0297C5.271 16.0293 5.271 16.0289 5.271 16.0285C5.271 16.0281 5.271 16.0277 5.271 16.0273C5.271 16.0269 5.271 16.0265 5.271 16.0261C5.271 16.0257 5.271 16.0253 5.271 16.0249C5.271 16.0245 5.271 16.0241 5.271 16.0237C5.271 16.0233 5.271 16.0229 5.271 16.0225C5.271 16.0221 5.271 16.0217 5.271 16.0213C5.271 16.0209 5.271 16.0205 5.271 16.0201C5.271 16.0197 5.271 16.0193 5.271 16.0189C5.271 16.0185 5.271 16.0181 5.271 16.0177C5.271 16.0173 5.271 16.0169 5.271 16.0165C5.271 16.0161 5.271 16.0157 5.271 16.0153C5.271 16.0149 5.271 16.0145 5.271 16.0141C5.271 16.0137 5.271 16.0133 5.271 16.0129C5.271 16.0125 5.271 16.0121 5.271 16.0117C5.271 16.0113 5.271 16.0109 5.271 16.0105C5.271 16.0101 5.271 16.0097 5.271 16.0093C5.271 16.0089 5.271 16.0085 5.271 16.0081C5.271 16.0077 5.271 16.0073 5.271 16.0069C5.271 16.0065 5.271 16.0061 5.271 16.0057C5.271 16.0053 5.271 16.0049 5.271 16.0044C5.271 16.004 5.271 16.0036 5.271 16.0032C5.271 16.0028 5.271 16.0024 5.271 16.002C5.271 16.0016 5.271 16.0012 5.271 16.0008C5.271 16.0004 5.271 16 5.271 15.9996C5.271 15.9992 5.271 15.9988 5.271 15.9984C5.271 15.998 5.271 15.9976 5.271 15.9972C5.271 15.9968 5.271 15.9964 5.271 15.9959C5.271 15.9955 5.271 15.9951 5.271 15.9947C5.271 15.9943 5.271 15.9939 5.271 15.9935C5.271 15.9931 5.271 15.9927 5.271 15.9923C5.271 15.9919 5.271 15.9915 5.271 15.9911C5.271 15.9907 5.271 15.9903 5.271 15.9898C5.271 15.9894 5.271 15.989 5.271 15.9886C5.271 15.9882 5.271 15.9878 5.271 15.9874C5.271 15.987 5.271 15.9866 5.271 15.9862C5.271 15.9858 5.271 15.9854 5.271 15.9849C5.271 15.9845 5.271 15.9841 5.271 15.9837C5.271 15.9833 5.271 15.9829 5.271 15.9825C5.271 15.9821 5.271 15.9817 5.271 15.9813C5.271 15.9809 5.271 15.9804 5.271 15.98C5.271 15.9796 5.271 15.9792 5.271 15.9788C5.271 15.9784 5.271 15.978 5.271 15.9776C5.271 15.9772 5.271 15.9768 5.271 15.9763C5.271 15.9759 5.271 15.9755 5.271 15.9751C5.271 15.9747 5.271 15.9743 5.271 15.9739C5.271 15.9735 5.271 15.973 5.271 15.9726C5.271 15.9722 5.271 15.9718 5.271 15.9714C5.271 15.971 5.271 15.9706 5.271 15.9702C5.271 15.9698 5.271 15.9693 5.271 15.9689C5.271 15.9685 5.271 15.9681 5.271 15.9677C5.271 15.9673 5.271 15.9669 5.271 15.9664C5.271 15.966 5.271 15.9656 5.271 15.9652C5.271 15.9648 5.271 15.9644 5.271 15.964C5.271 15.9635 5.271 15.9631 5.271 15.9627C5.271 15.9623 5.271 15.9619 5.271 15.9615C5.271 15.9611 5.271 15.9606 5.271 15.9602C5.271 15.9598 5.271 15.9594 5.271 15.959C5.271 15.9586 5.271 15.9582 5.271 15.9577C5.271 15.9573 5.271 15.9569 5.271 15.9565C5.271 15.9561 5.271 15.9557 5.271 15.9552C5.271 15.9548 5.271 15.9544 5.271 15.954C5.271 15.9536 5.271 15.9532 5.271 15.9527C5.271 15.9523 5.271 15.9519 5.271 15.9515C5.271 15.9511 5.271 15.9507 5.271 15.9502C5.271 15.9498 5.271 15.9494 5.271 15.949C5.271 15.9486 5.271 15.9481 5.271 15.9477C5.271 15.9473 5.271 15.9469 5.271 15.9465C5.271 15.9461 5.271 15.9456 5.271 15.9452C5.271 15.9448 5.271 15.9444 5.271 15.944C5.271 15.9435 5.271 15.9431 5.271 15.9427C5.271 15.9423 5.271 15.9419 5.271 15.9414C5.271 15.941 5.271 15.9406 5.271 15.9402C5.271 15.9398 5.271 15.9393 5.271 15.9389C5.271 15.9385 5.271 15.9381 5.271 15.9377C5.271 15.9372 5.271 15.9368 5.271 15.9364C5.271 15.936 5.271 15.9356 5.271 15.9351C5.271 15.9347 5.271 15.9343 5.271 15.9339C5.271 15.9334 5.271 15.933 5.271 15.9326C5.271 15.9322 5.271 15.9318 5.271 15.9313C5.271 15.9309 5.271 15.9305 5.271 15.9301C5.271 15.9296 5.271 15.9292 5.271 15.9288C5.271 15.9284 5.271 15.9279 5.271 15.9275C5.271 15.9271 5.271 15.9267 5.271 15.9263C5.271 15.9258 5.271 15.9254 5.271 15.925C5.271 15.9246 5.271 15.9241 5.271 15.9237C5.271 15.9233 5.271 15.9229 5.271 15.9224C5.271 15.922 5.271 15.9216 5.271 15.9212C5.271 15.9207 5.271 15.9203 5.271 15.9199C5.271 15.9195 5.271 15.919 5.271 15.9186C5.271 15.9182 5.271 15.9178 5.271 15.9173C5.271 15.9169 5.271 15.9165 5.271 15.9161C5.271 15.9156 5.271 15.9152 5.271 15.9148C5.271 15.9143 5.271 15.9139 5.271 15.9135C5.271 15.9131 5.271 15.9126 5.271 15.9122C5.271 15.9118 5.271 15.9114 5.271 15.9109C5.271 15.9105 5.271 15.9101 5.271 15.9096C5.271 15.9092 5.271 15.9088 5.271 15.9084C5.271 15.9079 5.271 15.9075 5.271 15.9071C5.271 15.9066 5.271 15.9062 5.271 15.9058C5.271 15.9054 5.271 15.9049 5.271 15.9045C5.271 15.9041 5.271 15.9036 5.271 15.9032C5.271 15.9028 5.271 15.9024 5.271 15.9019C5.271 15.9015 5.271 15.9011 5.271 15.9006C5.271 15.9002 5.271 15.8998 5.271 15.8993C5.271 15.8989 5.271 15.8985 5.271 15.8981C5.271 15.8976 5.271 15.8972 5.271 15.8968C5.271 15.8963 5.271 15.8959 5.271 15.8955C5.271 15.895 5.271 15.8946 5.271 15.8942C5.271 15.8937 5.271 15.8933 5.271 15.8929C5.271 15.8924 5.271 15.892 5.271 15.8916C5.271 15.8912 5.271 15.8907 5.271 15.8903C5.271 15.8899 5.271 15.8894 5.271 15.889C5.271 15.8886 5.271 15.8881 5.271 15.8877C5.271 15.8873 5.271 15.8868 5.271 15.8864C5.271 15.886 5.271 15.8855 5.271 15.8851C5.271 15.8847 5.271 15.8842 5.271 15.8838C5.271 15.8833 5.271 15.8829 5.271 15.8825C5.271 15.882 5.271 15.8816 5.271 15.8812C5.271 15.8807 5.271 15.8803 5.271 15.8799C5.271 15.8794 5.271 15.879 5.271 15.8786C5.271 15.8781 5.271 15.8777 5.271 15.8773C5.271 15.8768 5.271 15.8764 5.271 15.876C5.271 15.8755 5.271 15.8751 5.271 15.8746C5.271 15.8742 5.271 15.8738 5.271 15.8733C5.271 15.8729 5.271 15.8725 5.271 15.872C5.271 15.8716 5.271 15.8711 5.271 15.8707C5.271 15.8703 5.271 15.8698 5.271 15.8694C5.271 15.869 5.271 15.8685 5.271 15.8681C5.271 15.8676 5.271 15.8672 5.271 15.8668C5.271 15.8663 5.271 15.8659 5.271 15.8655C5.271 15.865 5.271 15.8646 5.271 15.8641C5.271 15.8637 5.271 15.8633 5.271 15.8628C5.271 15.8624 5.271 15.8619 5.271 15.8615C5.271 15.8611 5.271 15.8606 5.271 15.8602C5.271 15.8597 5.271 15.8593 5.271 15.8589C5.271 15.8584 5.271 15.858 5.271 15.8575C5.271 15.8571 5.271 15.8567 5.271 15.8562C5.271 15.8558 5.271 15.8553 5.271 15.8549C5.271 15.8545 5.271 15.854 5.271 15.8536C5.271 15.8531 5.271 15.8527 5.271 15.8522C5.271 15.8518 5.271 15.8514 5.271 15.8509C5.271 15.8505 5.271 15.85 5.271 15.8496C5.271 15.8491 5.271 15.8487 5.271 15.8483C5.271 15.8478 5.271 15.8474 5.271 15.8469C5.271 15.8465 5.271 15.846 5.271 15.8456C5.271 15.8452 5.271 15.8447 5.271 15.8443C5.271 15.8438 5.271 15.8434 5.271 15.8429C5.271 15.8425 5.271 15.8421 5.271 15.8416C5.271 15.8412 5.271 15.8407 5.271 15.8403C5.271 15.8398 5.271 15.8394 5.271 15.8389C5.271 15.8385 5.271 15.8381 5.271 15.8376C5.271 15.8372 5.271 15.8367 5.271 15.8363C5.271 15.8358 5.271 15.8354 5.271 15.8349C5.271 15.8345 5.271 15.834 5.271 15.8336C5.271 15.8331 5.271 15.8327 5.271 15.8323C5.271 15.8318 5.271 15.8314 5.271 15.8309C5.271 15.8305 5.271 15.83 5.271 15.8296C5.271 15.8291 5.271 15.8287 5.271 15.8282C5.271 15.8278 5.271 15.8273 5.271 15.8269C5.271 15.8264 5.271 15.826 5.271 15.8255C5.271 15.8251 5.271 15.8246 5.271 15.8242C5.271 15.8237 5.271 15.8233 5.271 15.8229C5.271 15.8224 5.271 15.822 5.271 15.8215C5.271 15.8211 5.271 15.8206 5.271 15.8202C5.271 15.8197 5.271 15.8193 5.271 15.8188C5.271 15.8184 5.271 15.8179 5.271 15.8175C5.271 15.817 5.271 15.8166 5.271 15.8161C5.271 15.8157 5.271 15.8152 5.271 15.8148C5.271 15.8143 5.271 15.8139 5.271 15.8134C5.271 15.813 5.271 15.8125 5.271 15.812C5.271 15.8116 5.271 15.8111 5.271 15.8107C5.271 15.8102 5.271 15.8098 5.271 15.8093C5.271 15.8089 5.271 15.8084 5.271 15.808C5.271 15.8075 5.271 15.8071 5.271 15.8066C5.271 15.8062 5.271 15.8057 5.271 15.8053C5.271 15.8048 5.271 15.8044 5.271 15.8039C5.271 15.8035 5.271 15.803 5.271 15.8025C5.271 15.8021 5.271 15.8016 5.271 15.8012C5.271 15.8007 5.271 15.8003 5.271 15.7998C5.271 15.7994 5.271 15.7989 5.271 15.7985C5.271 15.798 5.271 15.7975 5.271 15.7971C5.271 15.7966 5.271 15.7962 5.271 15.7957C5.271 15.7953 5.271 15.7948 5.271 15.7944C5.271 15.7939 5.271 15.7935 5.271 15.793C5.271 15.7925 5.271 15.7921 5.271 15.7916C5.271 15.7912 5.271 15.7907 5.271 15.7903C5.271 15.7898 5.271 15.7893 5.271 15.7889C5.271 15.7884 5.271 15.788 5.271 15.7875C5.271 15.7871 5.271 15.7866 5.271 15.7861C5.271 15.7857 5.271 15.7852 5.271 15.7848C5.271 15.7843 5.271 15.7839 5.271 15.7834C5.271 15.7829 5.271 15.7825 5.271 15.782C5.271 15.7816 5.271 15.7811 5.271 15.7806C5.271 15.7802 5.271 15.7797 5.271 15.7793C5.271 15.7788 5.271 15.7784 5.271 15.7779C5.271 15.7774 5.271 15.777 5.271 15.7765C5.271 15.7761 5.271 15.7756 5.271 15.7751C5.271 15.7747 5.271 15.7742 5.271 15.7738C5.271 15.7733 5.271 15.7728 5.271 15.7724C5.271 15.7719 5.271 15.7715 5.271 15.771H3.271C3.271 15.7715 3.271 15.7719 3.271 15.7724C3.271 15.7728 3.271 15.7733 3.271 15.7738C3.271 15.7742 3.271 15.7747 3.271 15.7751C3.271 15.7756 3.271 15.7761 3.271 15.7765C3.271 15.777 3.271 15.7774 3.271 15.7779C3.271 15.7784 3.271 15.7788 3.271 15.7793C3.271 15.7797 3.271 15.7802 3.271 15.7806C3.271 15.7811 3.271 15.7816 3.271 15.782C3.271 15.7825 3.271 15.7829 3.271 15.7834C3.271 15.7839 3.271 15.7843 3.271 15.7848C3.271 15.7852 3.271 15.7857 3.271 15.7861C3.271 15.7866 3.271 15.7871 3.271 15.7875C3.271 15.788 3.271 15.7884 3.271 15.7889C3.271 15.7893 3.271 15.7898 3.271 15.7903C3.271 15.7907 3.271 15.7912 3.271 15.7916C3.271 15.7921 3.271 15.7925 3.271 15.793C3.271 15.7935 3.271 15.7939 3.271 15.7944C3.271 15.7948 3.271 15.7953 3.271 15.7957C3.271 15.7962 3.271 15.7966 3.271 15.7971C3.271 15.7975 3.271 15.798 3.271 15.7985C3.271 15.7989 3.271 15.7994 3.271 15.7998C3.271 15.8003 3.271 15.8007 3.271 15.8012C3.271 15.8016 3.271 15.8021 3.271 15.8025C3.271 15.803 3.271 15.8035 3.271 15.8039C3.271 15.8044 3.271 15.8048 3.271 15.8053C3.271 15.8057 3.271 15.8062 3.271 15.8066C3.271 15.8071 3.271 15.8075 3.271 15.808C3.271 15.8084 3.271 15.8089 3.271 15.8093C3.271 15.8098 3.271 15.8102 3.271 15.8107C3.271 15.8111 3.271 15.8116 3.271 15.812C3.271 15.8125 3.271 15.813 3.271 15.8134C3.271 15.8139 3.271 15.8143 3.271 15.8148C3.271 15.8152 3.271 15.8157 3.271 15.8161C3.271 15.8166 3.271 15.817 3.271 15.8175C3.271 15.8179 3.271 15.8184 3.271 15.8188C3.271 15.8193 3.271 15.8197 3.271 15.8202C3.271 15.8206 3.271 15.8211 3.271 15.8215C3.271 15.822 3.271 15.8224 3.271 15.8229C3.271 15.8233 3.271 15.8237 3.271 15.8242C3.271 15.8246 3.271 15.8251 3.271 15.8255C3.271 15.826 3.271 15.8264 3.271 15.8269C3.271 15.8273 3.271 15.8278 3.271 15.8282C3.271 15.8287 3.271 15.8291 3.271 15.8296C3.271 15.83 3.271 15.8305 3.271 15.8309C3.271 15.8314 3.271 15.8318 3.271 15.8323C3.271 15.8327 3.271 15.8331 3.271 15.8336C3.271 15.834 3.271 15.8345 3.271 15.8349C3.271 15.8354 3.271 15.8358 3.271 15.8363C3.271 15.8367 3.271 15.8372 3.271 15.8376C3.271 15.8381 3.271 15.8385 3.271 15.8389C3.271 15.8394 3.271 15.8398 3.271 15.8403C3.271 15.8407 3.271 15.8412 3.271 15.8416C3.271 15.8421 3.271 15.8425 3.271 15.8429C3.271 15.8434 3.271 15.8438 3.271 15.8443C3.271 15.8447 3.271 15.8452 3.271 15.8456C3.271 15.846 3.271 15.8465 3.271 15.8469C3.271 15.8474 3.271 15.8478 3.271 15.8483C3.271 15.8487 3.271 15.8491 3.271 15.8496C3.271 15.85 3.271 15.8505 3.271 15.8509C3.271 15.8514 3.271 15.8518 3.271 15.8522C3.271 15.8527 3.271 15.8531 3.271 15.8536C3.271 15.854 3.271 15.8545 3.271 15.8549C3.271 15.8553 3.271 15.8558 3.271 15.8562C3.271 15.8567 3.271 15.8571 3.271 15.8575C3.271 15.858 3.271 15.8584 3.271 15.8589C3.271 15.8593 3.271 15.8597 3.271 15.8602C3.271 15.8606 3.271 15.8611 3.271 15.8615C3.271 15.8619 3.271 15.8624 3.271 15.8628C3.271 15.8633 3.271 15.8637 3.271 15.8641C3.271 15.8646 3.271 15.865 3.271 15.8655C3.271 15.8659 3.271 15.8663 3.271 15.8668C3.271 15.8672 3.271 15.8676 3.271 15.8681C3.271 15.8685 3.271 15.869 3.271 15.8694C3.271 15.8698 3.271 15.8703 3.271 15.8707C3.271 15.8711 3.271 15.8716 3.271 15.872C3.271 15.8725 3.271 15.8729 3.271 15.8733C3.271 15.8738 3.271 15.8742 3.271 15.8746C3.271 15.8751 3.271 15.8755 3.271 15.876C3.271 15.8764 3.271 15.8768 3.271 15.8773C3.271 15.8777 3.271 15.8781 3.271 15.8786C3.271 15.879 3.271 15.8794 3.271 15.8799C3.271 15.8803 3.271 15.8807 3.271 15.8812C3.271 15.8816 3.271 15.882 3.271 15.8825C3.271 15.8829 3.271 15.8833 3.271 15.8838C3.271 15.8842 3.271 15.8847 3.271 15.8851C3.271 15.8855 3.271 15.886 3.271 15.8864C3.271 15.8868 3.271 15.8873 3.271 15.8877C3.271 15.8881 3.271 15.8886 3.271 15.889C3.271 15.8894 3.271 15.8899 3.271 15.8903C3.271 15.8907 3.271 15.8912 3.271 15.8916C3.271 15.892 3.271 15.8924 3.271 15.8929C3.271 15.8933 3.271 15.8937 3.271 15.8942C3.271 15.8946 3.271 15.895 3.271 15.8955C3.271 15.8959 3.271 15.8963 3.271 15.8968C3.271 15.8972 3.271 15.8976 3.271 15.8981C3.271 15.8985 3.271 15.8989 3.271 15.8993C3.271 15.8998 3.271 15.9002 3.271 15.9006C3.271 15.9011 3.271 15.9015 3.271 15.9019C3.271 15.9024 3.271 15.9028 3.271 15.9032C3.271 15.9036 3.271 15.9041 3.271 15.9045C3.271 15.9049 3.271 15.9054 3.271 15.9058C3.271 15.9062 3.271 15.9066 3.271 15.9071C3.271 15.9075 3.271 15.9079 3.271 15.9084C3.271 15.9088 3.271 15.9092 3.271 15.9096C3.271 15.9101 3.271 15.9105 3.271 15.9109C3.271 15.9114 3.271 15.9118 3.271 15.9122C3.271 15.9126 3.271 15.9131 3.271 15.9135C3.271 15.9139 3.271 15.9143 3.271 15.9148C3.271 15.9152 3.271 15.9156 3.271 15.9161C3.271 15.9165 3.271 15.9169 3.271 15.9173C3.271 15.9178 3.271 15.9182 3.271 15.9186C3.271 15.919 3.271 15.9195 3.271 15.9199C3.271 15.9203 3.271 15.9207 3.271 15.9212C3.271 15.9216 3.271 15.922 3.271 15.9224C3.271 15.9229 3.271 15.9233 3.271 15.9237C3.271 15.9241 3.271 15.9246 3.271 15.925C3.271 15.9254 3.271 15.9258 3.271 15.9263C3.271 15.9267 3.271 15.9271 3.271 15.9275C3.271 15.9279 3.271 15.9284 3.271 15.9288C3.271 15.9292 3.271 15.9296 3.271 15.9301C3.271 15.9305 3.271 15.9309 3.271 15.9313C3.271 15.9318 3.271 15.9322 3.271 15.9326C3.271 15.933 3.271 15.9334 3.271 15.9339C3.271 15.9343 3.271 15.9347 3.271 15.9351C3.271 15.9356 3.271 15.936 3.271 15.9364C3.271 15.9368 3.271 15.9372 3.271 15.9377C3.271 15.9381 3.271 15.9385 3.271 15.9389C3.271 15.9393 3.271 15.9398 3.271 15.9402C3.271 15.9406 3.271 15.941 3.271 15.9414C3.271 15.9419 3.271 15.9423 3.271 15.9427C3.271 15.9431 3.271 15.9435 3.271 15.944C3.271 15.9444 3.271 15.9448 3.271 15.9452C3.271 15.9456 3.271 15.9461 3.271 15.9465C3.271 15.9469 3.271 15.9473 3.271 15.9477C3.271 15.9481 3.271 15.9486 3.271 15.949C3.271 15.9494 3.271 15.9498 3.271 15.9502C3.271 15.9507 3.271 15.9511 3.271 15.9515C3.271 15.9519 3.271 15.9523 3.271 15.9527C3.271 15.9532 3.271 15.9536 3.271 15.954C3.271 15.9544 3.271 15.9548 3.271 15.9552C3.271 15.9557 3.271 15.9561 3.271 15.9565C3.271 15.9569 3.271 15.9573 3.271 15.9577C3.271 15.9582 3.271 15.9586 3.271 15.959C3.271 15.9594 3.271 15.9598 3.271 15.9602C3.271 15.9606 3.271 15.9611 3.271 15.9615C3.271 15.9619 3.271 15.9623 3.271 15.9627C3.271 15.9631 3.271 15.9635 3.271 15.964C3.271 15.9644 3.271 15.9648 3.271 15.9652C3.271 15.9656 3.271 15.966 3.271 15.9664C3.271 15.9669 3.271 15.9673 3.271 15.9677C3.271 15.9681 3.271 15.9685 3.271 15.9689C3.271 15.9693 3.271 15.9698 3.271 15.9702C3.271 15.9706 3.271 15.971 3.271 15.9714C3.271 15.9718 3.271 15.9722 3.271 15.9726C3.271 15.973 3.271 15.9735 3.271 15.9739C3.271 15.9743 3.271 15.9747 3.271 15.9751C3.271 15.9755 3.271 15.9759 3.271 15.9763C3.271 15.9768 3.271 15.9772 3.271 15.9776C3.271 15.978 3.271 15.9784 3.271 15.9788C3.271 15.9792 3.271 15.9796 3.271 15.98C3.271 15.9804 3.271 15.9809 3.271 15.9813C3.271 15.9817 3.271 15.9821 3.271 15.9825C3.271 15.9829 3.271 15.9833 3.271 15.9837C3.271 15.9841 3.271 15.9845 3.271 15.9849C3.271 15.9854 3.271 15.9858 3.271 15.9862C3.271 15.9866 3.271 15.987 3.271 15.9874C3.271 15.9878 3.271 15.9882 3.271 15.9886C3.271 15.989 3.271 15.9894 3.271 15.9898C3.271 15.9903 3.271 15.9907 3.271 15.9911C3.271 15.9915 3.271 15.9919 3.271 15.9923C3.271 15.9927 3.271 15.9931 3.271 15.9935C3.271 15.9939 3.271 15.9943 3.271 15.9947C3.271 15.9951 3.271 15.9955 3.271 15.9959C3.271 15.9964 3.271 15.9968 3.271 15.9972C3.271 15.9976 3.271 15.998 3.271 15.9984C3.271 15.9988 3.271 15.9992 3.271 15.9996C3.271 16 3.271 16.0004 3.271 16.0008C3.271 16.0012 3.271 16.0016 3.271 16.002C3.271 16.0024 3.271 16.0028 3.271 16.0032C3.271 16.0036 3.271 16.004 3.271 16.0044C3.271 16.0049 3.271 16.0053 3.271 16.0057C3.271 16.0061 3.271 16.0065 3.271 16.0069C3.271 16.0073 3.271 16.0077 3.271 16.0081C3.271 16.0085 3.271 16.0089 3.271 16.0093C3.271 16.0097 3.271 16.0101 3.271 16.0105C3.271 16.0109 3.271 16.0113 3.271 16.0117C3.271 16.0121 3.271 16.0125 3.271 16.0129C3.271 16.0133 3.271 16.0137 3.271 16.0141C3.271 16.0145 3.271 16.0149 3.271 16.0153C3.271 16.0157 3.271 16.0161 3.271 16.0165C3.271 16.0169 3.271 16.0173 3.271 16.0177C3.271 16.0181 3.271 16.0185 3.271 16.0189C3.271 16.0193 3.271 16.0197 3.271 16.0201C3.271 16.0205 3.271 16.0209 3.271 16.0213C3.271 16.0217 3.271 16.0221 3.271 16.0225C3.271 16.0229 3.271 16.0233 3.271 16.0237C3.271 16.0241 3.271 16.0245 3.271 16.0249C3.271 16.0253 3.271 16.0257 3.271 16.0261C3.271 16.0265 3.271 16.0269 3.271 16.0273C3.271 16.0277 3.271 16.0281 3.271 16.0285C3.271 16.0289 3.271 16.0293 3.271 16.0297C3.271 16.0301 3.271 16.0305 3.271 16.0309C3.271 16.0313 3.271 16.0317 3.271 16.0321C3.271 16.0324 3.271 16.0328 3.271 16.0332C3.271 16.0336 3.271 16.034 3.271 16.0344C3.271 16.0348 3.271 16.0352 3.271 16.0356C3.271 16.036 3.271 16.0364 3.271 16.0368C3.271 16.0372 3.271 16.0376 3.271 16.038C3.271 16.0384 3.271 16.0388 3.271 16.0392C3.271 16.0396 3.271 16.04 3.271 16.0404C3.271 16.0407 3.271 16.0411 3.271 16.0415C3.271 16.0419 3.271 16.0423 3.271 16.0427C3.271 16.0431 3.271 16.0435 3.271 16.0439C3.271 16.0443 3.271 16.0447 3.271 16.0451C3.271 16.0455 3.271 16.0459 3.271 16.0463C3.271 16.0466 3.271 16.047 3.271 16.0474C3.271 16.0478 3.271 16.0482 3.271 16.0486C3.271 16.049 3.271 16.0494 3.271 16.0498C3.271 16.0502 3.271 16.0506 3.271 16.051C3.271 16.0513 3.271 16.0517 3.271 16.0521C3.271 16.0525 3.271 16.0529 3.271 16.0533C3.271 16.0537 3.271 16.0541 3.271 16.0545C3.271 16.0549 3.271 16.0553 3.271 16.0556C3.271 16.056 3.271 16.0564 3.271 16.0568C3.271 16.0572 3.271 16.0576 3.271 16.058C3.271 16.0584 3.271 16.0588 3.271 16.0592C3.271 16.0595 3.271 16.0599 3.271 16.0603C3.271 16.0607 3.271 16.0611 3.271 16.0615C3.271 16.0619 3.271 16.0623 3.271 16.0627C3.271 16.063 3.271 16.0634 3.271 16.0638C3.271 16.0642 3.271 16.0646 3.271 16.065C3.271 16.0654 3.271 16.0658 3.271 16.0661C3.271 16.0665 3.271 16.0669 3.271 16.0673C3.271 16.0677 3.271 16.0681 3.271 16.0685C3.271 16.0688 3.271 16.0692 3.271 16.0696C3.271 16.07 3.271 16.0704 3.271 16.0708C3.271 16.0712 3.271 16.0715 3.271 16.0719C3.271 16.0723 3.271 16.0727 3.271 16.0731C3.271 16.0735 3.271 16.0739 3.271 16.0742C3.271 16.0746 3.271 16.075 3.271 16.0754C3.271 16.0758 3.271 16.0762 3.271 16.0766C3.271 16.0769 3.271 16.0773 3.271 16.0777C3.271 16.0781 3.271 16.0785 3.271 16.0789C3.271 16.0792 3.271 16.0796 3.271 16.08C3.271 16.0804 3.271 16.0808 3.271 16.0812C3.271 16.0815 3.271 16.0819 3.271 16.0823C3.271 16.0827 3.271 16.0831 3.271 16.0835C3.271 16.0838 3.271 16.0842 3.271 16.0846C3.271 16.085 3.271 16.0854 3.271 16.0857C3.271 16.0861 3.271 16.0865 3.271 16.0869C3.271 16.0873 3.271 16.0877 3.271 16.088C3.271 16.0884 3.271 16.0888 3.271 16.0892C3.271 16.0896 3.271 16.0899 3.271 16.0903C3.271 16.0907 3.271 16.0911 3.271 16.0915C3.271 16.0918 3.271 16.0922 3.271 16.0926C3.271 16.093 3.271 16.0934 3.271 16.0937C3.271 16.0941 3.271 16.0945 3.271 16.0949C3.271 16.0953 3.271 16.0956 3.271 16.096C3.271 16.0964 3.271 16.0968 3.271 16.0972C3.271 16.0975 3.271 16.0979 3.271 16.0983C3.271 16.0987 3.271 16.099 3.271 16.0994C3.271 16.0998 3.271 16.1002 3.271 16.1006C3.271 16.1009 3.271 16.1013 3.271 16.1017C3.271 16.1021 3.271 16.1024 3.271 16.1028C3.271 16.1032 3.271 16.1036 3.271 16.104C3.271 16.1043 3.271 16.1047 3.271 16.1051C3.271 16.1055 3.271 16.1058 3.271 16.1062C3.271 16.1066 3.271 16.107 3.271 16.1073C3.271 16.1077 3.271 16.1081 3.271 16.1085C3.271 16.1088 3.271 16.1092 3.271 16.1096C3.271 16.11 3.271 16.1103 3.271 16.1107C3.271 16.1111 3.271 16.1115 3.271 16.1118C3.271 16.1122 3.271 16.1126 3.271 16.113C3.271 16.1133 3.271 16.1137 3.271 16.1141C3.271 16.1145 3.271 16.1148 3.271 16.1152C3.271 16.1156 3.271 16.116 3.271 16.1163C3.271 16.1167 3.271 16.1171 3.271 16.1174C3.271 16.1178 3.271 16.1182 3.271 16.1186C3.271 16.1189 3.271 16.1193 3.271 16.1197C3.271 16.1201 3.271 16.1204 3.271 16.1208C3.271 16.1212 3.271 16.1215 3.271 16.1219C3.271 16.1223 3.271 16.1227 3.271 16.123C3.271 16.1234 3.271 16.1238 3.271 16.1241C3.271 16.1245 3.271 16.1249 3.271 16.1253C3.271 16.1256 3.271 16.126 3.271 16.1264C3.271 16.1267 3.271 16.1271 3.271 16.1275C3.271 16.1278 3.271 16.1282 3.271 16.1286C3.271 16.129 3.271 16.1293 3.271 16.1297C3.271 16.1301 3.271 16.1304 3.271 16.1308C3.271 16.1312 3.271 16.1315 3.271 16.1319C3.271 16.1323 3.271 16.1326 3.271 16.133C3.271 16.1334 3.271 16.1337 3.271 16.1341C3.271 16.1345 3.271 16.1349 3.271 16.1352C3.271 16.1356 3.271 16.136 3.271 16.1363C3.271 16.1367 3.271 16.1371 3.271 16.1374C3.271 16.1378 3.271 16.1382 3.271 16.1385C3.271 16.1389 3.271 16.1393 3.271 16.1396C3.271 16.14 3.271 16.1404 3.271 16.1407C3.271 16.1411 3.271 16.1415 3.271 16.1418C3.271 16.1422 3.271 16.1426 3.271 16.1429C3.271 16.1433 3.271 16.1437 3.271 16.144C3.271 16.1444 3.271 16.1447 3.271 16.1451C3.271 16.1455 3.271 16.1458 3.271 16.1462C3.271 16.1466 3.271 16.1469 3.271 16.1473C3.271 16.1477 3.271 16.148 3.271 16.1484C3.271 16.1488 3.271 16.1491 3.271 16.1495C3.271 16.1498 3.271 16.1502 3.271 16.1506C3.271 16.1509 3.271 16.1513 3.271 16.1517C3.271 16.152 3.271 16.1524 3.271 16.1528C3.271 16.1531 3.271 16.1535 3.271 16.1538C3.271 16.1542 3.271 16.1546 3.271 16.1549C3.271 16.1553 3.271 16.1557 3.271 16.156C3.271 16.1564 3.271 16.1567 3.271 16.1571C3.271 16.1575 3.271 16.1578 3.271 16.1582C3.271 16.1585 3.271 16.1589 3.271 16.1593C3.271 16.1596 3.271 16.16 3.271 16.1603C3.271 16.1607 3.271 16.1611 3.271 16.1614C3.271 16.1618 3.271 16.1621 3.271 16.1625C3.271 16.1629 3.271 16.1632 3.271 16.1636C3.271 16.1639 3.271 16.1643 3.271 16.1647C3.271 16.165 3.271 16.1654 3.271 16.1657C3.271 16.1661 3.271 16.1665 3.271 16.1668C3.271 16.1672 3.271 16.1675 3.271 16.1679C3.271 16.1683 3.271 16.1686 3.271 16.169C3.271 16.1693 3.271 16.1697 3.271 16.17C3.271 16.1704 3.271 16.1708 3.271 16.1711C3.271 16.1715 3.271 16.1718 3.271 16.1722C3.271 16.1725 3.271 16.1729 3.271 16.1733C3.271 16.1736 3.271 16.174 3.271 16.1743C3.271 16.1747 3.271 16.175 3.271 16.1754C3.271 16.1757 3.271 16.1761 3.271 16.1765C3.271 16.1768 3.271 16.1772 3.271 16.1775C3.271 16.1779 3.271 16.1782 3.271 16.1786C3.271 16.1789 3.271 16.1793 3.271 16.1797C3.271 16.18 3.271 16.1804 3.271 16.1807C3.271 16.1811 3.271 16.1814 3.271 16.1818C3.271 16.1821 3.271 16.1825 3.271 16.1828C3.271 16.1832 3.271 16.1836 3.271 16.1839C3.271 16.1843 3.271 16.1846 3.271 16.185C3.271 16.1853 3.271 16.1857 3.271 16.186C3.271 16.1864 3.271 16.1867 3.271 16.1871C3.271 16.1874 3.271 16.1878 3.271 16.1881C3.271 16.1885 3.271 16.1888 3.271 16.1892C3.271 16.1895 3.271 16.1899 3.271 16.1903C3.271 16.1906 3.271 16.191 3.271 16.1913C3.271 16.1917 3.271 16.192 3.271 16.1924C3.271 16.1927 3.271 16.1931 3.271 16.1934C3.271 16.1938 3.271 16.1941 3.271 16.1945C3.271 16.1948 3.271 16.1952 3.271 16.1955C3.271 16.1959 3.271 16.1962 3.271 16.1966C3.271 16.1969 3.271 16.1973 3.271 16.1976C3.271 16.198 3.271 16.1983 3.271 16.1987C3.271 16.199 3.271 16.1994 3.271 16.1997C3.271 16.2001 3.271 16.2004 3.271 16.2008C3.271 16.2011 3.271 16.2014 3.271 16.2018C3.271 16.2021 3.271 16.2025 3.271 16.2028C3.271 16.2032 3.271 16.2035 3.271 16.2039C3.271 16.2042 3.271 16.2046 3.271 16.2049C3.271 16.2053 3.271 16.2056 3.271 16.206C3.271 16.2063 3.271 16.2067 3.271 16.207C3.271 16.2074 3.271 16.2077 3.271 16.208C3.271 16.2084 3.271 16.2087 3.271 16.2091C3.271 16.2094 3.271 16.2098 3.271 16.2101C3.271 16.2105 3.271 16.2108 3.271 16.2112C3.271 16.2115 3.271 16.2118 3.271 16.2122C3.271 16.2125 3.271 16.2129 3.271 16.2132C3.271 16.2136 3.271 16.2139 3.271 16.2143C3.271 16.2146 3.271 16.2149 3.271 16.2153C3.271 16.2156 3.271 16.216 3.271 16.2163C3.271 16.2167 3.271 16.217 3.271 16.2174C3.271 16.2177 3.271 16.218 3.271 16.2184C3.271 16.2187 3.271 16.2191 3.271 16.2194C3.271 16.2198 3.271 16.2201 3.271 16.2204C3.271 16.2208 3.271 16.2211 3.271 16.2215C3.271 16.2218 3.271 16.2221 3.271 16.2225C3.271 16.2228 3.271 16.2232 3.271 16.2235C3.271 16.2239 3.271 16.2242 3.271 16.2245C3.271 16.2249 3.271 16.2252 3.271 16.2256C3.271 16.2259 3.271 16.2262 3.271 16.2266C3.271 16.2269 3.271 16.2273 3.271 16.2276C3.271 16.2279 3.271 16.2283 3.271 16.2286C3.271 16.229 3.271 16.2293 3.271 16.2296C3.271 16.23 3.271 16.2303 3.271 16.2307C3.271 16.231 3.271 16.2313 3.271 16.2317C3.271 16.232 3.271 16.2324 3.271 16.2327C3.271 16.233 3.271 16.2334 3.271 16.2337C3.271 16.234 3.271 16.2344 3.271 16.2347C3.271 16.2351 3.271 16.2354 3.271 16.2357C3.271 16.2361 3.271 16.2364 3.271 16.2368C3.271 16.2371 3.271 16.2374 3.271 16.2378C3.271 16.2381 3.271 16.2384 3.271 16.2388C3.271 16.2391 3.271 16.2394 3.271 16.2398C3.271 16.2401 3.271 16.2405 3.271 16.2408C3.271 16.2411 3.271 16.2415 3.271 16.2418C3.271 16.2421 3.271 16.2425 3.271 16.2428C3.271 16.2431 3.271 16.2435 3.271 16.2438C3.271 16.2441 3.271 16.2445 3.271 16.2448C3.271 16.2451 3.271 16.2455 3.271 16.2458C3.271 16.2462 3.271 16.2465 3.271 16.2468C3.271 16.2472 3.271 16.2475 3.271 16.2478C3.271 16.2482 3.271 16.2485 3.271 16.2488C3.271 16.2492 3.271 16.2495 3.271 16.2498C3.271 16.2502 3.271 16.2505 3.271 16.2508C3.271 16.2512 3.271 16.2515 3.271 16.2518C3.271 16.2522 3.271 16.2525 3.271 16.2528C3.271 16.2532 3.271 16.2535 3.271 16.2538C3.271 16.2541 3.271 16.2545 3.271 16.2548C3.271 16.2551 3.271 16.2555 3.271 16.2558C3.271 16.2561 3.271 16.2565 3.271 16.2568C3.271 16.2571 3.271 16.2575 3.271 16.2578C3.271 16.2581 3.271 16.2585 3.271 16.2588C3.271 16.2591 3.271 16.2594 3.271 16.2598C3.271 16.2601 3.271 16.2604 3.271 16.2608C3.271 16.2611 3.271 16.2614 3.271 16.2617C3.271 16.2621 3.271 16.2624 3.271 16.2627C3.271 16.2631 3.271 16.2634 3.271 16.2637C3.271 16.2641 3.271 16.2644 3.271 16.2647C3.271 16.265 3.271 16.2654 3.271 16.2657C3.271 16.266 3.271 16.2663 3.271 16.2667C3.271 16.267 3.271 16.2673 3.271 16.2677C3.271 16.268 3.271 16.2683 3.271 16.2686C3.271 16.269 3.271 16.2693 3.271 16.2696C3.271 16.2699 3.271 16.2703 3.271 16.2706C3.271 16.2709 3.271 16.2713 3.271 16.2716C3.271 16.2719 3.271 16.2722 3.271 16.2726C3.271 16.2729 3.271 16.2732 3.271 16.2735C3.271 16.2739 3.271 16.2742 3.271 16.2745C3.271 16.2748 3.271 16.2752 3.271 16.2755C3.271 16.2758 3.271 16.2761 3.271 16.2765C3.271 16.2768 3.271 16.2771 3.271 16.2774C3.271 16.2778 3.271 16.2781 3.271 16.2784C3.271 16.2787 3.271 16.2791 3.271 16.2794C3.271 16.2797 3.271 16.28 3.271 16.2803C3.271 16.2807 3.271 16.281 3.271 16.2813C3.271 16.2816 3.271 16.282 3.271 16.2823C3.271 16.2826 3.271 16.2829 3.271 16.2833C3.271 16.2836 3.271 16.2839 3.271 16.2842C3.271 16.2845 3.271 16.2849 3.271 16.2852C3.271 16.2855 3.271 16.2858 3.271 16.2862C3.271 16.2865 3.271 16.2868 3.271 16.2871C3.271 16.2874 3.271 16.2878 3.271 16.2881C3.271 16.2884 3.271 16.2887 3.271 16.289C3.271 16.2894 3.271 16.2897 3.271 16.29C3.271 16.2903 3.271 16.2906 3.271 16.291C3.271 16.2913 3.271 16.2916 3.271 16.2919C3.271 16.2922 3.271 16.2926 3.271 16.2929C3.271 16.2932 3.271 16.2935 3.271 16.2938C3.271 16.2942 3.271 16.2945 3.271 16.2948C3.271 16.2951 3.271 16.2954 3.271 16.2957C3.271 16.2961 3.271 16.2964 3.271 16.2967C3.271 16.297 3.271 16.2973 3.271 16.2977C3.271 16.298 3.271 16.2983 3.271 16.2986C3.271 16.2989 3.271 16.2992 3.271 16.2996C3.271 16.2999 3.271 16.3002 3.271 16.3005C3.271 16.3008 3.271 16.3011 3.271 16.3015C3.271 16.3018 3.271 16.3021 3.271 16.3024C3.271 16.3027 3.271 16.303 3.271 16.3034C3.271 16.3037 3.271 16.304 3.271 16.3043C3.271 16.3046 3.271 16.3049 3.271 16.3052C3.271 16.3056 3.271 16.3059 3.271 16.3062C3.271 16.3065 3.271 16.3068 3.271 16.3071C3.271 16.3074 3.271 16.3078 3.271 16.3081C3.271 16.3084 3.271 16.3087 3.271 16.309C3.271 16.3093 3.271 16.3096 3.271 16.31C3.271 16.3103 3.271 16.3106 3.271 16.3109C3.271 16.3112 3.271 16.3115 3.271 16.3118C3.271 16.3121 3.271 16.3125 3.271 16.3128C3.271 16.3131 3.271 16.3134 3.271 16.3137C3.271 16.314 3.271 16.3143 3.271 16.3146C3.271 16.315 3.271 16.3153 3.271 16.3156C3.271 16.3159 3.271 16.3162 3.271 16.3165C3.271 16.3168 3.271 16.3171 3.271 16.3174C3.271 16.3178 3.271 16.3181 3.271 16.3184C3.271 16.3187 3.271 16.319 3.271 16.3193C3.271 16.3196 3.271 16.3199 3.271 16.3202C3.271 16.3206 3.271 16.3209 3.271 16.3212C3.271 16.3215 3.271 16.3218 3.271 16.3221C3.271 16.3224 3.271 16.3227 3.271 16.323C3.271 16.3233 3.271 16.3236 3.271 16.324C3.271 16.3243 3.271 16.3246 3.271 16.3249C3.271 16.3252 3.271 16.3255 3.271 16.3258C3.271 16.3261 3.271 16.3264 3.271 16.3267C3.271 16.327 3.271 16.3273 3.271 16.3277C3.271 16.328 3.271 16.3283 3.271 16.3286C3.271 16.3289 3.271 16.3292 3.271 16.3295C3.271 16.3298 3.271 16.3301 3.271 16.3304C3.271 16.3307 3.271 16.331 3.271 16.3313C3.271 16.3316 3.271 16.3319 3.271 16.3322C3.271 16.3326 3.271 16.3329 3.271 16.3332C3.271 16.3335 3.271 16.3338 3.271 16.3341C3.271 16.3344 3.271 16.3347 3.271 16.335C3.271 16.3353 3.271 16.3356 3.271 16.3359C3.271 16.3362 3.271 16.3365 3.271 16.3368C3.271 16.3371 3.271 16.3374 3.271 16.3377C3.271 16.338 3.271 16.3383 3.271 16.3386C3.271 16.339 3.271 16.3393 3.271 16.3396C3.271 16.3399 3.271 16.3402 3.271 16.3405C3.271 16.3408 3.271 16.3411 3.271 16.3414C3.271 16.3417 3.271 16.342 3.271 16.3423C3.271 16.3426 3.271 16.3429 3.271 16.3432C3.271 16.3435 3.271 16.3438 3.271 16.3441C3.271 16.3444 3.271 16.3447 3.271 16.345C3.271 16.3453 3.271 16.3456 3.271 16.3459C3.271 16.3462 3.271 16.3465 3.271 16.3468C3.271 16.3471 3.271 16.3474 3.271 16.3477C3.271 16.348 3.271 16.3483 3.271 16.3486C3.271 16.3489 3.271 16.3492 3.271 16.3495C3.271 16.3498 3.271 16.3501 3.271 16.3504C3.271 16.3507 3.271 16.351 3.271 16.3513C3.271 16.3516 3.271 16.3519 3.271 16.3522C3.271 16.3525 3.271 16.3528 3.271 16.3531C3.271 16.3534 3.271 16.3537 3.271 16.354H5.271ZM3.271 14.833V16.583H5.271V14.833H3.271Z" fill="currentColor" mask="url(#path-1-inside-1_5289_88370)"/>'
    },
    "resources": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M5.30591 9.14258L9.55591 2.14258L13.8059 9.14258H5.30591ZM14.0559 18.1426C13.0837 18.1426 12.2573 17.8023 11.5767 17.1217C10.8962 16.4412 10.5559 15.6148 10.5559 14.6426C10.5559 13.6704 10.8962 12.844 11.5767 12.1634C12.2573 11.4829 13.0837 11.1426 14.0559 11.1426C15.0281 11.1426 15.8545 11.4829 16.5351 12.1634C17.2156 12.844 17.5559 13.6704 17.5559 14.6426C17.5559 15.6148 17.2156 16.4412 16.5351 17.1217C15.8545 17.8023 15.0281 18.1426 14.0559 18.1426ZM2.55591 17.6426V11.6426H8.55591V17.6426H2.55591ZM14.0512 16.6426C14.6099 16.6426 15.0837 16.4497 15.4726 16.0639C15.8615 15.6782 16.0559 15.206 16.0559 14.6473C16.0559 14.0886 15.863 13.6148 15.4773 13.2259C15.0915 12.837 14.6193 12.6426 14.0606 12.6426C13.5019 12.6426 13.0281 12.8355 12.6392 13.2212C12.2504 13.607 12.0559 14.0792 12.0559 14.6379C12.0559 15.1966 12.2488 15.6704 12.6346 16.0592C13.0203 16.4481 13.4925 16.6426 14.0512 16.6426ZM4.05591 16.1426H7.05591V13.1426H4.05591V16.1426ZM7.97258 7.64258H11.1392L9.55591 5.03841L7.97258 7.64258Z" fill="#656A81"/>'
    },
    "spinner-black": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.99999 4.49775C10.6897 4.49775 11.2489 3.93861 11.2489 3.24888C11.2489 2.55914 10.6897 2 9.99999 2C9.31025 2 8.75111 2.55914 8.75111 3.24888C8.75111 3.93861 9.31025 4.49775 9.99999 4.49775Z" fill="#414159"/><path opacity="0.6" d="M9.99999 18C10.6897 18 11.2489 17.4408 11.2489 16.7511C11.2489 16.0614 10.6897 15.5022 9.99999 15.5022C9.31025 15.5022 8.75111 16.0614 8.75111 16.7511C8.75111 17.4408 9.31025 18 9.99999 18Z" fill="#414159"/><path opacity="0.3" d="M13.3756 5.39793C14.0653 5.39793 14.6245 4.83879 14.6245 4.14905C14.6245 3.45932 14.0653 2.90018 13.3756 2.90018C12.6859 2.90018 12.1267 3.45932 12.1267 4.14905C12.1267 4.83879 12.6859 5.39793 13.3756 5.39793Z" fill="#414159"/><path opacity="0.7" d="M6.6245 17.0999C7.31423 17.0999 7.87337 16.5408 7.87337 15.851C7.87337 15.1613 7.31423 14.6022 6.6245 14.6022C5.93477 14.6022 5.37563 15.1613 5.37563 15.851C5.37563 16.5408 5.93477 17.0999 6.6245 17.0999Z" fill="#414159"/><path opacity="0.95" d="M6.6245 5.39793C7.31423 5.39793 7.87337 4.83879 7.87337 4.14905C7.87337 3.45932 7.31423 2.90018 6.6245 2.90018C5.93477 2.90018 5.37563 3.45932 5.37563 4.14905C5.37563 4.83879 5.93477 5.39793 6.6245 5.39793Z" fill="#414159"/><path opacity="0.5" d="M13.3756 17.0999C14.0653 17.0999 14.6245 16.5408 14.6245 15.851C14.6245 15.1613 14.0653 14.6022 13.3756 14.6022C12.6859 14.6022 12.1267 15.1613 12.1267 15.851C12.1267 16.5408 12.6859 17.0999 13.3756 17.0999Z" fill="#414159"/><path opacity="0.85" d="M3.24887 11.2489C3.93861 11.2489 4.49775 10.6898 4.49775 10.0001C4.49775 9.31033 3.93861 8.75119 3.24887 8.75119C2.55914 8.75119 2 9.31033 2 10.0001C2 10.6898 2.55914 11.2489 3.24887 11.2489Z" fill="#414159"/><path opacity="0.3" d="M16.7511 11.2489C17.4409 11.2489 18 10.6898 18 10.0001C18 9.31033 17.4409 8.75119 16.7511 8.75119C16.0614 8.75119 15.5023 9.31033 15.5023 10.0001C15.5023 10.6898 16.0614 11.2489 16.7511 11.2489Z" fill="#414159"/><path opacity="0.9" d="M4.14907 7.87336C4.8388 7.87336 5.39794 7.31422 5.39794 6.62448C5.39794 5.93475 4.8388 5.37561 4.14907 5.37561C3.45933 5.37561 2.90019 5.93475 2.90019 6.62448C2.90019 7.31422 3.45933 7.87336 4.14907 7.87336Z" fill="#414159"/><path opacity="0.4" d="M15.8511 14.6245C16.5408 14.6245 17.1 14.0653 17.1 13.3756C17.1 12.6859 16.5408 12.1267 15.8511 12.1267C15.1613 12.1267 14.6022 12.6859 14.6022 13.3756C14.6022 14.0653 15.1613 14.6245 15.8511 14.6245Z" fill="#414159"/><path opacity="0.8" d="M4.14907 14.6245C4.8388 14.6245 5.39794 14.0653 5.39794 13.3756C5.39794 12.6859 4.8388 12.1267 4.14907 12.1267C3.45933 12.1267 2.90019 12.6859 2.90019 13.3756C2.90019 14.0653 3.45933 14.6245 4.14907 14.6245Z" fill="#414159"/><path opacity="0.3" d="M15.8511 7.87336C16.5408 7.87336 17.1 7.31422 17.1 6.62448C17.1 5.93475 16.5408 5.37561 15.8511 5.37561C15.1613 5.37561 14.6022 5.93475 14.6022 6.62448C14.6022 7.31422 15.1613 7.87336 15.8511 7.87336Z" fill="#414159"/>'
    },
    "spinner-white": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M9.99999 4.49775C10.6897 4.49775 11.2489 3.93861 11.2489 3.24888C11.2489 2.55914 10.6897 2 9.99999 2C9.31025 2 8.75111 2.55914 8.75111 3.24888C8.75111 3.93861 9.31025 4.49775 9.99999 4.49775Z" fill="white"/><path opacity="0.6" d="M9.99999 18C10.6897 18 11.2489 17.4408 11.2489 16.7511C11.2489 16.0614 10.6897 15.5022 9.99999 15.5022C9.31025 15.5022 8.75111 16.0614 8.75111 16.7511C8.75111 17.4408 9.31025 18 9.99999 18Z" fill="white"/><path opacity="0.3" d="M13.3756 5.39793C14.0653 5.39793 14.6245 4.83879 14.6245 4.14905C14.6245 3.45932 14.0653 2.90018 13.3756 2.90018C12.6859 2.90018 12.1267 3.45932 12.1267 4.14905C12.1267 4.83879 12.6859 5.39793 13.3756 5.39793Z" fill="white"/><path opacity="0.7" d="M6.6245 17.0999C7.31423 17.0999 7.87337 16.5408 7.87337 15.851C7.87337 15.1613 7.31423 14.6022 6.6245 14.6022C5.93477 14.6022 5.37563 15.1613 5.37563 15.851C5.37563 16.5408 5.93477 17.0999 6.6245 17.0999Z" fill="white"/><path opacity="0.95" d="M6.6245 5.39793C7.31423 5.39793 7.87337 4.83879 7.87337 4.14905C7.87337 3.45932 7.31423 2.90018 6.6245 2.90018C5.93477 2.90018 5.37563 3.45932 5.37563 4.14905C5.37563 4.83879 5.93477 5.39793 6.6245 5.39793Z" fill="white"/><path opacity="0.5" d="M13.3756 17.0999C14.0653 17.0999 14.6245 16.5408 14.6245 15.851C14.6245 15.1613 14.0653 14.6022 13.3756 14.6022C12.6859 14.6022 12.1267 15.1613 12.1267 15.851C12.1267 16.5408 12.6859 17.0999 13.3756 17.0999Z" fill="white"/><path opacity="0.85" d="M3.24887 11.2489C3.93861 11.2489 4.49775 10.6898 4.49775 10.0001C4.49775 9.31033 3.93861 8.75119 3.24887 8.75119C2.55914 8.75119 2 9.31033 2 10.0001C2 10.6898 2.55914 11.2489 3.24887 11.2489Z" fill="white"/><path opacity="0.3" d="M16.7511 11.2489C17.4409 11.2489 18 10.6898 18 10.0001C18 9.31033 17.4409 8.75119 16.7511 8.75119C16.0614 8.75119 15.5023 9.31033 15.5023 10.0001C15.5023 10.6898 16.0614 11.2489 16.7511 11.2489Z" fill="white"/><path opacity="0.9" d="M4.14907 7.87336C4.8388 7.87336 5.39794 7.31422 5.39794 6.62448C5.39794 5.93475 4.8388 5.37561 4.14907 5.37561C3.45933 5.37561 2.90019 5.93475 2.90019 6.62448C2.90019 7.31422 3.45933 7.87336 4.14907 7.87336Z" fill="white"/><path opacity="0.4" d="M15.8511 14.6245C16.5408 14.6245 17.1 14.0653 17.1 13.3756C17.1 12.6859 16.5408 12.1267 15.8511 12.1267C15.1613 12.1267 14.6022 12.6859 14.6022 13.3756C14.6022 14.0653 15.1613 14.6245 15.8511 14.6245Z" fill="white"/><path opacity="0.8" d="M4.14907 14.6245C4.8388 14.6245 5.39794 14.0653 5.39794 13.3756C5.39794 12.6859 4.8388 12.1267 4.14907 12.1267C3.45933 12.1267 2.90019 12.6859 2.90019 13.3756C2.90019 14.0653 3.45933 14.6245 4.14907 14.6245Z" fill="white"/><path opacity="0.3" d="M15.8511 7.87336C16.5408 7.87336 17.1 7.31422 17.1 6.62448C17.1 5.93475 16.5408 5.37561 15.8511 5.37561C15.1613 5.37561 14.6022 5.93475 14.6022 6.62448C14.6022 7.31422 15.1613 7.87336 15.8511 7.87336Z" fill="white"/>'
    },
    "status-dot-canceled": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10 18C8.90267 18 7.868 17.7917 6.896 17.375C5.924 16.9583 5.07333 16.3853 4.344 15.656C3.61467 14.9267 3.04167 14.076 2.625 13.104C2.20833 12.132 2 11.0973 2 10C2 8.88867 2.20833 7.85033 2.625 6.885C3.04167 5.92033 3.61467 5.07333 4.344 4.344C5.07333 3.61467 5.924 3.04167 6.896 2.625C7.868 2.20833 8.90267 2 10 2C11.1113 2 12.1497 2.20833 13.115 2.625C14.0797 3.04167 14.9267 3.61467 15.656 4.344C16.3853 5.07333 16.9583 5.92033 17.375 6.885C17.7917 7.85033 18 8.88867 18 10C18 11.0973 17.7917 12.132 17.375 13.104C16.9583 14.076 16.3853 14.9267 15.656 15.656C14.9267 16.3853 14.0797 16.9583 13.115 17.375C12.1497 17.7917 11.1113 18 10 18ZM10 16.5C11.8053 16.5 13.34 15.868 14.604 14.604C15.868 13.34 16.5 11.8053 16.5 10C16.5 9.236 16.375 8.51367 16.125 7.833C15.875 7.15233 15.5277 6.53433 15.083 5.979L5.979 15.083C6.53433 15.5277 7.15233 15.875 7.833 16.125C8.51367 16.375 9.236 16.5 10 16.5ZM4.917 14.021L14.021 4.917C13.4657 4.47233 12.8477 4.125 12.167 3.875C11.4863 3.625 10.764 3.5 10 3.5C8.19467 3.5 6.66 4.132 5.396 5.396C4.132 6.66 3.5 8.19467 3.5 10C3.5 10.764 3.625 11.4863 3.875 12.167C4.125 12.8477 4.47233 13.4657 4.917 14.021Z" fill="#656A81"/>'
    },
    "status-dot-in-progress": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10.0001 18.3334C8.8473 18.3334 7.76397 18.1145 6.75008 17.6767C5.73619 17.2395 4.85425 16.6459 4.10425 15.8959C3.35425 15.1459 2.76064 14.264 2.32341 13.2501C1.88564 12.2362 1.66675 11.1529 1.66675 10.0001C1.66675 8.8473 1.88564 7.76397 2.32341 6.75008C2.76064 5.73619 3.35425 4.85425 4.10425 4.10425C4.85425 3.35425 5.73619 2.76036 6.75008 2.32258C7.76397 1.88536 8.8473 1.66675 10.0001 1.66675C11.1529 1.66675 12.2362 1.88536 13.2501 2.32258C14.264 2.76036 15.1459 3.35425 15.8959 4.10425C16.6459 4.85425 17.2395 5.73619 17.6767 6.75008C18.1145 7.76397 18.3334 8.8473 18.3334 10.0001C18.3334 11.1529 18.1145 12.2362 17.6767 13.2501C17.2395 14.264 16.6459 15.1459 15.8959 15.8959C15.1459 16.6459 14.264 17.2395 13.2501 17.6767C12.2362 18.1145 11.1529 18.3334 10.0001 18.3334ZM5.83341 11.2501C6.18064 11.2501 6.47564 11.1284 6.71841 10.8851C6.96175 10.6423 7.08341 10.3473 7.08341 10.0001C7.08341 9.65286 6.96175 9.35786 6.71841 9.11508C6.47564 8.87175 6.18064 8.75008 5.83341 8.75008C5.48619 8.75008 5.19119 8.87175 4.94841 9.11508C4.70508 9.35786 4.58341 9.65286 4.58341 10.0001C4.58341 10.3473 4.70508 10.6423 4.94841 10.8851C5.19119 11.1284 5.48619 11.2501 5.83341 11.2501ZM10.0001 11.2501C10.3473 11.2501 10.6423 11.1284 10.8851 10.8851C11.1284 10.6423 11.2501 10.3473 11.2501 10.0001C11.2501 9.65286 11.1284 9.35786 10.8851 9.11508C10.6423 8.87175 10.3473 8.75008 10.0001 8.75008C9.65286 8.75008 9.35786 8.87175 9.11508 9.11508C8.87175 9.35786 8.75008 9.65286 8.75008 10.0001C8.75008 10.3473 8.87175 10.6423 9.11508 10.8851C9.35786 11.1284 9.65286 11.2501 10.0001 11.2501ZM14.1667 11.2501C14.514 11.2501 14.809 11.1284 15.0517 10.8851C15.2951 10.6423 15.4167 10.3473 15.4167 10.0001C15.4167 9.65286 15.2951 9.35786 15.0517 9.11508C14.809 8.87175 14.514 8.75008 14.1667 8.75008C13.8195 8.75008 13.5245 8.87175 13.2817 9.11508C13.0384 9.35786 12.9167 9.65286 12.9167 10.0001C12.9167 10.3473 13.0384 10.6423 13.2817 10.8851C13.5245 11.1284 13.8195 11.2501 14.1667 11.2501Z" fill="#41B658"/>'
    },
    "status-dot-no-show": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10.0001 18.3334C8.8473 18.3334 7.76397 18.1145 6.75008 17.6767C5.73619 17.2395 4.85425 16.6459 4.10425 15.8959C3.35425 15.1459 2.76064 14.264 2.32341 13.2501C1.88564 12.2362 1.66675 11.1529 1.66675 10.0001C1.66675 8.8473 1.88564 7.76397 2.32341 6.75008C2.76064 5.73619 3.35425 4.85425 4.10425 4.10425C4.85425 3.35425 5.73619 2.76036 6.75008 2.32258C7.76397 1.88536 8.8473 1.66675 10.0001 1.66675C11.1529 1.66675 12.2362 1.88536 13.2501 2.32258C14.264 2.76036 15.1459 3.35425 15.8959 4.10425C16.6459 4.85425 17.2395 5.73619 17.6767 6.75008C18.1145 7.76397 18.3334 8.8473 18.3334 10.0001C18.3334 11.1529 18.1145 12.2362 17.6767 13.2501C17.2395 14.264 16.6459 15.1459 15.8959 15.8959C15.1459 16.6459 14.264 17.2395 13.2501 17.6767C12.2362 18.1145 11.1529 18.3334 10.0001 18.3334ZM5.83341 10.8334H14.1667V9.16675H5.83341V10.8334Z" fill="#F9AA00"/>'
    },
    "status-dot-overdue": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10.0001 18.3332C8.8473 18.3332 7.76397 18.1143 6.75008 17.6765C5.73619 17.2393 4.85425 16.6457 4.10425 15.8957C3.35425 15.1457 2.76064 14.2637 2.32341 13.2498C1.88564 12.2359 1.66675 11.1526 1.66675 9.99984C1.66675 8.84706 1.88564 7.76373 2.32341 6.74984C2.76064 5.73595 3.35425 4.854 4.10425 4.104C4.85425 3.354 5.73619 2.76011 6.75008 2.32234C7.76397 1.88511 8.8473 1.6665 10.0001 1.6665C11.1529 1.6665 12.2362 1.88511 13.2501 2.32234C14.264 2.76011 15.1459 3.354 15.8959 4.104C16.6459 4.854 17.2395 5.73595 17.6767 6.74984C18.1145 7.76373 18.3334 8.84706 18.3334 9.99984C18.3334 11.1526 18.1145 12.2359 17.6767 13.2498C17.2395 14.2637 16.6459 15.1457 15.8959 15.8957C15.1459 16.6457 14.264 17.2393 13.2501 17.6765C12.2362 18.1143 11.1529 18.3332 10.0001 18.3332ZM9.16675 10.8332H10.8334V5.83317H9.16675V10.8332ZM10.0001 14.1665C10.2362 14.1665 10.4342 14.0865 10.5942 13.9265C10.7537 13.7671 10.8334 13.5693 10.8334 13.3332C10.8334 13.0971 10.7537 12.899 10.5942 12.739C10.4342 12.5796 10.2362 12.4998 10.0001 12.4998C9.76397 12.4998 9.56619 12.5796 9.40675 12.739C9.24675 12.899 9.16675 13.0971 9.16675 13.3332C9.16675 13.5693 9.24675 13.7671 9.40675 13.9265C9.56619 14.0865 9.76397 14.1665 10.0001 14.1665Z" fill="#E5243C"/>'
    },
    "status-dot-reserved": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10.0001 18.3334C8.8473 18.3334 7.76397 18.1145 6.75008 17.6767C5.73619 17.2395 4.85425 16.6459 4.10425 15.8959C3.35425 15.1459 2.76064 14.264 2.32341 13.2501C1.88564 12.2362 1.66675 11.1529 1.66675 10.0001C1.66675 8.8473 1.88564 7.76397 2.32341 6.75008C2.76064 5.73619 3.35425 4.85425 4.10425 4.10425C4.85425 3.35425 5.73619 2.76036 6.75008 2.32258C7.76397 1.88536 8.8473 1.66675 10.0001 1.66675C11.1529 1.66675 12.2362 1.88536 13.2501 2.32258C14.264 2.76036 15.1459 3.35425 15.8959 4.10425C16.6459 4.85425 17.2395 5.73619 17.6767 6.75008C18.1145 7.76397 18.3334 8.8473 18.3334 10.0001C18.3334 11.1529 18.1145 12.2362 17.6767 13.2501C17.2395 14.264 16.6459 15.1459 15.8959 15.8959C15.1459 16.6459 14.264 17.2395 13.2501 17.6767C12.2362 18.1145 11.1529 18.3334 10.0001 18.3334Z" fill="#048AF7"/>'
    },
    "status-dot-returned": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M10.0001 18.3334C8.8473 18.3334 7.76397 18.1145 6.75008 17.6767C5.73619 17.2395 4.85425 16.6459 4.10425 15.8959C3.35425 15.1459 2.76064 14.264 2.32341 13.2501C1.88564 12.2362 1.66675 11.1529 1.66675 10.0001C1.66675 8.8473 1.88564 7.76397 2.32341 6.75008C2.76064 5.73619 3.35425 4.85425 4.10425 4.10425C4.85425 3.35425 5.73619 2.76036 6.75008 2.32258C7.76397 1.88536 8.8473 1.66675 10.0001 1.66675C11.1529 1.66675 12.2362 1.88536 13.2501 2.32258C14.264 2.76036 15.1459 3.35425 15.8959 4.10425C16.6459 4.85425 17.2395 5.73619 17.6767 6.75008C18.1145 7.76397 18.3334 8.8473 18.3334 10.0001C18.3334 11.1529 18.1145 12.2362 17.6767 13.2501C17.2395 14.264 16.6459 15.1459 15.8959 15.8959C15.1459 16.6459 14.264 17.2395 13.2501 17.6767C12.2362 18.1145 11.1529 18.3334 10.0001 18.3334ZM8.83341 13.8334L14.7084 7.95841L13.5417 6.79175L8.83341 11.5001L6.45841 9.12508L5.29175 10.2917L8.83341 13.8334Z" fill="#9CA1B9"/>'
    },
    "unarchive": {
      "viewBox": "0 0 20 20",
      "body": '<mask id="mask0_14211_1567" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20"><rect width="20" height="20" fill="#D9D9D9"/></mask><g mask="url(#mask0_14211_1567)"><path d="M10 8.25L7 11.25L8.0625 12.3125L9.25 11.125V14.25H10.75V11.125L11.9375 12.3125L13 11.25L10 8.25ZM4.5 7V15.5H15.5V7H4.5ZM4.5 17C4.0875 17 3.73437 16.8531 3.44062 16.5594C3.14687 16.2656 3 15.9125 3 15.5V5.625C3 5.43056 3.03646 5.24306 3.10938 5.0625C3.18229 4.88194 3.29167 4.71528 3.4375 4.5625L4.5625 3.4375C4.71528 3.28472 4.88153 3.17361 5.06125 3.10417C5.24097 3.03472 5.42889 3 5.625 3H14.375C14.5711 3 14.759 3.03472 14.9388 3.10417C15.1185 3.17361 15.2847 3.28472 15.4375 3.4375L16.5625 4.5625C16.7083 4.71528 16.8177 4.88194 16.8906 5.0625C16.9635 5.24306 17 5.43056 17 5.625V15.5C17 15.9125 16.8531 16.2656 16.5594 16.5594C16.2656 16.8531 15.9125 17 15.5 17H4.5ZM4.625 5.5H15.375L14.375 4.5H5.625L4.625 5.5Z" fill="#3957EA"/></g>'
    },
    "undo": {
      "viewBox": "0 0 14 13",
      "body": '<path d="M8.70801 12.833H2.85401V11.083H8.70801C9.56934 11.083 10.3193 10.8193 10.958 10.292C11.5973 9.76401 11.917 9.09034 11.917 8.27101C11.917 7.45167 11.5973 6.77467 10.958 6.24001C10.3193 5.70534 9.56934 5.43801 8.70801 5.43801H3.66701L5.79201 7.56201L4.56201 8.79201L0.333008 4.56201L4.56201 0.333008L5.79201 1.56201L3.66701 3.68801H8.70801C10.0553 3.68801 11.2187 4.12201 12.198 4.99001C13.1773 5.85801 13.667 6.94467 13.667 8.25001C13.667 9.55534 13.1773 10.6457 12.198 11.521C11.2187 12.3957 10.0553 12.833 8.70801 12.833Z" fill="#656A81"/>'
    },
    "unpin": {
      "viewBox": "0 0 20 20",
      "body": '<path d="M14 3V4.5H13V10.8958L11.5 9.39583V4.5H8.5V6.39583L6.625 4.52083L6 3.875V3H14ZM10 19L9.25 18.25V13.5H5V12L7 10V9.11542L1.875 4L2.9375 2.9375L17.0625 17.0833L16 18.1458L11.375 13.5H10.75V18.25L10 19ZM7.125 12H9.875L8.5 10.625L7.125 12Z" fill="#656A81"/>'
    }
  };
  var DEFAULT_VIEWBOX2 = "0 0 24 24";
  function hasBrandIcon(name) {
    return name in BRAND_ICONS;
  }
  function brandIconNames() {
    return Object.keys(BRAND_ICONS).sort();
  }
  function brandIconSvg(name, className = "") {
    return renderIconSvg(BRAND_ICONS[name] ?? { viewBox: DEFAULT_VIEWBOX2, body: "" }, className);
  }
  var OdyBrandIcon = class extends OdyElement {
    static observedAttributes = ["name", "size"];
    render() {
      const cls = classes("icon", `icon--size-${this.attr("size", "base")}`);
      this.mount(`<span class="${cls}">${brandIconSvg(this.attr("name"), "icon__svg")}</span>`);
    }
  };
  define("ody-brand-icon", OdyBrandIcon);
  return __toCommonJS(index_exports);
})();
