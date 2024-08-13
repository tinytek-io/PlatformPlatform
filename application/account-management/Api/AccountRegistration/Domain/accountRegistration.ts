import { createDate, TimeSpan } from "oslo";
import { smtpServer } from "@repo/api-core/infrastructure/smtp";
import { config } from "@repo/api-core/infrastructure/config";
import type { PrismaClient } from "@prisma/client";
import { ProblemDetailsError } from "@repo/api-core/server/problemDetails/ProblemDetails";

type AccountRegistration = {
  email: string;
  subdomain: string;
};

export async function isSubdomainFree(prisma: PrismaClient, subdomain: string) {
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: subdomain
    },
    select: {
      id: true
    }
  });

  return tenant == null;
}

export async function createAccountRegistration(prisma: PrismaClient, { email, subdomain }: AccountRegistration) {
  await prisma.accountRegistration.deleteMany({
    where: {
      email,
      subdomain,
      expiresAt: {
        lte: new Date()
      }
    }
  });
  if ((await isSubdomainFree(prisma, subdomain)) !== true) {
    throw new ProblemDetailsError({
      status: 409,
      title: "Conflict",
      detail: `Subdomain is already taken "${subdomain}"`,
      errors: {
        subdomain: ["Subdomain is already taken"]
      }
    });
  }
  const existingAccountRegistration = await prisma.accountRegistration.findFirst({
    where: {
      email,
      subdomain
    }
  });
  if (existingAccountRegistration != null) {
    throw new ProblemDetailsError({
      status: 409,
      title: "Conflict",
      detail: `Account registration already exists for "${subdomain}", please check your email`,
      errors: {
        subdomain: ["Account registration already exists"]
      }
    });
  }
  try {
    const result = await prisma.accountRegistration.create({
      data: {
        email,
        subdomain,
        expiresAt: createDate(new TimeSpan(5, "m"))
      },
      select: {
        id: true
      }
    });

    return result.id;
  } catch (error) {
    throw new Error(`Failed to create account registration for "${subdomain}"`);
  }
}

export async function sendVerificationCode(email: string, code: string) {
  try {
    await smtpServer.sendMail({
      from: config.env.EMAIL_USER,
      to: email,
      subject: "Email verification code",
      text: `Your email verification code is: ${code}`,
      html: `Your email verification code is: <b>${code}</b>`
    });
  } catch (error) {
    throw new Error("Failed to send email verification code");
  }
}
