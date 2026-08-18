/**
 * The clean, transport-agnostic data model for a Peek Pro product.
 *
 * This is the shape consumers of the package work with. It is intentionally
 * decoupled from the underlying Peek GraphQL schema — the raw GraphQL types and
 * the conversion logic live inside the package and are never exposed here.
 */
import type { PricingMoney } from "./pricing.js";

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
   * ISO 4217 currency code the activity prices in (e.g. `"USD"`).
   *
   * Populated for activities and rentals; empty string for add-ons (which carry
   * no currency of their own) and when Peek reports none. Consumers building
   * pricing overrides use this to set the currency on fixed-price adjustments.
   */
  currency: string;

  /**
   * URL of the product's primary display image, or `null` when Peek reports
   * none. Populated for activities/rentals; always `null` for add-ons.
   */
  imageUrl: string | null;

  /**
   * Long-form product description (may contain HTML), or `null` when Peek
   * reports none. Populated for activities/rentals; always `null` for add-ons.
   */
  description: string | null;

  /**
   * Where the experience meets, or `null` when Peek reports no location detail.
   * Populated for activities/rentals; always `null` for add-ons. Each field
   * inside is independently nullable.
   */
  meetingLocation: ProductMeetingLocation | null;

  /**
   * The bookable sub-options of this product.
   *
   * - Activities: the activity's resource options.
   * - Add-ons: each individual item option grouped under the parent item.
   */
  tickets: ProductTicket[];
}

/** The meeting point for a bookable experience. Every field is nullable. */
export interface ProductMeetingLocation {
  /** Free-text summary / instructions for the meeting point. */
  summary: string | null;
  /** Formatted postal address of the meeting point. */
  address: string | null;
  /** Map/link URL for the meeting point. */
  url: string | null;
}

/** A single bookable sub-option (resource option or add-on item option). */
export interface ProductTicket {
  /** Unique identifier of the ticket / option. */
  id: string;
  /** Human-readable name of the ticket / option. */
  name: string;
  /**
   * Lowest price this ticket can be sold at, across its price range.
   *
   * Populated for activity/rental resource options that expose a price range;
   * `null` for add-on options (which carry no range) and when Peek reports none.
   */
  minPrice: PricingMoney | null;
  /**
   * Highest price this ticket can be sold at, across its price range.
   *
   * Populated for activity/rental resource options that expose a price range;
   * `null` for add-on options (which carry no range) and when Peek reports none.
   */
  maxPrice: PricingMoney | null;
}

/** {@link Product.type} for standard bookable activities. */
export const ACTIVITY_PRODUCT_TYPE = "ACTIVITY";

/** {@link Product.type} for rental products. */
export const RENTAL_PRODUCT_TYPE = "RENTAL";

/**
 * The {@link Product.type} value assigned to add-on products.
 *
 * Exposed so callers can filter add-ons out of (or in to) the combined list
 * returned by {@link Product} queries without hard-coding the string.
 */
export const ADD_ON_PRODUCT_TYPE = "ADD-ON";
