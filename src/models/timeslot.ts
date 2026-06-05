/**
 * The clean data model for Peek Pro timeslots and timeslot operations.
 */

/** A bookable timeslot for an activity. */
export interface Timeslot {
  /** Unique identifier. */
  id: string;
  /** The activity (product) id this timeslot belongs to. */
  productId: string;
  /** Total capacity of the timeslot. */
  totalCapacity: number;
  /** Remaining available capacity. */
  availableCapacity: number;
  /** Maximum party size per booking. */
  maxPartySize: number;
  /** Number of bookings on the timeslot. */
  bookingCount: number;
  /** Number of checked-in guests. */
  checkedInCount: number;
  /** Status reported by Peek (e.g. open/closed). */
  status: string;
  /** Manifest notes, or null. */
  notes: string | null;
  /** Duration in minutes. */
  durationMin: number;
  /** Date (YYYY-MM-DD). */
  date: string;
  /** Start time, or null. */
  startTime: string | null;
  /** Resources (e.g. guides, equipment) allocated to this timeslot. */
  assignedResources: AssignedResource[];
}

/** A resource allocated to a {@link Timeslot}. */
export interface AssignedResource {
  /** Resource pool id. */
  id: string;
  /** Resource pool name. */
  name: string;
  /** Resource pool capacity. */
  capacity: number;
  /** Resource pool category (e.g. `"guide"`). */
  category: string;
  /** Allocated quantity. */
  quantity: number;
  /** Backing account user id, or null. */
  accountUserId: string | null;
}

/** Booking filter for {@link Timeslot} day queries. */
export type TimeslotFilter = "all" | "withBookings" | "withoutBookings";

/** Result of a timeslot update (set availability / notes). */
export interface UpdateTimeslotResult {
  manifestNotes: string | null;
  status: string | null;
}

/** Input describing a guide (un)assignment across timeslots. */
export interface GuideAssignment {
  /** Timeslots to (un)assign. */
  timeslotIds: string[];
  /** Guides to (un)assign — matched by resource-pool id, account-user id, or name. */
  guideIds: string[];
  /** Whether to assign or unassign. */
  action: "assign" | "unassign";
}

/** Result of a guide (un)assignment request. */
export interface AssignGuideResult {
  status: "success" | "error";
  /** The created allocation request id on success, else null. */
  resourceAllocationRequestId: string | null;
  /** Error details on failure, else null. */
  errors: Array<{ message: string }> | null;
}
