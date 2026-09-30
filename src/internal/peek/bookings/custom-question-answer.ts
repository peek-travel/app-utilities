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
import type {
  CustomQuestion,
  CustomQuestionOption,
} from "../../../models/peek/custom-question.js";
import type { CustomQuestionAnswerInput } from "../../../models/peek/booking.js";

/** Peek question-type values this resolver knows how to answer. */
export const QUESTION_TYPE_CHECK_BOX = "CHECK_BOX";
export const QUESTION_TYPE_TEXT = "TEXT";
export const QUESTION_TYPE_SELECT_ONE = "SELECT_ONE";
export const QUESTION_TYPE_LOCATION = "LOCATION";

/** A `cq_…` question id vs. free-text; a `cqao_…` option id vs. an option label. */
const QUESTION_ID_REGEX = /^cq_[a-z0-9]+$/;
const OPTION_ID_REGEX = /^cqao_[a-z0-9]+$/;

/**
 * Whether `idOrText` is a custom-question id (`cq_…`) rather than free-text.
 * The service uses this to decide whether it must fetch the activity's questions:
 * a by-name answer always needs the list to resolve, a by-id answer does not when
 * unknown ids are being accepted (see `acceptAllIds`).
 */
export function isCustomQuestionId(idOrText: string): boolean {
  return QUESTION_ID_REGEX.test(idOrText);
}

/** Checkbox truthiness — `value` (lowercased) must be one of the valid set. */
const CHECKBOX_TRUE = new Set(["yes", "true"]);
const CHECKBOX_VALID = new Set(["yes", "no", "true", "false"]);

/** Display text the gateway expects in `questionAnswerText` for a checkbox. */
const CHECKBOX_TEXT_TRUE = "Yes";
const CHECKBOX_TEXT_FALSE = "No";

// ─── Error messages ──────────────────────────────────────────────────────────
const errUnknownQuestionId = (v: string): string =>
  `No custom question matches id "${v}" for this activity`;
const errNoTextMatch = (v: string): string =>
  `No custom question matches text "${v}" for this activity`;
const errAmbiguousText = (v: string): string =>
  `Custom question text "${v}" matches more than one question`;
const errPerGuestUnsupported = (id: string): string =>
  `Per-guest custom question "${id}" is not yet supported`;
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
const errMissingRequired = (text: string, id: string): string =>
  `Custom question "${text}" (${id}) is required but was not answered`;

/**
 * A resolved answer, minus the `refid` the service mints. `questionAnswerText`
 * is always set (the gateway requires it): the raw value for text, the exact
 * option label for select-one/location, and `"Yes"`/`"No"` for a checkbox. The
 * type-specific field (`questionAnswerOptionId` / `isChecked`) is set in
 * addition, per the question's type.
 */
export interface ResolvedCustomAnswer {
  questionId: string;
  questionAnswerText: string;
  questionAnswerOptionId?: string;
  isChecked?: boolean;
}

/** Lowercases and strips non-alphanumerics for lenient matching. */
function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Finds the one question an input targets, by id or by lenient text match.
 * Returns `null` (rather than throwing) for an unknown `cq_…` id when
 * `acceptAllIds` is set — the caller then accepts the id blindly as a text
 * answer. A by-name input is always resolved against the list (there is no id to
 * accept), so `acceptAllIds` never relaxes an unmatched/ambiguous text match.
 */
function resolveQuestion(
  idOrText: string,
  questions: CustomQuestion[],
  acceptAllIds: boolean,
): CustomQuestion | null {
  if (QUESTION_ID_REGEX.test(idOrText)) {
    const byId = questions.find((question) => question.id === idOrText);
    if (!byId) {
      if (acceptAllIds) return null;
      throw new Error(errUnknownQuestionId(idOrText));
    }
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
function resolveOption(
  value: string,
  question: CustomQuestion,
): CustomQuestionOption {
  if (OPTION_ID_REGEX.test(value)) {
    const byId = question.options.find((option) => option.id === value);
    if (!byId) throw new Error(errUnknownOptionId(value, question.id));
    return byId;
  }
  const target = normalize(value);
  const matches = question.options.filter(
    (option) => normalize(option.value) === target,
  );
  if (matches.length === 0) throw new Error(errNoOptionMatch(value, question.id));
  if (matches.length > 1) throw new Error(errAmbiguousOption(value, question.id));
  return matches[0]!;
}

/** Resolves a single answer input against the matched question's type. */
function resolveOne(
  answer: CustomQuestionAnswerInput,
  questions: CustomQuestion[],
  acceptAllIds: boolean,
): ResolvedCustomAnswer {
  const question = resolveQuestion(answer.questionIdOrText, questions, acceptAllIds);
  // An unknown id accepted blindly (acceptAllIds): there is no question
  // definition to type-check against, so pass the id and value through as a
  // plain text answer.
  if (!question) {
    return { questionId: answer.questionIdOrText, questionAnswerText: answer.value };
  }
  // Per-guest answers require per-guest wiring the quote payload does not carry
  // yet — reject rather than silently drop the distinction.
  if (question.perGuest) {
    throw new Error(errPerGuestUnsupported(question.id));
  }
  switch (question.questionType) {
    case QUESTION_TYPE_CHECK_BOX: {
      const normalized = answer.value.trim().toLowerCase();
      if (!CHECKBOX_VALID.has(normalized)) {
        throw new Error(errInvalidCheckbox(answer.value, question.id));
      }
      const isChecked = CHECKBOX_TRUE.has(normalized);
      // The gateway requires questionAnswerText even for a checkbox.
      return {
        questionId: question.id,
        isChecked,
        questionAnswerText: isChecked ? CHECKBOX_TEXT_TRUE : CHECKBOX_TEXT_FALSE,
      };
    }
    case QUESTION_TYPE_TEXT:
      return { questionId: question.id, questionAnswerText: answer.value };
    case QUESTION_TYPE_SELECT_ONE:
    case QUESTION_TYPE_LOCATION: {
      // Select the option only — Peek applies each location option's configured
      // lat/long. questionAnswerText must be the option's exact current label.
      const option = resolveOption(answer.value, question);
      return {
        questionId: question.id,
        questionAnswerOptionId: option.id,
        questionAnswerText: option.value,
      };
    }
    default:
      throw new Error(errUnsupportedType(question.questionType, question.id));
  }
}

/** Options controlling how the answer set as a whole is validated. */
export interface ResolveCustomQuestionOptions {
  /**
   * When `true`, every question the activity marks `isRequired` must have an
   * answer — resolution throws for the first required question left unanswered.
   * Per-guest questions are excluded (they cannot be answered here anyway).
   */
  requireRequired?: boolean;
  /**
   * When `true`, an answer identified by a `cq_…` id that is **not** in the
   * activity's question list is accepted as-is (passed through as a text answer)
   * instead of throwing. By-name answers are unaffected — they still must match a
   * question, since there is no id to accept. Default: `false`.
   */
  acceptAllIds?: boolean;
}

/**
 * Resolves every caller-supplied answer against the activity's custom questions,
 * throwing on the first unmatched question, ambiguous match, or invalid value.
 * The returned objects carry no `refid` — the service adds one per answer.
 *
 * With `requireRequired`, the resolved set is additionally checked for coverage:
 * any required, non-per-guest question with no answer throws. This check runs
 * even when `answers` is empty, so an activity with unanswered required
 * questions fails rather than booking without them.
 *
 * With `acceptAllIds`, an answer whose `cq_…` id is not in `questions` is
 * accepted as a plain text answer instead of throwing.
 */
export function resolveCustomQuestionAnswers(
  answers: CustomQuestionAnswerInput[],
  questions: CustomQuestion[],
  options?: ResolveCustomQuestionOptions,
): ResolvedCustomAnswer[] {
  const acceptAllIds = options?.acceptAllIds ?? false;
  const resolved = answers.map((answer) => resolveOne(answer, questions, acceptAllIds));
  if (options?.requireRequired) {
    assertRequiredAnswered(resolved, questions);
  }
  return resolved;
}

/** Throws for the first required, non-per-guest question left unanswered. */
function assertRequiredAnswered(
  resolved: ResolvedCustomAnswer[],
  questions: CustomQuestion[],
): void {
  const answered = new Set(resolved.map((answer) => answer.questionId));
  for (const question of questions) {
    if (question.isRequired && !question.perGuest && !answered.has(question.id)) {
      throw new Error(errMissingRequired(question.questionText, question.id));
    }
  }
}
