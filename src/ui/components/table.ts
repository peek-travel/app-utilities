import { OdyElement, classes, define, escapeHtml } from '../base.js';
import { iconSvg } from '../icons.js';

/** Horizontal alignment for a column's header and cells. */
export type OdyTableAlign = 'left' | 'center' | 'right';

/** Active sort direction; `null` means unsorted. */
export type OdySortDirection = 'ascending' | 'descending' | null;

/** A single column definition (set as a JS property, never an attribute). */
export interface OdyTableColumn {
  /** Property key read from each row object. */
  key: string;
  /** Header text shown to the user. */
  label: string;
  /** Whether this column participates in sorting (requires the global `sortable`). */
  sortable?: boolean;
  /** Text alignment for the header and the column's cells (default `left`). */
  align?: OdyTableAlign;
  /**
   * Optional custom cell renderer. Receives a fresh per-cell content element and
   * the row object; populate the element however you like. When omitted the cell
   * shows the (HTML-escaped) string value of `row[key]`.
   */
  render?: (cellEl: HTMLElement, row: OdyTableRow) => void;
}

/** A row is an arbitrary record keyed by column `key`. */
export type OdyTableRow = Record<string, unknown>;

/** `detail` of the `sort-change` event. */
export interface OdyTableSortChangeDetail {
  key: string;
  direction: OdySortDirection;
}

/** `detail` of the `selection-change` event. */
export interface OdyTableSelectionChangeDetail {
  selected: OdyTableRow[];
}

/** `detail` of the `row-click` event. */
export interface OdyTableRowClickDetail {
  row: OdyTableRow;
  index: number;
}

const ALIGN_HEADER: Record<OdyTableAlign, string> = {
  left: '',
  center: 'ody-table__header-content--centered',
  right: 'ody-table__header-content--right',
};

const ALIGN_CELL: Record<OdyTableAlign, string> = {
  left: '',
  center: 'ody-table__cell-content--center',
  right: 'ody-table__cell-content--right',
};

const NEXT_DIRECTION: Record<'none' | 'ascending' | 'descending', OdySortDirection> = {
  none: 'ascending',
  ascending: 'descending',
  descending: null,
};

const DIRECTION_ICON: Record<'none' | 'ascending' | 'descending', string> = {
  none: 'arrow-up-down',
  ascending: 'chevron-up',
  descending: 'chevron-down',
};

const ATTR_SELECTABLE = 'selectable';
const ATTR_SORTABLE = 'sortable';
const ATTR_SORT_KEY = 'sort-key';
const ATTR_SORT_DIRECTION = 'sort-direction';
const ATTR_STICKY_HEADER = 'sticky-header';

const DIR_ASC = 'ascending';
const DIR_DESC = 'descending';

/**
 * `<ody-table>` — a lightweight, data-driven Odyssey data table that renders a
 * native `<table>` with sortable headers and an optional checkbox selection
 * column. Rich data is supplied through **JS properties** (`columns`, `data`),
 * not attributes; scalar configuration uses reflected attributes.
 *
 * Properties:
 * - `columns: OdyTableColumn[]` — column definitions. If omitted, columns are
 *   auto-generated from the keys of the first data row.
 * - `data: OdyTableRow[]` (alias `rows`) — the row objects to display.
 * - `selected: OdyTableRow[]` — read-only getter of the currently selected rows.
 *
 * Attributes:
 * - `selectable` — boolean; adds a leading checkbox column with a header
 *   select-all (indeterminate when only some rows are selected).
 * - `sortable` — boolean; globally enables sorting (per-column opt-in via
 *   `column.sortable`).
 * - `sort-key` — the column key currently sorted.
 * - `sort-direction` — `ascending` | `descending`.
 * - `sticky-header` — boolean; pins the header row while the body scrolls.
 *
 * Events (all `CustomEvent`, bubbling):
 * - `sort-change` — `{ key, direction }` after a header sort cycle.
 * - `selection-change` — `{ selected }` after the selection changes.
 * - `row-click` — `{ row, index }` when a body row is clicked.
 */
export class OdyTable extends OdyElement {
  static observedAttributes = [
    ATTR_SELECTABLE, ATTR_SORTABLE, ATTR_SORT_KEY, ATTR_SORT_DIRECTION, ATTR_STICKY_HEADER,
  ];

  #columns: OdyTableColumn[] = [];
  #data: OdyTableRow[] = [];
  #selected = new Set<OdyTableRow>();
  /** True once a property has been set, so we don't render before data arrives. */
  #ready = false;

  /** Column definitions; setting re-renders. */
  get columns(): OdyTableColumn[] {
    return this.#columns;
  }

  set columns(next: OdyTableColumn[]) {
    this.#columns = Array.isArray(next) ? next : [];
    this.#ready = true;
    this.render();
  }

  /** Row data; setting re-renders. */
  get data(): OdyTableRow[] {
    return this.#data;
  }

  set data(next: OdyTableRow[]) {
    this.#data = Array.isArray(next) ? next : [];
    // Drop selections for rows no longer present.
    for (const row of [...this.#selected]) {
      if (!this.#data.includes(row)) this.#selected.delete(row);
    }
    this.#ready = true;
    this.render();
  }

  /** Alias for {@link data}. */
  get rows(): OdyTableRow[] {
    return this.data;
  }

  set rows(next: OdyTableRow[]) {
    this.data = next;
  }

  /** The currently selected rows (read-only). */
  get selected(): OdyTableRow[] {
    return this.#data.filter((row) => this.#selected.has(row));
  }

  set selected(next: OdyTableRow[]) {
    this.#selected = new Set(Array.isArray(next) ? next : []);
    this.#ready = true;
    this.render();
  }

  /** Resolve the columns to render, auto-generating from the first row if needed. */
  #resolveColumns(): OdyTableColumn[] {
    if (this.#columns.length > 0) return this.#columns;
    const first = this.#data[0];
    if (!first) return [];
    return Object.keys(first).map((key) => ({ key, label: key }));
  }

  /** Apply client-side sorting (string/number aware), returning a new array. */
  #sortedData(): OdyTableRow[] {
    const key = this.attr(ATTR_SORT_KEY);
    const direction = this.attr(ATTR_SORT_DIRECTION);
    if (!key || (direction !== DIR_ASC && direction !== DIR_DESC)) return this.#data;

    const factor = direction === DIR_ASC ? 1 : -1;
    return [...this.#data].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av ?? '').localeCompare(String(bv ?? '')) * factor;
    });
  }

  protected render(): void {
    // Don't render until a property has been assigned (avoids an empty flash
    // before the consumer sets `columns`/`data` after upgrade).
    if (!this.#ready) return;

    const columns = this.#resolveColumns();
    const rows = this.#sortedData();
    const selectable = this.flag(ATTR_SELECTABLE);
    const sortable = this.flag(ATTR_SORTABLE);
    const stickyHeader = this.flag(ATTR_STICKY_HEADER);
    const sortKey = this.attr(ATTR_SORT_KEY);
    const sortDir = this.attr(ATTR_SORT_DIRECTION);

    const headerCells = columns.map((col) => this.#headerCell(col, sortable, stickyHeader, sortKey, sortDir));
    const selectAll = this.#selectAllState(rows);
    const checkHeader = selectable
      ? `<th class="${classes('ody-table__header', stickyHeader && 'ody-table__header--sticky-header')} ody-table__check">` +
          `<div class="ody-table__header-content ody-table__header-content--checkable" data-ody-select-all>` +
            this.#checkbox(selectAll === true, selectAll === null) +
          `</div>` +
        `</th>`
      : '';

    const bodyRows = rows.map((row, index) => this.#bodyRow(row, index, columns, selectable)).join('');

    this.mount(
      `<div class="ody-table-container">` +
        `<table class="ody-table">` +
          `<thead class="ody-table__head"><tr>${checkHeader}${headerCells.join('')}</tr></thead>` +
          `<tbody>${bodyRows}</tbody>` +
        `</table>` +
      `</div>`,
    );

    this.#wire(rows, columns, selectable, sortable);
  }

  #headerCell(
    col: OdyTableColumn,
    globalSortable: boolean,
    stickyHeader: boolean,
    sortKey: string,
    sortDir: string,
  ): string {
    const align = col.align ?? 'left';
    const canSort = globalSortable && col.sortable === true;
    const isSorted = canSort && sortKey === col.key && (sortDir === DIR_ASC || sortDir === DIR_DESC);
    const direction: 'none' | 'ascending' | 'descending' = isSorted
      ? (sortDir as 'ascending' | 'descending')
      : 'none';

    const cls = classes(
      'ody-table__header',
      canSort && 'ody-table__header--sortable',
      isSorted && 'ody-table__header--sorted',
      stickyHeader && 'ody-table__header--sticky-header',
    );
    const contentCls = classes('ody-table__header-content', ALIGN_HEADER[align]);
    const ariaSort = isSorted ? ` aria-sort="${sortDir}"` : '';
    const icon = canSort
      ? `<span class="icon icon--size-medium">${iconSvg(DIRECTION_ICON[direction], 'icon__svg')}</span>`
      : '';

    return (
      `<th class="${cls}"${ariaSort} data-key="${escapeHtml(col.key)}">` +
        `<div class="${contentCls}">` +
          `<span class="ody-table__header-label">${this.esc(col.label)}</span>${icon}` +
        `</div>` +
      `</th>`
    );
  }

  #bodyRow(row: OdyTableRow, index: number, columns: OdyTableColumn[], selectable: boolean): string {
    const checkCell = selectable
      ? `<td class="ody-table__data ody-table__check">` +
          `<div class="ody-table__cell-content ody-table__cell-content--checkable" data-ody-row-check>` +
            this.#checkbox(this.#selected.has(row), false) +
          `</div>` +
        `</td>`
      : '';

    const cells = columns
      .map((col) => {
        const align = col.align ?? 'left';
        const contentCls = classes('ody-table__cell-content', ALIGN_CELL[align]);
        // Custom renderers populate the cell after mount; native cells inline the
        // escaped value here.
        const inner = col.render ? '' : this.esc(String(row[col.key] ?? ''));
        return `<td class="ody-table__data"><div class="${contentCls}">${inner}</div></td>`;
      })
      .join('');

    return `<tr class="ody-table__row" data-row-index="${index}">${checkCell}${cells}</tr>`;
  }

  /** A standalone checkbox marked up like `<ody-checkbox>` (no nested upgrade needed). */
  #checkbox(checked: boolean, indeterminate: boolean): string {
    const wrapperCls = classes('ody-checkbox', checked && 'ody-checkbox--checked');
    const mark = indeterminate
      ? `<span class="ody-checkbox__mark">${iconSvg('minus', 'icon__svg')}</span>`
      : checked
        ? `<span class="ody-checkbox__mark">${iconSvg('check', 'icon__svg')}</span>`
        : '';
    return (
      `<div class="${wrapperCls}"><div class="ody-checkbox__container"><span class="ody-checkbox__box">` +
        `<input class="ody-checkbox__input ody-checkbox__input--size-small" type="checkbox"${checked ? ' checked' : ''} />` +
        mark +
      `</span></div></div>`
    );
  }

  /** `true` = all selected, `false` = none, `null` = some (indeterminate). */
  #selectAllState(rows: OdyTableRow[]): boolean | null {
    if (rows.length === 0) return false;
    const count = rows.filter((row) => this.#selected.has(row)).length;
    if (count === 0) return false;
    if (count === rows.length) return true;
    return null;
  }

  #wire(rows: OdyTableRow[], columns: OdyTableColumn[], selectable: boolean, sortable: boolean): void {
    if (sortable) {
      this.querySelectorAll<HTMLElement>('.ody-table__header--sortable[data-key]').forEach((th) => {
        const key = th.getAttribute('data-key')!;
        th.addEventListener('click', () => this.#onSort(key));
      });
    }

    const selectAll = this.querySelector<HTMLInputElement>('[data-ody-select-all] input');
    if (selectAll) {
      selectAll.indeterminate = this.#selectAllState(rows) === null;
      selectAll.addEventListener('change', () => this.#onSelectAll(rows));
    }

    // Custom cell renderers + per-row checkbox + row-click wiring.
    this.querySelectorAll<HTMLElement>('tbody .ody-table__row').forEach((tr) => {
      const index = Number(tr.getAttribute('data-row-index'));
      const row = rows[index];
      if (!row) return;

      if (selectable) {
        const input = tr.querySelector<HTMLInputElement>('[data-ody-row-check] input');
        input?.addEventListener('change', (event) => {
          event.stopPropagation();
          this.#onRowToggle(row, input.checked);
        });
      }

      const dataCells = tr.querySelectorAll<HTMLElement>('.ody-table__data:not(.ody-table__check)');
      columns.forEach((col, columnIndex) => {
        if (!col.render) return;
        const content = dataCells[columnIndex]?.querySelector<HTMLElement>('.ody-table__cell-content');
        if (content) col.render(content, row);
      });

      tr.addEventListener('click', () => {
        this.dispatchEvent(
          new CustomEvent<OdyTableRowClickDetail>('row-click', { detail: { row, index }, bubbles: true }),
        );
      });
    });
  }

  #onSort(key: string): void {
    const current: 'none' | 'ascending' | 'descending' =
      this.attr(ATTR_SORT_KEY) === key && (this.attr(ATTR_SORT_DIRECTION) === DIR_ASC || this.attr(ATTR_SORT_DIRECTION) === DIR_DESC)
        ? (this.attr(ATTR_SORT_DIRECTION) as 'ascending' | 'descending')
        : 'none';
    const next = NEXT_DIRECTION[current];

    if (next === null) {
      this.removeAttribute(ATTR_SORT_KEY);
      this.removeAttribute(ATTR_SORT_DIRECTION);
    } else {
      this.setAttribute(ATTR_SORT_KEY, key);
      this.setAttribute(ATTR_SORT_DIRECTION, next);
    }

    this.dispatchEvent(
      new CustomEvent<OdyTableSortChangeDetail>('sort-change', {
        detail: { key, direction: next },
        bubbles: true,
      }),
    );
    this.render();
  }

  #onSelectAll(rows: OdyTableRow[]): void {
    const allSelected = this.#selectAllState(rows) === true;
    if (allSelected) {
      for (const row of rows) this.#selected.delete(row);
    } else {
      for (const row of rows) this.#selected.add(row);
    }
    this.#emitSelection();
    this.render();
  }

  #onRowToggle(row: OdyTableRow, checked: boolean): void {
    if (checked) this.#selected.add(row);
    else this.#selected.delete(row);
    this.#emitSelection();
    this.render();
  }

  #emitSelection(): void {
    this.dispatchEvent(
      new CustomEvent<OdyTableSelectionChangeDetail>('selection-change', {
        detail: { selected: this.selected },
        bubbles: true,
      }),
    );
  }
}

define('ody-table', OdyTable);
