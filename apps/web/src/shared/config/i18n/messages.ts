import accountEn from "@/features/account/messages/en.json";
import accountEs from "@/features/account/messages/es.json";
import authEn from "@/features/auth/messages/en.json";
import authEs from "@/features/auth/messages/es.json";
import categoriesEn from "@/features/categories/messages/en.json";
import categoriesEs from "@/features/categories/messages/es.json";
import dashboardEn from "@/features/dashboard/messages/en.json";
import dashboardEs from "@/features/dashboard/messages/es.json";
import envelopesEn from "@/features/envelopes/messages/en.json";
import envelopesEs from "@/features/envelopes/messages/es.json";
import expensesEn from "@/features/expenses/messages/en.json";
import expensesEs from "@/features/expenses/messages/es.json";
import homeEn from "@/features/home/messages/en.json";
import homeEs from "@/features/home/messages/es.json";
import localeEn from "@/features/locale/messages/en.json";
import localeEs from "@/features/locale/messages/es.json";
import paymentMethodsEn from "@/features/payment-methods/messages/en.json";
import paymentMethodsEs from "@/features/payment-methods/messages/es.json";
import type { SupportedLocale } from "./config";
import sharedEn from "./messages/en.json";
import sharedEs from "./messages/es.json";

/**
 * Feature-owned message sources (top-level namespaces must not collide — asserted by messages.test.ts).
 * Static imports ensure `next dev` invalidates JSON edits without a server restart.
 */
export const MESSAGE_SOURCES = {
  es: [
    sharedEs,
    localeEs,
    homeEs,
    authEs,
    dashboardEs,
    envelopesEs,
    expensesEs,
    categoriesEs,
    accountEs,
    paymentMethodsEs,
  ],
  en: [
    sharedEn,
    localeEn,
    homeEn,
    authEn,
    dashboardEn,
    envelopesEn,
    expensesEn,
    categoriesEn,
    accountEn,
    paymentMethodsEn,
  ],
} as const satisfies Record<SupportedLocale, readonly object[]>;

/** Built as a literal (not Object.assign/reduce) so next-intl preserves static key checking. */
export const MESSAGES = {
  es: {
    ...sharedEs,
    ...localeEs,
    ...homeEs,
    ...authEs,
    ...dashboardEs,
    ...envelopesEs,
    ...expensesEs,
    ...categoriesEs,
    ...accountEs,
    ...paymentMethodsEs,
  },
  en: {
    ...sharedEn,
    ...localeEn,
    ...homeEn,
    ...authEn,
    ...dashboardEn,
    ...envelopesEn,
    ...expensesEn,
    ...categoriesEn,
    ...accountEn,
    ...paymentMethodsEn,
  },
} as const;

/** Spanish is the reference locale; messages.test.ts enforces key parity across locales. */
export type Messages = typeof MESSAGES.es;
