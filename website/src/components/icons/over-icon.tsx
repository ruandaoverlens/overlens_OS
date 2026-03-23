import { forwardRef, lazy, Suspense } from "react";
import type { SVGProps, ComponentType } from "react";

type IconSize = "sm" | "md" | "micro";
type IconVariant = "line" | "solid";

interface OverIconProps extends SVGProps<SVGSVGElement> {
  name: string;
  size?: IconSize;
  variant?: IconVariant;
}

// Registry of all icons - populated by imports from barrel
// This allows dynamic lookup by name/size/variant
const iconRegistry = new Map<string, ComponentType<SVGProps<SVGSVGElement>>>();

/**
 * Register an icon component in the registry.
 * Called internally by the barrel re-exports.
 */
export function registerIcon(
  key: string,
  component: ComponentType<SVGProps<SVGSVGElement>>
) {
  iconRegistry.set(key.toLowerCase(), component);
}

/**
 * Build the registry key for an icon
 */
function buildKey(name: string, size: IconSize, variant?: IconVariant): string {
  if (size === "micro") {
    return `micro-${name}`.toLowerCase();
  }
  return `${size}-${name}-${variant || "line"}`.toLowerCase();
}

/**
 * OverIcon - Dynamic icon component that looks up icons by name/size/variant.
 *
 * For most use cases, prefer importing icons directly:
 *   import { SmCheckLineIcon } from "@/components/icons"
 *
 * Use OverIcon when you need dynamic icon selection at runtime:
 *   <OverIcon name="check" size="sm" variant="line" />
 */
const OverIcon = forwardRef<SVGSVGElement, OverIconProps>(
  ({ name, size = "sm", variant = "line", ...props }, ref) => {
    const key = buildKey(name, size, variant);
    const IconComponent = iconRegistry.get(key);

    if (!IconComponent) {
      console.warn(
        `OverIcon: Icon "${key}" not found in registry. Available: ${Array.from(iconRegistry.keys()).join(", ")}`
      );
      return null;
    }

    return <IconComponent ref={ref} {...props} />;
  }
);

OverIcon.displayName = "OverIcon";

export { OverIcon };
export type { OverIconProps, IconSize, IconVariant };
