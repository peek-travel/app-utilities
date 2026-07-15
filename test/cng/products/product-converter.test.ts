import { describe, expect, it } from "vitest";

import { fromProductNodes } from "../../../src/internal/cng/products/product-converter.js";
import type { ProductNode } from "../../../src/internal/cng/products/product-queries.js";

describe("cng fromProductNodes", () => {
  it("maps a fully-populated node to an Activity", () => {
    const nodes: ProductNode[] = [
      {
        id: "prod-1",
        name: "Kayak Tour",
        product_type: "ACTIVITY",
        color_hex: "#1A2B3C",
        tickets: [{ id: "t1", name: "Adult" }],
      },
    ];

    expect(fromProductNodes(nodes)).toEqual([
      {
        productId: "prod-1",
        name: "Kayak Tour",
        type: "ACTIVITY",
        color: "#1A2B3C",
        tickets: [{ id: "t1", name: "Adult" }],
      },
    ]);
  });

  it("applies defaults for missing/null optional fields", () => {
    const nodes = [{ id: "prod-2", name: "Bare" }] as ProductNode[];

    expect(fromProductNodes(nodes)).toEqual([
      {
        productId: "prod-2",
        name: "Bare",
        type: "ACTIVITY",
        color: "",
        tickets: [],
      },
    ]);
  });

  it("coerces missing id/name to empty strings and null color to empty", () => {
    const nodes = [
      { product_type: "TOUR", color_hex: null, tickets: [] },
    ] as unknown as ProductNode[];

    expect(fromProductNodes(nodes)).toEqual([
      { productId: "", name: "", type: "TOUR", color: "", tickets: [] },
    ]);
  });

  it("returns an empty list for no nodes", () => {
    expect(fromProductNodes([])).toEqual([]);
  });
});
