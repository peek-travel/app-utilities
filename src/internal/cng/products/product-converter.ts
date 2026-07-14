/**
 * Pure functions that map raw CNG product nodes into the clean {@link Activity}
 * model. No I/O — straightforward, testable transformations.
 *
 * ⚠️ Field mapping is a best-guess placeholder; see `./product-queries.ts`.
 */
import { ACTIVITY_PRODUCT_TYPE, type Activity } from "../../../models/cng-product.js";
import type { ProductNode } from "./product-queries.js";

/** Converts a list of raw product nodes into {@link Activity}s. */
export function fromProductNodes(nodes: ProductNode[]): Activity[] {
  return nodes.map(fromProductNode);
}

/** Converts a single raw product node into an {@link Activity}. */
function fromProductNode(node: ProductNode): Activity {
  return {
    productId: node.id || "",
    name: node.name || "",
    type: node.product_type || ACTIVITY_PRODUCT_TYPE,
    color: node.color_hex || "",
    tickets: (node.tickets ?? []).map((ticket) => ({
      id: ticket.id,
      name: ticket.name,
    })),
  };
}
