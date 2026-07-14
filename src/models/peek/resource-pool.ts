/**
 * The clean data model for a Peek Pro resource pool (e.g. guides, equipment).
 */

/** Filter mode for which resource pools to return. */
export type ResourcePoolMode = "ACTIVITY" | "ALL";

/** A resource pool on a Peek Pro account. */
export interface ResourcePool {
  /** Unique identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Image URL, or null. */
  imageUrl: string | null;
  /** Allocation mode reported by Peek. */
  mode: string;
  /** Display color as a hex string, or null. */
  colorHex: string | null;
  /** Configured quantity, or null when not set. */
  quantity: number | null;
  /** Category (e.g. `"guide"`). */
  category: string;
  /** Capacity, or null when not set. */
  capacity: number | null;
  /** How the resource is tracked, or null. */
  resourceTrackingMode: string | null;
  /** The account user backing this pool (e.g. for guides), or null. */
  accountUser: ResourcePoolAccountUser | null;
}

/** Minimal account-user reference attached to a {@link ResourcePool}. */
export interface ResourcePoolAccountUser {
  id: string;
  name: string;
}
