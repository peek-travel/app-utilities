import { OdyElement, classes, define } from '../base.js';

/**
 * `<ody-breadcrumb>` — a breadcrumb trail. Compose with nested
 * `<ody-breadcrumb-item>` children; the wrapper renders the
 * `<nav><ol>` chrome and the items render the `<li>` rows.
 *
 * Example:
 * ```html
 * <ody-breadcrumb>
 *   <ody-breadcrumb-item><a href="/">Home</a></ody-breadcrumb-item>
 *   <ody-breadcrumb-item current>Details</ody-breadcrumb-item>
 * </ody-breadcrumb>
 * ```
 */
export class OdyBreadcrumb extends OdyElement {
  protected render(): void {
    this.mount(
      `<nav class="breadcrumbs" aria-label="${this.localized('aria-label', 'breadcrumb')}">` +
        `<ol class="breadcrumb" data-ody-slot></ol>` +
      `</nav>`,
    );
  }
}

/**
 * `<ody-breadcrumb-item>` — a single crumb. Label/link is the child content.
 *
 * Attributes:
 * - `current` — marks the active page (`aria-current="page"` + active style).
 */
export class OdyBreadcrumbItem extends OdyElement {
  static observedAttributes = ['current'];

  protected render(): void {
    const isCurrent = this.flag('current');
    const cls = classes('breadcrumb__item', isCurrent && 'active');
    const current = isCurrent ? ' aria-current="page"' : '';
    this.mount(`<li class="${cls}"${current} data-ody-slot></li>`);
  }
}

define('ody-breadcrumb', OdyBreadcrumb);
define('ody-breadcrumb-item', OdyBreadcrumbItem);
