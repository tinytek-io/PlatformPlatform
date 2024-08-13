import { Elysia, t } from "elysia";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";
import { uploadAvatar } from "../Domain/Avatar";

const updateAvatarRequestDto = t.Object({
  tenantId: t.String(),
  userId: t.String(),
  file: t.File({
    type: "image/png",
    maxSize: "1m"
  })
});

export const updateAvatar = new Elysia().use(prismaPlugin).post(
  "/avatar/update",
  async ({ prisma, body: { tenantId, userId, file } }) => {
    const avatarUrl = await uploadAvatar(tenantId, userId, file);
    await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl
      }
    });
  },
  {
    body: updateAvatarRequestDto,
    response: t.Void()
  }
);
