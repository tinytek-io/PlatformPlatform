import { URL } from "node:url";
import { Elysia } from "elysia";
import { config } from "../infrastructure/config";
import { mapClientTenantInfo, type TenantInfo } from "../infrastructure/lucia";
import { getAnonPrisma } from "../infrastructure/database";

const publicUrl = new URL(config.env.PUBLIC_URL);
const anonPrisma = getAnonPrisma();

export const tenantInfoPlugin = new Elysia({
  name: "tenant-info-plugin"
}).derive({ as: "global" }, async ({ request }): Promise<{ tenantInfo: TenantInfo }> => {
  const tenantId = getTenantIdFromUrl(new URL(request.url));

  if (!tenantId) {
    return {
      tenantInfo: {
        id: null
      }
    };
  }

  const tenant = await anonPrisma.tenant.findUnique({
    where: {
      id: tenantId.id
    },
    select: {
      id: true,
      name: true,
      status: true,
      logoSquareUrl: true,
      logoWideUrl: true,
      theme: true,
      defaultLocale: true,
      mobileHeroUrl: true,
      desktopHeroUrl: true,
      brandColor: true
    }
  });

  if (!tenant) {
    return {
      tenantInfo: {
        id: null
      }
    };
  }

  return {
    tenantInfo: mapClientTenantInfo(tenant)
  };
});

function getTenantIdFromUrl(url: URL) {
  const [tenantId] = url.hostname.split(".");
  const tenantDomain = `${tenantId}.${publicUrl.hostname}`;
  if (url.hostname === tenantDomain) {
    return {
      id: tenantId,
      domain: tenantDomain
    };
  }
}
