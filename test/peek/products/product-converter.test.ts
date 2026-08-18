import { describe, expect, it } from "vitest";

import {
  fromActivities,
  fromItemOptionNodes,
} from "../../../src/internal/peek/products/product-converter.js";
import type {
  ActivityNode,
  ItemOptionNode,
} from "../../../src/internal/peek/products/product-queries.js";
import { ADD_ON_PRODUCT_TYPE } from "../../../src/models/peek/product.js";

describe("fromActivities", () => {
  it("maps an activity into a clean product", () => {
    const activities: ActivityNode[] = [
      {
        name: "Kayak Tour",
        id: "act-1",
        legacyId: "legacy-1",
        type: "ACTIVITY",
        colorHex: "#1A2B3C",
        currency: "USD",
        imageUrl: "https://img.peek.com/act-1.jpg",
        description: "<p>Paddle the bay.</p>",
        meetingLocationFormattedAddress: "1 Dock St, Bay City",
        meetingLocationUrl: "https://maps.example.com/dock",
        infoMeetingLocation: "Meet at the boathouse.",
        resourceOptions: [
          {
            id: "r1",
            name: "Single",
            priceRange: {
              min: { currency: "USD", amount: "50.00", formatted: "$50.00" },
              max: { currency: "USD", amount: "80.00", formatted: "$80.00" },
            },
          },
          { id: "r2", name: "Double" },
        ],
      },
    ];

    expect(fromActivities(activities)).toEqual([
      {
        productId: "act-1",
        name: "Kayak Tour",
        type: "ACTIVITY",
        color: "#1A2B3C",
        currency: "USD",
        imageUrl: "https://img.peek.com/act-1.jpg",
        description: "<p>Paddle the bay.</p>",
        meetingLocation: {
          summary: "Meet at the boathouse.",
          address: "1 Dock St, Bay City",
          url: "https://maps.example.com/dock",
        },
        tickets: [
          {
            id: "r1",
            name: "Single",
            minPrice: { amount: "50.00", currency: "USD", displayPrice: "$50.00" },
            maxPrice: { amount: "80.00", currency: "USD", displayPrice: "$80.00" },
          },
          { id: "r2", name: "Double", minPrice: null, maxPrice: null },
        ],
      },
    ]);
  });

  it("maps a price range with no formatted string, omitting displayPrice", () => {
    const activities: ActivityNode[] = [
      {
        name: "Kayak Tour",
        id: "act-1",
        type: "ACTIVITY",
        colorHex: "#000000",
        currency: "USD",
        resourceOptions: [
          {
            id: "r1",
            name: "Single",
            priceRange: { min: { currency: "USD", amount: "50.00" }, max: null },
          },
        ],
      },
    ];

    expect(fromActivities(activities)[0]?.tickets).toEqual([
      {
        id: "r1",
        name: "Single",
        minPrice: { amount: "50.00", currency: "USD" },
        maxPrice: null,
      },
    ]);
  });

  it("falls back to legacyId and empty color, and tolerates missing resourceOptions", () => {
    const activities = [
      {
        name: "No Primary Id",
        id: "",
        legacyId: "legacy-9",
        type: "ACTIVITY",
        colorHex: "",
        resourceOptions: undefined,
      },
    ] as unknown as ActivityNode[];

    expect(fromActivities(activities)).toEqual([
      {
        productId: "legacy-9",
        name: "No Primary Id",
        type: "ACTIVITY",
        color: "",
        currency: "",
        imageUrl: null,
        description: null,
        meetingLocation: null,
        tickets: [],
      },
    ]);
  });

  it("maps catalog fields to null when Peek reports none", () => {
    const activities: ActivityNode[] = [
      {
        name: "Bare",
        id: "act-2",
        type: "ACTIVITY",
        colorHex: "#000000",
        currency: "USD",
        resourceOptions: [],
      },
    ];

    const product = fromActivities(activities)[0];
    expect(product?.imageUrl).toBeNull();
    expect(product?.description).toBeNull();
    expect(product?.meetingLocation).toBeNull();
  });

  it("keeps a partial meeting location, filling absent fields with null", () => {
    const activities: ActivityNode[] = [
      {
        name: "Partial Location",
        id: "act-3",
        type: "ACTIVITY",
        colorHex: "#000000",
        currency: "USD",
        infoMeetingLocation: "Lobby",
        resourceOptions: [],
      },
    ];

    expect(fromActivities(activities)[0]?.meetingLocation).toEqual({
      summary: "Lobby",
      address: null,
      url: null,
    });
  });

  it("falls back to empty productId when neither id is present", () => {
    const activities = [
      {
        name: "Anonymous",
        id: "",
        type: "ACTIVITY",
        colorHex: "#000000",
        resourceOptions: [],
      },
    ] as unknown as ActivityNode[];

    expect(fromActivities(activities)[0]?.productId).toBe("");
  });
});

describe("fromItemOptionNodes", () => {
  it("groups options under their parent item as add-on products", () => {
    const nodes: ItemOptionNode[] = [
      {
        id: "opt-1",
        name: "Helmet",
        description: null,
        item: { id: "item-1", name: "Safety Gear" },
      },
      {
        id: "opt-2",
        name: "Life Vest",
        description: "Required",
        item: { id: "item-1", name: "Safety Gear" },
      },
      {
        id: "opt-3",
        name: "Photo Package",
        description: null,
        item: { id: "item-2", name: "Extras" },
      },
    ];

    expect(fromItemOptionNodes(nodes)).toEqual([
      {
        productId: "item-1",
        name: "Safety Gear",
        type: ADD_ON_PRODUCT_TYPE,
        color: "#FFFFFF",
        currency: "",
        imageUrl: null,
        description: null,
        meetingLocation: null,
        tickets: [
          { id: "opt-1", name: "Helmet", minPrice: null, maxPrice: null },
          { id: "opt-2", name: "Life Vest", minPrice: null, maxPrice: null },
        ],
      },
      {
        productId: "item-2",
        name: "Extras",
        type: ADD_ON_PRODUCT_TYPE,
        color: "#FFFFFF",
        currency: "",
        imageUrl: null,
        description: null,
        meetingLocation: null,
        tickets: [{ id: "opt-3", name: "Photo Package", minPrice: null, maxPrice: null }],
      },
    ]);
  });

  it("skips nodes without a parent item id", () => {
    const nodes = [
      { id: "opt-x", name: "Orphan", description: null, item: { id: "", name: "" } },
    ] as unknown as ItemOptionNode[];

    expect(fromItemOptionNodes(nodes)).toEqual([]);
  });

  it("returns an empty list for no nodes", () => {
    expect(fromItemOptionNodes([])).toEqual([]);
  });
});
