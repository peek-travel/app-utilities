import * as jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AccountUserService } from "../src/internal/account-users/account-user-service.js";
import { ProductService } from "../src/internal/products/product-service.js";
import { AvailabilityService } from "../src/internal/availability/availability-service.js";
import { BookingService } from "../src/internal/bookings/booking-service.js";
import { DailyNoteService } from "../src/internal/daily-notes/daily-note-service.js";
import { MembershipService } from "../src/internal/memberships/membership-service.js";
import { PromoCodeService } from "../src/internal/promo-codes/promo-code-service.js";
import { ResellerService } from "../src/internal/resellers/reseller-service.js";
import { ReviewService } from "../src/internal/reviews/review-service.js";
import { ResourcePoolService } from "../src/internal/resource-pools/resource-pool-service.js";
import { TimeslotService } from "../src/internal/timeslots/timeslot-service.js";
import type { Logger } from "../src/logger.js";
import { PeekAccessService } from "../src/peek-access-service.js";

const REQUIRED_CONFIG = {
  installId: "install-1",
  jwtSecret: "secret",
  issuer: "Peek Test",
  appId: "app-1",
  gatewayKey: "gw-key",
};

function jsonResponse(body: unknown, status = 200): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as unknown as Response;
}

interface RecordedCall {
  url: string;
  init: RequestInit;
}

/** A fetch that returns empty-but-valid product responses and records calls. */
function makeEmptyFetch(): { fetchFn: typeof fetch; calls: RecordedCall[] } {
  const calls: RecordedCall[] = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const query = JSON.parse(init.body as string).query as string;
    return query.includes("activities")
      ? jsonResponse({ data: { activities: [] } })
      : jsonResponse({
          data: {
            itemOptions: {
              edges: [],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        });
  }) as unknown as typeof fetch;
  return { fetchFn, calls };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PeekAccessService constructor validation", () => {
  it.each(["installId", "jwtSecret", "issuer", "appId", "gatewayKey"] as const)(
    "throws when %s is missing (v1)",
    (field) => {
      expect(
        () => new PeekAccessService({ ...REQUIRED_CONFIG, [field]: "" }),
      ).toThrow(new RegExp(field));
    },
  );

  it("does not require gatewayKey in v2 mode", () => {
    expect(
      () =>
        new PeekAccessService({
          installId: REQUIRED_CONFIG.installId,
          jwtSecret: REQUIRED_CONFIG.jwtSecret,
          issuer: REQUIRED_CONFIG.issuer,
          appId: REQUIRED_CONFIG.appId,
          mode: "v2",
        }),
    ).not.toThrow();
  });
});

describe("PeekAccessService.getProductService", () => {
  it("returns a ProductService and memoizes the instance", () => {
    const { fetchFn } = makeEmptyFetch();
    const service = new PeekAccessService({
      ...REQUIRED_CONFIG,
      fetch: fetchFn,
    });

    const productService = service.getProductService();
    expect(productService).toBeInstanceOf(ProductService);
    expect(service.getProductService()).toBe(productService);
  });

  it("returns an AccountUserService and memoizes the instance", () => {
    const { fetchFn } = makeEmptyFetch();
    const service = new PeekAccessService({
      ...REQUIRED_CONFIG,
      fetch: fetchFn,
    });

    const accountUserService = service.getAccountUserService();
    expect(accountUserService).toBeInstanceOf(AccountUserService);
    expect(service.getAccountUserService()).toBe(accountUserService);
  });

  it("returns a ResourcePoolService and memoizes the instance", () => {
    const { fetchFn } = makeEmptyFetch();
    const service = new PeekAccessService({
      ...REQUIRED_CONFIG,
      fetch: fetchFn,
    });

    const resourcePoolService = service.getResourcePoolService();
    expect(resourcePoolService).toBeInstanceOf(ResourcePoolService);
    expect(service.getResourcePoolService()).toBe(resourcePoolService);
  });

  it("returns a TimeslotService and memoizes the instance", () => {
    const { fetchFn } = makeEmptyFetch();
    const service = new PeekAccessService({
      ...REQUIRED_CONFIG,
      fetch: fetchFn,
    });

    const timeslotService = service.getTimeslotService();
    expect(timeslotService).toBeInstanceOf(TimeslotService);
    expect(service.getTimeslotService()).toBe(timeslotService);
  });

  it("returns a ResellerService and memoizes the instance", () => {
    const { fetchFn } = makeEmptyFetch();
    const service = new PeekAccessService({
      ...REQUIRED_CONFIG,
      fetch: fetchFn,
    });

    const resellerService = service.getResellerService();
    expect(resellerService).toBeInstanceOf(ResellerService);
    expect(service.getResellerService()).toBe(resellerService);
  });

  it("returns a PromoCodeService and memoizes the instance", () => {
    const { fetchFn } = makeEmptyFetch();
    const service = new PeekAccessService({
      ...REQUIRED_CONFIG,
      fetch: fetchFn,
    });

    const promoCodeService = service.getPromoCodeService();
    expect(promoCodeService).toBeInstanceOf(PromoCodeService);
    expect(service.getPromoCodeService()).toBe(promoCodeService);
  });

  it("returns a DailyNoteService and memoizes the instance", () => {
    const { fetchFn } = makeEmptyFetch();
    const service = new PeekAccessService({
      ...REQUIRED_CONFIG,
      fetch: fetchFn,
    });

    const dailyNoteService = service.getDailyNoteService();
    expect(dailyNoteService).toBeInstanceOf(DailyNoteService);
    expect(service.getDailyNoteService()).toBe(dailyNoteService);
  });

  it("returns an AvailabilityService and memoizes the instance", () => {
    const { fetchFn } = makeEmptyFetch();
    const service = new PeekAccessService({
      ...REQUIRED_CONFIG,
      fetch: fetchFn,
    });

    const availabilityService = service.getAvailabilityService();
    expect(availabilityService).toBeInstanceOf(AvailabilityService);
    expect(service.getAvailabilityService()).toBe(availabilityService);
  });

  it("returns a MembershipService and memoizes the instance", () => {
    const { fetchFn } = makeEmptyFetch();
    const service = new PeekAccessService({
      ...REQUIRED_CONFIG,
      fetch: fetchFn,
    });

    const membershipService = service.getMembershipService();
    expect(membershipService).toBeInstanceOf(MembershipService);
    expect(service.getMembershipService()).toBe(membershipService);
  });

  it("returns a BookingService and memoizes the instance", () => {
    const { fetchFn } = makeEmptyFetch();
    const service = new PeekAccessService({
      ...REQUIRED_CONFIG,
      fetch: fetchFn,
    });

    const bookingService = service.getBookingService();
    expect(bookingService).toBeInstanceOf(BookingService);
    expect(service.getBookingService()).toBe(bookingService);
  });

  it("returns a ReviewService and memoizes the instance", () => {
    const { fetchFn } = makeEmptyFetch();
    const service = new PeekAccessService({
      ...REQUIRED_CONFIG,
      fetch: fetchFn,
    });

    const reviewService = service.getReviewService();
    expect(reviewService).toBeInstanceOf(ReviewService);
    expect(service.getReviewService()).toBe(reviewService);
  });

  it("wires the default endpoint, global fetch, and a minted bearer token", async () => {
    const { fetchFn, calls } = makeEmptyFetch();
    vi.stubGlobal("fetch", fetchFn);

    const service = new PeekAccessService(REQUIRED_CONFIG);
    await service.getProductService().getAllProducts();

    expect(calls[0]!.url).toBe(
      "https://apps.peekapis.com/backoffice-gql/app-1/sales",
    );
    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers["X-Peek-Auth"]).toMatch(/^Bearer .+/);
  });

  it("forwards configuration overrides to the transport and product service", async () => {
    const logger: Logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const { fetchFn, calls } = makeEmptyFetch();

    const service = new PeekAccessService({
      ...REQUIRED_CONFIG,
      fetch: fetchFn,
      baseUrl: "https://custom.test/gql",
      retryDelaysMs: [1],
      logger,
      itemOptionsPageSize: 7,
      tokenTtlSeconds: 120,
      tokenRefreshLeewaySeconds: 10,
    });
    await service.getProductService().getAllProducts();

    expect(calls[0]!.url).toBe("https://custom.test/gql/app-1/sales");
    expect(logger.info).toHaveBeenCalled();

    const itemCall = calls.find((c) =>
      (JSON.parse(c.init.body as string).query as string).includes(
        "itemOptions",
      ),
    );
    expect(JSON.parse(itemCall!.init.body as string).variables.first).toBe(7);
  });
});

const PEEK_REGISTRY_ISSUER = "app_registry_v2";
const PEEK_REGISTRY_AUDIENCE = "Joken"; // still used when minting test tokens

const SAMPLE_USER_PAYLOAD = {
  email: "admin@peek.com",
  id: "null",
  is_admin: false,
  locale: "en",
  name: "Admin User",
};

function mintRegistryToken(
  secret: string,
  overrides: Record<string, unknown> = {},
): string {
  return jwt.sign(
    { display_version: "0.0.11", user: SAMPLE_USER_PAYLOAD, ...overrides },
    secret,
    {
      subject: "8c1f32b4-ab3c-4e20-82b7-844ea9e03bc9",
      issuer: PEEK_REGISTRY_ISSUER,
      audience: PEEK_REGISTRY_AUDIENCE,
      jwtid: "7d3d42c5-5724-489e-8380-a33abfc14936",
      expiresIn: 60,
      notBefore: 0,
    },
  );
}

describe("PeekAccessService.verifyPeekAuthToken", () => {
  it("returns fully typed claims from a valid Peek registry token", () => {
    const service = new PeekAccessService(REQUIRED_CONFIG);
    const token = mintRegistryToken(REQUIRED_CONFIG.jwtSecret);

    const claims = service.verifyPeekAuthToken(token);

    expect(claims.installId).toBe("8c1f32b4-ab3c-4e20-82b7-844ea9e03bc9");
    expect(claims.displayVersion).toBe("0.0.11");
  });

  it("maps the nested user object to typed fields", () => {
    const service = new PeekAccessService(REQUIRED_CONFIG);
    const token = mintRegistryToken(REQUIRED_CONFIG.jwtSecret);

    const { user } = service.verifyPeekAuthToken(token);

    expect(user.email).toBe("admin@peek.com");
    expect(user.id).toBe("null");
    expect(user.isAdmin).toBe(false);
    expect(user.locale).toBe("en");
    expect(user.name).toBe("Admin User");
  });

  it("maps is_admin: true correctly", () => {
    const service = new PeekAccessService(REQUIRED_CONFIG);
    const token = mintRegistryToken(REQUIRED_CONFIG.jwtSecret, {
      user: { ...SAMPLE_USER_PAYLOAD, is_admin: true },
    });

    expect(service.verifyPeekAuthToken(token).user.isAdmin).toBe(true);
  });

  it("throws on a token signed with a different secret", () => {
    const service = new PeekAccessService(REQUIRED_CONFIG);
    const token = mintRegistryToken("wrong-secret");

    expect(() => service.verifyPeekAuthToken(token)).toThrow();
  });

  it("throws on a token with a different issuer", () => {
    const service = new PeekAccessService(REQUIRED_CONFIG);
    const token = jwt.sign({ user: SAMPLE_USER_PAYLOAD }, REQUIRED_CONFIG.jwtSecret, {
      issuer: "wrong-issuer",
      audience: PEEK_REGISTRY_AUDIENCE,
      expiresIn: 60,
    });

    expect(() => service.verifyPeekAuthToken(token)).toThrow();
  });

  it("throws on an expired token", () => {
    const service = new PeekAccessService(REQUIRED_CONFIG);
    const token = jwt.sign(
      { display_version: "0.0.11", user: SAMPLE_USER_PAYLOAD },
      REQUIRED_CONFIG.jwtSecret,
      {
        subject: "8c1f32b4-ab3c-4e20-82b7-844ea9e03bc9",
        issuer: PEEK_REGISTRY_ISSUER,
        audience: PEEK_REGISTRY_AUDIENCE,
        expiresIn: -1,
      },
    );

    expect(() => service.verifyPeekAuthToken(token)).toThrow();
  });

  it("throws on a malformed token string", () => {
    const service = new PeekAccessService(REQUIRED_CONFIG);

    expect(() => service.verifyPeekAuthToken("not.a.jwt")).toThrow();
  });
});

describe("PeekAccessService v2 mode", () => {
  it("uses the app-registry sandbox base URL by default", async () => {
    const { fetchFn, calls } = makeEmptyFetch();
    vi.stubGlobal("fetch", fetchFn);

    const service = new PeekAccessService({ ...REQUIRED_CONFIG, mode: "v2" });
    await service.getProductService().getAllProducts();

    expect(calls[0]!.url).toBe(
      "https://app-registry.peeklabs.com/installations-api/app-1/peek_backoffice_api-v1/sales",
    );
  });

  it("inserts peek_backoffice_api-v1 segment with a custom baseUrl", async () => {
    const { fetchFn, calls } = makeEmptyFetch();

    const service = new PeekAccessService({
      ...REQUIRED_CONFIG,
      mode: "v2",
      fetch: fetchFn,
      baseUrl: "https://app-registry.prod.peeklabs.com/installations-api",
    });
    await service.getProductService().getAllProducts();

    expect(calls[0]!.url).toBe(
      "https://app-registry.prod.peeklabs.com/installations-api/app-1/peek_backoffice_api-v1/sales",
    );
  });

  it("still mints and sends a bearer token in v2 mode", async () => {
    const { fetchFn, calls } = makeEmptyFetch();

    const service = new PeekAccessService({
      ...REQUIRED_CONFIG,
      mode: "v2",
      fetch: fetchFn,
    });
    await service.getProductService().getAllProducts();

    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers["X-Peek-Auth"]).toMatch(/^Bearer .+/);
  });
});

describe("PeekAccessService proxy methods", () => {
  let service: PeekAccessService;

  beforeEach(() => {
    const { fetchFn } = makeEmptyFetch();
    service = new PeekAccessService({ ...REQUIRED_CONFIG, fetch: fetchFn });
  });

  it("getAllProducts delegates to ProductService.getAllProducts", async () => {
    const spy = vi.spyOn(service.getProductService(), "getAllProducts").mockResolvedValue([]);
    await service.getAllProducts();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("getAllActivities delegates to ProductService.getAllActivities", async () => {
    const spy = vi.spyOn(service.getProductService(), "getAllActivities").mockResolvedValue([]);
    await service.getAllActivities();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("getAllRentals delegates to ProductService.getAllRentals", async () => {
    const spy = vi.spyOn(service.getProductService(), "getAllRentals").mockResolvedValue([]);
    await service.getAllRentals();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("getAllAddons delegates to ProductService.getAllAddons", async () => {
    const spy = vi.spyOn(service.getProductService(), "getAllAddons").mockResolvedValue([]);
    await service.getAllAddons();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("getAllAccountUsers delegates to AccountUserService.getAll", async () => {
    const spy = vi.spyOn(service.getAccountUserService(), "getAll").mockResolvedValue([]);
    await service.getAllAccountUsers();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("getAccountUserById delegates to AccountUserService.getById", async () => {
    const spy = vi.spyOn(service.getAccountUserService(), "getById").mockResolvedValue(null);
    await service.getAccountUserById("user-1");
    expect(spy).toHaveBeenCalledWith("user-1");
  });

  it("getAllResourcePools delegates to ResourcePoolService.getAll", async () => {
    const spy = vi.spyOn(service.getResourcePoolService(), "getAll").mockResolvedValue([]);
    await service.getAllResourcePools();
    expect(spy).toHaveBeenCalledOnce();
    await service.getAllResourcePools("PEOPLE");
    expect(spy).toHaveBeenCalledWith("PEOPLE");
  });

  it("getTimeslotsForDay delegates to TimeslotService.getForDay", async () => {
    const spy = vi.spyOn(service.getTimeslotService(), "getForDay").mockResolvedValue([]);
    await service.getTimeslotsForDay("prod-1", "2026-07-01");
    expect(spy).toHaveBeenCalledWith("prod-1", "2026-07-01", undefined);
    await service.getTimeslotsForDay("prod-1", "2026-07-01", "open");
    expect(spy).toHaveBeenCalledWith("prod-1", "2026-07-01", "open");
  });

  it("getTimeslotById delegates to TimeslotService.getById", async () => {
    const spy = vi.spyOn(service.getTimeslotService(), "getById").mockResolvedValue(null);
    await service.getTimeslotById("ts-1");
    expect(spy).toHaveBeenCalledWith("ts-1");
  });

  it("setTimeslotAvailability delegates to TimeslotService.setAvailability", async () => {
    const spy = vi.spyOn(service.getTimeslotService(), "setAvailability").mockResolvedValue({ id: "" });
    await service.setTimeslotAvailability("ts-1", "open");
    expect(spy).toHaveBeenCalledWith("ts-1", "open");
  });

  it("setTimeslotNotes delegates to TimeslotService.setNotes", async () => {
    const spy = vi.spyOn(service.getTimeslotService(), "setNotes").mockResolvedValue({ id: "" });
    await service.setTimeslotNotes("ts-1", "note");
    expect(spy).toHaveBeenCalledWith("ts-1", "note");
  });

  it("assignTimeslotGuide delegates to TimeslotService.assignGuide", async () => {
    const assignment = { timeslotIds: ["ts-1"], guideIds: ["g-1"], action: "assign" as const };
    const spy = vi.spyOn(service.getTimeslotService(), "assignGuide").mockResolvedValue({ timeslotIds: [], resourcePoolIds: [], action: "assign", errors: [] });
    await service.assignTimeslotGuide(assignment);
    expect(spy).toHaveBeenCalledWith(assignment);
  });

  it("getAllChannels delegates to ResellerService.getAllChannels", async () => {
    const spy = vi.spyOn(service.getResellerService(), "getAllChannels").mockResolvedValue([]);
    await service.getAllChannels();
    expect(spy).toHaveBeenCalledOnce();
    await service.getAllChannels(5);
    expect(spy).toHaveBeenCalledWith(5);
  });

  it("getAllPromoCodes delegates to PromoCodeService.getAll", async () => {
    const spy = vi.spyOn(service.getPromoCodeService(), "getAll").mockResolvedValue([]);
    await service.getAllPromoCodes();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("createPromoCode delegates to PromoCodeService.create", async () => {
    const input = { name: "SAVE10", code: "SAVE10", amount: "10", discountType: "percent" as const };
    const spy = vi.spyOn(service.getPromoCodeService(), "create").mockResolvedValue({ id: "", code: "", name: "", discountType: "percent", amount: 0 });
    await service.createPromoCode(input);
    expect(spy).toHaveBeenCalledWith(input);
  });

  it("getDailyNoteToday delegates to DailyNoteService.getToday", async () => {
    const spy = vi.spyOn(service.getDailyNoteService(), "getToday").mockResolvedValue(null);
    await service.getDailyNoteToday();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("updateDailyNote delegates to DailyNoteService.update", async () => {
    const spy = vi.spyOn(service.getDailyNoteService(), "update").mockResolvedValue(null);
    await service.updateDailyNote("hello");
    expect(spy).toHaveBeenCalledWith("hello");
  });

  it("getAvailabilityTimes delegates to AvailabilityService.getAvailabilityTimes", async () => {
    const query = { activityId: "act-1", date: "2026-07-01", resourceOptionQuantities: [] };
    const spy = vi.spyOn(service.getAvailabilityService(), "getAvailabilityTimes").mockResolvedValue([]);
    await service.getAvailabilityTimes(query);
    expect(spy).toHaveBeenCalledWith(query);
  });

  it("getAllMemberships delegates to MembershipService.getAll", async () => {
    const spy = vi.spyOn(service.getMembershipService(), "getAll").mockResolvedValue([]);
    await service.getAllMemberships();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("purchaseMembership delegates to MembershipService.purchase", async () => {
    const input = { membershipVariantId: "mv-1", guest: { name: "Alice", email: "a@b.com", phone: null }, amount: "50", currency: "USD", idempotencyKey: "key-1" };
    const spy = vi.spyOn(service.getMembershipService(), "purchase").mockResolvedValue({ membershipId: "", bookingId: "" });
    await service.purchaseMembership(input);
    expect(spy).toHaveBeenCalledWith(input);
  });

  it("getBookingById delegates to BookingService.getById", async () => {
    const spy = vi.spyOn(service.getBookingService(), "getById").mockResolvedValue(null);
    await service.getBookingById("b_1");
    expect(spy).toHaveBeenCalledWith("b_1", undefined);
    const opts = { includeGuests: true };
    await service.getBookingById("b_1", opts);
    expect(spy).toHaveBeenCalledWith("b_1", opts);
  });

  it("searchBookingsByTimeRange delegates to BookingService.searchByTimeRange", async () => {
    const input = { start: "2026-07-01T00:00:00Z", end: "2026-07-31T23:59:59Z" };
    const spy = vi.spyOn(service.getBookingService(), "searchByTimeRange").mockResolvedValue([]);
    await service.searchBookingsByTimeRange(input);
    expect(spy).toHaveBeenCalledWith(input);
  });

  it("searchBookingsByTimeslot delegates to BookingService.searchByTimeslot", async () => {
    const spy = vi.spyOn(service.getBookingService(), "searchByTimeslot").mockResolvedValue([]);
    await service.searchBookingsByTimeslot("ts-1");
    expect(spy).toHaveBeenCalledWith("ts-1", undefined);
  });

  it("getBookingGuests delegates to BookingService.getGuests", async () => {
    const spy = vi.spyOn(service.getBookingService(), "getGuests").mockResolvedValue([]);
    await service.getBookingGuests("b_1");
    expect(spy).toHaveBeenCalledWith("b_1");
  });

  it("getBookingPaymentsOnFile delegates to BookingService.getPaymentsOnFile", async () => {
    const spy = vi.spyOn(service.getBookingService(), "getPaymentsOnFile").mockResolvedValue(null);
    await service.getBookingPaymentsOnFile("b_1");
    expect(spy).toHaveBeenCalledWith("b_1");
  });

  it("appendBookingNote delegates to BookingService.appendNote", async () => {
    const spy = vi.spyOn(service.getBookingService(), "appendNote").mockResolvedValue(null);
    await service.appendBookingNote("b_1", "note");
    expect(spy).toHaveBeenCalledWith("b_1", "note", undefined);
    await service.appendBookingNote("b_1", "note", "overwrite");
    expect(spy).toHaveBeenCalledWith("b_1", "note", "overwrite");
  });

  it("setBookingCheckinStatus delegates to BookingService.setCheckinStatus", async () => {
    const spy = vi.spyOn(service.getBookingService(), "setCheckinStatus").mockResolvedValue(null);
    await service.setBookingCheckinStatus("b_1", true);
    expect(spy).toHaveBeenCalledWith("b_1", true);
  });

  it("cancelBooking delegates to BookingService.cancel", async () => {
    const spy = vi.spyOn(service.getBookingService(), "cancel").mockResolvedValue({ id: "", displayId: "", reservationStatus: "" });
    await service.cancelBooking("b_1");
    expect(spy).toHaveBeenCalledWith("b_1", undefined);
    await service.cancelBooking("b_1", "Duplicate");
    expect(spy).toHaveBeenCalledWith("b_1", "Duplicate");
  });

  it("makeBookingPayment delegates to BookingService.makePayment", async () => {
    const input = { bookingId: "b_1", paymentSourceId: "cash/cash", amount: "50", currency: "USD", idempotencyKey: "k" };
    const spy = vi.spyOn(service.getBookingService(), "makePayment").mockResolvedValue({ transactionId: "", bookingId: "", orderId: "", amount: "", currency: "", paymentSourceId: "" });
    await service.makeBookingPayment(input);
    expect(spy).toHaveBeenCalledWith(input);
  });

  it("refundBooking delegates to BookingService.refund", async () => {
    const input = { bookingId: "b_1", paymentId: "pmt_1", amount: "10", currency: "USD", idempotencyKey: "k" };
    const spy = vi.spyOn(service.getBookingService(), "refund").mockResolvedValue({ transactionId: "", bookingId: "", orderId: "", amount: "", currency: "", paymentId: "" });
    await service.refundBooking(input);
    expect(spy).toHaveBeenCalledWith(input);
  });

  it("createBookingInvoiceLink delegates to BookingService.createInvoiceLink", async () => {
    const spy = vi.spyOn(service.getBookingService(), "createInvoiceLink").mockResolvedValue({ bookingId: "", orderId: "", invoiceLink: "" });
    await service.createBookingInvoiceLink("b_1");
    expect(spy).toHaveBeenCalledWith("b_1");
  });

  it("listBookingAddons delegates to BookingService.listAddons", async () => {
    const spy = vi.spyOn(service.getBookingService(), "listAddons").mockResolvedValue({ bookingId: "", displayId: "", orderId: "", addons: [] });
    await service.listBookingAddons("b_1");
    expect(spy).toHaveBeenCalledWith("b_1");
  });

  it("addBookingAddon delegates to BookingService.addAddon", async () => {
    const input = { addonOptionId: "opt-1", quantity: "1" };
    const spy = vi.spyOn(service.getBookingService(), "addAddon").mockResolvedValue({ updatedBookingAddons: { bookingId: "", displayId: "", orderId: "", addons: [] } });
    await service.addBookingAddon("b_1", input);
    expect(spy).toHaveBeenCalledWith("b_1", input);
  });

  it("removeBookingAddon delegates to BookingService.removeAddon", async () => {
    const input = { addonOptionId: "opt-1", quantity: "1" };
    const spy = vi.spyOn(service.getBookingService(), "removeAddon").mockResolvedValue({ updatedBookingAddons: { bookingId: "", displayId: "", orderId: "", addons: [] } });
    await service.removeBookingAddon("b_1", input);
    expect(spy).toHaveBeenCalledWith("b_1", input);
  });

  it("createBooking delegates to BookingService.create", async () => {
    const input = { activityId: "act-1", availabilityTimeId: "avt-1", tickets: [{ resourceOptionId: "r-1", quantity: 1 }], guest: { name: "Alice" } };
    const spy = vi.spyOn(service.getBookingService(), "create").mockResolvedValue({ bookingId: "", displayId: "", balanceFormatted: "" });
    await service.createBooking(input);
    expect(spy).toHaveBeenCalledWith(input);
  });

  it("getReviews delegates to ReviewService.getReviews", async () => {
    const spy = vi.spyOn(service.getReviewService(), "getReviews").mockResolvedValue([]);
    await service.getReviews("act-1");
    expect(spy).toHaveBeenCalledWith("act-1", undefined, undefined);
    await service.getReviews("act-1", 10, 5);
    expect(spy).toHaveBeenCalledWith("act-1", 10, 5);
  });
});
