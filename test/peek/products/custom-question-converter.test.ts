import { describe, expect, it } from "vitest";

import { fromQuestionConfigurations } from "../../../src/internal/peek/products/custom-question-converter.js";
import type { QuestionConfigurationNode } from "../../../src/internal/peek/products/custom-question-queries.js";

describe("fromQuestionConfigurations", () => {
  it("maps a free-text question, pulling order/isRequired from the config", () => {
    const configs: QuestionConfigurationNode[] = [
      {
        isRequired: true,
        order: 2,
        question: {
          id: "cq_gw5xn",
          questionType: "TEXT",
          text: "Text Input",
          answerDefaultValue: null,
          hint: "this is a hint text",
          internalLabel: null,
          perGuest: false,
        },
      },
    ];

    expect(fromQuestionConfigurations(configs)).toEqual([
      {
        id: "cq_gw5xn",
        order: 2,
        isRequired: true,
        questionText: "Text Input",
        hintText: "this is a hint text",
        questionType: "TEXT",
        internalLabel: null,
        perGuest: false,
        defaultValue: null,
        options: [],
      },
    ]);
  });

  it("maps a choice question's options into { id, order, value }", () => {
    const configs: QuestionConfigurationNode[] = [
      {
        isRequired: false,
        order: 3,
        question: {
          id: "cq_bq48e",
          questionType: "SELECT_ONE",
          text: "Multiple Choice",
          answerDefaultValue: null,
          hint: null,
          internalLabel: null,
          perGuest: false,
          options: [
            { id: "cqao_mwdgvw", text: "Option A", order: 1 },
            { id: "cqao_va78v7", text: "Option B", order: 2 },
          ],
        },
      },
    ];

    expect(fromQuestionConfigurations(configs)[0]).toMatchObject({
      questionType: "SELECT_ONE",
      options: [
        { id: "cqao_mwdgvw", order: 1, value: "Option A" },
        { id: "cqao_va78v7", order: 2, value: "Option B" },
      ],
    });
  });

  it("defaults missing config/question fields to safe values", () => {
    const configs: QuestionConfigurationNode[] = [
      {
        question: {
          id: "cq_x",
          questionType: "CHECK_BOX",
          text: "Check box",
        },
      },
    ];

    expect(fromQuestionConfigurations(configs)).toEqual([
      {
        id: "cq_x",
        order: 0,
        isRequired: false,
        questionText: "Check box",
        hintText: null,
        questionType: "CHECK_BOX",
        internalLabel: null,
        perGuest: false,
        defaultValue: null,
        options: [],
      },
    ]);
  });

  it("returns an empty list for no configurations", () => {
    expect(fromQuestionConfigurations([])).toEqual([]);
  });
});
