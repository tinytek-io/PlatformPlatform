import { Elysia, t } from "elysia";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";
import { $Enums } from "@prisma/client";

const changeUserRoleRequestParamsDto = t.Object({
  userId: t.String()
});

const changeUserRoleRequestDto = t.Object({
  role: t.Enum($Enums.UserRole)
});

export const changeUserRole = new Elysia().use(prismaPlugin).post(
  "/:userId/role",
  async ({ prisma, params: { userId }, body: { role } }) => {
    // TODO: Only allow owner or admin to change user role
    await prisma.user.update({
      where: { id: userId },
      data: {
        role
      }
    });
  },
  {
    params: changeUserRoleRequestParamsDto,
    body: changeUserRoleRequestDto,
    response: t.Void()
  }
);
