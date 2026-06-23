import { OdyElement, classes, define } from '../base.js';

export interface OdyTabDef {
  id: string;
  label: string;
  disabled?: boolean;
}

export type OdyTabsSize = 'base' | 'small';
export type OdyTabsPosition = 'top' | 'left';

/**
 * `<ody-tabs>` — a horizontal tab list. Tabs are supplied as a JSON array via
 * the `tabs` attribute, e.g. `tabs='[{"id":"a","label":"A"}]'`. The active tab
 * is tracked in the `active` attribute; clicking a tab updates it and
 * dispatches a `change` CustomEvent with `{ id }`.
 *
 * Attributes:
 * - `tabs` — JSON array of `{ id, label, disabled? }`.
 * - `active` — id of the active tab (reflected, defaults to the first tab).
 * - `size` — `base` | `small` (default `base`).
 * - `position` — `top` | `left` (default `top`).
 */
export class OdyTabs extends OdyElement {
  static observedAttributes = ['tabs', 'active', 'size', 'position'];

  #parseTabs(): OdyTabDef[] {
    const raw = this.attr('tabs');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((t): t is OdyTabDef => Boolean(t) && typeof (t as OdyTabDef).id === 'string');
    } catch {
      return [];
    }
  }

  protected render(): void {
    const tabs = this.#parseTabs();
    const size = this.attr('size', 'base');
    const active = this.attr('active') || (tabs[0]?.id ?? '');
    const listCls = classes('tab-list', this.attr('position') === 'left' && 'tab-list--left');

    const items = tabs
      .map((t) => {
        const isActive = t.id === active;
        const cls = classes(
          'tab-item', `tab-item--size-${size}`,
          isActive && 'tab-item--active',
          t.disabled && 'tab-item--disabled',
        );
        return (
          `<button type="button" role="tab" class="${cls}" data-tab-id="${this.esc(t.id)}"` +
            ` aria-selected="${isActive ? 'true' : 'false'}"${t.disabled ? ' disabled' : ''}>` +
            `${this.esc(t.label)}` +
          `</button>`
        );
      })
      .join('');

    this.mount(`<div class="${listCls}" role="tablist">${items}</div>`);

    for (const btn of this.querySelectorAll<HTMLElement>('.tab-item')) {
      btn.addEventListener('click', this.#onClick);
    }
  }

  readonly #onClick = (event: Event): void => {
    const btn = (event.currentTarget as HTMLElement);
    if (btn.hasAttribute('disabled')) return;
    const id = btn.getAttribute('data-tab-id') ?? '';
    this.setAttribute('active', id);
    this.dispatchEvent(new CustomEvent('change', { detail: { id }, bubbles: true }));
  };
}

define('ody-tabs', OdyTabs);
