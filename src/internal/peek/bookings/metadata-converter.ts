/**
 * Pure functions mapping a raw booking-metadata node into the clean
 * {@link MetaData} list, plus the integrator filter. I/O-free.
 */
import type {
  MetaData,
  MetaDataBarcodeType,
  MetaDataDurationUnit,
  MetaDataValue,
  MetaDataVolumeUnit,
  MetaDataWeightUnit,
  SetMetaDataResult,
} from "../../../models/peek/booking-metadata.js";
import type {
  BookingMetaDataNode,
  MetaDataFieldResponseNode,
  MetaDataValueNode,
  UpsertBookingFieldResponsesResponse,
} from "./metadata-queries.js";

/** The `__typename` of the successful upsert result variant. */
const UPSERT_SUCCESS_TYPENAME = "UpsertBookingFieldResponsesSuccess";

/** Converts a raw booking-metadata node into a list of clean {@link MetaData}. */
export function fromBookingMetaDataNode(
  node: BookingMetaDataNode | null | undefined,
): MetaData[] {
  return (node?.fieldResponses ?? []).map(fromFieldResponseNode);
}

/** Maps a single raw field-response node into a {@link MetaData}. */
function fromFieldResponseNode(response: MetaDataFieldResponseNode): MetaData {
  const field = response.fieldLocation?.field;
  const prompt = response.fieldLocation?.prompt;
  return {
    id: field?.id || "",
    name: field?.name || "",
    slug: field?.slug || "",
    type: field?.type || "",
    prompt: prompt?.label ?? null,
    promptHint: prompt?.hint ?? null,
    isRequired: Boolean(prompt?.isRequired),
    refid: response.refid || "",
    value: fromValueNode(response.value),
  };
}

/**
 * Maps the raw union value node to a typed {@link MetaDataValue}, discriminating
 * on `__typename`. Returns `null` when absent or of an unrecognized (future)
 * variant — unknown types are never coerced.
 */
function fromValueNode(value: MetaDataValueNode | null | undefined): MetaDataValue | null {
  if (!value || !value.__typename) return null;
  switch (value.__typename) {
    case "AgeFieldResponseValue": {
      const age = value.age ?? 0;
      return { kind: "age", age, displayValue: String(age) };
    }
    case "AttachmentFieldResponseValue": {
      const attachmentUrl = value.attachmentUrl ?? "";
      const name = value.name ?? null;
      return {
        kind: "attachment",
        attachmentUrl,
        mime: value.mime ?? null,
        name,
        size: value.size ?? null,
        displayValue: name || attachmentUrl,
      };
    }
    case "BarcodeFieldResponseValue": {
      const barcodeValue = value.barcodeValue ?? "";
      return {
        kind: "barcode",
        barcodeType: (value.barcodeType as MetaDataBarcodeType | null) ?? null,
        barcodeValue,
        displayValue: barcodeValue,
      };
    }
    case "BooleanFieldResponseValue": {
      const bool = Boolean(value.boolean);
      return { kind: "boolean", boolean: bool, displayValue: yesNo(bool) };
    }
    case "CheckboxFieldResponseValue": {
      const isChecked = Boolean(value.isChecked);
      return { kind: "checkbox", isChecked, displayValue: yesNo(isChecked) };
    }
    case "CurrencyFieldResponseValue": {
      const currency = value.currency ?? "";
      return { kind: "currency", currency, displayValue: currency };
    }
    case "DateFieldResponseValue": {
      const date = value.date ?? "";
      return { kind: "date", date, displayValue: date };
    }
    case "DecimalFieldResponseValue": {
      const decimal = value.decimal ?? null;
      return { kind: "decimal", decimal, displayValue: decimal ?? "" };
    }
    case "DurationFieldResponseValue": {
      const amount = value.duration?.amount ?? 0;
      const unit = (value.duration?.unit as MetaDataDurationUnit | null) ?? null;
      return { kind: "duration", amount, unit, displayValue: amountUnit(amount, unit) };
    }
    case "EmailFieldResponseValue": {
      const email = value.email ?? null;
      return { kind: "email", email, displayValue: email ?? "" };
    }
    case "GuestFieldResponseValue": {
      const name = value.name ?? null;
      return {
        kind: "guest",
        name,
        email: value.email ?? null,
        dateOfBirth: value.dateOfBirth ?? null,
        notes: value.notes ?? null,
        waiverSigned: value.waiverSigned ?? null,
        displayValue: name ?? "",
      };
    }
    case "HtmlFieldResponseValue": {
      const html = value.html ?? "";
      return { kind: "html", html, displayValue: escapeHtml(html) };
    }
    case "ImageUrlFieldResponseValue": {
      const imageUrl = value.imageUrl ?? "";
      return { kind: "imageUrl", imageUrl, displayValue: imageUrl };
    }
    case "IntegerFieldResponseValue": {
      const integer = value.integer ?? 0;
      return { kind: "integer", integer, displayValue: String(integer) };
    }
    case "LocationFieldResponseValue": {
      const streetAddress = value.streetAddress ?? null;
      const locality = value.locality ?? null;
      const region = value.region ?? null;
      const postalCode = value.postalCode ?? null;
      const country = value.country ?? null;
      return {
        kind: "location",
        country,
        county: value.county ?? null,
        locality,
        postalCode,
        region,
        streetAddress,
        displayValue: [streetAddress, locality, region, postalCode, country]
          .filter((part) => part)
          .join(", "),
      };
    }
    case "LongTextFieldResponseValue": {
      const longText = value.longText ?? "";
      return { kind: "longText", longText, displayValue: longText };
    }
    case "MetaFieldResponseValue": {
      const meta = value.meta ?? null;
      return { kind: "meta", meta, displayValue: meta == null ? "" : JSON.stringify(meta) };
    }
    case "PercentFieldResponseValue": {
      const percent = value.percent ?? null;
      return { kind: "percent", percent, displayValue: percent == null ? "" : `${percent}%` };
    }
    case "PhoneFieldResponseValue": {
      const phone = value.phone ?? "";
      return { kind: "phone", phone, displayValue: phone };
    }
    case "ShortTextFieldResponseValue": {
      const shortText = value.shortText ?? "";
      return { kind: "shortText", shortText, displayValue: shortText };
    }
    case "TimeFieldResponseValue": {
      const time = value.time ?? "";
      return { kind: "time", time, displayValue: time };
    }
    case "UrlFieldResponseValue": {
      const url = value.url ?? null;
      return { kind: "url", url, displayValue: url ?? "" };
    }
    case "VolumeFieldResponseValue": {
      const amount = value.volume?.amount ?? "0";
      const unit = (value.volume?.unit as MetaDataVolumeUnit | null) ?? null;
      return { kind: "volume", amount, unit, displayValue: amountUnit(amount, unit) };
    }
    case "WeightFieldResponseValue": {
      const amount = value.weight?.amount ?? "0";
      const unit = (value.weight?.unit as MetaDataWeightUnit | null) ?? null;
      return { kind: "weight", amount, unit, displayValue: amountUnit(amount, unit) };
    }
    default:
      return null;
  }
}

/** `"Yes"`/`"No"` rendering for boolean-like values. */
function yesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

/** `"<amount> <unit>"` (unit lowercased), or just the amount when no unit. */
function amountUnit(amount: number | string, unit: string | null): string {
  return unit ? `${amount} ${unit.toLowerCase()}` : String(amount);
}

/** Escapes the five HTML-significant characters so a string is safe to render as text. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Maps the `upsertBookingFieldResponses` result union into a clean
 * {@link SetMetaDataResult}. `success` is true only for the success variant; the
 * message and (when present) echoed booking id are carried across, falling back
 * to the requested `bookingId`.
 */
export function toSetMetaDataResult(
  node: UpsertBookingFieldResponsesResponse["upsertBookingFieldResponses"],
  bookingId: string,
): SetMetaDataResult {
  return {
    success: node?.__typename === UPSERT_SUCCESS_TYPENAME,
    bookingId: node?.bookingId || bookingId,
    message: node?.message || "",
  };
}

/**
 * Keeps only the metadata whose `slug` starts with `integrators:<integrator>:`
 * (case-sensitive exact prefix), stripping that prefix off the returned `slug`
 * (e.g. with `integrator = "bob"`, `integrators:bob:booking_url` → `booking_url`).
 */
export function filterMetaDataByIntegrator(
  metaData: MetaData[],
  integrator: string,
): MetaData[] {
  const prefix = `integrators:${integrator}:`;
  return metaData
    .filter((entry) => entry.slug.startsWith(prefix))
    .map((entry) => ({ ...entry, slug: entry.slug.slice(prefix.length) }));
}
