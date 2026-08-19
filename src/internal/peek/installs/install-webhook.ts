/**
 * Public webhook surface for install-status events.
 *
 * Peek's app registry notifies your app of install lifecycle changes (installed,
 * uninstalled, status changed) with a single POST that carries **two** things at
 * once: a **signed `app_registry_v2` JWT** (delivered in the `x-peek-auth`
 * request header) and a plain **JSON body**. The JWT is the security boundary —
 * verifying its
 * signature is what authenticates that the notification really came from Peek
 * before your app acts on it (e.g. de-provisioning an uninstall). The JSON body
 * is the enrichment channel: it is the only place the account **name**,
 * **platform**, and **test** flag are reported.
 *
 * `parseInstallWebhook` verifies the token and merges both sources into one flat
 * {@link InstallWebhook}, so a consumer makes a single call instead of stitching
 * two differently shaped payloads together.
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
  extractInstallWebhookBody,
  toInstallStatus,
  toPeekPlatform,
} from "./install-converter.js";
import {
  mapPeekTokenUser,
  verifyPeekJwt,
  type RawPeekTokenUser,
} from "../peek-auth-token.js";
import type { InstallWebhook } from "../../../models/peek/install.js";
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
 * Verifies an install-status webhook token and merges it with the delivered
 * JSON body into one flat {@link InstallWebhook}.
 *
 * The **verified token** is the authoritative source of `installId`,
 * `accountId`, `status`, `displayVersion`, and `user`. The **JSON body** — which
 * is not signed and so is trusted only for fields the token cannot carry —
 * supplies `accountName`, `platform`, and `isTest`. A missing or malformed body
 * degrades those three to `""`/`null`/`false`; it never overrides an
 * authenticated field and never throws.
 *
 * Signature verification is strict: the HMAC signature (with `secret`), the
 * token expiry, the `"app_registry_v2"` issuer, and the `"Joken"` audience are
 * all checked — the same checks as {@link PeekAccessService.verifyPeekAuthToken}.
 * Any failure throws from the `jsonwebtoken` library, so callers can branch on
 * the error kind:
 *
 * - `JsonWebTokenError` — signature invalid, wrong issuer/audience, or malformed
 * - `TokenExpiredError` — past `exp`
 * - `NotBeforeError` — before `nbf`
 *
 * An unrecognised `status` or `platform` maps to `null` (with the wire status
 * preserved on {@link InstallWebhook.rawStatus}) rather than being coerced —
 * Peek treats any 2xx as delivered and does not redeliver, so handle a `null`
 * `status` explicitly:
 *
 * ```ts
 * const event = parseInstallWebhook(token, req.body, secret);
 * switch (event.status) {
 *   case "installed":        return provision(event);
 *   case "uninstalled":      return deprovision(event);
 *   case "update_installed": return recordVersion(event);
 *   default:                 throw new Error(`unknown install status: ${event.rawStatus}`);
 * }
 * ```
 *
 * @param token the JWT delivered by the install webhook. Pass the raw
 *   `x-peek-auth` header value directly — a leading `Bearer ` prefix, if
 *   present, is stripped for you.
 * @param body the delivered JSON body (raw object or a JSON string)
 * @param secret the app's HMAC signing secret (the `jwtSecret` you construct
 *   `PeekAccessService` with)
 * @throws {JsonWebTokenError} signature invalid or token malformed
 * @throws {TokenExpiredError} token has expired
 * @throws {NotBeforeError} token not yet valid
 */
export function parseInstallWebhook(
  token: string,
  body: unknown,
  secret: string,
): InstallWebhook {
  const payload = verifyPeekJwt<RawInstallWebhookPayload>(token, secret);
  const account = extractInstallWebhookBody(body).account ?? {};
  const rawStatus = payload.status ?? "";
  return {
    installId: payload.sub ?? "",
    accountId: payload.account?.id ?? "",
    accountName: account.name || "",
    platform: toPeekPlatform(account.platform || ""),
    isTest: Boolean(account.is_test),
    status: toInstallStatus(rawStatus),
    rawStatus,
    displayVersion: payload.display_version ?? "",
    user: payload.user ? mapPeekTokenUser(payload.user) : null,
  };
}

/**
 * Verifies an install-status webhook token and returns its clean claims.
 *
 * @deprecated Use {@link parseInstallWebhook} instead. This verifier reads only
 * the signed token, so it cannot report the account **name**, **platform**, or
 * **test** flag that the webhook's JSON body also carries — the caller was left
 * to parse that body separately and stitch the two shapes together.
 * `parseInstallWebhook(token, body, secret)` verifies the same token and returns
 * one flat {@link InstallWebhook} with every field. This function remains only
 * for backwards compatibility.
 *
 * Validates the HMAC signature (with `secret`), the token expiry, the
 * `"app_registry_v2"` issuer, and the `"Joken"` audience — the same checks as
 * {@link PeekAccessService.verifyPeekAuthToken} — then maps the payload to
 * {@link InstallWebhookClaims}, tolerating a `null` `user` (system events).
 * Throws from the `jsonwebtoken` library on any verification failure:
 *
 * - `JsonWebTokenError` — signature invalid, wrong issuer/audience, or malformed
 * - `TokenExpiredError` — past `exp`
 * - `NotBeforeError` — before `nbf`
 *
 * @param token the JWT delivered by the install webhook. Pass the raw
 *   `x-peek-auth` header value directly — a leading `Bearer ` prefix, if
 *   present, is stripped for you.
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
