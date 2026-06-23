// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import '../../src/ui/components/input.js';
import '../../src/ui/components/inline-input.js';
import '../../src/ui/components/search-input.js';
import '../../src/ui/components/money-input.js';
import '../../src/ui/components/percentage-input.js';
import '../../src/ui/components/checkbox.js';
import '../../src/ui/components/radio-button-group.js';
import '../../src/ui/components/checkbox-group.js';

/** Render HTML, flush the deferred first render, and return the first element. */
async function mount<T extends Element = Element>(html: string): Promise<T> {
  document.body.innerHTML = html;
  await Promise.resolve();
  return document.body.firstElementChild as T;
}

afterEach(() => {
  document.body.innerHTML = '';
});

/** Set an input value and fire a DOM event so component listeners run. */
function fire(input: HTMLInputElement | HTMLTextAreaElement, type: string, value?: string): void {
  if (value !== undefined) input.value = value;
  input.dispatchEvent(new Event(type, { bubbles: true }));
}

describe('ody-input', () => {
  it('renders label, placeholder and value into a native input', async () => {
    const el = await mount('<ody-input label="Name" placeholder="Type" value="hi"></ody-input>');
    expect(el.querySelector('.ody-input__label')!.textContent).toBe('Name');
    const input = el.querySelector<HTMLInputElement>('.ody-input__field')!;
    expect(input.getAttribute('placeholder')).toBe('Type');
    expect(input.value).toBe('hi');
  });

  it('exposes value via getter/setter and reflects to the attribute', async () => {
    const el = await mount<HTMLElement & { value: string }>('<ody-input></ody-input>');
    expect(el.value).toBe('');
    el.value = 'set';
    expect(el.getAttribute('value')).toBe('set');
    expect(el.value).toBe('set');
  });

  it('dispatches input and change CustomEvents with the value', async () => {
    const el = await mount('<ody-input></ody-input>');
    const input = el.querySelector<HTMLInputElement>('.ody-input__field')!;
    let inputDetail = '';
    let changeDetail = '';
    el.addEventListener('input', (e) => { inputDetail = (e as CustomEvent).detail.value; });
    el.addEventListener('change', (e) => { changeDetail = (e as CustomEvent).detail.value; });
    fire(input, 'input', 'abc');
    fire(input, 'change', 'abc');
    expect(inputDetail).toBe('abc');
    expect(changeDetail).toBe('abc');
    expect((el as HTMLElement & { value: string }).value).toBe('abc');
  });

  it('shows the clear button only with a value and clears on click', async () => {
    const el = await mount('<ody-input value="x"></ody-input>');
    let cleared = '';
    el.addEventListener('change', (e) => { cleared = (e as CustomEvent).detail.value; });
    const clear = el.querySelector<HTMLButtonElement>('.ody-input__clear-button')!;
    expect(clear).not.toBeNull();
    clear.click();
    expect(cleared).toBe('');
    expect((el as HTMLElement & { value: string }).value).toBe('');
  });

  it('omits the clear button when readonly, disabled or no-clear', async () => {
    expect((await mount('<ody-input value="x" readonly></ody-input>')).querySelector('.ody-input__clear-button')).toBeNull();
    expect((await mount('<ody-input value="x" disabled></ody-input>')).querySelector('.ody-input__clear-button')).toBeNull();
    expect((await mount('<ody-input value="x" no-clear></ody-input>')).querySelector('.ody-input__clear-button')).toBeNull();
  });

  it('renders a textarea, icon, warning/info rings and a character counter', async () => {
    const el = await mount(
      '<ody-input textarea icon="search" warning="W" info="I" caption="C" maxlength="10" value="ab"></ody-input>',
    );
    expect(el.querySelector('textarea.ody-input__textarea')).not.toBeNull();
    expect(el.querySelector('.ody-input__icon')).not.toBeNull();
    expect(el.querySelector('.ody-input--warning')).not.toBeNull();
    expect(el.querySelector('.ody-input--info')).not.toBeNull();
    expect(el.querySelector('.ody-input__warning')!.textContent).toBe('W');
    expect(el.querySelector('.ody-input__info')!.textContent).toBe('I');
    expect(el.querySelector('.ody-input__caption')!.textContent).toBe('C');
    expect(el.querySelector('.ody-input__length-message')!.textContent).toContain('2 / 10');
  });

  it('renders a footer caption with no character counter', async () => {
    const el = await mount('<ody-input caption="Helper"></ody-input>');
    expect(el.querySelector('.ody-input__caption')!.textContent).toBe('Helper');
    expect(el.querySelector('.ody-input__length-message')).toBeNull();
  });

  it('renders a readonly + disabled textarea', async () => {
    const el = await mount('<ody-input textarea readonly disabled value="x"></ody-input>');
    const area = el.querySelector<HTMLTextAreaElement>('.ody-input__textarea')!;
    expect(area.readOnly).toBe(true);
    expect(area.disabled).toBe(true);
    expect(el.querySelector('.ody-input__container--readonly')).not.toBeNull();
    expect(el.querySelector('[aria-disabled="true"]')).not.toBeNull();
  });

  it('updates the live counter on input and toggles full-width/max-content', async () => {
    const el = await mount('<ody-input maxlength="5" full-width max-content></ody-input>');
    expect(el.querySelector('.ody-input--full-width')).not.toBeNull();
    expect(el.querySelector('.ody-input--max-content')).not.toBeNull();
    fire(el.querySelector<HTMLInputElement>('.ody-input__field')!, 'input', 'abc');
    expect(el.querySelector('.ody-input__length-message')!.textContent).toContain('3 / 5');
  });
});

describe('ody-inline-input', () => {
  it('renders the inline chrome with label and value', async () => {
    const el = await mount('<ody-inline-input label="Qty" value="5" size="small"></ody-inline-input>');
    expect(el.querySelector('.ody-inline-input__group--small')).not.toBeNull();
    expect(el.querySelector('.ody-inline-input__label')!.textContent).toContain('Qty');
    expect(el.querySelector<HTMLInputElement>('.ody-inline-input__field')!.value).toBe('5');
  });

  it('handles value get/set, clear and the live counter', async () => {
    const el = await mount<HTMLElement & { value: string }>('<ody-inline-input value="x" maxlength="4"></ody-inline-input>');
    el.value = 'ab';
    expect(el.getAttribute('value')).toBe('ab');
    fire(el.querySelector<HTMLInputElement>('.ody-inline-input__field')!, 'input', 'abc');
    expect(el.querySelector('.ody-inline-input-footer__length-message')!.textContent).toContain('3 / 4');
    const el2 = await mount('<ody-inline-input value="y"></ody-inline-input>');
    let cleared = 'na';
    el2.addEventListener('input', (e) => { cleared = (e as CustomEvent).detail.value; });
    // typing with no maxlength counter present exercises the no-op counter path
    fire(el2.querySelector<HTMLInputElement>('.ody-inline-input__field')!, 'input', 'typed');
    el2.querySelector<HTMLButtonElement>('.ody-inline-input__clear-button')!.click();
    expect(cleared).toBe('');
  });

  it('renders a plain field with no footer, and a readonly/disabled textarea', async () => {
    const plain = await mount('<ody-inline-input></ody-inline-input>');
    expect(plain.querySelector('.ody-inline-input__field')).not.toBeNull();
    expect(plain.querySelector('.ody-inline-input__label')).toBeNull();
    expect(plain.querySelector('.ody-inline-input-footer')).toBeNull();
    expect(plain.querySelector('.ody-inline-input__clear-button')).toBeNull();
    const ta = await mount('<ody-inline-input textarea readonly disabled value="x"></ody-inline-input>');
    const area = ta.querySelector<HTMLTextAreaElement>('.ody-inline-input__textarea')!;
    expect(area.readOnly).toBe(true);
    expect(area.disabled).toBe(true);
    expect(ta.querySelector('.ody-inline-input__group--readonly')).not.toBeNull();
    expect(ta.querySelector('[aria-disabled="true"]')).not.toBeNull();
  });

  it('applies max-content/full-width and a readonly+disabled native input', async () => {
    const el = await mount('<ody-inline-input max-content full-width readonly disabled value="y"></ody-inline-input>');
    expect(el.querySelector('.ody-inline-input--max-content')).not.toBeNull();
    expect(el.querySelector('.ody-inline-input--full-width')).not.toBeNull();
    const input = el.querySelector<HTMLInputElement>('.ody-inline-input__field')!;
    expect(input.readOnly).toBe(true);
    expect(input.disabled).toBe(true);
  });

  it('renders textarea, icon and warning/info footer messages', async () => {
    const el = await mount('<ody-inline-input textarea icon="info" warning="W" info="I" caption="C"></ody-inline-input>');
    expect(el.querySelector('textarea.ody-inline-input__textarea')).not.toBeNull();
    expect(el.querySelector('.ody-inline-input__icon')).not.toBeNull();
    expect(el.querySelector('.ody-inline-input-footer__message__warning')!.textContent).toBe('W');
    expect(el.querySelector('.ody-inline-input-footer__message__info')!.textContent).toBe('I');
    expect(el.querySelector('.ody-inline-input-footer__message__caption')!.textContent).toBe('C');
    let changed = '';
    el.addEventListener('change', (e) => { changed = (e as CustomEvent).detail.value; });
    fire(el.querySelector<HTMLTextAreaElement>('.ody-inline-input__textarea')!, 'change', 'z');
    expect(changed).toBe('z');
  });
});

describe('ody-search-input', () => {
  it('renders the search icon and default placeholder', async () => {
    const el = await mount('<ody-search-input></ody-search-input>');
    expect(el.querySelector('.ody-input__icon')).not.toBeNull();
    expect(el.querySelector<HTMLInputElement>('.ody-input__field')!.getAttribute('placeholder')).toBe('Search');
  });

  it('tracks focus state and dispatches input/change', async () => {
    const el = await mount('<ody-search-input placeholder="Find"></ody-search-input>');
    const input = el.querySelector<HTMLInputElement>('.ody-input__field')!;
    expect(input.getAttribute('placeholder')).toBe('Find');
    fire(input, 'focus');
    expect(el.querySelector('.ody-search-input--focused')).not.toBeNull();
    fire(input, 'blur');
    expect(el.querySelector('.ody-search-input--focused')).toBeNull();
    let val = '';
    let chg = '';
    el.addEventListener('input', (e) => { val = (e as CustomEvent).detail.value; });
    el.addEventListener('change', (e) => { chg = (e as CustomEvent).detail.value; });
    fire(input, 'input', 'q');
    fire(input, 'change', 'q');
    expect(val).toBe('q');
    expect(chg).toBe('q');
    expect((el as HTMLElement & { value: string }).value).toBe('q');
  });

  it('renders warning and info captions and supports value setter + disabled', async () => {
    const warn = await mount('<ody-search-input warning-message="bad"></ody-search-input>');
    expect(warn.querySelector('.ody-input__warning')!.textContent).toBe('bad');
    const info = await mount<HTMLElement & { value: string }>('<ody-search-input info-message="hint" disabled></ody-search-input>');
    expect(info.querySelector('.ody-input__caption')!.textContent).toBe('hint');
    expect(info.querySelector<HTMLInputElement>('.ody-input__field')!.disabled).toBe(true);
    info.value = 'set';
    expect(info.getAttribute('value')).toBe('set');
  });
});

describe('ody-money-input', () => {
  it('renders the currency symbol and label', async () => {
    const el = await mount('<ody-money-input currency="USD" label="Price" value="10"></ody-money-input>');
    expect(el.querySelector('.ody-money-input__currency')!.textContent).toBe('$');
    expect(el.querySelector('.ody-input__label')!.textContent).toBe('Price');
  });

  it('formats to currency precision on blur and clamps to max-amount', async () => {
    const el = await mount<HTMLElement & { value: string }>('<ody-money-input currency="USD" max-amount="50"></ody-money-input>');
    const input = el.querySelector<HTMLInputElement>('.ody-input__field')!;
    let changed = '';
    el.addEventListener('change', (e) => { changed = (e as CustomEvent).detail.value; });
    fire(input, 'blur', '12.3');
    expect(changed).toBe('12.30');
    expect(el.value).toBe('12.30');
    fire(input, 'blur', '99');
    expect(changed).toBe('50.00');
  });

  it('uses 0-precision for JPY and floors invalid input to zero', async () => {
    const jpy = await mount('<ody-money-input currency="JPY"></ody-money-input>');
    let v = '';
    jpy.addEventListener('change', (e) => { v = (e as CustomEvent).detail.value; });
    fire(jpy.querySelector<HTMLInputElement>('.ody-input__field')!, 'blur', '5.7');
    expect(v).toBe('6');
    const bad = await mount('<ody-money-input currency="ZZZ"></ody-money-input>');
    expect(bad.querySelector('.ody-money-input__currency')!.textContent).toBe('ZZZ');
    let v2 = '';
    bad.addEventListener('change', (e) => { v2 = (e as CustomEvent).detail.value; });
    fire(bad.querySelector<HTMLInputElement>('.ody-input__field')!, 'blur', 'abc');
    expect(v2).toBe('0.00');
  });

  it('dispatches input per keystroke and supports warning/readonly/disabled + value setter', async () => {
    const el = await mount<HTMLElement & { value: string }>('<ody-money-input warning="W" readonly></ody-money-input>');
    expect(el.querySelector('.ody-input__warning')!.textContent).toBe('W');
    expect(el.querySelector('.ody-input__container--readonly')).not.toBeNull();
    let v = '';
    el.addEventListener('input', (e) => { v = (e as CustomEvent).detail.value; });
    fire(el.querySelector<HTMLInputElement>('.ody-input__field')!, 'input', '7');
    expect(v).toBe('7');
    el.value = '9';
    expect(el.getAttribute('value')).toBe('9');
    const dis = await mount('<ody-money-input disabled></ody-money-input>');
    expect(dis.querySelector<HTMLInputElement>('.ody-input__field')!.disabled).toBe(true);
  });
});

describe('ody-percentage-input', () => {
  it('renders the percent suffix and clamps to 0-100 on blur', async () => {
    const el = await mount<HTMLElement & { value: string }>('<ody-percentage-input label="Rate"></ody-percentage-input>');
    expect(el.querySelector('.ody-percentage-input__percent')!.textContent).toBe('%');
    const input = el.querySelector<HTMLInputElement>('.ody-input__field')!;
    let v = '';
    el.addEventListener('change', (e) => { v = (e as CustomEvent).detail.value; });
    fire(input, 'blur', '150');
    expect(v).toBe('100');
    fire(input, 'blur', '42');
    expect(v).toBe('42');
    // the sign is stripped along with other non-digit characters
    fire(input, 'blur', '-5');
    expect(v).toBe('5');
    fire(input, 'blur', 'abc');
    expect(v).toBe('0');
    fire(input, 'blur', '0');
    expect(v).toBe('0');
  });

  it('blocks non-numeric keys and out-of-range keystrokes', async () => {
    const el = await mount('<ody-percentage-input value="9"></ody-percentage-input>');
    const input = el.querySelector<HTMLInputElement>('.ody-input__field')!;
    const letter = new KeyboardEvent('keypress', { key: 'a', cancelable: true });
    input.dispatchEvent(letter);
    expect(letter.defaultPrevented).toBe(true);
    // typing "9" after existing "9" -> "99" is allowed
    input.value = '9';
    input.setSelectionRange(1, 1);
    const ok = new KeyboardEvent('keypress', { key: '9', cancelable: true });
    input.dispatchEvent(ok);
    expect(ok.defaultPrevented).toBe(false);
    // typing another digit making it "999" (> 100) is blocked
    input.value = '99';
    input.setSelectionRange(2, 2);
    const tooBig = new KeyboardEvent('keypress', { key: '9', cancelable: true });
    input.dispatchEvent(tooBig);
    expect(tooBig.defaultPrevented).toBe(true);
  });

  it('appends at the end when there is no text selection and clamps multi-dot input to 0', async () => {
    const el = await mount('<ody-percentage-input value="5"></ody-percentage-input>');
    const input = el.querySelector<HTMLInputElement>('.ody-input__field')!;
    input.value = '5';
    input.setSelectionRange(null, null);
    const ok = new KeyboardEvent('keypress', { key: '0', cancelable: true });
    input.dispatchEvent(ok);
    expect(ok.defaultPrevented).toBe(false);
    let v = '';
    el.addEventListener('change', (e) => { v = (e as CustomEvent).detail.value; });
    fire(input, 'blur', '1.2.3');
    expect(v).toBe('0');
  });

  it('dispatches input, supports warning/readonly/disabled and value setter', async () => {
    const el = await mount<HTMLElement & { value: string }>('<ody-percentage-input warning="W" readonly></ody-percentage-input>');
    expect(el.querySelector('.ody-input__warning')!.textContent).toBe('W');
    expect(el.querySelector('.ody-input__container--readonly')).not.toBeNull();
    let v = '';
    el.addEventListener('input', (e) => { v = (e as CustomEvent).detail.value; });
    fire(el.querySelector<HTMLInputElement>('.ody-input__field')!, 'input', '25');
    expect(v).toBe('25');
    el.value = '30';
    expect(el.getAttribute('value')).toBe('30');
    const dis = await mount('<ody-percentage-input disabled></ody-percentage-input>');
    expect(dis.querySelector<HTMLInputElement>('.ody-input__field')!.disabled).toBe(true);
  });
});

describe('ody-checkbox', () => {
  it('renders an unchecked native checkbox with a label', async () => {
    const el = await mount('<ody-checkbox label="Agree"></ody-checkbox>');
    expect(el.querySelector('.ody-checkbox__label')!.textContent).toBe('Agree');
    expect(el.querySelector<HTMLInputElement>('.ody-checkbox__input')!.checked).toBe(false);
    expect(el.querySelector('.ody-checkbox__mark')).toBeNull();
  });

  it('marks the label disabled when both label and disabled are set', async () => {
    const el = await mount('<ody-checkbox label="Agree" disabled></ody-checkbox>');
    expect(el.querySelector('.ody-checkbox__label')!.hasAttribute('disabled')).toBe(true);
  });

  it('renders the check mark when checked and reflects via property', async () => {
    const el = await mount<HTMLElement & { checked: boolean; value: boolean }>('<ody-checkbox checked size="base"></ody-checkbox>');
    expect(el.querySelector('.ody-checkbox--checked')).not.toBeNull();
    expect(el.querySelector('.ody-checkbox__input--size-base')).not.toBeNull();
    expect(el.querySelector('.ody-checkbox__mark .icon__svg')).not.toBeNull();
    expect(el.checked).toBe(true);
    expect(el.value).toBe(true);
    el.value = false;
    expect(el.hasAttribute('checked')).toBe(false);
  });

  it('renders the indeterminate (minus) mark and sets the DOM property', async () => {
    const el = await mount('<ody-checkbox indeterminate></ody-checkbox>');
    expect(el.querySelector('.ody-checkbox__mark .icon__svg')).not.toBeNull();
    expect(el.querySelector<HTMLInputElement>('.ody-checkbox__input')!.indeterminate).toBe(true);
  });

  it('dispatches change with the new checked state and supports disabled', async () => {
    const el = await mount<HTMLElement & { checked: boolean }>('<ody-checkbox disabled></ody-checkbox>');
    expect(el.querySelector<HTMLInputElement>('.ody-checkbox__input')!.disabled).toBe(true);
    let detail: { checked: boolean; value: boolean } | null = null;
    el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail; });
    const input = el.querySelector<HTMLInputElement>('.ody-checkbox__input')!;
    fire(input, 'change', undefined);
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(detail!).toEqual({ checked: true, value: true });
    expect(el.checked).toBe(true);
  });
});

describe('ody-radio-button-group', () => {
  const OPTIONS = '[{"label":"One","value":"1"},{"label":"Two","value":"2"}]';

  it('renders radio options and marks the selected one', async () => {
    const el = await mount(`<ody-radio-button-group options='${OPTIONS}' value="2"></ody-radio-button-group>`);
    const inputs = el.querySelectorAll<HTMLInputElement>('.ody-radio-button-input__field');
    expect(inputs.length).toBe(2);
    expect(inputs[1].checked).toBe(true);
    expect(el.querySelectorAll('.ody-radio-button-input__label')[0].textContent).toBe('One');
  });

  it('dispatches change with the selected value and updates the property', async () => {
    const el = await mount<HTMLElement & { value: string }>(`<ody-radio-button-group options='${OPTIONS}'></ody-radio-button-group>`);
    let v = '';
    el.addEventListener('change', (e) => { v = (e as CustomEvent).detail.value; });
    const second = el.querySelectorAll<HTMLInputElement>('.ody-radio-button-input__field')[1];
    second.checked = true;
    fire(second, 'change');
    expect(v).toBe('2');
    expect(el.value).toBe('2');
  });

  it('supports the small size, disabled and tolerates bad JSON / non-array', async () => {
    const small = await mount(`<ody-radio-button-group options='${OPTIONS}' size="small" disabled></ody-radio-button-group>`);
    expect(small.querySelector('.ody-radio-button-group--small')).not.toBeNull();
    expect(small.querySelector('.ody-radio-button-input--small')).not.toBeNull();
    expect(small.querySelector<HTMLInputElement>('.ody-radio-button-input__field')!.disabled).toBe(true);
    expect((await mount('<ody-radio-button-group options="not json"></ody-radio-button-group>')).querySelectorAll('.ody-radio-button-input__field').length).toBe(0);
    expect((await mount('<ody-radio-button-group options="{}"></ody-radio-button-group>')).querySelectorAll('.ody-radio-button-input__field').length).toBe(0);
    const noOpts = await mount<HTMLElement & { options: unknown[]; value: string }>('<ody-radio-button-group></ody-radio-button-group>');
    expect(noOpts.options).toEqual([]);
    noOpts.value = '1';
    expect(noOpts.getAttribute('value')).toBe('1');
  });

  it('falls back to value for a missing label', async () => {
    const el = await mount('<ody-radio-button-group options=\'[{"value":"x"}]\'></ody-radio-button-group>');
    expect(el.querySelector('.ody-radio-button-input__label')!.textContent).toBe('x');
  });
});

describe('ody-checkbox-group', () => {
  const OPTIONS = '[{"label":"A","value":"a"},{"label":"B","value":"b"},{"label":"C","value":"c"}]';

  it('renders items and marks pre-selected values', async () => {
    const el = await mount<HTMLElement & { value: string[] }>(`<ody-checkbox-group options='${OPTIONS}' value="a,c"></ody-checkbox-group>`);
    const items = el.querySelectorAll<HTMLInputElement>('.ody-checkbox-group__item .ody-checkbox__input');
    expect(items.length).toBe(3);
    expect(items[0].checked).toBe(true);
    expect(items[1].checked).toBe(false);
    expect(items[2].checked).toBe(true);
    expect(el.value).toEqual(['a', 'c']);
  });

  it('toggles an item and emits the ordered selection', async () => {
    const el = await mount<HTMLElement & { value: string[] }>(`<ody-checkbox-group options='${OPTIONS}' value="c"></ody-checkbox-group>`);
    let detail: string[] = [];
    el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail.value; });
    const a = el.querySelectorAll<HTMLInputElement>('.ody-checkbox-group__item .ody-checkbox__input')[0];
    a.checked = true;
    fire(a, 'change');
    expect(detail).toEqual(['a', 'c']);
    // untoggle c
    const c = el.querySelectorAll<HTMLInputElement>('.ody-checkbox-group__item .ody-checkbox__input')[2];
    c.checked = false;
    fire(c, 'change');
    expect(detail).toEqual(['a']);
  });

  it('renders a select-all parent that reflects child state and toggles all', async () => {
    const el = await mount<HTMLElement & { value: string[] }>(
      `<ody-checkbox-group options='${OPTIONS}' value="a" select-all-label="All"></ody-checkbox-group>`,
    );
    const main = el.querySelector<HTMLInputElement>('.ody-checkbox-group__select-all .ody-checkbox__input')!;
    expect(el.querySelector('.ody-checkbox-group__select-all .ody-checkbox__label')!.textContent).toBe('All');
    expect(main.indeterminate).toBe(true);
    let detail: string[] = [];
    el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail.value; });
    main.checked = true;
    fire(main, 'change');
    expect(detail).toEqual(['a', 'b', 'c']);
  });

  it('shows the parent checked when all selected and clears all on untoggle', async () => {
    const el = await mount<HTMLElement & { value: string[] }>(
      `<ody-checkbox-group options='${OPTIONS}' value="a,b,c" select-all-label="All"></ody-checkbox-group>`,
    );
    const main = el.querySelector<HTMLInputElement>('.ody-checkbox-group__select-all .ody-checkbox__input')!;
    expect(main.checked).toBe(true);
    expect(el.querySelector('.ody-checkbox-group__select-all .ody-checkbox__mark')).not.toBeNull();
    let detail: string[] = ['x'];
    el.addEventListener('change', (e) => { detail = (e as CustomEvent).detail.value; });
    main.checked = false;
    fire(main, 'change');
    expect(detail).toEqual([]);
  });

  it('supports size, disabled, the value setter and bad JSON', async () => {
    const el = await mount<HTMLElement & { value: string[]; options: unknown[] }>(
      `<ody-checkbox-group options='${OPTIONS}' size="base" disabled></ody-checkbox-group>`,
    );
    expect(el.querySelector('.ody-checkbox__input--size-base')).not.toBeNull();
    expect(el.querySelector<HTMLInputElement>('.ody-checkbox__input')!.disabled).toBe(true);
    el.value = ['b'];
    expect(el.getAttribute('value')).toBe('b');
    const empty = await mount<HTMLElement & { value: string[]; options: unknown[] }>('<ody-checkbox-group options="oops"></ody-checkbox-group>');
    expect(empty.options).toEqual([]);
    expect(empty.value).toEqual([]);
    expect((await mount('<ody-checkbox-group options="[1,2]"></ody-checkbox-group>')).querySelectorAll('.ody-checkbox-group__item').length).toBe(0);
    // non-array JSON and a missing options attribute both yield no items
    expect((await mount('<ody-checkbox-group options="{}"></ody-checkbox-group>')).querySelectorAll('.ody-checkbox-group__item').length).toBe(0);
    expect((await mount('<ody-checkbox-group></ody-checkbox-group>')).querySelectorAll('.ody-checkbox-group__item').length).toBe(0);
  });

  it('falls back to value for a missing label', async () => {
    const el = await mount('<ody-checkbox-group options=\'[{"value":"x"}]\'></ody-checkbox-group>');
    expect(el.querySelector('.ody-checkbox-group__item .ody-checkbox__label')!.textContent).toBe('x');
  });
});
