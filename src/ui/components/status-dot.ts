import { OdyElement, classes, define } from '../base.js';

export type OdyStatusDotColor = 'green' | 'blue' | 'orange';

/**
 * `<ody-status-dot>` — a coloured dot with a label. Label is the child content.
 *
 * Attributes:
 * - `color` — `green` | `blue` | `orange` (default `green`).
 */
export class OdyStatusDot extends OdyElement {
  static observedAttributes = ['color'];

  protected render(): void {
    const dotClass = classes('status-dot', `status-dot--${this.attr('color', 'green')}`);
    this.mount(
      `<span class="status-dot-container">` +
        `<span class="${dotClass}"></span>` +
        `<span class="status-dot__label" data-ody-slot></span>` +
      `</span>`,
    );
  }
}

define('ody-status-dot', OdyStatusDot);
