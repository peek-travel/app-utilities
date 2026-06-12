/**
 * Authenticated root entry point to the Peek backoffice GraphQL gateway.
 *
 * Configure one instance per install with everything needed to authenticate and
 * reach the gateway. The access service owns the shared, authenticated
 * transport (it mints and caches tokens on demand) and hands out per-resource
 * service objects — e.g. {@link PeekAccessService.getProductService} — that
 * carry the resource-specific business logic.
 */
import { AccountUserService } from "./internal/account-users/account-user-service.js";
import { AvailabilityService } from "./internal/availability/availability-service.js";
import { BookingService } from "./internal/bookings/booking-service.js";
import { DailyNoteService } from "./internal/daily-notes/daily-note-service.js";
import { GraphQLClient } from "./internal/graphql-client.js";
import { MembershipService } from "./internal/memberships/membership-service.js";
import { ResellerService } from "./internal/resellers/reseller-service.js";
import { ResourcePoolService } from "./internal/resource-pools/resource-pool-service.js";
import { TimeslotService } from "./internal/timeslots/timeslot-service.js";
import {
  ProductService,
  type ProductServiceOptions,
} from "./internal/products/product-service.js";
import { PromoCodeService } from "./internal/promo-codes/promo-code-service.js";
import { TokenManager } from "./internal/token-manager.js";
import { noopLogger, type Logger } from "./logger.js";

/** Default backoffice GraphQL gateway base URL. */
const DEFAULT_BASE_URL = "https://apps.peekapis.com/backoffice-gql";
/** Default JWT lifetime (1 hour). */
const DEFAULT_TOKEN_TTL_SECONDS = 3600;
/** Default leeway before expiry at which a cached token is re-minted. */
const DEFAULT_TOKEN_REFRESH_LEEWAY_SECONDS = 60;
/** Default HTTP 429 retry backoff. */
const DEFAULT_RETRY_DELAYS_MS = [1000, 2000, 4000];

/** Configuration for a {@link PeekAccessService} instance. */
export interface PeekAccessServiceConfig {
  /** Peek install ID. Becomes the JWT subject. */
  installId: string;
  /** HMAC secret used to sign the JWT (the Peek internal secret). */
  jwtSecret: string;
  /** JWT issuer — the app name. */
  issuer: string;
  /** Peek app ID, used in the gateway endpoint path. */
  appId: string;
  /** API gateway key, sent as the `pk-api-key` header. */
  gatewayKey: string;

  /** Override the gateway base URL. Default: Peek production gateway. */
  baseUrl?: string;
  /** JWT lifetime in seconds. Default: 3600. */
  tokenTtlSeconds?: number;
  /** Re-mint the cached token this many seconds before expiry. Default: 60. */
  tokenRefreshLeewaySeconds?: number;
  /** Backoff delays (ms) for HTTP 429 retries. Default: [1000, 2000, 4000]. */
  retryDelaysMs?: number[];
  /** Optional logger. Default: no-op (silent). */
  logger?: Logger;
  /** Custom `fetch` implementation. Default: the global `fetch`. */
  fetch?: typeof fetch;
  /** Page size for cursor-paginated item options. Default: 50. */
  itemOptionsPageSize?: number;
}

/**
 * Authenticated root entry point to the Peek backoffice GraphQL gateway.
 *
 * Construct one instance per install, then call the `get<Resource>Service()`
 * accessors to reach the resource-specific operations. Each accessor returns a
 * memoized service bound to the shared, authenticated transport — the access
 * service mints and caches a short-lived JWT on demand.
 *
 * @example Configure once, then call resource services
 * ```ts
 * import { PeekAccessService, type Product } from "@peek-travel/app-utilities";
 *
 * const peek = new PeekAccessService({
 *   installId: "install-123",            // JWT subject
 *   jwtSecret: process.env.PEEK_INTERNAL_SECRET!, // signs the JWT
 *   issuer: process.env.APP_NAME!,        // JWT issuer
 *   appId: process.env.PEEK_APP_ID!,      // gateway path segment
 *   gatewayKey: process.env.PEEK_GATEWAY_KEY!, // pk-api-key header
 * });
 *
 * const products: Product[] = await peek.getProductService().getAllProducts();
 * const booking = await peek.getBookingService().getById("b_abc123");
 * ```
 *
 * @throws {Error} from the constructor when any required config field
 * (`installId`, `jwtSecret`, `issuer`, `appId`, `gatewayKey`) is empty.
 */
export class PeekAccessService {
  private readonly client: GraphQLClient;
  private readonly productServiceOptions: ProductServiceOptions;
  private productService?: ProductService;
  private accountUserService?: AccountUserService;
  private resourcePoolService?: ResourcePoolService;
  private timeslotService?: TimeslotService;
  private resellerService?: ResellerService;
  private promoCodeService?: PromoCodeService;
  private dailyNoteService?: DailyNoteService;
  private availabilityService?: AvailabilityService;
  private membershipService?: MembershipService;
  private bookingService?: BookingService;

  constructor(config: PeekAccessServiceConfig) {
    requireNonEmpty(config.installId, "installId");
    requireNonEmpty(config.jwtSecret, "jwtSecret");
    requireNonEmpty(config.issuer, "issuer");
    requireNonEmpty(config.appId, "appId");
    requireNonEmpty(config.gatewayKey, "gatewayKey");

    const logger = config.logger ?? noopLogger;
    const tokens = new TokenManager({
      secret: config.jwtSecret,
      issuer: config.issuer,
      installId: config.installId,
      ttlSeconds: config.tokenTtlSeconds ?? DEFAULT_TOKEN_TTL_SECONDS,
      leewaySeconds:
        config.tokenRefreshLeewaySeconds ?? DEFAULT_TOKEN_REFRESH_LEEWAY_SECONDS,
    });

    this.client = new GraphQLClient({
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      appId: config.appId,
      gatewayKey: config.gatewayKey,
      getToken: () => tokens.getToken(),
      retryDelaysMs: config.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS,
      logger,
      fetchFn: config.fetch ?? globalThis.fetch,
    });

    this.productServiceOptions = {
      itemOptionsPageSize: config.itemOptionsPageSize,
    };
  }

  /**
   * Returns the {@link ProductService} for this install, bound to the shared
   * authenticated transport. The instance is created lazily and reused.
   */
  getProductService(): ProductService {
    if (!this.productService) {
      this.productService = new ProductService(
        this.client,
        this.productServiceOptions,
      );
    }
    return this.productService;
  }

  /**
   * Returns the {@link AccountUserService} for this install, bound to the shared
   * authenticated transport. The instance is created lazily and reused.
   */
  getAccountUserService(): AccountUserService {
    if (!this.accountUserService) {
      this.accountUserService = new AccountUserService(this.client);
    }
    return this.accountUserService;
  }

  /**
   * Returns the {@link ResourcePoolService} for this install, bound to the
   * shared authenticated transport. The instance is created lazily and reused.
   */
  getResourcePoolService(): ResourcePoolService {
    if (!this.resourcePoolService) {
      this.resourcePoolService = new ResourcePoolService(this.client);
    }
    return this.resourcePoolService;
  }

  /**
   * Returns the {@link TimeslotService} for this install, bound to the shared
   * authenticated transport. The instance is created lazily and reused; its
   * guide assignment composes the resource-pool and account-user services.
   */
  getTimeslotService(): TimeslotService {
    if (!this.timeslotService) {
      this.timeslotService = new TimeslotService(this.client, {
        resourcePoolService: this.getResourcePoolService(),
        accountUserService: this.getAccountUserService(),
      });
    }
    return this.timeslotService;
  }

  /**
   * Returns the {@link ResellerService} for this install, bound to the shared
   * authenticated transport. The instance is created lazily and reused.
   */
  getResellerService(): ResellerService {
    if (!this.resellerService) {
      this.resellerService = new ResellerService(this.client);
    }
    return this.resellerService;
  }

  /**
   * Returns the {@link PromoCodeService} for this install, bound to the shared
   * authenticated transport. The instance is created lazily and reused.
   */
  getPromoCodeService(): PromoCodeService {
    if (!this.promoCodeService) {
      this.promoCodeService = new PromoCodeService(this.client);
    }
    return this.promoCodeService;
  }

  /**
   * Returns the {@link DailyNoteService} for this install, bound to the shared
   * authenticated transport. The instance is created lazily and reused.
   */
  getDailyNoteService(): DailyNoteService {
    if (!this.dailyNoteService) {
      this.dailyNoteService = new DailyNoteService(this.client);
    }
    return this.dailyNoteService;
  }

  /**
   * Returns the {@link AvailabilityService} for this install, bound to the
   * shared authenticated transport. The instance is created lazily and reused.
   */
  getAvailabilityService(): AvailabilityService {
    if (!this.availabilityService) {
      this.availabilityService = new AvailabilityService(this.client);
    }
    return this.availabilityService;
  }

  /**
   * Returns the {@link MembershipService} for this install, bound to the shared
   * authenticated transport. The instance is created lazily and reused.
   */
  getMembershipService(): MembershipService {
    if (!this.membershipService) {
      this.membershipService = new MembershipService(this.client);
    }
    return this.membershipService;
  }

  /**
   * Returns the {@link BookingService} for this install, bound to the shared
   * authenticated transport. The instance is created lazily and reused.
   */
  getBookingService(): BookingService {
    if (!this.bookingService) {
      this.bookingService = new BookingService(this.client, {
        productService: this.getProductService(),
      });
    }
    return this.bookingService;
  }
}

function requireNonEmpty(value: string, name: string): void {
  if (!value) {
    throw new Error(`PeekAccessService: "${name}" is required`);
  }
}
