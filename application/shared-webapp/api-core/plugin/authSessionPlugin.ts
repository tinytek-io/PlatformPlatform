import { Elysia } from "elysia";
import { verifyRequestOrigin } from "lucia";
import type { User, Session } from "lucia";
import { lucia, mapClientUserInfo, TenantInfo, type UserInfo } from "../infrastructure/lucia";
import { config } from "../infrastructure/config";
import { logger } from "../infrastructure/logger";
import { tenantInfoPlugin } from "./tenantInfoPlugin";
import { localePlugin } from "./localePlugin";

const publicUrl = new URL(config.env.PUBLIC_URL);

export const authSessionPlugin = new Elysia({
  name: "auth-session-plugin"
})
  .use(tenantInfoPlugin)
  .use(localePlugin)
  .derive(
    { as: "scoped" },
    async ({
      tenantInfo,
      locale,
      request,
      set,
      cookie
    }): Promise<{
      user: User | null;
      session: Session | null;
      userInfo: UserInfo;
    }> => {
      logger.info("## --------------------------");
      logger.info("## Authenticate user and session", { tenant: tenantInfo ?? "none", locale: locale ?? "none" });
      if (!tenantInfo) {
        // No tenant found, we can't authenticate as all users must be associated with a tenant
        return {
          user: null,
          session: null,
          userInfo: mapClientUserInfo(null, null, locale)
        };
      }

      // CSRF check
      if (request.method !== "GET") {
        const originHeader = request.headers.get("Origin");
        // NOTE: You may need to use `X-Forwarded-Host` instead
        const hostHeader = request.headers.get("Host");
        if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader, config.env.PUBLIC_URL])) {
          return {
            user: null,
            session: null,
            userInfo: mapClientUserInfo(null, null, locale)
          };
        }
      }

      // use headers instead of Cookie API to prevent type coercion
      const cookieHeader = request.headers.get("Cookie") ?? "";
      const sessionId = lucia.readSessionCookie(cookieHeader);

      if (!sessionId) {
        // No session found, we can't authenticate without a session
        return {
          user: null,
          session: null,
          userInfo: mapClientUserInfo(null, null, locale)
        };
      }

      const { session, user } = await lucia.validateSession(sessionId);

      if (user != null && user.tenantId !== tenantInfo.id) {
        logger.error(`User ${user.id} is not authenticated for tenant ${tenantInfo.id} session type ${session.type}`);
        // This user is not authenticated for this tenant, an attacker may be trying to impersonate a user
        // or we caught a user session on the top domain... (we should get the most specific cookie to the current domain?)
        await lucia.invalidateSession(sessionId);
        return {
          user: null,
          session: null,
          userInfo: mapClientUserInfo(null, null, locale)
        };
      }

      if (session?.fresh) {
        logger.warn(`## Session ${session.id} is fresh`);
        // Refresh the session cookie
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookie[sessionCookie.name].set({
          value: sessionCookie.value,
          ...sessionCookie.attributes
        });
      }

      if (!session) {
        logger.warn("## No session found");
        // Create a blank session cookie
        const sessionCookie = lucia.createBlankSessionCookie();
        cookie[sessionCookie.name].set({
          value: sessionCookie.value,
          ...sessionCookie.attributes
        });
      }

      if (user != null && session.type === "USER") {
        logger.warn(`##    User ${user.id} is verified for tenant ${tenantInfo.id}`);

        // Invalidate the user session for the top domain
        await lucia.invalidateSession(session.id);
        const removedSessionCookie = lucia.createBlankSessionCookie();
        removedSessionCookie.attributes.domain = `.${publicUrl.hostname}`;
        set.headers["Set-Cookie"] = removedSessionCookie.serialize();

        // Set the session cookie for the tenant domain
        const tenantSession = await lucia.createSession(user.id, {
          type: "TENANT"
        });
        const sessionCookie = lucia.createSessionCookie(tenantSession.id);
        cookie[sessionCookie.name].set({
          value: sessionCookie.value,
          ...sessionCookie.attributes
        });

        logger.info("## Set user and new session", { user, session });
        return {
          user,
          session: tenantSession,
          userInfo: mapClientUserInfo(tenantSession, user, locale)
        };
      }

      logger.info("## Set user and session", { user: user ?? "none", session: session ?? "none" });
      return {
        user,
        session,
        userInfo: user ? mapClientUserInfo(session, user, locale) : mapClientUserInfo(null, null, locale)
      };
    }
  );
