import crypto from "node:crypto";
import { Stream } from "node:stream";
import { blobServiceClient } from "@repo/api-core/infrastructure/storage";
import { BlobSASPermissions } from "@azure/storage-blob";
import { TimeSpan } from "@repo/utils/time/TimeSpan";

export async function getAvatarUploadSASUrl(tenantId: string, userId: string, hash: string, extension = "png") {
  const containerClient = blobServiceClient.getContainerClient("avatars");
  return await containerClient.getBlockBlobClient(`${tenantId}/${userId}/${hash}.${extension}`).generateSasUrl({
    expiresOn: new Date(Date.now() + TimeSpan.fromMinutes(10).toMilliseconds()),
    permissions: BlobSASPermissions.parse("w")
  });
}

export async function getAvatarReadableStream(tenantId: string, userId: string, hash: string) {
  const containerClient = blobServiceClient.getContainerClient("avatars");
  const response = await containerClient.getBlockBlobClient(`${tenantId}/${userId}/${hash}`).download();
  return response.readableStreamBody != null ? Stream.Readable.from(response.readableStreamBody) : null;
}

export async function uploadAvatar(tenantId: string, userId: string, file: File) {
  if (!(file instanceof File)) {
    throw new Error(`Invalid file, type: "${typeof file}"`);
  }
  const hash = crypto.randomUUID();
  const avatarFilename = `${hash}.${getFileExtension(file)}`;
  const containerClient = blobServiceClient.getContainerClient("avatars");
  await containerClient
    .getBlockBlobClient(`${tenantId}/${userId}/${avatarFilename}`)
    .uploadData(await file.arrayBuffer());
  return avatarFilename;
}

export async function deleteUserAvatars(tenantId: string, userId: string) {
  const containerClient = blobServiceClient.getContainerClient("avatars");
  for await (const blob of containerClient.listBlobsFlat({ prefix: `${tenantId}/${userId}` })) {
    await containerClient.getBlockBlobClient(blob.name).delete();
  }
}

export async function renameTenant(tenantId: string, newTenantId: string) {
  const containerClient = blobServiceClient.getContainerClient("avatars");
  for await (const blob of containerClient.listBlobsFlat({ prefix: tenantId })) {
    const newBlobName = blob.name.replace(`/${tenantId}/`, `/${newTenantId}/`);
    (await containerClient.getBlockBlobClient(blob.name)).syncCopyFromURL(
      containerClient.getBlockBlobClient(newBlobName).url
    );
    await containerClient.getBlockBlobClient(blob.name).delete();
  }
}

function getFileExtension(file: File) {
  if (file.type.startsWith("image/")) {
    return file.type.split("/")[1];
  }
  const parts = file.name.split(".");
  return parts[parts.length - 1];
}
