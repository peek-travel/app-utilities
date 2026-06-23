// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest';
import '../../src/ui/components/check-in-status.js';
import '../../src/ui/components/breadcrumb.js';
import '../../src/ui/components/input.js';
import { registerTranslation, resolveLang, translate } from '../../src/ui/i18n.js';

async function mount<T extends Element = Element>(html: string): Promise<T> {
  document.body.innerHTML = html;
  await Promise.resolve();
  return document.body.firstElementChild as T;
}

afterEach(() => {
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('lang');
});

describe('translate', () => {
  it('returns English defaults and the key for unknown keys', () => {
    expect(translate('en', 'close')).toBe('Close');
    // @ts-expect-error — exercising the unknown-key fallback path
    expect(translate('en', 'nope')).toBe('nope');
  });

  it('uses a registered bundle and falls back region → base → en', () => {
    registerTranslation('es', { close: 'Cerrar' });
    expect(translate('es', 'close')).toBe('Cerrar');
    expect(translate('ES', 'close')).toBe('Cerrar'); // case-insensitive
    expect(translate('es-MX', 'close')).toBe('Cerrar'); // region → base
    expect(translate('es', 'clear')).toBe('Clear'); // unregistered key → en
    expect(translate('de', 'close')).toBe('Close'); // unknown lang → en
    expect(translate('', 'close')).toBe('Close'); // empty → default lang
  });

  it('merges on re-registration', () => {
    registerTranslation('fr', { close: 'Fermer' });
    registerTranslation('fr', { clear: 'Effacer' });
    expect(translate('fr', 'close')).toBe('Fermer');
    expect(translate('fr', 'clear')).toBe('Effacer');
  });
});

describe('resolveLang', () => {
  it('reads the nearest lang ancestor, else falls back to en', async () => {
    const el = await mount('<ody-check-in-status status="RETURNED"></ody-check-in-status>');
    expect(resolveLang(el)).toBe('en');
    document.documentElement.lang = 'es';
    expect(resolveLang(el)).toBe('es');
  });

  it('prefers a closer lang attribute', () => {
    document.body.innerHTML = '<div lang="fr"><span id="t"></span></div>';
    document.documentElement.lang = 'es';
    expect(resolveLang(document.getElementById('t')!)).toBe('fr');
  });
});

describe('component localization', () => {
  it('renders built-in strings in the active language', async () => {
    registerTranslation('es', { checkInReturned: 'Devuelto', breadcrumb: 'Migas', clear: 'Borrar' });
    document.documentElement.lang = 'es';
    const status = await mount('<ody-check-in-status status="RETURNED"></ody-check-in-status>');
    expect(status.querySelector('.check-in-status__inner-content__status-label')!.textContent).toBe('Devuelto');
    const crumb = await mount('<ody-breadcrumb></ody-breadcrumb>');
    expect(crumb.querySelector('nav')!.getAttribute('aria-label')).toBe('Migas');
  });

  it('re-renders when a bundle is registered after mount', async () => {
    document.documentElement.lang = 'it';
    const status = await mount('<ody-check-in-status status="RETURNED"></ody-check-in-status>');
    expect(status.querySelector('.check-in-status__inner-content__status-label')!.textContent).toBe('Returned');
    registerTranslation('it', { checkInReturned: 'Restituito' });
    expect(status.querySelector('.check-in-status__inner-content__status-label')!.textContent).toBe('Restituito');
  });

  it('re-renders when the document lang attribute changes', async () => {
    registerTranslation('pt', { checkInReturned: 'Devolvido' });
    const status = await mount('<ody-check-in-status status="RETURNED"></ody-check-in-status>');
    expect(status.querySelector('.check-in-status__inner-content__status-label')!.textContent).toBe('Returned');
    document.documentElement.lang = 'pt';
    await new Promise((r) => setTimeout(r, 0)); // let the MutationObserver fire
    expect(status.querySelector('.check-in-status__inner-content__status-label')!.textContent).toBe('Devolvido');
  });

  it('lets a per-instance attribute override the term', async () => {
    registerTranslation('es', { checkInReturned: 'Devuelto' });
    document.documentElement.lang = 'es';
    const status = await mount('<ody-check-in-status status="RETURNED" label="Custom"></ody-check-in-status>');
    expect(status.querySelector('.check-in-status__inner-content__status-label')!.textContent).toBe('Custom');
    const crumb = await mount('<ody-breadcrumb aria-label="Trail"></ody-breadcrumb>');
    expect(crumb.querySelector('nav')!.getAttribute('aria-label')).toBe('Trail');
  });

  it('stops reacting once detached (no throw on later registration)', async () => {
    const status = await mount('<ody-check-in-status status="RETURNED"></ody-check-in-status>');
    status.remove();
    expect(() => registerTranslation('es', { checkInReturned: 'Devuelto' })).not.toThrow();
  });
});
