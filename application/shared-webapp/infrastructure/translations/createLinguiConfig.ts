import fs from "node:fs";
import path from "node:path";
import type { LinguiConfig } from "@lingui/conf";
import { formatter } from "@lingui/format-po";
import i18nConfig from "./i18n.config.json";

export function createLinguiConfig(): LinguiConfig {
  // Include translations from shared-webapp dependencies
  const systemPackageJsonPath = path.join(process.cwd(), "package.json");
  if (fs.existsSync(systemPackageJsonPath) === false) {
    throw new Error(`Could not find system "package.json": ${systemPackageJsonPath}`);
  }
  const { dependencies = {} } = require(systemPackageJsonPath) as { dependencies?: Record<string, string> };

  const sharedWebappDependencies = Object.keys(dependencies)
    .filter((d) => d.startsWith("@repo/"))
    .map((d) => d.replace("@repo/", ""));

  console.info("Include translations for:", sharedWebappDependencies);
  return {
    locales: Object.keys(i18nConfig),
    sourceLocale: "en-US",
    pseudoLocale: "pseudo",
    catalogs: [
      {
        path: "<rootDir>/translations/locale/{locale}",
        include: ["<rootDir>", ...sharedWebappDependencies.map((d) => `<rootDir>/../../shared-webapp/${d}/**`)],
        exclude: ["**/node_modules/**", "**/dist", "**/*.d.ts", "**/*.test.*", "**/.*"]
      }
    ],
    format: formatter({ origins: false })
  };
}
