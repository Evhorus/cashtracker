import "server-only";

import { revalidatePath } from "next/cache";

/**
 * Revalidates the entire `/dashboard` layout after any mutation.
 * Deliberately broad because reads are uncached (see authenticated-fetch.ts), avoiding stale cross-page data.
 */
export function refreshDashboard() {
  revalidatePath("/dashboard", "layout");
}
