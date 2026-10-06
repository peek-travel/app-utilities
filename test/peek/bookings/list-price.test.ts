import { describe, expect, it } from "vitest";

import { distributeListPrice } from "../../../src/internal/peek/bookings/list-price.js";

describe("distributeListPrice", () => {
  it("gives the remainder cent to the last ticket (10.00 over 3)", () => {
    expect(distributeListPrice("10.00", 3)).toEqual(["3.33", "3.33", "3.34"]);
  });

  it("splits evenly when the total divides exactly", () => {
    expect(distributeListPrice("9.00", 3)).toEqual(["3.00", "3.00", "3.00"]);
    expect(distributeListPrice("1,000", 4)).toEqual(["250.00", "250.00", "250.00", "250.00"]);
  });

  it("gives the whole amount to a single ticket", () => {
    expect(distributeListPrice("100", 1)).toEqual(["100.00"]);
    expect(distributeListPrice("10.00", 1)).toEqual(["10.00"]);
  });

  it("parses integers, decimals, and comma thousands separators", () => {
    expect(distributeListPrice("100", 1)).toEqual(["100.00"]);
    expect(distributeListPrice("1,234.56", 2)).toEqual(["617.28", "617.28"]);
    expect(distributeListPrice("1,000.50", 2)).toEqual(["500.25", "500.25"]);
  });

  it("always sums back to the exact total", () => {
    const amounts = distributeListPrice("100.00", 7);
    const sumCents = amounts.reduce((total, amount) => total + Math.round(Number(amount) * 100), 0);
    expect(sumCents).toBe(10000);
    expect(amounts).toHaveLength(7);
  });

  it("throws on non-positive, non-numeric, or non-string amounts", () => {
    for (const bad of ["", "   ", "abc", "-5", "0", "0.00", "1,00,0abc", "$10"]) {
      expect(() => distributeListPrice(bad, 2)).toThrow(/listPrice must be a positive number/);
    }
    expect(() => distributeListPrice(undefined as unknown as string, 2)).toThrow(
      /listPrice must be a positive number/,
    );
  });
});
