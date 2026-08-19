import { describe, expect, it } from "vitest";

import { createAccessServiceForInstall } from "../src/access-service-factory.js";
import { PeekAccessService } from "../src/peek-access-service.js";
import { CngAccessService } from "../src/cng-access-service.js";
import { AcmeAccessService } from "../src/acme-access-service.js";

const CREDS = { jwtSecret: "secret", issuer: "app-name" };
const API_URL = "https://app-registry.sandbox.peeklabs.com/installations-api/demo-app";

function jsonResponse(body: unknown): Response {
  return {
    status: 200,
    ok: true,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

describe("createAccessServiceForInstall", () => {
  it.each([
    ["peek", PeekAccessService],
    ["cng", CngAccessService],
    ["acme", AcmeAccessService],
  ] as const)("routes platform %s to its access service", (platform, ctor) => {
    const service = createAccessServiceForInstall(
      { platform, apiUrl: API_URL, installId: "install-1" },
      CREDS,
    );
    expect(service).toBeInstanceOf(ctor);
  });

  it("wires the install's apiUrl as the service endpoint", async () => {
    const calls: string[] = [];
    const fetchFn = (async (url: string) => {
      calls.push(url);
      return jsonResponse({ data: { activities: [] } });
    }) as unknown as typeof fetch;

    const service = createAccessServiceForInstall(
      { platform: "peek", apiUrl: API_URL, installId: "install-1" },
      { ...CREDS, fetch: fetchFn },
    );
    await (service as PeekAccessService).getProductService().getAllProducts();

    // Peek POSTs to the apiUrl unmodified.
    expect(calls[0]).toBe(API_URL);
  });

  it.each([null, "newbrand"] as const)(
    "throws on an unknown or missing platform (%s)",
    (platform) => {
      expect(() =>
        createAccessServiceForInstall(
          { platform: platform as never, apiUrl: API_URL, installId: "install-9" },
          CREDS,
        ),
      ).toThrow(/unknown or missing platform/);
    },
  );
});
