/**
 * Public webhook surface for the **install-event** channel — the JSON body
 * Peek's app registry POSTs on install, uninstall, and update.
 *
 * This is the second of the two install channels. Its sibling,
 * `verifyInstallWebhook`, receives the same lifecycle event as a signed
 * `app_registry_v2` JWT; that payload authenticates itself but carries only the
 * account **id**. This one carries the account's name, platform, and test flag
 * as well, which makes it the authoritative source of {@link InstallIdentity}.
 *
 * Like the booking and waiver parsers, this is a pure transform — no auth, no
 * network, no client — so it is a standalone function rather than a method on
 * `PeekAccessService`. The receiver holds no gateway credentials for an install
 * it has not recorded yet, and an uninstall describes one being torn down.
 *
 * **It never throws.** The sender is first-party and the payload contract is
 * Peek's own, so defending against malformed input would be defending against a
 * case that does not arise. What the parser does guard is the contract
 * *growing*: an unrecognised `status` or `platform` surfaces as `null` rather
 * than being coerced into a known value, so a newer registry can never be
 * silently mistaken for an older one.
 */
import type { InstallEvent } from "../../../models/peek/install.js";
import {
  fromInstallEventNode,
  type InstallEventNode,
} from "./install-converter.js";

/**
 * Parses a delivered install-event webhook body into a clean
 * {@link InstallEvent}.
 *
 * Accepts the raw request body, or a JSON string, which is parsed first.
 * Missing fields map to `""`/`false`; an unknown `status` or `platform` maps to
 * `null` with the wire value preserved on {@link InstallEvent.rawStatus}.
 *
 * Handle a `null` `status` explicitly. Peek treats any 2xx as delivered and
 * will not redeliver, so responding successfully to a status the package does
 * not recognise silently drops a lifecycle transition:
 *
 * ```ts
 * const event = parseInstallEvent(req.body);
 * switch (event.status) {
 *   case "installed":        return provision(event.identity, event.displayVersion);
 *   case "uninstalled":      return deprovision(event.identity);
 *   case "update_installed": return recordVersion(event.identity, event.displayVersion);
 *   default:                 throw new Error(`unknown install status: ${event.rawStatus}`);
 * }
 * ```
 *
 * Persist `event.identity` as a unit: it is flat and JSON-safe, and its
 * `accountId` (the partner ID) has no other source in the system.
 */
export function parseInstallEvent(payload: unknown): InstallEvent {
  return fromInstallEventNode(extractInstallEventNode(payload));
}

/** Narrows the raw request body to an install-event node, tolerating a string. */
function extractInstallEventNode(payload: unknown): InstallEventNode {
  let body: unknown = payload;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return {};
    }
  }
  if (!body || typeof body !== "object") return {};
  return body as InstallEventNode;
}
