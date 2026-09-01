import { describe, expect, it } from "vitest";

import { resolveCustomQuestionAnswers } from "../../../src/internal/peek/bookings/custom-question-answer.js";
import type { CustomQuestion } from "../../../src/models/peek/custom-question.js";

const q = (over: Partial<CustomQuestion>): CustomQuestion => ({
  id: "cq_x",
  order: 1,
  isRequired: false,
  questionText: "Question",
  hintText: null,
  questionType: "TEXT",
  internalLabel: null,
  perGuest: false,
  defaultValue: null,
  options: [],
  ...over,
});

const CHECK = q({ id: "cq_check", questionText: "Adult Only?", questionType: "CHECK_BOX" });
const TEXT = q({ id: "cq_text", questionText: "Dietary Notes", questionType: "TEXT" });
const PICK = q({
  id: "cq_pick",
  questionText: "Pickup Spot",
  questionType: "SELECT_ONE",
  options: [
    { id: "cqao_a", order: 1, value: "Loyola University" },
    { id: "cqao_b", order: 2, value: "Hilton Chicago" },
  ],
});
const LOC = q({ ...PICK, id: "cq_loc", questionType: "LOCATION" });

const ALL = [CHECK, TEXT, PICK, LOC];

describe("resolveCustomQuestionAnswers — question matching", () => {
  it("matches by id", () => {
    expect(
      resolveCustomQuestionAnswers([{ questionIdOrText: "cq_text", value: "vegan" }], ALL),
    ).toEqual([{ questionId: "cq_text", questionAnswerText: "vegan" }]);
  });

  it("matches by lenient text (case/punctuation-insensitive)", () => {
    expect(
      resolveCustomQuestionAnswers([{ questionIdOrText: "  dietary NOTES!! ", value: "vegan" }], ALL),
    ).toEqual([{ questionId: "cq_text", questionAnswerText: "vegan" }]);
  });

  it("throws on an unknown id", () => {
    expect(() =>
      resolveCustomQuestionAnswers([{ questionIdOrText: "cq_nope", value: "x" }], ALL),
    ).toThrow(/No custom question matches id "cq_nope"/);
  });

  it("throws on unmatched text", () => {
    expect(() =>
      resolveCustomQuestionAnswers([{ questionIdOrText: "totally unknown", value: "x" }], ALL),
    ).toThrow(/No custom question matches text/);
  });

  it("throws on ambiguous text (two questions normalize the same)", () => {
    const dupes = [q({ id: "cq_1", questionText: "Pick Up" }), q({ id: "cq_2", questionText: "pickup" })];
    expect(() =>
      resolveCustomQuestionAnswers([{ questionIdOrText: "pickup", value: "x" }], dupes),
    ).toThrow(/matches more than one question/);
  });
});

describe("resolveCustomQuestionAnswers — checkbox", () => {
  it.each([
    ["yes", true, "Yes"],
    ["true", true, "Yes"],
    ["YES", true, "Yes"],
    ["no", false, "No"],
    ["false", false, "No"],
    ["  False  ", false, "No"],
  ])("maps %s to isChecked=%s with text %s", (value, isChecked, text) => {
    expect(
      resolveCustomQuestionAnswers([{ questionIdOrText: "cq_check", value: String(value) }], ALL),
    ).toEqual([{ questionId: "cq_check", isChecked, questionAnswerText: text }]);
  });

  it("throws on an invalid checkbox value", () => {
    expect(() =>
      resolveCustomQuestionAnswers([{ questionIdOrText: "cq_check", value: "maybe" }], ALL),
    ).toThrow(/must be yes\/no\/true\/false/);
  });
});

describe("resolveCustomQuestionAnswers — text", () => {
  it("passes the value through verbatim", () => {
    expect(
      resolveCustomQuestionAnswers([{ questionIdOrText: "cq_text", value: "  Keep As-Is  " }], ALL),
    ).toEqual([{ questionId: "cq_text", questionAnswerText: "  Keep As-Is  " }]);
  });
});

describe("resolveCustomQuestionAnswers — select_one / location options", () => {
  it("matches an option by id and sets text to the exact label", () => {
    expect(
      resolveCustomQuestionAnswers([{ questionIdOrText: "cq_pick", value: "cqao_b" }], ALL),
    ).toEqual([
      { questionId: "cq_pick", questionAnswerOptionId: "cqao_b", questionAnswerText: "Hilton Chicago" },
    ]);
  });

  it("matches an option by lenient label but stores the exact label", () => {
    expect(
      resolveCustomQuestionAnswers([{ questionIdOrText: "cq_loc", value: "hilton chicago" }], ALL),
    ).toEqual([
      { questionId: "cq_loc", questionAnswerOptionId: "cqao_b", questionAnswerText: "Hilton Chicago" },
    ]);
  });

  it("throws on an unknown option id", () => {
    expect(() =>
      resolveCustomQuestionAnswers([{ questionIdOrText: "cq_pick", value: "cqao_zzz" }], ALL),
    ).toThrow(/No option matches id "cqao_zzz"/);
  });

  it("throws on an unmatched option label", () => {
    expect(() =>
      resolveCustomQuestionAnswers([{ questionIdOrText: "cq_pick", value: "nowhere" }], ALL),
    ).toThrow(/No option matches "nowhere"/);
  });

  it("throws on an ambiguous option label", () => {
    const dupe = q({
      id: "cq_dup",
      questionType: "SELECT_ONE",
      questionText: "Dup",
      options: [
        { id: "cqao_1", order: 1, value: "Main St" },
        { id: "cqao_2", order: 2, value: "main st." },
      ],
    });
    expect(() =>
      resolveCustomQuestionAnswers([{ questionIdOrText: "cq_dup", value: "main st" }], [dupe]),
    ).toThrow(/matches more than one option/);
  });
});

describe("resolveCustomQuestionAnswers — misc", () => {
  it("resolves multiple answers in order", () => {
    const resolved = resolveCustomQuestionAnswers(
      [
        { questionIdOrText: "cq_check", value: "no" },
        { questionIdOrText: "cq_pick", value: "cqao_a" },
      ],
      ALL,
    );
    expect(resolved).toEqual([
      { questionId: "cq_check", isChecked: false, questionAnswerText: "No" },
      { questionId: "cq_pick", questionAnswerOptionId: "cqao_a", questionAnswerText: "Loyola University" },
    ]);
  });

  it("returns [] for no answers", () => {
    expect(resolveCustomQuestionAnswers([], ALL)).toEqual([]);
  });

  it("throws on an unsupported question type", () => {
    const weird = q({ id: "cq_weird", questionType: "SIGNATURE" });
    expect(() =>
      resolveCustomQuestionAnswers([{ questionIdOrText: "cq_weird", value: "x" }], [weird]),
    ).toThrow(/unsupported type "SIGNATURE"/);
  });

  it("throws on a per-guest question (not yet supported)", () => {
    const perGuest = q({ id: "cq_pg", questionType: "TEXT", perGuest: true });
    expect(() =>
      resolveCustomQuestionAnswers([{ questionIdOrText: "cq_pg", value: "x" }], [perGuest]),
    ).toThrow(/Per-guest custom question "cq_pg" is not yet supported/);
  });
});
