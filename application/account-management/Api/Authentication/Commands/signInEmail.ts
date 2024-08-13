import { sendVerificationCode } from "@/AccountRegistration/Domain/accountRegistration";
import { generateEmailVerificationCode } from "@/AccountRegistration/Domain/generateEmailVerificationCode";
import { authSessionPlugin } from "@repo/api-core/plugin/authSessionPlugin";
import Elysia, { t } from "elysia";

const EmailSignInRequestDto = t.Object({
  email: t.String({
    format: "email"
  })
});

const EmailSignInResponseDto = t.Object({
  validForSeconds: t.Number()
});

export const signInEmail = new Elysia().use(authSessionPlugin).post(
  "/otp/sign-in",
  async ({ body: { email } }) => {
    const { code, validForSeconds } = await generateEmailVerificationCode(email);
    await sendVerificationCode(email, code);

    return { validForSeconds };
  },
  {
    body: EmailSignInRequestDto,
    response: EmailSignInResponseDto
  }
);
