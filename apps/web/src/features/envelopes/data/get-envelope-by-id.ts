import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { EnvelopesService } from "@/features/envelopes/services/envelopes.service";
import { ApiError } from "@/shared/lib/api-client";
import { isValidUuid } from "@/shared/utils/url-params";

/**
 * Request-deduped (`React.cache`) server read shared by `generateMetadata` and the page body.
 * Redirects on 404 (prevents a 404 flash when deleting an envelope triggers a route re-render); rethrows other errors for `error.tsx`.
 */
export const getEnvelopeById = cache(async (id: string) => {
  if (!isValidUuid(id)) {
    redirect("/dashboard/envelopes");
  }
  try {
    return await EnvelopesService.getById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      redirect("/dashboard/envelopes");
    }
    throw error;
  }
});
