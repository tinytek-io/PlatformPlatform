import { authSessionPlugin } from "@repo/api-core/plugin/authSessionPlugin";
import { Elysia } from "elysia";

export const currentTenantInfo = new Elysia().use(authSessionPlugin).get("/tenant-info", async ({ tenantInfo }) => {
  return tenantInfo;
});
