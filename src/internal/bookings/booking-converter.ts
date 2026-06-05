/**
 * Pure functions mapping a raw booking node into the clean {@link Booking}
 * model. Ported from the connector's BookingConverter.
 */
import type {
  Booking,
  CustomQuestionAnswer,
  Guest,
  GuestMetadata,
  Price,
  ResourcePoolAssignment,
  Ticket,
} from "../../models/booking.js";
import type { BookingGuestNode, BookingNode } from "./booking-queries.js";

const UNKNOWN = "unknown";

const SOURCE_SOURCE_MAP: Record<string, string> = {
  APP_REGISTRY: "app",
  BOOKING_IMPORTER_FUTURE: "importer",
  BOOKING_IMPORTER_HISTORIC: "importer",
  EXPEDIA: "expedia",
  GROUPON: "groupon",
  GYG: "getyourguide",
  HOOK: "internal",
  INTERNAL_TOOLS: "internal",
  IOS_PP: "ios",
  OCTO: "octo",
  PDC: "peekcom",
  PEEK_PLUS: "peekcom",
  PP: "backend",
  RWG: "rwg",
  SELF_SERVE: "internal",
  SYSTEM: "internal",
  VIATOR: "viator",
  WIDGET: "website",
  YELP: "yelp",
};

const SOURCE_DESC_MAP: Record<string, string> = {
  APP_REGISTRY: "App Store App",
  BOOKING_IMPORTER_FUTURE: "Booking Importer",
  BOOKING_IMPORTER_HISTORIC: "Booking Importer",
  EXPEDIA: "Expedia",
  GROUPON: "Groupon",
  GYG: "GetYourGuide",
  HOOK: "Internal",
  INTERNAL_TOOLS: "Internal",
  IOS_PP: "Peek Pro: iOS App",
  OCTO: "OCTO",
  PDC: "Peek.com",
  PEEK_PLUS: "Peek.com",
  PP: "Peek Pro: Backend",
  RWG: "Reserve with Google",
  SELF_SERVE: "Internal",
  SYSTEM: "Internal",
  VIATOR: "Viator",
  WIDGET: "Website Booking Flow",
  YELP: "Yelp",
};

/** Converts a raw booking node into a {@link Booking}. */
export function fromBookingNode(
  node: BookingNode | null | undefined,
  includeGuests = false,
  includePriceBreakdown = false,
): Booking {
  const data = node ?? {};
  const ticketQuantities = data.ticketQuantities ?? [];
  const app = data.order?.initialQuote?.source?.actor?.app ?? null;

  const customQuestionAnswers: CustomQuestionAnswer[] = (data.questionAnswers ?? []).map(
    (answer) => {
      const base: CustomQuestionAnswer = {
        question: answer.questionText,
        answer: answer.answer,
      };
      const location = answer.questionLocationSnapshot;
      if (location && location.latitude && location.longitude) {
        base.latitude = location.latitude;
        base.longitude = location.longitude;
      }
      return base;
    },
  );

  const customGuestQuestionAnswers: CustomQuestionAnswer[] = Array.isArray(data.tickets)
    ? data.tickets.flatMap((ticket) =>
        Array.isArray(ticket?.questionAnswers)
          ? ticket.questionAnswers
              .filter((qa) => qa && qa.answer !== undefined && qa.questionText !== undefined)
              .map((qa) => ({ question: qa.questionText, answer: qa.answer }))
          : [],
      )
    : [];

  return {
    bookingId: data.id || "",
    displayId: data.displayId || "",

    source: sourceFromApp(app),
    sourceApp: app || UNKNOWN,
    sourceDescription: sourceDescriptionFromApp(app),

    customerName: data.primaryGuest?.name || "",
    customerEmail: data.primaryGuest?.email || null,
    customerPhone: data.primaryGuest?.phone || null,

    productId: data.activitySnapshot?.id || UNKNOWN,
    productName: data.activitySnapshot?.name || UNKNOWN,
    isRentalProduct: data.activitySnapshot?.type === "RENTAL",

    timeslotId: data.timeSnapshot?.legacyId || null,
    totalTickets: ticketQuantity(ticketQuantities),
    ticketDescription: formatTickets(ticketQuantities),
    tickets: ticketsToTicketArray(ticketQuantities),

    isCanceled: data.reservationStatus === "CANCELED",
    isNoShow: data.fulfillmentStatusOverride?.status === "NO_SHOW",
    isCheckedIn: data.checkinStatus !== "NONE",
    isReturned: data.returnStatus !== "NONE",

    purchasedAt: data.purchasedAt || null,
    purchasedAtUtc: data.purchasedAtUtc || null,
    startsAt: data.startsAt || null,
    startsAtUtc: data.startsAtUtc || null,
    endsAt: data.endsAt || null,
    endsAtUtc: data.endsAtUtc || null,
    durationMin: durationInMin(data.startsAt || null, data.endsAt || null),
    availabilityTimeId: data.availabilityTimeId || null,

    portalUrl: data.bookingPortalUrl || null,
    notes: data.operatorNotes || "",

    valueDisplay: data.value?.total?.formatted || "",
    valueAmount: data.value?.total?.amount || "",

    outstandingBalanceAmount: data.balance?.total?.amount || "",
    outstandingBalanceDisplay: data.balance?.total?.formatted || "",
    promoCodes: data.order?.promoCodes?.map((promo) => promo.code) ?? [],
    tips: (data.tips ?? []).map((tip) => ({
      display: tip.price?.formatted || "",
      amount: tip.price?.amount || "",
    })),

    customQuestionAnswers,
    customGuestQuestionAnswers,

    resources: (data.resourcePoolAssignments ?? []).map((resource) => ({
      quantity: resource.quantity || 0,
      name: resource.resourcePool?.name || "",
      shortName: resource.resourcePool?.shortName || "",
    })),

    resourcePoolAssignments: mapResourcePoolAssignments(data.resourcePoolAssignments),

    resellerId: data.order?.channelSnapshot?.id || null,
    resellerName: resellerNameFromChannelSnapshot(data.order?.channelSnapshot),

    orderId: data.order?.id || "",

    convenienceFee: includePriceBreakdown ? mapPrice(data.value?.convenienceFee) : undefined,
    deposit: includePriceBreakdown ? mapPrice(data.value?.deposit) : undefined,
    discount: includePriceBreakdown ? mapPrice(data.value?.discount) : undefined,
    discountedPrice: includePriceBreakdown ? mapPrice(data.value?.discountedPrice) : undefined,
    fees: includePriceBreakdown ? mapPrice(data.value?.fees) : undefined,
    flatPartnerFee: includePriceBreakdown ? mapPrice(data.value?.flatPartnerFee) : undefined,
    price: includePriceBreakdown ? mapPrice(data.value?.price) : undefined,
    retailPrice: includePriceBreakdown ? mapPrice(data.value?.retailPrice) : undefined,
    taxes: includePriceBreakdown ? mapPrice(data.value?.taxes) : undefined,
    tipsBreakdown: includePriceBreakdown ? mapPrice(data.value?.tips) : undefined,

    guests: includeGuests ? convertGuests(data) : undefined,
  };
}

/** Merges a booking node's `bookingGuests` + `primaryGuest` into a guest list. */
export function convertGuests(data: BookingNode): Guest[] {
  const bookingGuestsNodes = Array.isArray(data.bookingGuests) ? data.bookingGuests : [];
  const primaryGuestNode = data.primaryGuest;
  const primaryId = primaryGuestNode?.id;

  const guests: Guest[] = [];
  for (const guestNode of bookingGuestsNodes) {
    guests.push(mapGuestNode(guestNode, primaryId ? guestNode.id === primaryId : false));
  }

  const hasPrimaryInGuests = primaryId
    ? bookingGuestsNodes.some((guest) => guest.id === primaryId)
    : false;
  if (!hasPrimaryInGuests && primaryGuestNode?.id) {
    guests.push(mapGuestNode(primaryGuestNode, true));
  }

  return guests;
}

/** Maps a single raw guest node into a {@link Guest}. */
export function mapGuestNode(guestNode: BookingGuestNode, isPrimary: boolean): Guest {
  const fieldResponses = Array.isArray(guestNode.fieldResponses) ? guestNode.fieldResponses : [];
  const metadata: GuestMetadata[] = fieldResponses.map((response) => ({
    id: response.id,
    name: response.fieldLocation?.field?.name ?? "",
    value: response.text ?? "",
  }));

  return {
    id: guestNode.id,
    name: guestNode.name ?? null,
    country: guestNode.country ?? null,
    dateOfBirth: guestNode.dateOfBirth ? new Date(guestNode.dateOfBirth) : null,
    phone: guestNode.phone ?? null,
    email: guestNode.email ?? null,
    isGdpr: Boolean(guestNode.isGdpr),
    isParticipant: Boolean(guestNode.isParticipant),
    isPrimary,
    optinSms: Boolean(guestNode.optinSms),
    optinMarketing: Boolean(guestNode.optinMarketing),
    postalCode: guestNode.postalCode ?? null,
    metadata,
  };
}

function sourceFromApp(app: string | null): string {
  if (!app) return UNKNOWN;
  return SOURCE_SOURCE_MAP[app] ?? UNKNOWN;
}

function sourceDescriptionFromApp(app: string | null): string {
  if (!app) return UNKNOWN;
  return SOURCE_DESC_MAP[app] ?? UNKNOWN;
}

function resellerNameFromChannelSnapshot(
  channelSnapshot: { name?: string; agent?: { name?: string } | null } | null | undefined,
): string | null {
  if (!channelSnapshot) return null;
  let out = channelSnapshot.name ?? "";
  if (channelSnapshot.agent?.name) {
    out += " - " + channelSnapshot.agent.name;
  }
  return out;
}

function ticketsToTicketArray(
  ticketQuantities: BookingNode["ticketQuantities"],
): Ticket[] {
  if (!ticketQuantities || ticketQuantities.length === 0) return [];
  return ticketQuantities.map((ticket) => ({
    name: ticket.resourceOptionSnapshot?.name || "Unknown",
    quantity: ticket.quantity || 0,
    ticketId: ticket.resourceOptionSnapshot?.id || "unknown",
  }));
}

function durationInMin(startsAt: string | null, endsAt: string | null): number {
  if (!startsAt || !endsAt) return 0;
  const duration = new Date(endsAt).getTime() - new Date(startsAt).getTime();
  return Math.floor(duration / 1000 / 60);
}

function ticketQuantity(ticketQuantities: BookingNode["ticketQuantities"]): number {
  if (!ticketQuantities || ticketQuantities.length === 0) return 0;
  return ticketQuantities.reduce((acc, ticket) => acc + (ticket.quantity || 0), 0);
}

function formatTickets(ticketQuantities: BookingNode["ticketQuantities"]): string {
  if (!ticketQuantities || ticketQuantities.length === 0) return "";
  return ticketQuantities
    .map((ticket) => `${ticket.quantity || 0}x ${ticket.resourceOptionSnapshot?.name || "Unknown"}`)
    .join(", ");
}

function mapResourcePoolAssignments(
  poolAssignments: BookingNode["resourcePoolAssignments"],
): ResourcePoolAssignment[] {
  if (!poolAssignments || poolAssignments.length === 0) return [];
  return poolAssignments.flatMap((pool) =>
    (pool.resourceAssignments ?? []).map((assignment) => ({
      id: assignment.resource?.id || "",
      name: assignment.resource?.name || "",
    })),
  );
}

function mapPrice(
  priceData: { amount?: string; formatted?: string } | undefined,
): Price | undefined {
  if (!priceData || (!priceData.amount && !priceData.formatted)) {
    return undefined;
  }
  return {
    amount: priceData.amount || "0",
    display: priceData.formatted || "",
  };
}
