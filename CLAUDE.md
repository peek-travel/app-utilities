# Project Guidelines

`@peek-travel/app-utilities` is a small, dependency-light TypeScript **library**
that wraps the Peek "backoffice" GraphQL gateway. It was extracted from the
Peek Pro Autopilot connector so the connector can become a thin consumer.
Callers only ever touch `PeekAccessService`, the per-resource services it hands
out, and the clean data models — never raw GraphQL.

- If anything about a request is unclear or ambiguous, ask for clarification
  before starting any work. Don't guess at intent or proceed on assumptions when
  the goal, scope, or approach is uncertain.
- Before making any changes, review `docs/internal/ARCHITECTURE.md`.
- Once you've made all the code changes, update `docs/internal/ARCHITECTURE.md` to reflect
  major changes (new resources, new triads, changed public surface).
- Ensure test coverage remains above 95% (the Vitest gate enforces this on
  lines/functions/branches/statements).
- Unless told otherwise, after everything is done, run the linter and fix any
  errors.

# Architecture conventions

Preserve the structure described in `docs/internal/ARCHITECTURE.md`. The load-bearing rules:

- **Three-file triad per resource** under `src/internal/<resource>/`:
  - `*-queries.ts` — raw GraphQL strings, matching response interfaces, and
    small variable-builder/normalizer helpers. **Internal only — never
    re-exported from `src/index.ts`.**
  - `*-converter.ts` — **pure, I/O-free** functions mapping raw GraphQL nodes →
    clean models. No network, no logging, no `Date.now()`.
  - `*-service.ts` — the public class with the business logic; calls the shared
    `GraphQLClient`, then runs the converter.
- A resource may split into more than one triad when it carries a distinct
  sub-domain (e.g. `bookings` has `booking-*` plus `addon-*`).
- **Public API surface (`src/index.ts`) exposes only the clean contract**:
  `PeekAccessService` + config, the resource service classes and the
  option/result types callers need, the data-model **types**, `Logger` /
  `noopLogger`, and the typed error classes. Query strings, raw response
  interfaces, and internal detail models (e.g. the add-on `AddonItem`) stay
  internal — add a model to `index.ts` only if a consumer genuinely needs it.
- **Stay dependency-light.** `jsonwebtoken` is the only runtime dependency.
  Prefer Node built-ins (`node:crypto` `randomUUID`, native `fetch`) over adding
  a package; flag it for the user before introducing a new runtime dependency.
- **NodeNext ESM**: relative imports must carry explicit `.js` extensions.
- The dual **ESM + CJS** build (`tsup`) plus `publint` + `attw` must stay green —
  the connector consumes this from a CommonJS Firebase Functions runtime.

# Coding Standards

- Except for log messages, do not put static strings directly in the code.
  Declare them as `const` (e.g. the `ERROR_*` and status constants at the top of
  the booking service) and share them where useful.
- Look for opportunities to simplify by extracting helper functions instead of
  duplicating logic; review new code for obvious duplication once complete.
- Don't put `await` inside a loop for independent work — use `Promise.all()`
  (see `addAddon` resolving the booking sale and parent item in parallel).
  Genuinely sequential work is the exception: cursor pagination
  (`BookingService.fetchPaginated`) must await each page to get the next cursor.
- Keep converters pure so they can be unit-tested without a client. Tests inject
  a fake `fetch` (and sometimes a fake `GraphQLClient`) — never hit the real
  network.
- Input validation lives in the service layer (id prefixes, currency format,
  positive-integer quantities, etc.); `normalizeBookingId` lowercases and
  converts `-` → `_`.

# Versioning

**Do not change the `version` in `package.json` unless the user explicitly asks
for it.** Code changes alone do not warrant a version bump. The package follows
`major.minor.patch` semver independently of the connector. Note `0.0.0` is the
pre-release placeholder and cannot be re-published once a real version ships.

# Build / test commands

The canonical npm scripts:

```bash
npm run typecheck      # tsc --noEmit
npm run lint           # eslint .   (lint:fix to autofix)
npm run test           # vitest run
npm run test:coverage  # vitest run --coverage  (enforces the 95% gate)
npm run build          # tsup — dual ESM+CJS + .d.ts/.d.cts
npm run check:exports  # attw --pack .   (type-resolution for both module systems)
npm run check:publint  # publint
```

Sandbox quirks (this environment): `npm install` fails on a dependency
install-script spawn — use `npm install --ignore-scripts`. If the
`node_modules/.bin/*` shims fail to resolve, invoke the real binaries directly:
`node node_modules/typescript/bin/tsc --noEmit`,
`node node_modules/vitest/vitest.mjs run --coverage`,
`node node_modules/eslint/bin/eslint.js .`,
`node node_modules/tsup/dist/cli-default.js`.

# Review Checklist

## Once complete
- Review the new code for obvious duplication; simplify with helper functions.
- Run the linter, the type checker, and the unit tests (with coverage).
- Update `docs/internal/ARCHITECTURE.md` if the public surface, resources, or build changed.
