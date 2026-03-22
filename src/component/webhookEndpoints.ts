import type { Id } from "./_generated/dataModel.js";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server.js";
import { withoutSystemFields } from "convex-helpers";
import {
  vWebhookEndpointCreateArgs,
  vWebhookEndpointItem,
  vWebhookEndpointUpdateArgs,
  vDeletedResult,
  vEndpointStatus,
} from "../shared.js";
import type {
  WebhookEndpointItem,
  DeletedResult,
} from "../shared.js";

export const create = mutation({
  args: vWebhookEndpointCreateArgs,
  returns: v.id("webhookEndpoints"),
  handler: async (ctx, args): Promise<Id<"webhookEndpoints">> => {
    return await ctx.db.insert("webhookEndpoints", args);
  },
});

export const get = query({
  args: { endpointId: v.id("webhookEndpoints") },
  returns: v.union(v.null(), vWebhookEndpointItem),
  handler: async (ctx, args): Promise<WebhookEndpointItem | null> => {
    const doc = await ctx.db.get(args.endpointId);
    if (!doc) return null;
    return withoutSystemFields(doc) as WebhookEndpointItem;
  },
});

export const list = query({
  args: {
    status: v.optional(vEndpointStatus),
    appId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(vWebhookEndpointItem),
  handler: async (ctx, args): Promise<WebhookEndpointItem[]> => {
    const limit = args.limit ?? 100;
    if (args.status !== undefined) {
      const docs = await ctx.db
        .query("webhookEndpoints")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
      return docs.map((d) => withoutSystemFields(d) as WebhookEndpointItem);
    }
    if (args.appId !== undefined) {
      const docs = await ctx.db
        .query("webhookEndpoints")
        .withIndex("by_appId", (q) => q.eq("appId", args.appId!))
        .order("desc")
        .take(limit);
      return docs.map((d) => withoutSystemFields(d) as WebhookEndpointItem);
    }
    const docs = await ctx.db
      .query("webhookEndpoints")
      .order("desc")
      .take(limit);
    return docs.map((d) => withoutSystemFields(d) as WebhookEndpointItem);
  },
});

export const listByUrl = query({
  args: { url: v.string() },
  returns: v.array(vWebhookEndpointItem),
  handler: async (ctx, args): Promise<WebhookEndpointItem[]> => {
    const docs = await ctx.db
      .query("webhookEndpoints")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .collect();
    return docs.map((d) => withoutSystemFields(d) as WebhookEndpointItem);
  },
});

export const update = mutation({
  args: vWebhookEndpointUpdateArgs,
  returns: v.union(v.null(), v.id("webhookEndpoints")),
  handler: async (
    ctx,
    args
  ): Promise<Id<"webhookEndpoints"> | null> => {
    const { endpointId, ...updates } = args;
    const doc = await ctx.db.get(endpointId);
    if (!doc) return null;
    const patch: Partial<typeof doc> = {};
    if (updates.url !== undefined) patch.url = updates.url;
    if (updates.description !== undefined)
      patch.description = updates.description;
    if (updates.eventTypes !== undefined) patch.eventTypes = updates.eventTypes;
    if (updates.signingScheme !== undefined)
      patch.signingScheme = updates.signingScheme;
    if (updates.secret !== undefined) patch.secret = updates.secret;
    if (updates.rotatingSecret !== undefined)
      patch.rotatingSecret = updates.rotatingSecret;
    if (updates.rotationExpiresAt !== undefined)
      patch.rotationExpiresAt = updates.rotationExpiresAt;
    if (updates.privateKey !== undefined) patch.privateKey = updates.privateKey;
    if (updates.publicKey !== undefined) patch.publicKey = updates.publicKey;
    if (updates.rotatingPrivateKey !== undefined)
      patch.rotatingPrivateKey = updates.rotatingPrivateKey;
    if (updates.rotatingPublicKey !== undefined)
      patch.rotatingPublicKey = updates.rotatingPublicKey;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.disabledReason !== undefined)
      patch.disabledReason = updates.disabledReason;
    if (updates.disabledAt !== undefined)
      patch.disabledAt = updates.disabledAt;
    if (updates.httpsOnly !== undefined) patch.httpsOnly = updates.httpsOnly;
    if (updates.rateLimitPerMinute !== undefined)
      patch.rateLimitPerMinute = updates.rateLimitPerMinute;
    if (updates.appId !== undefined) patch.appId = updates.appId;
    if (updates.metadata !== undefined) patch.metadata = updates.metadata;
    if (Object.keys(patch).length === 0) return endpointId;
    await ctx.db.patch(endpointId, patch);
    return endpointId;
  },
});

export const remove = mutation({
  args: { endpointId: v.id("webhookEndpoints") },
  returns: vDeletedResult,
  handler: async (ctx, args): Promise<DeletedResult> => {
    await ctx.db.delete(args.endpointId);
    return { deleted: true };
  },
});
