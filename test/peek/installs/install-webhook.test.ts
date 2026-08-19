import * as jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";

import {
  parseInstallWebhook,
  verifyInstallWebhook,
} from "../../../src/internal/peek/installs/install-webhook.js";

const SECRET = "install-webhook-secret";
const ISSUER = "app_registry_v2";
const AUDIENCE = "Joken";
const INSTALL_ID = "8c1f32b4-ab3c-4e20-82b7-844ea9e03bc9";

const SAMPLE_USER = {
  email: "admin@peek.com",
  id: "u_1",
  is_admin: true,
  locale: "en",
  name: "Admin User",
  platform: "peek",
};

function mintInstallToken(
  secret: string,
  overrides: Record<string, unknown> = {},
  signOptions: jwt.SignOptions = {},
): string {
  return jwt.sign(
    {
      display_version: "1.2.3",
      status: "installed",
      account: { id: "acct_42" },
      user: SAMPLE_USER,
      ...overrides,
    },
    secret,
    {
      subject: INSTALL_ID,
      issuer: ISSUER,
      audience: AUDIENCE,
      expiresIn: 60,
      ...signOptions,
    },
  );
}

const ACCOUNT_ID = "acct_42";

const BODY_INSTALL_ID = "cf34832d-16ea-4197-86fd-bf63e6917348";
const BODY_ACCOUNT_ID = "4b52e9d2-7411-4d47-9100-71bebb55d151";
const API_URL =
  "https://app-registry.sandbox.peeklabs.com/installations-api/demo";

const SAMPLE_MODIFIED_BY = {
  email: "oskar@peek.com",
  id: "u_body",
  is_admin: false,
  locale: "en",
  name: "Oskar",
  platform: "peek",
};

function buildBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  // The JSON body is the source of the event data — it carries every field.
  return {
    status: "installed",
    install_id: BODY_INSTALL_ID,
    display_version: "1.0.3",
    api: { url: API_URL },
    account: {
      id: BODY_ACCOUNT_ID,
      name: "Oskar's Boat Tours",
      timezone: "America/New_York",
      is_test: true,
      platform: "peek",
    },
    ...overrides,
  };
}

describe("parseInstallWebhook", () => {
  it("merges the verified token and the JSON body into one flat event", () => {
    const event = parseInstallWebhook(mintInstallToken(SECRET), buildBody(), SECRET);

    expect(event).toEqual({
      installId: BODY_INSTALL_ID,
      accountId: BODY_ACCOUNT_ID,
      accountName: "Oskar's Boat Tours",
      platform: "peek",
      isTest: true,
      timezone: "America/New_York",
      apiUrl: API_URL,
      status: "installed",
      rawStatus: "installed",
      displayVersion: "1.0.3",
      // No modified_by in the body, so the acting user falls back to the token.
      user: {
        email: "admin@peek.com",
        id: "u_1",
        isAdmin: true,
        locale: "en",
        name: "Admin User",
        platform: "peek",
      },
    });
  });

  it("takes installId/accountId/status/displayVersion from the body, not the token", () => {
    const token = mintInstallToken(
      SECRET,
      { status: "uninstalled", account: { id: "token-account-id" }, display_version: "9.9.9" },
      { subject: "token-install-id" },
    );

    const event = parseInstallWebhook(token, buildBody(), SECRET);

    // The token carried different values for all four; the body must win.
    expect(event.installId).toBe(BODY_INSTALL_ID);
    expect(event.accountId).toBe(BODY_ACCOUNT_ID);
    expect(event.status).toBe("installed");
    expect(event.displayVersion).toBe("1.0.3");
  });

  it("falls back to the token for installId/accountId/status/displayVersion the body omits", () => {
    const body = buildBody({
      install_id: undefined,
      display_version: undefined,
      status: undefined,
      account: { name: "Oskar's Boat Tours" },
    });

    const event = parseInstallWebhook(mintInstallToken(SECRET), body, SECRET);

    expect(event.installId).toBe(INSTALL_ID); // token sub
    expect(event.accountId).toBe(ACCOUNT_ID); // token account.id
    expect(event.status).toBe("installed"); // token status
    expect(event.displayVersion).toBe("1.2.3"); // token display_version
  });

  it("reads timezone and apiUrl from the body", () => {
    const event = parseInstallWebhook(mintInstallToken(SECRET), buildBody(), SECRET);

    expect(event.timezone).toBe("America/New_York");
    expect(event.apiUrl).toBe(API_URL);
  });

  it("defaults timezone and apiUrl to empty when the body omits them", () => {
    const body = buildBody({ api: undefined, account: { id: "x" } });

    const event = parseInstallWebhook(mintInstallToken(SECRET), body, SECRET);

    expect(event.timezone).toBe("");
    expect(event.apiUrl).toBe("");
  });

  it("prefers the body's modified_by for the acting user", () => {
    const body = buildBody({ modified_by: SAMPLE_MODIFIED_BY });

    const event = parseInstallWebhook(mintInstallToken(SECRET), body, SECRET);

    expect(event.user).toEqual({
      email: "oskar@peek.com",
      id: "u_body",
      isAdmin: false,
      locale: "en",
      name: "Oskar",
      platform: "peek",
    });
  });

  it("falls back to the token user when the body has no modified_by", () => {
    const event = parseInstallWebhook(mintInstallToken(SECRET), buildBody(), SECRET);

    expect(event.user?.id).toBe("u_1");
  });

  it("ignores a modified_by without an id and falls back to the token user", () => {
    const body = buildBody({ modified_by: { name: "No Id" } });

    const event = parseInstallWebhook(mintInstallToken(SECRET), body, SECRET);

    expect(event.user?.id).toBe("u_1");
  });

  it("accepts the body as a JSON string", () => {
    const event = parseInstallWebhook(
      mintInstallToken(SECRET),
      JSON.stringify(buildBody()),
      SECRET,
    );

    expect(event.accountName).toBe("Oskar's Boat Tours");
    expect(event.isTest).toBe(true);
  });

  it("tolerates a null user (system-initiated events)", () => {
    const token = mintInstallToken(SECRET, { user: null });
    const body = buildBody({ status: "uninstalled" });

    const event = parseInstallWebhook(token, body, SECRET);

    expect(event.user).toBeNull();
    expect(event.status).toBe("uninstalled");
  });

  it("defaults body-only fields when the body is missing entirely", () => {
    const event = parseInstallWebhook(mintInstallToken(SECRET), undefined, SECRET);

    expect(event).toMatchObject({
      installId: INSTALL_ID,
      accountId: ACCOUNT_ID,
      accountName: "",
      platform: null,
      isTest: false,
      timezone: "",
      apiUrl: "",
    });
  });

  it("defaults is_test to false when the account omits it", () => {
    const body = buildBody({ account: { id: "x", name: "Acme", platform: "peek" } });

    expect(parseInstallWebhook(mintInstallToken(SECRET), body, SECRET).isTest).toBe(false);
  });

  it.each(["cng", "acme"] as const)("recognises the %s platform", (platform) => {
    const body = buildBody({ account: { id: "x", name: "Acme", platform } });

    expect(parseInstallWebhook(mintInstallToken(SECRET), body, SECRET).platform).toBe(platform);
  });

  it("surfaces an unknown platform as null rather than defaulting", () => {
    const body = buildBody({ account: { id: "x", name: "Acme", platform: "newbrand" } });

    expect(parseInstallWebhook(mintInstallToken(SECRET), body, SECRET).platform).toBeNull();
  });

  it("surfaces an unknown status as null and preserves the wire value", () => {
    const body = buildBody({ status: "suspended" });

    const event = parseInstallWebhook(mintInstallToken(SECRET), body, SECRET);

    expect(event.status).toBeNull();
    expect(event.rawStatus).toBe("suspended");
  });

  it("returns an event that round-trips through JSON unchanged", () => {
    const event = parseInstallWebhook(mintInstallToken(SECRET), buildBody(), SECRET);

    expect(JSON.parse(JSON.stringify(event))).toEqual(event);
  });

  it("throws on an invalid token before touching the body", () => {
    expect(() => parseInstallWebhook(mintInstallToken("wrong-secret"), buildBody(), SECRET)).toThrow();
  });

  it("accepts the raw x-peek-auth header value with a Bearer prefix", () => {
    const token = mintInstallToken(SECRET);

    // The whole header value (scheme + token) verifies the same as the bare JWT;
    // a produced event (not a throw) proves the token verified.
    expect(parseInstallWebhook(`Bearer ${token}`, buildBody(), SECRET).installId).toBe(BODY_INSTALL_ID);
    expect(parseInstallWebhook(`bearer ${token}`, buildBody(), SECRET).installId).toBe(BODY_INSTALL_ID);
    expect(parseInstallWebhook(`  ${token}  `, buildBody(), SECRET).installId).toBe(BODY_INSTALL_ID);
  });

  it("defaults every field to empty when both the token and body omit them", () => {
    // Validly signed, but carries no sub/account/status/display_version/user.
    const token = jwt.sign({}, SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
      expiresIn: 60,
    });

    const event = parseInstallWebhook(token, undefined, SECRET);

    expect(event).toEqual({
      installId: "",
      accountId: "",
      accountName: "",
      platform: null,
      isTest: false,
      timezone: "",
      apiUrl: "",
      status: null,
      rawStatus: "",
      displayVersion: "",
      user: null,
    });
  });
});

describe("verifyInstallWebhook", () => {
  it("returns fully typed claims from a valid install token", () => {
    const claims = verifyInstallWebhook(mintInstallToken(SECRET), SECRET);

    expect(claims).toEqual({
      installId: INSTALL_ID,
      account: { id: "acct_42" },
      status: "installed",
      displayVersion: "1.2.3",
      user: {
        email: "admin@peek.com",
        id: "u_1",
        isAdmin: true,
        locale: "en",
        name: "Admin User",
        platform: "peek",
      },
    });
  });

  it("tolerates a null user (system-initiated events)", () => {
    const token = mintInstallToken(SECRET, { user: null, status: "uninstalled" });

    const claims = verifyInstallWebhook(token, SECRET);

    expect(claims.user).toBeNull();
    expect(claims.status).toBe("uninstalled");
    expect(claims.account.id).toBe("acct_42");
  });

  it("defaults absent optional claims to empty rather than throwing", () => {
    // A validly-signed token that omits account/status/display_version.
    const token = jwt.sign({ user: null }, SECRET, {
      subject: INSTALL_ID,
      issuer: ISSUER,
      audience: AUDIENCE,
      expiresIn: 60,
    });

    const claims = verifyInstallWebhook(token, SECRET);

    expect(claims).toEqual({
      installId: INSTALL_ID,
      account: { id: "" },
      status: "",
      displayVersion: "",
      user: null,
    });
  });

  it("throws on a token signed with a different secret", () => {
    const token = mintInstallToken("wrong-secret");

    expect(() => verifyInstallWebhook(token, SECRET)).toThrow();
  });

  it("throws on a token with a different issuer", () => {
    const token = mintInstallToken(SECRET, {}, { issuer: "wrong-issuer" });

    expect(() => verifyInstallWebhook(token, SECRET)).toThrow();
  });

  it("throws on a token with a different audience", () => {
    const token = mintInstallToken(SECRET, {}, { audience: "wrong-audience" });

    expect(() => verifyInstallWebhook(token, SECRET)).toThrow();
  });

  it("throws on an expired token", () => {
    const token = mintInstallToken(SECRET, {}, { expiresIn: -1 });

    expect(() => verifyInstallWebhook(token, SECRET)).toThrow();
  });

  it("throws on a malformed token string", () => {
    expect(() => verifyInstallWebhook("not.a.jwt", SECRET)).toThrow();
  });
});
