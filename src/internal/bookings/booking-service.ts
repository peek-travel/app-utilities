/**
 * Booking operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getBookingService}.
 */
import { randomUUID } from "node:crypto";

import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type { ProductService } from "../products/product-service.js";
import type {
  Booking,
  BookingReadOptions,
  BookingTimeRangeSearch,
  CreateBookingInput,
  CreatedBooking,
  Guest,
  NoteMode,
} from "../../models/booking.js";
import { ADD_ON_PRODUCT_TYPE } from "../../models/product.js";
import type {
  BookingPaymentsOnFile,
  InvoiceLinkResult,
  MakePaymentInput,
  MakePaymentResult,
  RefundInput,
  RefundResult,
} from "../../models/booking-payment.js";
import { fromBookingNode } from "./booking-converter.js";
import { fromBookingGuestsResponse } from "./booking-guest-converter.js";
import { fromPaymentsOnFileResponse } from "./payments-on-file-converter.js";
import {
  AMEND_ORDER_MUTATION,
  APPLY_PAYMENT_TO_ORDER_MUTATION,
  APPLY_REFUND_TO_ORDER_MUTATION,
  BOOKING_GUESTS_QUERY,
  BOOKING_PAYMENTS_ON_FILE_QUERY,
  CANCEL_BOOKING_MUTATION,
  CREATE_INVOICE_LINK_MUTATION,
  CREATE_ORDER_FROM_QUOTE_MUTATION,
  CREATE_QUOTE_FROM_ORDER_MUTATION,
  CREATE_QUOTE_V2_MUTATION,
  SEARCH_BY_PURCHASE_DATE,
  UPDATE_BOOKING_CHECKIN_MUTATION,
  UPDATE_OPERATOR_NOTES_MUTATION,
  UPDATE_QUOTE_V2_MUTATION,
  buildBookingsListingQuery,
  buildBookingsVariables,
  normalizeBookingId,
  type AmendOrderResponse,
  type ApplyPaymentToOrderResponse,
  type ApplyRefundToOrderResponse,
  type BookingGuestsResponse,
  type BookingPaymentsOnFileResponse,
  type BookingsResponse,
  type CreateInvoiceLinkResponse,
  type CreateOrderFromQuoteResponse,
  type CreateQuoteFromOrderResponse,
  type CreateQuoteV2Response,
  type UpdateQuoteV2Response,
} from "./booking-queries.js";

/** Default page size for cursor-paginated bookings. */
const DEFAULT_PAGE_SIZE = 50;
/** Default note used when cancelling without an explicit reason. */
const DEFAULT_CANCEL_NOTE = "Canceled";
/** Default customer message attached to a charge. */
const DEFAULT_CUSTOMER_MESSAGE = "Charge initiated via API";

const BOOKING_ID_PREFIX = "b_";
const PAYMENT_SOURCE_PREFIX = "ps_";
const PAYMENT_ID_PREFIX = "pmt_";
const ALLOWED_PAYMENT_SOURCE_IDS = ["cash/cash", "custom/other", "custom/voucher"];
const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/;

/** Result of cancelling a booking. */
export interface CancelBookingResult {
  id: string;
  displayId: string;
  reservationStatus: string;
}

interface CancelBookingResponse {
  cancelBooking?: { booking?: CancelBookingResult | null } | null;
}

/** Tuning options for a {@link BookingService}. */
export interface BookingServiceOptions {
  /** Page size for cursor pagination. Default: 50. */
  pageSize?: number;
}

/** Dependencies the {@link BookingService} composes for add-on resolution. */
export interface BookingServiceDeps {
  productService: ProductService;
}

/** Input for adding an add-on to a booking. */
export interface AddAddonInput {
  /** The add-on (item option) id. */
  addonId: string;
  /** Quantity as a positive integer string. */
  quantity: string;
}

/** Result of adding an add-on to a booking. */
export interface AddAddonResult {
  bookingId: string;
  orderId: string;
  quoteId: string;
  addonId: string;
  quantity: number;
}

export class BookingService {
  private readonly pageSize: number;

  constructor(
    private readonly client: GraphQLClient,
    private readonly deps: BookingServiceDeps,
    options: BookingServiceOptions = {},
  ) {
    this.pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  }

  /** Returns a single booking by id, or null when not found. */
  async getById(
    bookingId: string,
    options: BookingReadOptions = {},
  ): Promise<Booking | null> {
    const includeGuests = options.includeGuests ?? false;
    const includePriceBreakdown = options.includePriceBreakdown ?? false;

    const body: GraphQLBody<BookingsResponse> =
      await this.client.request<BookingsResponse>(
        SALES_ENDPOINT,
        buildBookingsListingQuery(includeGuests, includePriceBreakdown),
        buildBookingsVariables({
          pageSize: this.pageSize,
          after: null,
          bookingId: normalizeBookingId(bookingId),
        }),
      );

    const firstEdge = (body.data?.sales?.edges ?? [])[0];
    if (!firstEdge) {
      return null;
    }
    return fromBookingNode(firstEdge.node, includeGuests, includePriceBreakdown);
  }

  /** Returns all bookings matching a time range (paginated). */
  async searchByTimeRange(input: BookingTimeRangeSearch): Promise<Booking[]> {
    const includeGuests = input.includeGuests ?? false;
    const includePriceBreakdown = input.includePriceBreakdown ?? false;

    return this.fetchPaginated(
      buildBookingsListingQuery(includeGuests, includePriceBreakdown),
      {
        startDateTime: input.start,
        endDateTime: input.end,
        searchBy: input.searchBy ?? SEARCH_BY_PURCHASE_DATE,
        productId: input.productId,
        email: input.email,
        searchString: input.searchString,
      },
      includeGuests,
      includePriceBreakdown,
    );
  }

  /** Returns all bookings on a timeslot (paginated). */
  async searchByTimeslot(
    timeslotId: string,
    options: BookingReadOptions = {},
  ): Promise<Booking[]> {
    const includeGuests = options.includeGuests ?? false;
    const includePriceBreakdown = options.includePriceBreakdown ?? false;

    return this.fetchPaginated(
      buildBookingsListingQuery(includeGuests, includePriceBreakdown),
      { timeslotId },
      includeGuests,
      includePriceBreakdown,
    );
  }

  /** Returns the guests on a booking (primary guest included). */
  async getGuests(bookingId: string): Promise<Guest[]> {
    const body: GraphQLBody<BookingGuestsResponse> =
      await this.client.request<BookingGuestsResponse>(
        SALES_ENDPOINT,
        BOOKING_GUESTS_QUERY,
        buildBookingsVariables({
          pageSize: this.pageSize,
          after: null,
          bookingId: normalizeBookingId(bookingId),
        }),
      );
    return fromBookingGuestsResponse(body.data);
  }

  /** Returns the payments on file for a booking, or null when not found. */
  async getPaymentsOnFile(bookingId: string): Promise<BookingPaymentsOnFile | null> {
    const normalized = normalizeBookingId(bookingId);
    const body: GraphQLBody<BookingPaymentsOnFileResponse> =
      await this.client.request<BookingPaymentsOnFileResponse>(
        SALES_ENDPOINT,
        BOOKING_PAYMENTS_ON_FILE_QUERY,
        buildBookingsVariables({ pageSize: this.pageSize, after: null, bookingId: normalized }),
      );
    return fromPaymentsOnFileResponse(body.data, normalized);
  }

  /**
   * Appends to (or overwrites) a booking's operator notes. Returns the updated
   * booking, or null when the booking is not found.
   */
  async appendNote(
    bookingId: string,
    note: string,
    mode: NoteMode = "append",
  ): Promise<Booking | null> {
    const normalized = normalizeBookingId(bookingId);
    const booking = await this.getById(normalized);
    if (!booking) {
      return null;
    }

    const newNote =
      mode === "overwrite" || !booking.notes ? note : `${booking.notes}\n${note}`;

    await this.client.request(SALES_ENDPOINT, UPDATE_OPERATOR_NOTES_MUTATION, {
      input: { id: normalized, operatorNotes: newNote },
    });

    booking.notes = newNote;
    return booking;
  }

  /**
   * Sets a booking's check-in status. Returns the refreshed booking, or null
   * when not found.
   */
  async setCheckinStatus(
    bookingId: string,
    checkedIn: boolean,
  ): Promise<Booking | null> {
    const normalized = normalizeBookingId(bookingId);
    const checkedInAt = checkedIn ? new Date().toISOString() : null;

    await this.client.request(SALES_ENDPOINT, UPDATE_BOOKING_CHECKIN_MUTATION, {
      input: { id: normalized, checkedInAt },
    });

    return this.getById(normalized);
  }

  /** Cancels a booking and returns its id/displayId/status. */
  async cancel(
    bookingId: string,
    notes: string = DEFAULT_CANCEL_NOTE,
  ): Promise<CancelBookingResult> {
    const body: GraphQLBody<CancelBookingResponse> =
      await this.client.request<CancelBookingResponse>(
        SALES_ENDPOINT,
        CANCEL_BOOKING_MUTATION,
        { input: { bookingId: normalizeBookingId(bookingId), notes } },
      );

    const booking = body.data?.cancelBooking?.booking;
    if (!booking) {
      throw new Error("No booking data returned from cancelBooking");
    }
    return {
      id: booking.id,
      displayId: booking.displayId,
      reservationStatus: booking.reservationStatus,
    };
  }

  /**
   * Charges a booking. Validates input, resolves the order + payment source via
   * payments-on-file, then applies the payment. The `idempotencyKey` is passed
   * through to Peek.
   */
  async makePayment(input: MakePaymentInput): Promise<MakePaymentResult> {
    const normalized = normalizeBookingId(input.bookingId);
    this.validatePaymentInput(input, normalized);

    const onFile = await this.getPaymentsOnFile(normalized);
    if (!onFile) {
      throw new Error("Booking not found");
    }
    if (!onFile.paymentsOnFile.some((source) => source.id === input.paymentSourceId)) {
      throw new Error("paymentSourceId not found for this booking");
    }

    const customerMessage = input.customerMessage
      ? `${DEFAULT_CUSTOMER_MESSAGE} (${input.customerMessage})`
      : DEFAULT_CUSTOMER_MESSAGE;

    const body: GraphQLBody<ApplyPaymentToOrderResponse> =
      await this.client.request<ApplyPaymentToOrderResponse>(
        SALES_ENDPOINT,
        APPLY_PAYMENT_TO_ORDER_MUTATION,
        {
          input: {
            amount: { amount: input.amount, currency: input.currency },
            orderId: onFile.orderId,
            paymentSourceId: input.paymentSourceId,
            idempotencyKey: input.idempotencyKey,
            customerMessage,
            scopedTo: [normalized],
          },
        },
      );

    const result = body.data?.applyPaymentToOrder;
    if (result?.errors && result.errors.length > 0) {
      throw new Error(`Payment failed: ${result.errors[0]!.detail}`);
    }

    return {
      transactionId: result?.transactionId ?? "",
      bookingId: normalized,
      orderId: onFile.orderId,
      amount: input.amount,
      currency: input.currency,
      paymentSourceId: input.paymentSourceId,
    };
  }

  /**
   * Refunds a booking payment. Validates input, resolves the order + payment via
   * payments-on-file, then applies the refund.
   */
  async refund(input: RefundInput): Promise<RefundResult> {
    const normalized = normalizeBookingId(input.bookingId);
    this.validateRefundInput(input, normalized);

    const onFile = await this.getPaymentsOnFile(normalized);
    if (!onFile) {
      throw new Error("Booking not found");
    }
    const paymentExists = onFile.paymentsOnFile.some((source) =>
      (source.payments ?? []).some((payment) => payment.id === input.paymentId),
    );
    if (!paymentExists) {
      throw new Error("paymentId not found for this booking");
    }

    const body: GraphQLBody<ApplyRefundToOrderResponse> =
      await this.client.request<ApplyRefundToOrderResponse>(
        SALES_ENDPOINT,
        APPLY_REFUND_TO_ORDER_MUTATION,
        {
          input: {
            amount: { amount: input.amount, currency: input.currency },
            orderId: onFile.orderId,
            paymentId: input.paymentId,
            idempotencyKey: input.idempotencyKey,
            scopedTo: [normalized],
          },
        },
      );

    const result = body.data?.applyRefundToOrder;
    if (result?.errors && result.errors.length > 0) {
      throw new Error(`Refund failed: ${result.errors[0]!.detail}`);
    }

    return {
      transactionId: result?.transactionId ?? "",
      bookingId: normalized,
      orderId: onFile.orderId,
      amount: input.amount,
      currency: input.currency,
      paymentId: input.paymentId,
    };
  }

  /** Creates an invoice link for a booking's order. */
  async createInvoiceLink(bookingId: string): Promise<InvoiceLinkResult> {
    if (!bookingId || bookingId.trim().length === 0) {
      throw new Error("bookingId is required");
    }
    const normalized = normalizeBookingId(bookingId);

    const booking = await this.getById(normalized);
    if (!booking || !booking.orderId) {
      throw new Error("Booking not found");
    }
    const orderId = normalizeBookingId(booking.orderId);

    const body: GraphQLBody<CreateInvoiceLinkResponse> =
      await this.client.request<CreateInvoiceLinkResponse>(
        SALES_ENDPOINT,
        CREATE_INVOICE_LINK_MUTATION,
        { input: { orderId } },
      );

    const url = body.data?.createInvoiceLink?.invoiceLink?.url;
    if (!url) {
      throw new Error("Failed to create invoice link");
    }
    return { bookingId: normalized, orderId, invoiceLink: url };
  }

  /**
   * Adds an add-on to a booking via createQuoteFromOrder → updateQuoteV2 →
   * amendOrder. Resolves the add-on's parent item via the product service.
   */
  async addAddon(bookingId: string, input: AddAddonInput): Promise<AddAddonResult> {
    const addonId = (input?.addonId || "").trim();
    if (!addonId) {
      throw new Error("addonId is required");
    }
    const quantity = parseQuantity(input?.quantity);
    if (quantity === null) {
      throw new Error("quantity must be a positive integer string");
    }

    const normalized = normalizeBookingId(bookingId);
    const parentItemId = await this.resolveParentItemId(addonId);

    const booking = await this.getById(normalized);
    if (!booking || !booking.orderId) {
      throw new Error("Booking not found");
    }
    const orderId = normalizeBookingId(booking.orderId);

    // Step 1 — create a quote from the order.
    const createBody: GraphQLBody<CreateQuoteFromOrderResponse> =
      await this.client.request<CreateQuoteFromOrderResponse>(
        SALES_ENDPOINT,
        CREATE_QUOTE_FROM_ORDER_MUTATION,
        { input: { orderId, quoteInput: {} } },
      );
    const created = createBody.data?.createQuoteFromOrder;
    const quote = created?.quote;
    const saleQuoteRefid = quote?.saleQuotes?.[0]?.refid;
    if ((created?.errors && created.errors.length > 0) || !quote?.id || !saleQuoteRefid) {
      throw new Error("Failed to create quote from order");
    }
    const quoteId = quote.id;

    // Step 2 — add the add-on to the quote.
    const itemOptions = Array.from({ length: quantity }, () => ({
      itemOptionId: addonId,
      reservationStatus: "CONFIRMED",
      refid: randomUUID(),
    }));
    const updateBody: GraphQLBody<UpdateQuoteV2Response> =
      await this.client.request<UpdateQuoteV2Response>(SALES_ENDPOINT, UPDATE_QUOTE_V2_MUTATION, {
        input: {
          quoteId,
          quoteInput: {
            bookingQuotes: [
              {
                refid: saleQuoteRefid,
                addons: [
                  {
                    itemOptions,
                    itemId: parentItemId,
                    reservationStatus: "CONFIRMED",
                    refid: randomUUID(),
                  },
                ],
                reservationStatus: "CONFIRMED",
              },
            ],
          },
        },
      });
    const updated = updateBody.data?.updateQuoteV2;
    if ((updated?.errors && updated.errors.length > 0) || !updated?.quote) {
      throw new Error("Failed to update quote with add-on");
    }

    // Step 3 — amend the order with the updated quote.
    const amendBody: GraphQLBody<AmendOrderResponse> =
      await this.client.request<AmendOrderResponse>(SALES_ENDPOINT, AMEND_ORDER_MUTATION, {
        input: { quoteId, orderId },
      });
    const amended = amendBody.data?.amendOrder;
    if ((amended?.errors && amended.errors.length > 0) || !amended?.order) {
      throw new Error("Failed to amend order with add-on");
    }

    return { bookingId: normalized, orderId, quoteId, addonId, quantity };
  }

  /**
   * Creates a booking via createQuoteV2 → createOrderFromQuote, optionally
   * marking it paid. IDs must be pre-resolved (no free-text matching).
   */
  async create(input: CreateBookingInput): Promise<CreatedBooking> {
    validateCreateInput(input);

    const tickets = input.tickets.flatMap((ticket) =>
      Array.from({ length: ticket.quantity }, () => ({
        resourceOptionId: ticket.resourceOptionId,
        reservationStatus: "CONFIRMED",
        refid: randomUUID(),
      })),
    );

    const bookingQuote: Record<string, unknown> = {
      tickets,
      activityId: input.activityId,
      availabilityTimeId: input.availabilityTimeId,
      refid: randomUUID(),
      skipCustomerEmail: input.skipCustomerEmail ?? false,
      guest: {
        name: input.guest.name,
        email: input.guest.email ?? null,
        phone: input.guest.phone ?? null,
        optinMarketing: input.guest.optinMarketing ?? false,
        optinSms: input.guest.optinSms ?? false,
        postalCode: input.guest.postalCode ?? null,
        country: input.guest.country ?? null,
      },
    };
    if (input.operatorNotes) {
      bookingQuote.operatorNotes = input.operatorNotes;
    }

    const quoteInput: Record<string, unknown> = { bookingQuotes: [bookingQuote] };
    if (input.parentOrderId) {
      quoteInput.source = { clonedFromId: input.parentOrderId };
    }

    // Step 1 — create the quote.
    const quoteBody: GraphQLBody<CreateQuoteV2Response> =
      await this.client.request<CreateQuoteV2Response>(SALES_ENDPOINT, CREATE_QUOTE_V2_MUTATION, {
        input: { quoteInput },
      });
    const quoteResult = quoteBody.data?.createQuoteV2;
    if ((quoteResult?.errors && quoteResult.errors.length > 0) || !quoteResult?.quote?.id) {
      throw new Error("Failed to create quote");
    }
    const quoteId = quoteResult.quote.id;

    // Step 2 — create the order from the quote.
    const orderBody: GraphQLBody<CreateOrderFromQuoteResponse> =
      await this.client.request<CreateOrderFromQuoteResponse>(
        SALES_ENDPOINT,
        CREATE_ORDER_FROM_QUOTE_MUTATION,
        { input: { quoteId } },
      );
    const orderResult = orderBody.data?.createOrderFromQuote;
    if (orderResult?.errors && orderResult.errors.length > 0) {
      throw new Error("Failed to create order from quote");
    }
    const order = orderResult?.order;
    const sale = order?.sales?.[0];
    if (!order || !sale) {
      throw new Error("Order created but no sales found");
    }

    const created: CreatedBooking = {
      orderId: order.id,
      bookingId: sale.id,
      displayId: sale.displayId,
      balanceAmount: sale.balance?.total?.amount ?? "0.00",
      balanceCurrency: sale.balance?.total?.currency ?? "USD",
      balanceFormatted: sale.balance?.total?.formatted ?? "$0.00",
    };

    // Step 3 — optionally mark the booking paid.
    if (input.markAsPaid) {
      created.transactionId = await this.markCreatedBookingPaid(created, input);
    }

    return created;
  }

  private async markCreatedBookingPaid(
    booking: CreatedBooking,
    input: CreateBookingInput,
  ): Promise<string> {
    const parsedPartial = input.markAsPaidAmount ? parseFloat(input.markAsPaidAmount) : NaN;
    const amount =
      !Number.isNaN(parsedPartial) && parsedPartial > 0
        ? parsedPartial.toFixed(2)
        : booking.balanceAmount;

    const body: GraphQLBody<ApplyPaymentToOrderResponse> =
      await this.client.request<ApplyPaymentToOrderResponse>(
        SALES_ENDPOINT,
        APPLY_PAYMENT_TO_ORDER_MUTATION,
        {
          input: {
            amount: { amount, currency: booking.balanceCurrency },
            orderId: booking.orderId,
            paymentSourceId: "custom/other",
            idempotencyKey: input.idempotencyKey,
            customerMessage: "Marked as paid",
            scopedTo: [booking.bookingId],
          },
        },
      );

    const result = body.data?.applyPaymentToOrder;
    if ((result?.errors && result.errors.length > 0) || !result?.transactionId) {
      throw new Error("Failed to mark booking as paid");
    }
    return result.transactionId;
  }

  /** Finds the parent item id of an add-on by matching its option id. */
  private async resolveParentItemId(addonId: string): Promise<string> {
    const products = await this.deps.productService.getAllProducts();
    const matched = products.find(
      (product) =>
        product.type === ADD_ON_PRODUCT_TYPE &&
        product.tickets.some((ticket) => ticket.id === addonId),
    );
    if (!matched) {
      throw new Error("Add-on not found for the provided addonId");
    }
    return matched.productId;
  }

  private validatePaymentInput(input: MakePaymentInput, normalizedBookingId: string): void {
    if (
      !input.paymentSourceId ||
      (!input.paymentSourceId.startsWith(PAYMENT_SOURCE_PREFIX) &&
        !ALLOWED_PAYMENT_SOURCE_IDS.includes(input.paymentSourceId))
    ) {
      throw new Error(
        "paymentSourceId is required and must start with 'ps_' or be one of " +
          "'cash/cash', 'custom/other', 'custom/voucher'",
      );
    }
    assertAmount(input.amount);
    assertCurrency(input.currency);
    assertIdempotencyKey(input.idempotencyKey);
    assertBookingId(normalizedBookingId);
  }

  private validateRefundInput(input: RefundInput, normalizedBookingId: string): void {
    if (!input.paymentId || !input.paymentId.startsWith(PAYMENT_ID_PREFIX)) {
      throw new Error("paymentId is required and must start with 'pmt_'");
    }
    assertAmount(input.amount);
    assertCurrency(input.currency);
    assertIdempotencyKey(input.idempotencyKey);
    assertBookingId(normalizedBookingId);
  }

  private async fetchPaginated(
    query: string,
    baseParams: {
      startDateTime?: string;
      endDateTime?: string;
      timeslotId?: string;
      searchBy?: BookingTimeRangeSearch["searchBy"];
      productId?: string;
      email?: string;
      searchString?: string;
    },
    includeGuests: boolean,
    includePriceBreakdown: boolean,
  ): Promise<Booking[]> {
    const bookings: Booking[] = [];
    let after: string | null = null;

    for (;;) {
      const body: GraphQLBody<BookingsResponse> =
        await this.client.request<BookingsResponse>(
          SALES_ENDPOINT,
          query,
          buildBookingsVariables({ ...baseParams, pageSize: this.pageSize, after }),
        );

      const sales = body.data?.sales;
      for (const edge of sales?.edges ?? []) {
        bookings.push(fromBookingNode(edge.node, includeGuests, includePriceBreakdown));
      }

      const pageInfo = sales?.pageInfo;
      if (pageInfo?.hasNextPage && pageInfo.endCursor) {
        after = pageInfo.endCursor;
      } else {
        break;
      }
    }

    return bookings;
  }
}

function assertAmount(amount: string): void {
  if (!amount || Number.isNaN(Number(amount))) {
    throw new Error("amount is required and must be a valid number");
  }
}

function assertCurrency(currency: string): void {
  if (!currency || !CURRENCY_CODE_REGEX.test(currency)) {
    throw new Error("currency is required and must be a 3-letter uppercase code");
  }
}

function assertIdempotencyKey(idempotencyKey: string): void {
  if (!idempotencyKey) {
    throw new Error("idempotencyKey is required");
  }
}

function assertBookingId(normalizedBookingId: string): void {
  if (!normalizedBookingId.startsWith(BOOKING_ID_PREFIX)) {
    throw new Error("bookingId is required and must start with 'b_' or 'B-'");
  }
}

function validateCreateInput(input: CreateBookingInput): void {
  if (!input.activityId) throw new Error("activityId is required");
  if (!input.availabilityTimeId) throw new Error("availabilityTimeId is required");
  if (!input.tickets || input.tickets.length === 0) {
    throw new Error("at least one ticket is required");
  }
  if (input.tickets.some((ticket) => !ticket.resourceOptionId || !(ticket.quantity > 0))) {
    throw new Error("each ticket requires a resourceOptionId and a positive quantity");
  }
  if (!input.guest || !input.guest.name) {
    throw new Error("guest name is required");
  }
  if (input.markAsPaid && !input.idempotencyKey) {
    throw new Error("idempotencyKey is required when markAsPaid is set");
  }
}

function parseQuantity(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }
  const str = String(value).trim();
  if (!/^\d+$/.test(str)) {
    return null;
  }
  const num = parseInt(str, 10);
  if (!Number.isFinite(num) || num <= 0) {
    return null;
  }
  return num;
}
