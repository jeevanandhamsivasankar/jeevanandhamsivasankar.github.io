# Sprint 2 Backlog (Release 2.0 "Cockpit")

**Product:** Portfolio of S. Jeevanandham, Senior HMI Engineer | **Owner/Lead Designer:** Product Owner | **Date:** 2026-10-12
**Process:** Agile sprint, V-model per story (requirement -> design -> code, then UT -> IT -> QT -> acceptance against the same SRS ID).
**Requirements:** `docs/sprint2/SRS_v1.2_DELTA.md`. **Design inputs:** `docs/design/VISUAL_MEDIA_SPEC.md`, `docs/design/tokens-v2.css`, `docs/design/prototypes/hero-v2.html`, `docs/design/motion-prototypes/*`, `docs/design/assets/*`.
**Test ID continuation:** QT-131+, IT-044+, UT-<UNIT>-NNN (v1.1 ended at QT-130 / IT-043).

## 0. Ground rules for every story

- **No invented content.** All text comes from existing `src/data/*` and `src/config/*`. No testimonials, metrics, client names, project screenshots or claims. Anything not already a fact in the repo is rendered as an owner-media slot (US-212) or omitted.
- **Placeholders** (`docs/design/assets/placeholders/*`) are dev/preview only, always visibly labelled "Placeholder - owner media", and must not appear in the production build (FR-MEDIA-009).
- Motion is code-generated (SVG/CSS/WAAPI, no video, no new runtime dependency). Reduced motion = static, no autoplay (FR-MOTION-007).
- Brand hues unchanged: amber `#f59e0b`, cyan `#22d3ee`, green `#34d399`, rose `#fb7185`, violet `#a78bfa`; fonts unchanged.
- Visual baselines change only where a story says so; new baselines are captured with `tests/qualification/baseline/capture-baseline.mjs` and approved by the PO.
- Existing v1.1 tests invalidated by an intended change (e.g. `Speedometer.test.jsx`, `projects` byte-identity) are updated by the Test Engineer only (section 3).

## 1. Prioritised stories

Priority order = delivery order within the sprint. Total **55 points**.

### US-201 - Design tokens v2 (contrast-safe, brand kept)  |  Must  |  5 pts  |  Dev-1
As a **recruiter** on a laptop in bright daylight, I want every line of text and every control outline to be clearly legible in both themes, so that I can read the profile without strain and the brand look is unchanged.
- **AC1** Given `src/styles/tokens.css`, when parsed, then it defines the semantic tokens of `docs/design/tokens-v2.css` (`--color-*`, `--sig-*`, type scale, spacing, radius, `--target-min`) for night (`:root`) and `[data-theme="day"]`, and every v1 name (`--bg`, `--text2`, `--amber`, ...) still resolves as an alias (IT).
- **AC2** Given every text/background pair listed in the token header, when the contrast script computes WCAG ratios, then each pair is >= 4.5:1 (>= 3:1 for large text, control borders and focus ring) in both themes (IT).
- **AC3** Given brand accents, when compared with v1.1, then amber/cyan/green/rose/violet night values are identical (IT) and Playwright at 1366x800 shows no hard-coded hex in `src/styles/{components,base}.css` outside tokens (IT grep).
- **AC4** Given meta text previously `#475569` on dark, when rendered, then computed colour is `--color-text-3` (>= 5:1) (QT at 1366x800 night + day).
- **Files:** `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/components.css`, `src/styles/index.css` (also adds import lines for all new Sprint 2 stylesheets as empty stubs on day 1: `motion.css`, `hero.css`, `cluster.css`, `intro.css`, `theme-transition.css`, `projects.css`, `media.css`).
- **Tests:** IT-044 (token set and aliases), IT-045 (contrast matrix both themes), QT-131 (computed colour of meta text, secondary buttons, chips both themes), QT-132 (visual baseline re-capture, PO approval).
- **SRS:** FR-UX-001, FR-UX-002, NFR-A11Y-010, NFR-MAINT-009. **Deps:** none (unblocks everything; stubs delivered day 1).

### US-202 - Motion tokens and consistent micro-interactions (foundation)  |  Must  |  3 pts  |  Dev-1
As a **peer engineer**, I want hover, press and focus feedback to feel uniform across buttons, chips and cards, so that the UI reads as one engineered system.
- **AC1** Given `src/styles/motion.css`, when parsed, then it defines `--dur-instant:80ms; --dur-fast:140ms; --dur-base:220ms; --dur-slow:360ms; --dur-deliberate:600ms; --dur-theme:360ms; --dur-intro-max:1200ms` and `--ease-standard`, `--ease-decel`, `--ease-accel` (values copied from `docs/design/motion-prototypes/*`) (IT).
- **AC2** Given `src/styles` outside `motion.css`/`tokens.css`, when scanned, then no `transition`/`animation` uses a raw ms value (only `var(--dur-*)`), except documented keyframe loops (IT).
- **AC3** Given a `.btn`, when hovered / pressed, then it transitions with `--dur-fast` and scales to 0.96-0.98 on `:active` with `--dur-instant` (QT).
- **AC4** Given `prefers-reduced-motion: reduce`, when the page loads, then all `--dur-*` resolve to 0.01ms and no element keeps a running CSS animation except those exempted by a documented list (QT).
- **AC5** Given `src/lib/motion.js`, when `motionMs(token)` is called with reduced motion true/false, then it returns 0 / the token's value (UT).
- **Files:** `src/styles/motion.css` (new), `src/styles/components.css`, `src/components/ui/Button.jsx`, `src/components/ui/Badge.jsx`, `src/lib/motion.js` (new).
- **Tests:** UT-MOTION-001..003, IT-046 (token defs), IT-047 (no raw ms scan), QT-133 (button feedback + reduced-motion resolve).
- **SRS:** FR-MOTION-001, FR-MOTION-002, FR-MOTION-007. **Deps:** US-201 (imports).

### US-203 - Accessibility polish for keyboard users  |  Must  |  3 pts  |  Dev-1
As a **keyboard user**, I want a clear focus ring, a working skip link, predictable tab order and large-enough targets, so that I can navigate the whole page without a mouse.
- **AC1** Given any interactive element, when focused by keyboard, then a 2px `--color-focus` outline with halo is visible and has >= 3:1 against the adjacent background in both themes (QT).
- **AC2** Given the page, when Tab is pressed once, then the skip link is visible and activates `#main`; every nav link, theme button and mobile-menu item has a hit area >= `--target-min` (44px on touch viewports) (QT at 390x844 and 1366x800).
- **AC3** Given the mobile menu is open, when Escape is pressed, then it closes and focus returns to the hamburger (regression of FR-NAV-012) and Tab cycles within the menu (QT).
- **AC4** Given the Sprint 2 pages, when axe runs at both viewports and both themes, then 0 serious/critical violations (QT).
- **Files:** `src/styles/base.css`, `src/components/layout/Nav.jsx`, `src/components/layout/Footer.jsx`, `src/hooks/useActiveSection.js`, `src/hooks/useScrolled.js`, `src/hooks/usePrefersReducedMotion.js`.
- **Tests:** QT-134 (focus ring contrast + visibility), QT-135 (skip link, target sizes), QT-136 (axe full sweep 2 viewports x 2 themes), IT-048 (focus-visible rule present, no `outline:none` without replacement).
- **SRS:** NFR-A11Y-011, NFR-A11Y-008/009 (retained), FR-UX-006. **Deps:** US-201.

### US-204 - Media budgets and manifest validation in CI  |  Should  |  3 pts  |  Dev-1
As a **mobile visitor** on a slow connection, I want the site's media to stay inside agreed size budgets, so that the page loads fast.
- **AC1** Given a built `dist/`, when `node scripts/check-media-budget.mjs` runs, then it fails (exit 1) if any file exceeds its budget (portrait 600w AVIF > 35 KB, OG JPEG > 150 KB, OG PNG > 300 KB, video > 4 MB, poster > 60 KB) and passes on the Sprint 2 assets (UT + IT).
- **AC2** Given `dist/`, when scanned, then no file path contains `placeholder-` and no image has GPS/EXIF tags (IT; FR-MEDIA-009, NFR-MEDIA-005).
- **AC3** Given `src/data/media.js` (US-212), when validated, then each entry has `rightsConfirmed: true` and non-empty `alt`/`description` (IT).
- **AC4** Given CI, when the workflow runs, then this script runs after `npm run build` and its failure blocks deploy.
- **Files:** `scripts/check-media-budget.mjs` (new), `package.json` (script `check:media`), `.github/workflows/*.yml`.
- **Tests:** UT-MEDIABUDGET-001..002, IT-049 (budget script on fixtures), IT-050 (dist has no placeholder / metadata).
- **SRS:** NFR-MEDIA-002, NFR-MEDIA-005, FR-MEDIA-009, FR-MEDIA-011. **Deps:** US-205 (assets), US-212 (manifest schema).

### US-205 - Responsive images, OG card, favicon and manifest  |  Must  |  3 pts  |  Dev-2
As a **recruiter** sharing the link in chat, I want a correct preview card and a crisp tab icon, and as a **mobile visitor** I want only the small image variant downloaded.
- **AC1** Given the hero profile card, when rendered, then it is `<picture>` with AVIF and WebP `srcset` at 300/450/600/900w, `sizes` per spec, and a WebP `<img alt="S. Jeevanandham" width="600" height="900" decoding="async">`; at 1366x800 DPR1 `currentSrc` ends `-300.avif`, DPR2 `-450.avif` (QT, FR-MEDIA-001).
- **AC2** Given 390x844 (card hidden), when the network log is read, then no profile request > 25 KB and none of the 600w/900w files (QT, FR-MEDIA-002).
- **AC3** Given `index.html`, when parsed, then it declares `og:image`(`/og-card.jpg`) + width 1200/height 630/alt/type, `twitter:card=summary_large_image`, `twitter:image`, `<link rel=icon>` svg + ico + 32px, `apple-touch-icon` 180, `<link rel=manifest href=/site.webmanifest>`; `GET` of each URL is 200 with the right type; manifest icons 192/512/maskable 512 resolve at declared sizes (QT + IT).
- **AC4** Given the CSP/allowlist (NFR-SEC-002), when the page loads, then no new third-party origin appears (QT).
- **Files:** `index.html`, `public/img/profile-{300,450,600,900}.{avif,webp}` (copied from `docs/design/assets/profile/`), `public/og-card.jpg`, `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`, `public/icon-{192,512,maskable-512}.png`, `public/site.webmanifest` (from `docs/design/assets/icons/`, `social/`), `src/sections/Hero.jsx` (picture markup only; hero layout is US-206).
- **Tests:** QT-137 (srcset selection DPR1/DPR2), QT-138 (mobile no large profile download), QT-139 (OG/meta/manifest resolve), QT-140 (no layout shift: CLS < 0.05), IT-051 (markup contract), IT-052 (favicon.svg has no `<text>`).
- **SRS:** FR-MEDIA-001..004, NFR-MEDIA-001, NFR-MEDIA-003, NFR-MEDIA-004, NFR-SEO-002/003 (changed). **Deps:** none (Hero.jsx edits sequenced before US-206 within Dev-2).

### US-206 - Hero v2: clearer hierarchy and CTA priority  |  Must  |  5 pts  |  Dev-2
As a **hiring manager** with 10 seconds, I want the name, role and one obvious next action to stand out, so that I can decide quickly to open the resume or contact.
- **AC1** Given the hero at 1366x800, when loaded, then exactly one primary CTA (existing first CTA, filled amber) and one secondary CTA (existing second CTA, outline) are visible above the fold; labels and targets are unchanged from v1.1 (FR-HERO-005..007) (QT).
- **AC2** Given the h1/typewriter/summary, when read in DOM order, then order is name, role/typewriter, summary, CTAs, status; the status badge ("open to opportunities") remains and uses `--color-success` (QT, text snapshot unchanged except removed/moved nodes listed in the PO-approved diff).
- **AC3** Given 390x844, when loaded, then h1 + CTAs fit above the fold (CTA bottom <= 844 px) and CTAs are full width stacked (QT; supersedes part of FR-HERO-014).
- **AC4** Given the hero, when Tab is pressed, then focus order is primary CTA, secondary CTA, then the rest; both have visible focus (QT).
- **AC5** Given no new copy is introduced, when `src/data/profile.js` text is diffed, then it is unchanged (IT).
- **Files:** `src/sections/Hero.jsx`, `src/styles/hero.css` (new), `src/hooks/useTypewriter.js`, `src/hooks/useParallax.js`.
- **Tests:** QT-141 (CTA hierarchy + labels), QT-142 (mobile above-the-fold), QT-143 (focus order), IT-053 (profile data unchanged / hero text snapshot).
- **SRS:** FR-UX-003, FR-UX-004, FR-HERO-014 (changed). **Deps:** US-201, US-205 (Hero.jsx order).

### US-207 - Instrument cluster v2 replaces the speedometer  |  Must  |  8 pts  |  Dev-2
As a **peer engineer**, I want a believable instrument cluster (damped needle, gearbox indicator, simulated CAN ticker) rendered entirely in code, so that the hero itself demonstrates HMI craft.
- **AC1** Given the hero at 1366x800, when loaded, then `.hero-center` contains an `svg`-based cluster with speed and RPM needles, a gear indicator and a ticker, labelled "HMI CLUSTER DEMO", and the visible ticker carries the label "SIMULATED" (QT; no real vehicle data claimed).
- **AC2** Given the physics function `stepNeedle(state, target, dt)`, when called with dt = 16 ms, then the needle follows a critically/under-damped spring, never overshoots beyond a configured 3 %, is frame-rate independent (same result for 2x8 ms vs 1x16 ms within 1 %), and `dt` is clamped to 50 ms (UT).
- **AC3** Given the gear logic, when speed crosses the configured thresholds up and down, then the gear changes with hysteresis (no flicker at boundaries) (UT).
- **AC4** Given the cluster scrolled out of the viewport, or `document.hidden`, when 2 s pass, then `requestAnimationFrame` is not called (QT with rAF counter; IT with mocked IntersectionObserver); when it re-enters, the loop resumes from its current state (UT/QT).
- **AC5** Given `prefers-reduced-motion: reduce`, when 3 s pass, then needle, gear and ticker text do not change and a static frame is shown (QT).
- **AC6** Given 390x844, when loaded, then the compact cluster is displayed below the hero text (per `cluster-v2-mobile.png`), is paused until in view, and adds no horizontal scroll (QT).
- **AC7** Given the cluster, when inspected, then it has `role="img"` with an `aria-label` and no per-frame React state (animation writes to refs/attributes) (IT).
- **AC8** Given `Speedometer.jsx`, when the sprint ends, then it is no longer imported anywhere (IT).
- **Files:** `src/components/widgets/InstrumentCluster.jsx` (new), `src/components/widgets/Speedometer.jsx` (removed), `src/lib/cluster.js` (new, pure physics/gear/ticker), `src/lib/gauge.js`, `src/hooks/useInView.js`, `src/hooks/useDocumentVisible.js` (new), `src/styles/cluster.css` (new), `src/sections/Hero.jsx` (mount point).
- **Tests:** UT-CLUSTER-001..008, IT-054 (no Speedometer import, a11y attributes), IT-055 (visibility gating), QT-144 (renders + labels), QT-145 (rAF stops off-screen), QT-146 (reduced motion static), QT-147 (mobile compact), QT-148 (hidden tab), QT-149 (visual baseline new cluster).
- **SRS:** FR-MOTION-003, FR-MOTION-004, FR-UX-004; supersedes FR-HERO-009, FR-HERO-010, NFR-PERF-006. **Deps:** US-201, US-202, US-206 (same file, same dev, sequential).

### US-208 - Optional ignition intro (once per session, skippable)  |  Could  |  3 pts  |  Dev-3
As a **peer engineer**, I want a short dashboard "ignition" at first load that I can skip, so that the first impression shows craft without slowing repeat visits.
- **AC1** Given a first load in a browser session with motion allowed, when the page opens, then the intro plays for <= 1200 ms, sets `sessionStorage["jsv-intro-played"]="1"`, and the page is interactive (no focus trap) afterwards (QT).
- **AC2** Given a second load in the same session, when the page opens, then no intro plays (<= 200 ms fade only) (QT).
- **AC3** Given the intro running, when any key, pointer, wheel or touch event fires, or "Skip intro" is activated, then it finishes immediately (QT).
- **AC4** Given `prefers-reduced-motion: reduce`, or `sessionStorage` throwing, when loaded, then no intro runs and content is visible immediately (QT + UT).
- **AC5** Given the intro, when Lighthouse/Playwright measures, then no long task > 50 ms from the intro and LCP is not delayed by more than 100 ms vs. no intro (QT).
- **AC6** Given the intro overlay, when active, then it is `aria-hidden` for decoration with a focusable, labelled skip button; underlying content is not `inert` after completion (QT).
- **Files:** `src/components/effects/IgnitionIntro.jsx` (new), `src/lib/intro.js` (new, state machine), `src/styles/intro.css` (new), `src/App.jsx`.
- **Tests:** UT-INTRO-001..004, IT-056 (App mounts intro lazily, flag guard), QT-150 (first load), QT-151 (second load), QT-152 (skip + reduced motion), QT-153 (timing <= 1.2 s + LCP).
- **SRS:** FR-MOTION-005, FR-MOTION-007. **Deps:** US-202. **Note:** feature flag `SITE.intro` in `src/config/site.js` (Dev-3 owns) so PO may ship disabled.

### US-209 - Day/night "illumination" theme transition  |  Should  |  5 pts  |  Dev-3
As a **visitor**, I want switching theme to feel like cluster backlight turning on or off, so that the toggle is a delight rather than a flash.
- **AC1** Given the theme button, when activated, then `data-theme` flips synchronously and colour properties animate for `--dur-theme` (360 ms) using a transient class on `<html>` that is removed after completion (QT; UT for class lifecycle).
- **AC2** Given the existing persistence rules (FR-THEME-001/008), when reloaded, then the theme is set before first paint with no transition and no flash (QT regression).
- **AC3** Given a rapid double toggle, when two toggles occur within 100 ms, then the final theme matches the last click and no stuck transition class remains (UT + QT).
- **AC4** Given `prefers-reduced-motion: reduce`, when toggled, then theme changes instantly with no overlay or icon animation (QT).
- **AC5** Given the switch, when measured, then no layout shift and no animation of `width/height/top/left` (IT CSS scan: only colour, opacity, transform).
- **AC6** Given the toggle icon, when switched, then it animates rotate/scale (220 ms) and the accessible name reflects the target theme (QT).
- **Files:** `src/context/ThemeContext.jsx`, `src/hooks/useTheme.js`, `src/lib/storage.js`, `src/lib/solar.js`, `src/components/effects/ThemeIllumination.jsx` (new), `src/styles/theme-transition.css` (new), `src/components/effects/GradientOrbs.jsx`.
- **Tests:** UT-ILLUM-001..003, IT-057 (CSS properties whitelist), QT-154 (transition class lifecycle), QT-155 (no flash on reload), QT-156 (reduced motion instant), QT-157 (rapid toggle).
- **SRS:** FR-MOTION-006, FR-THEME-003/004 (changed timing), FR-MOTION-007. **Deps:** US-201, US-202. **Interface:** `Nav.jsx` (Dev-1) is unchanged; the effect hooks into `ThemeContext.toggle()`.

### US-210 - Micro-interactions adopted across sections  |  Should  |  5 pts  |  Dev-3
As a **peer engineer**, I want reveal, hover and focus behaviour to be consistent in every section, so that no section feels like an afterthought.
- **AC1** Given each section (About, Experience, Skills, Education, Certifications, Resume, Contact), when scrolled into view, then reveal uses `--dur-slow` + `--ease-decel` and a stagger <= 60 ms per item, once only (QT).
- **AC2** Given cards and chips, when hovered/focused, then lift <= 4 px and border-colour change use motion tokens; touch devices (`hover: none`) show no sticky hover (QT).
- **AC3** Given `sections.css`, when scanned, then dead hero/projects/gauge rules are removed (those now live in `hero.css`, `cluster.css`, `projects.css`) and no duplicate selectors for them remain (IT).
- **AC4** Given reduced motion, when the page loads, then all sections are visible with no reveal transform (QT).
- **AC5** Given the text snapshot, when diffed, then unchanged (IT).
- **Files:** `src/styles/sections.css`, `src/hooks/useReveal.js`, `src/sections/{About,Experience,Education,Skills,Certifications,Resume,Contact}.jsx`, `src/components/tech/{SkillChip,TechIcon,iconStrategies,customSvgs}.jsx|js`, `src/components/layout/{SectionSlot,Divider}.jsx`, `src/config/sections.js`, `src/config/site.js`.
- **Tests:** IT-058 (sections.css cleanup + token usage), QT-158 (reveal timing/once), QT-159 (touch no sticky hover; reduced motion).
- **SRS:** FR-MOTION-002, FR-MOTION-007, FR-UX-001. **Deps:** US-202; removal of dead rules after US-206/207/211 merge.

### US-211 - Project cards as case studies  |  Must  |  5 pts  |  Dev-4
As a **hiring manager**, I want each project to read as problem, role, solution, impact, so that I understand what the engineer did and why it mattered.
- **AC1** Given `src/data/projects.js`, when validated, then each project has an optional `caseStudy` object `{problem, role, solution, impact}` whose strings are drawn from that project's existing `desc`/`domain`/`tags`/`period` (reviewed by PO against source; IT check that every `caseStudy` field is a substring or a PO-approved reformatting recorded in `docs/sprint2/CASE_STUDY_SOURCES.md` is NOT required - fields not supported by existing text must be absent) (IT).
- **AC2** Given a project with no supported "impact" fact, when rendered, then the Impact row is omitted (no "TBD", no invented metric) (UT + QT).
- **AC3** Given a card, when rendered, then the four labelled rows appear in order Problem, Role, Solution, Impact with domain, period, tags and the colour token retained from v1.1 (QT).
- **AC4** Given each card, when rendered, then one media slot (US-212) shows the existing SVG/icon art in production and the labelled placeholder only in preview (QT).
- **AC5** Given NDA-marked project 5 ("Two-Wheeler OEM Cluster"), when rendered, then no OEM name, logo or screenshot is shown (QT + IT).
- **AC6** Given 390x844 and 1366x800, when rendered, then cards are readable, no horizontal scroll, `wide` layout honoured on desktop (QT).
- **Files:** `src/data/projects.js`, `src/models/{createModels,validate,types}.js`, `src/sections/Projects.jsx`, `src/styles/projects.css` (new).
- **Tests:** UT-CASESTUDY-001..003 (model + validation), IT-059 (every caseStudy field sourced; no digits not present in existing desc), IT-060 (NDA rule), QT-160 (structure/order), QT-161 (omitted impact), QT-162 (layout both viewports), QT-163 (visual baseline).
- **SRS:** FR-UX-005, FR-PROJ-001..003 (changed), FR-MEDIA-009. **Deps:** US-201, US-212 (slot API; stub accepted day 3).

### US-212 - Media slot component for owner-supplied video/screenshots  |  Must  |  5 pts  |  Dev-4
As a **recruiter**, I want project videos to load only when I look at them, show a poster, have captions and never autoplay unexpectedly, so that the page stays fast and accessible.
- **AC1** Given `<MediaSlot item={...}/>` with a video item, when rendered below the fold, then no video bytes are requested until the slot is within one viewport (IntersectionObserver) or the user presses play; it renders `poster`, `width`/`height`, `playsinline`, `preload="none"`, WebM + MP4 sources (UT + QT).
- **AC2** Given a narrated video item without a caption track, when validated, then the slot refuses to render the video and shows the empty state (UT + IT).
- **AC3** Given an ambient clip, when >= 50 % visible and motion allowed, then it plays muted; when scrolled away or tab hidden, it pauses; with reduced motion it never autoplays and shows a play button (QT).
- **AC4** Given a clip longer than 5 s, when rendered, then a keyboard-operable pause/play control with an accessible name is present (QT).
- **AC5** Given no approved item, when rendered in production, then it renders the existing SVG art/no media; in dev/preview (`import.meta.env.DEV` or `?placeholders=1`) it renders the generated placeholder with a visible "PLACEHOLDER - OWNER MEDIA" label (UT + QT; production build has no `placeholder-` reference, IT).
- **AC6** Given an item, when validated, then `rightsConfirmed === true`, `alt` or description present, local URLs only (no third-party origin) (UT).
- **Files:** `src/components/media/MediaSlot.jsx` (new), `src/hooks/useMediaPlayback.js` (new), `src/data/media.js` (new, initially empty manifest), `src/models/mediaSchema.js` (new), `src/assets/placeholders/*` (copied from `docs/design/assets/placeholders/`, dev-only dynamic import), `src/styles/media.css` (new).
- **Tests:** UT-MEDIASLOT-001..006, IT-061 (manifest rules, no third-party origin), IT-062 (prod bundle has no placeholder), QT-164 (lazy: no video request before scroll), QT-165 (reduced motion no autoplay), QT-166 (pause on leave/hidden), QT-167 (captions + control keyboard), QT-168 (placeholder label in preview).
- **SRS:** FR-MEDIA-005..007, FR-MEDIA-009, FR-MEDIA-011, FR-MEDIA-012, FR-MEDIA-013, NFR-MEDIA-001, NFR-MEDIA-009. **Deps:** US-201.

### US-213 - Design section on media slots and decorative art rules  |  Should  |  2 pts  |  Dev-4
As a **mobile visitor**, I want the design portfolio cards to be quick to load and clearly decorative, so that screen readers skip artwork and I never see fake screenshots.
- **AC1** Given the Design section, when rendered, then each card's art is `aria-hidden="true"` and art data contains no personal names (IT, FR-MEDIA-008).
- **AC2** Given a design card with an owner-media entry in the manifest, when rendered, then it uses `MediaSlot`; otherwise the existing `DesignArt` SVG (QT).
- **AC3** Given reduced motion, when the section is visible, then no art animation runs (QT).
- **Files:** `src/sections/Design.jsx`, `src/data/design.js`, `src/components/widgets/DesignArt.jsx`.
- **Tests:** IT-063 (aria-hidden, no names), QT-169 (fallback art), QT-170 (reduced motion).
- **SRS:** FR-MEDIA-008, FR-MEDIA-009. **Deps:** US-212.

### Umbrella test items (Test Engineer, not dev stories)
QT-171 full visual baseline refresh after PO approval; IT-064 `tests/stp-ids.json` sync; update retired tests (Speedometer, projects byte-identity, hero text snapshot).

## 2. Story summary

| ID | Title | Pri | Pts | Dev |
|---|---|---|---|---|
| US-201 | Design tokens v2 | Must | 5 | Dev-1 |
| US-202 | Motion tokens + micro-interactions foundation | Must | 3 | Dev-1 |
| US-203 | Accessibility polish | Must | 3 | Dev-1 |
| US-204 | Media budgets and manifest CI | Should | 3 | Dev-1 |
| US-205 | Responsive images, OG, icons, manifest | Must | 3 | Dev-2 |
| US-206 | Hero v2 hierarchy and CTAs | Must | 5 | Dev-2 |
| US-207 | Instrument cluster v2 | Must | 8 | Dev-2 |
| US-208 | Ignition intro (optional) | Could | 3 | Dev-3 |
| US-209 | Day/night illumination transition | Should | 5 | Dev-3 |
| US-210 | Micro-interactions across sections | Should | 5 | Dev-3 |
| US-211 | Project case-study cards | Must | 5 | Dev-4 |
| US-212 | Media slot component | Must | 5 | Dev-4 |
| US-213 | Design section on media slots | Should | 2 | Dev-4 |

Totals: Dev-1 14, Dev-2 16, Dev-3 13, Dev-4 12 = **55 points** (Must 37, Should 15, Could 3).

## 3. Sprint 2 plan

### 3.1 File ownership (exclusive; no file appears under two developers)

| Dev | Stories | Owns (may edit/create) |
|---|---|---|
| **Dev-1** (foundation) | US-201, 202, 203, 204 | `src/styles/{tokens,base,components,index,motion}.css`; `src/lib/motion.js`; `src/components/ui/*`; `src/components/layout/{Nav,Footer}.jsx`; `src/hooks/{useActiveSection,useScrolled,usePrefersReducedMotion}.js`; `scripts/check-media-budget.mjs`; `package.json`; `.github/workflows/*` |
| **Dev-2** (hero, cluster, static assets) | US-205, 206, 207 | `index.html`; `public/**`; `src/sections/Hero.jsx`; `src/components/widgets/{InstrumentCluster,Speedometer}.jsx`; `src/lib/{cluster,gauge}.js`; `src/hooks/{useInView,useParallax,useTypewriter,useDocumentVisible}.js`; `src/styles/{hero,cluster}.css` |
| **Dev-3** (theme, effects, sections) | US-208, 209, 210 | `src/App.jsx`; `src/main.jsx`; `src/context/ThemeContext.jsx`; `src/hooks/{useTheme,useReveal}.js`; `src/lib/{storage,solar,intro,random}.js`; `src/components/effects/*`; `src/components/tech/*`; `src/components/layout/{SectionSlot,Divider}.jsx`; `src/config/*`; `src/sections/{About,Experience,Education,Skills,Certifications,Resume,Contact}.jsx`; `src/styles/{sections,intro,theme-transition}.css` |
| **Dev-4** (projects, media) | US-211, 212, 213 | `src/sections/{Projects,Design}.jsx`; `src/data/*`; `src/models/*`; `src/components/media/*`; `src/components/widgets/DesignArt.jsx`; `src/hooks/useMediaPlayback.js`; `src/assets/placeholders/*`; `src/styles/{projects,media}.css` |
| **Test Engineer** | all | `tests/**` shared catalogues and existing files: `tests/stp-ids.json`, `tests/fixtures/*`, `tests/integration/__baseline__/*`, `tests/qualification/__baseline__/*`, `tests/qualification/baseline/*`, `docs/STP.md`, `docs/SRS.md` merge. Devs add only new files named `us2xx-*.test.*` / `us2xx-*.spec.js` in the matching tests folder; they never edit existing test files. |

Cross-dev interfaces (no shared files): `index.css` imports (Dev-1 adds all stubs on day 1; others fill their own stub); theme toggle is `ThemeContext.toggle()` (Dev-3), called by `Nav.jsx` (Dev-1) unchanged; `MediaSlot` props `{item, fallback}` (Dev-4) consumed only by Dev-4 files; the cluster mount is a single `<InstrumentCluster/>` in `Hero.jsx` (Dev-2). Overrides for old rules in `sections.css` rely on later cascade order (`hero.css`, `projects.css` imported after `sections.css`) until US-210 deletes dead rules.

### 3.2 Sequencing
Day 1: Dev-1 lands token and stub PR (US-201 part 1, US-202 tokens). Days 2-4 parallel. Dev-2: US-205 then 206 then 207. Dev-4: US-212 API stub by day 3, then US-211, 213. Dev-3: US-209, 210, 208 last (flag-gated). Dev-1: US-203, 204 after 201/202. Integration freeze day N-2 for baselines.

### 3.3 Test Engineer allocation
One TE owns catalogues, retires/updates affected v1.1 tests (Speedometer unit test, hero text snapshot, `UNIT-DATA_PROJECTS` byte-identity, visual baselines, CSS baseline fixture, bundle baseline), writes cross-story QT-171 and IT-064, runs `capture-baseline.mjs` once per approved change set after PO sign-off, and reviews each dev's new tests for AC coverage. Estimated 40 % of one TE per dev story pair; Sprint 1 bug-fix test edits must be merged before Sprint 2 baseline capture.

### 3.4 Definition of Done (per story)
1. Code merged on the story branch, only files owned by the dev; JSDoc present.
2. New UT/IT/QT for every AC, IDs as listed, titles starting with the ID, and registered in `tests/stp-ids.json` by the TE.
3. `npm run lint` clean; no new warnings.
4. Full suite green (unit, integration, qualification) at both viewports, both themes.
5. Visual baselines updated only for intended changes of this story, captured with `tests/qualification/baseline/capture-baseline.mjs`, diff reviewed and approved by the PO.
6. Reduced-motion and mobile (390x844) behaviour verified; axe: 0 serious/critical.
7. No invented content (PO checklist, NFR-MEDIA-006); media budgets (US-204) pass.
8. SRS v1.2 IDs traced in the STP traceability matrix.

### 3.5 Risks
| # | Risk | Mitigation |
|---|---|---|
| R1 | Old `Speedometer`/hero tests and baselines fail wholesale | TE retires/rewrites first; baselines captured after PO approval |
| R2 | Token change shifts many pixels | Brand hex kept, aliases retained, one baseline refresh |
| R3 | Cluster CPU cost on low-end phones | Pause rules, no React state per frame, dt clamp, QT rAF counter |
| R4 | Intro hurts LCP/INP | <= 1.2 s, flagged, once per session, QT-153; PO may disable |
| R5 | Case-study text drifts into invention | Sourced-field IT-059, PO review, omit-when-unsupported |
| R6 | Cascade-based overrides of `sections.css` | Import order contract, dead-rule cleanup in US-210 |
| R7 | Owner media (video/screenshots) not supplied | Slots degrade to existing art; placeholders dev-only |
| R8 | NDA breach on project 5 | AC5 of US-211, no screenshots without `rightsConfirmed` |
| R9 | Sprint 1 bug-fixing merges conflict | Sprint 2 branches from the Sprint 1 integration tag; TE merges Sprint 1 test changes first |
| R10 | Mobile cluster (FR-UX-004) is a PO decision | Marked Should in the SRS delta; fallback = keep hidden <= 900 px |

### 3.6 Out of scope
Self-hosted skill icons (FR-MEDIA-010), real video production, copy rewrites, new sections, analytics.
