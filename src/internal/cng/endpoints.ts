/**
 * Path segments for the CNG backoffice REST gateway. Shared across the CNG
 * resources so each value lives in exactly one place. (The Peek gateway
 * segments live separately in `../gateway-endpoints.ts`.)
 */

/**
 * Fixed extendable slug inserted between `appId` and the REST path. This is the
 * only routing difference from the Peek gateway (`peek_backoffice_api-v1`).
 */
export const CNG_EXTENDABLE_SLUG = "cng_backoffice_api-v1";

/**
 * REST path (relative to the extendable) for the app-registry products list.
 * `active=1` keeps the gateway from returning inactive/archived products, so
 * only bookable activities come back.
 */
export const PRODUCTS_PATH = "api/v2/app-registry/products?active=1";
