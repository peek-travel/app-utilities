import { describe, expect, it } from "vitest";

import { matchGuideToResourcePool } from "../../src/internal/timeslots/guide-matcher.js";
import type { ResourcePool } from "../../src/models/resource-pool.js";

function pool(overrides: Partial<ResourcePool>): ResourcePool {
  return {
    id: "pool-x",
    name: "Pool X",
    imageUrl: null,
    mode: "ALL",
    colorHex: null,
    quantity: null,
    category: "guide",
    capacity: null,
    resourceTrackingMode: null,
    accountUser: null,
    ...overrides,
  };
}

describe("matchGuideToResourcePool", () => {
  const pools: ResourcePool[] = [
    pool({ id: "pool-1", name: "Ada", accountUser: { id: "u1", name: "Ada User" } }),
    pool({ id: "pool-2", name: "Grace", accountUser: null }),
  ];
  const accountUsers = [
    { id: "u1", name: "Ada User" },
    { id: "u9", name: "Nobody" },
  ];

  it("matches by resource-pool id", () => {
    expect(matchGuideToResourcePool("pool-2", pools, accountUsers)).toBe("pool-2");
  });

  it("matches by backing account-user id", () => {
    expect(matchGuideToResourcePool("u1", pools, accountUsers)).toBe("pool-1");
  });

  it("matches by pool name", () => {
    expect(matchGuideToResourcePool("Grace", pools, accountUsers)).toBe("pool-2");
  });

  it("resolves via account user, then matches pool by account-user id", () => {
    const onlyUserLinked = [pool({ id: "pool-3", name: "X", accountUser: { id: "u5", name: "Eve" } })];
    expect(
      matchGuideToResourcePool("u5", onlyUserLinked, [{ id: "u5", name: "Eve" }]),
    ).toBe("pool-3");
  });

  it("resolves via account user, then matches pool by the user's name", () => {
    const namedPool = [pool({ id: "pool-4", name: "Eve", accountUser: null })];
    expect(
      matchGuideToResourcePool("u7", namedPool, [{ id: "u7", name: "Eve" }]),
    ).toBe("pool-4");
  });

  it("returns null when nothing matches", () => {
    expect(matchGuideToResourcePool("nope", pools, accountUsers)).toBeNull();
  });

  it("returns null when the resolved user has no matching pool", () => {
    expect(
      matchGuideToResourcePool("u9", pools, accountUsers),
    ).toBeNull();
  });
});
