// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import {
  OdyTable,
  type OdyTableColumn,
  type OdyTableRow,
  type OdyTableSelectionChangeDetail,
  type OdyTableSortChangeDetail,
  type OdyTableRowClickDetail,
} from '../../src/ui/components/table.js';

/** Append an `<ody-table>`, optionally set props, then flush the deferred render. */
async function mountTable(
  setup?: (el: OdyTable) => void,
  attrs: Record<string, string> = {},
): Promise<OdyTable> {
  const el = document.createElement('ody-table') as OdyTable;
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
  document.body.appendChild(el);
  if (setup) setup(el);
  await Promise.resolve();
  return el;
}

const COLUMNS: OdyTableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'age', label: 'Age', sortable: true, align: 'right' },
  { key: 'city', label: 'City', align: 'center' },
];

function people(): OdyTableRow[] {
  return [
    { name: 'Charlie', age: 30, city: 'NYC' },
    { name: 'Alice', age: 42, city: 'LA' },
    { name: 'Bob', age: 25, city: 'SF' },
  ];
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ody-table rendering', () => {
  it('does not render before any property is set', async () => {
    const el = await mountTable();
    expect(el.querySelector('table')).toBeNull();
  });

  it('renders headers, rows and escaped cells from columns + data', async () => {
    const el = await mountTable((t) => {
      t.columns = COLUMNS;
      t.data = [{ name: '<b>X</b>', age: 1, city: 'Y' }];
    });
    expect(el.querySelector('.ody-table-container .ody-table')).not.toBeNull();
    const headers = el.querySelectorAll('thead .ody-table__header');
    expect(headers.length).toBe(3);
    expect(headers[0].textContent).toContain('Name');
    const cells = el.querySelectorAll('tbody .ody-table__data');
    expect(cells.length).toBe(3);
    // Value is HTML-escaped, not parsed as markup.
    expect(cells[0].querySelector('b')).toBeNull();
    expect(cells[0].textContent).toBe('<b>X</b>');
    // Alignment classes applied.
    expect(el.querySelectorAll('.ody-table__cell-content--right').length).toBe(1);
    expect(el.querySelectorAll('.ody-table__cell-content--center').length).toBe(1);
    expect(el.querySelectorAll('.ody-table__header-content--right').length).toBe(1);
    expect(el.querySelectorAll('.ody-table__header-content--centered').length).toBe(1);
  });

  it('auto-generates columns from the first row keys when columns omitted', async () => {
    const el = await mountTable((t) => {
      t.data = [{ name: 'A', age: 1 }];
    });
    const headers = [...el.querySelectorAll('thead .ody-table__header-label')].map((h) => h.textContent);
    expect(headers).toEqual(['name', 'age']);
  });

  it('renders empty (no columns) when data is empty and no columns given', async () => {
    const el = await mountTable((t) => {
      t.data = [];
    });
    expect(el.querySelectorAll('thead .ody-table__header').length).toBe(0);
    expect(el.querySelectorAll('tbody tr').length).toBe(0);
  });

  it('supports the rows alias and read-back getters', async () => {
    const el = await mountTable((t) => {
      t.columns = COLUMNS;
      t.rows = people();
    });
    expect(el.rows.length).toBe(3);
    expect(el.data.length).toBe(3);
    expect(el.columns.length).toBe(3);
    expect(el.querySelectorAll('tbody .ody-table__row').length).toBe(3);
  });

  it('coerces non-array property assignments to empty arrays', async () => {
    const el = await mountTable((t) => {
      // @ts-expect-error exercising the defensive branch
      t.columns = null;
      // @ts-expect-error exercising the defensive branch
      t.data = undefined;
      // @ts-expect-error exercising the defensive branch
      t.selected = null;
    });
    expect(el.columns).toEqual([]);
    expect(el.data).toEqual([]);
    expect(el.selected).toEqual([]);
  });
});

describe('ody-table custom render', () => {
  it('calls the column render callback with a fresh cell element and the row', async () => {
    const seen: OdyTableRow[] = [];
    const columns: OdyTableColumn[] = [
      {
        key: 'name',
        label: 'Name',
        render: (cell, row) => {
          seen.push(row);
          cell.innerHTML = `<a href="#">${String(row.name)}</a>`;
        },
      },
    ];
    const el = await mountTable((t) => {
      t.columns = columns;
      t.data = [{ name: 'Zoe' }];
    });
    expect(seen).toEqual([{ name: 'Zoe' }]);
    const link = el.querySelector('tbody a');
    expect(link).not.toBeNull();
    expect(link!.textContent).toBe('Zoe');
  });
});

describe('ody-table sorting', () => {
  it('cycles none -> ascending -> descending -> none, sets aria-sort on the active header only, and reorders data', async () => {
    const events: OdyTableSortChangeDetail[] = [];
    const el = await mountTable((t) => {
      t.columns = COLUMNS;
      t.data = people();
    }, { sortable: '' });
    el.addEventListener('sort-change', (e) => events.push((e as CustomEvent<OdyTableSortChangeDetail>).detail));

    const nameHeader = el.querySelector<HTMLElement>('thead .ody-table__header[data-key="name"]')!;

    // First click -> ascending.
    nameHeader.click();
    await Promise.resolve();
    expect(el.getAttribute('sort-direction')).toBe('ascending');
    let names = [...el.querySelectorAll('tbody tr .ody-table__data:first-child')].map((c) => c.textContent);
    expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
    const active = el.querySelector('thead .ody-table__header[data-key="name"]')!;
    expect(active.getAttribute('aria-sort')).toBe('ascending');
    expect(active.className).toContain('ody-table__header--sorted');
    // Only the active header carries aria-sort.
    expect(el.querySelectorAll('thead [aria-sort]').length).toBe(1);

    // Second click -> descending.
    el.querySelector<HTMLElement>('thead .ody-table__header[data-key="name"]')!.click();
    await Promise.resolve();
    expect(el.getAttribute('sort-direction')).toBe('descending');
    names = [...el.querySelectorAll('tbody tr .ody-table__data:first-child')].map((c) => c.textContent);
    expect(names).toEqual(['Charlie', 'Bob', 'Alice']);

    // Third click -> none (attributes removed, original order restored).
    el.querySelector<HTMLElement>('thead .ody-table__header[data-key="name"]')!.click();
    await Promise.resolve();
    expect(el.hasAttribute('sort-direction')).toBe(false);
    expect(el.hasAttribute('sort-key')).toBe(false);
    names = [...el.querySelectorAll('tbody tr .ody-table__data:first-child')].map((c) => c.textContent);
    expect(names).toEqual(['Charlie', 'Alice', 'Bob']);

    expect(events.map((e) => e.direction)).toEqual(['ascending', 'descending', null]);
    expect(events[0].key).toBe('name');
  });

  it('sorts numbers numerically and shows the unsorted arrow on sortable headers', async () => {
    const el = await mountTable((t) => {
      t.columns = COLUMNS;
      t.data = people();
    }, { sortable: '', 'sort-key': 'age', 'sort-direction': 'ascending' });

    const ages = [...el.querySelectorAll('tbody tr')].map((tr) => tr.querySelectorAll('.ody-table__data')[1].textContent);
    expect(ages).toEqual(['25', '30', '42']);
    // Non-active sortable header keeps the unsorted (arrow-up-down) affordance.
    const cityHeader = el.querySelector('thead .ody-table__header[data-key="city"]')!;
    expect(cityHeader.querySelector('.icon')).toBeNull(); // city is not sortable
  });

  it('sorts strings via localeCompare and treats missing values as empty strings', async () => {
    const el = await mountTable((t) => {
      t.columns = [{ key: 'city', label: 'City', sortable: true }];
      t.data = [{ city: 'NYC' }, { city: null }, { city: 'LA' }];
    }, { sortable: '', 'sort-key': 'city', 'sort-direction': 'ascending' });
    const cities = [...el.querySelectorAll('tbody .ody-table__data')].map((c) => c.textContent);
    // null -> '' sorts first, then LA, then NYC.
    expect(cities).toEqual(['', 'LA', 'NYC']);
  });

  it('renders an empty cell when the row value is null or undefined', async () => {
    const el = await mountTable((t) => {
      t.columns = [{ key: 'name', label: 'Name' }];
      t.data = [{ name: undefined }];
    });
    expect(el.querySelector('tbody .ody-table__data')!.textContent).toBe('');
  });

  it('ignores clicks on non-sortable headers and an invalid sort-direction value', async () => {
    const el = await mountTable((t) => {
      t.columns = COLUMNS;
      t.data = people();
    }, { sortable: '', 'sort-key': 'name', 'sort-direction': 'bogus' });
    // Invalid direction -> data left in original order.
    const names = [...el.querySelectorAll('tbody tr .ody-table__data:first-child')].map((c) => c.textContent);
    expect(names).toEqual(['Charlie', 'Alice', 'Bob']);
    // City header is not sortable -> no listener / no sort attributes change.
    expect(el.querySelector('.ody-table__header[data-key="city"]')!.className).not.toContain('sortable');
  });

  it('does not enable per-column sorting unless the global sortable attribute is set', async () => {
    const el = await mountTable((t) => {
      t.columns = COLUMNS;
      t.data = people();
    });
    expect(el.querySelectorAll('.ody-table__header--sortable').length).toBe(0);
  });
});

describe('ody-table selection', () => {
  it('renders a checkbox column, toggles per-row selection and emits selection-change', async () => {
    const events: OdyTableSelectionChangeDetail[] = [];
    const el = await mountTable((t) => {
      t.columns = COLUMNS;
      t.data = people();
    }, { selectable: '' });
    el.addEventListener('selection-change', (e) =>
      events.push((e as CustomEvent<OdyTableSelectionChangeDetail>).detail),
    );

    // Leading check header + check cell per row.
    expect(el.querySelector('thead .ody-table__check')).not.toBeNull();
    expect(el.querySelectorAll('tbody .ody-table__check').length).toBe(3);

    const firstRowCheck = el.querySelector<HTMLInputElement>('tbody .ody-table__row [data-ody-row-check] input')!;
    firstRowCheck.checked = true;
    firstRowCheck.dispatchEvent(new Event('change'));
    await Promise.resolve();

    expect(el.selected.length).toBe(1);
    expect(el.selected[0].name).toBe('Charlie');
    expect(events.at(-1)!.selected.length).toBe(1);

    // Header should now be indeterminate (partial selection).
    const headerInput = el.querySelector<HTMLInputElement>('[data-ody-select-all] input')!;
    expect(headerInput.indeterminate).toBe(true);

    // Untoggle.
    const rowCheckAgain = el.querySelector<HTMLInputElement>('tbody .ody-table__row [data-ody-row-check] input')!;
    rowCheckAgain.checked = false;
    rowCheckAgain.dispatchEvent(new Event('change'));
    await Promise.resolve();
    expect(el.selected.length).toBe(0);
  });

  it('select-all toggles every row and then clears, updating the header state', async () => {
    const el = await mountTable((t) => {
      t.columns = COLUMNS;
      t.data = people();
    }, { selectable: '' });

    const selectAll = () => el.querySelector<HTMLInputElement>('[data-ody-select-all] input')!;
    selectAll().dispatchEvent(new Event('change'));
    await Promise.resolve();
    expect(el.selected.length).toBe(3);
    expect(selectAll().checked).toBe(true);
    expect(selectAll().indeterminate).toBe(false);

    // Toggle again -> clears all.
    selectAll().dispatchEvent(new Event('change'));
    await Promise.resolve();
    expect(el.selected.length).toBe(0);
    expect(selectAll().checked).toBe(false);
  });

  it('drops selections for rows removed when data is reassigned', async () => {
    const rows = people();
    const el = await mountTable((t) => {
      t.columns = COLUMNS;
      t.data = rows;
      t.selected = [rows[0], rows[1]];
    }, { selectable: '' });
    expect(el.selected.length).toBe(2);
    // Reassign data keeping only the first row object.
    el.data = [rows[0]];
    await Promise.resolve();
    expect(el.selected.length).toBe(1);
    expect(el.selected[0]).toBe(rows[0]);
  });

  it('reports the select-all state as false when there are no rows', async () => {
    const el = await mountTable((t) => {
      t.columns = COLUMNS;
      t.data = [];
    }, { selectable: '' });
    const headerInput = el.querySelector<HTMLInputElement>('[data-ody-select-all] input')!;
    expect(headerInput.checked).toBe(false);
    expect(headerInput.indeterminate).toBe(false);
  });
});

describe('ody-table row-click + sticky', () => {
  it('emits row-click with the row and index', async () => {
    const rows = people();
    const events: OdyTableRowClickDetail[] = [];
    const el = await mountTable((t) => {
      t.columns = COLUMNS;
      t.data = rows;
    });
    el.addEventListener('row-click', (e) => events.push((e as CustomEvent<OdyTableRowClickDetail>).detail));

    el.querySelectorAll<HTMLElement>('tbody .ody-table__row')[1].click();
    expect(events.length).toBe(1);
    expect(events[0].index).toBe(1);
    expect(events[0].row).toBe(rows[1]);
  });

  it('applies the sticky-header class when the attribute is present', async () => {
    const el = await mountTable((t) => {
      t.columns = COLUMNS;
      t.data = people();
    }, { 'sticky-header': '', selectable: '' });
    expect(el.querySelectorAll('.ody-table__header--sticky-header').length).toBe(4);
  });

  it('re-renders when an observed attribute changes after the first render', async () => {
    const el = await mountTable((t) => {
      t.columns = COLUMNS;
      t.data = people();
    });
    expect(el.querySelector('thead .ody-table__check')).toBeNull();
    el.setAttribute('selectable', '');
    await Promise.resolve();
    expect(el.querySelector('thead .ody-table__check')).not.toBeNull();
  });
});

describe('ody-table type export', () => {
  it('exposes the OdyTable constructor', () => {
    expect(typeof OdyTable).toBe('function');
  });
});
