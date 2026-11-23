/** Supported locales; stored in a cookie instead of a `[locale]` URL segment (most routes are behind auth). */
export const SUPPORTED_LOCALES = ["es", "en"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "es";

/** Cookie name next-intl reads by convention. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isSupportedLocale(
  value: string | undefined | null,
): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale);
}

/** Native-language labels so the switcher stays readable regardless of active locale. */
export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  es: "Español",
  en: "English",
};
