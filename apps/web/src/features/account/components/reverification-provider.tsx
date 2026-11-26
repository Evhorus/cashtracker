"use client";

import { useCallback, useState } from "react";

import { ReverificationGateContext } from "@/features/account/hooks/use-reverification-gate";
import type { ReverificationRequest } from "@/features/account/types";
import { ReverificationDialog } from "./reverification-dialog";

interface ReverificationProviderProps {
  children: React.ReactNode;
}

/** Owns the single pending Clerk reverification request and shared ReverificationDialog for AccountView. */
export function ReverificationProvider({
  children,
}: ReverificationProviderProps) {
  const [request, setRequest] = useState<ReverificationRequest | null>(null);

  const openReverificationDialog = useCallback(
    (next: ReverificationRequest) => {
      setRequest(next);
    },
    [],
  );

  // Keep explicit useCallback even with React Compiler: unstable identity re-triggers session.startVerification in useReverificationFlow.
  const handleSuccess = useCallback(() => setRequest(null), []);

  function handleOpenChange(open: boolean) {
    if (open) return;
    // Any non-success close (Esc, backdrop, Cancel) cancels the pending reverification.
    request?.cancel();
    setRequest(null);
  }

  return (
    <ReverificationGateContext.Provider value={openReverificationDialog}>
      {children}
      <ReverificationDialog
        request={request}
        onOpenChange={handleOpenChange}
        onSuccess={handleSuccess}
      />
    </ReverificationGateContext.Provider>
  );
}
