import { Elysia } from "elysia";
import { changeUserRole } from "./Commands/changeUserRole";
import { createUser } from "./Commands/createUser";
import { deleteUser } from "./Commands/deleteUser";
import { removeAvatar } from "./Commands/removeAvatar";
import { updateAvatar } from "./Commands/updateAvatar";
import { updateUser } from "./Commands/updateUser";
import { getUser } from "./Queries/getUser";
import { getUsers } from "./Queries/getUsers";

export const usersEndpoints = new Elysia({
  name: "users-endpoints",
  prefix: "/users",
  tags: ["Users"]
})
  .use(changeUserRole)
  .use(createUser)
  .use(deleteUser)
  .use(removeAvatar)
  .use(updateAvatar)
  .use(updateUser)
  .use(getUser)
  .use(getUsers);
