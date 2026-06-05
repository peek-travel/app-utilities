/**
 * Mints and caches the short-lived JWT used to authenticate with the Peek
 * gateway. The token is signed on demand and reused until it nears expiry.
 */
import * as jwt from "jsonwebtoken";

export interface TokenManagerOptions {
  /** HMAC secret used to sign the JWT. */
  secret: string;
  /** JWT issuer (the app name). */
  issuer: string;
  /** JWT subject (the install ID). */
  installId: string;
  /** Token lifetime in seconds. */
  ttlSeconds: number;
  /** Re-mint the cached token this many seconds before its expiry. */
  leewaySeconds: number;
}

export class TokenManager {
  private cached?: { token: string; expiresAtMs: number };

  constructor(private readonly options: TokenManagerOptions) {}

  /**
   * Returns a valid bearer token, reusing the cached one until it is within
   * `leewaySeconds` of expiring, at which point a fresh token is minted.
   */
  getToken(): string {
    const now = Date.now();
    if (this.cached && now < this.cached.expiresAtMs) {
      return this.cached.token;
    }

    const { secret, issuer, installId, ttlSeconds, leewaySeconds } = this.options;
    const token = jwt.sign({}, secret, {
      expiresIn: ttlSeconds,
      issuer,
      subject: installId,
    });

    this.cached = {
      token,
      expiresAtMs: now + (ttlSeconds - leewaySeconds) * 1000,
    };
    return token;
  }
}
