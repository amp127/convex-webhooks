import type { Id } from "./_generated/dataModel.js";
import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server.js";
import { withoutSystemFields } from "convex-helpers";
import {
  vDeliveryAttemptAddArgs,
  vDeliveryAttemptItem,
  vDeliveryAttemptUpdateArgs,
  vDeletedResult,
} from "../shared.js";
import type {
  DeliveryAttemptItem,
  DeletedResult,
} from "../shared.js";

/**
 * Log a delivery attempt (O-OPS-3). Called from delivery action.
 */
export const add = mutation({
  args: vDeliveryAttemptAddArgs,
  returns: v.id("deliveryAttempts"),
  handler: async (ctx, args): Promise<Id<"deliveryAttempts">> => {
    return await ctx.db.insert("deliveryAttempts", args);
  },
});

export const get = query({
  args: {
    attemptId: v.id("deliveryAttempts"),
  },
  returns: v.union(v.null(), vDeliveryAttemptItem),
  handler: async (ctx, args): Promise<DeliveryAttemptItem | null> => {
    const doc = await ctx.db.get(args.attemptId);
    if (!doc) return null;
    return withoutSystemFields(doc) as DeliveryAttemptItem;
  },
});

export const listByDelivery = query({
  args: {
    deliveryId: v.id("webhookDeliveries"),
  },
  returns: v.array(vDeliveryAttemptItem),
  handler: async (ctx, args): Promise<DeliveryAttemptItem[]> => {
    const docs = await ctx.db
      .query("deliveryAttempts")
      .withIndex("by_deliveryId", (q) => q.eq("deliveryId", args.deliveryId))
      .order("asc")
      .collect();
    return docs.map((d) => withoutSystemFields(d) as DeliveryAttemptItem);
  },
});

export const listByEndpoint = query({
  args: {
    endpointId: v.id("webhookEndpoints"),
  },
  returns: v.array(vDeliveryAttemptItem),
  handler: async (ctx, args): Promise<DeliveryAttemptItem[]> => {
    const docs = await ctx.db
      .query("deliveryAttempts")
      .withIndex("by_endpointId", (q) => q.eq("endpointId", args.endpointId))
      .order("desc")
      .take(100);
    return docs.map((d) => withoutSystemFields(d) as DeliveryAttemptItem);
  },
});

export const update = mutation({
  args: vDeliveryAttemptUpdateArgs,
  returns: v.union(v.null(), v.id("deliveryAttempts")),
  handler: async (
    ctx,
    args
  ): Promise<Id<"deliveryAttempts"> | null> => {
    const { attemptId, ...updates } = args;
    const doc = await ctx.db.get(attemptId);
    if (!doc) return null;
    const patch: Partial<typeof doc> = {};
    if (updates.responseStatus !== undefined)
      patch.responseStatus = updates.responseStatus;
    if (updates.responseBody !== undefined)
      patch.responseBody = updates.responseBody;
    if (updates.durationMs !== undefined) patch.durationMs = updates.durationMs;
    if (updates.error !== undefined) patch.error = updates.error;
    if (updates.success !== undefined) patch.success = updates.success;
    if (Object.keys(patch).length === 0) return attemptId;
    await ctx.db.patch(attemptId, patch);
    return attemptId;
  },
});

/**
 * Internal: record a delivery attempt (same as add). Used by the host's
 * processDelivery action so the host does not need to know the table name.
 */
export const recordAttempt = internalMutation({
  args: vDeliveryAttemptAddArgs,
  returns: v.id("deliveryAttempts"),
  handler: async (ctx, args): Promise<Id<"deliveryAttempts">> => {
    return await ctx.db.insert("deliveryAttempts", args);
  },
});

export const remove = mutation({
  args: {
    attemptId: v.id("deliveryAttempts"),
  },
  returns: vDeletedResult,
  handler: async (ctx, args): Promise<DeletedResult> => {
    await ctx.db.delete(args.attemptId);
    return { deleted: true };
  },
});
