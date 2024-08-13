import { createFileRoute } from "@tanstack/react-router";
import { UserTabs } from "./-components/UserTabs";
import { UserQuerying } from "./-components/UserQuerying";
import { UserTable } from "./-components/UserTable";
import { UserInvite } from "./-components/UserInvite";
import { z } from "zod";

const userPageSearchSchema = z.object({
  pageOffset: z.number().default(0).optional(),
  orderBy: z
    .enum(["createdAt", "updatedAt", "email", "role", "firstName", "lastName", "title", "emailVerified", "status"])
    .default("createdAt")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional()
});

export const Route = createFileRoute("/account-management/users/")({
  component: UsersPage,
  validateSearch: userPageSearchSchema
});

export default function UsersPage() {
  return (
    <>
      <UserInvite />
      <UserTabs />
      <UserQuerying />
      <UserTable />
    </>
  );
}
