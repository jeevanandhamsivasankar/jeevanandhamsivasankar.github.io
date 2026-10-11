# SRS Product Owner Review (V-model requirements gate)

| Item | Value |
|---|---|
| Document reviewed | `docs/SRS.md` (SRS-PORTFOLIO-001) v1.0, result baselined as v1.1 |
| Reviewer | Product Owner |
| Review date | 2026-10-11 |
| Inputs | `docs/ARCHITECTURE_BRIEF.md`, baseline `src/App.jsx`, `index.html`, Software Architect notes from `docs/SADS.md` (ADR-011 and three runtime observations) |
| Verdict | **Approved with changes. SRS v1.1 is Baselined.** |

## 1 Review method

Each requirement was checked for correctness against the baseline code, value to a recruiter-facing audience, testability of the acceptance criterion, MoSCoW priority, ambiguity, duplication, conflicts and over-specification. Exact values (timings, colours, sizes) are accepted on purpose because this release has visual and behavioural parity as its acceptance bar.

Claims checked against `src/App.jsx`: nav 64/54 px and z-index 300, scroll thresholds (30 px, offset 140 px), 9 dividers, 58 skills in 9 categories, 30 custom SVG keys, typewriter timings, speedometer formulas (t = 0 gives 88 km/h and ≈ 4309.7 RPM), solar formula and windows, breakpoints, reduced-motion CSS, `download` attributes, the `Ms` primitive, `noscript` and `lang="en"`. All matched except the items listed as findings below.

## 2 Findings

| # | ID | Finding | Decision | Change made |
|---|---|---|---|---|
| F-01 | FR-HERO-004 | Acceptance said deletion starts "1800 ms later" than the full word (2005 ms). In the code the completion check runs one type tick later (2070 ms), so the first deletion is at 3870 ms. A test written to the old text would fail. | Correct the criterion | Acceptance now states 2070 ms check and 3870 ms first deletion. |
| F-02 | FR-HERO-007, FR-RES-003 | Three resume download links suggest two different filenames (Hero CTA and preview "Download" are bare `download`). A recruiter can end up with differently named copies. The SRS also missed that the preview link is bare. | Fix (OBS-12) | All three links use `download="Jeevanandham_SeniorHMIEngineer_Resume.pdf"`. Hero acceptance adds a download-event filename check. |
| F-03 | FR-THEME-002 | Day-of-year rolls over at about 12:00 IST (OBS-2). IST is derived via `getTimezoneOffset` and local getters, which can be off by 1 h near a DST change in the visitor's zone, contradicting NFR-PORT-003. | Fix (trivial in pure `lib/solar.js`) | Steps 1 and 2 respecified (UTC getters; IST calendar day rolling at 00:00). New acceptance cases for noon and midnight and DST proximity. |
| F-04 | FR-THEME-002 | (Architect, ADR-011) Longitude correction has the wrong sign: −0.1487 h instead of +0.1487 h, so the switch is about 18 min early. Fixing it is invisible except for the switch time and brings it closer to the real Chennai sunrise and sunset. | Fix (OBS-16) | Step 6 corrected. Acceptance windows recomputed: day 172 is 05:46 to 18:32, day 355 is 06:32 to 17:46 IST. A-3 updated. ADR-011 to be updated by the architect. |
| F-05 | FR-THEME-001 | (Architect) `data-theme` is applied in a passive effect after first paint, so day visitors can see a night frame. | Fix (OBS-17) | Requirement says the attribute is set before first paint. IT and QT checks added. |
| F-06 | FR-THEME-004, FR-THEME-003 | The override was session-only (OBS-3). Losing a chosen dark mode on reload is a small annoyance with a cheap fix. | Fix with `localStorage` (per-viewer convenience, guarded) | New FR-THEME-008. FR-THEME-003 and FR-THEME-004 reference it. |
| F-07 | FR-THEME-005 | The badge clock only updates when Nav re-renders, so it can show a stale time (OBS-4). The acceptance regex required a literal space before am/pm. | Fix (cheap) | Refresh at least every 60 s. Regex uses `\s`. Clock-advance QT added. |
| F-08 | FR-NAV-011, NFR-A11Y-007 | These are clear a11y defects (OBS-7) and cheap to fix, but were Should. Screen readers announce "rocket_launch View Projects" to recruiters using assistive tech. | Raise to Must | Priorities raised. NFR-A11Y-007 now makes `aria-hidden` the default in the Icon primitive and widens the acceptance. FR-NAV-002 acceptance clarified (textContent vs accessible text). |
| F-09 | — (new) | No way to dismiss the open mobile menu by keyboard. | Add as Could | New FR-NAV-012 (Escape closes the menu and returns focus). |
| F-10 | — (new) | No skip link. Keyboard users tab through 12 nav controls on every visit. | Add as Should | New NFR-A11Y-008 (visible only on focus, so parity is kept). |
| F-11 | NFR-A11Y-005 | Asks for a "visible focus indicator" but leaves the style to browser defaults, which are weak on the dark glass nav. | Specify the style | New NFR-A11Y-009 (`:focus-visible` amber outline, keyboard only). NFR-A11Y-005 references it and adds skip-link and mobile hamburger checks. |
| F-12 | EI-10 | The fallback for a missing IntersectionObserver was buried as a "Should" in an interface table, so it was not traceable. Without it, all reveal content stays invisible. | Promote to a requirement | New NFR-RELI-005. EI-10 references it. |
| F-13 | — (new) | (Architect) The speedometer re-renders about 60 times per second while hidden on mobile, off-screen, or in a background tab. This wastes battery on the main recruiter device class. | Fix, no visual change (OBS-18) | New NFR-PERF-006. |
| F-14 | NFR-USAB-003 | "At least 44 px … any shortfall is recorded" cannot fail, and 44 px would break parity (mobile menu links are about 37 px). | Make it testable | Pass/fail at 24 x 24 px (WCAG 2.2 SC 2.5.8 AA). 44 px is advisory and logged only. |
| F-15 | FR-GEN-003 | The statement said "every section … and an h2", then contradicted itself with the Resume exception. | Reword | Exception moved into the shall statement. Acceptance checks 9 labels in order and no h2 in `#resume`. |
| F-16 | NFR-MAINT-008 | The list of allowed deviations from parity did not cover the new fixes, so QT visual and text parity would conflict with them. | Update the list | Every enhancement and fix from this review is listed. |
| F-17 | OBS-11 | (Architect) `Ms` ignores `className`, so `.nav-link .ms`, `.btn .ms` and `.theme-btn:hover .ms` never apply. Activating them would change visuals. | Accept as-is (confirmed) | Appendix A records that the Icon primitive must not emit `ms` where the baseline did not. |
| F-18 | FR-GEN-008 vs FR-NAV-008, FR-HERO-014, FR-ABOUT-004, FR-PROJ-003, FR-CERT-002 | The responsive rules overlap. They are consistent, with no conflicts: FR-GEN-008 is the umbrella and the others give section-level detail. | Accept | None. |
| F-19 | NFR-A11Y-001 vs FR-FX-002, FR-FX-003 | Reduced-motion hiding of glow and particles is stated twice, consistently. | Accept | None. |
| F-20 | NFR-PORT-003 vs FR-THEME-002 | Time-zone independence is stated twice, consistently. F-03 makes it actually hold. | Accept | None. |
| F-21 | FR-GEN-010, FR-HERO-013, FR-FX-002, FR-FX-004 | Polish effects are Could. Visual regression (NFR-MAINT-008, Must) still guards their parity. | Accept the priorities | None. |
| F-22 | NFR-PERF-005 | Lighthouse ≥ 80 (mobile) as Should is appropriate. The 4 MB PDF is not loaded on page view. | Accept | None. |
| F-23 | — | Print stylesheet (OBS-19). Recruiters print the PDF, not the page. | Defer (backlog, Could) | Recorded in Appendix A only. No requirement added. |
| F-24 | OBS-10 | The mobile menu sits 10 px below the shrunken nav. Fixing it is a visual design change. | Defer (backlog) | Recorded in Appendix A. |

## 3 Appendix A (OBS) decisions

| OBS | Decision | Requirement |
|---|---|---|
| OBS-1 | Fix-in-this-release (superseded by OBS-16; comment corrected) | FR-THEME-002 |
| OBS-2 | Fix-in-this-release | FR-THEME-002 |
| OBS-3 | Fix-in-this-release (localStorage, guarded) | FR-THEME-008 |
| OBS-4 | Fix-in-this-release | FR-THEME-005 |
| OBS-5 | Fix-in-this-release | FR-FX-003 |
| OBS-6 | Fix-in-this-release | NFR-A11Y-002 |
| OBS-7 | Fix-in-this-release (raised to Must) | FR-NAV-011, NFR-A11Y-007 |
| OBS-8 | Fix-in-this-release (redesign) | FR-FX-005, NFR-RELI-005 |
| OBS-9 | Accept-as-is | — |
| OBS-10 | Defer | — |
| OBS-11 | Accept-as-is (confirmed with the architect) | NFR-MAINT-008 |
| OBS-12 | Fix-in-this-release | FR-HERO-007, FR-RES-002, FR-RES-003 |
| OBS-13 | Fix-in-this-release | FR-EDU-004 |
| OBS-14 | Accept-as-is | Section 4.2 |
| OBS-15 (new) | Fix-in-this-release | NFR-A11Y-008, NFR-A11Y-009, NFR-RELI-005 |
| OBS-16 (new, architect) | Fix-in-this-release | FR-THEME-002 |
| OBS-17 (new, architect) | Fix-in-this-release | FR-THEME-001 |
| OBS-18 (new, architect) | Fix-in-this-release | NFR-PERF-006 |
| OBS-19 (new) | Defer | — |

## 4 Change summary

- **Added (6):** FR-NAV-012 (Could), FR-THEME-008 (Should), NFR-PERF-006 (Should), NFR-A11Y-008 (Should), NFR-A11Y-009 (Should), NFR-RELI-005 (Should).
- **Modified:** FR-NAV-002, FR-NAV-011 (Should to Must), FR-HERO-004, FR-HERO-007, FR-RES-003, FR-THEME-001, FR-THEME-002, FR-THEME-003, FR-THEME-004, FR-THEME-005, FR-GEN-003, NFR-A11Y-005, NFR-A11Y-007 (Should to Must), NFR-USAB-003, NFR-MAINT-008. Also assumption A-3, interface EI-10 and Appendix A.
- **Requirement count:** 128 in total (81 FR, 47 NFR). By priority: 94 Must, 27 Should, 5 Could. Version 1.0 had 122.

## 5 Verdict and follow-ups

The SRS is complete, consistent with the baseline and testable at the qualification level. It is **Baselined at v1.1**. Downstream actions:

1. SADS: update ADR-011 (sign fixed) and add the decisions for pre-paint theme application (FR-THEME-001), theme persistence (FR-THEME-008) and the gauge visibility gate (NFR-PERF-006).
2. SUDS and STP: add units and test cases for the new and modified IDs. Recompute the expected solar windows in the unit tests. Extend the visual-regression allowlist per NFR-MAINT-008.
3. Backlog: OBS-10 (mobile menu offset) and OBS-19 (print stylesheet).
