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

function buildBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    // Fields the token also carries — deliberately different here to prove the
    // verified token wins for them, not the unauthenticated body.
    status: "uninstalled",
    install_id: "body-install-id",
    display_version: "9.9.9",
    account: {
      id: "body-account-id",
      name: "Sunset Kayak Tours",
      platform: "peek",
      is_test: true,
    },
    ...overrides,
  };
}

describe("parseInstallWebhook", () => {
  it("merges the verified token and the JSON body into one flat event", () => {
    const event = parseInstallWebhook(mintInstallToken(SECRET), buildBody(), SECRET);

    expect(event).toEqual({
      installId: INSTALL_ID,
      accountId: ACCOUNT_ID,
      accountName: "Sunset Kayak Tours",
      platform: "peek",
      isTest: true,
      status: "installed",
      rawStatus: "installed",
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

  it("takes installId/accountId/status/displayVersion from the token, not the body", () => {
    const event = parseInstallWebhook(mintInstallToken(SECRET), buildBody(), SECRET);

    // The body carried different values for all four; the token must win.
    expect(event.installId).toBe(INSTALL_ID);
    expect(event.accountId).toBe(ACCOUNT_ID);
    expect(event.status).toBe("installed");
    expect(event.displayVersion).toBe("1.2.3");
  });

  it("accepts the body as a JSON string", () => {
    const event = parseInstallWebhook(
      mintInstallToken(SECRET),
      JSON.stringify(buildBody()),
      SECRET,
    );

    expect(event.accountName).toBe("Sunset Kayak Tours");
    expect(event.isTest).toBe(true);
  });

  it("tolerates a null user (system-initiated events)", () => {
    const token = mintInstallToken(SECRET, { user: null, status: "uninstalled" });

    const event = parseInstallWebhook(token, buildBody(), SECRET);

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
    const token = mintInstallToken(SECRET, { status: "suspended" });

    const event = parseInstallWebhook(token, buildBody(), SECRET);

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

    // The whole header value (scheme + token) verifies the same as the bare JWT.
    expect(parseInstallWebhook(`Bearer ${token}`, buildBody(), SECRET).installId).toBe(INSTALL_ID);
    expect(parseInstallWebhook(`bearer ${token}`, buildBody(), SECRET).installId).toBe(INSTALL_ID);
    expect(parseInstallWebhook(`  ${token}  `, buildBody(), SECRET).installId).toBe(INSTALL_ID);
  });

  it("defaults token-sourced fields to empty when a valid token omits them", () => {
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
