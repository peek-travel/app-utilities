/**
 * Typed errors thrown by the package. Each mirrors a failure mode of the Peek
 * GraphQL gateway (or the CNG REST gateway) so callers can branch on the error
 * type rather than parsing messages.
 *
 * `AdminAccountRequiredError` and `RateLimitError` are shared by all gateways.
 * `PeekGraphQLError` is Peek-only; `CngApiError` is CNG-only; `AcmeApiError` is
 * ACME-only.
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
 * Thrown when the Peek GraphQL gateway returns a non-2xx HTTP response that is
 * not one of the specifically-handled statuses (418/429) and does not carry a
 * GraphQL `errors` array. This is the transport-level failure — a `401`
 * (auth/secret wrong), `404` (wrong app id / not provisioned), `5xx`, etc. —
 * as opposed to {@link PeekGraphQLError}, which is a resolver-level failure
 * reported inside an otherwise-successful HTTP response.
 *
 * The offending status is preserved on {@link PeekHttpError.statusCode}, the
 * request URL on {@link PeekHttpError.url}, and the raw response body (parsed
 * JSON when possible, otherwise the raw text) on {@link PeekHttpError.body} — so
 * callers can tell "which config is wrong" without disassembling the bundle.
 */
export class PeekHttpError extends Error {
  /** The HTTP status that triggered this error. */
  public readonly statusCode: number;
  /** The request URL that produced the failing response. */
  public readonly url: string;
  /** The raw response body (parsed JSON when possible, otherwise text). */
  public readonly body: unknown;

  constructor(statusCode: number, url: string, body: unknown, message?: string) {
    super(message ?? `Peek request failed with HTTP ${statusCode}`);
    this.name = "PeekHttpError";
    this.statusCode = statusCode;
    this.url = url;
    this.body = body;
  }
}

/**
 * Thrown when an `app_registry_v2` token passes signature/issuer/audience
 * verification but its `user` block is missing a required `id`. The signature is
 * authentic, so this signals a structurally malformed token from the app
 * registry rather than a forged one — distinct from the `jsonwebtoken`
 * `JsonWebTokenError` family. The offending field is preserved on
 * {@link InvalidPeekTokenError.field}.
 */
export class InvalidPeekTokenError extends Error {
  /** The token field that was missing or empty (e.g. `"user.id"`). */
  public readonly field: string;

  constructor(field: string) {
    super(`Peek token is missing required field "${field}"`);
    this.name = "InvalidPeekTokenError";
    this.field = field;
  }
}

/**
 * Thrown when a payment or booking-modification operation is called on an
 * access service that was constructed without `fullCustomerAccess` (PII access
 * disabled). These operations — pulling payment sources, charging/refunding,
 * creating invoice links, and adding/removing add-ons — touch customer
 * financial data, so they are gated behind the same flag as customer PII.
 */
export class PiiAccessDisabledError extends Error {
  /** The name of the operation that was blocked (e.g. `"makePayment"`). */
  public readonly operation: string;

  constructor(operation: string) {
    super(
      `"${operation}" is disabled because this access service was created ` +
        `without "fullCustomerAccess"; enable it to allow payment and booking-modification operations`,
    );
    this.name = "PiiAccessDisabledError";
    this.operation = operation;
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

/**
 * Thrown when the ACME REST gateway returns a non-2xx response that is not one
 * of the specifically-handled statuses (418/429). The offending status is
 * preserved on {@link AcmeApiError.statusCode}, and the raw response body
 * (parsed JSON when possible, otherwise the raw text) on
 * {@link AcmeApiError.body}.
 */
export class AcmeApiError extends Error {
  /** The HTTP status that triggered this error. */
  public readonly statusCode: number;
  /** The raw response body (parsed JSON when possible, otherwise text). */
  public readonly body: unknown;

  constructor(statusCode: number, body: unknown, message?: string) {
    super(message ?? `ACME request failed with HTTP ${statusCode}`);
    this.name = "AcmeApiError";
    this.statusCode = statusCode;
    this.body = body;
  }
}
