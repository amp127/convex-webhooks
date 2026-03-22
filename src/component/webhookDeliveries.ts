import type { Id } from "./_generated/dataModel.js";
import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server.js";
import { withoutSystemFields } from "convex-helpers";
import {
  vWebhookDeliveryCreateArgs,
  vWebhookDeliveryItem,
  vDeliveryState,
  vGetDeliveryForProcessingResult,
  vScheduleRetryArgs,
  vScheduleDeliveryArgs,
  vMarkFailedArgs,
  vDeletedResult,
} from "../shared.js";
import type {
  WebhookDeliveryItem,
  GetDeliveryForProcessingResult,
  DeletedResult,
} from "../shared.js";
import { internal } from "./_generated/api.js";

/**
 * Internal: create a delivery (used when fanning out from an event to endpoints).
 */
export const create = internalMutation({
  args: vWebhookDeliveryCreateArgs,
  returns: v.id("webhookDeliveries"),
  handler: async (ctx, args): Promise<Id<"webhookDeliveries">> => {
    return await ctx.db.insert("webhookDeliveries", args);
  },
});

export const get = query({
  args: { deliveryId: v.id("webhookDeliveries") },
  returns: v.union(v.null(), vWebhookDeliveryItem),
  handler: async (ctx, args): Promise<WebhookDeliveryItem | null> => {
    const doc = await ctx.db.get(args.deliveryId);
    if (!doc) return null;
    return withoutSystemFields(doc) as WebhookDeliveryItem;
  },
});

export const list = query({
  args: {
    endpointId: v.optional(v.id("webhookEndpoints")),
    eventId: v.optional(v.id("webhookEvents")),
    state: v.optional(vDeliveryState),
    limit: v.optional(v.number()),
  },
  returns: v.array(vWebhookDeliveryItem),
  handler: async (ctx, args): Promise<WebhookDeliveryItem[]> => {
    const limit = args.limit ?? 100;
    if (args.endpointId !== undefined) {
      const docs = await ctx.db
        .query("webhookDeliveries")
        .withIndex("by_endpointId", (q) => q.eq("endpointId", args.endpointId!))
        .order("desc")
        .take(limit);
      return docs.map((d) => withoutSystemFields(d) as WebhookDeliveryItem);
    }
    if (args.eventId !== undefined) {
      const docs = await ctx.db
        .query("webhookDeliveries")
        .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId!))
        .order("desc")
        .take(limit);
      return docs.map((d) => withoutSystemFields(d) as WebhookDeliveryItem);
    }
    if (args.state !== undefined) {
      const docs = await ctx.db
        .query("webhookDeliveries")
        .withIndex("by_state", (q) => q.eq("state", args.state!))
        .order("desc")
        .take(limit);
      return docs.map((d) => withoutSystemFields(d) as WebhookDeliveryItem);
    }
    const docs = await ctx.db
      .query("webhookDeliveries")
      .order("desc")
      .take(limit);
    return docs.map((d) => withoutSystemFields(d) as WebhookDeliveryItem);
  },
});

/**
 * List deliveries that are pending (or retrying with nextAttemptAt <= now)
 * for workpool scheduling or cron.
 */
export const listPendingForWorker = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(vWebhookDeliveryItem),
  handler: async (ctx, args): Promise<WebhookDeliveryItem[]> => {
    const limit = args.limit ?? 50;
    const now = Date.now();
    const pending = await ctx.db
      .query("webhookDeliveries")
      .withIndex("by_state", (q) => q.eq("state", "pending"))
      .order("asc")
      .take(limit);
    const retryingAll = await ctx.db
      .query("webhookDeliveries")
      .withIndex("by_state", (q) => q.eq("state", "retrying"))
      .collect();
    const retrying = retryingAll
      .filter((d) => d.nextAttemptAt != null && d.nextAttemptAt <= now)
      .slice(0, limit);
    const combined = [...pending, ...retrying].slice(0, limit);
    return combined.map((d) => withoutSystemFields(d) as WebhookDeliveryItem);
  },
});

export const markDelivered = mutation({
  args: { deliveryId: v.id("webhookDeliveries") },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const doc = await ctx.db.get(args.deliveryId);
    if (!doc) return false;
    if (doc.state !== "pending" && doc.state !== "delivering" && doc.state !== "retrying")
      return false;
    await ctx.db.patch(args.deliveryId, {
      state: "delivered",
      completedAt: Date.now(),
    });
    return true;
  },
});

export const scheduleRetry = mutation({
  args: vScheduleRetryArgs,
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const doc = await ctx.db.get(args.deliveryId);
    if (!doc) return false;
    if (doc.state !== "pending" && doc.state !== "delivering" && doc.state !== "retrying")
      return false;
    await ctx.db.patch(args.deliveryId, {
      state: "retrying",
      nextAttemptAt: args.nextAttemptAt,
      lastAttemptAt: Date.now(),
      error: args.error,
      attemptCount: doc.attemptCount + 1,
    });
    return true;
  },
});

export const markFailed = mutation({
  args: vMarkFailedArgs,
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const doc = await ctx.db.get(args.deliveryId);
    if (!doc) return false;
    if (doc.state !== "pending" && doc.state !== "delivering" && doc.state !== "retrying")
      return false;
    await ctx.db.patch(args.deliveryId, {
      state: "failed",
      completedAt: Date.now(),
      error: args.error,
    });
    return true;
  },
});

export const remove = mutation({
  args: { deliveryId: v.id("webhookDeliveries") },
  returns: vDeletedResult,
  handler: async (ctx, args): Promise<DeletedResult> => {
    await ctx.db.delete(args.deliveryId);
    return { deleted: true };
  },
});

/**
 * Set delivery state to delivering (prevents double-processing).
 */
export const setDelivering = internalMutation({
  args: { deliveryId: v.id("webhookDeliveries") },
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const doc = await ctx.db.get(args.deliveryId);
    if (!doc) return false;
    if (doc.state !== "pending" && doc.state !== "retrying") return false;
    await ctx.db.patch(args.deliveryId, { state: "delivering" });
    return true;
  },
});

/**
 * Schedules the processDelivery action for a delivery (O-CVX-2).
 * Used by managed sendWebhook so the host can fire-and-forget.
 */
export const scheduleDelivery = internalMutation({
  args: vScheduleDeliveryArgs,
  returns: v.boolean(),
  handler: async (ctx, args): Promise<boolean> => {
    const doc = await ctx.db.get(args.deliveryId);
    if (!doc) return false;
    if (doc.state !== "pending" && doc.state !== "retrying") return false;
    type InternalWithActions = typeof internal & { actions: { processDelivery: import("convex/server").FunctionReference<"action", "internal", { deliveryId: Id<"webhookDeliveries"> }, void> } };
    await ctx.scheduler.runAfter(0, (internal as InternalWithActions).actions.processDelivery, {
      deliveryId: args.deliveryId,
    });
    return true;
  },
});

/**
 * Internal: returns event payload, endpoint url/signing config, and delivery
 * metadata so the host's processDelivery action can POST and sign.
 */
export const getDeliveryForProcessing = internalQuery({
  args: { deliveryId: v.id("webhookDeliveries") },
  returns: v.union(v.null(), vGetDeliveryForProcessingResult),
  handler: async (
    ctx,
    args
  ): Promise<GetDeliveryForProcessingResult | null> => {
    const delivery = await ctx.db.get(args.deliveryId);
    if (!delivery) return null;
    const event = await ctx.db.get(delivery.eventId);
    if (!event) return null;
    const endpoint = await ctx.db.get(delivery.endpointId);
    if (!endpoint) return null;
    return {
      event: {
        payload: event.payload,
        eventType: event.eventType,
        timestamp: event.timestamp,
        data: event.data,
      },
      endpoint: {
        url: endpoint.url,
        signingScheme: endpoint.signingScheme,
        secret: endpoint.secret,
        publicKey: endpoint.publicKey,
        privateKey: endpoint.privateKey,
        rotatingSecret: endpoint.rotatingSecret,
        rotatingPrivateKey: endpoint.rotatingPrivateKey,
        rotationExpiresAt: endpoint.rotationExpiresAt,
      },
      delivery: {
        deliveryId: delivery._id,
        endpointId: delivery.endpointId,
        attemptCount: delivery.attemptCount,
        maxAttempts: delivery.maxAttempts,
      },
    };
  },
});
