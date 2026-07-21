/**
 * Raw Peek GraphQL mutations, response shapes, and clean→raw variable builders
 * for pricing engines and pricing overrides. Internal — never re-exported.
 *
 * The public {@link UpsertOverridesInput} mirrors the wire input almost exactly;
 * the only transform the builders apply is stripping the `mode` discriminant off
 * each resource-option override down to the bare `price` / `percentageAdjustment`
 * key the API expects. Filters already match the wire shape and pass through.
 */
import type {
  ClearOverridesInput,
  CreateEngineInput,
  PricingOverrideFilter,
  UpdateEngineInput,
  UpsertOverridesInput,
} from "../../../models/peek/pricing.js";

// ─── Mutations ───────────────────────────────────────────────────────────────

/** Creates a pricing engine, optionally scoped to a set of activity ids. */
export const CREATE_PRICING_ENGINE_MUTATION = `
  mutation CreatePricingEngine($input: CreatePricingEngineInput!) {
    createPricingEngine(input: $input) {
      __typename
      ... on CreatePricingEngineSuccess {
        engine {
          id
        }
      }
      ... on InvalidDataError {
        message
      }
    }
  }
`;

/** Updates a pricing engine's name and/or activity-id scope. */
export const UPDATE_PRICING_ENGINE_MUTATION = `
  mutation UpdatePricingEngine($input: UpdatePricingEngineInput!) {
    updatePricingEngine(input: $input) {
      __typename
      ... on UpdatePricingEngineSuccess {
        engine {
          id
          name
        }
      }
      ... on InvalidDataError {
        message
      }
      ... on NotFoundError {
        id
        message
      }
    }
  }
`;

/** Deletes a pricing engine. Idempotent — a NotFoundError is treated as success. */
export const DELETE_PRICING_ENGINE_MUTATION = `
  mutation DeletePricingEngine($id: ID!) {
    deletePricingEngine(id: $id) {
      __typename
      ... on DeletePricingEngineSuccess {
        engine {
          id
          name
        }
      }
      ... on NotFoundError {
        id
        message
      }
    }
  }
`;

/** Upserts (or clears, via empty overrides) pricing overrides for a date range. */
export const UPSERT_PRICING_OVERRIDES_MUTATION = `
  mutation UpsertPricingOverridesActivityContexts($input: UpsertPricingOverridesActivityContextsInput!) {
    upsertPricingOverridesActivityContexts(input: $input) {
      __typename
      ... on UpsertPricingOverridesActivityContextsSuccess {
        activityContexts {
          date
          activity {
            id
            name
          }
          engine {
            id
            name
          }
          overrides {
            order
            resourceOptions {
              resourceOption {
                id
                name
              }
              override {
                ... on PricingOverridesActivityContextResourceOptionPriceOverride {
                  price {
                    amount
                    currency
                  }
                }
                ... on PricingOverridesActivityContextResourceOptionPercentageAdjustmentOverride {
                  percentageAdjustment
                }
              }
            }
            filters {
              __typename
              ... on PricingOverridesActivityContextStartTimeRangeFilter {
                startTimeRange
              }
              ... on PricingOverridesActivityContextSpotsTakenFilter {
                minSpots
                maxSpots
              }
            }
          }
        }
      }
      ... on InvalidDataError {
        message
      }
    }
  }
`;

// ─── Filter typenames (used by the converter to tag response filters) ─────────

/** `__typename` of the start-time-range filter in a pricing-override response. */
export const START_TIME_RANGE_FILTER_TYPENAME =
  "PricingOverridesActivityContextStartTimeRangeFilter";
/** `__typename` of the spots-taken filter in a pricing-override response. */
export const SPOTS_TAKEN_FILTER_TYPENAME =
  "PricingOverridesActivityContextSpotsTakenFilter";

// ─── Raw wire shapes: engine mutations ────────────────────────────────────────

/** Raw variables for {@link CREATE_PRICING_ENGINE_MUTATION}. */
export interface CreateEngineVariables {
  input: { name: string; filters?: Array<{ activityIds: string[] }> };
}

/** `data` payload of {@link CREATE_PRICING_ENGINE_MUTATION}. */
export interface CreateEngineResponse {
  createPricingEngine:
    | { __typename: "CreatePricingEngineSuccess"; engine: { id: string } }
    | { __typename: "InvalidDataError"; message: string };
}

/** Raw variables for {@link UPDATE_PRICING_ENGINE_MUTATION}. */
export interface UpdateEngineVariables {
  input: { id: string; name: string; filters: Array<{ activityIds: string[] }> };
}

/** `data` payload of {@link UPDATE_PRICING_ENGINE_MUTATION}. */
export interface UpdateEngineResponse {
  updatePricingEngine:
    | { __typename: "UpdatePricingEngineSuccess"; engine: { id: string; name: string } }
    | { __typename: "InvalidDataError"; message: string }
    | { __typename: "NotFoundError"; id: string; message: string };
}

/** Raw variables for {@link DELETE_PRICING_ENGINE_MUTATION}. */
export interface DeleteEngineVariables {
  id: string;
}

/** `data` payload of {@link DELETE_PRICING_ENGINE_MUTATION}. */
export interface DeleteEngineResponse {
  deletePricingEngine:
    | { __typename: "DeletePricingEngineSuccess"; engine: { id: string; name: string } }
    | { __typename: "NotFoundError"; id: string; message: string };
}

// ─── Raw wire shapes: upsert mutation ─────────────────────────────────────────

/** A raw resource-option override on the wire (the `mode` tag stripped). */
export type RawResourceOptionOverride =
  | { id: string; price: { amount: string; currency: string } }
  | { id: string; percentageAdjustment: string };

/** A raw override entry on the wire. */
export interface RawOverride {
  order: number;
  resourceOptions: RawResourceOptionOverride[];
  filters: PricingOverrideFilter[];
}

/** The raw upsert input on the wire. */
export interface RawUpsertInput {
  engineId: string;
  dateRange: string;
  activities: Array<{ activityId: string; overrides: RawOverride[] }>;
}

/** Raw variables for {@link UPSERT_PRICING_OVERRIDES_MUTATION}. */
export interface UpsertOverridesVariables {
  input: RawUpsertInput;
}

/** A single resolved resource-option override as returned by the API. */
export type RawResolvedOverride =
  | { price: { amount: string; currency: string } }
  | { percentageAdjustment: string };

/** A single resolved filter as returned by the API (tagged by `__typename`). */
export type RawResolvedFilter =
  | { __typename: typeof START_TIME_RANGE_FILTER_TYPENAME; startTimeRange: string }
  | {
      __typename: typeof SPOTS_TAKEN_FILTER_TYPENAME;
      minSpots: number | null;
      maxSpots: number | null;
    };

/** A single resolved activity context as returned by the API. */
export interface RawActivityContext {
  date: string;
  activity: { id: string; name: string };
  engine: { id: string; name: string };
  overrides: Array<{
    order: number;
    resourceOptions: Array<{
      resourceOption: { id: string; name: string };
      override: RawResolvedOverride;
    }>;
    filters: RawResolvedFilter[];
  }>;
}

/** `data` payload of {@link UPSERT_PRICING_OVERRIDES_MUTATION}. */
export interface UpsertOverridesResponse {
  upsertPricingOverridesActivityContexts:
    | {
        __typename: "UpsertPricingOverridesActivityContextsSuccess";
        activityContexts: RawActivityContext[];
      }
    | { __typename: "InvalidDataError"; message: string };
}

// ─── Clean → raw variable builders ────────────────────────────────────────────

/** Builds the raw create-engine input, attaching an activity-ids filter when scoped. */
export function buildCreateEngineInput(
  input: CreateEngineInput,
): CreateEngineVariables["input"] {
  const activityIds = input.activityIds ?? [];
  return activityIds.length > 0
    ? { name: input.name, filters: [{ activityIds }] }
    : { name: input.name };
}

/** Builds the raw update-engine input. An empty/omitted scope clears the filter. */
export function buildUpdateEngineInput(
  input: UpdateEngineInput,
): UpdateEngineVariables["input"] {
  const activityIds = input.activityIds ?? [];
  return {
    id: input.engineId,
    name: input.name,
    filters: activityIds.length > 0 ? [{ activityIds }] : [],
  };
}

/** Maps a clean {@link UpsertOverridesInput} to the raw wire input. */
export function buildUpsertInput(input: UpsertOverridesInput): RawUpsertInput {
  return {
    engineId: input.engineId,
    dateRange: input.dateRange,
    activities: input.activities.map((activity) => ({
      activityId: activity.activityId,
      overrides: activity.overrides.map((override) => ({
        order: override.order,
        resourceOptions: override.resourceOptions.map((option) =>
          option.mode === "fixed"
            ? { id: option.id, price: option.price }
            : { id: option.id, percentageAdjustment: option.percentageAdjustment },
        ),
        filters: override.filters,
      })),
    })),
  };
}

/** Builds the raw upsert input that clears all overrides for the given activities. */
export function buildClearInput(input: ClearOverridesInput): RawUpsertInput {
  return {
    engineId: input.engineId,
    dateRange: input.dateRange,
    activities: input.activityIds.map((activityId) => ({
      activityId,
      overrides: [],
    })),
  };
}
