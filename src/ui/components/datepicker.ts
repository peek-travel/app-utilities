import { OdyElement, classes, define } from '../base.js';
import { resolveLang } from '../i18n.js';
import { iconSvg } from '../icons.js';

/** A preset shortcut shown beside the calendar. */
export interface OdyDatePreset {
  /** Button label. */
  label: string;
  /** `yyyy-mm-dd` (single) or `yyyy-mm-dd/yyyy-mm-dd` (range). */
  value: string;
}

/** Predicate disabling arbitrary days; assigned as a JS property. */
export type OdyDateDisallowed = (date: Date) => boolean;

/** Custom display formatter for the trigger label; assigned as a JS property. */
export type OdyDateFormatter = (date: Date) => string;

/** `display-format` keyword → `Intl.DateTimeFormat` `dateStyle`. */
export type OdyDateStyle = 'short' | 'medium' | 'long' | 'full';
const DATE_STYLES: readonly OdyDateStyle[] = ['short', 'medium', 'long', 'full'];

// 2023-01-01 is a Sunday — used as a reference week for localized weekday names.
const SUNDAY_REF = new Date(2023, 0, 1);

const RANGE_SEP = '/';
const DATE_ATTR = 'data-date';

const EVENT_CHANGE = 'change';

/**
 * Parse a `yyyy-mm-dd` string into a **local** `Date` (midnight local time).
 *
 * Never use `new Date(string)` — it parses `yyyy-mm-dd` as UTC, which drifts a
 * day in negative-offset timezones. Returns `null` for malformed input.
 */
export function parseLocalDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  // Reject overflow (e.g. Feb 31 rolling into March).
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

/** Format a local `Date` as `yyyy-mm-dd` without timezone drift. */
export function formatLocalDate(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Number of days in the given (1-based) month of `year`. */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Whether two dates fall on the same local calendar day. */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Add `days` to a copy of `date`, returning a new local `Date`. */
function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Add `months` to a copy of `date`, clamping the day to the target month. */
function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const max = daysInMonth(target.getFullYear(), target.getMonth() + 1);
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), max));
}

/**
 * `<ody-datepicker>` — a dependency-free calendar date picker following the
 * WAI-ARIA date-picker-dialog pattern. A tertiary trigger button toggles a
 * popover containing a `role="grid"` calendar with roving-tabindex keyboard
 * navigation. Uses native `Date` only (no date library).
 *
 * Attributes:
 * - `value` — selected date `yyyy-mm-dd`, or `start/end` in range mode.
 * - `min` / `max` — selectable bounds `yyyy-mm-dd` (inclusive).
 * - `range` — boolean; enables start/end range selection.
 * - `first-day-of-week` — `0`–`6` (0 = Sunday, default `0`).
 * - `placeholder` — trigger text shown when no value is selected.
 * - `presets` — JSON `[{ "label", "value" }]` shortcut buttons.
 * - `display-format` — how the selected date is shown to the user:
 *   `short` | `medium` (default) | `long` | `full`. The displayed text is
 *   localized via `Intl.DateTimeFormat` for the element's `lang`; the `value`
 *   attribute and `change` payload always stay machine-readable ISO `yyyy-mm-dd`.
 *
 * Properties:
 * - `isDateDisallowed?: (date: Date) => boolean` — disable arbitrary days.
 * - `formatDate?: (date: Date) => string` — full control of the trigger label.
 *
 * Calendar weekday/month names and day labels are localized via `Intl` for the
 * resolved `lang`. Dispatches a `change` {@link CustomEvent} on **user**
 * selection only (`{ value }` single, `{ value, start, end }` range, all ISO);
 * never on a programmatic `value` set.
 */
export class OdyDatePicker extends OdyElement {
  static observedAttributes = [
    'value', 'min', 'max', 'range', 'first-day-of-week', 'placeholder', 'presets',
    'display-format',
  ];

  /** Disable arbitrary days; not an attribute (functions can't serialize). */
  isDateDisallowed?: OdyDateDisallowed;

  /** Custom trigger-label formatter; wins over `display-format`/`Intl`. */
  formatDate?: OdyDateFormatter;

  #open = false;
  /** First day of the currently displayed month (local). */
  #viewDate = new Date();
  /** Day cell that currently holds `tabindex=0`. */
  #focusDate = new Date();
  /** In range mode, the pending start once the user picks the first endpoint. */
  #rangeStart: Date | null = null;

  // ---- value helpers -------------------------------------------------------

  #isRange(): boolean {
    return this.flag('range');
  }

  #firstDayOfWeek(): number {
    const n = Number(this.attr('first-day-of-week', '0'));
    return Number.isInteger(n) && n >= 0 && n <= 6 ? n : 0;
  }

  #minDate(): Date | null {
    return parseLocalDate(this.attr('min'));
  }

  #maxDate(): Date | null {
    return parseLocalDate(this.attr('max'));
  }

  /** The selected single date (single mode). */
  #selectedSingle(): Date | null {
    if (this.#isRange()) return null;
    return parseLocalDate(this.attr('value'));
  }

  /** The selected `[start, end]` (range mode); either may be `null`. */
  #selectedRange(): [Date | null, Date | null] {
    if (!this.#isRange()) return [null, null];
    const raw = this.attr('value');
    if (!raw) return [null, null];
    const [s, e] = raw.split(RANGE_SEP);
    return [parseLocalDate(s ?? ''), parseLocalDate(e ?? '')];
  }

  #parsePresets(): OdyDatePreset[] {
    const raw = this.attr('presets');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (p): p is OdyDatePreset =>
          Boolean(p) &&
          typeof (p as OdyDatePreset).label === 'string' &&
          typeof (p as OdyDatePreset).value === 'string',
      );
    } catch {
      return [];
    }
  }

  /** Whether `date` is outside min/max or rejected by `isDateDisallowed`. */
  #isDisabled(date: Date): boolean {
    const min = this.#minDate();
    const max = this.#maxDate();
    if (min && date < min) return true;
    if (max && date > max) return true;
    if (this.isDateDisallowed?.(date)) return true;
    return false;
  }

  /** Pick the day that should hold focus: selected, else today, else 1st. */
  #initialFocus(): Date {
    const [rs] = this.#selectedRange();
    const selected = this.#isRange() ? rs : this.#selectedSingle();
    if (selected) return selected;
    const today = new Date();
    const monthStart = new Date(this.#viewDate.getFullYear(), this.#viewDate.getMonth(), 1);
    if (today.getFullYear() === monthStart.getFullYear() && today.getMonth() === monthStart.getMonth()) {
      return today;
    }
    return monthStart;
  }

  /** The element's resolved BCP-47 language (nearest `lang` ancestor). */
  #locale(): string {
    return resolveLang(this);
  }

  /** `Intl` options derived from the `display-format` attribute. */
  #displayOptions(): Intl.DateTimeFormatOptions {
    const style = this.attr('display-format', 'medium') as OdyDateStyle;
    return { dateStyle: DATE_STYLES.includes(style) ? style : 'medium' };
  }

  /** Locale-aware display string for a single date (custom `formatDate` wins). */
  #formatDisplay(date: Date): string {
    if (this.formatDate) return this.formatDate(date);
    return new Intl.DateTimeFormat(this.#locale(), this.#displayOptions()).format(date);
  }

  /** Locale-aware display string for a date range. */
  #formatDisplayRange(a: Date, b: Date): string {
    if (this.formatDate) return `${this.formatDate(a)} – ${this.formatDate(b)}`;
    const fmt = new Intl.DateTimeFormat(this.#locale(), this.#displayOptions());
    // `formatRange` is locale-aware (Node 18+/modern browsers); fall back if absent.
    const range = (fmt as Intl.DateTimeFormat & {
      formatRange?: (start: Date, end: Date) => string;
    }).formatRange;
    return range ? range.call(fmt, a, b) : `${fmt.format(a)} – ${fmt.format(b)}`;
  }

  /** Human-readable trigger label for the current value. */
  #triggerLabel(): string {
    if (this.#isRange()) {
      const [s, e] = this.#selectedRange();
      if (s && e) return this.#formatDisplayRange(s, e);
      if (s) return this.#formatDisplay(s);
    } else {
      const single = this.#selectedSingle();
      if (single) return this.#formatDisplay(single);
    }
    return this.getAttribute('placeholder') ?? this.term('selectDate');
  }

  // ---- public-ish lifecycle ------------------------------------------------

  /** Whether the popover is currently shown. */
  get isOpen(): boolean {
    return this.#open;
  }

  /** Show the popover and focus the roving day. */
  openPopover(): void {
    if (this.#open) return;
    this.#open = true;
    // Anchor the view on the selected/start date if present.
    const [rs] = this.#selectedRange();
    const anchor = this.#isRange() ? rs : this.#selectedSingle();
    if (anchor) this.#viewDate = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    this.#rangeStart = null;
    this.#focusDate = this.#initialFocus();
    document.addEventListener('click', this.#onOutsideClick, true);
    this.render();
    this.#focusActiveDay();
  }

  /** Hide the popover. */
  closePopover(): void {
    if (!this.#open) return;
    this.#open = false;
    this.#rangeStart = null;
    document.removeEventListener('click', this.#onOutsideClick, true);
    this.render();
  }

  #focusActiveDay(): void {
    const cell = this.querySelector<HTMLElement>(`.ody-datepicker__day[tabindex="0"]`);
    cell?.focus();
  }

  // ---- selection -----------------------------------------------------------

  #commitSingle(date: Date): void {
    this.setAttribute('value', formatLocalDate(date));
    this.dispatchEvent(
      new CustomEvent(EVENT_CHANGE, { detail: { value: formatLocalDate(date) }, bubbles: true }),
    );
  }

  #commitRange(start: Date, end: Date): void {
    const [a, b] = start <= end ? [start, end] : [end, start];
    const value = `${formatLocalDate(a)}${RANGE_SEP}${formatLocalDate(b)}`;
    this.setAttribute('value', value);
    this.dispatchEvent(
      new CustomEvent(EVENT_CHANGE, {
        detail: { value, start: formatLocalDate(a), end: formatLocalDate(b) },
        bubbles: true,
      }),
    );
  }

  #selectDay(date: Date): void {
    if (this.#isDisabled(date)) return;
    if (this.#isRange()) {
      if (this.#rangeStart === null) {
        // First click: begin a new range; clear any prior value.
        this.#rangeStart = date;
        this.removeAttribute('value');
        this.#focusDate = date;
        this.render();
        this.#focusActiveDay();
      } else {
        this.#commitRange(this.#rangeStart, date);
        this.#rangeStart = null;
        this.closePopover();
        this.#focusTrigger();
      }
    } else {
      this.#commitSingle(date);
      this.closePopover();
      this.#focusTrigger();
    }
  }

  #focusTrigger(): void {
    this.querySelector<HTMLElement>('.ody-datepicker__trigger')?.focus();
  }

  // ---- event handlers ------------------------------------------------------

  #onOutsideClick = (e: MouseEvent): void => {
    if (this.contains(e.target as Node)) return;
    this.closePopover();
  };

  #onTriggerClick = (): void => {
    if (this.#open) this.closePopover();
    else this.openPopover();
  };

  #onPrevMonth = (): void => {
    this.#viewDate = addMonths(this.#viewDate, -1);
    this.render();
  };

  #onNextMonth = (): void => {
    this.#viewDate = addMonths(this.#viewDate, 1);
    this.render();
  };

  #onDayClick = (e: Event): void => {
    const cell = e.currentTarget as HTMLElement;
    const date = parseLocalDate(cell.getAttribute(DATE_ATTR) ?? '');
    if (date) this.#selectDay(date); // cells always carry a valid data-date
  };

  #onPresetClick = (e: Event): void => {
    const btn = e.currentTarget as HTMLElement;
    const value = btn.getAttribute('data-value') ?? '';
    if (this.#isRange()) {
      const [s, e2] = value.split(RANGE_SEP);
      const start = parseLocalDate(s ?? '');
      const end = parseLocalDate(e2 ?? '');
      if (start && end) {
        this.#rangeStart = null;
        this.#commitRange(start, end);
        this.closePopover();
        this.#focusTrigger();
      }
    } else {
      const date = parseLocalDate(value);
      if (date) this.#selectDay(date);
    }
  };

  #onGridKeydown = (e: KeyboardEvent): void => {
    let next: Date | null = null;
    const cur = this.#focusDate;
    switch (e.key) {
      case 'ArrowLeft': next = addDays(cur, -1); break;
      case 'ArrowRight': next = addDays(cur, 1); break;
      case 'ArrowUp': next = addDays(cur, -7); break;
      case 'ArrowDown': next = addDays(cur, 7); break;
      case 'Home': next = addDays(cur, -((cur.getDay() - this.#firstDayOfWeek() + 7) % 7)); break;
      case 'End': next = addDays(cur, 6 - ((cur.getDay() - this.#firstDayOfWeek() + 7) % 7)); break;
      case 'PageUp': next = addMonths(cur, e.shiftKey ? -12 : -1); break;
      case 'PageDown': next = addMonths(cur, e.shiftKey ? 12 : 1); break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.#selectDay(cur);
        return;
      case 'Escape':
        e.preventDefault();
        this.closePopover();
        this.#focusTrigger();
        return;
      default:
        return;
    }
    e.preventDefault();
    this.#focusDate = next;
    this.#viewDate = new Date(next.getFullYear(), next.getMonth(), 1);
    this.render();
    this.#focusActiveDay();
  };

  // ---- rendering -----------------------------------------------------------

  #renderWeekdayHeader(): string {
    const first = this.#firstDayOfWeek();
    const locale = this.#locale();
    const shortFmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const longFmt = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    const cells: string[] = [];
    for (let i = 0; i < 7; i++) {
      const idx = (first + i) % 7;
      const ref = new Date(SUNDAY_REF.getFullYear(), 0, SUNDAY_REF.getDate() + idx);
      cells.push(
        `<th scope="col" abbr="${this.esc(longFmt.format(ref))}" class="ody-datepicker__weekday">` +
          `${this.esc(shortFmt.format(ref))}</th>`,
      );
    }
    return `<tr>${cells.join('')}</tr>`;
  }

  #renderWeeks(): string {
    const year = this.#viewDate.getFullYear();
    const month = this.#viewDate.getMonth();
    const first = this.#firstDayOfWeek();
    const total = daysInMonth(year, month + 1);
    const startWeekday = new Date(year, month, 1).getDay();
    const lead = (startWeekday - first + 7) % 7;

    const [rangeStartSel, rangeEndSel] = this.#selectedRange();
    const single = this.#selectedSingle();
    const today = new Date();
    const dayLabelFmt = new Intl.DateTimeFormat(this.#locale(), { dateStyle: 'full' });

    const rows: string[] = [];
    let cells: string[] = [];

    // Leading blanks before the 1st of the month.
    for (let i = 0; i < lead; i++) {
      cells.push('<td class="ody-datepicker__pad"></td>');
    }

    for (let day = 1; day <= total; day++) {
      const date = new Date(year, month, day);
      const disabled = this.#isDisabled(date);
      const isFocus = isSameDay(date, this.#focusDate);
      const isToday = isSameDay(date, today);

      // Selection state (single, range endpoints, in-progress range, between).
      let selected = false;
      let inRange = false;
      if (this.#isRange()) {
        const start = this.#rangeStart ?? rangeStartSel;
        const end = this.#rangeStart ? null : rangeEndSel;
        if (start && isSameDay(date, start)) selected = true;
        if (end && isSameDay(date, end)) selected = true;
        // A committed range is always stored start-before-end (see commitRange),
        // so the endpoints need no re-sorting here.
        if (start && end && date > start && date < end) inRange = true;
      } else if (single && isSameDay(date, single)) {
        selected = true;
      }

      const cls = classes(
        'ody-datepicker__day',
        selected && 'ody-datepicker__day--selected',
        inRange && 'ody-datepicker__day--in-range',
        isToday && !selected && 'ody-datepicker__day--today',
        disabled && 'ody-datepicker__day--disabled',
      );
      cells.push(
        `<td role="gridcell" class="${cls}" ${DATE_ATTR}="${formatLocalDate(date)}"` +
          ` tabindex="${isFocus ? '0' : '-1'}"` +
          ` aria-label="${this.esc(dayLabelFmt.format(date))}"` +
          ` aria-selected="${selected ? 'true' : 'false'}"` +
          `${disabled ? ' aria-disabled="true"' : ''}>${day}</td>`,
      );

      if (cells.length === 7) {
        rows.push(`<tr>${cells.join('')}</tr>`);
        cells = [];
      }
    }
    // Trailing blanks to complete the final week row.
    if (cells.length > 0) {
      while (cells.length < 7) cells.push('<td class="ody-datepicker__pad"></td>');
      rows.push(`<tr>${cells.join('')}</tr>`);
    }
    return rows.join('');
  }

  #renderPresets(): string {
    const presets = this.#parsePresets();
    if (presets.length === 0) return '';
    const buttons = presets
      .map(
        (p) =>
          `<button type="button" class="ody-datepicker__preset" data-value="${this.esc(p.value)}">` +
          `${this.esc(p.label)}</button>`,
      )
      .join('');
    return `<div class="ody-datepicker__presets">${buttons}</div>`;
  }

  #renderPopover(): string {
    const title = new Intl.DateTimeFormat(this.#locale(), {
      month: 'long',
      year: 'numeric',
    }).format(this.#viewDate);
    const nav =
      `<div class="ody-datepicker__nav">` +
        `<button type="button" class="ody-datepicker__nav-btn" data-nav="prev" aria-label="${this.localized('previous-month-label', 'previousMonth')}">` +
          `${iconSvg('chevron-left', 'icon__svg')}</button>` +
        `<span class="ody-datepicker__title" aria-live="polite">${this.esc(title)}</span>` +
        `<button type="button" class="ody-datepicker__nav-btn" data-nav="next" aria-label="${this.localized('next-month-label', 'nextMonth')}">` +
          `${iconSvg('chevron-right', 'icon__svg')}</button>` +
      `</div>`;

    const grid =
      `<table role="grid" class="ody-datepicker__grid" aria-label="${this.esc(title)}">` +
        `<thead>${this.#renderWeekdayHeader()}</thead>` +
        `<tbody>${this.#renderWeeks()}</tbody>` +
      `</table>`;

    return (
      `<div class="ody-datepicker__popover-container">` +
        `<div class="ody-datepicker__popover">` +
          `${this.#renderPresets()}` +
          `<div class="ody-datepicker__main">${nav}${grid}</div>` +
        `</div>` +
      `</div>`
    );
  }

  protected render(): void {
    const caret = this.#open ? 'chevron-up' : 'chevron-down';
    const trigger =
      `<button type="button" class="ody-datepicker__trigger" aria-haspopup="dialog"` +
        ` aria-expanded="${this.#open ? 'true' : 'false'}">` +
        `<span class="ody-datepicker__trigger-icon">${iconSvg('calendar', 'icon__svg')}</span>` +
        `<span class="ody-datepicker__trigger-label">${this.esc(this.#triggerLabel())}</span>` +
        `<span class="ody-datepicker__trigger-caret">${iconSvg(caret, 'icon__svg')}</span>` +
      `</button>`;

    this.mount(
      `<div class="ody-datepicker ${this.#open ? 'ody-datepicker--open' : ''}">` +
        `${trigger}${this.#open ? this.#renderPopover() : ''}` +
        `<span hidden data-ody-slot></span>` +
      `</div>`,
    );

    this.querySelector('.ody-datepicker__trigger')?.addEventListener('click', this.#onTriggerClick);
    if (!this.#open) return;

    this.querySelector('[data-nav="prev"]')?.addEventListener('click', this.#onPrevMonth);
    this.querySelector('[data-nav="next"]')?.addEventListener('click', this.#onNextMonth);
    for (const cell of this.querySelectorAll<HTMLElement>('.ody-datepicker__day')) {
      cell.addEventListener('click', this.#onDayClick);
    }
    for (const btn of this.querySelectorAll<HTMLElement>('.ody-datepicker__preset')) {
      btn.addEventListener('click', this.#onPresetClick);
    }
    this.querySelector('.ody-datepicker__grid')?.addEventListener(
      'keydown',
      this.#onGridKeydown as EventListener,
    );
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('click', this.#onOutsideClick, true);
  }
}

define('ody-datepicker', OdyDatePicker);
