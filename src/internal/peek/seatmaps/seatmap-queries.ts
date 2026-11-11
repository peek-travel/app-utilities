/**
 * Raw Peek GraphQL query and response shapes for seating maps. These are an
 * internal implementation detail of the package and are deliberately not
 * re-exported from the public entry point.
 */

/** Fetches every seating map configured on a single activity (product). */
export const SEATMAPS_QUERY = `
  query Sales($id: ID!) {
    activity(id: $id) {
      seatingMaps {
        name
        id
        zones {
          id
          name
          colorHex
          resourceOptions {
            id
            name
          }
        }
        sections {
          id
          display {
            label
            x
            y
            width
            height
            type
          }
          groups {
            assignableTo
            name
            id
            display {
              x
              y
              tableWidth
              tableHeight
              table
            }
            blocks {
              fullBlockName
              name
              id
              order
              zone {
                id
              }
              display {
                x
                y
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Raw display geometry on the wire. Only `x`/`y` are always selected; which of
 * the remaining fields the gateway returns depends on whether the display hangs
 * off a section, a group, or a block (the query selects a different subset in
 * each position), so every other field is optional here.
 */
export interface RawSeatmapDisplay {
  x: number;
  y: number;
  width?: number | null;
  height?: number | null;
  tableWidth?: number | null;
  tableHeight?: number | null;
  table?: boolean | null;
  label?: string | null;
  type?: string | null;
}

/** A single seat (block) node as returned by {@link SEATMAPS_QUERY}. */
export interface RawSeatmapBlock {
  id: string;
  name: string;
  fullBlockName: string;
  order: number;
  zone?: { id: string } | null;
  display: RawSeatmapDisplay;
}

/** A single group (table) node as returned by {@link SEATMAPS_QUERY}. */
export interface RawSeatmapGroup {
  id: string;
  name: string;
  assignableTo?: string[] | null;
  blocks?: RawSeatmapBlock[] | null;
  display: RawSeatmapDisplay;
}

/** A single section node as returned by {@link SEATMAPS_QUERY}. */
export interface RawSeatmapSection {
  id: string;
  display: RawSeatmapDisplay;
  groups?: RawSeatmapGroup[] | null;
}

/** A single resource option (ticket) on a zone, as returned by {@link SEATMAPS_QUERY}. */
export interface RawSeatmapResourceOption {
  id: string;
  name: string;
}

/** A single zone node as returned by {@link SEATMAPS_QUERY}. */
export interface RawSeatmapZone {
  id: string;
  name: string;
  colorHex?: string | null;
  resourceOptions?: RawSeatmapResourceOption[] | null;
}

/** A single seating-map node as returned by {@link SEATMAPS_QUERY}. */
export interface RawSeatmapNode {
  id: string;
  name: string;
  zones?: RawSeatmapZone[] | null;
  sections?: RawSeatmapSection[] | null;
}

/** The `data` payload of {@link SEATMAPS_QUERY}. */
export interface SeatmapsResponse {
  activity?: {
    seatingMaps?: RawSeatmapNode[] | null;
  } | null;
}

/**
 * Builds the seat-assignments query for a product's seating maps over a datetime
 * range. It reads the same `activity(id).seatingMaps` entry as
 * {@link SEATMAPS_QUERY} and selects the same structural fields (zones, section/
 * group/block geometry) plus each seat's `availability` for the range.
 *
 * The booking's `primaryGuest` is **customer PII**, so it is selected only when
 * `fullCustomerAccess` is on — otherwise the gateway never returns it and a
 * guest occupant's name maps to `null`. Staff (`AccountUser`) names are not PII
 * and are always selected.
 */
export function buildSeatmapAssignmentsQuery(fullCustomerAccess: boolean): string {
  const primaryGuest = fullCustomerAccess
    ? "primaryGuest { firstName lastName }"
    : "";
  return `
  query SeatMapAssignments($id: ID!, $range: NaiveDatetimeRange!) {
    activity(id: $id) {
      seatingMaps {
      id
      name
      zones {
        id
        name
        colorHex
        resourceOptions {
          id
          name
        }
      }
      sections(datetimeRange: $range) {
        id
        display {
          label
          x
          y
          width
          height
          type
        }
        groups {
          assignableTo
          name
          id
          display {
            x
            y
            tableWidth
            tableHeight
            table
          }
          blocks {
            fullBlockName
            name
            id
            order
            zone {
              id
            }
            display {
              x
              y
            }
            availability(datetimeRange: $range) {
              status
              assignments {
                id
                parent {
                  __typename
                  ... on Ticket {
                    id
                    resourceOptionSnapshot {
                      id
                      name
                    }
                    booking {
                      id
                      displayId
                      activityId
                      activitySnapshot {
                        id
                        name
                      }
                      startsAt
                      endsAt
                      ${primaryGuest}
                    }
                  }
                  ... on AccountUser {
                    id
                    name
                  }
                  ... on FieldLocation {
                    id
                  }
                  ... on BlockedSeat {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
    }
  }
`;
}

/** The assignment-parent typenames the converter recognizes. */
export const SEATMAP_ASSIGNMENT_PARENTS = [
  "Ticket",
  "AccountUser",
  "FieldLocation",
  "BlockedSeat",
] as const;

/** A booking's primary guest, as selected under a `Ticket` parent (PII-gated). */
export interface RawSeatmapPrimaryGuest {
  firstName?: string | null;
  lastName?: string | null;
}

/** A booking node, as selected under a `Ticket` parent. */
export interface RawSeatmapBooking {
  id?: string | null;
  displayId?: string | null;
  activityId?: string | null;
  activitySnapshot?: { id: string; name: string } | null;
  startsAt?: string | null;
  endsAt?: string | null;
  primaryGuest?: RawSeatmapPrimaryGuest | null;
}

/** A single assignment's `parent`, a union discriminated by `__typename`. */
export interface RawSeatmapAssignmentParent {
  __typename?: string | null;
  id?: string | null;
  /** `Ticket` only. */
  resourceOptionSnapshot?: { id: string; name: string } | null;
  /** `Ticket` only. */
  booking?: RawSeatmapBooking | null;
  /** `AccountUser` only. */
  name?: string | null;
}

/** A single seat assignment node. */
export interface RawSeatmapAssignment {
  id?: string | null;
  parent?: RawSeatmapAssignmentParent | null;
}

/** A seat's availability for the queried range. */
export interface RawSeatmapAvailability {
  status?: string | null;
  assignments?: RawSeatmapAssignment[] | null;
}

/** A block node under the assignments query — a {@link RawSeatmapBlock} plus availability. */
export interface RawAssignedSeatmapBlock extends RawSeatmapBlock {
  availability?: RawSeatmapAvailability | null;
}

/** A group node under the assignments query. */
export interface RawAssignedSeatmapGroup
  extends Omit<RawSeatmapGroup, "blocks"> {
  blocks?: RawAssignedSeatmapBlock[] | null;
}

/** A section node under the assignments query. */
export interface RawAssignedSeatmapSection
  extends Omit<RawSeatmapSection, "groups"> {
  groups?: RawAssignedSeatmapGroup[] | null;
}

/** A seating-map node under the assignments query. */
export interface RawAssignedSeatmapNode
  extends Omit<RawSeatmapNode, "sections"> {
  sections?: RawAssignedSeatmapSection[] | null;
}

/** The `data` payload of the seat-assignments query. */
export interface SeatmapAssignmentsResponse {
  activity?: {
    seatingMaps?: RawAssignedSeatmapNode[] | null;
  } | null;
}

/**
 * Builds the assignable-bookings query: confirmed bookings on a product that
 * overlap a datetime range, with the tickets that can be assigned to seats.
 *
 * The booking's `primaryGuest` is **customer PII**, selected only when
 * `fullCustomerAccess` is on; otherwise the gateway never returns it and the
 * guest name maps to `null`.
 */
export function buildAssignableBookingsQuery(fullCustomerAccess: boolean): string {
  const primaryGuest = fullCustomerAccess
    ? "primaryGuest { firstName lastName }"
    : "";
  return `
  query AssignableBookings($id: ID!, $range: NaiveDatetimeRange!) {
    bookings(filter: {
      activityIds: [$id]
      overlapsRange: $range
      reservationStatuses: [CONFIRMED]
    }) {
      id
      displayId
      startsAt
      endsAt
      operatorNotes
      ${primaryGuest}
      tickets {
        hashid
        resourceOptionSnapshot {
          id
          name
        }
        seatingAssignment {
          id
          block {
            id
            fullBlockName
          }
        }
      }
    }
  }
`;
}

/** A ticket's current seat assignment, as selected by the assignable-bookings query. */
export interface RawAssignableSeatingAssignment {
  id: string;
  block?: { id: string; fullBlockName: string } | null;
}

/** A bookable ticket node under the assignable-bookings query. */
export interface RawAssignableTicket {
  hashid: string;
  resourceOptionSnapshot?: { id: string; name: string } | null;
  seatingAssignment?: RawAssignableSeatingAssignment | null;
}

/** A booking node under the assignable-bookings query. */
export interface RawAssignableBooking {
  id: string;
  displayId: string;
  startsAt?: string | null;
  endsAt?: string | null;
  operatorNotes?: string | null;
  primaryGuest?: RawSeatmapPrimaryGuest | null;
  tickets?: RawAssignableTicket[] | null;
}

/** The `data` payload of the assignable-bookings query. */
export interface AssignableBookingsResponse {
  bookings?: RawAssignableBooking[] | null;
}

/** The union member `__typename` the gateway returns for a successful assignment. */
export const ASSIGNMENT_SUCCESS_TYPENAME = "AssignmentResponse";

/** The per-alias GraphQL names used for the i-th `assignBlocks` call. */
function assignBlocksNames(index: number): {
  alias: string;
  assignableVar: string;
  blocksVar: string;
} {
  return {
    alias: `a${index}`,
    assignableVar: `assignable${index}`,
    blocksVar: `blocks${index}`,
  };
}

/** The response alias for the i-th assignment (keeps the service and converter in sync). */
export function assignBlocksAlias(index: number): string {
  return assignBlocksNames(index).alias;
}

/**
 * Builds the bulk `assignBlocks` mutation: one aliased call per assignment, each
 * selecting `__typename` plus the shared `R` fragment so a per-assignment error
 * union member comes back inline (rather than as a top-level GraphQL error).
 */
export function buildAssignBlocksMutation(count: number): string {
  const decls: string[] = [];
  const fields: string[] = [];
  for (let i = 0; i < count; i++) {
    const { alias, assignableVar, blocksVar } = assignBlocksNames(i);
    decls.push(`$${assignableVar}: ID!, $${blocksVar}: [ID!]!`);
    fields.push(
      `${alias}: assignBlocks(assignableId: $${assignableVar}, blockIds: $${blocksVar}, fieldResponses: []) { __typename ...R }`,
    );
  }
  return `
  mutation AssignBlocks(${decls.join(", ")}) {
    ${fields.join("\n    ")}
  }

  fragment R on AssignBlocksResponse {
    ... on AssignmentResponse {
      assignments {
        id
        block {
          id
          fullBlockName
        }
        parent {
          ... on Ticket {
            hashid
          }
        }
      }
    }
    ... on AssignBlocksErrorInvalidBlockCount {
      message
      numNeeded
      numProvided
    }
    ... on AssignBlocksErrorInvalidType {
      message
    }
    ... on AssignBlocksErrorOverbooking {
      message
    }
  }
`;
}

/** Builds the GraphQL variables for {@link buildAssignBlocksMutation}. */
export function assignBlocksVariables(
  assignments: { assignableId: string; blockId: string }[],
): Record<string, unknown> {
  const variables: Record<string, unknown> = {};
  assignments.forEach((assignment, i) => {
    const { assignableVar, blocksVar } = assignBlocksNames(i);
    variables[assignableVar] = assignment.assignableId;
    variables[blocksVar] = [assignment.blockId];
  });
  return variables;
}

/** A created seating assignment within a successful `assignBlocks` result. */
export interface RawAssignBlocksAssignment {
  id: string;
  parent?: { __typename?: string | null; hashid?: string | null } | null;
}

/**
 * A single aliased `assignBlocks` result: `__typename` classifies it, and on
 * success `assignments` carries the created records (id + the ticket `hashid`).
 */
export interface RawAssignBlocksResult {
  __typename?: string | null;
  assignments?: RawAssignBlocksAssignment[] | null;
}

/** The `data` payload of the bulk assign mutation — keyed by per-assignment alias. */
export type AssignBlocksData = Record<string, RawAssignBlocksResult | null>;

/** The union member `__typename` the gateway returns for a successful delete. */
export const DELETE_ASSIGNMENTS_SUCCESS_TYPENAME = "DeleteAssignmentsSuccess";

/** Deletes seat assignments by id, returning the now-deleted assignments on success. */
export const DELETE_ASSIGNMENTS_MUTATION = `
  mutation ClearSeats($assignmentIds: [ID!]!) {
    deleteAssignments(assignmentIds: $assignmentIds) {
      __typename
      ... on DeleteAssignmentsSuccess {
        assignments {
          id
          block {
            id
            fullBlockName
          }
          parent {
            __typename
            ... on Ticket {
              hashid
            }
          }
        }
      }
      ... on AssignBlocksErrorInvalidBlockCount {
        message
        numNeeded
        numProvided
      }
    }
  }
`;

/** A single now-deleted assignment node, as selected by the delete mutation. */
export interface RawDeletedAssignment {
  id: string;
  block?: { id: string; fullBlockName: string } | null;
  parent?: { __typename?: string | null; hashid?: string | null } | null;
}

/** The `deleteAssignments` union result; carries `assignments` on success, `message` on error. */
export interface RawDeleteAssignmentsResult {
  __typename?: string | null;
  assignments?: RawDeletedAssignment[] | null;
  message?: string | null;
}

/** The `data` payload of the delete-assignments mutation. */
export interface DeleteAssignmentsResponse {
  deleteAssignments?: RawDeleteAssignmentsResult | null;
}
