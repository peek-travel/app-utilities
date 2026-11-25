import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  SDK_HEADER_NAME,
  SDK_HEADER_VALUE,
  SDK_QUERY_STRING,
  SDK_VERSION,
} from "../src/internal/sdk-headers.js";

const packageJsonPath = fileURLToPath(new URL("../package.json", import.meta.url));
const packageVersion = (
  JSON.parse(readFileSync(packageJsonPath, "utf8")) as { version: string }
).version;

describe("sdk headers", () => {
  it("uses the x-peek-sdk header name", () => {
    expect(SDK_HEADER_NAME).toBe("x-peek-sdk");
  });

  // Drift guard: SDK_VERSION re-exports the canonical VERSION in
  // src/version.ts; this confirms the header path carries it. The primary
  // package.json pin lives in test/version.test.ts.
  it("pins SDK_VERSION to the package.json version", () => {
    expect(SDK_VERSION).toBe(packageVersion);
  });

  it("formats the header value as js-<version>", () => {
    expect(SDK_HEADER_VALUE).toBe(`js-${packageVersion}`);
  });

  it("formats the query string as sdk=js&v=<version>", () => {
    expect(SDK_QUERY_STRING).toBe(`sdk=js&v=${packageVersion}`);
  });
});
