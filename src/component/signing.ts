/**
 * Standard Webhooks signing (O-SEC-1, O-SEC-2, O-INT-1).
 * Signed content: webhook_id.webhook_timestamp.raw_body
 *
 * Uses Web Crypto API (crypto.subtle) so this runs in Convex's default
 * V8 runtime without requiring "use node".
 */

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) {
    bin += String.fromCharCode(b);
  }
  return btoa(bin);
}

/**
 * Compute HMAC-SHA256 (v1) signature for Standard Webhooks.
 * Secret: base64 with optional whsec_ prefix; we use decoded bytes for HMAC.
 */
export async function signV1(
  secret: string,
  webhookId: string,
  timestamp: number,
  rawBody: string
): Promise<string> {
  const content = `${webhookId}.${timestamp}.${rawBody}`;
  const key = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const keyBytes = base64ToBytes(key);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const encoded = new TextEncoder().encode(content);
  const sig = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoded.buffer as ArrayBuffer,
  );
  return `v1,${bytesToBase64(new Uint8Array(sig))}`;
}

/**
 * Compute Ed25519 (v1a) signature for Standard Webhooks.
 * Private key: base64 with optional whsk_ prefix.
 */
export async function signV1a(
  privateKeyBase64: string,
  webhookId: string,
  timestamp: number,
  rawBody: string
): Promise<string> {
  const content = `${webhookId}.${timestamp}.${rawBody}`;
  const keyB64 = privateKeyBase64.startsWith("whsk_")
    ? privateKeyBase64.slice(5)
    : privateKeyBase64;
  const raw = base64ToBytes(keyB64);

  const pkcs8Header = new Uint8Array([
    0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70,
    0x04, 0x22, 0x04, 0x20,
  ]);
  const pkcs8 = new Uint8Array(pkcs8Header.length + 32);
  pkcs8.set(pkcs8Header);
  pkcs8.set(raw.subarray(0, 32), pkcs8Header.length);

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pkcs8.buffer as ArrayBuffer,
    { name: "Ed25519" },
    false,
    ["sign"]
  );
  const encoded = new TextEncoder().encode(content);
  const sig = await crypto.subtle.sign(
    "Ed25519",
    cryptoKey,
    encoded.buffer as ArrayBuffer,
  );
  return `v1a,${bytesToBase64(new Uint8Array(sig))}`;
}

/**
 * Build webhook-id (stable per delivery, same across retries). O-HDR-2.
 */
export function webhookIdFromDeliveryId(deliveryId: string): string {
  return `msg_${deliveryId}`;
}
