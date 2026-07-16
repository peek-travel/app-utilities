import { describe, expect, it, vi } from "vitest";

import {
  AcmeApiError,
  AdminAccountRequiredError,
  RateLimitError,
} from "../../../src/errors.js";
import {
  RestClient,
  type RestClientOptions,
} from "../../../src/internal/acme/rest-client.js";
import { AcmeProductService } from "../../../src/internal/acme/products/product-service.js";
import { noopLogger, type Logger } from "../../../src/logger.js";

function textResponse(body: unknown, status = 200): Response {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => text,
  } as unknown as Response;
}

interface RecordedCall {
  url: string;
  init: RequestInit;
}

function makeFetch(handler: (url: string) => Response): {
  fetchFn: typeof fetch;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return handler(url);
  }) as unknown as typeof fetch;
  return { fetchFn, calls };
}

function buildClient(
  fetchFn: typeof fetch,
  overrides: Partial<RestClientOptions> = {},
): RestClient {
  return new RestClient({
    baseUrl: "https://gw.test/api",
    appId: "app-1",
    extendableSlug: "acme_backoffice_api-v1",
    getToken: () => "tok-123",
    retryDelaysMs: [],
    logger: noopLogger,
    fetchFn,
    ...overrides,
  });
}

const TEMPLATE = {
  id: "61f99bfe62bd1f467c39771f",
  name: "General Admission",
  type: "standard",
  admissionType: "standard",
  reviewState: "published",
  colorCategory: { backgroundColor: "#00695c", textColor: "#ffffff" },
};

const EXPECTED = {
  productId: "61f99bfe62bd1f467c39771f",
  name: "General Admission",
  type: "standard",
  color: "#00695c",
  tickets: [],
};

describe("AcmeProductService.getAllActivities", () => {
  it("maps a { list: [...] } envelope and sets auth headers + URL", async () => {
    const { fetchFn, calls } = makeFetch(() => textResponse({ list: [TEMPLATE] }));
    const service = new AcmeProductService(buildClient(fetchFn));

    await expect(service.getAllActivities()).resolves.toEqual([EXPECTED]);

    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe(
      "https://gw.test/api/app-1/acme_backoffice_api-v1/v2/b2b/event/templates/names?pageSize=-1&page=1",
    );
    expect(calls[0]!.init.method).toBe("GET");
    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers["X-Peek-Auth"]).toBe("Bearer tok-123");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["pk-api-key"]).toBeUndefined();
  });

  it("tolerates a bare array response", async () => {
    const { fetchFn } = makeFetch(() => textResponse([TEMPLATE]));
    const service = new AcmeProductService(buildClient(fetchFn));
    await expect(service.getAllActivities()).resolves.toEqual([EXPECTED]);
  });

  it("returns an empty list when the payload has no list", async () => {
    const { fetchFn } = makeFetch(() => textResponse({}));
    const service = new AcmeProductService(buildClient(fetchFn));
    await expect(service.getAllActivities()).resolves.toEqual([]);
  });

  it("retries on HTTP 429 then succeeds", async () => {
    let n = 0;
    const { fetchFn } = makeFetch(() =>
      (n += 1) === 1 ? textResponse({}, 429) : textResponse({ list: [] }),
    );
    const service = new AcmeProductService(buildClient(fetchFn, { retryDelaysMs: [5] }));

    await expect(service.getAllActivities()).resolves.toEqual([]);
    expect(n).toBe(2);
  });

  it("throws RateLimitError when retries are exhausted", async () => {
    const { fetchFn } = makeFetch(() => textResponse({}, 429));
    const service = new AcmeProductService(buildClient(fetchFn, { retryDelaysMs: [1] }));
    await expect(service.getAllActivities()).rejects.toBeInstanceOf(RateLimitError);
  });

  it("maps HTTP 418 to AdminAccountRequiredError and logs", async () => {
    const logger: Logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const { fetchFn } = makeFetch(() => textResponse({}, 418));
    const service = new AcmeProductService(buildClient(fetchFn, { logger }));

    await expect(service.getAllActivities()).rejects.toBeInstanceOf(
      AdminAccountRequiredError,
    );
    expect(logger.info).toHaveBeenCalledWith(
      "Making ACME request",
      expect.objectContaining({ path: "v2/b2b/event/templates/names?pageSize=-1&page=1" }),
    );
    expect(logger.warn).toHaveBeenCalled();
  });

  it("throws AcmeApiError carrying status and parsed body for other non-2xx", async () => {
    const { fetchFn } = makeFetch(() => textResponse({ error: "boom" }, 500));
    const service = new AcmeProductService(buildClient(fetchFn));

    const err = await service.getAllActivities().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AcmeApiError);
    expect((err as AcmeApiError).statusCode).toBe(500);
    expect((err as AcmeApiError).body).toEqual({ error: "boom" });
  });

  it("falls back to raw text when the body is not JSON", async () => {
    const { fetchFn } = makeFetch(() => textResponse("<html>502</html>", 502));
    const service = new AcmeProductService(buildClient(fetchFn));

    const err = await service.getAllActivities().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AcmeApiError);
    expect((err as AcmeApiError).body).toBe("<html>502</html>");
  });
});
