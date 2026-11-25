/**
 * ============================================================================
 *  📦  PACKAGE VERSION — BUMP THIS ON EVERY RELEASE  📦
 * ============================================================================
 *
 * This is the single source of truth for the running package version. It MUST
 * equal the `version` field in `package.json` — `test/version.test.ts` reads
 * `package.json` and fails the build if the two ever drift, so a forgotten bump
 * cannot ship.
 *
 * Why a hand-maintained literal and not a `package.json` read? The dual
 * ESM+CJS build has no portable way to resolve its own `package.json` at
 * runtime (`import.meta.url` is ESM-only, `__dirname` is CJS-only), and a
 * static const keeps the package dependency-light and tree-shakeable.
 *
 * It feeds the outbound `x-peek-sdk: js-<version>` header and the Peek GraphQL
 * `?sdk=js-<version>` query param (both in `src/internal/sdk-headers.ts`).
 *
 * See **Versioning** in `CLAUDE.md` for everything that moves together on a bump.
 */
export const VERSION = "1.3.1";
