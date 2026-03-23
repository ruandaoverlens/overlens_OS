---
description: Convert a Figma design into a ds-overlens component
user_invocable: true
---

# Figma to Code

Convert a Figma design into a component that follows ds-overlens conventions.

## Arguments

- `$ARGUMENTS`: Figma URL or description of the design to implement

## Instructions

1. If a Figma URL is provided, use the Figma MCP tools to extract design context and screenshots
2. Read `app/globals.css` to map Figma tokens to existing CSS custom properties
3. Check `components/ui/` for existing components that can be composed or extended
4. Create the component following ds-overlens conventions:
   - shadcn/ui patterns with CVA variants
   - `cn()` utility for class merging
   - `data-slot` attributes
   - Dark-only styles using oklch design tokens
   - Named exports
5. Create a Storybook story file alongside the component
6. Adapt Figma's visual output to the project's Tailwind CSS 4 setup — do not copy raw styles
