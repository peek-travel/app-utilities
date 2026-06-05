/**
 * Pure function flattening raw membership nodes into the clean
 * {@link Membership} model — one record per variant.
 */
import type { Membership } from "../../models/membership.js";
import type { MembershipsResponse } from "./membership-queries.js";

/** Flattens a memberships response into one {@link Membership} per variant. */
export function fromMembershipsResponse(
  response: MembershipsResponse | undefined,
): Membership[] {
  return (response?.memberships ?? []).flatMap((membership) =>
    (membership.membershipVariants ?? []).map((variant) => ({
      id: membership.id,
      membershipVariantId: variant.id,
      description: variant.description ?? null,
      externalName: variant.externalName,
      imageUrl: variant.imageUrl ?? null,
      internalName: variant.internalName,
      displayName: membership.name,
    })),
  );
}
