import type { SupportedLocale } from "@/shared/config/i18n/config";
import type { Messages } from "@/shared/config/i18n/messages";

/**
 * Enables compile-time type-checking for next-intl message keys against the Spanish reference catalogue
 * (messages.test.ts enforces key parity across all locales).
 */
declare module "next-intl" {
  interface AppConfig {
    Messages: Messages;
    Locale: SupportedLocale;
  }
}
