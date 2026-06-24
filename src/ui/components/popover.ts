import { OdyElement, classes, define } from '../base.js';
import { type OdyPlacement, portal, position, removePortal } from '../overlay.js';

const EVENT_OPEN = 'open';
const EVENT_CLOSE = 'close';

/**
 * `<ody-popover>` — a floating panel anchored to a trigger, toggled by clicking
 * the trigger and dismissed by clicking outside. The panel is portaled to
 * `document.body` and positioned with {@link position}.
 *
 * Light-DOM children:
 * - the **trigger** is the child marked `[data-ody-popover-trigger]`, else the
 *   first element child (unless `for` is set);
 * - the **content** is the child marked `[data-ody-popover-content]`, else the
 *   remaining children.
 *
 * Attributes:
 * - `for` — id of an external trigger element (overrides a slotted trigger).
 * - `placement` — `top` | `bottom` | `left` | `right` (default `bottom`).
 *
 * Dispatches `open` / `close` {@link CustomEvent}s. Methods: {@link open},
 * {@link close}, {@link toggle}.
 */
export class OdyPopover extends OdyElement {
  static observedAttributes = ['placement', 'for'];

  #panel: HTMLElement | null = null;
  #trigger: Element | null = null;
  #visible = false;

  /** Whether the popover panel is currently shown. */
  get isOpen(): boolean {
    return this.#visible;
  }

  /** Show the popover and position it against its trigger. */
  open(): void {
    const panel = this.#panel;
    const trigger = this.#trigger;
    if (this.#visible || !panel || !trigger) return;
    this.#visible = true;
    portal(panel);
    panel.classList.add('ody-popover__container--open');
    const placement = this.attr('placement', 'bottom') as OdyPlacement;
    const { top, left } = position(trigger, panel, placement);
    panel.style.position = 'absolute';
    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
    document.addEventListener('click', this.#onOutsideClick, true);
    this.dispatchEvent(new CustomEvent(EVENT_OPEN, { bubbles: true }));
  }

  /** Hide the popover. */
  close(): void {
    if (!this.#visible) return;
    this.#visible = false;
    this.#panel?.classList.remove('ody-popover__container--open');
    if (this.#panel) removePortal(this.#panel);
    document.removeEventListener('click', this.#onOutsideClick, true);
    this.dispatchEvent(new CustomEvent(EVENT_CLOSE, { bubbles: true }));
  }

  /** Toggle the popover open/closed. */
  toggle(): void {
    if (this.#visible) this.close();
    else this.open();
  }

  #onOutsideClick = (e: MouseEvent): void => {
    const target = e.target as Node;
    if (this.#panel?.contains(target) || this.#trigger?.contains(target)) return;
    this.close();
  };

  #onTriggerClick = (): void => {
    this.toggle();
  };

  protected render(): void {
    if (this.#visible) this.close();
    this.#trigger?.removeEventListener('click', this.#onTriggerClick);
    // Bring the portaled panel back so the base `mount` can reclaim the slotted
    // content (which lives in the panel's inner slot) on a re-render. The
    // trigger lives in a separate slot, so push it back into the slot too.
    if (this.#panel) {
      this.appendChild(this.#panel);
      this.#panel.classList.remove('ody-popover__container--open');
    }
    const trigger = this.querySelector('[data-ody-popover-trigger-slot]')?.firstElementChild;
    const slot = this.querySelector('[data-ody-slot]');
    if (trigger && slot) slot.insertBefore(trigger, slot.firstChild);
    this.#visible = false;

    this.mount(
      `<div class="ody-popover__wrapper">` +
        `<span class="ody-popover__trigger" data-ody-popover-trigger-slot></span>` +
        `<div class="${classes('ody-popover__container')}"><div data-ody-slot></div></div>` +
      `</div>`,
    );

    // Resolve trigger: external `for` target, else explicit/first slotted child.
    const contentSlot = this.querySelector('[data-ody-slot]');
    const forId = this.attr('for');
    const explicitTrigger = contentSlot?.querySelector('[data-ody-popover-trigger]');
    const triggerSlot = this.querySelector('[data-ody-popover-trigger-slot]')!;

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

    this.#panel = this.querySelector('.ody-popover__container');
    this.#trigger?.addEventListener('click', this.#onTriggerClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('click', this.#onOutsideClick, true);
    this.#trigger?.removeEventListener('click', this.#onTriggerClick);
    if (this.#panel) removePortal(this.#panel);
    this.#panel = null;
    this.#trigger = null;
  }
}

define('ody-popover', OdyPopover);
