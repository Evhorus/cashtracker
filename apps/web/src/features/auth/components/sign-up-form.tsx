"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";

import { ErrorMessage } from "@/shared/components/common/error-message";
import { FormInput } from "@/shared/components/common/form-input";
import { OtpInput } from "@/shared/components/common/otp-input";
import { SubmitButton } from "@/shared/components/common/submit-button";
import { Text } from "@/shared/components/common/typography";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { useSignUp } from "@/features/auth/hooks/use-sign-up";
import {
  type CodeFormValues,
  buildCodeFormSchema,
  type SignUpFormValues,
  buildSignUpFormSchema,
} from "@/features/auth/schemas/auth.schema";
import { OAuthButtons } from "./oauth-buttons";

// Delegates Clerk state to useSignUp(); already-authenticated redirects happen in (auth)/layout.tsx.
export function SignUpForm() {
  const t = useTranslations("auth.signUp");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const {
    isSubmitting,
    isComplete,
    awaitingVerification,
    fieldErrors,
    globalErrors,
    signUpWithPassword,
    resendEmailCode,
    verifyEmailCode,
    signUpWithOAuth,
  } = useSignUp();

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(buildSignUpFormSchema(tValidation)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const codeVerifyForm = useForm<CodeFormValues>({
    resolver: zodResolver(buildCodeFormSchema(tValidation)),
    defaultValues: { code: "" },
  });

  async function onSubmit(values: SignUpFormValues) {
    await signUpWithPassword({
      firstName: values.firstName,
      lastName: values.lastName,
      emailAddress: values.email,
      password: values.password,
    });
  }

  async function onVerify(values: CodeFormValues) {
    await verifyEmailCode(values.code);
  }

  if (isComplete) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {awaitingVerification ? t("verifyTitle") : t("title")}
        </CardTitle>
        <CardDescription>
          {awaitingVerification ? t("verifySubtitle") : t("subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-y-4">
        {/* Required Clerk bot-protection mount point; must exist before signUp calls or Clerk falls back with a warning. */}
        <div id="clerk-captcha" />

        {globalErrors.map((message, i) => (
          <ErrorMessage key={i}>{message}</ErrorMessage>
        ))}

        {!awaitingVerification ? (
          <>
            <OAuthButtons disabled={isSubmitting} onSelect={signUpWithOAuth} />

            <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
              {tCommon("or")}
            </p>

            <form
              onSubmit={signUpForm.handleSubmit(onSubmit)}
              className="grid gap-y-4"
            >
              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-0">
                <FormInput
                  control={signUpForm.control}
                  name="firstName"
                  label={tCommon("name")}
                  placeholder={t("firstNamePlaceholder")}
                  autoComplete="given-name"
                  disabled={isSubmitting}
                  serverError={fieldErrors.firstName}
                />
                <FormInput
                  control={signUpForm.control}
                  name="lastName"
                  label={tCommon("lastName")}
                  placeholder={t("lastNamePlaceholder")}
                  autoComplete="family-name"
                  disabled={isSubmitting}
                  serverError={fieldErrors.lastName}
                />
              </div>
              <FormInput
                control={signUpForm.control}
                name="email"
                label={tCommon("email")}
                type="email"
                placeholder={tCommon("emailPlaceholder")}
                autoComplete="email"
                disabled={isSubmitting}
                serverError={fieldErrors.emailAddress}
              />
              <FormInput
                control={signUpForm.control}
                name="password"
                label={tCommon("password")}
                type="password"
                placeholder={tCommon("passwordPlaceholder")}
                autoComplete="new-password"
                disabled={isSubmitting}
                serverError={fieldErrors.password}
              />
              <FormInput
                control={signUpForm.control}
                name="confirmPassword"
                label={t("confirmPassword")}
                type="password"
                placeholder={tCommon("passwordPlaceholder")}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <SubmitButton
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
              >
                {t("submit")}
              </SubmitButton>
            </form>
          </>
        ) : (
          <form
            onSubmit={codeVerifyForm.handleSubmit(onVerify)}
            className="grid gap-y-4"
          >
            <Controller
              control={codeVerifyForm.control}
              name="code"
              render={({ field, fieldState }) => {
                const message = fieldState.error?.message ?? fieldErrors.code;
                return (
                  <Field>
                    <FieldLabel htmlFor="sign-up-code">
                      {tCommon("code")}
                    </FieldLabel>
                    <OtpInput
                      id="sign-up-code"
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
            <SubmitButton
              type="submit"
              isLoading={isSubmitting}
              className="w-full"
            >
              {t("verifySubmit")}
            </SubmitButton>
            <Button
              type="button"
              variant="link"
              size="sm"
              disabled={isSubmitting}
              onClick={() => resendEmailCode()}
            >
              {t("resendCode")}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <Text className="w-full text-center">
          {t("haveAccount")}{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            {t("signInLink")}
          </Link>
        </Text>
      </CardFooter>
    </Card>
  );
}
