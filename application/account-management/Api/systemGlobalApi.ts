/**
 * Global API routes that are not system specific and not namespaced!
 *
 * Examples: Central endpoints like sign-up, sign-in, etc.
 * Note: Requires communication with other systems due to the risk of name collisions
 */
import { createSystemGlobalApi } from "@repo/api-core/elysiaServer";
import { authenticationEndpoints } from "./Authentication/authenticationEndpoints";
import { avatarEndpoints } from "./Users/avatarEndpoints";
import { brandingEndpoints } from "./Tenants/brandingEndpoints";

export const systemGlobalApi = createSystemGlobalApi("account-management")
  .use(authenticationEndpoints)
  .use(brandingEndpoints)
  .use(avatarEndpoints);
