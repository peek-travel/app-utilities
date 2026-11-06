import { afterEach, describe, expect, it, vi } from "vitest";

import {
  EXTRA_HOSTS_ENV_VAR,
  readExtraHosts,
  withApiHostCheck,
} from "../src/internal/api-host.js";
import { resolveFetch } from "../src/access-service-config.js";
import { ApiHostNotAllowedError } from "../src/errors.js";
import type { Logger } from "../src/logger.js";
import { AcmeAccessService } from "../src/acme-access-service.js";
import { CngAccessService } from "../src/cng-access-service.js";
import { PeekAccessService } from "../src/peek-access-service.js";

const OK_BODY = JSON.stringify({ data: { activities: [] } });

function makeFetch() {
  const fetchFn = vi.fn(async () => new Response(OK_BODY, { status: 200 }));
  return fetchFn as unknown as typeof fetch & typeof fetchFn;
}

function makeLogger(): Logger & { error: ReturnType<typeof vi.fn> } {
  return { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("readExtraHosts", () => {
  it("returns no hosts when the variable is unset", () => {
    vi.stubEnv(EXTRA_HOSTS_ENV_VAR, undefined);
    expect(readExtraHosts()).toEqual([]);
  });

  it("splits, trims, lowercases and drops empty entries", () => {
    vi.stubEnv(EXTRA_HOSTS_ENV_VAR, " Dev.Example.com , ,local.example.com:8443,");
    expect(readExtraHosts()).toEqual(["dev.example.com", "local.example.com:8443"]);
  });

  it("returns no hosts when there is no process global", () => {
    vi.stubGlobal("process", undefined);
    expect(readExtraHosts()).toEqual([]);
  });
});

describe("withApiHostCheck", () => {
  async function expectRejected(url: string, host: string | null, protocol: string | null) {
    const fetchFn = makeFetch();
    const logger = makeLogger();
    const checked = withApiHostCheck(fetchFn, logger);

    const error = await checked(url, { method: "POST" }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiHostNotAllowedError);
    expect((error as ApiHostNotAllowedError).host).toBe(host);
    expect((error as ApiHostNotAllowedError).protocol).toBe(protocol);
    expect(fetchFn).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(expect.any(String), { host, protocol });
  }

  it.each([
    "https://apps.peek.com/installations-api/demo",
    "https://stage.apps.peek.com/installations-api/demo",
    "https://APPS.Peek.COM/installations-api/demo",
    "https://apps.peek.com:443/installations-api/demo",
  ])("sends the request to a built-in host: %s", async (url) => {
    const fetchFn = makeFetch();
    const init = { method: "POST" };

    const response = await withApiHostCheck(fetchFn, makeLogger())(url, init);

    expect(response.status).toBe(200);
    expect(fetchFn).toHaveBeenCalledWith(url, init);
  });

  it("accepts URL and Request inputs", async () => {
    const fetchFn = makeFetch();
    const checked = withApiHostCheck(fetchFn, makeLogger());

    await checked(new URL("https://apps.peek.com/a"));
    await checked(new Request("https://stage.apps.peek.com/b"));

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it("sends the request to a host from the environment variable", async () => {
    vi.stubEnv(EXTRA_HOSTS_ENV_VAR, "other.example.com, Dev.Example.com");
    const fetchFn = makeFetch();

    await withApiHostCheck(fetchFn, makeLogger())("https://dev.example.com/api");

    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it("reads the environment variable on each call", async () => {
    const fetchFn = makeFetch();
    const checked = withApiHostCheck(fetchFn, makeLogger());
    const url = "https://dev.example.com/api";

    await expect(checked(url)).rejects.toBeInstanceOf(ApiHostNotAllowedError);
    vi.stubEnv(EXTRA_HOSTS_ENV_VAR, "dev.example.com");
    await checked(url);

    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it("rejects an unknown host", async () => {
    await expectRejected("https://example.com/installations-api/demo", "example.com", "https:");
  });

  it("rejects http, also for a built-in host", async () => {
    await expectRejected("http://apps.peek.com/installations-api/demo", "apps.peek.com", "http:");
  });

  it("rejects http for a host from the environment variable", async () => {
    vi.stubEnv(EXTRA_HOSTS_ENV_VAR, "dev.example.com");
    await expectRejected("http://dev.example.com/api", "dev.example.com", "http:");
  });

  it.each([
    ["https://evil.apps.peek.com/x", "evil.apps.peek.com"],
    ["https://apps.peek.com.example.com/x", "apps.peek.com.example.com"],
    ["https://appspeek.com/x", "appspeek.com"],
    ["https://apps-peek.com/x", "apps-peek.com"],
    ["https://apps.peek.com.:443/x", "apps.peek.com."],
    ["https://apps.peek.com@example.com/x", "example.com"],
    ["https://apps.peek.com:8443/x", "apps.peek.com:8443"],
  ])("rejects a look-alike host: %s", async (url, host) => {
    await expectRejected(url, host, "https:");
  });

  it("rejects a subdomain of a host from the environment variable", async () => {
    vi.stubEnv(EXTRA_HOSTS_ENV_VAR, "dev.example.com");
    await expectRejected("https://a.dev.example.com/api", "a.dev.example.com", "https:");
  });

  it("rejects a URL it cannot parse", async () => {
    await expectRejected("not a url", null, null);
  });

  it("puts the host in the error message", () => {
    expect(new ApiHostNotAllowedError("example.com", "https:").message).toContain(
      "example.com",
    );
    expect(new ApiHostNotAllowedError(null, null).message).toContain("invalid URL");
  });
});

describe("resolveFetch", () => {
  const BASE = { installId: "i", jwtSecret: "s", issuer: "app" };

  it("returns the configured fetch unchanged without an apiUrl", () => {
    const fetchFn = makeFetch();
    expect(resolveFetch({ ...BASE, fetch: fetchFn }, makeLogger())).toBe(fetchFn);
  });

  it("falls back to the global fetch", () => {
    const fetchFn = makeFetch();
    vi.stubGlobal("fetch", fetchFn);
    expect(resolveFetch(BASE, makeLogger())).toBe(fetchFn);
  });

  it("wraps the fetch with the host check when there is an apiUrl", () => {
    const fetchFn = makeFetch();
    const resolved = resolveFetch(
      { ...BASE, apiUrl: "https://apps.peek.com/installations-api/demo", fetch: fetchFn },
      makeLogger(),
    );
    expect(resolved).not.toBe(fetchFn);
  });
});

describe("access services with an apiUrl on an unknown host", () => {
  const CONFIG = {
    installId: "install-1",
    jwtSecret: "secret",
    issuer: "app",
    apiUrl: "https://example.com/installations-api/demo",
  };

  it("PeekAccessService sends nothing and throws (v2)", async () => {
    const fetchFn = makeFetch();
    const peek = new PeekAccessService({ ...CONFIG, mode: "v2", fetch: fetchFn });

    await expect(peek.getProductService().getAllActivities()).rejects.toBeInstanceOf(
      ApiHostNotAllowedError,
    );
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("PeekAccessService sends nothing and throws (v1 with an apiUrl and a gateway key)", async () => {
    const fetchFn = makeFetch();
    const peek = new PeekAccessService({
      ...CONFIG,
      mode: "v1",
      gatewayKey: "gw-key",
      fetch: fetchFn,
    });

    await expect(peek.getProductService().getAllActivities()).rejects.toBeInstanceOf(
      ApiHostNotAllowedError,
    );
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("CngAccessService sends nothing and throws", async () => {
    const fetchFn = makeFetch();
    const cng = new CngAccessService({ ...CONFIG, fetch: fetchFn });

    await expect(cng.getProductService().getAllActivities()).rejects.toBeInstanceOf(
      ApiHostNotAllowedError,
    );
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("AcmeAccessService sends nothing and throws", async () => {
    const fetchFn = makeFetch();
    const acme = new AcmeAccessService({ ...CONFIG, fetch: fetchFn });

    await expect(acme.getProductService().getAllActivities()).rejects.toBeInstanceOf(
      ApiHostNotAllowedError,
    );
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("PeekAccessService sends the request when the host is in the environment variable", async () => {
    vi.stubEnv(EXTRA_HOSTS_ENV_VAR, "example.com");
    const fetchFn = makeFetch();
    const peek = new PeekAccessService({ ...CONFIG, mode: "v2", fetch: fetchFn });

    await peek.getProductService().getAllActivities();

    expect(fetchFn).toHaveBeenCalledOnce();
  });
});
