/**
 * Pure resolution of caller-supplied custom-question answers against an
 * activity's actual custom questions. No I/O — the questions are fetched by the
 * service and passed in, so this whole module is unit-testable without a client
 * (and, deliberately, without minting the answer `refid`s, which the service
 * adds afterward).
 *
 * Each {@link CustomQuestionAnswerInput} is matched to exactly one question and
 * its `value` validated/resolved by question type into the shape the quote
 * mutation expects. Any ambiguity or mismatch throws before the booking is made.
 */
import type { CustomQuestion } from "../../../models/peek/custom-question.js";
import type { CustomQuestionAnswerInput } from "../../../models/peek/booking.js";

/** Peek question-type values this resolver knows how to answer. */
export const QUESTION_TYPE_CHECK_BOX = "CHECK_BOX";
export const QUESTION_TYPE_TEXT = "TEXT";
export const QUESTION_TYPE_SELECT_ONE = "SELECT_ONE";
export const QUESTION_TYPE_LOCATION = "LOCATION";

/** A `cq_…` question id vs. free-text; a `cqao_…` option id vs. an option label. */
const QUESTION_ID_REGEX = /^cq_[a-z0-9]+$/;
const OPTION_ID_REGEX = /^cqao_[a-z0-9]+$/;

/** Checkbox truthiness — `value` (lowercased) must be one of the valid set. */
const CHECKBOX_TRUE = new Set(["yes", "true"]);
const CHECKBOX_VALID = new Set(["yes", "no", "true", "false"]);

// ─── Error messages ──────────────────────────────────────────────────────────
const errUnknownQuestionId = (v: string): string =>
  `No custom question matches id "${v}" for this activity`;
const errNoTextMatch = (v: string): string =>
  `No custom question matches text "${v}" for this activity`;
const errAmbiguousText = (v: string): string =>
  `Custom question text "${v}" matches more than one question`;
const errUnsupportedType = (type: string, id: string): string =>
  `Custom question "${id}" has unsupported type "${type}"`;
const errInvalidCheckbox = (v: string, id: string): string =>
  `Checkbox answer for question "${id}" must be yes/no/true/false, got "${v}"`;
const errUnknownOptionId = (v: string, id: string): string =>
  `No option matches id "${v}" for question "${id}"`;
const errNoOptionMatch = (v: string, id: string): string =>
  `No option matches "${v}" for question "${id}"`;
const errAmbiguousOption = (v: string, id: string): string =>
  `Option "${v}" matches more than one option for question "${id}"`;

/**
 * A resolved answer, minus the `refid` the service mints. Exactly one of the
 * three value fields is set, per the question's type.
 */
export interface ResolvedCustomAnswer {
  questionId: string;
  questionAnswerText?: string;
  questionAnswerOptionId?: string;
  isChecked?: boolean;
}

/** Lowercases and strips non-alphanumerics for lenient matching. */
function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Finds the one question an input targets, by id or by lenient text match. */
function resolveQuestion(
  idOrText: string,
  questions: CustomQuestion[],
): CustomQuestion {
  if (QUESTION_ID_REGEX.test(idOrText)) {
    const byId = questions.find((question) => question.id === idOrText);
    if (!byId) throw new Error(errUnknownQuestionId(idOrText));
    return byId;
  }
  const target = normalize(idOrText);
  const matches = questions.filter(
    (question) => normalize(question.questionText) === target,
  );
  if (matches.length === 0) throw new Error(errNoTextMatch(idOrText));
  if (matches.length > 1) throw new Error(errAmbiguousText(idOrText));
  return matches[0]!;
}

/** Finds the one option a value targets, by id or by lenient label match. */
function resolveOptionId(value: string, question: CustomQuestion): string {
  if (OPTION_ID_REGEX.test(value)) {
    const byId = question.options.find((option) => option.id === value);
    if (!byId) throw new Error(errUnknownOptionId(value, question.id));
    return byId.id;
  }
  const target = normalize(value);
  const matches = question.options.filter(
    (option) => normalize(option.value) === target,
  );
  if (matches.length === 0) throw new Error(errNoOptionMatch(value, question.id));
  if (matches.length > 1) throw new Error(errAmbiguousOption(value, question.id));
  return matches[0]!.id;
}

/** Resolves a single answer input against the matched question's type. */
function resolveOne(
  answer: CustomQuestionAnswerInput,
  questions: CustomQuestion[],
): ResolvedCustomAnswer {
  const question = resolveQuestion(answer.questionIdOrText, questions);
  switch (question.questionType) {
    case QUESTION_TYPE_CHECK_BOX: {
      const normalized = answer.value.trim().toLowerCase();
      if (!CHECKBOX_VALID.has(normalized)) {
        throw new Error(errInvalidCheckbox(answer.value, question.id));
      }
      return { questionId: question.id, isChecked: CHECKBOX_TRUE.has(normalized) };
    }
    case QUESTION_TYPE_TEXT:
      return { questionId: question.id, questionAnswerText: answer.value };
    case QUESTION_TYPE_SELECT_ONE:
    case QUESTION_TYPE_LOCATION:
      // Location answers select an option only — Peek stores each option's
      // configured lat/long and applies it, so no coordinates are sent here.
      return {
        questionId: question.id,
        questionAnswerOptionId: resolveOptionId(answer.value, question),
      };
    default:
      throw new Error(errUnsupportedType(question.questionType, question.id));
  }
}

/**
 * Resolves every caller-supplied answer against the activity's custom questions,
 * throwing on the first unmatched question, ambiguous match, or invalid value.
 * The returned objects carry no `refid` — the service adds one per answer.
 */
export function resolveCustomQuestionAnswers(
  answers: CustomQuestionAnswerInput[],
  questions: CustomQuestion[],
): ResolvedCustomAnswer[] {
  return answers.map((answer) => resolveOne(answer, questions));
}
