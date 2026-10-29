/**
 * Custom-question operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getCustomQuestionService}
 * rather than constructing it directly — the access service wires in the
 * authenticated, shared transport.
 */
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type { CustomQuestion } from "../../../models/peek/custom-question.js";
import { fromQuestionNodes } from "./custom-question-converter.js";
import {
  ALL_CUSTOM_QUESTIONS_QUERY,
  type AllCustomQuestionsResponse,
} from "./custom-question-queries.js";

/**
 * Reads custom questions defined on the account.
 *
 * Obtain an instance via {@link PeekAccessService.getCustomQuestionService}.
 */
export class CustomQuestionService {
  constructor(private readonly client: GraphQLClient) {}

  /**
   * Returns every custom question defined on the account, across all
   * activities. Choice-style questions (`SELECT_ONE`, `LOCATION`, …) carry their
   * selectable {@link CustomQuestion.options}; free-text/checkbox questions
   * return an empty option list.
   *
   * These are account-wide question **definitions**, not customer answers — no
   * PII is involved, so the result is unaffected by `fullCustomerAccess`. Unlike
   * {@link ProductService.getCustomQuestions}, the catalog carries no
   * per-activity configuration, so {@link CustomQuestion.order} is `0` and
   * {@link CustomQuestion.isRequired} is `false` on every entry.
   *
   * @returns Every custom question on the account, or an empty list when none
   *   are defined.
   *
   * @example
   * ```ts
   * const questions = await peek.getCustomQuestionService().getAll();
   * ```
   */
  async getAll(): Promise<CustomQuestion[]> {
    const body: GraphQLBody<AllCustomQuestionsResponse> =
      await this.client.request<AllCustomQuestionsResponse>(
        SALES_ENDPOINT,
        ALL_CUSTOM_QUESTIONS_QUERY,
        {},
      );

    return fromQuestionNodes(body.data?.questions ?? []);
  }
}
