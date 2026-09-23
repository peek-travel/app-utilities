/**
 * Thin GraphQL-over-HTTP transport built on the global `fetch`. Handles
 * endpoint construction, auth headers, query whitespace collapsing, and
 * GraphQL-specific response handling. The shared retry/backoff loop and 418/429
 * mapping live in `./http-transport.ts` (used by the CNG REST transport too).
 */
import { PeekGraphQLError, PeekHttpError } from "../../errors.js";
import { ApiEndpoints, joinUrl } from "../api-endpoints.js";
import { parseBody, requestWithRetry } from "../http-transport.js";
import { SDK_HEADER_NAME, SDK_HEADER_VALUE } from "../sdk-headers.js";
import type { Logger } from "../../logger.js";

/** The raw body of a GraphQL HTTP response. */
export interface GraphQLBody<T> {
  data?: T;
  errors?: unknown[];
}

/** Narrows an unknown parsed body to an inspectable object (not a string/null). */
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export interface GraphQLClientOptions {
  /**
   * The install's **base API URL** (no trailing slash, no routing slug). Every
   * GraphQL call POSTs to `baseApiUrl/<slug>`, where the slug comes from
   * {@link endpoints} for the request's endpoint name.
   */
  baseApiUrl: string;
  /** Maps an endpoint name to the relative slug appended to {@link baseApiUrl}. */
  endpoints: ApiEndpoints;
  /** API gateway key sent as the `pk-api-key` header. Omitted from headers when absent (v2 mode). */
  gatewayKey?: string;
  /** Supplies a valid bearer token for each request. */
  getToken: () => string;
  /** Backoff delays (ms) applied on successive HTTP 429 responses. */
  retryDelaysMs: number[];
  /** Diagnostics sink. */
  logger: Logger;
  /** `fetch` implementation to use. */
  fetchFn: typeof fetch;
}

export class GraphQLClient {
  constructor(private readonly options: GraphQLClientOptions) {}

  /**
   * Executes a GraphQL query against the named endpoint and returns the raw
   * response body. Retries on HTTP 429 per the configured backoff (via the
   * shared {@link requestWithRetry} loop).
   */
  async request<T>(
    endpointName: string,
    query: string,
    variables: object,
  ): Promise<GraphQLBody<T>> {
    const { logger } = this.options;
    const url = this.endpoint(endpointName);
    const collapsedQuery = query.replace(/\s+/g, " ").trim();

    logger.info("Making GraphQL request", { url, endpointName });

    return requestWithRetry(
      this.options,
      url,
      {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify({ query: collapsedQuery, variables }),
      },
      endpointName,
      async (response) => {
        // Parse the body defensively *before* branching on status: a non-JSON
        // error page (e.g. a `404` with a "Not Found" text body) must surface
        // as a typed HTTP error, not a `SyntaxError` that hides the real status.
        const raw = await parseBody(response);
        const body = (isObject(raw) ? raw : {}) as GraphQLBody<T>;

        if (body.errors) {
          logger.error(`GraphQL errors for ${endpointName}`, {
            url,
            graphqlErrors: JSON.stringify(body.errors),
          });
          throw new PeekGraphQLError(body.errors);
        }

        if (!response.ok) {
          logger.error(`GraphQL request failed with HTTP ${response.status}`, { url });
          throw new PeekHttpError(response.status, url, raw);
        }

        return body;
      },
    );
  }

  private endpoint(endpointName: string): string {
    const { baseApiUrl, endpoints } = this.options;
    return joinUrl(baseApiUrl, endpoints.pathFor(endpointName));
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "X-Peek-Auth": `Bearer ${this.options.getToken()}`,
      "Content-Type": "application/json",
      [SDK_HEADER_NAME]: SDK_HEADER_VALUE,
    };
    if (this.options.gatewayKey) {
      headers["pk-api-key"] = this.options.gatewayKey;
    }
    return headers;
  }
}
