// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import '../../src/ui/components/empty-state.js';
import '../../src/ui/components/breadcrumb.js';
import '../../src/ui/components/stat-summary.js';
import '../../src/ui/components/inline-list.js';
import '../../src/ui/components/list-item.js';
import '../../src/ui/components/product-indicator.js';
import '../../src/ui/components/toggle-button.js';
import '../../src/ui/components/section.js';
import '../../src/ui/components/two-column.js';
import '../../src/ui/components/page-container.js';
import '../../src/ui/components/collapsible-section.js';

/** Render HTML, flush the deferred first render, and return the first element. */
async function mount<T extends Element = Element>(html: string): Promise<T> {
  document.body.innerHTML = html;
  await Promise.resolve();
  return document.body.firstElementChild as T;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ody-empty-state', () => {
  it('renders the default variant icon, label, caption and slotted block', async () => {
    const el = await mount(
      '<ody-empty-state label="Nothing here" caption="Try again">Action</ody-empty-state>',
    );
    expect(el.querySelector('.ody-empty-state__icon .icon__svg')).not.toBeNull();
    expect(el.querySelector('.ody-empty-state__label')!.textContent).toBe('Nothing here');
    expect(el.querySelector('.ody-empty-state__caption')!.textContent).toBe('Try again');
    expect(el.querySelector('.ody-empty-state__block')!.textContent).toBe('Action');
  });

  it.each([
    ['error'],
    ['no-results'],
    ['no-search'],
    ['not-authorized'],
    ['bogus'],
  ])('renders an icon for the %s variant', async (variant) => {
    const el = await mount(`<ody-empty-state variant="${variant}"></ody-empty-state>`);
    expect(el.querySelector('.ody-empty-state__icon .icon__svg')).not.toBeNull();
    expect(el.querySelector('.ody-empty-state__label')).toBeNull();
    expect(el.querySelector('.ody-empty-state__caption')).toBeNull();
  });

  it('honours an explicit icon override', async () => {
    const el = await mount('<ody-empty-state icon="search"></ody-empty-state>');
    expect(el.querySelector('.ody-empty-state__icon')).not.toBeNull();
  });

  it('renders an image when img-src is provided', async () => {
    const el = await mount('<ody-empty-state img-src="/x.png" img-alt="x"></ody-empty-state>');
    const img = el.querySelector<HTMLImageElement>('img.ody-empty-state__image')!;
    expect(img.getAttribute('src')).toBe('/x.png');
    expect(img.getAttribute('alt')).toBe('x');
    expect(el.querySelector('.ody-empty-state__icon')).toBeNull();
  });
});

describe('ody-breadcrumb', () => {
  it('renders nav/ol chrome and items with current state', async () => {
    const el = await mount(
      '<ody-breadcrumb>' +
        '<ody-breadcrumb-item><a href="/">Home</a></ody-breadcrumb-item>' +
        '<ody-breadcrumb-item current>Now</ody-breadcrumb-item>' +
      '</ody-breadcrumb>',
    );
    expect(el.querySelector('nav.breadcrumbs ol.breadcrumb')).not.toBeNull();
    const items = el.querySelectorAll('.breadcrumb__item');
    expect(items.length).toBe(2);
    expect(items[0].getAttribute('aria-current')).toBeNull();
    expect(items[1].getAttribute('aria-current')).toBe('page');
    expect(items[1].classList.contains('active')).toBe(true);
  });
});

describe('ody-stat-summary', () => {
  it('renders stats with values, tones and a slotted value', async () => {
    const el = await mount(
      '<ody-stat-summary>' +
        '<ody-stat label="Revenue" value="$10" sub="today"></ody-stat>' +
        '<ody-stat label="Win" value="3" tone="success"></ody-stat>' +
        '<ody-stat label="Risk" value="1" tone="warning"></ody-stat>' +
        '<ody-stat label="Loading">…</ody-stat>' +
      '</ody-stat-summary>',
    );
    expect(el.querySelector('.ody-stat-summary__stats')).not.toBeNull();
    const stats = el.querySelectorAll('.ody-stat-summary__stat');
    expect(stats.length).toBe(4);
    expect(el.querySelector('.ody-stat-summary__stat__sub')!.textContent).toBe('today');
    expect(el.querySelector('.ody-stat-summary__stat__value--success')).not.toBeNull();
    expect(el.querySelector('.ody-stat-summary__stat__value--warning')).not.toBeNull();
    // The "Loading" stat has no value attr -> slotted child content.
    const loading = stats[3].querySelector('.ody-stat-summary__stat__value')!;
    expect(loading.textContent).toBe('…');
  });

  it('renders a stat without a label', async () => {
    const el = await mount('<ody-stat value="5"></ody-stat>');
    expect(el.querySelector('.ody-stat-summary__stat__label')).toBeNull();
    expect(el.querySelector('.ody-stat-summary__stat__value')!.textContent).toBe('5');
  });

  it('renders a detail strip with explicit and slotted values', async () => {
    const el = await mount(
      '<ody-stat-summary-detail>' +
        '<ody-stat-detail value="42">Total</ody-stat-detail>' +
        '<ody-stat-detail>Plain</ody-stat-detail>' +
      '</ody-stat-summary-detail>',
    );
    expect(el.querySelector('.ody-stat-summary__divider')).not.toBeNull();
    const items = el.querySelectorAll('.ody-stat-summary__detail-item');
    expect(items.length).toBe(2);
    expect(items[0].querySelector('.ody-stat-summary__detail-item__value')!.textContent).toBe('42');
    expect(items[1].querySelector('.ody-stat-summary__detail-item__value')).toBeNull();
  });
});

describe('ody-inline-list', () => {
  it('defaults to the line separator and 12px gap', async () => {
    const el = await mount(
      '<ody-inline-list><ody-inline-list-item>A</ody-inline-list-item></ody-inline-list>',
    );
    const root = el.querySelector<HTMLElement>('.ody-inline-list--line')!;
    expect(root).not.toBeNull();
    expect(root.getAttribute('style')).toContain('12px');
    expect(el.querySelector('.ody-inline-list__item')!.textContent).toBe('A');
  });

  it('supports the bullet separator and a custom gap', async () => {
    const el = await mount('<ody-inline-list separator="bullet" gap="8"></ody-inline-list>');
    const root = el.querySelector<HTMLElement>('.ody-inline-list--bullet')!;
    expect(root.getAttribute('style')).toContain('8px');
  });

  it('falls back to 12px for a non-numeric gap', async () => {
    const el = await mount('<ody-inline-list gap="abc"></ody-inline-list>');
    expect(el.querySelector<HTMLElement>('.ody-inline-list')!.getAttribute('style')).toContain('12px');
  });
});

describe('ody-list-item', () => {
  it('renders content + chevron and emits select on click', async () => {
    const el = await mount<HTMLElement>('<ody-list-item item-id="a">Row</ody-list-item>');
    expect(el.querySelector('.list-item__content')!.textContent).toBe('Row');
    expect(el.querySelector('.list-item__icon-container .icon__svg')).not.toBeNull();
    let detail: { itemId: string } | null = null;
    el.addEventListener('select', (e) => {
      detail = (e as CustomEvent).detail;
    });
    el.querySelector<HTMLElement>('.list-item')!.click();
    expect(detail).toEqual({ itemId: 'a' });
  });

  it('emits select on Enter and Space keydown', async () => {
    const el = await mount<HTMLElement>('<ody-list-item item-id="b">Row</ody-list-item>');
    let count = 0;
    el.addEventListener('select', () => {
      count += 1;
    });
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true }));
    expect(count).toBe(2);
  });

  it('marks active via matching ids and via the active flag', async () => {
    const match = await mount(
      '<ody-list-item item-id="x" active-item-id="x">Row</ody-list-item>',
    );
    expect(match.querySelector('.list-item--active')).not.toBeNull();
    const forced = await mount('<ody-list-item active>Row</ody-list-item>');
    expect(forced.querySelector('.list-item--active')).not.toBeNull();
    const inactive = await mount(
      '<ody-list-item item-id="x" active-item-id="y">Row</ody-list-item>',
    );
    expect(inactive.querySelector('.list-item--active')).toBeNull();
  });

  it('cleans up listeners on disconnect', async () => {
    const el = await mount<HTMLElement>('<ody-list-item item-id="c">Row</ody-list-item>');
    el.remove();
    let fired = false;
    el.addEventListener('select', () => {
      fired = true;
    });
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fired).toBe(false);
  });
});

describe('ody-product-indicator', () => {
  it('renders name, detail, bar/text colours and extra slot', async () => {
    const el = await mount(
      '<ody-product-indicator name="Tour" detail="2 hrs" bar-color="#f00" text-color="#00f" size="small">' +
        '<span class="x">tag</span>' +
      '</ody-product-indicator>',
    );
    expect(el.querySelector('.ody-product-indicator-container--size-small')).not.toBeNull();
    expect(el.querySelector('.ody-product-indicator__name')!.textContent).toBe('Tour');
    expect(el.querySelector('.ody-product-indicator__name')!.getAttribute('style')).toContain('#00f');
    expect(el.querySelector('.ody-product-indicator__detail')!.textContent).toBe('2 hrs');
    expect(el.querySelector('.ody-product-indicator__bar')!.getAttribute('style')).toContain('#f00');
    expect(el.querySelector('.ody-product-indicator__extra .x')).not.toBeNull();
  });

  it('omits detail/colours when not provided and is not clickable by default', async () => {
    const el = await mount<HTMLElement>('<ody-product-indicator name="Tour"></ody-product-indicator>');
    expect(el.querySelector('.ody-product-indicator__detail')).toBeNull();
    expect(el.querySelector('.ody-product-indicator__bar')!.getAttribute('style')).toBeNull();
    expect(el.querySelector('.ody-product-indicator-clickable')).toBeNull();
    let fired = false;
    el.addEventListener('select', () => {
      fired = true;
    });
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fired).toBe(false);
  });

  it('emits select with the id when clickable', async () => {
    const el = await mount<HTMLElement>(
      '<ody-product-indicator name="Tour" clickable indicator-id="p1"></ody-product-indicator>',
    );
    expect(el.querySelector('[role="button"]')).not.toBeNull();
    let detail: { id: string } | null = null;
    el.addEventListener('select', (e) => {
      detail = (e as CustomEvent).detail;
    });
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(detail).toEqual({ id: 'p1' });
    el.remove();
  });
});

describe('ody-toggle-button', () => {
  it('renders options, marks the selected one and emits change on click', async () => {
    const opts = JSON.stringify([
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week', leftIcon: 'chevron-left', rightIcon: 'chevron-right' },
      { value: 'icon', iconOnly: true, leftIcon: 'plus' },
      { value: 'gone', label: 'Gone', disabled: true },
    ]);
    const el = await mount<HTMLElement>(
      `<ody-toggle-button selected="day" options='${opts}'></ody-toggle-button>`,
    );
    const buttons = el.querySelectorAll<HTMLButtonElement>('.ody-toggle-button__button');
    expect(buttons.length).toBe(4);
    expect(buttons[0].classList.contains('ody-toggle-button__button--selected')).toBe(true);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].querySelector('.ody-toggle-button__button__left-icon')).not.toBeNull();
    expect(buttons[1].querySelector('.ody-toggle-button__button__right-icon')).not.toBeNull();
    expect(buttons[2].classList.contains('ody-toggle-button__button--icon-only')).toBe(true);
    expect(buttons[3].disabled).toBe(true);

    let detail: { value: string } | null = null;
    el.addEventListener('change', (e) => {
      detail = (e as CustomEvent).detail;
    });
    buttons[1].click();
    expect(detail).toEqual({ value: 'week' });
    expect(el.getAttribute('selected')).toBe('week');
  });

  it('ignores clicks on disabled buttons and outside any button', async () => {
    const opts = JSON.stringify([{ value: 'a', label: 'A', disabled: true }]);
    const el = await mount<HTMLElement>(`<ody-toggle-button options='${opts}'></ody-toggle-button>`);
    let count = 0;
    el.addEventListener('change', () => {
      count += 1;
    });
    el.querySelector<HTMLButtonElement>('.ody-toggle-button__button')!.click();
    el.querySelector('.ody-toggle-button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(count).toBe(0);
  });

  it('renders nothing for missing or invalid options and respects group disabled', async () => {
    const none = await mount('<ody-toggle-button></ody-toggle-button>');
    expect(none.querySelectorAll('.ody-toggle-button__button').length).toBe(0);
    const bad = await mount(`<ody-toggle-button options='not json'></ody-toggle-button>`);
    expect(bad.querySelectorAll('.ody-toggle-button__button').length).toBe(0);
    const notArray = await mount(`<ody-toggle-button options='{"a":1}'></ody-toggle-button>`);
    expect(notArray.querySelectorAll('.ody-toggle-button__button').length).toBe(0);
    const disabled = await mount<HTMLElement>(
      `<ody-toggle-button disabled options='[{"value":"a","label":"A"}]'></ody-toggle-button>`,
    );
    expect(disabled.querySelector<HTMLButtonElement>('.ody-toggle-button__button')!.disabled).toBe(true);
    disabled.remove();
    // No selection -> nothing marked selected (exercises the empty-selected branch).
    const unselected = await mount(
      `<ody-toggle-button options='[{"value":"a","label":"A"}]'></ody-toggle-button>`,
    );
    expect(unselected.querySelector('.ody-toggle-button__button--selected')).toBeNull();
  });
});

describe('ody-section columns', () => {
  it('renders columns with default gap/align and item flags', async () => {
    const el = await mount(
      '<ody-section-columns>' +
        '<ody-section-column-item no-grow individual-scroll stretch with-padding>A</ody-section-column-item>' +
        '<ody-section-column-item>B</ody-section-column-item>' +
      '</ody-section-columns>',
    );
    expect(el.querySelector('.ody-section-columns--gap16')).not.toBeNull();
    expect(el.querySelector('.ody-section-columns--vertical-align-bottom')).not.toBeNull();
    const first = el.querySelector('.ody-section-columns__item')!;
    expect(first.classList.contains('ody-section-columns__item--no-grow')).toBe(true);
    expect(first.classList.contains('ody-section-columns__item--individual-scroll')).toBe(true);
    expect(first.classList.contains('ody-section-columns__item--stretch')).toBe(true);
    expect(first.classList.contains('ody-section-columns__item--with-padding')).toBe(true);
  });

  it('honours custom gap-size and vertical-align, falling back on a bad gap', async () => {
    const el = await mount(
      '<ody-section-columns gap-size="24" vertical-align="center"></ody-section-columns>',
    );
    expect(el.querySelector('.ody-section-columns--gap24')).not.toBeNull();
    expect(el.querySelector('.ody-section-columns--vertical-align-center')).not.toBeNull();
    const bad = await mount('<ody-section-columns gap-size="99"></ody-section-columns>');
    expect(bad.querySelector('.ody-section-columns--gap16')).not.toBeNull();
  });
});

describe('ody-section rows', () => {
  it('renders a row item with header, description icon and divider', async () => {
    const el = await mount(
      '<ody-section-rows gap-size="8">' +
        '<ody-section-row-item title="T" description="D" description-icon="info">Body</ody-section-row-item>' +
      '</ody-section-rows>',
    );
    expect(el.querySelector('.ody-section-rows--gap8')).not.toBeNull();
    expect(el.querySelector('.ody-section-rows__header h3')!.textContent).toBe('T');
    expect(el.querySelector('.ody-section-rows__description .icon__svg')).not.toBeNull();
    expect(el.querySelector('.ody-divider')).not.toBeNull();
  });

  it('omits the header when no title/description and omits divider when no-divider', async () => {
    const el = await mount(
      '<ody-section-rows><ody-section-row-item no-divider>Body</ody-section-row-item></ody-section-rows>',
    );
    expect(el.querySelector('.ody-section-rows__header')).toBeNull();
    expect(el.querySelector('.ody-divider')).toBeNull();
  });

  it('renders a description without an icon when description-icon is absent', async () => {
    const el = await mount('<ody-section-row-item description="D"></ody-section-row-item>');
    expect(el.querySelector('.ody-section-rows__description')).not.toBeNull();
    expect(el.querySelector('.ody-section-rows__description .icon__svg')).toBeNull();
    expect(el.querySelector('h3')).toBeNull();
  });
});

describe('ody-two-column', () => {
  it('renders main + secondary and toggles secondary-open class', async () => {
    const el = await mount<HTMLElement>(
      '<ody-two-column secondary-open>' +
        '<ody-two-column-main>Main</ody-two-column-main>' +
        '<ody-two-column-secondary>' +
          '<ody-two-column-secondary-header title="Detail"></ody-two-column-secondary-header>' +
        '</ody-two-column-secondary>' +
      '</ody-two-column>',
    );
    expect(el.querySelector('.ody-two-column--secondary-open')).not.toBeNull();
    expect(el.querySelector('.ody-two-column__main-content')!.textContent).toBe('Main');
    expect(el.querySelector('.ody-two-column__secondary')).not.toBeNull();
    expect(el.querySelector('.ody-two-column__secondary__header__title')!.textContent).toBe('Detail');
  });

  it('omits the open class when not opened', async () => {
    const el = await mount('<ody-two-column></ody-two-column>');
    expect(el.querySelector('.ody-two-column--secondary-open')).toBeNull();
  });

  it('emits close from the secondary header close button', async () => {
    const header = await mount<HTMLElement>(
      '<ody-two-column-secondary-header title="Detail"></ody-two-column-secondary-header>',
    );
    let fired = false;
    header.addEventListener('close', () => {
      fired = true;
    });
    header.querySelector<HTMLElement>('.ody-two-column__secondary__close-button')!.click();
    expect(fired).toBe(true);
    // A click elsewhere does not fire close.
    fired = false;
    header.querySelector<HTMLElement>('.ody-two-column__secondary__header__title')!.click();
    expect(fired).toBe(false);
    header.remove();
  });
});

describe('ody-page-container', () => {
  it('wraps slotted content in the full-bleed container', async () => {
    const el = await mount<HTMLElement>(
      '<ody-page-container><p>Settings UI</p></ody-page-container>',
    );
    const container = el.querySelector('.ody-page-container');
    expect(container).not.toBeNull();
    expect(container!.querySelector('p')!.textContent).toBe('Settings UI');
  });
});

describe('ody-collapsible-section', () => {
  it('renders collapsed by default with a down chevron and header text', async () => {
    const el = await mount<HTMLElement>(
      '<ody-collapsible-section header-text="More" secondary-header-text="(3)" icon="info">' +
        '<ody-collapsible-collapsed>Teaser</ody-collapsible-collapsed>' +
        '<ody-collapsible-content>Body</ody-collapsible-content>' +
      '</ody-collapsible-section>',
    );
    expect(el.querySelector('.ody-collapsible-section--expanded')).toBeNull();
    expect(el.querySelector('.ody-collapsible__header')!.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('.ody-collapsible__header__label')!.textContent).toContain('More');
    expect(el.querySelector('.ody-collapsible-section__secondary-header-text')!.textContent).toBe('(3)');
    expect(el.querySelector('.ody-collapsible__header__label .icon')).not.toBeNull();
    expect(el.querySelector('.ody-collapsible-section__collapsed-content')!.textContent).toBe('Teaser');
    expect(el.querySelector('.ody-collapsible__content')!.textContent).toBe('Body');
  });

  it('renders without an icon or secondary text', async () => {
    const el = await mount('<ody-collapsible-section header-text="Plain"></ody-collapsible-section>');
    expect(el.querySelector('.ody-collapsible__header__label .icon')).toBeNull();
    expect(el.querySelector('.ody-collapsible-section__secondary-header-text')).toBeNull();
  });

  it('toggles expanded state and emits the expanded event on header click', async () => {
    const el = await mount<HTMLElement>(
      '<ody-collapsible-section header-text="More"></ody-collapsible-section>',
    );
    const events: boolean[] = [];
    el.addEventListener('expanded', (e) => {
      events.push((e as CustomEvent).detail.expanded);
    });
    el.querySelector<HTMLElement>('.ody-collapsible__header')!.click();
    expect(el.hasAttribute('expanded')).toBe(true);
    expect(el.querySelector('.ody-collapsible__header')!.getAttribute('aria-expanded')).toBe('true');
    el.querySelector<HTMLElement>('.ody-collapsible__header')!.click();
    expect(el.hasAttribute('expanded')).toBe(false);
    expect(events).toEqual([true, false]);
  });

  it('ignores clicks outside the header and starts expanded when set', async () => {
    const el = await mount<HTMLElement>(
      '<ody-collapsible-section header-text="More" expanded>' +
        '<ody-collapsible-content>Body</ody-collapsible-content>' +
      '</ody-collapsible-section>',
    );
    expect(el.querySelector('.ody-collapsible-section--expanded')).not.toBeNull();
    let fired = false;
    el.addEventListener('expanded', () => {
      fired = true;
    });
    el.querySelector('.ody-collapsible__content')!.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    expect(fired).toBe(false);
    el.remove();
  });
});
