/**
 * Pure guide-matching logic: resolves a caller-supplied guide identifier to a
 * resource-pool id. A guide may be referenced by resource-pool id, by backing
 * account-user id, or by name (directly or via an account user).
 */
import type { ResourcePool } from "../../models/resource-pool.js";

/**
 * Resolves a `guideId` to a resource-pool id using `guideResourcePools`
 * (resource pools already filtered to the guide category) and `accountUsers`.
 * Returns the matched pool id, or `null` when nothing matches.
 */
export function matchGuideToResourcePool(
  guideId: string,
  guideResourcePools: ResourcePool[],
  accountUsers: Array<{ id: string; name: string }>,
): string | null {
  // Direct resource-pool id match.
  const directIdMatch = guideResourcePools.find((pool) => pool.id === guideId);
  if (directIdMatch) {
    return directIdMatch.id;
  }

  // Match by backing account-user id.
  const accountUserMatch = guideResourcePools.find(
    (pool) => pool.accountUser?.id === guideId,
  );
  if (accountUserMatch) {
    return accountUserMatch.id;
  }

  // Match by pool name.
  const nameMatch = guideResourcePools.find((pool) => pool.name === guideId);
  if (nameMatch) {
    return nameMatch.id;
  }

  // Resolve via an account user, then match its pool by id or name.
  const matchedUser = accountUsers.find((user) => user.id === guideId);
  if (matchedUser) {
    const userIdMatch = guideResourcePools.find(
      (pool) => pool.accountUser?.id === matchedUser.id,
    );
    /* v8 ignore next 3 -- unreachable: the earlier account-user id match already
       returns when a pool's accountUser.id equals the guideId; kept for source parity. */
    if (userIdMatch) {
      return userIdMatch.id;
    }

    const userNameMatch = guideResourcePools.find(
      (pool) => pool.name === matchedUser.name,
    );
    if (userNameMatch) {
      return userNameMatch.id;
    }
  }

  return null;
}
