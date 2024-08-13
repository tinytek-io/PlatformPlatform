import { createClient } from "@redis/client";
import { logger } from "./logger";

export const redisClient = await createClient({
  url: process.env.REDIS_URL
})
  .on("ready", () => {
    logger.info("Redis client ready");
  })
  .on("error", (error) => {
    logger.error("Redis error", error);
  })
  .connect();
