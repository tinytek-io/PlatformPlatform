import { Elysia, t } from "elysia";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";
import { i18n } from "@lingui/core";

const getUserRequestDto = t.Object({
  userId: t.String()
});

const getUserResponseDto = t.Object({
  id: t.String(),
  createdAt: t.String(),
  updatedAt: t.String(),
  email: t.String({
    format: "email"
  }),
  role: t.String(),
  firstName: t.Nullable(t.String()),
  lastName: t.Nullable(t.String()),
  title: t.Nullable(t.String()),
  emailVerified: t.Boolean(),
  status: t.String(),
  avatarUrl: t.Nullable(t.String())
});

export const getUser = new Elysia().use(prismaPlugin).get(
  "/:userId",
  async ({ prisma, error, params: { userId } }) => {
    const result = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        title: true,
        emailVerified: true,
        status: true,
        avatarUrl: true
      }
    });

    if (!result) {
      return error(404, i18n.t("User not found"));
    }

    return {
      id: result.id,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
      email: result.email,
      role: result.role,
      firstName: result.firstName,
      lastName: result.lastName,
      title: result.title,
      emailVerified: result.emailVerified,
      status: result.status,
      avatarUrl: result.avatarUrl
    };
  },
  {
    params: getUserRequestDto,
    response: {
      200: getUserResponseDto,
      404: t.String()
    }
  }
);
