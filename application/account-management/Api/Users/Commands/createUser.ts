import { Elysia, t } from "elysia";
import { $Enums } from "@prisma/client";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";

const createUserRequestDto = t.Object({
  tenantId: t.String(),
  email: t.String({
    email: true
  }),
  firstName: t.Optional(t.String()),
  lastName: t.Optional(t.String()),
  role: t.Enum($Enums.UserRole),
  emailConfirmed: t.Boolean()
});

const createUserResponseDto = t.Object({
  id: t.String()
});

export const createUser = new Elysia().use(prismaPlugin).post(
  "/create",
  async ({ prisma, body: { tenantId, email, firstName, lastName, role, emailConfirmed } }) => {
    const user = await prisma.user.create({
      data: {
        tenantId,
        email,
        role,
        firstName,
        lastName,
        emailVerified: emailConfirmed,
        authProvider: $Enums.AuthProvider.EMAIL_OTP,
        status: $Enums.UserStatus.ACTIVE
      }
    });

    return {
      id: user.id
    };
  },
  {
    body: createUserRequestDto,
    response: createUserResponseDto
  }
);
