import type { ControllerRenderProps, FieldValues } from "react-hook-form";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export interface OtpInputProps<T extends FieldValues> {
  id?: string;
  value: string;
  onChange: ControllerRenderProps<T>["onChange"];
  onBlur?: ControllerRenderProps<T>["onBlur"];
  disabled?: boolean;
  autoFocus?: boolean;
  "aria-invalid"?: boolean;
}

/**
 * The app's one shared "enter a 6-digit code" input - every place a Clerk
 * email_code gets typed in (forgot-password's code step, the
 * reverification dialog's email_code factor) renders this instead of a
 * plain-text FormInput pretending to be one, so there's a single visual
 * pattern for "type a code" across the app. Not wired through FormInput
 * itself (see its own doc comment) - like PriceInput/CurrencySelector,
 * this is a control other than plain text/email/password, so callers wire
 * Controller directly around it.
 */
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
