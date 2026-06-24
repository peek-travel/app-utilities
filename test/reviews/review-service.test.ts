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

/** The `after`/`first` of a single recorded request (`after` decoded to its offset). */
interface RecordedRequest {
  after: number | null;
  first: number;
}

/**
 * A fake reviews gateway over an ordered (newest-first) row list. It mints
 * offset-based cursors exactly like the real gateway and records the decoded
 * `after` offset and `first` of every request so tests can assert what was sent.
 */
class FakeGateway {
  readonly requests: RecordedRequest[] = [];

  constructor(private readonly rows: Row[]) {}

  readonly fetchFn = (async (_url: string, init: RequestInit) => {
    const vars = JSON.parse(init.body as string).variables as {
      after: string | null;
      first: number;
    };
    const after = vars.after === null ? null : decodeOffset(vars.after);
    this.requests.push({ after, first: vars.first });
    const startIdx = after === null ? 0 : after + 1;
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

function serviceOver(gateway: FakeGateway): ReviewService {
  return new ReviewService(buildClient(gateway.fetchFn));
}

// Newest-first (descending review date).
const ROWS: Row[] = [
  { id: "r0", date: "2025-09-10" },
  { id: "r1", date: "2025-09-08" },
  { id: "r2", date: "2025-09-06" },
  { id: "r3", date: "2025-09-04" },
  { id: "r4", date: "2025-08-20" },
  { id: "r5", date: "2025-08-18" },
];

describe("ReviewService.getReviews", () => {
  it("returns up to the default 50 reviews, newest-first, with no cursor", async () => {
    const gw = new FakeGateway(ROWS);
    const reviews = await serviceOver(gw).getReviews(ACTIVITY);

    expect(reviews.map((r) => r.id)).toEqual(["r0", "r1", "r2", "r3", "r4", "r5"]);
    expect(reviews[0]).toMatchObject({
      productId: ACTIVITY,
      productName: "Downtown Bike Tour",
      reviewDate: "2025-09-10",
    });
    expect(gw.requests).toEqual([{ after: null, first: 50 }]);
  });

  it("limits the page to reviewCount", async () => {
    const gw = new FakeGateway(ROWS);
    const reviews = await serviceOver(gw).getReviews(ACTIVITY, 3);

    expect(reviews.map((r) => r.id)).toEqual(["r0", "r1", "r2"]);
    expect(gw.requests).toEqual([{ after: null, first: 3 }]);
  });

  it("skips reviewOffset reviews via a cursor anchored just before the window", async () => {
    const gw = new FakeGateway(ROWS);
    const reviews = await serviceOver(gw).getReviews(ACTIVITY, 2, 4);

    expect(reviews.map((r) => r.id)).toEqual(["r4", "r5"]);
    // offset 4 ⇒ resume after absolute offset 3, asking for 2 reviews.
    expect(gw.requests).toEqual([{ after: 3, first: 2 }]);
  });

  it("omits the cursor when reviewOffset is 0", async () => {
    const gw = new FakeGateway(ROWS);
    await serviceOver(gw).getReviews(ACTIVITY, 2, 0);

    expect(gw.requests).toEqual([{ after: null, first: 2 }]);
  });

  it("returns an empty array when no reviews come back", async () => {
    const gw = new FakeGateway([]);
    expect(await serviceOver(gw).getReviews(ACTIVITY)).toEqual([]);
  });
});

describe("ReviewService.getReviews — validation", () => {
  const service = () => serviceOver(new FakeGateway(ROWS));

  it("rejects an empty productId", async () => {
    await expect(service().getReviews("")).rejects.toThrow(/productId is required/);
  });

  it("rejects a reviewCount below 1", async () => {
    await expect(service().getReviews(ACTIVITY, 0)).rejects.toThrow(
      /reviewCount must be an integer between 1 and 50/,
    );
  });

  it("rejects a reviewCount above 50", async () => {
    await expect(service().getReviews(ACTIVITY, 51)).rejects.toThrow(
      /reviewCount must be an integer between 1 and 50/,
    );
  });

  it("rejects a non-integer reviewCount", async () => {
    await expect(service().getReviews(ACTIVITY, 2.5)).rejects.toThrow(
      /reviewCount must be an integer between 1 and 50/,
    );
  });

  it("rejects a negative reviewOffset", async () => {
    await expect(service().getReviews(ACTIVITY, 10, -1)).rejects.toThrow(
      /reviewOffset must be a non-negative integer/,
    );
  });

  it("rejects a non-integer reviewOffset", async () => {
    await expect(service().getReviews(ACTIVITY, 10, 1.5)).rejects.toThrow(
      /reviewOffset must be a non-negative integer/,
    );
  });
});
