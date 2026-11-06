/**
 * Pure functions that map raw Peek GraphQL nodes into the clean {@link Seatmap}
 * model. No I/O — straightforward, testable transformations.
 *
 * The one failure mode is an unrecognized section `display.type`: the gateway
 * owns that small set, so a non-null value outside {@link SEATMAP_DISPLAY_TYPES}
 * throws {@link UnknownSeatmapDisplayTypeError} rather than silently widening the
 * clean model's `type`.
 */
import {
  SEATMAP_BLOCK_STATUSES,
  SEATMAP_DISPLAY_TYPES,
  type AssignedSeatmap,
  type AssignedSeatmapBlock,
  type AssignedSeatmapGroup,
  type AssignedSeatmapSection,
  type Seatmap,
  type SeatmapAssignment,
  type SeatmapBlock,
  type SeatmapBlockStatus,
  type SeatmapDisplay,
  type SeatmapDisplayType,
  type SeatmapGroup,
  type SeatmapSection,
  type SeatmapZone,
} from "../../../models/peek/seatmap.js";
import {
  UnknownSeatmapAssignmentParentError,
  UnknownSeatmapBlockStatusError,
  UnknownSeatmapDisplayTypeError,
} from "../../../errors.js";
import {
  SEATMAP_ASSIGNMENT_PARENTS,
  type RawAssignedSeatmapBlock,
  type RawAssignedSeatmapGroup,
  type RawAssignedSeatmapNode,
  type RawAssignedSeatmapSection,
  type RawSeatmapAssignment,
  type RawSeatmapBlock,
  type RawSeatmapDisplay,
  type RawSeatmapGroup,
  type RawSeatmapNode,
  type RawSeatmapSection,
  type RawSeatmapZone,
} from "./seatmap-queries.js";

/**
 * Narrows a raw `display.type` to a known {@link SeatmapDisplayType}. Absent/null
 * (the group and block positions, which never select `type`) maps to `null`; a
 * non-null value outside the known set throws.
 */
function normalizeDisplayType(
  raw: string | null | undefined,
): SeatmapDisplayType | null {
  if (raw == null) return null;
  if ((SEATMAP_DISPLAY_TYPES as readonly string[]).includes(raw)) {
    return raw as SeatmapDisplayType;
  }
  throw new UnknownSeatmapDisplayTypeError(raw, SEATMAP_DISPLAY_TYPES);
}

/**
 * Builds the shared {@link SeatmapDisplay} from whichever subset of fields the
 * gateway populated in this position — every field the position does not carry
 * collapses to `null`.
 */
function toDisplay(raw: RawSeatmapDisplay): SeatmapDisplay {
  return {
    x: raw.x,
    y: raw.y,
    width: raw.width ?? null,
    height: raw.height ?? null,
    tableWidth: raw.tableWidth ?? null,
    tableHeight: raw.tableHeight ?? null,
    table: raw.table ?? null,
    label: raw.label ?? null,
    type: normalizeDisplayType(raw.type),
  };
}

/** Converts a single raw seat (block) node into a {@link SeatmapBlock}. */
function fromBlock(raw: RawSeatmapBlock): SeatmapBlock {
  return {
    id: raw.id,
    name: raw.name,
    fullBlockName: raw.fullBlockName,
    order: raw.order,
    zoneId: raw.zone?.id ?? null,
    display: toDisplay(raw.display),
  };
}

/** Converts a single raw group (table) node into a {@link SeatmapGroup}. */
function fromGroup(raw: RawSeatmapGroup): SeatmapGroup {
  return {
    id: raw.id,
    name: raw.name,
    assignableTo: raw.assignableTo ?? [],
    blocks: (raw.blocks ?? []).map(fromBlock),
    display: toDisplay(raw.display),
  };
}

/** Converts a single raw section node into a {@link SeatmapSection}. */
function fromSection(raw: RawSeatmapSection): SeatmapSection {
  return {
    id: raw.id,
    display: toDisplay(raw.display),
    groups: (raw.groups ?? []).map(fromGroup),
  };
}

/** Converts a single raw zone node into a {@link SeatmapZone}. */
function fromZone(raw: RawSeatmapZone): SeatmapZone {
  return {
    id: raw.id,
    name: raw.name,
    tickets: (raw.resourceOptions ?? []).map((option) => ({
      id: option.id,
      name: option.name,
    })),
  };
}

/** Converts a single raw seating-map node into a {@link Seatmap}. */
function fromSeatmap(raw: RawSeatmapNode): Seatmap {
  return {
    id: raw.id,
    name: raw.name,
    zones: (raw.zones ?? []).map(fromZone),
    sections: (raw.sections ?? []).map(fromSection),
  };
}

/** Converts the seating-map nodes from a response into {@link Seatmap}s. */
export function fromSeatmapNodes(nodes: RawSeatmapNode[]): Seatmap[] {
  return nodes.map(fromSeatmap);
}

/**
 * Narrows a raw `availability.status` to a known {@link SeatmapBlockStatus},
 * throwing on an absent or unrecognized value.
 */
function normalizeStatus(raw: string | null | undefined): SeatmapBlockStatus {
  if (raw != null && (SEATMAP_BLOCK_STATUSES as readonly string[]).includes(raw)) {
    return raw as SeatmapBlockStatus;
  }
  throw new UnknownSeatmapBlockStatusError(String(raw), SEATMAP_BLOCK_STATUSES);
}

/**
 * Strips a fractional-seconds component from a gateway datetime so booking
 * times read as `YYYY-MM-DDTHH:MM:SS` (e.g. `…T19:00:00.000000` → `…T19:00:00`).
 * Any other part (including a timezone, if present) is left untouched.
 */
function stripFractionalSeconds(
  value: string | null | undefined,
): string | null {
  if (value == null) return null;
  return value.replace(/\.\d+/, "");
}

/** Joins a guest's first/last name, dropping blanks; `null` when nothing remains. */
function joinGuestName(
  first: string | null | undefined,
  last: string | null | undefined,
): string | null {
  const parts = [first, last]
    .map((part) => part?.trim())
    .filter((part): part is string => !!part);
  return parts.length > 0 ? parts.join(" ") : null;
}

/** An assignment with no identifying detail (non-GUEST, non-ACCOUNT_USER). */
const EMPTY_ASSIGNMENT_DETAIL = {
  bookingId: null,
  bookingDisplayId: null,
  productId: null,
  productName: null,
  ticketId: null,
  ticketName: null,
  startsAt: null,
  endsAt: null,
} as const;

/**
 * Maps one raw assignment to a {@link SeatmapAssignment}, keyed off the parent's
 * `__typename`. Returns `null` for a `BlockedSeat` parent (a block, not an
 * occupant) and throws on an unknown typename.
 */
function fromAssignment(raw: RawSeatmapAssignment): SeatmapAssignment | null {
  const parent = raw.parent;
  switch (parent?.__typename) {
    case "Ticket": {
      const booking = parent.booking ?? null;
      const snapshot = booking?.activitySnapshot ?? null;
      const option = parent.resourceOptionSnapshot ?? null;
      const guest = booking?.primaryGuest ?? null;
      return {
        occupiedBy: "GUEST",
        bookingId: booking?.id ?? null,
        bookingDisplayId: booking?.displayId ?? null,
        productId: snapshot?.id ?? null,
        productName: snapshot?.name ?? null,
        ticketId: option?.id ?? null,
        ticketName: option?.name ?? null,
        guestName: guest ? joinGuestName(guest.firstName, guest.lastName) : null,
        startsAt: stripFractionalSeconds(booking?.startsAt),
        endsAt: stripFractionalSeconds(booking?.endsAt),
      };
    }
    case "AccountUser":
      return {
        occupiedBy: "ACCOUNT_USER",
        ...EMPTY_ASSIGNMENT_DETAIL,
        guestName: parent.name ?? null,
      };
    case "FieldLocation":
      return {
        occupiedBy: "FIELD_LOCATION",
        ...EMPTY_ASSIGNMENT_DETAIL,
        guestName: null,
      };
    case "BlockedSeat":
      return null;
    default:
      throw new UnknownSeatmapAssignmentParentError(
        String(parent?.__typename),
        SEATMAP_ASSIGNMENT_PARENTS,
      );
  }
}

/** Converts a raw seat node into an {@link AssignedSeatmapBlock}. */
function fromAssignedBlock(raw: RawAssignedSeatmapBlock): AssignedSeatmapBlock {
  const status = normalizeStatus(raw.availability?.status);
  // Assignments are meaningful only for an occupied seat; BlockedSeat parents
  // (and anything under a non-occupied status) drop out.
  const assignedTo =
    status === "OCCUPIED"
      ? (raw.availability?.assignments ?? [])
          .map(fromAssignment)
          .filter((entry): entry is SeatmapAssignment => entry !== null)
      : [];
  return { ...fromBlock(raw), status, assignedTo };
}

/** Converts a raw group node into an {@link AssignedSeatmapGroup}. */
function fromAssignedGroup(raw: RawAssignedSeatmapGroup): AssignedSeatmapGroup {
  return {
    id: raw.id,
    name: raw.name,
    assignableTo: raw.assignableTo ?? [],
    blocks: (raw.blocks ?? []).map(fromAssignedBlock),
    display: toDisplay(raw.display),
  };
}

/** Converts a raw section node into an {@link AssignedSeatmapSection}. */
function fromAssignedSection(
  raw: RawAssignedSeatmapSection,
): AssignedSeatmapSection {
  return {
    id: raw.id,
    display: toDisplay(raw.display),
    groups: (raw.groups ?? []).map(fromAssignedGroup),
  };
}

/** Converts a raw seating-map node into an {@link AssignedSeatmap}. */
export function fromAssignedSeatmap(raw: RawAssignedSeatmapNode): AssignedSeatmap {
  return {
    id: raw.id,
    name: raw.name,
    zones: (raw.zones ?? []).map(fromZone),
    sections: (raw.sections ?? []).map(fromAssignedSection),
  };
}

/** Converts the assignment-enriched seating-map nodes into {@link AssignedSeatmap}s. */
export function fromAssignedSeatmapNodes(
  nodes: RawAssignedSeatmapNode[],
): AssignedSeatmap[] {
  return nodes.map(fromAssignedSeatmap);
}
