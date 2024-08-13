/**
 * Public API accessible by external clients and requires versioning,
 * documentation and communication
 *
 * Usage: External clients, other systems, and third-party integrations
 * Note: Public APIs should be versioned and documented and are therefore more
 * rigid and expensive to maintain than private APIs
 */
import { createSystemPublicApi } from "@repo/api-core/elysiaServer";

export const systemPublicApi = createSystemPublicApi("back-office", "v1").get(
  "/placeholder",
  () => "Welcome to the back office public API"
);
