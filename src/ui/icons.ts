/**
 * Themeable inline-SVG icon library for the Odyssey Web Components.
 *
 * The bulk of the set is generated from the Odyssey design system's SVGs (the
 * `currentColor` icons — see `icons-data.ts` and `scripts/generate-icons.mjs`).
 * A handful of hand-drawn fallbacks below cover icon names the components rely
 * on that the Odyssey set names differently (chevrons, close, plus/minus, …);
 * the generated Odyssey art wins wherever the names overlap.
 *
 * Every icon inherits `currentColor`, so colour is controlled by CSS. Fixed
 * colour / branded icons live in the separate `brand-icons.ts` library.
 *
 * Consumers can register their own icons with {@link registerIcon}.
 */
import { THEMEABLE_ICONS } from './icons-data.js';

/** A registered icon: its `viewBox` and inner SVG markup. */
export interface OdyIconData {
  viewBox: string;
  body: string;
}

/** Hand-drawn fallbacks (24×24) for component-referenced names. */
const FALLBACKS: Record<string, string> = {
  'chevron-down': '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/>',
  'chevron-up': '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 15l6-6 6 6"/>',
  'chevron-right': '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/>',
  'chevron-left': '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6"/>',
  'arrow-up-down': '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 4v16M7 4L4 7M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3"/>',
  close: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18"/>',
  check: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4 10-10"/>',
  'check-filled': '<path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.2 14.2l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/>',
  info: '<path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>',
  warning: '<path fill="currentColor" d="M12 2L1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z"/>',
  danger: '<path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
  copy: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 9h10v10H9zM5 15H4V5h10v1"/>',
  search: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M11 11m-7 0a7 7 0 1014 0 7 7 0 10-14 0M21 21l-5-5"/>',
  spinner: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 3a9 9 0 109 9" opacity="0.9"/>',
  plus: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 5v14M5 12h14"/>',
  minus: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M5 12h14"/>',
  calendar: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 7a1 1 0 011-1h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7zM4 10h16M8 4v4M16 4v4"/>',
};

const DEFAULT_VIEWBOX = '0 0 24 24';

const ICONS: Record<string, OdyIconData> = {
  // Hand-drawn fallbacks first; the generated Odyssey set wins on name overlap.
  ...Object.fromEntries(
    Object.entries(FALLBACKS).map(([name, body]) => [name, { viewBox: DEFAULT_VIEWBOX, body }]),
  ),
  ...THEMEABLE_ICONS,
};

/** Register (or override) a named icon with raw inner-SVG markup. */
export function registerIcon(name: string, innerSvg: string, viewBox: string = DEFAULT_VIEWBOX): void {
  ICONS[name] = { viewBox, body: innerSvg };
}

/** Whether a named icon is known. */
export function hasIcon(name: string): boolean {
  return name in ICONS;
}

/** All registered themeable icon names, sorted. */
export function iconNames(): string[] {
  return Object.keys(ICONS).sort();
}

/** Build an `<svg>` string from icon data, using the icon's own viewBox. */
export function renderIconSvg(icon: OdyIconData, className = ''): string {
  const [, , w = '24', h = '24'] = icon.viewBox.split(' ');
  const cls = className ? ` class="${className}"` : '';
  return `<svg${cls} viewBox="${icon.viewBox}" width="${w}" height="${h}" aria-hidden="true" focusable="false">${icon.body}</svg>`;
}

/**
 * Render a named themeable icon as an `<svg>` string with the given class.
 * Unknown names yield an empty `<svg>` so layout is preserved without throwing.
 */
export function iconSvg(name: string, className = ''): string {
  return renderIconSvg(ICONS[name] ?? { viewBox: DEFAULT_VIEWBOX, body: '' }, className);
}
