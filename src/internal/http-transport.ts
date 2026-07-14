/**
 * Shared HTTP transport core for both gateway clients (Peek GraphQL + CNG REST).
 *
 * The retry/backoff loop and the 418/429 status mapping are identical across
 * both gateways — only URL construction, request method/body, and success-body
 * handling differ. Those differences are supplied by the caller: it builds the
 * `url`/`init`, and its `onResponse` callback runs for every non-418/429 status
 * to produce the final value (or throw a transport-specific error).
 */
import { AdminAccountRequiredError, RateLimitError } from "../errors.js";
import type { Logger } from "../logger.js";

export const RATE_LIMIT_STATUS = 429;
export const ADMIN_ACCOUNT_REQUIRED_STATUS = 418;

/** The subset of client options the shared retry loop needs. */
export interface HttpRetryOptions {
  /** Backoff delays (ms) applied on successive HTTP 429 responses. */
  retryDelaysMs: number[];
  /** Diagnostics sink. */
  logger: Logger;
  /** `fetch` implementation to use. */
  fetchFn: typeof fetch;
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs a request through the shared retry loop. Maps HTTP 418 →
 * {@link AdminAccountRequiredError} and HTTP 429 → retry then
 * {@link RateLimitError}; delegates every other response to `onResponse`.
 *
 * @param label a short identifier for the request (endpoint name / REST path),
 * used only in the warn/error log messages.
 */
export async function requestWithRetry<T>(
  http: HttpRetryOptions,
  url: string,
  init: RequestInit,
  label: string,
  onResponse: (response: Response) => Promise<T>,
): Promise<T> {
  const { retryDelaysMs, logger, fetchFn } = http;

  for (let attempt = 0; attempt <= retryDelaysMs.length; attempt++) {
    const response = await fetchFn(url, init);

    if (response.status === ADMIN_ACCOUNT_REQUIRED_STATUS) {
      logger.warn(`Admin account required for ${label} (HTTP 418)`, { url });
      throw new AdminAccountRequiredError();
    }

    if (response.status === RATE_LIMIT_STATUS) {
      const delay = retryDelaysMs[attempt];
      if (delay !== undefined) {
        logger.warn(
          `Rate limited on ${label}, retrying in ${delay}ms ` +
            `(attempt ${attempt + 1}/${retryDelaysMs.length})`,
        );
        await sleep(delay);
        continue;
      }
      logger.error(`Rate limit exceeded for ${label}`, { url });
      throw new RateLimitError();
    }

    return onResponse(response);
  }

  /* istanbul ignore next -- unreachable: the 429 branch always returns/throws */
  throw new RateLimitError();
}
