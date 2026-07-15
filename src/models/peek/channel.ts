/**
 * The clean data model for Peek Pro reseller channels and their agents.
 */

/** A reseller channel on a Peek Pro account. */
export interface Channel {
  /** Unique identifier. */
  id: string;
  /** Channel name. */
  name: string;
  /** Free-text notes, or null. */
  notes: string | null;
  /** Pricing model reported by Peek. */
  pricingModel: string;
  /** Channel state (e.g. active/inactive). */
  state: string;
  /** Channel type. */
  type: string;
  /** Agents belonging to this channel. */
  agents: Agent[];
}

/** An agent (contact) belonging to a {@link Channel}. */
export interface Agent {
  /** Email address, or null. */
  email: string | null;
  /** Agent name. */
  name: string;
  /** Internal notes, or null. */
  internalNotes: string | null;
  /** Phone number, or null. */
  phone: string | null;
}
