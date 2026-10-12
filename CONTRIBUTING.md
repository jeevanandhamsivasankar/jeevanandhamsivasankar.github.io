# Contributing

## Process

Work is organised in Agile sprints; each user story (`US-NNN`) follows the V-model:

1. Specify: SRS (requirements) -> SADS (architecture) -> SUDS (unit design) -> STP (test cases and traceability).
2. Implement against SUDS.
3. Verify: unit (SWE.4) -> integration (SWE.5) -> qualification (SWE.6).
4. Test/fix loop: failures are recorded as `DEF-NNN` in `docs/TEST_REPORT.md` and fixed in code. Never weaken or skip a test unless the test contradicts the SRS, and record that.

### Definition of Done

- Requirement, design and STP entries updated and traceable.
- `npm run lint`, `npm test`, `npm run build` and `npm run test:qualification` pass.
- Coverage thresholds met (>= 90% lines for models/lib/hooks, >= 80% overall).
- No open S1/S2 defects; S3/S4 triaged.
- Docs and CHANGELOG updated; PR reviewed and CI green.

## ID conventions

| Prefix | Meaning |
|---|---|
| `FR-<AREA>-NNN`, `NFR-<AREA>-NNN` | Functional / non-functional requirement (SRS) |
| `ARC-*`, `ADR-NNN` | Architecture element / decision (SADS) |
| `UNIT-<UPPER_SNAKE>` | Unit from file base name, e.g. `useTheme.js` -> `UNIT-USE_THEME`; data files get `DATA_`, CSS files `STYLE_` |
| `UT-<UNIT suffix>-NNN`, `IT-NNN`, `QT-NNN` | Unit / integration / qualification test |
| `DEF-NNN` | Defect |
| `US-NNN` | User story |

Test file layout: `tests/unit/<path mirroring src>/<File>.test.js[x]`, `tests/integration/<topic>.test.jsx`, `tests/qualification/<area>.spec.js`.

### Test-title ID rule

Every test title must start with its catalogue ID (for example `UT-SOLAR-016 ...`). IDs must be unique, in the form above (no suffixes like `003b`), and listed in `docs/STP.md`. `tests/stp-ids.json` is the machine-readable catalogue and IT-043 checks hygiene, so add new IDs to STP and regenerate the JSON.

## Branches and commits

- Branch from `main`: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, `test/<topic>`.
- Conventional commit prefixes: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`. Reference IDs (`DEF-012`, `FR-NAV-012`) in the body.
- Open a PR to `main`; merge only with CI green. Deploy afterwards with `npm run deploy`.

## Visual baselines

Visual regression compares against a capture of the original site. To refresh after an approved visual change (list it as an allowed difference in the STP/SRS first):

```bash
node tests/qualification/baseline/capture-baseline.mjs
```

Review the changed files under `tests/qualification/__baseline__/` and `tests/qualification/baseline/` in the PR.
