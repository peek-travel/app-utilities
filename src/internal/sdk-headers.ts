/**
 * The SDK identification header sent on every outbound gateway request (Peek
 * GraphQL, CNG REST, ACME REST) so the downstream platforms can attribute
 * traffic to this package and its version.
 *
 * The version is a literal rather than a `package.json` read: the dual ESM+CJS
 * build has no portable way to resolve its own `package.json` at runtime
 * (`import.meta.url` is ESM-only, `__dirname` is CJS-only), and a static const
 * keeps the package dependency-light and tree-shakeable. `sdk-headers.test.ts`
 * pins it to `package.json` so the two can never drift.
 */

/** Header name carrying the SDK identifier. */
export const SDK_HEADER_NAME = "x-peek-sdk";

/** Platform prefix in the header value (`<platform>-<version>`). */
const SDK_PLATFORM = "js";

/** Must equal the `version` field in `package.json`. */
export const SDK_VERSION = "1.3.1";

/** The `x-peek-sdk` header value, e.g. `js-0.9.0`. */
export const SDK_HEADER_VALUE = `${SDK_PLATFORM}-${SDK_VERSION}`;

/** Query-param name carrying the SDK platform identifier. */
const SDK_QUERY_PARAM = "sdk";

/** Query-param name carrying the SDK version. */
const SDK_VERSION_QUERY_PARAM = "v";

/**
 * The SDK identification query string appended to every outbound Peek GraphQL
 * request URL (e.g. `sdk=js&v=1.3.0`), so the downstream platform can attribute
 * traffic to this package and its version from the URL as well as the
 * {@link SDK_HEADER_NAME} header.
 */
export const SDK_QUERY_STRING = `${SDK_QUERY_PARAM}=${SDK_PLATFORM}&${SDK_VERSION_QUERY_PARAM}=${SDK_VERSION}`;
