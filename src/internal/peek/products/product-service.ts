/**
 * Product-related operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getProductService} rather than
 * constructing it directly — the access service wires in the authenticated,
 * shared transport. This class is where product-specific business logic lives.
 */
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import {
  ACTIVITY_PRODUCT_TYPE,
  RENTAL_PRODUCT_TYPE,
  type Product,
} from "../../../models/peek/product.js";
import type { CustomQuestion } from "../../../models/peek/custom-question.js";
import { fromActivities, fromItemOptionNodes } from "./product-converter.js";
import { fromQuestionConfigurations } from "./custom-question-converter.js";
import {
  ITEM_OPTIONS_QUERY,
  PRODUCTS_QUERY,
  type ItemOptionNode,
  type ItemOptionsData,
  type ProductsResponse,
} from "./product-queries.js";
import {
  CUSTOM_QUESTIONS_QUERY,
  type CustomQuestionsResponse,
} from "./custom-question-queries.js";

/** Thrown-error message when a product id is missing or blank. */
const ERROR_PRODUCT_ID_REQUIRED = "A non-empty product id is required.";

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
   * import { ADD_ON_PRODUCT_TYPE } from "@peektravel/app-utilities";
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

  /** Returns products with type {@link ACTIVITY_PRODUCT_TYPE}. */
  async getAllActivities(): Promise<Product[]> {
    const activities = await this.fetchActivities();
    return fromActivities(activities).filter((p) => p.type === ACTIVITY_PRODUCT_TYPE);
  }

  /** Returns products with type {@link RENTAL_PRODUCT_TYPE}. */
  async getAllRentals(): Promise<Product[]> {
    const activities = await this.fetchActivities();
    return fromActivities(activities).filter((p) => p.type === RENTAL_PRODUCT_TYPE);
  }

  /** Returns only add-on products. */
  async getAllAddons(): Promise<Product[]> {
    const nodes = await this.fetchAllItemOptionNodes();
    return fromItemOptionNodes(nodes);
  }

  /**
   * Returns every custom question configured on a single activity, in the order
   * Peek reports them. Choice-style questions (`SELECT_ONE`, `LOCATION`, …)
   * carry their selectable {@link CustomQuestion.options}; free-text/checkbox
   * questions return an empty option list.
   *
   * These are question **definitions**, not customer answers — no PII is
   * involved, so the result is unaffected by `fullCustomerAccess`.
   *
   * @param productId The activity's id.
   * @returns The activity's custom questions, or an empty list when the activity
   *   has none or is not found.
   * @throws Error when `productId` is missing or blank.
   */
  async getCustomQuestions(productId: string): Promise<CustomQuestion[]> {
    if (!productId?.trim()) {
      throw new Error(ERROR_PRODUCT_ID_REQUIRED);
    }

    const body: GraphQLBody<CustomQuestionsResponse> =
      await this.client.request<CustomQuestionsResponse>(
        SALES_ENDPOINT,
        CUSTOM_QUESTIONS_QUERY,
        { id: productId },
      );

    const configs = body.data?.activity?.questionActivityConfigurations ?? [];
    return fromQuestionConfigurations(configs);
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
