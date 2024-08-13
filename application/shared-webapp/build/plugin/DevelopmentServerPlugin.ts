import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { logger } from "@rsbuild/core";
import type { RsbuildConfig, RsbuildPlugin } from "@rsbuild/core";

/**
 * Build ignore pattern for the dist folder
 */
const applicationRoot = path.resolve(process.cwd(), "..", "..");
const certificateRoot = path.join(applicationRoot, "..", "infrastructure", "local", "certs");
const distFolder = path.join(process.cwd(), "dist");
const ignoreDistPattern = `**/${path.relative(applicationRoot, distFolder)}/**`;

/**
 * Files to write to disk for the development server to serve
 */
const writeToDisk = ["index.html", "remoteEntry.js", "robots.txt", "favicon.ico"];

export type DevelopmentServerPluginOptions = {
  /**
   * The port to start the development server on
   */
  port?: number;
};

/**
 * RsBuild plugin to configure the development server to use the TypeScriptPlatform.pfx certificate and
 * allow CORS for the TypeScriptPlatform server.
 *
 * @param options - The options for the plugin
 */
export function DevelopmentServerPlugin(options: DevelopmentServerPluginOptions = {}): RsbuildPlugin {
  return {
    name: "DevelopmentServerPlugin",
    setup(api) {
      api.modifyRsbuildConfig((userConfig, { mergeRsbuildConfig }) => {
        if (process.env.NODE_ENV === "production") {
          // Do not modify the rsbuild config in production
          return userConfig;
        }

        const certKeyPath = path.join(certificateRoot, "cert.key");
        const certPemPath = path.join(certificateRoot, "cert.pem");

        if (fs.existsSync(certKeyPath) === false) {
          throw new Error(`Certificate key not found at path: ${certKeyPath}`);
        }

        if (fs.existsSync(certPemPath) === false) {
          throw new Error(`Certificate pem not found at path: ${certPemPath}`);
        }

        logger.info(`Using ignore pattern: ${ignoreDistPattern}`);

        const extraConfig: RsbuildConfig = {
          server: {
            // If the port is occupied the server will exit with an error
            strictPort: true,
            // Allow CORS for the TypeScriptPlatform server
            headers: {
              "Access-Control-Allow-Origin": "*"
            },
            // Start the server on the specified port with the TypeScriptPlatform.pfx certificate
            port: options.port ?? Number.parseInt(process.env.PORT ?? "3000", 10),
            https: {
              key: fs.readFileSync(certKeyPath),
              cert: fs.readFileSync(certPemPath)
            }
          },
          dev: {
            // Set publicPath to auto to enable the server to serve the files
            assetPrefix: "auto",
            // Write files to "dist" folder enabling the Api to serve them
            writeToDisk: (filename: string) => {
              return writeToDisk.some((file) => filename.endsWith(file));
            }
          },
          tools: {
            rspack: {
              watchOptions: {
                // Ignore the dist folder to prevent infinite loop as we are writing files to dist
                ignored: ignoreDistPattern
              }
            }
          }
        };

        return mergeRsbuildConfig(userConfig, extraConfig);
      });
    }
  };
}
