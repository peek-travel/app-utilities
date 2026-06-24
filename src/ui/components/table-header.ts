import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';

export type OdySortDirection = 'UNSET' | 'ASC' | 'DESC';

const NEXT_DIRECTION: Record<OdySortDirection, OdySortDirection> = {
  UNSET: 'DESC',
  DESC: 'ASC',
  ASC: 'UNSET',
};

const DIRECTION_ICON: Record<OdySortDirection, string> = {
  UNSET: 'arrow-up-down',
  DESC: 'chevron-down',
  ASC: 'chevron-up',
};

/**
 * `<ody-table-header>` — a sortable column header. Clicking cycles the sort
 * direction none → desc → asc → none and dispatches a `sort` CustomEvent with
 * `{ direction, columnId }`. The icon reflects the current direction.
 *
 * Attributes:
 * - `column-name` — the header text.
 * - `column-id` — passed through in the `sort` event detail.
 * - `direction` — current sort `UNSET` | `ASC` | `DESC` (reflected, default `UNSET`).
 * - `static` — boolean; renders a non-interactive header with no sort affordance.
 * - `rounded-left` / `rounded-right` — boolean; round the matching corners.
 */
export class OdyTableHeader extends OdyElement {
  static observedAttributes = ['column-name', 'column-id', 'direction', 'static', 'rounded-left', 'rounded-right'];

  #direction(): OdySortDirection {
    const raw = this.attr('direction', 'UNSET').toUpperCase();
    return raw === 'ASC' || raw === 'DESC' ? raw : 'UNSET';
  }

  protected render(): void {
    const name = this.esc(this.attr('column-name'));
    const roundedLeft = this.flag('rounded-left') && 'table-header-container--rounded-left';
    const roundedRight = this.flag('rounded-right') && 'table-header-container--rounded-right';

    if (this.flag('static')) {
      const cls = classes('table-header-container', 'table-header-container--static', roundedLeft, roundedRight);
      this.mount(`<div class="${cls}"><span class="table-header__text">${name}</span></div>`);
      return;
    }

    const direction = this.#direction();
    const active = direction !== 'UNSET';
    const cls = classes(
      'table-header-container', 'table-header-container--has-hover', roundedLeft, roundedRight,
      active && 'table-header-container--active',
    );

    this.mount(
      `<div class="${cls}" tabindex="0" role="button">` +
        `<div class="table-header__inner-content">` +
          `<div class="table-header__text">${name}</div>` +
          `<span class="icon icon--size-medium">${iconSvg(DIRECTION_ICON[direction], 'icon__svg')}</span>` +
        `</div>` +
      `</div>`,
    );

    this.querySelector('.table-header-container')?.addEventListener('click', this.#onClick);
  }

  readonly #onClick = (): void => {
    const next = NEXT_DIRECTION[this.#direction()];
    this.setAttribute('direction', next);
    this.dispatchEvent(
      new CustomEvent('sort', { detail: { direction: next, columnId: this.attr('column-id') }, bubbles: true }),
    );
  };
}

define('ody-table-header', OdyTableHeader);
