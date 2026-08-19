/**
 * The clean data model for an app-store **install lifecycle event** — the single
 * flat object `parseInstallWebhook` returns for the webhook Peek's app registry
 * POSTs when an app is installed, uninstalled, or updated.
 *
 * That delivery carries two things at once: a **signed `app_registry_v2` JWT**
 * (the security boundary) and a plain **JSON body** (the enrichment channel).
 * `parseInstallWebhook` verifies the JWT and merges both into this shape, so a
 * consumer sees one clean, flat, JSON-safe record instead of two differently
 * shaped payloads. The verified JWT is authoritative for the fields it carries
 * (`installId`, `accountId`, `status`, `displayVersion`, `user`); the JSON body
 * is the only source of `accountName`, `platform`, and `isTest`.
 *
 * It is also the single origin of the account id in the whole system: no
 * GraphQL read returns it, so whatever a consumer persists from this event is
 * all it will ever have.
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
 * Fields sourced from the **verified JWT** (`installId`, `accountId`, `status`,
 * `rawStatus`, `displayVersion`, `user`) are trustworthy; the enrichment fields
 * (`accountName`, `platform`, `isTest`) come from the unauthenticated JSON body.
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
   * (install lifecycle changes are often system-initiated). From the JWT.
   */
  user: PeekAuthTokenUser | null;
}
