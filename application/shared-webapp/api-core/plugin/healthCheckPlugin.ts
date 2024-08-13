import Elysia from "elysia";
import { redisClient } from "../infrastructure/redis";
import { config } from "../infrastructure/config";
import { smtpServer } from "../infrastructure/smtp";
import { logger } from "../infrastructure/logger";
import { prisma } from "../infrastructure/database";

const isDevelopment = process.env.NODE_ENV !== "production";
const logPrefix = "[health-check-plugin]";

async function onSignal() {
  logger.info(`${logPrefix}: server is starting cleanup`);
  smtpServer.close();
  await prisma.$disconnect();
  await redisClient.quit();
}

async function onHealthCheck() {
  await prisma.$queryRaw`SELECT 1`;
  await redisClient.ping();
  await smtpServer.verify();
}

async function beforeShutdown() {
  logger.info("cleanup finished, server is shutting down");
  if (isDevelopment) {
    return;
  }
  // given your readiness probes run every 5 second
  // may be worth using a bigger number so you won't
  // run into any race conditions
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

export const healthCheckPlugin = new Elysia({
  name: "health-check-plugin"
}).get("/healthcheck", async ({ set }) => {
  try {
    await onHealthCheck();
    // logger.info(`${logPrefix}: success`, { status: "ok" });
    return { status: "ok" };
  } catch (error) {
    logger.error(`${logPrefix}: failed`, { status: "error", error });
    set.status = 503;
    return { status: "error" };
  }
});

process.on("SIGINT", shutdownHandler);
process.on("SIGTERM", shutdownHandler);

let isShuttingDown = false;
async function shutdownHandler() {
  if (isShuttingDown) {
    return;
  }
  logger.info(`${logPrefix}: received shutdown signal`);
  isShuttingDown = true;
  await onSignal();
  process.exit(0);
}
