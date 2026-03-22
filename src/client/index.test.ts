import { describe, expect, it } from "vitest";
import { Webhooks } from "./index.js";

describe("client", () => {
  it("exports Webhooks class", () => {
    expect(Webhooks).toBeDefined();
  });
});
