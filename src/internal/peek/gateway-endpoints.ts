/**
 * Endpoint routing for the backoffice GraphQL gateway. Every current operation
 * routes through the `sales` endpoint; the endpoint key and slugs live here so
 * they sit in exactly one place, and {@link peekApiEndpoints} is the simple
 * lookup a new Peek API extends.
 */
import { ApiEndpoints } from "../api-endpoints.js";

/** The GraphQL endpoint key every current Peek operation routes through. */
export const SALES_ENDPOINT = "sales";

/** Registry routing slug for the `sales` endpoint (v2 / app-endpoint mode). */
export const V2_EXTENDABLE_SLUG = "peek_backoffice_api-v1";

/** The endpoint keys the Peek GraphQL transport knows how to route. */
export type PeekEndpointKey = typeof SALES_ENDPOINT;

/**
 * Builds the Peek endpoint lookup for a transport generation.
 *
 * - **Registry mode** (`useRegistrySlug` — v2 or an app-endpoint `apiUrl`): the
 *   `sales` endpoint routes through the `peek_backoffice_api-v1` slug appended
 *   to the base API URL, and the GraphQL POST hits that slug directly.
 * - **Legacy v1 mode**: the backoffice-GraphQL gateway has no extendable slug,
 *   so `sales` sits directly under the base (`base/sales`).
 *
 * Add a new Peek API by adding one entry — with its own slug when it needs one.
 */
export function peekApiEndpoints(
  useRegistrySlug: boolean,
): ApiEndpoints<PeekEndpointKey> {
  return new ApiEndpoints({
    [SALES_ENDPOINT]: useRegistrySlug ? V2_EXTENDABLE_SLUG : SALES_ENDPOINT,
  });
}
