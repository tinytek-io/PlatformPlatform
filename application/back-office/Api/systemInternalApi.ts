/**
 * Internal API only accessible within the cluster
 *
 * Examples: Health checks, monitoring, and system management
 *
 * Note: Inter system communication should be done via internal APIs but should
 * never cascade to other systems! (internal APIs should be used sparingly)
 */
import { createSystemInternalApi } from "@repo/api-core/elysiaServer";

export const systemInternalApi = createSystemInternalApi("back-office");
