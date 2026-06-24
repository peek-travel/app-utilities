// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import '../../src/ui/components/icon.js';
import '../../src/ui/brand-icons.js';
import { hasIcon, iconNames, iconSvg, registerIcon } from '../../src/ui/icons.js';
import { brandIconNames, brandIconSvg, hasBrandIcon } from '../../src/ui/brand-icons.js';

async function mount<T extends Element = Element>(html: string): Promise<T> {
  document.body.innerHTML = html;
  await Promise.resolve();
  return document.body.firstElementChild as T;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('themeable icon library', () => {
  it('includes the generated Odyssey set plus hand-drawn fallbacks', () => {
    const names = iconNames();
    expect(names.length).toBeGreaterThan(100);
    expect(hasIcon('user')).toBe(true); // from the Odyssey set
    expect(hasIcon('chevron-down')).toBe(true); // hand-drawn fallback
    // sorted
    expect([...names].sort()).toEqual(names);
  });

  it('renders a themeable icon with its own viewBox and currentColor', () => {
    const svg = iconSvg('user', 'icon__svg');
    expect(svg).toContain('class="icon__svg"');
    expect(svg).toContain('viewBox="0 0 20 20"'); // Odyssey icons are 20×20
    expect(svg).toContain('currentColor');
    expect(svg).not.toContain('#'); // no baked colour
  });

  it('renders an empty svg for an unknown name', () => {
    expect(iconSvg('nope')).toBe(
      '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"></svg>',
    );
  });

  it('registerIcon accepts a custom viewBox', () => {
    registerIcon('custom-x', '<rect/>', '0 0 32 32');
    expect(iconSvg('custom-x')).toContain('viewBox="0 0 32 32"');
    expect(iconSvg('custom-x')).toContain('<rect/>');
  });
});

describe('brand icon library', () => {
  it('exposes the fixed-colour Odyssey set, disjoint from themeable', () => {
    const names = brandIconNames();
    expect(names.length).toBeGreaterThan(40);
    expect(hasBrandIcon('arrow-down')).toBe(true);
    expect(hasIcon('arrow-down')).toBe(false); // brand-only (hardcoded colour)
  });

  it('keeps baked-in colours (not currentColor)', () => {
    const svg = brandIconSvg('arrow-down', 'icon__svg');
    expect(svg).toContain('class="icon__svg"');
    expect(svg.toLowerCase()).toContain('#'); // a hex colour is baked in
  });

  it('renders an empty svg for an unknown brand name', () => {
    expect(brandIconSvg('nope')).toContain('<svg');
    expect(brandIconSvg('nope')).toContain('></svg>');
  });
});

describe('ody-brand-icon element', () => {
  it('renders a sized brand icon', async () => {
    const el = await mount('<ody-brand-icon name="arrow-down" size="large"></ody-brand-icon>');
    expect(el.querySelector('.icon.icon--size-large .icon__svg')).not.toBeNull();
    expect(el.querySelector('.icon__svg')!.innerHTML.toLowerCase()).toContain('#');
  });

  it('defaults to base size and tolerates unknown names', async () => {
    const el = await mount('<ody-brand-icon name="does-not-exist"></ody-brand-icon>');
    expect(el.querySelector('.icon.icon--size-base')).not.toBeNull();
  });
});
