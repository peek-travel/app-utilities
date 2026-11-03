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
