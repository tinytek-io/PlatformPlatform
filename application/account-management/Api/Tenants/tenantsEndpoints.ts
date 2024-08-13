import { Elysia } from "elysia";
import { changeSubdomain } from "./Commands/changeSubdomain";
import { deleteTenant } from "./Commands/deleteTenant";
import { updateTenant } from "./Commands/updateTenant";
import { getTenant } from "./Queries/getTenant";

export const tenantsEndpoints = new Elysia({
  name: "tenants-endpoints",
  prefix: "/tenants",
  tags: ["Tenants"]
})
  .use(changeSubdomain)
  .use(deleteTenant)
  .use(updateTenant)
  .use(getTenant);
