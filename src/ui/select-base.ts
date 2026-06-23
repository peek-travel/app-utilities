import { OdyElement, classes } from './base.js';
import { iconSvg } from './icons.js';

/** A selectable option for the dropdown components. */
export interface OdySelectOption {
  /** The value stored/emitted when the option is chosen. */
  value: string;
  /** The human-readable label shown in the list (defaults to `value`). */
  label: string;
  /** When true, the option is shown but cannot be selected. */
  disabled?: boolean;
}

let panelSeq = 0;

/**
 * Shared base for `<ody-dropdown-single>` and `<ody-dropdown-multi>`.
 *
 * Self-contains the popup panel (no dependency on `<ody-popover>`) so subclasses
 * fully control ARIA roles, `aria-activedescendant`, and keyboard handling per
 * the WAI-ARIA combobox / listbox patterns. Subclasses implement the selection
 * model (single value vs. value array) and the trigger / option rendering.
 */
export abstract class OdySelectBase extends OdyElement {
  /** Internal options backing store, kept in sync with the `options` attribute. */
  #options: OdySelectOption[] | null = null;

  /** Whether the popup panel is currently open. */
  protected open = false;

  /** Index of the active (virtually-focused) option, or -1 when none. */
  protected activeIndex = -1;

  /** Current search/filter query when `searchable`. */
  protected query = '';

  /** Stable id suffix used to wire up `aria-controls` / `aria-activedescendant`. */
  protected readonly uid = `ody-select-${(panelSeq += 1)}`;

  /** Typeahead buffer and its reset timer (printable-character matching). */
  #typeahead = '';
  #typeaheadTimer: ReturnType<typeof setTimeout> | null = null;

  /** Parsed `options`: the JS property wins, else the JSON attribute fallback. */
  get options(): OdySelectOption[] {
    return this.#options ?? parseOptions(this.attr('options'));
  }

  set options(next: OdySelectOption[]) {
    this.#options = Array.isArray(next) ? next : [];
    if (this.isRendered) this.render();
  }

  /** Whether the dropdown is disabled. */
  get disabled(): boolean {
    return this.flag('disabled');
  }

  /** Whether the filter input is shown. */
  protected get searchable(): boolean {
    return this.flag('searchable');
  }

  /** True once the first render has happened (so setters can re-render safely). */
  protected get isRendered(): boolean {
    return this.querySelector('[role="combobox"]') !== null;
  }

  /** Options after applying the current search query (case-insensitive). */
  protected get visibleOptions(): OdySelectOption[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.options;
    return this.options.filter((o) => o.label.toLowerCase().includes(q));
  }

  // ---- Subclass hooks ------------------------------------------------------

  /** Whether the given option value is currently selected. */
  protected abstract isSelected(value: string): boolean;

  /** Commit a user selection of `option`; subclass updates value + emits. */
  protected abstract commit(option: OdySelectOption): void;

  /** Whether choosing an option should close the panel (single yes, multi no). */
  protected abstract get closeOnSelect(): boolean;

  /** Build the trigger's inner content (label/placeholder/chips). */
  protected abstract triggerContent(): string;

  /** ARIA `aria-multiselectable` value for the listbox (`'true'`/`'false'`). */
  protected abstract get multiselectable(): boolean;

  // ---- Rendering -----------------------------------------------------------

  protected render(): void {
    const listId = `${this.uid}-listbox`;
    const isDisabled = this.disabled;
    const triggerCls = classes('ody-select__trigger', this.open && 'ody-select__trigger--open');
    const carat = iconSvg(this.open ? 'chevron-up' : 'chevron-down', 'icon__svg');
    const ariaLabel = this.attr('aria-label') || this.attr('label');

    const activeId = this.activeIndex >= 0 ? `${this.uid}-opt-${this.activeIndex}` : '';
    const searchLabel = this.getAttribute('search-placeholder') ?? this.term('search');
    const searchEl = this.searchable
      ? `<div class="ody-select__search">` +
          `<span class="ody-select__search-icon">${iconSvg('search', 'icon__svg')}</span>` +
          `<input class="ody-select__search-input" type="text" role="searchbox"` +
            ` placeholder="${this.esc(searchLabel)}"` +
            ` value="${this.esc(this.query)}" aria-label="${this.esc(searchLabel)}" />` +
        `</div>`
      : '';

    this.mount(
      `<div class="ody-select${isDisabled ? ' ody-select--disabled' : ''}">` +
        // Trigger is a `div[role=combobox]` (not a `<button>`): the WAI-ARIA
        // select-only combobox pattern, and it lets the multi-select chips use
        // real `<button>` remove controls — nested `<button>`s are invalid HTML
        // and the parser would eject them (and the chevron) below the box.
        `<div class="${triggerCls}" role="combobox" tabindex="${isDisabled ? '-1' : '0'}"` +
          ` aria-expanded="${this.open ? 'true' : 'false'}" aria-controls="${listId}"` +
          ` aria-haspopup="listbox"${ariaLabel ? ` aria-label="${this.esc(ariaLabel)}"` : ''}` +
          `${activeId ? ` aria-activedescendant="${activeId}"` : ''}${isDisabled ? ' aria-disabled="true"' : ''}>` +
          `<span class="ody-select__value">${this.triggerContent()}</span>` +
          `<span class="ody-select__carat">${carat}</span>` +
        `</div>` +
        `<div class="ody-select__panel${this.open ? ' ody-select__panel--open' : ''}">` +
          searchEl +
          `<ul class="ody-select__list" id="${listId}" role="listbox"` +
            ` aria-multiselectable="${this.multiselectable ? 'true' : 'false'}">` +
            this.#optionRows() +
          `</ul>` +
        `</div>` +
      `</div>`,
    );

    this.#wire();
  }

  /** Render the option `<li role="option">` rows for the visible options. */
  #optionRows(): string {
    const visible = this.visibleOptions;
    if (visible.length === 0) {
      return `<li class="ody-select__empty" role="presentation">${this.esc(this.term('noOptions'))}</li>`;
    }
    return visible
      .map((option, index) => {
        const selected = this.isSelected(option.value);
        const active = index === this.activeIndex;
        const cls = classes(
          'ody-option',
          'ody-select__option',
          selected && 'ody-option--selected',
          option.disabled && 'ody-option--disabled',
          active && 'ody-select__option--active',
        );
        const check = this.multiselectable
          ? `<span class="ody-select__check">${selected ? iconSvg('check', 'icon__svg') : ''}</span>`
          : selected
            ? `<span class="ody-select__check">${iconSvg('check', 'icon__svg')}</span>`
            : `<span class="ody-select__check"></span>`;
        return (
          `<li class="${cls}" id="${this.uid}-opt-${index}" role="option"` +
            ` aria-selected="${selected ? 'true' : 'false'}"` +
            `${option.disabled ? ' aria-disabled="true"' : ''} data-index="${index}">` +
            check +
            `<span class="ody-select__option-label">${this.esc(option.label)}</span>` +
          `</li>`
        );
      })
      .join('');
  }

  /** Attach DOM + document listeners after each render. */
  #wire(): void {
    this.querySelector('[role="combobox"]')?.addEventListener('click', this.#onTriggerClick);
    this.querySelector('[role="combobox"]')?.addEventListener('keydown', this.#onKeydown as EventListener);

    for (const li of this.querySelectorAll<HTMLLIElement>('.ody-select__option')) {
      li.addEventListener('click', this.#onOptionClick);
    }

    const search = this.querySelector<HTMLInputElement>('.ody-select__search-input');
    if (search) {
      search.addEventListener('input', this.#onSearchInput);
      search.addEventListener('keydown', this.#onKeydown as EventListener);
      // Keep focus in the search box while the panel is open.
      if (this.open) queueMicrotask(() => search.focus());
    }
  }

  // ---- Panel open/close ----------------------------------------------------

  /** Open the panel and start listening for outside clicks. */
  protected openPanel(): void {
    if (this.open || this.disabled) return;
    this.open = true;
    if (this.activeIndex < 0) this.activeIndex = this.#firstSelectableIndex();
    this.render();
    document.addEventListener('click', this.#onOutsideClick, true);
  }

  /** Close the panel; optionally restore focus to the trigger. */
  protected closePanel(focusTrigger = false): void {
    if (!this.open) return;
    this.open = false;
    this.query = '';
    this.render();
    document.removeEventListener('click', this.#onOutsideClick, true);
    if (focusTrigger) this.querySelector<HTMLElement>('[role="combobox"]')?.focus();
  }

  // ---- Event handlers ------------------------------------------------------

  readonly #onTriggerClick = (): void => {
    if (this.open) this.closePanel();
    else this.openPanel();
  };

  readonly #onOptionClick = (event: Event): void => {
    const li = (event.currentTarget as HTMLElement);
    const index = Number(li.dataset.index);
    const option = this.visibleOptions[index];
    if (!option || option.disabled) return;
    this.activeIndex = index;
    this.commit(option);
    if (this.closeOnSelect) this.closePanel(true);
    else this.render();
  };

  readonly #onSearchInput = (event: Event): void => {
    this.query = (event.target as HTMLInputElement).value;
    this.activeIndex = this.#firstSelectableIndex();
    this.render();
  };

  readonly #onOutsideClick = (event: MouseEvent): void => {
    if (!this.contains(event.target as Node)) this.closePanel();
  };

  readonly #onKeydown = (event: KeyboardEvent): void => {
    const key = event.key;

    if (!this.open) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        this.openPanel();
        return;
      }
      return;
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        this.#move(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.#move(-1);
        return;
      case 'Home':
        event.preventDefault();
        this.#moveTo(this.#firstSelectableIndex());
        return;
      case 'End':
        event.preventDefault();
        this.#moveTo(this.#lastSelectableIndex());
        return;
      case 'Enter':
        event.preventDefault();
        this.#chooseActive(true);
        return;
      case ' ':
        // Space toggles only when not typing in the search box.
        if (this.searchable && event.target instanceof HTMLInputElement) return;
        event.preventDefault();
        this.#chooseActive(true);
        return;
      case 'Escape':
        event.preventDefault();
        this.closePanel(true);
        return;
      case 'Tab':
        this.closePanel();
        return;
      default:
        if (!this.searchable && isPrintable(event)) this.#typeaheadMatch(key);
    }
  };

  // ---- Keyboard helpers ----------------------------------------------------

  #move(delta: number): void {
    const options = this.visibleOptions;
    if (options.length === 0) return;
    let next = this.activeIndex;
    for (let i = 0; i < options.length; i += 1) {
      next = (next + delta + options.length) % options.length;
      if (!options[next]?.disabled) break;
    }
    this.#moveTo(next);
  }

  #moveTo(index: number): void {
    if (index < 0) return;
    this.activeIndex = index;
    this.render();
    this.querySelector(`#${this.uid}-opt-${index}`)?.scrollIntoView({ block: 'nearest' });
  }

  #chooseActive(focusTrigger: boolean): void {
    const option = this.visibleOptions[this.activeIndex];
    if (!option || option.disabled) return;
    this.commit(option);
    if (this.closeOnSelect) this.closePanel(focusTrigger);
    else this.render();
  }

  #firstSelectableIndex(): number {
    return this.visibleOptions.findIndex((o) => !o.disabled);
  }

  #lastSelectableIndex(): number {
    const options = this.visibleOptions;
    for (let i = options.length - 1; i >= 0; i -= 1) {
      if (!options[i]?.disabled) return i;
    }
    return -1;
  }

  #typeaheadMatch(char: string): void {
    this.#typeahead += char.toLowerCase();
    if (this.#typeaheadTimer) clearTimeout(this.#typeaheadTimer);
    this.#typeaheadTimer = setTimeout(() => {
      this.#typeahead = '';
    }, 500);
    const options = this.visibleOptions;
    const match = options.findIndex(
      (o) => !o.disabled && o.label.toLowerCase().startsWith(this.#typeahead),
    );
    if (match >= 0) this.#moveTo(match);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('click', this.#onOutsideClick, true);
    if (this.#typeaheadTimer) clearTimeout(this.#typeaheadTimer);
  }
}

/** Parse a JSON options string into a typed list, tolerating bad input. */
export function parseOptions(raw: string): OdySelectOption[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is OdySelectOption =>
        typeof entry === 'object' && entry !== null && 'value' in entry)
      .map((entry) => ({
        value: String(entry.value),
        label: String(entry.label ?? entry.value),
        disabled: entry.disabled === true,
      }));
  } catch {
    return [];
  }
}

/** Whether a keydown event represents a single printable character. */
function isPrintable(event: KeyboardEvent): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
}
