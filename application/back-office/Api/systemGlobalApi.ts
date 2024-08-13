/**
 * Global API routes that are not system specific and not namespaced!
 *
 * Examples: Central endpoints like sign-up, sign-in, etc.
 * Note: Requires communication with other systems due to the risk of name collisions
 */
import { createSystemGlobalApi } from "@repo/api-core/elysiaServer";

export const systemGlobalApi = createSystemGlobalApi("back-office");
