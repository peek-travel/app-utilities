/**
 * Public webhook surface for install-status events.
 *
 * Peek's app registry notifies your app of install lifecycle changes (installed,
 * uninstalled, status changed) by POSTing a **signed `app_registry_v2` JWT**.
 * Unlike the booking and waiver webhooks — which are pure body transforms with
 * no auth — an install webhook's whole payload *is* a token, so verifying its
 * signature is the point: it authenticates that the notification really came
 * from Peek before your app acts on it (e.g. de-provisioning an uninstall).
 *
 * This is exported as a standalone function rather than a method on
 * `PeekAccessService` because the receiver has no per-install service to inherit
 * a secret from yet — an install webhook can arrive before the first session, or
 * describe an install that is being torn down. The caller passes the app's
 * signing secret directly (the same secret used to mint peek-auth tokens).
 *
 * The signature/issuer/audience/expiry checks are strict (they are the security
 * boundary); the claim *extraction* is defensive so an unexpected-but-valid
 * payload yields empty fields rather than throwing.
 */
import {
  mapPeekTokenUser,
  verifyPeekJwt,
  type RawPeekTokenUser,
} from "../peek-auth-token.js";
import type { InstallWebhookClaims } from "../../../models/peek/auth-token.js";

/** Raw, snake_case payload of an `app_registry_v2` install-webhook token. */
interface RawInstallWebhookPayload {
  /** Install ID — the JWT subject. */
  sub?: string;
  /** App display version at time of issuance. */
  display_version?: string;
  /** Install lifecycle status. */
  status?: string;
  /** The account the install belongs to. */
  account?: { id?: string } | null;
  /** The triggering user, or `null` for system-initiated events. */
  user?: RawPeekTokenUser | null;
}

/**
 * Verifies an install-status webhook token and returns its clean claims.
 *
 * Validates the HMAC signature (with `secret`), the token expiry, the
 * `"app_registry_v2"` issuer, and the `"Joken"` audience — the same checks as
 * {@link PeekAccessService.verifyPeekAuthToken} — then maps the payload to
 * {@link InstallWebhookClaims}, tolerating a `null` `user` (system events).
 * Throws from the `jsonwebtoken` library on any verification failure, so callers
 * can branch on the error kind:
 *
 * - `JsonWebTokenError` — signature invalid, wrong issuer/audience, or malformed
 * - `TokenExpiredError` — past `exp`
 * - `NotBeforeError` — before `nbf`
 *
 * @param token the raw JWT delivered by the install webhook (no `Bearer` prefix)
 * @param secret the app's HMAC signing secret (the `jwtSecret` you construct
 *   `PeekAccessService` with)
 * @throws {JsonWebTokenError} signature invalid or token malformed
 * @throws {TokenExpiredError} token has expired
 * @throws {NotBeforeError} token not yet valid
 */
export function verifyInstallWebhook(
  token: string,
  secret: string,
): InstallWebhookClaims {
  const payload = verifyPeekJwt<RawInstallWebhookPayload>(token, secret);
  return {
    installId: payload.sub ?? "",
    account: { id: payload.account?.id ?? "" },
    status: payload.status ?? "",
    displayVersion: payload.display_version ?? "",
    user: payload.user ? mapPeekTokenUser(payload.user) : null,
  };
}
