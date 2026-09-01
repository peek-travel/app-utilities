/**
 * Pure functions that map raw Peek question configuration nodes into the clean
 * {@link CustomQuestion} model. No I/O — straightforward, testable transforms.
 */
import type {
  CustomQuestion,
  CustomQuestionOption,
} from "../../../models/peek/custom-question.js";
import type {
  QuestionConfigurationNode,
  RawQuestionOptionNode,
} from "./custom-question-queries.js";

/** Converts an activity's question configurations into {@link CustomQuestion}s. */
export function fromQuestionConfigurations(
  configs: QuestionConfigurationNode[],
): CustomQuestion[] {
  return configs.map(fromQuestionConfiguration);
}

/** Converts a single question configuration node into a {@link CustomQuestion}. */
function fromQuestionConfiguration(
  config: QuestionConfigurationNode,
): CustomQuestion {
  const question = config.question;
  return {
    id: question.id,
    order: config.order ?? 0,
    isRequired: config.isRequired ?? false,
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
