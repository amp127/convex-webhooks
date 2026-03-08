import { query } from "./_generated/server";

/**
 * Minimal placeholder query so the example app has a valid Convex backend.
 * Replace with your webhook-related functions.
 */
export const health = query({
  args: {},
  handler: async () => ({ ok: true }),
});
