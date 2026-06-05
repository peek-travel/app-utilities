/**
 * Aggregates a booking's raw order payments + payment sources into the clean
 * {@link BookingPaymentsOnFile} model, grouping payments under their source.
 */
import type {
  BookingPaymentsOnFile,
  Payment,
  PaymentSource,
} from "../../models/booking-payment.js";
import type { BookingPaymentsOnFileResponse } from "./booking-queries.js";

/**
 * Maps a payments-on-file response into the aggregated result, or null when the
 * booking is not found.
 */
export function fromPaymentsOnFileResponse(
  response: BookingPaymentsOnFileResponse | undefined,
  bookingId: string,
): BookingPaymentsOnFile | null {
  const firstEdge = (response?.sales?.edges ?? [])[0];
  if (!firstEdge) {
    return null;
  }

  const order = firstEdge.node.order;
  const orderId = order?.id ?? "";
  const rawPaymentSources = order?.paymentSources ?? [];
  const rawPayments = order?.payments ?? [];

  const paymentsBySourceId = new Map<string, Payment[]>();
  for (const payment of rawPayments) {
    const sourceId = payment.paymentSource?.id;
    if (!sourceId) continue;
    const mapped: Payment = {
      id: payment.id,
      paidAt: dateOnly(payment.appliedAt),
      currentAmount: payment.currentAmount,
      refundableAmount: payment.refundableAmount,
    };
    const existing = paymentsBySourceId.get(sourceId);
    if (existing) {
      existing.push(mapped);
    } else {
      paymentsBySourceId.set(sourceId, [mapped]);
    }
  }

  const paymentsOnFile: PaymentSource[] = rawPaymentSources.map((source) => {
    const payments = paymentsBySourceId.get(source.id);
    return {
      description: source.description,
      id: source.id,
      type: source.type,
      ...(payments ? { payments } : {}),
    };
  });

  return { bookingId, orderId, paymentsOnFile };
}

function dateOnly(iso: string): string {
  /* v8 ignore next -- split always yields at least one element */
  return iso.split("T")[0] ?? iso;
}
