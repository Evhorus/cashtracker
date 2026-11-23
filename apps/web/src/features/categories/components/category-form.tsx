"use client";
import { useIsDesktop } from "@/shared/hooks/use-media-query";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Check } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { SubmitButton } from "@/shared/components/common/submit-button";
import { FormInput } from "@/shared/components/common/form-input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/shared/components/ui/field";
import {
  buildCategoryFormSchema,
  CategoryFormValues,
} from "@/features/categories/schemas/category.schema";
import { CategoryIconPicker } from "./category-icon-picker";
import { useCategoryOptions } from "@/features/categories/providers/categories-provider";
import { cn } from "@/shared/lib/utils";

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues>;
  isLoading: boolean;
  onSubmit: (categoryFormValues: CategoryFormValues) => Promise<void>;
  onCloseDialog: () => void;
}

// Icon/color are curated choices (fetched from GET /categories/options -
// see category.schema.ts for why that's not a hardcoded frontend
// constant), not free-form input - keeps every category inside the
// same visual system the original 9 predefined ones already followed.
// Same Field/FormInput/Controller shape envelope-form.tsx uses.
export const CategoryForm = ({
  defaultValues,
  isLoading,
  onSubmit,
  onCloseDialog,
}: CategoryFormProps) => {
  const t = useTranslations("categories.form");
  const isDesktop = useIsDesktop();
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

  const color = useWatch({ control, name: "color" });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <div className="flex flex-col gap-6">
            <FormInput
              control={control}
              name="label"
              label={t("name")}
              placeholder={t("namePlaceholder")}
              autoComplete="off"
              // Desktop only: on a phone it opens the keyboard the moment the
              // drawer appears, covering the form before anything is touched.
              autoFocus={isDesktop}
              disabled={isLoading}
            />

            <Controller
              control={control}
              name="icon"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="icon">{t("icon")}</FieldLabel>
                  <CategoryIconPicker
                    id="icon"
                    value={field.value}
                    onChange={field.onChange}
                    icons={icons}
                    color={color}
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
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
