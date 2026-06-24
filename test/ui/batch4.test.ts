// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../src/ui/components/modal.js';
import '../../src/ui/components/popover.js';
import '../../src/ui/components/tooltip.js';
import '../../src/ui/components/panel.js';
import { toast } from '../../src/ui/components/toast-notification.js';
import { portal, position, removePortal } from '../../src/ui/overlay.js';
import type { OdyModal } from '../../src/ui/components/modal.js';
import type { OdyPopover } from '../../src/ui/components/popover.js';
import type { OdyTooltip } from '../../src/ui/components/tooltip.js';
import type { OdyPanel } from '../../src/ui/components/panel.js';

/** Render HTML, flush the deferred first render, and return the first element. */
async function mount<T extends Element = Element>(html: string): Promise<T> {
  document.body.innerHTML = html;
  await Promise.resolve();
  return document.body.firstElementChild as T;
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('overlay helpers', () => {
  it('portal moves a node to body and removePortal detaches it', () => {
    const wrap = document.createElement('div');
    const child = document.createElement('span');
    wrap.appendChild(child);
    document.body.appendChild(wrap);

    portal(child);
    expect(child.parentNode).toBe(document.body);
    // Already on body: no-op.
    portal(child);
    expect(child.parentNode).toBe(document.body);

    removePortal(child);
    expect(child.parentNode).toBeNull();
    // Detached node: removePortal is a no-op.
    expect(() => removePortal(child)).not.toThrow();
  });

  it('position computes each placement and centres the cross axis', () => {
    // Anchor centred (left=400) so every placement fits the 1000px viewport.
    const anchor = { top: 400, bottom: 420, left: 400, right: 440, width: 40, height: 20 };
    const floating = { width: 100, height: 50 };
    const a = document.createElement('div');
    const f = document.createElement('div');
    vi.spyOn(a, 'getBoundingClientRect').mockReturnValue(anchor as DOMRect);
    vi.spyOn(f, 'getBoundingClientRect').mockReturnValue(floating as DOMRect);
    vi.stubGlobal('innerWidth', 1000);
    vi.stubGlobal('innerHeight', 1000);

    expect(position(a, f, 'bottom', 8)).toMatchObject({ placement: 'bottom', top: 428, left: 370 });
    expect(position(a, f, 'top', 8)).toMatchObject({ placement: 'top', top: 342, left: 370 });
    expect(position(a, f, 'right', 8)).toMatchObject({ placement: 'right', top: 385, left: 448 });
    expect(position(a, f, 'left', 8)).toMatchObject({ placement: 'left', top: 385, left: 292 });
  });

  it('position flips to the opposite edge when the preferred side overflows', () => {
    const a = document.createElement('div');
    const f = document.createElement('div');
    vi.spyOn(f, 'getBoundingClientRect').mockReturnValue({ width: 100, height: 100 } as DOMRect);
    vi.stubGlobal('innerWidth', 200);
    vi.stubGlobal('innerHeight', 200);

    // Anchor near the bottom edge -> bottom flips to top.
    vi.spyOn(a, 'getBoundingClientRect').mockReturnValue(
      { top: 150, bottom: 170, left: 20, right: 60, width: 40, height: 20 } as DOMRect,
    );
    expect(position(a, f, 'bottom').placement).toBe('top');

    // Anchor near the top edge -> top flips to bottom.
    vi.spyOn(a, 'getBoundingClientRect').mockReturnValue(
      { top: 10, bottom: 30, left: 20, right: 60, width: 40, height: 20 } as DOMRect,
    );
    expect(position(a, f, 'top').placement).toBe('bottom');

    // Anchor near the right edge -> right flips to left.
    vi.spyOn(a, 'getBoundingClientRect').mockReturnValue(
      { top: 80, bottom: 100, left: 150, right: 190, width: 40, height: 20 } as DOMRect,
    );
    expect(position(a, f, 'right').placement).toBe('left');

    // Anchor near the left edge -> left flips to right.
    vi.spyOn(a, 'getBoundingClientRect').mockReturnValue(
      { top: 80, bottom: 100, left: 10, right: 50, width: 40, height: 20 } as DOMRect,
    );
    expect(position(a, f, 'left').placement).toBe('right');
  });

  it('position adds scroll offset and defaults to bottom placement', () => {
    const a = document.createElement('div');
    const f = document.createElement('div');
    vi.spyOn(a, 'getBoundingClientRect').mockReturnValue(
      { top: 0, bottom: 20, left: 0, right: 40, width: 40, height: 20 } as DOMRect,
    );
    vi.spyOn(f, 'getBoundingClientRect').mockReturnValue({ width: 40, height: 10 } as DOMRect);
    vi.stubGlobal('innerWidth', 1000);
    vi.stubGlobal('innerHeight', 1000);
    vi.stubGlobal('scrollX', 5);
    vi.stubGlobal('scrollY', 15);

    const result = position(a, f);
    expect(result.placement).toBe('bottom');
    expect(result.top).toBe(20 + 8 + 15);
    expect(result.left).toBe(0 + 5);
  });

  it('treats a falsy viewport size as unbounded (no flip)', () => {
    const a = document.createElement('div');
    const f = document.createElement('div');
    vi.spyOn(a, 'getBoundingClientRect').mockReturnValue(
      { top: 0, bottom: 20, left: 0, right: 40, width: 40, height: 20 } as DOMRect,
    );
    vi.spyOn(f, 'getBoundingClientRect').mockReturnValue({ width: 40, height: 10 } as DOMRect);
    vi.stubGlobal('innerWidth', 0);
    vi.stubGlobal('innerHeight', 0);
    expect(position(a, f, 'bottom').placement).toBe('bottom');
    expect(position(a, f, 'right').placement).toBe('right');
  });
});

describe('overlay components — disconnect before first render', () => {
  // Removing before the deferred first render leaves the cached node refs null,
  // exercising the `null` branch of each disconnectedCallback cleanup.
  it.each([
    ['<ody-modal>x</ody-modal>'],
    ['<ody-panel>x</ody-panel>'],
    ['<ody-popover><button>t</button></ody-popover>'],
    ['<ody-tooltip text="x"><button>t</button></ody-tooltip>'],
  ])('cleanly disconnects %s with no rendered nodes', (html) => {
    document.body.innerHTML = html;
    const el = document.body.firstElementChild!;
    expect(() => el.remove()).not.toThrow();
  });
});

describe('ody-modal', () => {
  it('portals a hidden backdrop and dialog with default size', async () => {
    const el = await mount<OdyModal>('<ody-modal>Body</ody-modal>');
    const backdrop = document.body.querySelector('.ody-modal-backdrop')!;
    const dialog = document.body.querySelector('.ody-modal')!;
    expect(backdrop.parentElement).toBe(document.body);
    expect(dialog.parentElement).toBe(document.body);
    expect(dialog.className).toContain('ody-modal--size-base');
    expect(dialog.className).not.toContain('ody-modal--open');
    expect(dialog.querySelector('[data-ody-slot]')!.textContent).toContain('Body');
    expect(el.querySelector('.ody-modal__header')).toBeNull();
  });

  it('open()/close() toggle the open class and dispatch close', async () => {
    const el = await mount<OdyModal>('<ody-modal heading="Hi" size="large" icon="info">Body</ody-modal>');
    expect(document.body.querySelector('.ody-modal__header__title')!.textContent).toBe('Hi');
    expect(document.body.querySelector('.ody-modal__header__icon')).not.toBeNull();

    const onClose = vi.fn();
    el.addEventListener('close', onClose);

    el.open();
    expect(document.body.querySelector('.ody-modal--open')).not.toBeNull();

    el.close();
    expect(document.body.querySelector('.ody-modal--open')).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on backdrop click and Escape, but ignores clicks inside the dialog', async () => {
    const el = await mount<OdyModal>('<ody-modal open heading="X">Body</ody-modal>');
    const onClose = vi.fn();
    el.addEventListener('close', onClose);

    // Click inside the dialog (not the backdrop) -> no close.
    document.body.querySelector('.ody-modal')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClose).not.toHaveBeenCalled();

    const backdrop = document.body.querySelector('.ody-modal-backdrop') as HTMLElement;
    // A click whose target is a backdrop child (not the backdrop) is ignored.
    const inner = document.createElement('span');
    backdrop.appendChild(inner);
    inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClose).not.toHaveBeenCalled();
    inner.remove();

    // Backdrop click closes.
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(onClose).toHaveBeenCalledTimes(1);

    el.open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(2);
    // Escape while closed is ignored.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('closes via the header close button', async () => {
    const el = await mount<OdyModal>('<ody-modal open heading="X">Body</ody-modal>');
    const onClose = vi.fn();
    el.addEventListener('close', onClose);
    document.body.querySelector<HTMLButtonElement>('[data-ody-modal-close]')!.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores non-Escape keys', async () => {
    const el = await mount<OdyModal>('<ody-modal open heading="X">Body</ody-modal>');
    const onClose = vi.fn();
    el.addEventListener('close', onClose);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('preserves slotted content across an attribute re-render and cleans up on disconnect', async () => {
    const el = await mount<OdyModal>('<ody-modal>Body</ody-modal>');
    el.setAttribute('size', 'small');
    expect(document.body.querySelector('.ody-modal--size-small')!.textContent).toContain('Body');

    el.remove();
    expect(document.body.querySelector('.ody-modal-backdrop')).toBeNull();
    expect(document.body.querySelector('.ody-modal')).toBeNull();
  });
});

describe('ody-popover', () => {
  it('uses the first slotted child as trigger and toggles a portaled panel', async () => {
    const el = await mount<OdyPopover>(
      '<ody-popover><button>Open</button><div data-ody-popover-content>Menu</div></ody-popover>',
    );
    const trigger = el.querySelector('button')!;
    const onOpen = vi.fn();
    const onClose = vi.fn();
    el.addEventListener('open', onOpen);
    el.addEventListener('close', onClose);

    expect(el.isOpen).toBe(false);
    trigger.click();
    expect(el.isOpen).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);
    const panel = document.body.querySelector('.ody-popover__container--open')!;
    expect(panel.parentElement).toBe(document.body);
    expect(panel.textContent).toContain('Menu');

    trigger.click();
    expect(el.isOpen).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on an outside click but stays open for clicks inside panel/trigger', async () => {
    const el = await mount<OdyPopover>('<ody-popover><button>Open</button><div>Menu</div></ody-popover>');
    const trigger = el.querySelector('button')!;
    trigger.click();
    expect(el.isOpen).toBe(true);

    // Click inside the panel: stays open.
    document.body.querySelector('.ody-popover__container')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(el.isOpen).toBe(true);

    // Click elsewhere: closes.
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(el.isOpen).toBe(false);
  });

  it('supports an explicit trigger child and a `for` external trigger', async () => {
    const explicit = await mount<OdyPopover>(
      '<ody-popover><span>label</span><button data-ody-popover-trigger>T</button></ody-popover>',
    );
    explicit.querySelector('[data-ody-popover-trigger]')!.dispatchEvent(new MouseEvent('click'));
    expect(explicit.isOpen).toBe(true);

    document.body.innerHTML = '<button id="ext">ext</button><ody-popover for="ext"><div>Menu</div></ody-popover>';
    await Promise.resolve();
    const pop = document.body.querySelector('ody-popover') as OdyPopover;
    document.getElementById('ext')!.click();
    expect(pop.isOpen).toBe(true);
    pop.remove();
  });

  it('open is a no-op when already open and close a no-op when closed', async () => {
    const el = await mount<OdyPopover>('<ody-popover><button>x</button><div>m</div></ody-popover>');
    el.close(); // already closed
    expect(el.isOpen).toBe(false);
    el.open();
    el.open(); // already open
    expect(el.isOpen).toBe(true);
  });

  it('re-renders on an attribute change, reclaiming the panel and resetting state', async () => {
    const el = await mount<OdyPopover>('<ody-popover><button>x</button><div>Menu</div></ody-popover>');
    el.open();
    expect(el.isOpen).toBe(true);
    el.setAttribute('placement', 'top'); // triggers a re-render
    expect(el.isOpen).toBe(false);
    expect(el.querySelector('.ody-popover__container')!.textContent).toContain('Menu');
  });

  it('open() is a no-op when the `for` target is missing', async () => {
    const el = await mount<OdyPopover>('<ody-popover for="nope"><div>Menu</div></ody-popover>');
    el.open();
    expect(el.isOpen).toBe(false);
  });

  it('renders with no children and finds no trigger', async () => {
    const el = await mount<OdyPopover>('<ody-popover></ody-popover>');
    el.open();
    expect(el.isOpen).toBe(false);
  });
});

describe('ody-tooltip', () => {
  it('shows on hover/focus, hides on leave, and portals the bubble', async () => {
    const el = await mount<OdyTooltip>('<ody-tooltip text="Help"><button>?</button></ody-tooltip>');
    const trigger = el.querySelector('button')!;
    expect(el.isVisible).toBe(false);

    trigger.dispatchEvent(new Event('mouseenter'));
    expect(el.isVisible).toBe(true);
    const bubble = document.body.querySelector('.ody-tooltip--visible')!;
    expect(bubble.parentElement).toBe(document.body);
    expect(bubble.textContent).toContain('Help');

    trigger.dispatchEvent(new Event('mouseleave'));
    expect(el.isVisible).toBe(false);

    trigger.dispatchEvent(new Event('focusin'));
    expect(el.isVisible).toBe(true);
    trigger.dispatchEvent(new Event('focusout'));
    expect(el.isVisible).toBe(false);
  });

  it('supports a `for` trigger and a custom placement, and cleans up on disconnect', async () => {
    document.body.innerHTML =
      '<button id="tt">?</button><ody-tooltip for="tt" text="Hi" placement="right"></ody-tooltip>';
    await Promise.resolve();
    const el = document.body.querySelector('ody-tooltip') as OdyTooltip;
    expect(el.querySelector('.ody-tooltip--right')).not.toBeNull();

    document.getElementById('tt')!.dispatchEvent(new Event('mouseenter'));
    expect(el.isVisible).toBe(true);
    el.remove();
    expect(document.body.querySelector('.ody-tooltip')).toBeNull();
  });

  it('show is a no-op when already visible and hide a no-op when hidden', async () => {
    const el = await mount<OdyTooltip>('<ody-tooltip text="x"><button>?</button></ody-tooltip>');
    el.hide(); // already hidden
    expect(el.isVisible).toBe(false);
    el.show();
    el.show(); // already visible
    expect(el.isVisible).toBe(true);
  });

  it('re-renders on an attribute change, reclaiming the bubble', async () => {
    const el = await mount<OdyTooltip>('<ody-tooltip text="Hi"><button>?</button></ody-tooltip>');
    el.show();
    expect(el.isVisible).toBe(true);
    el.setAttribute('placement', 'bottom'); // triggers a re-render
    expect(el.isVisible).toBe(false);
    expect(el.querySelector('.ody-tooltip--bottom')).not.toBeNull();
  });

  it('show() is a no-op when the `for` target is missing', async () => {
    const el = await mount<OdyTooltip>('<ody-tooltip for="nope" text="Hi"></ody-tooltip>');
    el.show();
    expect(el.isVisible).toBe(false);
  });

  it('renders with no trigger child and finds no trigger', async () => {
    const el = await mount<OdyTooltip>('<ody-tooltip text="Hi"></ody-tooltip>');
    el.show();
    expect(el.isVisible).toBe(false);
  });
});

describe('ody-panel', () => {
  it('portals overlay+panel and toggles open state', async () => {
    const el = await mount<OdyPanel>('<ody-panel heading="Settings" full-height>Body</ody-panel>');
    const panel = document.body.querySelector('.ody-panel')!;
    expect(panel.parentElement).toBe(document.body);
    expect(panel.className).toContain('ody-panel--full-height');
    expect(panel.className).not.toContain('ody-panel--open');
    expect(document.body.querySelector('.ody-panel__header__title')!.textContent).toBe('Settings');
    expect(panel.querySelector('[data-ody-slot]')!.textContent).toContain('Body');

    el.open();
    expect(document.body.querySelector('.ody-panel--open')).not.toBeNull();
    expect(document.body.querySelector('.ody-panel__overlay--visible')).not.toBeNull();
  });

  it('closes on overlay click and close button, dispatching close', async () => {
    const el = await mount<OdyPanel>('<ody-panel open>Body</ody-panel>');
    const onClose = vi.fn();
    el.addEventListener('close', onClose);

    (document.body.querySelector('[data-ody-panel-overlay]') as HTMLElement).click();
    expect(onClose).toHaveBeenCalledTimes(1);

    el.open();
    (document.body.querySelector('[data-ody-panel-close]') as HTMLElement).click();
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('re-renders while open, reclaiming the panel and preserving slotted body', async () => {
    const el = await mount<OdyPanel>('<ody-panel open>Body</ody-panel>');
    el.setAttribute('heading', 'New'); // triggers a re-render while open
    const panel = document.body.querySelector('.ody-panel')!;
    expect(panel.querySelector('[data-ody-slot]')!.textContent).toContain('Body');
    expect(document.body.querySelector('.ody-panel__header__title')!.textContent).toBe('New');
  });

  it('cleans up portaled nodes on disconnect', async () => {
    const el = await mount<OdyPanel>('<ody-panel>Body</ody-panel>');
    el.remove();
    expect(document.body.querySelector('.ody-panel')).toBeNull();
    expect(document.body.querySelector('.ody-panel__overlay')).toBeNull();
  });
});

describe('toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.querySelector('ody-toast-host')?.remove();
  });

  it('creates a host on first use and stacks variant toasts with icons', () => {
    const handle = toast('Saved', { variant: 'success', title: 'Done', timeout: 0 });
    const host = document.body.querySelector('ody-toast-host')!;
    expect(host.parentElement).toBe(document.body);
    const note = host.querySelector('.toast-notification--success')!;
    expect(note.querySelector('.toast-notification__title')!.textContent).toBe('Done');
    expect(note.querySelector('.toast-notification__body')!.textContent).toContain('Saved');
    expect(note.querySelector('.toast-notification__icon .icon__svg')).not.toBeNull();

    // Becomes visible on the next frame.
    vi.advanceTimersToNextFrame();
    expect(note.classList.contains('toast-notification--visible')).toBe(true);

    // Manual dismiss removes after the transition delay.
    handle.dismiss();
    expect(note.classList.contains('toast-notification--visible')).toBe(false);
    vi.advanceTimersByTime(400);
    expect(host.querySelector('.toast-notification')).toBeNull();
  });

  it('defaults to the info variant and auto-dismisses after the timeout', () => {
    toast('Heads up');
    const host = document.body.querySelector('ody-toast-host')!;
    expect(host.querySelector('.toast-notification--info')).not.toBeNull();
    expect(host.querySelector('.toast-notification__title')).toBeNull();

    vi.advanceTimersByTime(4000);
    vi.advanceTimersByTime(400);
    expect(host.querySelector('.toast-notification')).toBeNull();
  });

  it('reuses the existing host and supports close-button dismissal', () => {
    toast('one', { timeout: 0 });
    toast('two', { timeout: 0 });
    const hosts = document.body.querySelectorAll('ody-toast-host');
    expect(hosts).toHaveLength(1);
    expect(hosts[0].querySelectorAll('.toast-notification')).toHaveLength(2);

    const first = hosts[0].querySelector<HTMLButtonElement>('.toast-notification__close-button')!;
    first.click();
    vi.advanceTimersByTime(400);
    expect(hosts[0].querySelectorAll('.toast-notification')).toHaveLength(1);
  });
});
