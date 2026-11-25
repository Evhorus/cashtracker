"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useReverification, useUser } from "@clerk/nextjs";
import { isReverificationCancelledError } from "@clerk/nextjs/errors";
import { useTranslations } from "next-intl";

import type { AccountActionResult } from "@/features/account/types";
import { mapClerkError } from "./map-clerk-error";
import { useReverificationGate } from "./use-reverification-gate";

// Wrapped in useReverification() via useReverificationGate for Clerk's sensitive-action check.
export function useDeleteAccount() {
  const t = useTranslations("account.errors");
  const { user } = useUser();
  const router = useRouter();
  const onNeedsReverification = useReverificationGate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteWithReverification = useReverification(() => user?.delete(), {
    onNeedsReverification,
  });

  async function deleteAccount(): Promise<AccountActionResult> {
    if (!user) return { error: t("noSession") };

    setIsDeleting(true);
    setError(null);
    try {
      await deleteWithReverification();
      router.push("/");
      // Intentionally skips resetting isDeleting; router.push("/") unmounts the component.
      return { error: null };
    } catch (err) {
      setIsDeleting(false);

      if (isReverificationCancelledError(err)) {
        // User closed the reverification modal - not a real error.
        return { error: null };
      }

      const { globalErrors } = mapClerkError(err, {}, t("unexpected"));
      const message = globalErrors[0] ?? t("deleteAccountFailed");
      setError(message);
      return { error: message };
    }
  }

  return { isDeleting, error, deleteAccount };
}
