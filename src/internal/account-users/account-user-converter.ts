/**
 * Pure functions mapping raw account-user nodes into the clean
 * {@link AccountUser} model. Inactive users are dropped (mapped to `null`).
 */
import type { AccountUser } from "../../models/account-user.js";
import type { AccountUserNode } from "./account-user-queries.js";

/** Only users in this status are surfaced. */
const ACTIVE_STATUS = "ACTIVE";

/**
 * Converts a single node into an {@link AccountUser}, or `null` when the node is
 * missing or the user is not active.
 */
export function fromAccountUserNode(
  node: AccountUserNode | null | undefined,
): AccountUser | null {
  if (!node || node.status !== ACTIVE_STATUS) {
    return null;
  }

  return {
    id: node.id,
    name: node.name,
    email: node.email,
    phone: node.phone,
    assignedActivities: (node.assignedActivities ?? []).map((activity) => ({
      id: activity.id,
      name: activity.name,
    })),
  };
}

/** Converts a list of nodes into active {@link AccountUser}s, dropping the rest. */
export function fromAccountUserNodes(
  nodes: Array<AccountUserNode | null | undefined>,
): AccountUser[] {
  const users: AccountUser[] = [];
  for (const node of nodes) {
    const user = fromAccountUserNode(node);
    if (user) {
      users.push(user);
    }
  }
  return users;
}
