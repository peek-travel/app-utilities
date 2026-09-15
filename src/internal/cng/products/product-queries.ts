/**
 * Raw CNG REST response shapes for products. Internal implementation detail of
 * the package — deliberately not re-exported from the public entry point.
 *
 * Confirmed against a live `api/v2/app-registry/products` sample. The payload is
 * a Laravel-style resource collection (`{ data: [...] }`) of snake_case product
 * rows. Only the fields the converter reads are typed here; the endpoint returns
 * many more (i18n blobs, PDF canvas, audit columns, voucher/commission flags),
 * all deliberately ignored. The converter is written defensively so
 * missing/null fields degrade rather than throw.
 */

/** A single product row as returned by the app-registry products endpoint. */
export interface ProductNode {
  /** Stable product id. Numeric in the REST payload; stringified by the converter. */
  id: number | string;
  /** Display name (the non-i18n, default-locale name). */
  name?: string | null;
  /** URL slug, e.g. `"10-students-complimentary-chaperone"`. */
  slug?: string | null;
  /** Lifecycle status, e.g. `"ACTIVE"`. */
  status?: string | null;
  /** Display color hex, if the product overrides the default. */
  access_control_color_hex?: string | null;
  /** Whether {@link ProductNode.access_control_color_hex} is a real override. */
  custom_access_control_color?: boolean | null;
}

/** The products list payload — a `{ data: [...] }` resource collection. */
export interface ProductsResponse {
  data?: ProductNode[];
}
