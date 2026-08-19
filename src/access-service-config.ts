/**
 * Config shared by every access service in this package (Peek, CNG, …).
 *
 * Each gateway's access service extends {@link BaseAccessServiceConfig} with its
 * own extras (e.g. Peek adds `gatewayKey`/`mode`), so the only real difference
 * between accessors is the transport they build and the services they expose.
 * The shared defaults and the token-manager builder live here too, so that
 * plumbing is written once.
 */
import { TokenManager } from "./internal/token-manager.js";
import type { AccessOptions } from "./access-options.js";
import type { Logger } from "./logger.js";

/** Fields common to every access service's config. */
export interface BaseAccessServiceConfig {
  /** Install ID. Becomes the JWT subject. */
  installId: string;
  /** HMAC secret used to sign the JWT. */
  jwtSecret: string;
  /** JWT issuer — the app name / app ID. */
  issuer: string;
  /**
   * The install's **app endpoint URL** — persist the install webhook's `apiUrl`
   * and pass it here. When set it is used **as given**: for Peek it is the sole
   * request URL (every call POSTs to it); for CNG/ACME it is the base and the
   * REST path is appended. No app-id/gateway segment is inserted, so `appId` is
   * not required. This is the forward-looking way to target an install — prefer
   * it over `baseUrl`/`appId`, which are deprecated (the hardcoded base-URL
   * fallbacks will be removed and a URL will become required in a future release).
   */
  apiUrl?: string;
  /**
   * App ID, inserted into the gateway endpoint path.
   *
   * @deprecated Required only in the legacy `baseUrl` mode. Prefer `apiUrl` (the
   * install's app endpoint), which needs no app-id segment.
   */
  appId?: string;

  /**
   * Override the gateway base URL. Default: per-service.
   *
   * @deprecated Prefer `apiUrl` (the install's app endpoint, used as given). The
   * hardcoded per-service default will be removed and a URL will become required.
   */
  baseUrl?: string;
  /** JWT lifetime in seconds. Default: 3600. */
  tokenTtlSeconds?: number;
  /** Re-mint the cached token this many seconds before expiry. Default: 60. */
  tokenRefreshLeewaySeconds?: number;
  /** Backoff delays (ms) for HTTP 429 retries. Default: [1000, 2000, 4000]. */
  retryDelaysMs?: number[];
  /** Optional logger. Default: no-op (silent). */
  logger?: Logger;
  /** Custom `fetch` implementation. Default: the global `fetch`. */
  fetch?: typeof fetch;

  /**
   * Cross-cutting access options (PII exposure, …). When omitted, defaults are
   * used ({@link AccessOptions.fullCustomerAccess} `false`). Threaded down to the
   * resource services that read customer data.
   */
  accessOptions?: AccessOptions;
}

/** Default JWT lifetime (1 hour). */
export const DEFAULT_TOKEN_TTL_SECONDS = 3600;
/** Default leeway before expiry at which a cached token is re-minted. */
export const DEFAULT_TOKEN_REFRESH_LEEWAY_SECONDS = 60;
/** Default HTTP 429 retry backoff. */
export const DEFAULT_RETRY_DELAYS_MS = [1000, 2000, 4000];

/**
 * Throws when a required config field is empty, prefixing the message with the
 * concrete service name (e.g. `PeekAccessService: "installId" is required`).
 */
export function requireNonEmpty(
  value: string,
  name: string,
  serviceName: string,
): void {
  if (!value) {
    throw new Error(`${serviceName}: "${name}" is required`);
  }
}

/**
 * Builds the shared {@link TokenManager} from the common config fields, applying
 * the shared TTL/leeway defaults. Used by every access service.
 */
export function createTokenManager(config: BaseAccessServiceConfig): TokenManager {
  return new TokenManager({
    secret: config.jwtSecret,
    issuer: config.issuer,
    installId: config.installId,
    ttlSeconds: config.tokenTtlSeconds ?? DEFAULT_TOKEN_TTL_SECONDS,
    leewaySeconds:
      config.tokenRefreshLeewaySeconds ?? DEFAULT_TOKEN_REFRESH_LEEWAY_SECONDS,
  });
}
