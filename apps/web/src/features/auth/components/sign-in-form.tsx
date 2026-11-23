"use client";

import { useState } from "react";
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
import { Input } from "@/shared/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { useSignIn } from "../hooks/use-sign-in";
import {
  type CodeFormValues,
  buildCodeFormSchema,
  type EmailFormValues,
  buildEmailFormSchema,
  type SignInPasswordFormValues,
  buildSignInPasswordFormSchema,
} from "../schemas/auth.schema";
import { OAuthButtons } from "./oauth-buttons";

type Method = "password" | "code";

// Delegates Clerk state to useSignIn(); react-hook-form validates shape client-side, Clerk errors surface via serverError.
export function SignInForm() {
  const t = useTranslations("auth.signIn");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const {
    isSubmitting,
    fieldErrors,
    globalErrors,
    signInWithPassword,
    sendEmailCode,
    resendEmailCode,
    verifyEmailCode,
    signInWithOAuth,
    clearErrors,
  } = useSignIn();

  const [method, setMethod] = useState<Method>("password");
  const [codeSent, setCodeSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const passwordForm = useForm<SignInPasswordFormValues>({
    resolver: zodResolver(buildSignInPasswordFormSchema(tValidation)),
    defaultValues: { email: "", password: "" },
  });

  const codeRequestForm = useForm<EmailFormValues>({
    resolver: zodResolver(buildEmailFormSchema(tValidation)),
    defaultValues: { email: "" },
  });

  const codeVerifyForm = useForm<CodeFormValues>({
    resolver: zodResolver(buildCodeFormSchema(tValidation)),
    defaultValues: { code: "" },
  });

  async function onPasswordSubmit(values: SignInPasswordFormValues) {
    await signInWithPassword(values.email, values.password);
  }

  async function onSendCode(values: EmailFormValues) {
    const { error } = await sendEmailCode(values.email);
    if (error) return;

    setSentTo(values.email);
    setCodeSent(true);
  }

  async function onVerifyCode(values: CodeFormValues) {
    await verifyEmailCode(values.code);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-y-4">
        <OAuthButtons disabled={isSubmitting} onSelect={signInWithOAuth} />

        <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          {tCommon("or")}
        </p>

        {globalErrors.map((message, i) => (
          <ErrorMessage key={i}>{message}</ErrorMessage>
        ))}

        <Tabs
          value={method}
          onValueChange={(value) => {
            setMethod(value as Method);
            setCodeSent(false);
            void clearErrors();
            passwordForm.reset();
            codeRequestForm.reset();
            codeVerifyForm.reset();
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger value="password" className="flex-1">
              {tCommon("password")}
            </TabsTrigger>
            <TabsTrigger value="code" className="flex-1">
              {t("emailCode")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="grid gap-y-4"
            >
              <FormInput
                control={passwordForm.control}
                name="email"
                label={tCommon("email")}
                type="email"
                placeholder={tCommon("emailPlaceholder")}
                autoComplete="email"
                disabled={isSubmitting}
                serverError={fieldErrors.identifier}
              />
              {/* Uses Controller directly to place the "forgot password?" link beside the label. */}
              <Controller
                control={passwordForm.control}
                name="password"
                render={({ field, fieldState }) => {
                  const message =
                    fieldState.error?.message ?? fieldErrors.password;
                  return (
                    <Field>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="password">
                          {tCommon("password")}
                        </FieldLabel>
                        <Link
                          href="/forgot-password"
                          className="text-sm text-primary hover:underline"
                        >
                          {t("forgotPassword")}
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder={tCommon("passwordPlaceholder")}
                        autoComplete="current-password"
                        {...field}
                        aria-invalid={
                          fieldState.invalid || !!fieldErrors.password
                        }
                        disabled={isSubmitting}
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
                {t("submit")}
              </SubmitButton>
            </form>
          </TabsContent>

          <TabsContent value="code">
            {!codeSent ? (
              <form
                onSubmit={codeRequestForm.handleSubmit(onSendCode)}
                className="grid gap-y-4"
              >
                <FormInput
                  control={codeRequestForm.control}
                  name="email"
                  label={tCommon("email")}
                  type="email"
                  placeholder={tCommon("emailPlaceholder")}
                  autoComplete="email"
                  disabled={isSubmitting}
                  serverError={fieldErrors.identifier}
                />
                <SubmitButton
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  {t("sendCode")}
                </SubmitButton>
              </form>
            ) : (
              <form
                onSubmit={codeVerifyForm.handleSubmit(onVerifyCode)}
                className="grid gap-y-4"
              >
                <Text>
                  {t.rich("codeSentTo", {
                    email: () => (
                      <span className="font-medium text-foreground">
                        {sentTo}
                      </span>
                    ),
                  })}
                </Text>
                <Controller
                  control={codeVerifyForm.control}
                  name="code"
                  render={({ field, fieldState }) => {
                    const message =
                      fieldState.error?.message ?? fieldErrors.code;
                    return (
                      <Field>
                        <FieldLabel htmlFor="sign-in-code">
                          {tCommon("code")}
                        </FieldLabel>
                        <OtpInput
                          id="sign-in-code"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={isSubmitting}
                          autoFocus
                          aria-invalid={
                            fieldState.invalid || !!fieldErrors.code
                          }
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
                  {t("verify")}
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
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Text className="w-full text-center">
          {t("noAccount")}{" "}
          <Link
            href="/sign-up"
            className="font-medium text-primary hover:underline"
          >
            {t("createOne")}
          </Link>
        </Text>
      </CardFooter>
    </Card>
  );
}
