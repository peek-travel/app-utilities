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
  SEATMAP_DISPLAY_TYPES,
  type Seatmap,
  type SeatmapBlock,
  type SeatmapDisplay,
  type SeatmapDisplayType,
  type SeatmapGroup,
  type SeatmapSection,
  type SeatmapZone,
} from "../../../models/peek/seatmap.js";
import { UnknownSeatmapDisplayTypeError } from "../../../errors.js";
import type {
  RawSeatmapBlock,
  RawSeatmapDisplay,
  RawSeatmapGroup,
  RawSeatmapNode,
  RawSeatmapSection,
  RawSeatmapZone,
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
