/**
 * Raw Peek GraphQL query and response shape for resource pools. Internal.
 */

/** Fetches resource pools matching a mode filter. */
export const RESOURCE_POOLS_QUERY = `
  query Sales($filter: ResourcePoolsFilter) {
    resourcePools(filter: $filter) {
      id
      name
      imageUrl
      mode
      colorHex
      quantity
      category
      capacity
      resourceTrackingMode
      accountUser {
        id
        name
      }
    }
  }
`;

/** A single resource-pool node as returned by {@link RESOURCE_POOLS_QUERY}. */
export interface ResourcePoolNode {
  id: string;
  name: string;
  imageUrl: string | null;
  mode: string;
  colorHex: string | null;
  quantity: number | null;
  category: string;
  capacity: number | null;
  resourceTrackingMode: string | null;
  accountUser: { id: string; name: string } | null;
}

/** The `data` payload of {@link RESOURCE_POOLS_QUERY}. */
export interface ResourcePoolsResponse {
  resourcePools: ResourcePoolNode[];
}
