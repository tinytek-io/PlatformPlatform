import { Elysia, t } from "elysia";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";
import { uploadAvatar } from "../Domain/Avatar";
import { authSessionPlugin } from "@repo/api-core/plugin/authSessionPlugin";
import { logger } from "@repo/api-core/infrastructure/logger";

const updateUserRequestBodyDto = t.Object({
  image: t.Optional(t.File()),
  firstName: t.String(),
  lastName: t.String(),
  title: t.String()
});

const updateUserRequestParamsDto = t.Object({
  userId: t.String()
});

const updateUserResponseDto = t.Object({
  id: t.String(),
  firstName: t.Optional(t.String()),
  lastName: t.Optional(t.String()),
  title: t.Optional(t.String()),
  avatarUrl: t.Optional(t.String())
});

export const updateUser = new Elysia()
  .use(authSessionPlugin)
  .use(prismaPlugin)
  .post(
    "/:userId",
    async ({ prisma, user, params: { userId }, body: { firstName, lastName, title, image } }) => {
      if (!user) {
        throw new Error("Authentication required");
      }
      // TODO: Only allow owner or admin to update user

      logger.info(`Updating user prev avatarUrl ${user.avatarUrl}`);
      const avatarUrl = image != null ? await uploadAvatar(user.tenantId, userId, image) : user.avatarUrl;
      await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          title,
          avatarUrl
        },
        select: { id: true, firstName: true, lastName: true, title: true, avatarUrl: true }
      });

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        title: user.title,
        avatarUrl: user.avatarUrl
      };
    },
    {
      params: updateUserRequestParamsDto,
      body: updateUserRequestBodyDto,
      response: updateUserResponseDto
    }
  );
