import type { Id } from "./_generated/dataModel.js";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import { withoutSystemFields } from "convex-helpers";
import {
  vEventRegistryCreateArgs,
  vEventRegistryItem,
  vEventRegistryUpdateArgs,
  vDeletedResult,
  vEventStatus,
} from "../shared.js";
import type { EventRegistryItem, DeletedResult } from "../shared.js";

export const create = mutation({
  args: vEventRegistryCreateArgs,
  returns: v.id("eventRegistry"),
  handler: async (ctx, args): Promise<Id<"eventRegistry">> => {
    return await ctx.db.insert("eventRegistry", args);
  },
});

export const get = query({
  args: { eventRegistryId: v.id("eventRegistry") },
  returns: v.union(v.null(), vEventRegistryItem),
  handler: async (ctx, args): Promise<EventRegistryItem | null> => {
    const doc = await ctx.db.get(args.eventRegistryId);
    if (!doc) return null;
    return withoutSystemFields(doc) as EventRegistryItem;
  },
});

export const list = query({
  args: {
    tenantId: v.optional(v.string()),
    status: v.optional(vEventStatus),
    limit: v.optional(v.number()),
  },
  returns: v.array(vEventRegistryItem),
  handler: async (ctx, args): Promise<EventRegistryItem[]> => {
    const limit = args.limit ?? 100;
    if (args.tenantId !== undefined) {
      const docs = await ctx.db
        .query("eventRegistry")
        .withIndex("by_tenantId", (q) => q.eq("tenantId", args.tenantId!))
        .order("desc")
        .take(limit);
      return docs.map((d) => withoutSystemFields(d) as EventRegistryItem);
    }
    if (args.status !== undefined) {
      const docs = await ctx.db
        .query("eventRegistry")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
      return docs.map((d) => withoutSystemFields(d) as EventRegistryItem);
    }
    const docs = await ctx.db.query("eventRegistry").order("desc").take(limit);
    return docs.map((d) => withoutSystemFields(d) as EventRegistryItem);
  },
});

export const listByEventName = query({
  args: { eventName: v.string() },
  returns: v.array(vEventRegistryItem),
  handler: async (ctx, args): Promise<EventRegistryItem[]> => {
    const docs = await ctx.db
      .query("eventRegistry")
      .withIndex("eventName", (q) => q.eq("eventName", args.eventName))
      .collect();
    return docs.map((d) => withoutSystemFields(d) as EventRegistryItem);
  },
});

export const update = mutation({
  args: vEventRegistryUpdateArgs,
  returns: v.union(v.null(), v.id("eventRegistry")),
  handler: async (
    ctx,
    args
  ): Promise<Id<"eventRegistry"> | null> => {
    const { eventRegistryId, ...updates } = args;
    const doc = await ctx.db.get(eventRegistryId);
    if (!doc) return null;
    const patch: Partial<typeof doc> = {};
    if (updates.tenantId !== undefined) patch.tenantId = updates.tenantId;
    if (updates.eventName !== undefined) patch.eventName = updates.eventName;
    if (updates.eventString !== undefined)
      patch.eventString = updates.eventString;
    if (updates.version !== undefined) patch.version = updates.version;
    if (updates.importance !== undefined) patch.importance = updates.importance;
    if (updates.filterValues !== undefined)
      patch.filterValues = updates.filterValues;
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.metadata !== undefined) patch.metadata = updates.metadata;
    if (updates.status !== undefined) patch.status = updates.status;
    if (Object.keys(patch).length === 0) return eventRegistryId;
    await ctx.db.patch(eventRegistryId, patch);
    return eventRegistryId;
  },
});

export const remove = mutation({
  args: { eventRegistryId: v.id("eventRegistry") },
  returns: vDeletedResult,
  handler: async (ctx, args): Promise<DeletedResult> => {
    await ctx.db.delete(args.eventRegistryId);
    return { deleted: true };
  },
});
