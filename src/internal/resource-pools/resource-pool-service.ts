/**
 * Resource-pool operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getResourcePoolService}.
 */
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type {
  ResourcePool,
  ResourcePoolMode,
} from "../../models/resource-pool.js";
import { fromResourcePoolsResponse } from "./resource-pool-converter.js";
import {
  RESOURCE_POOLS_QUERY,
  type ResourcePoolsResponse,
} from "./resource-pool-queries.js";

/** Default mode filter (matches the connector). */
const DEFAULT_MODE: ResourcePoolMode = "ALL";

export class ResourcePoolService {
  constructor(private readonly client: GraphQLClient) {}

  /**
   * Returns all resource pools for the given mode filter (defaults to `"ALL"`).
   */
  async getAll(mode: ResourcePoolMode = DEFAULT_MODE): Promise<ResourcePool[]> {
    const body: GraphQLBody<ResourcePoolsResponse> =
      await this.client.request<ResourcePoolsResponse>(
        SALES_ENDPOINT,
        RESOURCE_POOLS_QUERY,
        { filter: { mode } },
      );
    return fromResourcePoolsResponse(body.data);
  }
}
