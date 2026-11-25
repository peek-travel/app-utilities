import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

// The generator is a plain Node ESM script outside src/ (not bundled); import
// the pure builder + target list from it so this test renders the HTML exactly
// as the CLI does.
import {
  buildChangelogHtml,
  changelogHtmlTargets,
} from "../scripts/build-changelog-html.mjs";

describe("changelog HTML", () => {
  // Drift guard: the main changelog HTML and every archived per-minor HTML in
  // docs/html/changelogs/ are generated from their Markdown sources by
  // scripts/build-changelog-html.mjs. If a case fails after editing a changelog,
  // regenerate them: `node scripts/build-changelog-html.mjs`.
  it.each(changelogHtmlTargets())(
    "mirrors $md",
    ({ md, html, opts }) => {
      const source = readFileSync(md, "utf8");
      const committed = readFileSync(html, "utf8");
      expect(committed).toBe(buildChangelogHtml(source, opts));
    },
  );
});
