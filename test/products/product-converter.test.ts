import { describe, expect, it } from "vitest";

import {
  fromActivities,
  fromItemOptionNodes,
} from "../../src/internal/products/product-converter.js";
import type {
  ActivityNode,
  ItemOptionNode,
} from "../../src/internal/products/product-queries.js";
import { ADD_ON_PRODUCT_TYPE } from "../../src/models/product.js";

describe("fromActivities", () => {
  it("maps an activity into a clean product", () => {
    const activities: ActivityNode[] = [
      {
        name: "Kayak Tour",
        id: "act-1",
        legacyId: "legacy-1",
        type: "ACTIVITY",
        colorHex: "#1A2B3C",
        resourceOptions: [
          { id: "r1", name: "Single" },
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
        tickets: [
          { id: "r1", name: "Single" },
          { id: "r2", name: "Double" },
        ],
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
        tickets: [],
      },
    ]);
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
        tickets: [
          { id: "opt-1", name: "Helmet" },
          { id: "opt-2", name: "Life Vest" },
        ],
      },
      {
        productId: "item-2",
        name: "Extras",
        type: ADD_ON_PRODUCT_TYPE,
        color: "#FFFFFF",
        tickets: [{ id: "opt-3", name: "Photo Package" }],
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
