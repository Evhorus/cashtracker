"use client";

import { useEffect, useState } from "react";
import { useSession } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

import type {
  ReverificationFactor,
  ReverificationRequest,
} from "@/features/account/types";
import { mapClerkError } from "./map-clerk-error";

type ClerkSession = NonNullable<ReturnType<typeof useSession>["session"]>;
type SupportedFactor = NonNullable<
  Awaited<
    ReturnType<ClerkSession["startVerification"]>
  >["supportedFirstFactors"]
>[number];

interface ReverificationFlowFieldErrors {
  password?: string;
  code?: string;
}

interface ReverificationFlow {
  factor: ReverificationFactor | null;
  isPreparing: boolean;
  isSubmitting: boolean;
  isResending: boolean;
  fieldErrors: ReverificationFlowFieldErrors;
  globalErrors: string[];
  submitPassword: (password: string) => Promise<void>;
  submitCode: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
}

type PreparedFactor =
  | { kind: "complete" }
  | { kind: "password" }
  | { kind: "email_code"; emailAddressId: string; safeIdentifier: string }
  | { kind: "unsupported" };

async function resolveFirstFactor(
  session: ClerkSession,
  level: ReverificationRequest["level"],
): Promise<PreparedFactor> {
  const result = await session.startVerification({ level });
  if (result.status === "complete") return { kind: "complete" };

  const supported = result.supportedFirstFactors ?? [];
  if (supported.some((f: SupportedFactor) => f.strategy === "password")) {
    return { kind: "password" };
  }

  const emailFactor = supported.find(
    (
      f: SupportedFactor,
    ): f is Extract<SupportedFactor, { strategy: "email_code" }> =>
      f.strategy === "email_code",
  );
  if (!emailFactor) return { kind: "unsupported" };

  await session.prepareFirstFactorVerification({
    strategy: "email_code",
    emailAddressId: emailFactor.emailAddressId,
  });
  return {
    kind: "email_code",
    emailAddressId: emailFactor.emailAddressId,
    safeIdentifier: emailFactor.safeIdentifier,
  };
}

/** Drives the Clerk reverification handshake behind ReverificationDialog (prefers password, falls back to email_code). */
export function useReverificationFlow(
  request: ReverificationRequest | null,
  onSuccess: () => void,
): ReverificationFlow {
  const t = useTranslations("account.errors");
  const { session } = useSession();
  const [factor, setFactor] = useState<ReverificationFactor | null>(null);
  const [emailAddressId, setEmailAddressId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ReverificationFlowFieldErrors>(
    {},
  );
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);

  // Reset state during render when the request changes (avoids setState-in-effect loops).
  const [prevRequest, setPrevRequest] = useState(request);
  if (request !== prevRequest) {
    setPrevRequest(request);
    setFactor(null);
    setEmailAddressId(null);
    setFieldErrors({});
    setGlobalErrors([]);
  }

  const isPreparing =
    request !== null && factor === null && globalErrors.length === 0;

  useEffect(() => {
    if (!request || !session) return;
    let ignore = false;

    resolveFirstFactor(session, request.level)
      .then((prepared) => {
        if (ignore) return;
        if (prepared.kind === "complete") {
          request.complete();
          onSuccess();
          return;
        }
        if (prepared.kind === "password") {
          setFactor({ kind: "password" });
          return;
        }
        if (prepared.kind === "email_code") {
          setEmailAddressId(prepared.emailAddressId);
          setFactor({
            kind: "email_code",
            safeIdentifier: prepared.safeIdentifier,
          });
          return;
        }
        setGlobalErrors([t("noMethodAvailable")]);
      })
      .catch(() => {
        if (!ignore) setGlobalErrors([t("startFailed")]);
      });

    return () => {
      ignore = true;
    };
    // Depend on session?.id, not session: useSession() returns a fresh object every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, session?.id, onSuccess]);

  async function attempt(
    params:
      | { strategy: "password"; password: string }
      | { strategy: "email_code"; code: string },
  ) {
    if (!session || !request) return;

    setIsSubmitting(true);
    setFieldErrors({});
    setGlobalErrors([]);
    try {
      const result = await session.attemptFirstFactorVerification(params);
      if (result.status === "complete") {
        request.complete();
        onSuccess();
      } else {
        setGlobalErrors([t("completeFailed")]);
      }
    } catch (err) {
      const { fieldErrors: fields, globalErrors: globals } = mapClerkError(
        err,
        { password: ["password"], code: ["code"] },
        t("unexpected"),
      );
      setFieldErrors(fields);
      setGlobalErrors(globals);
    } finally {
      setIsSubmitting(false);
    }
  }

  function submitPassword(password: string) {
    return attempt({ strategy: "password", password });
  }

  function submitCode(code: string) {
    return attempt({ strategy: "email_code", code });
  }

  async function resendCode() {
    if (!session || !emailAddressId) return;

    setIsResending(true);
    setGlobalErrors([]);
    try {
      await session.prepareFirstFactorVerification({
        strategy: "email_code",
        emailAddressId,
      });
    } catch {
      setGlobalErrors([t("resendFailed")]);
    } finally {
      setIsResending(false);
    }
  }

  return {
    factor,
    isPreparing,
    isSubmitting,
    isResending,
    fieldErrors,
    globalErrors,
    submitPassword,
    submitCode,
    resendCode,
  };
}
