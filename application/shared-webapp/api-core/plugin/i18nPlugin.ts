import { Elysia } from "elysia";
import { defaultLocale, getI18n } from "../infrastructure/i18n";
import { localePlugin } from "./localePlugin";

export const i18nPlugin = new Elysia({
  name: "i18n-plugin"
})
  .use(localePlugin)
  .derive({ as: "scoped" }, ({ locale = defaultLocale }) => {
    // TODO: Include tenant and user specific locale settings
    return {
      i18n: getI18n(locale),
      locale
    };
  });
