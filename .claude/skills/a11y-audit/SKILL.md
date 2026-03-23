---
description: "Run accessibility audit on the design system (WCAG, ARIA, contrast, focus order)"
user_invocable: true
---

# Accessibility Audit

Run a comprehensive accessibility audit on the ds-overlens design system.

## Arguments

- `$ARGUMENTS`: Optional scope — "full", "aria", "contrast", "focus", or a specific component path

## Instructions

1. Read the Brad Frost agent at `squads/design/ds/governance/agents/brad-frost.md` for context and methodology
2. Based on `$ARGUMENTS`, load the appropriate task file:
   - Default/full: Read `squads/design/ds/shared/tasks/a11y-audit.md`
   - "aria": Read `squads/design/ds/shared/tasks/aria-audit.md`
   - "contrast": Read `squads/design/ds/shared/tasks/contrast-matrix.md`
   - "focus": Read `squads/design/ds/shared/tasks/focus-order-audit.md`
3. Read the WCAG checklist at `squads/design/ds/governance/checklists/ds-accessibility-wcag-checklist.md`
4. Read `CLAUDE.md` for project structure
5. Execute the audit following the task instructions, scanning `components/ui/` for issues
6. Report findings in a structured format with severity levels and actionable fixes
