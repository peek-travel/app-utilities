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
