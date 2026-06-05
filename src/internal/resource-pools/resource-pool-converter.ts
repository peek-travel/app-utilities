/**
 * Pure functions mapping raw resource-pool nodes into the clean
 * {@link ResourcePool} model.
 */
import type {
  ResourcePool,
  ResourcePoolAccountUser,
} from "../../models/resource-pool.js";
import type {
  ResourcePoolNode,
  ResourcePoolsResponse,
} from "./resource-pool-queries.js";

/** Converts a resource-pools response into {@link ResourcePool}s. */
export function fromResourcePoolsResponse(
  response: ResourcePoolsResponse | undefined,
): ResourcePool[] {
  return (response?.resourcePools ?? []).map(fromResourcePoolNode);
}

function fromResourcePoolNode(pool: ResourcePoolNode): ResourcePool {
  return {
    id: pool.id || "",
    name: pool.name || "",
    imageUrl: pool.imageUrl ?? null,
    mode: pool.mode || "",
    colorHex: pool.colorHex ?? null,
    quantity: pool.quantity ?? null,
    category: pool.category || "",
    capacity: pool.capacity ?? null,
    resourceTrackingMode: pool.resourceTrackingMode ?? null,
    accountUser: fromAccountUser(pool.accountUser),
  };
}

function fromAccountUser(
  accountUser: { id: string; name: string } | null | undefined,
): ResourcePoolAccountUser | null {
  if (!accountUser) {
    return null;
  }
  return {
    id: accountUser.id || "",
    name: accountUser.name || "",
  };
}
