import { describe, expect, it } from "vitest";

import {
  parseSaleNode,
  toBookingAddon,
} from "../../src/internal/bookings/addon-converter.js";
import type { SalesAddonBookingNode } from "../../src/internal/bookings/addon-queries.js";

const MONEY = { amount: "10.00", currency: "USD", formatted: "$10.00" };

function node(overrides: Partial<SalesAddonBookingNode> = {}): SalesAddonBookingNode {
  return {
    id: "b_1",
    displayId: "B-1",
    refid: "bq-1",
    reservationStatus: "CONFIRMED",
    order: { id: "ord-1", displayId: "O-1" },
    items: [],
    ...overrides,
  } as SalesAddonBookingNode;
}

describe("parseSaleNode", () => {
  it("maps items and options into the internal model", () => {
    const items = parseSaleNode(
      node({
        items: [
          {
            id: "it-1",
            refid: "ir-1",
            reservationStatus: "CONFIRMED",
            value: { total: MONEY },
            options: [
              {
                refid: "or-1",
                reservationStatus: "CONFIRMED",
                price: MONEY,
                itemOptionSnapshot: { id: "opt-1", name: "Helmet" },
                itemSnapshot: { id: "item-1", name: "Safety Gear" },
              },
            ],
          },
        ],
      }),
    );

    expect(items).toEqual([
      {
        bookingId: "b_1",
        displayId: "B-1",
        orderId: "ord-1",
        total: MONEY,
        bookingQuoteRefid: "bq-1",
        bookingQuoteReservationStatus: "CONFIRMED",
        addonItemOptions: [
          {
            itemId: "item-1",
            optionId: "opt-1",
            itemName: "Safety Gear",
            optionName: "Helmet",
            optionRefid: "or-1",
            optionReservationStatus: "CONFIRMED",
            itemReservationStatus: "CONFIRMED",
            itemRefid: "ir-1",
          },
        ],
      },
    ]);
  });

  it("defaults missing booking-level and snapshot fields to empty strings", () => {
    const items = parseSaleNode({
      id: "",
      displayId: "",
      refid: "",
      reservationStatus: "",
      order: null,
      items: [
        {
          id: "it-1",
          refid: "",
          reservationStatus: "",
          value: null,
          options: [
            {
              refid: "",
              reservationStatus: "",
              price: null,
              itemOptionSnapshot: null,
              itemSnapshot: null,
            },
          ],
        },
      ],
    } as SalesAddonBookingNode);

    expect(items[0]).toMatchObject({
      bookingId: "",
      orderId: "",
      total: null,
      addonItemOptions: [
        { itemId: "", optionId: "", itemName: "", optionName: "", optionRefid: "" },
      ],
    });
  });

  it("treats null items/options as empty arrays", () => {
    expect(parseSaleNode(node({ items: null }))).toEqual([]);
    const items = parseSaleNode(
      node({
        items: [
          { id: "it-1", refid: "ir-1", reservationStatus: "CONFIRMED", value: { total: MONEY }, options: null },
        ],
      }),
    );
    expect(items[0]!.addonItemOptions).toEqual([]);
  });
});

describe("toBookingAddon", () => {
  function opt(overrides: Record<string, unknown> = {}) {
    return {
      itemId: "item-1",
      optionId: "opt-1",
      itemName: "Safety Gear",
      optionName: "Helmet",
      optionRefid: "or-1",
      optionReservationStatus: "CONFIRMED",
      itemReservationStatus: "CONFIRMED",
      itemRefid: "ir-1",
      ...overrides,
    };
  }

  function item(options: ReturnType<typeof opt>[]) {
    return {
      bookingId: "b_1",
      displayId: "B-1",
      orderId: "ord-1",
      total: MONEY,
      bookingQuoteRefid: "bq-1",
      bookingQuoteReservationStatus: "CONFIRMED",
      addonItemOptions: options,
    };
  }

  it("returns null when there are no options", () => {
    expect(toBookingAddon(item([]))).toBeNull();
  });

  it("groups options by id with a quantity and carries the total", () => {
    const result = toBookingAddon(item([opt({ optionRefid: "or-1" }), opt({ optionRefid: "or-2" })]));
    expect(result).toEqual({
      addonId: "item-1",
      addonName: "Safety Gear",
      total: MONEY,
      addonOptions: [{ addonOptionId: "opt-1", addonOptionName: "Helmet", quantity: 2 }],
    });
  });

  it("drops canceled options and returns null when all are canceled", () => {
    expect(toBookingAddon(item([opt({ optionReservationStatus: "CANCELED" })]))).toBeNull();
  });

  it("throws when options reference mismatched item ids", () => {
    expect(() => toBookingAddon(item([opt(), opt({ itemId: "item-2" })]))).toThrow(
      /mismatched item IDs/,
    );
  });
});
