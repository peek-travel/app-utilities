/**
 * Product-related operations against the CNG gateway.
 *
 * Obtain an instance via {@link CngAccessService.getProductService} rather than
 * constructing it directly — the access service wires in the authenticated,
 * shared transport. This class is where CNG product-specific business logic
 * lives. Named `CngProductService` to disambiguate from the Peek
 * `ProductService` in the same package.
 */
import { PRODUCTS_PATH } from "../endpoints.js";
import type { RestClient } from "../rest-client.js";
import type { Activity } from "../../../models/cng/product.js";
import { fromProductNodes } from "./product-converter.js";
import type { ProductsResponse } from "./product-queries.js";

export class CngProductService {
  constructor(private readonly client: RestClient) {}

  /**
   * Returns every activity as a single flat list.
   *
   * @example
   * ```ts
   * const activities = await cng.getProductService().getAllActivities();
   * ```
   */
  async getAllActivities(): Promise<Activity[]> {
    const body = await this.client.get<ProductsResponse>(PRODUCTS_PATH);
    return fromProductNodes(body?.data ?? []);
  }
}
