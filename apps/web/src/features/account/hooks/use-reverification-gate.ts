"use client";

import { createContext, useContext } from "react";
import type { useReverification } from "@clerk/nextjs";

import type { ReverificationRequest } from "@/features/account/types";

// Derived from useReverification because Clerk does not export this option type directly.
type ReverificationOptions = NonNullable<
  Parameters<typeof useReverification>[1]
>;
type OnNeedsReverification = NonNullable<
  ReverificationOptions["onNeedsReverification"]
>;
type NeedsReverificationParameters = Parameters<OnNeedsReverification>[0];

type OpenReverificationDialog = (request: ReverificationRequest) => void;

// Internal to features/account/ (provided by ReverificationProvider, consumed via useReverificationGate).
export const ReverificationGateContext =
  createContext<OpenReverificationDialog | null>(null);

/** Returns the `onNeedsReverification` callback that routes Clerk reverification to the shared ReverificationDialog instead of Clerk's modal. */
export function useReverificationGate(): OnNeedsReverification {
  const openReverificationDialog = useContext(ReverificationGateContext);

  if (!openReverificationDialog) {
    throw new Error(
      "useReverificationGate must be used within a ReverificationProvider - is account-view.tsx missing it?",
    );
  }

  return ({ complete, cancel, level }: NeedsReverificationParameters) => {
    openReverificationDialog({
      complete,
      cancel,
      // Clerk types level as optional; default to first_factor for all guarded actions here.
      level: level ?? "first_factor",
    });
  };
}
