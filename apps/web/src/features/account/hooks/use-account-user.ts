"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

import type { AccountUser } from "@/features/account/types";

type ClerkUser = NonNullable<ReturnType<typeof useUser>["user"]>;

function toAccountUser(user: ClerkUser): AccountUser {
  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const initials =
    [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() ||
    email[0]?.toUpperCase() ||
    "?";

  return {
    firstName,
    lastName,
    fullName,
    email,
    imageUrl: user.imageUrl,
    initials,
  };
}

// Read-only Clerk user facade; mutations live in use-update-profile/password and use-delete-account.
export function useAccountUser() {
  const { isLoaded, user } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const accountUser = user ? toAccountUser(user) : null;

  async function signOut() {
    setIsSigningOut(true);
    try {
      await clerkSignOut({ redirectUrl: "/" });
    } finally {
      // Only reached if signOut() throws; a successful call navigates away first.
      setIsSigningOut(false);
    }
  }

  return {
    isLoaded,
    user: accountUser,
    isSigningOut,
    signOut,
  };
}
