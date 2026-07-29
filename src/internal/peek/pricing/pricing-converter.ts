/**
 * Pure functions mapping raw pricing-override GraphQL nodes into the clean
 * {@link PricingActivityContext} model. No I/O — easy to unit-test.
 *
 * Two normalizations happen here, both erasing quirks of the wire format:
 * - Each resource-option override arrives as either a `price` object or a bare
 *   `percentageAdjustment`; we tag it with a `mode` discriminant.
 * - Each filter arrives `__typename`-tagged with `null`-able bounds; we map it
 *   back to the same compact {@link PricingOverrideFilter} union used on input,
 *   dropping absent (`null`) spots bounds.
 */
import type {
  PricingActivityContext,
  PricingOverrideFilter,
  ResolvedOverride,
  ResolvedPricingOverride,
  ResolvedResourceOption,
} from "../../../models/peek/pricing.js";
import { toPricingMoney } from "../money.js";
import {
  SPOTS_TAKEN_FILTER_TYPENAME,
  type RawActivityContext,
  type RawResolvedFilter,
  type RawResolvedOverride,
} from "./pricing-queries.js";

/** Converts the raw activity contexts from an upsert response into clean models. */
export function fromActivityContexts(
  contexts: RawActivityContext[],
): PricingActivityContext[] {
  return contexts.map(fromActivityContext);
}

function fromActivityContext(context: RawActivityContext): PricingActivityContext {
  return {
    date: context.date,
    activity: { id: context.activity.id, name: context.activity.name },
    engine: { id: context.engine.id, name: context.engine.name },
    overrides: context.overrides.map(fromOverride),
  };
}

function fromOverride(
  override: RawActivityContext["overrides"][number],
): ResolvedPricingOverride {
  return {
    order: override.order,
    resourceOptions: override.resourceOptions.map(fromResourceOption),
    filters: override.filters.map(fromFilter),
  };
}

function fromResourceOption(
  option: RawActivityContext["overrides"][number]["resourceOptions"][number],
): ResolvedResourceOption {
  return {
    resourceOption: {
      id: option.resourceOption.id,
      name: option.resourceOption.name,
    },
    override: fromResolvedOverride(option.override),
  };
}

function fromResolvedOverride(override: RawResolvedOverride): ResolvedOverride {
  return "price" in override
    ? { mode: "fixed", price: toPricingMoney(override.price)! }
    : { mode: "percentage", percentageAdjustment: override.percentageAdjustment };
}

function fromFilter(filter: RawResolvedFilter): PricingOverrideFilter {
  if (filter.__typename === SPOTS_TAKEN_FILTER_TYPENAME) {
    const spotsTaken: { minSpots?: number; maxSpots?: number } = {};
    if (filter.minSpots !== null) spotsTaken.minSpots = filter.minSpots;
    if (filter.maxSpots !== null) spotsTaken.maxSpots = filter.maxSpots;
    return { spotsTaken };
  }
  return { startTimeRange: filter.startTimeRange };
}
