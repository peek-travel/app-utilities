/**
 * Reseller-channel operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getResellerService}.
 */
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type { Channel } from "../../models/channel.js";
import { fromChannelsResponse } from "./channel-converter.js";
import { CHANNELS_QUERY, type ChannelsResponse } from "./channel-queries.js";

/** Default number of agents fetched per channel. */
const DEFAULT_AGENTS_PER_CHANNEL = 10;

export class ResellerService {
  constructor(private readonly client: GraphQLClient) {}

  /**
   * Returns all reseller channels, each with up to `agentsPerChannel` agents
   * (default 10).
   */
  async getAllChannels(
    agentsPerChannel: number = DEFAULT_AGENTS_PER_CHANNEL,
  ): Promise<Channel[]> {
    const body: GraphQLBody<ChannelsResponse> =
      await this.client.request<ChannelsResponse>(SALES_ENDPOINT, CHANNELS_QUERY, {
        first: agentsPerChannel,
      });
    return fromChannelsResponse(body.data);
  }
}
