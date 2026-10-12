# SRS v1.2 - Delta to v1.1 (Release 2.0 "Cockpit")

**Base:** `docs/SRS.md` v1.1 (SRS-PORTFOLIO-001) | **Date:** 2026-10-12 | **Author:** Product Owner
**Method:** the delta is merged into `docs/SRS.md` by the Test Engineer at sprint close. Table format as in v1.1 (`ID | Requirement | Pri | Rationale | Acceptance criterion | Ver`). FR-MEDIA-001..011 and NFR-MEDIA-001..009 are defined in `docs/design/VISUAL_MEDIA_SPEC.md` section 5 and are adopted here unchanged, except those listed below. Stories: `docs/sprint2/BACKLOG.md`.
**Global rules:** no invented facts, testimonials, metrics or project screenshots; brand hues and fonts unchanged.

## 1. New requirements

### 1.1 UX (FR-UX)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-UX-001 | `src/styles/tokens.css` shall define the semantic design tokens of `docs/design/tokens-v2.css` (surfaces, text, accent, signal colours, focus, type scale, spacing, radius, `--target-min`) for night (`:root`) and day (`[data-theme="day"]`). All v1 token names shall remain as aliases. Components shall reference tokens, not hard-coded hex. | Must | One source of truth; smooth migration | IT: token set present in both themes; each v1 name resolves; no hard-coded colour hex in `components.css`/`base.css`. | IT |
| FR-UX-002 | Brand identity shall be preserved: the amber, cyan, green, rose and violet signal values and the three font families shall equal v1.1; only text, border and focus values may change to meet contrast. | Must | Keep the look the owner approved | IT: night signal values equal v1.1; fonts unchanged. | IT |
| FR-UX-003 | The hero shall present exactly one primary CTA (filled) and one secondary CTA (outline) above the fold, using the existing CTA labels and targets; DOM and focus order shall be name, role, summary, primary CTA, secondary CTA, status. No new hero copy shall be introduced. | Must | Faster decision for a hiring manager | QT at 1366x800 and 390x844: one `.btn-primary`, one `.btn-secondary` visible without scrolling; labels equal v1.1; tab order as stated; IT: `profile.js` text unchanged. | QT, IT |
| FR-UX-004 | At widths <= 900 px the instrument cluster (FR-MOTION-003) shall be shown in a compact form below the hero text and shall not cause horizontal scroll. The profile card may remain hidden. | Should | Mobile visitors see the signature demo (PO decision, fallback: keep hidden) | QT at 390x844: cluster displayed, `scrollWidth <= clientWidth`, paused until in view. | QT |
| FR-UX-005 | Each project card shall be a case study with labelled rows Problem, Role, Solution, Impact, built only from statements supported by that project's existing `desc`, `domain`, `tags` and `period`. A row without a supported statement shall be omitted. Project 5 (NDA) shall show no OEM name, logo or screenshot. Each card shall contain one media slot (FR-MEDIA-012). | Must | Recruiters need outcomes, not tag lists; no invention | UT/IT: model accepts optional `caseStudy`; every statement is traceable; no digit or proper noun absent from existing text. QT: row order and omission behaviour. | UT, IT, QT |
| FR-UX-006 | All interactive elements shall show a visible keyboard focus indicator meeting 3:1 against adjacent colours, targets shall be at least `--target-min` on touch viewports, and the skip link and Escape-to-close behaviours of v1.1 shall be retained. | Must | Keyboard users; WCAG 2.4.7, 2.5.8 | QT: computed focus outline and size at both viewports and themes. | QT, IT |

### 1.2 Motion (FR-MOTION)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-MOTION-001 | `src/styles/motion.css` shall define duration tokens (`--dur-instant` 80 ms, `--dur-fast` 140 ms, `--dur-base` 220 ms, `--dur-slow` 360 ms, `--dur-deliberate` 600 ms, `--dur-theme` 360 ms, `--dur-intro-max` 1200 ms) and easing tokens (`--ease-standard`, `--ease-decel`, `--ease-accel`) taken from `docs/design/motion-prototypes/`. | Must | Consistent timing | IT: tokens exist with these values. | IT |
| FR-MOTION-002 | Transitions and animations outside `motion.css` and `tokens.css` shall use only `var(--dur-*)`/`var(--ease-*)` (documented looping keyframes excepted). Buttons, chips and cards shall give hover, focus and active feedback with `--dur-fast` / `--dur-instant`, animating only colour, opacity, box-shadow and transform. | Must | Uniform micro-interactions, GPU-friendly | IT: CSS scan for raw ms and layout properties; QT: button press scale and timing. | IT, QT |
| FR-MOTION-003 | The hero shall contain a code-generated instrument cluster ("HMI CLUSTER DEMO") with a speed needle and RPM needle driven by a damped-spring model (frame-rate independent, `dt` clamped to 50 ms, overshoot <= 3 %), a gear indicator with shift hysteresis, and a ticker of simulated CAN-style frames labelled "SIMULATED". It shall expose `role="img"` with an `aria-label`, use no media files, and keep per-frame state out of React state. It shall use only existing facts (no vehicle or customer data claims). | Must | Hero demonstrates HMI craft | UT: spring, clamp, hysteresis, ticker determinism with seeded RNG. QT: labels present, needles move in view. | UT, QT |
| FR-MOTION-004 | The cluster animation loop shall not schedule `requestAnimationFrame` while the cluster is out of the viewport, the document is hidden, or reduced motion is preferred; it shall resume from its current state when visible. | Must | Battery and main-thread time | UT/IT with mocked observers; QT: rAF counter 0 over 2 s off-screen and in a hidden tab; static frame under reduced motion. | UT, IT, QT |
| FR-MOTION-005 | An optional ignition intro (flag `SITE.intro`) shall play at most once per browser session (`sessionStorage` key `jsv-intro-played`), last <= 1200 ms, be skippable by key, pointer, wheel, touch or a labelled "Skip intro" button, and shall not run when reduced motion is preferred or storage is unavailable. It shall not delay interactivity and shall add no long task > 50 ms. | Could | First-impression craft without cost | UT: state machine. QT: first load plays, second load does not, skip works, reduced motion off, duration <= 1.2 s. | UT, QT |
| FR-MOTION-006 | Switching theme shall animate colour properties for `--dur-theme` through a transient `<html>` class removed on completion, with a toggle-icon rotation/scale of 220 ms; the first-paint theme (FR-THEME-001) shall never animate; rapid double toggles shall end in the last chosen theme with no stuck class. | Should | Backlight "illumination" feel | UT: class lifecycle. QT: transition present on toggle, absent on load, reduced motion instant. | UT, QT |
| FR-MOTION-007 | When `prefers-reduced-motion: reduce` is set, no Sprint 2 motion (cluster, intro, illumination, reveal, micro-interaction transforms, ambient video) shall run; all `--dur-*` shall resolve to 0.01 ms and the final static state shall be shown. | Must | WCAG 2.3.3; extends NFR-A11Y-002 | QT with emulated reduced motion: cluster text static for 3 s, no intro, instant theme, no reveal transform, `video.paused === true`. | QT, UT |

### 1.3 Media (FR-MEDIA)

FR-MEDIA-001..011 as in `docs/design/VISUAL_MEDIA_SPEC.md` section 5 (responsive profile `<picture>`; no large download when the card is hidden; OG card; icons and manifest; video poster/sources; ambient autoplay rules; captions and descriptions; decorative design art; production excludes placeholders; self-hosted skill icons [deferred, Could]; rights manifest). Added:

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-MEDIA-012 | A `MediaSlot` component shall render owner-supplied video or image from the media manifest (`src/data/media.js`) lazily (within one viewport or on play), with poster, intrinsic size, `playsinline`, `preload="none"`, captions where narrated, an accessible name and description, a keyboard-operable pause/play for clips > 5 s, and no autoplay under reduced motion. A video lacking required captions shall not render. | Must | Safe, accessible owner media | UT: props/validation/empty state. QT: no video bytes before scroll; paused under reduced motion; control reachable by keyboard. | UT, QT |
| FR-MEDIA-013 | A slot without an approved manifest item shall render the existing SVG/icon artwork in production; in development and preview (`import.meta.env.DEV` or `?placeholders=1`) it shall render the generated placeholder with the visible text "PLACEHOLDER - OWNER MEDIA". Placeholders shall never be described as real work. | Must | No fake screenshots | UT: both modes. IT: prod bundle has no `placeholder-` reference. QT: label visible in preview. | UT, IT, QT |

Changed from the spec: FR-MEDIA-010 deferred (Could, not in Sprint 2); FR-MEDIA-011 is enforced by the manifest validator (IT) in addition to PO review.

### 1.4 Non-functional

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| NFR-A11Y-010 | Every text/background pair in the token matrix shall have contrast >= 4.5:1 (>= 3:1 for large text, control borders, focus ring) in both themes; `--color-text-disabled` is exempt. | Must | WCAG 1.4.3, 1.4.11 | IT: contrast script over the matrix. | IT |
| NFR-A11Y-011 | The Sprint 2 site shall have 0 serious or critical axe violations at 1366x800 and 390x844 in both themes. | Must | Accessibility regression gate | QT: axe sweep. | QT |
| NFR-PERF-007 | The intro, cluster and transitions shall add no layout shift (CLS < 0.05) and no long task > 50 ms attributable to them; LCP shall not worsen by more than 100 ms versus the v1.1 baseline. | Should | Motion must not cost speed | QT: Lighthouse/PerformanceObserver. | QT |
| NFR-MAINT-009 | Visual conformance shall be judged against Sprint 2 approved baselines captured with `tests/qualification/baseline/capture-baseline.mjs`. A baseline may change only for a story that lists the change and after PO approval; text content snapshots shall be identical except for changes recorded in the story. | Must | Replaces NFR-MAINT-008 | QT visual regression within the STP threshold against new baselines; PO sign-off log. | QT, I |
| NFR-SEC-006 | No Sprint 2 feature shall add a third-party origin or a new runtime dependency; video and images are self-hosted. | Must | Keeps NFR-SEC-002 allowlist | QT: network origins within the allowlist; IT: `package.json` dependencies unchanged. | QT, IT |
| NFR-MEDIA-010 | CI shall run a media check that fails the build on any file above its budget (NFR-MEDIA-002), any `placeholder-*` in `dist/`, or any manifest item lacking `rightsConfirmed: true` and alt/description. | Should | Automates NFR-MEDIA-002/005, FR-MEDIA-009/011 | IT: script run on passing and failing fixtures. | IT, A |

## 2. Changed requirements (v1.1 -> v1.2)

| ID | Change |
|---|---|
| FR-HERO-008 | Centre column widget is the cluster of FR-MOTION-003; label "HMI CLUSTER DEMO" kept; the 3 mini-stats and 5 stack tags are retained exactly as v1.1 unless hero v2 layout moves them (text unchanged). |
| FR-HERO-011 | Profile image markup replaced by FR-MEDIA-001. |
| FR-HERO-014 | At <= 900 px the cluster is shown compact (FR-UX-004); profile column stays hidden; CTA stacking at <= 540 px unchanged; CTAs per FR-UX-003. |
| FR-HERO-001 | Layout grid may be re-proportioned by hero v2; the three content roles (text, cluster, profile card) and DOM order are unchanged; `1fr 360px 260px` no longer mandated. |
| FR-THEME-003, FR-THEME-004 | Token values follow FR-UX-001/002; colour transitions follow FR-MOTION-006. Theme semantics (night default, day by solar time, override) unchanged. |
| FR-PROJ-001..003 | Card content structure becomes FR-UX-005; period, domain, colours, tags and `wide` layout retained. |
| NFR-A11Y-002 | Extended to the cluster and all Sprint 2 motion via FR-MOTION-007. |
| NFR-SEO-002, NFR-SEO-003, EI-2, EI-9, NFR-DEPLOY-001 | Meta, icon and asset lists updated per FR-MEDIA-003/004 (OG card, ico, apple-touch, manifest). NFR-SEC-002 allowlist unchanged. |
| Section 1 scope text | "the animated speedometer widget" becomes "the instrument cluster widget". |

## 3. Superseded v1.1 requirements

| v1.1 ID | Disposition | Replaced by |
|---|---|---|
| FR-HERO-009 (speedometer SVG geometry: 260 viewBox, 250 deg sweep 0-180 km/h, RPM arc 0-8000, 19 ticks, needle 84) | Superseded | FR-MOTION-003 |
| FR-HERO-010 (rAF loop t += 0.006, speed and RPM formulas, static frame under reduced motion) | Superseded | FR-MOTION-003, FR-MOTION-004, FR-MOTION-007 |
| NFR-PERF-006 (speedometer loop paused when hidden/off-screen) | Superseded (scope moves to the cluster) | FR-MOTION-004, NFR-PERF-007 |
| NFR-MAINT-008 (visual and behavioural parity with the baseline) | Replaced | NFR-MAINT-009 (approved new baselines) |
| STP tests tied to the above (Speedometer unit test, speed-text QT, hero gauge baseline screenshots) | Retired or rewritten by the Test Engineer | UT-CLUSTER-*, QT-144..149 |

## 4. Traceability (story -> requirement)

US-201 FR-UX-001/002, NFR-A11Y-010, NFR-MAINT-009 | US-202 FR-MOTION-001/002/007 | US-203 FR-UX-006, NFR-A11Y-011 | US-204 NFR-MEDIA-010, NFR-MEDIA-002/005 | US-205 FR-MEDIA-001..004, NFR-MEDIA-001/003/004 | US-206 FR-UX-003, FR-HERO-014 | US-207 FR-MOTION-003/004, FR-UX-004 | US-208 FR-MOTION-005 | US-209 FR-MOTION-006 | US-210 FR-MOTION-002/007 | US-211 FR-UX-005 | US-212 FR-MEDIA-005..007/012/013, NFR-SEC-006 | US-213 FR-MEDIA-008/009.

## 5. Open decisions (PO)

Q-S2-1 mobile compact cluster (FR-UX-004). Q-S2-2 ship intro enabled or flagged off (FR-MOTION-005). Q-S2-3 owner media and rights for any screenshot or video (none assumed).
