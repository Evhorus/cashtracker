"use client";

import { useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

import type { AccountSession } from "@/features/account/types";

// Derived from useUser() because @clerk/nextjs does not export resource types directly.
type ClerkUser = NonNullable<ReturnType<typeof useUser>["user"]>;
type RawSession = Awaited<ReturnType<ClerkUser["getSessions"]>>[number];

function toAccountSession(
  session: RawSession,
  currentSessionId: string | undefined,
): AccountSession {
  const { latestActivity } = session;
  return {
    id: session.id,
    isCurrent: session.id === currentSessionId,
    lastActiveAt: session.lastActiveAt,
    browser:
      [latestActivity.browserName, latestActivity.browserVersion]
        .filter(Boolean)
        .join(" ") || null,
    isMobile: Boolean(latestActivity.isMobile),
    location:
      [latestActivity.city, latestActivity.country]
        .filter(Boolean)
        .join(", ") || null,
  };
}

// Uses user.getSessions() (all devices for this account, not multi-account useSessionList()); not reactive, so this hook manages fetching.
export function useSessions() {
  const t = useTranslations("account.errors");
  const { user } = useUser();
  const { session: currentSession } = useSession();
  const [sessions, setSessions] = useState<AccountSession[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  // Bumping this triggers refetch inside the effect, avoiding react-hooks/set-state-in-effect.
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!user) return;

    let ignore = false;

    user
      .getSessions()
      .then((raw) => {
        if (ignore) return;
        setSessions(
          raw
            .map((session) => toAccountSession(session, currentSession?.id))
            // Put current device first.
            .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent)),
        );
      })
      .catch(() => {
        if (!ignore) setError(t("loadFailed"));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [user, currentSession?.id, reloadToken, t]);

  function reload() {
    setIsLoading(true);
    setError(null);
    setReloadToken((n) => n + 1);
  }

  async function revokeSession(sessionId: string) {
    if (!user) return;

    setRevokingId(sessionId);
    setError(null);
    try {
      // Re-fetch raw Clerk session resources because AccountSession omits `revoke()`.
      const raw = await user.getSessions();
      const target = raw.find((session) => session.id === sessionId);
      await target?.revoke();
      reload();
    } catch {
      setError(t("revokeFailed"));
    } finally {
      setRevokingId(null);
    }
  }

  return { sessions, isLoading, error, revokingId, revokeSession };
}
