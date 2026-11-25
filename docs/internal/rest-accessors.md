# REST accessors — CNG & ACME

> Part of the [`@peektravel/app-utilities` architecture overview](./ARCHITECTURE.md).

## CNG accessor (REST)

`src/cng-access-service.ts`, `src/internal/cng/`, `src/models/cng/product.ts`

A second, brand-parallel accessor for the **CNG** backoffice — REST, not
GraphQL. Deliberately low-churn: it sits alongside the Peek code and shares the
plumbing rather than forking the package.

- **`CngAccessService`** — validates four config fields (`installId`,
  `jwtSecret`, `issuer`, `appId`; **no `gatewayKey`** — the CNG gateway needs no
  `pk-api-key`). Builds the shared `TokenManager` and a `RestClient`, defaults
  the base URL to the app-registry installations API, and exposes
  `getProductService()` (plus a deprecated `getAllActivities()` short-form).
- **`RestClient`** (`src/internal/cng/rest-client.ts`) — the REST sibling of
  `GraphQLClient`. Builds `joinUrl(baseApiUrl, endpoints.pathFor(endpoint), path)`
  — the `products` endpoint's slug is `cng_backoffice_api-v1` — GETs it with `X-Peek-Auth: Bearer`
  and `x-peek-sdk` (no `pk-api-key`, no `{query,variables}` body), and runs
  through the shared
  `requestWithRetry` loop. Reads the body with the shared `parseBody` helper
  (`http-transport.ts`) — JSON with a raw-text fallback when unparseable — the
  same helper the Peek `GraphQLClient` and ACME `RestClient` use. Status mapping:
  403 → `CngPermissionError` (the gateway's "app is missing permission X"
  rejection — the permission names are parsed off `errors.permission` onto
  `.permissions`, and it is logged at **`warn`**, not `error`, because a
  misconfigured install is expected rather than a fault); any other non-2xx
  (other than 418/429) → `CngApiError` (status + body). The 403 branch is
  CNG-only — ACME and Peek still surface 403 as their generic HTTP error.
- **Products triad** (`src/internal/cng/products/`) — same shape as every Peek
  resource: `product-queries.ts` (raw REST `ProductNode`/`ProductsResponse`
  interfaces, internal), `product-converter.ts` (pure `fromProductNodes` →
  `Activity`), `product-service.ts` (`CngProductService.getAllActivities()`,
  reading the `{ data: [...] }` resource collection). Endpoint segments live in
  `src/internal/cng/endpoints.ts` — the products path
  `api/v2/app-registry/products?active=1`; the `active=1` filter is applied by
  the gateway, so inactive/archived products never reach the converter (ACME
  filters client-side instead, on `reviewState`).
- **Model** `src/models/cng/product.ts` — `Activity`/`ActivityTicket`, mirroring
  the Peek `Product` shape so both brands read uniformly. The CNG products
  payload carries no type discriminator and no sub-options, so `type` is always
  `ACTIVITY` and `tickets` is always empty (same as ACME); `productId` is the
  numeric REST `id` stringified, and `color` comes from
  `access_control_color_hex`.
- **Shared, not duplicated:** the config contract (`BaseAccessServiceConfig` +
  the `createTokenManager`/`requireNonEmpty` helpers and shared TTL/leeway/retry
  defaults, all in `src/access-service-config.ts`), `TokenManager`,
  `Logger`/`noopLogger`, the `AdminAccountRequiredError`/`RateLimitError` base
  errors, the `requestWithRetry` transport core, the build/test tooling, and the
  Odyssey UI. Each accessor's config just extends the base: `PeekAccessServiceConfig`
  adds `gatewayKey`/`mode`/`itemOptionsPageSize`; `CngAccessServiceConfig` adds
  nothing. So the only real per-accessor difference is the transport built and the
  services exposed.
- **Public exports:** `CngAccessService` + `CngAccessServiceConfig`,
  `CngProductService`, the `Activity`/`ActivityTicket` types, and
  `CngApiError`/`CngPermissionError` (added to the errors export). REST paths and
  raw response interfaces stay internal.

## ACME accessor (REST)

`src/acme-access-service.ts`, `src/internal/acme/`, `src/models/acme/product.ts`

A third, brand-parallel accessor for the **ACME** backoffice, built by cloning
the CNG accessor. Same auth/transport/tooling reuse as CNG (above) — only the
routing, endpoint, and response shape differ:

- **`AcmeAccessService`** — identical to `CngAccessService`: validates the same
  four config fields (`installId`, `jwtSecret`, `issuer`, `appId`; no
  `gatewayKey`), builds the shared `TokenManager` + a `RestClient`, defaults to
  the app-registry base URL, and exposes `getProductService()` +
  `getAllActivities()`.
- **`RestClient`** (`src/internal/acme/rest-client.ts`) — the CNG REST client
  cloned with the `templates` endpoint's slug `acme_backoffice_api-v1` (same `-v1`
  separator as CNG/Peek), logging `"Making ACME request"` and throwing
  `AcmeApiError` on non-2xx. Sends the same `X-Peek-Auth` / `x-peek-sdk`
  headers (see [SDK identification](./transport.md)).
- **Products triad** (`src/internal/acme/products/`) — `product-queries.ts`
  (raw `TemplateNode`/`TemplatesResponse` for the `{ list: [...] }` envelope,
  plus the `PUBLISHED_REVIEW_STATE` constant, internal), `product-converter.ts`
  (pure `fromTemplateNodes` → `AcmeActivity`, **filtering to published
  templates only** and mapping `colorCategory.backgroundColor` → `color`),
  `product-service.ts` (`AcmeProductService.getAllActivities()`, tolerating a
  `{ list: [...] }` envelope or a bare array). Endpoint segments live in
  `src/internal/acme/endpoints.ts` — the template-names path
  `v2/b2b/event/templates/names?pageSize=-1&page=1`.
- **Model** `src/models/acme/product.ts` — `AcmeActivity`/`AcmeActivityTicket`,
  mirroring the CNG `Activity` shape. ACME exposes no tickets today, so
  `tickets` is always empty; only `id`/`name`/`color` are populated.
- **Public exports:** `AcmeAccessService` + `AcmeAccessServiceConfig`,
  `AcmeProductService`, the `AcmeActivity`/`AcmeActivityTicket` types, and
  `AcmeApiError` (added to the errors export). Distinct type names avoid the
  collision with CNG's `Activity`. REST paths and raw response interfaces stay
  internal.
