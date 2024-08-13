import { Elysia, t, type Static } from "elysia";
import { prismaPlugin } from "@repo/api-core/plugin/prismaPlugin";
import { $Enums, Prisma } from "@prisma/client";
import { tenantInfoPlugin } from "@repo/api-core/plugin/tenantInfoPlugin";

const userDto = t.Object({
  id: t.String(),
  createdAt: t.String(),
  updatedAt: t.String(),
  email: t.String(),
  role: t.String(),
  firstName: t.Nullable(t.String()),
  lastName: t.Nullable(t.String()),
  title: t.Nullable(t.String()),
  emailVerified: t.Boolean(),
  status: t.String(),
  avatarUrl: t.Nullable(t.String())
});

type UserDto = Static<typeof userDto>;

const getUsersRequestDto = t.Object({
  search: t.Optional(t.String()),
  role: t.Optional(t.Enum($Enums.UserRole)),
  orderBy: t.Optional(
    t.Enum({
      id: "id",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      email: "email",
      role: "role",
      firstName: "firstName",
      lastName: "lastName",
      title: "title",
      emailVerified: "emailVerified",
      status: "status",
      avatarUrl: "avatarUrl"
    })
  ),
  sortOrder: t.Optional(t.Enum(Prisma.SortOrder)),
  pageSize: t.Optional(t.Number()),
  pageOffset: t.Optional(t.Number())
});

const getUsersResponseDto = t.Object({
  pageOffset: t.Number(),
  pageSize: t.Number(),
  total: t.Number(),
  users: t.Array(userDto)
});

export const getUsers = new Elysia()
  .use(prismaPlugin)
  .use(tenantInfoPlugin)
  .get(
    "/query",
    async ({
      prisma,
      tenantInfo,
      query: { search, role, orderBy = "createdAt", sortOrder = Prisma.SortOrder.asc, pageSize = 10, pageOffset = 0 }
    }) => {
      if (tenantInfo.id == null) {
        return {
          pageOffset: 0,
          pageSize: 0,
          total: 0,
          users: []
        };
      }
      const searchQuery: Prisma.UserWhereInput = search
        ? {
            OR: [
              {
                email: {
                  contains: search
                }
              },
              {
                firstName: {
                  contains: search
                }
              },
              {
                lastName: {
                  contains: search
                }
              }
            ]
          }
        : {};
      const query = {
        skip: pageOffset,
        take: pageSize,
        where: {
          ...searchQuery,
          role: role,
          status: "ACTIVE",
          tenantId: tenantInfo.id
        },
        orderBy: {
          [orderBy]: sortOrder
        },
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
      } satisfies Prisma.UserFindManyArgs;

      const [users, total] = await prisma.$transaction([
        prisma.user.findMany(query),
        prisma.user.count({ where: query.where })
      ]);

      const usersDto: UserDto[] = users.map((user) => ({
        id: user.id,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        title: user.title,
        emailVerified: user.emailVerified,
        status: user.status,
        avatarUrl: user.avatarUrl
      }));

      return {
        pageOffset,
        pageSize,
        total,
        users: usersDto
      };
    },
    {
      query: getUsersRequestDto,
      response: getUsersResponseDto
    }
  );
