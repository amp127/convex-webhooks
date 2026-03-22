import { defineSchema, defineTable } from "convex/server";
import { typedV } from "convex-helpers/validators";
import {
  eventCategoryFields,
  eventRegistryFields,
  webhookEventFields,
  webhookEndpointFields,
  webhookDeliveryFields,
  deliveryAttemptFields,
  vEventStatus,
  vDeliveryState,
  vEndpointStatus,
  vSigningScheme,
  vStatusWithOnComplete,
} from "../shared.js";
import type { StatusWithOnComplete } from "../shared.js";

export { vEventStatus, vDeliveryState, vEndpointStatus, vSigningScheme, vStatusWithOnComplete };
export type { StatusWithOnComplete };

export const schema = defineSchema({
  /**
   * Available event categories (kept per user request).
   */
  eventCategories: defineTable(eventCategoryFields)
    .index("categoryName", ["categoryName"])
    .index("by_tenantId", ["tenantId"]),

  eventRegistry: defineTable(eventRegistryFields)
    .index("eventName", ["eventName"])
    .index("by_tenantId", ["tenantId"])
    .index("by_status", ["status"]),

  /**
   * Persisted outbound event before delivery (O-REL-1). Payload shape per O-PAY-1.
   */
  webhookEvents: defineTable(webhookEventFields)
    .index("by_webhookId", ["webhookId"])
    .index("by_eventType", ["eventType"])
    .index("by_idempotencyKey", ["idempotencyKey"]),

  /**
   * Registered webhook endpoints (OBJECTIVES: signing, rotation, status, HTTPS).
   */
  webhookEndpoints: defineTable(webhookEndpointFields)
    .index("by_status", ["status"])
    .index("by_appId", ["appId"])
    .index("by_url", ["url"]),

  /**
   * Per-endpoint delivery record (one per event × endpoint). States per README.
   */
  webhookDeliveries: defineTable(webhookDeliveryFields)
    .index("by_endpointId", ["endpointId"])
    .index("by_eventId", ["eventId"])
    .index("by_state", ["state"])
    .index("by_nextAttemptAt", ["nextAttemptAt"])
    .index("by_endpointId_and_state", ["endpointId", "state"]),

  /**
   * Per-attempt log (O-OPS-3): timestamp, HTTP status, truncated response, retry count.
   */
  deliveryAttempts: defineTable(deliveryAttemptFields)
    .index("by_deliveryId", ["deliveryId"])
    .index("by_endpointId", ["endpointId"]),
});

export const vv = typedV(schema);
export { vv as v };

export default schema;
