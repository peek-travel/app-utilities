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
   * and pass it here. The access service normalises it so it carries that
   * platform's backoffice extendable slug (e.g. `peek_backoffice_api-v1`): the
   * slug is appended when absent, accepted when already present (dashes or
   * underscores), and rejected — the constructor throws — when the URL carries a
   * *different* platform's slug. Once normalised, for Peek it is the sole request
   * URL (every call POSTs to it) and for CNG/ACME it is the base the REST path is
   * appended to. No app-id/gateway segment is inserted, so `appId` is not
   * required. This is the forward-looking way to target an install — prefer it
   * over `baseUrl`/`appId`, which are deprecated (the hardcoded base-URL
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
 * Matches a backoffice-API extendable slug and captures the platform prefix —
 * e.g. `peek` from `peek_backoffice_api-v1` or `peek-backoffice-api-v1`. Dashes
 * and underscores are interchangeable as separators, so both spellings the app
 * registry emits are recognised. Anchored to the whole segment so an ordinary
 * install-path segment (e.g. `google-things-to-do-integration`) never matches.
 */
const EXTENDABLE_SLUG_RE = /^([a-z0-9]+)[-_]backoffice[-_]api[-_]v1$/i;

/**
 * Normalises the install's app endpoint (`apiUrl`) so it carries this service's
 * platform-specific extendable slug (e.g. `peek_backoffice_api-v1`).
 *
 * The install webhook's `apiUrl` is the install's app endpoint *without* the
 * per-platform routing segment, so it cannot be hit directly. This resolves it:
 *
 * - **No extension present** → append this service's slug (`apiUrl/slug`).
 * - **This service's extension already present** → accept the URL as given
 *   (dashes/underscores either way), only trimming a trailing slash.
 * - **A different platform's extension present** → throw, since the URL targets
 *   the wrong gateway and silently retargeting it would hit the wrong platform.
 */
export function resolveApiUrl(
  apiUrl: string,
  extendableSlug: string,
  serviceName: string,
): string {
  const trimmed = apiUrl.replace(/\/+$/, "");
  const lastSegment = trimmed.slice(trimmed.lastIndexOf("/") + 1);
  const found = EXTENDABLE_SLUG_RE.exec(lastSegment);
  if (!found) return `${trimmed}/${extendableSlug}`;

  const foundPlatform = found[1]!.toLowerCase();
  const expectedPlatform = EXTENDABLE_SLUG_RE.exec(extendableSlug)![1]!.toLowerCase();
  if (foundPlatform !== expectedPlatform) {
    throw new Error(
      `${serviceName}: "apiUrl" carries a "${foundPlatform}" backoffice ` +
        `extension but this service targets "${expectedPlatform}" — pass the ` +
        `install's ${expectedPlatform} app endpoint`,
    );
  }
  return trimmed;
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
