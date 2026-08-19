import { describe, expect, it } from "vitest";

import {
  fromInstallEventNode,
  fromInstallIdentityNode,
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

describe("fromInstallIdentityNode", () => {
  it.each([
    ["null", null],
    ["undefined", undefined],
  ])("maps %s to an empty identity", (_label, node) => {
    expect(fromInstallIdentityNode(node)).toEqual({
      installId: "",
      accountId: "",
      accountName: "",
      platform: null,
      isTest: false,
    });
  });
});

describe("fromInstallEventNode", () => {
  it.each([
    ["null", null],
    ["undefined", undefined],
  ])("maps %s to an empty event", (_label, node) => {
    expect(fromInstallEventNode(node)).toEqual({
      status: null,
      rawStatus: "",
      displayVersion: "",
      identity: {
        installId: "",
        accountId: "",
        accountName: "",
        platform: null,
        isTest: false,
      },
    });
  });
});
