/**
 * Product-related operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getProductService} rather than
 * constructing it directly — the access service wires in the authenticated,
 * shared transport. This class is where product-specific business logic lives.
 */
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type { Product } from "../../models/product.js";
import { fromActivities, fromItemOptionNodes } from "./product-converter.js";
import {
  ITEM_OPTIONS_QUERY,
  PRODUCTS_QUERY,
  type ItemOptionNode,
  type ItemOptionsData,
  type ProductsResponse,
} from "./product-queries.js";

/** Default page size for cursor-paginated item options. */
const DEFAULT_ITEM_OPTIONS_PAGE_SIZE = 50;

/** Tuning options for a {@link ProductService}. */
export interface ProductServiceOptions {
  /** Page size for cursor-paginated item options. Default: 50. */
  itemOptionsPageSize?: number;
}

export class ProductService {
  private readonly itemOptionsPageSize: number;

  constructor(
    private readonly client: GraphQLClient,
    options: ProductServiceOptions = {},
  ) {
    this.itemOptionsPageSize =
      options.itemOptionsPageSize ?? DEFAULT_ITEM_OPTIONS_PAGE_SIZE;
  }

  /**
   * Returns every product as a single flat list: activities plus add-ons (the
   * latter tagged with the add-on type). Add-ons are gathered across all
   * cursor-paginated pages.
   *
   * @example Split activities from add-ons
   * ```ts
   * import { ADD_ON_PRODUCT_TYPE } from "@peek-travel/app-utilities";
   *
   * const products = await peek.getProductService().getAllProducts();
   * const activities = products.filter((p) => p.type !== ADD_ON_PRODUCT_TYPE);
   * const addons = products.filter((p) => p.type === ADD_ON_PRODUCT_TYPE);
   * ```
   */
  async getAllProducts(): Promise<Product[]> {
    const [activities, itemOptionNodes] = await Promise.all([
      this.fetchActivities(),
      this.fetchAllItemOptionNodes(),
    ]);

    return [...fromActivities(activities), ...fromItemOptionNodes(itemOptionNodes)];
  }

  private async fetchActivities(): Promise<ProductsResponse["activities"]> {
    const body: GraphQLBody<ProductsResponse> =
      await this.client.request<ProductsResponse>(
        SALES_ENDPOINT,
        PRODUCTS_QUERY,
        {},
      );
    return body.data?.activities ?? [];
  }

  private async fetchAllItemOptionNodes(): Promise<ItemOptionNode[]> {
    const all: ItemOptionNode[] = [];
    let after: string | null = null;

    for (;;) {
      const body: GraphQLBody<ItemOptionsData> =
        await this.client.request<ItemOptionsData>(
          SALES_ENDPOINT,
          ITEM_OPTIONS_QUERY,
          { first: this.itemOptionsPageSize, after },
        );

      const connection = body.data?.itemOptions;
      for (const edge of connection?.edges ?? []) {
        all.push(edge.node);
      }

      const pageInfo = connection?.pageInfo;
      if (pageInfo?.hasNextPage && pageInfo.endCursor) {
        after = pageInfo.endCursor;
      } else {
        break;
      }
    }

    return all;
  }
}
