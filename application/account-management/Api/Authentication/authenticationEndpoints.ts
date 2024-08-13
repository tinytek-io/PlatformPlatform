import Elysia from "elysia";
import { signOut } from "./Commands/signOut";
import { authSessionCleanupPlugin } from "@repo/api-core/plugin/authSessionCleanupPlugin";
import { signInEmail } from "./Commands/signInEmail";
import { verifyEmail } from "./Commands/verifyEmail";
import { currentUserInfo } from "./Queries/currentUserInfo";
import { currentTenantInfo } from "./Queries/currentTenantInfo";

export const authenticationEndpoints = new Elysia({
  name: "authentication-endpoints",
  prefix: "/authentication",
  tags: ["Authentication"]
})
  .use(authSessionCleanupPlugin)
  .use(currentUserInfo)
  .use(currentTenantInfo)
  .use(signOut)
  .use(signInEmail)
  .use(verifyEmail);
