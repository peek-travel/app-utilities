/**
 * Authenticated root entry point to the ACME backoffice REST gateway.
 *
 * The ACME sibling of {@link PeekAccessService} / {@link CngAccessService}.
 * Configure one instance per install; it owns the shared, authenticated
 * transport (minting/caching tokens on demand) and hands out the
 * {@link AcmeProductService}.
 *
 * Auth and transport mirror the CNG access service: the same app JWT
 * (`X-Peek-Auth: Bearer`) minted from the Peek app credentials via the shared
 * {@link TokenManager}, routed through the app-registry installations API. The
 * only differences are the extendable slug (`acme_backoffice_api-v1`), REST
 * rather than GraphQL, and no `pk-api-key` header.
 */
import {
  createTokenManager,
  requireNonEmpty,
  DEFAULT_RETRY_DELAYS_MS,
  type BaseAccessServiceConfig,
} from "./access-service-config.js";
import { ACME_EXTENDABLE_SLUG } from "./internal/acme/endpoints.js";
import { AcmeProductService } from "./internal/acme/products/product-service.js";
import { RestClient } from "./internal/acme/rest-client.js";
import { noopLogger } from "./logger.js";

/** Default gateway base URL — the app-registry installations API. */
const DEFAULT_BASE_URL = "https://app-registry.peeklabs.com/installations-api";

/**
 * Configuration for an {@link AcmeAccessService} instance. ACME adds no fields
 * beyond {@link BaseAccessServiceConfig} — it authenticates on the app JWT
 * alone (no `pk-api-key`, so no `gatewayKey`).
 */
export type AcmeAccessServiceConfig = BaseAccessServiceConfig;

/**
 * Authenticated root entry point to the ACME backoffice REST gateway.
 *
 * @example
 * ```ts
 * import { AcmeAccessService, type AcmeActivity } from "@peektravel/app-utilities";
 *
 * const acme = new AcmeAccessService({
 *   installId: "install-123",
 *   jwtSecret: process.env.PEEK_APP_SECRET!,
 *   issuer: process.env.PEEK_APP_ID!,
 *   appId: process.env.PEEK_APP_ID!,
 * });
 *
 * const activities: AcmeActivity[] = await acme.getAllActivities();
 * ```
 *
 * @throws {Error} from the constructor when any required config field
 * (`installId`, `jwtSecret`, `issuer`, `appId`) is empty.
 */
export class AcmeAccessService {
  private readonly client: RestClient;
  private productService?: AcmeProductService;

  constructor(config: AcmeAccessServiceConfig) {
    requireNonEmpty(config.installId, "installId", "AcmeAccessService");
    requireNonEmpty(config.jwtSecret, "jwtSecret", "AcmeAccessService");
    requireNonEmpty(config.issuer, "issuer", "AcmeAccessService");
    requireNonEmpty(config.appId, "appId", "AcmeAccessService");

    const logger = config.logger ?? noopLogger;
    const tokens = createTokenManager(config);

    this.client = new RestClient({
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      appId: config.appId,
      extendableSlug: ACME_EXTENDABLE_SLUG,
      getToken: () => tokens.getToken(),
      retryDelaysMs: config.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS,
      logger,
      fetchFn: config.fetch ?? globalThis.fetch,
    });
  }

  /**
   * Returns the {@link AcmeProductService} for this install, bound to the shared
   * authenticated transport. The instance is created lazily and reused.
   */
  getProductService(): AcmeProductService {
    if (!this.productService) {
      this.productService = new AcmeProductService(this.client);
    }
    return this.productService;
  }

  /** All activities. Delegates to {@link AcmeProductService.getAllActivities}. */
  getAllActivities() {
    return this.getProductService().getAllActivities();
  }
}
