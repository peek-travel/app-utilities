# Pricing overrides & engines

A guide for adjusting ticket prices in Peek Pro from your own app using
`@peektravel/app-utilities`. It assumes you have **never seen this API before**
and walks you from zero to a working price override, then covers how to manage
overrides afterward.

Everything here goes through `PeekAccessService.getPricingService()`.

---

## 1. The mental model (read this first)

Peek Pro applies price adjustments at checkout through a **pricing engine**. You
don't edit product prices directly — instead you:

1. Create a **pricing engine** once. It's just a named container. Peek gives you
   back an **engine id** — save it; you reuse it forever.
2. Push **overrides** onto that engine for a **date range** and an **activity**.
   An override says "for this activity, on these dates, adjust these tickets'
   prices — optionally only when N spots are already taken and/or within a
   start-time window."

```
Pricing engine  (created once, identified by engineId)
└── Overrides, upserted per (date range × activity)
    └── one or more override entries, each:
        ├── resourceOptions[]  ← which tickets, and the fixed/percentage adjustment
        └── filters[]          ← optional: spotsTaken and/or startTimeRange gates
```

Three things are **your job**, not the API's — this wrapper is deliberately a
thin, faithful pass-through (it does **not** know about your templates,
calendars, or business rules):

- **Deciding what the overrides are** — which tickets, what price, what dates.
- **Ordering** the override entries (`order` field — see §5).
- **Computing `spotsTaken` bounds** from ticket counts (the off-by-one — see §6).

The service validates your input and faithfully sends it. That's the deal.

---

## 2. What you need before you start

| You need | How to get it |
| --- | --- |
| A configured `PeekAccessService` | See the package README / `llms.txt` "Entry point". |
| The **activity id** you want to adjust | `getProductService().getAllActivities()` → `product.productId` |
| The **ticket (resourceOption) ids** under it | the same product's `tickets[].id` |
| The activity's **currency** (for fixed prices) | the same product's `currency` (e.g. `"USD"`) |

```ts
import { PeekAccessService } from "@peektravel/app-utilities";

const peek = new PeekAccessService({ /* installId, jwtSecret, issuer, appId, gatewayKey */ });

const activities = await peek.getProductService().getAllActivities();
const activity = activities[0]!;
// activity.productId → the activityId
// activity.tickets   → [{ id, name }, ...]  (the resourceOption ids)
// activity.currency  → "USD"  (use this for fixed-price overrides)
```

> **Money and percentages are strings, not numbers.** `"80.00"`, `"-25"` — never
> `80` or `-25`. The API rejects floats, and strings avoid precision loss.

---

## 3. Order of operations (the whole lifecycle)

```
① create engine ──> save engineId
        │
        ▼
② build UpsertOverridesInput  (you decide the overrides)
        │
        ▼
③ upsertOverrides(input)  ──> Peek stores them, echoes the resolved state
        │
        ▼
   … time passes; guests book; you change your mind …
        │
        ├──> ③ upsertOverrides(...)   re-send to CHANGE overrides (full replace per date+activity)
        ├──> ④ clearOverrides(...)    remove overrides for a date range
        ├──> ⑤ updateEngine(...)      rename or re-scope the engine
        └──> ⑥ deleteEngine(id)       tear the whole engine down (idempotent)
```

You create the engine **once** (step ①) and then live in steps ③–⑥.

---

## 4. Create your first override (end to end)

### Step 1 — Create the engine (once)

```ts
const pricing = peek.getPricingService();

const { id: engineId } = await pricing.createEngine({
  name: "Summer promo schedule",
  // optional: activityIds: ["act-xyz"]  ← scope the engine to specific activities
});
// → Persist engineId in your own storage. You'll reuse it for every upsert.
```

Do this **lazily** — only when you're about to push your first override — and
store the returned `engineId` against whatever your app calls a "schedule". If
you omit `activityIds`, the engine can carry overrides for any activity.

### Step 2 — Build the override input

Here's a complete, realistic example: activity `act-xyz`, on July 4th, with a
tiered discount on the adult ticket — **$100 normally, but $80 once 4 spots are
taken** — only for the 9–11am window.

```ts
import type { UpsertOverridesInput } from "@peektravel/app-utilities";

const input: UpsertOverridesInput = {
  engineId,
  dateRange: "[2025-07-04,2025-07-04]", // single day: both ends equal (see §7)
  activities: [
    {
      activityId: "act-xyz",
      overrides: [
        {
          order: 0, // evaluated first — the higher-spots, deeper-discount tier
          resourceOptions: [
            { id: "ticket-adult", mode: "fixed", price: { amount: "80.00", currency: "USD" } },
          ],
          filters: [
            { spotsTaken: { minSpots: 4 } },           // "once 4 spots are taken" (§6)
            { startTimeRange: "[09:00:00,11:00:00]" }, // only the morning window
          ],
        },
        {
          order: 1, // the base tier
          resourceOptions: [
            { id: "ticket-adult", mode: "fixed", price: { amount: "100.00", currency: "USD" } },
          ],
          filters: [
            { startTimeRange: "[09:00:00,11:00:00]" },
          ],
        },
      ],
    },
  ],
};
```

Prefer a **percentage** adjustment instead of a fixed price? Swap the
`resourceOptions` entry:

```ts
{ id: "ticket-adult", mode: "percentage", percentageAdjustment: "-25" } // 25% off; must be > -100
```

### Step 3 — Send it

```ts
const result = await pricing.upsertOverrides(input);
// result.activityContexts → the fully resolved state Peek stored (good to log/persist as an audit trail)
```

That's it — the override is live. `upsertOverrides` returns the resolved
`activityContexts` echoed by Peek (dates, activity, engine, and every override
with its resolved prices and filters). Store it if you want an audit record of
exactly what Peek accepted.

---

## 5. `order` — how override entries are ranked

Within one activity you often have **tiers** (base price, then a deeper discount
once the group is larger). Peek evaluates entries by their `order` integer,
**lowest first**. So the most specific / deepest-discount tier gets the lowest
number.

Convention (and what the sibling `pricing-schedules` app does): sort your entries
**descending by `minSpots`**, then assign `order = 0, 1, 2, …`. The "5+ tickets"
tier (`minSpots: 4`) sorts before the "1+ tickets" base tier, so it gets
`order: 0`.

You assign `order` yourself — the service does not reorder for you.

---

## 6. `spotsTaken` — mind the off-by-one

`spotsTaken` filters an override by **how many spots are already taken**, which
is **zero-indexed** — it is *not* the ticket-count. Convert your ticket-count
ranges like this:

| You mean | `spotsTaken` |
| --- | --- |
| Any group size (1+) | *omit the filter entirely* |
| 1–4 tickets | `{ maxSpots: 4 }` |
| 5–9 tickets | `{ minSpots: 4, maxSpots: 9 }` |
| 10+ tickets | `{ minSpots: 9 }` |

Rule: for a half-open ticket range `[L, U)` → `minSpots = L - 1` (clamped to 0,
omit when 0), `maxSpots = U - 1` (omit when unbounded). "Applies from the 5th
ticket onward" is `minSpots: 4`.

The **`startTimeRange`** filter is simpler — a Postgres-style inclusive range
string `"[HH:MM:SS,HH:MM:SS]"`. Omit it for all-day overrides. An entry can carry
zero, one, or both filters.

---

## 7. `dateRange` format

Both `upsertOverrides` and `clearOverrides` take `dateRange` as a **PostgreSQL
inclusive range string**:

- Single day: `"[2025-07-04,2025-07-04]"` — both ends the same.
- A span: `"[2025-07-04,2025-07-06]"` — applies to the 4th, 5th, and 6th.

---

## 8. Managing overrides afterward

### Change an override → just upsert again

`upsertOverrides` is a **full replace for that `(dateRange, activity)`**. To
change prices, rebuild the input and send it again — you don't diff or patch.
Whatever you send becomes the complete set of overrides for those dates.

### Remove overrides → `clearOverrides` (never "send nothing")

To take a date back to normal pricing, send `clearOverrides`. Under the hood this
is an upsert with **empty** overrides for each activity — which is the **only**
correct way to clear:

```ts
await pricing.clearOverrides({
  engineId,
  dateRange: "[2025-07-04,2025-07-04]",
  activityIds: ["act-xyz"], // every activity you previously wrote on these dates
});
```

> ⚠️ **You must name the activities to clear.** Clearing works by sending
> `overrides: []` *for each activity id*. Sending an empty `activities` array
> clears **nothing**. Recover the activity ids from whatever you upserted before
> (e.g. the `activityContexts` you persisted, or your own records of what you
> pushed onto those dates).

### Rename or re-scope the engine → `updateEngine`

```ts
await pricing.updateEngine({
  engineId,
  name: "Renamed schedule",
  activityIds: ["act-xyz", "act-abc"], // set the engine's activity scope…
  // …or omit / pass [] to CLEAR the scope (engine applies to all activities)
});
```

### Tear it all down → `deleteEngine`

```ts
await pricing.deleteEngine(engineId); // idempotent
```

`deleteEngine` is **idempotent**: if the engine is already gone it still
resolves, so it's safe to call more than once. After deleting, discard the stored
`engineId` and create a fresh engine next time you need one.

---

## 9. Method reference

| Method | Does | Returns |
| --- | --- | --- |
| `createEngine({ name, activityIds? })` | Create an engine (once). | `{ id }` — store it |
| `updateEngine({ engineId, name, activityIds? })` | Rename / re-scope. Empty `activityIds` clears the scope. | `{ id, name }` |
| `deleteEngine(engineId)` | Delete the engine. Idempotent. | `void` |
| `upsertOverrides(input)` | Set (full-replace) overrides for a date range. | `{ activityContexts }` |
| `clearOverrides({ engineId, dateRange, activityIds })` | Clear overrides for the named activities. | `{ activityContexts }` |

Short-forms exist on `PeekAccessService` too: `peek.createPricingEngine(...)`,
`updatePricingEngine`, `deletePricingEngine`, `upsertPricingOverrides`,
`clearPricingOverrides` — identical behavior, one less accessor call.

---

## 10. Errors

- **Validation errors** (thrown *before* any network call, as plain `Error`):
  missing `engineId` / `dateRange` / `name` / `activityId` / ticket id, a
  `currency` that isn't 3 uppercase letters, a non-numeric price amount, a
  non-numeric `percentageAdjustment`, or `percentageAdjustment <= -100`.
- **Peek rejections**: an `InvalidDataError` from Peek (e.g. overlapping tiers)
  surfaces as a thrown `Error` carrying Peek's message. A `NotFoundError` on
  `updateEngine` throws; on `deleteEngine` it's swallowed (idempotent).
- **Transport errors**: HTTP 418 → `AdminAccountRequiredError`, 429 (after
  retries) → `RateLimitError`, GraphQL errors → `PeekGraphQLError`. All
  importable — branch with `instanceof`.

---

## 11. Common pitfalls (the greatest hits)

- **Forgetting to create the engine first.** The `engineId` must exist before any
  upsert. Create it lazily and persist the id.
- **Clearing with `activities: []`.** That clears nothing. Use `clearOverrides`
  with the actual `activityIds`.
- **Numbers instead of strings.** `price.amount` and `percentageAdjustment` are
  strings (`"80.00"`, `"-25"`).
- **`spotsTaken` off-by-one.** `[5,10)` tickets → `{ minSpots: 4, maxSpots: 9 }`.
  `minSpots` counts spots already taken, not ticket lower bound.
- **Expecting a partial update.** Upsert is a full replace for that
  `(dateRange, activity)`. Send the complete desired set every time.
- **Mixing fixed and percentage in one template.** The API may accept it, but
  keeping one mode per schedule is far easier to reason about — pick fixed *or*
  percentage per set of overrides.
