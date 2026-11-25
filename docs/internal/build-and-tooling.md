# Build, tooling & flagged issues

> Part of the [`@peektravel/app-utilities` architecture overview](./ARCHITECTURE.md).

## Build & tooling


- **Bundler:** `tsup` (`tsup.config.ts`) emits a dual **ESM + CJS** build plus
  bundled `.d.ts`/`.d.cts`, with sourcemaps, tree-shaking, no minify. Two
  entries: the server library (`src/index.ts` → `dist/index.*`) and the UI
  components (`src/ui/index.ts` → `dist/ui/index.*`). An `onSuccess` step copies
  `tokens.css` + `odyssey.css` into `dist/ui/`.
- **Package entry points:** modern `exports` map with separate `import`/`require`
  conditions and their own type declarations; legacy `main` (`./dist/index.cjs`),
  `module`, and `types` provided as fallbacks. The UI surface adds `./ui`
  (dual import/require + types) and the two CSS assets `./ui/odyssey.css` /
  `./ui/tokens.css`. `"sideEffects"` is an allow-list (`**/ui/**`, `**/*.css`)
  so custom-element registration survives tree-shaking while the server code
  stays tree-shakable. The dual build supports both `import` and `require`
  consumers (notably the Node 22 / CommonJS Firebase Functions runtime).
- **TypeScript:** `NodeNext` module resolution, `ES2022` target, full `strict`
  plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `noUnusedLocals/Parameters`,
  `verbatimModuleSyntax`, `isolatedModules`. Source imports use explicit `.js`
  extensions (required by NodeNext ESM).
- **Lint:** ESLint flat config with `@eslint/js` + `typescript-eslint` recommended.
- **Tests:** Vitest, Node environment by default. Coverage via `v8` with **95%
  thresholds** on lines/functions/branches/statements (covers `src/ui/**` too).
  Server tests inject a fake `fetch` (and sometimes a fake `GraphQLClient`) to
  exercise transport, retries, error mapping, pagination, and converters without
  real network calls. UI tests opt into a DOM via a per-file
  `// @vitest-environment happy-dom` directive (`happy-dom` is a devDependency).
- **Publish guard:** `prepublishOnly` runs the build then `publint` and
  `@arethetypeswrong/cli` (`attw`) to verify the `exports` map / type resolution
  for both module systems. `attw` runs with `--profile node16` (subpath exports
  like `./ui` are invisible to legacy node10 classic resolution, which this
  Node≥18 package doesn't target) and `--exclude-entrypoints ui/odyssey.css
  ui/tokens.css` (CSS assets have no type declarations to resolve). `files: ["dist", "llms.txt"]` whitelists the build
  output plus the AI-agent quickstart (`README.md`, `LICENSE`, and
  `package.json` are always included by npm regardless); this maintainer doc
  under `docs/internal/` is intentionally **not** shipped.
  `publishConfig.access: "restricted"` marks it a private scoped package.
- **Distribution:** published to **GitHub Packages** (private registry), not
  public npm. Releases are automated by `.github/workflows/publish.yml`, which
  runs on a `v*.*.*` tag push: typecheck → lint → test (coverage gate) →
  `npm publish` (publish runs `prepublishOnly` = build + `publint` + `attw`).
  Consumers add a scoped `.npmrc` (`@peek-travel:registry=https://npm.pkg.github.com`)
  and a `read:packages` token, then `npm install` / `npm update` normally —
  including in cloud builds (Firebase Functions). See the README "Releasing" and
  "Install" sections.

## Verified current state (this review)
- `tsc --noEmit` — clean.
- `eslint .` — clean.
- `vitest run` — **247 tests across 28 files pass.**
- Coverage — 99.89% lines / 96.11% branches / 100% functions (above thresholds).
- `tsup` build — produces ESM, CJS, and both `.d.ts` flavors successfully.
- `attw --pack` / `publint` — no problems.

## Flagged issues & unusual configuration

These are observations, not blockers. Nothing here breaks the build.

1. **No `prepare` script — registry distribution only.** `dist/` is built on
   publish (`prepublishOnly`), not on install, and is git-ignored. Installing
   this directly from a **git URL** would therefore yield a package with no
   `dist/`; that path is unsupported. Consumption is via GitHub Packages only.

2. **Consumers must configure the `@peek-travel` scope.** `publishConfig` sets
   `registry: https://npm.pkg.github.com`, but each consuming project still needs
   an `.npmrc` mapping the `@peek-travel` scope to that registry plus a
   `read:packages` token (a `NPM_TOKEN` env var in cloud builds). Documented in
   the README "Install" section.

3. **`version` is `0.1.0`** and `license` is `UNLICENSED`. Expected for an
   internal package; bump the version per release (`npm version` + tag push)
   so consumers pick changes up via `npm update`.

4. **CI runs on release only.** `.github/workflows/publish.yml` runs the full
   `typecheck` / `lint` / `test` / `check:*` gate on a version-tag push before
   publishing, but nothing runs them automatically on every push/PR. Consider
   adding a separate PR-validation workflow.

5. **Transport response-handling order is slightly fragile.** In
   `GraphQLClient.request`, the body is parsed with `response.json()` and the
   GraphQL `errors` array is checked *before* `response.ok`. A non-2xx response
   whose body is **not valid JSON** (e.g. an HTML 500/502 from a proxy) would
   throw a raw `SyntaxError` from `json()` rather than the intended
   `"GraphQL request failed with HTTP <status>"` error. Consider checking
   `response.ok` / content-type before parsing, or guarding the `json()` call.

6. **Minimal package metadata.** `repository` is set (required for GitHub
   Packages to link the package to its repo); `author`, `bugs`, `homepage`, and
   `keywords` are still absent. Cosmetic.

7. **`jsonwebtoken` for HMAC-only signing.** It's the single runtime dependency
   and pulls a fair amount of transitive weight for what is effectively an
   HMAC-SHA `sign()`. Not a problem, just noting it's the one thing standing
   between this and a zero-runtime-dependency library; Node's built-in `crypto`
   could sign the JWT if footprint ever matters.

8. **No validation that `leewaySeconds < ttlSeconds`.** If a caller sets leeway
   ≥ TTL, the cached token's `expiresAtMs` would be in the past and a fresh JWT
   would be minted on every request. Low risk (defaults are sane), but unguarded.
