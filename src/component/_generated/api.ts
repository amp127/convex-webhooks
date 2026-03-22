/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions from "../actions.js";
import type * as deliveryAttempts from "../deliveryAttempts.js";
import type * as eventCategories from "../eventCategories.js";
import type * as eventRegistry from "../eventRegistry.js";
import type * as signing from "../signing.js";
import type * as webhookDeliveries from "../webhookDeliveries.js";
import type * as webhookEndpoints from "../webhookEndpoints.js";
import type * as webhookEvents from "../webhookEvents.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import { anyApi, componentsGeneric } from "convex/server";

const fullApi: ApiFromModules<{
  actions: typeof actions;
  deliveryAttempts: typeof deliveryAttempts;
  eventCategories: typeof eventCategories;
  eventRegistry: typeof eventRegistry;
  signing: typeof signing;
  webhookDeliveries: typeof webhookDeliveries;
  webhookEndpoints: typeof webhookEndpoints;
  webhookEvents: typeof webhookEvents;
}> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
> = anyApi as any;

export const components = componentsGeneric() as unknown as {
  workpool: import("@convex-dev/workpool/_generated/component.js").ComponentApi<"workpool">;
};
