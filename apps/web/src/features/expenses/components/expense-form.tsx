"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Controller, useForm } from "react-hook-form";

import type { ExpenseFormValues } from "@/features/expenses/schemas/expense.schema";
import { buildExpenseSchema } from "@/features/expenses/schemas/expense.schema";
import { PaymentMethodPicker } from "@/features/payment-methods/components/payment-method-picker";
import { FormInput } from "@/shared/components/common/form-input";
import { PriceInput } from "@/shared/components/common/price-input";
import { SubmitButton } from "@/shared/components/common/submit-button";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/shared/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Textarea } from "@/shared/components/ui/textarea";
import { useIsDesktop } from "@/shared/hooks/use-media-query";
import { cn } from "@/shared/lib/utils";
import {
  DATE_FNS_LOCALES,
  formatDate,
  getToday,
} from "@/shared/utils/date-helpers";
import {
  CURRENCY_MAP,
  type CurrencyCode,
} from "@/shared/utils/format-currency";

interface ExpenseFormProps {
  /** Envelope currency (locked so expenses never mix currencies within an envelope). */
  currency: CurrencyCode;
  defaultValues?: Partial<ExpenseFormValues>;
  isLoading: boolean;
  onSubmit: (expenseFormValues: ExpenseFormValues) => Promise<void>;
  onCloseDialog: () => void;
}

export const ExpenseForm = ({
  currency,
  defaultValues,
  isLoading,
  onSubmit,
  onCloseDialog,
}: ExpenseFormProps) => {
  const tValidation = useTranslations("validation");
  const t = useTranslations("expenses.form");
  const isDesktop = useIsDesktop();
  const locale = useLocale();
  const tCommon = useTranslations("common");
  // Memoized automatically by React Compiler.
  const expenseSchema = buildExpenseSchema(currency, tValidation);
  const currencyConfig = CURRENCY_MAP[currency];

  const { handleSubmit, control } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: "",
      amount: "",
      currency,
      description: "",
      date: getToday(),
      paymentMethodId: "",
      ...defaultValues,
    },
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet>
          <FieldGroup>
            <FormInput
              control={control}
              name="name"
              label={t("name")}
              placeholder={t("namePlaceholder")}
              autoComplete="off"
              // Desktop only: on a phone it opens the keyboard the moment the
              // drawer appears, covering the form before anything is touched.
              autoFocus={isDesktop}
              disabled={isLoading}
            />

            <div className="flex flex-col gap-4 sm:flex-row">
              <Controller
                control={control}
                name="amount"
                render={({ field, fieldState }) => (
                  <Field className="flex-1">
                    <FieldLabel htmlFor="amount" className="items-center">
                      {t("amount")}
                      <span
                        title={t("inheritsCurrency")}
                        className="rounded-sm bg-secondary px-1.5 py-0.5 text-xs font-normal text-secondary-foreground"
                      >
                        {currencyConfig.currency}
                      </span>
                    </FieldLabel>
                    <PriceInput
                      id="amount"
                      {...field}
                      aria-invalid={fieldState.invalid}
                      disabled={isLoading}
                      currencyConfig={currencyConfig}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="date"
                render={({ field, fieldState }) => (
                  <Field className="flex-1">
                    <FieldLabel htmlFor="expense-date">{t("date")}</FieldLabel>
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger
                        render={
                          <Button
                            id="expense-date"
                            variant={"outline"}
                            aria-invalid={fieldState.invalid}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              formatDate(field.value, locale)
                            ) : (
                              <span>{t("selectDate")}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        }
                      />
                      <PopoverContent className="w-auto p-0" align="start">
                        {/* required prevents react-day-picker from deselecting the active date on re-click. */}
                        <Calendar
                          mode="single"
                          required
                          selected={field.value}
                          defaultMonth={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setIsCalendarOpen(false);
                          }}
                          locale={DATE_FNS_LOCALES[locale]}
                          captionLayout="dropdown"
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          <Controller
            control={control}
            name="paymentMethodId"
            render={({ field }) => (
              <Field>
                <PaymentMethodPicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="expense-description">
                  {t("description")}
                </FieldLabel>
                <Textarea
                  {...field}
                  id="expense-description"
                  placeholder={t("descriptionPlaceholder")}
                  rows={3}
                  aria-invalid={fieldState.invalid}
                  disabled={isLoading}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
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
