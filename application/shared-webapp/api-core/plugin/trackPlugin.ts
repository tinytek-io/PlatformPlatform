import Elysia from "elysia";
import { logger } from "../infrastructure/logger";

export const trackPlugin = new Elysia({
  name: "track-plugin"
}).post("/track", ({ body }) => {
  logger.info("track");
  return "ok";
});
