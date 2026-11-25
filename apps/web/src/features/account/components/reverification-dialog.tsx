"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";

import { ErrorMessage } from "@/shared/components/common/error-message";
import { FormInput } from "@/shared/components/common/form-input";
import { OtpInput } from "@/shared/components/common/otp-input";
import { SubmitButton } from "@/shared/components/common/submit-button";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { useReverificationFlow } from "@/features/account/hooks/use-reverification-flow";
import {
  type ReverificationCodeFormValues,
  buildReverificationCodeFormSchema,
  type ReverificationPasswordFormValues,
  buildReverificationPasswordFormSchema,
} from "@/features/account/schemas/account.schema";
import type { ReverificationRequest } from "@/features/account/types";

interface ReverificationDialogProps {
  request: ReverificationRequest | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Custom UI for Clerk's reverification flow (replaces Clerk's default modal); Clerk calls live in useReverificationFlow.
export function ReverificationDialog({
  request,
  onOpenChange,
  onSuccess,
}: ReverificationDialogProps) {
  const t = useTranslations("account.reverification");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const {
    factor,
    isPreparing,
    isSubmitting,
    isResending,
    fieldErrors,
    globalErrors,
    submitPassword,
    submitCode,
    resendCode,
  } = useReverificationFlow(request, onSuccess);

  const passwordForm = useForm<ReverificationPasswordFormValues>({
    resolver: zodResolver(buildReverificationPasswordFormSchema(tValidation)),
    defaultValues: { password: "" },
  });
  const codeForm = useForm<ReverificationCodeFormValues>({
    resolver: zodResolver(buildReverificationCodeFormSchema(tValidation)),
    defaultValues: { code: "" },
  });

  // Reset forms on each new request so stale state from a previous reverification doesn't carry over.
  useEffect(() => {
    passwordForm.reset();
    codeForm.reset();
  }, [request, passwordForm, codeForm]);

  return (
    <Dialog open={request !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {factor?.kind === "email_code"
              ? t("codeSentTo", { identifier: factor.safeIdentifier ?? "" })
              : t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        {globalErrors.map((message, i) => (
          <ErrorMessage key={i}>{message}</ErrorMessage>
        ))}

        {isPreparing && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isPreparing && factor?.kind === "password" && (
          <form
            onSubmit={passwordForm.handleSubmit((values) =>
              submitPassword(values.password),
            )}
            className="grid gap-y-4"
          >
            <FormInput
              control={passwordForm.control}
              name="password"
              label={tCommon("password")}
              type="password"
              autoComplete="current-password"
              autoFocus
              disabled={isSubmitting}
              serverError={fieldErrors.password}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {tCommon("cancel")}
              </Button>
              <SubmitButton type="submit" isLoading={isSubmitting}>
                {t("verify")}
              </SubmitButton>
            </DialogFooter>
          </form>
        )}

        {!isPreparing && factor?.kind === "email_code" && (
          <form
            onSubmit={codeForm.handleSubmit((values) =>
              submitCode(values.code),
            )}
            className="grid gap-y-4"
          >
            <Controller
              control={codeForm.control}
              name="code"
              render={({ field, fieldState }) => {
                const message = fieldState.error?.message ?? fieldErrors.code;
                return (
                  <Field>
                    <FieldLabel htmlFor="code">{tCommon("code")}</FieldLabel>
                    <OtpInput
                      id="code"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={isSubmitting}
                      autoFocus
                      aria-invalid={fieldState.invalid || !!fieldErrors.code}
                    />
                    {message && <FieldError>{message}</FieldError>}
                  </Field>
                );
              }}
            />
            <Button
              type="button"
              variant="link"
              className="h-auto w-fit p-0 text-sm"
              disabled={isResending}
              onClick={resendCode}
            >
              {isResending && <Loader2 className="animate-spin" />}
              {t("resendCode")}
            </Button>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {tCommon("cancel")}
              </Button>
              <SubmitButton type="submit" isLoading={isSubmitting}>
                {t("verify")}
              </SubmitButton>
            </DialogFooter>
          </form>
        )}

        {/* Fallback footer when startVerification returns no supported factor. */}
        {!isPreparing && !factor && globalErrors.length > 0 && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon("close")}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
