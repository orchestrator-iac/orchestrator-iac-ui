---
name: orchestrator-iac-cross-repo
description: Coordination guidance for changes spanning orchestrator-iac-ui and orchestrator-iac-backend. Use when an API, auth, session, data model, or rollout change must stay aligned across both repos.
---

# Orchestrator IAC Cross-Repo

## Workflow

1. Read both repos' `AGENTS.md` files.
2. Write down the contract: fields, auth, session flow, errors, and compatibility rules.
3. Choose the implementation order before editing code.
4. Keep the rollout additive when possible.
5. Verify the end-to-end flow, not just isolated tests.

## Rules

- Do not let UI and backend drift on field names or semantics.
- Keep auth and session handling consistent across repos.
- Prefer backward compatible changes and phased rollouts.
- Update loading, empty, and error states together when backend changes affect the UI.
- Preserve safety guardrails if generated infrastructure or agent behavior is involved.

## Common Work

- For API changes, update the contract, callers, and tests together.
- For auth or session changes, verify login, refresh, and logout behavior in both repos.
- For response shape changes, keep naming stable and explicit.
- For rollout-sensitive work, prefer additive changes and a short compatibility window.
- For product flows that cross repos, smoke test the full user journey.

## Verify

- Run the relevant backend and frontend checks.
- Smoke test the user journey across the contract boundary.
- Confirm docs, examples, or API notes match the final behavior.
