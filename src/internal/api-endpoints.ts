/**
 * A platform's tiny map of **API endpoint key → relative path** (the "slug"
 * inserted between the install's base API URL and the endpoint's own path).
 *
 * The base API URL is the install's app endpoint with no routing segment — the
 * install webhook's `apiUrl` (with any slug stripped back off), or
 * `baseUrl/appId` when built from the deprecated defaults. Each service class
 * resolves *its own* slug through this lookup, so two services on the same
 * platform can route through different slugs. Adding a new API — even one on a
 * different slug than its siblings — is a single entry here.
 *
 * An empty-string path means the endpoint sits directly on the base with no
 * slug (e.g. the legacy Peek v1 GraphQL gateway, which has no extendable slug).
 */
export class ApiEndpoints<Key extends string = string> {
  constructor(private readonly paths: Readonly<Record<Key, string>>) {}

  /** The relative path (slug) for `endpoint`, appended to the base API URL. */
  pathFor(endpoint: Key): string {
    return this.paths[endpoint];
  }
}

/**
 * Joins URL path parts with single slashes, dropping empty parts so an absent
 * slug never produces a `//`. The base keeps its scheme's `//` intact because
 * it is passed as one already-joined part.
 */
export function joinUrl(...parts: string[]): string {
  return parts.filter((part) => part.length > 0).join("/");
}
