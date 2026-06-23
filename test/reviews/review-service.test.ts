import { describe, expect, it } from "vitest";

import {
  GraphQLClient,
  type GraphQLClientOptions,
} from "../../src/internal/graphql-client.js";
import { ReviewService } from "../../src/internal/reviews/review-service.js";
import { decodeOffset } from "../../src/internal/reviews/review-cursor.js";
import type {
  ReviewEdge,
  ReviewNode,
} from "../../src/internal/reviews/review-queries.js";
import { noopLogger } from "../../src/logger.js";

const ACTIVITY = "act-1";

interface Row {
  id: string;
  date: string;
}

function nodeFor(row: Row): ReviewNode {
  return {
    activity: { id: ACTIVITY, name: "Downtown Bike Tour" },
    guides: [],
    id: row.id,
    name: "Customer",
    email: "c@example.com",
    rating: 5,
    comment: null,
    reviewedAt: `${row.date}T12:00:00.000000Z`,
    purchasedFor: `${row.date}T10:00:00.000000Z`,
  };
}

/** Encodes a real gateway cursor: base64 of `range:start..end,offset`. */
function encodeReal(start: number, end: number, offset: number): string {
  return Buffer.from(`range:${start}..${end},${offset}`).toString("base64");
}

/**
 * A fake reviews gateway over an ordered (newest-first) row list. It mints
 * offset-based cursors exactly like the real gateway, supports prepending /
 * replacing rows (to model added or churned reviews), and records the decoded
 * `after` offset of every request so tests can assert pagination behavior.
 */
class FakeGateway {
  private rows: Row[];
  /** Decoded `after` offset of each request (`null` for the first page). */
  readonly afters: (number | null)[] = [];

  constructor(
    rows: Row[],
    private readonly pageSize: number,
  ) {
    this.rows = [...rows];
  }

  prepend(rows: Row[]): void {
    this.rows = [...rows, ...this.rows];
  }

  replace(rows: Row[]): void {
    this.rows = [...rows];
  }

  reset(): void {
    this.afters.length = 0;
  }

  get fetchCount(): number {
    return this.afters.length;
  }

  readonly fetchFn = (async (_url: string, init: RequestInit) => {
    const vars = JSON.parse(init.body as string).variables as {
      after: string | null;
      first: number;
    };
    this.afters.push(vars.after === null ? null : decodeOffset(vars.after));
    const startIdx = vars.after === null ? 0 : decodeOffset(vars.after) + 1;
    const slice = this.rows.slice(startIdx, startIdx + vars.first);
    const endIdx = startIdx + slice.length - 1;
    const edges: ReviewEdge[] = slice.map((row, i) => ({
      cursor: encodeReal(startIdx, endIdx, startIdx + i),
      node: nodeFor(row),
    }));
    return {
      status: 200,
      ok: true,
      json: async () => ({ data: { reviews: { edges } } }),
    } as unknown as Response;
  }) as unknown as typeof fetch;
}

function buildClient(fetchFn: typeof fetch): GraphQLClient {
  const options: GraphQLClientOptions = {
    baseUrl: "https://gw.test/gql",
    appId: "app-1",
    gatewayKey: "gw-key",
    getToken: () => "tok",
    retryDelaysMs: [],
    logger: noopLogger,
    fetchFn,
  };
  return new GraphQLClient(options);
}

function serviceOver(gateway: FakeGateway, pageSize = 2): ReviewService {
  return new ReviewService(buildClient(gateway.fetchFn), { pageSize });
}

// Newest-first. Page size 2 ⇒ pages [r0,r1] [r2,r3] [r4,r5] [r6,r7] [r8,r9].
const ROWS: Row[] = [
  { id: "r0", date: "2025-09-10" },
  { id: "r1", date: "2025-09-08" },
  { id: "r2", date: "2025-09-06" },
  { id: "r3", date: "2025-09-04" },
  { id: "r4", date: "2025-08-20" },
  { id: "r5", date: "2025-08-18" },
  { id: "r6", date: "2025-08-05" },
  { id: "r7", date: "2025-08-03" },
  { id: "r8", date: "2025-07-20" },
  { id: "r9", date: "2025-07-10" },
];

const WINDOW: [string, string] = ["2025-08-01", "2025-08-25"];

describe("ReviewService.getReviews — windowing", () => {
  it("returns only in-window reviews, newest-first, stopping past the start", async () => {
    const gw = new FakeGateway(ROWS, 2);
    const reviews = await serviceOver(gw).getReviews(ACTIVITY, ...WINDOW);

    expect(reviews.map((r) => r.id)).toEqual(["r4", "r5", "r6", "r7"]);
    expect(reviews[0]).toMatchObject({
      productId: ACTIVITY,
      productName: "Downtown Bike Tour",
      reviewDate: "2025-08-20",
      activityDate: "2025-08-20",
    });
    expect(gw.afters).toEqual([null, 1, 3, 5, 7]); // full walk from the top
  });

  it("returns an empty array when no reviews come back", async () => {
    const gw = new FakeGateway([], 2);
    expect(await serviceOver(gw).getReviews(ACTIVITY, ...WINDOW)).toEqual([]);
  });

  it("stops paginating once a short (final) page is returned", async () => {
    const gw = new FakeGateway(
      [
        { id: "s0", date: "2025-08-20" },
        { id: "s1", date: "2025-08-15" },
        { id: "s2", date: "2025-08-10" },
      ],
      2,
    );
    const reviews = await serviceOver(gw).getReviews(ACTIVITY, "2025-08-01", "2025-08-31");

    expect(reviews.map((r) => r.id)).toEqual(["s0", "s1", "s2"]);
    expect(gw.afters).toEqual([null, 1]); // page 2 is short → stop, no third fetch
  });
});

describe("ReviewService.getReviews — cursor cache (stable offsets)", () => {
  it("re-uses the cache to jump ahead and fetch fewer pages", async () => {
    const gw = new FakeGateway(ROWS, 2);
    const service = serviceOver(gw);

    const first = await service.getReviews(ACTIVITY, ...WINDOW);
    expect(gw.afters).toEqual([null, 1, 3, 5, 7]);
    const coldFetches = gw.fetchCount;
    gw.reset();

    const second = await service.getReviews(ACTIVITY, ...WINDOW);
    expect(second.map((r) => r.id)).toEqual(first.map((r) => r.id));
    // Anchors head on page 1 (offset 0), then jumps straight to the 09-04
    // boundary (offset 3), skipping page 2.
    expect(gw.afters).toEqual([null, 3, 5, 7]);
    expect(gw.fetchCount).toBeLessThan(coldFetches);
  });

  it("re-anchors cached offsets when new reviews are prepended", async () => {
    const gw = new FakeGateway(ROWS, 2);
    const service = serviceOver(gw);

    await service.getReviews(ACTIVITY, ...WINDOW); // seeds cache, headId = r0
    gw.prepend([
      { id: "n0", date: "2025-09-20" },
      { id: "n1", date: "2025-09-15" },
    ]);
    gw.reset();

    const reviews = await service.getReviews(ACTIVITY, ...WINDOW);

    expect(reviews.map((r) => r.id)).toEqual(["r4", "r5", "r6", "r7"]);
    // r0 (old head) now sits at offset 2 ⇒ shift = 2. The cached 09-04 boundary
    // (old offset 3) is re-anchored to 5 and used as the jump target.
    expect(gw.afters).toEqual([null, 1, 5, 7, 9]);
    expect(gw.afters[2]).toBe(5);
  });

  it("re-anchors with a zero shift when nothing changed, then a later prepend works", async () => {
    const gw = new FakeGateway(ROWS, 2);
    const service = serviceOver(gw);

    await service.getReviews(ACTIVITY, ...WINDOW);
    await service.getReviews(ACTIVITY, ...WINDOW); // head r0 at offset 0, shift 0
    gw.prepend([{ id: "n0", date: "2025-09-20" }]); // shift becomes 1
    gw.reset();

    const reviews = await service.getReviews(ACTIVITY, ...WINDOW);
    expect(reviews.map((r) => r.id)).toEqual(["r4", "r5", "r6", "r7"]);
    // 09-04 boundary (old offset 3) re-anchored to 4 after the single prepend.
    expect(gw.afters[gw.afters.indexOf(4)]).toBe(4);
  });

  it("falls back to a full walk when the cached head is gone", async () => {
    const gw = new FakeGateway(ROWS, 2);
    const service = serviceOver(gw);

    await service.getReviews(ACTIVITY, ...WINDOW); // headId = r0
    // Entirely churned dataset — same shape/dates, new ids. r0 no longer exists.
    gw.replace(ROWS.map((row) => ({ ...row, id: row.id.replace("r", "x") })));
    gw.reset();

    const reviews = await service.getReviews(ACTIVITY, ...WINDOW);
    expect(reviews.map((r) => r.id)).toEqual(["x4", "x5", "x6", "x7"]);
    expect(gw.afters).toEqual([null, 1, 3, 5, 7]); // no jump — walked from the top
  });

  it("ignores the cache when useCache is false", async () => {
    const gw = new FakeGateway(ROWS, 2);
    const service = serviceOver(gw);

    await service.getReviews(ACTIVITY, ...WINDOW);
    gw.reset();

    const reviews = await service.getReviews(ACTIVITY, WINDOW[0], WINDOW[1], false);
    expect(reviews.map((r) => r.id)).toEqual(["r4", "r5", "r6", "r7"]);
    expect(gw.afters).toEqual([null, 1, 3, 5, 7]); // walked from the top again
  });

  it("walks from the top (no jump) when all cached dates are older than startDate", async () => {
    const gw = new FakeGateway(ROWS, 2);
    const service = serviceOver(gw);

    await service.getReviews(ACTIVITY, ...WINDOW); // cache dates max out at 09-08
    gw.reset();

    // Window sits above every cached boundary (start 09-09 > 09-08).
    const recent = await service.getReviews(ACTIVITY, "2025-09-09", "2025-09-10");
    expect(recent.map((r) => r.id)).toEqual(["r0"]);
    expect(gw.afters).toEqual([null]); // no cached date > endDate ⇒ no jump
  });

  it("jumps to a cached deep boundary for a different, older window", async () => {
    const gw = new FakeGateway(ROWS, 2);
    const service = serviceOver(gw);

    await service.getReviews(ACTIVITY, ...WINDOW); // caches boundaries down to 07-10
    gw.reset();

    const older = await service.getReviews(ACTIVITY, "2025-07-05", "2025-07-25");
    expect(older.map((r) => r.id)).toEqual(["r8", "r9"]);
    // Anchors on page 1, jumps to the 08-03 boundary (offset 7), reads the
    // final full page, then one empty page confirms the end.
    expect(gw.afters).toEqual([null, 7, 9]);
  });
});

describe("ReviewService.getReviews — validation", () => {
  const service = () => serviceOver(new FakeGateway(ROWS, 2));

  it("rejects an empty productId", async () => {
    await expect(service().getReviews("", ...WINDOW)).rejects.toThrow(
      /productId is required/,
    );
  });

  it("rejects malformed dates", async () => {
    await expect(
      service().getReviews(ACTIVITY, "2025-8-1", "2025-08-31"),
    ).rejects.toThrow(/YYYY-MM-DD/);
    await expect(
      service().getReviews(ACTIVITY, "2025-13-40", "2025-08-31"),
    ).rejects.toThrow(/YYYY-MM-DD/);
  });

  it("rejects startDate after endDate", async () => {
    await expect(
      service().getReviews(ACTIVITY, "2025-09-01", "2025-08-31"),
    ).rejects.toThrow(/startDate must not be after endDate/);
  });

  it("rejects a window wider than 31 days", async () => {
    await expect(
      service().getReviews(ACTIVITY, "2025-01-01", "2025-03-01"),
    ).rejects.toThrow(/31 days/);
  });

  it("allows a window of exactly 31 days", async () => {
    await expect(
      service().getReviews(ACTIVITY, "2025-01-01", "2025-02-01"),
    ).resolves.toBeInstanceOf(Array);
  });
});
