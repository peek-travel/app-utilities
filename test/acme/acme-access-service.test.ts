import { describe, expect, it } from "vitest";

import { AcmeAccessService } from "../../src/acme-access-service.js";

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

const PUBLISHED = {
  id: "61f99bfe62bd1f467c39771f",
  name: "General Admission",
  type: "standard",
  admissionType: "standard",
  reviewState: "published",
  colorCategory: { backgroundColor: "#00695c", textColor: "#ffffff" },
};

describe("AcmeAccessService", () => {
  it.each(["installId", "jwtSecret", "issuer", "appId"] as const)(
    "throws when %s is empty",
    (field) => {
      expect(
        () => new AcmeAccessService({ ...baseConfig, [field]: "" }),
      ).toThrow(new RegExp(`"${field}" is required`));
    },
  );

  it("memoizes the product service", () => {
    const acme = new AcmeAccessService({ ...baseConfig, fetch: (async () => {}) as never });
    expect(acme.getProductService()).toBe(acme.getProductService());
  });

  it("delegates getAllActivities and hits the default app-registry base URL", async () => {
    const calls: string[] = [];
    const fetchFn = (async (url: string) => {
      calls.push(url);
      return textResponse({ list: [PUBLISHED] });
    }) as unknown as typeof fetch;

    const acme = new AcmeAccessService({ ...baseConfig, fetch: fetchFn });
    const activities = await acme.getAllActivities();

    expect(activities).toEqual([
      {
        productId: "61f99bfe62bd1f467c39771f",
        name: "General Admission",
        type: "standard",
        color: "#00695c",
        tickets: [],
      },
    ]);
    expect(calls[0]).toBe(
      "https://app-registry.peeklabs.com/installations-api/app-1/acme_backoffice_api-v1/v2/b2b/event/templates/names?pageSize=-1&page=1",
    );
  });

  it("honors a custom base URL", async () => {
    const calls: string[] = [];
    const fetchFn = (async (url: string) => {
      calls.push(url);
      return textResponse({ list: [] });
    }) as unknown as typeof fetch;

    const acme = new AcmeAccessService({
      ...baseConfig,
      baseUrl: "https://custom.test/base",
      fetch: fetchFn,
    });
    await acme.getAllActivities();

    expect(calls[0]).toBe(
      "https://custom.test/base/app-1/acme_backoffice_api-v1/v2/b2b/event/templates/names?pageSize=-1&page=1",
    );
  });
});
