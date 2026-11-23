import { enUS, esMX } from "@clerk/localizations";
import { getLocale } from "next-intl/server";

import type { SupportedLocale } from "./config";

/** Maps app locales to Clerk's built-in localizations (esMX matches the app's Latin American Spanish). */
const CLERK_LOCALIZATIONS = { es: esMX, en: enUS } satisfies Record<
  SupportedLocale,
  unknown
>;

export async function getClerkLocalization() {
  return CLERK_LOCALIZATIONS[await getLocale()];
}
