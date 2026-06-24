import { OdyElement, define } from '../base.js';

/**
 * `<ody-loading-bar>` — a horizontal progress bar.
 *
 * Attributes:
 * - `value` — fill percentage, clamped to 0–100 (default 0).
 * - `color` — CSS colour for the fill (default interaction-300).
 * - `label` — optional caption shown above the bar with the percentage.
 */
export class OdyLoadingBar extends OdyElement {
  static observedAttributes = ['value', 'color', 'label'];

  protected render(): void {
    const raw = Number.parseFloat(this.attr('value', '0'));
    const value = Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0;
    const color = this.attr('color') || 'var(--color-interaction-300)';
    const label = this.attr('label');
    const text = label
      ? `<div class="loading-bar__text-container">` +
          `<span>${this.esc(label)}</span><span>${value}%</span>` +
        `</div>`
      : '';

    this.mount(
      `<div class="loading-bar-container"><div class="loading-bar">${text}` +
        `<div class="loading-bar__progress-container">` +
          `<div class="loading-bar__progress" style="width:${value}%;background-color:${this.esc(color)}"></div>` +
        `</div>` +
      `</div></div>`,
    );
  }
}

define('ody-loading-bar', OdyLoadingBar);
