import { Elysia } from "elysia";
import Negotiator from "negotiator";
import { config } from "../infrastructure/config";
import { defaultLocale, type Locale } from "../infrastructure/i18n";

export const localePlugin = new Elysia({
  name: "locale-plugin"
}).derive({ as: "global" }, ({ headers }) => {
  const languages = new Negotiator({
    headers: {
      "accept-language": headers["accept-language"]
    }
  }).languages([...config.availableLocales]) as Locale[];
  return {
    locale: languages[0] ?? defaultLocale
  };
});
