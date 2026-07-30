import * as jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";

import { verifyInstallWebhook } from "../../../src/internal/peek/installs/install-webhook.js";

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
