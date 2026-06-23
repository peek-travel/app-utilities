import { OdyElement, classes, define } from '../base.js';
import { iconSvg } from '../icons.js';
import type { OdyTermKey } from '../i18n.js';

/**
 * Fulfillment / check-in status values (ported from the Ember
 * `FulfillmentStatus` enum on the check-in-status component).
 */
export type OdyCheckInStatusValue =
  | 'IN_PROGRESS' | 'NO_SHOW' | 'NONE' | 'OVERDUE' | 'RESERVED' | 'RETURNED';

interface StatusMeta {
  icon: string;
  color: string;
  /** Localized term key for the default label. */
  term: OdyTermKey;
}

const STATUS_META: Record<OdyCheckInStatusValue, StatusMeta> = {
  IN_PROGRESS: { icon: 'spinner', color: 'var(--color-info-300)', term: 'checkInInProgress' },
  NO_SHOW: { icon: 'close', color: 'var(--color-danger-300)', term: 'checkInNoShow' },
  OVERDUE: { icon: 'warning', color: 'var(--color-warning-300)', term: 'checkInOverdue' },
  RESERVED: { icon: 'info', color: 'var(--color-neutral-300)', term: 'checkInReserved' },
  RETURNED: { icon: 'check-filled', color: 'var(--color-success-300)', term: 'checkInReturned' },
  NONE: { icon: 'info', color: 'var(--color-neutral-300)', term: 'checkInNone' },
};

const DEFAULT_STATUS: OdyCheckInStatusValue = 'RESERVED';

/**
 * `<ody-check-in-status>` — a status dot/icon with a label and optional
 * secondary text. The `status` attribute selects an icon, colour and default
 * label; an explicit `label` overrides the mapped label.
 *
 * Attributes:
 * - `status` — one of the `OdyCheckInStatusValue` values (default `RESERVED`).
 * - `label` — overrides the status's default label.
 * - `optional-text` — optional secondary line below the label.
 */
export class OdyCheckInStatus extends OdyElement {
  static observedAttributes = ['status', 'label', 'optional-text'];

  protected render(): void {
    const status = this.attr('status', DEFAULT_STATUS) as OdyCheckInStatusValue;
    const meta = STATUS_META[status] ?? STATUS_META[DEFAULT_STATUS];
    const label = this.attr('label') || this.term(meta.term);
    const optional = this.attr('optional-text');
    const optionalEl = optional
      ? `<div class="check-in-status__inner-content__optional-text">${this.esc(optional)}</div>`
      : '';

    this.mount(
      `<div class="check-in-status-container">` +
        `<div class="check-in-status">` +
          `<span class="icon" style="color:${meta.color}">${iconSvg(meta.icon, 'icon__svg')}</span>` +
          `<div class="check-in-status__inner-content">` +
            `<div class="${classes('check-in-status__inner-content__status-label')}">${this.esc(label)}</div>` +
            optionalEl +
          `</div>` +
        `</div>` +
      `</div>`,
    );
  }
}

define('ody-check-in-status', OdyCheckInStatus);
