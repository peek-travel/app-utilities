/**
 * Pure, I/O-free mapping of raw availability-time nodes → the clean
 * {@link AvailabilityTime} model.
 */
import type { AvailabilityTime } from "../../../models/peek/availability-time.js";
import type { AvailabilityTimeNode } from "./availability-queries.js";

/** Converts a raw availability-time node into the public model. */
export function toAvailabilityTime(node: AvailabilityTimeNode): AvailabilityTime {
  return {
    id: node.id,
    time: node.time,
    from: node.from,
    end: node.end,
    duration: node.duration,
    status: node.status,
    price: node.price ?? null,
    availability: node.availability ?? [],
  };
}
