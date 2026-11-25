# Access service & authentication

> Part of the [`@peektravel/app-utilities` architecture overview](./ARCHITECTURE.md).

## `PeekAccessService` — the authenticated root

`src/peek-access-service.ts`

- Validates the required config fields and throws on any empty value:
  `installId`, `jwtSecret`, `issuer` always; `appId` and `gatewayKey` only in the
  legacy `baseUrl` mode (both are unneeded when `apiUrl` is set — see the
  endpoint-URL note below).
- Constructs a single shared `TokenManager` and `GraphQLClient`.
- Exposes one `get<Resource>Service()` accessor per resource. Each is **lazily
  created and memoized** — repeated calls return the same instance.
- Historically exposed **top-level short-form methods** that delegate directly to
  the underlying service (e.g. `peek.getAllProducts()` →
  `peek.getProductService().getAllProducts()`). These are now **`@deprecated`** —
  callers should reach a resource-service method through its
  `get<Resource>Service()` accessor, and no new short-forms should be added. The
  existing ones remain for backwards-compatibility only.
- Exposes `verifyPeekAuthToken(token)` to verify HMAC-signed JWTs issued by
  the Peek app registry (`iss: "app_registry_v2"`, `aud: "Joken"`), returning
  a fully typed `PeekAuthTokenClaims` (including the nested `PeekAuthTokenUser`,
  which is now nullable). Throws `JsonWebTokenError` / `TokenExpiredError` /
  `NotBeforeError` from `jsonwebtoken` on failure. Claim *extraction* is
  defensive and never throws: the shared `mapPeekTokenUser` returns `null` for
  an absent `user` block and normalizes every field independently (a sentinel
  `""`/`"null"` id becomes `null`), so `verifyInstallWebhook` inherits the same
  tolerance. The signature-check core (issuer + audience + user mapping) lives
  in the internal `peek-auth-token.ts` module, shared with the standalone
  `verifyInstallWebhook` (the install webhook, in
  [per-resource services](./resources.md)) so the two can't drift apart. That
  core (`verifyPeekJwt`) also strips a leading `Bearer ` prefix from the token,
  so every entry point in the family accepts the raw `x-peek-auth` header value.
- Composes dependencies between services where needed:
  - `TimeslotService` receives the resource-pool and account-user services (for
    guide resolution).
  - `BookingService` receives the product service (for add-on → parent-item
    resolution).
- Optional config: `apiUrl` (see the endpoint-URL note below), `mode` (`"v2"` —
  see below), `baseUrl`, `tokenTtlSeconds` (3600), `tokenRefreshLeewaySeconds`
  (60), `retryDelaysMs` (`[1000, 2000, 4000]`), `logger` (no-op default),
  `fetch` (global default), `itemOptionsPageSize` (50), and `accessOptions`
  (see [Access options / PII](./pii.md)).
- **Base API URL + per-service slug.** Every request URL is
  `baseApiUrl / <slug> [ / <path> ]`, where the **base API URL** is the install's
  app endpoint with no routing segment and the **slug** is chosen *per service /
  per endpoint* from that platform's endpoint lookup (`ApiEndpoints`, in
  `src/internal/api-endpoints.ts`). Two services on one platform can therefore
  route through different slugs — a new API is one more entry in the lookup
  (`peekApiEndpoints` in `gateway-endpoints.ts`; `CNG_API_ENDPOINTS` /
  `ACME_API_ENDPOINTS` in each `endpoints.ts`). The clients hold only
  `{ baseApiUrl, endpoints }` and build the URL via `joinUrl`, so an empty slug
  collapses cleanly to `baseApiUrl / <path>`.
- **Resolving the base — `apiUrl` (preferred) vs. `baseUrl`/`appId` (deprecated).**
  When the config carries `apiUrl`, the access-service constructor runs it
  through the shared `resolveBaseApiUrl(apiUrl, platformSlug, serviceName)` helper
  (`access-service-config.ts`) to recover the base: it **returns the URL as-is**
  when no slug is present, **strips this platform's slug** back off when the URL
  already ends in one (dashes and underscores interchangeable, so both
  `peek_backoffice_api-v1` and `peek-backoffice-api-v1` match), and **throws** when
  it ends in a *different* platform's slug (a wiring mistake). When `apiUrl` is
  absent the base is `baseUrl/appId` (the deprecated default construction, with a
  hardcoded default `baseUrl`) — the fallback will be removed and a URL will
  become required. Either way, no app-id segment is inserted beyond the base, so
  `appId` is unused with `apiUrl` (and `gatewayKey` isn't required — the registry
  endpoint authenticates on the JWT, like v2). `createAccessServiceForInstall`
  (see Public API surface below) is the front door for the `apiUrl` path.
- **Peek registry (`"v2"`) vs. legacy (`"v1"`).** `mode` is a **required**
  `"v1" | "v2"` field on `PeekAccessServiceConfig` (it used to be optional and
  default to v1; it is now mandatory, with a constructor guard that throws so even
  an untyped JS caller gets a loud, actionable error). `"v2"` routes the `sales`
  endpoint through the `peek_backoffice_api-v1` slug, so the GraphQL POST hits
  `<base>/peek_backoffice_api-v1` (no trailing `sales` segment); it **requires**
  the install's `apiUrl` (the constructor throws without it — there is no silent
  default). `V2_FALLBACK_URL_PREFIX` (`https://apps.peek.com/installations-api`) is
  not applied automatically and is **not a complete URL** — it is only the
  documented prefix a developer appends their **app slug** to
  (`<prefix>/<app-slug>`, the same shape as the webhook's `api.url`) and passes as
  `apiUrl` when they lack a webhook URL. `"v1"` (**deprecated, will
  be removed**) is the legacy backoffice-GraphQL gateway: no extendable slug, so
  `sales` sits directly under the base (`<baseUrl>/<appId>/sales`), the default
  `baseUrl` is the backoffice-GraphQL gateway, and `gatewayKey` is required. An
  app-endpoint `apiUrl` also routes through the slug and, when set, supersedes
  `baseUrl` entirely. All other behaviour (JWT auth, headers, retries, resource
  services) is unchanged.

## `TokenManager` — auth

`src/internal/token-manager.ts`

- Signs a short-lived HMAC JWT with `jsonwebtoken` (`subject = installId`,
  `issuer = app name`, `expiresIn = ttlSeconds`). Payload is empty.
- Caches the token and re-mints it once it is within `leewaySeconds` of expiry.

## Public API surface

`src/index.ts`

The barrel re-exports only the public contract: `PeekAccessService` + its config,
the `createAccessServiceForInstall` factory (+ its `InstallAccessTarget` /
`InstallAccessConfig` / `InstallAccessService` types — builds the right access
service for an install's `platform`, wired to its `apiUrl`),
the `AccessOptions` type (see [Access options / PII](./pii.md)), each resource service class (and the
options/result types callers need), all data-model **types** (including
`PeekAuthTokenClaims`, `PeekAuthTokenUser`, and the install-webhook
`InstallWebhookClaims`/`InstallWebhookAccount`), the `Logger` interface +
`noopLogger`, and the typed error classes (`AdminAccountRequiredError`,
`RateLimitError`, `PeekGraphQLError`, `PeekHttpError`, `PiiAccessDisabledError`,
`UnknownSeatmapDisplayTypeError`, `UnknownSeatmapBlockStatusError`,
`UnknownSeatmapAssignmentParentError`, `SeatmapDeleteError`, `InstallWebhookError`
(extends `jsonwebtoken`'s `JsonWebTokenError`; + its `InstallWebhookErrorReason`
type), `CngApiError`, `CngPermissionError`, `AcmeApiError`). Query strings and raw
response interfaces are deliberately kept
internal — including the booking-webhook registration query
(`BOOKING_WEBHOOK_GQL_QUERY` stays internal, documented via `docs/webhooks.md`).
The webhook-related public exports are the two parsers `parseBookingWebhook` and
`parseWaiverWebhook` plus the install-webhook parser `parseInstallWebhook` and the
`@deprecated` `verifyInstallWebhook` (and the `Waiver` / `InstallWebhook` /
`InstallStatus` / `InstallWebhookClaims` model types and the `INSTALL_STATUSES`
constant; see the webhook notes in [per-resource services](./resources.md)).
