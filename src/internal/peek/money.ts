/**
 * Shared, pure helper for mapping a raw gateway money node
 * (`{ amount, currency, formatted }`) into the clean {@link PricingMoney} model.
 *
 * Internal only — never re-exported from `src/index.ts`. Converters across
 * resources (products, pricing overrides) reuse this so the `formatted →
 * displayPrice` mapping lives in exactly one place.
 */
import type { PricingMoney } from "../../models/peek/pricing.js";

/** A raw money node as returned by the gateway. */
export interface RawMoney {
  amount: string;
  currency: string;
  /** Human-formatted display string (e.g. `"$50.00"`). */
  formatted?: string | null;
}

/**
 * Maps a raw money node into a {@link PricingMoney}, carrying the gateway's
 * `formatted` string across as `displayPrice`. Returns `null` for an
 * absent/`null` input so callers can pass an optional wire field straight
 * through.
 */
export function toPricingMoney(raw?: RawMoney | null): PricingMoney | null {
  if (!raw) return null;
  const money: PricingMoney = { amount: raw.amount, currency: raw.currency };
  if (raw.formatted != null) money.displayPrice = raw.formatted;
  return money;
}
