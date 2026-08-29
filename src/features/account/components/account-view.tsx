"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { ReverificationProvider } from "./reverification-provider";

// `value` doubles as the ?section= URL param and the message key
// (account.sections.*) - the words are per-language, the URL isn't.
const SECTIONS = [
  { value: "profile", icon: UserRound },
  { value: "password", icon: KeyRound },
  { value: "sessions", icon: Laptop },
  { value: "connected", icon: Link2 },
  { value: "danger", icon: Trash2 },
] as const;

type SectionValue = (typeof SECTIONS)[number]["value"];

function isSectionValue(value: string | null): value is SectionValue {
  return SECTIONS.some((s) => s.value === value);
}

// The single useAccountUser() call lives here so every section below
// re-renders off the same Clerk-managed user object - see
// profile-section.tsx for why that matters for the photo/name updates.
export function AccountView() {
  const t = useTranslations("account");
  const { isLoaded, user } = useAccountUser();
  // ?section= opens straight into a specific tab instead of always the
  // profile - used by the OAuth-linking sso-callback route
  // (dashboard/account/sso-callback/page.tsx) so connecting or
  // cancelling a provider lands back on the connected-accounts tab, not
  // a blank profile tab that gives no sign the attempt even happened.
  // Read once as the initial tab, not kept in sync afterward - the user
  // is free to switch tabs from there same as always.
  const searchParams = useSearchParams();
  const initialSection = searchParams.get("section");
  const [section, setSection] = useState<SectionValue>(
    isSectionValue(initialSection) ? initialSection : "profile",
  );

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    // Mounted here, above every section - PasswordSection,
    // ConnectedAccountsSection, and DeleteAccountSection each trigger
    // Clerk reverification and reach this same provider via
    // useReverificationGate() (see reverification-provider.tsx).
    <ReverificationProvider>
      <Tabs
        value={section}
        onValueChange={(value) => setSection(value as SectionValue)}
        orientation="horizontal"
        className="gap-6"
      >
        {/* Mobile: a Select reads unambiguously as "pick a section" - a
          horizontal-scrolling tab bar doesn't read as a menu at a glance,
          and Base UI's own scroll-active-tab-into-view behavior didn't
          position reliably at this width (the active tab rendered
          partially off-screen to the left). Desktop keeps the top tab
          row below; both drive the same controlled `section` state, so
          either one works regardless of which is visible. */}
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
                      {t(`sections.${current.value}`)}
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
                  className={cn(
                    "gap-2",
                    s.value === "danger" && "text-destructive",
                  )}
                >
                  <s.icon className="size-4" />
                  {t(`sections.${s.value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: a horizontal top-tab row instead of a vertical
          sidebar - a settings *menu* reads as heavier chrome than this
          page needs, and it capped the content at whatever width the
          sidebar left over instead of using the row. `!h-auto`: the base
          TabsList variant hardcodes group-data-horizontal/tabs:h-9 for
          this orientation, and since that's a variant-scoped utility it
          sits in a later cascade position than a plain h-auto here
          regardless of class order (twMerge doesn't dedupe across
          different variant scopes) - only `!` reliably wins.
          flex-wrap instead of overflow-x-auto for the narrow end of
          "desktop" (~768-1024px, where all 6 don't fit in one row):
          Base UI's scroll-active-tab-into-view didn't position reliably
          at that width - the exact reason the Select above exists for
          mobile in the first place (see its own comment) - and it was
          landing mid-scroll with Perfil clipped off the left edge even
          after manually scrolling all the way there. Wrapping to a
          second row has no such failure mode: every tab is always fully
          in view, nothing to scroll. */}
        <TabsList className="hidden !h-auto w-fit max-w-full flex-wrap items-center gap-1.5 rounded-2xl border border-border/60 bg-card/50 p-2.5 md:flex">
          {SECTIONS.map((s) => (
            <TabsTrigger
              key={s.value}
              value={s.value}
              className={cn(
                "shrink-0 gap-2 rounded-full border-none px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-none transition-colors",
                "hover:bg-muted hover:text-foreground",
                "data-active:bg-primary/15 data-active:font-semibold data-active:text-primary data-active:shadow-sm dark:data-active:border-transparent dark:data-active:bg-primary/15 dark:data-active:text-primary",
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
              {t(`sections.${s.value}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        <div>
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
    </ReverificationProvider>
  );
}
