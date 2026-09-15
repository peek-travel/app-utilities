/**
 * The clean, transport-agnostic data model for a CNG product.
 *
 * The CNG sibling of `../peek/product.ts`. Kept as a separate model because the
 * CNG gateway is a distinct backoffice, but the shape deliberately mirrors the
 * Peek `Product` so consumers can treat both brands uniformly. The raw CNG REST
 * response types and the conversion logic live inside the package and are never
 * exposed here.
 */

/**
 * A bookable activity in a CNG account.
 *
 * `CngAccessService.getAllActivities()` returns these as a flat list.
 *
 * Mapped from the `app-registry/products` REST payload — see
 * `internal/cng/products/product-queries.ts`. That payload carries no
 * product-type discriminator and no sub-options, so `type` is always
 * {@link ACTIVITY_PRODUCT_TYPE} and `tickets` is always empty.
 */
export interface Activity {
  /** Stable unique identifier for the activity. */
  productId: string;

  /** Human-readable display name. */
  name: string;

  /**
   * Product type. Always {@link ACTIVITY_PRODUCT_TYPE} — the CNG products
   * payload has no type discriminator. Kept for parity with the Peek `Product`.
   */
  type: string;

  /**
   * Display color as a hex string (e.g. `"#1A2B3C"`), from the product's
   * access-control color. Empty string when no color is set.
   */
  color: string;

  /**
   * The bookable sub-options (tickets) of this activity. Always empty — CNG
   * exposes no tickets on the products endpoint today.
   */
  tickets: ActivityTicket[];
}

/** A single bookable sub-option (ticket) of an {@link Activity}. */
export interface ActivityTicket {
  /** Unique identifier of the ticket. */
  id: string;
  /** Human-readable name of the ticket. */
  name: string;
}

/** {@link Activity.type} for standard bookable activities. */
export const ACTIVITY_PRODUCT_TYPE = "ACTIVITY";
