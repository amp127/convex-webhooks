import { defineApp } from "convex/server";
// Monorepo: load component source directly (published apps use `@convex-dev/webhooks/convex.config`).
import webhooks from "../../src/component/convex.config.js";

const app = defineApp();
app.use(webhooks);

export default app;
