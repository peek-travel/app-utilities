// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/ui/index.js';
import { cssColor, define, OdyElement } from '../../src/ui/base.js';

/** Render HTML, flush the deferred first render, and return the first element. */
async function mount<T extends Element = Element>(html: string): Promise<T> {
  document.body.innerHTML = html;
  await Promise.resolve();
  return document.body.firstElementChild as T;
}

/** Fire a bubbling DOM event of `type` on `el`. */
function fire(el: Element, type: string): void {
  el.dispatchEvent(new Event(type, { bubbles: true }));
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

describe('portal reparent preserves slotted content (finding 1)', () => {
  it('re-slots modal body after the host is moved in the DOM', async () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
    const modal = document.createElement('ody-modal');
    modal.setAttribute('open', '');
    modal.innerHTML = '<span id="mc">Body</span>';
    document.getElementById('a')!.appendChild(modal);
    await Promise.resolve();
    expect(document.body.querySelector('#mc')).not.toBeNull();

    // Reparent: disconnect from #a → connect to #b.
    document.getElementById('b')!.appendChild(modal);
    expect(document.body.querySelector('#mc')).not.toBeNull();
  });
});

describe('reconnect re-renders (findings 1/6)', () => {
  it('re-renders a moved element so it is not left empty/inert', async () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
    const card = document.createElement('ody-card');
    card.innerHTML = '<span id="cc">Body</span>';
    document.getElementById('a')!.appendChild(card);
    await Promise.resolve();
    expect(card.querySelector('.ody-card__container')).not.toBeNull();
    expect(card.querySelector('#cc')).not.toBeNull();

    document.getElementById('b')!.appendChild(card);
    expect(card.querySelector('.ody-card__container')).not.toBeNull();
    expect(card.querySelector('#cc')).not.toBeNull();
  });
});

describe('controlled value inputs update in place (finding 2)', () => {
  it('money-input reflects value without rebuilding the control', async () => {
    const el = await mount<OdyElement & { value: string }>('<ody-money-input></ody-money-input>');
    const input = el.querySelector<HTMLInputElement>('.ody-input__field')!;
    el.value = '12';
    expect(el.querySelector('.ody-input__field')).toBe(input); // same node, no re-render
    expect(input.value).toBe('12');
    expect(el.value).toBe('12');
  });

  it('money-input does not leak a duplicate native change (finding 2)', async () => {
    const el = await mount<OdyElement>('<ody-money-input></ody-money-input>');
    const input = el.querySelector<HTMLInputElement>('.ody-input__field')!;
    const changes: unknown[] = [];
    el.addEventListener('change', (e) => changes.push((e as CustomEvent).detail));
    fire(input, 'change'); // native change must be swallowed
    expect(changes).toEqual([]);
  });

  it('percentage-input reflects value in place', async () => {
    const el = await mount<OdyElement & { value: string }>('<ody-percentage-input></ody-percentage-input>');
    const input = el.querySelector<HTMLInputElement>('.ody-input__field')!;
    el.value = '40';
    expect(el.querySelector('.ody-input__field')).toBe(input);
    expect(input.value).toBe('40');
  });
});

describe('selection stays in place (finding 4)', () => {
  it('checkbox toggles without rebuilding the input', async () => {
    const el = await mount<OdyElement & { checked: boolean }>('<ody-checkbox label="A"></ody-checkbox>');
    const input = el.querySelector<HTMLInputElement>('.ody-checkbox__input')!;
    el.checked = true;
    expect(el.querySelector('.ody-checkbox__input')).toBe(input); // same node
    expect(input.checked).toBe(true);
    expect(el.querySelector('.ody-checkbox__mark')).not.toBeNull();
    el.checked = false;
    expect(el.querySelector('.ody-checkbox__mark')).toBeNull();
  });

  it('radio-button-group re-checks in place (keeps the fieldset)', async () => {
    const el = await mount<OdyElement & { value: string }>(
      `<ody-radio-button-group options='[{"label":"A","value":"a"},{"label":"B","value":"b"}]'></ody-radio-button-group>`,
    );
    const fieldset = el.querySelector('fieldset')!;
    el.value = 'b';
    expect(el.querySelector('fieldset')).toBe(fieldset); // not rebuilt
    const inputs = el.querySelectorAll<HTMLInputElement>('.ody-radio-button-input__field');
    expect(inputs[1]!.checked).toBe(true);
    expect(inputs[0]!.checked).toBe(false);
  });

  it('checkbox-group toggles items in place and select-all reflects state', async () => {
    const el = await mount<OdyElement & { value: string[] }>(
      `<ody-checkbox-group select-all-label="All" options='[{"label":"A","value":"a"},{"label":"B","value":"b"}]'></ody-checkbox-group>`,
    );
    const container = el.querySelector('.ody-checkbox-group')!;
    el.value = ['a', 'b'];
    expect(el.querySelector('.ody-checkbox-group')).toBe(container); // in place
    const main = el.querySelector<HTMLInputElement>('.ody-checkbox-group__select-all .ody-checkbox__input')!;
    expect(main.checked).toBe(true);
    expect(el.querySelector('.ody-checkbox-group__select-all .ody-checkbox__mark')).not.toBeNull();
  });
});

describe('data properties (findings 3, 5, 12)', () => {
  it('toggle-button accepts options as an array property, no attribute written', async () => {
    const el = await mount<OdyElement & { options: unknown }>('<ody-toggle-button></ody-toggle-button>');
    el.options = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }];
    expect(el.querySelectorAll('.ody-toggle-button__button').length).toBe(2);
    expect(el.getAttribute('options')).toBeNull();
  });

  it('toggle-button also accepts options as a JSON string (BC workaround)', async () => {
    const el = await mount<OdyElement & { options: unknown }>('<ody-toggle-button></ody-toggle-button>');
    el.options = JSON.stringify([{ value: 'a', label: 'A' }]);
    expect(el.querySelectorAll('.ody-toggle-button__button').length).toBe(1);
  });

  it('checkbox-group value is JSON-serialized and comma-values round-trip', async () => {
    const el = await mount<OdyElement & { value: string[] }>(
      `<ody-checkbox-group options='[{"label":"X","value":"a,b"}]'></ody-checkbox-group>`,
    );
    el.value = ['a,b'];
    expect(el.getAttribute('value')).toBe('["a,b"]');
    expect(el.value).toEqual(['a,b']);
  });

  it('checkbox-group still reads a legacy comma-separated value attribute', async () => {
    const el = await mount<OdyElement & { value: string[] }>(
      `<ody-checkbox-group value="a,b" options='[{"label":"A","value":"a"},{"label":"B","value":"b"}]'></ody-checkbox-group>`,
    );
    expect(el.value).toEqual(['a', 'b']);
  });
});

describe('datepicker property reactivity (findings 3, 13)', () => {
  it('renders presets set via the property', async () => {
    const el = await mount<OdyElement & { presets: unknown }>('<ody-datepicker></ody-datepicker>');
    el.presets = [{ label: 'Today', value: '2026-01-01' }];
    el.querySelector<HTMLElement>('.ody-datepicker__trigger')!.click();
    expect(el.querySelectorAll('.ody-datepicker__preset').length).toBe(1);
  });

  it('re-renders when a function prop is reassigned', async () => {
    const el = await mount<OdyElement & { formatDate: (d: Date) => string }>(
      '<ody-datepicker value="2026-01-15"></ody-datepicker>',
    );
    el.formatDate = () => 'CUSTOM-LABEL';
    expect(el.querySelector('.ody-datepicker__trigger-label')!.textContent).toBe('CUSTOM-LABEL');
  });
});

describe('cssColor guards style injection (finding 8)', () => {
  it('accepts a normal color and rejects a declaration-injecting value', () => {
    expect(cssColor('#1a2b3c')).toBe('#1a2b3c');
    expect(cssColor('var(--color-x)')).toBe('var(--color-x)');
    expect(cssColor('rgb(1, 2, 3)')).toBe('rgb(1, 2, 3)');
    expect(cssColor('red;position:fixed;inset:0')).toBe('');
    expect(cssColor('red}body{display:none', 'fallback')).toBe('fallback');
  });

  it('card drops an injecting bar-color', async () => {
    const el = await mount<OdyElement>('<ody-card bar-color="red;width:100vw">x</ody-card>');
    const bar = el.querySelector('.ody-card__container__bar');
    // The injecting value is rejected → no style attribute applied.
    expect(bar?.getAttribute('style') ?? '').not.toContain('width:100vw');
  });
});

describe('pre-upgrade property capture (finding 7)', () => {
  it('applies an own property that shadows a prototype accessor on connect', async () => {
    class UpgradeTest extends OdyElement {
      static observedAttributes = [];
      #v = '';
      get val(): string {
        return this.#v;
      }
      set val(next: string) {
        this.#v = next;
      }
      protected render(): void {
        this.mount('<span></span>');
      }
    }
    define('ody-upgrade-test', UpgradeTest);
    const el = document.createElement('ody-upgrade-test') as UpgradeTest;
    document.body.appendChild(el);
    await Promise.resolve();

    // Simulate a value assigned before upgrade: an own data property shadowing
    // the prototype accessor (a plain `el.val = x` would hit the setter instead).
    Object.defineProperty(el, 'val', {
      value: 'shadowed',
      configurable: true,
      writable: true,
      enumerable: true,
    });
    el.remove();
    document.body.appendChild(el); // reconnect → connectedCallback → #upgradeProperties

    expect(Object.getOwnPropertyDescriptor(el, 'val')).toBeUndefined(); // own prop removed
    expect(el.val).toBe('shadowed'); // re-applied through the setter
  });
});
