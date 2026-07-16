/**
 * Raw ACME REST response shapes for event templates. Internal implementation
 * detail of the package — deliberately not re-exported from the public entry
 * point.
 *
 * The `v2/b2b/event/templates/names` endpoint returns a `{ list: [...] }`
 * envelope. Each node carries a `reviewState`; only `"published"` templates are
 * surfaced as activities (see the converter).
 */

/** The published review state — the only templates surfaced as activities. */
export const PUBLISHED_REVIEW_STATE = "published";

/** A single template node as returned by the templates/names endpoint. */
export interface TemplateNode {
  /** Stable template id. */
  id: string;
  /** Display name. */
  name: string;
  /** Template type (e.g. `"standard"`). */
  type?: string;
  /** Admission type (e.g. `"standard"`). */
  admissionType?: string;
  /** Publication state; only `"published"` templates are surfaced. */
  reviewState?: string;
  /** Display color pair, if set. */
  colorCategory?: {
    backgroundColor?: string | null;
    textColor?: string | null;
  } | null;
}

/**
 * The templates list payload. Tolerates either a top-level `list` array or a
 * bare array response.
 */
export interface TemplatesResponse {
  list?: TemplateNode[];
}
