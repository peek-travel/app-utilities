/**
 * The clean, transport-agnostic data model for an ACME event template.
 *
 * The ACME sibling of `../cng/product.ts`. Kept as a separate model because the
 * ACME gateway is a distinct backoffice, but the shape deliberately mirrors the
 * CNG `Activity` so consumers can treat every brand uniformly. The raw ACME
 * REST response types and the conversion logic live inside the package and are
 * never exposed here.
 */

/**
 * A bookable activity in an ACME account (an event template).
 *
 * `AcmeAccessService.getAllActivities()` returns these as a flat list, filtered
 * to published templates only. ACME does not expose tickets today, so
 * {@link AcmeActivity.tickets} is always an empty list.
 */
export interface AcmeActivity {
  /** Stable unique identifier for the activity. */
  productId: string;

  /** Human-readable display name. */
  name: string;

  /** Product type reported by ACME (e.g. `"standard"`). */
  type: string;

  /**
   * Display color as a hex string (e.g. `"#00695c"`). Falls back to a neutral
   * gray (`"#d1d1d1"`) when no color is set.
   */
  color: string;

  /** The bookable sub-options (tickets) of this activity. Always empty today. */
  tickets: AcmeActivityTicket[];
}

/** A single bookable sub-option (ticket) of an {@link AcmeActivity}. */
export interface AcmeActivityTicket {
  /** Unique identifier of the ticket. */
  id: string;
  /** Human-readable name of the ticket. */
  name: string;
}

/** {@link AcmeActivity.type} fallback for templates missing a type. */
export const ACME_ACTIVITY_TYPE = "standard";
