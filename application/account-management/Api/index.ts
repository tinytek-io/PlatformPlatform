import { platformPlugin, startServer } from "@repo/api-core/elysiaServer";
import { createBlobContainer } from "@repo/api-core/infrastructure/storage";
import Elysia from "elysia";
import { systemInternalApi } from "./systemInternalApi";
import { systemPrivateApi } from "./systemPrivateApi";
import { systemPublicApi } from "./systemPublicApi";
import { systemGlobalApi } from "./systemGlobalApi";

const api = new Elysia({
  name: "account-management",
  tags: ["account-management"]
})
  .use(platformPlugin)
  .use(systemGlobalApi)
  .use(systemInternalApi)
  .use(systemPrivateApi)
  .use(systemPublicApi);

// Ensure that the required blob containers exist
await createBlobContainer("blobs");
await createBlobContainer("avatars");
await createBlobContainer("branding");

// Start the server
startServer(api);

// Export types for the api client
export type ApiType = typeof api;
