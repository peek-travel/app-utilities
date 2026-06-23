// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/ui/components/accordion.js';
import '../../src/ui/components/collapsible.js';
import '../../src/ui/components/tabs.js';
import '../../src/ui/components/copy-button.js';
import '../../src/ui/components/check-in-status.js';
import '../../src/ui/components/option.js';
import '../../src/ui/components/split-button.js';
import '../../src/ui/components/table-header.js';

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

describe('ody-accordion', () => {
  it('renders the title collapsed by default with the body hidden', async () => {
    const el = await mount('<ody-accordion title="Details">Body</ody-accordion>');
    expect(el.querySelector('.ody-accordion__content-container__title')!.textContent).toBe('Details');
    expect(el.querySelector('.ody-accordion__body-container--hidden')).not.toBeNull();
    expect(el.querySelector('[aria-expanded="false"]')).not.toBeNull();
  });

  it('renders open + sticky and shows the body', async () => {
    const el = await mount('<ody-accordion title="X" open sticky>Body</ody-accordion>');
    expect(el.querySelector('.ody-accordion--sticky-header')).not.toBeNull();
    expect(el.querySelector('.ody-accordion__body-container--hidden')).toBeNull();
  });

  it('toggles open and dispatches a toggle event on header click', async () => {
    const el = await mount<HTMLElement>('<ody-accordion title="X">Body</ody-accordion>');
    const events: boolean[] = [];
    el.addEventListener('toggle', (e) => events.push((e as CustomEvent).detail.open));
    el.querySelector<HTMLElement>('.ody-accordion__header-container')!.click();
    expect(el.hasAttribute('open')).toBe(true);
    el.querySelector<HTMLElement>('.ody-accordion__header-container')!.click();
    expect(el.hasAttribute('open')).toBe(false);
    expect(events).toEqual([true, false]);
  });
});

describe('ody-collapsible', () => {
  it('renders the label closed and toggles open on header click', async () => {
    const el = await mount<HTMLElement>('<ody-collapsible label="More">Body</ody-collapsible>');
    expect(el.querySelector('.ody-collapsible__header__label')!.textContent).toBe('More');
    expect(el.querySelector('.ody-collapsible__content--active')).toBeNull();
    const detail: boolean[] = [];
    el.addEventListener('toggle', (e) => detail.push((e as CustomEvent).detail.open));
    el.querySelector<HTMLElement>('.ody-collapsible__header')!.click();
    expect(el.querySelector('.ody-collapsible__content--active')).not.toBeNull();
    expect(el.querySelector('.ody-collapsible__header--expanded')).not.toBeNull();
    el.querySelector<HTMLElement>('.ody-collapsible__header')!.click();
    expect(detail).toEqual([true, false]);
  });

  it('renders expanded when open is set initially', async () => {
    const el = await mount('<ody-collapsible label="X" open>Body</ody-collapsible>');
    expect(el.querySelector('.ody-collapsible--expanded')).not.toBeNull();
  });
});

describe('ody-tabs', () => {
  const tabs = '[{"id":"a","label":"Alpha"},{"id":"b","label":"Beta"},{"id":"c","label":"Gamma","disabled":true}]';

  it('renders the tab list and defaults the active tab to the first', async () => {
    const el = await mount(`<ody-tabs size="small" position="left" tabs='${tabs}'></ody-tabs>`);
    expect(el.querySelector('.tab-list--left')).not.toBeNull();
    expect(el.querySelectorAll('.tab-item').length).toBe(3);
    expect(el.querySelector('.tab-item--active')!.textContent).toBe('Alpha');
    expect(el.querySelector('.tab-item--size-small')).not.toBeNull();
    expect(el.querySelector('.tab-item--disabled')).not.toBeNull();
  });

  it('activates a tab on click and dispatches change', async () => {
    const el = await mount<HTMLElement>(`<ody-tabs tabs='${tabs}'></ody-tabs>`);
    const ids: string[] = [];
    el.addEventListener('change', (e) => ids.push((e as CustomEvent).detail.id));
    el.querySelectorAll<HTMLElement>('.tab-item')[1].click();
    expect(el.getAttribute('active')).toBe('b');
    expect(el.querySelector('.tab-item--active')!.textContent).toBe('Beta');
    // a click reaching the disabled tab (e.g. dispatched directly) is ignored
    el.querySelectorAll<HTMLElement>('.tab-item')[2].dispatchEvent(new Event('click'));
    expect(el.getAttribute('active')).toBe('b');
    expect(ids).toEqual(['b']);
  });

  it('honours an explicit active attribute and renders nothing for invalid/empty JSON', async () => {
    const el = await mount(`<ody-tabs active="b" tabs='${tabs}'></ody-tabs>`);
    expect(el.querySelector('.tab-item--active')!.textContent).toBe('Beta');

    const empty = await mount('<ody-tabs></ody-tabs>');
    expect(empty.querySelectorAll('.tab-item').length).toBe(0);

    const bad = await mount(`<ody-tabs tabs='not json'></ody-tabs>`);
    expect(bad.querySelectorAll('.tab-item').length).toBe(0);

    const notArray = await mount(`<ody-tabs tabs='{"id":"a"}'></ody-tabs>`);
    expect(notArray.querySelectorAll('.tab-item').length).toBe(0);
  });
});

describe('ody-copy-button', () => {
  it('copies the value, shows success, dispatches copy, then reverts', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const el = await mount<HTMLElement>('<ody-copy-button value="hello" label="Copy" success-duration="500"></ody-copy-button>');
    const detail: Array<{ value: string; ok: boolean }> = [];
    el.addEventListener('copy', (e) => detail.push((e as CustomEvent).detail));
    el.querySelector('button')!.click();
    await Promise.resolve();
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(el.querySelector('.ody-button.success')).not.toBeNull();
    expect(detail).toEqual([{ value: 'hello', ok: true }]);
    vi.advanceTimersByTime(500);
    expect(el.querySelector('.ody-button.success')).toBeNull();
  });

  it('shows an error state when the clipboard write rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('nope'));
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const el = await mount<HTMLElement>('<ody-copy-button value="x"></ody-copy-button>');
    const detail: Array<{ ok: boolean }> = [];
    el.addEventListener('copy', (e) => detail.push((e as CustomEvent).detail));
    el.querySelector('button')!.click();
    await Promise.resolve();
    await Promise.resolve();
    expect(el.querySelector('.ody-button.danger')).not.toBeNull();
    expect(el.querySelector('.ody-button--icon-only')).not.toBeNull();
    expect(detail[0].ok).toBe(false);
  });

  it('falls back to an error state when the clipboard API is missing', async () => {
    vi.stubGlobal('navigator', {});
    const el = await mount<HTMLElement>('<ody-copy-button value="x" label="C"></ody-copy-button>');
    el.querySelector('button')!.click();
    expect(el.querySelector('.ody-button.danger')).not.toBeNull();
  });

  it('clears a pending timer on a second copy and tolerates a non-numeric duration', async () => {
    vi.stubGlobal('navigator', { clipboard: {} }); // no writeText -> error path, runs #feedback
    const el = await mount<HTMLElement>('<ody-copy-button value="x" success-duration="abc"></ody-copy-button>');
    el.querySelector('button')!.click();
    // second click while the first revert timer is still pending exercises clearTimeout
    el.querySelector('button')!.click();
    expect(el.querySelector('.ody-button.danger')).not.toBeNull();
  });

  it('skips the revert render after the element is disconnected', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('navigator', { clipboard: {} });
    const el = await mount<HTMLElement>('<ody-copy-button value="x" success-duration="100"></ody-copy-button>');
    el.querySelector('button')!.click();
    el.remove(); // now not connected; the pending timer must not throw on render
    expect(() => vi.advanceTimersByTime(100)).not.toThrow();
  });
});

describe('ody-check-in-status', () => {
  it.each([
    ['IN_PROGRESS', 'In progress'],
    ['NO_SHOW', 'No show'],
    ['OVERDUE', 'Overdue'],
    ['RESERVED', 'Reserved'],
    ['RETURNED', 'Returned'],
    ['NONE', 'None'],
  ])('maps the %s status to its icon and label', async (status, label) => {
    const el = await mount(`<ody-check-in-status status="${status}"></ody-check-in-status>`);
    expect(el.querySelector('.check-in-status__inner-content__status-label')!.textContent).toBe(label);
    expect(el.querySelector('.icon .icon__svg')).not.toBeNull();
  });

  it('falls back for unknown status, overrides the label and shows optional text', async () => {
    const el = await mount('<ody-check-in-status status="BOGUS" label="Custom" optional-text="Seat 4A"></ody-check-in-status>');
    expect(el.querySelector('.check-in-status__inner-content__status-label')!.textContent).toBe('Custom');
    expect(el.querySelector('.check-in-status__inner-content__optional-text')!.textContent).toBe('Seat 4A');
  });

  it('omits optional text when absent', async () => {
    const el = await mount('<ody-check-in-status></ody-check-in-status>');
    expect(el.querySelector('.check-in-status__inner-content__optional-text')).toBeNull();
  });
});

describe('ody-option', () => {
  it('renders content and dispatches select on row click', async () => {
    const el = await mount<HTMLElement>('<ody-option>Pick me</ody-option>');
    expect(el.querySelector('.ody-option__content-group__content')!.textContent).toBe('Pick me');
    let selected = false;
    el.addEventListener('select', () => { selected = true; });
    el.querySelector<HTMLElement>('.ody-option')!.click();
    expect(selected).toBe(true);
  });

  it('renders the sub-menu trigger and dispatches submenu without selecting', async () => {
    const el = await mount<HTMLElement>('<ody-option selected sub-menu>Row</ody-option>');
    expect(el.querySelector('.ody-option--selected')).not.toBeNull();
    let sub = false;
    let select = false;
    el.addEventListener('submenu', () => { sub = true; });
    el.addEventListener('select', () => { select = true; });
    el.querySelector<HTMLElement>('.ody-option__popover__popover-trigger')!.click();
    expect(sub).toBe(true);
    expect(select).toBe(false);
  });

  it('does not fire select when disabled', async () => {
    const el = await mount<HTMLElement>('<ody-option disabled>Row</ody-option>');
    expect(el.querySelector('.ody-option--disabled')).not.toBeNull();
    let selected = false;
    el.addEventListener('select', () => { selected = true; });
    el.querySelector<HTMLElement>('.ody-option')!.click();
    expect(selected).toBe(false);
  });
});

describe('ody-split-button', () => {
  it('renders the primary label and dispatches primary on click', async () => {
    const el = await mount<HTMLElement>('<ody-split-button text="Save" variant="primary" size="small">Menu</ody-split-button>');
    expect(el.querySelector('.split-button__left-button .ody-button__label')!.textContent).toBe('Save');
    expect(el.querySelector('.btn-primary')).not.toBeNull();
    let primary = false;
    el.addEventListener('primary', () => { primary = true; });
    el.querySelector<HTMLElement>('.split-button__left-button')!.click();
    expect(primary).toBe(true);
  });

  it('toggles the dropdown open and dispatches toggle', async () => {
    const el = await mount<HTMLElement>('<ody-split-button text="Save">Menu</ody-split-button>');
    expect(el.querySelector('.split-button__panel')!.hasAttribute('hidden')).toBe(true);
    const detail: boolean[] = [];
    el.addEventListener('toggle', (e) => detail.push((e as CustomEvent).detail.open));
    el.querySelector<HTMLElement>('.split-button__right-button')!.click();
    expect(el.hasAttribute('open')).toBe(true);
    expect(el.querySelector('.split-button__right-button.ody-button--active')).not.toBeNull();
    expect(el.querySelector('.split-button__panel')!.hasAttribute('hidden')).toBe(false);
    el.querySelector<HTMLElement>('.split-button__right-button')!.click();
    expect(detail).toEqual([true, false]);
  });
});

describe('ody-table-header', () => {
  it('cycles none -> desc -> asc -> none and dispatches sort', async () => {
    const el = await mount<HTMLElement>('<ody-table-header column-name="Name" column-id="name"></ody-table-header>');
    expect(el.querySelector('.table-header__text')!.textContent).toBe('Name');
    expect(el.querySelector('.table-header-container--active')).toBeNull();
    const dirs: Array<{ direction: string; columnId: string }> = [];
    el.addEventListener('sort', (e) => dirs.push((e as CustomEvent).detail));
    const click = () => el.querySelector<HTMLElement>('.table-header-container')!.click();
    click();
    expect(el.getAttribute('direction')).toBe('DESC');
    expect(el.querySelector('.table-header-container--active')).not.toBeNull();
    click();
    expect(el.getAttribute('direction')).toBe('ASC');
    click();
    expect(el.getAttribute('direction')).toBe('UNSET');
    expect(dirs.map((d) => d.direction)).toEqual(['DESC', 'ASC', 'UNSET']);
    expect(dirs[0].columnId).toBe('name');
  });

  it('renders a static, non-interactive header with rounded corners', async () => {
    const el = await mount<HTMLElement>('<ody-table-header column-name="ID" static rounded-left rounded-right></ody-table-header>');
    expect(el.querySelector('.table-header-container--static')).not.toBeNull();
    expect(el.querySelector('.table-header-container--rounded-left')).not.toBeNull();
    expect(el.querySelector('.table-header-container--rounded-right')).not.toBeNull();
    expect(el.querySelector('.table-header__inner-content')).toBeNull();
  });

  it('starts from an explicit (and normalises an invalid) direction', async () => {
    const asc = await mount('<ody-table-header column-name="A" direction="asc"></ody-table-header>');
    expect(asc.querySelector('.table-header-container--active')).not.toBeNull();
    const bad = await mount('<ody-table-header column-name="A" direction="weird"></ody-table-header>');
    expect(bad.querySelector('.table-header-container--active')).toBeNull();
  });
});
