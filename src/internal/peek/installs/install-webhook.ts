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
 * is the **event payload**: it carries the full account block (name, platform,
 * timezone, test flag), the per-install `api.url`, the acting user, and the
 * install id / status / version.
 *
 * `parseInstallWebhook` verifies the token, takes the install id from the token
 * `sub`, and reads the rest of the event from the body (falling back to the
 * token for the fields it also carries), returning one flat
 * {@link InstallWebhook} so a consumer makes a single call instead of stitching
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
 * payload yields empty fields rather than throwing. The one exception is the
 * install id: the token `sub` must be present, and a body `install_id` must be
 * equal to it, or the parser throws {@link InstallWebhookError}.
 */
import {
  extractInstallWebhookBody,
  toInstallStatus,
  toPeekPlatform,
} from "./install-converter.js";
import {
  cleanTokenString,
  mapPeekTokenUser,
  verifyPeekJwt,
  type RawPeekTokenUser,
} from "../peek-auth-token.js";
import {
  INSTALL_WEBHOOK_INSTALL_ID_MISMATCH,
  INSTALL_WEBHOOK_MISSING_SUBJECT,
  InstallWebhookError,
} from "../../../errors.js";
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
 * `installId` is **always the token `sub`**. The body `install_id` never sets
 * it: when the body carries a non-empty `install_id` that is not equal to `sub`,
 * this throws {@link InstallWebhookError} (`reason: "install_id_mismatch"`); a
 * body without `install_id` parses normally. A verified token with no `sub`
 * throws {@link InstallWebhookError} (`reason: "missing_subject"`).
 *
 * The **JSON body** is the source of the other event data — `accountId`,
 * `accountName`, `platform`, `isTest`, `timezone`, `apiUrl`, `status`,
 * `displayVersion`, and `user`. The **verified token** is the **fallback** for
 * the fields it also carries (`accountId`, `status`, `displayVersion`, `user`)
 * when the body omits them. A missing or malformed body degrades the body-only
 * fields (`accountName`, `platform`, `isTest`, `timezone`, `apiUrl`) to
 * `""`/`null`/`false` and leans on the token for the rest; it does not throw
 * for that.
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
 * A validly signed token that does not match the body throws
 * {@link InstallWebhookError} (see above). Treat every throw as a rejected
 * delivery (respond `401`).
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
 * @throws {InstallWebhookError} token has no `sub`, or the body `install_id`
 *   is not equal to it
 */
export function parseInstallWebhook(
  token: string,
  body: unknown,
  secret: string,
): InstallWebhook {
  const payload = verifyPeekJwt<RawInstallWebhookPayload>(token, secret);
  const parsed = extractInstallWebhookBody(body);
  const installId = resolveInstallId(payload.sub, parsed.install_id);
  const account = parsed.account ?? {};
  // The JSON body is the source of the other event data; the verified token is
  // the fallback for the fields it also carries. `||` so an empty body value
  // falls through to the token rather than masking it.
  const rawStatus = parsed.status || payload.status || "";
  return {
    installId,
    accountId: account.id || payload.account?.id || "",
    accountName: account.name || "",
    platform: toPeekPlatform(account.platform || ""),
    isTest: Boolean(account.is_test),
    timezone: account.timezone || "",
    apiUrl: parsed.api?.url || "",
    status: toInstallStatus(rawStatus),
    rawStatus,
    displayVersion: parsed.display_version || payload.display_version || "",
    user: resolveInstallUser(parsed.modified_by, payload.user),
  };
}

/**
 * Returns the install id from the verified token `sub`. Throws
 * {@link InstallWebhookError} when the token has no usable `sub` (absent,
 * non-string, blank, or `"null"` — see {@link cleanTokenString}), or when the body
 * carries a non-empty `install_id` that is not equal to it. An absent or empty
 * body `install_id` is accepted.
 */
function resolveInstallId(rawSubject: unknown, bodyInstallId: unknown): string {
  // An absent, non-string, blank, or `"null"` sub names no install.
  const tokenSubject = cleanTokenString(rawSubject);
  if (tokenSubject === null) throw new InstallWebhookError(INSTALL_WEBHOOK_MISSING_SUBJECT);
  if (bodyInstallId && bodyInstallId !== tokenSubject) {
    throw new InstallWebhookError(INSTALL_WEBHOOK_INSTALL_ID_MISMATCH);
  }
  return tokenSubject;
}

/**
 * Resolves the acting user, preferring the body's `modified_by` and falling back
 * to the token's `user`; system-initiated events carry neither and yield `null`.
 * The body is preferred only when its `modified_by` carries a *real* id — an
 * absent, empty, or `"null"` id (see {@link cleanTokenString}) is treated as no
 * user and defers to the token. {@link mapPeekTokenUser} then maps whichever
 * block wins, tolerating any missing/nullable field.
 */
function resolveInstallUser(
  bodyUser: RawPeekTokenUser | null | undefined,
  tokenUser: RawPeekTokenUser | null | undefined,
): InstallWebhook["user"] {
  if (cleanTokenString(bodyUser?.id) !== null) return mapPeekTokenUser(bodyUser);
  return mapPeekTokenUser(tokenUser);
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
    user: mapPeekTokenUser(payload.user),
  };
}
