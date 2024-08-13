import Elysia from "elysia";
import { config } from "../infrastructure/config";
import { logger } from "../infrastructure/logger";
import { swaggerPlugin } from "../plugin/swaggerPlugin";
import { tenantInfoPlugin } from "../plugin/tenantInfoPlugin";
import type { GlobalApiConvention } from "./SystemApiConvention";
import { ProblemDetailsError } from "./problemDetails/ProblemDetails";
import { problemDetailsErrorHandler } from "./problemDetails/problemDetailsErrorHandler";
import { i18nPlugin } from "../plugin/i18nPlugin";
import { authSessionPlugin } from "../plugin/authSessionPlugin";

/**
 * Create a globally mounted api
 *
 * Use this for global routes that are not system specific e.g. sign-up, sign-in, etc.
 *
 * Note: This is not namespaced and should be used for global routes only, requires communication with other systems
 */

export function createSystemGlobalApi<SystemName extends string>(systemName: SystemName) {
  if (systemName !== config.system.name) {
    // Operational consistency - system APIs must mount routes in their own namespace
    throw new Error(`System "${config.system.name}" cannot use the namespace "${systemName}"`);
  }

  logger.info("System global API routes mounted at /");

  return (
    new Elysia({
      name: `${systemName}-global-api`,
      tags: ["global", systemName]
    })
      .use(swaggerPlugin)
      // Register default plugins - all routes will have these plugins
      .use(tenantInfoPlugin)
      .use(i18nPlugin)
      .use(authSessionPlugin)
      // Register problem details error handler
      .error({ ProblemDetailsError })
      .onError(problemDetailsErrorHandler)
  );
}
