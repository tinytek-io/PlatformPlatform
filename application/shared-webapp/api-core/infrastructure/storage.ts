import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
import { config } from "./config";

export const blobServiceClient = createBlobStorageClient();

function createBlobStorageClient() {
  if (config.isRunningInAzure) {
    if (!config.env.BLOB_STORAGE_URL) {
      throw new Error("BLOB_STORAGE_URL is required when running in Azure");
    }

    const defaultAzureCredential = new DefaultAzureCredential();

    return new BlobServiceClient(config.env.BLOB_STORAGE_URL, defaultAzureCredential);
  }

  if (!config.env.AZURITE_CONNECTION_STRING) {
    throw new Error("AZURITE_CONNECTION_STRING is required when running locally");
  }
  return BlobServiceClient.fromConnectionString(config.env.AZURITE_CONNECTION_STRING);
}

export async function createBlobContainer(containerName: string) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const createContainerResponse = await containerClient.createIfNotExists();
  console.log(`Create container ${containerName} successfully`, createContainerResponse.requestId);
}
