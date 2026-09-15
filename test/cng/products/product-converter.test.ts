import { describe, expect, it } from "vitest";

import { fromProductNodes } from "../../../src/internal/cng/products/product-converter.js";
import type { ProductNode } from "../../../src/internal/cng/products/product-queries.js";

describe("cng fromProductNodes", () => {
  it("maps a fully-populated node to an Activity", () => {
    const nodes: ProductNode[] = [
      {
        id: 1000171,
        name: "10 students + Complimentary chaperone",
        slug: "10-students-complimentary-chaperone",
        status: "ACTIVE",
        access_control_color_hex: "#1A2B3C",
        custom_access_control_color: true,
      },
    ];

    expect(fromProductNodes(nodes)).toEqual([
      {
        productId: "1000171",
        name: "10 students + Complimentary chaperone",
        type: "ACTIVITY",
        color: "#1A2B3C",
        tickets: [],
      },
    ]);
  });

  it("applies defaults for missing/null optional fields", () => {
    const nodes: ProductNode[] = [
      {
        id: 1000171,
        name: "Bare",
        access_control_color_hex: null,
        custom_access_control_color: false,
      },
    ];

    expect(fromProductNodes(nodes)).toEqual([
      {
        productId: "1000171",
        name: "Bare",
        type: "ACTIVITY",
        color: "",
        tickets: [],
      },
    ]);
  });

  it("accepts a string id as-is and coerces a missing name to an empty string", () => {
    const nodes = [{ id: "1000171" }] as ProductNode[];

    expect(fromProductNodes(nodes)).toEqual([
      { productId: "1000171", name: "", type: "ACTIVITY", color: "", tickets: [] },
    ]);
  });

  it("coerces a missing id to an empty string", () => {
    const nodes = [{ name: "No id" }] as unknown as ProductNode[];

    expect(fromProductNodes(nodes)).toEqual([
      { productId: "", name: "No id", type: "ACTIVITY", color: "", tickets: [] },
    ]);
  });

  it("returns an empty list for no nodes", () => {
    expect(fromProductNodes([])).toEqual([]);
  });
});
