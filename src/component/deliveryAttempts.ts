import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";

/**
 * Log a delivery attempt (O-OPS-3). Called from delivery action.
 */
export const add = mutation({
  args: {
    deliveryId: v.id("webhookDeliveries"),
    endpointId: v.id("webhookEndpoints"),
    attemptNumber: v.number(),
    requestTimestamp: v.number(),
    responseStatus: v.optional(v.number()),
    responseBody: v.optional(v.string()),
    durationMs: v.optional(v.number()),
    error: v.optional(v.string()),
    success: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("deliveryAttempts", args);
  },
});

export const get = query({
  args: {
    attemptId: v.id("deliveryAttempts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.attemptId);
  },
});

export const listByDelivery = query({
  args: {
    deliveryId: v.id("webhookDeliveries"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deliveryAttempts")
      .withIndex("by_deliveryId", (q) => q.eq("deliveryId", args.deliveryId))
      .order("asc")
      .collect();
  },
});

export const listByEndpoint = query({
  args: {
    endpointId: v.id("webhookEndpoints"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deliveryAttempts")
      .withIndex("by_endpointId", (q) => q.eq("endpointId", args.endpointId))
      .order("desc")
      .take(100);
  },
});

export const remove = mutation({
  args: {
    attemptId: v.id("deliveryAttempts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.attemptId);
    return { success: true };
  },
});
