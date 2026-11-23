// Provider-agnostic auth types; direct auth SDK imports stay confined to features/auth/hooks/ and sso-callback-handler.tsx.

export type OAuthProvider = "google" | "facebook";

export interface FieldErrors {
  identifier?: string;
  password?: string;
  code?: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
}

export interface AuthActionResult {
  error: string | null;
}
