/**
 * Typed errors thrown by the package. Each mirrors a failure mode of the Peek
 * GraphQL gateway (or the CNG REST gateway) so callers can branch on the error
 * type rather than parsing messages.
 *
 * `AdminAccountRequiredError` and `RateLimitError` are shared by all gateways.
 * `PeekGraphQLError` is Peek-only; `CngApiError` and `CngPermissionError` are
 * CNG-only; `AcmeApiError` is ACME-only.
 */

/** The HTTP status the CNG gateway uses for a missing-permission rejection. */
export const FORBIDDEN_STATUS = 403;

const PERMISSION_MESSAGE_PREFIX = "CNG request forbidden: the app is missing the required permission";
const PERMISSION_MESSAGE_UNKNOWN = "CNG request forbidden: the app is missing a required permission";

/** Builds the {@link CngPermissionError} message from the named permissions. */
function buildPermissionMessage(permissions: string[]): string {
  if (permissions.length === 0) return PERMISSION_MESSAGE_UNKNOWN;
  return `${PERMISSION_MESSAGE_PREFIX}${permissions.length > 1 ? "s" : ""}: ${permissions.join(", ")}`;
}

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
 * Thrown when the Peek gateway returns a seatmap `display.type` the package does
 * not recognize. The known set is small and gateway-owned
 * ({@link SEATMAP_DISPLAY_TYPES}); rather than silently widening the clean
 * model's `type` to an arbitrary string, the seatmap converter throws this so a
 * caller learns the gateway grew a new kind. The offending value is preserved on
 * {@link UnknownSeatmapDisplayTypeError.type}.
 */
export class UnknownSeatmapDisplayTypeError extends Error {
  /** The unrecognized `display.type` value the gateway returned. */
  public readonly type: string;

  constructor(type: string, knownTypes: readonly string[]) {
    super(
      `Unknown seatmap display type "${type}" returned by the gateway; ` +
        `expected one of: ${knownTypes.join(", ")}.`,
    );
    this.name = "UnknownSeatmapDisplayTypeError";
    this.type = type;
  }
}

/**
 * Thrown when the Peek gateway returns a seat `availability.status` the package
 * does not recognize. The known set is small and gateway-owned
 * ({@link SEATMAP_BLOCK_STATUSES}); rather than silently widening the clean
 * model's `status`, `SeatmapService.getSeatMapAssignments` throws this. The
 * offending value is preserved on {@link UnknownSeatmapBlockStatusError.status}.
 */
export class UnknownSeatmapBlockStatusError extends Error {
  /** The unrecognized `availability.status` value the gateway returned. */
  public readonly status: string;

  constructor(status: string, knownStatuses: readonly string[]) {
    super(
      `Unknown seatmap block status "${status}" returned by the gateway; ` +
        `expected one of: ${knownStatuses.join(", ")}.`,
    );
    this.name = "UnknownSeatmapBlockStatusError";
    this.status = status;
  }
}

/**
 * Thrown when a seat assignment's `parent` carries a `__typename` the package
 * does not recognize. The occupant kind is derived from that typename
 * (`Ticket`/`AccountUser`/`FieldLocation`/`BlockedSeat`); an unknown one makes
 * `SeatmapService.getSeatMapAssignments` throw rather than guess. The offending
 * value is preserved on {@link UnknownSeatmapAssignmentParentError.typename}.
 */
export class UnknownSeatmapAssignmentParentError extends Error {
  /** The unrecognized assignment-parent `__typename` the gateway returned. */
  public readonly typename: string;

  constructor(typename: string, knownTypenames: readonly string[]) {
    super(
      `Unknown seatmap assignment parent "${typename}" returned by the gateway; ` +
        `expected one of: ${knownTypenames.join(", ")}.`,
    );
    this.name = "UnknownSeatmapAssignmentParentError";
    this.typename = typename;
  }
}

/**
 * Thrown when `SeatmapService.deleteSeatAssignments` gets a non-success union
 * member back (e.g. `AssignBlocksErrorInvalidBlockCount`) — a batch-level
 * failure the gateway reports inside an otherwise-successful response, not a
 * transport error. The gateway's explanation is on the standard `.message`.
 */
export class SeatmapDeleteError extends Error {
  constructor(message?: string | null) {
    super(message || "Deleting seat assignments failed.");
    this.name = "SeatmapDeleteError";
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
 * Thrown when the CNG REST gateway responds with HTTP 403 because the app lacks
 * a permission the endpoint requires (e.g. `products:read`). This is an
 * **expected** failure for a misconfigured install — not a bug — so the
 * transport logs it at `warn` rather than `error` and leaves presentation to the
 * caller, which can branch on the type and surface the missing permission
 * however its UI prefers.
 *
 * The permission names the gateway named are on
 * {@link CngPermissionError.permissions} (empty when the body does not name
 * any), so a caller can render them without re-parsing the raw body. Thrown in
 * place of {@link CngApiError} for 403s only; every other non-2xx status still
 * throws `CngApiError`.
 */
export class CngPermissionError extends Error {
  /** The HTTP status that triggered this error. */
  public readonly statusCode = FORBIDDEN_STATUS;
  /**
   * The permissions the gateway reported as missing, e.g. `["products:read"]`.
   * Empty when the response body did not name any.
   */
  public readonly permissions: string[];
  /** The raw response body (parsed JSON when possible, otherwise text). */
  public readonly body: unknown;

  constructor(permissions: string[], body: unknown, message?: string) {
    super(message ?? buildPermissionMessage(permissions));
    this.name = "CngPermissionError";
    this.permissions = permissions;
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
