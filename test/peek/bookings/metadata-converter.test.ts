import { describe, expect, it } from "vitest";

import {
  filterMetaDataByIntegrator,
  fromBookingMetaDataNode,
  toSetMetaDataResult,
} from "../../../src/internal/peek/bookings/metadata-converter.js";
import type {
  BookingMetaDataNode,
  MetaDataFieldResponseNode,
  MetaDataValueNode,
} from "../../../src/internal/peek/bookings/metadata-queries.js";
import type { MetaData } from "../../../src/models/peek/booking-metadata.js";

/** Wraps a raw value node in a field-response node with a slug. */
function response(slug: string, value: MetaDataValueNode): MetaDataFieldResponseNode {
  return {
    fieldLocation: {
      field: { id: `f_${slug}`, name: slug, slug, type: "TYPE" },
      prompt: { label: "Prompt", hint: "Hint", isRequired: true },
    },
    refid: `r_${slug}`,
    value,
  };
}

describe("fromBookingMetaDataNode", () => {
  it("flattens field + prompt + refid into a MetaData list", () => {
    const node: BookingMetaDataNode = {
      id: "b_1",
      displayId: "B-1",
      fieldResponses: [response("shortText", { __typename: "ShortTextFieldResponseValue", shortText: "hi" })],
    };
    const result = fromBookingMetaDataNode(node);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "f_shortText",
      name: "shortText",
      slug: "shortText",
      type: "TYPE",
      prompt: "Prompt",
      promptHint: "Hint",
      isRequired: true,
      refid: "r_shortText",
      value: { kind: "shortText", shortText: "hi" },
    });
  });

  it("defaults prompt fields to null/false when the prompt is absent", () => {
    const node: BookingMetaDataNode = {
      id: "b_1",
      displayId: "B-1",
      fieldResponses: [
        { fieldLocation: { field: { id: "f", name: "n", slug: "s", type: "t" }, prompt: null }, refid: "r", value: null },
      ],
    };
    const [entry] = fromBookingMetaDataNode(node);
    expect(entry).toMatchObject({ prompt: null, promptHint: null, isRequired: false, value: null });
  });

  it("maps every value variant by __typename", () => {
    const responses: MetaDataFieldResponseNode[] = [
      response("age", { __typename: "AgeFieldResponseValue", age: 40 }),
      response("attachment", { __typename: "AttachmentFieldResponseValue", attachmentUrl: "u", mime: "image/png", name: "f.png", size: 12 }),
      response("barcode", { __typename: "BarcodeFieldResponseValue", barcodeType: "QR_CODE", barcodeValue: "abc" }),
      response("boolean", { __typename: "BooleanFieldResponseValue", boolean: true }),
      response("checkbox", { __typename: "CheckboxFieldResponseValue", isChecked: true }),
      response("currency", { __typename: "CurrencyFieldResponseValue", currency: "USD" }),
      response("date", { __typename: "DateFieldResponseValue", date: "2026-01-01" }),
      response("decimal", { __typename: "DecimalFieldResponseValue", decimal: "1.5" }),
      response("duration", { __typename: "DurationFieldResponseValue", duration: { amount: 3, unit: "HOURS" } }),
      response("email", { __typename: "EmailFieldResponseValue", email: "a@b.co" }),
      response("guest", { __typename: "GuestFieldResponseValue", name: "Ada", email: "a@b.co", dateOfBirth: "1990-01-01", notes: "n", waiverSigned: true }),
      response("html", { __typename: "HtmlFieldResponseValue", html: "<b>x</b>" }),
      response("imageUrl", { __typename: "ImageUrlFieldResponseValue", imageUrl: "img" }),
      response("integer", { __typename: "IntegerFieldResponseValue", integer: 7 }),
      response("location", { __typename: "LocationFieldResponseValue", country: "US", county: "C", locality: "L", postalCode: "P", region: "R", streetAddress: "S" }),
      response("longText", { __typename: "LongTextFieldResponseValue", longText: "long" }),
      response("meta", { __typename: "MetaFieldResponseValue", meta: { a: 1 } }),
      response("percent", { __typename: "PercentFieldResponseValue", percent: "12.5" }),
      response("phone", { __typename: "PhoneFieldResponseValue", phone: "+1" }),
      response("time", { __typename: "TimeFieldResponseValue", time: "10:00" }),
      response("url", { __typename: "UrlFieldResponseValue", url: "https://x" }),
      response("volume", { __typename: "VolumeFieldResponseValue", volume: { amount: "2.0", unit: "GALLON" } }),
      response("weight", { __typename: "WeightFieldResponseValue", weight: { amount: "3.0", unit: "KILOGRAM" } }),
    ];
    const values = fromBookingMetaDataNode({ id: "b_1", displayId: "B-1", fieldResponses: responses }).map(
      (m) => ({ ...m.value, displayValue: m.displayValue }),
    );
    expect(values).toEqual([
      { kind: "age", age: 40, displayValue: "40" },
      { kind: "attachment", attachmentUrl: "u", mime: "image/png", name: "f.png", size: 12, displayValue: "f.png" },
      { kind: "barcode", barcodeType: "QR_CODE", barcodeValue: "abc", displayValue: "abc" },
      { kind: "boolean", boolean: true, displayValue: "Yes" },
      { kind: "checkbox", isChecked: true, displayValue: "Yes" },
      { kind: "currency", currency: "USD", displayValue: "USD" },
      { kind: "date", date: "2026-01-01", displayValue: "2026-01-01" },
      { kind: "decimal", decimal: "1.5", displayValue: "1.5" },
      { kind: "duration", amount: 3, unit: "HOURS", displayValue: "3 hours" },
      { kind: "email", email: "a@b.co", displayValue: "a@b.co" },
      { kind: "guest", name: "Ada", email: "a@b.co", dateOfBirth: "1990-01-01", notes: "n", waiverSigned: true, displayValue: "Ada" },
      { kind: "html", html: "<b>x</b>", displayValue: "&lt;b&gt;x&lt;/b&gt;" },
      { kind: "imageUrl", imageUrl: "img", displayValue: "img" },
      { kind: "integer", integer: 7, displayValue: "7" },
      { kind: "location", country: "US", county: "C", locality: "L", postalCode: "P", region: "R", streetAddress: "S", displayValue: "S, L, R, P, US" },
      { kind: "longText", longText: "long", displayValue: "long" },
      { kind: "meta", meta: { a: 1 }, displayValue: '{"a":1}' },
      { kind: "percent", percent: "12.5", displayValue: "12.5%" },
      { kind: "phone", phone: "+1", displayValue: "+1" },
      { kind: "time", time: "10:00", displayValue: "10:00" },
      { kind: "url", url: "https://x", displayValue: "https://x" },
      { kind: "volume", amount: "2.0", unit: "GALLON", displayValue: "2.0 gallon" },
      { kind: "weight", amount: "3.0", unit: "KILOGRAM", displayValue: "3.0 kilogram" },
    ]);
  });

  it("maps absent/unknown value variants and missing scalars to defaults", () => {
    const responses: MetaDataFieldResponseNode[] = [
      response("unknown", { __typename: "SomethingNewFieldResponseValue" }),
      response("nullValue", null as unknown as MetaDataValueNode),
      response("noTypename", { age: 5 }),
      response("ageDefault", { __typename: "AgeFieldResponseValue" }),
      response("guestPiiOff", { __typename: "GuestFieldResponseValue", notes: "n", waiverSigned: false }),
    ];
    const entries = fromBookingMetaDataNode({ id: "b", displayId: "B", fieldResponses: responses });
    expect(entries[0]!.value).toBeNull();
    expect(entries[0]!.displayValue).toBe("");
    expect(entries[1]!.value).toBeNull();
    expect(entries[2]!.value).toBeNull();
    expect(entries[3]!.value).toEqual({ kind: "age", age: 0 });
    expect(entries[3]!.displayValue).toBe("0");
    expect(entries[4]!.value).toEqual({
      kind: "guest",
      name: null,
      email: null,
      dateOfBirth: null,
      notes: "n",
      waiverSigned: false,
    });
    expect(entries[4]!.displayValue).toBe("");
  });

  it("defaults every variant's absent fields (covers the fallback branches)", () => {
    const responses: MetaDataFieldResponseNode[] = [
      response("attachment", { __typename: "AttachmentFieldResponseValue" }),
      response("barcode", { __typename: "BarcodeFieldResponseValue" }),
      response("boolean", { __typename: "BooleanFieldResponseValue" }),
      response("checkbox", { __typename: "CheckboxFieldResponseValue" }),
      response("currency", { __typename: "CurrencyFieldResponseValue" }),
      response("date", { __typename: "DateFieldResponseValue" }),
      response("decimal", { __typename: "DecimalFieldResponseValue" }),
      response("duration", { __typename: "DurationFieldResponseValue" }),
      response("email", { __typename: "EmailFieldResponseValue" }),
      response("html", { __typename: "HtmlFieldResponseValue" }),
      response("imageUrl", { __typename: "ImageUrlFieldResponseValue" }),
      response("integer", { __typename: "IntegerFieldResponseValue" }),
      response("location", { __typename: "LocationFieldResponseValue" }),
      response("longText", { __typename: "LongTextFieldResponseValue" }),
      response("meta", { __typename: "MetaFieldResponseValue" }),
      response("percent", { __typename: "PercentFieldResponseValue" }),
      response("phone", { __typename: "PhoneFieldResponseValue" }),
      response("shortText", { __typename: "ShortTextFieldResponseValue" }),
      response("time", { __typename: "TimeFieldResponseValue" }),
      response("url", { __typename: "UrlFieldResponseValue" }),
      response("volume", { __typename: "VolumeFieldResponseValue" }),
      response("weight", { __typename: "WeightFieldResponseValue" }),
    ];
    const values = fromBookingMetaDataNode({ id: "b", displayId: "B", fieldResponses: responses }).map(
      (m) => ({ ...m.value, displayValue: m.displayValue }),
    );
    expect(values).toEqual([
      { kind: "attachment", attachmentUrl: "", mime: null, name: null, size: null, displayValue: "" },
      { kind: "barcode", barcodeType: null, barcodeValue: "", displayValue: "" },
      { kind: "boolean", boolean: false, displayValue: "No" },
      { kind: "checkbox", isChecked: false, displayValue: "No" },
      { kind: "currency", currency: "", displayValue: "" },
      { kind: "date", date: "", displayValue: "" },
      { kind: "decimal", decimal: null, displayValue: "" },
      { kind: "duration", amount: 0, unit: null, displayValue: "0" },
      { kind: "email", email: null, displayValue: "" },
      { kind: "html", html: "", displayValue: "" },
      { kind: "imageUrl", imageUrl: "", displayValue: "" },
      { kind: "integer", integer: 0, displayValue: "0" },
      { kind: "location", country: null, county: null, locality: null, postalCode: null, region: null, streetAddress: null, displayValue: "" },
      { kind: "longText", longText: "", displayValue: "" },
      { kind: "meta", meta: null, displayValue: "" },
      { kind: "percent", percent: null, displayValue: "" },
      { kind: "phone", phone: "", displayValue: "" },
      { kind: "shortText", shortText: "", displayValue: "" },
      { kind: "time", time: "", displayValue: "" },
      { kind: "url", url: null, displayValue: "" },
      { kind: "volume", amount: "0", unit: null, displayValue: "0" },
      { kind: "weight", amount: "0", unit: null, displayValue: "0" },
    ]);
  });

  it("html displayValue escapes all five HTML-significant characters", () => {
    const [entry] = fromBookingMetaDataNode({
      id: "b",
      displayId: "B",
      fieldResponses: [response("html", { __typename: "HtmlFieldResponseValue", html: `<a href="x">A & 'B'</a>` })],
    });
    expect(entry!.value).toEqual({
      kind: "html",
      html: `<a href="x">A & 'B'</a>`,
    });
    expect(entry!.displayValue).toBe("&lt;a href=&quot;x&quot;&gt;A &amp; &#39;B&#39;&lt;/a&gt;");
  });

  it("returns an empty list for a missing node", () => {
    expect(fromBookingMetaDataNode(undefined)).toEqual([]);
  });

  it("returns an empty list when the node has no responses", () => {
    expect(fromBookingMetaDataNode({})).toEqual([]);
    expect(fromBookingMetaDataNode({ id: "b_2", displayId: "B-2", fieldResponses: null })).toEqual([]);
  });

  it("defaults the whole field when fieldLocation is absent", () => {
    const [entry] = fromBookingMetaDataNode({
      id: "b",
      displayId: "B",
      fieldResponses: [{ refid: "r", value: null }],
    });
    expect(entry).toEqual({
      id: "",
      name: "",
      slug: "",
      type: "",
      prompt: null,
      promptHint: null,
      isRequired: false,
      refid: "r",
      displayValue: "",
      value: null,
    });
  });
});

describe("fromBookingMetaDataNode — value edge cases", () => {
  /**
   * Maps a single value node and returns its converted `value` with the
   * parent's `displayValue` flattened back in, so these edge-case assertions can
   * check the value fields and the rendering together.
   */
  function value(node: MetaDataValueNode): Record<string, unknown> {
    const entry = fromBookingMetaDataNode({ id: "b", displayId: "B", fieldResponses: [response("s", node)] })[0]!;
    return { ...entry.value, displayValue: entry.displayValue };
  }

  it("attachment displayValue prefers name, falling back to url when name is empty/null", () => {
    expect(value({ __typename: "AttachmentFieldResponseValue", attachmentUrl: "https://f", name: "r.pdf", size: 1 })).toMatchObject({ displayValue: "r.pdf" });
    expect(value({ __typename: "AttachmentFieldResponseValue", attachmentUrl: "https://f", name: "" })).toMatchObject({ name: "", displayValue: "https://f" });
    expect(value({ __typename: "AttachmentFieldResponseValue", attachmentUrl: "https://f", name: null, size: 0 })).toMatchObject({ name: null, size: 0, displayValue: "https://f" });
  });

  it("location joins only the present parts in address order, dropping empties", () => {
    expect(value({ __typename: "LocationFieldResponseValue", locality: "Springfield", country: "US" })).toMatchObject({ displayValue: "Springfield, US" });
    expect(value({ __typename: "LocationFieldResponseValue", streetAddress: "1 Main", locality: "", region: "IL", postalCode: null, country: "US" })).toMatchObject({ displayValue: "1 Main, IL, US" });
  });

  it("duration/volume/weight drop the unit from displayValue when it is null", () => {
    expect(value({ __typename: "DurationFieldResponseValue", duration: { amount: 5, unit: null } })).toMatchObject({ amount: 5, unit: null, displayValue: "5" });
    expect(value({ __typename: "VolumeFieldResponseValue", volume: { amount: "2.5", unit: null } })).toMatchObject({ displayValue: "2.5" });
    expect(value({ __typename: "WeightFieldResponseValue", weight: { amount: "3.0", unit: null } })).toMatchObject({ displayValue: "3.0" });
  });

  it("preserves unknown enum values and lowercases them in displayValue (non-coercion)", () => {
    expect(value({ __typename: "BarcodeFieldResponseValue", barcodeType: "FUTURE_CODE", barcodeValue: "z9" })).toEqual({ kind: "barcode", barcodeType: "FUTURE_CODE", barcodeValue: "z9", displayValue: "z9" });
    expect(value({ __typename: "DurationFieldResponseValue", duration: { amount: 2, unit: "FORTNIGHTS" } })).toMatchObject({ unit: "FORTNIGHTS", displayValue: "2 fortnights" });
    expect(value({ __typename: "WeightFieldResponseValue", weight: { amount: "1", unit: "GRAM" } })).toMatchObject({ unit: "GRAM", displayValue: "1 gram" });
  });

  it("renders meta of any JSON shape, and empty string for explicit null", () => {
    expect(value({ __typename: "MetaFieldResponseValue", meta: { a: 1, b: [2, 3] } })).toEqual({ kind: "meta", meta: { a: 1, b: [2, 3] }, displayValue: '{"a":1,"b":[2,3]}' });
    expect(value({ __typename: "MetaFieldResponseValue", meta: [1, 2] })).toMatchObject({ displayValue: "[1,2]" });
    expect(value({ __typename: "MetaFieldResponseValue", meta: "hello" })).toMatchObject({ displayValue: '"hello"' });
    expect(value({ __typename: "MetaFieldResponseValue", meta: 0 })).toMatchObject({ meta: 0, displayValue: "0" });
    expect(value({ __typename: "MetaFieldResponseValue", meta: false })).toMatchObject({ meta: false, displayValue: "false" });
    expect(value({ __typename: "MetaFieldResponseValue", meta: null })).toEqual({ kind: "meta", meta: null, displayValue: "" });
  });

  it("renders zero-ish decimal/percent/integer/age values rather than treating them as absent", () => {
    expect(value({ __typename: "DecimalFieldResponseValue", decimal: "0" })).toMatchObject({ decimal: "0", displayValue: "0" });
    expect(value({ __typename: "PercentFieldResponseValue", percent: "0" })).toMatchObject({ percent: "0", displayValue: "0%" });
    expect(value({ __typename: "IntegerFieldResponseValue", integer: 0 })).toMatchObject({ displayValue: "0" });
    expect(value({ __typename: "AgeFieldResponseValue", age: 0 })).toMatchObject({ displayValue: "0" });
  });

  it("keeps the waiverSigned=false / null distinction on the guest variant", () => {
    expect(value({ __typename: "GuestFieldResponseValue", name: "Ada", waiverSigned: false })).toMatchObject({ waiverSigned: false, displayValue: "Ada" });
    expect(value({ __typename: "GuestFieldResponseValue", name: "Ada" })).toMatchObject({ waiverSigned: null });
  });

  it("does not double-escape ampersands already part of an escape sequence", () => {
    expect(value({ __typename: "HtmlFieldResponseValue", html: "a & <b> &amp; c" })).toMatchObject({
      displayValue: "a &amp; &lt;b&gt; &amp;amp; c",
    });
  });
});

describe("filterMetaDataByIntegrator", () => {
  const entries: MetaData[] = [
    { id: "1", name: "a", slug: "integrators:bob:booking_url", type: "t", prompt: null, promptHint: null, isRequired: false, refid: "r1", value: null },
    { id: "2", name: "b", slug: "integrators:BOB:booking_url", type: "t", prompt: null, promptHint: null, isRequired: false, refid: "r2", value: null },
    { id: "3", name: "c", slug: "integrators:joe:other", type: "t", prompt: null, promptHint: null, isRequired: false, refid: "r3", value: null },
    { id: "4", name: "d", slug: "plain_field", type: "t", prompt: null, promptHint: null, isRequired: false, refid: "r4", value: null },
  ];

  it("keeps only exact-prefix matches (case-sensitive) and strips the prefix", () => {
    const result = filterMetaDataByIntegrator(entries, "bob");
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("1");
    expect(result[0]!.slug).toBe("booking_url");
  });

  it("returns nothing when no slug matches the integrator", () => {
    expect(filterMetaDataByIntegrator(entries, "nope")).toEqual([]);
  });

  it("returns an empty array for empty input", () => {
    expect(filterMetaDataByIntegrator([], "bob")).toEqual([]);
  });

  it("preserves every non-slug field (and the value) on matched entries", () => {
    const entry: MetaData = {
      id: "x",
      name: "Booking URL",
      slug: "integrators:bob:booking_url",
      type: "URL",
      prompt: "P",
      promptHint: "H",
      isRequired: true,
      refid: "r",
      value: { kind: "url", url: "https://x", displayValue: "https://x" },
    };
    expect(filterMetaDataByIntegrator([entry], "bob")).toEqual([{ ...entry, slug: "booking_url" }]);
  });

  it("keeps all of multiple matches for the same integrator", () => {
    const many: MetaData[] = [
      { ...entries[0]!, id: "a", slug: "integrators:bob:one" },
      { ...entries[0]!, id: "b", slug: "integrators:bob:two" },
    ];
    expect(filterMetaDataByIntegrator(many, "bob").map((e) => e.slug)).toEqual(["one", "two"]);
  });

  it("matches only a leading prefix, not one appearing mid-slug", () => {
    const mid: MetaData[] = [{ ...entries[0]!, slug: "x:integrators:bob:y" }];
    expect(filterMetaDataByIntegrator(mid, "bob")).toEqual([]);
  });

  it("strips to an empty slug when the slug is exactly the prefix", () => {
    const exact: MetaData[] = [{ ...entries[0]!, slug: "integrators:bob:" }];
    expect(filterMetaDataByIntegrator(exact, "bob")[0]!.slug).toBe("");
  });

  it("does not match when the integrator is a prefix of another integrator's name", () => {
    const bobby: MetaData[] = [{ ...entries[0]!, slug: "integrators:bobby:url" }];
    expect(filterMetaDataByIntegrator(bobby, "bob")).toEqual([]);
  });
});

describe("toSetMetaDataResult", () => {
  it("maps the success variant to success=true with the echoed id + message", () => {
    expect(
      toSetMetaDataResult(
        { __typename: "UpsertBookingFieldResponsesSuccess", bookingId: "b_1", message: "ok" },
        "b_fallback",
      ),
    ).toEqual({ success: true, bookingId: "b_1", message: "ok" });
  });

  it("maps BookingNotFoundError to success=false, keeping the id + message", () => {
    expect(
      toSetMetaDataResult(
        { __typename: "BookingNotFoundError", bookingId: "b_x", message: "not found" },
        "b_fallback",
      ),
    ).toEqual({ success: false, bookingId: "b_x", message: "not found" });
  });

  it("maps GenericError to success=false, falling back to the requested id", () => {
    expect(
      toSetMetaDataResult({ __typename: "GenericError", message: "boom" }, "b_fallback"),
    ).toEqual({ success: false, bookingId: "b_fallback", message: "boom" });
  });

  it("defaults success=false / message='' for an absent or unknown result", () => {
    expect(toSetMetaDataResult(null, "b_fallback")).toEqual({ success: false, bookingId: "b_fallback", message: "" });
    expect(toSetMetaDataResult({ __typename: "SomethingNew" }, "b_fallback")).toEqual({
      success: false,
      bookingId: "b_fallback",
      message: "",
    });
  });
});
