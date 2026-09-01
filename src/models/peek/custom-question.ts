/**
 * The clean, transport-agnostic data model for an activity's custom questions.
 *
 * Custom questions are the operator-configured questions attached to a bookable
 * activity (per-guest waiver-style prompts, free-text inputs, multiple-choice
 * pickers, etc.). This is the shape consumers work with — it is decoupled from
 * the underlying Peek GraphQL `Question`/`ChoiceQuestion` schema, which stays
 * internal.
 *
 * Note: this describes the **question definitions** on an activity, not any
 * customer's answers — so there is no PII here and nothing gated behind
 * `fullCustomerAccess`.
 */

/**
 * A single custom question configured on an activity.
 *
 * The ordering and requiredness come from the activity's question
 * configuration; the remaining fields describe the reusable question itself.
 */
export interface CustomQuestion {
  /** Unique identifier of the question (e.g. `"cq_anq67"`). */
  id: string;

  /** 1-based position of the question within the activity's question list. */
  order: number;

  /** Whether the activity requires an answer to this question. */
  isRequired: boolean;

  /** The question prompt shown to the guest (Peek's `text`). */
  questionText: string;

  /** Helper/hint text shown alongside the prompt, or `null` when none. */
  hintText: string | null;

  /**
   * The question's input type as reported by Peek — e.g. `"CHECK_BOX"`,
   * `"TEXT"`, `"LOCATION"`, `"SELECT_ONE"`. Left as a string so new Peek
   * question types flow through without a package change.
   */
  questionType: string;

  /** Operator-only label for the question, or `null` when none. */
  internalLabel: string | null;

  /** `true` when the question is answered once per guest rather than per booking. */
  perGuest: boolean;

  /** Pre-filled default answer, or `null` when none. */
  defaultValue: string | null;

  /**
   * Selectable options for choice-style questions (`SELECT_ONE`, `LOCATION`,
   * …). Empty for free-text/checkbox questions that carry no options.
   */
  options: CustomQuestionOption[];
}

/** A single selectable option on a choice-style {@link CustomQuestion}. */
export interface CustomQuestionOption {
  /** Unique identifier of the option (e.g. `"cqao_mwdgvw"`). */
  id: string;

  /** 1-based position of the option within the question's option list. */
  order: number;

  /** The option's display label (Peek's `text`). */
  value: string;
}
