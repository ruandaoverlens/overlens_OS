---
description: Add new SVG icons and regenerate the icon components
user_invocable: true
---

# Generate Icons

Process SVG icons from `icon-library/` into React components.

> **Legacy.** This pipeline maintains the original custom SVG set (`Md*`/`Sm*`/`Micro*`
> under `components/icons/`), kept for components that already use it. The **official
> iconography is now [Phosphor](https://phosphoricons.com/)** (`@phosphor-icons/react`).
> For any new component, import from Phosphor instead of generating custom SVGs — see the
> `Icons/Phosphor` story in Storybook. Only use this skill to touch the existing legacy set.

## Instructions

1. If new SVGs were added, verify they follow the naming convention: `{size} {snake_name} {style}.svg`
   - Sizes: `sm`, `md`, `micro`
   - Styles: `line`, `solid` (micro icons have no style suffix)
2. Run `node scripts/generate-icons.mjs` to regenerate icon components
3. Verify the output in `components/icons/{size}/`
4. Check that `components/icons/index.ts` barrel export is updated
5. Report which icons were generated or updated
