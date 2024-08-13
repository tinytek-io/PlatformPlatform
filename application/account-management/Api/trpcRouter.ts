import { router } from "@repo/api-core/trpc";
import { changeSubdomain } from "./Tenants/Commands/changeSubdomain";
import { deleteTenant } from "./Tenants/Commands/deleteTenant";
import { updateTenant } from "./Tenants/Commands/updateTenant";
import { getTenant } from "./Tenants/Queries/getTenant";
import { changeUserRole } from "./Users/Commands/changeUserRole";
import { createUser } from "./Users/Commands/createUser";
import { deleteUser } from "./Users/Commands/deleteUser";
import { removeAvatar } from "./Users/Commands/removeAvatar";
import { updateUser } from "./Users/Commands/updateUser";
import { updateAvatar } from "./Users/Commands/updateAvatar";
import { getUser } from "./Users/Queries/getUser";
import { getUsers } from "./Users/Queries/getUsers";
import { completeAccountRegistration } from "./AccountRegistration/Commands/completeAccountRegistration";
import { startAccountRegistration } from "./AccountRegistration/Commands/startAccountRegistration";
import { isSubdomainFreeEndpoints } from "./AccountRegistration/Queries/isSubdomainFree";

export const appRouter = router({
  // AccountRegistration
  completeAccountRegistration,
  startAccountRegistration,
  isSubdomainFree: isSubdomainFreeEndpoints,

  // Tenants
  changeSubdomain,
  deleteTenant,
  updateTenant,
  getTenant,

  // Users
  changeUserRole,
  createUser,
  deleteUser,
  removeAvatar,
  updateAvatar,
  updateUser,
  getUser,
  getUsers
});

export type AppRouter = typeof appRouter;
