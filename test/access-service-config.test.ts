import { describe, expect, it } from "vitest";

import { resolveBaseApiUrl } from "../src/access-service-config.js";

const PEEK_SLUG = "peek_backoffice_api-v1";

describe("resolveBaseApiUrl", () => {
  it("returns the URL unchanged when it carries no slug", () => {
    expect(
      resolveBaseApiUrl(
        "https://apps.peek.com/installations-api/google-things-to-do-integration",
        PEEK_SLUG,
        "PeekAccessService",
      ),
    ).toBe(
      "https://apps.peek.com/installations-api/google-things-to-do-integration",
    );
  });

  it("trims a trailing slash", () => {
    expect(
      resolveBaseApiUrl("https://x.test/demo-app/", PEEK_SLUG, "PeekAccessService"),
    ).toBe("https://x.test/demo-app");
  });

  it("strips this platform's slug (underscore) back to the base", () => {
    expect(
      resolveBaseApiUrl(
        "https://x.test/demo-app/peek_backoffice_api-v1",
        PEEK_SLUG,
        "PeekAccessService",
      ),
    ).toBe("https://x.test/demo-app");
  });

  it("strips a matching slug spelled with dashes", () => {
    expect(
      resolveBaseApiUrl(
        "https://x.test/demo-app/peek-backoffice-api-v1",
        PEEK_SLUG,
        "PeekAccessService",
      ),
    ).toBe("https://x.test/demo-app");
  });

  it("strips the slug even with a trailing slash", () => {
    expect(
      resolveBaseApiUrl(
        "https://x.test/demo-app/peek_backoffice_api-v1/",
        PEEK_SLUG,
        "PeekAccessService",
      ),
    ).toBe("https://x.test/demo-app");
  });

  it("throws when the URL carries a different platform's slug", () => {
    expect(() =>
      resolveBaseApiUrl(
        "https://x.test/demo-app/cng_backoffice_api-v1",
        PEEK_SLUG,
        "PeekAccessService",
      ),
    ).toThrow(/"cng".*"peek"|PeekAccessService/);
  });
});
