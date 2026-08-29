"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { Check, ChevronDown, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { resolveIcon } from "../lib/icon-registry";
import { withAlpha } from "../lib/with-alpha";
import { useCategories } from "@/providers/categories-provider";
import { Text } from "@/components/common/typography";
import { CreateCategoryDialog } from "./create-category-dialog";

// Same minimal explicit prop shape as currency-selector.tsx (not the full
// react-hook-form ControllerRenderProps) - envelope-form.tsx spreads
// `{...field}` onto this the same way it does onto CurrencySelector; the
// extra field props (onBlur, name, ref) just go unused.
export interface CategoryPickerProps {
  /** The selected category's id, or "" / undefined for none. Used to be
   * a label; envelopes reference categories by id now. */
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
}

export function CategoryPicker({
  value,
  onChange,
  disabled,
  className,
  id,
  "aria-invalid": ariaInvalid,
}: CategoryPickerProps) {
  const t = useTranslations("categories");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const listboxId = useId();
  const categories = useCategories();

  // A direct lookup by id - no more matching a free-text label against
  // the list case-insensitively.
  const selected = categories.find((category) => category.id === value) ?? null;
  // On an object, not a capitalized local - see category-badge.tsx.
  const selectedDef = selected
    ? { ...selected, Icon: resolveIcon(selected.icon) }
    : null;
  const filtered = categories.filter((category) =>
    category.label.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const pick = (categoryId: string) => {
    onChange(categoryId);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger
        render={
          <button
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            className={cn(
              "flex h-9 w-full min-w-0 items-center gap-2 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
              className,
            )}
          >
            {selectedDef ? (
              <selectedDef.Icon
                className="h-4 w-4 shrink-0"
                style={{ color: selectedDef.color }}
              />
            ) : (
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span
              className={cn(
                "flex-1 truncate text-left",
                !selected && "text-muted-foreground",
              )}
            >
              {selected ? selected.label : t("none")}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <PopoverContent align="start" className="w-72 gap-0 p-0">
        <div className="p-2">
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
          />
        </div>

        <div
          id={listboxId}
          role="listbox"
          className="max-h-64 overflow-y-auto p-1"
        >
          <button
            type="button"
            onClick={() => pick("")}
            className="flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/50" />
            <span className="flex-1">{t("none")}</span>
            {!value?.trim() && <Check className="h-4 w-4 shrink-0" />}
          </button>

          {filtered.map((category) => {
            const isSelected = value === category.id;
            const Icon = resolveIcon(category.icon);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => pick(category.id)}
                className="flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: withAlpha(category.color, 0.16),
                    color: category.color,
                  }}
                >
                  <Icon className="h-3 w-3" />
                </span>
                <span className="flex-1">{category.label}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}

          {filtered.length === 0 && (
            <Text className="px-2 py-3 text-center">Sin resultados</Text>
          )}
        </div>

        <div className="border-t border-border p-2">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setCreateOpen(true);
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("picker.create")}
          </button>
        </div>
      </PopoverContent>

      <CreateCategoryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(label) => pick(label)}
      />
    </Popover>
  );
}
