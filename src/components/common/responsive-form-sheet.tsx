"use client";

import { XIcon } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface ResponsiveFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit when the sheet is fully controlled from outside (same convention
   * as the dialogs below - e.g. opened from a card's own actions menu). */
  trigger?: React.ReactElement;
  title: string;
  /** Usually a plain string, but accepts a richer node (e.g. an inline
   * category icon + envelope name) - see create-expense-dialog.tsx. */
  description: React.ReactNode;
  dialogClassName?: string;
  children: React.ReactNode;
}

// Dialog on desktop, Drawer (bottom sheet) on mobile - same
// isDesktop/useMediaQuery split delete-expense-alert-dialog.tsx already
// uses, pulled out here since it's now shared by four create/edit forms
// (create/update-envelope-dialog.tsx, create/update-expense-dialog.tsx)
// instead of duplicated in each. The Drawer branch shows a swipe handle
// and scrolls its own body - a full envelope/expense form is taller than
// the drawer's max height, and DrawerContent itself doesn't scroll.
export function ResponsiveFormSheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  dialogClassName,
  children,
}: ResponsiveFormSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger render={trigger} />}
        <DialogContent className={dialogClassName}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      {trigger && <DrawerTrigger render={trigger} />}
      <DrawerContent>
        <DrawerHeader className="relative text-left">
          <DrawerTitle className="pr-8">{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
          <DrawerClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-4 right-4"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Cerrar</span>
          </DrawerClose>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
