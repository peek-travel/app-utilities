import { describe, expect, it } from "vitest";

import { fromMembershipsResponse } from "../../src/internal/memberships/membership-converter.js";
import type { MembershipsResponse } from "../../src/internal/memberships/membership-queries.js";

describe("fromMembershipsResponse", () => {
  it("flattens each variant into its own record", () => {
    const response: MembershipsResponse = {
      memberships: [
        {
          id: "m1",
          name: "Gold",
          membershipVariants: [
            {
              id: "v1",
              description: "annual",
              imageUrl: "https://img/v1.png",
              externalName: "Gold Annual",
              internalName: "gold-annual",
            },
            {
              id: "v2",
              description: null,
              imageUrl: null,
              externalName: "Gold Monthly",
              internalName: "gold-monthly",
            },
          ],
        },
      ],
    };

    expect(fromMembershipsResponse(response)).toEqual([
      {
        id: "m1",
        membershipVariantId: "v1",
        description: "annual",
        externalName: "Gold Annual",
        imageUrl: "https://img/v1.png",
        internalName: "gold-annual",
        displayName: "Gold",
      },
      {
        id: "m1",
        membershipVariantId: "v2",
        description: null,
        externalName: "Gold Monthly",
        imageUrl: null,
        internalName: "gold-monthly",
        displayName: "Gold",
      },
    ]);
  });

  it("produces no records for a membership with no variants", () => {
    const response = {
      memberships: [{ id: "m2", name: "Empty", membershipVariants: [] }],
    } as MembershipsResponse;
    expect(fromMembershipsResponse(response)).toEqual([]);
  });

  it("tolerates a membership with no membershipVariants field", () => {
    const response = { memberships: [{ id: "m3", name: "Bare" }] } as unknown as MembershipsResponse;
    expect(fromMembershipsResponse(response)).toEqual([]);
  });

  it("returns an empty list for undefined data", () => {
    expect(fromMembershipsResponse(undefined)).toEqual([]);
  });
});
