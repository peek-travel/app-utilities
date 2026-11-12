/**
 * Raw Peek GraphQL query and response shape for availability times. Internal.
 * The raw node is mapped to the public {@link AvailabilityTime} model by the
 * availability converter.
 */
import type { Availability, Duration } from "../../../models/peek/availability-time.js";
import type { Money } from "../../../models/peek/money.js";

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
      price {
        amount
        currency
        formatted
      }
      availability {
        qty
        taken
        resourceOptionId
      }
    }
  }
`;

/** A single raw availability-time node as returned by {@link AVAILABILITY_TIMES_QUERY}. */
export interface AvailabilityTimeNode {
  id: string;
  time: string;
  from: string;
  end: string;
  duration: Duration;
  status: string;
  price: Money | null;
  availability: Availability[];
}

/** The `data` payload of {@link AVAILABILITY_TIMES_QUERY}. */
export interface AvailabilityTimesResponse {
  availabilityTimes: AvailabilityTimeNode[];
}
