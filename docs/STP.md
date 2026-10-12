# Software Test Plan (STP) and Traceability

| Version | Date | Author | Status |
|---|---|---|---|
| 1.0 | 2026-10-12 | QA Lead | Baselined |
| 1.1 (Amendment R1) | 2026-10-12 | QA Lead | Test report R1 triage: statements aligned with baseline markup (QT-021, 036, 037, 040, 062, 064, 071, 076, 079, 092, 096, 097); UT catalogue extended (DEF-017); allowed differences extended with DEF-012 and DEF-021 |

References: `docs/SRS.md` v1.1, `docs/SADS.md` v1.1, `docs/SUDS.md` v1.0, `docs/ARCHITECTURE_BRIEF.md` (test strategy, V-model, ID conventions).

## 1. Scope and approach

| Level | ASPICE | Basis | Tooling | Location | Exit criterion |
|---|---|---|---|---|---|
| Unit (UT) | SWE.4 | SUDS units | Vitest + Testing Library + jsdom (`tests/utils/browserMocks.js`) | `tests/unit/**` | 100% UT pass; coverage ≥90% lines for models/lib/hooks, ≥80% overall |
| Integration (IT) | SWE.5 | SADS elements/interfaces | Vitest + Testing Library + jsdom | `tests/integration/**` | 100% IT pass |
| Qualification (QT) | SWE.6 | SRS requirements | Playwright, Chromium, `vite preview` :4173, desktop 1366x800 (D) and mobile 390x844 (M), Google Fonts blocked | `tests/qualification/**` | 100% QT pass on both projects; visual parity vs baseline `dd9a86d` (`tests/qualification/__baseline__/`, capture script `tests/qualification/baseline/capture-baseline.mjs`) |

QT columns: viewport D/M/S (S = static/node analysis), method T (test), I (inspection), A (analysis), D (demonstration).

**Entry criteria:** lint clean, build succeeds. **Suspension:** build broken or >20% of a level failing for one root cause. **Resumption:** after the fix is merged into the working branch.

**Techniques:** equivalence partitioning and boundary values (theme switch instants, 30 px scroll threshold, 140 px active offset, 900/540 px breakpoints), state-transition testing (typewriter, mobile menu, theme override), error guessing (storage throwing, missing IntersectionObserver, image error, CDN down), visual regression vs baseline, accessibility checks.

**Defect management:** `DEF-NNN` in `docs/TEST_REPORT.md` with severity S1 (blocks release) to S4 (cosmetic), reproduction, suspected unit, status Open → Fixed → Verified. **Test/fix loop:** run UT → IT → QT, log defects, developer fixes code (tests are changed only when they contradict the SRS, with the reason recorded), rerun all levels; repeat until exit criteria are met.

**Test case ID rules:** every automated test title starts with its ID (`QT-001 …`, `IT-001 …`, `UT-SOLAR-001 …`).

## 2. Qualification test cases (SWE.6)

### QT-001 Fixed top navigation bar stays visible while scrolling

- **File:** `tests/qualification/nav.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-NAV-001
- **Preconditions:** P0.
- **Step:** Load `/`; read computed style of `nav.nav` (position, top, z-index, height).
- **Step:** Scroll to 1500 px and to the page bottom; read `nav.nav` bounding box each time.
- **Expected:** `position: fixed`, `top: 0px`, `z-index: 300`, height 64 px at scrollY 0; at every scroll position the nav box top is 0 and it is visible in the viewport.
  auto: `getComputedStyle` via `locator.evaluate`; `page.mouse.wheel` / `window.scrollTo` then `expect(nav).toBeInViewport()`.

### QT-002 Nav logo icon and label

- **File:** `tests/qualification/nav.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-NAV-002
- **Preconditions:** P0.
- **Step:** Read `.nav-logo` textContent and its accessible name.
- **Expected:** Visible; `textContent === "developer_boardJEEVANANDHAM"`; the icon span has `aria-hidden="true"`; accessible text (`page.getByText` / ARIA snapshot) is "JEEVANANDHAM".
  auto: `expect(locator).toHaveText`, `toMatchAriaSnapshot`.

### QT-003 Nine nav links in order with icons and existing targets

- **File:** `tests/qualification/nav.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-NAV-003
- **Preconditions:** P0; all sections loaded (`loadAllSections`).
- **Step:** Collect `.nav-links a` labels (accessible names), `href`s and icon ligatures.
- **Step:** For every href, query `document.getElementById(id)`.
- **Expected:** Count 9; labels About, Experience, Skills, Projects, Design, Education, Certs, Resume, Contact; hrefs `#about` … `#contact` in that order; icons person, work, build, rocket_launch, brush, school, verified, description, mail; every target id exists.
  auto: Data-driven expected table imported from a QT fixture (not from `src/`, so the test stays black-box).

### QT-004 Nav is derived from the registry and excludes Hero

- **File:** `tests/qualification/nav.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-NAV-004
- **Preconditions:** P0; all sections loaded.
- **Step:** Compare the ordered nav hrefs (desktop list and mobile menu) with the ordered `[data-section]` ids minus `hero`.
- **Step:** Search the nav for any `href="#hero"`.
- **Expected:** Both nav lists equal the section ids minus hero, in DOM order; no hero link. Structural derivation from `config/sections.js` is verified by {IT:nav-registry} and {IT:registry-extend} (method I+IT, recorded as evidence).
  auto: Black-box consistency check; the registry-substitution part is IT evidence.

### QT-005 Nav link scrolls smoothly to the section and updates the hash

- **File:** `tests/qualification/nav.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-NAV-005
- **Preconditions:** P0 (no reduced motion).
- **Step:** Read computed `scroll-behavior` of `html`.
- **Step:** Click nav link "Projects"; wait for scroll to settle (two consecutive equal `scrollY` reads 100 ms apart).
- **Expected:** `scroll-behavior: smooth`; `location.hash === "#projects"`; `#projects` bounding top is within [-2, 100] px of the viewport top.
  auto: `expect.poll` on `scrollY` stability.

### QT-006 Active-section highlight including the 140 px offset boundary

- **File:** `tests/qualification/nav.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-NAV-006
- **Preconditions:** P0; all sections loaded.
- **Step:** At scrollY 0 read `.nav-links a.active`.
- **Step:** Scroll to `skills.offsetTop - 100`; wait one animation frame plus 50 ms.
- **Step:** Boundary: scroll to `skills.offsetTop - 140` (on-boundary) and `skills.offsetTop - 141` (just outside).
- **Step:** Scroll to the document bottom.
- **Expected:** scrollY 0: no nav link active (active id is `hero`). At -100 and -140: only "Skills" is `.active`. At -141: only "Experience" is active. At the bottom: only "Contact" is active.
  auto: `page.evaluate(() => window.scrollTo(0, y))` with `behavior: 'instant'` to avoid smooth-scroll drift; `expect(page.locator('.nav-links a.active')).toHaveCount(1)`.

### QT-007 Nav compacts beyond the 30 px scroll threshold

- **File:** `tests/qualification/nav.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-NAV-007
- **Preconditions:** P0.
- **Step:** Scroll to 30 px; read class list.
- **Step:** Scroll to 31 px; wait 400 ms (0.3 s transition); read class list and height.
- **Step:** Scroll back to 0.
- **Expected:** At 30: no `scrolled`. At 31: `scrolled` present and height 54 px; `transition` includes 0.3s. At 0: `scrolled` removed and height 64 px.
  auto: Boundary values 30/31 (equivalence classes ≤30, >30).

### QT-008 Hamburger replaces inline links at ≤ 900 px

- **File:** `tests/qualification/nav.spec.js` · **Viewports:** D,M,R · **Method:** T · **Requirements:** FR-NAV-008
- **Preconditions:** P0.
- **Step:** Mobile project (390x844): check `.nav-links` and `.hamburger` visibility and `aria-label`.
- **Step:** Desktop project: check the reverse.
- **Step:** Boundary: `setViewportSize` 900x800 and 901x800.
- **Expected:** 390 and 900: `.nav-links` not displayed, `.hamburger` visible with 3 bar spans and `aria-label="Menu"`. 1366 and 901: links visible, hamburger hidden.
  auto: `toBeVisible` / `toBeHidden`.

### QT-009 Hamburger toggles the mobile menu with 9 links and theme button

- **File:** `tests/qualification/nav.spec.js` · **Viewports:** M · **Method:** T · **Requirements:** FR-NAV-009
- **Preconditions:** P0 (night).
- **Step:** Tap `.hamburger`; inspect `.mobile-menu`.
- **Step:** Tap `.hamburger` again.
- **Expected:** First tap: `.mobile-menu.open` visible, `top: 64px`, `position: fixed`, 9 `a.nav-link` with the same labels/hrefs as FR-NAV-003 (icon spans font-size 15 px) and a full-width `.theme-btn` reading "Switch to Day Mode". Second tap: menu not displayed.
  auto: `page.tap`; mobile project has `hasTouch`.

### QT-010 Mobile menu closes on link or theme selection

- **File:** `tests/qualification/nav.spec.js` · **Viewports:** M · **Method:** T · **Requirements:** FR-NAV-010
- **Preconditions:** P0 (night).
- **Step:** Open the menu; tap "Contact".
- **Step:** Open the menu; tap the theme button.
- **Expected:** After "Contact": menu closed, `location.hash === "#contact"`, `#contact` near viewport top. After theme button: menu closed and `html[data-theme]` changed from `night` to `day`.

### QT-011 Hamburger exposes aria-expanded and aria-controls

- **File:** `tests/qualification/nav.spec.js` · **Viewports:** M · **Method:** T · **Requirements:** FR-NAV-011
- **Preconditions:** P0.
- **Step:** Read `aria-expanded` and `aria-controls` closed; open; read again.
- **Expected:** Closed: `aria-expanded="false"`; open: `"true"`; `aria-controls` value equals the `id` of `.mobile-menu` and that element exists.

### QT-012 Escape closes the mobile menu and returns focus

- **File:** `tests/qualification/nav.spec.js` · **Viewports:** M · **Method:** T · **Requirements:** FR-NAV-012
- **Preconditions:** P0.
- **Step:** Focus the hamburger with keyboard (Tab), press Enter to open.
- **Step:** Press Escape.
- **Step:** Negative: with the menu closed, press Escape.
- **Expected:** After Escape: `.mobile-menu` not displayed, `aria-expanded="false"`, `document.activeElement` is `.hamburger`. Escape while closed changes nothing and throws no error.

### QT-013 Hero three-column layout on desktop

- **File:** `tests/qualification/hero.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-HERO-001
- **Preconditions:** P0.
- **Step:** Read `#hero` attributes, classes, child order, computed `grid-template-columns` and height.
- **Expected:** `section#hero.hero[data-section=hero]`; children `.hero-content`, `.hero-center`, `.hero-right` in order; the last two resolved column tracks are 360px and 260px; height ≥ 800 px.

### QT-014 Hero tag line and single h1

- **File:** `tests/qualification/hero.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-HERO-002
- **Preconditions:** P0.
- **Step:** Read the tag line, `h1` count and text, `h1 em`, `h1 br`.
- **Expected:** Tag text "Senior HMI Engineer · Chennai, India" with icon `developer_board`; exactly one `h1` on the page; text matches "S. Jeevanandham B.ECE" (line break before B.ECE); `h1 em` = "Jeevanandham"; `h1 em` colour equals computed `--amber`.

### QT-015 Typewriter cycles the five roles in order and wraps

- **File:** `tests/qualification/hero.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-HERO-003
- **Preconditions:** P0; clock installed and paused before navigation (`page.clock.install` + `pauseAt`).
- **Step:** Load; then repeatedly `page.clock.runFor(50)` up to 60 000 ms simulated, recording `.hero-typewriter` text after each step.
- **Step:** Extract the sequence of distinct fully typed strings (texts equal to a role).
- **Expected:** Sequence starts "Qt / QML Developer", "Embedded HMI Engineer", "UX / UI Engineer", "Instrument Cluster Dev", "Medical Device HMI Eng", then "Qt / QML Developer" again; a cursor element "|" follows the text and is amber.
  auto: State-transition coverage (typing → pause → deleting → next word → wrap).

### QT-016 Typewriter timing in the production build

- **File:** `tests/qualification/hero.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-HERO-004
- **Preconditions:** P0; `addInitScript(() => { Math.random = () => 0 })`; clock paused at a fixed instant before navigation; mount time T0 recorded by an init-script MutationObserver on `.hero-typewriter`.
- **Step:** Advance the clock to T0+899, +900, +2004, +2005, +2069, +3869, +3870, +4800 ms, reading the text each time.
- **Expected:** 899: ""; 900: "Q"; 2004: 17 chars; 2005: "Qt / QML Developer"; 2069 and 3869: still the full word; 3870: 17 chars (first deletion); 4800: "E" (next word after 35 ms deletion steps and 300 ms wait). Primary evidence: UT-USE_TYPEWRITER (fake timers, unmount cleanup).
  auto: Boundary values around each timer edge. Only valid if the default rng is `Math.random` (SUDS); otherwise QT falls back to UT evidence (method A) and records it.

### QT-017 Hero bio text and emphasis

- **File:** `tests/qualification/hero.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-HERO-005
- **Preconditions:** P0.
- **Step:** Read `.hero-bio` text and `strong` children.
- **Expected:** Text equals the baseline text snapshot; exactly 2 `strong`: "4.9+ years" and "Qt/QML, Embedded C++, and real-time UI engineering".

### QT-018 Eight hero skill badges in order

- **File:** `tests/qualification/hero.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-HERO-006
- **Preconditions:** P0.
- **Expected:** `.hero-badges .badge` texts = Qt / QML, Embedded C++, LVGL, CAN Bus, A-SPICE, Linux HMI, SQLite3, FreeRTOS.

### QT-019 Hero call-to-action links and resume download filename

- **File:** `tests/qualification/hero.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-HERO-007
- **Preconditions:** P0.
- **Step:** Read the three `.hero-cta a` (class, href, download, icon).
- **Step:** `request.get` on the resume href.
- **Step:** Click "Resume" inside `page.waitForEvent('download')`.
- **Expected:** "View Projects" `btn-amber` `#projects` icon rocket_launch; "Get In Touch" `btn-outline` `#contact` icon mail; "Resume" `btn-green` href ends `Jeevanandham_Resume.pdf`, `download="Jeevanandham_SeniorHMIEngineer_Resume.pdf"`, icon download. GET returns 200 `application/pdf`. `download.suggestedFilename() === "Jeevanandham_SeniorHMIEngineer_Resume.pdf"`.

### QT-020 Gauge widget content

- **File:** `tests/qualification/hero.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-HERO-008
- **Preconditions:** P0.
- **Expected:** `.gauge-widget` contains label "⚡ Live HMI Cluster Demo", one `svg`, 3 `.gauge-stat` ("4.9+" Yrs Exp rgb(245,158,11); "8+" Projects rgb(34,211,238); "2" Domains rgb(52,211,153)) and 5 `.gauge-stack-tag` (Qt/QML, LVGL, C++, CAN, UART).

### QT-021 Speedometer SVG geometry and labels

- **File:** `tests/qualification/hero.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-HERO-009
- **Preconditions:** P0; clock paused before navigation so no animation frame has run.
- **Step:** Read the svg `viewBox`, computed max-width, tick lines, needle line, texts.
- **Expected:** viewBox "0 0 260 260", max-width 320px; 19 tick `line`s, 7 with `stroke-width="2"`; texts "km/h", "HMI CLUSTER DEMO", /\d+ RPM/; the initial frame is t = 0 (speed 88, rpm ≈ 4310, not speed 0); needle endpoint = (130+84·cos(a), 130+84·sin(a)) with `a` from the angle formula for the displayed speed (±0.5). Gradient stops #34d399→#22d3ee and #f59e0b→#fb7185.

### QT-022 Speedometer animates, and is static under reduced motion

- **File:** `tests/qualification/hero.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-HERO-010
- **Preconditions:** P0. Variant A: default motion. Variant B: `page.emulateMedia({ reducedMotion: 'reduce' })` before navigation.
- **Step:** Read the speed text; `page.clock.runFor(2000)`; read again.
- **Expected:** A: the speed text changes. B: the speed text and RPM text are unchanged over 2 s (static frame; SADS: t = 0 frame "88"). Formula values and `cancelAnimationFrame` on unmount: UT-SPEEDOMETER evidence.

### QT-023 Profile card image and info panel

- **File:** `tests/qualification/hero.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-HERO-011
- **Preconditions:** P0.
- **Expected:** `img.profile-photo` alt "S. Jeevanandham", width="600", height="900", decoding="async", `naturalWidth > 0`; `.scan` present; 4 `.corner`; panel texts "S. JEEVANANDHAM", "SENIOR HMI ENGINEER", "OPEN TO OPPORTUNITIES" with a green pulsing dot; tags Automotive HMI, Medical HMI, Qt/QML, UX Design.

### QT-024 Profile image failure hides the image only

- **File:** `tests/qualification/hero.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-HERO-012
- **Preconditions:** P0 + `page.route('**/profile.webp', r => r.fulfill({ status: 404 }))`.
- **Expected:** `img.profile-photo` computed `display: none` (no broken-image box); `.profile-info-panel` visible; no page error.
  auto: Error guessing (missing asset).

### QT-025 Profile card parallax tilt and reduced-motion suppression

- **File:** `tests/qualification/hero.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-HERO-013
- **Preconditions:** P0. Variant B with reduced motion emulated.
- **Step:** `page.mouse.move(1365, 400)`; read `.profile-card` style transform.
- **Step:** Move to the centre (683, 400); move to (0, 0).
- **Expected:** Right edge: transform matches `perspective(900px) rotateY(≈6.99deg) rotateX(…) translateZ(8px)` (|rotateY − 7| < 0.05); centre ≈ 0deg; top-left: rotateY ≈ −7, rotateX ≈ +7; inline `transition` "transform 0.15s ease-out". Variant B: transform stays empty after moves.
  auto: Boundary values at viewport edges (±7°).

### QT-026 Hero collapses at ≤ 900 px and CTAs stack at ≤ 540 px

- **File:** `tests/qualification/hero.spec.js` · **Viewports:** M,R · **Method:** T · **Requirements:** FR-HERO-014
- **Preconditions:** P0.
- **Step:** At 390x844 read `.hero-center`, `.hero-right` display, `#hero` padding, `.hero-cta` flex-direction, each `.btn` width.
- **Step:** Boundary: viewport 540 and 541 wide; 900 and 901 wide.
- **Expected:** 390/540: hidden columns, padding "80px 24px 60px", `flex-direction: column`, button width = container content width (±1 px). 541: row. 900: collapsed; 901: three columns.

### QT-027 About section identity

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-ABOUT-001
- **Expected:** `section#about[data-section=about]`; `.section-label` "01 — About" with icon person (13 px); `h2.section-title` "Who I Am".

### QT-028 About paragraphs and highlights

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-ABOUT-002
- **Expected:** `.about-text p` count 4 with baseline text; `.hl` texts in order: "Senior Software Engineer", "automotive and medical device industries", "Qt/QML and Embedded C++", "engineering rigour and UX design sensibility", "A-SPICE aligned development".

### QT-029 About stat cards and colours

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-ABOUT-003
- **Expected:** 4 `.stat-card`: "4.9+"/Years Experience/schedule/rgb(245,158,11); "8+"/Projects Shipped/rocket_launch/rgb(34,211,238); "2"/Domains — Auto & Med/devices/rgb(52,211,153); "C++"/Primary Language/code/rgb(167,139,250) (computed colour of `.stat-num`); 2x2 grid on desktop.

### QT-030 About grid single column at ≤ 900 px

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-ABOUT-004
- **Expected:** 390: `.about-grid` resolves to 1 column track, row gap 40px. 1366: 2 tracks.

### QT-031 Experience band identity

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-EXP-001
- **Expected:** `#experience[data-section=experience].exp-band.full-band`; label "02 — Experience" (work); title "Career".

### QT-032 Experience timeline entries

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-EXP-002
- **Expected:** 4 `.exp-item` in order with dot and amber icon tile; item 1: "Senior Software Engineer", "PixelExpert Technology & Services Pvt. Ltd.", "SEP 2024 — JAN 2026", "Chennai, Tamil Nadu"; item 4: "Graphics Designer Trainee", "Lapiz Digital Services Pvt. Ltd."; all descriptions equal the text snapshot.

### QT-033 Skills section identity

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-SKILL-001
- **Expected:** `section#skills[data-section=skills]`; label "03 — Skills" (build); title "Toolbox".

### QT-034 Nine skill categories with 58 chips

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-SKILL-002
- **Expected:** 9 `.skill-cat` with badges in order and chip counts 9,10,7,5,10,5,1,8,3 (total 58 `.skill-chip`); each badge text/border colour = header colour, background = headerBg; a gradient rule line per category.

### QT-035 Skill chip icons resolve per strategy

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-SKILL-003
- **Preconditions:** P0 (Simple Icons routed to the local fixture SVG).
- **Expected:** Every chip has a 22 px icon box; chip "Git" contains `img[alt=git][src="https://cdn.simpleicons.org/git"]`; chip "LVGL" contains an inline `svg`; chip "Embedded C" contains a Material Symbols span "code" coloured #f59e0b.

### QT-036 Tech icon fallback when the CDN fails

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-SKILL-004
- **Preconditions:** P0 but `cdn.simpleicons.org` aborted (`route.abort('failed')`).
- **Expected:** No `.skill-chip img` remains with `complete && naturalWidth === 0`; each former `si:` chip (24 chips, 19 distinct slugs) shows a Material Symbols span "code"; 58 chips visible. Unknown-key/unknown-prefix branches: UT-TECH_ICON evidence.

### QT-037 ISO 26262 awareness strip

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-SKILL-005
- **Expected:** `.iso-strip` title "ISO 26262 Awareness" with `shield` title icon and `verified_user` block icon (as in baseline), baseline description, 5 `.iso-chip`: Safety-Aware UI, Deterministic Performance, Structured Validation, FMEA Awareness, Fail-Safe Patterns.

### QT-038 Chip image filters per theme

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-SKILL-006
- **Preconditions:** P0 (night), then toggle to day.
- **Expected:** Night: `.chip-icon-wrap img` computed filter "brightness(1.5) saturate(1.1)"; day: "brightness(0.85) saturate(1.05)".

### QT-039 Projects section identity

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-PROJ-001
- **Expected:** `section#projects[data-section=projects]` background equals computed `--bg2`; label "04 — Engineering Projects" (rocket_launch); title "Selected Work".

### QT-040 Six project cards with wide spans and tags

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-PROJ-002
- **Expected:** 6 `.project-card` in data order; exactly 2 `.wide` (titles "SUV In-Vehicle Infotainment System" and "ADAS 3D Demonstrator & R&D Projects", matched by regex) spanning both columns on desktop; card 1 title "Physiotherapy Laser Therapy HMI" with 5 tags; card 3 has 8 tags; every card shows period, icon tile, number, domain, title, desc.

### QT-041 Projects grid single column at ≤ 900 px

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-PROJ-003
- **Expected:** 390: `.projects-grid` 1 track; wide cards `grid-column` resolves to column 1 only. 1366: 2 tracks.

### QT-042 Design section identity

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-DESIGN-001
- **Expected:** `#design[data-section=design]` full band, background `--bg2`, non-zero top border; label "05 — Design Portfolio" (brush); title "Creative Work".

### QT-043 Five Behance design cards

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-DESIGN-002
- **Expected:** 5 `.behance-card`, exactly 1 `.wide` ("Infotainment UI Modules"); titles and tags match baseline; each has `svg` inside `.behance-card-bg`, overlay, tag icon, description and "View on Behance" CTA.

### QT-044 Design cards link to Behance in a new tab

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-DESIGN-003
- **Expected:** All 5 cards: `href="https://behance.net/s_jeevanandham"`, `target="_blank"`, `rel="noopener noreferrer"`.

### QT-045 Education section identity

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-EDU-001
- **Expected:** `section#education[data-section=education]`; label "06 — Education" (school); title "Academic Background".

### QT-046 Degree card

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-EDU-002
- **Expected:** First `.edu-card`: "B.E. — Electronics & Communication Engineering", "Adhiparasakthi College of Engineering (Anna University), Tamil Nadu", cyan `.edu-tag`s "2015 – 2020", "CGPA: 6.34 / 10", "ECE".

### QT-047 Key Domain Expertise card

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-EDU-003
- **Expected:** Second card title "Key Domain Expertise" with military_tech icon (amber), baseline sentence and 5 amber chips: Automotive HMI, Medical Device HMI, Instrument Clusters, Infotainment, ADAS / 3D Viz.

### QT-048 Education content is data-driven (static inspection)

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** I · **Requirements:** FR-EDU-004
- **Preconditions:** Source tree available (node `fs`).
- **Step:** Read `src/sections/Education.jsx`; search for the literals "Adhiparasakthi", "Electronics & Communication", "CGPA", "Key Domain Expertise", "2015 – 2020", "ADAS / 3D Viz".
- **Expected:** None present; the file imports `data/education.js`. Data substitution behaviour: {IT:edu-subst}.

### QT-049 Certifications band identity

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-CERT-001
- **Expected:** `#certifications[data-section=certifications]` background `--surf`, top and bottom borders; label "07 — Certifications" (verified); title "Credentials".

### QT-050 Certification cards and column counts per breakpoint

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M,R · **Method:** T · **Requirements:** FR-CERT-002
- **Step:** Read cards; then viewport widths 1366, 901, 900, 800, 541, 540, 390.
- **Expected:** 3 `.cert-card` (Qt 6 Core — Beginner, Intermediate & Advanced / UDEMY / school; QML for Beginners / UDEMY / school; Google UX Design Professional Certificate / COURSERA — CREDLY VERIFIED / verified_user). Columns: 1366→3, 901→3, 900→2, 800→2, 541→2, 540→1, 390→1.

### QT-051 Resume section identity

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-RES-001
- **Expected:** `#resume[data-section=resume]`; label "08 — Resume" (description); `h3` "Download My Resume"; baseline paragraph.

### QT-052 Resume Download PDF and View Online buttons

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-RES-002
- **Step:** Read both buttons; click "Download PDF" in `waitForEvent('download')`; save to temp and stat size.
- **Expected:** "Download PDF" `btn-green`, href ends `Jeevanandham_Resume.pdf`, `download="Jeevanandham_SeniorHMIEngineer_Resume.pdf"`; suggested filename equals that; saved size > 0. "View Online" `btn-outline`, same href, `target="_blank"`, `rel="noopener noreferrer"`.

### QT-053 Resume preview card

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-RES-003
- **Expected:** Header "JEEVANANDHAM_RESUME.PDF · 3 PAGES"; "S. JEEVANANDHAM"; role line exact; location, email and phone rows; "KEY SKILLS" with 4 `.rdp-skill-row` whose fill inline widths are 92%, 88%, 85%, 78% with gradient backgrounds; small "Download" link with `download="Jeevanandham_SeniorHMIEngineer_Resume.pdf"`; small "View" link `target=_blank` `rel="noopener noreferrer"`.

### QT-054 Resume PDF served with correct content type

- **File:** `tests/qualification/links.spec.js` · **Viewports:** S · **Method:** T · **Requirements:** FR-RES-004
- **Step:** `request.get('/Jeevanandham_Resume.pdf')`.
- **Expected:** Status 200; `content-type` starts with `application/pdf`; body length > 100 kB.

### QT-055 Contact section identity

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-CONT-001
- **Expected:** `section#contact[data-section=contact]` text-align centre; label "09 — Contact" (mail); title "Let's Work Together"; baseline sub-paragraph.

### QT-056 Email and phone links

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-CONT-002
- **Expected:** `.c-email` href `mailto:jeevanandhamsivashankaran@gmail.com` (icon mail, amber); `.c-phone` href `tel:+918111010315`, text "+91 8111010315" (icon phone, green).

### QT-057 Social profile links open safely in new tabs

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-CONT-003
- **Expected:** `.c-li` `https://linkedin.com/in/jeevanandhamsivashankaran/` (open_in_new); `.c-bh` `https://behance.net/s_jeevanandham` text "Behance Portfolio" (brush); `.c-gh` `https://github.com/jeevanandhamsivasankar` (terminal); all `target="_blank"` `rel="noopener noreferrer"`.

### QT-058 Contact location line

- **File:** `tests/qualification/content.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-CONT-004
- **Expected:** `.contact-loc` text "Chennai, Tamil Nadu, India" with location_on icon.

### QT-059 Theme attribute set before first paint of the app

- **File:** `tests/qualification/theme.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-THEME-001
- **Preconditions:** Clock at 2026-06-21T06:30:00Z (12:00 IST, day). Init script: MutationObserver on `#root`; on first child, `requestAnimationFrame(() => window.__firstFrameTheme = document.documentElement.dataset.theme)`.
- **Step:** Load; read `__firstFrameTheme`, `data-theme`, computed `--bg`.
- **Step:** Repeat at 23:00 IST (night).
- **Expected:** Day run: `__firstFrameTheme === "day"`, attribute `day`, `--bg` #fef9f0. Night run: `night`, `--bg` #060c18. Attribute is always exactly `day` or `night`.

### QT-060 Automatic theme from Chennai sunrise/sunset (clock-controlled)

- **File:** `tests/qualification/theme.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-THEME-002
- **Preconditions:** Fresh context per instant; `page.clock.install({ time })`.
- **Step:** Load at each instant and read `data-theme`: 2026-06-21 06:30Z (12:00 IST), 17:30Z (23:00 IST), 00:15:40Z (05:45:40 IST), 00:15:55Z (05:45:55 IST), 13:02:00Z (18:32:00 IST), 13:02:10Z (18:32:10 IST); 2026-12-21 01:02:00Z, 01:02:10Z, 12:15:40Z, 12:15:55Z.
- **Expected:** day, night, night, day, day, night; Dec: night, day, day, night. (Windows: day 172 05:45:47–18:32:03 IST, day 355 06:32:03–17:45:47 IST, correction +0.14867 h.) Exact algorithm boundaries and day-of-year rollover: UT-SOLAR.
  auto: Boundary values ±10 s around each switch; equivalence classes day/night.

### QT-061 Auto re-evaluation every 60 s until an override exists

- **File:** `tests/qualification/theme.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-THEME-003
- **Preconditions:** Clock at 2026-06-21T13:01:30Z (18:31:30 IST, day).
- **Step:** Load; `page.clock.runFor(61_000)`; read; `runFor(60_000)`; read.
- **Step:** New context at 2026-06-21T00:15:00Z (night, before sunrise): click toggle (→ day), `runFor(5 * 60_000)` across sunrise; read.
- **Step:** New context with `localStorage['jsv-theme-override']='night'` (via `addInitScript`) at 06:30Z: `runFor(120_000)`.
- **Expected:** First case: `day` after 0 s, `night` after the tick that follows 18:32:03 IST (by 18:33:31). Second: stays `day` (manual). Third: stays `night`. Interval clearing itself: UT-USE_THEME.

### QT-062 Theme toggle button label, icon and manual override

- **File:** `tests/qualification/theme.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-THEME-004
- **Preconditions:** P0 (night).
- **Step:** Read `.theme-btn` title, icon, label; click; read again and `data-theme`.
- **Step:** `runFor` across the next sunrise (clock at 2026-06-21T00:10:00Z variant).
- **Expected:** Night: label "Day" with light_mode; `title="Toggle day/night theme"`. After click: `data-theme="day"`, label "Night" with dark_mode. After the clock passes sunrise/sunset the theme stays as chosen.
  auto: Mobile project uses the menu button (FR-NAV-010); the baseline CSS has no rule hiding the desktop `.theme-btn` at 390 px, so hiding is not asserted.

### QT-063 Theme badge text, ticking clock and mobile hiding

- **File:** `tests/qualification/theme.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-THEME-005
- **Preconditions:** P0; clock at 2026-06-21T17:30:00Z, timezone Asia/Kolkata.
- **Step:** Desktop: read `.theme-badge` text and icon; `page.clock.runFor(61_000)` without scrolling; read again.
- **Step:** Toggle theme; read icon/label.
- **Step:** Mobile and boundary 900/901 widths: badge visibility.
- **Expected:** Text matches `/^(DAY|NIGHT) · \d{2}:\d{2}\s(am|pm)$/i` (e.g. "NIGHT · 11:00 pm"), icon nights_stay; after 61 s the minute changes (11:01); with manual override active the clock still ticks; day shows "DAY" + wb_sunny. Hidden at 390 and 900, visible at 901 and 1366.

### QT-064 Smooth theme transitions (computed style inspection)

- **File:** `tests/qualification/theme.spec.js` · **Viewports:** D · **Method:** T,I · **Requirements:** FR-THEME-006
- **Step:** Read computed `transition-property`/`transition-duration` on `html`, `body`, a `.glass` card, `.theme-btn`; toggle and assert no navigation/reload (same `performance.timeOrigin`).
- **Expected:** html/body background 1.2s and colour 0.6s; cards/controls background 0.8s, border 0.5s, colour 0.4s, shadow 0.5s (verified on `.gauge-widget`, `.profile-info-panel`, `footer`: no element carries `.glass`, and `.theme-btn` has `all 0.3s` from a later baseline rule; as in baseline CSS, cross-checked by UT-STYLE_BASE / UT-STYLE_COMPONENTS); no reload on toggle.

### QT-065 Theme supplied through React Context (static inspection)

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** I · **Requirements:** FR-THEME-007
- **Step:** Read `src/context/ThemeContext.jsx`, `src/components/layout/Nav.jsx`, `src/App.jsx`.
- **Expected:** ThemeContext exports `ThemeProvider` and `useThemeContext`; Nav reads theme via `useThemeContext()` and receives no `theme`/`onToggle` props; App wraps the tree in `<ThemeProvider>`. Behaviour: {IT:theme-toggle}, {IT:ctx-outside}.

### QT-066 Manual theme persists across reloads with guarded storage

- **File:** `tests/qualification/theme.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-THEME-008
- **Preconditions:** Clock at 12:00 IST (day).
- **Step:** Toggle to night; read `localStorage`; reload; read `data-theme`.
- **Step:** New context: `addInitScript` sets `jsv-theme-override` = "foo"; load at 12:00 IST.
- **Step:** New context: `addInitScript` replaces `Storage.prototype.getItem/setItem` with throwing stubs (and variant: `localStorage` getter throws); load; toggle.
- **Expected:** After reload `night` (despite the day clock); `localStorage` has exactly one key `jsv-theme-override` = "night". "foo" → automatic `day`. Throwing storage → automatic theme, toggle still flips, zero console errors and page errors.

### QT-067 Gradient orbs

- **File:** `tests/qualification/effects.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-FX-001
- **Expected:** `.orbs-wrap[aria-hidden=true]` fixed; 4 `.orb` with `pointer-events: none`; widths 700/600/500/400 px; blur 60–80 px; animation durations 20s/25s/18s/28s; colours differ between night and day themes.

### QT-068 Cursor glow follows the pointer and hides under reduced motion

- **File:** `tests/qualification/effects.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-FX-002
- **Step:** Read initial left/top; `page.mouse.move(400, 300)`; wait one frame.
- **Step:** Variant with `reducedMotion: 'reduce'`.
- **Expected:** Initial -500px/-500px; after move left 400px, top 300px; `aria-hidden`; width 380px; transition 60ms linear. Reduced motion: `.cursor-glow` absent or `display: none`.

### QT-069 Seeded particles: count, ranges, reproducibility and reduced motion

- **File:** `tests/qualification/effects.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-FX-003
- **Step:** Read all `.particle` inline styles; reload in a new context; read again.
- **Step:** Variant with reduced motion.
- **Expected:** 18 particles; left 0–100%, top 20–90%, size 1.5–4 px, `--dur` 4–9 s, `--delay` 0–6 s, `--dx` ±30 px, opacity 0.3–0.8, colour in {#f59e0b,#22d3ee,#34d399,#a78bfa,#fb7185}; both loads identical (seeded). Reduced motion: none visible.

### QT-070 Hero rings

- **File:** `tests/qualification/effects.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-FX-004
- **Expected:** 4 `.hring` (580, 440, 300, 180 px; ring 3 dashed border); animation durations 80s, 55s, 36s, 24s with alternating direction.

### QT-071 Reveal-on-scroll including lazy sections and stagger classes

- **File:** `tests/qualification/effects.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-FX-005
- **Step:** On load, read opacity of a below-the-fold `.reveal` (e.g. first `.cert-card`).
- **Step:** Scroll through the page in half-viewport steps (jumping to each section top does not intersect elements in the middle of tall sections); wait 500 ms.
- **Expected:** Before: opacity 0 / translateY(30px), no `visible`. After: every `.reveal` in every section has `visible`. Stagger classes: stat cards d0–d3; exp items d0,d1,d2,d3; skill categories d<i mod 3>; project and design cards d<i mod 2>; cert cards d0–d2 (class names match baseline snapshot).

### QT-072 Section order, ids and dividers

- **File:** `tests/qualification/general.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-GEN-001
- **Expected:** `[data-section]` ids in DOM order: hero, about, experience, skills, projects, design, education, certifications, resume, contact; each element `id === data-section`, ids unique; 9 `.divider` inside `main`.

### QT-073 Registry is the single definition of sections (static inspection)

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** I · **Requirements:** FR-GEN-002
- **Step:** Search `src/` (excluding `config/sections.js`, `sections/*` and `data/*`) for ordered section-id lists or nav labels ("Certs", "certifications").
- **Expected:** Only `config/sections.js` defines order, ids, nav labels and icons; App and Nav import `SECTIONS`/`NAV_ITEMS`. Extensibility behaviour: {IT:registry-extend}.

### QT-074 Section labels and headings

- **File:** `tests/qualification/general.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-GEN-003
- **Expected:** 9 `.section-label` texts "01 — About" … "09 — Contact" in order, each with a 13 px icon; 8 `h2.section-title`; none inside `#resume`; `#resume` has `h3` "Download My Resume"; Hero has no label.

### QT-075 Footer text

- **File:** `tests/qualification/general.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** FR-GEN-004
- **Expected:** `footer` text (ligatures excluded) "© 2026 S. JEEVANANDHAM — SENIOR HMI ENGINEER — BUILT WITH PRECISION" with a developer_board icon on each side.

### QT-076 Lazy sections still navigable; deep link to a lazy section

- **File:** `tests/qualification/general.spec.js` · **Viewports:** D,M · **Method:** T,A · **Requirements:** FR-GEN-005
- **Step:** Analysis: list `dist/assets/*.js`; map to section names via `dist/.vite/manifest.json` if present, else by file-name prefix.
- **Step:** Fresh load; immediately click "Contact" (desktop) / menu "Contact" (mobile).
- **Step:** Fresh load of `/#resume`.
- **Expected:** Separate chunks exist for About, Experience, Skills, Projects, Design, Education, Certifications, Resume, Contact; none for Hero/Nav. Click lands with `#contact` rendered and its label visible below the 54 px nav (Contact is the last section; the page bottom prevents its top reaching the nav). Deep link: `#resume` section label in viewport after load settles.

### QT-077 Validated, frozen content ships without load-time errors

- **File:** `tests/qualification/general.spec.js` · **Viewports:** D · **Method:** A,T · **Requirements:** FR-GEN-006
- **Step:** Load and scroll through; collect page errors.
- **Step:** Static: every `src/data/*.js` imports from `models/` and builds exports via `create*` factories.
- **Expected:** No page error (a failing factory would throw at module evaluation and blank the app); all sections render. Factory behaviour (throws naming entity/field, frozen): UT-CREATE_MODELS, UT-DATA_*, {IT:data-load}, {IT:data-invalid}.

### QT-078 A failing lazy section is contained by its ErrorBoundary

- **File:** `tests/qualification/general.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-GEN-007
- **Preconditions:** `page.route('**/assets/Projects-*.js', r => r.abort())`.
- **Step:** Load and scroll through.
- **Expected:** `#projects` area shows the section fallback text ("Section failed to load") with a Reload button; all other 9 sections render; nav and footer present; no blank page. Render-error isolation: {IT:eb-section}.

### QT-079 Responsive grid column counts at both breakpoints

- **File:** `tests/qualification/general.spec.js` · **Viewports:** D,M,R · **Method:** T · **Requirements:** FR-GEN-008
- **Step:** For widths 1366, 901, 900, 541, 540, 390, 320 read resolved `grid-template-columns` track counts of `.hero` (desktop grid), `.about-grid`, `.projects-grid`, `.behance-grid`, `.edu-grid`, `.resume-grid`, `.certs-grid` (markup has `.resume-inner` and no `.skills-grid` element, also in baseline, so the skills rule is not observable), and section horizontal padding.
- **Expected:** > 900: baseline desktop counts. ≤ 900: hero/about/projects/design/education/resume 1; skills and certifications 2; padding-left/right 24px. ≤ 540: skills and certifications 1; buttons full width. Visual equality: {QT:visual-night}, {QT:visual-day}.

### QT-080 noscript message without JavaScript

- **File:** `tests/qualification/general.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** FR-GEN-009
- **Preconditions:** `browser.newContext({ javaScriptEnabled: false })`.
- **Expected:** Text "This portfolio needs JavaScript enabled to display." visible.

### QT-081 Baseline micro-interactions

- **File:** `tests/qualification/effects.spec.js` · **Viewports:** D · **Method:** T,I · **Requirements:** FR-GEN-010
- **Step:** Hover the first stat card; project card 1 then move away; "Qt / QML" chip; first design card; `.c-email`.
- **Step:** Read `animation-delay` on hero entry elements.
- **Expected:** Stat card border rgba(245,158,11,0.4) and shadow `0 16px 48px` tint; project card inline border-color #34d39999 then restored to its `border` value, top line scaleX(1); chip label rgb(65,205,82), translateY(-2px) scale(1.02); `.bc-cta` gap 10px (6px before); `.c-email` background rgba(245,158,11,0.12); fadeUp delays 0.15/0.28/0.42/0.52/0.62/0.72 s; sheen pseudo-element and body grid/glow verified by CSS inspection (UT-STYLE_*) and screenshots.

### QT-082 Entry chunk gzip size does not exceed the baseline

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** A · **Requirements:** NFR-PERF-001
- **Preconditions:** `dist/` built by the webServer step; baseline file `tests/qualification/baseline/bundle-baseline.json` (gzip bytes of the dd9a86d entry chunk, measured with the same method; provisional SADS figure 84.79 kB).
- **Step:** Parse `dist/index.html` for the `<script type="module">` entry; gzip it with `zlib.gzipSync(buf, { level: 9 })`.
- **Expected:** Entry gzip ≤ baseline; actual value written to the test annotations and copied to TEST_REPORT.

### QT-083 Lazy chunks are separate and not needed for the first hero render

- **File:** `tests/qualification/performance.spec.js` · **Viewports:** D,S · **Method:** A,T · **Requirements:** NFR-PERF-002
- **Step:** Analysis: count section chunks in `dist/assets` (as {QT:FR-GEN-005}).
- **Step:** Route section chunks with a 3 s delay; load; wait for `h1` visible.
- **Expected:** 9 separate section chunks; the hero `h1` and nav are visible while every section chunk request is still pending (requests logged with timestamps).

### QT-084 Profile image preload, explicit size and CLS

- **File:** `tests/qualification/performance.spec.js` · **Viewports:** M · **Method:** I,A · **Requirements:** NFR-PERF-003
- **Step:** Read `dist/index.html` for the preload link; read `img.profile-photo` attributes.
- **Step:** Init script registers `PerformanceObserver({ type: 'layout-shift', buffered: true })`; load at 390x844, wait 3 s, sum shifts without recent input.
- **Expected:** `<link rel="preload" as="image" href="/profile.webp" type="image/webp">` present; img width 600 height 900; CLS < 0.1. Lighthouse CLS recorded with {QT:NFR-PERF-005}.

### QT-085 Passive listeners and cleanup

- **File:** `tests/qualification/performance.spec.js` · **Viewports:** D · **Method:** T,A · **Requirements:** NFR-PERF-004
- **Step:** Init script wraps `EventTarget.prototype.addEventListener` and records type/options for scroll, wheel, touchmove, mousemove.
- **Expected:** Every scroll/mousemove/touchmove listener registered by the app has `passive: true`. Release on unmount (StrictMode): UT evidence for every hook/component (UT-USE_*, UT-SPEEDOMETER, UT-CURSOR_GLOW) and {IT:strict} (analysis).

### QT-086 Lighthouse mobile performance score

- **File:** `tests/qualification/performance.spec.js` · **Viewports:** M · **Method:** A · **Requirements:** NFR-PERF-005
- **Preconditions:** Pre-release gate, manual; `npx lighthouse@12 http://localhost:4173 --form-factor=mobile --only-categories=performance --output=json` against `vite preview` (no project dependency added).
- **Expected:** Performance score ≥ 80; JSON report attached to TEST_REPORT. Not part of the automated suite (network/CPU variance).

### QT-087 Speedometer loop runs only when visible

- **File:** `tests/qualification/performance.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** NFR-PERF-006
- **Preconditions:** Init script wraps `window.requestAnimationFrame` to count calls.
- **Step:** Mobile 390x844: load, wait for network idle + 1 s, snapshot count, wait 2 s, read count.
- **Step:** Desktop: count over 1 s with hero in view; scroll to `#contact` (instant), wait 300 ms, snapshot, wait 2 s.
- **Step:** Desktop: emulate hidden tab (`document.visibilityState` via CDP `Emulation.setFocusEmulationEnabled` / `Page.setWebLifecycleState frozen` fallback) and count.
- **Expected:** Mobile: 0 new calls over 2 s. Desktop in view: > 0. After scrolling to contact: no increase over 2 s. Hidden tab: no increase. Scroll back to top: count increases again and speed text continues from the previous value (not reset to the t=0 frame).
  auto: Other rAF users (useActiveSection coalescing, CursorGlow) only fire on scroll/pointer; the test performs no input during counting windows.

### QT-088 CSS reduced-motion behaviour

- **File:** `tests/qualification/a11y.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** NFR-A11Y-001
- **Preconditions:** `emulateMedia({ reducedMotion: 'reduce' })`.
- **Expected:** `.particle` and `.cursor-glow` not displayed; `html` `scroll-behavior: auto`; a sample animated element (`.hring`, `.orb`) has animation-duration ≤ 0.01ms and iteration count 1; transitions ≤ 0.01ms.

### QT-089 JS-driven motion disabled under reduced motion

- **File:** `tests/qualification/a11y.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** NFR-A11Y-002
- **Preconditions:** Reduced motion emulated; clock installed.
- **Step:** Read speed text and typewriter text; `runFor(3000)`; read again; move the mouse to the right edge.
- **Expected:** Speed text unchanged; typewriter shows "Qt / QML Developer" statically and unchanged; `.profile-card` has no transform.

### QT-090 Landmarks, heading structure and language

- **File:** `tests/qualification/a11y.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** NFR-A11Y-003
- **Expected:** `html[lang=en]`; exactly one `nav`, one `main`, one `footer` (by role); exactly one `h1`; no heading level skips more than one level downward in DOM order (h1 → h2, Resume h3 after the previous h2).

### QT-091 Image alternatives and decorative layers

- **File:** `tests/qualification/a11y.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** NFR-A11Y-004
- **Expected:** Every `img` has an `alt` attribute; profile alt "S. Jeevanandham"; `si:` chip images alt = slug; `.orbs-wrap`, `.cursor-glow`, particle container, `.hero-rings` are `aria-hidden="true"` (or carry no semantics: no role, no text).

### QT-092 Keyboard reachability, order and focus visibility

- **File:** `tests/qualification/a11y.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** NFR-A11Y-005
- **Step:** Desktop: press Tab repeatedly from the top, recording `document.activeElement`; press Enter on the "Skills" link.
- **Step:** Mobile: Tab to the hamburger; press Enter, close, press Space.
- **Expected:** Order: skip link, (logo is not focusable), 9 nav links in DOM order, theme toggle, then hero CTAs; Enter on "Skills" scrolls `#skills` to the top; every focused element has non-`none` outline or box-shadow. Mobile: hamburger reachable; Enter and Space each open the menu.

### QT-093 Text contrast in both themes

- **File:** `tests/qualification/a11y.spec.js` · **Viewports:** D · **Method:** T,A · **Requirements:** NFR-A11Y-006
- **Step:** For each theme, `page.evaluate` walks visible text elements (excluding `aria-hidden` subtrees and the purely decorative labels listed in the QT fixture, e.g. the gauge label "HMI CLUSTER DEMO"), resolves foreground colour and the effective opaque background by compositing ancestors, computes WCAG contrast.
- **Expected:** No body or interactive text below 4.5:1 (3:1 for ≥ 24 px or ≥ 18.66 px bold). Elements over translucent glass or gradients that cannot be resolved are listed and checked manually (analysis) in TEST_REPORT.
  auto: No axe-core dependency (not in the allowed dev-dependency list); implementation per SADS §8.4.

### QT-094 Icon ligatures are not announced

- **File:** `tests/qualification/a11y.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** NFR-A11Y-007
- **Expected:** Accessible names: "View Projects", "About" (nav), theme toggle, email contact link contain no ligature words (rocket_launch, person, light_mode, dark_mode, mail); every element whose computed font-family includes "Material Symbols" has `aria-hidden="true"`.
  auto: `getByRole('link', { name: 'View Projects', exact: true })` must resolve; ARIA snapshot comparison.

### QT-095 Skip link

- **File:** `tests/qualification/a11y.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** NFR-A11Y-008
- **Step:** Without focus, read the skip link bounding box; take a hero screenshot.
- **Step:** Press Tab once; read focused element, text, box, z-index; press Enter.
- **Expected:** Unfocused: not visible in the viewport (off-screen), screenshot equals baseline. After Tab: focused `a` "Skip to content", box inside the viewport, non-zero size, z-index > 300. After Enter: `document.activeElement` is `main#main` (tabindex -1).

### QT-096 Keyboard-only focus-visible outline in both themes

- **File:** `tests/qualification/a11y.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** NFR-A11Y-009
- **Step:** Tab to "View Projects"; read `outline-style`, `outline-color`, `outline-offset`, compare with computed `--amber`.
- **Step:** Toggle to day and repeat.
- **Step:** Mouse-click "View Projects" (prevent navigation via a route-less hash; restore scroll) and read the outline.
- **Expected:** (outline-width is read after 350–400 ms because `transition: all` animates it.) Keyboard: `solid`, colour = `--amber` (rgb(245,158,11) night; rgb(180,83,9) day), 2px, offset 2px. Mouse: outline `none`.

### QT-097 All new-tab links carry rel noopener noreferrer

- **File:** `tests/qualification/security.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** NFR-SEC-001
- **Expected:** For every `a[target=_blank]` after full load: `rel` contains both `noopener` and `noreferrer`; count ≥ 10 (5 design, 3 social, View Online, preview View; the baseline markup has 10).

### QT-098 No third-party scripts; origin allowlist; no CSP violations

- **File:** `tests/qualification/security.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** NFR-SEC-002
- **Step:** Record every request (`page.on('request')`, fires even for aborted ones) during load and scroll-through; record console messages.
- **Expected:** All `script` resource types are same-origin; every non-self origin ∈ {fonts.googleapis.com, fonts.gstatic.com, cdn.simpleicons.org}; no console message containing "Content Security Policy" (ADR-013).

### QT-099 No unsafe sinks, no cookies, no personal data collection

- **File:** `tests/qualification/security.spec.js` · **Viewports:** D,S · **Method:** I,T · **Requirements:** NFR-SEC-003
- **Step:** Static: grep `src/**` for `dangerouslySetInnerHTML`, `eval(`, `new Function`, `.innerHTML =`, `document.write`.
- **Step:** Runtime: `document.cookie` after load; `form`, `input`, `textarea` count.
- **Expected:** No matches; cookie string empty; no form controls.

### QT-100 Rendered URLs use only allowed schemes

- **File:** `tests/qualification/security.spec.js` · **Viewports:** D · **Method:** T,A · **Requirements:** NFR-SEC-004
- **Step:** Collect every `href` and `src` attribute (raw attribute values) after full load.
- **Expected:** Each matches `^(https:|mailto:|tel:|#|/|[A-Za-z0-9_./-]+$)`; none starts with `javascript:`, `data:`, `vbscript:`, `http:`. Factory rejection of unsafe URLs: UT-VALIDATE and UT-CREATE_MODELS evidence.

### QT-101 npm audit of runtime dependencies

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** A · **Requirements:** NFR-SEC-005
- **Preconditions:** Network access to the npm registry (pre-release gate; skipped offline with an annotation).
- **Step:** `npm audit --omit=dev --audit-level=high --json`.
- **Expected:** Exit code 0; `metadata.vulnerabilities.high + critical === 0`; JSON attached to TEST_REPORT.

### QT-102 Module layout and thin composition root

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** I · **Requirements:** NFR-MAINT-001
- **Step:** Assert existence of every file in the brief's target layout (config, models, data, context, hooks, lib incl. storage.js, components/{ui,tech,effects,widgets,layout}, sections, styles).
- **Step:** Scan `src/App.jsx`.
- **Expected:** All present; App contains no `<style`, no CSS template, no content strings (owner name, company names, section headings) and imports only allowed modules.

### QT-103 One-way dependencies, React-free models and lib

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** A · **Requirements:** NFR-MAINT-002
- **Step:** Parse `import` specifiers under `src/` (regex via `node:fs`) and evaluate the SADS §4.3.2 rule table; detect cycles (DFS).
- **Expected:** No forbidden import, no `react` import in `models/` or `lib/`, no cycle, nothing imports `App.jsx`/`main.jsx`. (Same rule set as {IT:arch}; QT records the result at release level.)

### QT-104 CSS moved unchanged and no runtime style injection

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** A · **Requirements:** NFR-MAINT-003
- **Step:** Extract the CSS template string from `git show dd9a86d:src/App.jsx`; concatenate `styles/tokens.css, base.css, components.css, sections.css` per `index.css` order; normalise (strip comments, collapse whitespace, split into rule blocks).
- **Step:** Runtime: count `<style>` elements in the rendered page.
- **Expected:** Multiset of rules equal except the allow-listed additions (`.skip-link`, `.skip-link:focus`, `:focus-visible`, `:focus:not(:focus-visible)`) and the Amendment R1 allowed differences (DEF-012: added `-webkit-backdrop-filter` declarations; DEF-021: `color` of `.exp-company-loc` and `.contact-loc`); relative order of rules sharing a selector preserved; `index.css` imports exactly the four files; no `<style>` element created by the app.

### QT-105 Lint passes

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** A · **Requirements:** NFR-MAINT-004
- **Step:** `npm run lint` (child process).
- **Expected:** Exit 0, zero errors (warnings listed). CI lint step result attached.

### QT-106 Coverage thresholds enforced and met

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** A · **Requirements:** NFR-MAINT-005
- **Step:** Inspect `vitest.config.js` `coverage.thresholds` (global lines 80; per-glob `src/models/**`, `src/lib/**`, `src/hooks/**` lines 90); read `coverage/coverage-summary.json` from the latest `npm run test:coverage`.
- **Expected:** Thresholds configured as stated; summary meets them.

### QT-107 JSDoc typedefs and factory signatures

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** I · **Requirements:** NFR-MAINT-006
- **Step:** Parse `src/models/types.js` for `@typedef`; parse `createModels.js` for JSDoc blocks preceding each exported `create*`.
- **Expected:** Typedefs for Profile, Photo, Stat, GaugeStat, Section, Experience, SkillCategory, Skill, Project, DesignCard, Education, Certification, ContactLink, ResumeInfo, ResumeSkill, Highlight; every factory has `@param` and `@returns`.

### QT-108 Only react and react-dom as runtime dependencies

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** I · **Requirements:** NFR-MAINT-007
- **Expected:** `Object.keys(package.json.dependencies).sort()` equals `["react","react-dom"]`.

### QT-109 Visual regression vs baseline dd9a86d (night theme)

- **File:** `tests/qualification/visual.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** NFR-MAINT-008, FR-GEN-008, FR-GEN-010
  key: visual-night
- **Preconditions:** Clock paused at 2026-06-21T17:30:00Z (23:00 IST) before navigation; fresh storage; mouse not moved; all sections loaded and revealed (`loadAllSections`), then scroll to top.
- **Step:** `toHaveScreenshot` of each section element (`#hero` … `#contact`), nav and footer, plus full page; options `animations: 'disabled'`, `caret: 'hide'`, mask `[.particle, .gauge-widget svg, .hero-typewriter]`.
- **Expected:** Each element screenshot within `maxDiffPixelRatio: 0.001` and `threshold: 0.2`; full page within `maxDiffPixelRatio: 0.002`. Baselines generated from dd9a86d (§4.6).

### QT-110 Visual regression vs baseline dd9a86d (day theme)

- **File:** `tests/qualification/visual.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** NFR-MAINT-008, FR-GEN-008, FR-GEN-010
  key: visual-day
- **Preconditions:** As {QT:visual-night} with clock at 2026-06-21T06:30:00Z (12:00 IST, day in both baseline and candidate).
- **Expected:** Same thresholds as {QT:visual-night}.

### QT-111 Text-content and class-name parity snapshot

- **File:** `tests/qualification/visual.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** NFR-MAINT-008
  key: text-parity
- **Step:** After full load, serialise `main`, nav, mobile menu and footer to a list of `{tag, className, ownText}` in DOM order (ignoring text inside masked dynamic nodes and the allow-listed additions: skip link, aria attributes, `id="main"`, `download` value changes).
- **Expected:** Identical to the baseline JSON captured from dd9a86d.

**Allowed differences vs baseline (NFR-MAINT-008; applies to QT-104, QT-109..111, IT-039, UT-STYLE_INDEX-002):** skip link and its CSS, aria attributes, `id="main"`/`tabindex`, theme set before first paint, unified resume download name, and, from Amendment R1: **DEF-012** `-webkit-backdrop-filter` declarations paired with every `backdrop-filter` (renders identically in Chromium); **DEF-021** `color` of `.exp-company-loc` and `.contact-loc` changed to a token meeting 4.5:1 in both themes (the visual tests restore the baseline colour on these two selectors in the candidate capture).

### QT-112 Cross-browser support (Chromium automated, others demonstrated)

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** T,I,D · **Requirements:** NFR-PORT-001
- **Step:** Static: every `backdrop-filter` declaration in `src/styles/*.css` has a sibling `-webkit-backdrop-filter` with the same value.
- **Step:** Manual demonstration before release on Firefox, Safari (macOS), Edge, iOS Safari 16+, Android Chrome: load, toggle theme, open the mobile menu, download the resume, scroll through.
- **Expected:** Static pairs complete; demonstration checklist all pass and is recorded in TEST_REPORT (browser, version, device, tester, date).

### QT-113 No horizontal scroll from 320 to 2560 px

- **File:** `tests/qualification/general.spec.js` · **Viewports:** R · **Method:** T · **Requirements:** NFR-PORT-002
- **Step:** For widths 320, 390, 540, 541, 900, 901, 1366, 2560 load, scroll through, read `scrollWidth` and `innerWidth`.
- **Expected:** `document.documentElement.scrollWidth <= window.innerWidth` at every width.

### QT-114 Theme independent of the visitor's time zone

- **File:** `tests/qualification/theme.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** NFR-PORT-003
- **Step:** For each `timezoneId` in Asia/Kolkata, America/New_York, Europe/London, Pacific/Kiritimati, Pacific/Pago_Pago, Australia/Lord_Howe: load at the same instants (12:00 IST, 23:00 IST, 05:45:55 IST on 2026-06-21) and at instants within 1 h of a DST change (2026-03-08T06:30Z, 2026-03-29T00:30Z, 2026-11-01T05:30Z).
- **Expected:** `data-theme` identical across all zones for each instant. Algorithm-level evidence: UT-SOLAR TZ cases.

### QT-115 Resume and contact within two interactions

- **File:** `tests/qualification/usability.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** NFR-USAB-001
- **Expected:** On load the Hero "Resume" link is visible in the viewport (desktop and mobile, no scroll); contact email visible after one nav click (desktop) or menu open + tap (mobile = 2 interactions).

### QT-116 Section label not hidden under the fixed nav after navigation

- **File:** `tests/qualification/usability.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** NFR-USAB-002
- **Step:** For each of the 9 nav links: click, wait for scroll to settle, read the target `.section-label` box and nav box.
- **Expected:** Label top ≥ nav bottom (64 px, or 54 px when scrolled) for every section.

### QT-117 Touch target sizes

- **File:** `tests/qualification/usability.spec.js` · **Viewports:** M · **Method:** T · **Requirements:** NFR-USAB-003
- **Expected:** Mobile-menu links, theme button, hamburger and the 5 contact links each ≥ 24 x 24 CSS px (pass/fail); any dimension < 44 px is logged as an informational annotation.

### QT-118 No uncaught errors or console errors after a full scroll-through

- **File:** `tests/qualification/resilience.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** NFR-RELI-001
- **Step:** Collect `pageerror` and `console` (type error and warning) through load, full scroll, theme toggle, menu use (mobile).
- **Expected:** Zero page errors; zero console errors; zero React warnings. (Expected aborted-font request messages are filtered by URL.)

### QT-119 Usable with Google Fonts blocked

- **File:** `tests/qualification/resilience.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** NFR-RELI-002
- **Step:** Assert fonts requests were attempted and aborted (request log).
- **Expected:** All 9 section titles/headings and the `h1` visible with non-zero boxes; nav usable; body font-family resolves to fallback; no layout overflow ({QT:NFR-PORT-002} check reused).

### QT-120 Layout intact with Simple Icons CDN blocked

- **File:** `tests/qualification/resilience.spec.js` · **Viewports:** D,M · **Method:** T · **Requirements:** NFR-RELI-003
- **Preconditions:** `cdn.simpleicons.org` aborted.
- **Expected:** 58 `.skill-chip` visible; no broken `img`; chip heights uniform within a category (±1 px); skills grid column count unchanged vs CDN-available run.

### QT-121 StrictMode correctness (analysis of IT evidence)

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** A · **Requirements:** NFR-RELI-004
- **Step:** Confirm `src/main.jsx` renders inside `React.StrictMode` (static); confirm {IT:strict} passed in the same run (read Vitest JSON report).
- **Expected:** StrictMode present; {IT:strict} (single theme interval, single clock interval, one live observer per section) passed. Production builds do not double-invoke, so qualification relies on IT evidence.

### QT-122 Content visible when IntersectionObserver is missing

- **File:** `tests/qualification/resilience.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** NFR-RELI-005
- **Preconditions:** `addInitScript(() => { delete window.IntersectionObserver })`.
- **Expected:** Every `.reveal` has `visible` after the sections load (no scroll needed); no page error; the gauge still animates on desktop (useInView fallback).

### QT-123 Title and core meta tags

- **File:** `tests/qualification/seo.spec.js` · **Viewports:** S · **Method:** T · **Requirements:** NFR-SEO-001
- **Expected:** `<title>` "S. Jeevanandham · Senior HMI Engineer"; meta description non-empty; meta author "S. Jeevanandham"; theme-color "#060c18"; canonical `https://jeevanandhamsivasankar.github.io/`.

### QT-124 Open Graph and Twitter tags and OG image

- **File:** `tests/qualification/seo.spec.js` · **Viewports:** S · **Method:** T · **Requirements:** NFR-SEO-002
- **Expected:** og:type website; og:url canonical; og:title; og:description; og:image `https://jeevanandhamsivasankar.github.io/profile-og.jpg`; twitter:card summary; GET `/profile-og.jpg` 200 with `image/*`.

### QT-125 SVG favicon

- **File:** `tests/qualification/seo.spec.js` · **Viewports:** S · **Method:** T · **Requirements:** NFR-SEO-003
- **Expected:** `link[rel=icon][type="image/svg+xml"][href="/favicon.svg"]`; GET 200 `image/svg+xml`.

### QT-126 Static build output with root base

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** A · **Requirements:** NFR-DEPLOY-001
- **Expected:** `vite.config.js` has `base: '/'` (or default); `dist/` contains index.html, Jeevanandham_Resume.pdf, profile.webp, profile-og.jpg, favicon.svg; asset URLs in `dist/index.html` start with `/assets/`.

### QT-127 Deploy script unchanged

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** I · **Requirements:** NFR-DEPLOY-002
- **Expected:** `package.json` `scripts.deploy === "gh-pages -d dist"`; `gh-pages` in devDependencies.

### QT-128 CI workflow gates lint, test and build

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** I,A · **Requirements:** NFR-DEPLOY-003
- **Step:** Parse `.github/workflows/ci.yml` (line-based; no YAML dependency).
- **Step:** Analysis (one-off, recorded): a throw-away PR branch with a deliberately failing UT shows a red CI job.
- **Expected:** Triggers `push: branches: [main]` and `pull_request`; Node 22; steps in order `npm ci`, `npm run lint`, `npm test`, `npm run build`; no `continue-on-error`. Failing-test evidence linked in TEST_REPORT.

### QT-129 Qualification tests run in CI against vite preview

- **File:** `tests/qualification/static.spec.js` · **Viewports:** S · **Method:** I · **Requirements:** NFR-DEPLOY-004
- **Expected:** ci.yml installs Playwright Chromium and runs `npm run test:qualification`; `playwright.config.js` webServer runs `vite preview` on 4173 after `npm run build`; report artefact uploaded.

### QT-130 Internal anchors and same-origin assets resolve

- **File:** `tests/qualification/links.spec.js` · **Viewports:** D · **Method:** T · **Requirements:** NFR-DEPLOY-005
- **Step:** After full load, collect `a[href^="#"]` and same-origin `href`/`src` URLs (links, images, preload, icons, PDF).
- **Expected:** Every `#id` target exists (`#main` included); every same-origin asset GET returns 200.

## 3. Integration test cases (SWE.5)

### IT-001 Entry renders StrictMode > page ErrorBoundary > App into #root and imports global CSS once

- **File:** `tests/integration/bootstrap.test.jsx` · **ARC:** ARC-001, ARC-015, ARC-002, ARC-017 · **Requirements:** FR-GEN-007, NFR-RELI-004, NFR-MAINT-003 · **Units:** UNIT-MAIN, UNIT-ERROR_BOUNDARY, UNIT-APP, UNIT-STYLE_INDEX
- **Preconditions:** `vi.mock('react-dom/client')` capturing `createRoot` and `render`; `document.body.innerHTML = '<div id="root"></div>'`.
- **Step:** `await import('../../src/main.jsx')`.
- **Expected:** `createRoot` called once with `#root`; rendered element tree is `StrictMode` > `ErrorBoundary` > `App`; `styles/index.css` is the only CSS import in `src/**/*.js(x)` (static scan).

### IT-002 ThemeProvider + Nav toggle -> html[data-theme] -> localStorage

- **File:** `tests/integration/theme.test.jsx` · **ARC:** ARC-008, ARC-009, ARC-014, ARC-007, ARC-002 · **Requirements:** FR-THEME-004, FR-THEME-007, FR-THEME-008, FR-NAV-010 · **Units:** UNIT-THEME_CONTEXT, UNIT-USE_THEME, UNIT-NAV, UNIT-STORAGE, UNIT-APP
- **Preconditions:** Fake timers, system time 2026-06-21T17:30:00Z (night); `localStorage.clear()`.
- **Step:** Render `<App />`; click `.theme-btn` in the nav; then click the mobile-menu theme button.
- **Expected:** After the first click `document.documentElement.dataset.theme === 'day'`, nav label "Night", badge "DAY"; `localStorage.getItem('jsv-theme-override') === 'day'`; second click returns to `night`, storage `night`, mobile menu closed; storage holds exactly one key.

### IT-003 Theme-before-paint: attribute set in the provider's layout phase, no night frame for day visitors

- **File:** `tests/integration/theme.test.jsx` · **ARC:** ARC-008, ARC-009 · **Requirements:** FR-THEME-001 · **Units:** UNIT-THEME_CONTEXT, UNIT-USE_THEME, UNIT-SOLAR
- **Preconditions:** System time 2026-06-21T06:30:00Z (12:00 IST, day); `data-theme` removed from `<html>`; a probe child records the attribute in its own `useEffect` (passive) and the provider's commit is observed with a `MutationObserver` on `<html>` that records the first attribute value.
- **Step:** `render(<ThemeProvider><Probe/></ThemeProvider>)` (React `act`).
- **Expected:** The first recorded attribute value is `day` (never `night`); the probe's passive effect already sees `day` (layout effect ran before passive effects); only one attribute write occurs for the initial render.

### IT-004 Override persistence across remount (simulated reload)

- **File:** `tests/integration/theme.test.jsx` · **ARC:** ARC-008, ARC-009, ARC-007 · **Requirements:** FR-THEME-008, FR-THEME-003, FR-THEME-001 · **Units:** UNIT-USE_THEME, UNIT-STORAGE, UNIT-THEME_CONTEXT
- **Preconditions:** Fake timers at 12:00 IST (day); empty storage.
- **Step:** Render provider + Nav; toggle to `night`; unmount; advance 10 min; render a fresh provider + Nav (remount); advance 3 x 60 s.
- **Expected:** After remount the first committed attribute is `night` (override applied before paint); no theme interval is active (`setInterval` spy shows only the clock interval); theme stays `night` across the ticks while the badge clock still advances.

### IT-005 Storage failure modes fall back to the automatic theme without errors

- **File:** `tests/integration/theme.test.jsx` · **ARC:** ARC-008, ARC-007 · **Requirements:** FR-THEME-008 · **Units:** UNIT-USE_THEME, UNIT-STORAGE
- **Preconditions:** Variants: `Storage.prototype.getItem` throws; `setItem` throws `QuotaExceededError`; stored value "foo"; `localStorage` getter on `window` throws (`Object.defineProperty`).
- **Step:** Render `<App />` at 12:00 IST; toggle once.
- **Expected:** Initial theme `day` (automatic) in every variant; toggle flips to `night` for the page lifetime; `console.error` spy not called; nothing thrown.

### IT-006 Auto switch across sunset and manual toggle stopping it

- **File:** `tests/integration/theme.test.jsx` · **ARC:** ARC-008, ARC-009, ARC-014, ARC-007 · **Requirements:** FR-THEME-003, FR-THEME-004 · **Units:** UNIT-USE_THEME, UNIT-NAV, UNIT-SOLAR
- **Preconditions:** Fake timers at 2026-06-21T13:01:30Z (18:31:30 IST).
- **Step:** Render `<App />`; advance 60 s twice.
- **Step:** Remount at 00:15:00Z (before sunrise, night); toggle to day; advance 5 min across sunrise.
- **Expected:** First case flips to `night` on the first tick after 18:32:03 IST and the nav badge changes to NIGHT; second case stays `day`.

### IT-007 Badge clock refreshes every 60 s with and without override

- **File:** `tests/integration/theme.test.jsx` · **ARC:** ARC-008, ARC-014 · **Requirements:** FR-THEME-005 · **Units:** UNIT-USE_THEME, UNIT-THEME_CONTEXT, UNIT-NAV
- **Preconditions:** Fake timers at 2026-06-21T17:30:00Z, `process.env.TZ='Asia/Kolkata'`.
- **Step:** Render `<App />`; read badge; advance 60 s; read; toggle; advance 60 s; read.
- **Expected:** "NIGHT · 11:00 pm" → "NIGHT · 11:01 pm" → after toggle "DAY · 11:02 pm" (format via `toLocaleTimeString('en-IN', …)`, whitespace matched with `\s`).

### IT-008 Context contract and use outside the provider

- **File:** `tests/integration/theme.test.jsx` · **ARC:** ARC-008 · **Requirements:** FR-THEME-007 · **Units:** UNIT-THEME_CONTEXT
- **Step:** Render a consumer inside `ThemeProvider`; render the same consumer without a provider.
- **Expected:** Inside: receives `{ theme, isDay, toggle, now }` with `theme ∈ {day, night}`, `isDay === (theme === 'day')`, `now instanceof Date`. Outside: throws `Error('useThemeContext must be used within ThemeProvider')`.

### IT-009 Section registry -> App render order and dividers

- **File:** `tests/integration/registry.test.jsx` · **ARC:** ARC-002, ARC-004, ARC-014, ARC-016 · **Requirements:** FR-GEN-001, FR-NAV-003 · **Units:** UNIT-APP, UNIT-CONFIG_SECTIONS, UNIT-DIVIDER
- **Step:** Render `<App />`; `await` all lazy sections (`findAllBy` on `[data-section]` until 10 and no placeholder marker).
- **Expected:** `[data-section]` ids in DOM order equal `SECTIONS.map(s => s.id)`; each section's `id === data-section`; 9 `.divider` elements, one between each consecutive pair inside `main`.

### IT-010 Nav links derived from NAV_ITEMS

- **File:** `tests/integration/registry.test.jsx` · **ARC:** ARC-004, ARC-014 · **Requirements:** FR-NAV-003, FR-NAV-004 · **Units:** UNIT-NAV, UNIT-CONFIG_SECTIONS
- **Step:** Render `<App />`; read `.nav-links a` and `.mobile-menu a`.
- **Expected:** Both lists equal `NAV_ITEMS` (label, `#id`, icon ligature) in order; `NAV_ITEMS` equals `SECTIONS.filter(s => s.showInNav)`; no link to `#hero`.

### IT-011 Registry change propagates to App and Nav (one entry = one section)

- **File:** `tests/integration/registry.test.jsx` · **ARC:** ARC-004, ARC-002, ARC-014 · **Requirements:** FR-GEN-002, FR-NAV-004 · **Units:** UNIT-APP, UNIT-NAV, UNIT-CONFIG_SECTIONS
- **Preconditions:** `vi.doMock('../../src/config/sections.js')` returning the real entries with (a) the "Skills" label changed to "Stack" and (b) an extra entry `{id:'extra', label:'Extra', icon:'star', showInNav:true, component: ExtraStub}`.
- **Step:** `vi.resetModules()`; import and render App.
- **Expected:** Nav shows "Stack" for `#skills`; `section#extra[data-section=extra]` rendered last with a divider before it; nav has 10 links including `#extra`; no other file needed changing.

### IT-012 Lazy sections + Suspense + reveal observer

- **File:** `tests/integration/lazy.test.jsx` · **ARC:** ARC-002, ARC-004, ARC-016, ARC-010, ARC-009 · **Requirements:** FR-GEN-005, FR-FX-005 · **Units:** UNIT-APP, UNIT-SECTION, UNIT-USE_REVEAL, UNIT-ABOUT
- **Step:** Render `<App />`; before resolution read placeholders; await resolution; read `getIntersectionObservers()`; `triggerIntersection` on each `.reveal` of About.
- **Expected:** Placeholders carry `id`, `data-section` and a min-height; after resolution each section with `.reveal` children has one live observer (threshold 0.06) observing exactly its own `.reveal` nodes; intersecting nodes get `visible` and are unobserved.

### IT-013 Deep link to a lazy section and placeholder-based active tracking

- **File:** `tests/integration/lazy.test.jsx` · **ARC:** ARC-002, ARC-009, ARC-004 · **Requirements:** FR-GEN-005, FR-NAV-006 · **Units:** UNIT-APP, UNIT-USE_ACTIVE_SECTION
- **Preconditions:** `window.location.hash = '#resume'`; `scrollIntoView` spy; one section import held pending via a controllable promise.
- **Step:** Render App; resolve the Resume chunk.
- **Expected:** While pending the placeholder `#resume` exists (anchor resolvable, counted by active-section tracking); after resolution `scrollIntoView` is called once on `#resume`; not called again on re-render.

### IT-014 Section ErrorBoundary isolates a throwing section

- **File:** `tests/integration/errors.test.jsx` · **ARC:** ARC-015, ARC-002, ARC-016 · **Requirements:** FR-GEN-007 · **Units:** UNIT-ERROR_BOUNDARY, UNIT-APP
- **Preconditions:** `vi.doMock('../../src/sections/Projects.jsx', () => ({ default: () => { throw new Error('boom') } }))`; `console.error` spy.
- **Step:** Render App and await sections.
- **Expected:** `#projects` area shows the section fallback text with a Reload button; the other 9 sections render; nav and footer present; `console.error` called with the error (componentDidCatch).

### IT-015 Rejected lazy import shows the fallback with a working Reload

- **File:** `tests/integration/errors.test.jsx` · **ARC:** ARC-015, ARC-002 · **Requirements:** FR-GEN-007 · **Units:** UNIT-ERROR_BOUNDARY, UNIT-APP
- **Preconditions:** Mock one lazy import to reject (`ChunkLoadError`); `window.location.reload` replaced by a spy.
- **Step:** Render App; click Reload in the fallback.
- **Expected:** Fallback "Section failed to load" shown for that section only; reload spy called once.

### IT-016 Page-level ErrorBoundary when App itself fails

- **File:** `tests/integration/errors.test.jsx` · **ARC:** ARC-015, ARC-001 · **Requirements:** FR-GEN-007 · **Units:** UNIT-ERROR_BOUNDARY, UNIT-MAIN
- **Preconditions:** Mock `App.jsx` to throw on render; render the tree `main.jsx` builds.
- **Expected:** Page fallback shows the owner's name, title, email link and a resume link (`Jeevanandham_Resume.pdf`) and a reload button; no blank root.

### IT-017 Data modules build validated, deeply frozen models at import

- **File:** `tests/integration/data.test.js` · **ARC:** ARC-006, ARC-005, ARC-003 · **Requirements:** FR-GEN-006, FR-EXP-002, FR-SKILL-002, FR-PROJ-002 · **Units:** UNIT-DATA_PROFILE, UNIT-DATA_EXPERIENCE, UNIT-DATA_SKILLS, UNIT-DATA_PROJECTS, UNIT-DATA_DESIGN, UNIT-DATA_EDUCATION, UNIT-DATA_CERTIFICATIONS, UNIT-DATA_CONTACT, UNIT-CREATE_MODELS
- **Step:** Import every `src/data/*.js`; walk every exported value recursively.
- **Expected:** No import throws; counts: experience 4, skill categories 9 / skills 58, projects 6, design 5, education 2, certifications 3, contact 5, roles 5, badges 8, gauge stats 3, about stats 4; every object and array reached is `Object.isFrozen`.

### IT-018 Invalid content fails fast at module load naming entity and field

- **File:** `tests/integration/data.test.js` · **ARC:** ARC-006, ARC-005, ARC-003 · **Requirements:** FR-GEN-006, NFR-SEC-004 · **Units:** UNIT-DATA_CONTACT, UNIT-CREATE_MODELS, UNIT-VALIDATE, UNIT-CONFIG_SITE
- **Preconditions:** `vi.resetModules()`; `vi.doMock('../../src/config/site.js')` with `URLS.github = 'javascript:alert(1)'` (and a variant with `EMAIL = ''`).
- **Step:** `await import('../../src/data/contact.js')`.
- **Expected:** Import rejects with `ModelValidationError`; `error.model === 'ContactLink'`, `error.field === 'href'` (resp. the email field); message names both.

### IT-019 TechIcon strategies inside SkillChip in the Skills section

- **File:** `tests/integration/skills.test.jsx` · **ARC:** ARC-011, ARC-016, ARC-006, ARC-010 · **Requirements:** FR-SKILL-002, FR-SKILL-003 · **Units:** UNIT-SKILLS, UNIT-SKILL_CHIP, UNIT-TECH_ICON, UNIT-ICON_STRATEGIES, UNIT-CUSTOM_SVGS, UNIT-DATA_SKILLS
- **Step:** Render `<Skills />`; classify each chip's icon node.
- **Expected:** Number of `img` = number of `si:` specs in `SKILL_CATEGORIES`; inline `svg` count = `svg:` specs; Material Symbols spans = `ms:` specs; no chip renders the `code` fallback for an `svg:` key (every data key exists in `CUSTOM_SVGS`); `img` alt = slug and src `https://cdn.simpleicons.org/<slug>`.

### IT-020 CDN image error falls back only for the affected chip

- **File:** `tests/integration/skills.test.jsx` · **ARC:** ARC-011, ARC-016 · **Requirements:** FR-SKILL-004, NFR-RELI-003 · **Units:** UNIT-SKILLS, UNIT-TECH_ICON, UNIT-SKILL_CHIP
- **Step:** Render `<Skills />`; `fireEvent.error` on the "Git" chip image; then on all `img`s.
- **Expected:** "Git" chip now shows the `code` symbol in its colour; other chips unchanged; after all errors 58 chips remain and none contains an `img`.

### IT-021 Reduced motion disables speedometer, typewriter, parallax and cursor glow

- **File:** `tests/integration/motion.test.jsx` · **ARC:** ARC-009, ARC-013, ARC-012, ARC-016 · **Requirements:** NFR-A11Y-002, FR-HERO-010, FR-HERO-013, FR-FX-002, NFR-A11Y-001 · **Units:** UNIT-USE_PREFERS_REDUCED_MOTION, UNIT-SPEEDOMETER, UNIT-USE_TYPEWRITER, UNIT-USE_PARALLAX, UNIT-CURSOR_GLOW, UNIT-HERO, UNIT-APP
- **Preconditions:** `setMatchMedia({'(prefers-reduced-motion: reduce)': true})`; fake timers; `requestAnimationFrame` spy; `window.addEventListener` spy.
- **Step:** Render `<App />`; advance 5 s; dispatch `mousemove`.
- **Expected:** No rAF scheduled by the Speedometer; speed text static (t = 0 frame); typewriter text "Qt / QML Developer" unchanged; no `mousemove` listener from parallax and `.profile-card` has no transform; `.cursor-glow` not mounted.

### IT-022 Switching to reduced motion at runtime stops running motion

- **File:** `tests/integration/motion.test.jsx` · **ARC:** ARC-009, ARC-013, ARC-016 · **Requirements:** NFR-A11Y-002, FR-HERO-010 · **Units:** UNIT-USE_PREFERS_REDUCED_MOTION, UNIT-SPEEDOMETER, UNIT-USE_TYPEWRITER, UNIT-HERO
- **Step:** Render `<App />` with motion allowed and the gauge in view; advance 2 s; `setMatchMedia({...: true})`; advance 2 s.
- **Expected:** Before the switch rAF frames run and text changes; after it `cancelAnimationFrame` is called, no new rAF, typewriter shows the first role and all its timers are cleared.

### IT-023 Speedometer pauses when hidden, off-screen or in a hidden tab, and resumes from t

- **File:** `tests/integration/gauge.test.jsx` · **ARC:** ARC-013, ARC-009 · **Requirements:** NFR-PERF-006, FR-HERO-010 · **Units:** UNIT-SPEEDOMETER, UNIT-USE_IN_VIEW
- **Preconditions:** rAF driven by fake timers; `requestAnimationFrame` spy; IntersectionObserver mock; `document.visibilityState` stubbed via `Object.defineProperty`.
- **Step:** Render `<Speedometer />`; `triggerIntersection(svg, true)`; advance 500 ms; record speed text S1 and rAF count.
- **Step:** `triggerIntersection(svg, false)` (off-screen or `display:none`); advance 2 s.
- **Step:** Intersecting again; set `visibilityState='hidden'` and dispatch `visibilitychange`; advance 2 s.
- **Step:** `visibilityState='visible'` + event; advance one frame.
- **Expected:** Off-screen and hidden-tab phases: rAF count unchanged and no re-render (render counter via `React.Profiler`); `cancelAnimationFrame` called on each pause; on resume the next frame's speed equals f(t_prev + 0.006), not f(0.006).

### IT-024 Gauge without IntersectionObserver animates but still honours document visibility

- **File:** `tests/integration/gauge.test.jsx` · **ARC:** ARC-013, ARC-009, ARC-016 · **Requirements:** NFR-PERF-006 · **Units:** UNIT-SPEEDOMETER, UNIT-USE_IN_VIEW, UNIT-HERO
- **Preconditions:** `delete window.IntersectionObserver`.
- **Step:** Render `<Hero />`; advance 500 ms; hide document; advance 1 s.
- **Expected:** Frames run while visible (baseline behaviour); stop while hidden; no error.

### IT-025 Active-section tracking drives the nav highlight

- **File:** `tests/integration/navigation.test.jsx` · **ARC:** ARC-009, ARC-014, ARC-002 · **Requirements:** FR-NAV-006 · **Units:** UNIT-USE_ACTIVE_SECTION, UNIT-NAV, UNIT-APP
- **Preconditions:** `offsetTop` stubbed per section (hero 0, about 900, experience 1600, skills 2400, …); `window.scrollY` writable.
- **Step:** Set scrollY to 2260 (skills − 140) and dispatch `scroll`; flush rAF. Then 2259; then 0.
- **Expected:** 2260: only "Skills" `.nav-link.active` (desktop and mobile lists); 2259: only "Experience"; 0: none (active `hero`).

### IT-026 Scroll threshold toggles nav.scrolled

- **File:** `tests/integration/navigation.test.jsx` · **ARC:** ARC-009, ARC-014 · **Requirements:** FR-NAV-007 · **Units:** UNIT-USE_SCROLLED, UNIT-NAV
- **Step:** scrollY 30 + scroll event; 31; 0.
- **Expected:** `nav.nav` lacks `scrolled` at 30, has it at 31, lacks it at 0.

### IT-027 Mobile menu state machine, Escape and focus return

- **File:** `tests/integration/navigation.test.jsx` · **ARC:** ARC-014, ARC-010 · **Requirements:** FR-NAV-009, FR-NAV-010, FR-NAV-011, FR-NAV-012 · **Units:** UNIT-NAV, UNIT-ICON
- **Step:** `userEvent` click hamburger; Escape; click hamburger; click "Contact"; open; click theme button; open; press Tab then Escape.
- **Expected:** closed→open (`aria-expanded` true, `.open`) → Escape: closed, focus on hamburger → open → link click: closed → open → theme button: closed + theme flipped → Escape after focus moved inside the menu: closed and focus returns to hamburger; Escape while closed does nothing; `aria-controls` references the menu id.

### IT-028 Skip link -> main#main focus

- **File:** `tests/integration/a11y.test.jsx` · **ARC:** ARC-002, ARC-014, ARC-017 · **Requirements:** NFR-A11Y-008, NFR-A11Y-005 · **Units:** UNIT-APP, UNIT-NAV, UNIT-STYLE_COMPONENTS
- **Step:** Render `<App />`; `userEvent.tab()`; read `document.activeElement`; `userEvent.keyboard('{Enter}')` (jsdom: follow the hash with a click handler-free native anchor; assert via `main.focus()` semantics).
- **Expected:** First tab focuses `a.skip-link` "Skip to content" with `href="#main"`, rendered before the nav in DOM order; `main` has `id="main"` and `tabIndex === -1`; activating the link makes `document.activeElement === main` (jsdom: `location.hash === '#main'` and the target is focusable).

### IT-029 All Material Symbols spans in the app are aria-hidden

- **File:** `tests/integration/a11y.test.jsx` · **ARC:** ARC-010, ARC-011, ARC-014, ARC-016 · **Requirements:** NFR-A11Y-007, FR-NAV-002 · **Units:** UNIT-ICON, UNIT-NAV, UNIT-HERO, UNIT-CONTACT
- **Step:** Render `<App />`, await sections; query spans rendered by `Icon`.
- **Expected:** Every Icon span has `aria-hidden="true"`; accessible names (`getByRole`) of "View Projects", nav "About", the theme toggle and the email link contain no ligature names; no Icon emits class `ms` (OBS-11).

### IT-030 IO-missing reveal fallback across all lazy sections

- **File:** `tests/integration/reveal.test.jsx` · **ARC:** ARC-009, ARC-010, ARC-016, ARC-002 · **Requirements:** NFR-RELI-005, FR-FX-005 · **Units:** UNIT-USE_REVEAL, UNIT-SECTION, UNIT-APP
- **Preconditions:** `delete window.IntersectionObserver` and `globalThis.IntersectionObserver` before render (restored after).
- **Step:** Render `<App />`; await all sections.
- **Expected:** Every `.reveal` element has `visible`; nothing thrown; no observer created.

### IT-031 Every target=_blank anchor carries rel="noopener noreferrer"

- **File:** `tests/integration/security.test.jsx` · **ARC:** ARC-016, ARC-010, ARC-003 · **Requirements:** NFR-SEC-001, FR-DESIGN-003, FR-CONT-003 · **Units:** UNIT-BUTTON, UNIT-DESIGN, UNIT-CONTACT, UNIT-RESUME, UNIT-APP
- **Step:** Render App; await sections; query `a[target=_blank]`.
- **Expected:** Count > 0 and every one has `rel` containing `noopener` and `noreferrer`.

### IT-032 All resume links use the configured path and download name

- **File:** `tests/integration/resume.test.jsx` · **ARC:** ARC-016, ARC-003, ARC-010 · **Requirements:** FR-HERO-007, FR-RES-002, FR-RES-003 · **Units:** UNIT-HERO, UNIT-RESUME, UNIT-BUTTON, UNIT-CONFIG_SITE
- **Expected:** Exactly three anchors with a `download` attribute; all `href` = `RESUME.href` and `download` = `RESUME.downloadName` ("Jeevanandham_SeniorHMIEngineer_Resume.pdf"); the two "view" anchors open in a new tab.

### IT-033 Education renders substituted data (data-driven)

- **File:** `tests/integration/content.test.jsx` · **ARC:** ARC-016, ARC-006 · **Requirements:** FR-EDU-004 · **Units:** UNIT-EDUCATION, UNIT-DATA_EDUCATION
- **Preconditions:** `vi.doMock('../../src/data/education.js')` with two substitute entries ("Test Degree", tags ["X"]).
- **Expected:** Rendered cards show only the substituted texts; no baseline literal remains.

### IT-034 Container sections render their data modules in data order

- **File:** `tests/integration/content.test.jsx` · **ARC:** ARC-016, ARC-006, ARC-010 · **Requirements:** FR-EXP-002, FR-PROJ-002, FR-DESIGN-002, FR-CERT-002, FR-CONT-002, FR-ABOUT-003 · **Units:** UNIT-EXPERIENCE, UNIT-PROJECTS, UNIT-DESIGN, UNIT-CERTIFICATIONS, UNIT-CONTACT, UNIT-ABOUT
- **Expected:** Experience 4 items in data order; Projects 6 cards with `.wide` exactly where `wide: true`; Design 5 cards and every `artKey` resolves to an `svg` (no fallback); Certifications 3; Contact 2 primary + 3 social; About 4 stats with inline colours from data.

### IT-035 Site configuration consumed by Footer and Contact

- **File:** `tests/integration/content.test.jsx` · **ARC:** ARC-003, ARC-014, ARC-016 · **Requirements:** FR-GEN-004, FR-CONT-002, FR-CONT-003 · **Units:** UNIT-CONFIG_SITE, UNIT-FOOTER, UNIT-CONTACT
- **Expected:** Footer text equals `FOOTER_TEXT`; contact hrefs equal `mailto:${EMAIL}`, `PHONE_HREF`, `URLS.linkedin/behance/github`.

### IT-036 Particles from the seeded PRNG; orbs and rings rendered

- **File:** `tests/integration/effects.test.jsx` · **ARC:** ARC-012, ARC-007, ARC-016 · **Requirements:** FR-FX-003, FR-FX-001, FR-FX-004 · **Units:** UNIT-PARTICLES, UNIT-RANDOM, UNIT-GRADIENT_ORBS, UNIT-HERO
- **Expected:** 18 `.particle` whose inline styles equal `createParticles(18, mulberry32(SEED))`; identical after unmount/remount; 4 `.orb` in `aria-hidden` `.orbs-wrap`; 4 `.hring`.

### IT-037 StrictMode double effects leave exactly one of each resource

- **File:** `tests/integration/strict.test.jsx` · **ARC:** ARC-001, ARC-002, ARC-008, ARC-009 · **Requirements:** NFR-RELI-004, NFR-PERF-004 · **Units:** UNIT-APP, UNIT-USE_THEME, UNIT-USE_REVEAL, UNIT-USE_ACTIVE_SECTION, UNIT-USE_SCROLLED, UNIT-SPEEDOMETER, UNIT-USE_IN_VIEW
- **Preconditions:** Spies on `setInterval/clearInterval`, `addEventListener/removeEventListener` (window, document), `requestAnimationFrame/cancelAnimationFrame`; IO mock registry.
- **Step:** `render(<StrictMode><App/></StrictMode>)`; await sections; then unmount.
- **Expected:** After mount: one theme interval + one clock interval live (or the single combined interval per SUDS); one live IO per section with reveal children plus one for the gauge; net one scroll listener per hook; after unmount zero live intervals, observers, listeners and pending rAF.

### IT-038 Dependency-rule and layering test

- **File:** `tests/integration/architecture.test.js` · **ARC:** ARC-019, ARC-020, ARC-005, ARC-007 · **Requirements:** NFR-MAINT-002, NFR-MAINT-001 · **Units:** UNIT-CREATE_MODELS, UNIT-VALIDATE, UNIT-SOLAR, UNIT-RANDOM, UNIT-STORAGE
- **Step:** Read all `src/**/*.{js,jsx}` with `node:fs`; parse import specifiers; resolve to folders; evaluate the SADS §4.3.2 table and R-ACYCLIC, R-NO-UPWARD, R-DEFAULT-EXPORT.
- **Expected:** Zero violations; `models/` and `lib/` import no React; no cycles; each `sections/*.jsx` has exactly one default-exported component.

### IT-039 CSS equivalence with the baseline CSS string

- **File:** `tests/integration/css.test.js` · **ARC:** ARC-017, ARC-001 · **Requirements:** NFR-MAINT-003, FR-THEME-006 · **Units:** UNIT-STYLE_TOKENS, UNIT-STYLE_BASE, UNIT-STYLE_COMPONENTS, UNIT-STYLE_SECTIONS, UNIT-STYLE_INDEX
- **Step:** `execSync('git show dd9a86d:src/App.jsx')`, extract the CSS template; concatenate the four style files in `index.css` order; normalise and compare rule multisets and per-selector order.
- **Expected:** Equal except the allow-listed ADR-020 rule groups; no rule value changed.

### IT-040 DOM class/text snapshot vs baseline App

- **File:** `tests/integration/parity.test.jsx` · **ARC:** ARC-002, ARC-016, ARC-014 · **Requirements:** NFR-MAINT-008 · **Units:** UNIT-APP, UNIT-HERO, UNIT-NAV
- **Preconditions:** Baseline snapshot `tests/integration/__baseline__/dom.json` generated once from dd9a86d's `App` in jsdom (fixed time, Math.random stubbed, IO triggered).
- **Step:** Render the candidate App under the same conditions; serialise `{tag, className, text}` per element.
- **Expected:** Equal after removing allow-listed deltas (skip link, `aria-*` additions, `id="main"`/`tabindex`, `download` values, `alt` unchanged, particle inline styles, typewriter/gauge dynamic text).

### IT-041 HTML shell metadata and build-only CSP plugin

- **File:** `tests/integration/shell.test.js` · **ARC:** ARC-018, ARC-020 · **Requirements:** NFR-SEO-001, NFR-SEO-002, NFR-SEO-003, NFR-PERF-003, FR-GEN-009 · **Units:** CFG-INDEX_HTML, CFG-VITE_CONFIG
- **Step:** Read `index.html`; import `vite.config.js` and inspect plugins.
- **Expected:** Title, description, author, theme-color, canonical, OG/Twitter tags, favicon link, preload of `/profile.webp`, `<noscript>` text, `#root`, `lang="en"`; a plugin with `apply: 'build'` and `transformIndexHtml` injecting the CSP meta (ADR-013); no inline `<script>` other than the module entry.

### IT-042 Scripts, coverage thresholds and CI wiring

- **File:** `tests/integration/pipeline.test.js` · **ARC:** ARC-020, ARC-019 · **Requirements:** NFR-DEPLOY-002, NFR-DEPLOY-003, NFR-DEPLOY-004, NFR-MAINT-005, NFR-MAINT-007 · **Units:** CFG-PACKAGE_JSON, CFG-CI_WORKFLOW, CFG-VITEST_CONFIG, CFG-PLAYWRIGHT_CONFIG
- **Expected:** Scripts dev, build, preview, lint, test, test:coverage, test:qualification, deploy present; deploy unchanged; Vitest coverage thresholds (80 global; 90 for models/lib/hooks); ci.yml runs lint, test, build and qualification; dependencies exactly react and react-dom.

### IT-043 Test ID conventions and orphan guard

- **File:** `tests/integration/conventions.test.js` · **ARC:** ARC-019 · **Requirements:** NFR-MAINT-005 · **Units:** CFG-VITEST_CONFIG, CFG-PLAYWRIGHT_CONFIG
- **Step:** Scan `tests/**` for `it(`/`test(` titles.
- **Expected:** Every title starts with `UT-<UNIT>-NNN`, `IT-NNN` or `QT-NNN` matching its folder level; no duplicate IDs; every ID exists in the STP catalogue (list exported to `tests/stp-ids.json`) and every STP ID is implemented (or listed as manual/pre-release in that file).

## 4. Unit test case catalogue (SWE.4)

### UNIT-SOLAR — `src/lib/solar.js` (ARC-007) → `tests/unit/lib/solar.test.js`

Requirements: FR-THEME-002

| ID | Case |
|---|---|
| UT-SOLAR-001 | `toIst(2026-01-01T00:00:00Z)` gives IST fields 2026-01-01 05:30 (epoch + 5.5 h read with UTC getters). |
| UT-SOLAR-002 | `toIst` midnight rollover: 2026-06-21T18:29:00Z → 21 Jun 23:59 IST; 18:31:00Z → 22 Jun 00:01 IST. |
| UT-SOLAR-003 | `dayOfYear` = 1 at 1 Jan 00:00 IST (instant 2025-12-31T18:30:00Z) and 365 at 31 Dec 23:59 IST 2026 (2026-12-31T18:29:00Z). |
| UT-SOLAR-004 | Year boundary: 2026-12-31T18:29:59Z → 365, 2026-12-31T18:30:00Z → 1 (2027). |
| UT-SOLAR-005 | Leap year: 2028-02-29 12:00 IST → 60; 2028-12-31 12:00 IST → 366. |
| UT-SOLAR-006 | 11:59 and 12:01 IST on the same date give the same dayOfYear (OBS-2 regression; the baseline formula differs here). |
| UT-SOLAR-007 | 23:59 IST and 00:01 IST next day differ by exactly 1. |
| UT-SOLAR-008 | Correction constant = 5.5 − 80.27/15 = +0.14867 h (4 decimals), positive sign (OBS-16). |
| UT-SOLAR-009 | `sunriseSunsetHours(d, 13.08)`: sunrise + sunset = 24 for d ∈ {1, 79, 172, 266, 355, 365} (symmetry about solar noon before correction). |
| UT-SOLAR-010 | Day 172 window with correction: 05:45:47 to 18:32:03 IST (±60 s), i.e. ≈ 05:46–18:32. |
| UT-SOLAR-011 | Day 355 window: 06:32:03 to 17:45:47 IST (±60 s), i.e. ≈ 06:32–17:46. |
| UT-SOLAR-012 | Days 79 and 266 give identical windows (06:09:46–18:08:05 IST) (formula symmetry, equivalence check). |
| UT-SOLAR-013 | Clamping: geo lat 80° at day 172 → cosHA < −1 clamped → always `day`; at day 355 → cosHA > 1 clamped → always `night`; no NaN. |
| UT-SOLAR-014 | `getSunPhase` 2026-06-21T06:30:00Z (12:00 IST) → `day`. |
| UT-SOLAR-015 | `getSunPhase` 2026-06-21T17:30:00Z (23:00 IST) → `night`; 00:00:00 IST exactly → `night`. |
| UT-SOLAR-016 | Inclusive start: the instant equal to sunrise+correction (computed from the helpers, rounded up to the ms) → `day`; 1 ms earlier → `night`. |
| UT-SOLAR-017 | Exclusive end: the instant equal to sunset+correction → `night`; 1 ms earlier → `day`. |
| UT-SOLAR-018 | Day 172 boundary instants: 00:15:40Z → night, 00:15:55Z → day, 13:02:00Z → day, 13:02:10Z → night. |
| UT-SOLAR-019 | Day 355 boundary instants: 2026-12-21T01:02:00Z → night, 01:02:10Z → day, 12:15:40Z → day, 12:15:55Z → night. |
| UT-SOLAR-020 | [FR-THEME-002, NFR-PORT-003] Visitor TZ independence: identical results with `process.env.TZ` = UTC, Asia/Kolkata, America/New_York, Pacific/Kiritimati (+14), Pacific/Pago_Pago (−11), Australia/Lord_Howe (30-min DST) for 20 fixed instants. |
| UT-SOLAR-021 | [FR-THEME-002, NFR-PORT-003] DST proximity: instants within ±1 h of 2026-03-08T07:00Z and 2026-11-01T06:00Z (New York) and 2026-03-29T01:00Z (London), at 10-min steps, equal the UTC-zone results. |
| UT-SOLAR-022 | [FR-THEME-002, NFR-PORT-003] Uses no local-time API: spies on `Date.prototype.getTimezoneOffset`, `getHours`, `getDate`, `getFullYear` are not called. |
| UT-SOLAR-023 | Purity: input Date not mutated; repeated calls return the same value; module exports no mutable state. |
| UT-SOLAR-024 | Default geo equals `THEME_GEO` (13.08, 80.27, 5.5); explicit geo with lon 82.5 gives correction 0. |
| UT-SOLAR-025 | Error case: `Invalid Date`, `null`, number or string input → behaviour per SUDS contract (expected: `TypeError`); never returns a value other than `day`/`night`. |
| UT-SOLAR-026 | Full-day sweep on day 172 at 1-min steps gives exactly two transitions (night→day→night). |

### UNIT-RANDOM — `src/lib/random.js` (ARC-007) → `tests/unit/lib/random.test.js`

Requirements: FR-FX-003

| ID | Case |
|---|---|
| UT-RANDOM-001 | `mulberry32(seed)` determinism: two generators with the same seed yield identical 1 000-value sequences. |
| UT-RANDOM-002 | Different seeds (1 vs 2) yield different sequences. |
| UT-RANDOM-003 | Range: 100 000 draws all in [0, 1); none equals 1; none NaN. |
| UT-RANDOM-004 | Golden vector: first 3 values for seed 1 equal the reference constants recorded at implementation (regression lock). |
| UT-RANDOM-005 | Seed coercion: seeds 0, −1, 2^32 + 1, 3.7 produce valid numbers in range (uint32 semantics per SUDS). |
| UT-RANDOM-006 | Independent generators share no state (interleaved draws equal separate draws). |
| UT-RANDOM-007 | `createParticles(18, rng)` returns 18 particles with ids 0..17. |
| UT-RANDOM-008 | Ranges for 1 000 seeded particles: x ∈ [0,100), y ∈ [20,90), size ∈ [1.5,4), dur ∈ [4,9), delay ∈ [0,6), dx a string in (−30px, 30px), opacity ∈ [0.3,0.8), colour ∈ {#f59e0b, #22d3ee, #34d399, #a78bfa, #fb7185}. |
| UT-RANDOM-009 | Lower boundary with rng ≡ 0: x 0, y 20, size 1.5, dur 4, delay 0, dx "-30px", colour #f59e0b, opacity 0.3. |
| UT-RANDOM-010 | Upper boundary with rng ≡ 0.999999: values just below the maxima; colour #fb7185. |
| UT-RANDOM-011 | `createParticles(18, mulberry32(SEED))` twice → deep-equal arrays. |
| UT-RANDOM-012 | rng call order and count follow the baseline formula order (x, y, size, dur, delay, dx, colour, opacity): 8 calls per particle, 144 for 18. |
| UT-RANDOM-013 | `createParticles(0, rng)` → []; `Math.random` never called (spy). |
| UT-RANDOM-014 | Error case: non-function rng or negative count → per SUDS (expected `TypeError` / empty array). |
| UT-RANDOM-015 | Palette constant matches the documented colours (#f59e0b, #22d3ee, #34d399, #a78bfa, #fb7185). |

### UNIT-STORAGE — `src/lib/storage.js` (ARC-007) → `tests/unit/lib/storage.test.js`

Requirements: FR-THEME-008

| ID | Case |
|---|---|
| UT-STORAGE-001 | `readThemeOverride(stub)` returns "day" for stored "day" and "night" for stored "night". |
| UT-STORAGE-002 | Missing key → `null`. |
| UT-STORAGE-003 | Invalid values "foo", "", "DAY", " night", "null" → `null` (equivalence class: invalid). |
| UT-STORAGE-004 | Reads only key `jsv-theme-override` (stub records `getItem` calls; `THEME_STORAGE_KEY` constant used). |
| UT-STORAGE-005 | `getItem` throws (SecurityError) → `null`, no throw, no `console.error`. |
| UT-STORAGE-006 | Default parameter: `globalThis.localStorage` getter throws (blocked site data) → read returns `null`, write returns `false`, no throw. |
| UT-STORAGE-007 | `globalThis.localStorage` undefined → read `null`, write `false`. |
| UT-STORAGE-008 | `writeThemeOverride("night", stub)` → `setItem('jsv-theme-override','night')`, returns `true`. |
| UT-STORAGE-009 | `writeThemeOverride("day")` with the real jsdom storage → value persisted; `localStorage.length === 1`. |
| UT-STORAGE-010 | `setItem` throws `QuotaExceededError` → returns `false`, no throw. |
| UT-STORAGE-011 | Invalid theme argument ("foo", undefined) → returns `false`, nothing written. |
| UT-STORAGE-012 | Never touches other keys (stub with pre-existing keys unchanged); never calls `clear`/`removeItem`. |
| UT-STORAGE-013 | Holds no module state and imports nothing (static check). |

### UNIT-VALIDATE — `src/models/validate.js` (ARC-005) → `tests/unit/models/validate.test.js`

Requirements: FR-GEN-006

| ID | Case |
|---|---|
| UT-VALIDATE-001 | `assertString` accepts "x" and ""; rejects 1, null, undefined, {} with `ModelValidationError`. |
| UT-VALIDATE-002 | `assertNonEmptyString` rejects "", "   ", non-strings. |
| UT-VALIDATE-003 | `assertArray` accepts arrays; rejects strings/objects; minimum-length option rejects [] when min 1. |
| UT-VALIDATE-004 | `assertBoolean` accepts true/false; rejects "true", 0, undefined. |
| UT-VALIDATE-005 | `assertColor` accepts "#f59e0b", "rgba(245,158,11,0.14)", "linear-gradient(90deg,#f59e0b,#22d3ee)". |
| UT-VALIDATE-006 | `assertColor` rejects "red", "#zzzzzz", "", 123, "rgb(" (error guessing). |
| UT-VALIDATE-007 | Hex-only option (7-char `#rrggbb`) rejects "#fff" and "rgba(…)" (needed for alpha suffixes). |
| UT-VALIDATE-008 | [FR-GEN-006, NFR-SEC-004] `assertUrl` accepts "https://behance.net/s_jeevanandham", "mailto:a@b.co", "tel:+918111010315", "#about", "Jeevanandham_Resume.pdf", "/profile.webp". |
| UT-VALIDATE-009 | [FR-GEN-006, NFR-SEC-004] `assertUrl` rejects "javascript:alert(1)", " JaVaScRiPt:alert(1)", "java\tscript:x", "data:text/html,x", "vbscript:x", "http://example.com", "//evil.com", "file:///etc/passwd", "" (boundary of allowed schemes). |
| UT-VALIDATE-010 | `assertEmail` accepts "jeevanandhamsivashankaran@gmail.com"; rejects "a@", "@b.co", "a b@c.d". |
| UT-VALIDATE-011 | `assertIconRef` accepts "si:cplusplus", "ms:rocket_launch", "svg:i2c". |
| UT-VALIDATE-012 | `assertIconRef` rejects "foo:bar", "si:", "si:Qt", "cplusplus", "ms:rocket-launch" (regex `/^(si\\|ms\\|svg):[a-z0-9_]+$/`). |
| UT-VALIDATE-013 | `assertOneOf` accepts listed values; rejects others and case variants. |
| UT-VALIDATE-014 | `ModelValidationError` is `instanceof Error`, `name === 'ModelValidationError'`, exposes `model` and `field`, message contains both. |
| UT-VALIDATE-015 | Validators return the validated value (or undefined per SUDS) and have no side effects. |
| UT-VALIDATE-016 | `assertUnique` reports the first duplicate; `assertKnownKeys` names the unknown key. |
| UT-VALIDATE-017 | `deepFreeze` freezes nested arrays/objects, leaves functions and class instances untouched, returns the value. |
| UT-VALIDATE-018 | Required check comes first: undefined/null give the required-field error. |

### UNIT-CREATE_MODELS — `src/models/createModels.js` (ARC-005) → `tests/unit/models/createModels.test.js`

Requirements: FR-GEN-006

| ID | Case |
|---|---|
| UT-CREATE_MODELS-001 | createProfile: valid baseline fixture returns an equal, deeply frozen object. |
| UT-CREATE_MODELS-002 | createProfile: `roles: []` rejected (≥ 1 required); `photo.width`/`height` non-positive or non-number rejected; `photo.alt` empty rejected; invalid `email` rejected. |
| UT-CREATE_MODELS-003 | createStat: valid About stat and valid gauge stat (icon omitted) accepted. |
| UT-CREATE_MODELS-004 | createStat: `num: 4.9` (number) rejected (num is display text); invalid colour rejected; icon not a ligature string rejected. |
| UT-CREATE_MODELS-005 | createSection: hero entry `{id:'hero', showInNav:false}` valid without label/icon. |
| UT-CREATE_MODELS-006 | createSection: `showInNav: true` without `label` or without `icon` rejected; id not a slug ("About Me") rejected. |
| UT-CREATE_MODELS-007 | createExperience: valid baseline entry accepted. |
| UT-CREATE_MODELS-008 | createSkill: valid with and without `color`; colour falls through as undefined (category colour applied by the view). |
| UT-CREATE_MODELS-009 | createSkill: icon "foo:bar" rejected; non-string colour rejected. |
| UT-CREATE_MODELS-010 | createSkillCategory: valid baseline category accepted; nested skills frozen. |
| UT-CREATE_MODELS-011 | createSkillCategory: `headerColor` "#fff" or "rgba(…)" rejected (7-char hex required); `skills: []` rejected; duplicate skill names within a category rejected. |
| UT-CREATE_MODELS-012 | createProject: valid baseline project accepted; `wide` defaults to false when omitted. |
| UT-CREATE_MODELS-013 | createProject: `tags: []` rejected; duplicate tags rejected; `wide: "yes"` rejected; `color` not hex rejected (alpha suffix `99` appended). |
| UT-CREATE_MODELS-014 | createDesignCard: valid baseline card accepted. |
| UT-CREATE_MODELS-015 | [FR-GEN-006, NFR-SEC-004] createDesignCard: href "javascript:alert(1)", "http://behance.net/x" rejected. |
| UT-CREATE_MODELS-016 | createEducation: valid degree card (`tagVariant: 'edu'`) and domain card (`'domain'`) accepted. |
| UT-CREATE_MODELS-017 | createEducation: `tagVariant: 'other'` rejected. |
| UT-CREATE_MODELS-018 | createCertification: valid baseline accepted. |
| UT-CREATE_MODELS-019 | createContactLink: valid email, phone and three social links accepted. |
| UT-CREATE_MODELS-020 | [FR-GEN-006, NFR-SEC-004] createContactLink: `href: 'javascript:alert(1)'` throws (NFR-SEC-004 acceptance); `data:` and `http:` rejected. |
| UT-CREATE_MODELS-021 | createContactLink: `kind: 'twitter'` and `group: 'other'` rejected; `external: 'true'` rejected. |
| UT-CREATE_MODELS-022 | createResumeSkill: valid `{label:'Qt / QML', w:'92%', g:'linear-gradient(…)'}` accepted. |
| UT-CREATE_MODELS-023 | createResumeSkill: `w` "92" (no %), "120%", "-1%" rejected; "0%" and "100%" accepted (boundaries). |
| UT-CREATE_MODELS-024 | createHighlight: valid text segment with and without emphasis accepted. |
| UT-CREATE_MODELS-025 | Every factory: returned object `Object.isFrozen`, nested arrays/objects frozen; assignment in strict mode throws `TypeError`. |
| UT-CREATE_MODELS-026 | Every factory: input object not mutated and not returned by identity (later mutation of input does not affect output). |
| UT-CREATE_MODELS-027 | Every factory: unknown extra fields handled per SUDS (stripped or rejected), consistently across factories. |
| UT-CREATE_MODELS-028 | Every factory: non-object input (`undefined`, `null`, `"x"`) throws `ModelValidationError` naming the model. |

### UNIT-INDEX — `src/models/index.js` (ARC-005) → `tests/unit/models/index.test.js`

Requirements: FR-GEN-006, NFR-MAINT-006

| ID | Case |
|---|---|
| UT-INDEX-001 | Re-exports all 13 factories, `ModelValidationError` and the validators; each export is the same reference as in its source module. |
| UT-INDEX-002 | Has no default export and imports no React (static). |

### UNIT-TYPES — `src/models/types.js` (ARC-005) → `tests/unit/models/types.test.js`

Requirements: NFR-MAINT-006

| ID | Case |
|---|---|
| UT-TYPES-001 | Contains a `@typedef` for each model (Profile, Photo, Stat, GaugeStat, Section, Experience, SkillCategory, Skill, Project, DesignCard, Education, Certification, ContactLink, ResumeInfo, ResumeSkill, Highlight, IconRef, CssColor). |
| UT-TYPES-002 | Each typedef lists the required fields of SRS §4 / SADS §7 as `@property` lines. |
| UT-TYPES-003 | Module has no runtime side effects when imported (exports nothing or `{}`). |

### UNIT-CONFIG_SITE — `src/config/site.js` (ARC-003) → `tests/unit/config/site.test.js`

Requirements: FR-CONT-002, FR-CONT-003, FR-RES-002, FR-GEN-004, FR-THEME-008

| ID | Case |
|---|---|
| UT-CONFIG_SITE-001 | `EMAIL`, `PHONE` "+91 8111010315", `PHONE_HREF` "tel:+918111010315" exact. |
| UT-CONFIG_SITE-002 | `URLS.linkedin`, `URLS.behance`, `URLS.github`, `URLS.canonical` exact baseline values. |
| UT-CONFIG_SITE-003 | `RESUME` = {href "Jeevanandham_Resume.pdf", downloadName "Jeevanandham_SeniorHMIEngineer_Resume.pdf", pages 3}. |
| UT-CONFIG_SITE-004 | `FOOTER_TEXT` exact; `OWNER_NAME`, `OWNER_TITLE`, `LOCATION` exact. |
| UT-CONFIG_SITE-005 | [FR-THEME-002] `THEME_GEO` = {lat 13.08, lon 80.27, tzOffsetHours 5.5}. |
| UT-CONFIG_SITE-006 | [FR-THEME-008] `THEME_STORAGE_KEY === 'jsv-theme-override'`. |
| UT-CONFIG_SITE-007 | All exports deeply frozen; module imports nothing. |

### UNIT-CONFIG_SECTIONS — `src/config/sections.js` (ARC-004) → `tests/unit/config/sections.test.js`

Requirements: FR-GEN-001, FR-GEN-002, FR-NAV-003, FR-NAV-004, FR-GEN-005

| ID | Case |
|---|---|
| UT-CONFIG_SECTIONS-001 | `SECTIONS` ids in order: hero, about, experience, skills, projects, design, education, certifications, resume, contact. |
| UT-CONFIG_SECTIONS-002 | Ids unique and slug-shaped. |
| UT-CONFIG_SECTIONS-003 | Hero: `lazy: false`, `showInNav: false`, component is the eager Hero function. |
| UT-CONFIG_SECTIONS-004 | Other 9: `lazy: true`, `showInNav: true`, component is a `React.lazy` object. |
| UT-CONFIG_SECTIONS-005 | `NAV_ITEMS` equals `SECTIONS.filter(s => s.showInNav)`; labels About, Experience, Skills, Projects, Design, Education, Certs, Resume, Contact; icons person, work, build, rocket_launch, brush, school, verified, description, mail. |
| UT-CONFIG_SECTIONS-006 | `number` derived from position: "01".."09" for the 9 nav sections; heading text "Certifications" for the "Certs" entry. |
| UT-CONFIG_SECTIONS-007 | `minHeight` is a positive number for each lazy entry (placeholder sizing). |
| UT-CONFIG_SECTIONS-008 | Each lazy entry's dynamic import resolves to a module whose default export is a function component. |
| UT-CONFIG_SECTIONS-009 | Array and entries frozen. |
| UT-CONFIG_SECTIONS-010 | `defineSections` rejects duplicate ids and numbers the first headed entry. |

### UNIT-DATA_PROFILE — `src/data/profile.js` (ARC-006) → `tests/unit/data/profile.test.js`

Requirements: FR-HERO-002, FR-HERO-003, FR-HERO-005, FR-HERO-006, FR-HERO-008, FR-HERO-011, FR-ABOUT-002, FR-ABOUT-003, FR-RES-003

| ID | Case |
|---|---|
| UT-DATA_PROFILE-001 | Module loads without throwing; all exports frozen. |
| UT-DATA_PROFILE-002 | `HERO_ROLES` = the 5 roles in order. |
| UT-DATA_PROFILE-003 | `HERO_BADGES` = the 8 badges in order. |
| UT-DATA_PROFILE-004 | `GAUGE_STATS` = 3 entries (4.9+/Yrs Exp/#f59e0b, 8+/Projects/#22d3ee, 2/Domains/#34d399); `GAUGE_STACK_TAGS` = Qt/QML, LVGL, C++, CAN, UART. |
| UT-DATA_PROFILE-005 | `STATS` = 4 About stats with icons schedule, rocket_launch, devices, code and colours #f59e0b, #22d3ee, #34d399, #a78bfa. |
| UT-DATA_PROFILE-006 | `PROFILE_TAGS` = Automotive HMI, Medical HMI, Qt/QML, UX Design; status "OPEN TO OPPORTUNITIES". |
| UT-DATA_PROFILE-007 | Photo {src "profile.webp", alt "S. Jeevanandham", width 600, height 900}. |
| UT-DATA_PROFILE-008 | Hero bio segments: two emphasised segments "4.9+ years" and "Qt/QML, Embedded C++, and real-time UI engineering"; plain text byte-identical to baseline. |
| UT-DATA_PROFILE-009 | `ABOUT_PARAGRAPHS` 4 paragraphs; highlight segments in order (5 phrases). |
| UT-DATA_PROFILE-010 | `RESUME_PREVIEW`: role line exact; 4 bars Qt / QML 92%, Embedded C++ 88%, LVGL / HMI 85%, UX / Figma 78%. |

### UNIT-DATA_EXPERIENCE — `src/data/experience.js` (ARC-006) → `tests/unit/data/experience.test.js`

Requirements: FR-EXP-002

| ID | Case |
|---|---|
| UT-DATA_EXPERIENCE-001 | 4 entries, newest first; frozen. |
| UT-DATA_EXPERIENCE-002 | Entry 1 role/company/period/location exact; entry 4 "Graphics Designer Trainee" at "Lapiz Digital Services Pvt. Ltd.". |
| UT-DATA_EXPERIENCE-003 | Every `period` matches `/^[A-Z]{3} \d{4} — [A-Z]{3} \d{4}$/` (em dash). |
| UT-DATA_EXPERIENCE-004 | Icons medical_services, directions_car, school, palette; descriptions byte-identical to baseline. |

### UNIT-DATA_SKILLS — `src/data/skills.js` (ARC-006) → `tests/unit/data/skills.test.js`

Requirements: FR-SKILL-002, FR-SKILL-003, FR-SKILL-005

| ID | Case |
|---|---|
| UT-DATA_SKILLS-001 | 9 categories in order with skill counts 9, 10, 7, 5, 10, 5, 1, 8, 3 (58 total). |
| UT-DATA_SKILLS-002 | Category labels unique; skill names unique within each category. |
| UT-DATA_SKILLS-003 | Every `headerColor` is a 7-char hex; every `headerBg` an rgba tint. |
| UT-DATA_SKILLS-004 | Every skill icon parses with `parseIconRef` into si/ms/svg. |
| UT-DATA_SKILLS-005 | Every `svg:` key exists in `CUSTOM_SVGS` (no fallback in shipped data). |
| UT-DATA_SKILLS-006 | Set of `si:` slugs equals the SRS EI-2 list (19 slugs). |
| UT-DATA_SKILLS-007 | `SAFETY_HIGHLIGHT`: title "ISO 26262 Awareness", baseline description, 5 chips in order. |

### UNIT-DATA_PROJECTS — `src/data/projects.js` (ARC-006) → `tests/unit/data/projects.test.js`

Requirements: FR-PROJ-002

| ID | Case |
|---|---|
| UT-DATA_PROJECTS-001 | 6 projects in order; `num` unique ("PROJECT_01".."PROJECT_05", "R&D"). |
| UT-DATA_PROJECTS-002 | Exactly 2 `wide` (PROJECT_03 and R&D). |
| UT-DATA_PROJECTS-003 | Project 1 title "Physiotherapy Laser Therapy HMI" with 5 tags; project 3 has 8 tags. |
| UT-DATA_PROJECTS-004 | Colours are 7-char hex; `line` is a gradient string. |

### UNIT-DATA_DESIGN — `src/data/design.js` (ARC-006) → `tests/unit/data/design.test.js`

Requirements: FR-DESIGN-002, FR-DESIGN-003

| ID | Case |
|---|---|
| UT-DATA_DESIGN-001 | 5 cards with titles in order; tags AUTOMOTIVE, MEDICAL HMI, INFOTAINMENT · OEM, MULTI-PLATFORM, DESIGNER PROFILE. |
| UT-DATA_DESIGN-002 | Exactly one `wide`, "Infotainment UI Modules". |
| UT-DATA_DESIGN-003 | Every `href` is "https://behance.net/s_jeevanandham". |
| UT-DATA_DESIGN-004 | `artKey` values unique strings. |

### UNIT-DATA_EDUCATION — `src/data/education.js` (ARC-006) → `tests/unit/data/education.test.js`

Requirements: FR-EDU-002, FR-EDU-003, FR-EDU-004

| ID | Case |
|---|---|
| UT-DATA_EDUCATION-001 | 2 entries: degree (school, #22d3ee, tagVariant 'edu', tags "2015 – 2020", "CGPA: 6.34 / 10", "ECE") and domain (military_tech, #f59e0b, tagVariant 'domain', 5 chips). |
| UT-DATA_EDUCATION-002 | Titles and subtitles byte-identical to baseline. |

### UNIT-DATA_CERTIFICATIONS — `src/data/certifications.js` (ARC-006) → `tests/unit/data/certifications.test.js`

Requirements: FR-CERT-002

| ID | Case |
|---|---|
| UT-DATA_CERTIFICATIONS-001 | 3 certifications with exact names, orgs and icons (school, school, verified_user); names unique. |

### UNIT-DATA_CONTACT — `src/data/contact.js` (ARC-006) → `tests/unit/data/contact.test.js`

Requirements: FR-CONT-001, FR-CONT-002, FR-CONT-003

| ID | Case |
|---|---|
| UT-DATA_CONTACT-001 | 5 links in order email, phone, linkedin, behance, github with exact hrefs and labels. |
| UT-DATA_CONTACT-002 | Groups: email and phone `primary`; the other 3 `social`. |
| UT-DATA_CONTACT-003 | `external` true exactly for the 3 social links. |
| UT-DATA_CONTACT-004 | Icons mail, phone, open_in_new, brush, terminal. |
| UT-DATA_CONTACT-005 | `CONTACT_INTRO` text byte-identical to baseline. |

### UNIT-THEME_CONTEXT — `src/context/ThemeContext.jsx` (ARC-008) → `tests/unit/context/ThemeContext.test.jsx`

Requirements: FR-THEME-007

| ID | Case |
|---|---|
| UT-THEME_CONTEXT-001 | `ThemeProvider` renders its children. |
| UT-THEME_CONTEXT-002 | Consumer receives `{theme, isDay, toggle, now}` from `useTheme` (hook mocked). |
| UT-THEME_CONTEXT-003 | `toggle` from context calls the hook's toggle; all consumers re-render with the new theme. |
| UT-THEME_CONTEXT-004 | `useThemeContext` outside the provider throws "useThemeContext must be used within ThemeProvider". |
| UT-THEME_CONTEXT-005 | Provider calls `useTheme` exactly once per render. |
| UT-THEME_CONTEXT-006 | Context value referentially stable when the provider re-renders without state change (per SUDS memoisation). |
| UT-THEME_CONTEXT-007 | Context toggle is the hook toggle (called once per click). |

### UNIT-USE_THEME — `src/hooks/useTheme.js` (ARC-009) → `tests/unit/hooks/useTheme.test.js`

Requirements: FR-THEME-001, FR-THEME-002, FR-THEME-003, FR-THEME-004, FR-THEME-008

| ID | Case |
|---|---|
| UT-USE_THEME-001 | Initial theme `day` at 12:00 IST and `night` at 23:00 IST (`vi.setSystemTime`), storage empty. |
| UT-USE_THEME-002 | [FR-THEME-001] `data-theme` written in a layout effect: attribute present when a sibling's passive effect runs; value never `night` first for a day visitor. |
| UT-USE_THEME-003 | Attribute updated whenever theme changes; always exactly "day" or "night". |
| UT-USE_THEME-004 | [FR-THEME-003] Auto mode: at 18:31:30 IST day 172, advancing 60 s twice flips to `night` (first tick after 18:32:03). |
| UT-USE_THEME-005 | [FR-THEME-003] Interval period is 60 000 ms: no evaluation at 59 999 ms. |
| UT-USE_THEME-006 | [FR-THEME-003, NFR-PERF-004] Unmount clears the interval(s): `vi.getTimerCount() === 0`. |
| UT-USE_THEME-007 | [FR-THEME-004] `toggle` flips day↔night; `isDay` consistent. |
| UT-USE_THEME-008 | [FR-THEME-003, FR-THEME-004] After `toggle`, the theme interval is cleared and advancing across sunrise/sunset does not change the theme. |
| UT-USE_THEME-009 | [FR-THEME-008] `toggle` writes `jsv-theme-override` via `writeThemeOverride` (mocked `lib/storage`) with the new value; double toggle writes the latest. |
| UT-USE_THEME-010 | [FR-THEME-008, FR-THEME-003] Stored "night" at mount during day → `night`, counts as override, no theme interval started. |
| UT-USE_THEME-011 | [FR-THEME-008] Stored "day" at mount during night → `day`. |
| UT-USE_THEME-012 | [FR-THEME-008] `readThemeOverride` returning `null` (invalid/throwing storage) → automatic theme and interval started; nothing thrown. |
| UT-USE_THEME-013 | [FR-THEME-008] `writeThemeOverride` returning `false` → toggle still flips for the page lifetime; no error. |
| UT-USE_THEME-014 | [FR-THEME-005] `now` refreshes every 60 s in auto mode. |
| UT-USE_THEME-015 | [FR-THEME-005] `now` still refreshes every 60 s while a manual override is active (clock interval independent of theme interval). |
| UT-USE_THEME-016 | [NFR-RELI-004] StrictMode double mount: one theme interval and one clock interval live after mount. |
| UT-USE_THEME-017 | No re-render when the 60 s tick computes an unchanged phase (setState bail-out; render counter). |

### UNIT-USE_REVEAL — `src/hooks/useReveal.js` (ARC-009) → `tests/unit/hooks/useReveal.test.jsx`

Requirements: FR-FX-005, NFR-RELI-005

| ID | Case |
|---|---|
| UT-USE_REVEAL-001 | Creates one IntersectionObserver with `threshold: 0.06`. |
| UT-USE_REVEAL-002 | Observes all `.reveal` descendants of `rootRef.current` and none outside the root. |
| UT-USE_REVEAL-003 | `isIntersecting: true` adds `visible` and calls `unobserve` for that element. |
| UT-USE_REVEAL-004 | `isIntersecting: false` adds nothing and keeps observing. |
| UT-USE_REVEAL-005 | Repeated intersection is idempotent (single `visible` class). |
| UT-USE_REVEAL-006 | Unmount calls `disconnect`. |
| UT-USE_REVEAL-007 | [NFR-RELI-005] Without IntersectionObserver every `.reveal` under the root gets `visible` immediately and nothing throws. |
| UT-USE_REVEAL-008 | `rootRef.current === null` → no observer, no throw. |
| UT-USE_REVEAL-009 | Re-render does not create a new observer (effect keyed on the ref). |
| UT-USE_REVEAL-010 | [NFR-RELI-004] StrictMode: first observer disconnected; exactly one live observer. |
| UT-USE_REVEAL-011 | Nested `.reveal` elements observed; elements without `.reveal` ignored. |

### UNIT-USE_ACTIVE_SECTION — `src/hooks/useActiveSection.js` (ARC-009) → `tests/unit/hooks/useActiveSection.test.jsx`

Requirements: FR-NAV-006

| ID | Case |
|---|---|
| UT-USE_ACTIVE_SECTION-001 | Returns "hero" at scrollY 0 (default). |
| UT-USE_ACTIVE_SECTION-002 | [FR-NAV-006, NFR-PERF-004] Registers the scroll listener with `{passive: true}`. |
| UT-USE_ACTIVE_SECTION-003 | Picks the last `[data-section]` with `offsetTop − 140 ≤ scrollY` (stubbed offsets). |
| UT-USE_ACTIVE_SECTION-004 | Boundary: scrollY = offsetTop − 140 → that section; offsetTop − 141 → previous section. |
| UT-USE_ACTIVE_SECTION-005 | scrollY beyond the last section → "contact". |
| UT-USE_ACTIVE_SECTION-006 | Last match in document order wins even when offsets are non-monotonic (error guessing). |
| UT-USE_ACTIVE_SECTION-007 | rAF coalescing: 5 scroll events in one frame → one `querySelectorAll` measurement. |
| UT-USE_ACTIVE_SECTION-008 | No state update when the active id is unchanged (render counter). |
| UT-USE_ACTIVE_SECTION-009 | Custom `defaultId` honoured. |
| UT-USE_ACTIVE_SECTION-010 | [FR-NAV-006, NFR-PERF-004] Unmount removes the same listener and cancels a pending rAF. |
| UT-USE_ACTIVE_SECTION-011 | No `[data-section]` elements → default id. |
| UT-USE_ACTIVE_SECTION-012 | Placeholder elements with `data-section` participate (lazy sections not yet loaded). |
| UT-USE_ACTIVE_SECTION-013 | `pickActiveSection(offsets, scrollY)` pure helper: table of normal/boundary cases (if exported per SUDS). |
| UT-USE_ACTIVE_SECTION-014 | [FR-GEN-005] Hash scroll: `location.hash = '#resume'`, target appears later → `scrollIntoView` called once on it. |
| UT-USE_ACTIVE_SECTION-015 | [FR-GEN-005] Hash scroll: no hash → never called; hash to a non-existent id → no throw and observation stops per SUDS; cleanup on unmount. |
| UT-USE_ACTIVE_SECTION-016 | [NFR-PERF-004, DEF-007] Unmount cancels a pending rAF (`cancelAnimationFrame` with the scheduled id). |
| UT-USE_ACTIVE_SECTION-017 | [FR-GEN-005] Hash scroll: non-existent id → no throw, never scrolls; unmount disconnects the observer. |
| UT-USE_ACTIVE_SECTION-018 | [FR-GEN-005] Hash scroll: a keydown disarms the one-shot scroll. |

### UNIT-USE_SCROLLED — `src/hooks/useScrolled.js` (ARC-009) → `tests/unit/hooks/useScrolled.test.jsx`

Requirements: FR-NAV-007

| ID | Case |
|---|---|
| UT-USE_SCROLLED-001 | Initial `false` at scrollY 0. |
| UT-USE_SCROLLED-002 | Boundary: 30 → false; 31 → true; 29 → false. |
| UT-USE_SCROLLED-003 | Back to 0 → false. |
| UT-USE_SCROLLED-004 | Custom threshold (e.g. 100) honoured. |
| UT-USE_SCROLLED-005 | [FR-NAV-007, NFR-PERF-004] Passive listener; removed on unmount. |
| UT-USE_SCROLLED-006 | Initial value when mounted at scrollY 500 follows the SUDS contract (baseline: false until the first scroll event). |

### UNIT-USE_TYPEWRITER — `src/hooks/useTypewriter.js` (ARC-009) → `tests/unit/hooks/useTypewriter.test.jsx`

Requirements: FR-HERO-003, FR-HERO-004

| ID | Case |
|---|---|
| UT-USE_TYPEWRITER-001 | [FR-HERO-004] With rng ≡ 0: "" at 899 ms; "Q" at 900 ms. |
| UT-USE_TYPEWRITER-002 | [FR-HERO-004] Each further character after 65 ms (rng 0); 2 chars at 965 ms. |
| UT-USE_TYPEWRITER-003 | [FR-HERO-004] Full first word (18 chars) at 2005 ms; still full at 2069 ms. |
| UT-USE_TYPEWRITER-004 | [FR-HERO-004] Completion check at 2070 ms schedules the 1800 ms pause: still full at 3869 ms; 17 chars at 3870 ms. |
| UT-USE_TYPEWRITER-005 | [FR-HERO-004] Deletion every 35 ms: empty at 4465 ms. |
| UT-USE_TYPEWRITER-006 | [FR-HERO-004] 300 ms wait then the next word: "E" at 4800 ms. |
| UT-USE_TYPEWRITER-007 | [FR-HERO-004] Jitter: rng ≡ 0.999 → type interval 65 + 29.97 ms (boundary of 0–30 ms jitter). |
| UT-USE_TYPEWRITER-008 | [FR-HERO-003] Wraps from the last word to the first. |
| UT-USE_TYPEWRITER-009 | Single-word list cycles that word. |
| UT-USE_TYPEWRITER-010 | [FR-HERO-004, NFR-PERF-004] Unmount clears the pending timer (`vi.getTimerCount() === 0`) at each phase (typing, pause, deleting, wait). |
| UT-USE_TYPEWRITER-011 | [FR-HERO-003, NFR-A11Y-002] `enabled: false` returns `words[0]` immediately and schedules no timers. |
| UT-USE_TYPEWRITER-012 | [NFR-A11Y-002] `enabled` switching true→false mid-cycle returns `words[0]` and clears timers. |
| UT-USE_TYPEWRITER-013 | Custom `speed`, `deleteSpeed`, `pause` honoured. |
| UT-USE_TYPEWRITER-014 | Default rng is `Math.random` (spy called once per typed char). |
| UT-USE_TYPEWRITER-015 | Error case: empty `words` → returns "" without throwing or scheduling. |

### UNIT-USE_PARALLAX — `src/hooks/useParallax.js` (ARC-009) → `tests/unit/hooks/useParallax.test.jsx`

Requirements: FR-HERO-013

| ID | Case |
|---|---|
| UT-USE_PARALLAX-001 | Returns a ref object. |
| UT-USE_PARALLAX-002 | `mousemove` at clientX = innerWidth → rotateY(7deg); clientX = 0 → rotateY(-7deg) (boundaries). |
| UT-USE_PARALLAX-003 | Centre → rotateY(0deg) rotateX(0deg). |
| UT-USE_PARALLAX-004 | clientY = 0 → rotateX(7deg) (sign inversion of y). |
| UT-USE_PARALLAX-005 | Exact string `perspective(900px) rotateY(Xdeg) rotateX(Ydeg) translateZ(8px)`. |
| UT-USE_PARALLAX-006 | [FR-HERO-013, NFR-PERF-004] Passive listener; removed on unmount. |
| UT-USE_PARALLAX-007 | [FR-HERO-013, NFR-A11Y-002] `enabled: false` → no listener, no transform. |
| UT-USE_PARALLAX-008 | `ref.current === null` → handler does not throw. |

### UNIT-USE_PREFERS_REDUCED_MOTION — `src/hooks/usePrefersReducedMotion.js` (ARC-009) → `tests/unit/hooks/usePrefersReducedMotion.test.jsx`

Requirements: NFR-A11Y-002

| ID | Case |
|---|---|
| UT-USE_PREFERS_REDUCED_MOTION-001 | Returns false when the query does not match. |
| UT-USE_PREFERS_REDUCED_MOTION-002 | Returns true when it matches (`setMatchMedia`). |
| UT-USE_PREFERS_REDUCED_MOTION-003 | Updates on a `change` event (false → true → false). |
| UT-USE_PREFERS_REDUCED_MOTION-004 | Removes its listener on unmount. |
| UT-USE_PREFERS_REDUCED_MOTION-005 | No `window.matchMedia` → false, no throw. |
| UT-USE_PREFERS_REDUCED_MOTION-006 | MediaQueryList with only `addListener` (legacy) supported per SUDS. |
| UT-USE_PREFERS_REDUCED_MOTION-007 | Queries exactly `(prefers-reduced-motion: reduce)`. |

### UNIT-USE_IN_VIEW — `src/hooks/useInView.js` (ARC-009) → `tests/unit/hooks/useInView.test.jsx`

Requirements: NFR-PERF-006

| ID | Case |
|---|---|
| UT-USE_IN_VIEW-001 | Observes the ref element with one IntersectionObserver (threshold 0). |
| UT-USE_IN_VIEW-002 | Returns true after an intersecting entry with `visibilityState === 'visible'`. |
| UT-USE_IN_VIEW-003 | Returns false after a non-intersecting entry (off-screen or `display:none`). |
| UT-USE_IN_VIEW-004 | Returns false while `document.visibilityState === 'hidden'` even if intersecting; true again on `visibilitychange` to visible. |
| UT-USE_IN_VIEW-005 | `trackDocumentVisibility: false` ignores document visibility. |
| UT-USE_IN_VIEW-006 | No IntersectionObserver → true (still false while the document is hidden). |
| UT-USE_IN_VIEW-007 | Initial value before the first IO callback per SUDS (expected false, so no frame is scheduled for a hidden gauge). |
| UT-USE_IN_VIEW-008 | [NFR-PERF-006, NFR-PERF-004] Unmount disconnects the observer and removes the `visibilitychange` listener. |
| UT-USE_IN_VIEW-009 | `ref.current === null` → no observer, no throw. |
| UT-USE_IN_VIEW-010 | [NFR-RELI-004] StrictMode: exactly one live observer and one listener. |

### UNIT-ICON — `src/components/ui/Icon.jsx` (ARC-010) → `tests/unit/components/ui/Icon.test.jsx`

Requirements: NFR-A11Y-007

| ID | Case |
|---|---|
| UT-ICON-001 | Renders a span with the ligature text. |
| UT-ICON-002 | `aria-hidden="true"` by default. |
| UT-ICON-003 | Inline style equals the baseline `Ms` style: Material Symbols family, `'FILL' 0,'wght' 300,'GRAD' -25,'opsz' 48`, fontSize 18, lineHeight 1, inline-block, vertical-align middle, user-select none. |
| UT-ICON-004 | `size`, `fill`, `wght` props applied; `style` prop merged and overriding. |
| UT-ICON-005 | `label` prop → `role="img"`, `aria-label`, no `aria-hidden`. |
| UT-ICON-006 | Does not emit class `ms` (OBS-11 parity), even when a `className` is passed (per SUDS). |

### UNIT-SECTION_LABEL — `src/components/ui/SectionLabel.jsx` (ARC-010) → `tests/unit/components/ui/SectionLabel.test.jsx`

Requirements: FR-GEN-003

| ID | Case |
|---|---|
| UT-SECTION_LABEL-001 | Renders `div.section-label` with an Icon of size 13 followed by the text. |
| UT-SECTION_LABEL-002 | Text exact (e.g. "01 — About"); icon aria-hidden. |

### UNIT-SECTION_TITLE — `src/components/ui/SectionTitle.jsx` (ARC-010) → `tests/unit/components/ui/SectionTitle.test.jsx`

Requirements: FR-GEN-003

| ID | Case |
|---|---|
| UT-SECTION_TITLE-001 | Renders `h2.section-title` with its children (string and element children). |

### UNIT-BUTTON — `src/components/ui/Button.jsx` (ARC-010) → `tests/unit/components/ui/Button.test.jsx`

Requirements: FR-HERO-007, FR-RES-002, NFR-SEC-001

| ID | Case |
|---|---|
| UT-BUTTON-001 | Variants amber, outline, green → classes `btn btn-amber` / `btn-outline` / `btn-green`. |
| UT-BUTTON-002 | Icon rendered before the label; label text exact. |
| UT-BUTTON-003 | `href` applied. |
| UT-BUTTON-004 | `download` value applied; absent → no attribute. |
| UT-BUTTON-005 | `external` → `target="_blank"` and `rel="noopener noreferrer"`; not external → neither. |
| UT-BUTTON-006 | Unknown variant → behaviour per SUDS (expected: dev-time error or amber default); never renders `btn-undefined`. |

### UNIT-BADGE — `src/components/ui/Badge.jsx` (ARC-010) → `tests/unit/components/ui/Badge.test.jsx`

Requirements: FR-HERO-006

| ID | Case |
|---|---|
| UT-BADGE-001 | Renders `span.badge` with its text. |

### UNIT-SECTION — `src/components/ui/Section.jsx` (ARC-010) → `tests/unit/components/ui/Section.test.jsx`

Requirements: FR-GEN-001, FR-GEN-003, FR-FX-005

| ID | Case |
|---|---|
| UT-SECTION-001 | Renders `<section>` with `id` and `data-section` equal. |
| UT-SECTION-002 | `as="div"` renders a div with the same attributes. |
| UT-SECTION-003 | `className` and `style` passed through. |
| UT-SECTION-004 | With `label` renders SectionLabel; with `title` renders SectionTitle; without them renders neither. |
| UT-SECTION-005 | Children rendered after the heading. |
| UT-SECTION-006 | Calls `useReveal` with its root ref (mocked hook receives a ref whose current is the root). |

### UNIT-ICON_STRATEGIES — `src/components/tech/iconStrategies.js` (ARC-011) → `tests/unit/components/tech/iconStrategies.test.js`

Requirements: FR-SKILL-003, FR-SKILL-004

| ID | Case |
|---|---|
| UT-ICON_STRATEGIES-001 | `parseIconRef('si:cplusplus')` → {prefix 'si', value 'cplusplus'}; same for 'svg:i2c' and 'ms:rocket_launch'. |
| UT-ICON_STRATEGIES-002 | `parseIconRef('foo:bar')` → unknown prefix → fallback strategy selected. |
| UT-ICON_STRATEGIES-003 | `parseIconRef('nocolon')`, `''`, `null`, `undefined` → fallback, no throw. |
| UT-ICON_STRATEGIES-004 | Only the first colon splits ('ms:a:b' handled per SUDS). |
| UT-ICON_STRATEGIES-005 | `ICON_STRATEGIES` keys exactly si, ms, svg; map frozen. |
| UT-ICON_STRATEGIES-006 | si strategy builds `https://cdn.simpleicons.org/<slug>`. |
| UT-ICON_STRATEGIES-007 | Fallback strategy renders Icon "code" in the given colour. |

### UNIT-TECH_ICON — `src/components/tech/TechIcon.jsx` (ARC-011) → `tests/unit/components/tech/TechIcon.test.jsx`

Requirements: FR-SKILL-003, FR-SKILL-004

| ID | Case |
|---|---|
| UT-TECH_ICON-001 | `si:cplusplus` → `img[src$="/cplusplus"]`, `alt="cplusplus"`, width/height = size, style display block, object-fit contain, border-radius 2px. |
| UT-TECH_ICON-002 | [FR-SKILL-003, NFR-PERF-002] si image has `loading="lazy"` and `decoding="async"` (ADR-014). |
| UT-TECH_ICON-003 | `error` event on the img → Icon "code" in the given colour. |
| UT-TECH_ICON-004 | Error state persists across re-render with the same spec. |
| UT-TECH_ICON-005 | `svg:lvgl` → the CUSTOM_SVGS element (`svg`) using the colour. |
| UT-TECH_ICON-006 | `svg:unknown` → Icon "code". |
| UT-TECH_ICON-007 | `ms:code` → Icon "code" coloured; `ms:rocket_launch` → that ligature. |
| UT-TECH_ICON-008 | `foo:bar` → Icon "code". |
| UT-TECH_ICON-009 | Default size 22; custom size applied to all variants. |

### UNIT-CUSTOM_SVGS — `src/components/tech/customSvgs.jsx` (ARC-011) → `tests/unit/components/tech/customSvgs.test.jsx`

Requirements: FR-SKILL-003

| ID | Case |
|---|---|
| UT-CUSTOM_SVGS-001 | Exactly 30 keys: oop, stl, smartptr, bit, struct, lvgl, touchgfx, guiguider, crank, candera, vglite, freertos, nxp, uart, spi, i2c, can, gpio, plasticscm, tklogger, ea, polarion, gdb, dlt, hil, ecu, fontforge, agile, aspice, uml. |
| UT-CUSTOM_SVGS-002 | Each factory `(color, size)` returns an `svg` with width and height = size. |
| UT-CUSTOM_SVGS-003 | Each SVG uses the passed colour (stroke or fill contains it). |
| UT-CUSTOM_SVGS-004 | Markup of each SVG equals the baseline snapshot extracted from dd9a86d (parity). |
| UT-CUSTOM_SVGS-005 | Registry frozen. |

### UNIT-SKILL_CHIP — `src/components/tech/SkillChip.jsx` (ARC-011) → `tests/unit/components/tech/SkillChip.test.jsx`

Requirements: FR-SKILL-003, FR-GEN-010

| ID | Case |
|---|---|
| UT-SKILL_CHIP-001 | Renders `.skill-chip` > `.chip-icon-wrap` (TechIcon size 22) and `.chip-label` with the name. |
| UT-SKILL_CHIP-002 | TechIcon colour = `skill.color` or `catColor` when absent. |
| UT-SKILL_CHIP-003 | Hover: borderColor `catColor + '66'`, boxShadow `0 6px 24px ${catColor}18, inset 0 1px 0 var(--glass-shine)`, label colour = skill colour. |
| UT-SKILL_CHIP-004 | Mouse leave restores empty inline styles. |
| UT-SKILL_CHIP-005 | Skill without colour: hover label colour = catColor. |

### UNIT-GRADIENT_ORBS — `src/components/effects/GradientOrbs.jsx` (ARC-012) → `tests/unit/components/effects/GradientOrbs.test.jsx`

Requirements: FR-FX-001, NFR-A11Y-004

| ID | Case |
|---|---|
| UT-GRADIENT_ORBS-001 | `.orbs-wrap` with `aria-hidden="true"`. |
| UT-GRADIENT_ORBS-002 | 4 `.orb` children with the baseline modifier classes in order. |

### UNIT-CURSOR_GLOW — `src/components/effects/CursorGlow.jsx` (ARC-012) → `tests/unit/components/effects/CursorGlow.test.jsx`

Requirements: FR-FX-002, NFR-A11Y-004

| ID | Case |
|---|---|
| UT-CURSOR_GLOW-001 | `.cursor-glow` with `aria-hidden="true"`; initial left/top -500px. |
| UT-CURSOR_GLOW-002 | `mousemove` (400, 300) → after rAF flush left 400px, top 300px. |
| UT-CURSOR_GLOW-003 | Several moves in one frame → one style write (rAF coalescing). |
| UT-CURSOR_GLOW-004 | [FR-FX-002, NFR-PERF-004] Passive listener; removed and pending rAF cancelled on unmount. |
| UT-CURSOR_GLOW-005 | [FR-FX-002, NFR-A11Y-002] Reduced motion → renders nothing and adds no listener. |

### UNIT-PARTICLES — `src/components/effects/Particles.jsx` (ARC-012) → `tests/unit/components/effects/Particles.test.jsx`

Requirements: FR-FX-003, NFR-A11Y-004

| ID | Case |
|---|---|
| UT-PARTICLES-001 | Renders 18 `.particle`. |
| UT-PARTICLES-002 | Inline styles (left %, top %, width, height, background, opacity, `--dur`, `--delay`, `--dx`) equal `createParticles(18, mulberry32(SEED))`. |
| UT-PARTICLES-003 | Same output across unmount/remount (module-scope data). |
| UT-PARTICLES-004 | Container or particles carry no semantics (`aria-hidden`). |

### UNIT-SPEEDOMETER — `src/components/widgets/Speedometer.jsx` (ARC-013) → `tests/unit/components/widgets/Speedometer.test.jsx`

Requirements: FR-HERO-009, FR-HERO-010, NFR-PERF-006

| ID | Case |
|---|---|
| UT-SPEEDOMETER-001 | [FR-HERO-010] `speedAt(0) === 88`; `rpmAt(0)` ≈ 4309.7 (±0.1). |
| UT-SPEEDOMETER-002 | [FR-HERO-010] `speedAt(0.006)` and `rpmAt(0.006)` match the formulas (golden values). |
| UT-SPEEDOMETER-003 | [FR-HERO-009] `angleFor(0) === -215`, `angleFor(180) === 35`, `angleFor(90) === -90`; speed 200 clamps to +35°; rpm 9000 clamps to 8000. |
| UT-SPEEDOMETER-004 | [FR-HERO-009] `arcPath` large-arc flag 1 for sweep > 180°, 0 for exactly 180° and below (boundary). |
| UT-SPEEDOMETER-005 | [FR-HERO-009] `arcPath(130,130,100,-215,35)` start/end coordinates (golden string). |
| UT-SPEEDOMETER-006 | [FR-HERO-009] 19 ticks; indices 0,3,…,18 major (7) with length 18 and stroke-width 2; others length 10. |
| UT-SPEEDOMETER-007 | [FR-HERO-009] Needle length 84; endpoint at speed 0 ≈ (61.19, 178.18). |
| UT-SPEEDOMETER-008 | [FR-HERO-009] Render: viewBox "0 0 260 260"; texts rounded speed, "km/h", "HMI CLUSTER DEMO", "<n> RPM"; gradient stops #34d399→#22d3ee and #f59e0b→#fb7185. |
| UT-SPEEDOMETER-009 | [FR-HERO-009] SVG ids gbg, arcGrad, rpmGrad, needleGrad, glow, softGlow each present once. |
| UT-SPEEDOMETER-010 | [FR-HERO-009, NFR-A11Y-004] svg has `role="img"` and `aria-label="HMI cluster demo gauge"`. |
| UT-SPEEDOMETER-011 | [FR-HERO-010] In view: each frame advances t by 0.006 (speed after one frame = speedAt(0.006)). |
| UT-SPEEDOMETER-012 | [FR-HERO-010, NFR-PERF-004] Unmount calls `cancelAnimationFrame` with the pending id. |
| UT-SPEEDOMETER-013 | [FR-HERO-010, NFR-A11Y-002] Reduced motion: no rAF; static t = 0 frame (speed text "88"). |
| UT-SPEEDOMETER-014 | [NFR-PERF-006] `useInView` false (mocked) at mount → no rAF scheduled, no re-render. |
| UT-SPEEDOMETER-015 | [NFR-PERF-006] `useInView` false→true → exactly one rAF scheduled; true→false → `cancelAnimationFrame`, no further frames. |
| UT-SPEEDOMETER-016 | [NFR-PERF-006] Resume after pause continues from tRef (speed ≠ speedAt(0.006) after resume). |
| UT-SPEEDOMETER-017 | [NFR-RELI-004] StrictMode: one active loop. |

### UNIT-NAV — `src/components/layout/Nav.jsx` (ARC-014) → `tests/unit/components/layout/Nav.test.jsx`

Requirements: FR-NAV-001, FR-NAV-002, FR-NAV-003, FR-NAV-006, FR-NAV-007, FR-NAV-008, FR-NAV-009, FR-NAV-010, FR-NAV-011, FR-NAV-012, FR-THEME-004, FR-THEME-005

| ID | Case |
|---|---|
| UT-NAV-001 | [FR-NAV-001, FR-NAV-007] Renders `nav.nav`; adds `scrolled` when `useScrolled` (mocked) is true. |
| UT-NAV-002 | [FR-NAV-002] Logo: Icon developer_board (aria-hidden) + "JEEVANANDHAM". |
| UT-NAV-003 | [FR-NAV-003] 9 links from a mocked `NAV_ITEMS`: href `#id`, label, Icon size 13. |
| UT-NAV-004 | [FR-NAV-006] Only the link matching the mocked active id has `active`. |
| UT-NAV-005 | [FR-NAV-004] Never renders a link for an entry with `showInNav: false`. |
| UT-NAV-006 | [FR-THEME-005] Badge: "DAY"/"NIGHT" with wb_sunny/nights_stay per mocked context. |
| UT-NAV-007 | [FR-THEME-005] Badge time = `now.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', hour12:true})` for a fixed `now` (TZ Asia/Kolkata → "11:00 pm"). |
| UT-NAV-008 | [FR-THEME-005] Badge re-renders when context `now` changes. |
| UT-NAV-009 | [FR-THEME-004] Theme button: `title="Toggle day/night theme"`; day → "Night" + dark_mode; night → "Day" + light_mode; click calls `toggle`. |
| UT-NAV-010 | [FR-NAV-011] Hamburger `aria-label="Menu"`, `aria-expanded` false/true, `aria-controls` equals the mobile menu id. |
| UT-NAV-011 | [FR-NAV-009] Hamburger click toggles `.mobile-menu.open`. |
| UT-NAV-012 | [FR-NAV-009] Mobile menu: 9 links with Icon size 15 and the theme button "Switch to Night Mode"/"Switch to Day Mode" (opposite theme), style marginTop 8, width 100%. |
| UT-NAV-013 | [FR-NAV-010] Mobile link click closes the menu. |
| UT-NAV-014 | [FR-NAV-010] Mobile theme button calls `toggle` and closes the menu. |
| UT-NAV-015 | [FR-NAV-012] Escape while open closes and focuses the hamburger. |
| UT-NAV-016 | [FR-NAV-012] Escape while closed: no state change, focus unchanged; other keys ignored. |
| UT-NAV-017 | [FR-NAV-012, NFR-PERF-004] Key listener removed on close and on unmount. |
| UT-NAV-018 | `nav` has `aria-label="Primary"`; theme toggle accessible name names the target mode without ligature text. |

### UNIT-FOOTER — `src/components/layout/Footer.jsx` (ARC-014) → `tests/unit/components/layout/Footer.test.jsx`

Requirements: FR-GEN-004

| ID | Case |
|---|---|
| UT-FOOTER-001 | Renders `footer` with `FOOTER_TEXT` between two developer_board Icons (aria-hidden). |

### UNIT-DIVIDER — `src/components/layout/Divider.jsx` (ARC-014) → `tests/unit/components/layout/Divider.test.jsx`

Requirements: FR-GEN-001

| ID | Case |
|---|---|
| UT-DIVIDER-001 | Renders an empty `div.divider`. |

### UNIT-ERROR_BOUNDARY — `src/components/ErrorBoundary.jsx` (ARC-015) → `tests/unit/components/ErrorBoundary.test.jsx`

Requirements: FR-GEN-007

| ID | Case |
|---|---|
| UT-ERROR_BOUNDARY-001 | Renders children when nothing throws. |
| UT-ERROR_BOUNDARY-002 | Child throwing during render → `fallback` node rendered. |
| UT-ERROR_BOUNDARY-003 | `fallback` as function receives `(error, reset)`; calling `reset` re-renders children (child no longer throwing). |
| UT-ERROR_BOUNDARY-004 | `componentDidCatch` logs via `console.error`. |
| UT-ERROR_BOUNDARY-005 | `onError` callback receives the error and component stack. |
| UT-ERROR_BOUNDARY-006 | No `fallback` prop → default fallback text. |
| UT-ERROR_BOUNDARY-007 | Suspense child whose lazy import rejects → fallback. |
| UT-ERROR_BOUNDARY-008 | Errors thrown in event handlers are not caught (documented React limitation; page stays). |
| UT-ERROR_BOUNDARY-009 | Nested boundaries: the inner boundary catches first; the outer stays intact. |

### UNIT-APP — `src/App.jsx` (ARC-002) → `tests/unit/App.test.jsx`

Requirements: FR-GEN-001, FR-GEN-005, FR-GEN-007, NFR-A11Y-008, NFR-MAINT-001

| ID | Case |
|---|---|
| UT-APP-001 | [FR-GEN-001] Composition order: skip link, GradientOrbs, CursorGlow, Nav, `main#main[tabindex=-1]`, Footer, all inside ThemeProvider. |
| UT-APP-002 | [FR-GEN-001] Renders registry entries in order with a Divider between consecutive entries (registry mocked with 3 stub entries → 2 dividers). |
| UT-APP-003 | [FR-GEN-005] Eager entry rendered synchronously on the first render. |
| UT-APP-004 | [FR-GEN-005] Lazy entries wrapped in Suspense with a placeholder carrying `id`, `data-section` and `min-height`. |
| UT-APP-005 | [FR-GEN-007] Each lazy entry wrapped in a section-level ErrorBoundary keyed by id. |
| UT-APP-006 | [NFR-A11Y-008] `a.skip-link` "Skip to content" `href="#main"` is the first focusable element. |
| UT-APP-007 | [NFR-MAINT-001] Source contains no content literals or CSS (static scan of App.jsx). |

### UNIT-MAIN — `src/main.jsx` (ARC-001) → `tests/unit/main.test.jsx`

Requirements: FR-GEN-007, NFR-RELI-004, NFR-MAINT-003

| ID | Case |
|---|---|
| UT-MAIN-001 | Calls `createRoot(document.getElementById('root'))` once. |
| UT-MAIN-002 | Renders `StrictMode` > `ErrorBoundary` (page fallback) > `App`. |
| UT-MAIN-003 | Imports `./styles/index.css` exactly once. |
| UT-MAIN-004 | Page fallback shows owner name, title, email link, resume link and a reload button. |

### UNIT-HERO — `src/sections/Hero.jsx` (ARC-016) → `tests/unit/sections/Hero.test.jsx`

Requirements: FR-HERO-001, FR-HERO-002, FR-HERO-005, FR-HERO-006, FR-HERO-007, FR-HERO-008, FR-HERO-011, FR-HERO-012, FR-HERO-013, FR-FX-003, FR-FX-004

| ID | Case |
|---|---|
| UT-HERO-001 | [FR-HERO-001] `section#hero.hero[data-section=hero]` with `.hero-content`, `.hero-center`, `.hero-right`. |
| UT-HERO-002 | [FR-HERO-002] Tag line with developer_board icon; one `h1` with `em` "Jeevanandham" and `br` before "B.ECE". |
| UT-HERO-003 | [FR-HERO-003] `.hero-typewriter` shows `useTypewriter` output followed by the cursor element. |
| UT-HERO-004 | [FR-HERO-005] Bio with 2 `strong` elements built from data segments (no HTML strings). |
| UT-HERO-005 | [FR-HERO-006] 8 Badges from data. |
| UT-HERO-006 | [FR-HERO-007] 3 Buttons: amber `#projects`, outline `#contact`, green resume with `download` = `RESUME.downloadName`. |
| UT-HERO-007 | [FR-HERO-008] Gauge widget: label, Speedometer, 3 gauge stats with inline colours, 5 stack tags. |
| UT-HERO-008 | [FR-HERO-011] Profile card: img attrs (src, alt, 600, 900, decoding async), `.scan`, 4 `.corner`, panel texts and 4 tags. |
| UT-HERO-009 | [FR-HERO-012] `error` on the profile img sets `display: none`; panel remains. |
| UT-HERO-010 | [FR-HERO-013] Parallax ref attached to `.profile-card` with inline transition "transform 0.15s ease-out". |
| UT-HERO-011 | [FR-FX-003, FR-FX-004] Renders Particles and 4 `.hring` in `.hero-rings` (aria-hidden). |
| UT-HERO-012 | [NFR-A11Y-002] Reduced motion (mocked hook) → typewriter `enabled:false`, parallax `enabled:false`. |

### UNIT-ABOUT — `src/sections/About.jsx` (ARC-016) → `tests/unit/sections/About.test.jsx`

Requirements: FR-ABOUT-001, FR-ABOUT-002, FR-ABOUT-003, FR-FX-005, FR-GEN-010

| ID | Case |
|---|---|
| UT-ABOUT-001 | [FR-ABOUT-001] Section id/data-section "about"; label "01 — About" (person); title "Who I Am". |
| UT-ABOUT-002 | [FR-ABOUT-002] 4 paragraphs; 5 `.hl` spans in order. |
| UT-ABOUT-003 | [FR-ABOUT-003] 4 `.stat-card` with num/label and `.stat-num` inline colour. |
| UT-ABOUT-004 | [FR-FX-005] Stat cards have `reveal d0..d3`. |
| UT-ABOUT-005 | [FR-GEN-010] Hover sets border `${color}66` and shadow `0 16px 48px ${color}22`; leave restores. |

### UNIT-EXPERIENCE — `src/sections/Experience.jsx` (ARC-016) → `tests/unit/sections/Experience.test.jsx`

Requirements: FR-EXP-001, FR-EXP-002, FR-FX-005

| ID | Case |
|---|---|
| UT-EXPERIENCE-001 | [FR-EXP-001] Root `#experience.exp-band.full-band[data-section=experience]`; label "02 — Experience" (work); title "Career". |
| UT-EXPERIENCE-002 | [FR-EXP-002] 4 `.exp-item` with dot, amber icon tile, role, company, period, location, desc. |
| UT-EXPERIENCE-003 | [FR-FX-005] Items have `reveal d<min(i,3)>`. |

### UNIT-SKILLS — `src/sections/Skills.jsx` (ARC-016) → `tests/unit/sections/Skills.test.jsx`

Requirements: FR-SKILL-001, FR-SKILL-002, FR-SKILL-005, FR-FX-005

| ID | Case |
|---|---|
| UT-SKILLS-001 | [FR-SKILL-001] Section id "skills"; label "03 — Skills" (build); title "Toolbox". |
| UT-SKILLS-002 | [FR-SKILL-002] 9 `.skill-cat`; pill badge colour/border = headerColor, background = headerBg; gradient rule line. |
| UT-SKILLS-003 | [FR-SKILL-002] SkillChip per skill with `catColor` = headerColor. |
| UT-SKILLS-004 | [FR-FX-005] Categories have `reveal d<i mod 3>`. |
| UT-SKILLS-005 | [FR-SKILL-005] ISO strip: title, verified_user icon, description, 5 `.iso-chip`. |

### UNIT-PROJECTS — `src/sections/Projects.jsx` (ARC-016) → `tests/unit/sections/Projects.test.jsx`

Requirements: FR-PROJ-001, FR-PROJ-002, FR-FX-005, FR-GEN-010

| ID | Case |
|---|---|
| UT-PROJECTS-001 | [FR-PROJ-001] Section id "projects", background `var(--bg2)`; label "04 — Engineering Projects"; title "Selected Work". |
| UT-PROJECTS-002 | [FR-PROJ-002] 6 `.project-card`; `.wide` per data; period, icon tile bg/border, number colour, domain, title, desc, tags with colour/bg/border. |
| UT-PROJECTS-003 | [FR-FX-005] Cards have `reveal d<i mod 2>` (and `wide` before the stagger class as in baseline). |
| UT-PROJECTS-004 | [FR-GEN-010] Hover sets inline border-color `${color}99` and activates the top line; leave restores `border`. |

### UNIT-DESIGN — `src/sections/Design.jsx` (ARC-016) → `tests/unit/sections/Design.test.jsx`

Requirements: FR-DESIGN-001, FR-DESIGN-002, FR-DESIGN-003, FR-FX-005

| ID | Case |
|---|---|
| UT-DESIGN-001 | [FR-DESIGN-001] Root id "design", full band; label "05 — Design Portfolio" (brush); title "Creative Work". |
| UT-DESIGN-002 | [FR-DESIGN-002] 5 `a.behance-card`; only "Infotainment UI Modules" `.wide`; `svg` in `.behance-card-bg` from `DESIGN_ART[artKey]`; tag with icon and colour; "View on Behance". |
| UT-DESIGN-003 | [FR-DESIGN-003] href Behance, `target=_blank`, `rel="noopener noreferrer"`. |
| UT-DESIGN-004 | [FR-FX-005] Cards have `reveal d<i mod 2>`. |
| UT-DESIGN-005 | Unknown `artKey` → behaviour per SUDS (card renders without art, no crash). |
| UT-DESIGN-006 | [FR-GEN-010] Hover sets CTA gap state per baseline inline handlers (if any) and restores. |

### UNIT-EDUCATION — `src/sections/Education.jsx` (ARC-016) → `tests/unit/sections/Education.test.jsx`

Requirements: FR-EDU-001, FR-EDU-002, FR-EDU-003, FR-EDU-004

| ID | Case |
|---|---|
| UT-EDUCATION-001 | [FR-EDU-001] Section id "education"; label "06 — Education" (school); title "Academic Background". |
| UT-EDUCATION-002 | [FR-EDU-002] Degree card renders `.edu-tag` chips for `tagVariant: 'edu'`. |
| UT-EDUCATION-003 | [FR-EDU-003] Domain card renders amber inline-styled chips for `tagVariant: 'domain'`; icon colour #f59e0b. |
| UT-EDUCATION-004 | [FR-EDU-004] Renders from mocked data (substituted texts appear); source has no degree/school literals. |

### UNIT-CERTIFICATIONS — `src/sections/Certifications.jsx` (ARC-016) → `tests/unit/sections/Certifications.test.jsx`

Requirements: FR-CERT-001, FR-CERT-002, FR-FX-005

| ID | Case |
|---|---|
| UT-CERTIFICATIONS-001 | [FR-CERT-001] Root id "certifications" full band; label "07 — Certifications" (verified); title "Credentials". |
| UT-CERTIFICATIONS-002 | [FR-CERT-002] 3 `.cert-card` with icon, name, org. |
| UT-CERTIFICATIONS-003 | [FR-FX-005] Cards have `reveal d<i>`. |

### UNIT-RESUME — `src/sections/Resume.jsx` (ARC-016) → `tests/unit/sections/Resume.test.jsx`

Requirements: FR-RES-001, FR-RES-002, FR-RES-003, FR-GEN-003

| ID | Case |
|---|---|
| UT-RESUME-001 | [FR-RES-001, FR-GEN-003] Label "08 — Resume" (description); `h3` "Download My Resume"; no `h2`; paragraph text. |
| UT-RESUME-002 | [FR-RES-002] "Download PDF" btn-green with href/download from config; "View Online" btn-outline external. |
| UT-RESUME-003 | [FR-RES-003] Preview header uses `RESUME.pages` ("· 3 PAGES"); name; role line; location/email/phone rows. |
| UT-RESUME-004 | [FR-RES-003] 4 skill rows with fill widths 92%, 88%, 85%, 78% and gradient backgrounds. |
| UT-RESUME-005 | [FR-RES-003] Small "Download" link with the download name; small "View" link external. |

### UNIT-CONTACT — `src/sections/Contact.jsx` (ARC-016) → `tests/unit/sections/Contact.test.jsx`

Requirements: FR-CONT-001, FR-CONT-002, FR-CONT-003, FR-CONT-004

| ID | Case |
|---|---|
| UT-CONTACT-001 | [FR-CONT-001] Section id "contact", centred; label "09 — Contact" (mail); title "Let's Work Together"; intro text. |
| UT-CONTACT-002 | [FR-CONT-002] Primary row: `.c-email` mailto and `.c-phone` tel with texts and icons. |
| UT-CONTACT-003 | [FR-CONT-003] Social row: `.c-li`, `.c-bh`, `.c-gh` with hrefs, target and rel. |
| UT-CONTACT-004 | [FR-CONT-004] `.contact-loc` "Chennai, Tamil Nadu, India" with location_on. |

### UNIT-STYLE_TOKENS — `src/styles/tokens.css` (ARC-017) → `tests/unit/styles/tokens.test.js`

Requirements: FR-THEME-001

| ID | Case |
|---|---|
| UT-STYLE_TOKENS-001 | `:root` night tokens: --bg #060c18, --amber #f59e0b, --cyan #22d3ee, --green #34d399, --rose #fb7185, --violet #a78bfa, --text #e2e8f0. |
| UT-STYLE_TOKENS-002 | `[data-theme="day"]` overrides: --bg #fef9f0, --amber #b45309, --cyan #0369a1, --green #15803d, --rose #be123c, --violet #6d28d9, --text #1e293b. |
| UT-STYLE_TOKENS-003 | Contains only `:root` and `[data-theme="day"]` blocks (layer purity); token set equals the baseline set. |

### UNIT-STYLE_BASE — `src/styles/base.css` (ARC-017) → `tests/unit/styles/base.test.js`

Requirements: NFR-A11Y-001, NFR-A11Y-009, FR-FX-005, FR-THEME-006, FR-NAV-005

| ID | Case |
|---|---|
| UT-STYLE_BASE-001 | [NFR-A11Y-001] Reduced-motion block: animation-duration 0.01ms, iteration-count 1, transition-duration 0.01ms (all !important), scroll-behavior auto; `.particle` and `.cursor-glow` display none. |
| UT-STYLE_BASE-002 | [FR-NAV-005] `html { scroll-behavior: smooth }`. |
| UT-STYLE_BASE-003 | [FR-FX-005] `.reveal` opacity 0 translateY(30px); `.reveal.visible` resets; `.d1/.d2/.d3` delays 0.1/0.2/0.3s. |
| UT-STYLE_BASE-004 | [FR-THEME-006] html/body transitions: background 1.2s, colour 0.6s. |
| UT-STYLE_BASE-005 | [NFR-A11Y-009] Appended `a:focus-visible, button:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px }` and `:focus:not(:focus-visible) { outline: none }` after all baseline rules. |
| UT-STYLE_BASE-006 | [FR-GEN-010] Body pseudo-element grid 56px and radial glow with day-theme variants. |

### UNIT-STYLE_COMPONENTS — `src/styles/components.css` (ARC-017) → `tests/unit/styles/components.test.js`

Requirements: FR-NAV-001, FR-NAV-007, FR-NAV-009, FR-SKILL-006, FR-FX-001, FR-FX-002, FR-FX-004, NFR-A11Y-008, NFR-PORT-001, FR-THEME-006

| ID | Case |
|---|---|
| UT-STYLE_COMPONENTS-001 | [FR-NAV-001] `.nav` fixed, top 0, height 64px, z-index 300. |
| UT-STYLE_COMPONENTS-002 | [FR-NAV-007] `.nav.scrolled` height 54px; transition 0.3s. |
| UT-STYLE_COMPONENTS-003 | [FR-NAV-009] `.mobile-menu` fixed, top 64px; `.open` shows it. |
| UT-STYLE_COMPONENTS-004 | [FR-SKILL-006] `[data-theme="night"] .chip-icon-wrap img` brightness(1.5) saturate(1.1); day brightness(0.85) saturate(1.05). |
| UT-STYLE_COMPONENTS-005 | [FR-FX-001, FR-FX-004] Orb sizes 700/600/500/400 and durations 20/25/18/28s; hring sizes 580/440/300/180 and durations 80/55/36/24s. |
| UT-STYLE_COMPONENTS-006 | [FR-FX-002] `.cursor-glow` 380px, transition 60ms linear. |
| UT-STYLE_COMPONENTS-007 | [NFR-A11Y-008] `.skip-link` off-screen (not `display:none`); `.skip-link:focus` on-screen with z-index 301 using theme tokens; appended after baseline rules. |
| UT-STYLE_COMPONENTS-008 | [NFR-PORT-001] Every `backdrop-filter` has a matching `-webkit-backdrop-filter`. |
| UT-STYLE_COMPONENTS-009 | [FR-THEME-006] Cards/controls transitions: background 0.8s, border 0.5s, colour 0.4s, shadow 0.5s. |

### UNIT-STYLE_SECTIONS — `src/styles/sections.css` (ARC-017) → `tests/unit/styles/sections.test.js`

Requirements: FR-HERO-001, FR-HERO-014, FR-ABOUT-004, FR-PROJ-003, FR-CERT-002, FR-GEN-008

| ID | Case |
|---|---|
| UT-STYLE_SECTIONS-001 | [FR-HERO-001] `.hero` grid-template-columns `1fr 360px 260px`, min-height 100vh. |
| UT-STYLE_SECTIONS-002 | [FR-GEN-008, FR-HERO-014] `@media (max-width: 900px)` block: hero single column with padding 80px 24px 60px, `.hero-center`/`.hero-right` hidden; about/projects/design/education/resume single column; skills and cert 2 columns; section padding 24px; badge hidden. |
| UT-STYLE_SECTIONS-003 | [FR-GEN-008, FR-HERO-014] `@media (max-width: 540px)` block: skills and cert 1 column; `.hero-cta` column; `.btn` full width. |
| UT-STYLE_SECTIONS-004 | [FR-ABOUT-004] About grid gap 40px at ≤ 900 px. |
| UT-STYLE_SECTIONS-005 | [FR-PROJ-003] Wide project cards span column 1 only at ≤ 900 px. |
| UT-STYLE_SECTIONS-006 | [FR-CERT-002] Cert grid 3 columns by default. |

### UNIT-STYLE_INDEX — `src/styles/index.css` (ARC-017) → `tests/unit/styles/index.test.js`

Requirements: NFR-MAINT-003

| ID | Case |
|---|---|
| UT-STYLE_INDEX-001 | Contains exactly four `@import`s in order tokens, base, components, sections and no rules. |
| UT-STYLE_INDEX-002 | (SUDS 6.15) Concatenated files keep every baseline rule in order; only skip-link/focus rules are added. |

### UNIT-GAUGE — `src/lib/gauge.js` → `tests/unit/lib/gauge.test.js`

Added in Amendment R1 (DEF-017): unit exists in code, was missing from the catalogue.

| ID | Case |
|---|---|
| UT-GAUGE-001 | `GAUGE` constants are frozen with the SUDS values. |
| UT-GAUGE-002 | `speedAt(0) === 88` and `rpmAt(0)` ≈ 4309.765. |
| UT-GAUGE-003 | Baseline formulas at t = 1. |
| UT-GAUGE-004 | `gaugeFrame` returns `{ speed, rpm }`. |
| UT-GAUGE-005 | `speedAngle`: 0 → -215, 180 → 35, 500 clamps to 35. |
| UT-GAUGE-006 | `rpmAngle`: 0 → -215, 8000 → 35, 20000 clamps to 35. |
| UT-GAUGE-007 | `needlePoint(-215)` equals centre + 84 × (cos, sin). |
| UT-GAUGE-008 | `arcPath` format and large-arc flag. |
| UT-GAUGE-009 | `arcPath` large-arc boundary: sweep of exactly 180 → 0, 181 → 1. |
| UT-GAUGE-010 | `gaugeTicks`: 19 frozen ticks, 7 majors at 0, 3, …, 18. |
| UT-GAUGE-011 | Tick radii: outer 100, major inner 82, minor inner 90. |
| UT-GAUGE-012 | First/last tick angles span -215..35 degrees. |

### UNIT-MODELS_INDEX — `src/models/index.js` → `tests/unit/models/index.test.js`

Added in Amendment R1 (DEF-017): unit exists in code, was missing from the catalogue.

| ID | Case |
|---|---|
| UT-MODELS_INDEX-001 | Every factory name, `ModelValidationError` and `deepFreeze` are exported functions. |

### UNIT-RICH_TEXT — `src/components/ui/RichText.jsx` → `tests/unit/components/ui/RichText.test.jsx`

Added in Amendment R1 (DEF-017): unit exists in code, was missing from the catalogue.

| ID | Case |
|---|---|
| UT-RICH_TEXT-001 | Mixed segments produce the exact innerHTML. |
| UT-RICH_TEXT-002 | Markup-like text is rendered as text, not markup; no wrapper element. |

### UNIT-DESIGN_ART — `src/components/widgets/DesignArt.jsx` → `tests/unit/components/widgets/DesignArt.test.jsx`

Added in Amendment R1 (DEF-017): unit exists in code, was missing from the catalogue.

| ID | Case |
|---|---|
| UT-DESIGN_ART-001 | Each known art key renders an `svg` with its documented viewBox (parametrised). |
| UT-DESIGN_ART-002 | Unknown key renders nothing (also inherited keys). |
| UT-DESIGN_ART-003 | Cluster art has 12 tick lines; medical contains "Rajesh Kumar". |

### UNIT-SECTION_SLOT — `src/components/layout/SectionSlot.jsx` → `tests/unit/components/layout/SectionSlot.test.jsx`

Added in Amendment R1 (DEF-017): unit exists in code, was missing from the catalogue.

| ID | Case |
|---|---|
| UT-SECTION_SLOT-001 | Eager entry renders the component with `meta`. |
| UT-SECTION_SLOT-002 | Lazy pending shows the placeholder (id, data-section, marker, min-height). |
| UT-SECTION_SLOT-003 | Resolving lazy shows the section. |
| UT-SECTION_SLOT-004 | Rejected lazy import shows the fallback with id and a working Reload button. |
| UT-SECTION_SLOT-005 | A throwing component shows the fallback while a sibling slot still renders. |

## 5. Traceability matrix (Requirement → test cases)

| Requirement | QT | IT | UT |
|---|---|---|---|
| FR-NAV-001 | QT-001 | — | UT-NAV-*, UT-STYLE_COMPONENTS-* |
| FR-NAV-002 | QT-002 | IT-029 | UT-NAV-* |
| FR-NAV-003 | QT-003 | IT-009, IT-010 | UT-CONFIG_SECTIONS-*, UT-NAV-* |
| FR-NAV-004 | QT-004 | IT-010, IT-011 | UT-CONFIG_SECTIONS-* |
| FR-NAV-005 | QT-005 | — | UT-STYLE_BASE-* |
| FR-NAV-006 | QT-006 | IT-013, IT-025 | UT-NAV-*, UT-USE_ACTIVE_SECTION-* |
| FR-NAV-007 | QT-007 | IT-026 | UT-NAV-*, UT-STYLE_COMPONENTS-*, UT-USE_SCROLLED-* |
| FR-NAV-008 | QT-008 | — | UT-NAV-* |
| FR-NAV-009 | QT-009 | IT-027 | UT-NAV-*, UT-STYLE_COMPONENTS-* |
| FR-NAV-010 | QT-010 | IT-002, IT-027 | UT-NAV-* |
| FR-NAV-011 | QT-011 | IT-027 | UT-NAV-* |
| FR-NAV-012 | QT-012 | IT-027 | UT-NAV-* |
| FR-HERO-001 | QT-013 | — | UT-HERO-*, UT-STYLE_SECTIONS-* |
| FR-HERO-002 | QT-014 | — | UT-DATA_PROFILE-*, UT-HERO-* |
| FR-HERO-003 | QT-015 | — | UT-DATA_PROFILE-*, UT-USE_TYPEWRITER-* |
| FR-HERO-004 | QT-016 | — | UT-USE_TYPEWRITER-* |
| FR-HERO-005 | QT-017 | — | UT-DATA_PROFILE-*, UT-HERO-* |
| FR-HERO-006 | QT-018 | — | UT-BADGE-*, UT-DATA_PROFILE-*, UT-HERO-* |
| FR-HERO-007 | QT-019 | IT-032 | UT-BUTTON-*, UT-HERO-* |
| FR-HERO-008 | QT-020 | — | UT-DATA_PROFILE-*, UT-HERO-* |
| FR-HERO-009 | QT-021 | — | UT-SPEEDOMETER-* |
| FR-HERO-010 | QT-022 | IT-021, IT-022, IT-023 | UT-SPEEDOMETER-* |
| FR-HERO-011 | QT-023 | — | UT-DATA_PROFILE-*, UT-HERO-* |
| FR-HERO-012 | QT-024 | — | UT-HERO-* |
| FR-HERO-013 | QT-025 | IT-021 | UT-HERO-*, UT-USE_PARALLAX-* |
| FR-HERO-014 | QT-026 | — | UT-STYLE_SECTIONS-* |
| FR-ABOUT-001 | QT-027 | — | UT-ABOUT-* |
| FR-ABOUT-002 | QT-028 | — | UT-ABOUT-*, UT-DATA_PROFILE-* |
| FR-ABOUT-003 | QT-029 | IT-034 | UT-ABOUT-*, UT-DATA_PROFILE-* |
| FR-ABOUT-004 | QT-030 | — | UT-STYLE_SECTIONS-* |
| FR-EXP-001 | QT-031 | — | UT-EXPERIENCE-* |
| FR-EXP-002 | QT-032 | IT-017, IT-034 | UT-DATA_EXPERIENCE-*, UT-EXPERIENCE-* |
| FR-SKILL-001 | QT-033 | — | UT-SKILLS-* |
| FR-SKILL-002 | QT-034 | IT-017, IT-019 | UT-DATA_SKILLS-*, UT-SKILLS-* |
| FR-SKILL-003 | QT-035 | IT-019 | UT-CUSTOM_SVGS-*, UT-DATA_SKILLS-*, UT-ICON_STRATEGIES-*, UT-SKILL_CHIP-*, UT-TECH_ICON-* |
| FR-SKILL-004 | QT-036 | IT-020 | UT-ICON_STRATEGIES-*, UT-TECH_ICON-* |
| FR-SKILL-005 | QT-037 | — | UT-DATA_SKILLS-*, UT-SKILLS-* |
| FR-SKILL-006 | QT-038 | — | UT-STYLE_COMPONENTS-* |
| FR-PROJ-001 | QT-039 | — | UT-PROJECTS-* |
| FR-PROJ-002 | QT-040 | IT-017, IT-034 | UT-DATA_PROJECTS-*, UT-PROJECTS-* |
| FR-PROJ-003 | QT-041 | — | UT-STYLE_SECTIONS-* |
| FR-DESIGN-001 | QT-042 | — | UT-DESIGN-* |
| FR-DESIGN-002 | QT-043 | IT-034 | UT-DATA_DESIGN-*, UT-DESIGN-* |
| FR-DESIGN-003 | QT-044 | IT-031 | UT-DATA_DESIGN-*, UT-DESIGN-* |
| FR-EDU-001 | QT-045 | — | UT-EDUCATION-* |
| FR-EDU-002 | QT-046 | — | UT-DATA_EDUCATION-*, UT-EDUCATION-* |
| FR-EDU-003 | QT-047 | — | UT-DATA_EDUCATION-*, UT-EDUCATION-* |
| FR-EDU-004 | QT-048 | IT-033 | UT-DATA_EDUCATION-*, UT-EDUCATION-* |
| FR-CERT-001 | QT-049 | — | UT-CERTIFICATIONS-* |
| FR-CERT-002 | QT-050 | IT-034 | UT-CERTIFICATIONS-*, UT-DATA_CERTIFICATIONS-*, UT-STYLE_SECTIONS-* |
| FR-RES-001 | QT-051 | — | UT-RESUME-* |
| FR-RES-002 | QT-052 | IT-032 | UT-BUTTON-*, UT-CONFIG_SITE-*, UT-RESUME-* |
| FR-RES-003 | QT-053 | IT-032 | UT-DATA_PROFILE-*, UT-RESUME-* |
| FR-RES-004 | QT-054 | — | — |
| FR-CONT-001 | QT-055 | — | UT-CONTACT-*, UT-DATA_CONTACT-* |
| FR-CONT-002 | QT-056 | IT-034, IT-035 | UT-CONFIG_SITE-*, UT-CONTACT-*, UT-DATA_CONTACT-* |
| FR-CONT-003 | QT-057 | IT-031, IT-035 | UT-CONFIG_SITE-*, UT-CONTACT-*, UT-DATA_CONTACT-* |
| FR-CONT-004 | QT-058 | — | UT-CONTACT-* |
| FR-THEME-001 | QT-059 | IT-003, IT-004 | UT-STYLE_TOKENS-*, UT-USE_THEME-* |
| FR-THEME-002 | QT-060 | — | UT-SOLAR-*, UT-USE_THEME-* |
| FR-THEME-003 | QT-061 | IT-004, IT-006 | UT-USE_THEME-* |
| FR-THEME-004 | QT-062 | IT-002, IT-006 | UT-NAV-*, UT-USE_THEME-* |
| FR-THEME-005 | QT-063 | IT-007 | UT-NAV-* |
| FR-THEME-006 | QT-064 | IT-039 | UT-STYLE_BASE-*, UT-STYLE_COMPONENTS-* |
| FR-THEME-007 | QT-065 | IT-002, IT-008 | UT-THEME_CONTEXT-* |
| FR-THEME-008 | QT-066 | IT-002, IT-004, IT-005 | UT-CONFIG_SITE-*, UT-STORAGE-*, UT-USE_THEME-* |
| FR-FX-001 | QT-067 | IT-036 | UT-GRADIENT_ORBS-*, UT-STYLE_COMPONENTS-* |
| FR-FX-002 | QT-068 | IT-021 | UT-CURSOR_GLOW-*, UT-STYLE_COMPONENTS-* |
| FR-FX-003 | QT-069 | IT-036 | UT-HERO-*, UT-PARTICLES-*, UT-RANDOM-* |
| FR-FX-004 | QT-070 | IT-036 | UT-HERO-*, UT-STYLE_COMPONENTS-* |
| FR-FX-005 | QT-071 | IT-012, IT-030 | UT-ABOUT-*, UT-CERTIFICATIONS-*, UT-DESIGN-*, UT-EXPERIENCE-*, UT-PROJECTS-*, UT-SECTION-*, UT-SKILLS-*, UT-STYLE_BASE-*, UT-USE_REVEAL-* |
| FR-GEN-001 | QT-072 | IT-009 | UT-APP-*, UT-CONFIG_SECTIONS-*, UT-DIVIDER-*, UT-SECTION-* |
| FR-GEN-002 | QT-073 | IT-011 | UT-CONFIG_SECTIONS-* |
| FR-GEN-003 | QT-074 | — | UT-RESUME-*, UT-SECTION-*, UT-SECTION_LABEL-*, UT-SECTION_TITLE-* |
| FR-GEN-004 | QT-075 | IT-035 | UT-CONFIG_SITE-*, UT-FOOTER-* |
| FR-GEN-005 | QT-076 | IT-012, IT-013 | UT-APP-*, UT-CONFIG_SECTIONS-* |
| FR-GEN-006 | QT-077 | IT-017, IT-018 | UT-CREATE_MODELS-*, UT-INDEX-*, UT-VALIDATE-* |
| FR-GEN-007 | QT-078 | IT-001, IT-014, IT-015, IT-016 | UT-APP-*, UT-ERROR_BOUNDARY-*, UT-MAIN-* |
| FR-GEN-008 | QT-079, QT-109, QT-110 | — | UT-STYLE_SECTIONS-* |
| FR-GEN-009 | QT-080 | IT-041 | — |
| FR-GEN-010 | QT-081, QT-109, QT-110 | — | UT-ABOUT-*, UT-PROJECTS-*, UT-SKILL_CHIP-* |
| NFR-PERF-001 | QT-082 | — | — |
| NFR-PERF-002 | QT-083 | — | — |
| NFR-PERF-003 | QT-084 | IT-041 | — |
| NFR-PERF-004 | QT-085 | IT-037 | — |
| NFR-PERF-006 | QT-087 | IT-023, IT-024 | UT-SPEEDOMETER-*, UT-USE_IN_VIEW-* |
| NFR-PERF-005 | QT-086 | — | — |
| NFR-A11Y-001 | QT-088 | IT-021 | UT-STYLE_BASE-* |
| NFR-A11Y-002 | QT-089 | IT-021, IT-022 | UT-USE_PREFERS_REDUCED_MOTION-* |
| NFR-A11Y-003 | QT-090 | — | — |
| NFR-A11Y-004 | QT-091 | — | UT-CURSOR_GLOW-*, UT-GRADIENT_ORBS-*, UT-PARTICLES-* |
| NFR-A11Y-005 | QT-092 | IT-028 | — |
| NFR-A11Y-006 | QT-093 | — | — |
| NFR-A11Y-007 | QT-094 | IT-029 | UT-ICON-* |
| NFR-A11Y-008 | QT-095 | IT-028 | UT-APP-*, UT-STYLE_COMPONENTS-* |
| NFR-A11Y-009 | QT-096 | — | UT-STYLE_BASE-* |
| NFR-SEC-001 | QT-097 | IT-031 | UT-BUTTON-* |
| NFR-SEC-002 | QT-098 | — | — |
| NFR-SEC-003 | QT-099 | — | — |
| NFR-SEC-004 | QT-100 | IT-018 | — |
| NFR-SEC-005 | QT-101 | — | — |
| NFR-MAINT-001 | QT-102 | IT-038 | UT-APP-* |
| NFR-MAINT-002 | QT-103 | IT-038 | — |
| NFR-MAINT-003 | QT-104 | IT-001, IT-039 | UT-MAIN-*, UT-STYLE_INDEX-* |
| NFR-MAINT-004 | QT-105 | — | — |
| NFR-MAINT-005 | QT-106 | IT-042, IT-043 | — |
| NFR-MAINT-006 | QT-107 | — | UT-INDEX-*, UT-TYPES-* |
| NFR-MAINT-007 | QT-108 | IT-042 | — |
| NFR-MAINT-008 | QT-109, QT-110, QT-111 | IT-040 | — |
| NFR-PORT-001 | QT-112 | — | UT-STYLE_COMPONENTS-* |
| NFR-PORT-002 | QT-113 | — | — |
| NFR-PORT-003 | QT-114 | — | — |
| NFR-USAB-001 | QT-115 | — | — |
| NFR-USAB-002 | QT-116 | — | — |
| NFR-USAB-003 | QT-117 | — | — |
| NFR-RELI-001 | QT-118 | — | — |
| NFR-RELI-002 | QT-119 | — | — |
| NFR-RELI-003 | QT-120 | IT-020 | — |
| NFR-RELI-004 | QT-121 | IT-001, IT-037 | UT-MAIN-* |
| NFR-RELI-005 | QT-122 | IT-030 | UT-USE_REVEAL-* |
| NFR-SEO-001 | QT-123 | IT-041 | — |
| NFR-SEO-002 | QT-124 | IT-041 | — |
| NFR-SEO-003 | QT-125 | IT-041 | — |
| NFR-DEPLOY-001 | QT-126 | — | — |
| NFR-DEPLOY-002 | QT-127 | IT-042 | — |
| NFR-DEPLOY-003 | QT-128 | IT-042 | — |
| NFR-DEPLOY-004 | QT-129 | IT-042 | — |
| NFR-DEPLOY-005 | QT-130 | — | — |

## 6. Coverage summary

- Requirements: 128; with ≥1 QT case: 128; without QT: none.
- Test cases: 130 QT, 43 IT, 441 UT across 61 units.
- Orphan check: every QT and IT case cites at least one requirement; every UT unit maps to a SUDS unit.
