"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import {
  isSupportedLocale,
  LOCALE_COOKIE,
  type SupportedLocale,
} from "@/shared/config/i18n/config";

/** Persists the locale cookie on the server (read by i18n/request.ts) and revalidates all layouts. */
export async function setLocaleAction(locale: SupportedLocale) {
  if (!isSupportedLocale(locale)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
