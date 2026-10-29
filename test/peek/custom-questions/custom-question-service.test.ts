import { describe, expect, it } from "vitest";

import {
  GraphQLClient,
  type GraphQLClientOptions,
} from "../../../src/internal/peek/graphql-client.js";
import { peekApiEndpoints } from "../../../src/internal/peek/gateway-endpoints.js";
import { CustomQuestionService } from "../../../src/internal/peek/custom-questions/custom-question-service.js";
import { noopLogger } from "../../../src/logger.js";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => JSON.stringify(body),
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
    baseApiUrl: "https://gw.test/gql/app-1",
    endpoints: peekApiEndpoints(false),
    gatewayKey: "gw-key",
    getToken: () => "tok-123",
    retryDelaysMs: [],
    logger: noopLogger,
    fetchFn,
    ...overrides,
  });
}

const ALL_QUESTIONS = [
  {
    id: "cq_anq67",
    questionType: "CHECK_BOX",
    text: "Check box - Per Guest - Adult Only",
    answerDefaultValue: null,
    hint: null,
    internalLabel: null,
    perGuest: true,
  },
  {
    id: "cq_bq48e",
    questionType: "SELECT_ONE",
    text: "Multiple Choice",
    answerDefaultValue: null,
    hint: null,
    internalLabel: null,
    perGuest: false,
    options: [
      { id: "cqao_mwdgvw", text: "Option A", order: 1 },
      { id: "cqao_va78v7", text: "Option B", order: 2 },
    ],
  },
];

describe("CustomQuestionService.getAll", () => {
  it("fetches the account-wide questions and maps them", async () => {
    const { fetchFn, calls } = makeFetch((query, variables) => {
      expect(query).toContain("questions");
      expect(query).toContain("ChoiceQuestion");
      expect(variables).toEqual({});
      return jsonResponse({ data: { questions: ALL_QUESTIONS } });
    });

    const service = new CustomQuestionService(buildClient(fetchFn));
    const questions = await service.getAll();

    expect(questions).toEqual([
      {
        id: "cq_anq67",
        order: 0,
        isRequired: false,
        questionText: "Check box - Per Guest - Adult Only",
        hintText: null,
        questionType: "CHECK_BOX",
        internalLabel: null,
        perGuest: true,
        defaultValue: null,
        options: [],
      },
      {
        id: "cq_bq48e",
        order: 0,
        isRequired: false,
        questionText: "Multiple Choice",
        hintText: null,
        questionType: "SELECT_ONE",
        internalLabel: null,
        perGuest: false,
        defaultValue: null,
        options: [
          { id: "cqao_mwdgvw", order: 1, value: "Option A" },
          { id: "cqao_va78v7", order: 2, value: "Option B" },
        ],
      },
    ]);
    expect(calls).toHaveLength(1);
  });

  it("returns an empty list when a 200 response carries no data", async () => {
    const { fetchFn } = makeFetch(() => jsonResponse({}));
    const service = new CustomQuestionService(buildClient(fetchFn));
    await expect(service.getAll()).resolves.toEqual([]);
  });

  it("returns an empty list when the account has no questions", async () => {
    const { fetchFn } = makeFetch(() =>
      jsonResponse({ data: { questions: [] } }),
    );
    const service = new CustomQuestionService(buildClient(fetchFn));
    await expect(service.getAll()).resolves.toEqual([]);
  });
});
