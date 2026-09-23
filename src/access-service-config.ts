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
   * The install's **base API URL** — persist the install webhook's `apiUrl` and
   * pass it here. It is the app endpoint with no per-platform routing slug; each
   * service class appends its own slug (e.g. `peek_backoffice_api-v1`, via that
   * platform's endpoint lookup) when it makes a call, so different services can
   * route through different slugs. If the URL you pass still carries this
   * platform's slug it is stripped back off to recover the base; a URL carrying a
   * *different* platform's slug makes the constructor throw. No app-id/gateway
   * segment is inserted, so `appId` is not required. This is the forward-looking
   * way to target an install — prefer it over `baseUrl`/`appId`, which are
   * deprecated (the hardcoded base-URL fallbacks will be removed and a URL will
   * become required in a future release).
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
 * Recovers the **base API URL** from the install's app endpoint (`apiUrl`).
 *
 * The base is the install's app endpoint with no per-platform routing slug — the
 * service classes append their own slug (via their endpoint lookup) when they
 * make calls. Callers may pass the raw base, or a URL that still carries this
 * platform's slug; either way this returns the base:
 *
 * - **No slug present** → the URL is already the base; return it (trailing slash
 *   trimmed).
 * - **This platform's slug present** → strip it off (dashes/underscores either
 *   way) and return the base.
 * - **A different platform's slug present** → throw, since the URL targets the
 *   wrong gateway and silently stripping it would mask a wiring mistake.
 */
export function resolveBaseApiUrl(
  apiUrl: string,
  platformSlug: string,
  serviceName: string,
): string {
  const trimmed = apiUrl.replace(/\/+$/, "");
  const lastSegment = trimmed.slice(trimmed.lastIndexOf("/") + 1);
  const found = EXTENDABLE_SLUG_RE.exec(lastSegment);
  if (!found) return trimmed;

  const foundPlatform = found[1]!.toLowerCase();
  const expectedPlatform = EXTENDABLE_SLUG_RE.exec(platformSlug)![1]!.toLowerCase();
  if (foundPlatform !== expectedPlatform) {
    throw new Error(
      `${serviceName}: "apiUrl" carries a "${foundPlatform}" backoffice ` +
        `slug but this service targets "${expectedPlatform}" — pass the ` +
        `install's ${expectedPlatform} app endpoint`,
    );
  }
  // Strip this platform's slug back off to recover the base API URL.
  return trimmed.slice(0, trimmed.lastIndexOf("/"));
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
