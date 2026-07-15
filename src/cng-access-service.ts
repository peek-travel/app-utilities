/**
 * Authenticated root entry point to the CNG backoffice REST gateway.
 *
 * The CNG sibling of {@link PeekAccessService}. Configure one instance per
 * install; it owns the shared, authenticated transport (minting/caching tokens
 * on demand) and hands out the {@link CngProductService}.
 *
 * Auth and transport mirror the Peek access service: the same app JWT
 * (`X-Peek-Auth: Bearer`) minted from the Peek app credentials via the shared
 * {@link TokenManager}, routed through the app-registry installations API. The
 * only differences are the extendable slug (`cng_backoffice_api-v1`), REST
 * rather than GraphQL, and no `pk-api-key` header.
 */
import {
  createTokenManager,
  requireNonEmpty,
  DEFAULT_RETRY_DELAYS_MS,
  type BaseAccessServiceConfig,
} from "./access-service-config.js";
import { CNG_EXTENDABLE_SLUG } from "./internal/cng/endpoints.js";
import { CngProductService } from "./internal/cng/products/product-service.js";
import { RestClient } from "./internal/cng/rest-client.js";
import { noopLogger } from "./logger.js";

/** Default gateway base URL — the app-registry installations API. */
const DEFAULT_BASE_URL = "https://app-registry.peeklabs.com/installations-api";

/**
 * Configuration for a {@link CngAccessService} instance. CNG adds no fields
 * beyond {@link BaseAccessServiceConfig} — it authenticates on the app JWT
 * alone (no `pk-api-key`, so no `gatewayKey`).
 */
export type CngAccessServiceConfig = BaseAccessServiceConfig;

/**
 * Authenticated root entry point to the CNG backoffice REST gateway.
 *
 * @example
 * ```ts
 * import { CngAccessService, type Activity } from "@peektravel/app-utilities";
 *
 * const cng = new CngAccessService({
 *   installId: "install-123",
 *   jwtSecret: process.env.PEEK_APP_SECRET!,
 *   issuer: process.env.PEEK_APP_ID!,
 *   appId: process.env.PEEK_APP_ID!,
 * });
 *
 * const activities: Activity[] = await cng.getAllActivities();
 * ```
 *
 * @throws {Error} from the constructor when any required config field
 * (`installId`, `jwtSecret`, `issuer`, `appId`) is empty.
 */
export class CngAccessService {
  private readonly client: RestClient;
  private productService?: CngProductService;

  constructor(config: CngAccessServiceConfig) {
    requireNonEmpty(config.installId, "installId", "CngAccessService");
    requireNonEmpty(config.jwtSecret, "jwtSecret", "CngAccessService");
    requireNonEmpty(config.issuer, "issuer", "CngAccessService");
    requireNonEmpty(config.appId, "appId", "CngAccessService");

    const logger = config.logger ?? noopLogger;
    const tokens = createTokenManager(config);

    this.client = new RestClient({
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      appId: config.appId,
      extendableSlug: CNG_EXTENDABLE_SLUG,
      getToken: () => tokens.getToken(),
      retryDelaysMs: config.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS,
      logger,
      fetchFn: config.fetch ?? globalThis.fetch,
    });
  }

  /**
   * Returns the {@link CngProductService} for this install, bound to the shared
   * authenticated transport. The instance is created lazily and reused.
   */
  getProductService(): CngProductService {
    if (!this.productService) {
      this.productService = new CngProductService(this.client);
    }
    return this.productService;
  }

  /** All activities. Delegates to {@link CngProductService.getAllActivities}. */
  getAllActivities() {
    return this.getProductService().getAllActivities();
  }
}
