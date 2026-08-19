/**
 * The clean data model for an app-store **install lifecycle event** — the JSON
 * webhook body Peek's app registry POSTs when an app is installed, uninstalled,
 * or updated.
 *
 * This is the sibling of the signed-JWT channel behind `verifyInstallWebhook`
 * (see `models/peek/auth-token.ts`). The two carry the same event; this one is
 * the richer of the pair, because only it reports the account **name**,
 * **platform**, and **test** flag.
 *
 * It is also the single origin of the account id in the whole system: no
 * GraphQL read and no peek-auth token returns it, so whatever a consumer
 * persists from this event is all it will ever have.
 */
import type { PeekPlatform } from "./auth-token.js";

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
 * Who an install is — the core account data, in one object.
 *
 * Flat and JSON-safe by design: it round-trips through a datastore unchanged,
 * so the same shape the parser returns is the shape a consumer persists and
 * later rehydrates. There is deliberately no second representation.
 */
export interface InstallIdentity {
  /** Install ID — Peek-assigned UUID. Also the subject of every peek-auth JWT. */
  installId: string;
  /**
   * Stable Peek account id — the same value Peek calls the **partner ID**.
   * This event is its only source; it cannot be re-fetched later.
   */
  accountId: string;
  /** Partner display name. */
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
}

/** A parsed install lifecycle event: what happened, to which install. */
export interface InstallEvent {
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
  /** The install's core account data. */
  identity: InstallIdentity;
}
