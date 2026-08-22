"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/common/button";
import { LucideIcon, MoreVertical } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

export interface ActionItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface ActionsDrawerProps {
  actions: ActionItem[];
  title?: string;
  triggerClassName?: string;
}

export const ActionsDrawer = ({
  actions,
  title = "Acciones",
  triggerClassName,
}: ActionsDrawerProps) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Desktop: DropdownMenu
  if (isDesktop) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={triggerClassName}>
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={index}
                className={
                  action.variant === "destructive"
                    ? "text-destructive focus:text-destructive"
                    : ""
                }
                onSelect={() => {
                  action.onClick();
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Mobile: Drawer
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className={triggerClassName}>
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
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
