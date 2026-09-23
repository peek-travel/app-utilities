/**
 * Endpoint routing for the CNG backoffice REST gateway. Shared across the CNG
 * resources so each value lives in exactly one place, with {@link CNG_API_ENDPOINTS}
 * as the simple lookup a new CNG API extends. (The Peek gateway routing lives
 * separately in `../gateway-endpoints.ts`.)
 */
import { ApiEndpoints } from "../api-endpoints.js";

/**
 * Routing slug inserted between the base API URL and the REST path. This is the
 * only routing difference from the Peek gateway (`peek_backoffice_api-v1`).
 */
export const CNG_EXTENDABLE_SLUG = "cng_backoffice_api-v1";

/** Endpoint key for the app-registry products list. */
export const CNG_PRODUCTS_ENDPOINT = "products";

/**
 * REST path (relative to the slug) for the app-registry products list.
 * `active=1` keeps the gateway from returning inactive/archived products, so
 * only bookable activities come back.
 */
export const PRODUCTS_PATH = "api/v2/app-registry/products?active=1";

/** The endpoint keys the CNG REST transport knows how to route. */
export type CngEndpointKey = typeof CNG_PRODUCTS_ENDPOINT;

/**
 * The CNG endpoint lookup — maps each endpoint key to the routing slug appended
 * to the base API URL. Add a new CNG API by adding one entry (with its own slug
 * when it needs a different one).
 */
export const CNG_API_ENDPOINTS: ApiEndpoints<CngEndpointKey> = new ApiEndpoints({
  [CNG_PRODUCTS_ENDPOINT]: CNG_EXTENDABLE_SLUG,
});
