import * as jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TokenManager } from "../src/internal/token-manager.js";

const SECRET = "test-secret";

const baseOptions = {
  secret: SECRET,
  issuer: "Peek Test App",
  installId: "install-123",
  ttlSeconds: 3600,
  leewaySeconds: 60,
};

describe("TokenManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mints a verifiable JWT with the configured issuer and subject", () => {
    const token = new TokenManager(baseOptions).getToken();
    const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload;

    expect(decoded.iss).toBe("Peek Test App");
    expect(decoded.sub).toBe("install-123");
    expect(decoded.exp).toBe((decoded.iat ?? 0) + 3600);
  });

  it("reuses the cached token while it is still fresh", () => {
    const manager = new TokenManager(baseOptions);
    const first = manager.getToken();

    // Advance well within the (ttl - leeway) window.
    vi.advanceTimersByTime(1000 * 60 * 30);
    expect(manager.getToken()).toBe(first);
  });

  it("re-mints once the token is within the leeway of expiry", () => {
    const manager = new TokenManager(baseOptions);
    const first = manager.getToken();

    // Past (ttl - leeway) = 3540s; advance beyond it.
    vi.advanceTimersByTime((3600 - 60 + 1) * 1000);
    const second = manager.getToken();

    expect(second).not.toBe(first);
    expect((jwt.verify(second, SECRET) as jwt.JwtPayload).sub).toBe("install-123");
  });
});
