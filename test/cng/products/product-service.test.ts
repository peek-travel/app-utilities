import { describe, expect, it, vi } from "vitest";

import {
  AdminAccountRequiredError,
  CngApiError,
  CngPermissionError,
  RateLimitError,
} from "../../../src/errors.js";
import {
  RestClient,
  type RestClientOptions,
} from "../../../src/internal/cng/rest-client.js";
import { CngProductService } from "../../../src/internal/cng/products/product-service.js";
import { noopLogger, type Logger } from "../../../src/logger.js";
import { SDK_HEADER_VALUE } from "../../../src/internal/sdk-headers.js";

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
    extendableSlug: "cng_backoffice_api-v1",
    getToken: () => "tok-123",
    retryDelaysMs: [],
    logger: noopLogger,
    fetchFn,
    ...overrides,
  });
}

const PRODUCT = {
  id: 1000171,
  name: "10 students + Complimentary chaperone",
  slug: "10-students-complimentary-chaperone",
  status: "ACTIVE",
  access_control_color_hex: "#1A2B3C",
  custom_access_control_color: true,
};

const EXPECTED = {
  productId: "1000171",
  name: "10 students + Complimentary chaperone",
  type: "ACTIVITY",
  color: "#1A2B3C",
  tickets: [],
};

describe("CngProductService.getAllActivities", () => {
  it("maps a { data: [...] } envelope and sets auth headers + URL", async () => {
    const { fetchFn, calls } = makeFetch(() => textResponse({ data: [PRODUCT] }));
    const service = new CngProductService(buildClient(fetchFn));

    await expect(service.getAllActivities()).resolves.toEqual([EXPECTED]);

    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe(
      "https://gw.test/api/app-1/cng_backoffice_api-v1/api/v2/app-registry/products?active=1",
    );
    expect(calls[0]!.init.method).toBe("GET");
    const headers = calls[0]!.init.headers as Record<string, string>;
    expect(headers["X-Peek-Auth"]).toBe("Bearer tok-123");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["pk-api-key"]).toBeUndefined();
    expect(headers["x-peek-sdk"]).toBe(SDK_HEADER_VALUE);
  });

  it("returns an empty list when the payload has no data array", async () => {
    const { fetchFn } = makeFetch(() => textResponse({}));
    const service = new CngProductService(buildClient(fetchFn));
    await expect(service.getAllActivities()).resolves.toEqual([]);
  });

  it("retries on HTTP 429 then succeeds", async () => {
    let n = 0;
    const { fetchFn } = makeFetch(() =>
      (n += 1) === 1 ? textResponse({}, 429) : textResponse({ data: [] }),
    );
    const service = new CngProductService(buildClient(fetchFn, { retryDelaysMs: [5] }));

    await expect(service.getAllActivities()).resolves.toEqual([]);
    expect(n).toBe(2);
  });

  it("throws RateLimitError when retries are exhausted", async () => {
    const { fetchFn } = makeFetch(() => textResponse({}, 429));
    const service = new CngProductService(buildClient(fetchFn, { retryDelaysMs: [1] }));
    await expect(service.getAllActivities()).rejects.toBeInstanceOf(RateLimitError);
  });

  it("maps HTTP 418 to AdminAccountRequiredError and logs", async () => {
    const logger: Logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const { fetchFn } = makeFetch(() => textResponse({}, 418));
    const service = new CngProductService(buildClient(fetchFn, { logger }));

    await expect(service.getAllActivities()).rejects.toBeInstanceOf(
      AdminAccountRequiredError,
    );
    expect(logger.info).toHaveBeenCalledWith(
      "Making CNG request",
      expect.objectContaining({ path: "api/v2/app-registry/products?active=1" }),
    );
    expect(logger.warn).toHaveBeenCalled();
  });

  it("throws CngPermissionError naming the missing permission on HTTP 403", async () => {
    const logger: Logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const body = {
      errors: {
        permission: ["The app does not have the required permission: products:read"],
      },
      message: "Forbidden",
    };
    const { fetchFn } = makeFetch(() => textResponse(body, 403));
    const service = new CngProductService(buildClient(fetchFn, { logger }));

    const err = await service.getAllActivities().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(CngPermissionError);
    expect(err).not.toBeInstanceOf(CngApiError);
    const permissionError = err as CngPermissionError;
    expect(permissionError.statusCode).toBe(403);
    expect(permissionError.permissions).toEqual(["products:read"]);
    expect(permissionError.body).toEqual(body);
    expect(permissionError.message).toBe(
      "CNG request forbidden: the app is missing the required permission: products:read",
    );
  });

  it("logs a 403 at warn with the permissions and never at error", async () => {
    const logger: Logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const { fetchFn } = makeFetch(() =>
      textResponse(
        { errors: { permission: ["needs: products:read"] }, message: "Forbidden" },
        403,
      ),
    );
    const service = new CngProductService(buildClient(fetchFn, { logger }));

    await expect(service.getAllActivities()).rejects.toBeInstanceOf(CngPermissionError);
    expect(logger.warn).toHaveBeenCalledWith(
      "Missing permission for api/v2/app-registry/products?active=1 (HTTP 403)",
      expect.objectContaining({ permissions: ["products:read"] }),
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("pluralizes the message when several permissions are named", async () => {
    const { fetchFn } = makeFetch(() =>
      textResponse(
        {
          errors: {
            permission: [
              "The app does not have the required permission: products:read",
              "bookings:read",
            ],
          },
        },
        403,
      ),
    );
    const service = new CngProductService(buildClient(fetchFn));

    const err = (await service
      .getAllActivities()
      .catch((e: unknown) => e)) as CngPermissionError;
    expect(err.permissions).toEqual(["products:read", "bookings:read"]);
    expect(err.message).toBe(
      "CNG request forbidden: the app is missing the required permissions: products:read, bookings:read",
    );
  });

  it.each([
    ["a non-object body", "Forbidden"],
    ["a null body", null],
    ["no errors block", { message: "Forbidden" }],
    ["a non-array permission", { errors: { permission: "products:read" } }],
    ["non-string permission entries", { errors: { permission: [42, null] } }],
    ["an empty permission string", { errors: { permission: ["  "] } }],
  ])("falls back to an unnamed-permission message for %s", async (_label, body) => {
    const { fetchFn } = makeFetch(() => textResponse(body, 403));
    const service = new CngProductService(buildClient(fetchFn));

    const err = (await service
      .getAllActivities()
      .catch((e: unknown) => e)) as CngPermissionError;
    expect(err).toBeInstanceOf(CngPermissionError);
    expect(err.permissions).toEqual([]);
    expect(err.message).toBe(
      "CNG request forbidden: the app is missing a required permission",
    );
  });

  it("throws CngApiError carrying status and parsed body for other non-2xx", async () => {
    const { fetchFn } = makeFetch(() => textResponse({ error: "boom" }, 500));
    const service = new CngProductService(buildClient(fetchFn));

    const err = await service.getAllActivities().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(CngApiError);
    expect((err as CngApiError).statusCode).toBe(500);
    expect((err as CngApiError).body).toEqual({ error: "boom" });
  });

  it("falls back to raw text when the body is not JSON", async () => {
    const { fetchFn } = makeFetch(() => textResponse("<html>502</html>", 502));
    const service = new CngProductService(buildClient(fetchFn));

    const err = await service.getAllActivities().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(CngApiError);
    expect((err as CngApiError).body).toBe("<html>502</html>");
  });
});
