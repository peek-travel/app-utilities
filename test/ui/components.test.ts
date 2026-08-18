// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../src/ui/index.js';
import { classes, define, escapeHtml, OdyElement } from '../../src/ui/base.js';
import { hasIcon, iconSvg, registerIcon } from '../../src/ui/icons.js';

/** Render HTML, flush the deferred first render, and return the first element. */
async function mount<T extends Element = Element>(html: string): Promise<T> {
  document.body.innerHTML = html;
  await Promise.resolve();
  return document.body.firstElementChild as T;
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

describe('base helpers', () => {
  it('escapeHtml escapes all special characters', () => {
    expect(escapeHtml(`<a href="x" id='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; id=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    );
  });

  it('classes drops falsy fragments', () => {
    expect(classes('a', false, null, undefined, '', 'b')).toBe('a b');
    expect(classes(false, null)).toBe('');
  });

  it('classes escapes fragments so a raw attribute cannot break out of class="..."', () => {
    // Legitimate class tokens are unaffected (no special characters).
    expect(classes('ody-tag', 'ody-tag--primary')).toBe('ody-tag ody-tag--primary');
    // A malicious enum-attribute value is neutralised (no unescaped quote/angle).
    expect(classes('ody-tag', 'ody-tag--"><img src=x onerror=alert(1)>')).toBe(
      'ody-tag ody-tag--&quot;&gt;&lt;img src=x onerror=alert(1)&gt;',
    );
  });

  it('a hostile class-driving attribute does not inject markup (DOM XSS)', async () => {
    const el = await mount<OdyElement>(
      `<ody-tag color='"><img src=x onerror="window.__xss=1">'>Label</ody-tag>`,
    );
    // No <img> smuggled into the DOM, and the payload stayed inside the class attr.
    expect(el.querySelector('img')).toBeNull();
    expect((globalThis as Record<string, unknown>).__xss).toBeUndefined();
  });

  it('define is a no-op when the tag is already registered', () => {
    const ctor = customElements.get('ody-button')!;
    expect(() => define('ody-button', ctor)).not.toThrow();
    expect(customElements.get('ody-button')).toBe(ctor);
  });

  it('define is a no-op outside a DOM environment', () => {
    vi.stubGlobal('customElements', undefined);
    class Tmp extends HTMLElement {}
    expect(() => define('ody-never', Tmp)).not.toThrow();
  });

  it('flag treats an explicit "false" attribute as off', async () => {
    const el = await mount<OdyElement>('<ody-card clickable="false"></ody-card>');
    expect(el.querySelector('.ody-card--clickable')).toBeNull();
  });

  // React 19 sets JSX props as element *properties* (`el.searchable = true`);
  // a getter-only accessor would throw on that assignment and crash the render.
  describe('React-safe property setters', () => {
    it('reflects an assigned boolean prop onto its observed attribute', async () => {
      const el = await mount<OdyElement>('<ody-dropdown-single></ody-dropdown-single>');
      const asProps = el as unknown as { searchable: boolean };

      expect(() => (asProps.searchable = true)).not.toThrow();
      expect(el.hasAttribute('searchable')).toBe(true);

      asProps.searchable = false;
      expect(el.hasAttribute('searchable')).toBe(false);
    });

    it('reflects an assigned object prop as JSON onto its observed attribute', async () => {
      // A getter-only object accessor whose name is an observed attribute: the
      // React-safe setter JSON-stringifies the assignment onto the attribute.
      class OdyReflectObjectTest extends OdyElement {
        static observedAttributes = ['data'];
        get data(): unknown[] {
          const raw = this.getAttribute('data');
          return raw ? (JSON.parse(raw) as unknown[]) : [];
        }
        protected render(): void {
          this.mount('<span></span>');
        }
      }
      define('ody-reflect-object-test', OdyReflectObjectTest);
      const el = await mount<{ data: unknown }>('<ody-reflect-object-test></ody-reflect-object-test>');
      const data = [{ value: 'a', label: 'A' }];

      expect(() => (el.data = data)).not.toThrow();
      expect((el as unknown as Element).getAttribute('data')).toBe(JSON.stringify(data));
      // The getter round-trips the reflected attribute back to the parsed value.
      expect(el.data).toEqual(data);
    });

    it('reflects an assigned scalar prop as a string onto its observed attribute', async () => {
      class OdyReflectScalarTest extends OdyElement {
        static observedAttributes = ['level'];
        get level(): number {
          return Number(this.getAttribute('level') ?? 0);
        }
        protected render(): void {
          this.mount('<span></span>');
        }
      }
      define('ody-reflect-scalar-test', OdyReflectScalarTest);
      const el = await mount<{ level: number }>(
        '<ody-reflect-scalar-test></ody-reflect-scalar-test>',
      );

      el.level = 3;
      expect((el as unknown as Element).getAttribute('level')).toBe('3');
      expect(el.level).toBe(3);
    });

    it('ignores assignment to a non-attribute state prop without throwing', async () => {
      const el = await mount<OdyElement>('<ody-datepicker></ody-datepicker>');
      const asProps = el as unknown as { isOpen: boolean };

      expect(() => (asProps.isOpen = true)).not.toThrow();
      // Read-only derived state: the no-op setter neither throws nor takes effect.
      expect(el.hasAttribute('is-open')).toBe(false);
      expect(asProps.isOpen).toBe(false);
    });
  });
});

describe('icons', () => {
  it('iconSvg renders a known icon with an optional class', () => {
    expect(iconSvg('check', 'icon__svg')).toContain('class="icon__svg"');
    expect(iconSvg('check')).toContain('<svg');
    expect(iconSvg('check')).not.toContain('class=');
  });

  it('iconSvg renders an empty body for unknown icons', () => {
    expect(iconSvg('does-not-exist')).toBe(
      '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"></svg>',
    );
  });

  it('registerIcon adds a custom icon discoverable by hasIcon', () => {
    expect(hasIcon('custom-x')).toBe(false);
    registerIcon('custom-x', '<circle/>');
    expect(hasIcon('custom-x')).toBe(true);
    expect(iconSvg('custom-x')).toContain('<circle/>');
  });
});

describe('ody-icon', () => {
  it('renders the named svg at the requested size', async () => {
    const el = await mount('<ody-icon name="check" size="large"></ody-icon>');
    expect(el.querySelector('.icon.icon--size-large .icon__svg')).not.toBeNull();
  });

  it('supports the disabled flag and default size', async () => {
    const el = await mount('<ody-icon name="info" disabled></ody-icon>');
    expect(el.querySelector('.icon--size-base.icon--disabled')).not.toBeNull();
  });
});

describe('ody-button', () => {
  it('renders label, default classes and aria state', async () => {
    const el = await mount('<ody-button>Save</ody-button>');
    const btn = el.querySelector('button')!;
    expect(btn.className).toContain('btn-primary');
    expect(btn.className).toContain('interaction');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.querySelector('.ody-button__label')!.textContent).toBe('Save');
  });

  it('renders icons, loading spinner and disabled/active state', async () => {
    const el = await mount(
      '<ody-button variant="danger" size="small" type="submit" left-icon="plus" right-icon="chevron-down" loading active disabled icon-rotate icon-only>Go</ody-button>',
    );
    const btn = el.querySelector('button')!;
    expect(btn.getAttribute('type')).toBe('submit');
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(btn.className).toContain('ody-button--loading');
    expect(btn.className).toContain('ody-button--icon-only');
    expect(btn.className).toContain('ody-button--rotate');
    expect(btn.querySelector('.ody-button__left-icon')).not.toBeNull();
    expect(btn.querySelector('.ody-button__right-icon')).not.toBeNull();
    expect(btn.querySelector('.ody-button__loading-wrapper')).not.toBeNull();
  });

  it('re-renders and preserves slotted content when an attribute changes', async () => {
    const el = await mount('<ody-button>Save</ody-button>');
    el.setAttribute('variant', 'secondary');
    const btn = el.querySelector('button')!;
    expect(btn.className).toContain('btn-secondary');
    expect(btn.querySelector('.ody-button__label')!.textContent).toBe('Save');
  });
});

describe('ody-tag', () => {
  it('renders label with default primary/default classes', async () => {
    const el = await mount('<ody-tag>New</ody-tag>');
    expect(el.querySelector('.ody-tag--primary.ody-tag--default')).not.toBeNull();
    expect(el.querySelector('.ody-tag__label')!.textContent).toBe('New');
  });

  it('renders icon, count and small secondary variant', async () => {
    const el = await mount('<ody-tag variant="secondary" color="success" size="small" icon="check" count="3">Done</ody-tag>');
    expect(el.querySelector('.ody-tag--secondary.ody-tag--success.ody-tag--size-small')).not.toBeNull();
    expect(el.querySelector('.ody-tag__icon')).not.toBeNull();
    expect(el.querySelector('.ody-tag__count')!.textContent).toBe('3');
  });
});

describe('ody-alert', () => {
  it.each([
    ['info'],
    ['success'],
    ['warning'],
    ['danger'],
  ])('maps the %s variant to its icon and heading', async (variant) => {
    const el = await mount(`<ody-alert variant="${variant}" heading="Heads up">Body</ody-alert>`);
    expect(el.querySelector(`.ody-alert--${variant}`)).not.toBeNull();
    expect(el.querySelector('.ody-alert__message')!.textContent).toBe('Heads up');
    expect(el.querySelector('.ody-alert__body')!.textContent).toBe('Body');
  });

  it('falls back to the info icon for an unknown variant and omits an empty heading', async () => {
    const el = await mount('<ody-alert variant="bogus">Body</ody-alert>');
    expect(el.querySelector('.ody-alert__icon .icon__svg')).not.toBeNull();
    expect(el.querySelector('.ody-alert__message')).toBeNull();
  });
});

describe('ody-card', () => {
  it('renders content and an accent bar with a custom colour', async () => {
    const el = await mount('<ody-card bar-color="#ff0000" clickable>Body</ody-card>');
    expect(el.querySelector('.ody-card--clickable')).not.toBeNull();
    expect(el.querySelector('.ody-card__container__bar')!.getAttribute('style')).toContain('#ff0000');
    expect(el.querySelector('.ody-card__container__content')!.textContent).toBe('Body');
  });

  it('renders without a custom bar colour', async () => {
    const el = await mount('<ody-card>Body</ody-card>');
    expect(el.querySelector('.ody-card__container__bar')!.getAttribute('style')).toBeNull();
  });

  it('omits the accent bar when no-bar is set', async () => {
    const el = await mount('<ody-card no-bar>Body</ody-card>');
    expect(el.querySelector('.ody-card--no-bar')).not.toBeNull();
    expect(el.querySelector('.ody-card__container__bar')).toBeNull();
    expect(el.querySelector('.ody-card__container__content')!.textContent).toBe('Body');
  });
});

describe('OdyElement child mutations (framework reconcilers)', () => {
  it('removeChild delegates to the slot for a slotted child (no NotFoundError)', async () => {
    const card = await mount<OdyElement>('<ody-card><span id="a">A</span></ody-card>');
    const slot = card.querySelector('[data-ody-slot]')!;
    const a = card.querySelector('#a')!;
    expect(a.parentNode).toBe(slot); // relocated into the slot, not the host
    expect(() => card.removeChild(a)).not.toThrow();
    expect(card.querySelector('#a')).toBeNull();
    expect(slot.contains(a)).toBe(false);
  });

  it('appendChild adds into the slot', async () => {
    const card = await mount<OdyElement>('<ody-card><span id="a">A</span></ody-card>');
    const slot = card.querySelector('[data-ody-slot]')!;
    const b = document.createElement('span');
    b.id = 'b';
    card.appendChild(b);
    expect(b.parentNode).toBe(slot);
    expect(slot.lastElementChild).toBe(b);
  });

  it('insertBefore inserts into the slot at the reference position', async () => {
    const card = await mount<OdyElement>('<ody-card><span id="a">A</span></ody-card>');
    const slot = card.querySelector('[data-ody-slot]')!;
    const a = card.querySelector('#a')!;
    const b = document.createElement('span');
    b.id = 'b';
    card.insertBefore(b, a);
    expect(b.parentNode).toBe(slot);
    expect(Array.from(slot.children).map((c) => c.id)).toEqual(['b', 'a']);
  });

  it('replaceChild swaps a slotted child in place', async () => {
    const card = await mount<OdyElement>('<ody-card><span id="a">A</span></ody-card>');
    const slot = card.querySelector('[data-ody-slot]')!;
    const a = card.querySelector('#a')!;
    const b = document.createElement('span');
    b.id = 'b';
    card.replaceChild(b, a);
    expect(card.querySelector('#a')).toBeNull();
    expect(slot.firstElementChild).toBe(b);
  });

  it('survives a conditional direct child swapped across renders (regression)', async () => {
    // Mirrors a framework reusing <ody-card> and swapping its single child.
    const card = await mount<OdyElement>(
      '<ody-card no-bar><div id="empty">Empty</div></ody-card>',
    );
    const empty = card.querySelector('#empty')!;
    const table = document.createElement('div');
    table.id = 'table';
    expect(() => {
      card.removeChild(empty); // reconciler removes old branch...
      card.appendChild(table); // ...and mounts the new one in its place
    }).not.toThrow();
    expect(card.querySelector('#empty')).toBeNull();
    expect(card.querySelector('#table')).not.toBeNull();
  });

  it('keeps slotted children present and ordered across an attribute re-render', async () => {
    const card = await mount<OdyElement>(
      '<ody-card><span id="a">A</span><span id="b">B</span></ody-card>',
    );
    card.setAttribute('bar-color', '#123456'); // observed → synchronous re-render
    const slot = card.querySelector('[data-ody-slot]')!;
    expect(Array.from(slot.children).map((c) => c.id)).toEqual(['a', 'b']);
    expect(
      card.querySelector('.ody-card__container__bar')!.getAttribute('style'),
    ).toContain('#123456');
  });

  it('leaves the internal chrome markup unchanged (slot is the content container)', async () => {
    const card = await mount<OdyElement>('<ody-card>Body</ody-card>');
    const slot = card.querySelector('[data-ody-slot]')!;
    expect(slot.classList.contains('ody-card__container__content')).toBe(true);
    expect(slot).not.toBe(card);
  });

  it('does not forward mutations before the first render (children land on the host)', () => {
    const card = document.createElement('ody-card');
    const child = document.createElement('span');
    card.appendChild(child); // no slot captured yet → targets the host
    expect(child.parentNode).toBe(card);
  });

  it('removeChild/replaceChild fall back to the host for a direct child', () => {
    const card = document.createElement('ody-card');
    const a = document.createElement('span');
    card.appendChild(a); // pre-mount: a is a direct host child
    const b = document.createElement('span');
    b.id = 'b';
    expect(() => card.replaceChild(b, a)).not.toThrow();
    expect(b.parentNode).toBe(card);
    expect(a.parentNode).toBeNull();
    expect(() => card.removeChild(b)).not.toThrow();
    expect(b.parentNode).toBeNull();
  });

  it('removeChild delegates correctly when the slot is portaled (modal open)', async () => {
    const modal = await mount<OdyElement>('<ody-modal open><span id="c">C</span></ody-modal>');
    // The dialog (carrying the slot) is portaled to document.body.
    const c = document.body.querySelector('#c')!;
    expect(c.parentNode).not.toBe(modal);
    expect(() => modal.removeChild(c)).not.toThrow();
    expect(document.body.querySelector('#c')).toBeNull();
  });

  it('re-renders a never-opened popover without nesting its own chrome (adopt regression)', async () => {
    const pop = await mount<OdyElement>(
      '<ody-popover><button data-ody-popover-trigger>Open</button><p>Body</p></ody-popover>',
    );
    // The panel must be re-homed via adopt(), not routed into its own slot
    // (which would throw a HierarchyRequestError).
    expect(() => pop.setAttribute('placement', 'bottom')).not.toThrow();
    expect(pop.querySelector('.ody-popover__container')).not.toBeNull();
  });
});

describe('simple display components', () => {
  it('ody-divider renders a rule', async () => {
    const el = await mount('<ody-divider></ody-divider>');
    expect(el.querySelector('.ody-divider')).not.toBeNull();
  });

  it('ody-status-dot renders the colour and label', async () => {
    const el = await mount('<ody-status-dot color="blue">Active</ody-status-dot>');
    expect(el.querySelector('.status-dot--blue')).not.toBeNull();
    expect(el.querySelector('.status-dot__label')!.textContent).toBe('Active');
  });

  it('ody-message renders with and without an icon', async () => {
    expect((await mount('<ody-message icon="info">Hi</ody-message>')).querySelector('.ody-message__icon')).not.toBeNull();
    expect((await mount('<ody-message>Hi</ody-message>')).querySelector('.ody-message__icon')).toBeNull();
  });
});

describe('ody-loading-spinner', () => {
  it.each([
    ['base', null],
    ['small', 'loading-spinner--size-small'],
    ['large', 'loading-spinner--size-large'],
  ])('renders the %s size', async (size, cls) => {
    const el = await mount(`<ody-loading-spinner size="${size}">Loading</ody-loading-spinner>`);
    expect(el.querySelector('.loading-spinner')).not.toBeNull();
    if (cls) expect(el.querySelector(`.${cls}`)).not.toBeNull();
  });
});

describe('ody-loading-bar', () => {
  it('clamps the value and shows the label', async () => {
    const el = await mount('<ody-loading-bar value="150" label="Upload"></ody-loading-bar>');
    expect(el.querySelector<HTMLElement>('.loading-bar__progress')!.style.width).toBe('100%');
    expect(el.querySelector('.loading-bar__text-container')!.textContent).toContain('Upload');
    expect(el.querySelector('.loading-bar__text-container')!.textContent).toContain('100%');
  });

  it('floors negative and non-numeric values to 0 and uses a custom colour', async () => {
    const neg = await mount('<ody-loading-bar value="-5"></ody-loading-bar>');
    expect(neg.querySelector<HTMLElement>('.loading-bar__progress')!.style.width).toBe('0%');
    const nan = await mount('<ody-loading-bar value="abc" color="rebeccapurple"></ody-loading-bar>');
    expect(nan.querySelector<HTMLElement>('.loading-bar__progress')!.style.width).toBe('0%');
    expect(nan.querySelector('.loading-bar__progress')!.getAttribute('style')).toContain('rebeccapurple');
    expect(nan.querySelector('.loading-bar__text-container')).toBeNull();
  });
});
