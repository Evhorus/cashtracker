"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";

import { useCategoryOptions } from "@/features/categories/providers/categories-provider";
import { ColorSwatchPicker } from "@/shared/components/common/color-swatch-picker";
import { FormInput } from "@/shared/components/common/form-input";
import { SubmitButton } from "@/shared/components/common/submit-button";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useIsDesktop } from "@/shared/hooks/use-media-query";
import {
  buildPaymentMethodFormSchema,
  type PaymentMethodFormValues,
} from "@/features/payment-methods/schemas/payment-method.schema";
import { PAYMENT_METHOD_TYPES } from "@/features/payment-methods/types";

interface PaymentMethodFormProps {
  defaultValues?: Partial<PaymentMethodFormValues>;
  isLoading: boolean;
  onSubmit: (values: PaymentMethodFormValues) => void;
  onCancel: () => void;
}

export function PaymentMethodForm({
  defaultValues,
  isLoading,
  onSubmit,
  onCancel,
}: PaymentMethodFormProps) {
  const t = useTranslations("paymentMethods");
  const tValidation = useTranslations("validation");
  const tCommon = useTranslations("common");
  const isDesktop = useIsDesktop();
  const { colors } = useCategoryOptions();

  const { control, handleSubmit } = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(buildPaymentMethodFormSchema(tValidation)),
    defaultValues: {
      name: "",
      type: "credit_card",
      color: colors[0],
      cutDay: "",
      ...defaultValues,
    },
  });
  const type = useWatch({ control, name: "type" });

  return (
    // Prevent portal submit events from bubbling into a parent ExpenseForm.
    <form
      onSubmit={(event) => {
        event.stopPropagation();
        void handleSubmit(onSubmit)(event);
      }}
    >
      <FieldGroup>
        <FieldSet>
          <div className="flex flex-col gap-6">
            <FormInput
              control={control}
              name="name"
              label={t("form.name")}
              placeholder={t("form.namePlaceholder")}
              autoComplete="off"
              autoFocus={isDesktop}
              disabled={isLoading}
            />

            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="payment-method-type">
                    {t("form.type")}
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => value && field.onChange(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="payment-method-type" className="w-full">
                      <SelectValue>
                        {() => t(`types.${field.value}`)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHOD_TYPES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {t(`types.${value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {type === "credit_card" && (
              <Controller
                control={control}
                name="cutDay"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="payment-method-cut-day">
                      {t("form.cutDay")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="payment-method-cut-day"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={31}
                      aria-invalid={fieldState.invalid}
                      aria-describedby="payment-method-cut-day-hint"
                      disabled={isLoading}
                    />
                    <FieldDescription id="payment-method-cut-day-hint">
                      {t("form.cutDayHint")}
                    </FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            )}

            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <Field>
                  <FieldLabel id="payment-method-color">
                    {t("form.color")}
                  </FieldLabel>
                  <ColorSwatchPicker
                    colors={colors}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                    ariaLabelPrefix={t("form.color")}
                    ariaLabelledBy="payment-method-color"
                  />
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
            onClick={onCancel}
            disabled={isLoading}
          >
            {tCommon("cancel")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
