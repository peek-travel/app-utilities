import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// The generator is a plain Node ESM script outside src/ (not bundled); import
// the pure builder from it so this test renders the HTML exactly as the CLI does.
import { buildChangelogHtml } from "../scripts/build-changelog-html.mjs";

const changelogMdPath = fileURLToPath(new URL("../changelog.md", import.meta.url));
const changelogHtmlPath = fileURLToPath(
  new URL("../docs/html/changelog.html", import.meta.url),
);

describe("changelog HTML", () => {
  // Drift guard: docs/html/changelog.html is generated from changelog.md by
  // scripts/build-changelog-html.mjs. If this fails after editing the changelog,
  // regenerate it: `node scripts/build-changelog-html.mjs`.
  it("matches a fresh render of changelog.md", () => {
    const md = readFileSync(changelogMdPath, "utf8");
    const committed = readFileSync(changelogHtmlPath, "utf8");
    expect(committed).toBe(buildChangelogHtml(md));
  });
});
