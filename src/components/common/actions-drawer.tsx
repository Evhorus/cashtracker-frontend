"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { LucideIcon, MoreVertical } from "lucide-react";

export interface ActionItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface ActionsDrawerProps {
  actions: ActionItem[];
  /** Drawer heading. Required: it used to default to a hardcoded
   * Spanish word, which every caller overrode anyway. */
  title: string;
  triggerClassName?: string;
}

// Mobile-only by design: every caller already restricts this to mobile
// (wrapped in `md:hidden`, or handed to PageHeader's mobileActions slot,
// which does the same) - desktop already has its own action affordance,
// CardHoverActions on list cards (envelope-card.tsx/expense-card.tsx) or
// PageHeader's `actions` icon pair on detail pages. This used to also
// render a DropdownMenu on desktop via its own useMediaQuery check, but
// that branch was unreachable everywhere it's actually used - a "drawer"
// component that silently became a dropdown depending on viewport was
// more confusing to read than useful, so it's gone.
export const ActionsDrawer = ({
  actions,
  title,
  triggerClassName,
}: ActionsDrawerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        render={
          <Button variant="ghost" size="icon" className={triggerClassName}>
            <MoreVertical className="h-5 w-5" />
          </Button>
        }
      />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-2 p-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start ${
                  action.variant === "destructive"
                    ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                    : ""
                }`}
                onClick={() => {
                  setOpen(false);
                  action.onClick();
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
