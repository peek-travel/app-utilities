// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import {
  OdyDatePicker,
  daysInMonth,
  formatLocalDate,
  parseLocalDate,
} from '../../src/ui/components/datepicker.js';

/** Render HTML, flush the deferred first render, and return the first element. */
async function mount<T extends Element = Element>(html: string): Promise<T> {
  document.body.innerHTML = html;
  await Promise.resolve();
  return document.body.firstElementChild as T;
}

afterEach(() => {
  document.body.innerHTML = '';
});

function trigger(el: Element): HTMLButtonElement {
  return el.querySelector<HTMLButtonElement>('.ody-datepicker__trigger')!;
}

function dayCell(el: Element, date: string): HTMLElement {
  return el.querySelector<HTMLElement>(`.ody-datepicker__day[data-date="${date}"]`)!;
}

function key(el: Element, k: string, opts: KeyboardEventInit = {}): void {
  const grid = el.querySelector('.ody-datepicker__grid')!;
  grid.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...opts }));
}

describe('date helpers', () => {
  it('parseLocalDate builds a local Date without UTC drift', () => {
    const d = parseLocalDate('2026-03-15')!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
  });

  it('parseLocalDate rejects malformed and out-of-range input', () => {
    expect(parseLocalDate('')).toBeNull();
    expect(parseLocalDate('2026-3-5')).toBeNull();
    expect(parseLocalDate('not-a-date')).toBeNull();
    expect(parseLocalDate('2026-13-01')).toBeNull();
    expect(parseLocalDate('2026-00-01')).toBeNull();
    expect(parseLocalDate('2026-02-30')).toBeNull(); // overflow
    expect(parseLocalDate('2026-01-32')).toBeNull();
  });

  it('formatLocalDate zero-pads and round-trips', () => {
    expect(formatLocalDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(formatLocalDate(parseLocalDate('2026-12-31')!)).toBe('2026-12-31');
  });

  it('daysInMonth handles leap years', () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 1)).toBe(31);
    expect(daysInMonth(2026, 4)).toBe(30);
  });
});

describe('ody-datepicker rendering', () => {
  it('renders a trigger showing the formatted value', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    // Display is localized; the value stays machine-readable ISO.
    expect(trigger(el).textContent).toContain('Mar 15, 2026');
    expect(trigger(el).textContent).not.toContain('2026-03-15');
    expect(el.getAttribute('value')).toBe('2026-03-15');
    expect(trigger(el).getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('.ody-datepicker__popover-container')).toBeNull();
  });

  it('shows the placeholder when there is no value', async () => {
    const el = await mount('<ody-datepicker placeholder="Pick a day"></ody-datepicker>');
    expect(trigger(el).textContent).toContain('Pick a day');
  });

  it('falls back to a default placeholder', async () => {
    const el = await mount('<ody-datepicker></ody-datepicker>');
    expect(trigger(el).textContent).toContain('Select date');
  });
});

describe('ody-datepicker open / close', () => {
  it('opens on trigger click and renders a grid with weekday headers', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    trigger(el).click();
    const dp = el as OdyDatePicker;
    expect(dp.isOpen).toBe(true);
    expect(el.querySelector('.ody-datepicker__popover-container')).not.toBeNull();
    expect(el.querySelector('.ody-datepicker__grid[role="grid"]')).not.toBeNull();
    const headers = el.querySelectorAll('.ody-datepicker__weekday');
    expect(headers.length).toBe(7);
    expect(headers[0]!.getAttribute('abbr')).toBe('Sunday');
    expect(el.querySelector('.ody-datepicker__title')!.textContent).toBe('March 2026');
  });

  it('honours first-day-of-week', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15" first-day-of-week="1"></ody-datepicker>');
    trigger(el).click();
    const headers = el.querySelectorAll('.ody-datepicker__weekday');
    expect(headers[0]!.textContent).toBe('Mon');
  });

  it('clamps an invalid first-day-of-week to 0', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15" first-day-of-week="9"></ody-datepicker>');
    trigger(el).click();
    expect(el.querySelectorAll('.ody-datepicker__weekday')[0]!.textContent).toBe('Sun');
  });

  it('toggles closed on a second trigger click', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    trigger(el).click();
    trigger(el).click();
    expect((el as OdyDatePicker).isOpen).toBe(false);
    expect(el.querySelector('.ody-datepicker__popover-container')).toBeNull();
  });

  it('closes on an outside click', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    trigger(el).click();
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect((el as OdyDatePicker).isOpen).toBe(false);
  });

  it('ignores clicks inside the popover for outside-close', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    trigger(el).click();
    const inside = el.querySelector('.ody-datepicker__title')!;
    inside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect((el as OdyDatePicker).isOpen).toBe(true);
  });

  it('openPopover/closePopover are idempotent', async () => {
    const el = (await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>')) as OdyDatePicker;
    el.closePopover(); // already closed: no-op
    el.openPopover();
    el.openPopover(); // already open: no-op
    expect(el.isOpen).toBe(true);
  });

  it('opens with no value, focusing the first of the current month', async () => {
    const el = (await mount('<ody-datepicker></ody-datepicker>')) as OdyDatePicker;
    el.openPopover();
    // No selection: the roving day is the 1st of the (current) view month.
    const focused = el.querySelector<HTMLElement>('.ody-datepicker__day[tabindex="0"]')!;
    expect(focused).not.toBeNull();
    // Title reflects the current month/year (today-relative, so just assert shape).
    expect(el.querySelector('.ody-datepicker__title')!.textContent).toMatch(/^[A-Z][a-z]+ \d{4}$/);
  });

  it('focuses the first of the month when reopening on a non-current month', async () => {
    const el = (await mount('<ody-datepicker></ody-datepicker>')) as OdyDatePicker;
    el.openPopover();
    const title = el.querySelector('.ody-datepicker__title')!.textContent!;
    el.querySelector<HTMLElement>('[data-nav="next"]')!.click(); // move off the current month
    const movedTitle = el.querySelector('.ody-datepicker__title')!.textContent!;
    expect(movedTitle).not.toBe(title);
    el.closePopover();
    el.openPopover(); // empty value: keeps the navigated month, focuses its 1st
    expect(el.querySelector('.ody-datepicker__title')!.textContent).toBe(movedTitle);
    const focused = el.querySelector<HTMLElement>('.ody-datepicker__day[tabindex="0"]')!;
    expect(focused.textContent).toBe('1');
  });

  it('removes the document listener on disconnect', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    trigger(el).click();
    el.remove();
    // After disconnect an outside click must not throw.
    expect(() => document.dispatchEvent(new MouseEvent('click', { bubbles: true }))).not.toThrow();
  });
});

describe('ody-datepicker nav', () => {
  it('navigates to the previous and next month', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    trigger(el).click();
    el.querySelector<HTMLElement>('[data-nav="prev"]')!.click();
    expect(el.querySelector('.ody-datepicker__title')!.textContent).toBe('February 2026');
    el.querySelector<HTMLElement>('[data-nav="next"]')!.click();
    expect(el.querySelector('.ody-datepicker__title')!.textContent).toBe('March 2026');
    el.querySelector<HTMLElement>('[data-nav="next"]')!.click();
    expect(el.querySelector('.ody-datepicker__title')!.textContent).toBe('April 2026');
  });

  it('crosses a year boundary going backwards', async () => {
    const el = await mount('<ody-datepicker value="2026-01-15"></ody-datepicker>');
    trigger(el).click();
    el.querySelector<HTMLElement>('[data-nav="prev"]')!.click();
    expect(el.querySelector('.ody-datepicker__title')!.textContent).toBe('December 2025');
  });
});

describe('ody-datepicker single selection', () => {
  it('selects a day, fires change once, updates value, and closes', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    let detail: { value?: string } | null = null;
    let count = 0;
    el.addEventListener('change', (e) => {
      count++;
      detail = (e as CustomEvent).detail;
    });
    trigger(el).click();
    dayCell(el, '2026-03-20').click();
    expect(count).toBe(1);
    expect(detail!.value).toBe('2026-03-20');
    expect(el.getAttribute('value')).toBe('2026-03-20');
    expect((el as OdyDatePicker).isOpen).toBe(false);
  });

  it('does NOT fire change on a programmatic value set', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    let fired = false;
    el.addEventListener('change', () => { fired = true; });
    el.setAttribute('value', '2026-04-01');
    await Promise.resolve();
    expect(fired).toBe(false);
    expect(trigger(el).textContent).toContain('Apr 1, 2026');
  });

  it('marks the selected day with aria-selected and renders today', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    trigger(el).click();
    expect(dayCell(el, '2026-03-15').getAttribute('aria-selected')).toBe('true');
    expect(dayCell(el, '2026-03-15').className).toContain('ody-datepicker__day--selected');
  });
});

describe('ody-datepicker range selection', () => {
  it('selects a start then end, firing change with start/end', async () => {
    const el = await mount('<ody-datepicker range></ody-datepicker>');
    let detail: { value?: string; start?: string; end?: string } | null = null;
    let count = 0;
    el.addEventListener('change', (e) => {
      count++;
      detail = (e as CustomEvent).detail;
    });
    el.setAttribute('value', '2026-03-10/2026-03-20'); // anchor view to March
    await Promise.resolve();
    trigger(el).click();
    dayCell(el, '2026-03-05').click(); // first click: start, no change yet
    expect(count).toBe(0);
    expect((el as OdyDatePicker).isOpen).toBe(true);
    dayCell(el, '2026-03-12').click(); // second click: end
    expect(count).toBe(1);
    expect(detail!.value).toBe('2026-03-05/2026-03-12');
    expect(detail!.start).toBe('2026-03-05');
    expect(detail!.end).toBe('2026-03-12');
    expect((el as OdyDatePicker).isOpen).toBe(false);
  });

  it('normalizes a reversed range (end before start)', async () => {
    const el = await mount('<ody-datepicker range value="2026-03-01/2026-03-02"></ody-datepicker>');
    let detail: { start?: string; end?: string } | null = null;
    el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail; });
    trigger(el).click();
    dayCell(el, '2026-03-20').click();
    dayCell(el, '2026-03-10').click();
    expect(detail!.start).toBe('2026-03-10');
    expect(detail!.end).toBe('2026-03-20');
  });

  it('highlights days between the endpoints', async () => {
    const el = await mount('<ody-datepicker range value="2026-03-10/2026-03-13"></ody-datepicker>');
    trigger(el).click();
    expect(dayCell(el, '2026-03-10').className).toContain('ody-datepicker__day--selected');
    expect(dayCell(el, '2026-03-13').className).toContain('ody-datepicker__day--selected');
    expect(dayCell(el, '2026-03-11').className).toContain('ody-datepicker__day--in-range');
    expect(dayCell(el, '2026-03-12').className).toContain('ody-datepicker__day--in-range');
    expect(dayCell(el, '2026-03-09').className).not.toContain('ody-datepicker__day--in-range');
  });

  it('shows the partial range value in the trigger', async () => {
    const el = await mount('<ody-datepicker range value="2026-03-10"></ody-datepicker>');
    expect(trigger(el).textContent).toContain('Mar 10, 2026');
  });
});

describe('ody-datepicker keyboard', () => {
  it('Arrow keys move the roving focus by day and week', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    trigger(el).click();
    key(el, 'ArrowRight');
    expect(dayCell(el, '2026-03-16').getAttribute('tabindex')).toBe('0');
    key(el, 'ArrowLeft');
    key(el, 'ArrowLeft');
    expect(dayCell(el, '2026-03-14').getAttribute('tabindex')).toBe('0');
    key(el, 'ArrowDown');
    expect(dayCell(el, '2026-03-21').getAttribute('tabindex')).toBe('0');
    key(el, 'ArrowUp');
    key(el, 'ArrowUp');
    expect(dayCell(el, '2026-03-07').getAttribute('tabindex')).toBe('0');
  });

  it('Home/End move to the start/end of the week', async () => {
    const el = await mount('<ody-datepicker value="2026-03-18"></ody-datepicker>'); // Wednesday
    trigger(el).click();
    key(el, 'Home');
    expect(dayCell(el, '2026-03-15').getAttribute('tabindex')).toBe('0'); // Sunday
    key(el, 'End');
    expect(dayCell(el, '2026-03-21').getAttribute('tabindex')).toBe('0'); // Saturday
  });

  it('PageUp/PageDown change the visible month, Shift changes the year', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    trigger(el).click();
    key(el, 'PageDown');
    expect(el.querySelector('.ody-datepicker__title')!.textContent).toBe('April 2026');
    key(el, 'PageUp');
    expect(el.querySelector('.ody-datepicker__title')!.textContent).toBe('March 2026');
    key(el, 'PageUp', { shiftKey: true });
    expect(el.querySelector('.ody-datepicker__title')!.textContent).toBe('March 2025');
    key(el, 'PageDown', { shiftKey: true });
    expect(el.querySelector('.ody-datepicker__title')!.textContent).toBe('March 2026');
  });

  it('crosses the month edge with arrow keys', async () => {
    const el = await mount('<ody-datepicker value="2026-03-01"></ody-datepicker>');
    trigger(el).click();
    key(el, 'ArrowLeft');
    expect(el.querySelector('.ody-datepicker__title')!.textContent).toBe('February 2026');
    expect(dayCell(el, '2026-02-28').getAttribute('tabindex')).toBe('0');
  });

  it('Enter selects the focused day', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    let value = '';
    el.addEventListener('change', (e) => { value = (e as CustomEvent).detail.value; });
    trigger(el).click();
    key(el, 'ArrowRight');
    key(el, 'Enter');
    expect(value).toBe('2026-03-16');
    expect((el as OdyDatePicker).isOpen).toBe(false);
  });

  it('Space selects the focused day', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    let value = '';
    el.addEventListener('change', (e) => { value = (e as CustomEvent).detail.value; });
    trigger(el).click();
    key(el, ' ');
    expect(value).toBe('2026-03-15');
  });

  it('Escape closes the popover', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    trigger(el).click();
    key(el, 'Escape');
    expect((el as OdyDatePicker).isOpen).toBe(false);
  });

  it('ignores unrelated keys', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    trigger(el).click();
    key(el, 'a');
    expect(dayCell(el, '2026-03-15').getAttribute('tabindex')).toBe('0');
  });
});

describe('ody-datepicker disabled days', () => {
  it('disables days outside min/max and ignores selecting them', async () => {
    const el = await mount(
      '<ody-datepicker value="2026-03-15" min="2026-03-10" max="2026-03-20"></ody-datepicker>',
    );
    let fired = false;
    el.addEventListener('change', () => { fired = true; });
    trigger(el).click();
    expect(dayCell(el, '2026-03-05').getAttribute('aria-disabled')).toBe('true');
    expect(dayCell(el, '2026-03-25').getAttribute('aria-disabled')).toBe('true');
    expect(dayCell(el, '2026-03-15').hasAttribute('aria-disabled')).toBe(false);
    dayCell(el, '2026-03-05').click();
    expect(fired).toBe(false);
    expect((el as OdyDatePicker).isOpen).toBe(true);
  });

  it('honours isDateDisallowed', async () => {
    const el = (await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>')) as OdyDatePicker;
    el.isDateDisallowed = (d: Date) => d.getDate() === 17;
    trigger(el).click();
    expect(dayCell(el, '2026-03-17').getAttribute('aria-disabled')).toBe('true');
    expect(dayCell(el, '2026-03-16').hasAttribute('aria-disabled')).toBe(false);
  });

  it('prevents keyboard selecting a disallowed day', async () => {
    const el = (await mount('<ody-datepicker value="2026-03-15" max="2026-03-15"></ody-datepicker>')) as OdyDatePicker;
    let fired = false;
    el.addEventListener('change', () => { fired = true; });
    trigger(el).click();
    key(el, 'ArrowRight'); // 2026-03-16 is past max
    key(el, 'Enter');
    expect(fired).toBe(false);
  });
});

describe('ody-datepicker presets', () => {
  it('renders preset buttons and selects a single value', async () => {
    const presets = JSON.stringify([{ label: 'Mid March', value: '2026-03-15' }]);
    const el = await mount(`<ody-datepicker value="2026-03-15" presets='${presets}'></ody-datepicker>`);
    let value = '';
    el.addEventListener('change', (e) => { value = (e as CustomEvent).detail.value; });
    trigger(el).click();
    const btns = el.querySelectorAll<HTMLElement>('.ody-datepicker__preset');
    expect(btns.length).toBe(1);
    btns[0]!.click();
    expect(value).toBe('2026-03-15');
    expect((el as OdyDatePicker).isOpen).toBe(false);
  });

  it('selects a range preset', async () => {
    const presets = JSON.stringify([{ label: 'Span', value: '2026-03-01/2026-03-31' }]);
    const el = await mount(`<ody-datepicker range presets='${presets}'></ody-datepicker>`);
    let detail: { start?: string; end?: string } | null = null;
    el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail; });
    trigger(el).click();
    el.querySelector<HTMLElement>('.ody-datepicker__preset')!.click();
    expect(detail!.start).toBe('2026-03-01');
    expect(detail!.end).toBe('2026-03-31');
  });

  it('ignores malformed preset JSON and non-array / bad entries', async () => {
    const el = await mount(`<ody-datepicker value="2026-03-15" presets='not json'></ody-datepicker>`);
    trigger(el).click();
    expect(el.querySelector('.ody-datepicker__preset')).toBeNull();

    const el2 = await mount(`<ody-datepicker value="2026-03-15" presets='{"a":1}'></ody-datepicker>`);
    trigger(el2).click();
    expect(el2.querySelector('.ody-datepicker__preset')).toBeNull();

    const el3 = await mount(
      `<ody-datepicker value="2026-03-15" presets='[{"label":"x"},{"label":"ok","value":"2026-03-15"}]'></ody-datepicker>`,
    );
    trigger(el3).click();
    expect(el3.querySelectorAll('.ody-datepicker__preset').length).toBe(1);
  });

  it('ignores a preset with an unparseable value', async () => {
    const presets = JSON.stringify([{ label: 'Bad', value: 'nope' }]);
    const el = await mount(`<ody-datepicker value="2026-03-15" presets='${presets}'></ody-datepicker>`);
    let fired = false;
    el.addEventListener('change', () => { fired = true; });
    trigger(el).click();
    el.querySelector<HTMLElement>('.ody-datepicker__preset')!.click();
    expect(fired).toBe(false);
  });
});

describe('ody-datepicker localization & display format', () => {
  const dp = (el: Element): Element => el.querySelector('ody-datepicker') ?? el;

  it('formats the trigger via display-format (short/long/full)', async () => {
    const full = await mount('<ody-datepicker value="2026-03-15" display-format="full"></ody-datepicker>');
    expect(trigger(full).textContent).toContain('Sunday');
    expect(trigger(full).textContent).toContain('March');
    const long = await mount('<ody-datepicker value="2026-03-15" display-format="long"></ody-datepicker>');
    expect(trigger(long).textContent).toContain('March 15, 2026');
    const short = await mount('<ody-datepicker value="2026-03-15" display-format="short"></ody-datepicker>');
    expect(trigger(short).textContent).not.toContain('March');
    expect(trigger(short).textContent).toMatch(/\d/);
  });

  it('falls back to medium for an unknown display-format', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15" display-format="bogus"></ody-datepicker>');
    expect(trigger(el).textContent).toContain('Mar 15, 2026');
  });

  it('localizes display, calendar names and day labels from the lang attribute', async () => {
    const wrap = await mount('<div lang="es"><ody-datepicker value="2026-03-15"></ody-datepicker></div>');
    const el = dp(wrap);
    expect(trigger(el).textContent).not.toContain('Mar 15, 2026');
    trigger(el).click();
    expect(el.querySelector('.ody-datepicker__title')!.textContent).toContain('marzo');
    expect(dayCell(el, '2026-03-15').getAttribute('aria-label')!.toLowerCase()).toContain('marzo');
  });

  it('gives day cells a full localized aria-label', async () => {
    const el = await mount('<ody-datepicker value="2026-03-15"></ody-datepicker>');
    trigger(el).click();
    expect(dayCell(el, '2026-03-15').getAttribute('aria-label')).toContain('March 15, 2026');
  });

  it('formats a range display locale-aware', async () => {
    const el = await mount('<ody-datepicker range value="2026-03-10/2026-03-20"></ody-datepicker>');
    const text = trigger(el).textContent!;
    expect(text).toContain('Mar 10');
    expect(text).toContain('20');
    expect(text).not.toContain('2026-03-10');
  });

  it('honours a custom formatDate property for single and range', async () => {
    const single = document.createElement('ody-datepicker') as OdyDatePicker;
    single.formatDate = (d) => `D:${d.getFullYear()}`;
    single.setAttribute('value', '2026-03-15');
    document.body.appendChild(single);
    await Promise.resolve();
    expect(trigger(single).textContent).toContain('D:2026');

    const range = document.createElement('ody-datepicker') as OdyDatePicker;
    range.setAttribute('range', '');
    range.formatDate = (d) => `D:${d.getMonth() + 1}`;
    range.setAttribute('value', '2026-03-10/2026-04-20');
    document.body.appendChild(range);
    await Promise.resolve();
    expect(trigger(range).textContent).toContain('D:3');
    expect(trigger(range).textContent).toContain('D:4');
  });
});

describe('ody-datepicker range across month boundaries', () => {
  it('selects start in one month and end in a later month', async () => {
    const el = await mount('<ody-datepicker range value="2026-03-25/2026-03-26"></ody-datepicker>');
    let detail: { value?: string; start?: string; end?: string } | null = null;
    let count = 0;
    el.addEventListener('change', (e) => { count++; detail = (e as CustomEvent).detail; });
    trigger(el).click();
    dayCell(el, '2026-03-25').click();            // start (clears value, no change yet)
    expect(count).toBe(0);
    el.querySelector<HTMLElement>('[data-nav="next"]')!.click(); // navigate March → April
    expect(el.querySelector('.ody-datepicker__title')!.textContent).toBe('April 2026');
    dayCell(el, '2026-04-05').click();            // end in the next month
    expect(count).toBe(1);
    expect(detail!.value).toBe('2026-03-25/2026-04-05');
    expect(detail!.start).toBe('2026-03-25');
    expect(detail!.end).toBe('2026-04-05');
  });

  it('commits correctly when the end month is navigated before the start month', async () => {
    const el = await mount('<ody-datepicker range value="2026-04-10/2026-04-11"></ody-datepicker>');
    let detail: { start?: string; end?: string } | null = null;
    el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail; });
    trigger(el).click();
    dayCell(el, '2026-04-10').click();            // start in April
    el.querySelector<HTMLElement>('[data-nav="prev"]')!.click(); // navigate April → March
    dayCell(el, '2026-03-20').click();            // earlier end → range is normalized
    expect(detail!.start).toBe('2026-03-20');
    expect(detail!.end).toBe('2026-04-10');
  });

  it('highlights a committed cross-month range in each visible month', async () => {
    const el = await mount('<ody-datepicker range value="2026-03-28/2026-04-03"></ody-datepicker>');
    trigger(el).click();
    // March view: start endpoint selected, later March days in range.
    expect(dayCell(el, '2026-03-28').className).toContain('ody-datepicker__day--selected');
    expect(dayCell(el, '2026-03-30').className).toContain('ody-datepicker__day--in-range');
    expect(dayCell(el, '2026-03-31').className).toContain('ody-datepicker__day--in-range');
    el.querySelector<HTMLElement>('[data-nav="next"]')!.click(); // → April
    expect(dayCell(el, '2026-04-01').className).toContain('ody-datepicker__day--in-range');
    expect(dayCell(el, '2026-04-02').className).toContain('ody-datepicker__day--in-range');
    expect(dayCell(el, '2026-04-03').className).toContain('ody-datepicker__day--selected');
  });
});
