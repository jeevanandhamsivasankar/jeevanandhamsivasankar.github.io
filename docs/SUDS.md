# Software Unit Design Specification (SUDS)

**Product:** Portfolio site of S. Jeevanandham, Senior HMI Engineer (https://jeevanandhamsivasankar.github.io)
**Document ID:** SUDS-PORTFOLIO-001  |  **Version:** 1.0  |  **Date:** 2026-10-11
**Status:** Baseline for implementation (SWE.3) and unit test (SWE.4)
**Inputs (in precedence order):** `docs/ARCHITECTURE_BRIEF.md` (authoritative layout and IDs) > `docs/SRS.md` v1.1 (baselined) > `docs/SADS.md` v1.1 > baseline `src/App.jsx` at `dd9a86d` (behavioural source of truth for everything the SRS does not change).

### Change history

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-10-11 | Initial unit design. Covers every file of the target layout plus 6 additional units (section 1.3). Incorporates SRS v1.1 (PO review) and SADS v1.1 (ADR-011 rewritten, ADR-017..021). |

---

## Table of contents

1. [Introduction](#1-introduction)
2. [Units index](#2-units-index)
3. [Cross-cutting unit rules](#3-cross-cutting-unit-rules)
4. [Domain model (typedefs, validation, factory contract)](#4-domain-model)
5. [Algorithms](#5-algorithms) (solar, PRNG, gauge)
6. [Unit specifications](#6-unit-specifications)
   - 6.1 Entry and composition, 6.2 Config, 6.3 Models, 6.4 Data, 6.5 Lib, 6.6 Hooks, 6.7 Context, 6.8 UI primitives, 6.9 Tech icons, 6.10 Effects, 6.11 Widgets, 6.12 Layout, 6.13 ErrorBoundary, 6.14 Sections, 6.15 Styles
7. [CSS split mapping](#7-css-split-mapping)
8. [Deviations from SADS and open issues](#8-deviations-from-sads-and-open-issues)

---

## 1. Introduction

### 1.1 Purpose

This document specifies every software unit (one unit = one source file) of the re-architected portfolio. It is the implementation contract for three associate engineers working in parallel and the test basis for unit tests (`UT-<UNIT>-NNN`, SWE.4). Each unit lists its ID, file, parent ARC element, purpose, exact interface, behaviour (with the baseline constants from `src/App.jsx`), error handling, allowed dependencies, traced requirements and ADRs, and the unit test cases the UT engineer must cover.

"Baseline line N" always means `src/App.jsx` at commit `dd9a86d` (2,469 lines).

### 1.2 Conventions

- **Unit ID:** `UNIT-` + file base name in UPPER_SNAKE_CASE. Data files get `DATA_`, config files `CONFIG_`, CSS files `STYLE_`. `src/models/index.js` is `UNIT-MODELS_INDEX` (the bare name `INDEX` would collide with `styles/index.css` = `UNIT-STYLE_INDEX`).
- **Unit test file:** `tests/unit/<path mirroring src without "src/">/<File>.test.js[x]`, e.g. `tests/unit/lib/solar.test.js`, `tests/unit/components/ui/Icon.test.jsx`.
- **Test IDs:** `UT-<UNIT suffix>-NNN`, e.g. `UT-SOLAR-001`. The "Unit test considerations" in each unit list the minimum cases; numbering is assigned in `docs/STP.md`.
- **Types** are JSDoc types. `MsIcon` = Material Symbols ligature (`/^[a-z0-9_]+$/`). `IconRef` = `"si:<slug>" | "ms:<name>" | "svg:<key>"`. `HexColor` = `/^#[0-9a-fA-F]{6}$/`. `CssColor` = `HexColor | rgba(...) | linear-gradient(...)`. `SafeUrl` per section 4.4.
- **"Verbatim"** means copy the baseline text, numbers and JSX attribute values character for character (including `—` em dash U+2014, `·` U+00B7, `–` en dash U+2013, `²` U+00B2, `⚡` U+26A1 and `©`).

### 1.3 Units added beyond the brief's layout (justification)

| Added unit | File | Why it is necessary |
|---|---|---|
| UNIT-STORAGE | `src/lib/storage.js` | Mandated by SADS v1.1 ADR-018 / FR-THEME-008: guarded `localStorage` accessor, injectable for tests. |
| UNIT-USE_IN_VIEW | `src/hooks/useInView.js` | Mandated by SADS v1.1 ADR-019 / NFR-PERF-006: IntersectionObserver + `visibilitychange` gate for the gauge loop. |
| UNIT-GAUGE | `src/lib/gauge.js` | Pure speedometer maths (formulas, arc path, ticks) must be unit-testable (FR-HERO-009/010 UT acceptance). It cannot be exported from `Speedometer.jsx` because `react-refresh/only-export-components` fails lint when a `.jsx` file exports a component plus non-components (SADS R-11). `lib/` is the correct layer for pure functions. |
| UNIT-RICH_TEXT | `src/components/ui/RichText.jsx` | The hero bio and the About paragraphs are stored as structured segments (no HTML strings, NFR-SEC-003). One shared renderer guarantees identical markup (`<strong>` / `<span class="hl">`). |
| UNIT-DESIGN_ART | `src/components/widgets/DesignArt.jsx` | Registry of the 5 inline SVG artworks keyed by `artKey` (SADS 6.4, ARC-016 "may be extracted"). Extracting it keeps `Design.jsx` to a single default export (R-DEFAULT-EXPORT) and lets an IT assert every `artKey` resolves. |
| UNIT-SECTION_SLOT | `src/components/layout/SectionSlot.jsx` | One registry entry -> `ErrorBoundary` (+ `Suspense` + placeholder for lazy entries). Isolates the lazy-loading/error-containment logic (SADS 4.4.4) in a testable unit instead of inline in `App`. |

Not created: `src/data/navigation.js` (the brief makes it conditional; the registry covers navigation, SADS ARC-006). No `useClock` / `useHashScroll` files: per SADS v1.1 the clock tick lives in `useTheme` and the hash scroll lives in the `useActiveSection` module.

### 1.4 Precedence rules applied in this document

1. Where SRS v1.1 and SADS disagree, SRS v1.1 wins (it is baselined; SADS is "corrected to match").
2. Where neither the SRS nor the SADS specifies a behaviour, the baseline `App.jsx` behaviour is preserved exactly.
3. Every deliberate deviation from SADS v1.1 is listed in section 8.1 with its reason.

---

## 2. Units index

| # | Unit ID | File | ARC | Kind | Key requirements |
|---|---|---|---|---|---|
| 1 | UNIT-MAIN | `src/main.jsx` | ARC-001 | entry | FR-GEN-007, NFR-RELI-004, NFR-MAINT-003 |
| 2 | UNIT-APP | `src/App.jsx` | ARC-002 | composition root | FR-GEN-001/002/005, FR-NAV-004, NFR-A11Y-008 |
| 3 | UNIT-CONFIG_SITE | `src/config/site.js` | ARC-003 | constants | FR-CONT-*, FR-RES-*, FR-HERO-007, FR-GEN-004, FR-THEME-008 |
| 4 | UNIT-CONFIG_SECTIONS | `src/config/sections.js` | ARC-004 | registry | FR-NAV-003/004, FR-GEN-001/002/003/005 |
| 5 | UNIT-MODELS_INDEX | `src/models/index.js` | ARC-005 | barrel | NFR-MAINT-006 |
| 6 | UNIT-TYPES | `src/models/types.js` | ARC-005 | JSDoc typedefs | NFR-MAINT-006 |
| 7 | UNIT-CREATE_MODELS | `src/models/createModels.js` | ARC-005 | factories | FR-GEN-006, NFR-SEC-004 |
| 8 | UNIT-VALIDATE | `src/models/validate.js` | ARC-005 | assertions | FR-GEN-006, NFR-SEC-004 |
| 9 | UNIT-DATA_PROFILE | `src/data/profile.js` | ARC-006 | content | FR-HERO-002..011, FR-ABOUT-002/003, FR-RES-003 |
| 10 | UNIT-DATA_EXPERIENCE | `src/data/experience.js` | ARC-006 | content | FR-EXP-002 |
| 11 | UNIT-DATA_SKILLS | `src/data/skills.js` | ARC-006 | content | FR-SKILL-002/005 |
| 12 | UNIT-DATA_PROJECTS | `src/data/projects.js` | ARC-006 | content | FR-PROJ-002 |
| 13 | UNIT-DATA_DESIGN | `src/data/design.js` | ARC-006 | content | FR-DESIGN-002/003 |
| 14 | UNIT-DATA_EDUCATION | `src/data/education.js` | ARC-006 | content | FR-EDU-002/003/004 |
| 15 | UNIT-DATA_CERTIFICATIONS | `src/data/certifications.js` | ARC-006 | content | FR-CERT-002 |
| 16 | UNIT-DATA_CONTACT | `src/data/contact.js` | ARC-006 | content | FR-CONT-001..004 |
| 17 | UNIT-SOLAR | `src/lib/solar.js` | ARC-007 | pure algorithm | FR-THEME-002, NFR-PORT-003 |
| 18 | UNIT-RANDOM | `src/lib/random.js` | ARC-007 | pure algorithm | FR-FX-003 |
| 19 | UNIT-STORAGE | `src/lib/storage.js` | ARC-007 | guarded I/O adapter | FR-THEME-008 |
| 20 | UNIT-GAUGE | `src/lib/gauge.js` | ARC-007 | pure algorithm | FR-HERO-009/010 |
| 21 | UNIT-USE_THEME | `src/hooks/useTheme.js` | ARC-009 | hook | FR-THEME-001..005, 008 |
| 22 | UNIT-USE_REVEAL | `src/hooks/useReveal.js` | ARC-009 | hook | FR-FX-005, NFR-RELI-005 |
| 23 | UNIT-USE_ACTIVE_SECTION | `src/hooks/useActiveSection.js` | ARC-009 | hook (+ `useHashScroll`) | FR-NAV-006, FR-GEN-005 |
| 24 | UNIT-USE_SCROLLED | `src/hooks/useScrolled.js` | ARC-009 | hook | FR-NAV-007 |
| 25 | UNIT-USE_TYPEWRITER | `src/hooks/useTypewriter.js` | ARC-009 | hook | FR-HERO-003/004, NFR-A11Y-002 |
| 26 | UNIT-USE_PARALLAX | `src/hooks/useParallax.js` | ARC-009 | hook | FR-HERO-013, NFR-A11Y-002 |
| 27 | UNIT-USE_PREFERS_REDUCED_MOTION | `src/hooks/usePrefersReducedMotion.js` | ARC-009 | hook | NFR-A11Y-001/002 |
| 28 | UNIT-USE_IN_VIEW | `src/hooks/useInView.js` | ARC-009 | hook | NFR-PERF-006 |
| 29 | UNIT-THEME_CONTEXT | `src/context/ThemeContext.jsx` | ARC-008 | provider | FR-THEME-001, 007 |
| 30 | UNIT-ICON | `src/components/ui/Icon.jsx` | ARC-010 | primitive | NFR-A11Y-007, NFR-MAINT-008 (OBS-11) |
| 31 | UNIT-SECTION_LABEL | `src/components/ui/SectionLabel.jsx` | ARC-010 | primitive | FR-GEN-003 |
| 32 | UNIT-SECTION_TITLE | `src/components/ui/SectionTitle.jsx` | ARC-010 | primitive | FR-GEN-003 |
| 33 | UNIT-BUTTON | `src/components/ui/Button.jsx` | ARC-010 | primitive | FR-HERO-007, FR-RES-002, NFR-SEC-001 |
| 34 | UNIT-BADGE | `src/components/ui/Badge.jsx` | ARC-010 | primitive | FR-HERO-006 |
| 35 | UNIT-SECTION | `src/components/ui/Section.jsx` | ARC-010 | primitive | FR-GEN-001/003, FR-FX-005 |
| 36 | UNIT-RICH_TEXT | `src/components/ui/RichText.jsx` | ARC-010 | primitive (added) | FR-HERO-005, FR-ABOUT-002, NFR-SEC-003 |
| 37 | UNIT-TECH_ICON | `src/components/tech/TechIcon.jsx` | ARC-011 | strategy context | FR-SKILL-003/004 |
| 38 | UNIT-ICON_STRATEGIES | `src/components/tech/iconStrategies.js` | ARC-011 | strategies | FR-SKILL-003/004, NFR-A11Y-004 |
| 39 | UNIT-CUSTOM_SVGS | `src/components/tech/customSvgs.jsx` | ARC-011 | registry | FR-SKILL-003 |
| 40 | UNIT-SKILL_CHIP | `src/components/tech/SkillChip.jsx` | ARC-011 | presentational | FR-SKILL-003, FR-GEN-010 |
| 41 | UNIT-GRADIENT_ORBS | `src/components/effects/GradientOrbs.jsx` | ARC-012 | effect | FR-FX-001 |
| 42 | UNIT-CURSOR_GLOW | `src/components/effects/CursorGlow.jsx` | ARC-012 | effect | FR-FX-002, NFR-A11Y-001/002 |
| 43 | UNIT-PARTICLES | `src/components/effects/Particles.jsx` | ARC-012 | effect | FR-FX-003 |
| 44 | UNIT-SPEEDOMETER | `src/components/widgets/Speedometer.jsx` | ARC-013 | widget | FR-HERO-009/010, NFR-PERF-006, NFR-A11Y-002 |
| 45 | UNIT-DESIGN_ART | `src/components/widgets/DesignArt.jsx` | ARC-013 | registry widget (added) | FR-DESIGN-002 |
| 46 | UNIT-NAV | `src/components/layout/Nav.jsx` | ARC-014 | layout | FR-NAV-001..012, FR-THEME-004/005 |
| 47 | UNIT-FOOTER | `src/components/layout/Footer.jsx` | ARC-014 | layout | FR-GEN-004 |
| 48 | UNIT-DIVIDER | `src/components/layout/Divider.jsx` | ARC-014 | layout | FR-GEN-001 |
| 49 | UNIT-SECTION_SLOT | `src/components/layout/SectionSlot.jsx` | ARC-014 / ARC-015 | layout (added) | FR-GEN-005/007 |
| 50 | UNIT-ERROR_BOUNDARY | `src/components/ErrorBoundary.jsx` | ARC-015 | resilience | FR-GEN-007 |
| 51 | UNIT-HERO | `src/sections/Hero.jsx` | ARC-016 | section (eager) | FR-HERO-001..014 |
| 52 | UNIT-ABOUT | `src/sections/About.jsx` | ARC-016 | section (lazy) | FR-ABOUT-001..004 |
| 53 | UNIT-EXPERIENCE | `src/sections/Experience.jsx` | ARC-016 | section (lazy) | FR-EXP-001/002 |
| 54 | UNIT-SKILLS | `src/sections/Skills.jsx` | ARC-016 | section (lazy) | FR-SKILL-001..006 |
| 55 | UNIT-PROJECTS | `src/sections/Projects.jsx` | ARC-016 | section (lazy) | FR-PROJ-001..003 |
| 56 | UNIT-DESIGN | `src/sections/Design.jsx` | ARC-016 | section (lazy) | FR-DESIGN-001..003 |
| 57 | UNIT-EDUCATION | `src/sections/Education.jsx` | ARC-016 | section (lazy) | FR-EDU-001..004 |
| 58 | UNIT-CERTIFICATIONS | `src/sections/Certifications.jsx` | ARC-016 | section (lazy) | FR-CERT-001/002 |
| 59 | UNIT-RESUME | `src/sections/Resume.jsx` | ARC-016 | section (lazy) | FR-RES-001..004 |
| 60 | UNIT-CONTACT | `src/sections/Contact.jsx` | ARC-016 | section (lazy) | FR-CONT-001..004 |
| 61 | UNIT-STYLE_TOKENS | `src/styles/tokens.css` | ARC-017 | CSS | FR-THEME-001, NFR-MAINT-003 |
| 62 | UNIT-STYLE_BASE | `src/styles/base.css` | ARC-017 | CSS | FR-FX-005, NFR-A11Y-009, NFR-MAINT-003 |
| 63 | UNIT-STYLE_COMPONENTS | `src/styles/components.css` | ARC-017 | CSS | FR-NAV-*, FR-FX-*, NFR-A11Y-008 |
| 64 | UNIT-STYLE_SECTIONS | `src/styles/sections.css` | ARC-017 | CSS | FR-GEN-008, NFR-A11Y-001 |
| 65 | UNIT-STYLE_INDEX | `src/styles/index.css` | ARC-017 | CSS aggregator | NFR-MAINT-003 |

Non-unit change required by this design (ARC-020, owner: whoever implements UNIT-THEME_CONTEXT): `eslint.config.js` gets an override for `src/context/ThemeContext.jsx` setting `'react-refresh/only-export-components': ['error', { allowConstantExport: true, allowExportNames: ['useThemeContext'] }]` (section 6.7).

### 2.1 Work split suggestion (three associate engineers, minimal coupling)

| Engineer | Units | Depends on (interfaces only) |
|---|---|---|
| A: domain and logic | CONFIG_SITE, MODELS_INDEX, TYPES, CREATE_MODELS, VALIDATE, all DATA_*, SOLAR, RANDOM, STORAGE, GAUGE, CONFIG_SECTIONS | none |
| B: application and primitives | all hooks, THEME_CONTEXT, ICON, SECTION_LABEL, SECTION_TITLE, BUTTON, BADGE, SECTION, RICH_TEXT, ERROR_BOUNDARY, all STYLE_*, MAIN, APP, layout (NAV, FOOTER, DIVIDER, SECTION_SLOT) | A's `lib/*` signatures, `config/site.js` export names, registry `SectionEntry` shape |
| C: presentation | tech (4), effects (3), widgets (2), all 10 sections | A's data export names and typedefs, B's primitive props and hook signatures |

---

## 3. Cross-cutting unit rules

These apply to every unit and are not repeated per unit.

### 3.1 Layering (SADS 4.3.2, lint-enforced in step 13)

| From | May import |
|---|---|
| `models/` | `models/` siblings only. No React. |
| `lib/` | nothing (siblings only). No React. |
| `config/site.js` | nothing |
| `config/sections.js` | `react` (`lazy` only), `models/` (`createSection`, see 8.1 D-06), `sections/` **via dynamic `import()` only** (Hero statically) |
| `data/` | `models/`, `config/site.js` |
| `hooks/` | `react`, `lib/`, `hooks/` |
| `context/` | `react`, `hooks/` |
| `components/ui/` | `react`, `hooks/`, `components/ui/` |
| `components/tech/` | `react`, `components/ui/` |
| `components/effects/` | `react`, `hooks/`, `lib/` |
| `components/widgets/` | `react`, `hooks/`, `lib/` |
| `components/layout/` | `react`, `components/ui/`, `context/`, `hooks/`, `config/site.js`; `SectionSlot.jsx` additionally `components/ErrorBoundary.jsx` (8.1 D-05) |
| `components/ErrorBoundary.jsx` | `react`, `components/ui/` |
| `sections/` | `react`, `data/`, `config/site.js`, `components/{ui,tech,widgets,effects}`, `hooks/`, `context/` |
| `App.jsx` | `react`, `context/`, `components/{layout,effects,ui}`, `components/ErrorBoundary.jsx`, `config/sections.js`, `config/site.js`, `hooks/` (`useHashScroll`, 8.1 D-04) |
| `main.jsx` | `react`, `react-dom/client`, `App.jsx`, `components/ErrorBoundary.jsx`, `styles/index.css`, `config/site.js` (page fallback, 8.1 D-07) |

### 3.2 Lint-driven file rules (ESLint 9, `react-hooks` 7.0.1 recommended, `react-refresh/vite`)

- **R-L1 one-kind exports in `.jsx`:** a `.jsx` file either exports only PascalCase components, or exports no component at all (`customSvgs.jsx` exports only `CUSTOM_SVGS`). Pure helpers go to `.js` files.
- **R-L2 no JSX in `.js`:** Vite only parses JSX in `.jsx`. `.js` units that must produce elements (`iconStrategies.js`) use `createElement` from `react`.
- **R-L3 `react-hooks/set-state-in-effect`:** never call a state setter synchronously in an effect body. Compute initial values with lazy `useState(() => ...)` initialisers; set state only from subscription callbacks (listener, observer, timer).
- **R-L4 `react-hooks/refs` / `purity`:** do not read `ref.current` during render; call impure functions (`new Date()`, `Math.random()`, storage reads) only inside lazy initialisers, effects or event handlers.
- **R-L5 sections:** each `sections/*.jsx` has exactly one `export default function <Name>(props)` and no other export (R-DEFAULT-EXPORT; React.lazy).

### 3.3 Lifecycle and environment rules

- Every listener, timer, observer and rAF created in an effect is released in that effect's cleanup (NFR-PERF-004). Every effect must be StrictMode-safe (mount, cleanup, mount) (NFR-RELI-004).
- Scroll, mousemove and pointer listeners are registered with `{ passive: true }` (NFR-PERF-004).
- Browser globals are feature-detected before use: `typeof window !== "undefined"`, `typeof IntersectionObserver === "function"`, `typeof window.matchMedia === "function"`, `typeof document !== "undefined"`. A missing API degrades as specified per unit and never throws.
- **Only `UNIT-SPEEDOMETER` uses `requestAnimationFrame`** (SRS NFR-PERF-006 QT assumes the speedometer is the only rAF user; see 8.1 D-01).
- No `dangerouslySetInnerHTML`, `eval`, `new Function` anywhere (NFR-SEC-003).
- Every `target="_blank"` anchor has `rel="noopener noreferrer"` (NFR-SEC-001).

### 3.4 Markup parity rule (NFR-MAINT-008)

The rendered DOM of each section must equal the baseline function's DOM: same element types, same class strings **in the same token order** (e.g. `project-card reveal wide d0`, `behance-card reveal d0 wide`), same inline style properties and values, same text nodes. Allowed differences (whitelisted by the DOM-parity normaliser): added `aria-*` attributes, `id="mobile-menu"`, `id="main"`/`tabindex="-1"` on `<main>`, the skip link, the `download` value on the Hero CTA and resume preview link, particle inline values (seeded), speedometer numbers (animation frame).

---

## 4. Domain model

### 4.1 Factory contract (UNIT-CREATE_MODELS, UNIT-VALIDATE)

Every factory `create<Model>(raw)`:

1. **Validate** `raw` is a non-null plain object, else throw `Invalid <Model>: value must be an object`.
2. **Reject unknown keys:** any key not in the model's field list throws `Invalid <Model>: <key> is not a known field` (catches `description` vs `desc` typos).
3. **Validate fields in the declared order** (the order in the tables below; fail fast on the first failure). The order is chosen so that the identifying field comes first (e.g. `createProject({})` -> `Invalid Project: title is required`, FR-GEN-006 acceptance).
4. **Apply defaults** for optional fields (only where stated).
5. **Build** a new object with exactly the declared fields (normalised values, optional fields omitted when absent), in declaration order.
6. **Deep-freeze** it with `deepFreeze` (recursive over plain objects and arrays) and **return** it.

Nested models are created by the outer factory calling the inner factory (e.g. `createSkillCategory` calls `createSkill` for each element). An inner failure propagates unchanged (its message names the inner model, e.g. `Invalid Skill: icon must be an icon reference (si:|ms:|svg:)`).

**Error type:** `ModelValidationError extends Error` with `name = "ModelValidationError"`, `model` (string), `field` (string, dotted path for nested arrays, e.g. `tags[2]`), `reason` (string) and `message = \`Invalid ${model}: ${field} ${reason}\``.

**Reason vocabulary** (exact strings; tests match them):

| Reason string | Raised by |
|---|---|
| `is required` | value is `undefined` or `null` for a required field |
| `must be a string` | `assertString` |
| `must be a non-empty string` | `assertNonEmptyString` (after `trim()`) |
| `must be a boolean` | `assertBoolean` |
| `must be a non-negative number` | `assertNonNegativeNumber` (finite, `>= 0`) |
| `must be an array` | `assertArray` |
| `must be a non-empty array` | `assertArray(..., { minLength: 1 })` |
| `must be a hex colour (#rrggbb)` | `assertHexColor` |
| `must be a CSS colour` | `assertColor` |
| `must be a Material Symbols name` | `assertMsIcon` |
| `must be an icon reference (si:|ms:|svg:)` | `assertIconRef` |
| `must be one of: <a>, <b>, ...` | `assertOneOf` (values joined by `", "`) |
| `must be a safe URL (https:, mailto:, tel:, #anchor or relative path)` | `assertUrl` |
| `must be a valid email address` | `assertEmail` |
| `must be unique (duplicate "<value>")` | `assertUnique` |
| `must be a component` | `assertComponent` |
| `is not a known field` | unknown-key check |
| `must be an object` | `assertPlainObject` |
| `must be a slug (a-z, 0-9, -)` | `createSection` id |
| `must be a percentage string` | `createResumeSkill` w |
| `must match "MON YYYY — MON YYYY"` | `createExperience` period |
| `must be an https URL` | `createDesignCard` href |
| `must be true exactly for https: links` | `createContactLink` external |

### 4.2 Shared types

```js
/** @typedef {string} MsIcon        Material Symbols ligature, /^[a-z0-9_]+$/ */
/** @typedef {string} IconRef       /^(si|ms|svg):[a-z0-9_]+$/ */
/** @typedef {string} HexColor      /^#[0-9a-fA-F]{6}$/ */
/** @typedef {string} CssColor      HexColor | /^rgba?\(.+\)$/ | /^linear-gradient\(.+\)$/ */
/** @typedef {string} SafeUrl       see 4.4 */
/** @typedef {{ text: string, mark?: "strong" | "hl" }} TextSegment */
/** @typedef {ReadonlyArray<TextSegment>} RichText */
```

`RichText` input accepts a string shorthand for an unmarked segment: `["I'm a ", { text: "Senior Software Engineer", mark: "hl" }, " with ..."]` is normalised to `[{ text: "I'm a " }, { text: "Senior Software Engineer", mark: "hl" }, ...]`. Validation: array, length >= 1; each segment string or object with `text` non-empty string and `mark` absent or `"strong"`/`"hl"` (`createRichText`, model name `RichText`, field `[i].text` / `[i].mark`).

### 4.3 Model typedefs and validation

R = required, O = optional. "Order" = validation order.

#### Photo (`createPhoto`, model name `Photo`)

| Order | Field | Type | R/O | Validation |
|---|---|---|---|---|
| 1 | src | string | R | non-empty; `assertUrl` (relative path allowed) |
| 2 | alt | string | R | non-empty |
| 3 | width | number | R | non-negative number |
| 4 | height | number | R | non-negative number |

#### Stat (`createStat`, model name `Stat`)

| Order | Field | Type | R/O | Validation |
|---|---|---|---|---|
| 1 | label | string | R | non-empty |
| 2 | num | string | R | non-empty (display text, not numeric: "4.9+", "C++") |
| 3 | color | HexColor | R | `assertHexColor` (alpha suffixes `66`/`22` are appended at hover) |
| 4 | icon | MsIcon | O | `assertMsIcon` if present. About stats have it; gauge stats omit it. |

#### Profile (`createProfile`, model name `Profile`)

| Order | Field | Type | R/O | Validation / baseline value |
|---|---|---|---|---|
| 1 | name | string | R | non-empty. "S. Jeevanandham" |
| 2 | nameParts | `{before: string, emphasis: string, after: string}` | R | object with exactly these 3 keys, each non-empty string. `{before: "S. ", emphasis: "Jeevanandham", after: "B.ECE"}` (note trailing space in `before`) |
| 3 | displayName | string | R | "S. JEEVANANDHAM" |
| 4 | title | string | R | "Senior HMI Engineer" |
| 5 | titleCaps | string | R | "SENIOR HMI ENGINEER" (profile panel `.prole`) |
| 6 | heroTag | string | R | "Senior HMI Engineer · Chennai, India" |
| 7 | location | string | R | "Chennai, Tamil Nadu, India" |
| 8 | email | string | R | `assertEmail`. "jeevanandhamsivashankaran@gmail.com" |
| 9 | phone | string | R | non-empty. "+91 8111010315" |
| 10 | roles | string[] | R | non-empty array of non-empty strings, unique. 5 roles |
| 11 | bio | RichText | R | `createRichText`; marks only `strong` |
| 12 | badges | string[] | R | non-empty, unique. 8 badges |
| 13 | gaugeLabel | string | R | "⚡ Live HMI Cluster Demo" |
| 14 | gaugeStats | Stat[] | R | non-empty; each via `createStat` |
| 15 | stackTags | string[] | R | non-empty, unique. 5 |
| 16 | profileTags | string[] | R | non-empty, unique. 4 |
| 17 | status | string | R | "OPEN TO OPPORTUNITIES" |
| 18 | photo | Photo | R | `createPhoto` |
| 19 | stats | Stat[] | R | non-empty; each `createStat` **with** `icon` required (field `stats[i].icon is required`) |
| 20 | aboutParagraphs | RichText[] | R | non-empty; each `createRichText`, marks only `hl` |

#### ResumeSkill (`createResumeSkill`, model name `ResumeSkill`)

| Order | Field | Type | R/O | Validation |
|---|---|---|---|---|
| 1 | label | string | R | non-empty |
| 2 | w | string | R | `/^(100|[1-9]?[0-9])%$/` else reason `must be a percentage string` (added reason, used only here) |
| 3 | g | CssColor | R | `assertColor` (gradient) |

#### ResumePreview (`createResumePreview`, model name `ResumePreview`)

| Order | Field | Type | R/O | Value |
|---|---|---|---|---|
| 1 | heading | string | R | "Download My Resume" |
| 2 | intro | string | R | "Full details on experience, projects, skills, certifications, and education — available as a PDF for your review or ATS systems." |
| 3 | fileLabel | string | R | "JEEVANANDHAM_RESUME.PDF" |
| 4 | name | string | R | "S. JEEVANANDHAM" |
| 5 | roleLine | string | R | "SENIOR SOFTWARE ENGINEER – AUTOMOTIVE & MEDICAL HMI \| UI/UX \| QT/QML \| EMBEDDED C++" (en dash U+2013, literal `|`) |
| 6 | contactRows | `{icon: MsIcon, text: string}[]` | R | non-empty; each icon `assertMsIcon`, text non-empty |
| 7 | skillsHeading | string | R | "KEY SKILLS" |
| 8 | bars | ResumeSkill[] | R | non-empty; `createResumeSkill` each |

#### SectionEntry / NavItem (`createSection`, model name `Section`)

| Order | Field | Type | R/O | Validation |
|---|---|---|---|---|
| 1 | id | string | R | non-empty string, then `/^[a-z][a-z0-9-]*$/` else reason `must be a slug (a-z, 0-9, -)` (added reason) |
| 2 | component | function \| object | R | `assertComponent`: `typeof v === "function"` or (non-null object with `$$typeof`) |
| 3 | lazy | boolean | R | boolean |
| 4 | showInNav | boolean | R | boolean |
| 5 | label | string \| null | R if showInNav | nav text, non-empty when present |
| 6 | heading | string \| null | R if showInNav | section-label name ("Engineering Projects") |
| 7 | icon | MsIcon \| null | R if showInNav or heading | nav and section-label icon |
| 8 | title | string \| null | O (default null) | `h2.section-title` text; `null` for hero and resume |
| 9 | number | string \| null | O (default null) | `/^\d{2}$/`; assigned by the registry builder |
| 10 | labelText | string \| null | O (default null) | `"<number> — <heading>"`; assigned by the registry builder |
| 11 | minHeight | number | O (default 0) | non-negative number (placeholder px) |

**Freeze rule (critical):** `createSection` returns `Object.freeze(entry)` (shallow) and **must not deep-freeze** `component`. A `React.lazy` object is a plain object whose `_payload` React mutates while resolving; freezing it makes the lazy load throw `TypeError` in strict mode. All other fields are primitives, so shallow freeze gives full immutability.

`NavItem` is the projection `{ id, label, icon }` of entries with `showInNav === true`; `NAV_ITEMS` holds the full frozen `SectionEntry` objects (Nav reads only those three fields).

#### Experience (`createExperience`, model name `Experience`)

| Order | Field | Type | R/O | Validation |
|---|---|---|---|---|
| 1 | role | string | R | non-empty |
| 2 | company | string | R | non-empty |
| 3 | period | string | R | `/^[A-Z]{3} \d{4} — [A-Z]{3} \d{4}$/` (em dash) else `must match "MON YYYY — MON YYYY"` (added reason) |
| 4 | location | string | R | non-empty |
| 5 | icon | MsIcon | R | `assertMsIcon` |
| 6 | desc | string | R | non-empty |

#### Skill (`createSkill`, model name `Skill`)

| Order | Field | Type | R/O | Validation |
|---|---|---|---|---|
| 1 | name | string | R | non-empty |
| 2 | icon | IconRef | R | `assertIconRef` (`/^(si|ms|svg):[a-z0-9_]+$/`). Existence of `svg:` keys in `CUSTOM_SVGS` is checked by an IT, not here (models cannot import components). |
| 3 | color | HexColor | O | `assertHexColor` if present; omitted -> chip uses the category colour |

#### SkillCategory (`createSkillCategory`, model name `SkillCategory`)

| Order | Field | Type | R/O | Validation |
|---|---|---|---|---|
| 1 | label | string | R | non-empty |
| 2 | headerColor | HexColor | R | `assertHexColor` (suffixes `44`, `55`, `66`, `18` are appended) |
| 3 | headerBg | CssColor | R | `assertColor` |
| 4 | skills | Skill[] | R | non-empty; each `createSkill`; `name` unique within the category (`skills[i].name must be unique (duplicate "X")`) |

#### Highlight (`createHighlight`, model name `Highlight`) - the ISO 26262 strip

| Order | Field | Type | R/O | Value |
|---|---|---|---|---|
| 1 | title | string | R | "ISO 26262 Awareness" |
| 2 | icon | MsIcon | R | "verified_user" |
| 3 | titleIcon | MsIcon | R | "shield" |
| 4 | desc | string | R | see UNIT-DATA_SKILLS |
| 5 | chips | string[] | R | non-empty, unique; 5 chips |

#### Project (`createProject`, model name `Project`)

| Order | Field | Type | R/O | Validation |
|---|---|---|---|---|
| 1 | title | string | R | non-empty |
| 2 | num | string | R | non-empty |
| 3 | period | string | R | non-empty (free text: "R&D / INTERNAL" allowed) |
| 4 | domain | string | R | non-empty |
| 5 | icon | MsIcon | R | |
| 6 | color | HexColor | R | `99` is appended on hover |
| 7 | bg | CssColor | R | |
| 8 | border | CssColor | R | |
| 9 | wide | boolean | O (default `false`) | |
| 10 | desc | string | R | |
| 11 | tags | string[] | R | non-empty, unique |
| 12 | line | CssColor | R | gradient for `.project-card-line` |

#### DesignCard (`createDesignCard`, model name `DesignCard`)

| Order | Field | Type | R/O | Validation |
|---|---|---|---|---|
| 1 | title | string | R | non-empty |
| 2 | tag | string | R | |
| 3 | icon | MsIcon | R | |
| 4 | color | HexColor | R | |
| 5 | desc | string | R | |
| 6 | wide | boolean | O (default `false`) | |
| 7 | artKey | string | R | `assertOneOf(["cluster","medical","infotainment","multiplatform","profile"])` - the closed set exported as `DESIGN_ART_KEYS` from `createModels.js`; `DesignArt` must implement exactly this set (IT) |
| 8 | href | SafeUrl | R | `assertUrl`; additionally must start with `https:` (reason `must be an https URL`, added) |

#### Education (`createEducation`, model name `Education`)

| Order | Field | Type | R/O | Validation |
|---|---|---|---|---|
| 1 | title | string | R | degree or "Key Domain Expertise" |
| 2 | subtitle | string | R | school or description |
| 3 | icon | MsIcon | R | |
| 4 | iconColor | HexColor | R | |
| 5 | tags | string[] | R | non-empty, unique |
| 6 | tagVariant | `"edu"` \| `"domain"` | R | `assertOneOf(["edu","domain"])` |

#### Certification (`createCertification`, model name `Certification`)

| Order | Field | Type | R/O | Validation |
|---|---|---|---|---|
| 1 | name | string | R | non-empty |
| 2 | org | string | R | non-empty |
| 3 | icon | MsIcon | R | |

#### ContactLink (`createContactLink`, model name `ContactLink`)

| Order | Field | Type | R/O | Validation |
|---|---|---|---|---|
| 1 | kind | `"email"`\|`"phone"`\|`"linkedin"`\|`"behance"`\|`"github"` | R | `assertOneOf` |
| 2 | label | string | R | visible text |
| 3 | href | SafeUrl | R | `assertUrl` (NFR-SEC-004: `javascript:alert(1)` throws `Invalid ContactLink: href must be a safe URL (https:, mailto:, tel:, #anchor or relative path)`) |
| 4 | icon | MsIcon | R | |
| 5 | external | boolean | R | invariant `external === href.startsWith("https:")`, else `Invalid ContactLink: external must be true exactly for https: links` (added reason) |
| 6 | group | `"primary"` \| `"social"` | R | `assertOneOf` |

Collection-level invariants are asserted by the data modules with `assertUnique` over the collection (model name = collection model, e.g. `Invalid Project: num must be unique (duplicate "PROJECT_01")`): Project.num, DesignCard.title, Certification.name, SkillCategory.label, ContactLink.kind, Section.id.

### 4.4 SafeUrl rule (`assertUrl`, NFR-SEC-004)

A string `u` is accepted iff it is a non-empty string, contains no whitespace or control characters (`/[\s\u0000-\u001f]/`), and one of:

1. starts with `https://` (case-sensitive),
2. starts with `mailto:` followed by a valid email (`/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/`),
3. starts with `tel:` followed by `/^\+?[0-9]+$/`,
4. starts with `#` followed by `/^[A-Za-z][\w-]*$/` (in-page anchor),
5. is a relative path: does not match `/^[a-zA-Z][a-zA-Z0-9+.-]*:/` (no scheme) and does not start with `//` (protocol-relative is rejected).

Everything else (`http:`, `javascript:`, `data:`, `vbscript:`, `//evil.com`) throws.

Email rule (`assertEmail`): `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.

---

## 5. Algorithms

### 5.1 Solar theme algorithm (UNIT-SOLAR, SRS v1.1 FR-THEME-002, ADR-011)

Constants: `DEFAULT_GEO = Object.freeze({ lat: 13.08, lon: 80.27, tzOffsetHours: 5.5 })`. `LONGITUDE_CORRECTION_H = 5.5 - 80.27 / 15` (= +0.148666..., must equal `0.14867` to 4 decimals). In code the correction is computed from `geo`: `correction = geo.tzOffsetHours - geo.lon / 15`, so `LONGITUDE_CORRECTION_H === 5.5 - 80.27 / 15` for the default.

Steps for `getSunPhase(date, geo = DEFAULT_GEO)`:

1. **IST wall clock (fixed †):** `ist = new Date(date.getTime() + geo.tzOffsetHours * 3_600_000)`. Read fields **only with UTC getters**: `y = ist.getUTCFullYear()`, `mo = ist.getUTCMonth()`, `d = ist.getUTCDate()`, `h = ist.getUTCHours()`, `mi = ist.getUTCMinutes()`. Never call `getTimezoneOffset()` or local getters.
2. **Day of year (fixed †):** `dayOfYear = (Date.UTC(y, mo, d) - Date.UTC(y, 0, 1)) / 86_400_000 + 1` (an exact integer; 1 on 1 January IST; changes at 00:00 IST; 366 on 31 Dec of a leap year).
3. **Declination (unchanged):** `dec = -23.45 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10))` (degrees).
4. **Hour angle (unchanged):** `latRad = geo.lat * Math.PI / 180`, `decRad = dec * Math.PI / 180`, `cosHA = -Math.tan(latRad) * Math.tan(decRad)`, `HA = Math.acos(Math.max(-1, Math.min(1, cosHA))) * (180 / Math.PI)` (degrees).
5. **Sunrise/sunset in local solar hours (unchanged):** `sunriseH = 12 - HA / 15`, `sunsetH = 12 + HA / 15`.
6. **Longitude correction (fixed †, sign corrected):** `correction = geo.tzOffsetHours - geo.lon / 15` (≈ +0.1487 h; Chennai is west of the IST meridian 82.5° E, so local solar noon is about 12:09 IST). Source comment must say so; the baseline comment "≈ +0.18h" and the baseline expression `80.27/15 - 5.5` must not survive.
7. **Decision (unchanged):** `hourIST = h + mi / 60` (seconds ignored, as in the baseline). Return `"day"` if `sunriseH + correction <= hourIST && hourIST < sunsetH + correction`, else `"night"`. Start inclusive, end exclusive.

Reference values (UT oracle, ±1 min): dayOfYear 172 -> day window 05:46 to 18:32 IST (5.7631 h to 18.5343 h); dayOfYear 355 -> 06:32 to 17:46 IST (6.5343 h to 17.7630 h); dayOfYear 1 -> 06:32 to 17:46 IST (6.5266 h to 17.7708 h).

### 5.2 Seeded PRNG and particles (UNIT-RANDOM, FR-FX-003, ADR-007)

`mulberry32(seed)` (canonical, 32-bit, period 2^32):

```js
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

Fixed seed: `export const PARTICLE_SEED = 0x4A5356;` (4870998, "JSV"). Golden values: `mulberry32(0x4A5356)` yields `0.40632403222844005`, `0.6525341584347188`, `0.2885451668407768` as its first three outputs.

`createParticles(count, rng)`: for `i = 0..count-1`, draw from `rng` **in exactly this order** (one call per field, the baseline's order at lines 1711-1718):

| Order | Field | Formula (baseline with `Math.random` -> `rng()`) | Range |
|---|---|---|---|
| - | id | `i` | |
| 1 | x | `rng() * 100` | [0, 100) % |
| 2 | y | `20 + rng() * 70` | [20, 90) % |
| 3 | size | `1.5 + rng() * 2.5` | [1.5, 4) px |
| 4 | dur | `4 + rng() * 5` | [4, 9) s |
| 5 | delay | `rng() * 6` | [0, 6) s |
| 6 | dx | `(rng() - 0.5) * 60 + "px"` (string) | [-30, 30) px |
| 7 | color | `PARTICLE_COLORS[Math.floor(rng() * 5)]` | `["#f59e0b","#22d3ee","#34d399","#a78bfa","#fb7185"]` |
| 8 | opacity | `0.3 + rng() * 0.5` | [0.3, 0.8) |

Golden particle 0 for `createParticles(18, mulberry32(PARTICLE_SEED))`: `{id:0, x:40.632403222844005, y:65.67739109043032, size:2.221362917101942, dur:6.092105710180476, delay:5.652479432523251, dx:"-28.903061030432582px", color:"#a78bfa", opacity:0.6875601053005085}`. Particle 17: `x 7.370317191816866, color "#f59e0b"`.

### 5.3 Speedometer maths (UNIT-GAUGE, FR-HERO-009/010)

All expressions keep the baseline operand order (lines 1747-1777) so floating-point results are bit-identical.

| Item | Formula |
|---|---|
| speed(t) | `Math.sin(t * 0.5) * 45 + 88 + Math.sin(t * 1.4) * 22` (t = 0 -> 88) |
| rpm(t) | `Math.sin(t * 0.7 + 1) * 1200 + 2800 + Math.cos(t * 1.1) * 500` (t = 0 -> 4309.765181769476) |
| t step | `+0.006` per animation frame |
| speed angle | `-215 + (Math.min(speed, 180) / 180) * (35 - -215)` i.e. `minA + (Math.min(speed,180)/180) * (maxA - minA)` |
| rpm angle | `-215 + (Math.min(rpm, 8000) / 8000) * 250` |
| arc path | `rad = d => (d * Math.PI) / 180`; `s = {cx + r cos(rad(from)), cy + r sin(rad(from))}`, `e` likewise for `to`; `lg = (to - from) > 180 ? 1 : 0`; return `` `M ${s.x} ${s.y} A ${r} ${r} 0 ${lg} 1 ${e.x} ${e.y}` `` |
| needle end | `nx = cx + 84 * Math.cos((angle * Math.PI) / 180)`, `ny = cy + 84 * Math.sin((angle * Math.PI) / 180)` |
| ticks | 19 ticks `i = 0..18`: `a = minA + (i / 18) * (maxA - minA)`; `major = i % 3 === 0` (7 majors: 0,3,6,9,12,15,18); `x1 = cx + r cos(a°)`, `y1 = cy + r sin(a°)`, `x2 = cx + (r - (major ? 18 : 10)) cos(a°)`, `y2` likewise |
| constants | `cx = 130, cy = 130, r = 100` (speed arc), `112` (RPM arc), `minA = -215, maxA = 35` |

---

## 6. Unit specifications

Template per unit: **ID / File / ARC**, Purpose, Interface, Behaviour, Errors and edge cases, Dependencies, Traces, Unit test considerations.

### 6.1 Entry and composition

#### UNIT-MAIN

- **File:** `src/main.jsx`  |  **ARC:** ARC-001
- **Purpose:** Bootstrap: import global CSS once, create the React root, wrap `App` in `StrictMode` and the page-level `ErrorBoundary`.
- **Interface:** no exports (program entry referenced by `index.html`).
- **Behaviour:**
  1. `import "./styles/index.css";` (first import after React imports; the only CSS import in the code base).
  2. `const pageFallback = ( ...JSX... );` - a lowercase element constant (not a component: a PascalCase local component in a file with no exports fails `react-refresh`):
     ```jsx
     <div role="alert" className="section-wrap" style={{ textAlign: "center" }}>
       <h1 className="section-title">{OWNER_NAME}</h1>
       <p>Something went wrong while loading this page.</p>
       <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>Reload page</button>{" "}
       <a className="btn btn-green" href={RESUME.href} download={RESUME.downloadName}>Download resume (PDF)</a>
     </div>
     ```
  3. `createRoot(document.getElementById("root")).render(<StrictMode><ErrorBoundary fallback={pageFallback}><App /></ErrorBoundary></StrictMode>)`.
- **Errors:** render errors anywhere not caught by a section boundary show `pageFallback`. Errors at module evaluation (eager data validation) are not catchable here; they are prevented by the CI gate (ADR-010).
- **Dependencies:** `react` (`StrictMode`), `react-dom/client` (`createRoot`), `./App.jsx`, `./components/ErrorBoundary.jsx`, `./styles/index.css`, `./config/site.js` (`OWNER_NAME`, `RESUME`).
- **Traces:** FR-GEN-007, NFR-RELI-004, NFR-MAINT-003. ADR-002, ADR-010.
- **Unit tests:** excluded from coverage (`vitest.config.js`). Covered by IT (App under StrictMode) and QT smoke. Inspection: exactly one CSS import in `src/` (grep).

#### UNIT-APP

- **File:** `src/App.jsx`  |  **ARC:** ARC-002
- **Purpose:** Composition root. Provider, skip link, effects, nav, registry-driven `<main>`, footer. No content, no CSS.
- **Interface:** `export default function App({ sections = SECTIONS })`.

  | Prop | Type | Req | Default | Notes |
  |---|---|---|---|---|
  | sections | `ReadonlyArray<SectionEntry>` | no | `SECTIONS` from `config/sections.js` | Injectable for IT (FR-GEN-002: a test registry with an extra entry renders it and its nav link) |

- **Behaviour (render tree, in this exact DOM order):**
  ```jsx
  <ThemeProvider>
    <a className="skip-link" href="#main">Skip to content</a>
    <GradientOrbs />
    <CursorGlow />
    <Nav items={navItems} />
    <main id="main" tabIndex={-1} ref={mainRef}>
      {sections.map((entry, i) => (
        <Fragment key={entry.id}>
          {i > 0 && <Divider />}
          <SectionSlot entry={entry} />
        </Fragment>
      ))}
    </main>
    <Footer />
  </ThemeProvider>
  ```
  - `navItems = useMemo(() => sections.filter(s => s.showInNav), [sections])`. With the default registry this is `NAV_ITEMS` content-wise (9 items).
  - `mainRef = useRef(null)`; `useHashScroll(mainRef)` (from `hooks/useActiveSection.js`).
  - With the default registry: 10 sections and 9 `.divider` elements inside `main` (FR-GEN-001).
  - The skip link is the first focusable element in the document (NFR-A11Y-008). Activation uses native fragment navigation; `<main tabIndex={-1}>` receives focus.
  - `App` does not call `useReveal` (ADR-012; the global call at baseline line 2433 is removed).
- **Errors:** none of its own; per-section errors are contained by `SectionSlot`.
- **Dependencies:** `react` (`Fragment`, `useMemo`, `useRef`), `context/ThemeContext.jsx`, `components/effects/{GradientOrbs,CursorGlow}.jsx`, `components/layout/{Nav,Footer,Divider,SectionSlot}.jsx`, `config/sections.js`, `hooks/useActiveSection.js` (`useHashScroll`).
- **Traces:** FR-GEN-001, FR-GEN-002, FR-GEN-005, FR-GEN-007, FR-NAV-004, NFR-A11Y-003, NFR-A11Y-008, NFR-MAINT-001. ADR-003, ADR-004, ADR-005, ADR-012, ADR-020.
- **Unit tests (UT-APP):** (1) renders `[data-section]` ids in registry order and `n-1` dividers for a 3-entry fixture registry of eager stub components; (2) `main` has `id="main"` and `tabindex="-1"`; (3) first focusable element is `a.skip-link[href="#main"]` with text "Skip to content"; (4) nav receives only `showInNav` entries (stub registry with a hidden entry); (5) contains no `<style>` element. Full-registry behaviour is IT.

### 6.2 Configuration

#### UNIT-CONFIG_SITE

- **File:** `src/config/site.js`  |  **ARC:** ARC-003
- **Purpose:** Single source of site-wide constants (SADS P-12).
- **Interface (named exports, all frozen; objects with `Object.freeze`, strings/numbers are primitives):**

  | Export | Type | Value |
  |---|---|---|
  | `OWNER_NAME` | string | `"S. Jeevanandham"` |
  | `OWNER_TITLE` | string | `"Senior HMI Engineer"` |
  | `BRAND_TEXT` | string | `"JEEVANANDHAM"` (nav logo) |
  | `LOCATION` | string | `"Chennai, Tamil Nadu, India"` |
  | `EMAIL` | string | `"jeevanandhamsivashankaran@gmail.com"` |
  | `PHONE` | string | `"+91 8111010315"` |
  | `PHONE_HREF` | string | `"tel:+918111010315"` |
  | `URLS` | `{linkedin, behance, github, canonical}` | `"https://linkedin.com/in/jeevanandhamsivashankaran/"`, `"https://behance.net/s_jeevanandham"`, `"https://github.com/jeevanandhamsivasankar"`, `"https://jeevanandhamsivasankar.github.io/"` |
  | `RESUME` | `{href, downloadName, pages}` | `"Jeevanandham_Resume.pdf"`, `"Jeevanandham_SeniorHMIEngineer_Resume.pdf"`, `3` |
  | `THEME_STORAGE_KEY` | string | `"jsv-theme-override"` |
  | `FOOTER_TEXT` | string | `"© 2026 S. JEEVANANDHAM — SENIOR HMI ENGINEER — BUILT WITH PRECISION"` |
  | `THEME_GEO` | `{lat, lon, tzOffsetHours}` | `13.08`, `80.27`, `5.5` |

- **Behaviour:** none (constants). `RESUME.href` is relative (no leading `/`), as in the baseline (`href="Jeevanandham_Resume.pdf"`).
- **Errors:** none.
- **Dependencies:** none (leaf).
- **Traces:** FR-HERO-007, FR-RES-002/003/004, FR-CONT-002/003, FR-GEN-004, FR-THEME-008, FR-NAV-002. ADR-018.
- **Unit tests (UT-CONFIG_SITE):** (1) every exported object is `Object.isFrozen`; (2) `RESUME.downloadName === "Jeevanandham_SeniorHMIEngineer_Resume.pdf"`; (3) `THEME_STORAGE_KEY === "jsv-theme-override"`; (4) `THEME_GEO` deep-equals `DEFAULT_GEO` from `lib/solar.js` (single-value guarantee across the two layers); (5) `PHONE_HREF` equals `"tel:" + PHONE` with spaces removed.

#### UNIT-CONFIG_SECTIONS

- **File:** `src/config/sections.js`  |  **ARC:** ARC-004
- **Purpose:** Section Registry: order, nav membership, nav labels, icons, section-label headings, h2 titles, loading strategy.
- **Interface:**
  ```js
  /** @param {ReadonlyArray<RawSectionEntry>} raw  @returns {ReadonlyArray<SectionEntry>} */
  export function defineSections(raw)
  /** @type {ReadonlyArray<SectionEntry>} */ export const SECTIONS
  /** @type {ReadonlyArray<SectionEntry>} */ export const NAV_ITEMS   // SECTIONS.filter(s => s.showInNav)
  ```
  `RawSectionEntry` = `SectionEntry` without `number` and `labelText`.
- **Behaviour:**
  - `defineSections(raw)`: iterate in order; keep counter `n = 0`; for each entry with `heading !== null && heading !== undefined`, `n += 1`, `number = String(n).padStart(2, "0")`, `labelText = \`${number} — ${heading}\`` (em dash U+2014 with single spaces); else both `null`. Call `createSection({...entry, number, labelText})`. Then `assertUnique` on ids (`Invalid Section: id must be unique (duplicate "x")`). Return `Object.freeze(array)`.
  - Components: `Hero` imported **statically** (`import Hero from "../sections/Hero.jsx"`); the 9 others via `lazy(() => import("../sections/<Name>.jsx"))`, declared at module scope (one lazy object per section, created once).
  - `SECTIONS` (exact content):

    | # | id | lazy | showInNav | label | heading | icon | title | minHeight |
    |---|---|---|---|---|---|---|---|---|
    | 0 | hero | false | false | null | null | null | null | 0 |
    | 1 | about | true | true | About | About | person | Who I Am | 900 |
    | 2 | experience | true | true | Experience | Experience | work | Career | 1400 |
    | 3 | skills | true | true | Skills | Skills | build | Toolbox | 1700 |
    | 4 | projects | true | true | Projects | Engineering Projects | rocket_launch | Selected Work | 1500 |
    | 5 | design | true | true | Design | Design Portfolio | brush | Creative Work | 1100 |
    | 6 | education | true | true | Education | Education | school | Academic Background | 600 |
    | 7 | certifications | true | true | Certs | Certifications | verified | Credentials | 500 |
    | 8 | resume | true | true | Resume | Resume | description | null | 750 |
    | 9 | contact | true | true | Contact | Contact | mail | Let's Work Together | 500 |

    Derived `labelText`: "01 — About", "02 — Experience", "03 — Skills", "04 — Engineering Projects", "05 — Design Portfolio", "06 — Education", "07 — Certifications", "08 — Resume", "09 — Contact" (FR-GEN-003). `minHeight` values are desktop approximations used only while a chunk loads (CLS mitigation, SADS R-5); they are tunable and not parity-relevant.
- **Errors:** invalid entries throw `ModelValidationError` at module load (dev/CI only).
- **Dependencies:** `react` (`lazy`), `models/createModels.js` (`createSection`), `models/validate.js` (`assertUnique`), `sections/Hero.jsx` (static), `sections/*` (dynamic).
- **Traces:** FR-NAV-003, FR-NAV-004, FR-GEN-001, FR-GEN-002, FR-GEN-003, FR-GEN-005, NFR-PERF-001/002. ADR-004, ADR-005.
- **Unit tests (UT-CONFIG_SECTIONS):** (1) ids in the order above; (2) `NAV_ITEMS` labels/icons/ids equal FR-NAV-003; (3) `labelText` values as listed; (4) hero is the only non-lazy entry and has `showInNav false`; (5) `defineSections` with duplicate ids throws `Invalid Section: id must be unique (duplicate "x")`; (6) entries are frozen but `SECTIONS[1].component` is **not** frozen (`Object.isFrozen(component) === false`); (7) a fixture `defineSections([{...hero}, {id:"extra", ...}])` numbers the first headed entry "01".

### 6.3 Models

#### UNIT-MODELS_INDEX

- **File:** `src/models/index.js`  |  **ARC:** ARC-005
- **Purpose:** Barrel. `export * from "./createModels.js"; export * from "./validate.js";` (types.js has no runtime exports).
- **Traces:** NFR-MAINT-006. **Unit tests:** UT-MODELS_INDEX-001: every factory name of section 4 and `ModelValidationError`, `deepFreeze` are exported functions.

#### UNIT-TYPES

- **File:** `src/models/types.js`  |  **ARC:** ARC-005
- **Purpose:** JSDoc `@typedef` for every model of section 4 (`MsIcon`, `IconRef`, `HexColor`, `CssColor`, `SafeUrl`, `TextSegment`, `RichText`, `Photo`, `Stat`, `Profile`, `ResumeSkill`, `ResumePreview`, `SectionEntry`, `NavItem`, `Experience`, `Skill`, `SkillCategory`, `Highlight`, `Project`, `DesignCard`, `Education`, `Certification`, `ContactLink`, `Particle`, `GaugeFrame`, `GeoLocation`). Each typedef lists fields with types and `[optional]` markers exactly as in section 4.
- **Interface:** `export {};` (module with only comments, so it can be imported for types: `/** @typedef {import("../models/types.js").Project} Project */`).
- **Traces:** NFR-MAINT-006. ADR-001. **Unit tests:** none (inspection).

#### UNIT-VALIDATE

- **File:** `src/models/validate.js`  |  **ARC:** ARC-005
- **Purpose:** Assertion helpers, the error type, and `deepFreeze`.
- **Interface:**
  ```js
  export class ModelValidationError extends Error { constructor(model, field, reason) }  // .name, .model, .field, .reason
  export function fail(model, field, reason): never
  export function assertPlainObject(value, model, field = "value")
  export function assertRequired(value, model, field)
  export function assertString(value, model, field)
  export function assertNonEmptyString(value, model, field)
  export function assertBoolean(value, model, field)
  export function assertNonNegativeNumber(value, model, field)
  export function assertArray(value, model, field, { minLength = 0 } = {})
  export function assertHexColor(value, model, field)
  export function assertColor(value, model, field)
  export function assertMsIcon(value, model, field)
  export function assertIconRef(value, model, field)
  export function assertOneOf(value, allowed, model, field)
  export function assertUrl(value, model, field)
  export function assertEmail(value, model, field)
  export function assertUnique(values, model, field)   // values: string[]
  export function assertComponent(value, model, field)
  export function assertKnownKeys(raw, allowedKeys, model)
  export function deepFreeze(value)                      // returns value
  ```
  All `assert*` return `undefined` on success and throw `ModelValidationError` otherwise. Every `assert*` except `assertRequired` first applies `assertRequired` (so `undefined`/`null` gives `is required`).
- **Behaviour:** reason strings and regexes per section 4.1, 4.2 and 4.4. `assertColor` accepts `HexColor`, `/^rgba?\(\s*[\d.\s,%]+\)$/`, `/^linear-gradient\(.+\)$/`. `assertUnique` reports the first duplicate. `deepFreeze`: if value is an array or a plain object (`Object.getPrototypeOf(v) === Object.prototype || === null`), freeze it and recurse into own enumerable values; functions and other objects are left untouched; returns the value.
- **Errors:** only `ModelValidationError` is thrown.
- **Dependencies:** none.
- **Traces:** FR-GEN-006, NFR-SEC-004. ADR-009, ADR-010.
- **Unit tests (UT-VALIDATE):** one positive and one negative case per assert with exact message; `assertUrl` table: accept `https://x.y`, `mailto:a@b.co`, `tel:+918111010315`, `#projects`, `Jeevanandham_Resume.pdf`, `profile.webp`; reject `javascript:alert(1)`, `http://x.y`, `data:text/html,x`, `//evil.com`, `" https://x"`, `""`; `assertIconRef` accepts `si:qt`, `svg:i2c`, `ms:fact_check`, rejects `foo:bar`, `si:`, `SI:qt`; `deepFreeze` freezes nested arrays/objects and leaves a function unfrozen; `ModelValidationError` instance properties.

#### UNIT-CREATE_MODELS

- **File:** `src/models/createModels.js`  |  **ARC:** ARC-005
- **Purpose:** Factory functions (Factory pattern) per section 4.3.
- **Interface:**
  ```js
  export const DESIGN_ART_KEYS        // Object.freeze(["cluster","medical","infotainment","multiplatform","profile"])
  export function createRichText(raw): RichText
  export function createPhoto(raw): Photo
  export function createStat(raw, { requireIcon = false } = {}): Stat
  export function createProfile(raw): Profile
  export function createResumeSkill(raw): ResumeSkill
  export function createResumePreview(raw): ResumePreview
  export function createSection(raw): SectionEntry          // shallow freeze only
  export function createExperience(raw): Experience
  export function createSkill(raw): Skill
  export function createSkillCategory(raw): SkillCategory
  export function createHighlight(raw): Highlight
  export function createProject(raw): Project
  export function createDesignCard(raw): DesignCard
  export function createEducation(raw): Education
  export function createCertification(raw): Certification
  export function createContactLink(raw): ContactLink
  ```
- **Behaviour:** the factory contract of 4.1 with the field tables of 4.3. Defaults: `Project.wide = false`, `DesignCard.wide = false`, `SectionEntry.title/number/labelText = null`, `SectionEntry.minHeight = 0`; for `createSection`, `label`, `heading`, `icon` default to `null` when `showInNav` is false and no heading is given. `Skill.color` and `Stat.icon` are omitted from the output object when absent (not set to `undefined`). Each JSDoc block states the model name and the thrown message format.
- **Errors:** `ModelValidationError` (section 4.1).
- **Dependencies:** `./validate.js` only. **No React, no `config/`.**
- **Traces:** FR-GEN-006, NFR-SEC-004, NFR-MAINT-006. ADR-009, ADR-010.
- **Unit tests (UT-CREATE_MODELS):** per factory: (a) happy path with a baseline instance equals expected output and `Object.isFrozen` at every nesting level; (b) each required field missing -> `Invalid <Model>: <field> is required`; (c) unknown key -> `is not a known field`; (d) type errors. Mandatory named cases: `createProject({})` -> message contains `title` (`Invalid Project: title is required`); `createContactLink({kind:"email", label:"x", href:"javascript:alert(1)", icon:"mail", external:false, group:"primary"})` throws the safe-URL message; `createSkillCategory` with duplicate skill names; `createSkill({name:"X", icon:"foo:bar"})`; `createSection` with a mock lazy object `{ $$typeof: Symbol.for("react.lazy"), _payload: {} }` keeps `_payload` mutable; `createRichText(["a", {text:"b", mark:"hl"}])` normalisation; `createExperience` period with a hyphen instead of an em dash fails; `createDesignCard` with `artKey: "unknown"` and with `href: "http://..."` fail.

### 6.4 Data (content). All texts are byte-identical to the baseline.

Every data module: imports factories from `../models/index.js` and constants from `../config/site.js`; builds instances at module evaluation; asserts collection uniqueness; exports frozen values only (no functions). **Dependencies:** `models/`, `config/site.js`. **Unit tests (common):** module loads without throwing; counts; spot-check texts against the SRS acceptance values; everything frozen.

#### UNIT-DATA_PROFILE

- **File:** `src/data/profile.js`  |  **ARC:** ARC-006
- **Interface:**
  | Export | Type | Notes |
  |---|---|---|
  | `PROFILE` | Profile | single source |
  | `HERO_ROLES` | string[] | `=== PROFILE.roles` (same frozen reference; stable `useTypewriter` dependency) |
  | `HERO_BADGES` | string[] | `PROFILE.badges` |
  | `GAUGE_STATS` | Stat[] | `PROFILE.gaugeStats` |
  | `GAUGE_STACK_TAGS` | string[] | `PROFILE.stackTags` |
  | `PROFILE_TAGS` | string[] | `PROFILE.profileTags` |
  | `STATS` | Stat[] | `PROFILE.stats` |
  | `ABOUT_PARAGRAPHS` | RichText[] | `PROFILE.aboutParagraphs` |
  | `RESUME_PREVIEW` | ResumePreview | |
- **Content (verbatim):**
  - `name: OWNER_NAME`, `title: OWNER_TITLE`, `location: LOCATION`, `email: EMAIL`, `phone: PHONE`; `nameParts`, `displayName`, `titleCaps`, `heroTag`, `status`, `gaugeLabel` per 4.3.
  - `roles`: "Qt / QML Developer", "Embedded HMI Engineer", "UX / UI Engineer", "Instrument Cluster Dev", "Medical Device HMI Eng".
  - `bio`: `["Senior Software Engineer with ", {text:"4.9+ years", mark:"strong"}, " in Automotive HMI, Infotainment Systems, Instrument Clusters, and Medical Device HMI. Specialising in ", {text:"Qt/QML, Embedded C++, and real-time UI engineering", mark:"strong"}, " across production-grade OEM programs."]`
  - `badges`: "Qt / QML", "Embedded C++", "LVGL", "CAN Bus", "A-SPICE", "Linux HMI", "SQLite3", "FreeRTOS".
  - `gaugeStats`: `{num:"4.9+", label:"Yrs Exp", color:"#f59e0b"}`, `{num:"8+", label:"Projects", color:"#22d3ee"}`, `{num:"2", label:"Domains", color:"#34d399"}`.
  - `stackTags`: "Qt/QML", "LVGL", "C++", "CAN", "UART". `profileTags`: "Automotive HMI", "Medical HMI", "Qt/QML", "UX Design".
  - `photo`: `{src:"profile.webp", alt:"S. Jeevanandham", width:600, height:900}`.
  - `stats` (baseline lines 1086-1091): `{icon:"schedule", num:"4.9+", label:"Years Experience", color:"#f59e0b"}`, `{icon:"rocket_launch", num:"8+", label:"Projects Shipped", color:"#22d3ee"}`, `{icon:"devices", num:"2", label:"Domains — Auto & Med", color:"#34d399"}`, `{icon:"code", num:"C++", label:"Primary Language", color:"#a78bfa"}`.
  - `aboutParagraphs` (baseline lines 1990-1993), segments with `mark:"hl"` on: p1 "Senior Software Engineer", "automotive and medical device industries"; p2 "Qt/QML and Embedded C++"; p3 "engineering rigour and UX design sensibility"; p4 "A-SPICE aligned development". Unmarked text between them copied verbatim, e.g. p1 = `["I'm a ", hl("Senior Software Engineer"), " with deep expertise in Human Machine Interface development for the ", hl("automotive and medical device industries"), ". Over 4.9 years, I've shipped production-grade HMIs for instrument clusters, infotainment systems, and medical therapy devices."]`.
  - `RESUME_PREVIEW`: values of 4.3 ResumePreview; `contactRows`: `[{icon:"location_on", text:LOCATION}, {icon:"mail", text:EMAIL}, {icon:"phone", text:PHONE}]`; `bars`: `{label:"Qt / QML", w:"92%", g:"linear-gradient(90deg,#f59e0b,#22d3ee)"}`, `{label:"Embedded C++", w:"88%", g:"linear-gradient(90deg,#34d399,#22d3ee)"}`, `{label:"LVGL / HMI", w:"85%", g:"linear-gradient(90deg,#a78bfa,#fb7185)"}`, `{label:"UX / Figma", w:"78%", g:"linear-gradient(90deg,#fb7185,#f59e0b)"}`.
- **Traces:** FR-HERO-002, 003, 005, 006, 008, 011; FR-ABOUT-002, 003; FR-RES-001, 003; NFR-A11Y-004.
- **Unit tests:** 5 roles in order; 8 badges; 4 stats with colours; 3 gauge stats; 4 about paragraphs with 5 `hl` segments in order; 4 bars with widths 92/88/85/78; `HERO_ROLES === PROFILE.roles`.

#### UNIT-DATA_EXPERIENCE

- **File:** `src/data/experience.js`  |  **ARC:** ARC-006
- **Interface:** `export const EXPERIENCE: ReadonlyArray<Experience>` (4, newest first).
- **Content:** baseline lines 1093-1118 verbatim (fields `icon, role, company, period, location, desc`): medical_services / Senior Software Engineer / PixelExpert Technology & Services Pvt. Ltd. / "SEP 2024 — JAN 2026"; directions_car / Embedded Software Engineer / "APR 2022 — AUG 2024"; school / Graduate Engineer Trainee / "SEP 2021 — MAR 2022" (desc contains "I²C"); palette / Graphics Designer Trainee / Lapiz Digital Services Pvt. Ltd. / "MAY 2019 — SEP 2019". All locations "Chennai, Tamil Nadu".
- **Traces:** FR-EXP-002. **Unit tests:** count 4; item 1 and item 4 texts per FR-EXP-002; all periods match the period regex.

#### UNIT-DATA_SKILLS

- **File:** `src/data/skills.js`  |  **ARC:** ARC-006
- **Interface:** `export const SKILL_CATEGORIES: ReadonlyArray<SkillCategory>` (9), `export const SAFETY_HIGHLIGHT: Highlight`.
- **Content:** baseline lines 1491-1613 verbatim (labels, `headerColor`, `headerBg`, each skill `name`, `icon`, `color`). Counts: Primary Language 9, HMI Frameworks 10, Embedded & OS 7, Communication Interfaces 5, Tools & DevOps 10, Testing & Debugging 5, Database 1, Design & UX 8, Methodologies 3 = 58. Note the two categories with the same header colour `#fb7185` but different `headerBg` (`0.12` vs `0.10`).
  `SAFETY_HIGHLIGHT = createHighlight({ title: "ISO 26262 Awareness", icon: "verified_user", titleIcon: "shield", desc: "Safety-oriented HMI behavior with focus on system reliability, deterministic performance, and user-safety considerations. Practical application across automotive HMI projects — safety-aware UI interaction design, structured validation flows, and Functional Safety methodology awareness.", chips: ["Safety-Aware UI","Deterministic Performance","Structured Validation","FMEA Awareness","Fail-Safe Patterns"] })`. (The baseline JSX line break between the two sentences collapses to exactly one space.)
- **Traces:** FR-SKILL-002, FR-SKILL-003, FR-SKILL-005. **Unit tests:** 9 categories in order with the counts above; total 58; unique labels; every skill icon passes `assertIconRef`; `SAFETY_HIGHLIGHT.chips.length === 5`.

#### UNIT-DATA_PROJECTS

- **File:** `src/data/projects.js`  |  **ARC:** ARC-006
- **Interface:** `export const PROJECTS: ReadonlyArray<Project>` (6).
- **Content:** baseline lines 1615-1664 verbatim (`period, num, domain, icon, color, bg, border, wide, title, desc, tags, line`). `wide: true` only for PROJECT_03 and R&D. Tag counts: 5, 5, 8, 5, 5, 6.
- **Traces:** FR-PROJ-002. **Unit tests:** 6 items; 2 wide; card 1 title "Physiotherapy Laser Therapy HMI" with 5 tags; card 3 has 8 tags; `num` unique.

#### UNIT-DATA_DESIGN

- **File:** `src/data/design.js`  |  **ARC:** ARC-006
- **Interface:** `export const DESIGN_CARDS: ReadonlyArray<DesignCard>` (5).
- **Content:** baseline lines 2146-2257 with `art` replaced by `artKey` and `href: URLS.behance`:
  | # | tag | icon | color | title | wide | artKey |
  |---|---|---|---|---|---|---|
  | 1 | AUTOMOTIVE | directions_car | #f59e0b | Automotive Instrument Clusters | false | cluster |
  | 2 | MEDICAL HMI | medical_services | #34d399 | Medical Device HMI Design | false | medical |
  | 3 | INFOTAINMENT · OEM | radio | #22d3ee | Infotainment UI Modules | true | infotainment |
  | 4 | MULTI-PLATFORM | devices | #a78bfa | Multi-Platform UI/UX Designs | false | multiplatform |
  | 5 | DESIGNER PROFILE | person | #fb7185 | Jeevanandham S — Full Design Portfolio | false | profile |
  `desc` values verbatim from the baseline.
- **Traces:** FR-DESIGN-002, FR-DESIGN-003. **Unit tests:** 5 cards; exactly 1 wide; all `href === "https://behance.net/s_jeevanandham"`; artKeys are the 5 distinct `DESIGN_ART_KEYS`.

#### UNIT-DATA_EDUCATION

- **File:** `src/data/education.js`  |  **ARC:** ARC-006
- **Interface:** `export const EDUCATION: ReadonlyArray<Education>` (2).
- **Content:** (1) `{title:"B.E. — Electronics & Communication Engineering", subtitle:"Adhiparasakthi College of Engineering (Anna University), Tamil Nadu", icon:"school", iconColor:"#22d3ee", tags:["2015 – 2020","CGPA: 6.34 / 10","ECE"], tagVariant:"edu"}` (en dash in the year range); (2) `{title:"Key Domain Expertise", subtitle:"4.9+ years of production-grade specialisation in HMI engineering across Automotive and Medical device industries", icon:"military_tech", iconColor:"#f59e0b", tags:["Automotive HMI","Medical Device HMI","Instrument Clusters","Infotainment","ADAS / 3D Viz"], tagVariant:"domain"}`.
- **Traces:** FR-EDU-002, 003, 004. **Unit tests:** 2 items, texts per FR-EDU-002/003, variants.

#### UNIT-DATA_CERTIFICATIONS

- **File:** `src/data/certifications.js`  |  **ARC:** ARC-006
- **Interface:** `export const CERTIFICATIONS: ReadonlyArray<Certification>` (3).
- **Content:** baseline lines 1666-1670: `{icon:"school", name:"Qt 6 Core — Beginner, Intermediate & Advanced", org:"UDEMY"}`, `{icon:"school", name:"QML for Beginners", org:"UDEMY"}`, `{icon:"verified_user", name:"Google UX Design Professional Certificate", org:"COURSERA — CREDLY VERIFIED"}`.
- **Traces:** FR-CERT-002. **Unit tests:** 3 items, unique names.

#### UNIT-DATA_CONTACT

- **File:** `src/data/contact.js`  |  **ARC:** ARC-006
- **Interface:** `export const CONTACT_LINKS: ReadonlyArray<ContactLink>` (5), `export const CONTACT_INTRO: string`, `export const CONTACT_LOCATION: string`.
- **Content:**
  | kind | label | href | icon | external | group |
  |---|---|---|---|---|---|
  | email | `EMAIL` | `"mailto:" + EMAIL` | mail | false | primary |
  | phone | `PHONE` ("+91 8111010315") | `PHONE_HREF` | phone | false | primary |
  | linkedin | "LinkedIn" | `URLS.linkedin` | open_in_new | true | social |
  | behance | "Behance Portfolio" | `URLS.behance` | brush | true | social |
  | github | "GitHub" | `URLS.github` | terminal | true | social |
  `CONTACT_INTRO = "Open to senior HMI engineering roles, embedded UI consulting, and collaborative automotive or medical device projects. Based in Chennai, India."`; `CONTACT_LOCATION = LOCATION`.
- **Traces:** FR-CONT-001..004, NFR-SEC-001, NFR-SEC-004. **Unit tests:** 5 links in the order above; hrefs exact; `external` true for exactly the 3 social links; groups 2/3.

### 6.5 Lib (pure / adapter)

#### UNIT-SOLAR

- **File:** `src/lib/solar.js`  |  **ARC:** ARC-007
- **Purpose:** Pure Chennai sunrise/sunset theme decision (section 5.1).
- **Interface:**
  ```js
  /** @typedef {{lat:number, lon:number, tzOffsetHours:number}} GeoLocation */
  export const DEFAULT_GEO                       // Object.freeze({ lat: 13.08, lon: 80.27, tzOffsetHours: 5.5 })
  export const LONGITUDE_CORRECTION_H            // 5.5 - 80.27 / 15
  /** @returns {{ year:number, month:number, day:number, hours:number, minutes:number }} IST wall clock (month 0-based) */
  export function toIst(date, tzOffsetHours = DEFAULT_GEO.tzOffsetHours)
  /** @returns {number} 1..366 IST calendar day */
  export function dayOfYear(date, tzOffsetHours = DEFAULT_GEO.tzOffsetHours)
  /** @returns {{ sunrise:number, sunset:number }} local solar hours, no correction (step 5) */
  export function sunriseSunsetHours(dayOfYear, latDeg = DEFAULT_GEO.lat)
  /** @returns {{ start:number, end:number }} IST hours incl. correction (steps 3-6) */
  export function dayWindow(dayOfYear, geo = DEFAULT_GEO)
  /** @param {Date|number} date  @returns {"day"|"night"} */
  export function getSunPhase(date, geo = DEFAULT_GEO)
  ```
- **Behaviour:** section 5.1 exactly. `getSunPhase` accepts a `Date` or epoch milliseconds (`new Date(+date)` normalisation).
- **Errors:** an invalid date (`NaN` time) returns `"night"` (fail-safe default theme = `:root` tokens) and does not throw.
- **Dependencies:** none. No React, no DOM.
- **Traces:** FR-THEME-002, NFR-PORT-003, A-3. ADR-011.
- **Unit tests (UT-SOLAR):** (1) `LONGITUDE_CORRECTION_H.toFixed(4) === "0.1487"` and `> 0`; (2) `dayWindow(172)` ≈ 05:46 / 18:32 (±1 min), `dayWindow(355)` ≈ 06:32 / 17:46; (3) 12:00 IST -> day, 23:00 IST -> night; (4) start boundary inclusive / end exclusive at minute resolution (use the computed window, floor/ceil to minutes); (5) `dayOfYear` same for 11:59 and 12:01 IST on one date, differs by 1 between 23:59 IST and 00:01 IST next day; (6) 1 Jan 00:00 IST -> 1, 31 Dec 2028 23:59 IST -> 366; (7) instants given as `Date.UTC(...)` give identical results when run with `TZ=America/New_York` and `TZ=Asia/Kolkata` (vitest: `process.env.TZ` set in a dedicated test file, or assert that no local getter/`getTimezoneOffset` is called by spying on `Date.prototype.getHours`/`getTimezoneOffset`); (8) instants within 1 h of the US DST change (2026-03-08 07:00Z, 2026-11-01 06:00Z) give the IST-correct result; (9) `cosHA` clamping path (lat 89) returns without NaN; (10) invalid date -> "night".

#### UNIT-RANDOM

- **File:** `src/lib/random.js`  |  **ARC:** ARC-007
- **Interface:**
  ```js
  export const PARTICLE_SEED      // 0x4A5356
  export const PARTICLE_COLORS    // Object.freeze(["#f59e0b","#22d3ee","#34d399","#a78bfa","#fb7185"])
  export function mulberry32(seed: number): () => number          // [0, 1)
  /** @typedef {{id:number,x:number,y:number,size:number,dur:number,delay:number,dx:string,color:string,opacity:number}} Particle */
  export function createParticles(count: number, rng: () => number): ReadonlyArray<Particle>   // deep-frozen
  ```
- **Behaviour:** section 5.2. `createParticles` returns a frozen array of frozen particles.
- **Errors:** `count` not a non-negative integer -> `RangeError("createParticles: count must be a non-negative integer")`; `rng` not a function -> `TypeError("createParticles: rng must be a function")`.
- **Dependencies:** none.
- **Traces:** FR-FX-003. ADR-007.
- **Unit tests (UT-RANDOM):** golden first 3 outputs; same seed -> same sequence; different seed -> different first value; 10,000 draws all in [0,1); `createParticles(18, mulberry32(PARTICLE_SEED))` deep-equals itself on a second call and matches golden particle 0/17; every field within the ranges of 5.2; `dx` ends with "px"; colour ∈ palette; errors for `count = -1`, `1.5`, and `rng = null`.

#### UNIT-STORAGE

- **File:** `src/lib/storage.js`  |  **ARC:** ARC-007 (new in SADS v1.1)
- **Purpose:** Guarded accessor for the persisted manual theme override (the only `localStorage` use in the app).
- **Interface:**
  ```js
  /** @param {Storage} [storage]  @returns {"day"|"night"|null} */
  export function readThemeOverride(storage)
  /** @param {"day"|"night"} theme  @param {Storage} [storage]  @returns {boolean} true if written */
  export function writeThemeOverride(theme, storage)
  ```
- **Behaviour:**
  - Key: `THEME_STORAGE_KEY` imported from `config/site.js` (`"jsv-theme-override"`); no other key is ever read or written.
  - Both functions resolve the storage **inside** `try`: `const s = storage === undefined ? globalThis.localStorage : storage;` (the `localStorage` getter itself can throw `SecurityError`; a default parameter would evaluate outside the try).
  - `readThemeOverride`: `v = s.getItem(KEY)`; return `v` if `v === "day" || v === "night"`, else `null`. Any exception or missing storage (`s` null/undefined) -> `null`.
  - `writeThemeOverride`: if `theme` is not `"day"`/`"night"` return `false` without touching storage; else `s.setItem(KEY, theme)` and return `true`; any exception (quota, disabled) -> `false`.
  - Never throws, never logs (no console output: FR-THEME-008 "no console error").
- **Dependencies:** `config/site.js` (`THEME_STORAGE_KEY`) - see 8.1 D-08.
- **Traces:** FR-THEME-008, NFR-SEC-003 (no other data stored), EI-10. ADR-018.
- **Unit tests (UT-STORAGE):** stub storage object: read "day"/"night" -> value; "foo", "", `null` -> null; `getItem` throws -> null; `storage` = `null` -> null; `globalThis.localStorage` getter throwing (redefine with `Object.defineProperty` in test) -> null and `false`; write valid -> `setItem` called with (`"jsv-theme-override"`, theme) and returns true; write invalid theme -> false and `setItem` not called; `setItem` throws -> false; no `console.error` calls in any case.

#### UNIT-GAUGE

- **File:** `src/lib/gauge.js`  |  **ARC:** ARC-007 (added unit, see 1.3)
- **Interface:**
  ```js
  export const GAUGE   // Object.freeze({ cx:130, cy:130, r:100, rpmR:112, minA:-215, maxA:35, maxSpeed:180, maxRpm:8000, needleLen:84, tickCount:19, dt:0.006 })
  /** @typedef {{ speed:number, rpm:number }} GaugeFrame */
  export function speedAt(t: number): number
  export function rpmAt(t: number): number
  export function gaugeFrame(t: number): GaugeFrame                // { speed: speedAt(t), rpm: rpmAt(t) }
  export function speedAngle(speed: number): number
  export function rpmAngle(rpm: number): number
  export function arcPath(cx, cy, r, from, to): string
  export function needlePoint(angleDeg: number): { x:number, y:number }
  export function gaugeTicks(): ReadonlyArray<{x1,y1,x2,y2,major:boolean}>   // frozen, 19 entries
  ```
- **Behaviour:** section 5.3 formulas exactly.
- **Errors:** none (pure arithmetic).
- **Dependencies:** none.
- **Traces:** FR-HERO-009, FR-HERO-010.
- **Unit tests (UT-GAUGE):** `speedAt(0) === 88`; `rpmAt(0)` ≈ 4309.7 (`toBeCloseTo(4309.765, 3)`); `speedAngle(0) === -215`, `speedAngle(180) === 35`, `speedAngle(500) === 35` (clamp); `rpmAngle(8000) === 35`; `needlePoint(-215)` equals `(130 + 84cos(-215°), 130 + 84sin(-215°))`; `arcPath(130,130,100,-215,35)` has large-arc flag 1 and `arcPath(...,-215,-100)` has 0, exact string format `M <x> <y> A 100 100 0 <lg> 1 <x> <y>`; `gaugeTicks()` length 19 with 7 majors at indices 0,3,...,18; major inner radius 82, minor 90.

### 6.6 Hooks

Common: all hooks live in `.js` files, import only `react`, `lib/` and sibling hooks, follow rules R-L3/R-L4, and are tested with `renderHook` (`@testing-library/react`) plus the browser mocks in `tests/utils/browserMocks.js` (controllable IntersectionObserver, matchMedia). Each hook test suite includes a StrictMode run (`renderHook(..., { wrapper: StrictMode })`) asserting that exactly one live listener/observer/interval remains (NFR-RELI-004).

#### UNIT-USE_THEME

- **File:** `src/hooks/useTheme.js`  |  **ARC:** ARC-009
- **Purpose:** Theme state machine: automatic Chennai theme, manual override with persistence, pre-paint `data-theme`, and a minute clock for the badge.
- **Interface:**
  ```js
  /** @param {{ geo?: GeoLocation, storage?: Storage }} [options]
   *  @returns {{ theme: "day"|"night", isDay: boolean, isManual: boolean, toggle: () => void, now: Date }} */
  export function useTheme({ geo = DEFAULT_GEO, storage } = {})
  export const THEME_RECHECK_MS = 60000
  export const CLOCK_TICK_MS = 60000
  ```
  `storage` is passed through to `lib/storage.js` (undefined -> `localStorage`); tests inject a stub.
- **Behaviour:**
  1. **Initial state (lazy, during the first render; R-L4):**
     ```js
     const [init] = useState(() => {
       const stored = readThemeOverride(storage);
       return stored ? { theme: stored, manual: true } : { theme: getSunPhase(new Date(), geo), manual: false };
     });
     const [theme, setTheme] = useState(init.theme);
     const [manual, setManual] = useState(init.manual);
     const [now, setNow] = useState(() => new Date());
     ```
  2. **Pre-paint attribute (FR-THEME-001, ADR-017):** `useLayoutEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme])`. Guard: skip if `typeof document === "undefined"`. The attribute is not removed on unmount (page-lifetime state; tests remove it in teardown).
  3. **Automatic re-evaluation (FR-THEME-003):** `useEffect(() => { if (manual) return; const id = setInterval(() => setTheme(getSunPhase(new Date(), geo)), THEME_RECHECK_MS); return () => clearInterval(id); }, [manual, geo])`. No interval exists while `manual` is true (including an override restored at mount). React bails out when the phase is unchanged.
  4. **Clock tick (FR-THEME-005):** `useEffect(() => { const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS); return () => clearInterval(id); }, [])`. Always running, independent of `manual`.
  5. **Toggle (FR-THEME-004):** `toggle = useCallback(() => { setManual(true); setTheme(t => (t === "day" ? "night" : "day")); }, [])` (stable identity).
  6. **Persistence (FR-THEME-008, ADR-018):** `useEffect(() => { if (manual) writeThemeOverride(theme, storage); }, [manual, theme, storage])`. Writes after every manual change; the return value is ignored (a failed write keeps the page-lifetime override).
  7. Return `{ theme, isDay: theme === "day", isManual: manual, toggle, now }`.
- **State machine:**

  | State | Entered when | Theme interval | Clock interval | On toggle |
  |---|---|---|---|---|
  | AUTO | no valid stored value at mount | running (60 s) | running | -> MANUAL, flip, persist |
  | MANUAL | valid stored value at mount, or after toggle | none | running | flip, persist |

- **Errors:** storage failures are absorbed by `lib/storage.js`; an invalid `Date` yields `"night"` from `getSunPhase`.
- **Dependencies:** `react` (`useState`, `useEffect`, `useLayoutEffect`, `useCallback`), `lib/solar.js`, `lib/storage.js`.
- **Traces:** FR-THEME-001, 002, 003, 004, 005, 008; NFR-PORT-003; NFR-PERF-004; NFR-RELI-004. ADR-011, ADR-017, ADR-018.
- **Unit tests (UT-USE_THEME), fake timers + `vi.setSystemTime`:** (1) system time 12:00 IST, empty storage -> `theme "day"`, `isManual false`, `html[data-theme="day"]`; (2) 23:00 IST -> night; (3) attribute is set before passive effects (spy: a `useEffect` in a sibling test component reads the attribute on mount and sees the value); (4) stub storage `"night"` at 12:00 IST -> `night`, `isManual true`, and `setInterval` was called only once (the clock); (5) stub storage `"foo"` or throwing -> automatic theme, no console error; (6) time just before sunset + advance 60 s -> flips to night; (7) after `toggle()` theme flips, `setItem("jsv-theme-override", <theme>)` called, and advancing past sunrise/sunset 10 minutes does not change it; (8) `now` changes after advancing 60 s, also while manual; (9) unmount clears both intervals (`clearInterval` spy, 2 calls in AUTO); (10) `toggle` identity stable across renders; (11) StrictMode: after mount exactly one theme interval and one clock interval are live.

#### UNIT-USE_REVEAL

- **File:** `src/hooks/useReveal.js`  |  **ARC:** ARC-009
- **Interface:** `export function useReveal(rootRef)` (returns `undefined`). `export const REVEAL_THRESHOLD = 0.06`.
- **Behaviour:** `useEffect(() => {...}, [rootRef])`:
  1. `const root = rootRef.current; if (!root) return;`
  2. `const els = root.querySelectorAll(".reveal");`
  3. If `typeof IntersectionObserver !== "function"`: `els.forEach(el => el.classList.add("visible"))`; return (NFR-RELI-005, ADR-021).
  4. Else `const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } }), { threshold: REVEAL_THRESHOLD });` `els.forEach(el => obs.observe(el));` return `() => obs.disconnect()`.
  Class names `reveal`/`visible` and the threshold are identical to baseline lines 967-976. Elements already `visible` remain so (idempotent).
- **Errors:** null ref -> no-op; IO constructor throwing (exotic environments) -> caught, fall back to step 3.
- **Dependencies:** `react`.
- **Traces:** FR-FX-005, NFR-RELI-005, NFR-PERF-004. ADR-012, ADR-021.
- **Unit tests (UT-USE_REVEAL):** render a component with 3 `.reveal` children: observer created with `threshold 0.06` and observes 3 elements; `triggerIntersection(el, true)` adds `visible` and removes the element from the observer; `false` does nothing; unmount disconnects (no live observers); `window.IntersectionObserver = undefined` -> all 3 get `visible` immediately and nothing throws; non-`.reveal` children are untouched.

#### UNIT-USE_ACTIVE_SECTION

- **File:** `src/hooks/useActiveSection.js`  |  **ARC:** ARC-009
- **Purpose:** Active-section tracking for the nav, plus the one-shot hash re-scroll after lazy content mounts (SADS 4.4.1 step 18, 4.4.5).
- **Interface:**
  ```js
  export const ACTIVE_OFFSET_PX = 140
  /** @param {ArrayLike<HTMLElement>} nodes  @returns {string} */
  export function pickActiveSection(nodes, scrollY, offset = ACTIVE_OFFSET_PX, defaultId = "hero")
  /** @returns {string} active section id */
  export function useActiveSection(defaultId = "hero", offset = ACTIVE_OFFSET_PX)
  /** @param {{ current: HTMLElement|null }} rootRef  @param {{ timeoutMs?: number }} [options] */
  export function useHashScroll(rootRef, { timeoutMs = 10000 } = {})
  ```
- **Behaviour:**
  - `pickActiveSection`: `let cur = defaultId; for (const s of nodes) if (scrollY >= s.offsetTop - offset) cur = s.dataset.section; return cur;` ("last match wins", baseline lines 981-985).
  - `useActiveSection`: `const [active, setActive] = useState(defaultId)`; effect `[defaultId, offset]` registers a **passive** `scroll` listener on `window` whose handler calls `setActive(pickActiveSection(document.querySelectorAll("[data-section]"), window.scrollY, offset, defaultId))` on **every** scroll event (FR-NAV-006; no rAF, see 8.1 D-01). Cleanup removes it. Initial value is `defaultId` (no measurement at mount, baseline parity).
  - `useHashScroll(rootRef)` (effect `[rootRef, timeoutMs]`):
    - `arm()`: `id = decodeURIComponent(window.location.hash.slice(1))`; return if empty or if `rootRef.current` contains no `[data-section-placeholder]` (native scrolling already landed correctly).
    - Ready test `isReady()`: `t = document.getElementById(id)`; false if `!t` or `t.hasAttribute("data-section-placeholder")` or any `[data-section-placeholder]` element in the root precedes `t` (`p.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING`).
    - While armed: a `MutationObserver` on `rootRef.current` (`{ childList: true, subtree: true }`) calls `isReady()` on each batch; when true: if `t.hasAttribute("data-section")` call `t.scrollIntoView({ block: "start" })` (honours CSS `scroll-behavior`), then `disarm()`. Also `disarm()` after `timeoutMs`, and on the first user `wheel`, `touchstart` or `keydown` event (passive, on `window`), so the page never fights the user.
    - `arm()` runs once at mount and on every `hashchange` (listener on `window`); a new arm first disarms the previous one.
    - Cleanup: disarm and remove the `hashchange` listener.
- **Errors:** `MutationObserver` missing -> `useHashScroll` is a no-op. Malformed `%` escapes in the hash -> `decodeURIComponent` throws -> caught, no-op.
- **Dependencies:** `react`.
- **Traces:** FR-NAV-006, FR-GEN-005, NFR-USAB-002, NFR-PERF-004. ADR-005.
- **Unit tests (UT-USE_ACTIVE_SECTION):** `pickActiveSection` table with stubbed `offsetTop` (0, 800, 1600): scrollY 0 -> "hero"; 660 -> second (800-140 boundary inclusive); 659 -> "hero"; empty list -> default; hook: dispatching `scroll` after setting `window.scrollY` updates the value; listener registered with `{ passive: true }` and removed on unmount; `useHashScroll`: with `location.hash = "#contact"` and a placeholder preceding `#contact`, `scrollIntoView` is not called until the placeholder is replaced, then called once; not called when no placeholders exist at mount; disarmed by a `keydown` event; disarmed after `timeoutMs` (fake timers); `hashchange` re-arms; `MutationObserver` disconnected on unmount.

#### UNIT-USE_SCROLLED

- **File:** `src/hooks/useScrolled.js`  |  **ARC:** ARC-009
- **Interface:** `export function useScrolled(threshold = 30): boolean`.
- **Behaviour:** `useState(false)`; passive `scroll` listener on `window`: `setScrolled(window.scrollY > threshold)` (strictly greater, baseline line 997); cleanup removes it.
- **Traces:** FR-NAV-007, NFR-PERF-004. **Unit tests (UT-USE_SCROLLED):** initial false; scrollY 31 -> true; 30 -> false; custom threshold; passive flag; removal on unmount.

#### UNIT-USE_TYPEWRITER

- **File:** `src/hooks/useTypewriter.js`  |  **ARC:** ARC-009
- **Interface:**
  ```js
  /** @param {ReadonlyArray<string>} words  (non-empty, stable reference)
   *  @param {{ speed?:number, deleteSpeed?:number, pause?:number, jitter?:number, startDelay?:number,
   *            nextWordDelay?:number, rng?:() => number, enabled?:boolean }} [options]
   *  @returns {string} */
  export function useTypewriter(words, { speed = 65, deleteSpeed = 35, pause = 1800, jitter = 30,
                                         startDelay = 900, nextWordDelay = 300, rng = Math.random, enabled = true } = {})
  ```
- **Behaviour:** baseline lines 1004-1036, one timer at a time held in a local `t`:
  - `display` state `""`; cursor state in `useRef({ wi: 0, ci: 0, deleting: false })`.
  - Effect deps `[words, speed, deleteSpeed, pause, jitter, startDelay, nextWordDelay, rng, enabled]`: if `!enabled` return. Else `t = setTimeout(tick, startDelay)`; cleanup `clearTimeout(t)`.
  - `tick()`: `word = words[wi]`.
    - typing (`!deleting`): if `ci < word.length` -> `setDisplay(word.slice(0, ci + 1)); ci++; t = setTimeout(tick, speed + rng() * jitter)`; else `t = setTimeout(() => { deleting = true; tick(); }, pause)`.
    - deleting: if `ci > 0` -> `setDisplay(word.slice(0, ci - 1)); ci--; t = setTimeout(tick, deleteSpeed)`; else `wi = (wi + 1) % words.length; deleting = false; t = setTimeout(tick, nextWordDelay)`.
  - Return `enabled ? display : words[0]` (static first role under reduced motion, NFR-A11Y-002; no timers scheduled).
  - Timing oracle (rng = () => 0): "Q" at 900 ms; full "Qt / QML Developer" (18 chars) at 900 + 17x65 = 2005 ms; completion check at 2070 ms; first deletion at 3870 ms (FR-HERO-004 v1.1).
- **Errors:** `words` empty -> returns `""` and schedules nothing.
- **Dependencies:** `react`.
- **Traces:** FR-HERO-003, FR-HERO-004, NFR-A11Y-002, NFR-PERF-004. ADR-007, ADR-015.
- **Unit tests (UT-USE_TYPEWRITER), fake timers, `rng: () => 0`:** values at 899/900/2005/3869/3870 ms per the oracle; after a full cycle of word 1 the next word starts after 300 ms; wrap-around from word 5 to word 1; `jitter` applied (`rng: () => 1` -> 95 ms per char); `enabled:false` returns "Qt / QML Developer" and `setTimeout` not called; unmount leaves `vi.getTimerCount() === 0`.

#### UNIT-USE_PARALLAX

- **File:** `src/hooks/useParallax.js`  |  **ARC:** ARC-009
- **Interface:** `export function useParallax({ enabled = true } = {}): React.RefObject<HTMLElement>`.
- **Behaviour:** `ref = useRef(null)`. Effect `[enabled]`: if `!enabled` return. Passive `mousemove` listener on `window`: if `ref.current` is null return; `x = ((e.clientX / window.innerWidth) - 0.5) * 14`, `y = ((e.clientY / window.innerHeight) - 0.5) * 14`; `ref.current.style.transform = \`perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) translateZ(8px)\``. Cleanup: remove the listener and, if `ref.current` exists, set `ref.current.style.transform = ""` (so switching to reduced motion leaves no tilt).
- **Traces:** FR-HERO-013, NFR-A11Y-002, NFR-PERF-004. ADR-015.
- **Unit tests (UT-USE_PARALLAX):** innerWidth 1000/innerHeight 800, mousemove (1000, 400) -> `rotateY(7deg) rotateX(-0deg)`; (0,0) -> `rotateY(-7deg) rotateX(7deg)`; `enabled:false` -> no listener and transform stays `""`; passive flag; cleanup removes the listener.

#### UNIT-USE_PREFERS_REDUCED_MOTION

- **File:** `src/hooks/usePrefersReducedMotion.js`  |  **ARC:** ARC-009
- **Interface:** `export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"`; `export function usePrefersReducedMotion(): boolean`.
- **Behaviour:** `useState(() => hasMatchMedia() ? window.matchMedia(REDUCED_MOTION_QUERY).matches : false)`. Effect `[]`: if no `matchMedia` return; `mql = window.matchMedia(QUERY)`; `onChange = e => setReduced(e.matches)`; subscribe with `mql.addEventListener("change", onChange)` or, if absent, `mql.addListener(onChange)`; cleanup with the matching remove. No synchronous setState in the effect body (R-L3). `hasMatchMedia = () => typeof window !== "undefined" && typeof window.matchMedia === "function"`.
- **Traces:** NFR-A11Y-001, NFR-A11Y-002. ADR-015.
- **Unit tests:** default false; `setMatchMedia({[QUERY]: true})` before render -> true; change event after mount flips the value; `window.matchMedia = undefined` -> false, no throw; legacy `addListener` path; cleanup removes the listener.

#### UNIT-USE_IN_VIEW

- **File:** `src/hooks/useInView.js`  |  **ARC:** ARC-009 (new in SADS v1.1)
- **Interface:** `export function useInView(ref, { trackDocumentVisibility = true, threshold = 0 } = {}): boolean`.
- **Behaviour:**
  - `const [intersecting, setIntersecting] = useState(() => typeof IntersectionObserver !== "function")` (true when IO is missing, false until the first IO callback otherwise).
  - `const [pageVisible, setPageVisible] = useState(() => typeof document === "undefined" || document.visibilityState !== "hidden")`. Note: "visible" means **not `"hidden"`** (jsdom reports `"prerender"`).
  - Effect `[ref, threshold]`: if IO missing or `!ref.current` return; `obs = new IntersectionObserver(entries => setIntersecting(entries[entries.length - 1].isIntersecting), { threshold })`; `obs.observe(ref.current)`; cleanup `obs.disconnect()`.
  - Effect `[trackDocumentVisibility]`: if not tracking return; `onVis = () => setPageVisible(document.visibilityState !== "hidden")`; `document.addEventListener("visibilitychange", onVis)`; cleanup removes it.
  - Return `intersecting && (!trackDocumentVisibility || pageVisible)`.
  - An element with `display: none` (gauge at <= 900 px) never intersects, so no media query reading is needed (SADS 4.4.6).
- **Traces:** NFR-PERF-006, NFR-PERF-004. ADR-019.
- **Unit tests (UT-USE_IN_VIEW):** initially false with IO present; `triggerIntersection(el, true)` -> true, `false` -> false; IO missing -> true; `visibilityState` stubbed `"hidden"` + `visibilitychange` -> false, back to `"visible"` -> true; `trackDocumentVisibility:false` ignores it; unmount disconnects and removes the listener.

### 6.7 Context

#### UNIT-THEME_CONTEXT

- **File:** `src/context/ThemeContext.jsx`  |  **ARC:** ARC-008
- **Purpose:** Provider pattern over `useTheme` (single owner of theme state).
- **Interface:**
  ```js
  export function ThemeProvider({ children }): JSX.Element
  /** @returns {{ theme:"day"|"night", isDay:boolean, isManual:boolean, toggle:() => void, now:Date }} */
  export function useThemeContext()
  ```
  The context object (`createContext(null)`) is module-private (not exported).
- **Behaviour:** `ThemeProvider` calls `useTheme()` once (default geo, default storage) and provides `useMemo(() => ({ theme, isDay, isManual, toggle, now }), [theme, isDay, isManual, toggle, now])`. `useThemeContext()` reads the context and, if it is `null`, throws `new Error("useThemeContext must be used within ThemeProvider")`. The value object changes at most once per minute (clock) or per toggle.
- **Lint:** this file exports a component plus a non-component function, so `eslint.config.js` must add `{ files: ["src/context/ThemeContext.jsx"], rules: { "react-refresh/only-export-components": ["error", { allowConstantExport: true, allowExportNames: ["useThemeContext"] }] } }`.
- **Dependencies:** `react` (`createContext`, `useContext`, `useMemo`), `hooks/useTheme.js`.
- **Traces:** FR-THEME-001, FR-THEME-007. ADR-003, ADR-017.
- **Unit tests (UT-THEME_CONTEXT):** consumer under the provider receives `theme`, `isDay`, `toggle`, `now`; calling `toggle` re-renders the consumer with the flipped theme and flips `html[data-theme]`; `useThemeContext` outside the provider throws exactly the message above; value identity stable when nothing changed (render count spy).

### 6.8 UI primitives (content-agnostic; never import `data/` or `config/`)

#### UNIT-ICON

- **File:** `src/components/ui/Icon.jsx`  |  **ARC:** ARC-010 (was `Ms`, baseline lines 1056-1063)
- **Interface:** `export default function Icon({ name, size = 18, fill = 0, wght = 300, style = {}, label })`.

  | Prop | Type | Req | Default |
  |---|---|---|---|
  | name | MsIcon | yes | - |
  | size | number | no | 18 |
  | fill | 0 \| 1 | no | 0 |
  | wght | number | no | 300 |
  | style | object | no | `{}` (merged last, overrides) |
  | label | string | no | undefined |

- **Behaviour:** renders exactly
  ```jsx
  <span aria-hidden={label ? undefined : "true"} role={label ? "img" : undefined} aria-label={label}
        style={{ fontFamily: "'Material Symbols Outlined'", fontVariationSettings: `'FILL' ${fill},'wght' ${wght},'GRAD' -25,'opsz' 48`,
                 fontSize: size, lineHeight: 1, display: "inline-block", verticalAlign: "middle", userSelect: "none", ...style }}>{name}</span>
  ```
  **No `className` prop and no class attribute** (OBS-11 accepted: the dormant `.nav-link .ms`, `.btn .ms`, `.theme-btn .ms` rules must stay inactive). Callers that pass `className` have it ignored (not forwarded).
- **Traces:** NFR-A11Y-007, NFR-MAINT-008, FR-NAV-002. **Unit tests (UT-ICON):** default render has `aria-hidden="true"`, text = name, font-size 18px, variation string `'FILL' 0,'wght' 300,'GRAD' -25,'opsz' 48`; `style` merges/overrides; `label` -> `role="img"`, `aria-label`, no `aria-hidden`; `className` prop not rendered (`span.className === ""`).

#### UNIT-SECTION_LABEL

- **File:** `src/components/ui/SectionLabel.jsx`  |  **ARC:** ARC-010 (was `SL`)
- **Interface:** `export default function SectionLabel({ icon, text })` (both required strings).
- **Behaviour:** `<div className="section-label"><Icon name={icon} size={13} />{text}</div>`.
- **Traces:** FR-GEN-003. **Unit tests:** class, icon size 13, text node.

#### UNIT-SECTION_TITLE

- **File:** `src/components/ui/SectionTitle.jsx`  |  **ARC:** ARC-010 (was `ST`)
- **Interface:** `export default function SectionTitle({ children })`.
- **Behaviour:** `<h2 className="section-title">{children}</h2>`.
- **Traces:** FR-GEN-003. **Unit tests:** renders `h2.section-title` with children.

#### UNIT-BUTTON

- **File:** `src/components/ui/Button.jsx`  |  **ARC:** ARC-010
- **Interface:** `export default function Button({ variant, href, icon, download, external = false, children })`.

  | Prop | Type | Req | Notes |
  |---|---|---|---|
  | variant | `"amber"\|"outline"\|"green"` | yes | class `btn btn-<variant>` |
  | href | string | yes | |
  | icon | MsIcon | yes | rendered with `size={17}` before the children |
  | download | string \| true | no | forwarded as the `download` attribute |
  | external | boolean | no (false) | adds `target="_blank" rel="noopener noreferrer"` |
  | children | node | yes | label |

- **Behaviour:** `<a href={href} download={download} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={\`btn btn-${variant}\`}><Icon name={icon} size={17} />{children}</a>`.
- **Errors:** an unknown variant is rendered as given (no runtime check; JSDoc union is the contract).
- **Traces:** FR-HERO-007, FR-RES-002, NFR-SEC-001, NFR-A11Y-007/009. **Unit tests:** class for each variant; `external` attributes; `download` string forwarded; no `target` when not external; icon span is `aria-hidden`; accessible name equals the children text only.

#### UNIT-BADGE

- **File:** `src/components/ui/Badge.jsx`  |  **ARC:** ARC-010
- **Interface:** `export default function Badge({ children })`. **Behaviour:** `<span className="badge">{children}</span>`.
- **Traces:** FR-HERO-006. **Unit tests:** class and text.

#### UNIT-SECTION

- **File:** `src/components/ui/Section.jsx`  |  **ARC:** ARC-010
- **Purpose:** Section wrapper: id + `data-section`, optional label and h2, optional `.inner` container, and the per-section reveal observer (ADR-012).
- **Interface:** `export default function Section({ as = "section", id, className, style, label, title, inner = false, children })`.

  | Prop | Type | Req | Notes |
  |---|---|---|---|
  | as | `"section"\|"div"` | no | element type kept per baseline (P-22) |
  | id | string | yes | also written to `data-section` |
  | className | string | yes | e.g. `"section-wrap"`, `"exp-band full-band"` |
  | style | object | no | inline style of the root |
  | label | `{icon: MsIcon, text: string}` \| null | no | renders `SectionLabel` |
  | title | string \| null | no | renders `SectionTitle` |
  | inner | boolean | no | wrap label/title/children in `<div className="inner">` |
  | children | node | yes | |

- **Behaviour:** `ref = useRef(null)`; `useReveal(ref)`; render `<As ref={ref} id={id} data-section={id} className={className} style={style}>` then, inside (or inside `div.inner` when `inner`): `{label && <SectionLabel icon={label.icon} text={label.text} />}{title && <SectionTitle>{title}</SectionTitle>}{children}`.
- **Dependencies:** `react`, `hooks/useReveal.js`, `./SectionLabel.jsx`, `./SectionTitle.jsx`.
- **Traces:** FR-GEN-001, FR-GEN-003, FR-FX-005, NFR-RELI-005. ADR-012.
- **Unit tests (UT-SECTION):** `as="div"` renders a div; `id` and `data-section` equal; `inner` structure; no h2 when `title` null; `.reveal` descendants get `visible` after intersection (observer rooted at this section); no IO -> visible immediately.

#### UNIT-RICH_TEXT

- **File:** `src/components/ui/RichText.jsx`  |  **ARC:** ARC-010 (added unit)
- **Interface:** `export default function RichText({ segments })` (`segments: RichText`).
- **Behaviour:** returns a fragment: for each segment `i`: `mark === "strong"` -> `<strong key={i}>{text}</strong>`; `mark === "hl"` -> `<span key={i} className="hl">{text}</span>`; else `<Fragment key={i}>{text}</Fragment>`. No wrapper element (the caller supplies `<p>`).
- **Traces:** FR-HERO-005, FR-ABOUT-002, NFR-SEC-003. **Unit tests:** mixed segments produce the exact `innerHTML`; text containing `<b>` is rendered as text, not markup.

### 6.9 Tech icon subsystem (Strategy + Registry)

#### UNIT-ICON_STRATEGIES

- **File:** `src/components/tech/iconStrategies.js`  |  **ARC:** ARC-011
- **Purpose:** Strategy map from icon-ref prefix to renderer. Plain `.js`: uses `createElement`, no JSX (R-L2).
- **Interface:**
  ```js
  /** @returns {{ kind: "si"|"ms"|"svg"|null, value: string }} */
  export function parseIconRef(ref)
  /** @typedef {(p: { value:string, color:string, size:number, failed:boolean, onError:() => void }) => React.ReactNode} IconStrategy */
  export const ICON_STRATEGIES   // Object.freeze({ si, ms, svg }) of IconStrategy
  export const fallbackIcon      // IconStrategy: Icon "code"
  export const SIMPLE_ICONS_BASE = "https://cdn.simpleicons.org/"
  ```
- **Behaviour:**
  - `parseIconRef(ref)`: non-string -> `{kind: null, value: ""}`; `i = ref.indexOf(":")`; `i <= 0` -> `{kind: null, value: ref}`; `kind = ref.slice(0, i)`; known kinds `si|ms|svg` -> `{kind, value: ref.slice(i + 1)}`; unknown -> `{kind: null, value: ref.slice(i + 1)}`.
  - `fallbackIcon({color, size})` -> `createElement(Icon, { name: "code", size, style: { color } })`.
  - `si`: if `failed` -> `fallbackIcon(...)`; else `createElement("img", { src: SIMPLE_ICONS_BASE + value, width: size, height: size, style: { display: "block", objectFit: "contain", borderRadius: 2 }, onError, alt: value })`. **`alt` is the slug** (NFR-A11Y-004, SADS v1.1 ADR-014). No `loading`/`decoding` attributes (parity; 8.1 D-03).
  - `svg`: `const render = Object.hasOwn(CUSTOM_SVGS, value) ? CUSTOM_SVGS[value] : null; return render ? render(color, size) : fallbackIcon({color, size})`.
  - `ms`: `createElement(Icon, { name: value, size, style: { color } })`.
- **Dependencies:** `react` (`createElement`), `components/ui/Icon.jsx`, `./customSvgs.jsx`.
- **Traces:** FR-SKILL-003, FR-SKILL-004, NFR-A11Y-004, NFR-RELI-003. ADR-014.
- **Unit tests (UT-ICON_STRATEGIES):** `parseIconRef` table (`"si:qt"`, `"svg:i2c"`, `"ms:code"`, `"foo:bar"`, `"plain"`, `":x"`, `undefined`, `"constructor:x"`); `si` element props (src ends with `/cplusplus`, alt `cplusplus`, width/height 22); `si` with `failed:true` -> code icon; `svg:lvgl` returns an `svg`; `svg:unknown` and `svg:toString` -> code icon; `ms:code` -> Icon span with colour.

#### UNIT-CUSTOM_SVGS

- **File:** `src/components/tech/customSvgs.jsx`  |  **ARC:** ARC-011
- **Interface:** `export const CUSTOM_SVGS` - `Object.freeze({ <key>: (c: string, s: number) => JSX.Element, ... })`, exactly 30 keys in baseline order: `oop, stl, smartptr, bit, struct, lvgl, touchgfx, guiguider, crank, candera, vglite, freertos, nxp, uart, spi, i2c, can, gpio, plasticscm, tklogger, ea, polarion, gdb, dlt, hil, ecu, fontforge, agile, aspice, uml`.
- **Behaviour:** each function body moved **verbatim** from baseline lines 1126-1434 (all attributes, `style={{display:"block"}}`, `fill="var(--bg)"` in `tklogger`). This file exports no component (R-L1).
- **Traces:** FR-SKILL-003. **Unit tests (UT-CUSTOM_SVGS):** 30 keys; each returns an `<svg>` with `viewBox="0 0 24 24"`, `width`/`height` equal to the size argument; stroke or fill uses the colour argument; frozen.

#### UNIT-TECH_ICON

- **File:** `src/components/tech/TechIcon.jsx`  |  **ARC:** ARC-011
- **Interface:** `export default function TechIcon({ icon, color, size = 22 })` (`icon: IconRef` required, `color: CssColor` required).
- **Behaviour:** `const [failed, setFailed] = useState(false); const { kind, value } = parseIconRef(icon); const strategy = (kind && ICON_STRATEGIES[kind]) || fallbackIcon; return strategy({ value, color, size, failed, onError: () => setFailed(true) });`.
- **Traces:** FR-SKILL-003, FR-SKILL-004, NFR-RELI-003. ADR-014.
- **Unit tests (UT-TECH_ICON):** `si:cplusplus` renders `img[src$="/cplusplus"][alt="cplusplus"]`; `fireEvent.error(img)` replaces it with the `code` span in the given colour; `svg:lvgl` renders an svg; `ms:code` renders the span; `svg:unknown` and `foo:bar` render `code`.

#### UNIT-SKILL_CHIP

- **File:** `src/components/tech/SkillChip.jsx`  |  **ARC:** ARC-011
- **Interface:** `export default function SkillChip({ skill, catColor })` (`skill: Skill`, `catColor: HexColor`).
- **Behaviour (baseline lines 1466-1486):** `hov` state; root `<div className="skill-chip" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ borderColor: hov ? catColor + "66" : "", boxShadow: hov ? \`0 6px 24px ${catColor}18, inset 0 1px 0 var(--glass-shine)\` : "" }}>` containing `<div className="chip-icon-wrap"><TechIcon icon={skill.icon} color={skill.color || catColor} size={22} /></div>` and `<span className="chip-label" style={{ color: hov ? (skill.color || catColor) : "" }}>{skill.name}</span>`.
- **Traces:** FR-SKILL-003, FR-GEN-010(b). **Unit tests:** structure and classes; hover sets border `#22d3ee66` and label colour to the skill colour; leave restores `""`; missing `skill.color` uses `catColor`.

### 6.10 Effects (decorative, `aria-hidden`)

#### UNIT-GRADIENT_ORBS

- **File:** `src/components/effects/GradientOrbs.jsx`  |  **ARC:** ARC-012
- **Interface:** `export default function GradientOrbs()`.
- **Behaviour:** `<div className="orbs-wrap" aria-hidden="true">` with 4 children `<div className="orb orb-1" />` ... `orb-4` (baseline lines 1675-1684). Pure CSS animation.
- **Traces:** FR-FX-001, NFR-A11Y-004. **Unit tests:** 4 `.orb`, wrapper `aria-hidden`.

#### UNIT-CURSOR_GLOW

- **File:** `src/components/effects/CursorGlow.jsx`  |  **ARC:** ARC-012
- **Interface:** `export default function CursorGlow()`.
- **Behaviour:**
  - `reduced = usePrefersReducedMotion()`; if `reduced` return `null` (not mounted under reduced motion; CSS hides it anyway, ADR-015).
  - Otherwise render `<div ref={ref} className="cursor-glow" style={{ left: -500, top: -500 }} aria-hidden="true" />` (initial position off-screen, baseline line 1690).
  - Effect `[]`: passive `mousemove` on `window`: `ref.current.style.left = \`${e.clientX}px\`; ref.current.style.top = \`${e.clientY}px\`` (direct style write, no React re-render, no rAF; 8.1 D-02). Cleanup removes the listener. The 60 ms linear transition comes from CSS.
- **Traces:** FR-FX-002, NFR-A11Y-001, NFR-A11Y-002, NFR-A11Y-004, NFR-PERF-004. ADR-015.
- **Unit tests (UT-CURSOR_GLOW):** initial left/top `-500px`; mousemove (400, 300) -> `400px`/`300px`; reduced motion -> renders nothing and registers no listener; passive flag; cleanup.

#### UNIT-PARTICLES

- **File:** `src/components/effects/Particles.jsx`  |  **ARC:** ARC-012
- **Interface:** `export default function Particles()`.
- **Behaviour:** module scope (not exported): `const PARTICLES = createParticles(18, mulberry32(PARTICLE_SEED));`. Render a fragment of 18 `<div key={p.id} className="particle" style={{ left: \`${p.x}%\`, top: \`${p.y}%\`, width: p.size, height: p.size, background: p.color, opacity: p.opacity, "--dur": \`${p.dur}s\`, "--delay": \`${p.delay}s\`, "--dx": p.dx }} />` (baseline lines 1721-1734). Rendered inside Hero. CSS hides them under reduced motion.
- **Dependencies:** `react`, `lib/random.js`.
- **Traces:** FR-FX-003, NFR-A11Y-001. ADR-007.
- **Unit tests (UT-PARTICLES):** 18 `.particle`; first particle style equals golden particle 0 (`left: 40.632403222844005%`, `--dx: -28.903061030432582px`); two renders produce identical markup.

### 6.11 Widgets

#### UNIT-SPEEDOMETER

- **File:** `src/components/widgets/Speedometer.jsx`  |  **ARC:** ARC-013
- **Interface:** `export default function Speedometer()` (no props; single instance; SVG ids are global).
- **Behaviour:**
  - `svgRef = useRef(null)`; `tRef = useRef(0)`; `[frame, setFrame] = useState(() => gaugeFrame(0))` (shows 88 km/h / 4310 RPM from the first paint; the baseline showed 0/0 for one frame, allowed "animation frame" difference).
  - `reduced = usePrefersReducedMotion()`; `inView = useInView(svgRef)`; `running = inView && !reduced`.
  - Effect `[running]`: if `!running` return. `let id = requestAnimationFrame(function tick() { tRef.current += GAUGE.dt; setFrame(gaugeFrame(tRef.current)); id = requestAnimationFrame(tick); });` cleanup `cancelAnimationFrame(id)`. One state update per frame. When `running` becomes false the loop stops (no rAF scheduled, no re-render) and resumes from `tRef.current` (NFR-PERF-006, ADR-019).
  - Displayed values: `const { speed, rpm } = reduced ? gaugeFrame(0) : frame;` (static t=0 frame under reduced motion, NFR-A11Y-002).
  - Geometry: `sAngle = speedAngle(speed)`, `rAngle = rpmAngle(rpm)`, `{x: nx, y: ny} = needlePoint(sAngle)`, `TICKS = gaugeTicks()` at module scope.
  - Markup (baseline lines 1779-1815, verbatim): `<svg ref={svgRef} viewBox="0 0 260 260" style={{ width: "100%", maxWidth: 320, height: "auto" }} role="img" aria-label="HMI cluster demo gauge">` (the two ARIA attributes are the SADS 8.4 addition; they stop screen readers from announcing the changing numbers) with `<defs>` (`radialGradient#gbg`, `linearGradient#arcGrad` #34d399->#22d3ee, `#rpmGrad` #f59e0b->#fb7185, `#needleGrad` #fbbf24->#f59e0b vertical, `filter#glow` stdDeviation 3, `filter#softGlow` stdDeviation 6); background circle r 122 `fill="url(#gbg)"` stroke `rgba(245,158,11,0.15)` 1.5; circle r 112 stroke `rgba(255,255,255,0.03)`; RPM track `arcPath(130,130,112,-215,35)` stroke `rgba(255,255,255,0.05)` width 5; RPM value `arcPath(130,130,112,-215,rAngle)` `url(#rpmGrad)` width 5 `filter="url(#glow)"`; speed track `arcPath(130,130,100,-215,35)` `rgba(255,255,255,0.07)` width 9; speed value `arcPath(130,130,100,-215,sAngle)` `url(#arcGrad)` width 9 glow; 19 tick `<line>`s (major stroke `rgba(245,158,11,0.55)` width 2, minor `rgba(255,255,255,0.14)` width 1); needle line to `(nx, ny)` `url(#needleGrad)` width 2.5 `filter="url(#softGlow)"`; hub circles r 8 `#f59e0b` glow and r 3.5 `#060c18`; texts: `{Math.round(speed)}` at y 160 size 30 bold `#e2e8f0`; "km/h" y 177 size 10 letterSpacing 0.2em `rgba(245,158,11,0.7)`; "HMI CLUSTER DEMO" y 100 size 8.5 `rgba(34,211,238,0.6)`; `{Math.round(rpm)} RPM` y 196 size 8 `rgba(251,113,133,0.6)`; all texts `fontFamily="'Share Tech Mono',monospace"`, `textAnchor="middle"`, x 130. Every `strokeLinecap="round"` as in the baseline.
- **Errors:** IO missing -> `useInView` true (baseline behaviour, still animates); document hidden -> paused.
- **Dependencies:** `react`, `hooks/usePrefersReducedMotion.js`, `hooks/useInView.js`, `lib/gauge.js`.
- **Traces:** FR-HERO-008, FR-HERO-009, FR-HERO-010, NFR-PERF-006, NFR-A11Y-002, NFR-PERF-004. ADR-015, ADR-019.
- **Unit tests (UT-SPEEDOMETER), fake rAF (spy `requestAnimationFrame`/`cancelAnimationFrame`):** initial text "88" and "4310 RPM"; with IO intersecting, one rAF scheduled and a frame advances t by 0.006; not intersecting -> no rAF call; switching to not intersecting cancels the pending frame; becoming visible resumes from the last t (speed text equals `Math.round(speedAt(n*0.006))`); `visibilityState "hidden"` -> paused; reduced motion -> no rAF and texts stay "88"/"4310 RPM"; unmount calls `cancelAnimationFrame`; 19 tick lines with 7 of width 2.

#### UNIT-DESIGN_ART

- **File:** `src/components/widgets/DesignArt.jsx`  |  **ARC:** ARC-013 (added unit; SADS ARC-016 permits the extraction)
- **Interface:** `export default function DesignArt({ artKey })` (`artKey` ∈ `DESIGN_ART_KEYS`).
- **Behaviour:** module-private registry `const ART = { cluster: () => <svg .../>, medical, infotainment, multiplatform, profile }` holding the 5 inline SVGs **verbatim** from baseline lines 2153-2254 (in card order 1..5, including the generated tick lines, the patient rows `[["Name","Rajesh Kumar"],["Age","45"],["Session","#12"],["Duration","20 min"]]`, the 5 infotainment tiles and the 4 profile bubbles). Return `Object.hasOwn(ART, artKey) ? ART[artKey]() : null`.
- **Traces:** FR-DESIGN-002. **Unit tests (UT-DESIGN_ART):** each of the 5 keys renders an `svg` with viewBox `0 0 580 280` (infotainment `0 0 1160 300`); unknown key -> null; cluster art has 12 tick lines; medical art contains "Rajesh Kumar".

### 6.12 Layout

#### UNIT-NAV

- **File:** `src/components/layout/Nav.jsx`  |  **ARC:** ARC-014
- **Interface:** `export default function Nav({ items })` (`items: ReadonlyArray<NavItem>`, required; App passes the `showInNav` registry entries). Nav does not import `config/sections.js`.
- **Behaviour:** `const { isDay, toggle, now } = useThemeContext(); const active = useActiveSection(); const scrolled = useScrolled(); const [open, setOpen] = useState(false); const hamburgerRef = useRef(null); const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });`
  Markup (fragment, baseline lines 1830-1873 plus the v1.1 a11y attributes):
  ```jsx
  <nav className={`nav${scrolled ? " scrolled" : ""}`} aria-label="Primary">
    <div className="nav-logo"><Icon name="developer_board" size={17} />{BRAND_TEXT}</div>
    <ul className="nav-links" style={{ listStyle: "none", display: "flex", gap: 2, margin: 0, padding: 0 }}>
      {items.map(({ id, icon, label }) => (
        <li key={id}><a href={`#${id}`} className={`nav-link${active === id ? " active" : ""}`}><Icon name={icon} size={13} />{label}</a></li>
      ))}
    </ul>
    <div className="nav-right">
      <div className="theme-badge"><Icon name={isDay ? "wb_sunny" : "nights_stay"} size={12} />{isDay ? "DAY" : "NIGHT"} · {timeStr}</div>
      <button className="theme-btn" onClick={toggle} title="Toggle day/night theme"><Icon name={isDay ? "dark_mode" : "light_mode"} size={14} />{isDay ? "Night" : "Day"}</button>
      <button ref={hamburgerRef} className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu" aria-expanded={open} aria-controls="mobile-menu"><span /><span /><span /></button>
    </div>
  </nav>
  <div id="mobile-menu" className={`mobile-menu${open ? " open" : ""}`}>
    {items.map(({ id, icon, label }) => (
      <a key={id} href={`#${id}`} className="nav-link" onClick={() => setOpen(false)}><Icon name={icon} size={15} />{label}</a>
    ))}
    <button className="theme-btn" onClick={() => { toggle(); setOpen(false); }} style={{ marginTop: 8, width: "100%", justifyContent: "center" }}>
      <Icon name={isDay ? "dark_mode" : "light_mode"} size={14} />Switch to {isDay ? "Night" : "Day"} Mode
    </button>
  </div>
  ```
  - The badge text nodes are `"DAY"|"NIGHT"`, `" · "`, `timeStr` (textContent e.g. `wb_sunnyDAY · 08:15 pm`). `timeStr` refreshes whenever the context `now` changes (every 60 s, FR-THEME-005).
  - The baseline passed `className="ms"` to the desktop link icon; it is **not** passed (Icon has no className), output identical (OBS-11).
  - Mobile links never get the `active` class (baseline).
  - **Escape (FR-NAV-012):** effect `[open]`: if `!open` return; `onKey = e => { if (e.key === "Escape") { setOpen(false); hamburgerRef.current?.focus(); } }`; `document.addEventListener("keydown", onKey)`; cleanup removes it.
- **Dependencies:** `react`, `context/ThemeContext.jsx`, `hooks/useActiveSection.js`, `hooks/useScrolled.js`, `components/ui/Icon.jsx`, `config/site.js` (`BRAND_TEXT`).
- **Traces:** FR-NAV-001..012, FR-THEME-004, FR-THEME-005, NFR-A11Y-005, NFR-A11Y-007, NFR-USAB-003. ADR-003, ADR-020.
- **Unit tests (UT-NAV)** (wrap in `ThemeProvider`; force the theme via a stub `localStorage` value): 9 desktop links with hrefs/labels from fixture items; `.nav-logo` textContent `developer_boardJEEVANANDHAM`; active class follows a mocked `useActiveSection` / scroll; `scrolled` class at scrollY 31; badge text matches `/^(DAY|NIGHT) · \d{2}:\d{2}\s(am|pm)$/i` (excluding the icon span); badge minute updates after advancing 60 s (fake timers); theme button label "Day" in night and flips on click; hamburger toggles `.open` and `aria-expanded` "false"/"true"; `aria-controls="mobile-menu"` and `#mobile-menu` exists; clicking a mobile link closes; mobile theme button toggles and closes, label "Switch to Night Mode"/"Switch to Day Mode"; Escape closes and focuses the hamburger; Escape while closed does nothing and no keydown listener is registered when closed.

#### UNIT-FOOTER

- **File:** `src/components/layout/Footer.jsx`  |  **ARC:** ARC-014
- **Interface:** `export default function Footer()`.
- **Behaviour:** `<footer><Icon name="developer_board" size={14} />{FOOTER_TEXT}<Icon name="developer_board" size={14} /></footer>`.
- **Traces:** FR-GEN-004, NFR-A11Y-003. **Unit tests:** footer text excluding icon spans equals `FOOTER_TEXT`; 2 aria-hidden icons.

#### UNIT-DIVIDER

- **File:** `src/components/layout/Divider.jsx`  |  **ARC:** ARC-014
- **Interface:** `export default function Divider()`. **Behaviour:** `<div className="divider" />`.
- **Traces:** FR-GEN-001. **Unit tests:** class.

#### UNIT-SECTION_SLOT

- **File:** `src/components/layout/SectionSlot.jsx`  |  **ARC:** ARC-014 / ARC-015 (added unit)
- **Purpose:** Render one registry entry with error containment and, for lazy entries, Suspense with an anchor-preserving placeholder (SADS 4.4.4).
- **Interface:** `export default function SectionSlot({ entry })` (`entry: SectionEntry`, required).
- **Behaviour:**
  ```jsx
  const Comp = entry.component;
  const body = <Comp meta={entry} />;
  return (
    <ErrorBoundary key={entry.id} fallback={() => <SectionErrorFallback id={entry.id} />}>
      {entry.lazy ? <Suspense fallback={<SectionPlaceholder id={entry.id} minHeight={entry.minHeight} />}>{body}</Suspense> : body}
    </ErrorBoundary>
  );
  ```
  Module-private (not exported) helpers:
  - `SectionPlaceholder({id, minHeight})` -> `<div id={id} data-section={id} data-section-placeholder="" aria-busy="true" style={{ minHeight }} />`.
  - `SectionErrorFallback({id})` -> `<div id={id} data-section={id} className="section-wrap" role="alert"><p>This section failed to load.</p><button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>Reload page</button></div>`.
  Both keep `id` and `data-section`, so anchors and active-section tracking keep working (FR-GEN-005).
- **Dependencies:** `react` (`Suspense`), `components/ErrorBoundary.jsx` (8.1 D-05).
- **Traces:** FR-GEN-005, FR-GEN-007, NFR-RELI-001. ADR-005.
- **Unit tests (UT-SECTION_SLOT):** eager entry renders the component with `meta`; lazy entry with a never-resolving `lazy` shows the placeholder with id, `data-section`, `data-section-placeholder` and min-height; resolving shows the section; a rejected `lazy` import shows the fallback with id and the "Reload page" button (spy `window.location.reload`); a component that throws shows the fallback while a sibling slot still renders.

### 6.13 Error boundary

#### UNIT-ERROR_BOUNDARY

- **File:** `src/components/ErrorBoundary.jsx`  |  **ARC:** ARC-015
- **Interface:** `export default class ErrorBoundary extends Component` with props:

  | Prop | Type | Req | Default |
  |---|---|---|---|
  | fallback | `ReactNode \| (error: Error, reset: () => void) => ReactNode` | no | `<div role="alert">Something went wrong.</div>` |
  | onError | `(error: Error, info: { componentStack: string }) => void` | no | - |
  | children | node | yes | - |

- **Behaviour:** `state = { error: null }`; `static getDerivedStateFromError(error) { return { error }; }`; `componentDidCatch(error, info) { console.error("[ErrorBoundary]", error, info?.componentStack); this.props.onError?.(error, info); }`; `reset = () => this.setState({ error: null })`; `render()`: if `state.error` -> `typeof fallback === "function" ? fallback(state.error, this.reset) : (fallback ?? default)`; else `children`.
- **Errors:** an exception thrown by `onError` is caught and ignored (wrap in try/catch) so the fallback still renders.
- **Dependencies:** `react` (`Component`).
- **Traces:** FR-GEN-007, NFR-RELI-001. ADR-005, ADR-010.
- **Unit tests (UT-ERROR_BOUNDARY)** (silence `console.error` with a spy): children render normally; throwing child -> default fallback with `role="alert"`; node fallback; function fallback receives the error; `reset` re-renders children (after fixing the child); `onError` called once with error and info; `console.error` called.


### 6.14 Sections (container components)

Common contract for every section unit below:
- **Export:** default export, a component with **no props** (the section registry renders them without props).
- **Markup:** port the JSX of the corresponding function in the baseline `src/App.jsx` (commit `dd9a86d`) **verbatim**: same element tree, same `className`s, same `id` / `data-section` attributes, same text. Only these substitutions are allowed: (a) literals replaced by imports from `data/*` and `config/site.js`; (b) `Ms` → `Icon`, `SL` → `SectionLabel`, `ST` → `SectionTitle`, and the other primitives in 6.8 *only where they render byte-identical markup*; (c) the changes required by SRS v1.1 (single resume download filename `RESUME.downloadName`; `aria-hidden` on icon ligatures via `Icon`; Education from `data/education.js`).
- **Reveal:** elements keep their `reveal` / `d1..d4` classes; registration with the reveal observer is done by `useReveal` (UNIT-USE_REVEAL), so lazy-loaded sections are revealed when they mount (ADR-012).
- **Dependencies:** `data/*`, `config/site.js`, `components/ui/*`, `components/tech/*`, `components/widgets/*`, `hooks/*`. Never `context/` directly except via `useThemeContext` where the baseline used the theme.
- **Traces / tests:** FR-<AREA>-* of the section's area; UT cases render the section and assert the item counts, texts, link attributes and class names listed in the STP.

| Unit | File | Baseline function | Data | Notes |
|---|---|---|---|---|
| UNIT-HERO | `src/sections/Hero.jsx` | `Hero` (+ `HERO_ROLES`) | `data/profile.js` (roles, badges, bio, photo, stats), `config/site.js` | eager (not lazy); uses `useTypewriter`, `useParallax`, `Particles`, `Speedometer`; profile `<img>` keeps `width`/`height`/`decoding`, `onError` hides it |
| UNIT-ABOUT | `src/sections/About.jsx` | `About` | `data/profile.js` (about paragraphs, stats) | lazy |
| UNIT-EXPERIENCE | `src/sections/Experience.jsx` | `Experience` | `data/experience.js` | lazy; root stays a `<div>` |
| UNIT-SKILLS | `src/sections/Skills.jsx` | `Skills` | `data/skills.js` (categories + ISO strip highlights) | lazy; `SkillChip` / `TechIcon` |
| UNIT-PROJECTS | `src/sections/Projects.jsx` | `Projects` | `data/projects.js` | lazy |
| UNIT-DESIGN | `src/sections/Design.jsx` | `Design` (+ `DESIGN_CARDS`) | `data/design.js`; artwork via `UNIT-DESIGN_ART` | lazy; root stays a `<div>`; links `target="_blank" rel="noopener noreferrer"` |
| UNIT-EDUCATION | `src/sections/Education.jsx` | `Education` | `data/education.js` | lazy; formerly hard-coded markup (OBS-13) |
| UNIT-CERTIFICATIONS | `src/sections/Certifications.jsx` | `Certifications` | `data/certifications.js` | lazy; root stays a `<div>` |
| UNIT-RESUME | `src/sections/Resume.jsx` | `Resume` | `config/site.js` (`RESUME`), `data/profile.js` (resume preview) | lazy; root stays a `<div>`; **all** download links use `download={RESUME.downloadName}` |
| UNIT-CONTACT | `src/sections/Contact.jsx` | `Contact` | `data/contact.js` | lazy |

### 6.15 Styles

The baseline CSS template string (`App.jsx` lines 7–918 at `dd9a86d`) is moved **verbatim** into CSS files. Rule **order is preserved** because the cascade depends on it: each file is a *contiguous* slice and `index.css` imports them in order. No value changes.

| Unit | File | Baseline slice (by comment header) |
|---|---|---|
| UNIT-STYLE_TOKENS | `src/styles/tokens.css` | `NIGHT (default) THEME`, `DAY THEME` (custom properties) |
| UNIT-STYLE_BASE | `src/styles/base.css` | from `SMOOTH THEME TRANSITIONS` up to (excluding) `GRADIENT ORBS`: transitions, reset/globals, keyframes. Then append the new SRS v1.1 rules: `.skip-link` (visually hidden until `:focus`) and `:focus-visible` outline `2px solid var(--amber)` with `outline-offset: 2px` (NFR-A11Y-008/009) |
| UNIT-STYLE_COMPONENTS | `src/styles/components.css` | from `GRADIENT ORBS` up to (excluding) `HERO`: orbs, cursor glow, glass base, theme toggle, theme badge, nav |
| UNIT-STYLE_SECTIONS | `src/styles/sections.css` | from `HERO` to the end: hero, profile card, sections, reveal, about … iso strip, then `RESPONSIVE` and the reduced-motion block **last** |
| UNIT-STYLE_INDEX | `src/styles/index.css` | `@import` tokens, base, components, sections (in that order); imported once from `main.jsx` |

Fonts are loaded only by `index.html` (no `@import` of Google Fonts in CSS). Verification: a UT concatenates the four files and compares the normalized rule list with the baseline string (only the two appended rule groups may differ); QT parity screenshots confirm the cascade.
