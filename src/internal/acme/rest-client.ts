/**
 * Thin REST-over-HTTP transport for the ACME gateway, built on the global
 * `fetch`. Handles endpoint construction, auth headers, and REST-specific
 * response handling. The shared retry/backoff loop and 418/429 mapping live in
 * `../http-transport.ts` (used by the Peek GraphQL and CNG REST transports too).
 *
 * The REST sibling of `../cng/rest-client.ts`: requests are plain GETs (no
 * `{query, variables}` envelope, no GraphQL `errors` array), and there is no
 * `pk-api-key` header — the ACME gateway authenticates on the app JWT
 * (`X-Peek-Auth`) alone. Both transports share the same `TokenManager`,
 * `Logger`, base error types, and retry loop.
 */
import { AcmeApiError } from "../../errors.js";
import { ApiEndpoints, joinUrl } from "../api-endpoints.js";
import { parseBody, requestWithRetry } from "../http-transport.js";
import { SDK_HEADER_NAME, SDK_HEADER_VALUE } from "../sdk-headers.js";
import type { Logger } from "../../logger.js";

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
   * @throws {AcmeApiError} on any other non-2xx response
   */
  async get<T>(endpoint: string, path: string): Promise<T> {
    const { logger } = this.options;
    const url = this.endpoint(endpoint, path);

    logger.info("Making ACME request", { url, path });

    return requestWithRetry(
      this.options,
      url,
      { method: "GET", headers: this.buildHeaders() },
      path,
      async (response) => {
        const body = await parseBody(response);

        if (!response.ok) {
          logger.error(`ACME request failed with HTTP ${response.status}`, { url });
          throw new AcmeApiError(response.status, body);
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
