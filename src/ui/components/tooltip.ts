import { OdyElement, classes, define } from '../base.js';
import { type OdyPlacement, portal, position, removePortal } from '../overlay.js';

/**
 * `<ody-tooltip>` — a small floating label shown when the trigger is hovered or
 * focused. The tooltip bubble is portaled to `document.body` (so it escapes any
 * `overflow: hidden` ancestor) and positioned with {@link position}.
 *
 * The **trigger** is an external element referenced by `for`, otherwise the
 * element's slotted child. Tooltip text comes from the `text` attribute, or from
 * any extra slotted children when a `for` trigger is used.
 *
 * Attributes:
 * - `text` — the tooltip text (alternative to slotted content).
 * - `placement` — `top` | `bottom` | `left` | `right` (default `top`).
 * - `for` — id of an external trigger element.
 */
export class OdyTooltip extends OdyElement {
  static observedAttributes = ['text', 'placement', 'for'];

  #bubble: HTMLElement | null = null;
  #trigger: Element | null = null;
  #visible = false;

  /** Whether the tooltip is currently shown. */
  get isVisible(): boolean {
    return this.#visible;
  }

  /** Show the tooltip and position it against its trigger. */
  show(): void {
    const bubble = this.#bubble;
    const trigger = this.#trigger;
    if (this.#visible || !bubble || !trigger) return;
    this.#visible = true;
    portal(bubble);
    bubble.classList.add('ody-tooltip--visible');
    const placement = this.attr('placement', 'top') as OdyPlacement;
    const { top, left } = position(trigger, bubble, placement);
    bubble.style.position = 'absolute';
    bubble.style.top = `${top}px`;
    bubble.style.left = `${left}px`;
  }

  /** Hide the tooltip. */
  hide(): void {
    if (!this.#visible) return;
    this.#visible = false;
    this.#bubble?.classList.remove('ody-tooltip--visible');
    if (this.#bubble) removePortal(this.#bubble);
  }

  #onEnter = (): void => this.show();
  #onLeave = (): void => this.hide();

  protected render(): void {
    if (this.#visible) this.hide();
    this.#unbind();
    // Bring the portaled bubble back so the base `mount` can reclaim the slotted
    // content (which lives in the bubble's inner slot). The trigger lives in a
    // separate slot, so push it back into the slot too.
    if (this.#bubble) {
      this.appendChild(this.#bubble);
      this.#bubble.classList.remove('ody-tooltip--visible');
    }
    const slotted = this.querySelector('[data-ody-tooltip-trigger-slot]')?.firstElementChild;
    const slotEl = this.querySelector('[data-ody-slot]');
    if (slotted && slotEl) slotEl.insertBefore(slotted, slotEl.firstChild);
    this.#visible = false;

    const placement = this.attr('placement', 'top');
    const text = this.attr('text');

    this.mount(
      `<span class="ody-tooltip__trigger" data-ody-tooltip-trigger-slot></span>` +
      `<p class="${classes('ody-tooltip', `ody-tooltip--${placement}`)}" role="tooltip">` +
        `<span data-ody-slot>${this.esc(text)}</span></p>`,
    );

    const triggerSlot = this.querySelector('[data-ody-tooltip-trigger-slot]')!;
    const contentSlot = this.querySelector('[data-ody-slot]');
    const forId = this.attr('for');

    if (forId) {
      this.#trigger = document.getElementById(forId);
    } else if (contentSlot?.firstElementChild) {
      const first = contentSlot.firstElementChild;
      triggerSlot.appendChild(first);
      this.#trigger = first;
    }

    this.#bubble = this.querySelector('.ody-tooltip');
    this.#bind();
  }

  #bind(): void {
    if (!this.#trigger) return;
    this.#trigger.addEventListener('mouseenter', this.#onEnter);
    this.#trigger.addEventListener('focusin', this.#onEnter);
    this.#trigger.addEventListener('mouseleave', this.#onLeave);
    this.#trigger.addEventListener('focusout', this.#onLeave);
  }

  #unbind(): void {
    if (!this.#trigger) return;
    this.#trigger.removeEventListener('mouseenter', this.#onEnter);
    this.#trigger.removeEventListener('focusin', this.#onEnter);
    this.#trigger.removeEventListener('mouseleave', this.#onLeave);
    this.#trigger.removeEventListener('focusout', this.#onLeave);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unbind();
    if (this.#bubble) removePortal(this.#bubble);
    this.#bubble = null;
    this.#trigger = null;
  }
}

define('ody-tooltip', OdyTooltip);
