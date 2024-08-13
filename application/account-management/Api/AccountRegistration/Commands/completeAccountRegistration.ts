import { Elysia, t } from "elysia";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";
import { tenantInfoPlugin } from "@repo/api-core/plugin/tenantInfoPlugin";
import { verifyVerificationCode } from "../Domain/verifyVerificationCode";
import { signedUpPath } from "@repo/infrastructure/auth/constants";
import { isWithinExpirationDate } from "oslo";
import { URL } from "node:url";
import { config } from "@repo/api-core/infrastructure/config";
import { logger } from "@repo/api-core/infrastructure/logger";
import { i18nPlugin } from "@repo/api-core/plugin/i18nPlugin";
import { luciaGlobal } from "@repo/api-core/infrastructure/lucia";
import { clientRedirect } from "@repo/api-core/server/clientRedirect";

const publicUrl = new URL(config.env.PUBLIC_URL);

const AccountRegistrationCompleteRequestDto = t.Object({
  oneTimePassword: t.String(),
  accountRegistrationId: t.String()
});

export const completeAccountRegistration = new Elysia()
  .use(tenantInfoPlugin)
  .use(prismaPlugin)
  .use(i18nPlugin)
  .post(
    "/complete",
    async ({ prisma, cookie, i18n, error, body: { oneTimePassword, accountRegistrationId } }) => {
      // Check if account registration exists and is not expired
      const accountRegistration = await prisma.accountRegistration.findUnique({
        where: {
          id: accountRegistrationId
        },
        select: {
          email: true,
          subdomain: true,
          expiresAt: true
        }
      });
      if (accountRegistration == null) {
        return error(400, {
          message: i18n.t("Account registration not found")
        });
      }
      if (isWithinExpirationDate(accountRegistration.expiresAt) === false) {
        return error(400, {
          message: i18n.t("Account registration expired")
        });
      }
      // Check if verification code is valid
      const validCode = await verifyVerificationCode(prisma, accountRegistration.email, oneTimePassword);
      if (!validCode) {
        return error(400, {
          message: i18n.t("Invalid verification code")
        });
      }

      logger.info(`Account registration completed for ${accountRegistration.email}`);
      // Create owner and tenant
      const user = await prisma.user.create({
        data: {
          email: accountRegistration.email,
          role: "OWNER",
          emailVerified: true,
          authProvider: "EMAIL_OTP",
          status: "ACTIVE",
          tenant: {
            create: {
              id: accountRegistration.subdomain,
              name: accountRegistration.subdomain,
              status: "TRIAL"
            }
          }
        },
        select: {
          id: true,
          email: true,
          tenantId: true,
          emailVerified: true
        }
      });

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

      // Redirect to the signed up page on the new tenant
      const signedUpUrl = new URL(signedUpPath, `https://${user.tenantId}.${publicUrl.hostname}`);
      return clientRedirect(signedUpUrl.toString(), 302);
    },
    {
      body: AccountRegistrationCompleteRequestDto,
      response: {
        200: t.Object({
          url: t.String()
        }),
        400: t.Object({ message: t.String() })
      }
    }
  );
