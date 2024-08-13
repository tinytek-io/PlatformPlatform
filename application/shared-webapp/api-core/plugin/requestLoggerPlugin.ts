import { Elysia } from "elysia";
import { logger } from "../infrastructure/logger";

export const requestLoggerPlugin = new Elysia({
  name: "request-logger"
}).onRequest(async ({ request }) => {
  logger.info(`>> Request received: ${request.method} ${request.url}`);
});
