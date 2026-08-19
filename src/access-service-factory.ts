/**
 * Factory that turns a persisted install (or a parsed install webhook) into the
 * right access service for its platform, wired to the install's own app
 * endpoint.
 *
 * The install webhook is the only source of an install's `platform` and `apiUrl`
 * (see `src/models/peek/install.ts`), and those two facts are exactly what's
 * needed to target it: `platform` picks the service class, and `apiUrl` is used
 * **as given** as that service's endpoint. This helper encodes that mapping so a
 * consumer that persisted an install can construct its client in one call
 * instead of switching on the platform and hand-wiring the URL.
 */
import {
  PeekAccessService,
  type PeekAccessServiceConfig,
} from "./peek-access-service.js";
import { CngAccessService } from "./cng-access-service.js";
import { AcmeAccessService } from "./acme-access-service.js";
import type { PeekPlatform } from "./models/peek/auth-token.js";

/**
 * The per-install facts needed to build an access service — a structural subset
 * of {@link InstallWebhook}, so a persisted install record (or the webhook event
 * itself) satisfies it directly.
 */
export interface InstallAccessTarget {
  /** Which platform serves the install (the install webhook's `platform`). */
  platform: PeekPlatform | null;
  /** The install's app endpoint URL (the install webhook's `apiUrl`), used as given. */
  apiUrl: string;
  /** The install id (the install webhook's `installId`) — becomes the JWT subject. */
  installId: string;
}

/**
 * The per-app credentials/options shared by every access service — everything
 * except the per-install `installId`/`apiUrl` (supplied by the target) and the
 * deprecated `appId`/`baseUrl`/`mode` URL controls (superseded by `apiUrl`).
 * `gatewayKey` is accepted for Peek and ignored by CNG/ACME.
 */
export type InstallAccessConfig = Omit<
  PeekAccessServiceConfig,
  "installId" | "apiUrl" | "appId" | "baseUrl" | "mode"
>;

/** The union of access services this factory can return, narrowed by `platform`. */
export type InstallAccessService =
  | PeekAccessService
  | CngAccessService
  | AcmeAccessService;

/**
 * Builds the access service for `install.platform`, using `install.apiUrl` as
 * the service's endpoint. Narrow the return by `install.platform` (or
 * `instanceof`) to reach a platform-specific surface.
 *
 * @throws {Error} when `install.platform` is `null` or unrecognised — an install
 * with an unknown platform has no service to route to, and silently defaulting
 * would point it at the wrong gateway.
 */
export function createAccessServiceForInstall(
  install: InstallAccessTarget,
  config: InstallAccessConfig,
): InstallAccessService {
  const shared = { ...config, installId: install.installId, apiUrl: install.apiUrl };
  switch (install.platform) {
    case "peek":
      return new PeekAccessService(shared);
    case "cng":
      return new CngAccessService(shared);
    case "acme":
      return new AcmeAccessService(shared);
    default:
      throw new Error(
        `createAccessServiceForInstall: unknown or missing platform ` +
          `"${install.platform}" for install "${install.installId}"`,
      );
  }
}
