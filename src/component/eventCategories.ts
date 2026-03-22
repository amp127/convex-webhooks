import type { Id } from "./_generated/dataModel.js";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import { withoutSystemFields } from "convex-helpers";
import {
  vEventCategoryCreateArgs,
  vEventCategoryItem,
  vEventCategoryUpdateArgs,
  vDeletedResult,
} from "../shared.js";
import type {
  EventCategoryItem,
  DeletedResult,
} from "../shared.js";

export const create = mutation({
  args: vEventCategoryCreateArgs,
  returns: v.id("eventCategories"),
  handler: async (ctx, args): Promise<Id<"eventCategories">> => {
    return await ctx.db.insert("eventCategories", args);
  },
});

export const get = query({
  args: { eventCategoryId: v.id("eventCategories") },
  returns: v.union(v.null(), vEventCategoryItem),
  handler: async (ctx, args): Promise<EventCategoryItem | null> => {
    const doc = await ctx.db.get(args.eventCategoryId);
    if (!doc) return null;
    return withoutSystemFields(doc) as EventCategoryItem;
  },
});

export const list = query({
  args: {
    tenantId: v.optional(v.string()),
  },
  returns: v.array(vEventCategoryItem),
  handler: async (ctx, args): Promise<EventCategoryItem[]> => {
    if (args.tenantId !== undefined) {
      const docs = await ctx.db
        .query("eventCategories")
        .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId!))
        .collect();
      return docs.map((d) => withoutSystemFields(d) as EventCategoryItem);
    }
    const docs = await ctx.db.query("eventCategories").collect();
    return docs.map((d) => withoutSystemFields(d) as EventCategoryItem);
  },
});

export const listByCategoryName = query({
  args: { categoryName: v.string() },
  returns: v.array(vEventCategoryItem),
  handler: async (ctx, args): Promise<EventCategoryItem[]> => {
    const docs = await ctx.db
      .query("eventCategories")
      .withIndex("categoryName", (q) => q.eq("categoryName", args.categoryName))
      .collect();
    return docs.map((d) => withoutSystemFields(d) as EventCategoryItem);
  },
});

export const update = mutation({
  args: vEventCategoryUpdateArgs,
  returns: v.union(v.null(), v.id("eventCategories")),
  handler: async (
    ctx,
    args
  ): Promise<Id<"eventCategories"> | null> => {
    const { eventCategoryId, ...updates } = args;
    const doc = await ctx.db.get(eventCategoryId);
    if (!doc) return null;
    const patch: Partial<typeof doc> = {};
    if (updates.tenantId !== undefined) patch.tenantId = updates.tenantId;
    if (updates.categoryName !== undefined)
      patch.categoryName = updates.categoryName;
    if (updates.categoryString !== undefined)
      patch.categoryString = updates.categoryString;
    if (Object.keys(patch).length === 0) return eventCategoryId;
    await ctx.db.patch(eventCategoryId, patch);
    return eventCategoryId;
  },
});

export const remove = mutation({
  args: { eventCategoryId: v.id("eventCategories") },
  returns: vDeletedResult,
  handler: async (ctx, args): Promise<DeletedResult> => {
    await ctx.db.delete(args.eventCategoryId);
    return { deleted: true };
  },
});
