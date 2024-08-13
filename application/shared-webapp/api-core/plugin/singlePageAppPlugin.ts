import { staticPlugin } from "@elysiajs/static";
import "@repo/build/environment.d.ts";
import { Elysia } from "elysia";
import fs, { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { config } from "../infrastructure/config";
import { ContentType } from "./ContentType";
import { nocachePlugin } from "./nocache";
import { authSessionPlugin } from "./authSessionPlugin";
import type { TenantInfo, UserInfo } from "../infrastructure/lucia";
import { tenantInfoPlugin } from "./tenantInfoPlugin";

const htmlTemplatePath = path.join(config.paths.webAppDist, "index.html");
const remoteEntryJsPath = path.join(config.paths.webAppDist, "remoteEntry.js");

// Create the web app dist directory if it does not exist
if (!existsSync(config.paths.webAppDist)) {
  mkdirSync(config.paths.webAppDist, { recursive: true });
}

export const singlePageAppPlugin = new Elysia({
  name: "single-page-app-plugin",
  aot: false
})
  // Serve the WebApp dist directory
  .use(
    staticPlugin({
      indexHTML: false,
      assets: config.paths.webAppDist,
      prefix: "/",
      ignorePatterns: [".*", "/remoteEntry.js"],
      alwaysStatic: true
    })
  )
  .use(nocachePlugin)
  // Serve remote entry for module federation
  .get("/remoteEntry.js", ({ set }) => {
    set.headers["Content-Type"] = ContentType.JAVASCRIPT;
    return getFile(remoteEntryJsPath);
  })
  // Serve the single page app
  .use(authSessionPlugin)
  .use(tenantInfoPlugin)
  .get("/*", ({ set, userInfo, tenantInfo }) => {
    set.headers["Content-Type"] = ContentType.HTML;
    return getHtmlWithEnvironment(tenantInfo, userInfo);
  });

/**
 * Get HTML with environment variables and user info
 */
function getHtmlWithEnvironment(tenantInfo: TenantInfo, userInfo: UserInfo): string {
  const staticRuntimeEnvironment: RuntimeEnv = {
    PUBLIC_URL: config.env.PUBLIC_URL,
    CDN_URL: config.env.CDN_URL,
    APPLICATION_VERSION: config.env.APPLICATION_VERSION,
    LOCALE: userInfo.locale,
    SYSTEM_NAME: config.system.name
  };

  const staticRuntimeEnvironmentEncoded = Buffer.from(JSON.stringify(staticRuntimeEnvironment)).toString("base64");
  const encodedTenantInfo = Buffer.from(JSON.stringify(tenantInfo)).toString("base64");
  const encodedUserInfo = Buffer.from(JSON.stringify(userInfo)).toString("base64");

  let html = getFile(htmlTemplatePath);
  html = html.replaceAll("%ENCODED_RUNTIME_ENV%", staticRuntimeEnvironmentEncoded);
  html = html.replaceAll("%ENCODED_USER_INFO_ENV%", encodedUserInfo);
  html = html.replaceAll("%ENCODED_TENANT_INFO_ENV%", encodedTenantInfo);
  html = html.replaceAll("%LOCALE%", userInfo.locale);

  for (const [key, value] of Object.entries(staticRuntimeEnvironment)) {
    html = html.replaceAll(`%${key}%`, value);
  }

  return html;
}

const fileCache = new Map<string, string>();

/**
 * Get file content
 * Note: Uses cache in production mode
 */
function getFile(filePath: string): string {
  if (fileCache.has(filePath) && !config.isDevelopment) {
    return fileCache.get(filePath) as string;
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: "${filePath}"`);
  }

  fileCache.set(filePath, fs.readFileSync(filePath, "utf8"));

  return fileCache.get(filePath) as string;
}
