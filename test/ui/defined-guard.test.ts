// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import '../../src/ui/index.js';
import { registeredTags } from '../../src/ui/base.js';

/**
 * Drift guard for the FOUC rule in `odyssey.css`: the `:where(…):not(:defined)`
 * selector list must name **every** registered `<ody-*>` element (and nothing
 * else), or a newly-added component would flash as raw text on first paint. The
 * registry ({@link registeredTags}) is the source of truth; the CSS is checked
 * against it, so adding a component without adding its tag here fails the build.
 */
const css = readFileSync(resolve('src/ui/odyssey.css'), 'utf8');

/** Pull the tag list out of the `:where(…):not(:defined){ visibility: hidden }` rule. */
function guardedTags(): string[] {
  // `[^()]+` keeps the match from spanning any other `:where(...)` rule in the
  // file — the tag list itself never contains parentheses.
  const match = css.match(/:where\(([^()]+)\):not\(:defined\)\s*\{\s*visibility:\s*hidden/);
  if (!match) return [];
  return match[1]!
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

describe('odyssey.css :not(:defined) FOUC guard', () => {
  it('has a visibility:hidden guard rule', () => {
    expect(guardedTags().length).toBeGreaterThan(0);
  });

  it('guards exactly the registered tag set (no drift)', () => {
    const guarded = [...guardedTags()].sort();
    const registered = [...registeredTags()].sort();
    expect(guarded).toEqual(registered);
  });

  it('lists no tag twice', () => {
    const guarded = guardedTags();
    expect(new Set(guarded).size).toBe(guarded.length);
  });
});
