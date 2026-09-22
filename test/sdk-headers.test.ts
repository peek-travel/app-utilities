import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  SDK_HEADER_NAME,
  SDK_HEADER_VALUE,
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

  // Drift guard: the version literal cannot be read from package.json at
  // runtime in the dual ESM+CJS build, so this pins the two together. If this
  // fails after a version bump, update SDK_VERSION in src/internal/sdk-headers.ts.
  it("pins SDK_VERSION to the package.json version", () => {
    expect(SDK_VERSION).toBe(packageVersion);
  });

  it("formats the header value as js-<version>", () => {
    expect(SDK_HEADER_VALUE).toBe(`js-${packageVersion}`);
  });
});
