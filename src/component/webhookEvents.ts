import type { Id } from "./_generated/dataModel.js";
import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server.js";
import { withoutSystemFields } from "convex-helpers";
import {
  vWebhookEventCreateArgs,
  vWebhookEventItem,
  vCreateEventAndDeliveriesArgs,
  vCreateEventAndDeliveriesResult,
  vCreateEventAndDeliveryArgs,
  vCreateEventAndDeliveryResult,
  vDeletedResult,
} from "../shared.js";
import type {
  WebhookEventItem,
  CreateEventAndDeliveriesResult,
  CreateEventAndDeliveryResult,
  DeletedResult,
} from "../shared.js";

export const create = mutation({
  args: vWebhookEventCreateArgs,
  returns: v.id("webhookEvents"),
  handler: async (ctx, args): Promise<Id<"webhookEvents">> => {
    return await ctx.db.insert("webhookEvents", args);
  },
});

export const get = query({
  args: { eventId: v.id("webhookEvents") },
  returns: v.union(v.null(), vWebhookEventItem),
  handler: async (ctx, args): Promise<WebhookEventItem | null> => {
    const doc = await ctx.db.get(args.eventId);
    if (!doc) return null;
    return withoutSystemFields(doc) as WebhookEventItem;
  },
});

export const list = query({
  args: {
    webhookId: v.optional(v.string()),
    eventType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(vWebhookEventItem),
  handler: async (ctx, args): Promise<WebhookEventItem[]> => {
    const limit = args.limit ?? 100;
    if (args.webhookId !== undefined) {
      const docs = await ctx.db
        .query("webhookEvents")
        .withIndex("by_webhookId", (q) => q.eq("webhookId", args.webhookId!))
        .order("desc")
        .take(limit);
      return docs.map((d) => withoutSystemFields(d) as WebhookEventItem);
    }
    if (args.eventType !== undefined) {
      const docs = await ctx.db
        .query("webhookEvents")
        .withIndex("by_eventType", (q) => q.eq("eventType", args.eventType!))
        .order("desc")
        .take(limit);
      return docs.map((d) => withoutSystemFields(d) as WebhookEventItem);
    }
    const docs = await ctx.db
      .query("webhookEvents")
      .order("desc")
      .take(limit);
    return docs.map((d) => withoutSystemFields(d) as WebhookEventItem);
  },
});

export const listByIdempotencyKey = query({
  args: { idempotencyKey: v.string() },
  returns: v.array(vWebhookEventItem),
  handler: async (ctx, args): Promise<WebhookEventItem[]> => {
    const docs = await ctx.db
      .query("webhookEvents")
      .withIndex("by_idempotencyKey", (q) =>
        q.eq("idempotencyKey", args.idempotencyKey)
      )
      .collect();
    return docs.map((d) => withoutSystemFields(d) as WebhookEventItem);
  },
});

export const remove = mutation({
  args: { eventId: v.id("webhookEvents") },
  returns: vDeletedResult,
  handler: async (ctx, args): Promise<DeletedResult> => {
    await ctx.db.delete(args.eventId);
    return { deleted: true };
  },
});

/** Default max delivery attempts per delivery (O-REL-2). */
const DEFAULT_MAX_ATTEMPTS = 10;

/**
 * Creates a webhook event and one webhookDelivery per active endpoint
 * subscribed to the event type. Returns { eventId, deliveryIds } so the host
 * can enqueue processDelivery(deliveryId) for each via workpool.
 */
export const createEventAndDeliveries = internalMutation({
  args: vCreateEventAndDeliveriesArgs,
  returns: vCreateEventAndDeliveriesResult,
  handler: async (
    ctx,
    args
  ): Promise<CreateEventAndDeliveriesResult> => {
    const maxAttempts = args.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    const eventId = await ctx.db.insert("webhookEvents", {
      webhookId: args.webhookId,
      eventType: args.eventType,
      timestamp: args.timestamp,
      data: args.data,
      payload: args.payload,
      idempotencyKey: args.idempotencyKey,
    });

    const deliveryIds: Id<"webhookDeliveries">[] = [];
    const endpoints = await ctx.db
      .query("webhookEndpoints")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    for (const ep of endpoints) {
      if (!ep.eventTypes.includes(args.eventType)) continue;
      const deliveryId = await ctx.db.insert("webhookDeliveries", {
        eventId,
        endpointId: ep._id,
        webhookId: args.webhookId,
        state: "pending",
        maxAttempts,
        attemptCount: 0,
      });
      deliveryIds.push(deliveryId);
    }

    return { eventId, deliveryIds };
  },
});

/** Max payload size (bytes) per O-PAY-3; warn/reject oversized. */
const MAX_PAYLOAD_BYTES = 20 * 1024;

/**
 * Creates one webhook event and one delivery for a single endpoint.
 * Used by managed sendWebhook. Idempotent when idempotencyKey is set:
 * same (idempotencyKey, endpointId) returns existing (eventId, deliveryId).
 */
export const createEventAndDelivery = internalMutation({
  args: vCreateEventAndDeliveryArgs,
  returns: vCreateEventAndDeliveryResult,
  handler: async (
    ctx,
    args
  ): Promise<CreateEventAndDeliveryResult> => {
    const endpoint = await ctx.db.get(args.endpointId);
    if (!endpoint || endpoint.status !== "active") {
      throw new Error("Endpoint not found or not active");
    }
    if (!endpoint.eventTypes.includes(args.eventType)) {
      throw new Error(
        `Endpoint does not subscribe to event type: ${args.eventType}`
      );
    }
    const payloadBytes = new TextEncoder().encode(args.payload).length;
    if (payloadBytes > MAX_PAYLOAD_BYTES) {
      throw new Error(
        `Payload size ${payloadBytes} exceeds max ${MAX_PAYLOAD_BYTES} bytes (O-PAY-3)`
      );
    }

    const maxAttempts = args.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

    if (args.idempotencyKey !== undefined && args.idempotencyKey !== "") {
      const existingEvents = await ctx.db
        .query("webhookEvents")
        .withIndex("by_idempotencyKey", (q) =>
          q.eq("idempotencyKey", args.idempotencyKey!)
        )
        .collect();
      for (const ev of existingEvents) {
        const deliveries = await ctx.db
          .query("webhookDeliveries")
          .withIndex("by_eventId", (q) => q.eq("eventId", ev._id))
          .collect();
        const delivery = deliveries.find((d) => d.endpointId === args.endpointId);
        if (delivery) {
          return { eventId: ev._id, deliveryId: delivery._id };
        }
      }
    }

    const eventId = await ctx.db.insert("webhookEvents", {
      webhookId: args.webhookId,
      eventType: args.eventType,
      timestamp: args.timestamp,
      data: args.data,
      payload: args.payload,
      idempotencyKey: args.idempotencyKey,
    });
    const deliveryId = await ctx.db.insert("webhookDeliveries", {
      eventId,
      endpointId: args.endpointId,
      webhookId: args.webhookId,
      state: "pending",
      maxAttempts,
      attemptCount: 0,
    });
    return { eventId, deliveryId };
  },
});
