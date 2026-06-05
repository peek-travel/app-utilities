/**
 * Raw Peek GraphQL query/mutation and response shapes for the daily note.
 * Internal.
 */
import type { DailyNote } from "../../models/daily-note.js";

/** The global-note type for the dashboard daily note. */
export const GLOBAL_NOTE_TYPE = "DASHBOARD";

/** Fetches today's daily note. */
export const DAILY_NOTE_TODAY_QUERY = `
  query dailyNote($type: GlobalNoteType!) {
    dailyNote(type: $type) {
      ... on DailyNoteSuccess {
        dailyNote {
          note
        }
      }
      ... on NotFoundError {
        message
      }
    }
  }
`;

/** Upserts the daily note. */
export const UPSERT_DAILY_NOTE_MUTATION = `
  mutation Account($input: UpsertDailyNoteInput!) {
    upsertDailyNote(input: $input) {
      ... on UpsertDailyNoteSuccess {
        dailyNote {
          note
        }
      }
    }
  }
`;

/** `data` payload of {@link DAILY_NOTE_TODAY_QUERY} (a success/not-found union). */
export interface DailyNoteResponse {
  dailyNote: { dailyNote: DailyNote | null } | { message: string };
}

/** `data` payload of {@link UPSERT_DAILY_NOTE_MUTATION}. */
export interface UpsertDailyNoteResponse {
  upsertDailyNote: { dailyNote: DailyNote | null };
}

/** Builds the variables for {@link UPSERT_DAILY_NOTE_MUTATION}. */
export function buildUpsertDailyNoteVariables(note: string): {
  input: { type: string; note: string };
} {
  return { input: { type: GLOBAL_NOTE_TYPE, note } };
}
