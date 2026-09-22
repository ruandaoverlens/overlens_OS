"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/** Toggle switch for binary on/off settings. Available in default and small sizes. */
function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        // Ligado: o contorno acompanha o próprio trilho (`outline-primary`) só
        // para preservar a caixa — antes era `outline-white`, que no tema claro
        // virava um anel branco visível dentro do trilho escuro.
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface-800 focus-visible:ring-2 focus-visible:ring-foreground group/switch inline-flex shrink-0 items-center rounded-full outline outline-2 data-[state=unchecked]:outline-offset-0 data-[state=unchecked]:outline-surface-500 data-[state=checked]:-outline-offset-1 data-[state=checked]:outline-primary shadow-none transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-20 data-[size=default]:h-4.5 data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 relative after:absolute after:content-[''] data-[size=default]:after:-inset-x-1 data-[size=default]:after:-inset-y-2.75 data-[size=sm]:after:-inset-x-2 data-[size=sm]:after:-inset-y-3.25",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "data-[state=unchecked]:bg-foreground data-[state=checked]:bg-primary-foreground pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
