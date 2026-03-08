import { defineSchema, defineTable } from "convex/server";
import { v, type Infer } from "convex/values";
import { literals, typedV } from "convex-helpers/validators";

export const vStatusWithOnComplete = v.union(
  v.object({
    kind: v.literal("pending"),
    onComplete: v.optional(v.string()),
  }),
  v.object({
    kind: v.literal("ready"),
  }),
  v.object({
    kind: v.literal("replaced"),
    replacedAt: v.number(),
  }),
);

export const vEventStatus = literals("Enabled", "Disabled", "Paused");

/** Delivery lifecycle states (README / OBJECTIVES). */
export const vDeliveryState = literals(
  "pending",
  "delivering",
  "delivered",
  "retrying",
  "failed"
);

/** Endpoint status (O-REL-7: auto-disable). */
export const vEndpointStatus = literals("active", "disabled", "paused");

/** Signing scheme: v1 = HMAC-SHA256, v1a = ed25519 (O-SEC-1, O-INT-2). */
export const vSigningScheme = literals("v1", "v1a");

export type StatusWithOnComplete = Infer<typeof vStatusWithOnComplete>;

export const schema = defineSchema({
  /**
   * Available event categories (kept per user request).
   */
  eventCategories: defineTable({
    tenantId: v.string(),
    categoryName: v.string(),
    categoryString: v.string(),
  })
    .index("categoryName", ["categoryName"])
    .index("by_tenantId", ["tenantId"]),

  eventRegistry: defineTable({
    tenantId: v.string(),
    eventName: v.string(),
    eventString: v.string(),
    version: v.number(),
    importance: v.number(),
    filterValues: v.array(
      v.object({
        name: v.string(),
        value: v.any(),
      })
    ),
    title: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
    status: vEventStatus,
  }).index("eventName", ["eventName"]),

  /**
   * Persisted outbound event before delivery (O-REL-1). Payload shape per O-PAY-1.
   */
  webhookEvents: defineTable({
    webhookId: v.string(),
    eventType: v.string(),
    timestamp: v.string(),
    data: v.any(),
    payload: v.string(),
    idempotencyKey: v.optional(v.string()),
  })
    .index("by_webhookId", ["webhookId"])
    .index("by_eventType", ["eventType"])
    .index("by_idempotencyKey", ["idempotencyKey"]),

  /**
   * Registered webhook endpoints (OBJECTIVES: signing, rotation, status, HTTPS).
   */
  webhookEndpoints: defineTable({
    url: v.string(),
    description: v.optional(v.string()),
    eventTypes: v.array(v.string()),
    signingScheme: vSigningScheme,
    secret: v.optional(v.string()),
    rotatingSecret: v.optional(v.string()),
    rotationExpiresAt: v.optional(v.number()),
    privateKey: v.optional(v.string()),
    publicKey: v.optional(v.string()),
    rotatingPrivateKey: v.optional(v.string()),
    rotatingPublicKey: v.optional(v.string()),
    status: vEndpointStatus,
    disabledReason: v.optional(v.string()),
    disabledAt: v.optional(v.number()),
    httpsOnly: v.boolean(),
    rateLimitPerMinute: v.optional(v.number()),
    appId: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_status", ["status"])
    .index("by_appId", ["appId"])
    .index("by_url", ["url"]),

  /**
   * Per-endpoint delivery record (one per event × endpoint). States per README.
   */
  webhookDeliveries: defineTable({
    eventId: v.id("webhookEvents"),
    endpointId: v.id("webhookEndpoints"),
    webhookId: v.string(),
    state: vDeliveryState,
    maxAttempts: v.number(),
    attemptCount: v.number(),
    nextAttemptAt: v.optional(v.number()),
    lastAttemptAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    isReplay: v.optional(v.boolean()),
    originalDeliveryId: v.optional(v.id("webhookDeliveries")),
  })
    .index("by_endpointId", ["endpointId"])
    .index("by_eventId", ["eventId"])
    .index("by_state", ["state"])
    .index("by_nextAttemptAt", ["nextAttemptAt"])
    .index("by_endpointId_and_state", ["endpointId", "state"]),

  /**
   * Per-attempt log (O-OPS-3): timestamp, HTTP status, truncated response, retry count.
   */
  deliveryAttempts: defineTable({
    deliveryId: v.id("webhookDeliveries"),
    endpointId: v.id("webhookEndpoints"),
    attemptNumber: v.number(),
    requestTimestamp: v.number(),
    responseStatus: v.optional(v.number()),
    responseBody: v.optional(v.string()),
    durationMs: v.optional(v.number()),
    error: v.optional(v.string()),
    success: v.boolean(),
  })
    .index("by_deliveryId", ["deliveryId"])
    .index("by_endpointId", ["endpointId"]),
});

export const vv = typedV(schema);
export { vv as v };

export default schema;
