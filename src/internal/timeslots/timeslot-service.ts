/**
 * Timeslot operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getTimeslotService}. The
 * `assignGuide` operation composes the resource-pool and account-user services
 * to resolve guides before issuing the allocation request.
 */
import type { AccountUserService } from "../account-users/account-user-service.js";
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type { ResourcePoolService } from "../resource-pools/resource-pool-service.js";
import type {
  AssignGuideResult,
  GuideAssignment,
  Timeslot,
  TimeslotFilter,
  UpdateTimeslotResult,
} from "../../models/timeslot.js";
import { fromTimeslotNode, fromTimeslotNodes } from "./timeslot-converter.js";
import { matchGuideToResourcePool } from "./guide-matcher.js";
import {
  RESOURCE_ALLOCATION_BULK_REQUEST_MUTATION,
  buildResourceAllocationVariables,
  type ResourceAllocationBulkRequestResponse,
  type ResourceAllocationStatus,
} from "./resource-allocation-queries.js";
import {
  TIMESLOTS_QUERY,
  TIMESLOT_BY_ID_QUERY,
  UPDATE_TIMESLOT_MUTATION,
  buildTimeslotVariables,
  type SingleTimeslotResponse,
  type TimeslotsResponse,
  type UpdateTimeslotInput,
  type UpdateTimeslotResponse,
} from "./timeslot-queries.js";

const GUIDE_CATEGORY = "guide";
const ERROR_MISSING_TIMESLOTS_OR_GUIDES =
  "At least one timeslot and one guide are required";
const ERROR_INVALID_ACTION = "Invalid action. Must be either assign or unassign";
const ERROR_GUIDE_NOT_FOUND = "Guide not found";

/** Dependencies the {@link TimeslotService} composes for guide assignment. */
export interface TimeslotServiceDeps {
  resourcePoolService: ResourcePoolService;
  accountUserService: AccountUserService;
}

export class TimeslotService {
  constructor(
    private readonly client: GraphQLClient,
    private readonly deps: TimeslotServiceDeps,
  ) {}

  /** Returns the timeslots for an activity on a given date. */
  async getForDay(
    productId: string,
    date: string,
    filter: TimeslotFilter = "all",
  ): Promise<Timeslot[]> {
    const normalizedDate = normalizeDate(date);
    const body: GraphQLBody<TimeslotsResponse> =
      await this.client.request<TimeslotsResponse>(
        SALES_ENDPOINT,
        TIMESLOTS_QUERY,
        buildTimeslotVariables(productId, normalizedDate, filter),
      );

    return fromTimeslotNodes(body.data?.timeslots?.timeslots ?? [], productId);
  }

  /** Returns a single timeslot by id, or null when not found. */
  async getById(timeslotId: string): Promise<Timeslot | null> {
    const body: GraphQLBody<SingleTimeslotResponse> =
      await this.client.request<SingleTimeslotResponse>(
        SALES_ENDPOINT,
        TIMESLOT_BY_ID_QUERY,
        { id: timeslotId },
      );

    const node = body.data?.timeslot?.timeslot;
    if (!node) {
      return null;
    }
    return fromTimeslotNode(node, extractProductId(timeslotId));
  }

  /** Sets the timeslot's status (e.g. open/closed). */
  async setAvailability(
    timeslotId: string,
    status: string,
  ): Promise<UpdateTimeslotResult> {
    return this.updateTimeslot({ id: timeslotId, status });
  }

  /** Sets the timeslot's manifest notes. */
  async setNotes(
    timeslotId: string,
    manifestNotes: string,
  ): Promise<UpdateTimeslotResult> {
    return this.updateTimeslot({ id: timeslotId, manifestNotes });
  }

  /**
   * Assigns or unassigns guides across timeslots. Guides are resolved to
   * resource pools (by pool id, account-user id, or name) before the bulk
   * allocation request is issued.
   *
   * @example
   * ```ts
   * await peek.getTimeslotService().assignGuide({
   *   timeslotIds: ["ts_2026_06_20_0900"],
   *   guideIds: ["Alex Guide"], // pool id, account-user id, or name
   *   action: "assign",
   * });
   * ```
   */
  async assignGuide(assignment: GuideAssignment): Promise<AssignGuideResult> {
    const { timeslotIds, guideIds, action } = assignment;

    if (!timeslotIds?.length || !guideIds?.length) {
      throw new Error(ERROR_MISSING_TIMESLOTS_OR_GUIDES);
    }
    if (action !== "assign" && action !== "unassign") {
      throw new Error(ERROR_INVALID_ACTION);
    }

    const [allPools, accountUsers] = await Promise.all([
      this.deps.resourcePoolService.getAll(),
      this.deps.accountUserService.getAll(),
    ]);
    const guidePools = allPools.filter((pool) => pool.category === GUIDE_CATEGORY);

    const resourcePoolIds = guideIds.map((guideId) => {
      const matched = matchGuideToResourcePool(guideId, guidePools, accountUsers);
      if (!matched) {
        throw new Error(`${ERROR_GUIDE_NOT_FOUND}: ${guideId}`);
      }
      return matched;
    });

    const status: ResourceAllocationStatus =
      action === "assign" ? "ACTIVE" : "REMOVAL";

    const body: GraphQLBody<ResourceAllocationBulkRequestResponse> =
      await this.client.request<ResourceAllocationBulkRequestResponse>(
        SALES_ENDPOINT,
        RESOURCE_ALLOCATION_BULK_REQUEST_MUTATION,
        buildResourceAllocationVariables(timeslotIds, resourcePoolIds, status),
      );

    const result = body.data?.resourceAllocationBulkRequest;
    if (result?.__typename === "ResourceAllocationRequest") {
      return {
        status: "success",
        resourceAllocationRequestId: result.id,
        errors: null,
      };
    }

    return {
      status: "error",
      resourceAllocationRequestId: null,
      errors: [{ message: result?.message ?? "Unknown error" }],
    };
  }

  private async updateTimeslot(
    input: UpdateTimeslotInput,
  ): Promise<UpdateTimeslotResult> {
    const body: GraphQLBody<UpdateTimeslotResponse> =
      await this.client.request<UpdateTimeslotResponse>(
        SALES_ENDPOINT,
        UPDATE_TIMESLOT_MUTATION,
        { input },
      );

    const timeslot = body.data?.updateTimeslot?.timeslot;
    return {
      manifestNotes: timeslot?.manifestNotes ?? null,
      status: timeslot?.status ?? null,
    };
  }
}

/** Activity timeslot ids are `"<activityId>|..."`; the activity id is the product id. */
function extractProductId(timeslotId: string): string {
  /* v8 ignore next -- split always yields at least one element */
  return timeslotId.split("|")[0] ?? "";
}

/** Timeslot day queries expect a `YYYY-MM-DD` date; drop any time component. */
function normalizeDate(date: string): string {
  /* v8 ignore next -- split always yields at least one element */
  return date.split("T")[0] ?? date;
}
