"use client";

import { useRouter } from "next/navigation";
import { useSignIn as useClerkSignIn } from "@clerk/nextjs";

import { navigateAfterAuth } from "@/features/auth/lib/navigate-after-auth";
import { toClerkStrategy } from "@/features/auth/lib/oauth-strategy";
import type { OAuthProvider } from "@/features/auth/types";

// Clerk adapter for sign-in and forgot-password forms; components never touch Clerk directly.
export function useSignIn() {
  const { signIn, errors, fetchStatus } = useClerkSignIn();
  const router = useRouter();

  const isSubmitting = fetchStatus === "fetching";

  async function finalize() {
    await signIn.finalize({
      navigate: (params) => navigateAfterAuth(router, params),
    });
  }

  async function signInWithPassword(emailAddress: string, password: string) {
    const { error } = await signIn.password({ emailAddress, password });
    if (!error && signIn.status === "complete") await finalize();
    // needs_second_factor / needs_client_trust are not handled here; Clerk's globalErrors surfaces them.
    return { error };
  }

  async function sendEmailCode(emailAddress: string) {
    const { error } = await signIn.create({ identifier: emailAddress });
    if (error) return { error };
    return signIn.emailCode.sendCode();
  }

  function resendEmailCode() {
    return signIn.emailCode.sendCode();
  }

  async function verifyEmailCode(code: string) {
    const { error } = await signIn.emailCode.verifyCode({ code });
    if (!error && signIn.status === "complete") await finalize();
    return { error };
  }

  async function signInWithOAuth(provider: OAuthProvider) {
    const strategy = toClerkStrategy(provider);

    if (signIn.id) {
      // Clerk quirk: signIn.sso() silently no-ops after a pending password/email-code attempt (signIn.id set); call create() first.
      await signIn.create({
        strategy,
        redirectUrl: "/sso-callback",
        actionCompleteRedirectUrl: "/sso-callback",
      });
    }

    // Route both redirects through /sso-callback so client JS finishes dev-instance __clerk_db_jwt sync before protected routes.
    await signIn.sso({
      strategy,
      redirectUrl: "/sso-callback",
      redirectCallbackUrl: "/sso-callback",
    });
  }

  return {
    isSubmitting,
    fieldErrors: {
      identifier: errors.fields.identifier?.message,
      password: errors.fields.password?.message,
      code: errors.fields.code?.message,
    },
    globalErrors: errors.global?.map((err) => err.message) ?? [],
    signInWithPassword,
    sendEmailCode,
    resendEmailCode,
    verifyEmailCode,
    signInWithOAuth,
    // Clear stale errors when switching between password and email-code (they share the identifier field).
    clearErrors: () => signIn.reset(),
  };
}
