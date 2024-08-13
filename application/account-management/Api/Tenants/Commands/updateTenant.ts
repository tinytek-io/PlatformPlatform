import { Elysia, t } from "elysia";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";
import { authSessionPlugin } from "@repo/api-core/plugin/authSessionPlugin";
import { uploadBrandingImage } from "../Domain/branding";

const updateTenantRequestDto = t.Object({
  logoSquare: t.Optional(
    t.File({
      maxSize: "1m",
      mimeType: ["image/png"]
    })
  ),
  logoWide: t.Optional(
    t.File({
      maxSize: "1m",
      mimeType: ["image/png"]
    })
  ),
  tenantId: t.String(),
  name: t.String({
    minLength: 1,
    maxLength: 30
  }),
  subdomain: t.Optional(
    // TODO: Changing subdomain is not supported yet
    t.String({
      minLength: 3,
      maxLength: 63
    })
  )
});

export const updateTenant = new Elysia()
  .use(authSessionPlugin)
  .use(prismaPlugin)
  .post(
    "/update",
    async ({ prisma, body: { tenantId, name, logoSquare, logoWide } }) => {
      const logoSquareUrl =
        logoSquare != null ? await uploadBrandingImage(tenantId, "logo-square", logoSquare) : undefined;
      const logoWideUrl = logoWide != null ? await uploadBrandingImage(tenantId, "logo-wide", logoWide) : undefined;

      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          name,
          // id: subdomain,
          logoSquareUrl,
          logoWideUrl
        }
      });
    },
    {
      body: updateTenantRequestDto,
      response: t.Void()
    }
  );
