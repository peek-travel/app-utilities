import { describe, expect, it } from "vitest";

import { fromTemplateNodes } from "../../../src/internal/acme/products/product-converter.js";
import type { TemplateNode } from "../../../src/internal/acme/products/product-queries.js";

describe("acme fromTemplateNodes", () => {
  it("maps a published node to an activity using the background color", () => {
    const nodes: TemplateNode[] = [
      {
        id: "61f99bfe62bd1f467c39771f",
        name: "General Admission",
        type: "standard",
        admissionType: "standard",
        reviewState: "published",
        colorCategory: { backgroundColor: "#00695c", textColor: "#ffffff" },
      },
    ];

    expect(fromTemplateNodes(nodes)).toEqual([
      {
        productId: "61f99bfe62bd1f467c39771f",
        name: "General Admission",
        type: "standard",
        color: "#00695c",
        tickets: [],
      },
    ]);
  });

  it("filters out non-published templates", () => {
    const nodes: TemplateNode[] = [
      { id: "a", name: "Draft", reviewState: "draft" },
      { id: "b", name: "Archived", reviewState: "archived" },
      { id: "c", name: "Live", reviewState: "published" },
    ];

    expect(fromTemplateNodes(nodes)).toEqual([
      { productId: "c", name: "Live", type: "standard", color: "#d1d1d1", tickets: [] },
    ]);
  });

  it("applies defaults for missing/null optional fields", () => {
    const nodes: TemplateNode[] = [
      { id: "d", name: "Bare", reviewState: "published", colorCategory: null },
    ];

    expect(fromTemplateNodes(nodes)).toEqual([
      { productId: "d", name: "Bare", type: "standard", color: "#d1d1d1", tickets: [] },
    ]);
  });

  it("coerces missing id/name to empty strings and null color to the default", () => {
    const nodes = [
      {
        reviewState: "published",
        type: "vip",
        colorCategory: { backgroundColor: null },
      },
    ] as unknown as TemplateNode[];

    expect(fromTemplateNodes(nodes)).toEqual([
      { productId: "", name: "", type: "vip", color: "#d1d1d1", tickets: [] },
    ]);
  });

  it("returns an empty list for no nodes", () => {
    expect(fromTemplateNodes([])).toEqual([]);
  });
});
