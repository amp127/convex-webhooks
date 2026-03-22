# Convex Webhooks Component

[![npm version](https://badge.fury.io/js/@amp126v%2Fwebhooks.svg)](https://badge.fury.io/js/@amp127%2Fwebhooks)

<!-- START: Include on https://convex.dev/components -->

A managed webhook delivery system for sending events to user-defined URLs. Handles queuing, retries with backoff, and cryptographic signing so recipients can verify authenticity. Supports both serialized and parallel delivery modes.


## ✨ Key Features

- **Queue Management**: Outbound webhooks with configurable rate limits per destination URL
- **Automatic Retries**: Exponential backoff for 5xx errors and network failures
- **Delivery Modes**: Serialized (in-order) or parallel (out-of-order on failure)
- **Cryptographic Signing**: Generate and store ed25519 key pairs per destination
- **Payload Verification**: Sign payloads with private key, expose public key for recipient verification
- **Status Tracking**: Track delivery status: pending, delivered, failed, retrying
- **Delivery History**: Store attempts with timestamp, response code, and error details
- **URL Validation**: Optional HEAD request to confirm reachability on registration
- **Retry Configuration**: Configurable max retry attempts and retry window
- **Query Interface**: Inspect delivery history and failed webhooks

## 📋 Requirements Status

### ✅ Core Requirements

- [ ] **Queue outbound webhooks with configurable rate limits per destination URL**
- [ ] **Automatic retries with exponential backoff for 5xx errors and network failures**
- [ ] **Configurable delivery modes: serialized (in-order) or parallel (out-of-order on failure)**
- [ ] **Generate and store ed25519 key pairs per destination for request signing**
- [ ] **Sign payloads with private key, expose public key for recipient verification**
- [ ] **Track delivery status per webhook: pending, delivered, failed, retrying**
- [ ] **Store delivery attempts with timestamp, response code, and error details**
- [ ] **Validate destination URLs on registration (optional HEAD request to confirm reachability)**
- [ ] **Configurable max retry attempts and retry window before marking as permanently failed**
- [ ] **Expose query interface for delivery history and failed webhook inspection**

### ✅ Implementation Status

- [ ] **Event Management**: Core event storage and retrieval system
- [ ] **Workpool Integration**: Background processing infrastructure
- [ ] **Component Architecture**: Modular Convex component design
- [ ] **Type Safety**: Full TypeScript type definitions
- [ ] **Schema Design**: Optimized database schema for webhook delivery

## 🚀 Basic Setup

This component uses [Workpool](https://github.com/get-convex/workpool) for background processing. Install both packages:

```bash
npm install @convex-dev/webhooks @convex-dev/workpool
```

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import webhooks from "@convex-dev/webhooks/convex.config";

const app = defineApp();
app.use(webhooks);
export default app;
```

```ts
// convex/webhooks.ts (or your convex folder)
import { components } from "./_generated/api";
import { webhooks } from "@convex-dev/webhooks";

const webhookSystem = new webhooks(components.webhooks, {
  rateLimits: {
    perDestination: 100, // requests per minute
    global: 1000, // global requests per minute
  },
  delivery: {
    mode: "serialized", // or "parallel"
    maxRetries: 5,
    retryWindow: 3600, // 1 hour in seconds
  },
  signing: {
    algorithm: "ed25519",
    keyRotation: 86400, // 24 hours in seconds
  },
});
```

## 📤 Register Webhook Destination

```ts
export const registerWebhook = action({
  args: {
    url: v.string(),
    events: v.array(v.string()),
    config: v.object({
      mode: v.union(v.literal("serialized"), v.literal("parallel")),
      rateLimit: v.optional(v.number()),
      secret: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { url, events, config }) => {
    // Validate destination URL
    const isValid = await webhookSystem.validateDestination(ctx, { url });
    if (!isValid) {
      throw new Error("Destination URL is not reachable");
    }

    // Generate signing key pair
    const keyPair = await webhookSystem.generateKeyPair(ctx, { url });
    
    // Register webhook destination
    const destination = await webhookSystem.registerDestination(ctx, {
      url,
      events,
      config,
      publicKey: keyPair.publicKey,
    });

    return { destination, publicKey: keyPair.publicKey };
  },
});
```

## 📤 Send Webhook

```ts
export const sendWebhook = action({
  args: {
    destinationId: v.id("destinations"),
    payload: v.any(),
    headers: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, { destinationId, payload, headers }) => {
    const delivery = await webhookSystem.send(ctx, {
      destinationId,
      payload,
      headers,
      priority: "normal", // or "high"
    });

    return {
      deliveryId: delivery.id,
      status: delivery.status,
      estimatedDelivery: delivery.estimatedAt,
    };
  },
});
```

## 🔍 Query Delivery Status

```ts
export const getDeliveryStatus = query({
  args: {
    deliveryId: v.id("deliveries"),
  },
  handler: async (ctx, { deliveryId }) => {
    const delivery = await webhookSystem.getDelivery(ctx, { deliveryId });
    const attempts = await webhookSystem.getDeliveryAttempts(ctx, { deliveryId });

    return {
      delivery: {
        id: delivery._id,
        status: delivery.status,
        createdAt: delivery._creationTime,
        attempts: delivery.attempts,
        lastAttempt: delivery.lastAttempt,
      },
      attempts: attempts.map(attempt => ({
        timestamp: attempt.timestamp,
        responseCode: attempt.responseCode,
        error: attempt.error,
        duration: attempt.duration,
      })),
    };
  },
});
```

## 📊 Delivery History

```ts
export const getDeliveryHistory = query({
  args: {
    destinationId: v.id("destinations"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("delivered"),
      v.literal("failed"),
      v.literal("retrying")
    )),
    paginationOpts: v.optional(paginationOptsValidator),
  },
  handler: async (ctx, { destinationId, status, paginationOpts }) => {
    const deliveries = await webhookSystem.listDeliveries(ctx, {
      destinationId,
      status,
      paginationOpts: paginationOpts || { cursor: null, numItems: 50 },
    });

    return deliveries;
  },
});
```

## 🔐 Payload Verification

Recipients can verify webhook authenticity using the public key:

```ts
import { createVerify } from 'crypto';

export function verifyWebhook(payload: string, signature: string, publicKey: string): boolean {
  const verify = createVerify('SHA256');
  verify.update(payload);
  verify.end();
  
  return verify.verify(publicKey, signature, 'base64');
}
```

## ⚡ Advanced Configuration

```ts
const webhookSystem = new webhooks(components.webhooks, {
  rateLimits: {
    perDestination: {
      requests: 100,
      window: 60, // 1 minute
      burst: 10, // allow burst of 10
    },
    global: {
      requests: 1000,
      window: 60,
    },
  },
  delivery: {
    mode: "parallel",
    maxRetries: 7,
    retryWindow: 7200, // 2 hours
    backoffMultiplier: 2,
    initialDelay: 1000, // 1 second
  },
  signing: {
    algorithm: "ed25519",
    keyRotation: 86400, // 24 hours
    headerName: "X-Webhook-Signature",
  },
  validation: {
    timeout: 5000, // 5 seconds
    userAgent: "Convex-Webhooks/1.0",
    headers: {
      "Content-Type": "application/json",
    },
  },
});
```

## 🔄 Event Processing with Workpool

The webhook system uses [Workpool](https://github.com/get-convex/workpool) for reliable background processing. Workpool provides prioritized queues, concurrency limits, and built-in retries. Enqueue delivery actions through Workpool:

```ts
import { Workpool } from "@convex-dev/workpool";
import { components } from "./_generated/api";
import { internal } from "./_generated/api";

const deliveryPool = new Workpool(components.webhooks.workpool, {
  maxParallelism: 20,
  retryActionsByDefault: true,
  defaultRetryBehavior: { maxAttempts: 5, initialBackoffMs: 1000, base: 2 },
});

export const sendWebhook = mutation({
  args: {
    destinationId: v.id("destinations"),
    payload: v.any(),
  },
  handler: async (ctx, { destinationId, payload }) => {
    const delivery = await webhookSystem.createDelivery(ctx, {
      destinationId,
      payload,
    });

    await deliveryPool.enqueueAction(ctx, internal.webhooks.processDelivery, {
      deliveryId: delivery._id,
    });

    return { deliveryId: delivery._id };
  },
});

// The action that performs the actual HTTP delivery
export const processDelivery = internalAction({
  args: { deliveryId: v.id("deliveries") },
  handler: async (ctx, { deliveryId }) => {
    const delivery = await ctx.runQuery(internal.webhooks.getDelivery, { deliveryId });
    if (!delivery) return;

    const response = await fetch(delivery.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...delivery.headers },
      body: JSON.stringify(delivery.payload),
    });

    await ctx.runMutation(internal.webhooks.recordAttempt, {
      deliveryId,
      responseCode: response.status,
      success: response.ok,
    });

    if (response.ok) {
      await ctx.runMutation(internal.webhooks.markDelivered, { deliveryId });
    } else if (response.status >= 500) {
      await ctx.runMutation(internal.webhooks.scheduleRetry, { deliveryId });
    } else {
      await ctx.runMutation(internal.webhooks.markFailed, { deliveryId });
    }
  },
});
```

For priority routing (high vs normal), configure multiple Workpool instances in your `convex.config.ts` and route to the appropriate pool.

## 📈 Monitoring & Analytics

```ts
export const getWebhookStats = query({
  args: {
    destinationId: v.id("destinations"),
    timeRange: v.object({
      start: v.number(),
      end: v.number(),
    }),
  },
  handler: async (ctx, { destinationId, timeRange }) => {
    const stats = await webhookSystem.getStats(ctx, {
      destinationId,
      timeRange,
    });

    return {
      totalDeliveries: stats.total,
      successfulDeliveries: stats.successful,
      failedDeliveries: stats.failed,
      averageLatency: stats.averageLatency,
      deliveryRate: stats.deliveryRate,
      errorRate: stats.errorRate,
    };
  },
});
```

## 🛠️ Development

```bash
# Install dependencies (Workpool is a peer dependency)
npm install @convex-dev/webhooks @convex-dev/workpool

# Run development server
npm run dev

# Run tests
npm test
```

## 📝 License

MIT License - see LICENSE file for details.
