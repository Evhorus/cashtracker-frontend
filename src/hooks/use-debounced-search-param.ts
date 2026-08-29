"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface UseDebouncedSearchParamOptions {
  /** URL param to drive. Defaults to "search". */
  param?: string;
  /** How long to wait after the last keystroke before navigating. */
  delayMs?: number;
}

export interface DebouncedSearchParam {
  /** The live input value - updates on every keystroke, unlike the URL. */
  value: string;
  onChange: (value: string) => void;
  /**
   * Write the current (possibly not-yet-committed) value into `params`
   * and cancel the pending debounced navigation, for a caller that's
   * about to change some *other* param in the same navigation. Without
   * this, changing a sort or page size mid-typing would either drop the
   * half-typed search or let the pending write land afterwards and
   * clobber the change that just happened.
   */
  applyTo: (params: URLSearchParams) => void;
}

/**
 * Debounced, URL-backed list search. Extracted from envelopes-filter.tsx
 * and expenses-filter.tsx, which had grown byte-identical copies of the
 * timer, the cleanup effect, the `params.delete("page")` reset and the
 * router.replace call.
 *
 * The debounced write rebuilds its params from a ref holding the latest
 * searchParams rather than the render-time closure - so a filter the
 * user changes while a keystroke is still pending can't be reverted by
 * that pending write landing with a stale copy of the URL.
 */
export function useDebouncedSearchParam({
  param = "search",
  delayMs = 500,
}: UseDebouncedSearchParamOptions = {}): DebouncedSearchParam {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const timeoutRef = useRef<number | null>(null);
  const [value, setValue] = useState(() => searchParams.get(param) ?? "");

  // Always the current URL, never the one captured when the pending
  // timeout was scheduled - see the doc comment above. Synced in an
  // effect rather than assigned during render (refs must not be written
  // to while rendering), same pattern useActionWithToast uses for its
  // onSuccess callback.
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const cancelPending = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Drop a pending navigation if the input unmounts mid-typing (e.g. the
  // responsive shell swaps which copy of the search box is mounted).
  useEffect(() => {
    return () => {
      cancelPending();
    };
  }, []);

  const writeParam = (params: URLSearchParams, next: string) => {
    if (next) {
      params.set(param, next);
    } else {
      params.delete(param);
    }
    // A new search can shrink the result set - start back at page 1
    // instead of leaving the user stranded on a now out-of-range page.
    params.delete("page");
  };

  const onChange = (next: string) => {
    setValue(next);
    cancelPending();

    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      const params = new URLSearchParams(searchParamsRef.current);
      writeParam(params, next);

      startTransition(() => {
        const query = params.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`);
      });
    }, delayMs);
  };

  const applyTo = (params: URLSearchParams) => {
    cancelPending();
    writeParam(params, value);
  };

  return { value, onChange, applyTo };
}
