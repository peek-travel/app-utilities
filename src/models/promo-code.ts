/**
 * The clean data model for Peek Pro promo codes.
 */

/** A promo code on a Peek Pro account. */
export interface PromoCode {
  /** Unique identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Percentage discount (0–100), or null for a fixed-amount code. */
  percentAmount: number | null;
  /** Whether the discount applies per ticket. */
  perTicketDiscount: boolean;
  /** The code guests redeem. */
  redemptionCode: string;
  /** Fixed-amount discount, or null for a percentage code. */
  fixedAmount: PromoCodeFixedAmount | null;
}

/** A fixed monetary discount on a {@link PromoCode}. */
export interface PromoCodeFixedAmount {
  /** Amount in the currency's minor/major unit as reported by Peek. */
  amount: number;
  /** ISO currency code. */
  currency: string;
  /** Human-formatted amount (e.g. `"$10.00"`). */
  formatted: string;
}

/** Input for creating a promo code. */
export interface CreatePromoCodeInput {
  /** Display name. */
  name: string;
  /** The redemption code. */
  code: string;
  /** Discount amount as a string (percentage or fixed value). */
  amount: string;
  /** Whether `amount` is a percentage or a fixed monetary value. */
  discountType: "percent" | "fixed";
  /** Optional cap on total redemptions. */
  maxRedemptions?: number;
  /** ISO currency code for fixed discounts. Defaults to `"USD"`. */
  currency?: string;
}

/** The result of creating a promo code (the mutation returns id + name). */
export interface CreatedPromoCode {
  id: string;
  name: string;
}
