/**
 * Account-user operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getAccountUserService}. Only
 * active users are returned.
 */
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type { AccountUser } from "../../models/account-user.js";
import {
  fromAccountUserNode,
  fromAccountUserNodes,
} from "./account-user-converter.js";
import {
  USER_BY_FILTER_QUERY,
  USER_QUERY,
  type AccountUsersResponse,
} from "./account-user-queries.js";

/** Default page size for cursor-paginated account users. */
const DEFAULT_PAGE_SIZE = 50;

/** Tuning options for an {@link AccountUserService}. */
export interface AccountUserServiceOptions {
  /** Page size for cursor pagination. Default: 50. */
  pageSize?: number;
}

export class AccountUserService {
  private readonly pageSize: number;

  constructor(
    private readonly client: GraphQLClient,
    options: AccountUserServiceOptions = {},
  ) {
    this.pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  }

  /**
   * Returns all active account users, walking the cursor pagination to the end.
   * Inactive users are omitted.
   */
  async getAll(): Promise<AccountUser[]> {
    const users: AccountUser[] = [];
    let after: string | null = null;

    for (;;) {
      const body: GraphQLBody<AccountUsersResponse> =
        await this.client.request<AccountUsersResponse>(SALES_ENDPOINT, USER_QUERY, {
          first: this.pageSize,
          after,
        });

      const connection = body.data?.accountUsers;
      const edges = connection?.edges ?? [];
      if (edges.length === 0) {
        break;
      }

      users.push(...fromAccountUserNodes(edges.map((edge) => edge.node)));

      const pageInfo = connection?.pageInfo;
      if (pageInfo?.hasNextPage && pageInfo.endCursor) {
        after = pageInfo.endCursor;
      } else {
        break;
      }
    }

    return users;
  }

  /**
   * Returns a single active account user by id, or `null` when no active user
   * matches.
   */
  async getById(userId: string): Promise<AccountUser | null> {
    const body: GraphQLBody<AccountUsersResponse> =
      await this.client.request<AccountUsersResponse>(
        SALES_ENDPOINT,
        USER_BY_FILTER_QUERY,
        { first: this.pageSize, filter: { ids: [userId] } },
      );

    const firstEdge = (body.data?.accountUsers?.edges ?? [])[0];
    if (!firstEdge) {
      return null;
    }
    return fromAccountUserNode(firstEdge.node);
  }
}
