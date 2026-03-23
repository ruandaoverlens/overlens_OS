"use client"

import { AspectRatio as AspectRatioPrimitive } from "radix-ui"

/** Constrains child content to a specific width-to-height ratio. */
function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
