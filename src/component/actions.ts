import { v } from "convex/values";
import { internalAction } from "./_generated/server.js";
import { internal } from "./_generated/api.js";
import { signV1, signV1a, webhookIdFromDeliveryId } from "./signing.js";
import { vSendWebhookArgs, vSendWebhookResult } from "../shared.js";
import type { SendWebhookResult } from "../shared.js";

/** Internal API; cast until codegen includes webhookDeliveries, webhookEvents, actions. */
const inv = internal as any;

/** Default request timeout (seconds). O-REL-6. */
const DEFAULT_TIMEOUT_SEC = 20;
/** Max response body length to store (O-OPS-3). */
const MAX_RESPONSE_BODY_CHARS = 2000;

/** Retry delays in seconds (O-REL-3): immediate, 5s, 5m, 30m, 2h, 5h, 10h, 14h, 20h, 24h. */
const RETRY_DELAYS_SEC = [0, 5, 5 * 60, 30 * 60, 2 * 3600, 5 * 3600, 10 * 3600, 14 * 3600, 20 * 3600, 24 * 3600];

function getNextRetryAt(attemptCount: number): number {
  const idx = Math.min(attemptCount, RETRY_DELAYS_SEC.length - 1);
  const delaySec = RETRY_DELAYS_SEC[idx];
  return Date.now() + delaySec * 1000;
}

/**
 * Process a single webhook delivery: sign payload, POST, record attempt, update state.
 * Conforms to Standard Webhooks (O-INT-1) and OBJECTIVES (O-REL-4, O-REL-5, O-OPS-3).
 */
export const processDelivery = internalAction({
  args: { deliveryId: v.id("webhookDeliveries") },
  handler: async (ctx, { deliveryId }): Promise<void> => {
    const info = await ctx.runQuery(
      inv.webhookDeliveries.getDeliveryForProcessing,
      { deliveryId }
    );
    if (!info) return;

    const deliveryIdStr = deliveryId as string;
    const webhookId = webhookIdFromDeliveryId(deliveryIdStr);
    const timestamp = Math.floor(Date.now() / 1000);

    await ctx.runMutation(inv.webhookDeliveries.setDelivering, {
      deliveryId,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "webhook-id": webhookId,
      "webhook-timestamp": String(timestamp),
    };

    const body = info.event.payload;
    const signatures: string[] = [];

    if (info.endpoint.signingScheme === "v1") {
      const secret = info.endpoint.secret;
      if (secret) {
        signatures.push(await signV1(secret, webhookId, timestamp, body));
      }
      if (
        info.endpoint.rotatingSecret &&
        info.endpoint.rotationExpiresAt != null &&
        info.endpoint.rotationExpiresAt > Date.now()
      ) {
        signatures.push(
          await signV1(info.endpoint.rotatingSecret, webhookId, timestamp, body)
        );
      }
    } else {
      const priv = info.endpoint.privateKey;
      if (priv) {
        signatures.push(await signV1a(priv, webhookId, timestamp, body));
      }
      if (
        info.endpoint.rotatingPrivateKey &&
        info.endpoint.rotationExpiresAt != null &&
        info.endpoint.rotationExpiresAt > Date.now()
      ) {
        signatures.push(
          await signV1a(
            info.endpoint.rotatingPrivateKey,
            webhookId,
            timestamp,
            body
          )
        );
      }
    }

    if (signatures.length > 0) {
      headers["webhook-signature"] = signatures.join(" ");
    }

    const attemptNumber = info.delivery.attemptCount + 1;
    const start = Date.now();
    let responseStatus: number | undefined;
    let responseBody: string | undefined;
    let error: string | undefined;
    let success = false;

    try {
      const controller = new AbortController();
      const to = setTimeout(
        () => controller.abort(),
        DEFAULT_TIMEOUT_SEC * 1000
      );
      const res = await fetch(info.endpoint.url, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });
      clearTimeout(to);
      responseStatus = res.status;
      const text = await res.text();
      responseBody =
        text.length > MAX_RESPONSE_BODY_CHARS
          ? text.slice(0, MAX_RESPONSE_BODY_CHARS) + "..."
          : text;
      success = res.status >= 200 && res.status < 300;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }

    const durationMs = Date.now() - start;

    await ctx.runMutation(inv.deliveryAttempts.recordAttempt, {
      deliveryId,
      endpointId: info.delivery.endpointId,
      attemptNumber,
      requestTimestamp: Math.floor(start / 1000),
      responseStatus,
      responseBody,
      durationMs,
      error,
      success,
    });

    if (success) {
      await ctx.runMutation(inv.webhookDeliveries.markDelivered, {
        deliveryId,
      });
      return;
    }

    if (responseStatus === 410) {
      await ctx.runMutation(inv.webhookDeliveries.markFailed, {
        deliveryId,
        error: "410 Gone – endpoint disabled (O-REL-5)",
      });
      return;
    }

    const shouldRetry =
      responseStatus == null ||
      responseStatus === 429 ||
      responseStatus === 502 ||
      responseStatus === 504 ||
      (responseStatus >= 500 && responseStatus < 600);

    if (
      shouldRetry &&
      attemptNumber < info.delivery.maxAttempts
    ) {
      const nextAttemptAt = getNextRetryAt(attemptNumber);
      await ctx.runMutation(inv.webhookDeliveries.scheduleRetry, {
        deliveryId,
        nextAttemptAt,
        error: error ?? (responseStatus != null ? `HTTP ${responseStatus}` : undefined),
      });
      const delayMs = Math.max(0, nextAttemptAt - Date.now());
      await ctx.scheduler.runAfter(delayMs, inv.actions.processDelivery, {
        deliveryId,
      });
    } else {
      await ctx.runMutation(inv.webhookDeliveries.markFailed, {
        deliveryId,
        error:
          error ??
          (responseStatus != null
            ? `HTTP ${responseStatus}`
            : "Max attempts exceeded"),
      });
    }
  },
});

/**
 * Send a webhook with progressive enhancement.
 * - Simple: POST to url with payload (no persistence, no signing). Easiest.
 * - Managed: create event + delivery for a registered endpoint, sign (Standard Webhooks), schedule processDelivery, return deliveryId.
 */
export const sendWebhook = internalAction({
  args: vSendWebhookArgs,
  returns: vSendWebhookResult,
  handler: async (ctx, args): Promise<SendWebhookResult> => {
    if (args.kind === "simple") {
      const res = await fetch(args.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(args.headers ?? {}),
        },
        body: JSON.stringify(args.payload ?? {}),
      });
      if (!res.ok) {
        throw new Error(`Webhook failed with status ${res.status}`);
      }
      return { status: "sent" };
    }

    const { endpointId, eventType, data, idempotencyKey, maxAttempts } = args;
    const webhookId = args.webhookId ?? "outbound";
    const timestamp = new Date().toISOString();
    const payloadObj = { type: eventType, timestamp, data: data ?? {} };
    const payload = JSON.stringify(payloadObj);

    const result = await ctx.runMutation(
      inv.webhookEvents.createEventAndDelivery,
      {
        endpointId,
        webhookId,
        eventType,
        timestamp,
        data: data ?? {},
        payload,
        idempotencyKey,
        maxAttempts,
      }
    );

    await ctx.runMutation(inv.webhookDeliveries.scheduleDelivery, {
      deliveryId: result.deliveryId,
    });

    return {
      deliveryId: result.deliveryId,
      eventId: result.eventId,
      status: "pending",
      estimatedAt: Date.now(),
    };
  },
});
