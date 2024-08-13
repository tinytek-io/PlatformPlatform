import { blobServiceClient } from "@repo/api-core/infrastructure/storage";

async function deleteTenantAvatars(tenantId: string) {
  const containerClient = blobServiceClient.getContainerClient("avatars");
  const avatarPath = `${tenantId}/`;
  for await (const blob of containerClient.listBlobsFlat({ prefix: avatarPath })) {
    await containerClient.getBlockBlobClient(blob.name).delete();
  }
}

export async function deleteTenantStorage(tenantId: string) {
  await deleteTenantAvatars(tenantId);
}

