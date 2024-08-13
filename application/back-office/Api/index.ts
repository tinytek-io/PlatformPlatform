import { platformPlugin, startServer } from "@repo/api-core/elysiaServer";
import Elysia from "elysia";
import { systemInternalApi } from "./systemInternalApi";
import { systemPrivateApi } from "./systemPrivateApi";
import { systemPublicApi } from "./systemPublicApi";
import { systemGlobalApi } from "./systemGlobalApi";

const api = new Elysia({
  name: "back-office",
  tags: ["back-office"]
})
  .use(platformPlugin)
  .use(systemGlobalApi)
  .use(systemInternalApi)
  .use(systemPrivateApi)
  .use(systemPublicApi);

// Start the server
startServer(api);

// Export types for the api client
export type ApiType = typeof api;
