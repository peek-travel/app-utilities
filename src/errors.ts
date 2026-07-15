/**
 * Typed errors thrown by the package. Each mirrors a failure mode of the Peek
 * GraphQL gateway (or the CNG REST gateway) so callers can branch on the error
 * type rather than parsing messages.
 *
 * `AdminAccountRequiredError` and `RateLimitError` are shared by both gateways.
 * `PeekGraphQLError` is Peek-only; `CngApiError` is CNG-only.
 */

/**
 * Thrown when the gateway responds with HTTP 418, indicating the install is not
 * permitted to perform the request because an admin account is required.
 */
export class AdminAccountRequiredError extends Error {
  /** The HTTP status that triggered this error. */
  public readonly statusCode = 418;

  constructor(message = "Admin account required") {
    super(message);
    this.name = "AdminAccountRequiredError";
  }
}

/**
 * Thrown when the gateway responds with HTTP 429 and all configured retries
 * have been exhausted.
 */
export class RateLimitError extends Error {
  /** The HTTP status that triggered this error. */
  public readonly statusCode = 429;

  constructor(message = "Rate limit exceeded") {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Thrown when a GraphQL response contains an `errors` array. The raw errors are
 * preserved on {@link PeekGraphQLError.graphqlErrors} for inspection.
 */
export class PeekGraphQLError extends Error {
  /** The raw `errors` array returned by the GraphQL endpoint. */
  public readonly graphqlErrors: unknown[];

  constructor(graphqlErrors: unknown[], message = "GraphQL request failed") {
    super(message);
    this.name = "PeekGraphQLError";
    this.graphqlErrors = graphqlErrors;
  }
}

/**
 * Thrown when the CNG REST gateway returns a non-2xx response that is not one
 * of the specifically-handled statuses (418/429). The offending status is
 * preserved on {@link CngApiError.statusCode}, and the raw response body (parsed
 * JSON when possible, otherwise the raw text) on {@link CngApiError.body}.
 */
export class CngApiError extends Error {
  /** The HTTP status that triggered this error. */
  public readonly statusCode: number;
  /** The raw response body (parsed JSON when possible, otherwise text). */
  public readonly body: unknown;

  constructor(statusCode: number, body: unknown, message?: string) {
    super(message ?? `CNG request failed with HTTP ${statusCode}`);
    this.name = "CngApiError";
    this.statusCode = statusCode;
    this.body = body;
  }
}
