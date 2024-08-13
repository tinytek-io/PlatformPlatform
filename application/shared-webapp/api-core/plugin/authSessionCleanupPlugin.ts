import { logger } from "@azure/identity";
import cron from "@elysiajs/cron";
import Elysia from "elysia";
import { lucia } from "../infrastructure/lucia";

export const authSessionCleanupPlugin = new Elysia({
  name: "auth-session-cleanup-plugin"
}).use(
  cron({
    name: "session-cleanup",
    pattern: "0 4 * * *",
    run: async () => {
      logger.info("Running session cleanup");
      await lucia.deleteExpiredSessions();
    }
  })
);
