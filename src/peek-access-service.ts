/**
 * Authenticated root entry point to the Peek backoffice GraphQL gateway.
 *
 * Configure one instance per install with everything needed to authenticate and
 * reach the gateway. The access service owns the shared, authenticated
 * transport (it mints and caches tokens on demand) and hands out per-resource
 * service objects — e.g. {@link PeekAccessService.getProductService} — that
 * carry the resource-specific business logic.
 */
import * as jwt from "jsonwebtoken";
import { AccountUserService } from "./internal/account-users/account-user-service.js";
import { AvailabilityService } from "./internal/availability/availability-service.js";
import { BookingService } from "./internal/bookings/booking-service.js";
import { DailyNoteService } from "./internal/daily-notes/daily-note-service.js";
import { GraphQLClient } from "./internal/graphql-client.js";
import { MembershipService } from "./internal/memberships/membership-service.js";
import { ResellerService } from "./internal/resellers/reseller-service.js";
import { ResourcePoolService } from "./internal/resource-pools/resource-pool-service.js";
import { ReviewService } from "./internal/reviews/review-service.js";
import { TimeslotService } from "./internal/timeslots/timeslot-service.js";
import {
  ProductService,
  type ProductServiceOptions,
} from "./internal/products/product-service.js";
import { PromoCodeService } from "./internal/promo-codes/promo-code-service.js";
import { V2_EXTENDABLE_SLUG } from "./internal/gateway-endpoints.js";
import { TokenManager } from "./internal/token-manager.js";
import { noopLogger, type Logger } from "./logger.js";
import type { PeekAuthTokenClaims } from "./models/auth-token.js";
import type { AvailabilityTimesQuery } from "./models/availability-time.js";
import type {
  BookingReadOptions,
  BookingTimeRangeSearch,
  CreateBookingInput,
  NoteMode,
} from "./models/booking.js";
import type { MakePaymentInput, RefundInput } from "./models/booking-payment.js";
import type { MembershipPurchaseInput } from "./models/membership.js";
import type { CreatePromoCodeInput } from "./models/promo-code.js";
import type { ResourcePoolMode } from "./models/resource-pool.js";
import type { GuideAssignment, TimeslotFilter } from "./models/timeslot.js";
import type { AddAddonInput } from "./internal/bookings/booking-service.js";

/** Default backoffice GraphQL gateway base URL (v1). */
const DEFAULT_BASE_URL = "https://apps.peekapis.com/backoffice-gql";
/** Default gateway base URL when operating in v2 mode. */
const DEFAULT_V2_BASE_URL =
  "https://app-registry.peeklabs.com/installations-api";
/** Default JWT lifetime (1 hour). */
const DEFAULT_TOKEN_TTL_SECONDS = 3600;
/** Default leeway before expiry at which a cached token is re-minted. */
const DEFAULT_TOKEN_REFRESH_LEEWAY_SECONDS = 60;
/** Default HTTP 429 retry backoff. */
const DEFAULT_RETRY_DELAYS_MS = [1000, 2000, 4000];
/** JWT issuer set by the Peek app registry on all tokens it issues. */
const PEEK_TOKEN_ISSUER = "app_registry_v2";

interface RawPeekTokenPayload {
  sub: string;
  display_version: string;
  user: { email: string; id: string; is_admin: boolean; locale: string; name: string };
}

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
  /** API gateway key, sent as the `pk-api-key` header. Required in v1 mode; not used in v2. */
  gatewayKey?: string;

  /**
   * Gateway mode. `"v2"` routes through the app-registry installations API
   * (`baseUrl/appId/peek_backoffice_api-v1/endpointName`) and defaults to the
   * app-registry sandbox base URL. `"v1"` (default) uses the standard backoffice
   * GraphQL gateway.
   */
  mode?: "v2";
  /** Override the gateway base URL. Default: Peek production gateway (v1) or app-registry sandbox (v2). */
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
 * import { PeekAccessService, type Product } from "@peektravel/app-utilities";
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
  private readonly jwtSecret: string;
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
  private reviewService?: ReviewService;

  constructor(config: PeekAccessServiceConfig) {
    const isV2 = config.mode === "v2";
    requireNonEmpty(config.installId, "installId");
    requireNonEmpty(config.jwtSecret, "jwtSecret");
    requireNonEmpty(config.issuer, "issuer");
    requireNonEmpty(config.appId, "appId");
    if (!isV2) requireNonEmpty(config.gatewayKey ?? "", "gatewayKey");

    this.jwtSecret = config.jwtSecret;

    const logger = config.logger ?? noopLogger;
    const tokens = new TokenManager({
      secret: config.jwtSecret,
      issuer: config.issuer,
      installId: config.installId,
      ttlSeconds: config.tokenTtlSeconds ?? DEFAULT_TOKEN_TTL_SECONDS,
      leewaySeconds:
        config.tokenRefreshLeewaySeconds ??
        DEFAULT_TOKEN_REFRESH_LEEWAY_SECONDS,
    });

    const defaultBaseUrl = isV2 ? DEFAULT_V2_BASE_URL : DEFAULT_BASE_URL;
    this.client = new GraphQLClient({
      baseUrl: config.baseUrl ?? defaultBaseUrl,
      appId: config.appId,
      gatewayKey: config.gatewayKey,
      getToken: () => tokens.getToken(),
      retryDelaysMs: config.retryDelaysMs ?? DEFAULT_RETRY_DELAYS_MS,
      logger,
      fetchFn: config.fetch ?? globalThis.fetch,
      endpointPathPrefix: isV2 ? V2_EXTENDABLE_SLUG : undefined,
    });

    this.productServiceOptions = {
      itemOptionsPageSize: config.itemOptionsPageSize,
    };
  }

  /**
   * Verifies a Peek auth token issued by the app registry and returns the
   * decoded claims.
   *
   * Validates the HMAC signature (using this service's `jwtSecret`), the token
   * expiry, the `"app_registry_v2"` issuer, and the `"Joken"` audience. Throws
   * from the `jsonwebtoken` library on any failure — callers should catch to
   * distinguish error kinds:
   *
   * - `JsonWebTokenError` — signature invalid, wrong issuer/audience, or token
   *   malformed
   * - `TokenExpiredError` — past `exp`
   * - `NotBeforeError` — before `nbf`
   *
   * @throws {JsonWebTokenError} signature invalid or token malformed
   * @throws {TokenExpiredError} token has expired
   * @throws {NotBeforeError} token not yet valid
   */
  verifyPeekAuthToken(token: string): PeekAuthTokenClaims {
    const payload = jwt.verify(token, this.jwtSecret, {
      issuer: PEEK_TOKEN_ISSUER,
    }) as RawPeekTokenPayload;

    const { user: u } = payload;
    return {
      installId: payload.sub,
      displayVersion: payload.display_version,
      user: {
        email: u.email,
        id: u.id,
        isAdmin: u.is_admin,
        locale: u.locale,
        name: u.name,
      },
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

  /**
   * Returns the {@link ReviewService} for this install, bound to the shared
   * authenticated transport. The instance is created lazily and reused.
   */
  getReviewService(): ReviewService {
    if (!this.reviewService) {
      this.reviewService = new ReviewService(this.client);
    }
    return this.reviewService;
  }

  // ─── Product short-forms ─────────────────────────────────────────────────

  /** All products (activities + add-ons). Delegates to {@link ProductService.getAllProducts}. */
  getAllProducts() { return this.getProductService().getAllProducts(); }

  /** All activity products (excludes add-ons). Delegates to {@link ProductService.getAllActivities}. */
  getAllActivities() { return this.getProductService().getAllActivities(); }

  /** All rental products. Delegates to {@link ProductService.getAllRentals}. */
  getAllRentals() { return this.getProductService().getAllRentals(); }

  /** All add-on products. Delegates to {@link ProductService.getAllAddons}. */
  getAllAddons() { return this.getProductService().getAllAddons(); }

  // ─── Account-user short-forms ─────────────────────────────────────────────

  /** All active account users. Delegates to {@link AccountUserService.getAll}. */
  getAllAccountUsers() { return this.getAccountUserService().getAll(); }

  /** Account user by id, or null. Delegates to {@link AccountUserService.getById}. */
  getAccountUserById(userId: string) { return this.getAccountUserService().getById(userId); }

  // ─── Resource-pool short-forms ────────────────────────────────────────────

  /** All resource pools. Delegates to {@link ResourcePoolService.getAll}. */
  getAllResourcePools(mode?: ResourcePoolMode) { return this.getResourcePoolService().getAll(mode); }

  // ─── Timeslot short-forms ─────────────────────────────────────────────────

  /** Timeslots for an activity on a given date. Delegates to {@link TimeslotService.getForDay}. */
  getTimeslotsForDay(productId: string, date: string, filter?: TimeslotFilter) {
    return this.getTimeslotService().getForDay(productId, date, filter);
  }

  /** Single timeslot by id. Delegates to {@link TimeslotService.getById}. */
  getTimeslotById(timeslotId: string) { return this.getTimeslotService().getById(timeslotId); }

  /** Set timeslot status. Delegates to {@link TimeslotService.setAvailability}. */
  setTimeslotAvailability(timeslotId: string, status: string) {
    return this.getTimeslotService().setAvailability(timeslotId, status);
  }

  /** Set timeslot manifest notes. Delegates to {@link TimeslotService.setNotes}. */
  setTimeslotNotes(timeslotId: string, manifestNotes: string) {
    return this.getTimeslotService().setNotes(timeslotId, manifestNotes);
  }

  /** Assign or unassign guides on timeslots. Delegates to {@link TimeslotService.assignGuide}. */
  assignTimeslotGuide(assignment: GuideAssignment) {
    return this.getTimeslotService().assignGuide(assignment);
  }

  // ─── Reseller short-forms ─────────────────────────────────────────────────

  /** All reseller channels. Delegates to {@link ResellerService.getAllChannels}. */
  getAllChannels(agentsPerChannel?: number) {
    return this.getResellerService().getAllChannels(agentsPerChannel);
  }

  // ─── Promo-code short-forms ───────────────────────────────────────────────

  /** All promo codes. Delegates to {@link PromoCodeService.getAll}. */
  getAllPromoCodes() { return this.getPromoCodeService().getAll(); }

  /** Create a promo code. Delegates to {@link PromoCodeService.create}. */
  createPromoCode(input: CreatePromoCodeInput) { return this.getPromoCodeService().create(input); }

  // ─── Daily-note short-forms ───────────────────────────────────────────────

  /** Today's daily note. Delegates to {@link DailyNoteService.getToday}. */
  getDailyNoteToday() { return this.getDailyNoteService().getToday(); }

  /** Update today's daily note. Delegates to {@link DailyNoteService.update}. */
  updateDailyNote(note: string) { return this.getDailyNoteService().update(note); }

  // ─── Availability short-forms ─────────────────────────────────────────────

  /** Availability times for an activity. Delegates to {@link AvailabilityService.getAvailabilityTimes}. */
  getAvailabilityTimes(query: AvailabilityTimesQuery) {
    return this.getAvailabilityService().getAvailabilityTimes(query);
  }

  // ─── Membership short-forms ───────────────────────────────────────────────

  /** All memberships. Delegates to {@link MembershipService.getAll}. */
  getAllMemberships() { return this.getMembershipService().getAll(); }

  /** Purchase a membership. Delegates to {@link MembershipService.purchase}. */
  purchaseMembership(input: MembershipPurchaseInput) {
    return this.getMembershipService().purchase(input);
  }

  // ─── Booking short-forms ──────────────────────────────────────────────────

  /** Booking by id. Delegates to {@link BookingService.getById}. */
  getBookingById(bookingId: string, options?: BookingReadOptions) {
    return this.getBookingService().getById(bookingId, options);
  }

  /** Bookings by time range. Delegates to {@link BookingService.searchByTimeRange}. */
  searchBookingsByTimeRange(input: BookingTimeRangeSearch) {
    return this.getBookingService().searchByTimeRange(input);
  }

  /** Bookings on a timeslot. Delegates to {@link BookingService.searchByTimeslot}. */
  searchBookingsByTimeslot(timeslotId: string, options?: BookingReadOptions) {
    return this.getBookingService().searchByTimeslot(timeslotId, options);
  }

  /** Guests on a booking. Delegates to {@link BookingService.getGuests}. */
  getBookingGuests(bookingId: string) { return this.getBookingService().getGuests(bookingId); }

  /** Payments on file for a booking. Delegates to {@link BookingService.getPaymentsOnFile}. */
  getBookingPaymentsOnFile(bookingId: string) {
    return this.getBookingService().getPaymentsOnFile(bookingId);
  }

  /** Append or overwrite operator notes. Delegates to {@link BookingService.appendNote}. */
  appendBookingNote(bookingId: string, note: string, mode?: NoteMode) {
    return this.getBookingService().appendNote(bookingId, note, mode);
  }

  /** Set booking check-in status. Delegates to {@link BookingService.setCheckinStatus}. */
  setBookingCheckinStatus(bookingId: string, checkedIn: boolean) {
    return this.getBookingService().setCheckinStatus(bookingId, checkedIn);
  }

  /** Cancel a booking. Delegates to {@link BookingService.cancel}. */
  cancelBooking(bookingId: string, notes?: string) {
    return this.getBookingService().cancel(bookingId, notes);
  }

  /** Charge a booking. Delegates to {@link BookingService.makePayment}. */
  makeBookingPayment(input: MakePaymentInput) { return this.getBookingService().makePayment(input); }

  /** Refund a booking payment. Delegates to {@link BookingService.refund}. */
  refundBooking(input: RefundInput) { return this.getBookingService().refund(input); }

  /** Create an invoice link. Delegates to {@link BookingService.createInvoiceLink}. */
  createBookingInvoiceLink(bookingId: string) {
    return this.getBookingService().createInvoiceLink(bookingId);
  }

  /** List add-ons on a booking. Delegates to {@link BookingService.listAddons}. */
  listBookingAddons(bookingId: string) { return this.getBookingService().listAddons(bookingId); }

  /** Add an add-on to a booking. Delegates to {@link BookingService.addAddon}. */
  addBookingAddon(bookingId: string, input: AddAddonInput) {
    return this.getBookingService().addAddon(bookingId, input);
  }

  /** Remove an add-on from a booking. Delegates to {@link BookingService.removeAddon}. */
  removeBookingAddon(bookingId: string, input: AddAddonInput) {
    return this.getBookingService().removeAddon(bookingId, input);
  }

  /** Create a booking. Delegates to {@link BookingService.create}. */
  createBooking(input: CreateBookingInput) { return this.getBookingService().create(input); }

  // ─── Review short-forms ───────────────────────────────────────────────────

  /** Reviews for an activity. Delegates to {@link ReviewService.getReviews}. */
  getReviews(productId: string, reviewCount?: number, reviewOffset?: number) {
    return this.getReviewService().getReviews(productId, reviewCount, reviewOffset);
  }
}

function requireNonEmpty(value: string, name: string): void {
  if (!value) {
    throw new Error(`PeekAccessService: "${name}" is required`);
  }
}
