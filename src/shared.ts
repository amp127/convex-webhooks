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
export const vFilterValue = v.object({
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

// ─── Return validators (public API items; no _id / _creationTime) ───────────
// Reuse doc validators as item shapes for get/list returns.
export const vEventCategoryItem = vEventCategoryDoc;
export type EventCategoryItem = Infer<typeof vEventCategoryItem>;

export const vEventRegistryItem = vEventRegistryDoc;
export type EventRegistryItem = Infer<typeof vEventRegistryItem>;

export const vWebhookEventItem = vWebhookEventDoc;
export type WebhookEventItem = Infer<typeof vWebhookEventItem>;

export const vWebhookEndpointItem = vWebhookEndpointDoc;
export type WebhookEndpointItem = Infer<typeof vWebhookEndpointItem>;

export const vWebhookDeliveryItem = vWebhookDeliveryDoc;
export type WebhookDeliveryItem = Infer<typeof vWebhookDeliveryItem>;

export const vDeliveryAttemptItem = vDeliveryAttemptDoc;
export type DeliveryAttemptItem = Infer<typeof vDeliveryAttemptItem>;

// ─── Common return shapes ──────────────────────────────────────────────────
export const vDeletedResult = v.object({ deleted: v.boolean() });
export type DeletedResult = Infer<typeof vDeletedResult>;

// ─── Create / update args (reused in component functions) ───────────────────
export const vEventCategoryCreateArgs = v.object(eventCategoryFields);
export type EventCategoryCreateArgs = Infer<typeof vEventCategoryCreateArgs>;

export const vEventCategoryUpdateArgs = v.object({
  eventCategoryId: v.id("eventCategories"),
  tenantId: v.optional(v.string()),
  categoryName: v.optional(v.string()),
  categoryString: v.optional(v.string()),
});
export type EventCategoryUpdateArgs = Infer<typeof vEventCategoryUpdateArgs>;

export const vEventRegistryCreateArgs = v.object(eventRegistryFields);
export type EventRegistryCreateArgs = Infer<typeof vEventRegistryCreateArgs>;

export const vEventRegistryUpdateArgs = v.object({
  eventRegistryId: v.id("eventRegistry"),
  tenantId: v.optional(v.string()),
  eventName: v.optional(v.string()),
  eventString: v.optional(v.string()),
  version: v.optional(v.number()),
  importance: v.optional(v.number()),
  filterValues: v.optional(v.array(vFilterValue)),
  title: v.optional(v.string()),
  metadata: v.optional(v.record(v.string(), v.any())),
  status: v.optional(vEventStatus),
});
export type EventRegistryUpdateArgs = Infer<typeof vEventRegistryUpdateArgs>;

export const vWebhookEventCreateArgs = v.object(webhookEventFields);
export type WebhookEventCreateArgs = Infer<typeof vWebhookEventCreateArgs>;

export const vCreateEventAndDeliveriesArgs = v.object({
  webhookId: v.string(),
  eventType: v.string(),
  timestamp: v.string(),
  data: v.any(),
  payload: v.string(),
  idempotencyKey: v.optional(v.string()),
  maxAttempts: v.optional(v.number()),
});
export type CreateEventAndDeliveriesArgs = Infer<
  typeof vCreateEventAndDeliveriesArgs
>;

export const vCreateEventAndDeliveriesResult = v.object({
  eventId: v.id("webhookEvents"),
  deliveryIds: v.array(v.id("webhookDeliveries")),
});
export type CreateEventAndDeliveriesResult = Infer<
  typeof vCreateEventAndDeliveriesResult
>;

export const vWebhookEndpointCreateArgs = v.object(webhookEndpointFields);
export type WebhookEndpointCreateArgs = Infer<typeof vWebhookEndpointCreateArgs>;

export const vWebhookEndpointUpdateArgs = v.object({
  endpointId: v.id("webhookEndpoints"),
  url: v.optional(v.string()),
  description: v.optional(v.string()),
  eventTypes: v.optional(v.array(v.string())),
  signingScheme: v.optional(vSigningScheme),
  secret: v.optional(v.string()),
  rotatingSecret: v.optional(v.string()),
  rotationExpiresAt: v.optional(v.number()),
  privateKey: v.optional(v.string()),
  publicKey: v.optional(v.string()),
  rotatingPrivateKey: v.optional(v.string()),
  rotatingPublicKey: v.optional(v.string()),
  status: v.optional(vEndpointStatus),
  disabledReason: v.optional(v.string()),
  disabledAt: v.optional(v.number()),
  httpsOnly: v.optional(v.boolean()),
  rateLimitPerMinute: v.optional(v.number()),
  appId: v.optional(v.string()),
  metadata: v.optional(v.record(v.string(), v.any())),
});
export type WebhookEndpointUpdateArgs = Infer<typeof vWebhookEndpointUpdateArgs>;

export const vWebhookDeliveryCreateArgs = v.object(webhookDeliveryFields);
export type WebhookDeliveryCreateArgs = Infer<typeof vWebhookDeliveryCreateArgs>;

export const vDeliveryAttemptAddArgs = v.object(deliveryAttemptFields);
export type DeliveryAttemptAddArgs = Infer<typeof vDeliveryAttemptAddArgs>;

export const vDeliveryAttemptUpdateArgs = v.object({
  attemptId: v.id("deliveryAttempts"),
  responseStatus: v.optional(v.number()),
  responseBody: v.optional(v.string()),
  durationMs: v.optional(v.number()),
  error: v.optional(v.string()),
  success: v.optional(v.boolean()),
});
export type DeliveryAttemptUpdateArgs = Infer<typeof vDeliveryAttemptUpdateArgs>;

export const vScheduleRetryArgs = v.object({
  deliveryId: v.id("webhookDeliveries"),
  nextAttemptAt: v.number(),
  error: v.optional(v.string()),
});
export type ScheduleRetryArgs = Infer<typeof vScheduleRetryArgs>;

export const vMarkFailedArgs = v.object({
  deliveryId: v.id("webhookDeliveries"),
  error: v.optional(v.string()),
});
export type MarkFailedArgs = Infer<typeof vMarkFailedArgs>;

/** Result of getDeliveryForProcessing: event + endpoint + delivery metadata for POST/signing. */
export const vGetDeliveryForProcessingResult = v.object({
  event: v.object({
    payload: v.string(),
    eventType: v.string(),
    timestamp: v.string(),
    data: v.any(),
  }),
  endpoint: v.object({
    url: v.string(),
    signingScheme: vSigningScheme,
    secret: v.optional(v.string()),
    publicKey: v.optional(v.string()),
    privateKey: v.optional(v.string()),
    rotatingSecret: v.optional(v.string()),
    rotatingPrivateKey: v.optional(v.string()),
    rotationExpiresAt: v.optional(v.number()),
  }),
  delivery: v.object({
    deliveryId: v.id("webhookDeliveries"),
    endpointId: v.id("webhookEndpoints"),
    attemptCount: v.number(),
    maxAttempts: v.number(),
  }),
});

// ─── sendWebhook: progressive enhancement (simple vs managed) ─────────────────
export const vSendWebhookSimpleArgs = v.object({
  kind: v.literal("simple"),
  url: v.string(),
  payload: v.any(),
  headers: v.optional(v.record(v.string(), v.string())),
});
export type SendWebhookSimpleArgs = Infer<typeof vSendWebhookSimpleArgs>;

export const vSendWebhookManagedArgs = v.object({
  kind: v.literal("managed"),
  endpointId: v.id("webhookEndpoints"),
  webhookId: v.optional(v.string()),
  eventType: v.string(),
  data: v.any(),
  idempotencyKey: v.optional(v.string()),
  headers: v.optional(v.record(v.string(), v.string())),
  maxAttempts: v.optional(v.number()),
});
export type SendWebhookManagedArgs = Infer<typeof vSendWebhookManagedArgs>;

export const vSendWebhookArgs = v.union(
  vSendWebhookSimpleArgs,
  vSendWebhookManagedArgs
);
export type SendWebhookArgs = Infer<typeof vSendWebhookArgs>;

export const vSendWebhookResult = v.object({
  deliveryId: v.optional(v.id("webhookDeliveries")),
  eventId: v.optional(v.id("webhookEvents")),
  status: v.string(),
  estimatedAt: v.optional(v.number()),
});
export type SendWebhookResult = Infer<typeof vSendWebhookResult>;

/** Single-endpoint event + delivery creation (for managed sendWebhook). */
export const vCreateEventAndDeliveryArgs = v.object({
  endpointId: v.id("webhookEndpoints"),
  webhookId: v.string(),
  eventType: v.string(),
  timestamp: v.string(),
  data: v.any(),
  payload: v.string(),
  idempotencyKey: v.optional(v.string()),
  maxAttempts: v.optional(v.number()),
});
export type CreateEventAndDeliveryArgs = Infer<
  typeof vCreateEventAndDeliveryArgs
>;

export const vCreateEventAndDeliveryResult = v.object({
  eventId: v.id("webhookEvents"),
  deliveryId: v.id("webhookDeliveries"),
});
export type CreateEventAndDeliveryResult = Infer<
  typeof vCreateEventAndDeliveryResult
>;

export const vScheduleDeliveryArgs = v.object({
  deliveryId: v.id("webhookDeliveries"),
});
export type ScheduleDeliveryArgs = Infer<typeof vScheduleDeliveryArgs>;
export type GetDeliveryForProcessingResult = Infer<
  typeof vGetDeliveryForProcessingResult
>;
