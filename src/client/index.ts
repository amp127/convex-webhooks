// Basic webhooks client - AI functionality removed
export { vEventId, vEventCategoryId } from "../shared.js";
export type {
  Event,
  EventId,
  EventCategoryId,
  Status,
} from "../shared.js";

export class Webhooks {
  constructor(public component: any, public options: any) {}
  
  // Stub methods - functionality removed
  async getOrCreateNamespace() {
    return { eventCategoryId: "", status: "ready" as const };
  }
  
  async getNamespace() {
    return null;
  }
  
  async list() {
    return { page: [], continueCursor: "", isDone: true };
  }
  
  async get() {
    return null;
  }
  
  async delete() {
    // No-op
  }
  
  defineOnComplete() {
    return () => Promise.resolve();
  }
}
