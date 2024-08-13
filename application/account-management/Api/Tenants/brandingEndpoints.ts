import { Elysia, t } from "elysia";
import { getBrandingReadableStream } from "./Domain/branding";

export const brandingEndpoints = new Elysia({
  name: "tenant-branding-endpoints",
  tags: ["Users"]
}).get(
  "/branding/:tenantId/:namespace/:hash",
  async function getAvatarImage({ params: { tenantId, namespace, hash }, set }) {
    const readableStream = await getBrandingReadableStream(tenantId, namespace, hash);
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
      namespace: t.String(),
      hash: t.String()
    })
    // response: t.File()
  }
);
