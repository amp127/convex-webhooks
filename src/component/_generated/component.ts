/* eslint-disable */
/**
 * Generated `ComponentApi` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing a Convex component's exposed API.
 *
 * Useful when expecting a parameter like `components.myComponent`.
 * Usage:
 * ```ts
 * async function myFunction(ctx: QueryCtx, component: ComponentApi) {
 *   return ctx.runQuery(component.someFile.someQuery, { ...args });
 * }
 * ```
 */
export type ComponentApi<Name extends string | undefined = string | undefined> =
  {
    deliveryAttempts: {
      add: FunctionReference<
        "mutation",
        "internal",
        {
          attemptNumber: number;
          deliveryId: string;
          durationMs?: number;
          endpointId: string;
          error?: string;
          requestTimestamp: number;
          responseBody?: string;
          responseStatus?: number;
          success: boolean;
        },
        any,
        Name
      >;
      get: FunctionReference<
        "query",
        "internal",
        { attemptId: string },
        any,
        Name
      >;
      listByDelivery: FunctionReference<
        "query",
        "internal",
        { deliveryId: string },
        any,
        Name
      >;
      listByEndpoint: FunctionReference<
        "query",
        "internal",
        { endpointId: string },
        any,
        Name
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { attemptId: string },
        any,
        Name
      >;
    };
    eventCategories: {
      create: FunctionReference<
        "mutation",
        "internal",
        { categoryName: string; categoryString: string; tenantId: string },
        any,
        Name
      >;
      get: FunctionReference<
        "query",
        "internal",
        { eventCategoryId: string },
        any,
        Name
      >;
      list: FunctionReference<
        "query",
        "internal",
        { tenantId?: string },
        any,
        Name
      >;
      listByCategoryName: FunctionReference<
        "query",
        "internal",
        { categoryName: string },
        any,
        Name
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { eventCategoryId: string },
        any,
        Name
      >;
      update: FunctionReference<
        "mutation",
        "internal",
        {
          categoryName?: string;
          categoryString?: string;
          eventCategoryId: string;
          tenantId?: string;
        },
        any,
        Name
      >;
    };
  };
