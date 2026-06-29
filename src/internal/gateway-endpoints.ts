/**
 * Path segments for the backoffice GraphQL gateway. Every current operation
 * routes through the `sales` endpoint; this constant is shared across resources
 * so the value lives in exactly one place.
 */
export const SALES_ENDPOINT = "sales";

/** Fixed path segment inserted between `appId` and the endpoint name in v2 mode. */
export const V2_EXTENDABLE_SLUG = "peek_backoffice_api-v1";
