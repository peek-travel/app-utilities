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
export const SDK_VERSION = "0.8.2";

/** The `x-peek-sdk` header value, e.g. `js-0.8.2`. */
export const SDK_HEADER_VALUE = `${SDK_PLATFORM}-${SDK_VERSION}`;
