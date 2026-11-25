# Changelog

Consumer-facing changelog for `@peektravel/app-utilities`. It records only
changes a **caller** can observe or needs to act on — new capabilities, behavior
changes, and breaking changes — grouped by version, newest first. Internal
refactors, test-only changes, and invisible cleanups are intentionally omitted.

Each entry states **what** changed, **why**, and — when relevant — the **caller
action** required. Entries tagged `[breaking]` change observable behavior an
existing consumer could depend on; `[fix]` corrects broken behavior with no
action needed; `[additive]` only adds capability.

---

## 1.3.1

### Internal GQL Update

- Internal update to Peek GraphQL requests. No impact to callers.

---

## 1.3.0

### `BookingService.create` accepts a `promoCode` `[additive]`

- **What:** `CreateBookingInput` gains an optional `promoCode?: string | null`.
  When set to a non-empty string (surrounding whitespace is trimmed), the booking's
  `createQuoteV2` quote carries it as an enabled promo code
  (`promoCodes: [{ code, refid, isEnabled: true }]`, with a freshly generated
  `refid`); the gateway validates and prices it. An empty/whitespace-only value or
  `null`/omitted sends no promo code, so existing callers are unaffected.
- **Why:** callers need to apply a discount code at booking time without dropping
  to raw GraphQL.
- **Caller action:** none to keep current behavior. To apply a code, pass
  `promoCode`. It **cannot** be combined with `parentOrderId` — attaching to an
  existing order takes the amendment path, which creates no new quote, so
  `create` throws rather than silently dropping the code; apply the promo to the
  parent order separately in that case.

### `parseInstallWebhook` now rejects a non-Peek `apiUrl` `[breaking]`

- **What:** when an install/update webhook body carries a non-empty `apiUrl`,
  `parseInstallWebhook` now validates that its host is a Peek-owned domain —
  `peek.com` (production) or `peeklabs.com` (sandbox), or a subdomain of either.
  A foreign or unparseable host throws `InstallWebhookError` with the new
  `reason: "invalid_api_url"` (a new member of `InstallWebhookErrorReason`); a
  value delivered without a scheme is treated as `https`. An absent/empty
  `apiUrl` is unaffected and still parses. Nothing else about the parser changes.
- **Why:** the `apiUrl` is the endpoint the app points its API calls at, so a
  spoofed webhook with an attacker-controlled `apiUrl` could redirect those calls
  to a foreign gateway. Pinning the host to Peek-owned domains closes that.
- **Caller action:** none for genuine Peek deliveries. If you catch
  `InstallWebhookError` by `.reason`, note the added `"invalid_api_url"` case;
  the existing `try/catch` → `401` (or `instanceof JsonWebTokenError`) handling
  already covers it with no change.

---

## Older versions

Changelogs for earlier minor series are archived under [`docs/changelogs/`](docs/changelogs/), newest first:

- [1.2.x](docs/changelogs/1-2-x.md)
- [1.1.x](docs/changelogs/1-1-x.md)
- [1.0.x](docs/changelogs/1-0-x.md)
- [0.9.x](docs/changelogs/0-9-x.md)
- [0.8.x](docs/changelogs/0-8-x.md)
- [0.7.x](docs/changelogs/0-7-x.md)
- [0.6.x](docs/changelogs/0-6-x.md)
