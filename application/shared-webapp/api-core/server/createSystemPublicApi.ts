import Elysia from "elysia";
import { config } from "../infrastructure/config";
import { logger } from "../infrastructure/logger";
import { localePlugin } from "../plugin/localePlugin";
import { swaggerPlugin } from "../plugin/swaggerPlugin";
import { tenantInfoPlugin } from "../plugin/tenantInfoPlugin";
import type { PublicApiConvention } from "./SystemApiConvention";
import { ProblemDetailsError } from "./problemDetails/ProblemDetails";
import { problemDetailsErrorHandler } from "./problemDetails/problemDetailsErrorHandler";
import { i18nPlugin } from "../plugin/i18nPlugin";
import { authSessionPlugin } from "../plugin/authSessionPlugin";

/**
 * Create a system public versioned API
 *
 * Can be consumed by external clients and requires versioning, documentation, and communication
 */

export function createSystemPublicApi<SystemName extends string, ApiVersion extends `v${string}`>(
  systemName: SystemName,
  apiVersion: ApiVersion
) {
  if (systemName !== config.system.name) {
    // Operational consistency - system APIs must mount routes in their own namespace
    throw new Error(`System "${config.system.name}" cannot use the namespace "${systemName}"`);
  }

  const systemPrefix: PublicApiConvention<SystemName, ApiVersion> = `/api/${apiVersion}/${systemName}`;

  logger.info(`System public API routes mounted at ${systemPrefix}`);

  return (
    new Elysia({
      name: `${systemName}-public-api`,
      prefix: systemPrefix,
      seed: apiVersion,
      tags: ["public", systemName, apiVersion]
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
