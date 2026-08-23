"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

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
  { value: "profile", label: "Perfil" },
  { value: "password", label: "Contraseña" },
  { value: "sessions", label: "Sesiones" },
  { value: "connected", label: "Cuentas conectadas" },
  { value: "danger", label: "Eliminar cuenta" },
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
              {(value: string) =>
                SECTIONS.find((s) => s.value === value)?.label
              }
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
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TabsList
        variant="line"
        className="hidden md:flex md:w-52 md:shrink-0 md:items-stretch"
      >
        {SECTIONS.map((s) => (
          <TabsTrigger
            key={s.value}
            value={s.value}
            // Both variants needed: TabsTrigger's own idle color is set
            // via a dark: variant too (dark:text-muted-foreground), which
            // only a same-variant override actually beats - see the
            // app's dark-by-default theme in src/app/layout.tsx.
            className={
              s.value === "danger"
                ? "text-destructive dark:text-destructive"
                : undefined
            }
          >
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
