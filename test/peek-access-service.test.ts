import { afterEach, describe, expect, it, vi } from "vitest";

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
    const { gatewayKey: _, ...withoutKey } = REQUIRED_CONFIG;
    expect(
      () => new PeekAccessService({ ...withoutKey, mode: "v2" }),
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
