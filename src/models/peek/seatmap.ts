/**
 * The clean, transport-agnostic data model for a Peek Pro seating map.
 *
 * This is the shape consumers of the package work with. It is intentionally
 * decoupled from the underlying Peek GraphQL schema — the raw GraphQL types and
 * the conversion logic live inside the package and are never exposed here.
 *
 * A seating map describes the physical layout a product sells seats against: a
 * set of {@link SeatmapZone}s (pricing tiers, each mapping to one or more
 * bookable tickets) and a tree of {@link SeatmapSection}s → {@link SeatmapGroup}s
 * (tables) → {@link SeatmapBlock}s (individual seats). Every rendered element
 * carries a shared {@link SeatmapDisplay} describing where and how to draw it.
 */

/**
 * The kinds of section a {@link SeatmapDisplay.type} can describe. The gateway
 * owns this set; a non-null value outside it makes the converter throw
 * `UnknownSeatmapDisplayTypeError` rather than silently widen the type.
 *
 * - `"SECTION"` — a seatable section containing groups (tables) of blocks.
 * - `"SHAPE"` — a non-seatable decorative shape (e.g. a stage).
 * - `"LABEL"` — a free-text label drawn on the map.
 */
export const SEATMAP_DISPLAY_TYPES = ["SHAPE", "SECTION", "LABEL"] as const;

/** A known {@link SeatmapDisplay.type} value. See {@link SEATMAP_DISPLAY_TYPES}. */
export type SeatmapDisplayType = (typeof SEATMAP_DISPLAY_TYPES)[number];

/**
 * The display geometry shared by sections, groups (tables), and blocks (seats).
 *
 * The same shape is used in all three positions, but the gateway populates
 * different fields in each: only {@link SeatmapDisplay.x}/{@link SeatmapDisplay.y}
 * are always present. Every other field is `null` wherever the map element does
 * not carry it (e.g. `table`/`tableWidth`/`tableHeight` are populated only on a
 * group's display; `label`/`width`/`height`/`type` only on a section's display;
 * a block's display carries only `x`/`y`).
 */
export interface SeatmapDisplay {
  /** X coordinate of the element, in map units. Always present. */
  x: number;
  /** Y coordinate of the element, in map units. Always present. */
  y: number;
  /** Width of the element, or `null` where not applicable (sections only). */
  width: number | null;
  /** Height of the element, or `null` where not applicable (sections only). */
  height: number | null;
  /** Table width, or `null` where not applicable (groups only). */
  tableWidth: number | null;
  /** Table height, or `null` where not applicable (groups only). */
  tableHeight: number | null;
  /**
   * Whether the group is drawn as a table, or `null` where not applicable
   * (groups only).
   */
  table: boolean | null;
  /** Free-text label, or `null` where not applicable (sections only). */
  label: string | null;
  /**
   * The section kind, or `null` where not applicable (sections only). A non-null
   * value is always one of {@link SEATMAP_DISPLAY_TYPES}.
   */
  type: SeatmapDisplayType | null;
}

/**
 * A bookable ticket (resource option) a {@link SeatmapZone} sells seats as — the
 * same id passed as a ticket's `resourceOptionId` when creating a booking.
 */
export interface SeatmapTicket {
  /** Unique identifier of the ticket / resource option. */
  id: string;
  /** Human-readable name of the ticket (e.g. `"Adult - Premium"`). */
  name: string;
}

/**
 * A pricing tier on the map. Every block belongs to a zone (via
 * {@link SeatmapBlock.zoneId}), and each zone maps to the {@link SeatmapTicket}s
 * its seats can be sold as.
 */
export interface SeatmapZone {
  /** Unique identifier of the zone. */
  id: string;
  /** Human-readable name of the zone (e.g. `"Premium"`). */
  name: string;
  /** The tickets (resource options) this zone sells seats as. */
  tickets: SeatmapTicket[];
}

/** A single seat within a {@link SeatmapGroup} (table). */
export interface SeatmapBlock {
  /** Unique identifier of the block (seat). */
  id: string;
  /** Short seat name within its table (e.g. `"1"`, `"O-2"`). */
  name: string;
  /** Fully qualified seat name (e.g. `"Table 12, Seat 1"`). */
  fullBlockName: string;
  /** Position of the seat within its table, zero-based. */
  order: number;
  /**
   * The {@link SeatmapZone} this seat belongs to, or `null` when the gateway
   * reports the seat as unassigned to any zone.
   */
  zoneId: string | null;
  /** Where to draw the seat. Only `x`/`y` are populated on a block. */
  display: SeatmapDisplay;
}

/** A group of {@link SeatmapBlock}s — typically a single table of seats. */
export interface SeatmapGroup {
  /** Unique identifier of the group. */
  id: string;
  /** Human-readable name of the group (e.g. `"Table 12"`). */
  name: string;
  /**
   * The audience(s) this group's seats can be assigned to (e.g. `["GUEST"]`).
   * The gateway owns these values; the model keeps them as raw strings.
   */
  assignableTo: string[];
  /** The seats in this group. */
  blocks: SeatmapBlock[];
  /**
   * Where to draw the group. `x`/`y` plus the `table`/`tableWidth`/`tableHeight`
   * fields are populated on a group.
   */
  display: SeatmapDisplay;
}

/** A top-level region of the map: a seatable section, a shape, or a label. */
export interface SeatmapSection {
  /** Unique identifier of the section. */
  id: string;
  /**
   * Where and how to draw the section. `x`/`y` plus the
   * `label`/`width`/`height`/`type` fields are populated on a section.
   */
  display: SeatmapDisplay;
  /** The groups (tables) in this section; empty for shapes and labels. */
  groups: SeatmapGroup[];
}

/** A complete seating map configured on a product. */
export interface Seatmap {
  /** Unique identifier of the seating map (e.g. `"csm_8j734"`). */
  id: string;
  /** Human-readable name of the seating map. */
  name: string;
  /** The pricing tiers on the map. */
  zones: SeatmapZone[];
  /** The top-level sections, shapes, and labels on the map. */
  sections: SeatmapSection[];
}
