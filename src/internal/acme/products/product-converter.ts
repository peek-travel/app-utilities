/**
 * Pure functions that map raw ACME template nodes into the clean
 * {@link AcmeActivity} model. No I/O — straightforward, testable
 * transformations.
 *
 * Only `"published"` templates are surfaced; ACME does not expose tickets, so
 * every activity carries an empty `tickets` list.
 */
import { ACME_ACTIVITY_TYPE, type AcmeActivity } from "../../../models/acme/product.js";
import { PUBLISHED_REVIEW_STATE, type TemplateNode } from "./product-queries.js";

/**
 * Converts a list of raw template nodes into {@link AcmeActivity}s, keeping only
 * published templates.
 */
export function fromTemplateNodes(nodes: TemplateNode[]): AcmeActivity[] {
  return nodes
    .filter((node) => node.reviewState === PUBLISHED_REVIEW_STATE)
    .map(fromTemplateNode);
}

/** Converts a single raw template node into an {@link AcmeActivity}. */
function fromTemplateNode(node: TemplateNode): AcmeActivity {
  return {
    productId: node.id || "",
    name: node.name || "",
    type: node.type || ACME_ACTIVITY_TYPE,
    color: node.colorCategory?.backgroundColor || "#d1d1d1",
    tickets: [],
  };
}
