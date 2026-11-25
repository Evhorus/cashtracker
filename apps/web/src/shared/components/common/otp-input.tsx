import type { ControllerRenderProps, FieldValues } from "react-hook-form";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/shared/components/ui/input-otp";

export interface OtpInputProps<T extends FieldValues> {
  id?: string;
  value: string;
  onChange: ControllerRenderProps<T>["onChange"];
  onBlur?: ControllerRenderProps<T>["onBlur"];
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-invalid"?: boolean;
}

/** Shared 6-digit OTP input for Clerk email_code flows; callers wrap this with Controller directly. */
export function OtpInput<T extends FieldValues>({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  autoFocus,
  ...props
}: OtpInputProps<T>) {
  return (
    <InputOTP
      id={id}
      maxLength={6}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      autoFocus={autoFocus}
      {...props}
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}
