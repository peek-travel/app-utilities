import { describe, expect, it } from "vitest";

import { DailyNoteService } from "../../src/internal/daily-notes/daily-note-service.js";
import {
  GraphQLClient,
  type GraphQLClientOptions,
} from "../../src/internal/graphql-client.js";
import { noopLogger } from "../../src/logger.js";

interface RecordedCall {
  url: string;
  init: RequestInit;
}

function makeFetch(body: unknown): {
  fetchFn: typeof fetch;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return { status: 200, ok: true, json: async () => body } as unknown as Response;
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

describe("DailyNoteService.getToday", () => {
  it("queries the DASHBOARD note and returns it", async () => {
    const { fetchFn, calls } = makeFetch({
      data: { dailyNote: { dailyNote: { note: "Hello" } } },
    });

    const note = await new DailyNoteService(buildClient(fetchFn)).getToday();

    expect(note).toEqual({ note: "Hello" });
    expect(JSON.parse(calls[0]!.init.body as string).variables.type).toBe("DASHBOARD");
  });

  it("returns null when not found", async () => {
    const { fetchFn } = makeFetch({ data: { dailyNote: { message: "none" } } });
    const note = await new DailyNoteService(buildClient(fetchFn)).getToday();
    expect(note).toBeNull();
  });
});

describe("DailyNoteService.update", () => {
  it("upserts the note and returns the saved value", async () => {
    const { fetchFn, calls } = makeFetch({
      data: { upsertDailyNote: { dailyNote: { note: "Updated" } } },
    });

    const note = await new DailyNoteService(buildClient(fetchFn)).update("Updated");

    expect(note).toEqual({ note: "Updated" });
    expect(JSON.parse(calls[0]!.init.body as string).variables.input).toEqual({
      type: "DASHBOARD",
      note: "Updated",
    });
  });

  it("returns null when the upsert response carries no note", async () => {
    const { fetchFn } = makeFetch({});
    const note = await new DailyNoteService(buildClient(fetchFn)).update("x");
    expect(note).toBeNull();
  });
});
