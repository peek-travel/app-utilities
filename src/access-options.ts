/**
 * Cross-cutting options that govern what data an access service will read and
 * expose. Passed once when constructing an access service and threaded down to
 * the resource services (and the webhook parsers) so a single object controls
 * behaviour everywhere, rather than a boolean being passed hand-to-hand.
 *
 * Kept deliberately small — today it carries a single PII toggle, but new
 * cross-cutting flags slot in here without changing any downstream signatures.
 */

/** Options controlling PII exposure across an access service's reads. */
export interface AccessOptions {
  /**
   * When `true`, customer PII (guest names/emails/phones, custom question
   * answers, the customer booking-portal URL, waiver participant details, …) is
   * requested and returned, and payment/booking-modification operations are
   * available.
   *
   * When `false` (the default), those PII fields are never requested from the
   * gateway and come back `null`/empty, and the payment/booking-modification
   * operations that touch customer financial data are disabled (they throw a
   * {@link PiiAccessDisabledError}).
   */
  fullCustomerAccess?: boolean;
}

/** A fully-resolved {@link AccessOptions} with every flag defaulted. */
export type ResolvedAccessOptions = Required<AccessOptions>;

/**
 * Resolves a possibly-absent {@link AccessOptions} into a concrete object with
 * every flag defaulted. `fullCustomerAccess` defaults to `false` (PII off).
 */
export function resolveAccessOptions(options?: AccessOptions): ResolvedAccessOptions {
  return { fullCustomerAccess: options?.fullCustomerAccess ?? false };
}
