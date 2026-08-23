import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";

// Header for the public marketing page only. The page that renders this
// (app/(home)/page.tsx) already redirects signed-in users to /dashboard
// server-side, so this is always the signed-out state - no need to pull
// in Clerk's client SDK just to show a static "Iniciar sesión" link.
export const LandingHeader = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo />

        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link
            href="/sign-in"
            className={buttonVariants({
              variant: "outline",
              size: "default",
              className: "bg-transparent",
            })}
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
};
