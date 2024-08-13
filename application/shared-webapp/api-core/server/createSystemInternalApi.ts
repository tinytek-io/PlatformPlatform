import Elysia from "elysia";
import { config } from "../infrastructure/config";
import { logger } from "../infrastructure/logger";
import { healthCheckPlugin } from "../plugin/healthCheckPlugin";
import { swaggerPlugin } from "../plugin/swaggerPlugin";
import { tenantInfoPlugin } from "../plugin/tenantInfoPlugin";
import type { InternalApiConvention } from "./SystemApiConvention";
import { ProblemDetailsError } from "./problemDetails/ProblemDetails";
import { problemDetailsErrorHandler } from "./problemDetails/problemDetailsErrorHandler";
import { i18nPlugin } from "../plugin/i18nPlugin";

/**
 * Create a system internal API
 *
 * Note: These APIs are intended for internal use only inside the cluster - they are not exposed to the public internet
 */

export function createSystemInternalApi<SystemName extends string>(systemName: SystemName) {
  if (systemName !== config.system.name) {
    // Operational consistency - system APIs must mount routes in their own namespace
    throw new Error(`System "${config.system.name}" cannot use the namespace "${systemName}"`);
  }

  const systemPrefix: InternalApiConvention<SystemName> = `/internal/${systemName}`;

  logger.info(`System internal API routes mounted at ${systemPrefix}`);

  return (
    new Elysia({
      name: `${systemName}-internal-api`,
      prefix: systemPrefix,
      tags: ["internal", systemName]
    })
      .use(swaggerPlugin)
      // Register default plugins - all routes will have these plugins
      .use(tenantInfoPlugin)
      .use(i18nPlugin)
      // Register platform endpoint plugins
      .use(healthCheckPlugin)
      // Register problem details error handler
      .error({ ProblemDetailsError })
      .onError(problemDetailsErrorHandler)
  );
}
