import { verifyVerificationCode } from "@/AccountRegistration/Domain/verifyVerificationCode";
import { i18n } from "@lingui/core";
import { config } from "@repo/api-core/infrastructure/config";
import { prisma } from "@repo/api-core/infrastructure/database";
import { logger } from "@repo/api-core/infrastructure/logger";
import {
  getAvatarImageUrl,
  getBrandingImageUrl,
  getUserInitials,
  lucia,
  luciaGlobal
} from "@repo/api-core/infrastructure/lucia";
import { authSessionPlugin } from "@repo/api-core/plugin/authSessionPlugin";
import { i18nPlugin } from "@repo/api-core/plugin/i18nPlugin";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";
import { signedInPath } from "@repo/infrastructure/auth/constants";
import Elysia, { error, t } from "elysia";
import { clientRedirect } from "@repo/api-core/server/clientRedirect";
import { generateTokenVerificationCode } from "@/AccountRegistration/Domain/generateTokenVerificationCode";

const publicUrl = new URL(config.env.PUBLIC_URL);

const EmailVerifyRequestDto = t.Object({
  email: t.String({
    format: "email"
  }),
  oneTimePassword: t.String(),
  // This is used when the user has multiple tenants
  tenantId: t.Optional(t.String())
});

/*
const EmailVerifyResponseDto = t.Object({
  tenants: t.Array(
    t.Object({
      id: t.String(),
      domain: t.String()
    })
  )
}); */

export const verifyEmail = new Elysia()
  .use(authSessionPlugin)
  .use(prismaPlugin)
  .use(i18nPlugin)
  .post(
    "/otp/verify",
    async ({ tenantInfo, set, cookie, body: { email, oneTimePassword, tenantId } }) => {
      // Check if verification code is valid
      const validCode = await verifyVerificationCode(prisma, email, oneTimePassword);
      if (!validCode) {
        return error(400, {
          message: i18n.t("Invalid verification code")
        });
      }

      const hasDomainTenant = tenantInfo.id != null;
      const tenants = hasDomainTenant
        ? [{ id: tenantInfo.id, domain: tenantInfo.domain }]
        : tenantId != null
          ? [{ id: tenantId, domain: `${tenantId}.${publicUrl.hostname}` }]
          : await getAvailableTenantsForEmail(email);

      if (tenants.length === 0) {
        return error(400, {
          message: i18n.t("No tenants found for email")
        });
      }

      if (tenants.length === 1) {
        // Got a tenant, then sign in
        const [tenant] = tenants;
        const user = await prisma.user.findUnique({
          where: {
            tenantId_email: {
              tenantId: tenant.id,
              email: email
            }
          },
          select: {
            id: true,
            email: true
          }
        });

        if (user == null) {
          return error(400, {
            message: i18n.t("User not found")
          });
        }

        if (hasDomainTenant) {
          // Create a session for the tenant
          const session = await lucia.createSession(user.id, {
            type: "TENANT"
          });

          const sessionCookie = lucia.createSessionCookie(session.id);

          logger.info(`Setting session cookie for ${user.email}`, { sessionCookie });

          cookie[sessionCookie.name].set({
            value: sessionCookie.value,
            ...sessionCookie.attributes
          });
        } else {
          // Create a session for the user
          const session = await luciaGlobal.createSession(user.id, {
            type: "USER"
          });

          const sessionCookie = luciaGlobal.createSessionCookie(session.id);
          sessionCookie.attributes.domain = publicUrl.hostname;

          logger.info(`Setting session cookie for ${user.email}`, { sessionCookie });

          cookie[sessionCookie.name].set({
            value: sessionCookie.value,
            ...sessionCookie.attributes
          });
        }

        // const tenantUrl = hasDomainTenant ? signedInPath : `https://${tenant.domain}${signedInPath}`;

        // set.status = 302;
        // set.headers["Client-Location"] = `https://${tenant.domain}${signedInPath}`;
        return clientRedirect(`https://${tenant.domain}${signedInPath}`, 302);
      }

      const { code, validForSeconds } = await generateTokenVerificationCode(email);

      set.status = 200;
      return { tenants, code, validForSeconds };
    },
    {
      body: EmailVerifyRequestDto
    }
  );

async function getAvailableTenantsForEmail(email: string) {
  const result = await prisma.tenant.findMany({
    where: {
      users: {
        some: {
          email
        }
      },
      NOT: {
        status: "INACTIVE"
      }
    },
    select: {
      id: true,
      logoSquareUrl: true,
      name: true,
      users: {
        take: 10,
        select: {
          id: true,
          avatarUrl: true,
          email: true,
          firstName: true,
          lastName: true
        },
        where: {
          status: "ACTIVE"
        }
      }
    }
  });

  return result.map(({ id, logoSquareUrl, name, users }) => ({
    id,
    name,
    logoSquareUrl: getBrandingImageUrl(id, "logo-square", logoSquareUrl),
    domain: `${id}.${publicUrl.hostname}`,
    members: users.length,
    users: users.map((user) => ({
      avatarUrl: getAvatarImageUrl(id, user.id, user.avatarUrl),
      initials: getUserInitials(user.firstName, user.lastName, user.email)
    }))
  }));
}
