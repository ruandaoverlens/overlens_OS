---
description: "Audit the design system codebase — patterns, redundancy, tokens, components"
user_invocable: true
---

# Design System Audit

Run a codebase audit on the ds-overlens design system.

## Arguments

- `$ARGUMENTS`: Optional focus area — "patterns", "tokens", "bundle", "dead-code", or a specific path

## Instructions

1. Read the Brad Frost agent at `squads/design/ds/governance/agents/brad-frost.md` for methodology
2. Based on `$ARGUMENTS`, load the appropriate task:
   - Default: Read `squads/design/ds/shared/tasks/ds-audit-codebase.md`
   - "patterns": Read `squads/design/ds/shared/tasks/ds-consolidate-patterns.md`
   - "tokens": Read `squads/design/ds/governance/tasks/token-usage-analytics.md`
   - "bundle": Read `squads/design/ds/governance/tasks/bundle-audit.md`
   - "dead-code": Read `squads/design/ds/governance/tasks/dead-code-detection.md`
3. Read `CLAUDE.md` for project structure and conventions
4. Execute the audit following the task instructions
5. Report findings with metrics, severity, and actionable recommendations
