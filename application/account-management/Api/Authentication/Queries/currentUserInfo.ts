import { authSessionPlugin } from "@repo/api-core/plugin/authSessionPlugin";
import { Elysia } from "elysia";

export const currentUserInfo = new Elysia().use(authSessionPlugin).get("/user-info", async ({ userInfo }) => {
  return userInfo;
});
