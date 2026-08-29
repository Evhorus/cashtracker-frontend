import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BackLinkButtonProps {
  href: string;
  label: string;
}

/**
 * Labeled, secondary-styled "go back" button for a page header's desktop
 * `actions` row -
 * e.g. the envelope and expense detail pages, which sit one or two levels
 * below a spot the sidebar nav doesn't link to directly (a specific
 * envelope, or a specific expense's envelope). Sits alongside Editar/
 * Eliminar there (see CardActionButton's showLabelOnDesktop), not next to
 * the title - see page-header.tsx's own back button for the mobile-only
 * equivalent, which stays a plain icon since the bottom tab bar leaves no
 * room for a label.
 */
export function BackLinkButton({ href, label }: BackLinkButtonProps) {
  return (
    <Button
      variant="secondary"
      render={<Link href={href} />}
      nativeButton={false}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
