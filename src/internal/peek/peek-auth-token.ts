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
import { PEEK_PLATFORMS } from "../../models/peek/auth-token.js";
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

/**
 * The raw, snake_case user block embedded in an `app_registry_v2` token. Every
 * field is optional/nullable: the block is untrusted attacker- **or** registry-
 * shaped input, so a field may be missing, `null`, or a sentinel string. The
 * clean {@link PeekAuthTokenUser} is produced by {@link mapPeekTokenUser}.
 */
export interface RawPeekTokenUser {
  email?: string | null;
  id?: string | null;
  is_admin?: boolean | null;
  locale?: string | null;
  name?: string | null;
  platform?: string | null;
}

/** Strings Peek is known to emit in place of an absent value. */
const NULLISH_STRINGS = new Set(["", "null"]);

/**
 * Normalizes an untrusted string claim: trims it, then collapses an empty string
 * or the literal `"null"` (case-insensitive) — both of which Peek has been seen
 * to send for an absent value — to `null`. A non-string (a real `null`,
 * `undefined`, or wrong-typed claim) also becomes `null`.
 */
export function cleanTokenString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return NULLISH_STRINGS.has(trimmed.toLowerCase()) ? null : trimmed;
}

/** Narrows an untrusted platform claim to a known {@link PeekPlatform}, else `null`. */
function cleanTokenPlatform(value: unknown): PeekPlatform | null {
  const cleaned = cleanTokenString(value);
  return cleaned !== null && (PEEK_PLATFORMS as readonly string[]).includes(cleaned)
    ? (cleaned as PeekPlatform)
    : null;
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
 * The block is untrusted even after the signature verifies: it may be absent
 * entirely (system-initiated events, malformed tokens) and any field inside it
 * may be missing, `null`, or a sentinel like `""`/`"null"`. An absent block
 * yields `null`; a present block yields a user whose every field is
 * independently nullable (garbage strings normalized to `null` via
 * {@link cleanTokenString}). No field is required, so this never throws — in
 * particular `id` is the user's own id, not an account/partner id, and its
 * absence is not treated as an error.
 */
export function mapPeekTokenUser(
  u: RawPeekTokenUser | null | undefined,
): PeekAuthTokenUser | null {
  if (!u) return null;
  return {
    email: cleanTokenString(u.email),
    id: cleanTokenString(u.id),
    isAdmin: typeof u.is_admin === "boolean" ? u.is_admin : null,
    locale: cleanTokenString(u.locale),
    name: cleanTokenString(u.name),
    platform: cleanTokenPlatform(u.platform),
  };
}
