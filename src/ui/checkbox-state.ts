import { iconSvg } from './icons.js';

/**
 * Update an already-rendered `.ody-checkbox` root **in place** — its live
 * `<input>`, the `ody-checkbox--checked` class, and the check/minus mark — so a
 * selection change doesn't need a destructive re-render (which would replace the
 * focused control). Shared by `<ody-checkbox>` and `<ody-checkbox-group>`.
 */
export function applyCheckboxState(
  root: Element | null,
  checked: boolean,
  indeterminate: boolean,
): void {
  if (!root) return;
  root.classList.toggle('ody-checkbox--checked', checked);
  const input = root.querySelector<HTMLInputElement>('.ody-checkbox__input');
  if (input) {
    input.checked = checked;
    input.indeterminate = indeterminate;
  }
  const box = root.querySelector('.ody-checkbox__box');
  box?.querySelector('.ody-checkbox__mark')?.remove();
  const icon = indeterminate ? 'minus' : checked ? 'check' : '';
  if (icon && box) {
    const mark = document.createElement('span');
    mark.className = 'ody-checkbox__mark';
    mark.innerHTML = iconSvg(icon, 'icon__svg');
    box.appendChild(mark);
  }
}
