/**
 * Localization for the Odyssey Web Components' **built-in** strings (aria-labels,
 * default placeholders, status labels — not consumer-provided content).
 *
 * The active language is resolved from the DOM: a component reads the closest
 * ancestor `lang` attribute (so `<html lang="es">` localizes everything), with
 * fallback to English. Consumers register term bundles once:
 *
 * ```ts
 * import { registerTranslation } from '@peektravel/app-utilities/ui';
 * registerTranslation('es', { close: 'Cerrar', clear: 'Borrar', search: 'Buscar' });
 * ```
 *
 * A single instance can still be overridden with a per-instance attribute
 * (e.g. `<ody-panel close-label="Cerrar">`), which wins over the registry.
 */

/** The full set of built-in term keys. Bundles may provide any subset. */
export interface OdyTerms {
  close: string;
  clear: string;
  search: string;
  noOptions: string;
  previousMonth: string;
  nextMonth: string;
  selectDate: string;
  openSubMenu: string;
  toggleMenu: string;
  breadcrumb: string;
  radioGroup: string;
  toggleGroup: string;
  checkInInProgress: string;
  checkInNoShow: string;
  checkInOverdue: string;
  checkInReserved: string;
  checkInReturned: string;
  checkInNone: string;
}

export type OdyTermKey = keyof OdyTerms;

const DEFAULT_LANG = 'en';

/** The bundled English defaults (the fallback for every key). */
const EN: OdyTerms = {
  close: 'Close',
  clear: 'Clear',
  search: 'Search',
  noOptions: 'No options',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  selectDate: 'Select date',
  openSubMenu: 'Open sub-menu',
  toggleMenu: 'Toggle menu',
  breadcrumb: 'Breadcrumb',
  radioGroup: 'Radio button group',
  toggleGroup: 'Toggle button',
  checkInInProgress: 'In progress',
  checkInNoShow: 'No show',
  checkInOverdue: 'Overdue',
  checkInReserved: 'Reserved',
  checkInReturned: 'Returned',
  checkInNone: 'None',
};

const registry = new Map<string, Partial<OdyTerms>>([[DEFAULT_LANG, EN]]);
const listeners = new Set<() => void>();

const lower = (lang: string): string => lang.toLowerCase();

/**
 * Register (or extend) a translation bundle for a BCP-47 language code
 * (e.g. `'es'`, `'fr-CA'`). Re-registering merges into the existing bundle and
 * triggers a re-render of mounted components.
 */
export function registerTranslation(lang: string, terms: Partial<OdyTerms>): void {
  const code = lower(lang);
  registry.set(code, { ...registry.get(code), ...terms });
  notifyLocaleChange();
}

/**
 * Resolve a built-in term for the given language, falling back region → base
 * language → English → the key itself.
 */
export function translate(lang: string, key: OdyTermKey): string {
  const code = lower(lang || DEFAULT_LANG);
  const base = code.split('-')[0] ?? code;
  return registry.get(code)?.[key] ?? registry.get(base)?.[key] ?? EN[key] ?? key;
}

/** Resolve an element's language from the nearest `lang` ancestor, else `'en'`. */
export function resolveLang(el: Element): string {
  const owner = el.closest('[lang]');
  return (owner instanceof HTMLElement && owner.lang) || DEFAULT_LANG;
}

/** Subscribe to locale/registry changes; returns an unsubscribe function. */
export function onLocaleChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Notify all subscribers that the active locale or a bundle changed. */
export function notifyLocaleChange(): void {
  for (const fn of [...listeners]) fn();
}
