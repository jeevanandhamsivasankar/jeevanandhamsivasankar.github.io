# Test Report — Release 1.0 (re-architecture)

References: `docs/STP.md`, defect logs `tests/unit/DEFECTS-UT1.md`, `tests/unit/DEFECTS-UT2.md`, `tests/integration/DEFECTS-IT.md`, `tests/qualification/DEFECTS-QT.md`, code review `docs/reviews/CODE_REVIEW_R1.md`.

## Round 1 results (before fixes)

| Level | Tests | Pass | Fail | Skipped |
|---|---|---|---|---|
| Unit (UT-1 + UT-2) | 655 | 636 | 19 | 0 |
| Integration | 43 | 36 | 7 | 0 |
| Qualification — desktop | 131 | 115 | 8 | 8 |
| Qualification — mobile | 131 | 65 | 1 | 65 (D/S-only cases) |

Visual parity vs baseline `dd9a86d` (QT-109..111): **pass** on desktop and mobile, day and night. DOM parity (IT-040): 1213 elements identical except the new skip link.

## Triage (Engineering Manager + Tech Lead decisions)

Rule: fix the code unless the test contradicts the baselined SRS/SUDS; spec conflicts are resolved in favour of the SRS, then SUDS, and the losing document is amended.

| DEF | Source | Finding | Severity | Decision |
|---|---|---|---|---|
| DEF-001 | UT-SOLAR-016..019, IT-006, QT-060 | `getSunPhase` uses minute resolution; second-level boundaries wrong | S3 | Fix code: second resolution |
| DEF-002 | UT-SOLAR-013 | Longitude correction applied after polar clamp (lat 80) | S4 | Fix code: clamp after correction |
| DEF-003 | UT-CREATE_MODELS-002 | `createPhoto` accepts width/height 0 | S4 | Fix code: positive numbers |
| DEF-004 | UT-MAIN-004, IT-016 | Page fallback lacks job title and mailto link | S3 | Fix code |
| DEF-005 | UT-BUTTON-006 | `Button` without variant renders `btn-undefined` | S3 | Fix code: default variant per SUDS |
| DEF-006 | UT-TECH_ICON-002 | `si:` img lacks `loading="lazy"` `decoding="async"` (STP vs SUDS) | S4 | Fix code (harmless perf gain); amend SUDS |
| DEF-007 | UT-CURSOR_GLOW-003/004, UT-USE_ACTIVE_SECTION-007/010 | No rAF coalescing / cancel (STP vs SUDS) | S4 | Fix code: coalesce pointer/scroll work with rAF, cancel on unmount; amend SUDS |
| DEF-008 | UT-PARTICLES-004, UT-HERO-011 | Particles and `.hero-rings` not `aria-hidden` | S3 | Fix code (NFR-A11Y-004) |
| DEF-009 | UT-NAV-005 | Nav does not filter `showInNav:false` | S4 | Fix code (defensive filter in Nav) |
| DEF-010 | UT-STYLE_BASE-005 | Missing `:focus:not(:focus-visible)` rule | S4 | Fix code |
| DEF-011 | UT-STYLE_COMPONENTS-007 | `.skip-link` z-index 10000, spec 301 | S4 | Fix code |
| DEF-012 | UT-STYLE_COMPONENTS-008, QT-112 | 16 `backdrop-filter` without `-webkit-` prefix | S4 | Fix code (Safari support, NFR-PORT-001); add to allowed CSS differences |
| DEF-013 | IT-025 | Mobile-menu links never `.active` | S3 | Fix code |
| DEF-014 | IT-038, QT-103, CR-002 | 5–6 imports outside the SADS 4.3.2 table | S4 | Amend SADS table (config→models, lib/storage→config constants, App→hooks, layout→ErrorBoundary, main→config are legitimate); align IT-038/QT-103 rule tables |
| DEF-015 | IT-041, CR-003 | No build-time CSP meta (ADR-013) | S3 | Fix code: Vite build-only plugin; allow self, Google Fonts, cdn.simpleicons.org, inline styles |
| DEF-016 | IT-042, QT-106 | No coverage thresholds | S4 | Fix config: ≥90% lines models/lib/hooks, ≥80% overall |
| DEF-017 | IT-043 | Test ID hygiene: `UT-THEME_CONTEXT-003b`, duplicate `UT-RANDOM-004`, 27 UT IDs missing from STP | S4 | Fix tests; add missing IDs to STP catalogue; regenerate `tests/stp-ids.json` |
| DEF-018 | QT-107 | Typedef names `GaugeStat`/`Section`/`ResumeInfo` missing | S4 | Fix code: add typedef aliases |
| DEF-019 | QT-006 | At page bottom "Resume" active instead of "Contact" | S3 | Fix code: when scrolled to bottom, activate last section |
| DEF-020 | QT-008, QT-113 | With icon font unavailable, ligature text widens nav → horizontal overflow at 390 px | S2 (NFR-RELI-002) | Fix code: `Icon` box fixed to `size`×`size`, `overflow:hidden` (no visual change when font loads) |
| DEF-021 | QT-093 | Contrast `.exp-company-loc` 2.39:1, `.contact-loc` 2.4–2.6:1 | S2 (NFR-A11Y-006) | Fix code: use a token meeting 4.5:1 in both themes; add to allowed visual differences |
| DEF-022 | CR-001 | Sections ignore registry `meta` (labels/titles hard-coded) | S3 | Fix code: sections read `meta`; amend SUDS 6.14 |
| — | UT-SOLAR-025 | STP expects TypeError; SUDS fails safe to `night` | — | SUDS wins; test already follows SUDS |
| — | QT notes | STP statements not matching baseline markup (chip counts, link counts) | — | Tests adjusted to baseline; STP amended |

## Round 2 results (after fixes) — 2026-10-12

| Level | Tests | Pass | Fail | Skipped |
|---|---|---|---|---|
| Lint | — | clean | 0 | — |
| Unit + Integration (Vitest) | 700 | 700 | 0 | 0 |
| Qualification (Playwright, desktop + mobile) | 262 | 188 | 0 (1 flaky, passes on re-run) | 73 (viewport-specific / declared manual gates) |
| Build | — | OK | — | — |

All DEF-001..022 verified fixed. Coverage thresholds met (≥90% lines models/lib/hooks, ≥80% overall).

**Visual baseline update (approved by repository owner, 2026-10-12):** DEF-020 makes each Icon a fixed size×size box. With the icon font blocked in the test environment, ligature names are now clipped instead of laid out as text, so the hero CTA row no longer wraps (hero 800 px vs 835 px). Reviewed side by side; no difference when the icon font loads. The 51 PNGs exceeding tolerance were re-captured through the QT-109/110 capture path; DOM snapshots unchanged. Previous baseline: `dd9a86d`.

**Known flake:** QT-109 `about` section (desktop) occasionally differs by ~0.10% (limit 0.10%) from backdrop-filter rasterisation jitter; the test re-captures twice before judging and passed on re-run.

**Exit criteria (STP §1): met.**
