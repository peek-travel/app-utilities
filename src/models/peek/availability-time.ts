/**
 * The clean, transport-agnostic data models for Peek Pro activity availability
 * times.
 *
 * `PeekAccessService.getAvailabilityTimes()` returns the bookable time slots for
 * a given activity and date, each carrying its per-resource-option availability
 * so callers can decide whether a requested party fits.
 */

/**
 * A single bookable availability time slot for an activity.
 *
 * Each slot describes a start/end window on the queried date and reports how
 * much capacity remains per resource option (see {@link Availability}).
 */
export interface AvailabilityTime {
  /** Stable unique identifier of the slot. */
  id: string;
  /** Human-readable time label for the slot (e.g. `"10:00 AM"`). */
  time: string;
  /** Slot start as reported by Peek (ISO datetime). */
  from: string;
  /** Slot end as reported by Peek (ISO datetime). */
  end: string;
  /** How long the slot runs (see {@link Duration}). */
  duration: Duration;
  /** Availability status reported by Peek (e.g. open/closed/sold-out). */
  status: string;
  /**
   * Remaining availability broken down per resource option. One entry per
   * resource option offered for the slot.
   */
  availability: Availability[];
}

/** The length of an {@link AvailabilityTime} slot. */
export interface Duration {
  /** Human-readable duration name (e.g. `"1 hour"`). */
  name: string;
  /** The numeric length paired with its unit. */
  length: {
    /** Quantity of `unit` (e.g. `60`). */
    amount: number;
    /** Unit of `amount` (e.g. `"minutes"`). */
    unit: string;
  };
}

/** Availability for a specific resource option within a slot. */
export interface Availability {
  /** Total capacity of this resource option for the slot. */
  qty: number;
  /** How much of `qty` is already taken. */
  taken: number;
  /** The resource option this availability is for. */
  resourceOptionId: string;
}

/** A requested resource-option quantity used when querying availability. */
export interface ResourceOptionQuantity {
  /** The resource option to check. */
  resourceOptionId: string;
  /** How many units of that option to check availability for. */
  quantity: number;
}

/** Query parameters for fetching availability times. */
export interface AvailabilityTimesQuery {
  /** Activity (product) id. */
  activityId: string;
  /** Date to check (YYYY-MM-DD). */
  date: string;
  /** The resource options and quantities to check availability for. */
  resourceOptionQuantities: ResourceOptionQuantity[];
}
