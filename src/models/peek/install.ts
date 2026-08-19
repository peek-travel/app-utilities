/**
 * The clean data model for an app-store **install lifecycle event** — the single
 * flat object `parseInstallWebhook` returns for the webhook Peek's app registry
 * POSTs when an app is installed, uninstalled, or updated.
 *
 * That delivery carries two things at once: a **signed `app_registry_v2` JWT**
 * (the security boundary) and a plain **JSON body** (the event payload).
 * `parseInstallWebhook` verifies the JWT and merges both into this shape, so a
 * consumer sees one clean, flat, JSON-safe record instead of two differently
 * shaped payloads. The **JSON body is the source of the event data** — it
 * carries every field below; the verified JWT authenticates the delivery and
 * acts as the **fallback** for the fields it also happens to carry (`installId`,
 * `accountId`, `status`, `displayVersion`, `user`) when the body omits them.
 *
 * It is also the single origin of the account id (and the `apiUrl`/`timezone`)
 * in the whole system: no GraphQL read returns them, so whatever a consumer
 * persists from this event is all it will ever have.
 *
 * **Every install event is a full snapshot — upsert by `installId`.** An
 * `update_installed` event carries the *same complete record* as the original
 * `installed` event, so treat each delivery as an upsert keyed by `installId`
 * and overwrite the stored fields with the incoming ones. This is how the
 * registry pushes changes — e.g. a new `apiUrl` — so a consumer that only reads
 * the first `installed` event and ignores later updates will keep stale data.
 */
import type { PeekAuthTokenUser, PeekPlatform } from "./auth-token.js";

/**
 * Every install lifecycle status Peek's app registry sends today. Exported so
 * consumers can validate or enumerate without restating the vocabulary.
 */
export const INSTALL_STATUSES = [
  "installed",
  "uninstalled",
  "update_installed",
] as const;

/** Install lifecycle status. */
export type InstallStatus = (typeof INSTALL_STATUSES)[number];

/**
 * A verified install lifecycle event — what happened, to which install, and who
 * (if anyone) triggered it — as one flat, JSON-safe record.
 *
 * This is the shape `parseInstallWebhook` returns. It is flat by design: it
 * round-trips through a datastore unchanged, so the same shape the parser
 * returns is the shape a consumer persists and later rehydrates. There is
 * deliberately no nested identity object and no second representation.
 *
 * Every field is read from the **JSON body** first, falling back to the
 * **verified JWT** for the fields it also carries (`installId`, `accountId`,
 * `status`, `displayVersion`, `user`). The delivery is authenticated as a whole
 * by the JWT signature, so the body is trusted within a verified request.
 */
export interface InstallWebhook {
  /** Install ID — Peek-assigned UUID. Also the JWT subject (`sub`). */
  installId: string;
  /**
   * Stable Peek account id — the same value Peek calls the **partner ID**.
   * This event is its only source; it cannot be re-fetched later.
   */
  accountId: string;
  /** Partner display name. `""` when the JSON body omits it. */
  accountName: string;
  /**
   * Which Peek platform owns the install, or `null` when the registry reported
   * a platform this version of the package does not know. `null` means "newer
   * than this package", **not** "absent" — do not coerce it to a default.
   *
   * **Persist and track this per install.** It is not cosmetic: the platform
   * determines which APIs the install is served by, and therefore which access
   * service a consumer must construct for it — `PeekAccessService` for `"peek"`,
   * `CngAccessService` for `"cng"`, `AcmeAccessService` for `"acme"`, each
   * routed at a different gateway. Two installs of the same app can sit on
   * different platforms, so this cannot be inferred from app-level config and
   * has no source other than this event.
   */
  platform: PeekPlatform | null;
  /** Whether this is a test account. Defaults to `false` when not reported. */
  isTest: boolean;
  /**
   * The account's IANA timezone (e.g. `"America/New_York"`), or `""` when the
   * body omits it.
   *
   * **Persist this per install.** It has no source other than this event, and
   * downstream date/time handling for the install (scheduling, day boundaries,
   * display) needs the account's own timezone rather than the server's.
   */
  timezone: string;
  /**
   * The **app endpoint URL** the registry serves this install from (the body's
   * `api.url`), or `""` when the body omits it.
   *
   * Use it **as given** as the base URL for this install's API calls — do not
   * decompose it or append your own app id. The registry may tag traffic with an
   * app id in the path; that is the registry's concern and opaque to callers, so
   * hit the URL unmodified.
   *
   * **Persist this per install, and refresh it on every install event.** It is
   * install-specific, has no source other than this webhook, and the registry
   * can change it: an `update_installed` event redelivers the full record with a
   * (possibly new) `apiUrl`, so re-key by `installId` and overwrite the stored
   * URL whenever an event arrives.
   */
  apiUrl: string;
  /**
   * The lifecycle status, or `null` when the registry sent a status this
   * version of the package does not know. Handle `null` explicitly — treating
   * it as a no-op silently drops a lifecycle transition.
   */
  status: InstallStatus | null;
  /** The status exactly as delivered, for logging and for the `null` case. */
  rawStatus: string;
  /** App display version at the time of the event. */
  displayVersion: string;
  /**
   * The user that triggered the event, or `null` for system-initiated events
   * (install lifecycle changes are often system-initiated). Read from the body's
   * `modified_by`, falling back to the JWT's `user`.
   */
  user: PeekAuthTokenUser | null;
}
