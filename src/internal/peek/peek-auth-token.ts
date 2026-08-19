/**
 * Shared verification core for the `app_registry_v2` JWT family.
 *
 * Every token Peek's app registry mints — the per-session **peek-auth token**
 * (see {@link PeekAccessService.verifyPeekAuthToken}) and the **install-status
 * webhook token** (see {@link verifyInstallWebhook}) — is signed with the app's
 * HMAC secret and carries the same `issuer`/`audience` and the same snake_case
 * `user` block. This module owns those shared constants and the signature check
 * so the two entry points can't drift apart.
 *
 * Internal only — never re-exported from `src/index.ts`.
 */
import * as jwt from "jsonwebtoken";
import { InvalidPeekTokenError } from "../../errors.js";
import type { PeekAuthTokenUser, PeekPlatform } from "../../models/peek/auth-token.js";

/** JWT issuer set by the Peek app registry on all tokens it issues. */
export const PEEK_TOKEN_ISSUER = "app_registry_v2";
/** JWT audience set by the Peek app registry on all tokens it issues. */
export const PEEK_TOKEN_AUDIENCE = "Joken";
/** Case-insensitive `Bearer ` scheme prefix on an `x-peek-auth` header value. */
const BEARER_PREFIX = "bearer ";

/**
 * Strips a leading `Bearer ` prefix (case-insensitive) so every caller can pass
 * the raw `x-peek-auth` request header value straight through — with or without
 * the scheme — without unwrapping it first. A real `app_registry_v2` JWT is
 * base64url and never starts with `"bearer "`, so this is a no-op on well-formed
 * tokens.
 */
function stripBearer(token: string): string {
  const trimmed = token.trim();
  return trimmed.toLowerCase().startsWith(BEARER_PREFIX)
    ? trimmed.slice(BEARER_PREFIX.length).trim()
    : trimmed;
}

/** The raw, snake_case user block embedded in an `app_registry_v2` token. */
export interface RawPeekTokenUser {
  email: string;
  id: string;
  is_admin: boolean;
  locale: string;
  name: string;
  platform: PeekPlatform;
}

/**
 * Verifies an `app_registry_v2` token's HMAC signature (with `secret`), its
 * expiry, the `"app_registry_v2"` issuer, and the `"Joken"` audience, then
 * returns the decoded payload cast to `T`. Throws from the `jsonwebtoken`
 * library on any failure (`JsonWebTokenError` / `TokenExpiredError` /
 * `NotBeforeError`).
 *
 * The `token` argument accepts the raw `x-peek-auth` header value: a leading
 * `Bearer ` scheme prefix (case-insensitive) is stripped before verification, so
 * every token entry point in the family tolerates it uniformly.
 */
export function verifyPeekJwt<T>(token: string, secret: string): T {
  return jwt.verify(stripBearer(token), secret, {
    issuer: PEEK_TOKEN_ISSUER,
    audience: PEEK_TOKEN_AUDIENCE,
  }) as T;
}

/**
 * Maps the raw snake_case user block to the clean {@link PeekAuthTokenUser}.
 *
 * @throws {InvalidPeekTokenError} when the user block carries no `id` — the
 * signature is already verified at this point, so an absent id means a
 * structurally malformed token rather than a forged one.
 */
export function mapPeekTokenUser(u: RawPeekTokenUser): PeekAuthTokenUser {
  if (!u.id) {
    throw new InvalidPeekTokenError("user.id");
  }
  return {
    email: u.email,
    id: u.id,
    isAdmin: u.is_admin,
    locale: u.locale,
    name: u.name,
    platform: u.platform,
  };
}
