import { describe, expect, it } from "vitest";

import { ApiEndpoints, joinUrl } from "../src/internal/api-endpoints.js";

describe("ApiEndpoints", () => {
  it("returns the relative path for a known endpoint key", () => {
    const endpoints = new ApiEndpoints({ sales: "peek_backoffice_api-v1" });
    expect(endpoints.pathFor("sales")).toBe("peek_backoffice_api-v1");
  });

  it("supports an empty slug (endpoint sits directly on the base)", () => {
    const endpoints = new ApiEndpoints({ sales: "" });
    expect(endpoints.pathFor("sales")).toBe("");
  });
});

describe("joinUrl", () => {
  it("joins parts with single slashes", () => {
    expect(joinUrl("https://x.test/base", "slug", "a/b?c=1")).toBe(
      "https://x.test/base/slug/a/b?c=1",
    );
  });

  it("drops empty parts so an absent slug never yields a double slash", () => {
    expect(joinUrl("https://x.test/base", "", "path")).toBe(
      "https://x.test/base/path",
    );
  });
});
