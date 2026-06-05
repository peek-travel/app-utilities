/**
 * The clean data model for a booking's payments on file.
 */

/** A single payment applied to a booking's order. */
export interface Payment {
  id: string;
  /** Date the payment was applied (YYYY-MM-DD). */
  paidAt: string;
  currentAmount: { amount: string; currency: string };
  refundableAmount: { amount: string; currency: string };
}

/** A payment source on the order, with any payments made against it. */
export interface PaymentSource {
  description: string;
  id: string;
  type: string;
  /** Payments made against this source, when any exist. */
  payments?: Payment[];
}

/** The payments-on-file result for a booking. */
export interface BookingPaymentsOnFile {
  bookingId: string;
  orderId: string;
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
  transactionId: string;
  bookingId: string;
  orderId: string;
  amount: string;
  currency: string;
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
  transactionId: string;
  bookingId: string;
  orderId: string;
  amount: string;
  currency: string;
  paymentId: string;
}

/** Result of creating an invoice link. */
export interface InvoiceLinkResult {
  bookingId: string;
  orderId: string;
  invoiceLink: string;
}
