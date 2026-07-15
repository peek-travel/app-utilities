/**
 * The clean data model for Peek Pro memberships.
 */

/**
 * A flat representation of a Peek Pro membership variant.
 *
 * A membership can expose multiple variants; this model flattens each variant
 * into its own record, carrying the parent membership's stable id and display
 * name alongside the variant-level details. Memberships with no variants
 * produce no records.
 */
export interface Membership {
  /** Parent membership id. */
  id: string;
  /** Variant id. */
  membershipVariantId: string;
  /** Variant description, or null. */
  description: string | null;
  /** Variant external (customer-facing) name. */
  externalName: string;
  /** Variant image URL, or null. */
  imageUrl: string | null;
  /** Variant internal name. */
  internalName: string;
  /** Parent membership display name. */
  displayName: string;
}

/** Input for purchasing a membership. */
export interface MembershipPurchaseInput {
  /** The membership variant to purchase. */
  membershipVariantId: string;
  /** Member email (required). */
  email: string;
  /** ISO country code (optional). */
  country?: string;
  /** Formatted address (optional). */
  formattedAddress?: string;
  /** Membership code (optional). */
  membershipCode?: string;
  /** Member phone (optional). */
  phone?: string;
  /** Member name (optional). */
  name?: string;
}

/** The result of purchasing a membership. */
export interface PurchasedMembership {
  orderId: string;
  membershipId: string;
  displayId: string;
  primaryMemberId: string | null;
  primaryMemberName: string | null;
  balanceAmount: string;
  balanceCurrency: string;
  balanceFormatted: string;
}
