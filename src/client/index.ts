import type { FunctionReference } from "convex/server";
import type { ComponentApi } from "../component/_generated/component.js";
import type { Id } from "../component/_generated/dataModel.js";
import type {
  SendWebhookArgs,
  SendWebhookResult,
} from "../shared.js";
import {
  vSendWebhookArgs,
  vSendWebhookResult,
  vEventId,
  vEventCategoryId,
} from "../shared.js";
import type {
  RunActionCtx,
  RunMutationCtx,
  RunQueryCtx,
} from "./utils.js";

export { vEventId, vEventCategoryId, vSendWebhookArgs, vSendWebhookResult };
export type {
  Event,
  EventId,
  EventCategoryId,
  Status,
  SendWebhookArgs,
  SendWebhookResult,
} from "../shared.js";
export type { RunActionCtx, RunMutationCtx, RunQueryCtx } from "./utils.js";

/**
 * Component handle from the app, e.g. `components.webhooks` in `./_generated/api`.
 * `actions` is included at runtime; typings are merged here because generated
 * `ComponentApi` may omit action modules.
 */
export type WebhooksComponent = ComponentApi & {
  actions: {
    sendWebhook: FunctionReference<
      "action",
      "internal",
      { spec: SendWebhookArgs },
      SendWebhookResult
    >;
    processDelivery: FunctionReference<
      "action",
      "internal",
      { deliveryId: Id<"webhookDeliveries"> },
      null
    >;
  };
};

/** Reserved for future client-side defaults; delivery/signing live on endpoints and mutations. */
export type WebhooksOptions = object;

type RefQuery<P extends keyof WebhooksComponent, K extends keyof WebhooksComponent[P]> =
  WebhooksComponent[P][K] extends FunctionReference<"query", infer _V, infer Args, infer Ret>
    ? { args: Args; ret: Ret }
    : never;

type RefMutation<P extends keyof WebhooksComponent, K extends keyof WebhooksComponent[P]> =
  WebhooksComponent[P][K] extends FunctionReference<"mutation", infer _V, infer Args, infer Ret>
    ? { args: Args; ret: Ret }
    : never;

/**
 * Client for the webhooks Convex component. Instantiate with your app’s
 * `components.webhooks` reference (see `WebhooksComponent`).
 *
 * Pattern mirrors [@convex-dev/workpool](https://github.com/get-convex/workpool/blob/main/src/client/index.ts):
 * each method takes a Convex `ctx` that can `runQuery` / `runMutation` / `runAction`,
 * plus the same arguments as the underlying component function.
 */
export class Webhooks {
  constructor(
    public component: WebhooksComponent,
    public options: WebhooksOptions = {},
  ) {}

  // ─── Actions ─────────────────────────────────────────────────────────────

  /**
   * Send a webhook: `simple` (one-shot POST) or `managed` (persisted delivery +
   * Standard Webhooks signing via the component).
   */
  async sendWebhook(
    ctx: RunActionCtx,
    spec: SendWebhookArgs,
  ): Promise<SendWebhookResult> {
    return ctx.runAction(this.component.actions.sendWebhook, { spec });
  }

  /**
   * Process a single stored delivery (sign, POST, retries). Normally scheduled
   * by the component; exposed for custom workers or testing.
   */
  async processDelivery(
    ctx: RunActionCtx,
    args: { deliveryId: Id<"webhookDeliveries"> },
  ): Promise<null> {
    return ctx.runAction(this.component.actions.processDelivery, args);
  }

  // ─── Webhook endpoints ─────────────────────────────────────────────────────

  async createEndpoint(
    ctx: RunMutationCtx,
    args: RefMutation<"webhookEndpoints", "create">["args"],
  ): Promise<RefMutation<"webhookEndpoints", "create">["ret"]> {
    return ctx.runMutation(this.component.webhookEndpoints.create, args);
  }

  async getEndpoint(
    ctx: RunQueryCtx,
    args: RefQuery<"webhookEndpoints", "get">["args"],
  ): Promise<RefQuery<"webhookEndpoints", "get">["ret"]> {
    return ctx.runQuery(this.component.webhookEndpoints.get, args);
  }

  async listEndpoints(
    ctx: RunQueryCtx,
    args: RefQuery<"webhookEndpoints", "list">["args"],
  ): Promise<RefQuery<"webhookEndpoints", "list">["ret"]> {
    return ctx.runQuery(this.component.webhookEndpoints.list, args);
  }

  async listEndpointsByUrl(
    ctx: RunQueryCtx,
    args: RefQuery<"webhookEndpoints", "listByUrl">["args"],
  ): Promise<RefQuery<"webhookEndpoints", "listByUrl">["ret"]> {
    return ctx.runQuery(this.component.webhookEndpoints.listByUrl, args);
  }

  async updateEndpoint(
    ctx: RunMutationCtx,
    args: RefMutation<"webhookEndpoints", "update">["args"],
  ): Promise<RefMutation<"webhookEndpoints", "update">["ret"]> {
    return ctx.runMutation(this.component.webhookEndpoints.update, args);
  }

  async removeEndpoint(
    ctx: RunMutationCtx,
    args: RefMutation<"webhookEndpoints", "remove">["args"],
  ): Promise<RefMutation<"webhookEndpoints", "remove">["ret"]> {
    return ctx.runMutation(this.component.webhookEndpoints.remove, args);
  }

  // ─── Webhook events ────────────────────────────────────────────────────────

  async createWebhookEvent(
    ctx: RunMutationCtx,
    args: RefMutation<"webhookEvents", "create">["args"],
  ): Promise<RefMutation<"webhookEvents", "create">["ret"]> {
    return ctx.runMutation(this.component.webhookEvents.create, args);
  }

  async getWebhookEvent(
    ctx: RunQueryCtx,
    args: RefQuery<"webhookEvents", "get">["args"],
  ): Promise<RefQuery<"webhookEvents", "get">["ret"]> {
    return ctx.runQuery(this.component.webhookEvents.get, args);
  }

  async listWebhookEvents(
    ctx: RunQueryCtx,
    args: RefQuery<"webhookEvents", "list">["args"],
  ): Promise<RefQuery<"webhookEvents", "list">["ret"]> {
    return ctx.runQuery(this.component.webhookEvents.list, args);
  }

  async listWebhookEventsByIdempotencyKey(
    ctx: RunQueryCtx,
    args: RefQuery<"webhookEvents", "listByIdempotencyKey">["args"],
  ): Promise<RefQuery<"webhookEvents", "listByIdempotencyKey">["ret"]> {
    return ctx.runQuery(
      this.component.webhookEvents.listByIdempotencyKey,
      args,
    );
  }

  async removeWebhookEvent(
    ctx: RunMutationCtx,
    args: RefMutation<"webhookEvents", "remove">["args"],
  ): Promise<RefMutation<"webhookEvents", "remove">["ret"]> {
    return ctx.runMutation(this.component.webhookEvents.remove, args);
  }

  // ─── Deliveries ────────────────────────────────────────────────────────────

  async getDelivery(
    ctx: RunQueryCtx,
    args: RefQuery<"webhookDeliveries", "get">["args"],
  ): Promise<RefQuery<"webhookDeliveries", "get">["ret"]> {
    return ctx.runQuery(this.component.webhookDeliveries.get, args);
  }

  async listDeliveries(
    ctx: RunQueryCtx,
    args: RefQuery<"webhookDeliveries", "list">["args"],
  ): Promise<RefQuery<"webhookDeliveries", "list">["ret"]> {
    return ctx.runQuery(this.component.webhookDeliveries.list, args);
  }

  async listPendingDeliveries(
    ctx: RunQueryCtx,
    args: RefQuery<"webhookDeliveries", "listPendingForWorker">["args"],
  ): Promise<RefQuery<"webhookDeliveries", "listPendingForWorker">["ret"]> {
    return ctx.runQuery(
      this.component.webhookDeliveries.listPendingForWorker,
      args,
    );
  }

  async markDeliveryDelivered(
    ctx: RunMutationCtx,
    args: RefMutation<"webhookDeliveries", "markDelivered">["args"],
  ): Promise<RefMutation<"webhookDeliveries", "markDelivered">["ret"]> {
    return ctx.runMutation(this.component.webhookDeliveries.markDelivered, args);
  }

  async markDeliveryFailed(
    ctx: RunMutationCtx,
    args: RefMutation<"webhookDeliveries", "markFailed">["args"],
  ): Promise<RefMutation<"webhookDeliveries", "markFailed">["ret"]> {
    return ctx.runMutation(this.component.webhookDeliveries.markFailed, args);
  }

  async scheduleDeliveryRetry(
    ctx: RunMutationCtx,
    args: RefMutation<"webhookDeliveries", "scheduleRetry">["args"],
  ): Promise<RefMutation<"webhookDeliveries", "scheduleRetry">["ret"]> {
    return ctx.runMutation(this.component.webhookDeliveries.scheduleRetry, args);
  }

  async removeDelivery(
    ctx: RunMutationCtx,
    args: RefMutation<"webhookDeliveries", "remove">["args"],
  ): Promise<RefMutation<"webhookDeliveries", "remove">["ret"]> {
    return ctx.runMutation(this.component.webhookDeliveries.remove, args);
  }

  // ─── Delivery attempts ─────────────────────────────────────────────────────

  async addDeliveryAttempt(
    ctx: RunMutationCtx,
    args: RefMutation<"deliveryAttempts", "add">["args"],
  ): Promise<RefMutation<"deliveryAttempts", "add">["ret"]> {
    return ctx.runMutation(this.component.deliveryAttempts.add, args);
  }

  async getDeliveryAttempt(
    ctx: RunQueryCtx,
    args: RefQuery<"deliveryAttempts", "get">["args"],
  ): Promise<RefQuery<"deliveryAttempts", "get">["ret"]> {
    return ctx.runQuery(this.component.deliveryAttempts.get, args);
  }

  async listDeliveryAttemptsByDelivery(
    ctx: RunQueryCtx,
    args: RefQuery<"deliveryAttempts", "listByDelivery">["args"],
  ): Promise<RefQuery<"deliveryAttempts", "listByDelivery">["ret"]> {
    return ctx.runQuery(this.component.deliveryAttempts.listByDelivery, args);
  }

  async listDeliveryAttemptsByEndpoint(
    ctx: RunQueryCtx,
    args: RefQuery<"deliveryAttempts", "listByEndpoint">["args"],
  ): Promise<RefQuery<"deliveryAttempts", "listByEndpoint">["ret"]> {
    return ctx.runQuery(this.component.deliveryAttempts.listByEndpoint, args);
  }

  async updateDeliveryAttempt(
    ctx: RunMutationCtx,
    args: RefMutation<"deliveryAttempts", "update">["args"],
  ): Promise<RefMutation<"deliveryAttempts", "update">["ret"]> {
    return ctx.runMutation(this.component.deliveryAttempts.update, args);
  }

  async removeDeliveryAttempt(
    ctx: RunMutationCtx,
    args: RefMutation<"deliveryAttempts", "remove">["args"],
  ): Promise<RefMutation<"deliveryAttempts", "remove">["ret"]> {
    return ctx.runMutation(this.component.deliveryAttempts.remove, args);
  }

  // ─── Event categories ──────────────────────────────────────────────────────

  async createEventCategory(
    ctx: RunMutationCtx,
    args: RefMutation<"eventCategories", "create">["args"],
  ): Promise<RefMutation<"eventCategories", "create">["ret"]> {
    return ctx.runMutation(this.component.eventCategories.create, args);
  }

  async getEventCategory(
    ctx: RunQueryCtx,
    args: RefQuery<"eventCategories", "get">["args"],
  ): Promise<RefQuery<"eventCategories", "get">["ret"]> {
    return ctx.runQuery(this.component.eventCategories.get, args);
  }

  async listEventCategories(
    ctx: RunQueryCtx,
    args: RefQuery<"eventCategories", "list">["args"],
  ): Promise<RefQuery<"eventCategories", "list">["ret"]> {
    return ctx.runQuery(this.component.eventCategories.list, args);
  }

  async listEventCategoriesByName(
    ctx: RunQueryCtx,
    args: RefQuery<"eventCategories", "listByCategoryName">["args"],
  ): Promise<RefQuery<"eventCategories", "listByCategoryName">["ret"]> {
    return ctx.runQuery(
      this.component.eventCategories.listByCategoryName,
      args,
    );
  }

  async updateEventCategory(
    ctx: RunMutationCtx,
    args: RefMutation<"eventCategories", "update">["args"],
  ): Promise<RefMutation<"eventCategories", "update">["ret"]> {
    return ctx.runMutation(this.component.eventCategories.update, args);
  }

  async removeEventCategory(
    ctx: RunMutationCtx,
    args: RefMutation<"eventCategories", "remove">["args"],
  ): Promise<RefMutation<"eventCategories", "remove">["ret"]> {
    return ctx.runMutation(this.component.eventCategories.remove, args);
  }

  // ─── Event registry (schema / catalog) ─────────────────────────────────────

  async createEventRegistryEntry(
    ctx: RunMutationCtx,
    args: RefMutation<"eventRegistry", "create">["args"],
  ): Promise<RefMutation<"eventRegistry", "create">["ret"]> {
    return ctx.runMutation(this.component.eventRegistry.create, args);
  }

  async getEventRegistryEntry(
    ctx: RunQueryCtx,
    args: RefQuery<"eventRegistry", "get">["args"],
  ): Promise<RefQuery<"eventRegistry", "get">["ret"]> {
    return ctx.runQuery(this.component.eventRegistry.get, args);
  }

  async listEventRegistryEntries(
    ctx: RunQueryCtx,
    args: RefQuery<"eventRegistry", "list">["args"],
  ): Promise<RefQuery<"eventRegistry", "list">["ret"]> {
    return ctx.runQuery(this.component.eventRegistry.list, args);
  }

  async listEventRegistryEntriesByEventName(
    ctx: RunQueryCtx,
    args: RefQuery<"eventRegistry", "listByEventName">["args"],
  ): Promise<RefQuery<"eventRegistry", "listByEventName">["ret"]> {
    return ctx.runQuery(this.component.eventRegistry.listByEventName, args);
  }

  async updateEventRegistryEntry(
    ctx: RunMutationCtx,
    args: RefMutation<"eventRegistry", "update">["args"],
  ): Promise<RefMutation<"eventRegistry", "update">["ret"]> {
    return ctx.runMutation(this.component.eventRegistry.update, args);
  }

  async removeEventRegistryEntry(
    ctx: RunMutationCtx,
    args: RefMutation<"eventRegistry", "remove">["args"],
  ): Promise<RefMutation<"eventRegistry", "remove">["ret"]> {
    return ctx.runMutation(this.component.eventRegistry.remove, args);
  }
}

export { Webhooks as webhooks };
