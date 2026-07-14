/**
 * Raw CNG REST response shapes for products. Internal implementation detail of
 * the package — deliberately not re-exported from the public entry point.
 *
 * ⚠️ GUESSED SHAPE — the real `api/v2/commerce-config/products` payload has not
 * been confirmed yet. These interfaces (and the converter that reads them) are
 * a best-effort placeholder; adjust once a sample response is available. The
 * converter is written defensively so unexpected/missing fields degrade rather
 * than throw.
 */

/** A single product node as returned by the commerce-config products endpoint. */
export interface ProductNode {
  /** Stable product id. */
  id: string;
  /** Display name. */
  name: string;
  /** Product type (e.g. `"ACTIVITY"`). */
  product_type?: string;
  /** Display color hex, if set. */
  color_hex?: string | null;
  /** Bookable sub-options. */
  tickets?: Array<{ id: string; name: string }>;
}

/**
 * The products list payload. Tolerates either a top-level `products` array or a
 * bare array response (the exact envelope is unconfirmed).
 */
export interface ProductsResponse {
  products?: ProductNode[];
}
