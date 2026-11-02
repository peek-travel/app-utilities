/**
 * A monetary value as returned by the Peek gateway, shared across services and
 * resources (booking add-ons, availability prices, …).
 *
 * `amount` is intentionally a **string** (e.g. `"50.00"`), never a number — the
 * gateway returns stringly-typed money to avoid floating-point precision loss.
 */
export interface Money {
  /** Numeric amount as a decimal string (e.g. `"50.00"`). */
  amount: string;
  /** ISO 4217 currency code (e.g. `"USD"`). */
  currency: string;
  /** Human-formatted amount (e.g. `"$50.00"`). */
  formatted: string;
}
