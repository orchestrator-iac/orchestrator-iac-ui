---
name: orchestrator-product-ux
description: Design or refine screens in orchestrator-iac-ui using the landing-preview product UX standard, including semantic light/dark theming, editorial visual hierarchy, accessible interactions, responsive behavior, and rendered verification.
---

# Orchestrator Product UX

Use this skill when creating or improving a user-facing screen in the
orchestrator-iac-ui frontend. The `/landing-preview` route is the current
reference surface for the product direction: a calm technical exhibit that
makes infrastructure relationships easier to understand before asking users
to configure or export them.

## Before editing

1. Read `AGENTS.md` and inspect the target route, its existing styles, and the
   shared theme implementation.
2. Keep the change scoped to the requested screen. Do not replace the legacy
   `/` landing page or redesign unrelated routes unless the user asks for it.
3. Reuse the existing React, MUI, routing, and theme patterns. Do not add a UI
   framework or a dependency solely for visual decoration.
4. Treat real product capabilities and infrastructure facts as the source of
   truth. Do not invent metrics, integrations, or claims to fill space.

## Design standard

Follow the landing-preview direction without copying its content mechanically:

- Use an editorial, restrained, infrastructure-aware composition rather than
  a generic SaaS dashboard or a collection of identical cards.
- Establish hierarchy with a distinctive display face, compact technical
  metadata, deliberate asymmetry, thin rules, generous rhythm, and a small
  earthy accent vocabulary.
- Let diagrams, relationships, code, and structured content explain the
  product. Decorative depth should remain lightweight CSS/SVG; avoid heavy
  WebGL or ornamental motion that competes with the decision being made.
- Use progressive disclosure and clear primary/secondary actions. Every
  interactive state needs a visible hover, focus, disabled, loading, empty, or
  error treatment appropriate to the surface.
- Preserve keyboard access, meaningful accessible names, readable contrast,
  reduced-motion behavior, and layouts that adapt rather than simply shrink.

## Theme contract

The shared token source is
`src/components/shared/theme/design-tokens.css`. Use its semantic
`--product-*` variables in screen styles instead of hardcoding page colors.
The token pairs currently cover:

- background and surface layers: `--product-bg`, `--product-surface`,
  `--product-surface-raised`, `--product-surface-deep`
- text and rules: `--product-text`, `--product-text-muted`,
  `--product-text-subtle`, `--product-ink`, `--product-line`,
  `--product-line-subtle`
- interaction and brand accents: `--product-accent`,
  `--product-accent-strong`, `--product-accent-soft`, `--product-warm`,
  `--product-focus`, `--product-button-text`
- infrastructure illustration roles: connection, glow, shadow, shape, and CTA
  stone tokens

When a new semantic role is genuinely needed, add a light and dark value to
the shared token file first, then consume the variable from the screen. Do not
create a second page-local palette or override the page with
`color-scheme: light`.

Use `ThemeContext` and `MinimalThemeToggle` for theme behavior. An explicit
light/dark choice must persist through reload, and both modes must preserve the
same information hierarchy rather than becoming separate designs. Validate
text, rules, controls, diagrams, imagery, and focus rings in both modes.

## Implementation guidance

- Keep page-specific aliases readable when they clarify a component, but make
  them point to `--product-*` variables.
- Prefer CSS transitions and transform/opacity-based reveals. Respect
  `prefers-reduced-motion` and do not make content depend on animation timing.
- Keep content and control labels concise, specific, and user-facing. Avoid
  repeating a heading in its supporting copy.
- Preserve SEO metadata, route behavior, and existing backend contracts while
  refining presentation.

## Verification before handoff

For a visual change, verify the rendered result rather than stopping at source
or build success:

1. Inspect the desktop composition and at least one narrow/mobile layout.
2. Toggle light and dark themes and check the hero, content sections, diagrams,
   code examples, buttons, focus states, and footer/CTA surfaces.
3. Reload after an explicit theme choice and confirm the choice persists.
4. Run `npm run lint` and `git diff --check`.
5. Run the project build when the environment permits it. If it stalls or is
   blocked by configuration, report that limitation instead of claiming a
   successful build.
6. For substantial visual edits, run the Impeccable detector once against the
   changed page/component and review the findings.

Keep the final report explicit about what was visually verified, what remains
unverified, and which unrelated working-tree changes were preserved.
