# Unit-test defect list: Engineer UT1 (SWE.4)

Scope: UNIT-CONFIG_*, UNIT-MODELS_INDEX (STP: UNIT-INDEX), UNIT-TYPES, UNIT-VALIDATE, UNIT-CREATE_MODELS, UNIT-DATA_*, UNIT-SOLAR, UNIT-RANDOM, UNIT-STORAGE, UNIT-GAUGE, UNIT-USE_*, UNIT-THEME_CONTEXT.
Run: 359 tests, 351 pass, 8 fail. Failing tests are left exactly as specified in docs/STP.md section 4. `src/**` was not modified.

## Code defects and spec conflicts (failing tests)

| ID | UT ID | Unit | Expected (STP) | Actual | Suspected cause |
|---|---|---|---|---|---|
| DEF-UT1-001 | UT-SOLAR-016, UT-SOLAR-017, UT-SOLAR-018, UT-SOLAR-019 | UNIT-SOLAR (`src/lib/solar.js`, `getSunPhase`) | Sub-minute boundaries: day 172 00:15:40Z night / 00:15:55Z day / 13:02:00Z day / 13:02:10Z night; day 355 01:02:00Z night / 01:02:10Z day / 12:15:40Z day / 12:15:55Z night; instant equal to start (rounded up to the ms) is `day`, 1 ms earlier is `night`; instant equal to end is `night`, 1 ms earlier is `day`. | `getSunPhase` compares `hours + minutes/60` from `toIst`, which drops seconds and milliseconds. 00:15:55Z (IST 05:45:55) gives `night` (5.75 < 5.7631). 13:02:10Z (IST 18:32:10) gives `day`. The start/end instants at ms resolution also fail. | STP/SUDS conflict. SUDS (UNIT-SOLAR unit tests, item 4) says "start boundary inclusive / end exclusive at minute resolution"; the code follows that. STP UT-SOLAR-016..019 require second/ms resolution. Either fix the code (use fractional hours incl. seconds/ms) or amend the STP. |
| DEF-UT1-002 | UT-SOLAR-013 | UNIT-SOLAR | Geo lat 80, day 172: always `day`. | `night` for IST 00:00 to about 00:08. `sunriseSunsetHours` clamps to {sunrise 0, sunset 24}, then `dayWindow` adds +0.1487 h, so the window is [0.149, 24.149) and `hourIST` never reaches 24. Day 355 (always `night`) passes. | The longitude correction is applied after clamping. The polar-day window should be clamped to [0, 24] after correction, or the STP expectation relaxed. Low severity (never occurs at Chennai latitude). |
| DEF-UT1-003 | UT-CREATE_MODELS-002 | UNIT-CREATE_MODELS (`createPhoto`, via `createProfile`) | `photo.width` / `photo.height` of 0 (non-positive) is rejected. | `0` is accepted. Negative numbers, strings and NaN are rejected correctly. | `createPhoto` uses `assertNonNegativeNumber`; a positive-number assertion is needed for width and height. |
| DEF-UT1-004 | UT-USE_ACTIVE_SECTION-007 | UNIT-USE_ACTIVE_SECTION (`useActiveSection`) | 5 scroll events in one frame give one `querySelectorAll("[data-section]")` measurement (rAF coalescing). | 5 measurements (one per scroll event, 5 `setActive` calls). | STP/SUDS conflict. SUDS section 6.6 and 8.1 D-01 state the handler runs on every scroll event with no rAF (baseline parity; the speedometer is the only rAF user). STP UT-USE_ACTIVE_SECTION-007 and -010 assume rAF coalescing. Resolve by amending the STP or adding rAF to the hook. |
| DEF-UT1-005 | UT-USE_ACTIVE_SECTION-010 (second test with this ID: "unmount cancels a pending rAF") | UNIT-USE_ACTIVE_SECTION | Unmount cancels a pending rAF (`cancelAnimationFrame` called). | Never called; no rAF is scheduled. The first test with this ID (listener removal) passes. | Same root cause as DEF-UT1-004. |

## Specification inconsistencies handled in the tests (tests pass; no code change needed)

- **UNIT-GAUGE**: STP section 4 has no UT-GAUGE catalogue (only SUDS section 6 lists UNIT-GAUGE tests). Tests use IDs `UT-GAUGE-001..012` in `tests/unit/lib/gauge.test.js`. Add the catalogue to STP section 4 or confirm these IDs. IT-043 (orphan guard) must accept them.
- **UNIT-MODELS_INDEX vs UNIT-INDEX**: STP uses `UNIT-INDEX` (UT-INDEX-001/002, "13 factories"); SUDS uses `UNIT-MODELS_INDEX` (UT-MODELS_INDEX-001) and defines 16 factories. `tests/unit/models/index.test.js` has UT-INDEX-001, UT-INDEX-002 and UT-MODELS_INDEX-001.
- **UT-SOLAR-025**: STP says "expected: TypeError", SUDS says invalid dates fail safe to `night` without throwing. The test follows SUDS (never throws; result is `day` or `night`).
- **UT-TYPES-001**: STP lists typedefs `GaugeStat`, `Section`, `ResumeInfo`; `types.js` (per SUDS) has `Stat`, `SectionEntry`, `ResumePreview`. The test accepts either name.
- **UT-CREATE_MODELS-024**: STP describes a "Highlight" as a text segment with emphasis; in code that is `createRichText` (`mark`), while `createHighlight` is the ISO 26262 card. The test covers both.
- **UT-USE_THEME-017**: the clock interval also fires every 60 s, so "no re-render" is asserted via React Profiler commits (clock tick = 1 commit, the unchanged-phase theme tick adds none). A raw render-function counter shows one extra function call for the no-op `setTheme`.
- **UT-USE_TYPEWRITER-007**: Vitest fake timers truncate fractional delays, so the 94.97 ms interval is asserted on the delay passed to `setTimeout`.

## Housekeeping

- A stray scratch file `/base.txt` (copy of baseline `App.jsx` used to verify text literals) was created at the filesystem root by mistake; the delete was blocked by the safety check. It is harmless and can be removed manually (`rm /base.txt`).
