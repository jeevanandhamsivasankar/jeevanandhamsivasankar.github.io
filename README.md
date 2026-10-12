# S. Jeevanandham — Portfolio

Personal portfolio of **S. Jeevanandham**, Senior HMI Engineer (Qt/QML, Embedded C++, automotive and medical device HMI).

**Live site:** https://jeevanandhamsivasankar.github.io

Built with React 19 and Vite 7. Features a day/night theme that follows Chennai sunrise and sunset (computed in IST), an animated hero gauge, and sections for experience, skills, projects, design work, education, certifications and resume. Developed with a V-model + Agile process; see [CONTRIBUTING.md](CONTRIBUTING.md).

## Architecture

Layered modules (dependencies point downward):

```
config / data / models   domain: site + section registry, content, model factories
hooks / context          application state: useTheme, useReveal, ThemeContext ...
components / sections    presentation: ui, layout, tech, effects, widgets, sections
App.jsx                  composition root (src/main.jsx mounts it)
lib/                     pure helpers: solar, gauge, random, storage
styles/                  tokens, base, components, sections CSS
```

Patterns used:

- **Section registry**: `src/config/sections.js` drives both `App` and `Nav`; adding a section is one registry entry.
- **Model factories**: `src/models/createModels.js` builds frozen, validated content objects; `src/data/*.js` use them.
- **Theme provider**: `ThemeProvider` / `useThemeContext` (React Context) instead of prop drilling.
- **Strategy icons**: `src/components/tech/iconStrategies.js` resolves tech icons by prefix: `si:` (Simple Icons CDN), `svg:` (custom SVG registry) and `ms:` (Material Symbols), falling back to a generic icon.
- **Lazy sections**: below-the-fold sections use `React.lazy` + `Suspense`; Hero and Nav are eager.
- **Error boundary**: `ErrorBoundary` isolates a failing section from the rest of the page.
- Custom hooks encapsulate side effects (IntersectionObserver, rAF, timers); logic lives in pure functions.

## Documentation

| Document | Purpose |
|---|---|
| [docs/ARCHITECTURE_BRIEF.md](docs/ARCHITECTURE_BRIEF.md) | Goals, module layout, patterns, process, ID conventions |
| [docs/SRS.md](docs/SRS.md) | Software requirements (FR/NFR), v1.1 baselined |
| [docs/SADS.md](docs/SADS.md) | Architecture design (ARC, ADR) |
| [docs/SUDS.md](docs/SUDS.md) | Unit design (UNIT-*) |
| [docs/STP.md](docs/STP.md) | Test plan, test catalogue, traceability |
| [docs/TEST_REPORT.md](docs/TEST_REPORT.md) | Test results, defects (DEF-*) and triage |
| [docs/reviews/](docs/reviews) | PO review of the SRS, Tech Lead code review |
| [docs/design/](docs/design) | Visual media spec, tokens, assets, prototypes |
| [docs/release/](docs/release) | Release notes and PR body for 1.0 |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server at http://localhost:5173 |
| `npm run lint` | ESLint |
| `npm test` | Unit + integration tests (Vitest) |
| `npm run test:coverage` | Vitest with coverage thresholds |
| `npm run test:qualification` | Playwright qualification tests (Chromium) |
| `npm run test:all` | lint + test + test:qualification |
| `npm run build` | Production build into `dist/` |
| `npm run deploy` | Publish `dist/` to `gh-pages` |

## Test levels

| Level | ASPICE | Tool | Location | IDs |
|---|---|---|---|---|
| Unit | SWE.4 | Vitest + Testing Library | `tests/unit/` (mirrors `src/`) | `UT-<UNIT>-NNN` |
| Integration | SWE.5 | Vitest + Testing Library | `tests/integration/` | `IT-NNN` |
| Qualification | SWE.6 | Playwright | `tests/qualification/` | `QT-NNN` |

CI (`.github/workflows/ci.yml`) runs lint, tests, build and qualification tests on every PR and on push to `main`.

## Editing content

Content lives in `src/data/*.js` (profile, experience, skills, projects, design, education, certifications, contact). Each file builds its entries through the model factories in `src/models/`, which validate shape at load time. Edit the data, run `npm test`, done. Section order and labels are in `src/config/sections.js`; site-wide constants in `src/config/site.js`. Static assets (favicon, photo, resume PDF) are in `public/`.

## Deployment

GitHub Pages serves the `gh-pages` branch:

```bash
npm run test:all
npm run build
npm run deploy
```
