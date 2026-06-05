/**
 * Raw Peek GraphQL query and response shape for reseller channels. Internal.
 *
 * Channels themselves are returned in full; `$first` limits the number of
 * agents fetched per channel.
 */

/** Fetches reseller channels with up to `$first` agents each. */
export const CHANNELS_QUERY = `
  query Sales($first: Int) {
    channels {
      id
      agents(first: $first) {
        edges {
          node {
            email
            name
            internalNotes
            phone
          }
        }
      }
      name
      notes
      state
      type
      pricingModel
    }
  }
`;

/** A single agent node. */
export interface AgentNode {
  email: string | null;
  name: string;
  internalNotes: string | null;
  phone: string | null;
}

/** A single channel node as returned by {@link CHANNELS_QUERY}. */
export interface ChannelNode {
  id: string;
  name: string;
  notes: string | null;
  pricingModel: string;
  state: string;
  type: string;
  agents: { edges: Array<{ node: AgentNode }> } | null;
}

/** The `data` payload of {@link CHANNELS_QUERY}. */
export interface ChannelsResponse {
  channels: ChannelNode[];
}
