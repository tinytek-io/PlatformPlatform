import Elysia from "elysia";

export const nocachePlugin = new Elysia({
  name: "nocache-plugin"
}).onAfterHandle(({ set }) => {
  set.headers["Surrogate-Control"] = "no-store";
  set.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, proxy-revalidate";
  set.headers.Expires = "0";
  set.headers.Pragma = "no-cache";
});
