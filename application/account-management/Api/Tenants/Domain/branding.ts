import crypto from "node:crypto";
import { Stream } from "node:stream";
import { blobServiceClient } from "@repo/api-core/infrastructure/storage";

export async function getBrandingReadableStream(tenantId: string, namespace: string, hash: string) {
  const containerClient = blobServiceClient.getContainerClient("branding");
  const response = await containerClient.getBlockBlobClient(`${tenantId}/${namespace}/${hash}`).download();
  return response.readableStreamBody != null ? Stream.Readable.from(response.readableStreamBody) : null;
}

export async function uploadBrandingImage(tenantId: string, namespace: string, file: File) {
  if (!(file instanceof File)) {
    throw new Error(`Invalid file, type: "${typeof file}"`);
  }
  const hash = crypto.randomUUID();
  const imageFilename = `${hash}.${getFileExtension(file)}`;
  const containerClient = blobServiceClient.getContainerClient("branding");
  await containerClient
    .getBlockBlobClient(`${tenantId}/${namespace}/${imageFilename}`)
    .uploadData(await file.arrayBuffer());
  return imageFilename;
}

function getFileExtension(file: File) {
  if (file.type.startsWith("image/")) {
    return file.type.split("/")[1];
  }
  const parts = file.name.split(".");
  return parts[parts.length - 1];
}
