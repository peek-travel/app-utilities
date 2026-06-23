import { OdyElement, classes, define } from '../base.js';

/** Colour tone for a stat's value. */
export type OdyStatTone = 'default' | 'success' | 'warning';

/**
 * `<ody-stat-summary>` — a bordered card grouping a row of `<ody-stat>` figures.
 * For the optional detail strip, render an `<ody-stat-summary-detail>` as a
 * sibling immediately after it (see that component).
 *
 * Simplest usage — stats only:
 * ```html
 * <ody-stat-summary>
 *   <ody-stat label="Revenue" value="$1,200"></ody-stat>
 *   <ody-stat label="Bookings" value="34" tone="success"></ody-stat>
 * </ody-stat-summary>
 * ```
 */
export class OdyStatSummary extends OdyElement {
  protected render(): void {
    this.mount(
      `<div class="ody-stat-summary">` +
        `<div class="ody-stat-summary__stats" data-ody-slot></div>` +
      `</div>`,
    );
  }
}

/**
 * `<ody-stat>` — a single labelled figure inside an `<ody-stat-summary>`.
 *
 * Attributes:
 * - `label` — caption above the value.
 * - `value` — the prominent figure (falls back to child content if omitted).
 * - `sub` — small sub-text below the value.
 * - `tone` — `default` | `success` | `warning` (colours the value).
 */
export class OdyStat extends OdyElement {
  static observedAttributes = ['label', 'value', 'sub', 'tone'];

  protected render(): void {
    const label = this.attr('label');
    const value = this.attr('value');
    const sub = this.attr('sub');
    const tone = this.attr('tone', 'default') as OdyStatTone;

    const labelEl = label
      ? `<div class="ody-stat-summary__stat__label">${this.esc(label)}</div>`
      : '';
    const valueCls = classes(
      'ody-stat-summary__stat__value',
      tone !== 'default' && `ody-stat-summary__stat__value--${tone}`,
    );
    const valueEl = value
      ? `<div class="${valueCls}">${this.esc(value)}</div>`
      : `<div class="${valueCls}" data-ody-slot></div>`;
    const subEl = sub ? `<div class="ody-stat-summary__stat__sub">${this.esc(sub)}</div>` : '';

    this.mount(`<div class="ody-stat-summary__stat">${labelEl}${valueEl}${subEl}</div>`);
  }
}

/**
 * `<ody-stat-detail>` — a small key/value pair for the detail strip beneath a
 * stat summary. Place inside an `<ody-stat-summary-detail>` group.
 *
 * Attributes:
 * - `value` — the bold value text appended after the label (child content).
 */
export class OdyStatDetail extends OdyElement {
  static observedAttributes = ['value'];

  protected render(): void {
    const value = this.attr('value');
    const valueEl = value
      ? `<span class="ody-stat-summary__detail-item__value">${this.esc(value)}</span>`
      : '';
    this.mount(
      `<span class="ody-stat-summary__detail-item">` +
        `<span data-ody-slot></span>${valueEl}` +
      `</span>`,
    );
  }
}

/**
 * `<ody-stat-summary-detail>` — the optional detail strip rendered under a
 * `<ody-stat-summary>` (divider + a row of `<ody-stat-detail>` items). Place it
 * as a sibling after the stat summary.
 */
export class OdyStatSummaryDetail extends OdyElement {
  protected render(): void {
    this.mount(
      `<div class="ody-stat-summary__divider"></div>` +
      `<div class="ody-stat-summary__detail" data-ody-slot></div>`,
    );
  }
}

define('ody-stat-summary', OdyStatSummary);
define('ody-stat', OdyStat);
define('ody-stat-detail', OdyStatDetail);
define('ody-stat-summary-detail', OdyStatSummaryDetail);
