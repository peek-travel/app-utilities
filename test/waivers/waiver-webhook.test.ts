import { describe, expect, it } from "vitest";

import {
  fromWaiverNode,
  parseWaiverWebhook,
} from "../../src/internal/waivers/waiver-webhook.js";

function waiverNode() {
  return {
    account_id: "acc_1",
    agreement_signature_id: "sig_1",
    agreement_template_id: "tpl_1",
    booking_id: "b_1",
    file_url: "https://files/waiver.pdf",
    signed_at: "2026-06-26T10:00:00Z",
    signed_by_guardian: true,
    waiver_data: {
      participant_name: "Ada",
      participant_optin_marketing: true,
      participant_optin_sms: false,
    },
  };
}

describe("parseWaiverWebhook", () => {
  it("parses the { waiver } envelope into a Waiver", () => {
    const waiver = parseWaiverWebhook({ waiver: waiverNode() });
    expect(waiver).toEqual({
      templateId: "tpl_1",
      bookingId: "b_1",
      fileUrl: "https://files/waiver.pdf",
      signedAt: "2026-06-26T10:00:00Z",
      isSignedByGuardian: true,
      guestName: "Ada",
      isOptinMarketing: true,
      isOptinSms: false,
    });
  });

  it("parses a bare waiver node (no envelope)", () => {
    const waiver = parseWaiverWebhook(waiverNode());
    expect(waiver.templateId).toBe("tpl_1");
    expect(waiver.bookingId).toBe("b_1");
  });

  it("parses a JSON string body", () => {
    const waiver = parseWaiverWebhook(JSON.stringify({ waiver: waiverNode() }));
    expect(waiver.fileUrl).toBe("https://files/waiver.pdf");
  });

  it("defaults guest fields when waiver_data is absent", () => {
    const node = waiverNode();
    delete (node as Record<string, unknown>).waiver_data;
    const waiver = parseWaiverWebhook({ waiver: node });
    expect(waiver.guestName).toBeNull();
    expect(waiver.isOptinMarketing).toBe(false);
    expect(waiver.isOptinSms).toBe(false);
  });

  it("coerces the guardian flag and empty strings for missing ids", () => {
    const waiver = parseWaiverWebhook({ waiver: { signed_by_guardian: false } });
    expect(waiver.isSignedByGuardian).toBe(false);
    expect(waiver.templateId).toBe("");
    expect(waiver.bookingId).toBe("");
    expect(waiver.fileUrl).toBe("");
    expect(waiver.signedAt).toBe("");
  });

  it("returns an empty-ish Waiver for malformed input rather than throwing", () => {
    expect(() => parseWaiverWebhook(null)).not.toThrow();
    expect(() => parseWaiverWebhook("not json")).not.toThrow();
    expect(parseWaiverWebhook(undefined).templateId).toBe("");
  });
});

describe("fromWaiverNode", () => {
  it("maps a raw node directly", () => {
    expect(fromWaiverNode(waiverNode()).guestName).toBe("Ada");
  });

  it("tolerates null/undefined", () => {
    expect(fromWaiverNode(null).templateId).toBe("");
    expect(fromWaiverNode(undefined).isOptinSms).toBe(false);
  });
});
