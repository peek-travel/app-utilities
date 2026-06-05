/**
 * Pure functions mapping raw timeslot nodes into the clean {@link Timeslot}
 * model.
 */
import type { AssignedResource, Timeslot } from "../../models/timeslot.js";
import type {
  TimeslotNode,
  TimeslotResourceAllocationNode,
} from "./timeslot-queries.js";

/** Converts a list of timeslot nodes for the given activity into {@link Timeslot}s. */
export function fromTimeslotNodes(
  nodes: Array<TimeslotNode | null>,
  productId: string,
): Timeslot[] {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return [];
  }
  return nodes.map((node) => fromTimeslotNode(node, productId));
}

/** Converts a single timeslot node into a {@link Timeslot}. A missing node yields a zeroed timeslot. */
export function fromTimeslotNode(
  node: TimeslotNode | null | undefined,
  productId: string,
): Timeslot {
  if (!node) {
    return {
      id: "",
      productId,
      totalCapacity: 0,
      availableCapacity: 0,
      maxPartySize: 0,
      bookingCount: 0,
      checkedInCount: 0,
      status: "",
      notes: null,
      durationMin: 0,
      date: "",
      startTime: null,
      assignedResources: [],
    };
  }

  return {
    id: node.id || "",
    productId,
    totalCapacity: node.totalCapacity ?? 0,
    availableCapacity: node.availableSpots ?? 0,
    maxPartySize: node.maxPartySize ?? 0,
    bookingCount: node.bookingCount ?? 0,
    checkedInCount: node.checkedInCount ?? 0,
    status: node.status || "",
    notes: node.manifestNotes ?? null,
    durationMin: node.minuteLength ?? 0,
    date: node.date || "",
    startTime: node.start ?? null,
    assignedResources: mapAssignedResources(node.resourceAllocations),
  };
}

function mapAssignedResources(
  allocations: TimeslotResourceAllocationNode[] | null | undefined,
): AssignedResource[] {
  if (!Array.isArray(allocations) || allocations.length === 0) {
    return [];
  }

  return allocations.map((allocation) => {
    const pool = allocation.resourcePool;
    return {
      id: pool?.id || "",
      name: pool?.name || "",
      capacity: pool?.capacity ?? 0,
      category: pool?.category || "",
      quantity: allocation.quantity ?? 0,
      accountUserId: pool?.accountUser?.id ?? null,
    };
  });
}
