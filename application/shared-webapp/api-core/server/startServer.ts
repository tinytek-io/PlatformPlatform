import type { AnyElysia } from "elysia";
import { config } from "../infrastructure/config";
import { logger } from "../infrastructure/logger";
import { singlePageAppPlugin } from "../plugin/singlePageAppPlugin";

export function startServer(server: AnyElysia) {
  server
    // Register single page app fallback
    .use(singlePageAppPlugin);

  server.listen(
    {
      port: config.env.PORT,
      tls: config.ssl
    },
    () => {
      logger.info(`Server listening on port ${config.env.PORT}`);
    }
  );
}
