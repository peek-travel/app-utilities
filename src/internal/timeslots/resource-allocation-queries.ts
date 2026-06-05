/**
 * Raw Peek GraphQL mutation and shapes for bulk resource-allocation requests
 * (used by guide assignment). Internal.
 */

/** Bulk-(un)assigns resources (e.g. guides) to timeslots. */
export const RESOURCE_ALLOCATION_BULK_REQUEST_MUTATION = `
  mutation ResourceAllocationBulkRequest($input: ResourceAllocationBulkRequestInput!) {
    resourceAllocationBulkRequest(input: $input) {
      __typename
      ... on ResourceAllocationRequest {
        id
      }
      ... on GenericError {
        __typename
        message
      }
    }
  }
`;

/** Allocation status: assigning (`ACTIVE`) or unassigning (`REMOVAL`). */
export type ResourceAllocationStatus = "ACTIVE" | "REMOVAL";

/** `data` payload of {@link RESOURCE_ALLOCATION_BULK_REQUEST_MUTATION}. */
export interface ResourceAllocationBulkRequestResponse {
  resourceAllocationBulkRequest:
    | { __typename: "ResourceAllocationRequest"; id: string }
    | { __typename: "GenericError"; message: string };
}

/** Builds the variables for {@link RESOURCE_ALLOCATION_BULK_REQUEST_MUTATION}. */
export function buildResourceAllocationVariables(
  timeslotIds: string[],
  resourcePoolIds: string[],
  status: ResourceAllocationStatus,
): { input: { timeslotIds: string[]; resourcePoolIds: string[]; status: ResourceAllocationStatus } } {
  return { input: { timeslotIds, resourcePoolIds, status } };
}
