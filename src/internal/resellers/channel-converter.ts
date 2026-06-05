/**
 * Pure functions mapping raw channel nodes into the clean {@link Channel}
 * model, flattening the agents edge/node structure.
 */
import type { Channel } from "../../models/channel.js";
import type { ChannelNode, ChannelsResponse } from "./channel-queries.js";

/** Converts a channels response into {@link Channel}s. */
export function fromChannelsResponse(
  response: ChannelsResponse | undefined,
): Channel[] {
  return (response?.channels ?? []).map(fromChannelNode);
}

function fromChannelNode(node: ChannelNode): Channel {
  return {
    id: node.id,
    name: node.name,
    notes: node.notes,
    pricingModel: node.pricingModel,
    state: node.state,
    type: node.type,
    agents: (node.agents?.edges ?? []).map((edge) => ({
      email: edge.node.email,
      name: edge.node.name,
      internalNotes: edge.node.internalNotes,
      phone: edge.node.phone,
    })),
  };
}
