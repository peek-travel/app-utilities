import { describe, expect, it } from "vitest";

import { resolveApiUrl } from "../src/access-service-config.js";

const PEEK_SLUG = "peek_backoffice_api-v1";

describe("resolveApiUrl", () => {
  it("appends the slug when the URL has no platform extension", () => {
    expect(
      resolveApiUrl(
        "https://apps.peek.com/installations-api/google-things-to-do-integration",
        PEEK_SLUG,
        "PeekAccessService",
      ),
    ).toBe(
      "https://apps.peek.com/installations-api/google-things-to-do-integration/peek_backoffice_api-v1",
    );
  });

  it("trims a trailing slash before appending the slug", () => {
    expect(
      resolveApiUrl("https://x.test/demo-app/", PEEK_SLUG, "PeekAccessService"),
    ).toBe("https://x.test/demo-app/peek_backoffice_api-v1");
  });

  it("accepts the URL unchanged when its extension already matches (underscore)", () => {
    const url = "https://x.test/demo-app/peek_backoffice_api-v1";
    expect(resolveApiUrl(url, PEEK_SLUG, "PeekAccessService")).toBe(url);
  });

  it("accepts a matching extension spelled with dashes", () => {
    const url = "https://x.test/demo-app/peek-backoffice-api-v1";
    expect(resolveApiUrl(url, PEEK_SLUG, "PeekAccessService")).toBe(url);
  });

  it("trims a trailing slash on an already-extended URL", () => {
    expect(
      resolveApiUrl(
        "https://x.test/demo-app/peek_backoffice_api-v1/",
        PEEK_SLUG,
        "PeekAccessService",
      ),
    ).toBe("https://x.test/demo-app/peek_backoffice_api-v1");
  });

  it("throws when the URL carries a different platform's extension", () => {
    expect(() =>
      resolveApiUrl(
        "https://x.test/demo-app/cng_backoffice_api-v1",
        PEEK_SLUG,
        "PeekAccessService",
      ),
    ).toThrow(/"cng".*"peek"|PeekAccessService/);
  });
});
