/**
 * Resolves the dedicated guests query into a merged guest list (booking guests
 * plus the primary guest when not already present).
 */
import type { Guest } from "../../models/booking.js";
import { mapGuestNode } from "./booking-converter.js";
import type { BookingGuestsResponse } from "./booking-queries.js";

/** Maps a booking-guests response into a {@link Guest} list. */
export function fromBookingGuestsResponse(
  response: BookingGuestsResponse | undefined,
): Guest[] {
  const firstEdge = (response?.sales?.edges ?? [])[0];
  if (!firstEdge) {
    return [];
  }

  const bookingNode = firstEdge.node;
  const primaryGuestNode = bookingNode.primaryGuest;
  const bookingGuestsNodes = Array.isArray(bookingNode.bookingGuests)
    ? bookingNode.bookingGuests
    : [];
  const primaryId = primaryGuestNode?.id;

  const guests: Guest[] = [];
  for (const guestNode of bookingGuestsNodes) {
    guests.push(mapGuestNode(guestNode, primaryId ? guestNode.id === primaryId : false));
  }

  const hasPrimaryInGuests = primaryId
    ? bookingGuestsNodes.some((guest) => guest.id === primaryId)
    : false;
  if (!hasPrimaryInGuests && primaryGuestNode) {
    guests.push(mapGuestNode(primaryGuestNode, true));
  }

  return guests;
}
