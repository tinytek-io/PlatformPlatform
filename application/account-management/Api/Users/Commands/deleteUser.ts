import { Elysia, t } from "elysia";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";
import { deleteUserAvatars } from "../Domain/Avatar";

const deleteUserRequestDto = t.Object({
  userId: t.String()
});

export const deleteUser = new Elysia().use(prismaPlugin).post(
  "/delete",
  async ({ prisma, body: { userId } }) => {
    const deletedUser = await prisma.user.delete({ where: { id: userId } });
    if (deletedUser) {
      await deleteUserAvatars(deletedUser.tenantId, deletedUser.id);
    }
  },
  {
    body: deleteUserRequestDto,
    response: t.Void()
  }
);
