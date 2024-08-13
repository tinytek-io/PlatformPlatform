import { Elysia, t } from "elysia";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";
import { isSubdomainFree } from "../Domain/accountRegistration";

const IsSubdomainFreeRequestDto = t.Object({
  subdomain: t.String({
    minLength: 3,
    maxLength: 63
  })
});

const IsSubdomainFreeResponseDto = t.Boolean();

export const isSubdomainFreeEndpoints = new Elysia().use(prismaPlugin).get(
  "/is-subdomain-free",
  async ({ prisma, query: { subdomain } }) => {
    return await isSubdomainFree(prisma, subdomain);
  },
  {
    query: IsSubdomainFreeRequestDto,
    response: IsSubdomainFreeResponseDto
  }
);
