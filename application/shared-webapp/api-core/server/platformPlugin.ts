import serverTiming from "@elysiajs/server-timing";
import Elysia from "elysia";
import { csrfPlugin } from "../plugin/csrfPlugin";
import { helmetPlugin } from "../plugin/helmetPlugin";
import { openTelemetryPlugin } from "../plugin/openTelemetry";
import { swaggerPlugin } from "../plugin/swaggerPlugin";
import { tenantInfoPlugin } from "../plugin/tenantInfoPlugin";
import { problemDetailsErrorHandler } from "./problemDetails/problemDetailsErrorHandler";
import { ProblemDetailsError } from "./problemDetails/ProblemDetails";
import { i18nPlugin } from "../plugin/i18nPlugin";
import { requestLoggerPlugin } from "../plugin/requestLoggerPlugin";

export const platformPlugin = new Elysia({
  name: "platform-plugins"
})
  .use(serverTiming())
  .use(requestLoggerPlugin)
  .use(openTelemetryPlugin)
  // Register security plugins
  .use(helmetPlugin)
  .use(csrfPlugin)
  // Register swagger plugin
  .use(swaggerPlugin)
  // .set("trust proxy", 1);
  // .disable("x-powered-by");
  // .use(rateLimitMiddleware());
  // .use(morganMiddleware(logger));
  // Register default plugins - all routes will have these plugins
  .use(tenantInfoPlugin)
  .use(i18nPlugin)
  // Register problem details error handler
  .error({ ProblemDetailsError })
  .onError(problemDetailsErrorHandler);
