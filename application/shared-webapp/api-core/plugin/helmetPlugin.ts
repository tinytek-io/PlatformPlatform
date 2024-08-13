import type { IncomingMessage, ServerResponse } from "node:http";
import { Elysia } from "elysia";
import helmet from "helmet";
import { config } from "../infrastructure/config";

const trustedCdnHost = "https://platformplatformgithub.blob.core.windows.net";
const gravatarHost = "https://gravatar.com";
let trustedHosts = `${config.env.PUBLIC_URL} ${config.env.CDN_URL} ${trustedCdnHost} ${gravatarHost}`;

if (config.isDevelopment) {
  trustedHosts += " wss://localhost:* https://localhost:* ws://localhost:*";
  trustedHosts += " wss://local.tinytek.dev:* wss://*.local.tinytek.dev:*";
}

const runHelmet = helmet({
  hsts: !config.isDevelopment,
  contentSecurityPolicy: {
    directives: {
      "default-src": [trustedHosts],
      "script-src": [trustedHosts, "'strict-dynamic'", "https:"],
      "script-src-elem": [trustedHosts],
      "connect-src": [trustedHosts],
      "img-src": [trustedHosts, "data:"],
      "object-src": ["'none'"],
      "base-uri": ["'none'"],
      // referrer: ["no-referrer", "strict-origin-when-cross-origin"],
      // "permissions-policy": getPermissionsPolicies(),
      upgradeInsecureRequests: config.isDevelopment ? null : []
    }
  }
});

export const helmetPlugin = new Elysia({
  name: "helmet-plugin"
}).onRequest(async ({ set }) => {
  return new Promise<unknown>((resolve) => {
    const locals: Record<string, string> = {};
    runHelmet(
      {} as IncomingMessage, // Note: helmet does not use the request object
      {
        setHeader(name: string, value: string) {
          set.headers[name] = value;
        },
        removeHeader(name: string) {
          delete set.headers[name];
        },
        locals
      } as unknown as ServerResponse,
      resolve
    );
  });
});

function getPermissionsPolicies() {
  const permissionsPolicies = {
    geolocation: [],
    microphone: [],
    camera: [],
    "picture-in-picture": [],
    "display-capture": [],
    fullscreen: [],
    "web-share": [],
    "identity-credentials-get": []
  };

  return Object.entries(permissionsPolicies).map(([key, value]) => `${key}=(${value.join(", ")})`);
}
