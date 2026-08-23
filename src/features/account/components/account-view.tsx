"use client";

import { useState } from "react";
import {
  KeyRound,
  Laptop,
  Link2,
  Loader2,
  Trash2,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccountUser } from "../hooks/use-account-user";
import { ProfileSection } from "./profile-section";
import { PasswordSection } from "./password-section";
import { SessionsSection } from "./sessions-section";
import { ConnectedAccountsSection } from "./connected-accounts-section";
import { DeleteAccountSection } from "./delete-account-section";

const SECTIONS = [
  { value: "profile", label: "Perfil", icon: UserRound },
  { value: "password", label: "Contraseña", icon: KeyRound },
  { value: "sessions", label: "Sesiones", icon: Laptop },
  { value: "connected", label: "Cuentas conectadas", icon: Link2 },
  { value: "danger", label: "Eliminar cuenta", icon: Trash2 },
] as const;

type SectionValue = (typeof SECTIONS)[number]["value"];

// The single useAccountUser() call lives here so every section below
// re-renders off the same Clerk-managed user object - see
// profile-section.tsx for why that matters for the photo/name updates.
export function AccountView() {
  const { isLoaded, user } = useAccountUser();
  const [section, setSection] = useState<SectionValue>("profile");

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Tabs
      value={section}
      onValueChange={(value) => setSection(value as SectionValue)}
      orientation="vertical"
      className="flex-col gap-6 md:flex-row"
    >
      {/* Mobile: a Select reads unambiguously as "pick a section" - a
          horizontal-scrolling tab bar doesn't read as a menu at a glance,
          and Base UI's own scroll-active-tab-into-view behavior didn't
          position reliably at this width (the active tab rendered
          partially off-screen to the left). Desktop keeps the sidebar;
          both drive the same controlled `section` state, so either one
          works regardless of which is visible. */}
      <div className="md:hidden">
        <Select
          value={section}
          onValueChange={(value) => setSection(value as SectionValue)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: string) => {
                const current = SECTIONS.find((s) => s.value === value);
                if (!current) return null;
                return (
                  <>
                    <current.icon className="size-4 text-muted-foreground" />
                    {current.label}
                  </>
                );
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SECTIONS.map((s) => (
              <SelectItem
                key={s.value}
                value={s.value}
                className={
                  s.value === "danger" ? "text-destructive" : undefined
                }
              >
                <s.icon className="size-4" />
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Neither of Tabs' built-in looks fit a settings sidebar: "line"
          marks the active item with a thin sliding bar that reads as a
          scrollbar thumb in a vertical list, "default" is a flat gray
          pill that looks like generic component chrome next to the rest
          of the app. Instead this borrows the app's own nav language -
          the same rounded pill-group / bg-primary/15-active-pill treatment
          custom-header.tsx already uses for Dashboard/Sobres - so the
          account page's own nav reads as this app's, not a library
          default. */}
      <TabsList className="hidden shrink-0 flex-col items-stretch gap-1 rounded-2xl border border-border/60 bg-card/50 p-2 md:flex md:w-56">
        {SECTIONS.map((s) => (
          <TabsTrigger
            key={s.value}
            value={s.value}
            className={cn(
              "justify-start gap-2.5 rounded-full border-none px-3.5 py-2.5 text-sm font-medium text-muted-foreground shadow-none transition-colors",
              "hover:bg-muted hover:text-foreground",
              "data-active:bg-primary/15 data-active:text-primary dark:data-active:border-transparent dark:data-active:bg-primary/15 dark:data-active:text-primary",
              // TabsTrigger's base idle/hover/active text colors are each
              // set with their own dark: variant (4 combinations total) -
              // rather than override every one, `!` wins the cascade
              // outright regardless of which state's rule it's up
              // against. Backgrounds stay state-specific since idle/
              // hover/active each need a different one.
              s.value === "danger" &&
                "!text-destructive hover:!bg-destructive/10 data-active:!bg-destructive/10 dark:data-active:!border-transparent dark:data-active:!bg-destructive/20",
            )}
          >
            <s.icon className="size-4" />
            {s.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="min-w-0 flex-1">
        <TabsContent value="profile">
          <ProfileSection user={user} />
        </TabsContent>
        <TabsContent value="password">
          <PasswordSection />
        </TabsContent>
        <TabsContent value="sessions">
          <SessionsSection />
        </TabsContent>
        <TabsContent value="connected">
          <ConnectedAccountsSection />
        </TabsContent>
        <TabsContent value="danger">
          <DeleteAccountSection user={user} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
