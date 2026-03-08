import { v } from "convex/values";
import type { Infer } from "convex/values";
import { brandedString, literals } from "convex-helpers/validators";

// Branded types for IDs, as components don't expose the internal ID types.
export const vEventCategoryId = brandedString("EventCategoryId");
export const vEventId = brandedString("EventId");
export type EventCategoryId = Infer<typeof vEventCategoryId>;
export type EventId = Infer<typeof vEventId>;

export const vStatus = v.union(
  v.literal("pending"),
  v.literal("ready"),
  v.literal("replaced"),
);
export const vActiveStatus = v.union(v.literal("pending"), v.literal("ready"));
export type Status = Infer<typeof vStatus>;
export const statuses = vStatus.members.map((s) => s.value);

/** Minimal event type for client compatibility. */
export const vEvent = v.object({
  eventId: vEventId,
  status: vStatus,
  key: v.optional(v.string()),
  title: v.optional(v.string()),
  metadata: v.optional(v.record(v.string(), v.any())),
  replacedAt: v.optional(v.number()),
});

export type Event = Infer<typeof vEvent>;

// ─── Shared enums used by schema tables ─────────────────────────────────────
export const vEventStatus = literals("Enabled", "Disabled", "Paused");
export const vDeliveryState = literals(
  "pending",
  "delivering",
  "delivered",
  "retrying",
  "failed"
);
export const vEndpointStatus = literals("active", "disabled", "paused");
export const vSigningScheme = literals("v1", "v1a");

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
  })
);
export type StatusWithOnComplete = Infer<typeof vStatusWithOnComplete>;

// ─── Table document validators (no _id / _creationTime) ─────────────────────
const vFilterValue = v.object({
  name: v.string(),
  value: v.any(),
});

export const eventCategoryFields = {
  tenantId: v.string(),
  categoryName: v.string(),
  categoryString: v.string(),
} as const;
export const vEventCategoryDoc = v.object(eventCategoryFields);
export type EventCategoryDoc = Infer<typeof vEventCategoryDoc>;

export const eventRegistryFields = {
  tenantId: v.string(),
  eventName: v.string(),
  eventString: v.string(),
  version: v.number(),
  importance: v.number(),
  filterValues: v.array(vFilterValue),
  title: v.optional(v.string()),
  metadata: v.optional(v.record(v.string(), v.any())),
  status: vEventStatus,
} as const;
export const vEventRegistryDoc = v.object(eventRegistryFields);
export type EventRegistryDoc = Infer<typeof vEventRegistryDoc>;

export const webhookEventFields = {
  webhookId: v.string(),
  eventType: v.string(),
  timestamp: v.string(),
  data: v.any(),
  payload: v.string(),
  idempotencyKey: v.optional(v.string()),
} as const;
export const vWebhookEventDoc = v.object(webhookEventFields);
export type WebhookEventDoc = Infer<typeof vWebhookEventDoc>;

export const webhookEndpointFields = {
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
} as const;
export const vWebhookEndpointDoc = v.object(webhookEndpointFields);
export type WebhookEndpointDoc = Infer<typeof vWebhookEndpointDoc>;

export const webhookDeliveryFields = {
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
} as const;
export const vWebhookDeliveryDoc = v.object(webhookDeliveryFields);
export type WebhookDeliveryDoc = Infer<typeof vWebhookDeliveryDoc>;

export const deliveryAttemptFields = {
  deliveryId: v.id("webhookDeliveries"),
  endpointId: v.id("webhookEndpoints"),
  attemptNumber: v.number(),
  requestTimestamp: v.number(),
  responseStatus: v.optional(v.number()),
  responseBody: v.optional(v.string()),
  durationMs: v.optional(v.number()),
  error: v.optional(v.string()),
  success: v.boolean(),
} as const;
export const vDeliveryAttemptDoc = v.object(deliveryAttemptFields);
export type DeliveryAttemptDoc = Infer<typeof vDeliveryAttemptDoc>;
