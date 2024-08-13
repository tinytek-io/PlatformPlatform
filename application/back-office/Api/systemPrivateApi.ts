/**
 * Private API are not versioned and are intended for the system use only
 *
 * Examples: Send data to the front-end etc. part of the system
 * Note: Any external usage of these APIs should be avoided, prefer public APIs
 */
import { createSystemPrivateApi } from "@repo/api-core/elysiaServer";

export const systemPrivateApi = createSystemPrivateApi("back-office").get(
  "/placeholder",
  () => "Welcome to the back office private API"
);
