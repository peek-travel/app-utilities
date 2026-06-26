/**
 * Raw Peek GraphQL fields, queries, mutations, variables, and response shapes
 * for bookings. Internal.
 */
import type { BookingSearchBy } from "../../models/booking.js";

export const SEARCH_BY_PURCHASE_DATE: BookingSearchBy = "purchaseDate";
export const SEARCH_BY_ACTIVITY_DATE: BookingSearchBy = "activityDate";

/** Normalizes a booking id to the gateway's expected form. */
export function normalizeBookingId(bookingId: string): string {
  return bookingId.toLowerCase().replace(/-/g, "_");
}

const guestFields = `
  id
  name
  country
  dateOfBirth
  email
  isGdpr
  isParticipant
  optinSms
  optinMarketing
  phone
  postalCode
  fieldResponses {
    id
    text
    fieldLocation {
      field {
        name
      }
    }
  }
`;

export const bookingGuestsFields = `
  bookingGuests {
    ${guestFields}
  }
  primaryGuest {
    ${guestFields}
  }
`;

export const bookingQueryFields = `
  displayId
  id
  primaryGuest {
    name
    email
    phone
    optinMarketing
    optinSms
    isGdpr
    postalCode
  }
  activitySnapshot {
    type
    name
    id
  }
  ticketQuantities {
    quantity
    resourceOptionSnapshot {
      name
      id
    }
  }
  reservationStatus
  checkinStatus
  returnStatus
  fulfillmentStatusOverride {
    status
  }
  timeSnapshot {
    id
    legacyId
  }
  purchasedAt
  purchasedAtUtc
  startsAt
  startsAtUtc
  endsAt
  endsAtUtc
  availabilityTimeId
  bookingPortalUrl
  operatorNotes
  value {
    total {
      formatted
      amount
    }
  }
  balance {
    total {
      amount
      formatted
    }
  }
  tips {
    price {
      amount
      formatted
    }
  }
  order {
    displayId
    id
    promoCodes {
      code
    }
    channelSnapshot {
      id
      name
      agent {
        name
      }
    }
    initialQuote {
      source {
        actor {
          app
        }
      }
    }
  }
  questionAnswers {
    answer
    questionText
    questionLocationSnapshot {
      latitude
      longitude
    }
  }
  tickets {
    questionAnswers {
      answer
      questionText
    }
  }
  resourcePoolAssignments {
    quantity
    resourcePool {
      name
      shortName
      resources {
        name
      }
    }
    resourceAssignments {
      resource {
        id
        name
      }
    }
  }
`;

export const PRICE_BREAKDOWN_FIELDS = `
  convenienceFee { amount formatted }
  deposit { amount formatted }
  discount { amount formatted }
  discountedPrice { amount formatted }
  fees { amount formatted }
  flatPartnerFee { amount formatted }
  price { amount formatted }
  retailPrice { amount formatted }
  taxes { amount formatted }
  tips { amount formatted }
`;

/** Builds the bookings listing query, optionally including guests and price breakdown. */
export function buildBookingsListingQuery(
  includeGuests: boolean,
  includePriceBreakdown: boolean,
): string {
  const guestsSection = includeGuests ? bookingGuestsFields : "";
  const fields = includePriceBreakdown
    ? bookingQueryFields.replace("value {", `value { ${PRICE_BREAKDOWN_FIELDS}`)
    : bookingQueryFields;

  return `
    query Sales($after: String, $first: Int, $filter: SalesFilter!, $orderBy: SalesOrdering) {
      sales(after: $after, first: $first, filter: $filter, orderBy: $orderBy) {
        pageInfo { endCursor hasNextPage }
        edges {
          node {
            ... on Booking {
              ${fields}
              ${guestsSection}
            }
          }
        }
      }
    }
  `;
}

/** Query fetching the guests for a booking. */
export const BOOKING_GUESTS_QUERY = `
  query Sales($after: String, $first: Int, $filter: SalesFilter!, $orderBy: SalesOrdering) {
    sales(after: $after, first: $first, filter: $filter, orderBy: $orderBy) {
      pageInfo { endCursor hasNextPage }
      edges {
        node {
          ... on Booking {
            displayId
            id
            ${bookingGuestsFields}
          }
        }
      }
    }
  }
`;

/** Query fetching a booking's order payments + payment sources. */
export const BOOKING_PAYMENTS_ON_FILE_QUERY = `
  query Sales($after: String, $first: Int, $filter: SalesFilter!, $orderBy: SalesOrdering) {
    sales(after: $after, first: $first, filter: $filter, orderBy: $orderBy) {
      pageInfo { endCursor hasNextPage }
      edges {
        node {
          order {
            payments {
              id
              paymentSource { id }
              appliedAt
              currentAmount { amount currency }
              refundableAmount { amount currency }
            }
            id
            displayId
            paymentSources { description type id }
          }
          ... on Booking {
            displayId
            id
          }
        }
      }
    }
  }
`;

export const UPDATE_OPERATOR_NOTES_MUTATION = `
  mutation Account($input: UpdateOperatorNotesForBookingInput!) {
    updateOperatorNotesForBooking(input: $input) {
      booking { operatorNotes }
    }
  }
`;

export const UPDATE_BOOKING_CHECKIN_MUTATION = `
  mutation Account($input: UpdateBookingCheckInInput!) {
    updateBookingCheckIn(input: $input) {
      booking { checkinStatus }
    }
  }
`;

export const CANCEL_BOOKING_MUTATION = `
  mutation Account($input: CancelBookingInput!) {
    cancelBooking(input: $input) {
      booking { id displayId reservationStatus }
    }
  }
`;

export const APPLY_PAYMENT_TO_ORDER_MUTATION = `
  mutation ApplyPaymentToOrder($input: ApplyPaymentToOrderInput!) {
    applyPaymentToOrder(input: $input) {
      transactionId
      errors { code detail value }
    }
  }
`;

export const APPLY_REFUND_TO_ORDER_MUTATION = `
  mutation ApplyRefundToOrder($input: ApplyRefundToOrderInput!) {
    applyRefundToOrder(input: $input) {
      transactionId
      errors { code detail value }
    }
  }
`;

export const CREATE_INVOICE_LINK_MUTATION = `
  mutation CreateInvoiceLink($input: CreateInvoiceLinkInput!) {
    createInvoiceLink(input: $input) {
      invoiceLink { status url }
      errors { code detail value __typename }
    }
  }
`;

/** A payment/refund/invoice error entry. */
export interface PaymentMutationError {
  code: string;
  detail: string;
  value: string | null;
}

export interface ApplyPaymentToOrderResponse {
  applyPaymentToOrder: { transactionId: string | null; errors: PaymentMutationError[] | null };
}

export interface ApplyRefundToOrderResponse {
  applyRefundToOrder: { transactionId: string | null; errors: PaymentMutationError[] | null };
}

export interface CreateInvoiceLinkResponse {
  createInvoiceLink: {
    invoiceLink: { status: string; url: string } | null;
    errors: PaymentMutationError[] | null;
  };
}

export const CREATE_QUOTE_FROM_ORDER_MUTATION = `
  mutation CreateQuoteFromOrder($input: CreateQuoteFromOrderInput!) {
    createQuoteFromOrder(input: $input) {
      errors { detail value code }
      quote {
        id
        saleQuotes { refid reservationStatus }
      }
    }
  }
`;

export const UPDATE_QUOTE_V2_MUTATION = `
  mutation UpdateQuoteV2($input: UpdateQuoteV2Input!) {
    updateQuoteV2(input: $input) {
      errors { detail value code }
      quote { id }
    }
  }
`;

export const AMEND_ORDER_MUTATION = `
  mutation AmendOrder($input: AmendOrderInput!) {
    amendOrder(input: $input) {
      errors { code detail value }
      order { id }
    }
  }
`;

export interface CreateQuoteFromOrderResponse {
  createQuoteFromOrder: {
    errors: PaymentMutationError[] | null;
    quote: { id: string; saleQuotes: Array<{ refid: string; reservationStatus: string }> } | null;
  };
}

export interface UpdateQuoteV2Response {
  updateQuoteV2: { errors: PaymentMutationError[] | null; quote: { id: string } | null };
}

export interface AmendOrderResponse {
  amendOrder: { errors: PaymentMutationError[] | null; order: { id: string } | null };
}

export const CREATE_QUOTE_V2_MUTATION = `
  mutation CreateQuoteV2($input: CreateQuoteV2Input!) {
    createQuoteV2(input: $input) {
      errors { detail value code }
      quote { id }
    }
  }
`;

export const CREATE_ORDER_FROM_QUOTE_MUTATION = `
  mutation CreateOrderFromQuote($input: CreateOrderFromQuoteInput!) {
    createOrderFromQuote(input: $input) {
      errors { code detail value }
      order {
        id
        sales {
          id
          displayId
          ... on Booking {
            balance { total { amount currency formatted } }
          }
        }
      }
    }
  }
`;

export interface CreateQuoteV2Response {
  createQuoteV2: { errors: PaymentMutationError[] | null; quote: { id: string } | null };
}

export interface CreateOrderFromQuoteResponse {
  createOrderFromQuote: {
    errors: PaymentMutationError[] | null;
    order: {
      id: string;
      sales: Array<{
        id: string;
        displayId: string;
        balance?: { total: { amount: string; currency: string; formatted: string } } | null;
      }>;
    } | null;
  };
}

/** Builds the variables for the bookings/guests/payments sales queries. */
export function buildBookingsVariables(params: {
  pageSize: number;
  after: string | null;
  startDateTime?: string;
  endDateTime?: string;
  timeslotId?: string;
  searchBy?: BookingSearchBy;
  productId?: string;
  bookingId?: string;
  email?: string;
  searchString?: string;
}): object {
  const filter: Record<string, unknown> = {};
  const bookingFilter: Record<string, unknown> = {};

  if (params.bookingId) {
    bookingFilter.ids = [normalizeBookingId(params.bookingId)];
  } else if (params.timeslotId) {
    bookingFilter.timeslotRefid = params.timeslotId;
  } else {
    if (params.searchBy === SEARCH_BY_ACTIVITY_DATE) {
      bookingFilter.overlapsRange = `[${params.startDateTime},${params.endDateTime}]`;
    } else if (params.searchBy === SEARCH_BY_PURCHASE_DATE) {
      filter.purchasedAtRangeUtc = `[${params.startDateTime},${params.endDateTime}]`;
    }
    if (params.productId) {
      bookingFilter.activityIds = [params.productId];
    }
  }

  if (params.email) {
    filter.primaryGuestEmail = params.email;
  }
  if (params.searchString && params.searchString.length > 0) {
    filter.searchString = params.searchString;
  }
  if (Object.keys(bookingFilter).length > 0) {
    filter.bookingFilter = bookingFilter;
  }

  return {
    first: params.pageSize,
    after: params.after,
    orderBy: { direction: "ASC", field: "STARTS_AT" },
    filter,
  };
}

// ---- Raw response shapes -------------------------------------------------

export interface BookingNode {
  displayId?: string;
  id?: string;
  // Base bookings query selects name/email/phone; when guests are requested the
  // full guest fields (id, fieldResponses, …) are merged in as well.
  primaryGuest?: BookingGuestNode | null;
  activitySnapshot?: { type?: string; name?: string; id?: string } | null;
  ticketQuantities?: Array<{
    quantity?: number;
    resourceOptionSnapshot?: { name?: string; id?: string } | null;
  }>;
  reservationStatus?: string;
  checkinStatus?: string;
  returnStatus?: string;
  fulfillmentStatusOverride?: { status?: string } | null;
  timeSnapshot?: { id?: string; legacyId?: string | null } | null;
  purchasedAt?: string;
  purchasedAtUtc?: string;
  startsAt?: string;
  startsAtUtc?: string;
  endsAt?: string;
  endsAtUtc?: string;
  availabilityTimeId?: string;
  bookingPortalUrl?: string;
  operatorNotes?: string | null;
  value?: Record<string, { amount?: string; formatted?: string } | undefined> & {
    total?: { amount?: string; formatted?: string };
  };
  balance?: { total?: { amount?: string; formatted?: string } } | null;
  tips?: Array<{ price?: { amount?: string; formatted?: string } }>;
  order?: {
    id?: string;
    promoCodes?: Array<{ code: string }>;
    channelSnapshot?: { id?: string; name?: string; agent?: { name?: string } | null } | null;
    initialQuote?: { source?: { actor?: { app?: string } | null } | null } | null;
  } | null;
  questionAnswers?: Array<{
    answer: string;
    questionText: string;
    questionLocationSnapshot?: { latitude?: string; longitude?: string } | null;
  }>;
  tickets?: Array<{
    questionAnswers?: Array<{ answer: string; questionText: string }> | null;
  }> | null;
  resourcePoolAssignments?: Array<{
    quantity?: number;
    resourcePool?: { name?: string; shortName?: string } | null;
    resourceAssignments?: Array<{ resource?: { id?: string; name?: string } | null }>;
  }>;
  // Present when guests are requested.
  bookingGuests?: BookingGuestNode[];
}

export interface BookingsResponse {
  sales: {
    pageInfo: { endCursor: string | null; hasNextPage: boolean };
    edges: Array<{ node: BookingNode }>;
  };
}

export interface BookingGuestFieldResponse {
  id: string;
  text: string | null;
  fieldLocation?: { field?: { name?: string } | null } | null;
}

export interface BookingGuestNode {
  id: string;
  name?: string | null;
  country?: string | null;
  dateOfBirth?: string | null;
  phone?: string | null;
  email?: string | null;
  isGdpr?: boolean;
  isParticipant?: boolean;
  optinSms?: boolean;
  optinMarketing?: boolean;
  postalCode?: string | null;
  fieldResponses?: BookingGuestFieldResponse[];
}

export interface BookingGuestsResponse {
  sales: {
    edges: Array<{
      node: {
        displayId: string;
        id: string;
        bookingGuests?: BookingGuestNode[];
        primaryGuest?: BookingGuestNode | null;
      };
    }>;
  };
}

export interface BookingPaymentsOnFileResponse {
  sales: {
    edges: Array<{
      node: {
        order?: {
          id?: string;
          displayId?: string;
          payments?: Array<{
            id: string;
            paymentSource?: { id?: string } | null;
            appliedAt: string;
            currentAmount: { amount: string; currency: string };
            refundableAmount: { amount: string; currency: string };
          }>;
          paymentSources?: Array<{ description: string; id: string; type: string }>;
        } | null;
      };
    }>;
  };
}
