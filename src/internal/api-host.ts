/**
 * Allowed-host check for requests to an install's `apiUrl`.
 *
 * Every request built from an `apiUrl` carries the app JWT (and, in legacy v1
 * mode, the `pk-api-key`). {@link withApiHostCheck} wraps the transport's
 * `fetch` so a request is sent only when its URL uses `https` and its host is
 * one of the {@link REGISTRY_HOSTS} or a host listed in the
 * {@link EXTRA_HOSTS_ENV_VAR} environment variable. Any other URL throws
 * {@link ApiHostNotAllowedError} before `fetch` is called.
 */
import { ApiHostNotAllowedError } from "../errors.js";
import type { Logger } from "../logger.js";

/** The built-in allowed API hosts. */
export const REGISTRY_HOSTS: readonly string[] = ["apps.peek.com", "stage.apps.peek.com"];

/** Environment variable with extra allowed hosts, comma-separated. Empty by default. */
export const EXTRA_HOSTS_ENV_VAR = "PEEK_REGISTRY_EXTRA_HOSTS";

/** The only URL scheme an allowed request may use. */
const ALLOWED_PROTOCOL = "https:";

/** Separator between the hosts in {@link EXTRA_HOSTS_ENV_VAR}. */
const HOST_SEPARATOR = ",";

/**
 * Reads the extra hosts from {@link EXTRA_HOSTS_ENV_VAR}: split on commas,
 * trimmed, lowercased, empty entries dropped. Returns `[]` when the variable is
 * unset or there is no `process` global (a non-Node runtime).
 */
export function readExtraHosts(): string[] {
  const raw = globalThis.process?.env?.[EXTRA_HOSTS_ENV_VAR] ?? "";
  return raw
    .split(HOST_SEPARATOR)
    .map((host) => host.trim().toLowerCase())
    .filter((host) => host.length > 0);
}

/** Parses `url`, or returns `null` when it is not a valid absolute URL (Node 18 has no `URL.parse`). */
function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/**
 * Returns `true` when `url` uses `https` and its host exactly matches a
 * built-in or extra allowed host (case-insensitive). A subdomain of an allowed
 * host does not match. The extra hosts are read on every call.
 */
function isAllowedUrl(url: URL | null): boolean {
  if (!url || url.protocol !== ALLOWED_PROTOCOL) return false;
  const host = url.host.toLowerCase();
  return REGISTRY_HOSTS.includes(host) || readExtraHosts().includes(host);
}

/** The URL string of a `fetch` input. */
function inputUrl(input: Parameters<typeof fetch>[0]): string {
  if (typeof input === "string") return input;
  return input instanceof URL ? input.href : input.url;
}

/**
 * Wraps `fetchFn` so it sends a request only to an allowed API URL: `https`,
 * and a host that exactly matches a built-in or extra allowed host. For any
 * other URL it logs the host and rejects with {@link ApiHostNotAllowedError}
 * without calling `fetchFn`.
 */
export function withApiHostCheck(fetchFn: typeof fetch, logger: Logger): typeof fetch {
  return (input, init) => {
    const url = parseUrl(inputUrl(input));
    if (!isAllowedUrl(url)) {
      const host = url?.host ?? null;
      const protocol = url?.protocol ?? null;
      logger.error("Request not sent: API host is not allowed", { host, protocol });
      return Promise.reject(new ApiHostNotAllowedError(host, protocol));
    }
    return fetchFn(input, init);
  };
}
