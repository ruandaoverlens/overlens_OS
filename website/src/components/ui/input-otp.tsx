"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { SmMinusLineIcon } from "@/components/icons"

import { cn } from "@/lib/utils"

/** One-time password input with configurable slot count and pattern validation. */
function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

/** Groups adjacent OTP slots together visually. */
function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  )
}

/** Individual character slot within the OTP input. */
function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        // A borda é o único limite visível do slot, então usa `border-field-border`
        // (3:1 contra o fundo nos dois temas) e não `border-border`, que a 10-12%
        // some no claro e no escuro (WCAG 1.4.11).
        "data-[active=true]:border-foreground aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive bg-input/30 border-field-border relative flex h-12 w-12 items-center justify-center border text-lg shadow-none transition-all outline-none -ml-px first:ml-0 first:rounded-l-lg last:rounded-r-lg data-[active=true]:z-10",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  )
}

/** Dash separator placed between OTP slot groups. */
function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <SmMinusLineIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
