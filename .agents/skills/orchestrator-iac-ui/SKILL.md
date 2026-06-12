---
name: orchestrator-iac-ui
description: React and TypeScript guidance for the orchestrator-iac-ui repo. Use when editing components, routes, forms, state, styling, accessibility, API integration, or frontend verification.
---

# Orchestrator IAC UI

## Workflow

1. Read `AGENTS.md` and the relevant component, route, and service files.
2. Keep the smallest possible UI surface in scope.
3. Put API calls in the service layer, not in components.
4. Preserve accessibility, responsiveness, and polished loading and error states.
5. Verify with the repo's frontend checks before finishing.

## Rules

- Use functional components with typed props.
- Prefer explicit interfaces, discriminated unions, and exhaustive switches.
- Avoid `any`; use `unknown` at boundaries and validate before use.
- Keep component state local unless shared state is required.
- Minimize `useEffect`; use it only for external synchronization.
- Do not duplicate backend business rules in the client.
- Keep route changes compatible with the current app structure.
- Preserve the existing visual language and interaction patterns.

## Common Work

- For forms, follow the existing form library and validation patterns.
- For routing, update the route tree and linked navigation together.
- For fetches, handle loading, empty, and error states explicitly.
- For visual refinements, check desktop and mobile layouts.
- For shared UI state, keep the data flow easy to trace.

## Verify

- Run `npm run lint` for logic and style changes.
- Run `npm run build` before shipping user-facing UI changes.
- Add or update tests when behavior changes.
