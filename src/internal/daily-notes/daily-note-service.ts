/**
 * Daily-note operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getDailyNoteService}.
 */
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type { DailyNote } from "../../models/daily-note.js";
import { fromUpsertResponse, toDailyNote } from "./daily-note-converter.js";
import {
  DAILY_NOTE_TODAY_QUERY,
  GLOBAL_NOTE_TYPE,
  UPSERT_DAILY_NOTE_MUTATION,
  buildUpsertDailyNoteVariables,
  type DailyNoteResponse,
  type UpsertDailyNoteResponse,
} from "./daily-note-queries.js";

export class DailyNoteService {
  constructor(private readonly client: GraphQLClient) {}

  /** Returns today's daily note, or null when none is set. */
  async getToday(): Promise<DailyNote | null> {
    const body: GraphQLBody<DailyNoteResponse> =
      await this.client.request<DailyNoteResponse>(SALES_ENDPOINT, DAILY_NOTE_TODAY_QUERY, {
        type: GLOBAL_NOTE_TYPE,
      });
    return toDailyNote(body.data);
  }

  /** Upserts the daily note and returns the saved note, or null. */
  async update(note: string): Promise<DailyNote | null> {
    const body: GraphQLBody<UpsertDailyNoteResponse> =
      await this.client.request<UpsertDailyNoteResponse>(
        SALES_ENDPOINT,
        UPSERT_DAILY_NOTE_MUTATION,
        buildUpsertDailyNoteVariables(note),
      );
    return fromUpsertResponse(body.data);
  }
}
