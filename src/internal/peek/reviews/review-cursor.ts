/**
 * Encode/decode for the Peek reviews connection cursor. Internal.
 *
 * A cursor is the base64 of `range:<start>..<end>,<offset>` where `<offset>` is
 * the **absolute index** of the object in the current result set. {@link
 * encodeCursor} mints the `after` cursor used to skip a fixed number of the
 * newest reviews.
 */
const CURSOR_REGEX = /^range:(\d+)\.\.(\d+),(\d+)$/;

/** The parsed parts of a reviews cursor. */
export interface DecodedCursor {
  /** Inclusive start index of the page window the object belonged to. */
  start: number;
  /** Inclusive end index of the page window the object belonged to. */
  end: number;
  /** Absolute index of the object in the result set. */
  offset: number;
}

/** Decodes a base64 reviews cursor into its parts. */
export function decodeCursor(cursor: string): DecodedCursor {
  const text = Buffer.from(cursor, "base64").toString("utf8");
  const match = CURSOR_REGEX.exec(text);
  if (!match) {
    throw new Error(`Unrecognized review cursor: ${cursor}`);
  }
  const [, start, end, offset] = match;
  return { start: Number(start), end: Number(end), offset: Number(offset) };
}

/** Returns just the absolute offset encoded in a cursor. */
export function decodeOffset(cursor: string): number {
  return decodeCursor(cursor).offset;
}

/**
 * Rebuilds a cursor that points at a given absolute `offset`, mimicking the
 * last edge of a `pageSize` page that ends at `offset`. Used to resume (`after`)
 * pagination from a cached, re-anchored offset. The gateway resolves the next
 * window from the trailing offset.
 */
export function encodeCursor(offset: number, pageSize: number): string {
  const start = Math.max(0, offset - pageSize + 1);
  return Buffer.from(`range:${start}..${offset},${offset}`).toString("base64");
}
