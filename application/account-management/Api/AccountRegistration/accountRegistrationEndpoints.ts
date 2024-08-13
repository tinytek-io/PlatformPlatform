import Elysia from "elysia";
import { startAccountRegistration } from "./Commands/startAccountRegistration";
import { isSubdomainFreeEndpoints } from "./Queries/isSubdomainFree";
import { completeAccountRegistration } from "./Commands/completeAccountRegistration";

export const accountRegistrationEndpoints = new Elysia({
  name: "account-registration-endpoints",
  prefix: "/account-registration"
})
  .use(startAccountRegistration)
  .use(completeAccountRegistration)
  .use(isSubdomainFreeEndpoints);
