"use server";

import { auth } from "@clerk/nextjs/server";
import { EnvelopesService } from "../services/envelopes.service";
import { getTranslations } from "next-intl/server";

import { createSafeAction } from "@/shared/lib/safe-action";
import { refreshDashboard } from "@/features/dashboard/lib/refresh-dashboard";

// Goes through EnvelopesService + createSafeAction like every other
// mutation, instead of the raw authenticatedFetch + hand-rolled
// try/catch this used to be - that bypass meant no ApiError, no
// consistent error shape, and left EnvelopesService.delete dead code.
//
// The success message is hardcoded here rather than read off the
// response: unlike create/update (which return `{ message }`), the
// backend's DELETE returns the *removed entity* - see
// envelopes.service.ts's `remove()` in cashtracker-backend, which
// returns `envelopesRepository.remove(envelope)`. Reading a `.message`
// off that would be `undefined`, which useActionWithToast treats as "no
// success" - no toast, and the dialog never closes.
// The success toast is written here, not read off the API response.
// The backend's `{ message }` is Spanish and has no idea who's reading
// it - the same response has to be able to render in either language.
// Toast wording is presentation, so it belongs on this side of the
// wire; getTranslations resolves it against the caller's own locale.
// eslint-disable-next-line @clerk/next/require-auth-protection -- Protected inside createSafeAction wrapper by calling auth.protect() in the handler.
export const deleteEnvelopeAction = createSafeAction(
  async (envelopeId: string) => {
    await auth.protect();
    await EnvelopesService.delete(envelopeId);

    refreshDashboard();

    const t = await getTranslations("envelopes.toast");

    return { successMessage: t("deleted") };
  },
);
