import { describe, expect, it } from "vitest";

import type { BookingPaymentsOnFileResponse } from "../../src/internal/bookings/booking-queries.js";
import { fromPaymentsOnFileResponse } from "../../src/internal/bookings/payments-on-file-converter.js";

describe("fromPaymentsOnFileResponse", () => {
  it("aggregates payments under their source", () => {
    const response: BookingPaymentsOnFileResponse = {
      sales: {
        edges: [
          {
            node: {
              order: {
                id: "ord-1",
                paymentSources: [
                  { description: "Visa", id: "ps-1", type: "CARD" },
                  { description: "Cash", id: "ps-2", type: "CASH" },
                ],
                payments: [
                  {
                    id: "pay-1",
                    paymentSource: { id: "ps-1" },
                    appliedAt: "2026-01-02T10:00:00Z",
                    currentAmount: { amount: "50", currency: "USD" },
                    refundableAmount: { amount: "50", currency: "USD" },
                  },
                  {
                    id: "pay-2",
                    paymentSource: { id: "ps-1" },
                    appliedAt: "2026-01-03T10:00:00Z",
                    currentAmount: { amount: "25", currency: "USD" },
                    refundableAmount: { amount: "25", currency: "USD" },
                  },
                  {
                    id: "pay-orphan",
                    paymentSource: null,
                    appliedAt: "2026-01-04T10:00:00Z",
                    currentAmount: { amount: "1", currency: "USD" },
                    refundableAmount: { amount: "1", currency: "USD" },
                  },
                ],
              },
            },
          },
        ],
      },
    };

    const result = fromPaymentsOnFileResponse(response, "bkg_1");
    expect(result).toEqual({
      bookingId: "bkg_1",
      orderId: "ord-1",
      paymentsOnFile: [
        {
          description: "Visa",
          id: "ps-1",
          type: "CARD",
          payments: [
            {
              id: "pay-1",
              paidAt: "2026-01-02",
              currentAmount: { amount: "50", currency: "USD" },
              refundableAmount: { amount: "50", currency: "USD" },
            },
            {
              id: "pay-2",
              paidAt: "2026-01-03",
              currentAmount: { amount: "25", currency: "USD" },
              refundableAmount: { amount: "25", currency: "USD" },
            },
          ],
        },
        { description: "Cash", id: "ps-2", type: "CASH" },
      ],
    });
  });

  it("returns null when the booking is not found", () => {
    expect(fromPaymentsOnFileResponse({ sales: { edges: [] } }, "bkg_1")).toBeNull();
    expect(fromPaymentsOnFileResponse(undefined, "bkg_1")).toBeNull();
  });

  it("defaults an absent order to an empty result", () => {
    const result = fromPaymentsOnFileResponse(
      { sales: { edges: [{ node: {} }] } },
      "bkg_1",
    );
    expect(result).toEqual({ bookingId: "bkg_1", orderId: "", paymentsOnFile: [] });
  });
});
