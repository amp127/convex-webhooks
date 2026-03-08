import { v } from "convex/values";
import type { Infer } from "convex/values";
import { brandedString } from "convex-helpers/validators";

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
