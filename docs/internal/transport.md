# Transport & SDK identity

> Part of the [`@peektravel/app-utilities` architecture overview](./ARCHITECTURE.md).

## `GraphQLClient` — transport

`src/internal/peek/graphql-client.ts`

The place that touches the network for Peek. The retry/backoff loop and 418/429
mapping are **shared** with the CNG transport in
`src/internal/http-transport.ts` (`requestWithRetry`): both clients build their
own `url`/`init`, log their own "Making … request" line, and pass a per-response
callback that handles the transport-specific success/error parsing.
Responsibilities:

- Builds the endpoint URL as `joinUrl(baseApiUrl, endpoints.pathFor(endpointName))`,
  then appends the SDK identification query string `?sdk=js-<package version>`
  (`SDK_QUERY_STRING` from `sdk-headers.ts`) so the gateway can attribute traffic
  from the URL as well as the `x-peek-sdk` header. Today every operation routes
  through the single `sales` endpoint (`gateway-endpoints.ts`), whose slug is
  `peek_backoffice_api-v1` in registry modes and empty (the `sales` segment
  itself) on the legacy v1 gateway.
- Sets headers: `X-Peek-Auth: Bearer <jwt>`, `pk-api-key: <gatewayKey>`,
  `Content-Type: application/json`, `x-peek-sdk: js-<package version>`.
- Collapses query whitespace (`\s+` → single space) before sending.
- Retries HTTP 429 using the configured backoff delays, then throws
  `RateLimitError`.
- Reads the response body via the shared `parseBody` helper (`text()` → try
  `JSON.parse`, falling back to raw text) *before* branching on status, so a
  non-JSON error page never throws a `SyntaxError` that hides the real status.
- Maps known failures to typed errors:
  - HTTP 418 → `AdminAccountRequiredError`
  - HTTP 429 (after retries) → `RateLimitError`
  - GraphQL `errors` array present → `PeekGraphQLError` (raw errors preserved on
    `.graphqlErrors`)
  - other non-2xx → `PeekHttpError` (carries `.statusCode`, `.url`, and raw
    `.body`).

## `x-peek-sdk` — SDK identification header

`src/internal/sdk-headers.ts`

All three transports (Peek `GraphQLClient`, CNG `RestClient`, ACME `RestClient`)
send `x-peek-sdk: js-<version>` on every request so the downstream platforms can
attribute traffic to this package and its version. The module exports
`SDK_HEADER_NAME`, `SDK_VERSION`, and the precomputed `SDK_HEADER_VALUE`; it is
internal and not re-exported from `src/index.ts`.

The Peek `GraphQLClient` additionally appends the same identity to the request
URL as a query string, `?sdk=js-<version>` (the exported `SDK_QUERY_STRING`, the
same `js-<version>` value as the header in a single param),
so attribution survives contexts that only see the URL and not the headers. The
REST transports do not add it.

The version itself is the **front-and-center `VERSION` const in `src/version.ts`**
— the single source of truth that `SDK_VERSION` re-exports. It is a **static
literal**, not a runtime `package.json` read: the dual ESM+CJS build has no
portable self-location (`import.meta.url` is ESM-only, `__dirname` CJS-only), and
a const keeps the package dependency-light and tree-shakeable.
`test/version.test.ts` is a drift guard that asserts `VERSION ===
package.json#version` — **bump both together**.
