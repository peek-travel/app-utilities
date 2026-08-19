/**
 * Pure, I/O-free helpers for the install webhook: narrowing an unknown request
 * body to the raw JSON node, and narrowing a delivered `status`/`platform`
 * string to its known union. No network, no logging, no clock.
 *
 * Internal only — never re-exported from `src/index.ts`.
 */
import {
  PEEK_PLATFORMS,
  type PeekPlatform,
} from "../../../models/peek/auth-token.js";
import {
  INSTALL_STATUSES,
  type InstallStatus,
} from "../../../models/peek/install.js";
import type { RawPeekTokenUser } from "../peek-auth-token.js";

/** The raw, snake_case account block of an install webhook's JSON body. */
export interface InstallWebhookBodyAccount {
  id?: string;
  name?: string;
  platform?: string;
  timezone?: string;
  is_test?: boolean;
}

/**
 * The raw, snake_case JSON body delivered alongside the install webhook token.
 * This is the **primary source of the event data**: it carries the full
 * `account` block, the per-install `api.url`, the `modified_by` actor, and the
 * `install_id`/`status`/`display_version` the token also carries (the token is
 * the fallback for those). Extraction is defensive — any field may be absent.
 */
export interface InstallWebhookBody {
  status?: string;
  install_id?: string;
  display_version?: string;
  account?: InstallWebhookBodyAccount | null;
  /** The per-install backoffice API endpoint block. */
  api?: { url?: string } | null;
  /** The user that triggered the event (same shape as the token's `user`). */
  modified_by?: RawPeekTokenUser | null;
}

/**
 * Narrows an unknown request body to an {@link InstallWebhookBody}, tolerating a
 * JSON string (parsed first) and returning `{}` for anything non-object or
 * unparseable, so the caller never has to guard.
 */
export function extractInstallWebhookBody(payload: unknown): InstallWebhookBody {
  let body: unknown = payload;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return {};
    }
  }
  if (!body || typeof body !== "object") return {};
  return body as InstallWebhookBody;
}

/**
 * Narrows a delivered status to the {@link InstallStatus} union, or `null` when
 * the registry sent one this version of the package does not know.
 */
export function toInstallStatus(raw: string): InstallStatus | null {
  return (INSTALL_STATUSES as readonly string[]).includes(raw)
    ? (raw as InstallStatus)
    : null;
}

/**
 * Narrows a reported platform to the {@link PeekPlatform} union, or `null` when
 * the registry sent one this version of the package does not know.
 */
export function toPeekPlatform(raw: string): PeekPlatform | null {
  return (PEEK_PLATFORMS as readonly string[]).includes(raw)
    ? (raw as PeekPlatform)
    : null;
}
