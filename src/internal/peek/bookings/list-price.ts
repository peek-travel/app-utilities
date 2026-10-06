/**
 * Pure helpers for splitting a booking's total list price across its tickets.
 * I/O-free; validation throws on a malformed amount.
 */

const ERROR_LIST_PRICE_INVALID =
  "listPrice must be a positive number string, e.g. '100', '1,000', or '10.00'";

/**
 * Parses a list-price string into a positive integer number of cents. Commas
 * (thousands separators) are stripped; the value is rounded to the nearest cent.
 * Throws when the input is not a positive number.
 */
function parseListPriceToCents(listPrice: string): number {
  if (typeof listPrice !== "string") {
    throw new Error(ERROR_LIST_PRICE_INVALID);
  }
  const cleaned = listPrice.replace(/,/g, "").trim();
  if (!/^\d+(\.\d+)?$/.test(cleaned)) {
    throw new Error(ERROR_LIST_PRICE_INVALID);
  }
  const cents = Math.round(Number(cleaned) * 100);
  if (!Number.isFinite(cents) || cents <= 0) {
    throw new Error(ERROR_LIST_PRICE_INVALID);
  }
  return cents;
}

/** Formats an integer number of cents as a 2-decimal string (e.g. 334 → `"3.34"`). */
function centsToAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Splits a total list price evenly across `ticketCount` tickets, as 2-decimal
 * amount strings. Each of the first `n-1` tickets gets `floor(total / n)`; the
 * last ticket gets the remainder, so the amounts always sum back to the exact
 * total. For example `"10.00"` over 3 tickets → `["3.33", "3.33", "3.34"]`.
 *
 * `ticketCount` must be a positive integer (the caller guarantees at least one
 * ticket). Throws when `listPrice` is not a positive number string.
 */
export function distributeListPrice(listPrice: string, ticketCount: number): string[] {
  const totalCents = parseListPriceToCents(listPrice);
  const perTicketCents = Math.floor(totalCents / ticketCount);
  const amounts: string[] = [];
  for (let i = 0; i < ticketCount - 1; i += 1) {
    amounts.push(centsToAmount(perTicketCents));
  }
  amounts.push(centsToAmount(totalCents - perTicketCents * (ticketCount - 1)));
  return amounts;
}
