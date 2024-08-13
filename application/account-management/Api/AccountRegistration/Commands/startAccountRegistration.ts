import Elysia, { t } from "elysia";
import { createAccountRegistration, sendVerificationCode } from "../Domain/accountRegistration";
import { generateEmailVerificationCode } from "../Domain/generateEmailVerificationCode";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";

const AccountRegistrationRequestDto = t.Object({
  email: t.String({
    format: "email"
  }),
  subdomain: t.String({
    minLength: 3,
    maxLength: 63
  }),
  region: t.Optional(t.String())
});

const AccountRegistrationResponseDto = t.Object({
  validForSeconds: t.Number(),
  accountRegistrationId: t.String()
});

export const startAccountRegistration = new Elysia().use(prismaPlugin).post(
  "/start",
  async ({ prisma, body: { email, subdomain } }) => {
    const accountRegistrationId = await createAccountRegistration(prisma, { email, subdomain });
    const { code, validForSeconds } = await generateEmailVerificationCode(email);
    await sendVerificationCode(email, code);

    return { validForSeconds, accountRegistrationId };
  },
  {
    body: AccountRegistrationRequestDto,
    response: AccountRegistrationResponseDto
  }
);
