"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
import { Button } from "@/shared/components/ui/button";
import { LucideIcon, MoreVertical } from "lucide-react";

export interface ActionItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface ActionsDrawerProps {
  actions: ActionItem[];
  title?: string;
}

export const ActionsDrawer = ({
  actions,
  title = "Acciones",
}: ActionsDrawerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start ${
                  action.variant === "destructive"
                    ? "text-destructive hover:text-destructive hover:bg-destructive/10"
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
