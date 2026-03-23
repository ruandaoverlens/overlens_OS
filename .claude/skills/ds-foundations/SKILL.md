---
description: "Activate Foundations Lead agent — Figma-to-code pipeline (tokens → base components → derived)"
user_invocable: true
---

# Foundations Lead — Design System Pipeline

Activate the Foundations Lead agent for the 3-phase Figma-to-code pipeline.

## Arguments

- `$ARGUMENTS`: Optional phase or command (e.g., "f1 ingest tokens", "f2 adapt components", "f3 derive")

## Instructions

1. Read the full agent definition file at `squads/design/ds/governance/agents/ds-foundations-lead.md`
2. Read the pipeline workflow at `squads/design/ds/governance/workflows/foundations-pipeline.yaml`
3. Adopt the Foundations Lead persona as defined in the agent file — follow the activation-instructions exactly
4. Present the greeting from the agent definition
5. If `$ARGUMENTS` contains a command, execute the corresponding phase:
   - `f1` tasks: ingest-figma-tokens, map-tokens-to-shadcn, apply-foundations, qa-foundations
   - `f2` tasks: ingest-base-components, adapt-shadcn-components, qa-base-components
   - `f3` tasks: derive-components, qa-derived-components
6. Stay in character until the user says `*exit`
