/**
 * Pure mappers between the raw `sales` add-ons response and the add-on models.
 *
 * `parseSaleNode` produces the internal, detail-rich {@link AddonItem} model
 * (refids + reservation statuses) that the service uses to build add/cancel
 * mutations. `toBookingAddon` collapses one internal item into the clean,
 * public {@link BookingAddon}. The internal model is intentionally not exported
 * from the package's public entry point.
 */
import type { BookingAddon, BookingAddonOption } from "../../models/booking-addon.js";
import {
  ADDON_OPTION_STATUS_CANCELED,
  type AddonGqlPrice,
  type SalesAddonBookingNode,
} from "./addon-queries.js";

const ERROR_INCONSISTENT_ADDON_ITEM_ID =
  "Add-on group contains options with mismatched item IDs";

/** One add-on option on a booking, with the refids/statuses needed to mutate it. */
export interface AddonItemOption {
  itemId: string;
  optionId: string;
  itemName: string;
  optionName: string;
  optionRefid: string;
  optionReservationStatus: string;
  itemReservationStatus: string;
  itemRefid: string;
}

/** One add-on item on a booking (internal; grouped by add-on item). */
export interface AddonItem {
  bookingId: string;
  displayId: string;
  orderId: string;
  total: AddonGqlPrice | null;
  bookingQuoteRefid: string;
  bookingQuoteReservationStatus: string;
  addonItemOptions: AddonItemOption[];
}

/**
 * Converts a single booking node into the internal {@link AddonItem}[] model.
 * Booking-level identifiers (bookingId, displayId, orderId) are repeated on
 * each item for convenience.
 */
export function parseSaleNode(node: SalesAddonBookingNode): AddonItem[] {
  const bookingId = node.id || "";
  const displayId = node.displayId || "";
  const orderId = node.order?.id || "";
  const bookingQuoteRefid = node.refid || "";
  const bookingQuoteReservationStatus = node.reservationStatus || "";
  const items = Array.isArray(node.items) ? node.items : [];

  return items.map((item) => {
    const options = Array.isArray(item.options) ? item.options : [];
    const addonItemOptions: AddonItemOption[] = options.map((opt) => ({
      itemId: opt.itemSnapshot?.id || "",
      optionId: opt.itemOptionSnapshot?.id || "",
      itemName: opt.itemSnapshot?.name || "",
      optionName: opt.itemOptionSnapshot?.name || "",
      optionRefid: opt.refid || "",
      optionReservationStatus: opt.reservationStatus || "",
      itemReservationStatus: item.reservationStatus || "",
      itemRefid: item.refid || "",
    }));

    return {
      bookingId,
      displayId,
      orderId,
      total: item.value?.total ?? null,
      bookingQuoteRefid,
      bookingQuoteReservationStatus,
      addonItemOptions,
    };
  });
}

/**
 * Collapses one internal {@link AddonItem} (already grouped by add-on item id)
 * into a clean public {@link BookingAddon}. All of the item's options must
 * share the same item id (a data-integrity invariant); a mismatch throws.
 * Canceled options are dropped and the rest are combined by option id with a
 * quantity count. Returns `null` when no live options remain, so the caller
 * can omit the add-on entirely.
 */
export function toBookingAddon(item: AddonItem): BookingAddon | null {
  const options = item.addonItemOptions || [];
  if (options.length === 0) {
    return null;
  }

  const addonId = options[0]!.itemId;
  const addonName = options[0]!.itemName;

  if (options.some((opt) => opt.itemId !== addonId)) {
    throw new Error(ERROR_INCONSISTENT_ADDON_ITEM_ID);
  }

  const grouped = new Map<string, BookingAddonOption>();
  options
    .filter((opt) => opt.optionReservationStatus !== ADDON_OPTION_STATUS_CANCELED)
    .forEach((opt) => {
      const existing = grouped.get(opt.optionId);
      if (existing) {
        existing.quantity += 1;
      } else {
        grouped.set(opt.optionId, {
          addonOptionId: opt.optionId,
          addonOptionName: opt.optionName,
          quantity: 1,
        });
      }
    });

  const addonOptions = Array.from(grouped.values());
  if (addonOptions.length === 0) {
    return null;
  }

  return { addonId, addonName, total: item.total, addonOptions };
}
