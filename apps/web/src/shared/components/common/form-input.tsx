import { useId } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

type FormInputProps<TFieldValues extends FieldValues> = Omit<
  React.ComponentProps<typeof Input>,
  "name" | "value" | "onChange" | "onBlur" | "defaultValue" | "ref"
> & {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  fieldClassName?: string;
  /** External (server/provider) field error; shown when no client validation error exists and sets `aria-invalid`. */
  serverError?: string;
};

/** Wires react-hook-form `Controller` to `Field`/`Input` with `aria-invalid` for error styling. */
export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  fieldClassName,
  serverError,
  ...inputProps
}: FormInputProps<TFieldValues>) {
  // Use a generated id so stacked forms with matching field names (e.g. "name") don't collide.
  const generatedId = useId();
  const id = inputProps.id ?? generatedId;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const message = fieldState.error?.message ?? serverError;
        return (
          <Field className={fieldClassName}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Input
              {...field}
              aria-invalid={fieldState.invalid || !!serverError}
              {...inputProps}
              id={id}
            />
            {message && <FieldError>{message}</FieldError>}
          </Field>
        );
      }}
    />
  );
}
