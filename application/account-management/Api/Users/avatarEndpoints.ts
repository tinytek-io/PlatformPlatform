import { Elysia, t } from "elysia";
import { getAvatarReadableStream } from "./Domain/Avatar";

export const avatarEndpoints = new Elysia({
  name: "user-avatar-endpoints",
  tags: ["Users"]
}).get(
  "/avatars/:tenantId/:userId/:hash",
  async function getAvatarImage({ params: { tenantId, userId, hash }, set }) {
    const readableStream = await getAvatarReadableStream(tenantId, userId, hash);
    if (!readableStream) {
      set.status = 404;
      return;
    }
    set.headers["content-type"] = "image/png";

    return readableStream;
  },
  {
    params: t.Object({
      tenantId: t.String(),
      userId: t.String(),
      hash: t.String()
    })
    // response: t.File()
  }
);
