import Link from "next/link";
import { Wallet } from "lucide-react";

// Presentational only - no Clerk dependency, so it can render on the
// public marketing pages without pulling in Clerk's client bundle.
// Callers that know the auth state (e.g. CustomHeader) pass `href`.
export const Logo = ({ href = "/" }: { href?: string }) => {
  return (
    <Link href={href} className="flex items-center gap-2">
      <Wallet className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold text-foreground">CashTracker</span>
    </Link>
  );
};
