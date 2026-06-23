import { describe, expect, it } from "vitest";

import {
  fromReviewNode,
  toDateOnly,
} from "../../src/internal/reviews/review-converter.js";
import type { ReviewNode } from "../../src/internal/reviews/review-queries.js";

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
