import { describe, expect, it } from "vitest";

import {
  fromUpsertResponse,
  toDailyNote,
} from "../../src/internal/daily-notes/daily-note-converter.js";
import type {
  DailyNoteResponse,
  UpsertDailyNoteResponse,
} from "../../src/internal/daily-notes/daily-note-queries.js";

describe("toDailyNote", () => {
  it("returns the note on the success branch", () => {
    const response: DailyNoteResponse = { dailyNote: { dailyNote: { note: "Hi" } } };
    expect(toDailyNote(response)).toEqual({ note: "Hi" });
  });

  it("returns null on the not-found branch", () => {
    const response: DailyNoteResponse = { dailyNote: { message: "not found" } };
    expect(toDailyNote(response)).toBeNull();
  });

  it("returns null when the success branch has a null note", () => {
    const response: DailyNoteResponse = { dailyNote: { dailyNote: null } };
    expect(toDailyNote(response)).toBeNull();
  });

  it("returns null when the note is not a string", () => {
    const response = { dailyNote: { dailyNote: { note: 123 } } } as unknown as DailyNoteResponse;
    expect(toDailyNote(response)).toBeNull();
  });

  it("returns null for undefined data", () => {
    expect(toDailyNote(undefined)).toBeNull();
  });
});

describe("fromUpsertResponse", () => {
  it("returns the saved note", () => {
    const response: UpsertDailyNoteResponse = {
      upsertDailyNote: { dailyNote: { note: "Saved" } },
    };
    expect(fromUpsertResponse(response)).toEqual({ note: "Saved" });
  });

  it("returns null when the saved note is missing", () => {
    expect(fromUpsertResponse(undefined)).toBeNull();
  });
});
