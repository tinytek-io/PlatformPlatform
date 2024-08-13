/**
 * Private API are not versioned and are intended for the system use only
 *
 * Examples: Send data to the front-end etc. part of the system
 * Note: Any external usage of these APIs should be avoided, prefer public APIs
 */
import { createSystemPrivateApi } from "@repo/api-core/elysiaServer";
import { accountRegistrationEndpoints } from "./AccountRegistration/accountRegistrationEndpoints";
import { usersEndpoints } from "./Users/usersEndpoints";
import { tenantsEndpoints } from "./Tenants/tenantsEndpoints";

export const systemPrivateApi = createSystemPrivateApi("account-management")
  .use(accountRegistrationEndpoints)
  .use(tenantsEndpoints)
  .use(usersEndpoints);
