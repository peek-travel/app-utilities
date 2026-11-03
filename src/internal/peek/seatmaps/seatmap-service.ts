/**
 * Seating-map operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getSeatmapService} rather than
 * constructing it directly — the access service wires in the authenticated,
 * shared transport. This class is where seating-map business logic lives.
 */
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type { Seatmap } from "../../../models/peek/seatmap.js";
import { fromSeatmapNodes } from "./seatmap-converter.js";
import { SEATMAPS_QUERY, type SeatmapsResponse } from "./seatmap-queries.js";

/** Thrown-error message when a product id is missing or blank. */
const ERROR_PRODUCT_ID_REQUIRED = "A non-empty product id is required.";

/**
 * Reads the seating maps configured on a product.
 *
 * Obtain an instance via {@link PeekAccessService.getSeatmapService}.
 */
export class SeatmapService {
  constructor(private readonly client: GraphQLClient) {}

  /**
   * Returns every {@link Seatmap} configured on a single activity (product), in
   * the order Peek reports them. A product can have zero, one, or many maps.
   *
   * Seating maps are structural layout definitions — zones, sections, tables,
   * and seats — not customer data, so the result is unaffected by
   * `fullCustomerAccess`.
   *
   * @param productId The activity's id.
   * @returns The product's seating maps, or an empty list when the product has
   *   none or is not found.
   * @throws {Error} when `productId` is missing or blank.
   * @throws {UnknownSeatmapDisplayTypeError} when the gateway returns a section
   *   `display.type` the package does not recognize.
   *
   * @example
   * ```ts
   * const maps = await peek.getSeatmapService().getSeatmapForProduct("act-1");
   * ```
   */
  async getSeatmapForProduct(productId: string): Promise<Seatmap[]> {
    if (!productId?.trim()) {
      throw new Error(ERROR_PRODUCT_ID_REQUIRED);
    }

    const body: GraphQLBody<SeatmapsResponse> =
      await this.client.request<SeatmapsResponse>(
        SALES_ENDPOINT,
        SEATMAPS_QUERY,
        { id: productId },
      );

    return fromSeatmapNodes(body.data?.activity?.seatingMaps ?? []);
  }
}
