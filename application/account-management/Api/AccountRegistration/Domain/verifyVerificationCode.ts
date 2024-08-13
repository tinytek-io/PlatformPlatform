import { isWithinExpirationDate } from "oslo";
import type { PrismaClient } from "@prisma/client";

export async function verifyVerificationCode(prisma: PrismaClient, email: string, code: string): Promise<boolean> {
  const emailVerificationCode = await prisma.emailVerificationCode.findUnique({
    where: {
      email,
      code
    }
  });

  if (!emailVerificationCode) {
    return false;
  }

  await prisma.emailVerificationCode.delete({
    where: {
      id: emailVerificationCode.id
    }
  });

  return isWithinExpirationDate(emailVerificationCode.expiresAt);
}
