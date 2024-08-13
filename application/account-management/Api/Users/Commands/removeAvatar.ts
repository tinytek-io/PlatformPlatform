import { Elysia, t } from "elysia";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";

const removeAvatarRequestDto = t.Object({
  userId: t.String()
});

export const removeAvatar = new Elysia().use(prismaPlugin).delete(
  "/avatar/remove",
  async ({ prisma, body: { userId } }) => {
    await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: null
      }
    });
  },
  {
    body: removeAvatarRequestDto,
    response: t.Void()
  }
);
