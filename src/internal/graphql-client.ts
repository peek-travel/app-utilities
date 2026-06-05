/**
 * Thin GraphQL-over-HTTP transport built on the global `fetch`. Handles
 * endpoint construction, auth headers, query whitespace collapsing, HTTP 429
 * retry/backoff, and mapping known failure modes to typed errors.
 */
import {
  AdminAccountRequiredError,
  PeekGraphQLError,
  RateLimitError,
} from "../errors.js";
import type { Logger } from "../logger.js";

const RATE_LIMIT_STATUS = 429;
const ADMIN_ACCOUNT_REQUIRED_STATUS = 418;

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
  /** API gateway key sent as the `pk-api-key` header. */
  gatewayKey: string;
  /** Supplies a valid bearer token for each request. */
  getToken: () => string;
  /** Backoff delays (ms) applied on successive HTTP 429 responses. */
  retryDelaysMs: number[];
  /** Diagnostics sink. */
  logger: Logger;
  /** `fetch` implementation to use. */
  fetchFn: typeof fetch;
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class GraphQLClient {
  constructor(private readonly options: GraphQLClientOptions) {}

  /**
   * Executes a GraphQL query against the named endpoint and returns the raw
   * response body. Retries on HTTP 429 per the configured backoff.
   */
  async request<T>(
    endpointName: string,
    query: string,
    variables: object,
  ): Promise<GraphQLBody<T>> {
    const { retryDelaysMs, logger, fetchFn } = this.options;
    const url = this.endpoint(endpointName);
    const collapsedQuery = query.replace(/\s+/g, " ").trim();

    logger.info("Making GraphQL request", { url, endpointName });

    for (let attempt = 0; attempt <= retryDelaysMs.length; attempt++) {
      const response = await fetchFn(url, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify({ query: collapsedQuery, variables }),
      });

      if (response.status === ADMIN_ACCOUNT_REQUIRED_STATUS) {
        logger.warn(`Admin account required for ${endpointName} (HTTP 418)`, { url });
        throw new AdminAccountRequiredError();
      }

      if (response.status === RATE_LIMIT_STATUS) {
        const delay = retryDelaysMs[attempt];
        if (delay !== undefined) {
          logger.warn(
            `Rate limited on ${endpointName}, retrying in ${delay}ms ` +
              `(attempt ${attempt + 1}/${retryDelaysMs.length})`,
          );
          await sleep(delay);
          continue;
        }
        logger.error(`Rate limit exceeded for ${endpointName}`, { url });
        throw new RateLimitError();
      }

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
    }

    /* istanbul ignore next -- unreachable: the 429 branch always returns/throws */
    throw new RateLimitError();
  }

  private endpoint(endpointName: string): string {
    return `${this.options.baseUrl}/${this.options.appId}/${endpointName}`;
  }

  private buildHeaders(): Record<string, string> {
    return {
      "X-Peek-Auth": `Bearer ${this.options.getToken()}`,
      "pk-api-key": this.options.gatewayKey,
      "Content-Type": "application/json",
    };
  }
}
