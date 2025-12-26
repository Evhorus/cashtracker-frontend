"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Forces the window to scroll to top whenever the pathname changes.
 * This ensures navigating between different "Budgets" or "Details"
 * always starts from the top position.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
