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
      return textResponse({ data: [{ id: 1000171, name: "Tour" }] });
    }) as unknown as typeof fetch;

    const cng = new CngAccessService({ ...baseConfig, fetch: fetchFn });
    const activities = await cng.getAllActivities();

    expect(activities).toEqual([
      { productId: "1000171", name: "Tour", type: "ACTIVITY", color: "", tickets: [] },
    ]);
    expect(calls[0]).toBe(
      "https://app-registry.peeklabs.com/installations-api/app-1/cng_backoffice_api-v1/api/v2/app-registry/products?active=1",
    );
  });

  it("honors a custom base URL", async () => {
    const calls: string[] = [];
    const fetchFn = (async (url: string) => {
      calls.push(url);
      return textResponse({ data: [] });
    }) as unknown as typeof fetch;

    const cng = new CngAccessService({
      ...baseConfig,
      baseUrl: "https://custom.test/base",
      fetch: fetchFn,
    });
    await cng.getAllActivities();

    expect(calls[0]).toBe(
      "https://custom.test/base/app-1/cng_backoffice_api-v1/api/v2/app-registry/products?active=1",
    );
  });

  it("treats apiUrl as the base and inserts the CNG slug before the REST path", async () => {
    const calls: string[] = [];
    const fetchFn = (async (url: string) => {
      calls.push(url);
      return textResponse({ data: [] });
    }) as unknown as typeof fetch;

    const cng = new CngAccessService({
      installId: "install-123",
      jwtSecret: "secret",
      issuer: "app-name",
      apiUrl: "https://app-registry.sandbox.peeklabs.com/installations-api/demo-app",
      fetch: fetchFn,
    });
    await cng.getAllActivities();

    expect(calls[0]).toBe(
      "https://app-registry.sandbox.peeklabs.com/installations-api/demo-app/cng_backoffice_api-v1/api/v2/app-registry/products?active=1",
    );
  });

  it("strips an already-present CNG slug (dash or underscore) back to the base", async () => {
    const calls: string[] = [];
    const fetchFn = (async (url: string) => {
      calls.push(url);
      return textResponse({ data: [] });
    }) as unknown as typeof fetch;

    const cng = new CngAccessService({
      installId: "install-123",
      jwtSecret: "secret",
      issuer: "app-name",
      apiUrl: "https://x.test/demo-app/cng-backoffice-api-v1",
      fetch: fetchFn,
    });
    await cng.getAllActivities();

    expect(calls[0]).toBe(
      "https://x.test/demo-app/cng_backoffice_api-v1/api/v2/app-registry/products?active=1",
    );
  });

  it("throws when apiUrl carries a different platform's slug", () => {
    expect(
      () =>
        new CngAccessService({
          installId: "install-123",
          jwtSecret: "secret",
          issuer: "app-name",
          apiUrl: "https://x.test/demo-app/peek_backoffice_api-v1",
        }),
    ).toThrow(/peek.*backoffice.*cng|cng.*peek/i);
  });

  it("needs no appId when apiUrl is set", () => {
    expect(
      () =>
        new CngAccessService({
          installId: "install-123",
          jwtSecret: "secret",
          issuer: "app-name",
          apiUrl: "https://x.test/base",
        }),
    ).not.toThrow();
  });
});
