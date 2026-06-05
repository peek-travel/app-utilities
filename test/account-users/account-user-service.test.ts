import { describe, expect, it } from "vitest";

import { AccountUserService } from "../../src/internal/account-users/account-user-service.js";
import {
  GraphQLClient,
  type GraphQLClientOptions,
} from "../../src/internal/graphql-client.js";
import { noopLogger } from "../../src/logger.js";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as unknown as Response;
}

interface RecordedCall {
  url: string;
  init: RequestInit;
}

type Handler = (query: string, variables: Record<string, unknown>) => Response;

function makeFetch(handler: Handler): {
  fetchFn: typeof fetch;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const body = JSON.parse(init.body as string);
    return handler(body.query as string, body.variables);
  }) as unknown as typeof fetch;
  return { fetchFn, calls };
}

function buildClient(
  fetchFn: typeof fetch,
  overrides: Partial<GraphQLClientOptions> = {},
): GraphQLClient {
  return new GraphQLClient({
    baseUrl: "https://gw.test/gql",
    appId: "app-1",
    gatewayKey: "gw-key",
    getToken: () => "tok-123",
    retryDelaysMs: [],
    logger: noopLogger,
    fetchFn,
    ...overrides,
  });
}

function activeNode(id: string) {
  return {
    id,
    name: `User ${id}`,
    email: `${id}@example.com`,
    phone: "+1000",
    status: "ACTIVE",
    assignedActivities: [],
  };
}

function edge(id: string, status = "ACTIVE") {
  return { cursor: id, node: { ...activeNode(id), status } };
}

describe("AccountUserService.getAll", () => {
  it("paginates and returns only active users", async () => {
    let page = 0;
    const { fetchFn } = makeFetch((_query, variables) => {
      page += 1;
      if (page === 1) {
        expect(variables.after).toBeNull();
        return jsonResponse({
          data: {
            accountUsers: {
              pageInfo: { hasNextPage: true, endCursor: "c1" },
              edges: [edge("u1"), edge("u2", "INACTIVE")],
            },
          },
        });
      }
      expect(variables.after).toBe("c1");
      return jsonResponse({
        data: {
          accountUsers: {
            pageInfo: { hasNextPage: false, endCursor: null },
            edges: [edge("u3")],
          },
        },
      });
    });

    const users = await new AccountUserService(buildClient(fetchFn)).getAll();
    expect(users.map((u) => u.id)).toEqual(["u1", "u3"]);
  });

  it("returns an empty list when a 200 response carries no data", async () => {
    const { fetchFn } = makeFetch(() => jsonResponse({}));
    const users = await new AccountUserService(buildClient(fetchFn)).getAll();
    expect(users).toEqual([]);
  });

  it("stops after one page when pageInfo is absent and honors pageSize", async () => {
    const { fetchFn, calls } = makeFetch(() =>
      jsonResponse({ data: { accountUsers: { edges: [edge("u1")] } } }),
    );

    const users = await new AccountUserService(buildClient(fetchFn), {
      pageSize: 5,
    }).getAll();

    expect(users.map((u) => u.id)).toEqual(["u1"]);
    expect(JSON.parse(calls[0]!.init.body as string).variables.first).toBe(5);
  });
});

describe("AccountUserService.getById", () => {
  it("returns the matching active user", async () => {
    const { fetchFn, calls } = makeFetch((_query, variables) => {
      expect((variables.filter as { ids: string[] }).ids).toEqual(["u1"]);
      return jsonResponse({ data: { accountUsers: { edges: [edge("u1")] } } });
    });

    const user = await new AccountUserService(buildClient(fetchFn)).getById("u1");
    expect(user?.id).toBe("u1");
    expect(calls[0]!.url).toBe("https://gw.test/gql/app-1/sales");
  });

  it("returns null when there is no match", async () => {
    const { fetchFn } = makeFetch(() => jsonResponse({}));
    const user = await new AccountUserService(buildClient(fetchFn)).getById("missing");
    expect(user).toBeNull();
  });

  it("returns null when the matched user is inactive", async () => {
    const { fetchFn } = makeFetch(() =>
      jsonResponse({ data: { accountUsers: { edges: [edge("u1", "INACTIVE")] } } }),
    );
    const user = await new AccountUserService(buildClient(fetchFn)).getById("u1");
    expect(user).toBeNull();
  });
});
