import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { VERSION } from "../src/version.js";

const packageJsonPath = fileURLToPath(new URL("../package.json", import.meta.url));
const packageVersion = (
  JSON.parse(readFileSync(packageJsonPath, "utf8")) as { version: string }
).version;

describe("VERSION", () => {
  // The running version is a hand-maintained literal (the dual ESM+CJS build
  // cannot portably read its own package.json at runtime). This drift guard
  // fails the build if someone bumps package.json but forgets src/version.ts
  // (or vice versa) — bump both together. See Versioning in CLAUDE.md.
  it("matches the package.json version", () => {
    expect(VERSION).toBe(packageVersion);
  });
});
