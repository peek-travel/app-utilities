import { describe, expect, it } from "vitest";

import {
  decodeCursor,
  decodeOffset,
  encodeCursor,
} from "../../src/internal/reviews/review-cursor.js";

describe("decodeCursor", () => {
  it("decodes the documented gateway cursors", () => {
    // From the reply sample: range:0..49,0 / 1 / 2.
    expect(decodeCursor("cmFuZ2U6MC4uNDksMA==")).toEqual({
      start: 0,
      end: 49,
      offset: 0,
    });
    expect(decodeCursor("cmFuZ2U6MC4uNDksMQ==").offset).toBe(1);
    expect(decodeCursor("cmFuZ2U6MC4uNDksMg==").offset).toBe(2);
    // From the variables sample: range:50..99,50.
    expect(decodeCursor("cmFuZ2U6NTAuLjk5LDUw")).toEqual({
      start: 50,
      end: 99,
      offset: 50,
    });
  });

  it("throws on a cursor that is not a base64 range token", () => {
    expect(() => decodeCursor("bm90LWEtY3Vyc29y")).toThrow(/Unrecognized review cursor/);
  });
});

describe("encodeCursor", () => {
  it("round-trips an offset through decodeOffset", () => {
    expect(decodeOffset(encodeCursor(123, 50))).toBe(123);
  });

  it("mimics the last edge of a page that ends at the offset", () => {
    // A 50-item page ending at offset 99 spans range 50..99.
    expect(decodeCursor(encodeCursor(99, 50))).toEqual({
      start: 50,
      end: 99,
      offset: 99,
    });
  });

  it("clamps the page start at zero for shallow offsets", () => {
    expect(decodeCursor(encodeCursor(10, 50))).toEqual({
      start: 0,
      end: 10,
      offset: 10,
    });
  });
});
