/**
 * Clean, public data models for a booking's add-ons.
 *
 * These are the only add-on shapes a consumer sees. The detailed per-option
 * model used to build add/cancel mutations (refids, reservation statuses) is
 * an internal implementation detail and is intentionally not exported.
 */

/** Money amount for an add-on line, as returned by the gateway. */
export interface BookingAddonMoney {
  amount: string;
  currency: string;
  formatted: string;
}

/** A single add-on option with the quantity attached to the booking. */
export interface BookingAddonOption {
  /** The item option id (`itemOptionSnapshot.id`). */
  addonOptionId: string;
  /** The item option name (`itemOptionSnapshot.name`). */
  addonOptionName: string;
  /** How many live (non-canceled) units of this option are on the booking. */
  quantity: number;
}

/** An add-on attached to a booking, grouped by add-on item. */
export interface BookingAddon {
  /** The add-on item id (`itemSnapshot.id`). */
  addonId: string;
  /** The add-on item name (`itemSnapshot.name`). */
  addonName: string;
  /** The booking line-item total for this add-on, when present. */
  total: BookingAddonMoney | null;
  /** Live options on this add-on, combined by option id with a count. */
  addonOptions: BookingAddonOption[];
}

/** A booking's add-ons. */
export interface BookingAddons {
  bookingId: string;
  displayId: string;
  orderId: string;
  /** Add-ons with at least one live option; fully-canceled add-ons are omitted. */
  addons: BookingAddon[];
}

/**
 * Result of an add-on mutation (add or remove). Both operations finish by
 * re-listing the booking's add-ons and returning the post-change state rather
 * than echoing quote details.
 */
export interface BookingAddonsMutationResult {
  updatedBookingAddons: BookingAddons;
}
