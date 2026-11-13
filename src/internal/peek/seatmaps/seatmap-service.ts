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
import { SeatmapDeleteError } from "../../../errors.js";
import type {
  AssignableBooking,
  AssignedSeatmap,
  AssignmentResponse,
  DeletedSeatAssignment,
  Seatmap,
  SeatmapBlockAssignment,
  SeatmapSummary,
} from "../../../models/peek/seatmap.js";
import {
  fromAssignableBookings,
  fromAssignedSeatmapNodes,
  fromDeletedAssignments,
  fromSeatmapNodes,
  fromSeatmapSummaryNodes,
  toAssignmentResponse,
} from "./seatmap-converter.js";
import {
  DELETE_ASSIGNMENTS_MUTATION,
  DELETE_ASSIGNMENTS_SUCCESS_TYPENAME,
  SEATMAP_IDS_QUERY,
  SEATMAPS_QUERY,
  assignBlocksVariables,
  buildAssignBlocksMutation,
  buildAssignableBookingsQuery,
  buildSeatmapAssignmentsQuery,
  type AssignBlocksData,
  type AssignableBookingsResponse,
  type DeleteAssignmentsResponse,
  type SeatmapAssignmentsResponse,
  type SeatmapIdsResponse,
  type SeatmapsResponse,
} from "./seatmap-queries.js";

/** Thrown-error message when a product id is missing or blank. */
const ERROR_PRODUCT_ID_REQUIRED = "A non-empty product id is required.";

/** Required id prefix for a bookable ticket handle (`assignableId`). */
const ASSIGNABLE_ID_PREFIX = "t_";

/** Required id prefix for a seat (block) id. */
const BLOCK_ID_PREFIX = "csb_";

/** Thrown-error message when no assignments are supplied. */
const ERROR_NO_ASSIGNMENTS = "At least one assignment is required.";

/** Thrown-error message when an assignableId has the wrong prefix. */
const ERROR_ASSIGNABLE_ID_PREFIX = `Each assignableId must start with "${ASSIGNABLE_ID_PREFIX}".`;

/** Thrown-error message when a blockId has the wrong prefix. */
const ERROR_BLOCK_ID_PREFIX = `Each blockId must start with "${BLOCK_ID_PREFIX}".`;

/** Required id prefix for a seating-assignment record id. */
const ASSIGNMENT_ID_PREFIX = "asa_";

/** Thrown-error message when no assignment ids are supplied. */
const ERROR_NO_ASSIGNMENT_IDS = "At least one assignment id is required.";

/** Thrown-error message when an assignment id has the wrong prefix. */
const ERROR_ASSIGNMENT_ID_PREFIX = `Each assignment id must start with "${ASSIGNMENT_ID_PREFIX}".`;

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
 * Normalizes both range bounds (see {@link normalizeNaiveDatetime}), enforces
 * that they fall on the same date, and returns the gateway's half-open
 * `[start,end)` range literal. Shared by every range-scoped read so they apply
 * identical parsing and validation.
 */
function buildNaiveRange(rangeStart: string, rangeEnd: string): string {
  const start = normalizeNaiveDatetime(rangeStart, "rangeStart");
  const end = normalizeNaiveDatetime(rangeEnd, "rangeEnd");
  if (start.slice(0, DATE_PREFIX_LENGTH) !== end.slice(0, DATE_PREFIX_LENGTH)) {
    throw new Error(ERROR_RANGE_SAME_DATE);
  }
  return `[${start},${end})`;
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
   * Returns the id and name of every seating map configured on a product — a
   * lightweight alternative to {@link getSeatmapForProduct} for callers that only
   * need to list the maps assigned to a product, not their zone/section/seat
   * layout. The gateway query is trimmed to match (id + name only).
   *
   * Like {@link getSeatmapForProduct}, seating maps are structural layout, not
   * customer data, so the result is unaffected by `fullCustomerAccess`.
   *
   * @param productId The activity's id.
   * @returns The product's seating maps as {@link SeatmapSummary} id/name pairs,
   *   or an empty list when the product has none or is not found.
   * @throws {Error} when `productId` is missing or blank.
   *
   * @example
   * ```ts
   * const maps = await peek.getSeatmapService().getSeatmapIdsForProduct("act-1");
   * // → [{ id: "csm_8j734", name: "Main Floor" }, …]
   * ```
   */
  async getSeatmapIdsForProduct(productId: string): Promise<SeatmapSummary[]> {
    if (!productId?.trim()) {
      throw new Error(ERROR_PRODUCT_ID_REQUIRED);
    }

    const body: GraphQLBody<SeatmapIdsResponse> =
      await this.client.request<SeatmapIdsResponse>(
        SALES_ENDPOINT,
        SEATMAP_IDS_QUERY,
        { id: productId },
      );

    return fromSeatmapSummaryNodes(body.data?.activity?.seatingMaps ?? []);
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
    const range = buildNaiveRange(rangeStart, rangeEnd);

    const body: GraphQLBody<SeatmapAssignmentsResponse> =
      await this.client.request<SeatmapAssignmentsResponse>(
        SALES_ENDPOINT,
        buildSeatmapAssignmentsQuery(this.accessOptions.fullCustomerAccess),
        { id: productId, range },
      );

    return fromAssignedSeatmapNodes(body.data?.activity?.seatingMaps ?? []);
  }

  /**
   * Returns the confirmed bookings on a product that overlap a datetime range,
   * each with the tickets that can be assigned to seats (and the seat a ticket
   * currently holds, when it has one). Use it to drive seat assignment: pick an
   * {@link AssignableBooking}'s ticket by its `assignableId`.
   *
   * `rangeStart`/`rangeEnd` are parsed and validated exactly like
   * {@link getSeatMapAssignments} (seconds optional, timezone and fractional
   * seconds stripped, components range-checked, both bounds on the same date)
   * and sent half-open — inclusive `rangeStart`, exclusive `rangeEnd`.
   *
   * A guest's name is **customer PII**: when this access service was created
   * without `fullCustomerAccess`, `guestName` is always `null` (never
   * requested).
   *
   * @param productId The activity's id.
   * @param rangeStart Inclusive start of the range (naive datetime).
   * @param rangeEnd Exclusive end of the range (naive datetime).
   * @returns The overlapping confirmed bookings, or an empty list when none
   *   match.
   * @throws {Error} when `productId` is blank, a range bound is blank,
   *   unparseable, or out of range, or the two bounds fall on different dates.
   *
   * @example
   * ```ts
   * const bookings = await peek
   *   .getSeatmapService()
   *   .assignableBookings("act-1", "2026-11-06T14:00", "2026-11-06T15:00");
   * ```
   */
  async assignableBookings(
    productId: string,
    rangeStart: string,
    rangeEnd: string,
  ): Promise<AssignableBooking[]> {
    if (!productId?.trim()) {
      throw new Error(ERROR_PRODUCT_ID_REQUIRED);
    }
    const range = buildNaiveRange(rangeStart, rangeEnd);

    const body: GraphQLBody<AssignableBookingsResponse> =
      await this.client.request<AssignableBookingsResponse>(
        SALES_ENDPOINT,
        buildAssignableBookingsQuery(this.accessOptions.fullCustomerAccess),
        { id: productId, range },
      );

    return fromAssignableBookings(body.data?.bookings ?? []);
  }

  /**
   * Assigns bookable tickets to seats in bulk — one `assignBlocks` call per
   * {@link SeatmapBlockAssignment}, batched into a single mutation.
   *
   * The result summarizes per-assignment outcomes: `status` is `"SUCCESS"` when
   * every assignment succeeded, `"FAILED"` when every one failed, and
   * `"PARTIAL"` when some of each, with `successfulAssignments` /
   * `failedAssignments` listing the `assignableId`s. Per-assignment failures
   * (overbooking, invalid type, …) are reported here, **not** thrown; only
   * transport/GraphQL-level errors throw (as `PeekGraphQLError` / `PeekHttpError`
   * / etc.).
   *
   * @param assignments The ticket→seat bindings to request (at least one).
   * @returns The bulk outcome.
   * @throws {Error} when `assignments` is empty, or any `assignableId` does not
   *   start with `"t_"` or any `blockId` does not start with `"csb_"` — all
   *   checked before any network call.
   *
   * @example
   * ```ts
   * const result = await peek.getSeatmapService().assignTicketsToSeats([
   *   { assignableId: "t_A1", blockId: "csb_A1" },
   *   { assignableId: "t_A2", blockId: "csb_A2" },
   * ]);
   * ```
   */
  async assignTicketsToSeats(
    assignments: SeatmapBlockAssignment[],
  ): Promise<AssignmentResponse> {
    if (!assignments?.length) {
      throw new Error(ERROR_NO_ASSIGNMENTS);
    }
    for (const assignment of assignments) {
      if (!assignment.assignableId?.startsWith(ASSIGNABLE_ID_PREFIX)) {
        throw new Error(
          `${ERROR_ASSIGNABLE_ID_PREFIX} Got "${assignment.assignableId}".`,
        );
      }
      if (!assignment.blockId?.startsWith(BLOCK_ID_PREFIX)) {
        throw new Error(`${ERROR_BLOCK_ID_PREFIX} Got "${assignment.blockId}".`);
      }
    }

    const body: GraphQLBody<AssignBlocksData> =
      await this.client.request<AssignBlocksData>(
        SALES_ENDPOINT,
        buildAssignBlocksMutation(assignments.length),
        assignBlocksVariables(assignments),
      );

    return toAssignmentResponse(body.data ?? {}, assignments);
  }

  /**
   * Deletes seat assignments by id, returning the now-deleted assignments so a
   * caller can reload state without a refetch.
   *
   * @param assignmentIds The seating-assignment record ids to delete (each must
   *   start with `"asa_"`); at least one.
   * @returns The deleted assignments (seat id/name and freed ticket handle).
   * @throws {Error} when `assignmentIds` is empty or any id does not start with
   *   `"asa_"` — checked before any network call.
   * @throws {SeatmapDeleteError} when the gateway reports a batch-level failure
   *   (a non-success union member); transport/GraphQL errors throw as usual.
   *
   * @example
   * ```ts
   * const deleted = await peek
   *   .getSeatmapService()
   *   .deleteSeatAssignments(["asa_9kQ2mNv", "asa_7hL4pXw"]);
   * ```
   */
  async deleteSeatAssignments(
    assignmentIds: string[],
  ): Promise<DeletedSeatAssignment[]> {
    if (!assignmentIds?.length) {
      throw new Error(ERROR_NO_ASSIGNMENT_IDS);
    }
    for (const id of assignmentIds) {
      if (!id?.startsWith(ASSIGNMENT_ID_PREFIX)) {
        throw new Error(`${ERROR_ASSIGNMENT_ID_PREFIX} Got "${id}".`);
      }
    }

    const body: GraphQLBody<DeleteAssignmentsResponse> =
      await this.client.request<DeleteAssignmentsResponse>(
        SALES_ENDPOINT,
        DELETE_ASSIGNMENTS_MUTATION,
        { assignmentIds },
      );

    const result = body.data?.deleteAssignments;
    if (result?.__typename !== DELETE_ASSIGNMENTS_SUCCESS_TYPENAME) {
      throw new SeatmapDeleteError(result?.message ?? null);
    }
    return fromDeletedAssignments(result.assignments ?? []);
  }
}
