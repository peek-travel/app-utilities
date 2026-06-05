/**
 * The clean, transport-agnostic data model for a Peek Pro product.
 *
 * This is the shape consumers of the package work with. It is intentionally
 * decoupled from the underlying Peek GraphQL schema — the raw GraphQL types and
 * the conversion logic live inside the package and are never exposed here.
 */

/**
 * A bookable product in a Peek Pro account.
 *
 * `PeekAccessService.getAllProducts()` returns a single flat list that combines
 * two distinct Peek concepts into one uniform shape:
 *
 * - **Activities** — the primary bookable experiences (tours, rentals, classes,
 *   etc.). Their {@link Product.type} is whatever Peek reports for the activity.
 * - **Add-ons** — optional item options offered alongside activities. They are
 *   grouped under their parent item and always carry the
 *   {@link ADD_ON_PRODUCT_TYPE} (`"ADD-ON"`) type, so callers can tell the two
 *   apart with a single field check.
 */
export interface Product {
  /**
   * Stable unique identifier for the product.
   *
   * - Activities: the primary GraphQL `id` (falls back to the `legacyId`).
   * - Add-ons: the id of the parent item the options belong to.
   */
  productId: string;

  /** Human-readable display name. */
  name: string;

  /**
   * Product type.
   *
   * For activities this is the type reported by Peek; for add-ons it is always
   * {@link ADD_ON_PRODUCT_TYPE}.
   */
  type: string;

  /**
   * Display color as a hex string (e.g. `"#1A2B3C"`).
   *
   * Add-ons default to white (`"#FFFFFF"`). Empty string when no color is set.
   */
  color: string;

  /**
   * The bookable sub-options of this product.
   *
   * - Activities: the activity's resource options.
   * - Add-ons: each individual item option grouped under the parent item.
   */
  tickets: ProductTicket[];
}

/** A single bookable sub-option (resource option or add-on item option). */
export interface ProductTicket {
  /** Unique identifier of the ticket / option. */
  id: string;
  /** Human-readable name of the ticket / option. */
  name: string;
}

/**
 * The {@link Product.type} value assigned to add-on products.
 *
 * Exposed so callers can filter add-ons out of (or in to) the combined list
 * returned by {@link Product} queries without hard-coding the string.
 */
export const ADD_ON_PRODUCT_TYPE = "ADD-ON";
