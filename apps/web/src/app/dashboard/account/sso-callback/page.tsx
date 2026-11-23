import { auth } from "@clerk/nextjs/server";

import { SSOCallbackHandler } from "@/features/auth/components/sso-callback-handler";

// Authenticated OAuth-linking callback (separate from public /sso-callback so outcomes return to Connected Accounts).
// Explicit auth.protect() satisfies the repo's Clerk lint rule alongside dashboard/layout.tsx.
export default async function AccountSSOCallbackPage() {
  await auth.protect();

  return (
    <SSOCallbackHandler
      signInFallbackRedirectUrl="/dashboard/account?section=connected"
      signUpFallbackRedirectUrl="/dashboard/account?section=connected"
    />
  );
}
