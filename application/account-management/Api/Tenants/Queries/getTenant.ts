import { Elysia, t } from "elysia";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";

const GetTenantRequestDto = t.Object({
  tenantId: t.String()
});

const GetTenantResponseDto = t.Object({
  id: t.String(),
  createdAt: t.String(),
  updatedAt: t.String(),
  name: t.String(),
  status: t.String()
});

export const getTenant = new Elysia().use(prismaPlugin).get(
  "",
  async ({ prisma, error, query: { tenantId } }) => {
    const result = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        status: true
      }
    });

    if (!result) {
      return error(404, "Tenant not found");
    }

    return {
      id: result.id,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
      name: result.name,
      status: result.status
    };
  },
  {
    query: GetTenantRequestDto,
    response: {
      200: GetTenantResponseDto,
      404: t.String()
    }
  }
);
