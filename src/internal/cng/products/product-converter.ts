/**
 * Pure functions that map raw CNG product nodes into the clean {@link Activity}
 * model. No I/O — straightforward, testable transformations.
 *
 * The CNG products payload carries no product-type discriminator and no
 * sub-options, so every activity reports the {@link ACTIVITY_PRODUCT_TYPE} type
 * and an empty `tickets` list (same as ACME). Only `productId`, `name`, and
 * `color` come from the payload.
 */
import { ACTIVITY_PRODUCT_TYPE, type Activity } from "../../../models/cng/product.js";
import type { ProductNode } from "./product-queries.js";

/** Converts a list of raw product nodes into {@link Activity}s. */
export function fromProductNodes(nodes: ProductNode[]): Activity[] {
  return nodes.map(fromProductNode);
}

/** Converts a single raw product node into an {@link Activity}. */
function fromProductNode(node: ProductNode): Activity {
  return {
    productId: node.id == null ? "" : String(node.id),
    name: node.name || "",
    type: ACTIVITY_PRODUCT_TYPE,
    color: node.access_control_color_hex || "",
    tickets: [],
  };
}
