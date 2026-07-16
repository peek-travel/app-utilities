/**
 * Path segments for the ACME backoffice REST gateway. Shared across the ACME
 * resources so each value lives in exactly one place. (The CNG gateway segments
 * live separately in `../cng/endpoints.ts`.)
 */

/**
 * Fixed extendable slug inserted between `appId` and the REST path. This is the
 * only routing difference from the other gateways (CNG uses
 * `cng_backoffice_api-v1`; Peek uses `peek_backoffice_api-v1`).
 */
export const ACME_EXTENDABLE_SLUG = "acme_backoffice_api-v1";

/** REST path (relative to the extendable) for the event-template names list. */
export const TEMPLATES_PATH = "v2/b2b/event/templates/names?pageSize=-1&page=1";
