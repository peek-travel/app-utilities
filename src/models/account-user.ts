/**
 * The clean data model for a Peek Pro account user (staff member / guide).
 */

/**
 * An account user on a Peek Pro account.
 *
 * Only **active** users are returned by the account-user service — inactive
 * users are filtered out — so there is no status field on this model.
 */
export interface AccountUser {
  /** Unique identifier of the account user. */
  id: string;
  /** Full name. */
  name: string;
  /** Email address. */
  email: string;
  /** Phone number. */
  phone: string;
  /** The activities this user is assigned to. */
  assignedActivities: AssignedActivity[];
}

/** An activity an {@link AccountUser} is assigned to. */
export interface AssignedActivity {
  /** Activity (product) id. */
  id: string;
  /** Activity name. */
  name: string;
}
