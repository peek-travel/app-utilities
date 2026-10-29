/**
 * Pure functions that map raw Peek question nodes — whether wrapped in an
 * activity's question configuration or returned bare from the account-wide
 * catalog — into the clean {@link CustomQuestion} model. No I/O —
 * straightforward, testable transforms.
 */
import type {
  CustomQuestion,
  CustomQuestionOption,
} from "../../../models/peek/custom-question.js";
import type {
  QuestionConfigurationNode,
  RawQuestionNode,
  RawQuestionOptionNode,
} from "./custom-question-queries.js";

/** Converts an activity's question configurations into {@link CustomQuestion}s. */
export function fromQuestionConfigurations(
  configs: QuestionConfigurationNode[],
): CustomQuestion[] {
  return configs.map((config) =>
    fromQuestionNode(config.question, config.order, config.isRequired),
  );
}

/**
 * Converts bare question nodes (the account-wide catalog, which carries no
 * per-activity configuration) into {@link CustomQuestion}s. `order` and
 * `isRequired` have no meaning outside an activity's question list, so they
 * default to `0`/`false`.
 */
export function fromQuestionNodes(
  questions: RawQuestionNode[],
): CustomQuestion[] {
  return questions.map((question) => fromQuestionNode(question));
}

/**
 * Converts a single raw question node into a {@link CustomQuestion}, folding in
 * the per-activity `order`/`isRequired` config when present.
 */
function fromQuestionNode(
  question: RawQuestionNode,
  order?: number | null,
  isRequired?: boolean | null,
): CustomQuestion {
  return {
    id: question.id,
    order: order ?? 0,
    isRequired: isRequired ?? false,
    questionText: question.text,
    hintText: question.hint ?? null,
    questionType: question.questionType,
    internalLabel: question.internalLabel ?? null,
    perGuest: question.perGuest ?? false,
    defaultValue: question.answerDefaultValue ?? null,
    options: (question.options ?? []).map(fromQuestionOption),
  };
}

/** Converts a raw choice-question option node into a {@link CustomQuestionOption}. */
function fromQuestionOption(
  option: RawQuestionOptionNode,
): CustomQuestionOption {
  return {
    id: option.id,
    order: option.order,
    value: option.text,
  };
}
