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
