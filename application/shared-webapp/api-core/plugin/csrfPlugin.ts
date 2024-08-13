import { Elysia } from "elysia";
import { verifyRequestOrigin } from "lucia";
import { logger } from "../infrastructure/logger";
import { config } from "../infrastructure/config";

export const csrfPlugin = new Elysia({
  name: "csrf-plugin"
}).onRequest(({ request, error }) => {
  if (request.method === "GET" || request.method === "HEAD") {
    return;
  }

  const originHeader = request.headers.get("Origin");
  const hostHeader = request.headers.get("Host");

  if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader, config.env.PUBLIC_URL])) {
    logger.warn("CSRF protection: Origin header does not match host header", {
      origin: originHeader,
      allowedDomains: [hostHeader, config.env.PUBLIC_URL]
    });
    return error(403);
  }
});
