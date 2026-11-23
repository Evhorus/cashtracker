// Provider-agnostic account types; keep auth SDK imports confined to features/account/hooks/.

export interface AccountUser {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  imageUrl: string;
  initials: string;
}

export interface ProfileFieldErrors {
  firstName?: string;
  lastName?: string;
}

export interface PasswordFieldErrors {
  currentPassword?: string;
  newPassword?: string;
}

export interface AccountActionResult {
  error: string | null;
  /** True when the user dismissed a reverification prompt before the action ran. */
  cancelled?: boolean;
}

export interface AccountSession {
  id: string;
  isCurrent: boolean;
  lastActiveAt: Date;
  /** Null when Clerk reports no browser; components supply the localized fallback label. */
  browser: string | null;
  isMobile: boolean;
  location: string | null;
}

export interface ConnectedAccount {
  id: string;
  /** Clerk provider id (e.g. "google"); kept as string since Clerk supports more providers than OAuthProvider. */
  providerId: string;
  label: string;
  identifier: string;
  imageUrl: string;
}

/** Mirrors Clerk's SessionVerificationLevel by value so components stay SDK-agnostic. */
export type ReverificationLevel =
  "first_factor" | "second_factor" | "multi_factor";

/** Provider-agnostic callbacks and level handed to ReverificationDialog for one attempt. */
export interface ReverificationRequest {
  /** Resolves the guarded action so it retries automatically. */
  complete: () => void;
  /** Rejects the guarded action on cancel or dialog close. */
  cancel: () => void;
  level: ReverificationLevel;
}

/** Credential ReverificationDialog collects (password if set, otherwise 6-digit email code). */
export type ReverificationFactor =
  { kind: "password" } | { kind: "email_code"; safeIdentifier: string };
