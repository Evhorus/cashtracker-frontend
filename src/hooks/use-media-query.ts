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
