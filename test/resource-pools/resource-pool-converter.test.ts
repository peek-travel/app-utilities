import { describe, expect, it } from "vitest";

import { fromResourcePoolsResponse } from "../../src/internal/resource-pools/resource-pool-converter.js";
import type {
  ResourcePoolNode,
  ResourcePoolsResponse,
} from "../../src/internal/resource-pools/resource-pool-queries.js";

function emptyPoolNode(): ResourcePoolNode {
  return {
    id: "",
    name: "",
    imageUrl: null,
    mode: "",
    colorHex: null,
    quantity: null,
    category: "",
    capacity: null,
    resourceTrackingMode: null,
    accountUser: null,
  };
}

describe("fromResourcePoolsResponse", () => {
  it("maps a full resource-pool node", () => {
    const response: ResourcePoolsResponse = {
      resourcePools: [
        {
          id: "pool-1",
          name: "Ada",
          imageUrl: "https://img/ada.png",
          mode: "ACTIVITY",
          colorHex: "#112233",
          quantity: 3,
          category: "guide",
          capacity: 10,
          resourceTrackingMode: "INDIVIDUAL",
          accountUser: { id: "u1", name: "Ada Guide" },
        },
      ],
    };

    expect(fromResourcePoolsResponse(response)).toEqual([
      {
        id: "pool-1",
        name: "Ada",
        imageUrl: "https://img/ada.png",
        mode: "ACTIVITY",
        colorHex: "#112233",
        quantity: 3,
        category: "guide",
        capacity: 10,
        resourceTrackingMode: "INDIVIDUAL",
        accountUser: { id: "u1", name: "Ada Guide" },
      },
    ]);
  });

  it("applies null/empty defaults and a null account user", () => {
    const response = {
      resourcePools: [
        {
          id: "",
          name: "",
          imageUrl: null,
          mode: "",
          colorHex: null,
          quantity: null,
          category: "",
          capacity: null,
          resourceTrackingMode: null,
          accountUser: null,
        },
      ],
    } as ResourcePoolsResponse;

    expect(fromResourcePoolsResponse(response)).toEqual([
      {
        id: "",
        name: "",
        imageUrl: null,
        mode: "",
        colorHex: null,
        quantity: null,
        category: "",
        capacity: null,
        resourceTrackingMode: null,
        accountUser: null,
      },
    ]);
  });

  it("defaults empty account-user id/name to empty strings", () => {
    const response = {
      resourcePools: [{ ...emptyPoolNode(), accountUser: { id: "", name: "" } }],
    } as ResourcePoolsResponse;

    expect(fromResourcePoolsResponse(response)[0]!.accountUser).toEqual({
      id: "",
      name: "",
    });
  });

  it("returns an empty list for undefined data", () => {
    expect(fromResourcePoolsResponse(undefined)).toEqual([]);
  });
});
