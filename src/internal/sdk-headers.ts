/**
 * The SDK identification sent on every outbound gateway request (Peek GraphQL,
 * CNG REST, ACME REST) so the downstream platforms can attribute traffic to
 * this package and its version.
 *
 * The version itself lives in `src/version.ts` (the single, front-and-center
 * source of truth that is bumped on release and drift-guarded against
 * `package.json`); this module only shapes it into a header and query string.
 */
import { VERSION } from "../version.js";

/** Header name carrying the SDK identifier. */
export const SDK_HEADER_NAME = "x-peek-sdk";

/** Platform prefix in the header value (`<platform>-<version>`). */
const SDK_PLATFORM = "js";

/** The running package version, re-exported from the canonical {@link VERSION}. */
export const SDK_VERSION = VERSION;

/** The `x-peek-sdk` header value, e.g. `js-0.9.0`. */
export const SDK_HEADER_VALUE = `${SDK_PLATFORM}-${SDK_VERSION}`;

/** Query-param name carrying the SDK platform identifier. */
const SDK_QUERY_PARAM = "sdk";

/** Query-param name carrying the SDK version. */
const SDK_VERSION_QUERY_PARAM = "v";

/**
 * The SDK identification query string appended to every outbound Peek GraphQL
 * request URL (e.g. `sdk=js&v=<version>`), so the downstream platform can attribute
 * traffic to this package and its version from the URL as well as the
 * {@link SDK_HEADER_NAME} header.
 */
export const SDK_QUERY_STRING = `${SDK_QUERY_PARAM}=${SDK_PLATFORM}&${SDK_VERSION_QUERY_PARAM}=${SDK_VERSION}`;
