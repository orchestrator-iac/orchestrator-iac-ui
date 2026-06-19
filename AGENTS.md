# Codex Instructions for `orchestrator-iac-ui`

This repo is the React + TypeScript front end for a SaaS product. Optimize for polish, clarity, accessibility, and fast iteration without compromising maintainability.

## Frontend Principles

- Preserve the existing design language and component patterns.
- Keep UI decisions intentional, not generic.
- Treat loading, empty, and error states as first-class UX.
- Keep interactions keyboard friendly, accessible, and responsive.
- Prefer deterministic UI behavior over clever abstractions.

## React + TypeScript

- Use functional components and typed props.
- Prefer explicit interfaces, discriminated unions, and exhaustive switches.
- Avoid `any`; use `unknown` at boundaries and validate before use.
- Keep component state local unless shared state is truly needed.
- Minimize `useEffect`; use it for external synchronization, not derived state.
- Memoize only when there is a proven performance need.
- Do not duplicate backend business rules in the client.
- Keep TypeScript strictness high and naming consistent.

## Architecture

- Keep business logic out of components.
- Prefer thin pages and reusable leaf components.
- Centralize backend access in the existing service layer.
- Keep route and state changes compatible with the backend contracts.
- Make cross-component state explicit and easy to trace.

## Product Quality

- Make the SaaS feel premium: clean layouts, clear hierarchy, polished feedback, no dead ends.
- Ensure desktop and mobile behavior are both considered.
- Favor readable copy and useful empty states over placeholder content.
- Keep error recovery obvious and user friendly.

## Change Discipline

- Reuse the repo's existing package manager, scripts, and linting setup.
- Do not introduce new dependencies unless the tradeoff is clear.
- Add or update tests for meaningful UI or logic changes.
- For visual work, verify behavior across the main flows before finishing.
