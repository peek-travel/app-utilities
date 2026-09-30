import { describe, expect, it } from "vitest";

import {
  fromActivityReviewSummaryNode,
  fromActivityReviewSummaryNodes,
  fromReviewNode,
  toDateOnly,
} from "../../../src/internal/peek/reviews/review-converter.js";
import type {
  ActivityReviewSummaryNode,
  ReviewNode,
} from "../../../src/internal/peek/reviews/review-queries.js";

function node(overrides: Partial<ReviewNode> = {}): ReviewNode {
  return {
    activity: { id: "act-1", name: "Downtown Bike Tour" },
    guides: [{ id: "u_y6e4r", name: "Oskar Bruening" }],
    id: "rvw_1",
    name: "Oskar Test",
    email: "oskar@peek.com",
    rating: 5,
    comment: "Great",
    reviewedAt: "2025-08-06T16:40:49.000000Z",
    purchasedFor: "2025-08-04T16:30:00.000000Z",
    ...overrides,
  };
}

describe("toDateOnly", () => {
  it("extracts the YYYY-MM-DD prefix", () => {
    expect(toDateOnly("2025-08-06T16:40:49.000000Z")).toBe("2025-08-06");
  });
});

describe("fromReviewNode", () => {
  it("maps a fully populated node to the clean model", () => {
    expect(fromReviewNode(node())).toEqual({
      id: "rvw_1",
      productId: "act-1",
      productName: "Downtown Bike Tour",
      guides: [{ id: "u_y6e4r", name: "Oskar Bruening" }],
      customerName: "Oskar Test",
      customerEmail: "oskar@peek.com",
      activityDate: "2025-08-04",
      reviewDate: "2025-08-06",
      rating: 5,
      comment: "Great",
    });
  });

  it("coerces null guides/name/email/comment to safe defaults", () => {
    const review = fromReviewNode(
      node({ guides: null, name: null, email: null, comment: null }),
    );
    expect(review.guides).toEqual([]);
    expect(review.customerName).toBeNull();
    expect(review.customerEmail).toBeNull();
    expect(review.comment).toBeNull();
  });

  it("falls back to empty strings when activity is missing", () => {
    const review = fromReviewNode(node({ activity: null }));
    expect(review.productId).toBe("");
    expect(review.productName).toBe("");
  });
});

function summaryNode(
  overrides: Partial<ActivityReviewSummaryNode> = {},
): ActivityReviewSummaryNode {
  return {
    id: "act-1",
    name: "Downtown Bike Tour",
    reviewMeta: {
      avgRating: 4.5,
      count: 10,
      fiveStar: 6,
      fourStar: 2,
      threeStar: 1,
      twoStar: 1,
      oneStar: 0,
    },
    ...overrides,
  };
}

describe("fromActivityReviewSummaryNode", () => {
  it("maps a fully populated node to the clean summary", () => {
    expect(fromActivityReviewSummaryNode(summaryNode())).toEqual({
      productId: "act-1",
      productName: "Downtown Bike Tour",
      avgRating: 4.5,
      countTotal: 10,
      countOneStar: 0,
      countTwoStar: 1,
      countThreeStar: 1,
      countFourStar: 2,
      countFiveStar: 6,
    });
  });

  it("collapses a null reviewMeta to null average and zero counts", () => {
    expect(fromActivityReviewSummaryNode(summaryNode({ reviewMeta: null }))).toEqual({
      productId: "act-1",
      productName: "Downtown Bike Tour",
      avgRating: null,
      countTotal: 0,
      countOneStar: 0,
      countTwoStar: 0,
      countThreeStar: 0,
      countFourStar: 0,
      countFiveStar: 0,
    });
  });

  it("keeps a null avgRating when there are no ratings", () => {
    const summary = fromActivityReviewSummaryNode(
      summaryNode({
        reviewMeta: { avgRating: null, count: 0, fiveStar: 0, fourStar: 0, threeStar: 0, twoStar: 0, oneStar: 0 },
      }),
    );
    expect(summary.avgRating).toBeNull();
    expect(summary.countTotal).toBe(0);
  });
});

describe("fromActivityReviewSummaryNodes", () => {
  it("maps every node in order", () => {
    const summaries = fromActivityReviewSummaryNodes([
      summaryNode({ id: "act-1", name: "One" }),
      summaryNode({ id: "act-2", name: "Two", reviewMeta: null }),
    ]);
    expect(summaries.map((s) => s.productId)).toEqual(["act-1", "act-2"]);
    expect(summaries[1]!.avgRating).toBeNull();
  });

  it("returns [] for no activities", () => {
    expect(fromActivityReviewSummaryNodes([])).toEqual([]);
  });
});
