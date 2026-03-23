---
description: Scaffold a new UI component following ds-overlens conventions
user_invocable: true
---

# New Component

Create a new UI component in `components/ui/` following the ds-overlens design system conventions.

## Arguments

- `$ARGUMENTS`: The component name (e.g., "StatusBadge")

## Instructions

1. Read `CLAUDE.md` for project conventions
2. Create the component file at `components/ui/{kebab-case-name}.tsx` with:
   - Named exports (no default exports)
   - CVA variants using `class-variance-authority`
   - `cn()` utility from `@/lib/utils` for class merging
   - `data-slot` attributes for styling hooks
   - Props interface extending relevant HTML element attributes
   - `React.forwardRef` pattern where appropriate
3. Create a co-located Storybook file at `components/ui/{kebab-case-name}.stories.tsx` with:
   - Default story showcasing all variants
   - Individual stories for each variant
   - Proper `argTypes` configuration
   - `autodocs` tag for automatic documentation
4. Use design tokens from `app/globals.css` (oklch CSS custom properties)
5. Follow the dark-only theme constraint — no light mode styles
