import * as React from "react";

export function useMediaQuery(query: string) {
  // Keep useCallback despite React Compiler: useSyncExternalStore resubscribes if subscribe identity changes.
  const subscribe = React.useCallback(
    (callback: () => void) => {
      const matchMedia = window.matchMedia(query);

      matchMedia.addEventListener("change", callback);
      return () => {
        matchMedia.removeEventListener("change", callback);
      };
    },
    [query],
  );

  const getSnapshot = () => {
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => {
    return false;
  };

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Shared breakpoint where ResponsiveFormSheet switches from drawer to dialog. */
export const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

export function useIsDesktop() {
  return useMediaQuery(DESKTOP_MEDIA_QUERY);
}
