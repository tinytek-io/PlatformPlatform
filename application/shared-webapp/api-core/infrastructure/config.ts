import { z } from "zod";
import fs from "node:fs";
import path from "node:path";

const isDevelopment = process.env.NODE_ENV !== "production";

const systemPath = path.resolve(process.cwd(), "..");
const webAppDistPath = path.resolve(systemPath, "WebApp", "dist");
const applicationPath = path.resolve(systemPath, "..");
const repositoryPath = path.resolve(applicationPath, "..");
const infrastructurePath = path.resolve(repositoryPath, "infrastructure");
const localInfrastructurePath = path.resolve(repositoryPath, "infrastructure", "local");
const localCertificatePath = path.resolve(repositoryPath, localInfrastructurePath, "certs");
const systemName = path.relative(applicationPath, systemPath);
const type = path.relative(systemPath, process.cwd()).toLowerCase();

const environmentSchema = z.object({
  // Application configuration
  APPLICATION_VERSION: z.string().optional().default("0.0.0"),
  PUBLIC_URL: z.string(),
  CDN_URL: z.string(),

  // Authentication configuration
  AUTH_SECRET: z.string(),

  // Azure configuration
  AZURE_CLIENT_ID: z.string().optional(),

  // Development port
  PORT: z.string(),

  // Email configuration
  EMAIL_FROM: z.string(),
  EMAIL_SERVER: z.string(),
  EMAIL_HOST: z.string().optional().default("localhost"),
  EMAIL_PORT: z.string().optional().default("1025"),
  EMAIL_SECURE: z.boolean().optional().default(false),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),

  // Azure storage configuration
  AZURITE_CONNECTION_STRING: z.string().optional(),
  BLOB_STORAGE_URL: z.string().url().optional(),

  // OAuth configuration
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),

  // OpenTelemetry configuration
  OTEL_EXPORTER_OTLP_PROTOCOL: z.string(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string(),

  // Redis configuration
  REDIS_URL: z.string()
});

type SslType = {
  key: string;
  cert: string;
};

let ssl: SslType | null = null;

if (isDevelopment) {
  ssl = {
    key: fs.readFileSync(path.join(localCertificatePath, "cert.key"), "utf8"),
    cert: fs.readFileSync(path.join(localCertificatePath, "cert.pem"), "utf8")
  };
}

if (ssl == null) {
  throw new Error("SSL configuration is required");
}

export const environmentConfig = environmentSchema.parse(process.env);

export const config = {
  availableLocales: ["en-US", "da-DK"] as const,
  env: environmentConfig,
  isDevelopment,
  isProduction: process.env.NODE_ENV === "production",
  isRunningInAzure: environmentConfig.AZURE_CLIENT_ID != null,
  system: {
    name: systemName,
    type,
  },
  ssl,
  paths: {
    system: systemPath,
    application: applicationPath,
    repository: repositoryPath,
    infrastructure: infrastructurePath,
    localInfrastructure: localInfrastructurePath,
    localCertificate: localCertificatePath,
    webAppDist: webAppDistPath
  }
};
