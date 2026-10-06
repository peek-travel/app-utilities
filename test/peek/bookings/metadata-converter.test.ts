import { describe, expect, it } from "vitest";

import {
  filterMetaDataByIntegrator,
  fromBookingMetaDataNode,
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
  it("maps the envelope and flattens field + prompt + refid", () => {
    const node: BookingMetaDataNode = {
      id: "b_1",
      displayId: "B-1",
      fieldResponses: [response("shortText", { __typename: "ShortTextFieldResponseValue", shortText: "hi" })],
    };
    const result = fromBookingMetaDataNode(node);
    expect(result.bookingId).toBe("b_1");
    expect(result.displayId).toBe("B-1");
    expect(result.metaData).toHaveLength(1);
    expect(result.metaData[0]).toMatchObject({
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
    const [entry] = fromBookingMetaDataNode(node).metaData;
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
    const values = fromBookingMetaDataNode({ id: "b_1", displayId: "B-1", fieldResponses: responses }).metaData.map(
      (m) => m.value,
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
    const values = fromBookingMetaDataNode({ id: "b", displayId: "B", fieldResponses: responses }).metaData.map(
      (m) => m.value,
    );
    expect(values[0]).toBeNull();
    expect(values[1]).toBeNull();
    expect(values[2]).toBeNull();
    expect(values[3]).toEqual({ kind: "age", age: 0, displayValue: "0" });
    expect(values[4]).toEqual({
      kind: "guest",
      name: null,
      email: null,
      dateOfBirth: null,
      notes: "n",
      waiverSigned: false,
      displayValue: "",
    });
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
    const values = fromBookingMetaDataNode({ id: "b", displayId: "B", fieldResponses: responses }).metaData.map(
      (m) => m.value,
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
    }).metaData;
    expect(entry!.value).toEqual({
      kind: "html",
      html: `<a href="x">A & 'B'</a>`,
      displayValue: "&lt;a href=&quot;x&quot;&gt;A &amp; &#39;B&#39;&lt;/a&gt;",
    });
  });

  it("returns an empty envelope for a missing node", () => {
    expect(fromBookingMetaDataNode(undefined)).toEqual({ bookingId: "", displayId: "", metaData: [] });
  });
});

describe("filterMetaDataByIntegrator", () => {
  const entries: MetaData[] = [
    { id: "1", name: "a", slug: "integrator:bob:booking_url", type: "t", prompt: null, promptHint: null, isRequired: false, refid: "r1", value: null },
    { id: "2", name: "b", slug: "integrator:BOB:booking_url", type: "t", prompt: null, promptHint: null, isRequired: false, refid: "r2", value: null },
    { id: "3", name: "c", slug: "integrator:joe:other", type: "t", prompt: null, promptHint: null, isRequired: false, refid: "r3", value: null },
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
});
