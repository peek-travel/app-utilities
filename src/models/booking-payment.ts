/**
 * The clean data model for a booking's payments on file.
 */

/** A single payment applied to a booking's order. */
export interface Payment {
  /** Payment id (`pmt_…`). */
  id: string;
  /** Date the payment was applied (YYYY-MM-DD). */
  paidAt: string;
  /** The payment's current (net of refunds) amount. */
  currentAmount: { amount: string; currency: string };
  /** How much of the payment can still be refunded. */
  refundableAmount: { amount: string; currency: string };
}

/** A payment source on the order, with any payments made against it. */
export interface PaymentSource {
  /** Human-readable description of the source (e.g. a card summary). */
  description: string;
  /** Payment source id (`ps_…`, or a synthetic id like `cash/cash`). */
  id: string;
  /** Source type reported by Peek (e.g. card/cash/custom). */
  type: string;
  /** Payments made against this source, when any exist. */
  payments?: Payment[];
}

/** The payments-on-file result for a booking. */
export interface BookingPaymentsOnFile {
  /** The booking these payments belong to. */
  bookingId: string;
  /** The order id the payments live on. */
  orderId: string;
  /** The order's payment sources, each with its payments grouped under it. */
  paymentsOnFile: PaymentSource[];
}

/** Input for charging a booking. */
export interface MakePaymentInput {
  /** Booking id (normalized internally). */
  bookingId: string;
  /** Payment source id (`ps_…`, or one of `cash/cash`, `custom/other`, `custom/voucher`). */
  paymentSourceId: string;
  /** Amount as a numeric string. */
  amount: string;
  /** 3-letter uppercase ISO currency code. */
  currency: string;
  /** Idempotency key passed through to Peek. */
  idempotencyKey: string;
  /** Optional message appended to the default customer message. */
  customerMessage?: string;
}

/** Result of charging a booking. */
export interface MakePaymentResult {
  /** The gateway transaction id for the charge. */
  transactionId: string;
  /** The booking that was charged. */
  bookingId: string;
  /** The order the charge was applied to. */
  orderId: string;
  /** Amount charged, as a numeric string. */
  amount: string;
  /** 3-letter uppercase ISO currency code of the charge. */
  currency: string;
  /** The payment source that was charged. */
  paymentSourceId: string;
}

/** Input for refunding a booking payment. */
export interface RefundInput {
  /** Booking id (normalized internally). */
  bookingId: string;
  /** Payment id to refund (`pmt_…`). */
  paymentId: string;
  /** Amount as a numeric string. */
  amount: string;
  /** 3-letter uppercase ISO currency code. */
  currency: string;
  /** Idempotency key passed through to Peek. */
  idempotencyKey: string;
}

/** Result of refunding a booking payment. */
export interface RefundResult {
  /** The gateway transaction id for the refund. */
  transactionId: string;
  /** The booking that was refunded. */
  bookingId: string;
  /** The order the refund was applied to. */
  orderId: string;
  /** Amount refunded, as a numeric string. */
  amount: string;
  /** 3-letter uppercase ISO currency code of the refund. */
  currency: string;
  /** The payment that was refunded (`pmt_…`). */
  paymentId: string;
}

/** Result of creating an invoice link. */
export interface InvoiceLinkResult {
  /** The booking the invoice is for. */
  bookingId: string;
  /** The order the invoice is for. */
  orderId: string;
  /** The customer-facing URL where the invoice can be paid. */
  invoiceLink: string;
}
