import { describe, expect, it } from "vitest";

import { fromChannelsResponse } from "../../src/internal/resellers/channel-converter.js";
import type { ChannelsResponse } from "../../src/internal/resellers/channel-queries.js";

describe("fromChannelsResponse", () => {
  it("maps channels and flattens nested agents", () => {
    const response: ChannelsResponse = {
      channels: [
        {
          id: "ch-1",
          name: "Acme Tours",
          notes: "preferred",
          pricingModel: "NET",
          state: "ACTIVE",
          type: "RESELLER",
          agents: {
            edges: [
              {
                node: {
                  email: "a@acme.com",
                  name: "Agent A",
                  internalNotes: "vip",
                  phone: "+1",
                },
              },
            ],
          },
        },
      ],
    };

    expect(fromChannelsResponse(response)).toEqual([
      {
        id: "ch-1",
        name: "Acme Tours",
        notes: "preferred",
        pricingModel: "NET",
        state: "ACTIVE",
        type: "RESELLER",
        agents: [
          { email: "a@acme.com", name: "Agent A", internalNotes: "vip", phone: "+1" },
        ],
      },
    ]);
  });

  it("treats a channel with no agents connection as having no agents", () => {
    const response = {
      channels: [
        {
          id: "ch-2",
          name: "No Agents",
          notes: null,
          pricingModel: "GROSS",
          state: "ACTIVE",
          type: "RESELLER",
          agents: null,
        },
      ],
    } as ChannelsResponse;

    expect(fromChannelsResponse(response)[0]!.agents).toEqual([]);
  });

  it("returns an empty list for undefined data", () => {
    expect(fromChannelsResponse(undefined)).toEqual([]);
  });
});
