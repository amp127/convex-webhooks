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
        string,
        Name
      >;
      get: FunctionReference<
        "query",
        "internal",
        { attemptId: string },
        null | {
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
        Name
      >;
      listByDelivery: FunctionReference<
        "query",
        "internal",
        { deliveryId: string },
        Array<{
          attemptNumber: number;
          deliveryId: string;
          durationMs?: number;
          endpointId: string;
          error?: string;
          requestTimestamp: number;
          responseBody?: string;
          responseStatus?: number;
          success: boolean;
        }>,
        Name
      >;
      listByEndpoint: FunctionReference<
        "query",
        "internal",
        { endpointId: string },
        Array<{
          attemptNumber: number;
          deliveryId: string;
          durationMs?: number;
          endpointId: string;
          error?: string;
          requestTimestamp: number;
          responseBody?: string;
          responseStatus?: number;
          success: boolean;
        }>,
        Name
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { attemptId: string },
        { deleted: boolean },
        Name
      >;
      update: FunctionReference<
        "mutation",
        "internal",
        {
          attemptId: string;
          durationMs?: number;
          error?: string;
          responseBody?: string;
          responseStatus?: number;
          success?: boolean;
        },
        null | string,
        Name
      >;
    };
    eventCategories: {
      create: FunctionReference<
        "mutation",
        "internal",
        { categoryName: string; categoryString: string; tenantId: string },
        string,
        Name
      >;
      get: FunctionReference<
        "query",
        "internal",
        { eventCategoryId: string },
        null | {
          categoryName: string;
          categoryString: string;
          tenantId: string;
        },
        Name
      >;
      list: FunctionReference<
        "query",
        "internal",
        { tenantId?: string },
        Array<{
          categoryName: string;
          categoryString: string;
          tenantId: string;
        }>,
        Name
      >;
      listByCategoryName: FunctionReference<
        "query",
        "internal",
        { categoryName: string },
        Array<{
          categoryName: string;
          categoryString: string;
          tenantId: string;
        }>,
        Name
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { eventCategoryId: string },
        { deleted: boolean },
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
        null | string,
        Name
      >;
    };
    eventRegistry: {
      create: FunctionReference<
        "mutation",
        "internal",
        {
          eventName: string;
          eventString: string;
          filterValues: Array<{ name: string; value: any }>;
          importance: number;
          metadata?: Record<string, any>;
          status: "Enabled" | "Disabled" | "Paused";
          tenantId: string;
          title?: string;
          version: number;
        },
        string,
        Name
      >;
      get: FunctionReference<
        "query",
        "internal",
        { eventRegistryId: string },
        null | {
          eventName: string;
          eventString: string;
          filterValues: Array<{ name: string; value: any }>;
          importance: number;
          metadata?: Record<string, any>;
          status: "Enabled" | "Disabled" | "Paused";
          tenantId: string;
          title?: string;
          version: number;
        },
        Name
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          limit?: number;
          status?: "Enabled" | "Disabled" | "Paused";
          tenantId?: string;
        },
        Array<{
          eventName: string;
          eventString: string;
          filterValues: Array<{ name: string; value: any }>;
          importance: number;
          metadata?: Record<string, any>;
          status: "Enabled" | "Disabled" | "Paused";
          tenantId: string;
          title?: string;
          version: number;
        }>,
        Name
      >;
      listByEventName: FunctionReference<
        "query",
        "internal",
        { eventName: string },
        Array<{
          eventName: string;
          eventString: string;
          filterValues: Array<{ name: string; value: any }>;
          importance: number;
          metadata?: Record<string, any>;
          status: "Enabled" | "Disabled" | "Paused";
          tenantId: string;
          title?: string;
          version: number;
        }>,
        Name
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { eventRegistryId: string },
        { deleted: boolean },
        Name
      >;
      update: FunctionReference<
        "mutation",
        "internal",
        {
          eventName?: string;
          eventRegistryId: string;
          eventString?: string;
          filterValues?: Array<{ name: string; value: any }>;
          importance?: number;
          metadata?: Record<string, any>;
          status?: "Enabled" | "Disabled" | "Paused";
          tenantId?: string;
          title?: string;
          version?: number;
        },
        null | string,
        Name
      >;
    };
    webhookDeliveries: {
      get: FunctionReference<
        "query",
        "internal",
        { deliveryId: string },
        null | {
          attemptCount: number;
          completedAt?: number;
          endpointId: string;
          error?: string;
          eventId: string;
          isReplay?: boolean;
          lastAttemptAt?: number;
          maxAttempts: number;
          nextAttemptAt?: number;
          originalDeliveryId?: string;
          state: "pending" | "delivering" | "delivered" | "retrying" | "failed";
          webhookId: string;
        },
        Name
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          endpointId?: string;
          eventId?: string;
          limit?: number;
          state?:
            | "pending"
            | "delivering"
            | "delivered"
            | "retrying"
            | "failed";
        },
        Array<{
          attemptCount: number;
          completedAt?: number;
          endpointId: string;
          error?: string;
          eventId: string;
          isReplay?: boolean;
          lastAttemptAt?: number;
          maxAttempts: number;
          nextAttemptAt?: number;
          originalDeliveryId?: string;
          state: "pending" | "delivering" | "delivered" | "retrying" | "failed";
          webhookId: string;
        }>,
        Name
      >;
      listPendingForWorker: FunctionReference<
        "query",
        "internal",
        { limit?: number },
        Array<{
          attemptCount: number;
          completedAt?: number;
          endpointId: string;
          error?: string;
          eventId: string;
          isReplay?: boolean;
          lastAttemptAt?: number;
          maxAttempts: number;
          nextAttemptAt?: number;
          originalDeliveryId?: string;
          state: "pending" | "delivering" | "delivered" | "retrying" | "failed";
          webhookId: string;
        }>,
        Name
      >;
      markDelivered: FunctionReference<
        "mutation",
        "internal",
        { deliveryId: string },
        boolean,
        Name
      >;
      markFailed: FunctionReference<
        "mutation",
        "internal",
        { deliveryId: string; error?: string },
        boolean,
        Name
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { deliveryId: string },
        { deleted: boolean },
        Name
      >;
      scheduleRetry: FunctionReference<
        "mutation",
        "internal",
        { deliveryId: string; error?: string; nextAttemptAt: number },
        boolean,
        Name
      >;
    };
    webhookEndpoints: {
      create: FunctionReference<
        "mutation",
        "internal",
        {
          appId?: string;
          description?: string;
          disabledAt?: number;
          disabledReason?: string;
          eventTypes: Array<string>;
          httpsOnly: boolean;
          metadata?: Record<string, any>;
          privateKey?: string;
          publicKey?: string;
          rateLimitPerMinute?: number;
          rotatingPrivateKey?: string;
          rotatingPublicKey?: string;
          rotatingSecret?: string;
          rotationExpiresAt?: number;
          secret?: string;
          signingScheme: "v1" | "v1a";
          status: "active" | "disabled" | "paused";
          url: string;
        },
        string,
        Name
      >;
      get: FunctionReference<
        "query",
        "internal",
        { endpointId: string },
        null | {
          appId?: string;
          description?: string;
          disabledAt?: number;
          disabledReason?: string;
          eventTypes: Array<string>;
          httpsOnly: boolean;
          metadata?: Record<string, any>;
          privateKey?: string;
          publicKey?: string;
          rateLimitPerMinute?: number;
          rotatingPrivateKey?: string;
          rotatingPublicKey?: string;
          rotatingSecret?: string;
          rotationExpiresAt?: number;
          secret?: string;
          signingScheme: "v1" | "v1a";
          status: "active" | "disabled" | "paused";
          url: string;
        },
        Name
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          appId?: string;
          limit?: number;
          status?: "active" | "disabled" | "paused";
        },
        Array<{
          appId?: string;
          description?: string;
          disabledAt?: number;
          disabledReason?: string;
          eventTypes: Array<string>;
          httpsOnly: boolean;
          metadata?: Record<string, any>;
          privateKey?: string;
          publicKey?: string;
          rateLimitPerMinute?: number;
          rotatingPrivateKey?: string;
          rotatingPublicKey?: string;
          rotatingSecret?: string;
          rotationExpiresAt?: number;
          secret?: string;
          signingScheme: "v1" | "v1a";
          status: "active" | "disabled" | "paused";
          url: string;
        }>,
        Name
      >;
      listByUrl: FunctionReference<
        "query",
        "internal",
        { url: string },
        Array<{
          appId?: string;
          description?: string;
          disabledAt?: number;
          disabledReason?: string;
          eventTypes: Array<string>;
          httpsOnly: boolean;
          metadata?: Record<string, any>;
          privateKey?: string;
          publicKey?: string;
          rateLimitPerMinute?: number;
          rotatingPrivateKey?: string;
          rotatingPublicKey?: string;
          rotatingSecret?: string;
          rotationExpiresAt?: number;
          secret?: string;
          signingScheme: "v1" | "v1a";
          status: "active" | "disabled" | "paused";
          url: string;
        }>,
        Name
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { endpointId: string },
        { deleted: boolean },
        Name
      >;
      update: FunctionReference<
        "mutation",
        "internal",
        {
          appId?: string;
          description?: string;
          disabledAt?: number;
          disabledReason?: string;
          endpointId: string;
          eventTypes?: Array<string>;
          httpsOnly?: boolean;
          metadata?: Record<string, any>;
          privateKey?: string;
          publicKey?: string;
          rateLimitPerMinute?: number;
          rotatingPrivateKey?: string;
          rotatingPublicKey?: string;
          rotatingSecret?: string;
          rotationExpiresAt?: number;
          secret?: string;
          signingScheme?: "v1" | "v1a";
          status?: "active" | "disabled" | "paused";
          url?: string;
        },
        null | string,
        Name
      >;
    };
    webhookEvents: {
      create: FunctionReference<
        "mutation",
        "internal",
        {
          data: any;
          eventType: string;
          idempotencyKey?: string;
          payload: string;
          timestamp: string;
          webhookId: string;
        },
        string,
        Name
      >;
      get: FunctionReference<
        "query",
        "internal",
        { eventId: string },
        null | {
          data: any;
          eventType: string;
          idempotencyKey?: string;
          payload: string;
          timestamp: string;
          webhookId: string;
        },
        Name
      >;
      list: FunctionReference<
        "query",
        "internal",
        { eventType?: string; limit?: number; webhookId?: string },
        Array<{
          data: any;
          eventType: string;
          idempotencyKey?: string;
          payload: string;
          timestamp: string;
          webhookId: string;
        }>,
        Name
      >;
      listByIdempotencyKey: FunctionReference<
        "query",
        "internal",
        { idempotencyKey: string },
        Array<{
          data: any;
          eventType: string;
          idempotencyKey?: string;
          payload: string;
          timestamp: string;
          webhookId: string;
        }>,
        Name
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { eventId: string },
        { deleted: boolean },
        Name
      >;
    };
  };
