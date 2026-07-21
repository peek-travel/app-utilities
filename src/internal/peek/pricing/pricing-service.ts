/**
 * Pricing-engine and pricing-override operations against the Peek gateway.
 *
 * Obtain an instance via {@link PeekAccessService.getPricingService} rather than
 * constructing it directly.
 *
 * Scope: this service is a thin, faithful wrapper over the Peek pricing
 * primitives. It creates/updates/deletes engines and upserts/clears overrides,
 * validating inputs and mapping the typed-error unions to thrown `Error`s. It
 * does **not** own the domain logic that decides what the overrides should be —
 * segmenting activities across time windows, ordering override tiers, or
 * computing `spotsTaken` bounds. Callers build the {@link UpsertOverridesInput}
 * (see the model docs) and this service sends it as-is.
 */
import { SALES_ENDPOINT } from "../gateway-endpoints.js";
import type { GraphQLBody, GraphQLClient } from "../graphql-client.js";
import type {
  ClearOverridesInput,
  CreateEngineInput,
  CreatedPricingEngine,
  PricingEngine,
  ResourceOptionOverride,
  UpdateEngineInput,
  UpsertOverridesInput,
  UpsertOverridesResult,
} from "../../../models/peek/pricing.js";
import { fromActivityContexts } from "./pricing-converter.js";
import {
  buildClearInput,
  buildCreateEngineInput,
  buildUpdateEngineInput,
  buildUpsertInput,
  CREATE_PRICING_ENGINE_MUTATION,
  DELETE_PRICING_ENGINE_MUTATION,
  UPDATE_PRICING_ENGINE_MUTATION,
  UPSERT_PRICING_OVERRIDES_MUTATION,
  type CreateEngineResponse,
  type DeleteEngineResponse,
  type UpdateEngineResponse,
  type UpsertOverridesResponse,
} from "./pricing-queries.js";

/** ISO 4217 currency codes are three uppercase letters. */
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
/** A percentage adjustment must be strictly greater than this floor. */
const PERCENTAGE_FLOOR = -100;

const ERROR_NAME_REQUIRED = "name is required";
const ERROR_ENGINE_ID_REQUIRED = "engineId is required";
const ERROR_DATE_RANGE_REQUIRED = "dateRange is required";
const ERROR_ACTIVITIES_REQUIRED = "activities is required";
const ERROR_ACTIVITY_ID_REQUIRED = "activityId is required";
const ERROR_TICKET_ID_REQUIRED = "resource-option id is required";
const ERROR_CURRENCY_FORMAT = "currency must be 3 uppercase letters";
const ERROR_AMOUNT_NUMBER = "price amount must be a valid number";
const ERROR_PERCENTAGE_NUMBER = "percentageAdjustment must be a valid number";
const ERROR_PERCENTAGE_FLOOR = "percentageAdjustment must be greater than -100";
const ERROR_NO_DATA = "pricing mutation returned no data";

export class PricingService {
  constructor(private readonly client: GraphQLClient) {}

  /**
   * Creates a pricing engine. Store the returned id and reuse it on every
   * subsequent override upsert. Throws on an InvalidDataError from Peek.
   */
  async createEngine(input: CreateEngineInput): Promise<CreatedPricingEngine> {
    if (!input.name) throw new Error(ERROR_NAME_REQUIRED);

    const body: GraphQLBody<CreateEngineResponse> =
      await this.client.request<CreateEngineResponse>(
        SALES_ENDPOINT,
        CREATE_PRICING_ENGINE_MUTATION,
        { input: buildCreateEngineInput(input) },
      );

    const result = body.data?.createPricingEngine;
    if (!result) throw new Error(ERROR_NO_DATA);
    if (result.__typename !== "CreatePricingEngineSuccess") {
      throw new Error(result.message);
    }
    return { id: result.engine.id };
  }

  /**
   * Updates a pricing engine's name and/or activity scope. Throws on an
   * InvalidDataError or NotFoundError from Peek.
   */
  async updateEngine(input: UpdateEngineInput): Promise<PricingEngine> {
    if (!input.engineId) throw new Error(ERROR_ENGINE_ID_REQUIRED);
    if (!input.name) throw new Error(ERROR_NAME_REQUIRED);

    const body: GraphQLBody<UpdateEngineResponse> =
      await this.client.request<UpdateEngineResponse>(
        SALES_ENDPOINT,
        UPDATE_PRICING_ENGINE_MUTATION,
        { input: buildUpdateEngineInput(input) },
      );

    const result = body.data?.updatePricingEngine;
    if (!result) throw new Error(ERROR_NO_DATA);
    if (result.__typename !== "UpdatePricingEngineSuccess") {
      throw new Error(result.message);
    }
    return { id: result.engine.id, name: result.engine.name };
  }

  /**
   * Deletes a pricing engine. Idempotent — resolves whether the engine existed
   * or was already gone (Peek's NotFoundError is treated as success).
   */
  async deleteEngine(engineId: string): Promise<void> {
    if (!engineId) throw new Error(ERROR_ENGINE_ID_REQUIRED);

    await this.client.request<DeleteEngineResponse>(
      SALES_ENDPOINT,
      DELETE_PRICING_ENGINE_MUTATION,
      { id: engineId },
    );
  }

  /**
   * Upserts pricing overrides for the engine and date range in `input`. Returns
   * the resolved contexts Peek stored. Throws on an InvalidDataError from Peek.
   */
  async upsertOverrides(input: UpsertOverridesInput): Promise<UpsertOverridesResult> {
    this.validateUpsertInput(input);
    return this.sendUpsert(buildUpsertInput(input));
  }

  /**
   * Clears all overrides for the given activities across a date range. This is
   * an upsert with empty overrides — never clear by omitting an activity.
   */
  async clearOverrides(input: ClearOverridesInput): Promise<UpsertOverridesResult> {
    if (!input.engineId) throw new Error(ERROR_ENGINE_ID_REQUIRED);
    if (!input.dateRange) throw new Error(ERROR_DATE_RANGE_REQUIRED);
    if (!Array.isArray(input.activityIds)) throw new Error(ERROR_ACTIVITIES_REQUIRED);
    for (const activityId of input.activityIds) {
      if (!activityId) throw new Error(ERROR_ACTIVITY_ID_REQUIRED);
    }
    return this.sendUpsert(buildClearInput(input));
  }

  private async sendUpsert(
    rawInput: ReturnType<typeof buildUpsertInput>,
  ): Promise<UpsertOverridesResult> {
    const body: GraphQLBody<UpsertOverridesResponse> =
      await this.client.request<UpsertOverridesResponse>(
        SALES_ENDPOINT,
        UPSERT_PRICING_OVERRIDES_MUTATION,
        { input: rawInput },
      );

    const result = body.data?.upsertPricingOverridesActivityContexts;
    if (!result) throw new Error(ERROR_NO_DATA);
    if (result.__typename !== "UpsertPricingOverridesActivityContextsSuccess") {
      throw new Error(result.message);
    }
    return { activityContexts: fromActivityContexts(result.activityContexts) };
  }

  private validateUpsertInput(input: UpsertOverridesInput): void {
    if (!input.engineId) throw new Error(ERROR_ENGINE_ID_REQUIRED);
    if (!input.dateRange) throw new Error(ERROR_DATE_RANGE_REQUIRED);
    if (!Array.isArray(input.activities)) throw new Error(ERROR_ACTIVITIES_REQUIRED);

    for (const activity of input.activities) {
      if (!activity.activityId) throw new Error(ERROR_ACTIVITY_ID_REQUIRED);
      for (const override of activity.overrides) {
        for (const option of override.resourceOptions) {
          this.validateResourceOption(option);
        }
      }
    }
  }

  private validateResourceOption(option: ResourceOptionOverride): void {
    if (!option.id) throw new Error(ERROR_TICKET_ID_REQUIRED);

    if (option.mode === "fixed") {
      if (!CURRENCY_PATTERN.test(option.price.currency)) {
        throw new Error(ERROR_CURRENCY_FORMAT);
      }
      if (Number.isNaN(Number.parseFloat(option.price.amount))) {
        throw new Error(ERROR_AMOUNT_NUMBER);
      }
      return;
    }

    const percentage = Number.parseFloat(option.percentageAdjustment);
    if (Number.isNaN(percentage)) throw new Error(ERROR_PERCENTAGE_NUMBER);
    if (percentage <= PERCENTAGE_FLOOR) throw new Error(ERROR_PERCENTAGE_FLOOR);
  }
}
