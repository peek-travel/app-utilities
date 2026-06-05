/**
 * Pure functions resolving the daily-note GraphQL unions into the clean
 * {@link DailyNote} model. A not-found / missing note maps to `null`.
 */
import type { DailyNote } from "../../models/daily-note.js";
import type {
  DailyNoteResponse,
  UpsertDailyNoteResponse,
} from "./daily-note-queries.js";

/** Resolves a daily-note query response into a {@link DailyNote}, or null. */
export function toDailyNote(
  response: DailyNoteResponse | undefined,
): DailyNote | null {
  const union = response?.dailyNote;
  if (!union) {
    return null;
  }
  // Success branch carries a nested `dailyNote`; the not-found branch carries `message`.
  if ("dailyNote" in union) {
    return cleanNote(union.dailyNote);
  }
  return null;
}

/** Resolves an upsert response into the saved {@link DailyNote}, or null. */
export function fromUpsertResponse(
  response: UpsertDailyNoteResponse | undefined,
): DailyNote | null {
  return cleanNote(response?.upsertDailyNote?.dailyNote);
}

function cleanNote(note: DailyNote | null | undefined): DailyNote | null {
  if (!note || typeof note.note !== "string") {
    return null;
  }
  return { note: note.note };
}
