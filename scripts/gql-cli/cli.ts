/**
 * Command-line harness for exercising the Peek access-service calls against a
 * live gateway. It is a **developer test tool**, not part of the published
 * package — it lives outside `src/` and is never bundled.
 *
 * Auth model (see the folder README): the gateway only checks two headers,
 * `pk-api-key` (the gateway key) and `X-Peek-Auth: Bearer <token>`. The static
 * config (gateway key, app id, base url) lives in a gitignored `.env`; the
 * bearer token changes/expires, so it is passed as the first CLI argument on
 * every call. Because the token is supplied directly, this harness skips the
 * JWT-minting machinery in `PeekAccessService` and builds the internal
 * `GraphQLClient` itself, then wires the real resource services onto it — so it
 * exercises the exact same service + converter code a consumer would.
 *
 * Usage:
 *   run.sh <authToken> <functionName> [param1] [param2] ...
 *   run.sh help
 *   run.sh help <functionName>
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { GraphQLClient } from "../../src/internal/peek/graphql-client.js";
import {
  AccountUserService,
  AvailabilityService,
  BookingService,
  DailyNoteService,
  MembershipService,
  PricingService,
  ProductService,
  PromoCodeService,
  ResellerService,
  ResourcePoolService,
  ReviewService,
  TimeslotService,
  noopLogger,
  type Logger,
} from "../../src/index.js";
import type {
  AddAddonInput,
  AvailabilityTimesQuery,
  BookingReadOptions,
  BookingTimeRangeSearch,
  ClearOverridesInput,
  CreateBookingInput,
  CreateEngineInput,
  CreatePromoCodeInput,
  GuideAssignment,
  MakePaymentInput,
  MembershipPurchaseInput,
  NoteMode,
  RefundInput,
  ResourcePoolMode,
  TimeslotFilter,
  UpdateEngineInput,
  UpsertOverridesInput,
} from "../../src/index.js";

/** Gateway default when `.env` sets no `PEEK_BASE_URL`/`PEEK_API_URL`. */
const DEFAULT_BASE_URL = "https://apps.peekapis.com/backoffice-gql";

// ─── .env loading (no dependency) ────────────────────────────────────────────

/**
 * Reads simple `KEY=VALUE` lines from `.env` in the working directory and fills
 * any keys not already present in `process.env` (real env wins). Missing file is
 * fine — the harness just relies on the ambient environment then.
 */
function loadDotEnv(): void {
  let raw: string;
  try {
    raw = readFileSync(join(process.cwd(), ".env"), "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

// ─── Service context ─────────────────────────────────────────────────────────

interface Ctx {
  products: ProductService;
  accountUsers: AccountUserService;
  resourcePools: ResourcePoolService;
  timeslots: TimeslotService;
  resellers: ResellerService;
  promoCodes: PromoCodeService;
  pricing: PricingService;
  dailyNotes: DailyNoteService;
  availability: AvailabilityService;
  memberships: MembershipService;
  bookings: BookingService;
  reviews: ReviewService;
}

/** Builds the internal client with the pasted token, then wires every service. */
function buildContext(authToken: string): Ctx {
  const apiUrl = process.env.PEEK_API_URL || undefined;
  const gatewayKey = process.env.PEEK_GATEWAY_KEY || undefined;
  const appId = process.env.PEEK_APP_ID || undefined;
  const baseUrl = process.env.PEEK_BASE_URL || DEFAULT_BASE_URL;
  const fullCustomerAccess = /^(1|true|yes)$/i.test(
    process.env.PEEK_FULL_CUSTOMER_ACCESS ?? "",
  );

  const logger: Logger = process.env.PEEK_DEBUG
    ? {
        info: (m, c) => console.error(`[info] ${m}`, c ?? ""),
        warn: (m, c) => console.error(`[warn] ${m}`, c ?? ""),
        error: (m, c) => console.error(`[error] ${m}`, c ?? ""),
      }
    : noopLogger;

  const client = new GraphQLClient({
    apiUrl,
    baseUrl: apiUrl ? undefined : baseUrl,
    appId: apiUrl ? undefined : appId,
    gatewayKey,
    getToken: () => authToken,
    retryDelaysMs: [1000, 2000, 4000],
    logger,
    fetchFn: fetch,
  });

  const products = new ProductService(client);
  const accountUsers = new AccountUserService(client);
  const resourcePools = new ResourcePoolService(client);
  const accessOptions = { fullCustomerAccess };
  return {
    products,
    accountUsers,
    resourcePools,
    timeslots: new TimeslotService(client, {
      resourcePoolService: resourcePools,
      accountUserService: accountUsers,
    }),
    resellers: new ResellerService(client),
    promoCodes: new PromoCodeService(client),
    pricing: new PricingService(client),
    dailyNotes: new DailyNoteService(client),
    availability: new AvailabilityService(client),
    memberships: new MembershipService(client),
    bookings: new BookingService(client, { productService: products }, { accessOptions }),
    reviews: new ReviewService(client, accessOptions),
  };
}

// ─── Function registry ───────────────────────────────────────────────────────

type ParamKind = "string" | "number" | "boolean" | "json";

interface ParamSpec {
  name: string;
  kind: ParamKind;
  required: boolean;
  desc: string;
}

interface FnSpec {
  name: string;
  group: string;
  desc: string;
  /** `true` for calls blocked unless PEEK_FULL_CUSTOMER_ACCESS is on. */
  pii?: boolean;
  params: ParamSpec[];
  run: (ctx: Ctx, args: unknown[]) => Promise<unknown>;
}

const p = (
  name: string,
  kind: ParamKind,
  desc: string,
  required = true,
): ParamSpec => ({ name, kind, required, desc });

const REGISTRY: FnSpec[] = [
  // ── products ──
  { name: "getAllProducts", group: "products", desc: "Activities + add-ons, flat list.", params: [], run: (c) => c.products.getAllProducts() },
  { name: "getAllActivities", group: "products", desc: "ACTIVITY-typed products only.", params: [], run: (c) => c.products.getAllActivities() },
  { name: "getAllRentals", group: "products", desc: "RENTAL-typed products only.", params: [], run: (c) => c.products.getAllRentals() },
  { name: "getAllAddons", group: "products", desc: "Add-on products only.", params: [], run: (c) => c.products.getAllAddons() },
  { name: "getCustomQuestions", group: "products", desc: "An activity's custom questions.", params: [p("productId", "string", "Activity id")], run: (c, [id]) => c.products.getCustomQuestions(id as string) },

  // ── account users ──
  { name: "getAllAccountUsers", group: "account-users", desc: "All active account users.", params: [], run: (c) => c.accountUsers.getAll() },
  { name: "getAccountUserById", group: "account-users", desc: "One active account user by id.", params: [p("userId", "string", "Account user id")], run: (c, [id]) => c.accountUsers.getById(id as string) },

  // ── resource pools ──
  { name: "getAllResourcePools", group: "resource-pools", desc: "All resource pools.", params: [p("mode", "string", 'Optional mode (e.g. "guide")', false)], run: (c, [mode]) => c.resourcePools.getAll(mode as ResourcePoolMode | undefined) },

  // ── timeslots ──
  { name: "getTimeslotsForDay", group: "timeslots", desc: "Timeslots for an activity on a date.", params: [p("productId", "string", "Activity id"), p("date", "string", "YYYY-MM-DD"), p("filter", "string", 'Optional: all|available|... (default all)', false)], run: (c, [id, date, filter]) => c.timeslots.getForDay(id as string, date as string, filter as TimeslotFilter | undefined) },
  { name: "getTimeslotById", group: "timeslots", desc: "One timeslot by id.", params: [p("timeslotId", "string", "Timeslot id")], run: (c, [id]) => c.timeslots.getById(id as string) },
  { name: "setTimeslotAvailability", group: "timeslots", desc: "Set a timeslot's availability status.", params: [p("timeslotId", "string", "Timeslot id"), p("status", "string", "New status")], run: (c, [id, s]) => c.timeslots.setAvailability(id as string, s as string) },
  { name: "setTimeslotNotes", group: "timeslots", desc: "Set a timeslot's manifest notes.", params: [p("timeslotId", "string", "Timeslot id"), p("manifestNotes", "string", "Notes text")], run: (c, [id, n]) => c.timeslots.setNotes(id as string, n as string) },
  { name: "assignTimeslotGuide", group: "timeslots", desc: "Assign/unassign guides across timeslots.", params: [p("assignment", "json", "GuideAssignment JSON")], run: (c, [a]) => c.timeslots.assignGuide(a as GuideAssignment) },

  // ── resellers ──
  { name: "getAllChannels", group: "resellers", desc: "All reseller channels + agents.", params: [p("agentsPerChannel", "number", "Optional page size for agents", false)], run: (c, [n]) => c.resellers.getAllChannels(n as number | undefined) },

  // ── promo codes ──
  { name: "getAllPromoCodes", group: "promo-codes", desc: "All promo codes.", params: [], run: (c) => c.promoCodes.getAll() },
  { name: "createPromoCode", group: "promo-codes", desc: "Create a promo code.", params: [p("input", "json", "CreatePromoCodeInput JSON")], run: (c, [i]) => c.promoCodes.create(i as CreatePromoCodeInput) },

  // ── pricing ──
  { name: "createPricingEngine", group: "pricing", desc: "Create a pricing engine.", params: [p("input", "json", "CreateEngineInput JSON")], run: (c, [i]) => c.pricing.createEngine(i as CreateEngineInput) },
  { name: "updatePricingEngine", group: "pricing", desc: "Update a pricing engine.", params: [p("input", "json", "UpdateEngineInput JSON")], run: (c, [i]) => c.pricing.updateEngine(i as UpdateEngineInput) },
  { name: "deletePricingEngine", group: "pricing", desc: "Delete a pricing engine.", params: [p("engineId", "string", "Engine id")], run: (c, [id]) => c.pricing.deleteEngine(id as string) },
  { name: "upsertPricingOverrides", group: "pricing", desc: "Upsert pricing overrides.", params: [p("input", "json", "UpsertOverridesInput JSON")], run: (c, [i]) => c.pricing.upsertOverrides(i as UpsertOverridesInput) },
  { name: "clearPricingOverrides", group: "pricing", desc: "Clear pricing overrides.", params: [p("input", "json", "ClearOverridesInput JSON")], run: (c, [i]) => c.pricing.clearOverrides(i as ClearOverridesInput) },

  // ── daily notes ──
  { name: "getDailyNoteToday", group: "daily-notes", desc: "Today's daily note.", params: [], run: (c) => c.dailyNotes.getToday() },
  { name: "updateDailyNote", group: "daily-notes", desc: "Set today's daily note.", params: [p("note", "string", "Note text")], run: (c, [n]) => c.dailyNotes.update(n as string) },

  // ── availability ──
  { name: "getAvailabilityTimes", group: "availability", desc: "Availability times for a query.", params: [p("query", "json", "AvailabilityTimesQuery JSON")], run: (c, [q]) => c.availability.getAvailabilityTimes(q as AvailabilityTimesQuery) },

  // ── memberships ──
  { name: "getAllMemberships", group: "memberships", desc: "All memberships.", params: [], run: (c) => c.memberships.getAll() },
  { name: "purchaseMembership", group: "memberships", desc: "Purchase a membership.", params: [p("input", "json", "MembershipPurchaseInput JSON")], run: (c, [i]) => c.memberships.purchase(i as MembershipPurchaseInput) },

  // ── bookings ──
  { name: "getBookingById", group: "bookings", desc: "One booking by id.", params: [p("bookingId", "string", "Booking id"), p("options", "json", "Optional BookingReadOptions JSON", false)], run: (c, [id, o]) => c.bookings.getById(id as string, o as BookingReadOptions | undefined) },
  { name: "searchBookingsByTimeRange", group: "bookings", desc: "Bookings within a time range.", params: [p("input", "json", "BookingTimeRangeSearch JSON")], run: (c, [i]) => c.bookings.searchByTimeRange(i as BookingTimeRangeSearch) },
  { name: "searchBookingsByTimeslot", group: "bookings", desc: "Bookings on a timeslot.", params: [p("timeslotId", "string", "Timeslot id"), p("options", "json", "Optional BookingReadOptions JSON", false)], run: (c, [id, o]) => c.bookings.searchByTimeslot(id as string, o as BookingReadOptions | undefined) },
  { name: "getBookingGuests", group: "bookings", desc: "Guests on a booking.", params: [p("bookingId", "string", "Booking id")], run: (c, [id]) => c.bookings.getGuests(id as string) },
  { name: "getBookingPaymentsOnFile", group: "bookings", desc: "Payments on file for a booking.", pii: true, params: [p("bookingId", "string", "Booking id")], run: (c, [id]) => c.bookings.getPaymentsOnFile(id as string) },
  { name: "appendBookingNote", group: "bookings", desc: "Append/replace a booking note.", params: [p("bookingId", "string", "Booking id"), p("note", "string", "Note text"), p("mode", "string", 'Optional: append|replace (default append)', false)], run: (c, [id, n, m]) => c.bookings.appendNote(id as string, n as string, m as NoteMode | undefined) },
  { name: "setBookingCheckinStatus", group: "bookings", desc: "Set a booking's check-in status.", params: [p("bookingId", "string", "Booking id"), p("checkedIn", "boolean", "true|false")], run: (c, [id, b]) => c.bookings.setCheckinStatus(id as string, b as boolean) },
  { name: "cancelBooking", group: "bookings", desc: "Cancel a booking.", params: [p("bookingId", "string", "Booking id"), p("notes", "string", "Optional cancel note", false)], run: (c, [id, n]) => c.bookings.cancel(id as string, n as string | undefined) },
  { name: "makeBookingPayment", group: "bookings", desc: "Take a payment on a booking.", pii: true, params: [p("input", "json", "MakePaymentInput JSON")], run: (c, [i]) => c.bookings.makePayment(i as MakePaymentInput) },
  { name: "refundBooking", group: "bookings", desc: "Refund a booking.", pii: true, params: [p("input", "json", "RefundInput JSON")], run: (c, [i]) => c.bookings.refund(i as RefundInput) },
  { name: "createBookingInvoiceLink", group: "bookings", desc: "Create an invoice link for a booking.", pii: true, params: [p("bookingId", "string", "Booking id")], run: (c, [id]) => c.bookings.createInvoiceLink(id as string) },
  { name: "listBookingAddons", group: "bookings", desc: "Add-ons available/attached on a booking.", params: [p("bookingId", "string", "Booking id")], run: (c, [id]) => c.bookings.listAddons(id as string) },
  { name: "addBookingAddon", group: "bookings", desc: "Add an add-on to a booking.", pii: true, params: [p("bookingId", "string", "Booking id"), p("input", "json", "AddAddonInput JSON")], run: (c, [id, i]) => c.bookings.addAddon(id as string, i as AddAddonInput) },
  { name: "removeBookingAddon", group: "bookings", desc: "Remove an add-on from a booking.", pii: true, params: [p("bookingId", "string", "Booking id"), p("input", "json", "AddAddonInput JSON")], run: (c, [id, i]) => c.bookings.removeAddon(id as string, i as AddAddonInput) },
  { name: "createBooking", group: "bookings", desc: "Create a booking.", params: [p("input", "json", "CreateBookingInput JSON")], run: (c, [i]) => c.bookings.create(i as CreateBookingInput) },

  // ── reviews ──
  { name: "getReviews", group: "reviews", desc: "Reviews for an activity.", params: [p("productId", "string", "Activity id"), p("reviewCount", "number", "Optional page size", false), p("reviewOffset", "number", "Optional offset", false)], run: (c, [id, n, o]) => c.reviews.getReviews(id as string, n as number | undefined, o as number | undefined) },
];

const BY_NAME = new Map(REGISTRY.map((f) => [f.name, f]));

// ─── Arg coercion + help ─────────────────────────────────────────────────────

function coerce(fn: FnSpec, raw: string[]): unknown[] {
  const required = fn.params.filter((param) => param.required).length;
  if (raw.length < required) {
    throw new Error(
      `"${fn.name}" needs ${required} param(s); got ${raw.length}. See: help ${fn.name}`,
    );
  }
  return fn.params.map((param, i) => {
    if (i >= raw.length) return undefined;
    const value = raw[i]!;
    switch (param.kind) {
      case "string":
        return value;
      case "number": {
        const n = Number(value);
        if (Number.isNaN(n)) throw new Error(`Param "${param.name}" must be a number, got "${value}".`);
        return n;
      }
      case "boolean":
        if (/^(1|true|yes)$/i.test(value)) return true;
        if (/^(0|false|no)$/i.test(value)) return false;
        throw new Error(`Param "${param.name}" must be true|false, got "${value}".`);
      case "json":
        try {
          return JSON.parse(value);
        } catch {
          throw new Error(`Param "${param.name}" must be valid JSON.`);
        }
    }
  });
}

function signature(fn: FnSpec): string {
  const parts = fn.params.map((param) =>
    param.required ? `<${param.name}>` : `[${param.name}]`,
  );
  return [fn.name, ...parts].join(" ");
}

function printHelp(): void {
  console.log("Usage: run.sh <authToken> <functionName> [params...]\n");
  console.log("       run.sh help                  list all functions");
  console.log("       run.sh help <functionName>   show a function's params\n");
  console.log("Static config comes from .env (PEEK_GATEWAY_KEY, PEEK_APP_ID,");
  console.log("PEEK_BASE_URL or PEEK_API_URL). PEEK_FULL_CUSTOMER_ACCESS=1 enables");
  console.log("PII-gated calls (marked [PII]). The auth token is passed per call.\n");
  let group = "";
  for (const fn of REGISTRY) {
    if (fn.group !== group) {
      group = fn.group;
      console.log(`\n${group}`);
    }
    const tag = fn.pii ? " [PII]" : "";
    console.log(`  ${signature(fn).padEnd(52)} ${fn.desc}${tag}`);
  }
}

function printFnHelp(name: string): void {
  const fn = BY_NAME.get(name);
  if (!fn) {
    console.error(`Unknown function "${name}". Run: help`);
    process.exitCode = 1;
    return;
  }
  console.log(`${signature(fn)}\n`);
  console.log(`  ${fn.desc}${fn.pii ? "  [PII — needs PEEK_FULL_CUSTOMER_ACCESS=1]" : ""}\n`);
  if (fn.params.length === 0) {
    console.log("  No parameters.");
    return;
  }
  console.log("  Parameters:");
  for (const param of fn.params) {
    const req = param.required ? "required" : "optional";
    console.log(`    ${param.name} (${param.kind}, ${req}) — ${param.desc}`);
  }
}

/** Renders a thrown error into a readable, structured object. */
function describeError(err: unknown): unknown {
  if (err instanceof Error) {
    const out: Record<string, unknown> = { name: err.name, message: err.message };
    for (const key of ["operation", "statusCode", "url", "body", "graphqlErrors"]) {
      const value = (err as unknown as Record<string, unknown>)[key];
      if (value !== undefined) out[key] = value;
    }
    return out;
  }
  return err;
}

// ─── Entry ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  loadDotEnv();
  const argv = process.argv.slice(2);

  if (argv.length === 0 || argv[0] === "help") {
    if (argv[0] === "help" && argv[1]) printFnHelp(argv[1]);
    else printHelp();
    return;
  }

  const [authToken, fnName, ...rest] = argv;
  if (!fnName) {
    console.error("Missing function name. Run: help");
    process.exitCode = 1;
    return;
  }
  const fn = BY_NAME.get(fnName);
  if (!fn) {
    console.error(`Unknown function "${fnName}". Run: help`);
    process.exitCode = 1;
    return;
  }
  if (!authToken) {
    console.error("Missing auth token (first argument).");
    process.exitCode = 1;
    return;
  }

  const args = coerce(fn, rest);
  const ctx = buildContext(authToken);
  const result = await fn.run(ctx, args);
  console.log(JSON.stringify(result ?? null, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify(describeError(err), null, 2));
  process.exitCode = 1;
});
