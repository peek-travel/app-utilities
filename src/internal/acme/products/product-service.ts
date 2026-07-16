/**
 * Product-related operations against the ACME gateway.
 *
 * Obtain an instance via {@link AcmeAccessService.getProductService} rather than
 * constructing it directly — the access service wires in the authenticated,
 * shared transport. This class is where ACME product-specific business logic
 * lives. Named `AcmeProductService` to disambiguate from the Peek
 * `ProductService` and the CNG `CngProductService` in the same package.
 */
import { TEMPLATES_PATH } from "../endpoints.js";
import type { RestClient } from "../rest-client.js";
import type { AcmeActivity } from "../../../models/acme/product.js";
import { fromTemplateNodes } from "./product-converter.js";
import type { TemplatesResponse } from "./product-queries.js";

export class AcmeProductService {
  constructor(private readonly client: RestClient) {}

  /**
   * Returns every published event template as a single flat list of activities.
   *
   * @example
   * ```ts
   * const activities = await acme.getProductService().getAllActivities();
   * ```
   */
  async getAllActivities(): Promise<AcmeActivity[]> {
    const body = await this.client.get<TemplatesResponse | TemplatesResponse["list"]>(
      TEMPLATES_PATH,
    );
    // Tolerate either a { list: [...] } envelope or a bare array.
    const nodes = Array.isArray(body) ? body : (body?.list ?? []);
    return fromTemplateNodes(nodes ?? []);
  }
}
