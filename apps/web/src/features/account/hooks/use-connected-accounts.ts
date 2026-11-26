"use client";

import { useEffect, useState } from "react";
import { useReverification, useUser } from "@clerk/nextjs";
import { isReverificationCancelledError } from "@clerk/nextjs/errors";
import { useTranslations } from "next-intl";

import { toClerkStrategy } from "@/features/auth/lib/oauth-strategy";
import type { OAuthProvider } from "@/features/auth/types";
import type { ConnectedAccount } from "@/features/account/types";
import { useReverificationGate } from "./use-reverification-gate";

export function useConnectedAccounts() {
  const t = useTranslations("account.errors");
  const { user } = useUser();
  const onNeedsReverification = useReverificationGate();
  const [connectingProvider, setConnectingProvider] =
    useState<OAuthProvider | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter out unverified records left by cancelled OAuth consent flows while the cleanup effect destroys them.
  const connectedAccounts: ConnectedAccount[] = (user?.externalAccounts ?? [])
    .filter((account) => account.verification?.status !== "unverified")
    .map((account) => ({
      id: account.id,
      providerId: account.provider,
      label: account.providerTitle(),
      identifier: account.accountIdentifier() || account.emailAddress,
      imageUrl: account.imageUrl,
    }));

  useEffect(() => {
    const failed = (user?.externalAccounts ?? []).filter(
      (account) => account.verification?.status === "unverified",
    );
    // Best-effort cleanup: ignore destroy() errors so they don't surface as user-facing hook errors.
    failed.forEach((account) => void account.destroy().catch(() => {}));
  }, [user?.externalAccounts]);

  // Linking a provider requires Clerk reverification; redirectUrl targets the account-scoped callback route.
  const createExternalAccountWithReverification = useReverification(
    (strategy: "oauth_google" | "oauth_facebook") =>
      user?.createExternalAccount({
        strategy,
        redirectUrl: "/dashboard/account/sso-callback",
      }),
    { onNeedsReverification },
  );

  async function connectProvider(provider: OAuthProvider) {
    if (!user) return;

    setConnectingProvider(provider);
    setError(null);
    try {
      const externalAccount = await createExternalAccountWithReverification(
        toClerkStrategy(provider),
      );
      const redirectUrl =
        externalAccount?.verification?.externalVerificationRedirectURL;

      if (!redirectUrl) {
        setError(t("connectFailed"));
        setConnectingProvider(null);
        return;
      }

      // Full navigation to the provider's consent screen; intentionally keep connectingProvider set until redirect.
      window.location.href = redirectUrl.toString();
    } catch (err) {
      setConnectingProvider(null);
      if (!isReverificationCancelledError(err)) {
        setError(t("connectAccountFailed"));
      }
    }
  }

  async function disconnectAccount(id: string) {
    const account = user?.externalAccounts.find((a) => a.id === id);
    if (!account) return;

    setDisconnectingId(id);
    setError(null);
    try {
      await account.destroy();
    } catch {
      setError(t("disconnectAccountFailed"));
    } finally {
      setDisconnectingId(null);
    }
  }

  return {
    connectedAccounts,
    connectingProvider,
    disconnectingId,
    error,
    connectProvider,
    disconnectAccount,
  };
}
