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

/**
 * User context embedded in a Peek auth token.
 *
 * Every field is nullable: the token is untrusted even after its signature
 * verifies, so a claim may be absent, `null`, or a sentinel (`""`, `"null"`)
 * that this package normalizes to `null`. Never assume a field is populated —
 * always null-check.
 */
export interface PeekAuthTokenUser {
  /** User's email address, or `null` if the token omits it. */
  email: string | null;
  /**
   * The user's own Peek user ID — it identifies the signed-in person, **not**
   * the account or partner they belong to. Use it only to key the user; never
   * treat it as an account/partner id. `null` when the token omits it.
   */
  id: string | null;
  /** Whether the user has admin privileges, or `null` if the token omits it. */
  isAdmin: boolean | null;
  /** User's locale (e.g. `"en"`), or `null` if the token omits it. */
  locale: string | null;
  /** User's display name, or `null` if the token omits it. */
  name: string | null;
  /**
   * Which platform embedded the app for this session, or `null` when the token
   * omits it or reports one this version of the package doesn't recognize.
   */
  platform: PeekPlatform | null;
}

/** Claims returned by {@link PeekAccessService.verifyPeekAuthToken}. */
export interface PeekAuthTokenClaims {
  /** Install ID — the JWT subject (`sub`). Peek-assigned UUID. */
  installId: string;
  /** App display version at time of issuance. */
  displayVersion: string;
  /**
   * Authenticated user context, or `null` when the token carries no `user`
   * block. Do not assume a session token always names a user.
   */
  user: PeekAuthTokenUser | null;
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
