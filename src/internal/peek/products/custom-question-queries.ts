/**
 * Raw Peek GraphQL query and response shapes for an activity's custom
 * questions. These are an internal implementation detail of the package and are
 * deliberately not re-exported from the public entry point.
 */

/** Fetches every custom question configured on a single activity. */
export const CUSTOM_QUESTIONS_QUERY = `
  query Sales($id: ID!) {
    activity(id: $id) {
      id
      name
      questionActivityConfigurations {
        isRequired
        order
        question {
          id
          questionType
          text
          answerDefaultValue
          hint
          internalLabel
          perGuest
          ... on ChoiceQuestion {
            options {
              id
              text
              order
            }
          }
        }
      }
    }
  }
`;

/** A single selectable option on a raw `ChoiceQuestion` node. */
export interface RawQuestionOptionNode {
  id: string;
  text: string;
  order: number;
}

/** A raw question node as returned inside a question configuration. */
export interface RawQuestionNode {
  id: string;
  questionType: string;
  text: string;
  answerDefaultValue?: string | null;
  hint?: string | null;
  internalLabel?: string | null;
  perGuest?: boolean | null;
  /** Present only on `ChoiceQuestion` nodes (via the inline fragment). */
  options?: RawQuestionOptionNode[] | null;
}

/** A single `questionActivityConfigurations` entry pairing config + question. */
export interface QuestionConfigurationNode {
  isRequired?: boolean | null;
  order?: number | null;
  question: RawQuestionNode;
}

/** The `data` payload of {@link CUSTOM_QUESTIONS_QUERY}. */
export interface CustomQuestionsResponse {
  activity: {
    id: string;
    name: string;
    questionActivityConfigurations?: QuestionConfigurationNode[] | null;
  } | null;
}
