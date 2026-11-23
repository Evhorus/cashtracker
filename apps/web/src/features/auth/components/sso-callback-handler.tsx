import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

interface SSOCallbackHandlerProps {
  /** Post-OAuth fallback for existing sessions; account-linking overrides this to return to the account tab. */
  signInFallbackRedirectUrl?: string;
  signUpFallbackRedirectUrl?: string;
}

// Direct Clerk OAuth callback wrapper (kept Clerk-specific to leverage its transfer/session/MFA edge cases).
export function SSOCallbackHandler({
  signInFallbackRedirectUrl = "/dashboard",
  signUpFallbackRedirectUrl = "/dashboard",
}: SSOCallbackHandlerProps = {}) {
  return (
    <AuthenticateWithRedirectCallback
      // Required so unresolved flows stay in this app's pages instead of falling back to Clerk's hosted Account Portal.
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl={signInFallbackRedirectUrl}
      signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
    />
  );
}
