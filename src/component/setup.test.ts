/// <reference types="vite/client" />
import { test } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema.js";
import workpool from "@convex-dev/workpool/test";
export const modules = import.meta.glob("./**/*.*s");

export function initConvexTest() {
  const t = convexTest(schema, modules);
  t.registerComponent("workpool", workpool.schema, workpool.modules);
  return t;
}

test("setup", () => {});
