import Elysia from "elysia";
import { config } from "../infrastructure/config";
import { logger } from "../infrastructure/logger";
import { swaggerPlugin } from "../plugin/swaggerPlugin";
import { tenantInfoPlugin } from "../plugin/tenantInfoPlugin";
import { trackPlugin } from "../plugin/trackPlugin";
import type { PrivateApiConvention } from "./SystemApiConvention";
import { ProblemDetailsError } from "./problemDetails/ProblemDetails";
import { problemDetailsErrorHandler } from "./problemDetails/problemDetailsErrorHandler";
import { i18nPlugin } from "../plugin/i18nPlugin";
import { authSessionPlugin } from "../plugin/authSessionPlugin";

/**
 * Create a system private non-versioned API
 *
 * Note: These APIs are not versioned and are intended for system use only
 */

export function createSystemPrivateApi<SystemName extends string>(systemName: SystemName) {
  if (systemName !== config.system.name) {
    // Operational consistency - system APIs must mount routes in their own namespace
    throw new Error(`System "${config.system.name}" cannot use the namespace "${systemName}"`);
  }

  const systemPrefix: PrivateApiConvention<SystemName> = `/${systemName}/api`;

  logger.info(`System private API routes mounted at ${systemPrefix}`);

  return (
    new Elysia({
      name: `${systemName}-private-api`,
      prefix: systemPrefix,
      tags: ["private", systemName]
    })
      .use(swaggerPlugin)
      // Register default plugins - all routes will have these plugins
      .use(tenantInfoPlugin)
      .use(i18nPlugin)
      .use(authSessionPlugin)
      // Register system specific endpoints
      .use(trackPlugin)
      // Register problem details error handler
      .error({ ProblemDetailsError })
      .onError(problemDetailsErrorHandler)
  );
}
