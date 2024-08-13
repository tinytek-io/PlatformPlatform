import { type I18n, setupI18n, type AllMessages, type Messages } from "@lingui/core";
import fs from "node:fs";
import path from "node:path";
import { config } from "@repo/api-core/infrastructure/config";

export type Locale = (typeof config.availableLocales)[number];
export const availableLocales: Readonly<Locale[]> = config.availableLocales;

type AllI18nInstances = { [K in Locale]: I18n };

export const defaultLocale: Readonly<Locale> = "en-US";

export async function createI18nInstances(): Promise<AllI18nInstances> {
  const i18nInstances: AllI18nInstances = {} as AllI18nInstances;

  for (const locale of config.availableLocales) {
    const translationFile = path.join(process.cwd(), "translations", `${locale}`);
    const { messages } = (await import(translationFile)) as { messages: Messages };
    const allMessages: AllMessages = {
      [locale]: messages
    };
    i18nInstances[locale] = setupI18n({
      locale,
      messages: allMessages
    });
  }
  return i18nInstances;
}

const allI18nInstances = await createI18nInstances();

const defaultI18n = allI18nInstances[defaultLocale];

export function getI18n(locale?: Locale): I18n {
  return allI18nInstances[locale ?? defaultLocale] ?? defaultI18n;
}
