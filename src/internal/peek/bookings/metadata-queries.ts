/**
 * Raw Peek GraphQL selection, query builder, and response shapes for a booking's
 * custom-field metadata (`fieldResponses`). Internal.
 *
 * The query is a variant of the single-booking read: it reuses the shared
 * `sales(...)` envelope ({@link buildSalesQuery}) and the shared variable builder
 * ({@link buildBookingsVariables}), selecting only the field-response tree.
 */
import { buildSalesQuery } from "./booking-queries.js";

/**
 * The `GuestFieldResponseValue` selection. The customer-identity fields
 * (`name`/`email`/`dateOfBirth`) are PII — selected only when
 * `fullCustomerAccess` is set, so without it the gateway never returns them
 * (→ `null` in the converter). `notes`/`waiverSigned` always stay.
 */
const GUEST_VALUE_PII_FIELDS = "dateOfBirth\n      email\n      name\n      ";

function buildGuestValueFields(fullCustomerAccess: boolean): string {
  return `... on GuestFieldResponseValue {
      ${fullCustomerAccess ? GUEST_VALUE_PII_FIELDS : ""}notes
      waiverSigned
    }`;
}

/**
 * Builds the `value { __typename … }` union selection. `__typename` is selected
 * so the converter can discriminate the variant cleanly. The only part that
 * varies is the PII-gated guest fragment.
 */
function buildMetaDataValueSelection(fullCustomerAccess: boolean): string {
  return `value {
    __typename
    ... on AgeFieldResponseValue { age }
    ... on AttachmentFieldResponseValue { attachmentUrl mime name size }
    ... on BarcodeFieldResponseValue { barcodeType barcodeValue }
    ... on BooleanFieldResponseValue { boolean }
    ... on CheckboxFieldResponseValue { isChecked }
    ... on CurrencyFieldResponseValue { currency }
    ... on DateFieldResponseValue { date }
    ... on DecimalFieldResponseValue { decimal }
    ... on DurationFieldResponseValue { duration { amount unit } }
    ... on EmailFieldResponseValue { email }
    ${buildGuestValueFields(fullCustomerAccess)}
    ... on HtmlFieldResponseValue { html }
    ... on ImageUrlFieldResponseValue { imageUrl }
    ... on IntegerFieldResponseValue { integer }
    ... on LocationFieldResponseValue { country county locality postalCode region streetAddress }
    ... on LongTextFieldResponseValue { longText }
    ... on MetaFieldResponseValue { meta }
    ... on PercentFieldResponseValue { percent }
    ... on PhoneFieldResponseValue { phone }
    ... on ShortTextFieldResponseValue { shortText }
    ... on TimeFieldResponseValue { time }
    ... on UrlFieldResponseValue { url }
    ... on VolumeFieldResponseValue { volume { amount unit } }
    ... on WeightFieldResponseValue { weight { amount unit } }
  }`;
}

/**
 * Builds the booking-metadata query. Without `fullCustomerAccess` the guest
 * value's identity fields (name/email/DOB) are not requested at all.
 */
export function buildBookingMetaDataQuery(fullCustomerAccess: boolean): string {
  return buildSalesQuery(`
    ... on Booking {
      displayId
      id
      fieldResponses {
        fieldLocation {
          field { id name slug type }
          prompt { label hint isRequired }
        }
        refid
        ${buildMetaDataValueSelection(fullCustomerAccess)}
      }
    }
  `);
}

// ---- Raw response shapes -------------------------------------------------

/** The raw union value node — one branch populated per `__typename`. */
export interface MetaDataValueNode {
  __typename?: string;
  age?: number | null;
  attachmentUrl?: string | null;
  mime?: string | null;
  name?: string | null;
  size?: number | null;
  barcodeType?: string | null;
  barcodeValue?: string | null;
  boolean?: boolean | null;
  isChecked?: boolean | null;
  currency?: string | null;
  date?: string | null;
  decimal?: string | null;
  duration?: { amount?: number | null; unit?: string | null } | null;
  email?: string | null;
  dateOfBirth?: string | null;
  notes?: string | null;
  waiverSigned?: boolean | null;
  html?: string | null;
  imageUrl?: string | null;
  integer?: number | null;
  country?: string | null;
  county?: string | null;
  locality?: string | null;
  postalCode?: string | null;
  region?: string | null;
  streetAddress?: string | null;
  longText?: string | null;
  meta?: unknown;
  percent?: string | null;
  phone?: string | null;
  shortText?: string | null;
  time?: string | null;
  url?: string | null;
  volume?: { amount?: string | null; unit?: string | null } | null;
  weight?: { amount?: string | null; unit?: string | null } | null;
}

export interface MetaDataFieldResponseNode {
  fieldLocation?: {
    field?: { id?: string; name?: string; slug?: string; type?: string } | null;
    prompt?: { label?: string | null; hint?: string | null; isRequired?: boolean } | null;
  } | null;
  refid?: string;
  value?: MetaDataValueNode | null;
}

export interface BookingMetaDataNode {
  displayId?: string;
  id?: string;
  fieldResponses?: MetaDataFieldResponseNode[] | null;
}

export interface BookingMetaDataResponse {
  sales: {
    pageInfo?: { endCursor: string | null; hasNextPage: boolean };
    edges: Array<{ node: BookingMetaDataNode }>;
  };
}
