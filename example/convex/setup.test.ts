/// <reference types="vite/client" />
import { test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema.js";
export const modules = import.meta.glob("./**/*.*s");

// This is how users write tests that use your component.
import webhooks from "@convex-dev/webhooks/test";

export function initConvexTest() {
  const t = convexTest(schema, modules);
  webhooks.register(t, "webhooks");
  return t;
}

test("setup", () => {});
