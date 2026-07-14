/**
 * Thin GraphQL-over-HTTP transport built on the global `fetch`. Handles
 * endpoint construction, auth headers, query whitespace collapsing, and
 * GraphQL-specific response handling. The shared retry/backoff loop and 418/429
 * mapping live in `./http-transport.ts` (used by the CNG REST transport too).
 */
import { PeekGraphQLError } from "../../errors.js";
import { requestWithRetry } from "../http-transport.js";
import type { Logger } from "../../logger.js";

/** The raw body of a GraphQL HTTP response. */
export interface GraphQLBody<T> {
  data?: T;
  errors?: unknown[];
}

export interface GraphQLClientOptions {
  /** Base URL of the backoffice GraphQL gateway (no trailing slash). */
  baseUrl: string;
  /** Peek app ID, used in the endpoint path. */
  appId: string;
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
  /**
   * Optional fixed path segment inserted between `appId` and the endpoint name.
   * Used in v2 mode: `baseUrl/appId/endpointPathPrefix/endpointName`.
   */
  endpointPathPrefix?: string;
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
        const body = (await response.json()) as GraphQLBody<T>;

        if (body.errors) {
          logger.error(`GraphQL errors for ${endpointName}`, {
            url,
            graphqlErrors: JSON.stringify(body.errors),
          });
          throw new PeekGraphQLError(body.errors);
        }

        if (!response.ok) {
          logger.error(`GraphQL request failed with HTTP ${response.status}`, { url });
          throw new Error(`GraphQL request failed with HTTP ${response.status}`);
        }

        return body;
      },
    );
  }

  private endpoint(endpointName: string): string {
    const { baseUrl, appId, endpointPathPrefix } = this.options;
    const prefix = endpointPathPrefix ? `${endpointPathPrefix}/` : "";
    return `${baseUrl}/${appId}/${prefix}${endpointName}`;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "X-Peek-Auth": `Bearer ${this.options.getToken()}`,
      "Content-Type": "application/json",
    };
    if (this.options.gatewayKey) {
      headers["pk-api-key"] = this.options.gatewayKey;
    }
    return headers;
  }
}
