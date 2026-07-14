/**
 * The clean data model for a signed Peek Pro waiver (liability agreement),
 * delivered by the waiver webhook.
 */

/** A signed waiver. */
export interface Waiver {
  /** Id of the agreement template that was signed. */
  templateId: string;
  /** Id of the booking the waiver is attached to. */
  bookingId: string;
  /** URL of the signed waiver document. */
  fileUrl: string;
  /** When the waiver was signed (ISO datetime). */
  signedAt: string;
  /** Whether a guardian signed on the participant's behalf. */
  isSignedByGuardian: boolean;
  /** Participant name captured on the waiver, if any. */
  guestName: string | null;
  /** Whether the participant opted in to marketing. */
  isOptinMarketing: boolean;
  /** Whether the participant opted in to SMS. */
  isOptinSms: boolean;
}
