/**
 * The clean data model for Peek Pro activity availability times.
 */

/** A single bookable availability time slot for an activity. */
export interface AvailabilityTime {
  /** Unique identifier. */
  id: string;
  /** Time label. */
  time: string;
  /** Slot start. */
  from: string;
  /** Slot end. */
  end: string;
  /** Slot duration. */
  duration: Duration;
  /** Availability status. */
  status: string;
  /** Per-resource-option availability. */
  availability: Availability[];
}

/** Duration of an {@link AvailabilityTime} slot. */
export interface Duration {
  name: string;
  length: {
    amount: number;
    unit: string;
  };
}

/** Availability for a specific resource option within a slot. */
export interface Availability {
  qty: number;
  taken: number;
  resourceOptionId: string;
}

/** A requested resource-option quantity used when querying availability. */
export interface ResourceOptionQuantity {
  resourceOptionId: string;
  quantity: number;
}

/** Query parameters for fetching availability times. */
export interface AvailabilityTimesQuery {
  /** Activity (product) id. */
  activityId: string;
  /** Date (YYYY-MM-DD). */
  date: string;
  /** The resource options and quantities to check availability for. */
  resourceOptionQuantities: ResourceOptionQuantity[];
}
