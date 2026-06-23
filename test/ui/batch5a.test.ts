// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/ui/components/dropdown-single.js';
import '../../src/ui/components/dropdown-multi.js';
import { OdyDropdownSingle } from '../../src/ui/components/dropdown-single.js';
import { OdyDropdownMulti } from '../../src/ui/components/dropdown-multi.js';
import { parseOptions } from '../../src/ui/select-base.js';

/** Render HTML, flush the deferred first render, and return the first element. */
async function mount<T extends Element = Element>(html: string): Promise<T> {
  document.body.innerHTML = html;
  await Promise.resolve();
  return document.body.firstElementChild as T;
}

/** Dispatch a keydown on the element's combobox trigger (or search input). */
function press(el: Element, key: string, onSearch = false): void {
  const target = onSearch
    ? el.querySelector('.ody-select__search-input')!
    : el.querySelector('[role="combobox"]')!;
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

const OPTS = '[{"value":"a","label":"Apple"},{"value":"b","label":"Banana"},{"value":"c","label":"Cherry","disabled":true}]';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('parseOptions', () => {
  it('parses valid JSON, defaulting label to value and disabled to false', () => {
    const out = parseOptions('[{"value":"x"},{"value":"y","label":"Why","disabled":true}]');
    expect(out).toEqual([
      { value: 'x', label: 'x', disabled: false },
      { value: 'y', label: 'Why', disabled: true },
    ]);
  });

  it('returns [] for empty, non-array, or malformed input', () => {
    expect(parseOptions('')).toEqual([]);
    expect(parseOptions('{"value":"x"}')).toEqual([]);
    expect(parseOptions('not json')).toEqual([]);
    expect(parseOptions('[1,2,{"nope":true}]')).toEqual([]);
  });
});

describe('ody-dropdown-single', () => {
  it('renders a combobox trigger with placeholder and closed listbox', async () => {
    const el = await mount<OdyDropdownSingle>(
      `<ody-dropdown-single placeholder="Pick one" label="Fruit" options='${OPTS}'></ody-dropdown-single>`,
    );
    const trigger = el.querySelector('[role="combobox"]')!;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger.getAttribute('aria-label')).toBe('Fruit');
    expect(el.querySelector('.ody-select__placeholder')!.textContent).toBe('Pick one');
    expect(el.querySelector('[role="listbox"]')!.getAttribute('aria-multiselectable')).toBe('false');
  });

  it('shows the selected label and a check when value is set', async () => {
    const el = await mount<OdyDropdownSingle>(
      `<ody-dropdown-single value="b" options='${OPTS}'></ody-dropdown-single>`,
    );
    expect(el.querySelector('.ody-select__label')!.textContent).toBe('Banana');
  });

  it('opens on click and closes on outside click', async () => {
    const el = await mount<OdyDropdownSingle>(`<ody-dropdown-single options='${OPTS}'></ody-dropdown-single>`);
    el.querySelector<HTMLButtonElement>('[role="combobox"]')!.click();
    expect(el.querySelector('[role="combobox"]')!.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('.ody-select__panel--open')).not.toBeNull();
    document.body.click();
    expect(el.querySelector('[role="combobox"]')!.getAttribute('aria-expanded')).toBe('false');
  });

  it('toggles closed when the trigger is clicked again', async () => {
    const el = await mount<OdyDropdownSingle>(`<ody-dropdown-single options='${OPTS}'></ody-dropdown-single>`);
    const trigger = () => el.querySelector<HTMLButtonElement>('[role="combobox"]')!;
    trigger().click();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    trigger().click();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('selects an option by click, fires change, and closes', async () => {
    const el = await mount<OdyDropdownSingle>(`<ody-dropdown-single options='${OPTS}'></ody-dropdown-single>`);
    let detail: { value: string } | null = null;
    el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail; });
    el.querySelector<HTMLButtonElement>('[role="combobox"]')!.click();
    el.querySelector<HTMLLIElement>('[data-index="0"]')!.click();
    expect(detail!).toEqual({ value: 'a' });
    expect(el.value).toBe('a');
    expect(el.querySelector('[role="combobox"]')!.getAttribute('aria-expanded')).toBe('false');
  });

  it('ignores clicks on disabled options', async () => {
    const el = await mount<OdyDropdownSingle>(`<ody-dropdown-single options='${OPTS}'></ody-dropdown-single>`);
    let fired = false;
    el.addEventListener('change', () => { fired = true; });
    el.querySelector<HTMLButtonElement>('[role="combobox"]')!.click();
    el.querySelector<HTMLLIElement>('[data-index="2"]')!.click();
    expect(fired).toBe(false);
  });

  it('value property reflects and clears the attribute', async () => {
    const el = await mount<OdyDropdownSingle>(`<ody-dropdown-single options='${OPTS}'></ody-dropdown-single>`);
    el.value = 'a';
    expect(el.getAttribute('value')).toBe('a');
    el.value = '';
    expect(el.hasAttribute('value')).toBe(false);
  });

  it('accepts options via the JS property', async () => {
    const el = await mount<OdyDropdownSingle>(`<ody-dropdown-single></ody-dropdown-single>`);
    el.options = [{ value: 'z', label: 'Zed' }];
    el.querySelector<HTMLButtonElement>('[role="combobox"]')!.click();
    expect(el.querySelector('.ody-select__option-label')!.textContent).toBe('Zed');
    expect(el.options).toEqual([{ value: 'z', label: 'Zed' }]);
  });

  it('non-array options assignment falls back to empty list', async () => {
    const el = await mount<OdyDropdownSingle>(`<ody-dropdown-single></ody-dropdown-single>`);
    // @ts-expect-error testing defensive runtime branch
    el.options = null;
    expect(el.options).toEqual([]);
  });

  it('keyboard: ArrowDown opens, moves, Enter selects + closes', async () => {
    const el = await mount<OdyDropdownSingle>(`<ody-dropdown-single options='${OPTS}'></ody-dropdown-single>`);
    let detail: { value: string } | null = null;
    el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail; });
    press(el, 'ArrowDown'); // opens, active = 0
    expect(el.querySelector('[role="combobox"]')!.getAttribute('aria-expanded')).toBe('true');
    press(el, 'ArrowDown'); // active = 1
    expect(el.querySelector('.ody-select__option--active')!.getAttribute('data-index')).toBe('1');
    press(el, 'Enter');
    expect(detail!).toEqual({ value: 'b' });
    expect(el.querySelector('[role="combobox"]')!.getAttribute('aria-expanded')).toBe('false');
  });

  it('keyboard: ArrowUp wraps and skips disabled, Home/End jump', async () => {
    const el = await mount<OdyDropdownSingle>(`<ody-dropdown-single options='${OPTS}'></ody-dropdown-single>`);
    press(el, 'ArrowUp'); // opens, active = 0 (first selectable)
    press(el, 'ArrowUp'); // wraps up, skips disabled c -> b (index 1)
    expect(el.querySelector('.ody-select__option--active')!.getAttribute('data-index')).toBe('1');
    press(el, 'End'); // last selectable = b (index 1, since c is disabled)
    expect(el.querySelector('.ody-select__option--active')!.getAttribute('data-index')).toBe('1');
    press(el, 'Home'); // first = 0
    expect(el.querySelector('.ody-select__option--active')!.getAttribute('data-index')).toBe('0');
  });

  it('keyboard: Escape and Tab close the panel', async () => {
    const el = await mount<OdyDropdownSingle>(`<ody-dropdown-single options='${OPTS}'></ody-dropdown-single>`);
    press(el, 'Enter'); // opens
    press(el, 'Escape');
    expect(el.querySelector('[role="combobox"]')!.getAttribute('aria-expanded')).toBe('false');
    press(el, ' '); // opens
    press(el, 'Tab');
    expect(el.querySelector('[role="combobox"]')!.getAttribute('aria-expanded')).toBe('false');
  });

  it('keyboard: unhandled key while closed and while open is a no-op', async () => {
    const el = await mount<OdyDropdownSingle>(`<ody-dropdown-single options='${OPTS}'></ody-dropdown-single>`);
    press(el, 'x'); // closed, not an opener -> stays closed
    expect(el.querySelector('[role="combobox"]')!.getAttribute('aria-expanded')).toBe('false');
  });

  it('typeahead jumps to a matching option when not searchable', async () => {
    const el = await mount<OdyDropdownSingle>(`<ody-dropdown-single options='${OPTS}'></ody-dropdown-single>`);
    press(el, 'ArrowDown'); // open
    press(el, 'b'); // typeahead -> Banana (index 1)
    expect(el.querySelector('.ody-select__option--active')!.getAttribute('data-index')).toBe('1');
    press(el, 'z'); // no match -> active unchanged
    expect(el.querySelector('.ody-select__option--active')!.getAttribute('data-index')).toBe('1');
  });

  it('searchable: filters options and shows empty state', async () => {
    const el = await mount<OdyDropdownSingle>(
      `<ody-dropdown-single searchable options='${OPTS}'></ody-dropdown-single>`,
    );
    el.querySelector<HTMLButtonElement>('[role="combobox"]')!.click();
    const search = el.querySelector<HTMLInputElement>('.ody-select__search-input')!;
    search.value = 'ban';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.querySelectorAll('.ody-select__option').length).toBe(1);
    expect(el.querySelector('.ody-select__option-label')!.textContent).toBe('Banana');
    search.value = 'zzz';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.querySelector('.ody-select__empty')).not.toBeNull();
  });

  it('searchable: Space inside the search box is not swallowed as a toggle', async () => {
    const el = await mount<OdyDropdownSingle>(
      `<ody-dropdown-single searchable options='${OPTS}'></ody-dropdown-single>`,
    );
    el.querySelector<HTMLButtonElement>('[role="combobox"]')!.click();
    let fired = false;
    el.addEventListener('change', () => { fired = true; });
    press(el, ' ', true); // in search input -> no selection
    expect(fired).toBe(false);
  });

  it('typeahead buffer resets after the timeout', async () => {
    vi.useFakeTimers();
    try {
      const el = await mount<OdyDropdownSingle>(`<ody-dropdown-single options='${OPTS}'></ody-dropdown-single>`);
      el.querySelector<HTMLButtonElement>('[role="combobox"]')!.click();
      press(el, 'b'); // buffer = 'b' -> Banana
      expect(el.querySelector('.ody-select__option--active')!.getAttribute('data-index')).toBe('1');
      vi.advanceTimersByTime(600); // buffer clears
      press(el, 'a'); // fresh buffer 'a' -> Apple
      expect(el.querySelector('.ody-select__option--active')!.getAttribute('data-index')).toBe('0');
    } finally {
      vi.useRealTimers();
    }
  });

  it('Home/End on an all-disabled list keep the active index at -1', async () => {
    const el = await mount<OdyDropdownSingle>(
      `<ody-dropdown-single options='[{"value":"x","label":"X","disabled":true}]'></ody-dropdown-single>`,
    );
    press(el, 'ArrowDown'); // opens; no selectable option
    press(el, 'End'); // lastSelectableIndex returns -1, moveTo bails
    press(el, 'Home'); // firstSelectableIndex returns -1, moveTo bails
    expect(el.querySelector('.ody-select__option--active')).toBeNull();
    press(el, 'Enter'); // chooseActive finds no option -> no-op, panel stays open
    expect(el.querySelector('[role="combobox"]')!.getAttribute('aria-expanded')).toBe('true');
  });

  it('disabled dropdown does not open', async () => {
    const el = await mount<OdyDropdownSingle>(
      `<ody-dropdown-single disabled options='${OPTS}'></ody-dropdown-single>`,
    );
    expect(el.disabled).toBe(true);
    el.querySelector<HTMLButtonElement>('[role="combobox"]')!.click();
    expect(el.querySelector('[role="combobox"]')!.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('ody-dropdown-multi', () => {
  it('renders chips for selected values and a multiselectable listbox', async () => {
    const el = await mount<OdyDropdownMulti>(
      `<ody-dropdown-multi value="a,b" options='${OPTS}'></ody-dropdown-multi>`,
    );
    expect(el.querySelectorAll('.ody-select__chip').length).toBe(2);
    expect(el.querySelector('[role="listbox"]')!.getAttribute('aria-multiselectable')).toBe('true');
    expect(el.value).toEqual(['a', 'b']);
  });

  it('uses a non-button combobox trigger so chip remove buttons nest legally', async () => {
    const el = await mount<OdyDropdownMulti>(
      `<ody-dropdown-multi value="a,b" options='${OPTS}'></ody-dropdown-multi>`,
    );
    const combo = el.querySelector('[role="combobox"]')!;
    // Must NOT be a <button>: a nested <button> chip would be ejected from the
    // trigger by the HTML parser, dropping the chevron/chips below the box.
    expect(combo.tagName).toBe('DIV');
    expect(combo.getAttribute('tabindex')).toBe('0');
    const removeBtn = combo.querySelector('.ody-select__chip-remove');
    expect(removeBtn).not.toBeNull();
    expect(removeBtn!.tagName).toBe('BUTTON');
    // Chevron and both chips live inside the trigger, not below it.
    expect(combo.querySelector('.ody-select__carat')).not.toBeNull();
    expect(combo.querySelectorAll('.ody-select__chip').length).toBe(2);
  });

  it('marks a disabled trigger non-focusable via tabindex/aria', async () => {
    const el = await mount<OdyDropdownMulti>(
      `<ody-dropdown-multi disabled options='${OPTS}'></ody-dropdown-multi>`,
    );
    const combo = el.querySelector('[role="combobox"]')!;
    expect(combo.getAttribute('tabindex')).toBe('-1');
    expect(combo.getAttribute('aria-disabled')).toBe('true');
  });

  it('shows placeholder when empty', async () => {
    const el = await mount<OdyDropdownMulti>(
      `<ody-dropdown-multi placeholder="Choose" options='${OPTS}'></ody-dropdown-multi>`,
    );
    expect(el.querySelector('.ody-select__placeholder')!.textContent).toBe('Choose');
    expect(el.value).toEqual([]);
  });

  it('toggles values on click without closing, emitting an array', async () => {
    const el = await mount<OdyDropdownMulti>(`<ody-dropdown-multi options='${OPTS}'></ody-dropdown-multi>`);
    const details: string[][] = [];
    el.addEventListener('change', (e) => { details.push((e as CustomEvent).detail.value); });
    el.querySelector<HTMLButtonElement>('[role="combobox"]')!.click();
    el.querySelector<HTMLLIElement>('[data-index="0"]')!.click();
    expect(el.value).toEqual(['a']);
    expect(el.querySelector('[role="combobox"]')!.getAttribute('aria-expanded')).toBe('true');
    el.querySelector<HTMLLIElement>('[data-index="1"]')!.click();
    expect(el.value).toEqual(['a', 'b']);
    el.querySelector<HTMLLIElement>('[data-index="0"]')!.click(); // toggle off
    expect(el.value).toEqual(['b']);
    expect(details).toEqual([['a'], ['a', 'b'], ['b']]);
  });

  it('Space toggles the active option via keyboard', async () => {
    const el = await mount<OdyDropdownMulti>(`<ody-dropdown-multi options='${OPTS}'></ody-dropdown-multi>`);
    press(el, 'ArrowDown'); // open, active 0
    press(el, ' ');
    expect(el.value).toEqual(['a']);
    press(el, 'Enter'); // Enter also toggles -> off
    expect(el.value).toEqual([]);
  });

  it('chip remove button deselects without opening', async () => {
    const el = await mount<OdyDropdownMulti>(
      `<ody-dropdown-multi value="a,b" options='${OPTS}'></ody-dropdown-multi>`,
    );
    let detail: string[] | null = null;
    el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail.value; });
    el.querySelector<HTMLButtonElement>('.ody-select__chip-remove')!.click();
    expect(detail!).toEqual(['b']);
    expect(el.value).toEqual(['b']);
    expect(el.querySelector('[role="combobox"]')!.getAttribute('aria-expanded')).toBe('false');
  });

  it('chips fall back to the raw value when the option is unknown', async () => {
    const el = await mount<OdyDropdownMulti>(
      `<ody-dropdown-multi value="ghost" options='${OPTS}'></ody-dropdown-multi>`,
    );
    expect(el.querySelector('.ody-tag__label')!.textContent).toBe('ghost');
  });

  it('value setter joins and clears', async () => {
    const el = await mount<OdyDropdownMulti>(`<ody-dropdown-multi options='${OPTS}'></ody-dropdown-multi>`);
    el.value = ['a', 'c'];
    expect(el.getAttribute('value')).toBe('a,c');
    el.value = [];
    expect(el.hasAttribute('value')).toBe(false);
    // @ts-expect-error testing defensive runtime branch
    el.value = null;
    expect(el.value).toEqual([]);
  });

  it('cleans up the outside-click listener on disconnect', async () => {
    const el = await mount<OdyDropdownMulti>(`<ody-dropdown-multi options='${OPTS}'></ody-dropdown-multi>`);
    el.querySelector<HTMLButtonElement>('[role="combobox"]')!.click();
    expect(el.querySelector('[role="combobox"]')!.getAttribute('aria-expanded')).toBe('true');
    el.remove();
    // After removal an outside click must not throw.
    expect(() => document.body.click()).not.toThrow();
  });
});
