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
