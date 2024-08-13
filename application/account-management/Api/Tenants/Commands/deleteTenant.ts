import { Elysia, t } from "elysia";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";
import { deleteTenantStorage } from "../Domain/storage";

const deleteTenantRequestDto = t.Object({
  tenantId: t.String()
});

export const deleteTenant = new Elysia().use(prismaPlugin).post(
  "/delete",
  async ({ prisma, body: { tenantId } }) => {
    // TODO: User have to be owner of the tenant
    await deleteTenantStorage(tenantId);
    await prisma.tenant.delete({
      where: { id: tenantId }
    });
  },
  {
    body: deleteTenantRequestDto,
    response: t.Void()
  }
);
