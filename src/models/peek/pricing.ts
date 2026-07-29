/**
 * The clean data model for Peek Pro pricing engines and pricing overrides.
 *
 * A **pricing engine** is a named container Peek Pro applies at checkout. A
 * caller creates one lazily, stores its id, then repeatedly **upserts pricing
 * overrides** onto it for a given date range. Overrides adjust ticket prices
 * (fixed replacement or percentage adjustment) for an activity, optionally
 * gated by how many spots are already taken and/or a start-time window.
 *
 * Scope note: this package is a thin wrapper over the Peek GraphQL primitives.
 * It does **not** own the domain logic that decides *what* the overrides should
 * be — segmenting an activity across time windows, ordering overrides by tier,
 * or computing the `spotsTaken` bounds. The caller builds an
 * {@link UpsertOverridesInput} and the service sends it faithfully; the service
 * only maps between these clean shapes and the raw GraphQL payload.
 */

// ─── Shared value types ──────────────────────────────────────────────────────

/**
 * A monetary value on a pricing override.
 *
 * `amount` is intentionally a **string** (e.g. `"50.00"`), never a number — the
 * Peek API rejects floats here, and stringly-typed money avoids precision loss.
 */
export interface PricingMoney {
  /** Numeric amount as a decimal string (e.g. `"50.00"`). */
  amount: string;
  /** ISO 4217 currency code (e.g. `"USD"`). */
  currency: string;
  /**
   * Human-formatted display string for the amount (e.g. `"$50.00"`), as
   * rendered by the Peek gateway.
   *
   * Populated on values **read back** from the gateway (resolved overrides,
   * product ticket price ranges). It is optional and purely informational —
   * omit it when *building* an override input; the gateway derives it from
   * `amount`/`currency`.
   */
  displayPrice?: string;
}

/** An `{ id, name }` reference to a Peek entity echoed back in a response. */
export interface PricingNamedRef {
  /** Stable Peek identifier. */
  id: string;
  /** Human-readable display name. */
  name: string;
}

// ─── Pricing engine: inputs & outputs ────────────────────────────────────────

/** Input for creating a pricing engine. */
export interface CreateEngineInput {
  /** Display name for the engine. */
  name: string;
  /**
   * Optional list of activity ids the engine is scoped to. Omit (or pass an
   * empty array) to create an unfiltered engine that applies to all activities.
   */
  activityIds?: string[];
}

/**
 * The result of creating a pricing engine.
 *
 * The create mutation returns only the new engine's id; store it as the
 * schedule's `source_refid` for subsequent override upserts.
 */
export interface CreatedPricingEngine {
  /** The new engine's id. */
  id: string;
}

/** Input for updating a pricing engine's name and/or activity scope. */
export interface UpdateEngineInput {
  /** The engine to update. */
  engineId: string;
  /** New display name. */
  name: string;
  /**
   * Activity ids the engine should be scoped to. An empty array (or omitting
   * the field) **clears** the filter so the engine applies to all activities.
   */
  activityIds?: string[];
}

/** A pricing engine reference as echoed back by the API. */
export interface PricingEngine {
  /** Engine id. */
  id: string;
  /** Engine display name. */
  name: string;
}

// ─── Override building blocks (used to build an upsert) ───────────────────────

/**
 * A single ticket (resourceOption) price override, discriminated by `mode`.
 *
 * - `fixed` — replace the ticket price outright with {@link PricingMoney}.
 * - `percentage` — adjust the ticket price by a percentage. The adjustment is a
 *   decimal **string** (e.g. `"-25"` for 25% off) and must be greater than
 *   `-100`.
 */
export type ResourceOptionOverride =
  | {
      /** The Peek resourceOption (ticket) id being overridden. */
      id: string;
      mode: "fixed";
      /** The replacement price. */
      price: PricingMoney;
    }
  | {
      /** The Peek resourceOption (ticket) id being overridden. */
      id: string;
      mode: "percentage";
      /** Percentage adjustment as a decimal string, e.g. `"-25"`. Must be > -100. */
      percentageAdjustment: string;
    };

/**
 * A filter gating when an override applies. Both variants are optional and an
 * override may carry zero, one, or both.
 */
export type PricingOverrideFilter =
  | {
      /**
       * Restricts the override by how many spots are already taken.
       *
       * `minSpots`/`maxSpots` are **zero-indexed spots-taken counts**, not
       * ticket counts — e.g. "applies from the 5th ticket onward" is
       * `{ minSpots: 4 }`. The caller is responsible for this off-by-one
       * conversion from ticket-count ranges.
       */
      spotsTaken: {
        /** Lower bound (inclusive) on spots already taken. Omit for no lower bound. */
        minSpots?: number;
        /** Upper bound (inclusive) on spots already taken. Omit for no upper bound. */
        maxSpots?: number;
      };
    }
  | {
      /**
       * Restricts the override to a start-time window, as a PostgreSQL-style
       * inclusive range string `"[HH:MM:SS,HH:MM:SS]"`.
       */
      startTimeRange: string;
    };

/**
 * One override entry for an activity: which tickets it adjusts, in what order,
 * under which filters.
 */
export interface PricingOverride {
  /**
   * The override's precedence index (0-based). The caller assigns this — Peek
   * evaluates lower `order` values first, so higher-discount / more-specific
   * tiers should get lower numbers.
   */
  order: number;
  /** The per-ticket price overrides applied by this entry. */
  resourceOptions: ResourceOptionOverride[];
  /** Zero or more filters gating when this entry applies. */
  filters: PricingOverrideFilter[];
}

/** The set of overrides to apply for a single activity. */
export interface ActivityOverrides {
  /** The Peek activity id these overrides apply to. */
  activityId: string;
  /**
   * The overrides for this activity. Pass an **empty array to clear** all
   * overrides for the activity — never omit the activity to clear it.
   */
  overrides: PricingOverride[];
}

// ─── Upsert / clear: inputs ──────────────────────────────────────────────────

/**
 * The full input for upserting pricing overrides onto an engine.
 *
 * Mirrors the Peek `upsertPricingOverridesActivityContexts` input verbatim. The
 * caller owns all segmentation and ordering; the service sends this as-is.
 */
export interface UpsertOverridesInput {
  /** The engine to write overrides to (its {@link CreatedPricingEngine.id}). */
  engineId: string;
  /**
   * The date range the overrides apply to, as a PostgreSQL-style inclusive
   * range string. For a single day, both ends are the same: `"[2025-07-04,2025-07-04]"`.
   */
  dateRange: string;
  /** One entry per activity being written (or cleared). */
  activities: ActivityOverrides[];
}

/**
 * Convenience input for clearing all overrides across a set of activities for a
 * date range. Equivalent to an {@link UpsertOverridesInput} whose every
 * activity carries `overrides: []`.
 */
export interface ClearOverridesInput {
  /** The engine to clear overrides on. */
  engineId: string;
  /** The date range to clear, same format as {@link UpsertOverridesInput.dateRange}. */
  dateRange: string;
  /** The activity ids to clear. Recover these from a prior sync's payload. */
  activityIds: string[];
}

// ─── Upsert / clear: output (the resolved state Peek echoes back) ─────────────

/**
 * A ticket price override as **resolved** by Peek, discriminated by `mode`.
 *
 * This normalizes Peek's GraphQL union (a `price` object vs a bare
 * `percentageAdjustment`) into the same `mode`-tagged shape used on input.
 */
export type ResolvedOverride =
  | {
      mode: "fixed";
      /** The resolved replacement price. */
      price: PricingMoney;
    }
  | {
      mode: "percentage";
      /** The resolved percentage adjustment as a decimal string. */
      percentageAdjustment: string;
    };

/** A single ticket's resolved override within a returned context. */
export interface ResolvedResourceOption {
  /** The ticket (resourceOption) this override resolved for. */
  resourceOption: PricingNamedRef;
  /** The resolved fixed or percentage override. */
  override: ResolvedOverride;
}

/** A single resolved override entry within a returned activity context. */
export interface ResolvedPricingOverride {
  /** The override's precedence index as stored by Peek. */
  order: number;
  /** The resolved per-ticket overrides. */
  resourceOptions: ResolvedResourceOption[];
  /**
   * The filters gating this override, normalized to the same shape as the
   * {@link PricingOverrideFilter} used on input.
   */
  filters: PricingOverrideFilter[];
}

/**
 * The resolved pricing state for one activity on one date, as returned by an
 * upsert or clear. Useful as an audit record of exactly what Peek stored.
 */
export interface PricingActivityContext {
  /** The date the context applies to (ISO `YYYY-MM-DD`). */
  date: string;
  /** The activity the overrides belong to. */
  activity: PricingNamedRef;
  /** The engine the overrides live under. */
  engine: PricingNamedRef;
  /** The resolved overrides (empty when the date was cleared). */
  overrides: ResolvedPricingOverride[];
}

/** The result of an upsert or clear: the resolved contexts Peek returned. */
export interface UpsertOverridesResult {
  /** One entry per activity written or cleared in the request. */
  activityContexts: PricingActivityContext[];
}
