# Architecture Brief (shared input for all documentation and implementation work)

This brief fixes the target architecture so that the SRS, SADS, SUDS, Test Plan and the implementation all agree.
Every document and every code change must be consistent with it.

## Context

- Product: personal portfolio site of S. Jeevanandham (Senior HMI Engineer), https://jeevanandhamsivasankar.github.io
- Stack: React 19 + Vite 7, plain JavaScript (JSX), ESLint 9 flat config. Deployed to GitHub Pages from the `gh-pages` branch via `npm run deploy`.
- Current state: everything lives in one 2,469-line `src/App.jsx`: a ~900-line CSS template string injected with `<style>`, hooks, primitives, all content data, a tech-icon system with custom SVGs, effects (orbs, cursor glow, particles), an animated speedometer widget, 11 sections, and `App`.
- Goal of the redesign: same visual design and behaviour (pixel-level parity is the acceptance bar), but a modular, layered, testable architecture with explicit domain models and well-known design patterns.

## Target module layout (authoritative)

```
src/
  main.jsx                       entry: createRoot, StrictMode, imports global CSS, ErrorBoundary
  App.jsx                        composition root: providers + layout + section registry render
  config/
    site.js                      site-wide constants (owner name, location, URLs, resume path, footer text)
    sections.js                  SECTION REGISTRY: ordered list {id, label, icon, component (lazy or eager), showInNav}
  models/                        DOMAIN MODELS (pure JS, no React)
    index.js                     re-exports
    types.js                     JSDoc @typedef for every model
    createModels.js              factory functions: createExperience(), createProject(), ... (validate + freeze)
    validate.js                  small schema/assert helpers (required fields, types, URL/email checks)
  data/                          CONTENT (plain data, built via model factories)
    profile.js                   Profile + Stats + hero roles + badges
    navigation.js                (if not fully covered by config/sections.js)
    experience.js
    skills.js                    SkillCategory[] with Skill[]
    projects.js
    design.js                    DesignCard[] (Behance)
    education.js
    certifications.js
    contact.js                   ContactLink[]
  context/
    ThemeContext.jsx             ThemeProvider + useThemeContext (Provider pattern); wraps useTheme
  hooks/
    useTheme.js                  sunrise/sunset auto theme for Chennai + manual toggle
    useReveal.js                 IntersectionObserver reveal-on-scroll (Observer pattern)
    useActiveSection.js
    useScrolled.js
    useTypewriter.js
    useParallax.js
    usePrefersReducedMotion.js   new: matchMedia hook, used to disable JS-driven motion
  lib/
    solar.js                     pure sunrise/sunset calculation (extracted from useTheme, unit-testable)
    random.js                    seeded PRNG used for particles (deterministic, pure)
  components/
    ui/                          presentational primitives
      Icon.jsx                   (was Ms)  Material Symbols icon
      SectionLabel.jsx           (was SL)
      SectionTitle.jsx           (was ST)
      Button.jsx                 link-button variants: amber | outline | green
      Badge.jsx
      Section.jsx                section wrapper: id, data-section, label, title, children
    tech/
      TechIcon.jsx               STRATEGY pattern: resolves "si:slug" | "ms:icon" | "svg:key" via a strategy map
      iconStrategies.js
      customSvgs.jsx             CUSTOM_SVGS registry (Registry pattern)
      SkillChip.jsx
    effects/
      GradientOrbs.jsx
      CursorGlow.jsx
      Particles.jsx
    widgets/
      Speedometer.jsx
    layout/
      Nav.jsx
      Footer.jsx
      Divider.jsx
    ErrorBoundary.jsx            class component; graceful fallback
  sections/
    Hero.jsx About.jsx Experience.jsx Skills.jsx Projects.jsx Design.jsx
    Education.jsx Certifications.jsx Resume.jsx Contact.jsx
  styles/
    tokens.css                   :root + [data-theme="day"] custom properties
    base.css                     reset, body, typography, utilities, reveal, reduced-motion
    components.css               nav, buttons, badges, cards, effects, speedometer
    sections.css                 per-section styles
    index.css                    @imports the four above (imported once from main.jsx)
tests/ (or colocated *.test.js)  Vitest + @testing-library/react + jsdom
```

## Design patterns to apply (and document)

- Layered architecture: config/data/models (domain) -> hooks/context (application/state) -> components/sections (presentation) -> App (composition root).
- Domain models with factory + validation (Factory pattern), immutable (Object.freeze) content objects.
- Section Registry (Registry / configuration-driven rendering): App and Nav both derive from `config/sections.js`; adding a section = one registry entry.
- Provider pattern for theme (React Context) instead of prop drilling.
- Custom hooks encapsulating side effects; Observer pattern via IntersectionObserver.
- Strategy pattern for tech icon resolution.
- Container/presentational split: sections read data modules and render presentational components.
- Error Boundary for resilience.
- Code splitting: below-the-fold sections via React.lazy + Suspense (Hero/Nav eager).
- Pure functions for logic (solar calc, PRNG) so they are unit-testable.

## Non-functional constraints

- Visual and behavioural parity with the current site (same CSS rules/values, same markup class names, same text content).
- `npm run lint`, `npm test`, `npm run build` must all pass. CI (`.github/workflows/ci.yml`) runs lint + build and must also run tests.
- No new runtime dependencies. Dev dependencies allowed: vitest, @vitest/coverage-v8, @testing-library/react, @testing-library/dom, @testing-library/jest-dom, @testing-library/user-event, jsdom, @playwright/test.
- Visual baseline: commit `dd9a86d` (pre-refactor monolith on `main`) is the parity reference.
- Accessibility: keep prefers-reduced-motion support, alt text, semantic landmarks; aim for WCAG 2.1 AA.
- Performance: initial JS should not grow; lazy sections should reduce initial chunk.
- Deployment unchanged (GitHub Pages, base '/').

## Document set (in docs/)

- `SRS.md`  Software Requirements Specification (IEEE 29148 style). Requirement IDs: `FR-<AREA>-NNN` (functional), `NFR-<CAT>-NNN` (non-functional). Areas: NAV, HERO, ABOUT, EXP, SKILL, PROJ, DESIGN, EDU, CERT, RES, CONT, THEME, FX, GEN.
- `SADS.md` Software Architecture Design Specification: views (context, logical/module, runtime, deployment), patterns, decisions as ADRs `ADR-NNN`, architecture element IDs `ARC-NNN`.
- `SUDS.md` Software Unit Design Specification: one entry per unit (file), unit IDs `UNIT-<NAME>`, interface (props/params/returns), behaviour, dependencies, error handling, and mapped requirement IDs.
- `STP.md`  Software Test Plan + test case IDs `TC-NNN` + Traceability matrix (Requirement -> ARC -> UNIT -> TC).

## Test strategy (ASPICE-aligned levels)

| Level | ASPICE | Tooling | Location | Basis |
|---|---|---|---|---|
| Unit test | SWE.4 | Vitest + @testing-library/react + jsdom | `tests/unit/**` | SUDS units (`UNIT-*`) |
| Integration test | SWE.5 | Vitest + @testing-library/react + jsdom | `tests/integration/**` | SADS elements/interfaces (`ARC-*`) |
| Qualification test | SWE.6 | Playwright (`@playwright/test`, Chromium) against `vite preview` of the production build | `tests/qualification/**` | SRS requirements (`FR-*`, `NFR-*`) |

Test case IDs: `UT-<UNIT>-NNN`, `IT-NNN`, `QT-NNN`. Every test title starts with its ID. Qualification tests run at desktop (1366x800) and mobile (390x844) viewports, block Google Fonts requests (offline-safe), and include accessibility checks (landmarks, alt text, keyboard nav, reduced motion), SEO meta checks, link integrity (internal anchors + resume asset), and screenshot-based visual regression.
Scripts: `npm test` (unit+integration), `npm run test:coverage`, `npm run test:qualification`. Coverage target: >=90% lines for models/lib/hooks, >=80% overall.

## Process: V-model

```
SRS  ─────────────────────────────▶  Qualification test (QT, SWE.6)
  SADS  ───────────────────────▶  Integration test (IT, SWE.5)
    SUDS  ─────────────────▶  Unit test (UT, SWE.4)
          Implementation (SWE.3)
```

1. Specification (left side): SRS -> SADS -> SUDS, plus STP with test cases and traceability.
2. Implementation against SUDS.
3. Verification (right side): UT -> IT -> QT.
4. Test/fix loop: the test runner produces `docs/TEST_REPORT.md` (pass/fail per test case ID, defects `DEF-NNN` with reproduction and suspected unit). The developer fixes code (never weakens or skips a test unless the test itself contradicts the SRS, which must be recorded), then all levels re-run. Repeat until all green.
5. Release: lint + all tests + build green -> PR -> CI green -> merge to `main` -> `npm run deploy` to `gh-pages`.

## ID conventions (binding for all documents and tests)

- Unit IDs: `UNIT-` + source file base name converted to UPPER_SNAKE_CASE. Examples: `src/hooks/useTheme.js` -> `UNIT-USE_THEME`; `src/components/tech/TechIcon.jsx` -> `UNIT-TECH_ICON`; `src/lib/solar.js` -> `UNIT-SOLAR`; `src/sections/Hero.jsx` -> `UNIT-HERO`; `src/models/createModels.js` -> `UNIT-CREATE_MODELS`; `src/data/experience.js` -> `UNIT-DATA_EXPERIENCE` (data files get a `DATA_` prefix); `src/config/sections.js` -> `UNIT-CONFIG_SECTIONS`; `src/config/site.js` -> `UNIT-CONFIG_SITE`; CSS files -> `UNIT-STYLE_<NAME>`.
- Unit test IDs: `UT-<UNIT suffix>-NNN` (e.g. `UT-USE_THEME-003`). Integration: `IT-NNN`. Qualification: `QT-NNN`.
- Test files: `tests/unit/<path mirroring src>/<File>.test.js[x]`, `tests/integration/<topic>.test.jsx`, `tests/qualification/<area>.spec.js`.
