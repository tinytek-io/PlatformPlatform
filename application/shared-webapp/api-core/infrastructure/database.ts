import { Prisma, PrismaClient } from "@prisma/client";
import { type JWTClaims, JWTClaimsSchema } from "./jwtClaims";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export function bypassRLS() {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`,
              query(args)
            ]);
            return result;
          }
        }
      }
    })
  );
}

export function forJWT(jwtClaims: JWTClaims) {
  const claims = JWTClaimsSchema.parse(jwtClaims);

  const claimsString = JSON.stringify(claims);

  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('request.jwt.claims', ${claimsString}, TRUE)`,
              query(args)
            ]);
            return result;
          }
        }
      }
    })
  );
}

export const getJwtPrisma = (jwtClaims: JWTClaims) => prisma.$extends(forJWT(jwtClaims));

export const getBypassRLSPrisma = () => prisma.$extends(bypassRLS());

export const getAnonPrisma = () => prisma;
