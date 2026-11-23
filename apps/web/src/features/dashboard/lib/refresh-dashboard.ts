import "server-only";

import { revalidatePath } from "next/cache";

/**
 * Called by every Server Action that writes data, right after the write.
 *
 * It invalidates the whole dashboard layout: the cached render of every
 * page under it and the client's router cache with it, so the very next
 * render - on this device or another - asks the backend again.
 *
 * It is deliberately blunt. Nothing is cached per read any more (see
 * authenticated-fetch.ts), so there is no tag to keep in step with the
 * data it covers; a write that forgot one used to leave a stale figure
 * on a page nobody thought to check. Naming every affected page by hand
 * is the mistake this removes: an action that calls this one function
 * cannot miss a page.
 */
export function refreshDashboard() {
  revalidatePath("/dashboard", "layout");
}
