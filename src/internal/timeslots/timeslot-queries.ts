/**
 * Raw Peek GraphQL queries/mutations and response shapes for timeslots.
 * Internal.
 */
import type { TimeslotFilter } from "../../models/timeslot.js";

/** Fetches timeslots for an activity/date via a filter. */
export const TIMESLOTS_QUERY = `
  query Sales($params: TimeslotsFilter!) {
    timeslots(filter: $params) {
      ... on TimeslotsSuccess {
        timeslots {
          id
          bookingCount
          availableSpots
          maxPartySize
          totalCapacity
          checkedInCount
          manifestNotes
          minuteLength
          status
          date
          resourceAllocations {
            quantity
            resourcePool {
              id
              name
              category
              capacity
              accountUser {
                id
              }
            }
          }
          ... on VariableTimeslot {
            start
          }
          ... on FixedTimeslot {
            start
          }
        }
      }
    }
  }
`;

/** Fetches a single timeslot by id. */
export const TIMESLOT_BY_ID_QUERY = `
  query Sales($id: ID!) {
    timeslot(id: $id) {
      ... on ActivityTimeslotSuccess {
        timeslot {
          id
          bookingCount
          availableSpots
          maxPartySize
          totalCapacity
          checkedInCount
          manifestNotes
          minuteLength
          status
          date
          resourceAllocations {
            quantity
            resourcePool {
              id
              name
              category
              capacity
              accountUser {
                id
              }
            }
          }
          ... on VariableTimeslot {
            start
          }
          ... on FixedTimeslot {
            start
          }
        }
      }
    }
  }
`;

/** Updates a timeslot's manifest notes and/or status. */
export const UPDATE_TIMESLOT_MUTATION = `
  mutation Account($input: UpdateTimeslotInput!) {
    updateTimeslot(input: $input) {
      ... on UpdateTimeslotSuccess {
        timeslot {
          id
          manifestNotes
          status
        }
      }
    }
  }
`;

/** A single resource allocation on a timeslot node. */
export interface TimeslotResourceAllocationNode {
  quantity: number | null;
  resourcePool: {
    id: string;
    name: string;
    category: string;
    capacity: number | null;
    accountUser: { id: string } | null;
  } | null;
}

/** A single timeslot node as returned by the timeslot queries. */
export interface TimeslotNode {
  id: string;
  bookingCount: number | null;
  availableSpots: number | null;
  maxPartySize: number | null;
  totalCapacity: number | null;
  checkedInCount: number | null;
  manifestNotes: string | null;
  minuteLength: number | null;
  status: string | null;
  date: string | null;
  start?: string | null;
  resourceAllocations: TimeslotResourceAllocationNode[] | null;
}

/** `data` payload of {@link TIMESLOTS_QUERY}. */
export interface TimeslotsResponse {
  timeslots: { timeslots: TimeslotNode[] };
}

/** `data` payload of {@link TIMESLOT_BY_ID_QUERY}. */
export interface SingleTimeslotResponse {
  timeslot: { timeslot: TimeslotNode | null } | null;
}

/** `data` payload of {@link UPDATE_TIMESLOT_MUTATION}. */
export interface UpdateTimeslotResponse {
  updateTimeslot: {
    timeslot: { id: string; manifestNotes: string | null; status: string | null };
  };
}

/** Input for {@link UPDATE_TIMESLOT_MUTATION}. */
export interface UpdateTimeslotInput {
  id: string;
  manifestNotes?: string;
  status?: string;
}

/** Builds the variables for {@link TIMESLOTS_QUERY}. */
export function buildTimeslotVariables(
  productId: string,
  date: string,
  filter: TimeslotFilter,
): { params: { activityIds: string[]; dateRange: string; hasBookings?: boolean } } {
  const params: {
    activityIds: string[];
    dateRange: string;
    hasBookings?: boolean;
  } = {
    activityIds: [productId],
    dateRange: `[${date},${date}]`,
  };

  if (filter === "withBookings") {
    params.hasBookings = true;
  } else if (filter === "withoutBookings") {
    params.hasBookings = false;
  }

  return { params };
}
