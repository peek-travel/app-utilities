/**
 * Thin REST-over-HTTP transport for the CNG gateway, built on the global
 * `fetch`. Handles endpoint construction, auth headers, and REST-specific
 * response handling. The shared retry/backoff loop and 418/429 mapping live in
 * `../http-transport.ts` (used by the Peek GraphQL transport too).
 *
 * The REST sibling of `../graphql-client.ts`, minus the GraphQL specifics:
 * requests are plain GETs (no `{query, variables}` envelope, no GraphQL `errors`
 * array), and there is no `pk-api-key` header — the CNG gateway authenticates on
 * the app JWT (`X-Peek-Auth`) alone. Both transports share the same
 * `TokenManager`, `Logger`, base error types, and retry loop.
 *
 * HTTP 403 is special-cased: the gateway uses it for "this app is missing
 * permission X", which is an expected misconfiguration rather than a fault, so
 * it is logged at `warn` (no stack, no body dump) and raised as the typed
 * {@link CngPermissionError} carrying the named permissions.
 */
import { CngApiError, CngPermissionError, FORBIDDEN_STATUS } from "../../errors.js";
import { ApiEndpoints, joinUrl } from "../api-endpoints.js";
import { parseBody, requestWithRetry } from "../http-transport.js";
import { SDK_HEADER_NAME, SDK_HEADER_VALUE } from "../sdk-headers.js";
import type { Logger } from "../../logger.js";

/** Separator between the gateway's prose and the permission name it names. */
const PERMISSION_SEPARATOR = ": ";

export interface RestClientOptions {
  /**
   * The install's **base API URL** (no trailing slash, no routing slug). Each
   * request builds `baseApiUrl/<slug>/<path>`, where the slug comes from
   * {@link endpoints} for the request's endpoint key.
   */
  baseApiUrl: string;
  /** Maps an endpoint key to the relative slug appended to {@link baseApiUrl}. */
  endpoints: ApiEndpoints;
  /** Supplies a valid bearer token for each request. */
  getToken: () => string;
  /** Backoff delays (ms) applied on successive HTTP 429 responses. */
  retryDelaysMs: number[];
  /** Diagnostics sink. */
  logger: Logger;
  /** `fetch` implementation to use. */
  fetchFn: typeof fetch;
}

export class RestClient {
  constructor(private readonly options: RestClientOptions) {}

  /**
   * Issues a GET against the named REST path and returns the parsed JSON body.
   * Retries on HTTP 429 per the configured backoff (via the shared
   * {@link requestWithRetry} loop).
   *
   * @throws {AdminAccountRequiredError} on HTTP 418
   * @throws {RateLimitError} on HTTP 429 after retries are exhausted
   * @throws {CngPermissionError} on HTTP 403 (app missing a permission)
   * @throws {CngApiError} on any other non-2xx response
   */
  async get<T>(endpoint: string, path: string): Promise<T> {
    const { logger } = this.options;
    const url = this.endpoint(endpoint, path);

    logger.info("Making CNG request", { url, path });

    return requestWithRetry(
      this.options,
      url,
      { method: "GET", headers: this.buildHeaders() },
      path,
      async (response) => {
        const body = await parseBody(response);

        if (response.status === FORBIDDEN_STATUS) {
          const permissions = extractMissingPermissions(body);
          // Expected for a misconfigured install — warn, don't error.
          logger.warn(`Missing permission for ${path} (HTTP 403)`, { url, permissions });
          throw new CngPermissionError(permissions, body);
        }

        if (!response.ok) {
          logger.error(`CNG request failed with HTTP ${response.status}`, { url });
          throw new CngApiError(response.status, body);
        }

        return body as T;
      },
    );
  }

  private endpoint(endpoint: string, path: string): string {
    const { baseApiUrl, endpoints } = this.options;
    return joinUrl(baseApiUrl, endpoints.pathFor(endpoint), path);
  }

  private buildHeaders(): Record<string, string> {
    return {
      "X-Peek-Auth": `Bearer ${this.options.getToken()}`,
      "Content-Type": "application/json",
      [SDK_HEADER_NAME]: SDK_HEADER_VALUE,
    };
  }
}

/** Shape of the gateway's 403 body: `{ errors: { permission: [...] }, message }`. */
interface ForbiddenBody {
  errors?: { permission?: unknown } | null;
}

/**
 * Pulls the permission names out of a 403 body. The gateway reports them as
 * sentences (`"The app does not have the required permission: products:read"`),
 * so the trailing token after the last `": "` is the permission itself; a
 * sentence without one is kept verbatim. Returns an empty list for any body
 * that does not carry `errors.permission` strings.
 */
function extractMissingPermissions(body: unknown): string[] {
  if (typeof body !== "object" || body === null) return [];
  const raw = (body as ForbiddenBody).errors?.permission;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.split(PERMISSION_SEPARATOR).pop()!.trim())
    .filter((permission) => permission.length > 0);
}
