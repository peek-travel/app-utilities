import { OdyElement, define } from '../base.js';

/** `<ody-divider>` — a 1px horizontal rule that fills its container width. */
export class OdyDivider extends OdyElement {
  protected render(): void {
    this.mount('<span class="ody-divider"></span>');
  }
}

define('ody-divider', OdyDivider);
