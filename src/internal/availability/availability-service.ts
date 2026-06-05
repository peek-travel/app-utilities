/**
 * Availability-times operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getAvailabilityService}.
 */
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type {
  AvailabilityTime,
  AvailabilityTimesQuery,
} from "../../models/availability-time.js";
import {
  AVAILABILITY_TIMES_QUERY,
  type AvailabilityTimesResponse,
} from "./availability-queries.js";

export class AvailabilityService {
  constructor(private readonly client: GraphQLClient) {}

  /** Returns the availability times for an activity/date and requested quantities. */
  async getAvailabilityTimes(
    query: AvailabilityTimesQuery,
  ): Promise<AvailabilityTime[]> {
    const body: GraphQLBody<AvailabilityTimesResponse> =
      await this.client.request<AvailabilityTimesResponse>(
        SALES_ENDPOINT,
        AVAILABILITY_TIMES_QUERY,
        {
          activityId: query.activityId,
          resourceOptionQuantities: query.resourceOptionQuantities,
          date: query.date,
        },
      );
    return body.data?.availabilityTimes ?? [];
  }
}
