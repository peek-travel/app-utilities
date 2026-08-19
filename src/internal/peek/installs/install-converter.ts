/**
 * Pure, I/O-free mapping of the raw install-event webhook body into the clean
 * {@link InstallEvent} model. No network, no logging, no clock.
 *
 * Internal only — never re-exported from `src/index.ts`.
 */
import {
  PEEK_PLATFORMS,
  type PeekPlatform,
} from "../../../models/peek/auth-token.js";
import {
  INSTALL_STATUSES,
  type InstallEvent,
  type InstallIdentity,
  type InstallStatus,
} from "../../../models/peek/install.js";

/** The raw, snake_case account block of an install-event body. */
export interface InstallEventAccountNode {
  id?: string;
  name?: string;
  platform?: string;
  is_test?: boolean;
}

/** The raw, snake_case install-event body as delivered by the app registry. */
export interface InstallEventNode {
  status?: string;
  install_id?: string;
  display_version?: string;
  account?: InstallEventAccountNode | null;
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

/** Maps the raw account block to the clean {@link InstallIdentity}. */
export function fromInstallIdentityNode(
  node: InstallEventNode | null | undefined,
): InstallIdentity {
  const data = node ?? {};
  const account = data.account ?? {};
  return {
    installId: data.install_id || "",
    accountId: account.id || "",
    accountName: account.name || "",
    platform: toPeekPlatform(account.platform || ""),
    isTest: Boolean(account.is_test),
  };
}

/** Maps a raw install-event body to the clean {@link InstallEvent}. */
export function fromInstallEventNode(
  node: InstallEventNode | null | undefined,
): InstallEvent {
  const rawStatus = node?.status || "";
  return {
    status: toInstallStatus(rawStatus),
    rawStatus,
    displayVersion: node?.display_version || "",
    identity: fromInstallIdentityNode(node),
  };
}
