import { describe, expect, it } from "vitest";

import { CngAccessService } from "../../src/cng-access-service.js";

function textResponse(body: unknown, status = 200): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

const baseConfig = {
  installId: "install-123",
  jwtSecret: "secret",
  issuer: "app-name",
  appId: "app-1",
};

describe("CngAccessService", () => {
  it.each(["installId", "jwtSecret", "issuer", "appId"] as const)(
    "throws when %s is empty",
    (field) => {
      expect(
        () => new CngAccessService({ ...baseConfig, [field]: "" }),
      ).toThrow(new RegExp(`"${field}" is required`));
    },
  );

  it("memoizes the product service", () => {
    const cng = new CngAccessService({ ...baseConfig, fetch: (async () => {}) as never });
    expect(cng.getProductService()).toBe(cng.getProductService());
  });

  it("delegates getAllActivities and hits the default app-registry base URL", async () => {
    const calls: string[] = [];
    const fetchFn = (async (url: string) => {
      calls.push(url);
      return textResponse({ products: [{ id: "p1", name: "Tour" }] });
    }) as unknown as typeof fetch;

    const cng = new CngAccessService({ ...baseConfig, fetch: fetchFn });
    const activities = await cng.getAllActivities();

    expect(activities).toEqual([
      { productId: "p1", name: "Tour", type: "ACTIVITY", color: "", tickets: [] },
    ]);
    expect(calls[0]).toBe(
      "https://app-registry.peeklabs.com/installations-api/app-1/cng_backoffice_api-v1/api/v2/commerce-config/products",
    );
  });

  it("honors a custom base URL", async () => {
    const calls: string[] = [];
    const fetchFn = (async (url: string) => {
      calls.push(url);
      return textResponse({ products: [] });
    }) as unknown as typeof fetch;

    const cng = new CngAccessService({
      ...baseConfig,
      baseUrl: "https://custom.test/base",
      fetch: fetchFn,
    });
    await cng.getAllActivities();

    expect(calls[0]).toBe(
      "https://custom.test/base/app-1/cng_backoffice_api-v1/api/v2/commerce-config/products",
    );
  });
});
