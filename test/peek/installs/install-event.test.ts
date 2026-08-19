import { describe, expect, it } from "vitest";

import { parseInstallEvent } from "../../../src/internal/peek/installs/install-event.js";
import type { InstallEvent } from "../../../src/models/peek/install.js";

const INSTALL_ID = "8c1f32b4-ab3c-4e20-82b7-844ea9e03bc9";
const ACCOUNT_ID = "acct_42";

function buildBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    status: "installed",
    install_id: INSTALL_ID,
    display_version: "1.2.3",
    account: {
      id: ACCOUNT_ID,
      name: "Sunset Kayak Tours",
      platform: "peek",
      is_test: true,
    },
    ...overrides,
  };
}

const FULL_EVENT: InstallEvent = {
  status: "installed",
  rawStatus: "installed",
  displayVersion: "1.2.3",
  identity: {
    installId: INSTALL_ID,
    accountId: ACCOUNT_ID,
    accountName: "Sunset Kayak Tours",
    platform: "peek",
    isTest: true,
  },
};

describe("parseInstallEvent", () => {
  it("maps a full install payload to a clean event", () => {
    expect(parseInstallEvent(buildBody())).toEqual(FULL_EVENT);
  });

  it("accepts the body as a JSON string", () => {
    expect(parseInstallEvent(JSON.stringify(buildBody()))).toEqual(FULL_EVENT);
  });

  it.each(["uninstalled", "update_installed"] as const)(
    "recognises the %s status",
    (status) => {
      const event = parseInstallEvent(buildBody({ status }));

      expect(event.status).toBe(status);
      expect(event.rawStatus).toBe(status);
    },
  );

  it("defaults is_test to false when the account omits it", () => {
    const body = buildBody({
      account: { id: ACCOUNT_ID, name: "Sunset Kayak Tours", platform: "peek" },
    });

    expect(parseInstallEvent(body).identity.isTest).toBe(false);
  });

  it.each(["cng", "acme"] as const)("recognises the %s platform", (platform) => {
    const body = buildBody({
      account: { id: ACCOUNT_ID, name: "Sunset Kayak Tours", platform },
    });

    expect(parseInstallEvent(body).identity.platform).toBe(platform);
  });

  describe("contract growth", () => {
    it("surfaces an unknown status as null and preserves the wire value", () => {
      const event = parseInstallEvent(buildBody({ status: "suspended" }));

      expect(event.status).toBeNull();
      expect(event.rawStatus).toBe("suspended");
    });

    it("does not coerce an unknown status into a known one", () => {
      const event = parseInstallEvent(buildBody({ status: "installed_v2" }));

      expect(event.status).not.toBe("installed");
      expect(event.identity.installId).toBe(INSTALL_ID);
    });

    it("surfaces an unknown platform as null rather than defaulting to peek", () => {
      const body = buildBody({
        account: { id: ACCOUNT_ID, name: "Sunset Kayak Tours", platform: "newbrand" },
      });

      expect(parseInstallEvent(body).identity.platform).toBeNull();
    });
  });

  describe("absent input", () => {
    it.each([
      ["undefined", undefined],
      ["null", null],
      ["a non-object", 42],
      ["unparseable JSON", "{not json"],
    ])("yields an empty event for %s", (_label, payload) => {
      expect(parseInstallEvent(payload)).toEqual({
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

    it("does not throw when the account block is missing entirely", () => {
      const event = parseInstallEvent({ status: "installed", install_id: INSTALL_ID });

      expect(event.status).toBe("installed");
      expect(event.identity.accountId).toBe("");
      expect(event.identity.accountName).toBe("");
    });

    it("does not throw when the account block is null", () => {
      const event = parseInstallEvent(buildBody({ account: null }));

      expect(event.identity.accountId).toBe("");
    });
  });

  it("returns an identity that round-trips through JSON unchanged", () => {
    const { identity } = parseInstallEvent(buildBody());

    expect(JSON.parse(JSON.stringify(identity))).toEqual(identity);
  });
});
