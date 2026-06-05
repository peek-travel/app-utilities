import { describe, expect, it } from "vitest";

import { BookingService } from "../../src/internal/bookings/booking-service.js";
import {
  GraphQLClient,
  type GraphQLClientOptions,
} from "../../src/internal/graphql-client.js";
import type { ProductService } from "../../src/internal/products/product-service.js";
import { noopLogger } from "../../src/logger.js";
import type { Product } from "../../src/models/product.js";

interface RecordedCall {
  query: string;
  variables: Record<string, unknown>;
}

type Handler = (query: string, variables: Record<string, unknown>) => unknown;

function makeService(
  handler: Handler,
  addOnProducts: Product[] = [],
): {
  service: BookingService;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  const fetchFn = (async (_url: string, init: RequestInit) => {
    const body = JSON.parse(init.body as string);
    calls.push({ query: body.query as string, variables: body.variables });
    return { status: 200, ok: true, json: async () => handler(body.query, body.variables) } as unknown as Response;
  }) as unknown as typeof fetch;

  const options: GraphQLClientOptions = {
    baseUrl: "https://gw.test/gql",
    appId: "app-1",
    gatewayKey: "gw-key",
    getToken: () => "tok",
    retryDelaysMs: [],
    logger: noopLogger,
    fetchFn,
  };
  const productService = {
    getAllProducts: async () => addOnProducts,
  } as unknown as ProductService;
  return {
    service: new BookingService(new GraphQLClient(options), { productService }),
    calls,
  };
}

function listing(nodes: object[], pageInfo = { hasNextPage: false, endCursor: null }) {
  return { data: { sales: { pageInfo, edges: nodes.map((node) => ({ node })) } } };
}

const NODE = {
  id: "bkg_1",
  displayId: "B-1",
  operatorNotes: "old",
  reservationStatus: "CONFIRMED",
  checkinStatus: "NONE",
  returnStatus: "NONE",
};

describe("BookingService.getById", () => {
  it("normalizes the id, filters by it, and converts", async () => {
    const { service, calls } = makeService(() => listing([NODE]));
    const booking = await service.getById("BKG-1");

    expect(booking?.bookingId).toBe("bkg_1");
    const filter = (calls[0]!.variables.filter as { bookingFilter: { ids: string[] } });
    expect(filter.bookingFilter.ids).toEqual(["bkg_1"]);
  });

  it("returns null when not found", async () => {
    const { service } = makeService(() => listing([]));
    expect(await service.getById("x")).toBeNull();
  });
});

describe("BookingService search", () => {
  it("paginates a time-range search and builds purchase-date filter", async () => {
    let page = 0;
    const { service, calls } = makeService(() => {
      page += 1;
      return page === 1
        ? listing([NODE], { hasNextPage: true, endCursor: "c1" })
        : listing([{ ...NODE, id: "bkg_2" }]);
    });

    const bookings = await service.searchByTimeRange({
      start: "2026-01-01T00:00:00Z",
      end: "2026-01-31T00:00:00Z",
      productId: "act-1",
      email: "a@x.com",
    });

    expect(bookings.map((b) => b.bookingId)).toEqual(["bkg_1", "bkg_2"]);
    const filter = calls[0]!.variables.filter as {
      purchasedAtRangeUtc: string;
      primaryGuestEmail: string;
      bookingFilter: { activityIds: string[] };
    };
    expect(filter.purchasedAtRangeUtc).toBe("[2026-01-01T00:00:00Z,2026-01-31T00:00:00Z]");
    expect(filter.primaryGuestEmail).toBe("a@x.com");
    expect(filter.bookingFilter.activityIds).toEqual(["act-1"]);
    expect(calls[1]!.variables.after).toBe("c1");
  });

  it("uses overlapsRange for activityDate searches", async () => {
    const { service, calls } = makeService(() => listing([]));
    await service.searchByTimeRange({
      start: "2026-01-01",
      end: "2026-01-02",
      searchBy: "activityDate",
    });
    const filter = calls[0]!.variables.filter as { bookingFilter: { overlapsRange: string } };
    expect(filter.bookingFilter.overlapsRange).toBe("[2026-01-01,2026-01-02]");
  });

  it("supports a search-string-only filter with no booking filter", async () => {
    const { service, calls } = makeService(() => listing([]));
    await service.searchByTimeRange({
      start: "2026-01-01",
      end: "2026-01-02",
      searchString: "ada",
    });
    const filter = calls[0]!.variables.filter as {
      searchString: string;
      bookingFilter?: unknown;
    };
    expect(filter.searchString).toBe("ada");
    expect(filter.bookingFilter).toBeUndefined();
  });

  it("filters by timeslot", async () => {
    const { service, calls } = makeService(() => listing([NODE]));
    await service.searchByTimeslot("act-1|ts-1");
    const filter = calls[0]!.variables.filter as { bookingFilter: { timeslotRefid: string } };
    expect(filter.bookingFilter.timeslotRefid).toBe("act-1|ts-1");
  });
});

describe("BookingService.getGuests", () => {
  it("returns the merged guests", async () => {
    const { service } = makeService(() => ({
      data: {
        sales: {
          edges: [
            {
              node: {
                displayId: "B-1",
                id: "bkg_1",
                primaryGuest: { id: "g1" },
                bookingGuests: [{ id: "g1" }, { id: "g2" }],
              },
            },
          ],
        },
      },
    }));
    const guests = await service.getGuests("bkg_1");
    expect(guests.map((g) => g.id)).toEqual(["g1", "g2"]);
  });
});

describe("BookingService.getPaymentsOnFile", () => {
  it("aggregates and normalizes the booking id", async () => {
    const { service, calls } = makeService(() => ({
      data: {
        sales: {
          edges: [
            {
              node: {
                order: {
                  id: "ord-1",
                  paymentSources: [{ description: "Visa", id: "ps-1", type: "CARD" }],
                  payments: [],
                },
              },
            },
          ],
        },
      },
    }));
    const result = await service.getPaymentsOnFile("BKG-1");
    expect(result).toEqual({ bookingId: "bkg_1", orderId: "ord-1", paymentsOnFile: [
      { description: "Visa", id: "ps-1", type: "CARD" },
    ] });
    expect(calls[0]!.query).toContain("paymentSources");
  });
});

describe("BookingService.appendNote", () => {
  it("appends to existing notes", async () => {
    const { service, calls } = makeService((query) =>
      query.includes("updateOperatorNotesForBooking")
        ? { data: { updateOperatorNotesForBooking: { booking: { operatorNotes: "x" } } } }
        : listing([NODE]),
    );

    const booking = await service.appendNote("bkg_1", "new");
    expect(booking?.notes).toBe("old\nnew");
    const mutationCall = calls.find((c) => c.query.includes("updateOperatorNotesForBooking"));
    expect((mutationCall!.variables.input as { operatorNotes: string }).operatorNotes).toBe("old\nnew");
  });

  it("overwrites notes when requested", async () => {
    const { service, calls } = makeService((query) =>
      query.includes("updateOperatorNotesForBooking")
        ? { data: { updateOperatorNotesForBooking: { booking: {} } } }
        : listing([NODE]),
    );

    const booking = await service.appendNote("bkg_1", "fresh", "overwrite");
    expect(booking?.notes).toBe("fresh");
    const mutationCall = calls.find((c) => c.query.includes("updateOperatorNotesForBooking"));
    expect((mutationCall!.variables.input as { operatorNotes: string }).operatorNotes).toBe("fresh");
  });

  it("returns null and skips the mutation when the booking is missing", async () => {
    const { service, calls } = makeService(() => listing([]));
    expect(await service.appendNote("bkg_1", "x")).toBeNull();
    expect(calls.every((c) => !c.query.includes("updateOperatorNotesForBooking"))).toBe(true);
  });
});

describe("BookingService.setCheckinStatus", () => {
  it("sends a timestamp when checking in and refetches", async () => {
    const { service, calls } = makeService((query) =>
      query.includes("updateBookingCheckIn")
        ? { data: { updateBookingCheckIn: { booking: { checkinStatus: "CHECKED_IN" } } } }
        : listing([NODE]),
    );

    const booking = await service.setCheckinStatus("bkg_1", true);
    expect(booking?.bookingId).toBe("bkg_1");
    const mutationCall = calls.find((c) => c.query.includes("updateBookingCheckIn"));
    const checkedInAt = (mutationCall!.variables.input as { checkedInAt: string | null }).checkedInAt;
    expect(typeof checkedInAt).toBe("string");
  });

  it("sends null when checking out", async () => {
    const { service, calls } = makeService((query) =>
      query.includes("updateBookingCheckIn")
        ? { data: { updateBookingCheckIn: { booking: {} } } }
        : listing([NODE]),
    );

    await service.setCheckinStatus("bkg_1", false);
    const mutationCall = calls.find((c) => c.query.includes("updateBookingCheckIn"));
    expect((mutationCall!.variables.input as { checkedInAt: string | null }).checkedInAt).toBeNull();
  });
});

describe("BookingService.cancel", () => {
  it("cancels with a default note and returns the status", async () => {
    const { service, calls } = makeService(() => ({
      data: {
        cancelBooking: {
          booking: { id: "bkg_1", displayId: "B-1", reservationStatus: "CANCELED" },
        },
      },
    }));

    const result = await service.cancel("BKG-1");
    expect(result).toEqual({ id: "bkg_1", displayId: "B-1", reservationStatus: "CANCELED" });
    const input = calls[0]!.variables.input as { bookingId: string; notes: string };
    expect(input.bookingId).toBe("bkg_1");
    expect(input.notes).toBe("Canceled");
  });

  it("throws when the mutation returns no booking", async () => {
    const { service } = makeService(() => ({ data: { cancelBooking: null } }));
    await expect(service.cancel("bkg_1")).rejects.toThrow(/No booking data/);
  });
});

const PAYMENTS_RESP = {
  data: {
    sales: {
      edges: [
        {
          node: {
            order: {
              id: "ord-1",
              paymentSources: [{ description: "Visa", id: "ps_1", type: "CARD" }],
              payments: [
                {
                  id: "pmt_1",
                  paymentSource: { id: "ps_1" },
                  appliedAt: "2026-01-02T10:00:00Z",
                  currentAmount: { amount: "10", currency: "USD" },
                  refundableAmount: { amount: "10", currency: "USD" },
                },
              ],
            },
          },
        },
      ],
    },
  },
};

function financeHandler(mutationKeyword: string, mutationResponse: unknown): Handler {
  return (query) =>
    query.includes("paymentSources")
      ? PAYMENTS_RESP
      : query.includes(mutationKeyword)
        ? mutationResponse
        : {};
}

describe("BookingService.makePayment", () => {
  const validInput = {
    bookingId: "b_1",
    paymentSourceId: "ps_1",
    amount: "10",
    currency: "USD",
    idempotencyKey: "key-1",
  };

  it("charges and returns the transaction id", async () => {
    const { service, calls } = makeService(
      financeHandler("applyPaymentToOrder", {
        data: { applyPaymentToOrder: { transactionId: "tx-1", errors: null } },
      }),
    );

    const result = await service.makePayment({ ...validInput, customerMessage: "thanks" });
    expect(result).toEqual({
      transactionId: "tx-1",
      bookingId: "b_1",
      orderId: "ord-1",
      amount: "10",
      currency: "USD",
      paymentSourceId: "ps_1",
    });
    const input = calls.find((c) => c.query.includes("applyPaymentToOrder"))!.variables.input;
    expect(input).toMatchObject({
      amount: { amount: "10", currency: "USD" },
      orderId: "ord-1",
      paymentSourceId: "ps_1",
      idempotencyKey: "key-1",
      customerMessage: "Charge initiated via API (thanks)",
      scopedTo: ["b_1"],
    });
  });

  it("throws when the booking is not found", async () => {
    const { service } = makeService(() => ({ data: { sales: { edges: [] } } }));
    await expect(service.makePayment(validInput)).rejects.toThrow(/Booking not found/);
  });

  it("throws when the payment source does not exist", async () => {
    const { service } = makeService(financeHandler("applyPaymentToOrder", {}));
    await expect(
      service.makePayment({ ...validInput, paymentSourceId: "ps_other" }),
    ).rejects.toThrow(/paymentSourceId not found/);
  });

  it("throws when Peek returns payment errors", async () => {
    const { service } = makeService(
      financeHandler("applyPaymentToOrder", {
        data: { applyPaymentToOrder: { transactionId: null, errors: [{ code: "X", detail: "declined", value: null }] } },
      }),
    );
    await expect(service.makePayment(validInput)).rejects.toThrow(/Payment failed: declined/);
  });

  it.each([
    [{ ...validInput, paymentSourceId: "bad" }, /paymentSourceId is required/],
    [{ ...validInput, amount: "abc" }, /amount is required/],
    [{ ...validInput, currency: "usd" }, /currency is required/],
    [{ ...validInput, idempotencyKey: "" }, /idempotencyKey is required/],
    [{ ...validInput, bookingId: "x-1" }, /bookingId is required/],
  ])("rejects invalid input (%#)", async (input, pattern) => {
    const { service } = makeService(() => ({}));
    await expect(service.makePayment(input)).rejects.toThrow(pattern);
  });
});

describe("BookingService.refund", () => {
  const validInput = {
    bookingId: "b_1",
    paymentId: "pmt_1",
    amount: "10",
    currency: "USD",
    idempotencyKey: "key-1",
  };

  it("refunds and returns the transaction id", async () => {
    const { service, calls } = makeService(
      financeHandler("applyRefundToOrder", {
        data: { applyRefundToOrder: { transactionId: "rf-1", errors: null } },
      }),
    );

    const result = await service.refund(validInput);
    expect(result).toMatchObject({ transactionId: "rf-1", orderId: "ord-1", paymentId: "pmt_1" });
    const input = calls.find((c) => c.query.includes("applyRefundToOrder"))!.variables.input;
    expect(input).toMatchObject({ orderId: "ord-1", paymentId: "pmt_1", scopedTo: ["b_1"] });
  });

  it("throws when the payment id does not exist", async () => {
    const { service } = makeService(financeHandler("applyRefundToOrder", {}));
    await expect(
      service.refund({ ...validInput, paymentId: "pmt_other" }),
    ).rejects.toThrow(/paymentId not found/);
  });

  it("throws when the booking is not found", async () => {
    const { service } = makeService(() => ({ data: { sales: { edges: [] } } }));
    await expect(service.refund(validInput)).rejects.toThrow(/Booking not found/);
  });

  it("throws when Peek returns refund errors", async () => {
    const { service } = makeService(
      financeHandler("applyRefundToOrder", {
        data: { applyRefundToOrder: { transactionId: null, errors: [{ code: "X", detail: "nope", value: null }] } },
      }),
    );
    await expect(service.refund(validInput)).rejects.toThrow(/Refund failed: nope/);
  });

  it("rejects an invalid payment id", async () => {
    const { service } = makeService(() => ({}));
    await expect(service.refund({ ...validInput, paymentId: "bad" })).rejects.toThrow(
      /paymentId is required/,
    );
  });
});

describe("BookingService.createInvoiceLink", () => {
  const bookingWithOrder = { ...NODE, order: { id: "ord-1" } };

  it("resolves the order and returns the invoice url", async () => {
    const { service, calls } = makeService((query) =>
      query.includes("createInvoiceLink")
        ? { data: { createInvoiceLink: { invoiceLink: { status: "OK", url: "https://inv/1" }, errors: null } } }
        : listing([bookingWithOrder]),
    );

    const result = await service.createInvoiceLink("B-1");
    expect(result).toEqual({ bookingId: "b_1", orderId: "ord_1", invoiceLink: "https://inv/1" });
    const input = calls.find((c) => c.query.includes("createInvoiceLink"))!.variables.input;
    expect(input).toEqual({ orderId: "ord_1" });
  });

  it("throws when the booking has no order", async () => {
    const { service } = makeService(() => listing([]));
    await expect(service.createInvoiceLink("b_1")).rejects.toThrow(/Booking not found/);
  });

  it("throws when no url is returned", async () => {
    const { service } = makeService((query) =>
      query.includes("createInvoiceLink")
        ? { data: { createInvoiceLink: { invoiceLink: null, errors: [{ code: "X", detail: "no", value: null }] } } }
        : listing([bookingWithOrder]),
    );
    await expect(service.createInvoiceLink("b_1")).rejects.toThrow(/Failed to create invoice link/);
  });

  it("throws when the booking id is blank", async () => {
    const { service } = makeService(() => ({}));
    await expect(service.createInvoiceLink("  ")).rejects.toThrow(/bookingId is required/);
  });
});

describe("BookingService.addAddon", () => {
  const ADDON: Product = {
    productId: "item-1",
    name: "Safety Gear",
    type: "ADD-ON",
    color: "#FFFFFF",
    tickets: [{ id: "opt-1", name: "Helmet" }],
  };
  const bookingWithOrder = { ...NODE, order: { id: "ord-1" } };

  function addonHandler(overrides: Partial<Record<string, unknown>> = {}): Handler {
    return (query) => {
      if (query.includes("createQuoteFromOrder")) {
        return (
          overrides.createQuote ?? {
            data: {
              createQuoteFromOrder: {
                errors: null,
                quote: { id: "q-1", saleQuotes: [{ refid: "sq-1", reservationStatus: "CONFIRMED" }] },
              },
            },
          }
        );
      }
      if (query.includes("updateQuoteV2")) {
        return overrides.updateQuote ?? { data: { updateQuoteV2: { errors: null, quote: { id: "q-1" } } } };
      }
      if (query.includes("amendOrder")) {
        return overrides.amend ?? { data: { amendOrder: { errors: null, order: { id: "ord-1" } } } };
      }
      return listing([bookingWithOrder]);
    };
  }

  it("runs the three-step flow and builds the add-on quote", async () => {
    const { service, calls } = makeService(addonHandler(), [ADDON]);

    const result = await service.addAddon("B-1", { addonId: "opt-1", quantity: "2" });
    expect(result).toEqual({
      bookingId: "b_1",
      orderId: "ord_1",
      quoteId: "q-1",
      addonId: "opt-1",
      quantity: 2,
    });

    expect(calls.find((c) => c.query.includes("createQuoteFromOrder"))!.variables.input).toEqual({
      orderId: "ord_1",
      quoteInput: {},
    });

    const updateInput = calls.find((c) => c.query.includes("updateQuoteV2"))!.variables.input as {
      quoteId: string;
      quoteInput: {
        bookingQuotes: Array<{ refid: string; addons: Array<{ itemId: string; itemOptions: Array<{ itemOptionId: string }> }> }>;
      };
    };
    const bq = updateInput.quoteInput.bookingQuotes[0]!;
    expect(bq.refid).toBe("sq-1");
    expect(bq.addons[0]!.itemId).toBe("item-1");
    expect(bq.addons[0]!.itemOptions).toHaveLength(2);
    expect(bq.addons[0]!.itemOptions[0]!.itemOptionId).toBe("opt-1");

    expect(calls.find((c) => c.query.includes("amendOrder"))!.variables.input).toEqual({
      quoteId: "q-1",
      orderId: "ord_1",
    });
  });

  it("throws when the addon id is missing", async () => {
    const { service } = makeService(addonHandler(), [ADDON]);
    await expect(service.addAddon("b_1", { addonId: " ", quantity: "1" })).rejects.toThrow(
      /addonId is required/,
    );
  });

  it.each(["0", "abc", "-1"])("rejects invalid quantity %s", async (quantity) => {
    const { service } = makeService(addonHandler(), [ADDON]);
    await expect(service.addAddon("b_1", { addonId: "opt-1", quantity })).rejects.toThrow(
      /positive integer/,
    );
  });

  it("throws when the add-on cannot be matched", async () => {
    const { service } = makeService(addonHandler(), []);
    await expect(service.addAddon("b_1", { addonId: "opt-x", quantity: "1" })).rejects.toThrow(
      /Add-on not found/,
    );
  });

  it("throws when the booking has no order", async () => {
    const { service } = makeService(() => listing([]), [ADDON]);
    await expect(service.addAddon("b_1", { addonId: "opt-1", quantity: "1" })).rejects.toThrow(
      /Booking not found/,
    );
  });

  it("throws when the quote cannot be created", async () => {
    const { service } = makeService(
      addonHandler({ createQuote: { data: { createQuoteFromOrder: { errors: null, quote: null } } } }),
      [ADDON],
    );
    await expect(service.addAddon("b_1", { addonId: "opt-1", quantity: "1" })).rejects.toThrow(
      /Failed to create quote from order/,
    );
  });

  it("throws when the quote update fails", async () => {
    const { service } = makeService(
      addonHandler({ updateQuote: { data: { updateQuoteV2: { errors: [{ code: "X", detail: "no", value: null }], quote: null } } } }),
      [ADDON],
    );
    await expect(service.addAddon("b_1", { addonId: "opt-1", quantity: "1" })).rejects.toThrow(
      /Failed to update quote with add-on/,
    );
  });

  it("throws when the order amend fails", async () => {
    const { service } = makeService(
      addonHandler({ amend: { data: { amendOrder: { errors: null, order: null } } } }),
      [ADDON],
    );
    await expect(service.addAddon("b_1", { addonId: "opt-1", quantity: "1" })).rejects.toThrow(
      /Failed to amend order with add-on/,
    );
  });
});

describe("BookingService.create", () => {
  const validCreate = {
    activityId: "act-1",
    availabilityTimeId: "avail-1",
    tickets: [{ resourceOptionId: "r1", quantity: 2 }],
    guest: { name: "Ada", email: "ada@example.com" },
  };

  const orderSale = {
    id: "b_1",
    displayId: "B-1",
    balance: { total: { amount: "100.00", currency: "USD", formatted: "$100.00" } },
  };

  function createHandler(overrides: Partial<Record<string, unknown>> = {}): Handler {
    return (query) => {
      if (query.includes("createQuoteV2")) {
        return overrides.quote ?? { data: { createQuoteV2: { errors: null, quote: { id: "q-1" } } } };
      }
      if (query.includes("createOrderFromQuote")) {
        return (
          overrides.order ?? {
            data: { createOrderFromQuote: { errors: null, order: { id: "ord-1", sales: [orderSale] } } }
          }
        );
      }
      if (query.includes("applyPaymentToOrder")) {
        return overrides.payment ?? { data: { applyPaymentToOrder: { transactionId: "tx-1", errors: null } } };
      }
      return {};
    };
  }

  it("creates a booking via quote then order", async () => {
    const { service, calls } = makeService(createHandler());

    const result = await service.create({ ...validCreate, operatorNotes: "VIP" });
    expect(result).toEqual({
      orderId: "ord-1",
      bookingId: "b_1",
      displayId: "B-1",
      balanceAmount: "100.00",
      balanceCurrency: "USD",
      balanceFormatted: "$100.00",
    });

    const quoteInput = (calls.find((c) => c.query.includes("createQuoteV2"))!.variables.input as {
      quoteInput: { bookingQuotes: Array<Record<string, unknown>>; source?: unknown };
    }).quoteInput;
    const bq = quoteInput.bookingQuotes[0] as {
      activityId: string;
      availabilityTimeId: string;
      tickets: Array<{ resourceOptionId: string }>;
      skipCustomerEmail: boolean;
      operatorNotes: string;
      guest: Record<string, unknown>;
    };
    expect(bq.activityId).toBe("act-1");
    expect(bq.availabilityTimeId).toBe("avail-1");
    expect(bq.tickets).toHaveLength(2);
    expect(bq.tickets[0]!.resourceOptionId).toBe("r1");
    expect(bq.skipCustomerEmail).toBe(false);
    expect(bq.operatorNotes).toBe("VIP");
    expect(bq.guest).toMatchObject({ name: "Ada", email: "ada@example.com", optinMarketing: false });
    expect(quoteInput.source).toBeUndefined();
    expect(calls.find((c) => c.query.includes("createOrderFromQuote"))!.variables.input).toEqual({
      quoteId: "q-1",
    });
    expect(calls.every((c) => !c.query.includes("applyPaymentToOrder"))).toBe(true);
  });

  it("clones from a parent order when provided", async () => {
    const { service, calls } = makeService(createHandler());
    await service.create({ ...validCreate, parentOrderId: "ord-parent" });
    const quoteInput = (calls[0]!.variables.input as { quoteInput: { source?: { clonedFromId: string } } }).quoteInput;
    expect(quoteInput.source).toEqual({ clonedFromId: "ord-parent" });
  });

  it("marks the booking paid with the full balance", async () => {
    const { service, calls } = makeService(createHandler());
    const result = await service.create({ ...validCreate, markAsPaid: true, idempotencyKey: "k1" });
    expect(result.transactionId).toBe("tx-1");
    const payInput = calls.find((c) => c.query.includes("applyPaymentToOrder"))!.variables.input;
    expect(payInput).toMatchObject({
      amount: { amount: "100.00", currency: "USD" },
      orderId: "ord-1",
      paymentSourceId: "custom/other",
      idempotencyKey: "k1",
      customerMessage: "Marked as paid",
      scopedTo: ["b_1"],
    });
  });

  it("marks the booking paid with a partial amount", async () => {
    const { service, calls } = makeService(createHandler());
    await service.create({ ...validCreate, markAsPaid: true, markAsPaidAmount: "50", idempotencyKey: "k1" });
    const payInput = calls.find((c) => c.query.includes("applyPaymentToOrder"))!.variables.input as {
      amount: { amount: string };
    };
    expect(payInput.amount.amount).toBe("50.00");
  });

  it("throws when the quote fails", async () => {
    const { service } = makeService(createHandler({ quote: { data: { createQuoteV2: { errors: null, quote: null } } } }));
    await expect(service.create(validCreate)).rejects.toThrow(/Failed to create quote/);
  });

  it("throws when the order has errors", async () => {
    const { service } = makeService(
      createHandler({ order: { data: { createOrderFromQuote: { errors: [{ code: "X", detail: "no", value: null }], order: null } } } }),
    );
    await expect(service.create(validCreate)).rejects.toThrow(/Failed to create order from quote/);
  });

  it("throws when the order has no sales", async () => {
    const { service } = makeService(
      createHandler({ order: { data: { createOrderFromQuote: { errors: null, order: { id: "ord-1", sales: [] } } } } }),
    );
    await expect(service.create(validCreate)).rejects.toThrow(/no sales found/);
  });

  it("throws when marking paid fails", async () => {
    const { service } = makeService(
      createHandler({ payment: { data: { applyPaymentToOrder: { transactionId: null, errors: [{ code: "X", detail: "no", value: null }] } } } }),
    );
    await expect(
      service.create({ ...validCreate, markAsPaid: true, idempotencyKey: "k1" }),
    ).rejects.toThrow(/Failed to mark booking as paid/);
  });

  it.each([
    [{ ...validCreate, activityId: "" }, /activityId is required/],
    [{ ...validCreate, availabilityTimeId: "" }, /availabilityTimeId is required/],
    [{ ...validCreate, tickets: [] }, /at least one ticket/],
    [{ ...validCreate, tickets: [{ resourceOptionId: "r1", quantity: 0 }] }, /positive quantity/],
    [{ ...validCreate, guest: { name: "" } }, /guest name is required/],
    [{ ...validCreate, markAsPaid: true }, /idempotencyKey is required when markAsPaid/],
  ])("rejects invalid input (%#)", async (input, pattern) => {
    const { service } = makeService(createHandler());
    await expect(service.create(input)).rejects.toThrow(pattern);
  });
});
