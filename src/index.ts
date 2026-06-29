/**
 * @peektravel/app-utilities
 *
 * Public entry point. Exposes the high-level access service, the clean data
 * models, the logger interface, and the typed errors. The underlying GraphQL
 * queries, response shapes, and transport are intentionally kept internal.
 */
export { PeekAccessService } from "./peek-access-service.js";
export type { PeekAccessServiceConfig } from "./peek-access-service.js";

export { ProductService } from "./internal/products/product-service.js";
export type { ProductServiceOptions } from "./internal/products/product-service.js";

export { AccountUserService } from "./internal/account-users/account-user-service.js";
export type { AccountUserServiceOptions } from "./internal/account-users/account-user-service.js";

export { ResourcePoolService } from "./internal/resource-pools/resource-pool-service.js";

export { TimeslotService } from "./internal/timeslots/timeslot-service.js";

export { ResellerService } from "./internal/resellers/reseller-service.js";

export { PromoCodeService } from "./internal/promo-codes/promo-code-service.js";
export type { PromoCodeServiceOptions } from "./internal/promo-codes/promo-code-service.js";

export { DailyNoteService } from "./internal/daily-notes/daily-note-service.js";

export { AvailabilityService } from "./internal/availability/availability-service.js";

export { MembershipService } from "./internal/memberships/membership-service.js";

export { BookingService } from "./internal/bookings/booking-service.js";
export type {
  AddAddonInput,
  BookingServiceOptions,
  CancelBookingResult,
} from "./internal/bookings/booking-service.js";

export { parseBookingWebhook } from "./internal/bookings/booking-webhook.js";

export { parseWaiverWebhook } from "./internal/waivers/waiver-webhook.js";

export { ReviewService } from "./internal/reviews/review-service.js";

export { ADD_ON_PRODUCT_TYPE } from "./models/product.js";
export type { Product, ProductTicket } from "./models/product.js";
export type { AccountUser, AssignedActivity } from "./models/account-user.js";
export type {
  ResourcePool,
  ResourcePoolAccountUser,
  ResourcePoolMode,
} from "./models/resource-pool.js";
export type {
  AssignedResource,
  AssignGuideResult,
  GuideAssignment,
  Timeslot,
  TimeslotFilter,
  UpdateTimeslotResult,
} from "./models/timeslot.js";
export type { Agent, Channel } from "./models/channel.js";
export type {
  CreatePromoCodeInput,
  CreatedPromoCode,
  PromoCode,
  PromoCodeFixedAmount,
} from "./models/promo-code.js";
export type { DailyNote } from "./models/daily-note.js";
export type {
  Availability,
  AvailabilityTime,
  AvailabilityTimesQuery,
  Duration,
  ResourceOptionQuantity,
} from "./models/availability-time.js";
export type {
  Membership,
  MembershipPurchaseInput,
  PurchasedMembership,
} from "./models/membership.js";
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
} from "./models/booking.js";
export type {
  BookingPaymentsOnFile,
  InvoiceLinkResult,
  MakePaymentInput,
  MakePaymentResult,
  Payment,
  PaymentSource,
  RefundInput,
  RefundResult,
} from "./models/booking-payment.js";
export type {
  BookingAddon,
  BookingAddonMoney,
  BookingAddonOption,
  BookingAddons,
  BookingAddonsMutationResult,
} from "./models/booking-addon.js";
export type { Guide, Review } from "./models/review.js";
export type { Waiver } from "./models/waiver.js";
export type { PeekAuthTokenClaims, PeekAuthTokenUser } from "./models/auth-token.js";

export { noopLogger } from "./logger.js";
export type { Logger } from "./logger.js";

export {
  AdminAccountRequiredError,
  PeekGraphQLError,
  RateLimitError,
} from "./errors.js";
