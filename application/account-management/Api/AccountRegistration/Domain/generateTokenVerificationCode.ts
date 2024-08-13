import { TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import { prisma } from "@repo/api-core/infrastructure/database";

export async function generateTokenVerificationCode(email: string) {
  await prisma.emailVerificationCode.deleteMany({
    where: {
      email,
      expiresAt: {
        lte: new Date()
      }
    }
  });
  const code = generateRandomString(20, alphabet("0-9", "A-Z"));
  const lifeSpan = new TimeSpan(5, "m");
  try {
    await prisma.emailVerificationCode.create({
      data: {
        email,
        code,
        expiresAt: createDate(lifeSpan)
      }
    });
    return { code, validForSeconds: lifeSpan.seconds() };
  } catch (error) {
    throw new Error("Failed to generate email verification code");
  }
}
