/**
 * Seating-map operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getSeatmapService} rather than
 * constructing it directly — the access service wires in the authenticated,
 * shared transport and the resolved access options. This class is where
 * seating-map business logic lives.
 */
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type { ResolvedAccessOptions } from "../../../access-options.js";
import type {
  AssignedSeatmap,
  Seatmap,
} from "../../../models/peek/seatmap.js";
import {
  fromAssignedSeatmapNodes,
  fromSeatmapNodes,
} from "./seatmap-converter.js";
import {
  SEATMAPS_QUERY,
  buildSeatmapAssignmentsQuery,
  type SeatmapAssignmentsResponse,
  type SeatmapsResponse,
} from "./seatmap-queries.js";

/** Thrown-error message when a product id is missing or blank. */
const ERROR_PRODUCT_ID_REQUIRED = "A non-empty product id is required.";

/** Thrown-error message when the range bounds fall on different dates. */
const ERROR_RANGE_SAME_DATE =
  "rangeStart and rangeEnd must fall on the same date.";

/** Length of the `YYYY-MM-DD` date prefix of a naive datetime. */
const DATE_PREFIX_LENGTH = 10;

/**
 * Matches a naive datetime, tolerating an optional seconds component, optional
 * fractional seconds, and an optional trailing timezone (`Z` or `±HH[:]MM`) —
 * all of which {@link normalizeNaiveDatetime} strips. Captures date, hour,
 * minute, and (optional) second.
 */
const NAIVE_DATETIME_RE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;

/**
 * Normalizes a caller-supplied datetime to the gateway's naive
 * `YYYY-MM-DDTHH:MM:SS` form: adds `:00` seconds when omitted and strips any
 * fractional seconds and timezone. Throws a plain `Error` when the input is
 * blank, unparseable, or carries an out-of-range component.
 */
function normalizeNaiveDatetime(input: string, label: string): string {
  const trimmed = input?.trim();
  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }
  const match = NAIVE_DATETIME_RE.exec(trimmed);
  if (!match) {
    throw new Error(
      `${label} must be a datetime like "YYYY-MM-DDTHH:MM:SS" (got "${input}").`,
    );
  }
  const [, year, month, day, hour, minute, second] = match;
  const sec = second ?? "00";
  if (
    Number(month) < 1 ||
    Number(month) > 12 ||
    Number(day) < 1 ||
    Number(day) > 31 ||
    Number(hour) > 23 ||
    Number(minute) > 59 ||
    Number(sec) > 59
  ) {
    throw new Error(`${label} has an out-of-range component (got "${input}").`);
  }
  return `${year}-${month}-${day}T${hour}:${minute}:${sec}`;
}

/**
 * Reads the seating maps configured on a product, and seat assignments for a
 * single map over a datetime range.
 *
 * Obtain an instance via {@link PeekAccessService.getSeatmapService}.
 */
export class SeatmapService {
  constructor(
    private readonly client: GraphQLClient,
    private readonly accessOptions: ResolvedAccessOptions,
  ) {}

  /**
   * Returns every {@link Seatmap} configured on a single activity (product), in
   * the order Peek reports them. A product can have zero, one, or many maps.
   *
   * Seating maps are structural layout definitions — zones, sections, tables,
   * and seats — not customer data, so the result is unaffected by
   * `fullCustomerAccess`.
   *
   * @param productId The activity's id.
   * @returns The product's seating maps, or an empty list when the product has
   *   none or is not found.
   * @throws {Error} when `productId` is missing or blank.
   * @throws {UnknownSeatmapDisplayTypeError} when the gateway returns a section
   *   `display.type` the package does not recognize.
   *
   * @example
   * ```ts
   * const maps = await peek.getSeatmapService().getSeatmapForProduct("act-1");
   * ```
   */
  async getSeatmapForProduct(productId: string): Promise<Seatmap[]> {
    if (!productId?.trim()) {
      throw new Error(ERROR_PRODUCT_ID_REQUIRED);
    }

    const body: GraphQLBody<SeatmapsResponse> =
      await this.client.request<SeatmapsResponse>(
        SALES_ENDPOINT,
        SEATMAPS_QUERY,
        { id: productId },
      );

    return fromSeatmapNodes(body.data?.activity?.seatingMaps ?? []);
  }

  /**
   * Returns every seating map configured on a product, each with its seats
   * enriched by occupancy over a datetime range: {@link AssignedSeatmap}s
   * carrying the same structural data as {@link getSeatmapForProduct} plus each
   * seat's `status` and `assignedTo` occupants.
   *
   * `rangeStart`/`rangeEnd` are flexible: they may omit seconds (`...T14:00`)
   * and may carry a timezone or fractional seconds — all normalized to the
   * gateway's naive `YYYY-MM-DDTHH:MM:SS` form (seconds added, timezone and
   * fractional seconds stripped). The range is queried half-open — inclusive
   * `rangeStart`, exclusive `rangeEnd` — and both bounds must fall on the **same
   * date**.
   *
   * A guest's name is **customer PII**: when this access service was created
   * without `fullCustomerAccess`, a GUEST occupant's `guestName` is always
   * `null` (the field is never requested). Staff (ACCOUNT_USER) names are not
   * gated.
   *
   * @param productId The activity's id.
   * @param rangeStart Inclusive start of the range (naive datetime).
   * @param rangeEnd Exclusive end of the range (naive datetime).
   * @returns The product's seating maps with occupancy, or an empty list when
   *   the product has none or is not found.
   * @throws {Error} when `productId` is blank, a range bound is blank,
   *   unparseable, or out of range, or the two bounds fall on different dates.
   * @throws {UnknownSeatmapDisplayTypeError} on an unrecognized section
   *   `display.type`.
   * @throws {UnknownSeatmapBlockStatusError} on an unrecognized seat status.
   * @throws {UnknownSeatmapAssignmentParentError} on an unrecognized assignment
   *   parent `__typename`.
   *
   * @example
   * ```ts
   * const maps = await peek
   *   .getSeatmapService()
   *   .getSeatMapAssignments("act-1", "2026-11-06T14:00", "2026-11-06T16:00");
   * ```
   */
  async getSeatMapAssignments(
    productId: string,
    rangeStart: string,
    rangeEnd: string,
  ): Promise<AssignedSeatmap[]> {
    if (!productId?.trim()) {
      throw new Error(ERROR_PRODUCT_ID_REQUIRED);
    }
    const start = normalizeNaiveDatetime(rangeStart, "rangeStart");
    const end = normalizeNaiveDatetime(rangeEnd, "rangeEnd");
    if (start.slice(0, DATE_PREFIX_LENGTH) !== end.slice(0, DATE_PREFIX_LENGTH)) {
      throw new Error(ERROR_RANGE_SAME_DATE);
    }
    const range = `[${start},${end})`;

    const body: GraphQLBody<SeatmapAssignmentsResponse> =
      await this.client.request<SeatmapAssignmentsResponse>(
        SALES_ENDPOINT,
        buildSeatmapAssignmentsQuery(this.accessOptions.fullCustomerAccess),
        { id: productId, range },
      );

    return fromAssignedSeatmapNodes(body.data?.activity?.seatingMaps ?? []);
  }
}
