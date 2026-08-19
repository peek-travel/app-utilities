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
import { parseBody, requestWithRetry } from "../http-transport.js";
import type { Logger } from "../../logger.js";

export interface RestClientOptions {
  /**
   * The install's app endpoint URL (the install webhook's `apiUrl`). When set it
   * is the **base URL** and only the REST path is appended (`apiUrl/path`) —
   * `baseUrl`/`appId`/`extendableSlug` are ignored. Takes precedence over
   * `baseUrl`.
   */
  apiUrl?: string;
  /**
   * Base URL of the backoffice gateway (no trailing slash). Used only when
   * `apiUrl` is not set; the URL is `baseUrl/appId/extendableSlug/path`.
   */
  baseUrl?: string;
  /** App ID, used in the endpoint path (legacy `baseUrl` mode only). */
  appId?: string;
  /** Fixed extendable slug inserted between `appId` and the REST path (legacy mode). */
  extendableSlug?: string;
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
  async get<T>(path: string): Promise<T> {
    const { logger } = this.options;
    const url = this.endpoint(path);

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

  private endpoint(path: string): string {
    const { apiUrl, baseUrl, appId, extendableSlug } = this.options;
    // The registry-provided app endpoint is the base — append only the REST path.
    if (apiUrl) return `${apiUrl}/${path}`;
    return `${baseUrl}/${appId}/${extendableSlug}/${path}`;
  }

  private buildHeaders(): Record<string, string> {
    return {
      "X-Peek-Auth": `Bearer ${this.options.getToken()}`,
      "Content-Type": "application/json",
    };
  }
}
