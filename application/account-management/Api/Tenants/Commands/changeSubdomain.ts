import { Elysia, t } from "elysia";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";

const changeSubdomainRequestDto = t.Object({
  tenantId: t.String(),
  subdomain: t.String({
    minLength: 3,
    maxLength: 63
  })
});

export const changeSubdomain = new Elysia().use(prismaPlugin).post(
  "/change-subdomain",
  async ({ prisma, body: { tenantId, subdomain } }) => {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        id: subdomain
      }
    });
  },
  {
    body: changeSubdomainRequestDto,
    response: t.Void()
  }
);
