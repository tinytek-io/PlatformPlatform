import { logger } from "@repo/api-core/infrastructure/logger";
import { lucia } from "@repo/api-core/infrastructure/lucia";
import { authSessionPlugin } from "@repo/api-core/plugin/authSessionPlugin";
import { clientRedirect } from "@repo/api-core/server/clientRedirect";
import { signedOutPath } from "@repo/infrastructure/auth/constants";
import Elysia from "elysia";

export const signOut = new Elysia()
  .use(authSessionPlugin)
  .post("/sign-out", async ({ tenantInfo, session, cookie }) => {
    if (session != null && tenantInfo.id != null) {
      logger.info(`Signing out user ${session.userId} from tenant ${tenantInfo.id}`);

      // Invalidate the session
      await lucia.invalidateSession(session.id);

      // Create a blank session cookie to remove the session cookie
      const sessionCookie = lucia.createBlankSessionCookie();

      cookie[sessionCookie.name].set({
        value: sessionCookie.value,
        ...sessionCookie.attributes
      });
    } else {
      logger.error("No session found to sign out", { tenantId: tenantInfo?.id, sessionId: session?.id });
    }

    return clientRedirect(signedOutPath, 302);
  });
