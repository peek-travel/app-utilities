/**
 * Pure functions that map raw Peek GraphQL nodes into the clean {@link Product}
 * model. No I/O — straightforward, testable transformations.
 */
import {
  ADD_ON_PRODUCT_TYPE,
  type Product,
  type ProductMeetingLocation,
} from "../../../models/peek/product.js";
import { toPricingMoney } from "../money.js";
import type { ActivityNode, ItemOptionNode } from "./product-queries.js";

/** Default display color applied to add-on products. */
const ADD_ON_COLOR = "#FFFFFF";

/**
 * Builds a {@link ProductMeetingLocation} from the flat activity fields,
 * collapsing to `null` when Peek reports no location detail at all. Each field
 * is independently nullable.
 */
function toMeetingLocation(activity: ActivityNode): ProductMeetingLocation | null {
  const summary = activity.infoMeetingLocation ?? null;
  const address = activity.meetingLocationFormattedAddress ?? null;
  const url = activity.meetingLocationUrl ?? null;
  if (summary === null && address === null && url === null) return null;
  return { summary, address, url };
}

/** Converts the activities from a products response into {@link Product}s. */
export function fromActivities(activities: ActivityNode[]): Product[] {
  return activities.map(fromActivity);
}

/** Converts a single activity node into a {@link Product}. */
function fromActivity(activity: ActivityNode): Product {
  return {
    // Prefer the primary GraphQL ID for stable product identity.
    productId: activity.id || activity.legacyId || "",
    name: activity.name,
    type: activity.type,
    color: activity.colorHex || "",
    currency: activity.currency || "",
    imageUrl: activity.imageUrl ?? null,
    description: activity.description ?? null,
    meetingLocation: toMeetingLocation(activity),
    tickets: (activity.resourceOptions ?? []).map((option) => ({
      id: option.id,
      name: option.name,
      minPrice: toPricingMoney(option.priceRange?.min),
      maxPrice: toPricingMoney(option.priceRange?.max),
    })),
  };
}

/**
 * Converts a flat list of item option nodes into add-on {@link Product}s by
 * grouping each option under its parent item. The parent item id becomes the
 * `productId` and its name becomes the product `name`; each option becomes a
 * ticket.
 */
export function fromItemOptionNodes(nodes: ItemOptionNode[]): Product[] {
  const grouped = new Map<string, Product>();

  for (const node of nodes) {
    const itemId = node.item?.id;
    if (!itemId) continue;

    let product = grouped.get(itemId);
    if (!product) {
      product = {
        productId: itemId,
        name: node.item.name,
        type: ADD_ON_PRODUCT_TYPE,
        color: ADD_ON_COLOR,
        currency: "",
        imageUrl: null,
        description: null,
        meetingLocation: null,
        tickets: [],
      };
      grouped.set(itemId, product);
    }
    product.tickets.push({
      id: node.id,
      name: node.name,
      minPrice: null,
      maxPrice: null,
    });
  }

  return Array.from(grouped.values());
}
