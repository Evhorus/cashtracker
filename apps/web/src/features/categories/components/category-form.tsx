"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";

import { useCategoryOptions } from "@/features/categories/providers/categories-provider";
import {
  buildCategoryFormSchema,
  type CategoryFormValues,
} from "@/features/categories/schemas/category.schema";
import { ColorSwatchPicker } from "@/shared/components/common/color-swatch-picker";
import { FormInput } from "@/shared/components/common/form-input";
import { SubmitButton } from "@/shared/components/common/submit-button";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/shared/components/ui/field";
import { useIsDesktop } from "@/shared/hooks/use-media-query";
import { CategoryIconPicker } from "./category-icon-picker";

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues>;
  isLoading: boolean;
  onSubmit: (categoryFormValues: CategoryFormValues) => Promise<void>;
  onCloseDialog: () => void;
}

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

  // Prevent portal submit events from bubbling into a parent EnvelopeForm.
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.stopPropagation();
    void handleSubmit(onSubmit)(event);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <FieldGroup>
        <FieldSet>
          <div className="flex flex-col gap-6">
            <FormInput
              control={control}
              name="label"
              label={t("name")}
              placeholder={t("namePlaceholder")}
              autoComplete="off"
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
                  <FieldLabel id="category-color-label">
                    {t("color")}
                  </FieldLabel>
                  <ColorSwatchPicker
                    id="color"
                    colors={colors}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                    ariaLabelPrefix={t("color")}
                    ariaLabelledBy="category-color-label"
                    ariaInvalid={fieldState.invalid}
                  />
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
