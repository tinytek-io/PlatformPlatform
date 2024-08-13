import { Elysia } from "elysia";
import { getAnonPrisma } from "../infrastructure/database";
import { tenantInfoPlugin } from "./tenantInfoPlugin";
import { authSessionPlugin } from "./authSessionPlugin";

export const prismaPlugin = new Elysia({
  name: "prisma-plugin"
})
  .use(tenantInfoPlugin)
  .use(authSessionPlugin)
  .derive({ as: "scoped" }, ({ headers }) => {
    // TODO: Add user authentication and return getJwtPrisma instead of getAnonPrisma
    return {
      prisma: getAnonPrisma()
    };
  });
