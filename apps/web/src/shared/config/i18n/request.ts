import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, isSupportedLocale, LOCALE_COOKIE } from "./config";
import { MESSAGES } from "./messages";

// Locale is cookie-based (set by setLocaleAction) rather than route-segmented; see i18n/config.ts.
export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get(LOCALE_COOKIE)?.value;
  const locale = isSupportedLocale(cookieLocale)
    ? cookieLocale
    : DEFAULT_LOCALE;

  return { locale, messages: MESSAGES[locale] };
});
