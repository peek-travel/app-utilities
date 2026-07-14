/**
 * The clean, transport-agnostic data model for Peek Pro bookings.
 *
 * This is the shape consumers of the package work with. It is intentionally
 * decoupled from the underlying Peek GraphQL schema — the raw GraphQL types and
 * the conversion logic live inside the package and are never exposed here. A
 * booking is the central resource: it carries the customer, the activity and
 * slot, the ticket lines, lifecycle flags, money totals, and (optionally) the
 * guest list and full price breakdown.
 */

/** A ticket line within a booking (one resource option and its quantity). */
export interface Ticket {
  /** Ticket (resource option) name, e.g. `"Adult"`. Falls back to `"Unknown"`. */
  name: string;
  /** How many of this ticket are on the booking. */
  quantity: number;
  /** The resource option id backing this ticket. Falls back to `"unknown"`. */
  ticketId: string;
  /**
   * Per-unit list price of the ticket — only populated when
   * `includePriceBreakdown` is requested.
   */
  listPrice?: Price;
  /**
   * Total value for this ticket line — only populated when
   * `includePriceBreakdown` is requested.
   */
  totalValue?: Price;
}

/** A formatted monetary value: a human display string plus its raw amount. */
export interface Price {
  /** Human-formatted amount (e.g. `"$25.00"`). */
  display: string;
  /** Numeric amount as a string (e.g. `"25.00"`). */
  amount: string;
}

/**
 * A resource pool used by a booking (e.g. a kayak or guide pool), with the
 * quantity drawn from it.
 */
export interface Resource {
  /** How many units of the resource the booking uses. */
  quantity: number;
  /** Resource pool name. */
  name: string;
  /** Resource pool short name. */
  shortName: string;
}

/**
 * A concrete resource assigned to a booking (a specific resource within a
 * pool, as opposed to the pool-level {@link Resource} count).
 */
export interface ResourcePoolAssignment {
  /** Assigned resource id. */
  id: string;
  /** Assigned resource name. */
  name: string;
}

/**
 * A custom question/answer captured on a booking or a guest. Location questions
 * additionally carry a captured lat/long.
 */
export interface CustomQuestionAnswer {
  /** The question text as shown to the customer. */
  question: string;
  /** The customer's answer. */
  answer: string;
  /** Captured latitude, present only for location questions. */
  latitude?: string;
  /** Captured longitude, present only for location questions. */
  longitude?: string;
}

/** A custom field response captured against a {@link Guest}. */
export interface GuestMetadata {
  /** Field response id. */
  id: string;
  /** The field's name. */
  name: string;
  /** The captured value (empty string when none). */
  value: string;
}

/**
 * A guest on a booking. Populated only when guests are requested
 * (`includeGuests`); the primary guest is included and flagged via
 * {@link Guest.isPrimary}.
 */
export interface Guest {
  /** Unique guest id. */
  id: string;
  /** Guest name, or null. */
  name: string | null;
  /** Guest country, or null. */
  country: string | null;
  /** Date of birth, or null. */
  dateOfBirth: Date | null;
  /** Phone number, or null. */
  phone: string | null;
  /** Email address, or null. */
  email: string | null;
  /** Whether the guest is subject to GDPR handling. */
  isGdpr: boolean;
  /** Whether the guest is an actual participant (vs. a booker only). */
  isParticipant: boolean;
  /** Whether this is the booking's primary guest. */
  isPrimary: boolean;
  /** Whether the guest opted in to SMS. */
  optinSms: boolean;
  /** Whether the guest opted in to marketing. */
  optinMarketing: boolean;
  /** Postal code, or null. */
  postalCode: string | null;
  /** Custom field responses captured for this guest. */
  metadata: GuestMetadata[];
}

/** A booking in Peek Pro. */
export interface Booking {
  /** Stable unique booking id. */
  bookingId: string;
  /** Human-facing display id shown in the Peek UI (e.g. `"B-123456"`). */
  displayId: string;

  /**
   * Normalized booking source, e.g. `"website"`, `"app"`, `"expedia"`.
   * `"unknown"` when the origin can't be mapped.
   */
  source: string;
  /** Raw source app reported by Peek (e.g. `"WIDGET"`). `"unknown"` if absent. */
  sourceApp: string;
  /**
   * Human-readable source description (e.g. `"Website Booking Flow"`).
   * `"unknown"` when the origin can't be mapped.
   */
  sourceDescription: string;
  /**
   * Raw source actor name reported by Peek, when present. `null` when the
   * origin actor carries no name.
   */
  sourceDetails: string | null;

  /** Primary guest's name, or `""` when unknown. */
  customerName: string | null;
  /** Primary guest's email, or null. */
  customerEmail: string | null;
  /** Primary guest's phone, or null. */
  customerPhone: string | null;

  /** The activity (product) id this booking is for. `"unknown"` if absent. */
  productId: string;
  /** The activity (product) name. `"unknown"` if absent. */
  productName: string;
  /** Whether the booked product is a rental (vs. a standard activity). */
  isRentalProduct: boolean;

  /** The timeslot's legacy id, or null when the booking has no timeslot. */
  timeslotId: string | null;
  /** Total number of tickets across all ticket lines. */
  totalTickets: number;
  /** Human-readable ticket summary (e.g. `"2x Adult, 1x Child"`). */
  ticketDescription: string;
  /** The individual ticket lines on the booking. */
  tickets: Ticket[];

  /** Whether the booking has been canceled. */
  isCanceled: boolean;
  /** Whether the booking was marked a no-show. */
  isNoShow: boolean;
  /** Whether any guest on the booking has been checked in. */
  isCheckedIn: boolean;
  /** Whether the booking's rental has been returned. */
  isReturned: boolean;

  /** Purchase time in the account's local zone (ISO datetime), or null. */
  purchasedAt: string | null;
  /** Purchase time in UTC (ISO datetime), or null. */
  purchasedAtUtc: string | null;
  /** Activity start in the account's local zone (ISO datetime), or null. */
  startsAt: string | null;
  /** Activity start in UTC (ISO datetime), or null. */
  startsAtUtc: string | null;
  /** Activity end in the account's local zone (ISO datetime), or null. */
  endsAt: string | null;
  /** Activity end in UTC (ISO datetime), or null. */
  endsAtUtc: string | null;
  /** Activity duration in minutes (0 when start/end are unknown). */
  durationMin: number;
  /** The availability time id for the booked slot, or null. */
  availabilityTimeId: string | null;

  /** Customer booking-portal URL, or null. */
  portalUrl: string | null;
  /** Operator notes on the booking (`""` when none). */
  notes: string;

  /** Total booking value, human-formatted (e.g. `"$75.00"`). `""` if absent. */
  valueDisplay: string;
  /** Total booking value as a numeric string. `""` if absent. */
  valueAmount: string;

  /** Outstanding balance as a numeric string. `""` if absent. */
  outstandingBalanceAmount: string;
  /** Outstanding balance, human-formatted. `""` if absent. */
  outstandingBalanceDisplay: string;

  /** Redemption codes of promo codes applied to the order. */
  promoCodes: string[];
  /** Tips left on the booking. */
  tips: Price[];

  /**
   * Convenience fee — only populated when `includePriceBreakdown` is requested.
   */
  convenienceFee?: Price;
  /** Deposit — only populated when `includePriceBreakdown` is requested. */
  deposit?: Price;
  /** Discount — only populated when `includePriceBreakdown` is requested. */
  discount?: Price;
  /**
   * Price after discount — only populated when `includePriceBreakdown` is
   * requested.
   */
  discountedPrice?: Price;
  /** Fees — only populated when `includePriceBreakdown` is requested. */
  fees?: Price;
  /**
   * Flat partner fee — only populated when `includePriceBreakdown` is requested.
   */
  flatPartnerFee?: Price;
  /** Base price — only populated when `includePriceBreakdown` is requested. */
  price?: Price;
  /** Retail price — only populated when `includePriceBreakdown` is requested. */
  retailPrice?: Price;
  /** Taxes — only populated when `includePriceBreakdown` is requested. */
  taxes?: Price;
  /**
   * Tips total in the breakdown — only populated when `includePriceBreakdown`
   * is requested.
   */
  tipsBreakdown?: Price;

  /** Pool-level resource usage (quantity per resource pool). */
  resources: Resource[];
  /** Concrete resources assigned to the booking. */
  resourcePoolAssignments: ResourcePoolAssignment[];

  /** Reseller channel id, or null for a direct booking. */
  resellerId: string | null;
  /**
   * Reseller display name (channel name, plus `" - <agent>"` when an agent is
   * set), or null for a direct booking.
   */
  resellerName: string | null;

  /** The order id this booking belongs to. `""` if absent. */
  orderId: string;

  /**
   * Deep link into the Peek Pro app for this booking, derived from the order id
   * and booking id. `""` when either id is absent.
   */
  peekProBookingDeepLink: string;

  /** Custom question answers captured at the booking level. */
  customQuestionAnswers: CustomQuestionAnswer[];
  /** Custom question answers captured per guest/ticket. */
  customGuestQuestionAnswers: CustomQuestionAnswer[];

  /** Guests — only populated when `includeGuests` is requested. */
  guests?: Guest[];
}

/** How to interpret the start/end range when searching bookings. */
export type BookingSearchBy = "purchaseDate" | "activityDate";

/** Options shared by booking reads. */
export interface BookingReadOptions {
  /** Include guests in the result. */
  includeGuests?: boolean;
  /** Include the price breakdown fields. */
  includePriceBreakdown?: boolean;
}

/** Parameters for searching bookings by a time range. */
export interface BookingTimeRangeSearch extends BookingReadOptions {
  /** Range start (ISO datetime). */
  start: string;
  /** Range end (ISO datetime). */
  end: string;
  /** Whether the range matches purchase date or activity date. Default: purchaseDate. */
  searchBy?: BookingSearchBy;
  /** Restrict to a product/activity id. */
  productId?: string;
  /** Filter by primary guest email. */
  email?: string;
  /** Free-text search string. */
  searchString?: string;
}

/** How an appended note should be applied. */
export type NoteMode = "append" | "overwrite";

/** A requested ticket (resource option) and quantity for a new booking. */
export interface CreateBookingTicket {
  resourceOptionId: string;
  quantity: number;
}

/** Guest details for a new booking. */
export interface CreateBookingGuest {
  name: string;
  email?: string;
  phone?: string;
  postalCode?: string;
  country?: string;
  optinMarketing?: boolean;
  optinSms?: boolean;
}

/**
 * Input for creating a booking. IDs must already be resolved — the package does
 * not do free-text product/ticket/time matching (that stays in the caller).
 */
export interface CreateBookingInput {
  /** Activity (product) id. */
  activityId: string;
  /** Availability time id for the slot. */
  availabilityTimeId: string;
  /** Tickets to book (each expanded to `quantity` seats). */
  tickets: CreateBookingTicket[];
  /** Primary guest. */
  guest: CreateBookingGuest;
  /** Operator notes to attach. */
  operatorNotes?: string;
  /** Suppress the customer confirmation email. Default: false. */
  skipCustomerEmail?: boolean;
  /** Clone the quote from an existing order. */
  parentOrderId?: string | null;
  /** Mark the booking paid after creation (requires `idempotencyKey`). */
  markAsPaid?: boolean;
  /** Partial payment amount when marking paid; defaults to the full balance. */
  markAsPaidAmount?: string;
  /** Idempotency key for the mark-paid charge. */
  idempotencyKey?: string;
}

/** The result of creating a booking. */
export interface CreatedBooking {
  /** The order id the new booking belongs to. */
  orderId: string;
  /** The new booking's id. */
  bookingId: string;
  /** The new booking's human-facing display id. */
  displayId: string;
  /** Remaining balance as a numeric string. */
  balanceAmount: string;
  /** 3-letter uppercase ISO currency code of the balance. */
  balanceCurrency: string;
  /** Balance, human-formatted (e.g. `"$75.00"`). */
  balanceFormatted: string;
  /** The charge transaction id — set only when the booking was marked paid. */
  transactionId?: string;
}
