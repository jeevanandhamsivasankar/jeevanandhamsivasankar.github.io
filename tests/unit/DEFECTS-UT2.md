# Unit-test defects, engineer UT2 (SWE.4)

Scope: UNIT-MAIN, APP, ui/*, tech/*, effects/*, widgets/*, layout/*, ERROR_BOUNDARY, sections/*, STYLE_*.
Run: `npx vitest run tests/unit/App.test.jsx tests/unit/main.test.jsx tests/unit/components tests/unit/sections tests/unit/styles`
Result: 296 test instances (it.each expanded), 285 pass, 11 fail (10 distinct UT IDs; UT-MAIN-004 reports twice because of a soft assertion). All 11 failures are kept per the STP; none is a test bug. `src/**` is untouched.

| # | UT ID | Unit | Expected (STP) | Actual | Suspected cause | Sev |
|---|---|---|---|---|---|---|
| D1 | UT-MAIN-004 | UNIT-MAIN (`src/main.jsx`) | Page fallback shows owner name, **title**, **email link**, resume link, reload button | Shows name, a generic message, reload button and resume link only. `OWNER_TITLE` and a `mailto:` link are missing | `pageFallback` incomplete; import `OWNER_TITLE`, `EMAIL` and render them | S3 |
| D2 | UT-BUTTON-006 | UNIT-BUTTON | An unknown/missing variant never renders `btn-undefined` | `<Button>` without `variant` gives class `btn btn-undefined`. (An unknown string such as "purple" renders `btn-purple` as the SUDS allows) | No default or guard for `variant`; default to `amber` or warn in dev | S4 |
| D3 | UT-TECH_ICON-002 | UNIT-ICON_STRATEGIES / TECH_ICON | `si` image has `loading="lazy"` and `decoding="async"` (ADR-014, NFR-PERF-002) | Neither attribute is set | `si` strategy omits them. SUDS 6.9 says "No `loading`/`decoding` attributes (parity; D-03)", so the STP and SUDS disagree. Resolve the spec, or add the attributes (no visual change) | S3 |
| D4 | UT-CURSOR_GLOW-003 | UNIT-CURSOR_GLOW | Several `mousemove` events in one frame produce one style write (rAF coalescing) | Each event writes `left` and `top` directly (3 writes for 3 events) | No rAF coalescing in the implementation. SUDS 6.10 and D-02 say "no rAF", so the STP and SUDS disagree | S4 |
| D5 | UT-CURSOR_GLOW-004 | UNIT-CURSOR_GLOW | Passive listener is removed and a pending rAF is cancelled on unmount | The listener is passive and removed. `cancelAnimationFrame` is never called, because no rAF is used | Same as D4 (spec conflict) | S4 |
| D6 | UT-PARTICLES-004 | UNIT-PARTICLES | Container or particles carry no semantics (`aria-hidden`) | `Particles` returns a bare fragment of `div.particle` with no `aria-hidden` on them or on a wrapper | Add `aria-hidden="true"` to each particle, or to a wrapper | S4 |
| D7 | UT-HERO-011 | UNIT-HERO | `.hero-rings` has `aria-hidden="true"` | `div.hero-rings` has no `aria-hidden` (the 4 `.hring` and 18 particles are present) | Add `aria-hidden="true"` to the decorative container (NFR-A11Y-004) | S4 |
| D8 | UT-NAV-005 | UNIT-NAV | Never renders a link for an entry with `showInNav:false` | `Nav` renders every item it receives. Filtering is done only in `App`, so `Nav items=[{id:'hero', showInNav:false}, ...]` renders `#hero` | SUDS 6.12 puts the filtering in App. Either the STP wording is wrong, or `Nav` should defensively filter `items.filter(i => i.showInNav !== false)` | S4 |
| D9 | UT-STYLE_BASE-005 | UNIT-STYLE_BASE | Appended `a:focus-visible, button:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px }` and `:focus:not(:focus-visible){outline:none}` after all baseline rules | `base.css` has a bare `:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px }`. There is no `a:`/`button:` selector and no `:focus:not(:focus-visible)` rule | CSS differs from the STP selectors. Functionally close, but not as specified | S4 |
| D10 | UT-STYLE_COMPONENTS-007 | UNIT-STYLE_COMPONENTS | `.skip-link` off-screen; `.skip-link:focus` on-screen with `z-index: 301` using theme tokens | The skip link is off-screen (`top:-64px`) and moves to `top:8px` on focus, but `z-index` is `10000`, not `301` | `base.css` has `z-index: 10000`. Align it to 301 (above the nav at 300) or amend the STP | S4 |
| D11 | UT-STYLE_COMPONENTS-008 | UNIT-STYLE_COMPONENTS | Every `backdrop-filter` has a matching `-webkit-backdrop-filter` (NFR-PORT-001) | 16 rules lack the prefixed twin: `.gauge-stat`, `.gauge-stack-tag`, `.btn-green`, `.ptag`, `[data-theme="day"] .exp-band`, `.exp-icon`, `.ski`, `.stag`, `.pico`, `.ptag2`, `.behance-card`, `.cert-ico`, `.edu-icon`, `.edu-tag`, `.iso-strip-icon`, `.iso-chip` | These were moved verbatim from the baseline, which also lacks the prefix. Add `-webkit-backdrop-filter` with the same value (no visual change on Chromium; fixes Safari <18) | S3 |

## Specification inconsistencies (not counted as code defects; tests written to pass on the cascade)

* STP places the reduced-motion block (UT-STYLE_BASE-001), `.reveal` and `.d1..d3` (UT-STYLE_BASE-003) and `.hring` sizes (UT-STYLE_COMPONENTS-005) in `base.css` or `components.css`. SUDS 6.15 and the implementation keep them in `sections.css`: reduced-motion last, `.reveal` in REVEAL, `.hring` in HERO. The tests therefore assert against the concatenated cascade (`tokens, base, components, sections`). The STP file attribution should be corrected.
* STP puts the skip link in `components.css` (UT-STYLE_COMPONENTS-007). SUDS and the implementation put it in `base.css`.
* STP names `UNIT-ICON_STRATEGIES-*`/`UNIT-TECH_ICON-002`, `UNIT-CURSOR_GLOW-003/004` (see D3 to D5). SUDS 6.9 and 6.10 and deviations D-02/D-03 describe the opposite behaviour.
* STP has no UT cases for UNIT-RICH_TEXT, UNIT-DESIGN_ART, UNIT-SECTION_SLOT, which SUDS defines (6.8, 6.11, 6.12). Tests were added from the SUDS "Unit tests" lines under `UT-RICH_TEXT-001..002`, `UT-DESIGN_ART-001..003`, `UT-SECTION_SLOT-001..005`. The STP should list these IDs.
* STP UT-SPEEDOMETER-001..005 name `speedAt`/`angleFor`/`arcPath` as if they live in `Speedometer.jsx`. They live in `src/lib/gauge.js` (UNIT-GAUGE; `speedAngle`/`rpmAngle` replace `angleFor`). The tests import them from there.
* Extra test `UT-STYLE_INDEX-002` (SUDS 6.15 parity): the concatenated CSS contains every baseline rule in the same order; only skip-link/focus rules are added. It passes.

## Fixtures and helpers added

* `tests/fixtures/baseline-css.txt`: baseline CSS template from `git show dd9a86d:src/App.jsx` (lines 7-916).
* `tests/fixtures/baseline-custom-svgs.json`: baseline `CUSTOM_SVGS` markup rendered at colour `#abc123`, size 22.
* `tests/utils/css.js`, `tests/utils/styleNorm.js`, `tests/utils/manualRaf.js`: postcss helpers, jsdom style normalisation plus section frame asserts, deterministic rAF.

## Lint

`npx eslint tests/unit tests/utils`: clean for UT2 files. Remaining reports belong to the other engineer: `tests/unit/context/ThemeContext.test.jsx` (3 `react-hooks/refs`/`globals` errors) and `tests/unit/hooks/useTheme.test.js` (1 unused-disable warning).
