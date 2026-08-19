/**
 * Every platform this package knows about. Exported as a value (not just a
 * union) so runtime code can recognise a reported platform without restating
 * the list. New platforms extend this array.
 */
export const PEEK_PLATFORMS = ["peek", "cng", "acme"] as const;

/**
 * Platform that embedded the app for this session. Verification is
 * brand-agnostic — one peek-auth JWT is minted for every platform — so this
 * claim is the single thing that identifies which platform a request came from.
 */
export type PeekPlatform = (typeof PEEK_PLATFORMS)[number];

/** User context embedded in a Peek auth token. */
export interface PeekAuthTokenUser {
  /** User's email address. */
  email: string;
  /** User's Peek account ID */
  id: string;
  /** Whether the user has admin privileges. */
  isAdmin: boolean;
  /** User's locale (e.g. `"en"`). */
  locale: string;
  /** User's display name. */
  name: string;
  /** Which platform embedded the app for this session. */
  platform: PeekPlatform;
}

/** Claims returned by {@link PeekAccessService.verifyPeekAuthToken}. */
export interface PeekAuthTokenClaims {
  /** Install ID — the JWT subject (`sub`). Peek-assigned UUID. */
  installId: string;
  /** App display version at time of issuance. */
  displayVersion: string;
  /** Authenticated user context. */
  user: PeekAuthTokenUser;
}

/** The Peek account an install belongs to, as reported on an install webhook. */
export interface InstallWebhookAccount {
  /** Peek account ID that owns the install. */
  id: string;
}

/**
 * Claims returned by `verifyInstallWebhook` — the decoded, signature-verified
 * install-status webhook token.
 *
 * Shares the `app_registry_v2` token family with {@link PeekAuthTokenClaims},
 * but is emitted by the app registry itself for install lifecycle events
 * (installed / uninstalled / status changed) rather than for a user session —
 * so {@link InstallWebhookClaims.user} is `null` for system-initiated events
 * that no user triggered.
 */
export interface InstallWebhookClaims {
  /** Install ID — the JWT subject (`sub`). Peek-assigned UUID. */
  installId: string;
  /** The account the install belongs to. */
  account: InstallWebhookAccount;
  /** Install lifecycle status (e.g. `"installed"`, `"uninstalled"`). */
  status: string;
  /** App display version at time of issuance. Empty string when absent. */
  displayVersion: string;
  /**
   * The user that triggered the event, or `null` for system-initiated events
   * (the whole point of a distinct type from {@link PeekAuthTokenClaims}).
   */
  user: PeekAuthTokenUser | null;
}
