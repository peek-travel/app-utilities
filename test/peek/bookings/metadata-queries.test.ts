import { describe, expect, it } from "vitest";

import { buildBookingMetaDataQuery } from "../../../src/internal/peek/bookings/metadata-queries.js";

/** Collapses whitespace so selection sets match regardless of layout. */
function collapse(query: string): string {
  return query.replace(/\s+/g, " ").trim();
}

describe("buildBookingMetaDataQuery", () => {
  it("selects the field-response tree inside the shared sales envelope", () => {
    const query = collapse(buildBookingMetaDataQuery(false));
    expect(query).toContain("sales(after: $after, first: $first, filter: $filter, orderBy: $orderBy)");
    expect(query).toContain("fieldResponses { fieldLocation { field { id name slug type }");
    expect(query).toContain("prompt { label hint isRequired }");
    expect(query).toContain("value { __typename");
    expect(query).toContain("... on WeightFieldResponseValue { weight { amount unit } }");
  });

  it("selects an inline fragment for every field-response value variant", () => {
    const query = collapse(buildBookingMetaDataQuery(true));
    const variants = [
      "Age", "Attachment", "Barcode", "Boolean", "Checkbox", "Currency", "Date",
      "Decimal", "Duration", "Email", "Guest", "Html", "ImageUrl", "Integer",
      "Location", "LongText", "Meta", "Percent", "Phone", "ShortText", "Time",
      "Url", "Volume", "Weight",
    ];
    for (const variant of variants) {
      expect(query).toContain(`... on ${variant}FieldResponseValue`);
    }
  });

  it("requests guest identity value fields when fullCustomerAccess is true", () => {
    const query = collapse(buildBookingMetaDataQuery(true));
    expect(query).toContain(
      "... on GuestFieldResponseValue { dateOfBirth email name notes waiverSigned }",
    );
  });

  it("omits guest name/email/dateOfBirth when fullCustomerAccess is false", () => {
    const query = collapse(buildBookingMetaDataQuery(false));
    expect(query).toContain("... on GuestFieldResponseValue { notes waiverSigned }");
    // PII value fields are not pulled at all.
    expect(query).not.toContain("dateOfBirth");
    expect(query).not.toContain("... on GuestFieldResponseValue { dateOfBirth");
  });
});
