import { describe, expect, it } from "vitest";

import {
  extractInstallWebhookBody,
  toInstallStatus,
  toPeekPlatform,
} from "../../../src/internal/peek/installs/install-converter.js";

describe("toInstallStatus", () => {
  it.each(["installed", "uninstalled", "update_installed"] as const)(
    "narrows %s to the union",
    (status) => {
      expect(toInstallStatus(status)).toBe(status);
    },
  );

  it.each(["", "suspended", "INSTALLED"])("returns null for %o", (raw) => {
    expect(toInstallStatus(raw)).toBeNull();
  });
});

describe("toPeekPlatform", () => {
  it.each(["peek", "cng", "acme"] as const)("narrows %s to the union", (platform) => {
    expect(toPeekPlatform(platform)).toBe(platform);
  });

  it.each(["", "newbrand", "Peek"])("returns null for %o", (raw) => {
    expect(toPeekPlatform(raw)).toBeNull();
  });
});

describe("extractInstallWebhookBody", () => {
  it("returns an object body unchanged", () => {
    const body = { account: { id: "acct_42", name: "Sunset Kayak Tours" } };

    expect(extractInstallWebhookBody(body)).toBe(body);
  });

  it("parses a JSON string body", () => {
    const body = { account: { id: "acct_42", is_test: true } };

    expect(extractInstallWebhookBody(JSON.stringify(body))).toEqual(body);
  });

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["a non-object", 42],
    ["unparseable JSON", "{not json"],
  ])("returns an empty body for %s", (_label, payload) => {
    expect(extractInstallWebhookBody(payload)).toEqual({});
  });
});
