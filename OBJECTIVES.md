# Convex Outbound Webhooks Component
**Version: 1.0.0 | License: Apache 2.0**

---

## Introduction

This document defines the design, requirements, and objectives for a reusable Convex component that enables applications to send outbound webhooks securely and reliably to external HTTP endpoints.

Webhooks are used by many of the world's top companies for notifying external systems of events. However, building a correct, secure, and reliable webhook sender from scratch is non-trivial — particularly within a Convex backend, where execution constraints, scheduling, and data consistency must all be considered.

This component aims to be the standard way to send outbound webhooks from a Convex application. By following the [Standard Webhooks](https://www.standardwebhooks.com/) specification, it ensures that consumers of your webhooks get a consistent, interoperable, and trustworthy experience — regardless of which Convex app is sending them.

---

## What This Component Does

This is a **producer-side** (sender) component. When something happens in your Convex app — a user signs up, an invoice is paid, a job completes — your app calls into this component, which handles:

- Formatting and signing the webhook payload
- Persisting the outbound event to Convex's database
- Scheduling and executing the HTTP delivery via Convex actions
- Retrying failed deliveries with exponential backoff
- Tracking delivery status and attempt history

---

## Objectives

These are the concrete, verifiable objectives the component must satisfy. Every design and implementation decision should be traceable back to one or more of these.

### Security
- [ ] **O-SEC-1** — All outgoing webhook payloads MUST be signed using HMAC-SHA256 (symmetric, `v1`) or ed25519 (asymmetric, `v1a`), following the Standard Webhooks signature scheme.
- [ ] **O-SEC-2** — Signatures MUST cover the full signed content string: `msg_id.unix_timestamp.raw_body`.
- [ ] **O-SEC-3** — Signing secrets MUST be unique per registered endpoint.
- [ ] **O-SEC-4** — Symmetric secrets MUST be between 24–64 bytes, base64-encoded, and prefixed with `whsec_`. Asymmetric private keys MUST be prefixed with `whsk_` and public keys with `whpk_`.
- [ ] **O-SEC-5** — Zero-downtime secret rotation MUST be supported by signing with both the active and outgoing key during a rotation window, sending both signatures space-delimited in `webhook-signature`.
- [ ] **O-SEC-6** — All registered endpoint URLs MUST be validated against an allowlist or SSRF-safe proxy before any HTTP request is made. Internal/private IP ranges MUST be blocked.
- [ ] **O-SEC-7** — HTTPS MUST be enforced for all registered endpoints by default, with an explicit opt-out available for development environments only.

### Reliability
- [ ] **O-REL-1** — Every outbound webhook event MUST be persisted to the Convex database before any delivery attempt, ensuring no events are lost if a delivery attempt fails.
- [ ] **O-REL-2** — Failed deliveries MUST be retried using a schedule with exponential backoff and random jitter, spanning at least 24 hours.
- [ ] **O-REL-3** — The retry schedule MUST follow this minimum pattern: immediate → 5s → 5m → 30m → 2h → 5h → 10h → 14h → 20h → 24h.
- [ ] **O-REL-4** — A delivery is considered successful only on a `2xx` HTTP response within the configured timeout window.
- [ ] **O-REL-5** — HTTP status codes MUST be handled according to the Standard Webhooks spec (`410` disables the endpoint, `429`/`502`/`504` trigger throttling, `3xx` are treated as failures).
- [ ] **O-REL-6** — Request timeouts MUST default to between 15–30 seconds per attempt.
- [ ] **O-REL-7** — After sustained delivery failures, the endpoint MUST be automatically disabled and the failure flagged for consumer notification.
- [ ] **O-REL-8** — Delivery MUST be handled inside a Convex **action** (not a mutation) to allow outbound HTTP calls, scheduled via Convex's workpool.

### Payload
- [ ] **O-PAY-1** — Every webhook payload MUST include a `type` (dot-delimited event type string), a `timestamp` (ISO 8601, time of the event), and a `data` object.
- [ ] **O-PAY-2** — The raw serialized JSON body sent over the wire MUST be identical to the body used when computing the signature. It MUST NOT be re-serialized after signing.
- [ ] **O-PAY-3** — Payload size SHOULD be kept under 20kb. The component SHOULD warn or reject oversized payloads.

### Headers
- [ ] **O-HDR-1** — Every outbound request MUST include the three Standard Webhooks headers: `webhook-id`, `webhook-timestamp`, and `webhook-signature`.
- [ ] **O-HDR-2** — `webhook-id` MUST be a stable, unique identifier for the event — consistent across all retry attempts for the same event.
- [ ] **O-HDR-3** — `webhook-timestamp` MUST be an integer Unix timestamp (seconds since epoch) representing the time of the delivery attempt, not the event time.

### Interoperability
- [ ] **O-INT-1** — The component MUST conform to the [Standard Webhooks specification v1.0.0](https://www.standardwebhooks.com/).
- [ ] **O-INT-2** — Both symmetric (`v1`) and asymmetric (`v1a`) signature schemes MUST be supported, configurable per endpoint.
- [ ] **O-INT-3** — Event types MUST follow the dot-delimited, `[a-zA-Z0-9_]` character-limited format (e.g., `invoice.paid`, `user.created`).

### Operational
- [ ] **O-OPS-1** — Multiple endpoints per consumer/application MUST be supported (fanout), each with its own signing key and event type filter.
- [ ] **O-OPS-2** — Consumers MUST be able to filter which event types are delivered to which endpoint. Filtering MUST happen on the producer side before any HTTP request is made.
- [ ] **O-OPS-3** — All delivery attempts (success and failure) MUST be logged to the Convex database with: attempt timestamp, HTTP status code, response body (truncated), and retry count.
- [ ] **O-OPS-4** — An API MUST be exposed for querying event history, attempt history, and current endpoint status.
- [ ] **O-OPS-5** — Manual replay of a specific event or a time-range of failed events MUST be supported.
- [ ] **O-OPS-6** — An API MUST be exposed for registering, updating, and removing webhook endpoints programmatically.

### Convex-Specific
- [ ] **O-CVX-1** — The component MUST be self-contained and installable as a standard Convex component with no external infrastructure dependencies.
- [ ] **O-CVX-2** — Scheduling and retries MUST use Convex's workpool — no external queues or cron services required.
- [ ] **O-CVX-3** — All persisted state (endpoints, events, attempts) MUST live in Convex tables defined and owned by the component.
- [ ] **O-CVX-4** — The component MUST expose a typed TypeScript API for registering endpoints and dispatching events from the host application's mutations and actions.
- [ ] **O-CVX-5** — The component MUST be idempotent: re-scheduling or re-triggering the same event MUST NOT result in duplicate deliveries.

---

## Out of Scope

This component is a **producer only**. It does not handle:

- Receiving or verifying inbound webhooks
- Authenticating the external endpoints being called
- Managing consumer-facing UI for endpoint configuration

---

These objectives serve as the acceptance criteria for the component. Any feature, PR, or design decision should be evaluated against this list.