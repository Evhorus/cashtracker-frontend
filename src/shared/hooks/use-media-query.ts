import * as React from "react";

export function useMediaQuery(query: string) {
  // This useCallback stays despite the React Compiler being enabled:
  // useSyncExternalStore resubscribes whenever `subscribe` changes
  // identity, so its stability is a correctness requirement here, not a
  // performance nicety. Don't "clean this up".
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

/**
 * The breakpoint where forms switch from a bottom drawer to a centered
 * dialog (ResponsiveFormSheet) - one definition instead of the same
 * string in every component that branches on it.
 */
export const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

export function useIsDesktop() {
  return useMediaQuery(DESKTOP_MEDIA_QUERY);
}
