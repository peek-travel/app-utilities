# gql-cli — Peek access-service test harness

A developer CLI for hitting the real Peek gateway with the package's own
resource services + converters. **Not** part of the published package — it lives
outside `src/` and is never bundled.

## Why the token is a per-call argument

The gateway only checks two headers: `pk-api-key` (the gateway key) and
`X-Peek-Auth: Bearer <token>`. The gateway key, app id, and base url are static —
they live in a gitignored `.env`. The bearer token changes/expires, so it is
passed as the **first argument** on every call.

`PeekAccessService` normally *mints* that token from a JWT secret. This harness
skips all of that: because you supply a ready token, it builds the internal
`GraphQLClient` directly (`getToken` just returns your token) and wires the real
services onto it — so it exercises the exact same service + converter code a
consumer would.

## Setup

```bash
cp .env.example .env      # then fill in PEEK_GATEWAY_KEY + PEEK_APP_ID
chmod +x run.sh           # once
```

`.env` and the compiled `.build/` output are gitignored. The first run compiles
with the repo's own `tsc` (no extra dependency); later runs are incremental.

## Usage

```bash
./run.sh <authToken> <functionName> [param1] [param2] ...
./run.sh help                    # list every function
./run.sh help <functionName>     # show one function's params
```

### Examples

```bash
# List activities
./run.sh "$TOKEN" getAllActivities

# Custom questions for an activity
./run.sh "$TOKEN" getCustomQuestions 87cdf37f-1872-42cb-b0bd-518312624fc1

# Reviews, page size 5, offset 10 (numbers coerced)
./run.sh "$TOKEN" getReviews prod_123 5 10

# A booking with read options (object param = one JSON string)
./run.sh "$TOKEN" getBookingById b_abc '{"includeGuests":true}'
```

## Parameter types

`help <fn>` lists each param's kind:

- **string** — passed through as-is.
- **number** — coerced; must parse.
- **boolean** — `true|false|1|0|yes|no`.
- **json** — a single JSON string (object inputs like `createBooking`,
  `makeBookingPayment`, pricing upserts). Mind your shell quoting.

Calls marked **[PII]** (payments, add-on mutations, payments-on-file) throw
`PiiAccessDisabledError` unless `PEEK_FULL_CUSTOMER_ACCESS=1` is set in `.env`.

Set `PEEK_DEBUG=1` to print request diagnostics to stderr.
