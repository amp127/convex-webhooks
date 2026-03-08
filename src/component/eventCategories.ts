import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";

export const create = mutation({
  args: {
    tenantId: v.string(),
    categoryName: v.string(),
    categoryString: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("eventCategories", args);
  },
});

export const get = query({
  args: { eventCategoryId: v.id("eventCategories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventCategoryId);
  },
});

export const list = query({
  args: {
    tenantId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.tenantId !== undefined) {
      return await ctx.db
        .query("eventCategories")
        .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId!))
        .collect();
    }
    return await ctx.db.query("eventCategories").collect();
  },
});

export const listByCategoryName = query({
  args: { categoryName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("eventCategories")
      .withIndex("categoryName", (q) => q.eq("categoryName", args.categoryName))
      .collect();
  },
});

export const update = mutation({
  args: {
    eventCategoryId: v.id("eventCategories"),
    tenantId: v.optional(v.string()),
    categoryName: v.optional(v.string()),
    categoryString: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { eventCategoryId, ...updates } = args;
    const doc = await ctx.db.get(eventCategoryId);
    if (!doc) return null;
    const patch: Partial<typeof doc> = {};
    if (updates.tenantId !== undefined) patch.tenantId = updates.tenantId;
    if (updates.categoryName !== undefined) patch.categoryName = updates.categoryName;
    if (updates.categoryString !== undefined) patch.categoryString = updates.categoryString;
    if (Object.keys(patch).length === 0) return eventCategoryId;
    await ctx.db.patch(eventCategoryId, patch);
    return eventCategoryId;
  },
});

export const remove = mutation({
  args: { eventCategoryId: v.id("eventCategories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.eventCategoryId);
    return { deleted: true };
  },
});
