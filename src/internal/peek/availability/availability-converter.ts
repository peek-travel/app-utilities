/**
 * Pure, I/O-free mapping of raw availability-time nodes → the clean
 * {@link AvailabilityTime} model.
 */
import type { AvailabilityTime } from "../../../models/peek/availability-time.js";
import type { AvailabilityTimeNode } from "./availability-queries.js";

/** The smallest bookable party size, used when Peek reports no minimum. */
const DEFAULT_MINIMUM_TICKETS = 1;

/**
 * Converts a raw availability-time node into the public model.
 *
 * `minimumTicketsRequired` is normalized: a raw `0` (or missing value) means "no
 * minimum" and is reported as {@link DEFAULT_MINIMUM_TICKETS} so callers can
 * always treat it as the smallest bookable party size.
 */
export function toAvailabilityTime(node: AvailabilityTimeNode): AvailabilityTime {
  const rawMinimum = node.minimumTicketsRequired;
  const minimumTicketsRequired =
    typeof rawMinimum === "number" && rawMinimum > 0
      ? rawMinimum
      : DEFAULT_MINIMUM_TICKETS;

  return {
    id: node.id,
    time: node.time,
    from: node.from,
    end: node.end,
    duration: node.duration,
    status: node.status,
    minimumTicketsRequired,
    price: node.price ?? null,
    availability: node.availability ?? [],
  };
}
