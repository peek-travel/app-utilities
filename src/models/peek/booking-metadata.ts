/**
 * The clean, transport-agnostic data model for a booking's custom-field
 * metadata (the booking's `fieldResponses`).
 *
 * Each {@link MetaData} entry flattens the field definition (id/name/slug/type),
 * its prompt (label/hint/required), and the response `refid`, and carries a
 * single typed {@link MetaDataValue} — a discriminated union (keyed by `kind`)
 * mirroring the gateway's `FieldResponseValue` variants, so exactly one shape is
 * present per entry and consumers narrow on `kind`.
 */

/** Barcode symbology reported on a `kind: "barcode"` metadata value. */
export type MetaDataBarcodeType =
  | "BARCODE_CODE128"
  | "BARCODE_CODE39"
  | "DATA_MATRIX"
  | "EAN_13"
  | "ITF"
  | "QR_CODE"
  | "TEXT"
  | "UPC";

/** Time unit reported on a `kind: "duration"` metadata value. */
export type MetaDataDurationUnit =
  | "SECONDS"
  | "MINUTES"
  | "HOURS"
  | "DAYS"
  | "WEEKS"
  | "MONTHS"
  | "YEARS";

/** Mass unit reported on a `kind: "weight"` metadata value. */
export type MetaDataWeightUnit = "KILOGRAM" | "POUND" | "STONE";

/** Volume unit reported on a `kind: "volume"` metadata value. */
export type MetaDataVolumeUnit = "GALLON";

/**
 * A booking custom-field response value — a discriminated union keyed by `kind`,
 * one variant per gateway `…FieldResponseValue` type. Numeric `Int` values are
 * `number`; `Decimal` values are kept as strings to avoid float-precision loss;
 * `Date`/`Time` values are ISO strings.
 *
 * Every variant also carries a `displayValue` — a human-readable, display-safe
 * string rendering of the value (empty when the underlying value is absent). The
 * `html` variant's `displayValue` is HTML-escaped so it is safe to render as
 * text.
 */
export type MetaDataValue =
  | { kind: "age"; age: number; displayValue: string }
  | {
      kind: "attachment";
      attachmentUrl: string;
      mime: string | null;
      name: string | null;
      size: number | null;
      displayValue: string;
    }
  | {
      kind: "barcode";
      barcodeType: MetaDataBarcodeType | null;
      barcodeValue: string;
      displayValue: string;
    }
  | { kind: "boolean"; boolean: boolean; displayValue: string }
  | { kind: "checkbox"; isChecked: boolean; displayValue: string }
  | { kind: "currency"; currency: string; displayValue: string }
  | { kind: "date"; date: string; displayValue: string }
  | { kind: "decimal"; decimal: string | null; displayValue: string }
  | { kind: "duration"; amount: number; unit: MetaDataDurationUnit | null; displayValue: string }
  | { kind: "email"; email: string | null; displayValue: string }
  | {
      kind: "guest";
      name: string | null;
      email: string | null;
      dateOfBirth: string | null;
      notes: string | null;
      waiverSigned: boolean | null;
      displayValue: string;
    }
  | { kind: "html"; html: string; displayValue: string }
  | { kind: "imageUrl"; imageUrl: string; displayValue: string }
  | { kind: "integer"; integer: number; displayValue: string }
  | {
      kind: "location";
      country: string | null;
      county: string | null;
      locality: string | null;
      postalCode: string | null;
      region: string | null;
      streetAddress: string | null;
      displayValue: string;
    }
  | { kind: "longText"; longText: string; displayValue: string }
  | { kind: "meta"; meta: unknown; displayValue: string }
  | { kind: "percent"; percent: string | null; displayValue: string }
  | { kind: "phone"; phone: string; displayValue: string }
  | { kind: "shortText"; shortText: string; displayValue: string }
  | { kind: "time"; time: string; displayValue: string }
  | { kind: "url"; url: string | null; displayValue: string }
  | { kind: "volume"; amount: string; unit: MetaDataVolumeUnit | null; displayValue: string }
  | { kind: "weight"; amount: string; unit: MetaDataWeightUnit | null; displayValue: string };

/** A single booking custom-field response (one `fieldResponse`). */
export interface MetaData {
  /** Field definition id. */
  id: string;
  /** Field name (human label). */
  name: string;
  /**
   * Field slug. When an `integrator` filter is applied, the matched
   * `integrators:<integrator>:` prefix is stripped off (e.g.
   * `integrators:bob:booking_url` → `booking_url`).
   */
  slug: string;
  /** Raw field type reported by the gateway (kept as a string). */
  type: string;
  /** Prompt label shown for the field, or `null` when the field has no prompt. */
  prompt: string | null;
  /** Prompt hint text, or `null`. */
  promptHint: string | null;
  /** Whether the field is required (`false` when the field has no prompt). */
  isRequired: boolean;
  /** The response's reference id. */
  refid: string;
  /**
   * The typed response value, or `null` when absent or of an unrecognized
   * (future) variant.
   */
  value: MetaDataValue | null;
}

/** A guest entry for `BookingService.setMetaDataGuest`. */
export interface SetMetaDataGuestInput {
  /** Guest name (required). */
  name: string;
  /** Guest email (required). */
  email: string;
  /** Date of birth as an ISO date (e.g. `"2010-06-21"`). */
  dateOfBirth?: string;
  /** Whether the guest signed the waiver. */
  waiverSigned?: boolean;
  /** Free-text notes. */
  notes?: string;
}

/** An attachment entry for `BookingService.setMetaDataAttachment`. */
export interface SetMetaDataAttachmentInput {
  /** Display name for the attachment (required). */
  name: string;
  /** URL of the attachment (required). */
  attachmentUrl: string;
}

/** The result of a `setMetaData…` write. */
export interface SetMetaDataResult {
  /** Whether the gateway reported the upsert succeeded. */
  success: boolean;
  /** The booking id echoed back (falls back to the requested id). */
  bookingId: string;
  /** The gateway's success or error message (`""` when none). */
  message: string;
}
