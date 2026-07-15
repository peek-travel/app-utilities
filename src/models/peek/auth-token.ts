/**
 * Platform that embedded the app for this session. Verification is
 * brand-agnostic — one peek-auth JWT is minted for every platform — so this
 * claim is the single thing that identifies which platform a request came from.
 * New platforms extend this union.
 */
export type PeekPlatform = "peek" | "cng";

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
