/**
 * The clean data model for Peek Pro bookings.
 */

/** A ticket line within a booking. */
export interface Ticket {
  name: string;
  quantity: number;
  ticketId: string;
}

/** A formatted monetary value. */
export interface Price {
  display: string;
  amount: string;
}

/** A resource used by a booking (e.g. a kayak). */
export interface Resource {
  quantity: number;
  name: string;
  shortName: string;
}

/** A concrete resource-pool assignment on a booking. */
export interface ResourcePoolAssignment {
  id: string;
  name: string;
}

/** A custom question/answer captured on a booking or guest. */
export interface CustomQuestionAnswer {
  question: string;
  answer: string;
  latitude?: string;
  longitude?: string;
}

/** A guest metadata field. */
export interface GuestMetadata {
  id: string;
  name: string;
  value: string;
}

/** A guest on a booking. */
export interface Guest {
  id: string;
  name: string | null;
  country: string | null;
  dateOfBirth: Date | null;
  phone: string | null;
  email: string | null;
  isGdpr: boolean;
  isParticipant: boolean;
  isPrimary: boolean;
  optinSms: boolean;
  optinMarketing: boolean;
  postalCode: string | null;
  metadata: GuestMetadata[];
}

/** A booking in Peek Pro. */
export interface Booking {
  bookingId: string;
  displayId: string;

  source: string;
  sourceApp: string;
  sourceDescription: string;

  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;

  productId: string;
  productName: string;
  isRentalProduct: boolean;

  timeslotId: string | null;
  totalTickets: number;
  ticketDescription: string;
  tickets: Ticket[];

  isCanceled: boolean;
  isNoShow: boolean;
  isCheckedIn: boolean;
  isReturned: boolean;

  purchasedAt: string | null;
  purchasedAtUtc: string | null;
  startsAt: string | null;
  startsAtUtc: string | null;
  endsAt: string | null;
  endsAtUtc: string | null;
  durationMin: number;
  availabilityTimeId: string | null;

  portalUrl: string | null;
  notes: string;

  valueDisplay: string;
  valueAmount: string;

  outstandingBalanceAmount: string;
  outstandingBalanceDisplay: string;

  promoCodes: string[];
  tips: Price[];

  /** Price breakdown — only populated when `includePriceBreakdown` is requested. */
  convenienceFee?: Price;
  deposit?: Price;
  discount?: Price;
  discountedPrice?: Price;
  fees?: Price;
  flatPartnerFee?: Price;
  price?: Price;
  retailPrice?: Price;
  taxes?: Price;
  tipsBreakdown?: Price;

  resources: Resource[];
  resourcePoolAssignments: ResourcePoolAssignment[];

  resellerId: string | null;
  resellerName: string | null;

  orderId: string;

  customQuestionAnswers: CustomQuestionAnswer[];
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
  orderId: string;
  bookingId: string;
  displayId: string;
  balanceAmount: string;
  balanceCurrency: string;
  balanceFormatted: string;
  /** Set when the booking was marked paid. */
  transactionId?: string;
}
