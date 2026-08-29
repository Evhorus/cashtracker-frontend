"use client";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/common/submit-button";
import { FormInput } from "@/components/common/form-input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  buildCategoryFormSchema,
  CategoryFormValues,
} from "@/features/categories/schemas/category.schema";
import { resolveIcon } from "@/features/categories/lib/icon-registry";
import { useCategoryOptions } from "@/providers/categories-provider";
import { cn } from "@/lib/utils";

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues>;
  isLoading: boolean;
  onSubmit: (categoryFormValues: CategoryFormValues) => Promise<void>;
  onCloseDialog: () => void;
}

// Icon/color are curated grids (fetched from GET /categories/options -
// see category.schema.ts for why that's not a hardcoded frontend
// constant), not a free-form picker - keeps every category inside the
// same visual system the original 9 predefined ones already followed.
// Same Field/FormInput/Controller shape envelope-form.tsx uses.
export const CategoryForm = ({
  defaultValues,
  isLoading,
  onSubmit,
  onCloseDialog,
}: CategoryFormProps) => {
  const t = useTranslations("categories.form");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const { icons, colors } = useCategoryOptions();
  const { handleSubmit, control } = useForm<CategoryFormValues>({
    resolver: zodResolver(buildCategoryFormSchema(tValidation)),
    defaultValues: {
      label: "",
      color: colors[0],
      icon: icons[0],
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <div className="flex flex-col gap-6">
            <FormInput
              control={control}
              name="label"
              label={t("name")}
              placeholder="Ej: Suscripciones"
              autoComplete="off"
              autoFocus
              disabled={isLoading}
            />

            <Controller
              control={control}
              name="icon"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="icon">{t("icon")}</FieldLabel>
                  <div
                    id="icon"
                    role="radiogroup"
                    aria-invalid={fieldState.invalid}
                    className="grid grid-cols-5 gap-2"
                  >
                    {icons.map((key) => {
                      const Icon = resolveIcon(key);
                      const selected = field.value === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          disabled={isLoading}
                          onClick={() => field.onChange(key)}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-md border transition-colors",
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-input text-muted-foreground hover:bg-muted",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="color"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="color">{t("color")}</FieldLabel>
                  <div
                    id="color"
                    role="radiogroup"
                    aria-invalid={fieldState.invalid}
                    className="flex flex-wrap gap-2"
                  >
                    {colors.map((color) => {
                      const selected = field.value === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          disabled={isLoading}
                          onClick={() => field.onChange(color)}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform",
                            selected
                              ? "scale-110 border-foreground/80"
                              : "border-transparent",
                          )}
                          style={{ background: color }}
                        >
                          {selected && (
                            <Check className="h-4 w-4 text-white drop-shadow" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>
        </FieldSet>

        <Field orientation="responsive">
          <SubmitButton isLoading={isLoading} type="submit">
            {tCommon("save")}
          </SubmitButton>
          <Button
            type="button"
            variant="outline"
            onClick={onCloseDialog}
            disabled={isLoading}
          >
            {tCommon("cancel")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};
