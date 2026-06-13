import React, { FormEvent, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { OTP_CODE_LENGTH, OTP_RESEND_COOLDOWN_SECONDS } from "../lib/supabase";

interface OtpVerificationFormProps {
  email: string;
  onVerify: (otp: string) => void | Promise<void>;
  onResend: () => void | Promise<void>;
  isLoading: boolean;
  isSending?: boolean;
  resendCooldownSeconds?: number;
  submitLabel?: string;
  description?: string;
}

export function OtpVerificationForm({
  email,
  onVerify,
  onResend,
  isLoading,
  isSending = false,
  resendCooldownSeconds = 0,
  submitLabel = "Verify Code",
  description = "Enter the 6-digit code sent to your email.",
}: OtpVerificationFormProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_CODE_LENGTH).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setDigits(Array(OTP_CODE_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  }, [email]);

  const otpValue = digits.join("");

  const applyOtpString = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, OTP_CODE_LENGTH);
    const next = Array(OTP_CODE_LENGTH)
      .fill("")
      .map((_, index) => cleaned[index] ?? "");
    setDigits(next);
    const focusIndex = Math.min(cleaned.length, OTP_CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < OTP_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    applyOtpString(event.clipboardData.getData("text"));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (otpValue.length === OTP_CODE_LENGTH && !isLoading) {
      onVerify(otpValue);
    }
  };

  const formDisabled = isLoading || isSending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center space-y-1">
        <p className="text-[10px] text-neutral-500 leading-relaxed">{description}</p>
        <p className="text-[10px] font-bold text-brand-green truncate">{email}</p>
        {isSending && (
          <p className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mt-2">
            Sending verification code to your email...
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            onChange={(event) => handleDigitChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event.key)}
            onPaste={handlePaste}
            disabled={formDisabled}
            className="w-9 h-11 sm:w-10 sm:h-12 text-center text-sm font-black border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green focus:outline-none bg-neutral-50 text-neutral-900 disabled:opacity-60"
            aria-label={`Digit ${index + 1} of ${OTP_CODE_LENGTH}`}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={formDisabled || otpValue.length !== OTP_CODE_LENGTH}
        className="w-full bg-brand-green hover:bg-brand-green/95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase py-2.5 rounded-lg shadow-sm font-display cursor-pointer"
      >
        {submitLabel}
      </button>

      <div className="text-center">
        {resendCooldownSeconds > 0 ? (
          <p className="text-[10px] text-neutral-400 font-medium">
            Resend code in {resendCooldownSeconds}s
          </p>
        ) : (
          <button
            type="button"
            onClick={() => onResend()}
            disabled={formDisabled}
            className="inline-flex items-center gap-1 text-[10px] font-extrabold text-brand-green uppercase tracking-wide hover:underline cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className="w-3 h-3" />
            Resend Code
          </button>
        )}
        <p className="text-[9px] text-neutral-400 mt-1">
          Code expires in 10 minutes. Max {OTP_RESEND_COOLDOWN_SECONDS}s between resends.
        </p>
      </div>
    </form>
  );
}
