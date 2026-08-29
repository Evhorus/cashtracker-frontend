"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/i18n/config";
import { setLocaleAction } from "../actions/set-locale.action";

/**
 * Language picker, sitting beside ModeToggle and shaped like it.
 *
 * Until this existed, `messages/en.json` was unreachable: i18n/request.ts
 * read a cookie nothing ever wrote, so every request resolved to Spanish
 * no matter what. Translating strings without this would have been
 * unverifiable work.
 *
 * Each option's name is written in its own language and never
 * translated - a language picker has to be readable to someone who
 * can't read the language currently showing.
 */
export function LocaleToggle({ className }: { className?: string }) {
  const currentLocale = useLocale();
  const t = useTranslations("locale");
  const [isPending, startTransition] = useTransition();

  const select = (locale: SupportedLocale) => {
    if (locale === currentLocale) return;
    startTransition(() => setLocaleAction(locale));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            disabled={isPending}
            className={cn(className)}
            // Same in both languages, deliberately - see above.
            aria-label={t("label")}
          >
            <Languages className="size-5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => select(locale)}
            className={cn(locale === currentLocale && "font-semibold")}
          >
            {LOCALE_LABELS[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
