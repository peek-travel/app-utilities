/**
 * Endpoint routing for the ACME backoffice REST gateway. Shared across the ACME
 * resources so each value lives in exactly one place, with {@link ACME_API_ENDPOINTS}
 * as the simple lookup a new ACME API extends. (The CNG gateway routing lives
 * separately in `../cng/endpoints.ts`.)
 */
import { ApiEndpoints } from "../api-endpoints.js";

/**
 * Routing slug inserted between the base API URL and the REST path. This is the
 * only routing difference from the other gateways (CNG uses
 * `cng_backoffice_api-v1`; Peek uses `peek_backoffice_api-v1`).
 */
export const ACME_EXTENDABLE_SLUG = "acme_backoffice_api-v1";

/** Endpoint key for the event-template names list. */
export const ACME_TEMPLATES_ENDPOINT = "templates";

/** REST path (relative to the slug) for the event-template names list. */
export const TEMPLATES_PATH = "v2/b2b/event/templates/names?pageSize=-1&page=1";

/** The endpoint keys the ACME REST transport knows how to route. */
export type AcmeEndpointKey = typeof ACME_TEMPLATES_ENDPOINT;

/**
 * The ACME endpoint lookup — maps each endpoint key to the routing slug appended
 * to the base API URL. Add a new ACME API by adding one entry (with its own slug
 * when it needs a different one).
 */
export const ACME_API_ENDPOINTS: ApiEndpoints<AcmeEndpointKey> = new ApiEndpoints({
  [ACME_TEMPLATES_ENDPOINT]: ACME_EXTENDABLE_SLUG,
});
