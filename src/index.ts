/**
 * @peektravel/app-utilities
 *
 * Public entry point. Exposes the high-level access service, the clean data
 * models, the logger interface, and the typed errors. The underlying GraphQL
 * queries, response shapes, and transport are intentionally kept internal.
 */
export { PeekAccessService } from "./peek-access-service.js";
export type { PeekAccessServiceConfig } from "./peek-access-service.js";

// ─── Cross-cutting access options (PII exposure, …) ──────────────────────────
export type { AccessOptions } from "./access-options.js";

// ─── CNG (REST) — sibling accessor sharing this package's auth/transport/UI ──
export { CngAccessService } from "./cng-access-service.js";
export type { CngAccessServiceConfig } from "./cng-access-service.js";
export { CngProductService } from "./internal/cng/products/product-service.js";
export type { Activity, ActivityTicket } from "./models/cng/product.js";

// ─── ACME (REST) — sibling accessor sharing this package's auth/transport/UI ─
export { AcmeAccessService } from "./acme-access-service.js";
export type { AcmeAccessServiceConfig } from "./acme-access-service.js";
export { AcmeProductService } from "./internal/acme/products/product-service.js";
export type { AcmeActivity, AcmeActivityTicket } from "./models/acme/product.js";

// ─── Build the right access service for a persisted install (platform + apiUrl) ─
export { createAccessServiceForInstall } from "./access-service-factory.js";
export type {
  InstallAccessTarget,
  InstallAccessConfig,
  InstallAccessService,
} from "./access-service-factory.js";

export { ProductService } from "./internal/peek/products/product-service.js";
export type { ProductServiceOptions } from "./internal/peek/products/product-service.js";

export { AccountUserService } from "./internal/peek/account-users/account-user-service.js";
export type { AccountUserServiceOptions } from "./internal/peek/account-users/account-user-service.js";

export { ResourcePoolService } from "./internal/peek/resource-pools/resource-pool-service.js";

export { TimeslotService } from "./internal/peek/timeslots/timeslot-service.js";

export { ResellerService } from "./internal/peek/resellers/reseller-service.js";

export { PromoCodeService } from "./internal/peek/promo-codes/promo-code-service.js";
export type { PromoCodeServiceOptions } from "./internal/peek/promo-codes/promo-code-service.js";

export { PricingService } from "./internal/peek/pricing/pricing-service.js";

export { DailyNoteService } from "./internal/peek/daily-notes/daily-note-service.js";

export { AvailabilityService } from "./internal/peek/availability/availability-service.js";

export { MembershipService } from "./internal/peek/memberships/membership-service.js";

export { BookingService } from "./internal/peek/bookings/booking-service.js";
export type {
  AddAddonInput,
  BookingServiceOptions,
  CancelBookingResult,
} from "./internal/peek/bookings/booking-service.js";

export { parseBookingWebhook } from "./internal/peek/bookings/booking-webhook.js";

export { parseWaiverWebhook } from "./internal/peek/waivers/waiver-webhook.js";

export {
  parseInstallWebhook,
  verifyInstallWebhook,
} from "./internal/peek/installs/install-webhook.js";

export { ReviewService } from "./internal/peek/reviews/review-service.js";

export { ACTIVITY_PRODUCT_TYPE, ADD_ON_PRODUCT_TYPE, RENTAL_PRODUCT_TYPE } from "./models/peek/product.js";
export type { Product, ProductMeetingLocation, ProductTicket } from "./models/peek/product.js";
export type { AccountUser, AssignedActivity } from "./models/peek/account-user.js";
export type {
  ResourcePool,
  ResourcePoolAccountUser,
  ResourcePoolMode,
} from "./models/peek/resource-pool.js";
export type {
  AssignedResource,
  AssignGuideResult,
  GuideAssignment,
  Timeslot,
  TimeslotFilter,
  UpdateTimeslotResult,
} from "./models/peek/timeslot.js";
export type { Agent, Channel } from "./models/peek/channel.js";
export type {
  CreatePromoCodeInput,
  CreatedPromoCode,
  PromoCode,
  PromoCodeFixedAmount,
} from "./models/peek/promo-code.js";
export type {
  ActivityOverrides,
  ClearOverridesInput,
  CreateEngineInput,
  CreatedPricingEngine,
  PricingActivityContext,
  PricingEngine,
  PricingMoney,
  PricingNamedRef,
  PricingOverride,
  PricingOverrideFilter,
  ResolvedOverride,
  ResolvedPricingOverride,
  ResolvedResourceOption,
  ResourceOptionOverride,
  UpdateEngineInput,
  UpsertOverridesInput,
  UpsertOverridesResult,
} from "./models/peek/pricing.js";
export type { DailyNote } from "./models/peek/daily-note.js";
export type {
  Availability,
  AvailabilityTime,
  AvailabilityTimesQuery,
  Duration,
  ResourceOptionQuantity,
} from "./models/peek/availability-time.js";
export type {
  Membership,
  MembershipPurchaseInput,
  PurchasedMembership,
} from "./models/peek/membership.js";
export type {
  Booking,
  BookingReadOptions,
  BookingSearchBy,
  BookingTimeRangeSearch,
  CreateBookingGuest,
  CreateBookingInput,
  CreateBookingTicket,
  CreatedBooking,
  CustomQuestionAnswer,
  Guest,
  GuestMetadata,
  NoteMode,
  Price,
  Resource,
  ResourcePoolAssignment,
  Ticket,
} from "./models/peek/booking.js";
export type {
  BookingPaymentsOnFile,
  InvoiceLinkResult,
  MakePaymentInput,
  MakePaymentResult,
  Payment,
  PaymentSource,
  RefundInput,
  RefundResult,
} from "./models/peek/booking-payment.js";
export type {
  BookingAddon,
  BookingAddonMoney,
  BookingAddonOption,
  BookingAddons,
  BookingAddonsMutationResult,
} from "./models/peek/booking-addon.js";
export type { Guide, Review } from "./models/peek/review.js";
export type { Waiver } from "./models/peek/waiver.js";
export { INSTALL_STATUSES } from "./models/peek/install.js";
export type {
  InstallStatus,
  InstallWebhook,
} from "./models/peek/install.js";
export type {
  InstallWebhookAccount,
  InstallWebhookClaims,
  PeekAuthTokenClaims,
  PeekAuthTokenUser,
  PeekPlatform,
} from "./models/peek/auth-token.js";

export { noopLogger } from "./logger.js";
export type { Logger } from "./logger.js";

export {
  AcmeApiError,
  AdminAccountRequiredError,
  CngApiError,
  InvalidPeekTokenError,
  PeekGraphQLError,
  PeekHttpError,
  PiiAccessDisabledError,
  RateLimitError,
} from "./errors.js";
