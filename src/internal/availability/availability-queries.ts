/**
 * Raw Peek GraphQL query and response shape for availability times. Internal.
 * The node matches the public {@link AvailabilityTime} model one-to-one.
 */
import type { AvailabilityTime } from "../../models/availability-time.js";

/** Fetches availability times for an activity/date and resource-option quantities. */
export const AVAILABILITY_TIMES_QUERY = `
  query Sales($activityId: ID!, $resourceOptionQuantities: [ResourceOptionQuantityData!]!, $date: Date!) {
    availabilityTimes(activityId: $activityId, resourceOptionQuantities: $resourceOptionQuantities, date: $date) {
      id
      time
      from
      end
      duration {
        name
        length {
          amount
          unit
        }
      }
      status
      availability {
        qty
        taken
        resourceOptionId
      }
    }
  }
`;

/** The `data` payload of {@link AVAILABILITY_TIMES_QUERY}. */
export interface AvailabilityTimesResponse {
  availabilityTimes: AvailabilityTime[];
}
