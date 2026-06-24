/**
 * `@peektravel/app-utilities/ui` — framework-agnostic Web Components ported
 * from the Peek Odyssey design system.
 *
 * Importing this module **registers** every `<ody-*>` custom element as a side
 * effect, so a consumer only needs:
 *
 * ```ts
 * import '@peektravel/app-utilities/ui';
 * import '@peektravel/app-utilities/ui/tokens.css';
 * import '@peektravel/app-utilities/ui/odyssey.css';
 * ```
 *
 * The exported classes and types are for consumers who want to subclass,
 * type-check, or register elements under custom tag names.
 */

// ---- Registration side effects (one import per component) ------------------
// Display tier
import './components/icon.js';
import './components/button.js';
import './components/tag.js';
import './components/alert.js';
import './components/card.js';
import './components/divider.js';
import './components/status-dot.js';
import './components/message.js';
import './components/loading-spinner.js';
import './components/loading-bar.js';
// Layout / structure tier
import './components/empty-state.js';
import './components/breadcrumb.js';
import './components/stat-summary.js';
import './components/inline-list.js';
import './components/list-item.js';
import './components/product-indicator.js';
import './components/toggle-button.js';
import './components/section.js';
import './components/two-column.js';
import './components/collapsible-section.js';
// Form inputs
import './components/input.js';
import './components/inline-input.js';
import './components/search-input.js';
import './components/money-input.js';
import './components/percentage-input.js';
import './components/checkbox.js';
import './components/radio-button-group.js';
import './components/checkbox-group.js';
// Interactive
import './components/accordion.js';
import './components/collapsible.js';
import './components/tabs.js';
import './components/copy-button.js';
import './components/check-in-status.js';
import './components/option.js';
import './components/split-button.js';
import './components/table-header.js';
// Overlays
import './components/modal.js';
import './components/popover.js';
import './components/tooltip.js';
import './components/panel.js';
import './components/toast-notification.js';
// Data & selection
import './components/dropdown-single.js';
import './components/dropdown-multi.js';
import './components/datepicker.js';
import './components/table.js';
// Brand icon element
import './brand-icons.js';

// ---- Base + helpers --------------------------------------------------------
export { OdyElement, escapeHtml, classes, define } from './base.js';
export {
  iconSvg,
  renderIconSvg,
  registerIcon,
  hasIcon,
  iconNames,
  type OdyIconData,
} from './icons.js';
export {
  OdyBrandIcon,
  brandIconSvg,
  hasBrandIcon,
  brandIconNames,
  type OdyBrandIconSize,
} from './brand-icons.js';
export { registerTranslation, type OdyTerms, type OdyTermKey } from './i18n.js';
export { portal, removePortal, position, type OdyPlacement, type OdyPosition } from './overlay.js';

// ---- Component classes + types ---------------------------------------------
// Display tier
export { OdyIcon, type OdyIconSize } from './components/icon.js';
export {
  OdyButton,
  type OdyButtonVariant,
  type OdyButtonAppearance,
  type OdyButtonSize,
} from './components/button.js';
export { OdyTag, type OdyTagVariant, type OdyTagColor, type OdyTagSize } from './components/tag.js';
export { OdyAlert, type OdyAlertVariant } from './components/alert.js';
export { OdyCard } from './components/card.js';
export { OdyDivider } from './components/divider.js';
export { OdyStatusDot, type OdyStatusDotColor } from './components/status-dot.js';
export { OdyMessage } from './components/message.js';
export { OdyLoadingSpinner, type OdySpinnerSize } from './components/loading-spinner.js';
export { OdyLoadingBar } from './components/loading-bar.js';

// Layout / structure tier
export { OdyEmptyState, type OdyEmptyStateVariant } from './components/empty-state.js';
export { OdyBreadcrumb, OdyBreadcrumbItem } from './components/breadcrumb.js';
export {
  OdyStatSummary,
  OdyStat,
  OdyStatDetail,
  OdyStatSummaryDetail,
  type OdyStatTone,
} from './components/stat-summary.js';
export {
  OdyInlineList,
  OdyInlineListItem,
  type OdyInlineListSeparator,
} from './components/inline-list.js';
export { OdyListItem } from './components/list-item.js';
export {
  OdyProductIndicator,
  type OdyProductIndicatorSize,
} from './components/product-indicator.js';
export {
  OdyToggleButton,
  type OdyToggleButtonSize,
  type OdyToggleOption,
} from './components/toggle-button.js';
export {
  OdySectionColumns,
  OdySectionColumnItem,
  OdySectionRows,
  OdySectionRowItem,
  type OdySectionGap,
  type OdySectionVerticalAlign,
} from './components/section.js';
export {
  OdyTwoColumn,
  OdyTwoColumnMain,
  OdyTwoColumnSecondary,
  OdyTwoColumnSecondaryHeader,
} from './components/two-column.js';
export {
  OdyCollapsibleSection,
  OdyCollapsibleCollapsed,
  OdyCollapsibleContent,
} from './components/collapsible-section.js';

// Form inputs
export { OdyInput, type OdyInputSize, type OdyInputState } from './components/input.js';
export { OdyInlineInput, type OdyInlineInputSize } from './components/inline-input.js';
export { OdySearchInput, type OdySearchInputSize } from './components/search-input.js';
export { OdyMoneyInput, type OdyMoneyInputSize } from './components/money-input.js';
export {
  OdyPercentageInput,
  type OdyPercentageInputSize,
} from './components/percentage-input.js';
export { OdyCheckbox, type OdyCheckboxSize } from './components/checkbox.js';
export {
  OdyRadioButtonGroup,
  type OdyRadioButtonGroupSize,
  type OdyRadioOption,
} from './components/radio-button-group.js';
export {
  OdyCheckboxGroup,
  type OdyCheckboxGroupSize,
  type OdyCheckboxOption,
} from './components/checkbox-group.js';

// Interactive
export { OdyAccordion } from './components/accordion.js';
export { OdyCollapsible } from './components/collapsible.js';
export {
  OdyTabs,
  type OdyTabDef,
  type OdyTabsSize,
  type OdyTabsPosition,
} from './components/tabs.js';
export { OdyCopyButton } from './components/copy-button.js';
export {
  OdyCheckInStatus,
  type OdyCheckInStatusValue,
} from './components/check-in-status.js';
export { OdyOption } from './components/option.js';
export { OdySplitButton } from './components/split-button.js';
export { OdyTableHeader, type OdySortDirection } from './components/table-header.js';

// Overlays
export { OdyModal, type OdyModalSize } from './components/modal.js';
export { OdyPopover } from './components/popover.js';
export { OdyTooltip } from './components/tooltip.js';
export { OdyPanel } from './components/panel.js';
export {
  OdyToastHost,
  toast,
  type OdyToastVariant,
  type OdyToastOptions,
} from './components/toast-notification.js';

// Data & selection
export { OdySelectBase, parseOptions, type OdySelectOption } from './select-base.js';
export { OdyDropdownSingle } from './components/dropdown-single.js';
export { OdyDropdownMulti } from './components/dropdown-multi.js';
export {
  OdyDatePicker,
  type OdyDatePreset,
  type OdyDateDisallowed,
} from './components/datepicker.js';
export {
  OdyTable,
  type OdyTableColumn,
  type OdyTableAlign,
  type OdyTableRow,
  // `OdySortDirection` from table-header (UNSET/ASC/DESC) is already exported;
  // the table's own direction enum (ascending/descending) is re-aliased.
  type OdySortDirection as OdyTableSortDirection,
  type OdyTableSortChangeDetail,
  type OdyTableSelectionChangeDetail,
  type OdyTableRowClickDetail,
} from './components/table.js';
