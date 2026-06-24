/**
 * Small, framework-agnostic overlay utilities shared by the floating Odyssey
 * components (modal, popover, tooltip, panel, toast). The Ember addon relied on
 * `in-element` / `ember-basic-dropdown`; here we re-implement the two things
 * those gave us — portaling a node to `document.body` and computing a
 * placement next to an anchor — with a few lines of vanilla DOM.
 */

/** Placement of a floating element relative to its anchor. */
export type OdyPlacement = 'top' | 'bottom' | 'left' | 'right';

/** A `top`/`left` pair (in `px`, document-relative) plus the resolved placement. */
export interface OdyPosition {
  top: number;
  left: number;
  placement: OdyPlacement;
}

/**
 * Append `node` to `document.body` so it escapes any clipping/stacking ancestor.
 * No-op (returns the node) if the node is already a direct child of `body`.
 */
export function portal<T extends Node>(node: T): T {
  if (node.parentNode !== document.body) document.body.appendChild(node);
  return node;
}

/** Remove a previously {@link portal}ed node from the DOM if it is still attached. */
export function removePortal(node: Node): void {
  if (node.parentNode) node.parentNode.removeChild(node);
}

/**
 * Compute the `top`/`left` (page coordinates, including scroll offset) for a
 * `floating` element placed at `placement` relative to `anchor`. The floating
 * element is centred along the cross axis. If the requested placement would push
 * the element off the viewport edge, it flips to the opposite side (a single,
 * basic flip — `top`↔`bottom`, `left`↔`right`).
 *
 * Both elements must already be in the DOM so their rects can be measured;
 * portal the floating element first, then position it.
 *
 * @param gap Pixels between the anchor and the floating element (default `8`).
 */
export function position(
  anchor: Element,
  floating: Element,
  placement: OdyPlacement = 'bottom',
  gap = 8,
): OdyPosition {
  const a = anchor.getBoundingClientRect();
  const f = floating.getBoundingClientRect();
  const vw = window.innerWidth || Infinity;
  const vh = window.innerHeight || Infinity;

  let resolved = placement;

  // Flip to the opposite side if the preferred side doesn't fit in the viewport.
  if (placement === 'bottom' && a.bottom + gap + f.height > vh && a.top - gap - f.height >= 0) {
    resolved = 'top';
  } else if (placement === 'top' && a.top - gap - f.height < 0 && a.bottom + gap + f.height <= vh) {
    resolved = 'bottom';
  } else if (placement === 'right' && a.right + gap + f.width > vw && a.left - gap - f.width >= 0) {
    resolved = 'left';
  } else if (placement === 'left' && a.left - gap - f.width < 0 && a.right + gap + f.width <= vw) {
    resolved = 'right';
  }

  const scrollX = window.scrollX || 0;
  const scrollY = window.scrollY || 0;
  let top = 0;
  let left = 0;

  switch (resolved) {
    case 'top':
      top = a.top - f.height - gap;
      left = a.left + (a.width - f.width) / 2;
      break;
    case 'bottom':
      top = a.bottom + gap;
      left = a.left + (a.width - f.width) / 2;
      break;
    case 'left':
      top = a.top + (a.height - f.height) / 2;
      left = a.left - f.width - gap;
      break;
    case 'right':
      top = a.top + (a.height - f.height) / 2;
      left = a.right + gap;
      break;
  }

  return { top: top + scrollY, left: left + scrollX, placement: resolved };
}
