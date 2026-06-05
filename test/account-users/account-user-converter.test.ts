import { describe, expect, it } from "vitest";

import {
  fromAccountUserNode,
  fromAccountUserNodes,
} from "../../src/internal/account-users/account-user-converter.js";
import type { AccountUserNode } from "../../src/internal/account-users/account-user-queries.js";

const activeNode: AccountUserNode = {
  id: "u1",
  name: "Ada Guide",
  email: "ada@example.com",
  phone: "+1000",
  status: "ACTIVE",
  assignedActivities: [{ id: "act-1", name: "Kayak Tour" }],
};

describe("fromAccountUserNode", () => {
  it("maps an active node, dropping status", () => {
    expect(fromAccountUserNode(activeNode)).toEqual({
      id: "u1",
      name: "Ada Guide",
      email: "ada@example.com",
      phone: "+1000",
      assignedActivities: [{ id: "act-1", name: "Kayak Tour" }],
    });
  });

  it("returns null for an inactive user", () => {
    expect(fromAccountUserNode({ ...activeNode, status: "INACTIVE" })).toBeNull();
  });

  it("returns null for a missing node", () => {
    expect(fromAccountUserNode(null)).toBeNull();
    expect(fromAccountUserNode(undefined)).toBeNull();
  });

  it("defaults assignedActivities to an empty array", () => {
    const node = { ...activeNode, assignedActivities: undefined } as unknown as AccountUserNode;
    expect(fromAccountUserNode(node)?.assignedActivities).toEqual([]);
  });
});

describe("fromAccountUserNodes", () => {
  it("keeps active users and drops inactive ones", () => {
    const result = fromAccountUserNodes([
      activeNode,
      { ...activeNode, id: "u2", status: "INACTIVE" },
      { ...activeNode, id: "u3" },
    ]);
    expect(result.map((u) => u.id)).toEqual(["u1", "u3"]);
  });
});
