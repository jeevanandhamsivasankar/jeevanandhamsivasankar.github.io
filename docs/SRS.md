# Software Requirements Specification (SRS)

**Product:** Portfolio website of S. Jeevanandham, Senior HMI Engineer
**URL:** https://jeevanandhamsivasankar.github.io
**Document ID:** SRS-PORTFOLIO-001  |  **Version:** 1.0  |  **Date:** 2026-10-11
**Standard:** Structured after ISO/IEC/IEEE 29148:2018 (Software Requirements Specification)
**Status:** Baseline for the modular re-architecture described in `docs/ARCHITECTURE_BRIEF.md`

---

## 1 Introduction

### 1.1 Purpose

This SRS states the functional and non-functional requirements of the portfolio site. The functional requirements were reverse-engineered from the current single-file implementation (`src/App.jsx`, 2,469 lines). The non-functional requirements come from the goals and constraints in `docs/ARCHITECTURE_BRIEF.md`. The SRS is the basis for:

- the Software Architecture Design Specification (`docs/SADS.md`, IDs `ARC-NNN`, `ADR-NNN`),
- the Software Unit Design Specification (`docs/SUDS.md`, IDs `UNIT-<NAME>`),
- the Software Test Plan (`docs/STP.md`, IDs `UT-<UNIT>-NNN`, `IT-NNN`, `QT-NNN`) and its traceability matrix.

The redesign must reach visual and behavioural parity with the current site. For that reason, many requirements state exact present-day values (timings, thresholds, texts, counts).

### 1.2 Scope

The product is a static, client-rendered single-page application (SPA) built with React 19 and Vite 7 and served from GitHub Pages. It presents the owner's profile, experience, skills, projects, design work, education, certifications, resume and contact channels. It has no backend, no user accounts, no forms, no cookies and no analytics.

**In scope:** all content sections, navigation, the day/night theme, decorative effects, the animated speedometer widget, the resume PDF asset, HTML metadata, build, CI and deployment.
**Out of scope:** Behance, LinkedIn and GitHub content; the contents of the resume PDF; server-side hosting configuration (GitHub Pages defaults apply).

### 1.3 Definitions, acronyms and abbreviations

| Term | Meaning |
|---|---|
| HMI | Human Machine Interface |
| SPA | Single-Page Application |
| IST | India Standard Time, UTC+05:30 |
| Section | Top-level content block with an `id` and a `data-section` attribute (e.g. `about`) |
| Reveal | Scroll-triggered fade/slide-in of an element carrying the `.reveal` class |
| Theme | One of `night` (default palette) or `day`, applied as `data-theme` on `<html>` |
| Glass | Translucent "liquid glass" styling (backdrop blur and saturate) used by cards |
| Material Symbols | Google "Material Symbols Outlined" variable icon font |
| Simple Icons CDN | `https://cdn.simpleicons.org/<slug>`, which serves brand SVG icons |
| Tech icon spec | String `si:<slug>` (Simple Icons), `ms:<name>` (Material Symbol) or `svg:<key>` (built-in custom SVG) |
| QT / IT / UT | Qualification test (SWE.6), integration test (SWE.5), unit test (SWE.4) |
| T / I / A / D | Verification methods: Test, Inspection, Analysis, Demonstration |
| Must / Should / Could | MoSCoW priority. Must = required for release, Should = expected, Could = desirable |
| Parity | Same CSS rules and values, same markup class names and same text content as the baseline `src/App.jsx` |

### 1.4 References

| Ref | Document |
|---|---|
| [R1] | `docs/ARCHITECTURE_BRIEF.md` (authoritative architecture and test strategy) |
| [R2] | Baseline implementation: `src/App.jsx`, `src/main.jsx`, `index.html`, `vite.config.js`, `package.json`, `.github/workflows/ci.yml` |
| [R3] | ISO/IEC/IEEE 29148:2018, Requirements engineering |
| [R4] | W3C WCAG 2.1, Level AA |
| [R5] | Automotive SPICE PAM 3.1/4.0, SWE.4 to SWE.6 (test level alignment) |
| [R6] | `docs/SADS.md`, `docs/SUDS.md`, `docs/STP.md` (downstream documents) |

### 1.5 Requirement notation

Each requirement has an ID, a "shall" statement, a priority, a short rationale, a testable acceptance criterion, and a verification entry (level and method; see section 6). IDs are stable and must not be reused. Wherever a requirement quotes a value (string, number, colour, timing), that value is the parity baseline.

---

## 2 Overall description

### 2.1 Product perspective

The site is a self-contained static bundle (`dist/`) published to the `gh-pages` branch. At runtime the browser loads:

1. `index.html`, which carries metadata, Google Fonts stylesheets and a preload hint for `/profile.webp`.
2. The Vite JS bundle (React and the application).
3. Static assets from `public/`: `Jeevanandham_Resume.pdf` (about 4 MB), `profile.webp`, `profile-og.jpg` and `favicon.svg`.
4. Third-party resources: Google Fonts (Share Tech Mono, Barlow, Barlow Condensed, Material Symbols Outlined) and Simple Icons CDN images for some skill chips.

Outbound navigation goes to Behance, LinkedIn, GitHub, `mailto:` and `tel:`.

Page composition, top to bottom: GradientOrbs, CursorGlow, Nav (with mobile menu), `<main>` containing Hero, About, Experience, Skills, Projects, Design, Education, Certifications, Resume and Contact (a `.divider` separates each pair of sections), then the footer.

### 2.2 Product functions (summary)

- Present the owner's identity, role, bio and key stats (Hero, About).
- Present the career timeline, a categorised skill toolbox with brand icons, engineering projects, design portfolio cards, education, certifications and resume access.
- Provide contact channels.
- Provide fixed navigation with active-section highlighting and a mobile menu.
- Switch between day and night themes automatically from Chennai sunrise and sunset, with a manual override.
- Show decorative motion (gradient orbs, cursor glow, particles, rings, parallax, typewriter, live speedometer) and respect reduced-motion preferences.

### 2.3 User classes and characteristics

| User class | Characteristics | Primary needs |
|---|---|---|
| UC-1 Recruiter / talent acquisition | Non-technical, short attention span, often on a laptop | Role, years of experience, location, availability, resume download, contact |
| UC-2 Hiring manager (automotive/medical HMI) | Technical, evaluates depth | Experience detail, projects, tech stack, safety/A-SPICE awareness |
| UC-3 Peer engineer / collaborator | Technical, browses casually | Skills, projects, GitHub/Behance links |
| UC-4 Mobile visitor | Phone, touch input, viewport 320 to 430 px | Readable single-column layout, working hamburger menu, tap-to-call/mail |
| UC-5 Assistive-technology user | Screen reader, keyboard-only, or reduced-motion preference | Semantic landmarks, alt text, focus visibility, no forced motion |
| UC-6 Crawler / link unfurler | Search engine, LinkedIn/Slack previews | Title, description, canonical URL, Open Graph image |

### 2.4 Operating environment

- Evergreen browsers (last 2 major versions): Chrome, Edge, Firefox and Safari on desktop; Safari on iOS 16+; Chrome on Android.
- JavaScript enabled. Without JavaScript the `<noscript>` message is shown.
- Viewports from 320 px to 2560 px wide.
- Hosting: GitHub Pages over HTTPS at the domain root (Vite `base: '/'`).
- Build and CI: Node 22 on `ubuntu-latest` (GitHub Actions).

### 2.5 Design and implementation constraints

- C-1 Stack: React 19, Vite 7, plain JavaScript (JSX), ESLint 9 flat config.
- C-2 No new runtime dependencies. Allowed dev dependencies: vitest, @testing-library/react, @testing-library/jest-dom, jsdom, plus @playwright/test for qualification testing as set out in [R1].
- C-3 Module layout, layering and design patterns as fixed in [R1].
- C-4 Parity: same CSS rules and values, class names and text content as the baseline.
- C-5 Deployment unchanged: `npm run deploy` (`gh-pages -d dist`), base `/`.
- C-6 `npm run lint`, `npm test` and `npm run build` must pass, and CI must run all three.

### 2.6 Assumptions and dependencies

- A-1 Google Fonts and the Simple Icons CDN are normally reachable. The site must stay usable when they are not (see NFR-RELI-003).
- A-2 The owner keeps `public/Jeevanandham_Resume.pdf` up to date. Its page count ("3 PAGES") is hand-maintained text.
- A-3 The Chennai sunrise/sunset model is an approximation and is not an astronomical reference. Parity with the baseline formula takes precedence over accuracy.
- A-4 Content (dates, counts such as "4.9+") is static and edited by hand.
- A-5 External profile URLs (Behance, LinkedIn, GitHub) are owned by the site owner and assumed stable.

---

## 3 Specific requirements

Verification column legend: `QT` = qualification test (Playwright against the production build), `IT` = integration test, `UT` = unit test, `I` = inspection, `A` = analysis. See section 6.

### 3.1 Functional requirements

#### 3.1.1 Navigation (NAV)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-NAV-001 | The system shall render a fixed top navigation bar (`nav.nav`, z-index 300, 64 px high) that stays visible while the page scrolls. | Must | Constant wayfinding | At any scroll position, `nav.nav` has `position: fixed`, top 0 and computed height 64 px when not scrolled. | QT |
| FR-NAV-002 | The nav shall show the logo: Material Symbol `developer_board` followed by the text "JEEVANANDHAM". | Must | Brand identity | `.nav-logo` text equals "developer_boardJEEVANANDHAM" (icon ligature + label) and is visible. | QT |
| FR-NAV-003 | The nav shall list 9 in-page links in this order, each with a Material Symbol icon: About (person), Experience (work), Skills (build), Projects (rocket_launch), Design (brush), Education (school), Certs (verified), Resume (description), Contact (mail). Each link targets `#<id>` for ids about, experience, skills, projects, design, education, certifications, resume, contact. | Must | Direct access to every section | `.nav-links a` count = 9, labels and `href`s match the list in order, and every target id exists in the DOM. | QT, IT |
| FR-NAV-004 | The nav shall derive its items from the single section registry (`config/sections.js`) and include only entries with `showInNav: true`. Hero shall not appear in the nav. | Must | Single source of truth ([R1] Registry pattern) | IT: changing a registry entry's label changes the nav label, and the `hero` entry produces no nav link. | IT, I |
| FR-NAV-005 | Activating a nav link shall scroll smoothly to the target section (CSS `scroll-behavior: smooth`, or `auto` under reduced motion). | Must | Expected in-page navigation | Clicking "Projects" makes `#projects` reach the viewport top region and updates the URL hash to `#projects`. | QT |
| FR-NAV-006 | The nav shall highlight the link of the current section with the `active` class. The current section is the last `[data-section]` element in document order whose `offsetTop - 140 <= window.scrollY`, and it defaults to `hero`. The value shall be recomputed on every (passive) scroll event. | Must | Orientation feedback | After scrolling so that `#skills` top is 100 px below the viewport top (within the 140 px offset), only the "Skills" link has class `active`. At scrollY 0, no nav link is active. | QT, UT |
| FR-NAV-007 | When `window.scrollY > 30`, the nav shall get the `scrolled` class, which reduces its height to 54 px (0.3 s transition). At `scrollY <= 30` the class shall be removed. | Should | Compact chrome while reading | Scrolling to 31 px adds `.scrolled` (height 54 px). Scrolling back to 0 removes it. | QT, UT |
| FR-NAV-008 | At viewport widths up to 900 px, the inline nav links shall be hidden and a hamburger button (3 bars, `aria-label="Menu"`) shall be shown. | Must | Mobile usability (UC-4) | At 390x844: `.nav-links` is not displayed and `.hamburger` is visible. At 1366x800 the reverse holds. | QT |
| FR-NAV-009 | Activating the hamburger shall toggle the mobile menu (`.mobile-menu.open`, fixed below the nav at top 64 px). The menu shall list the same 9 links (icon size 15) and a full-width theme button labelled "Switch to Night Mode" or "Switch to Day Mode" (the opposite of the current theme). | Must | Mobile navigation | At 390x844: first tap shows the menu with 9 links and the theme button, second tap hides it. | QT |
| FR-NAV-010 | Selecting a link or the theme button in the mobile menu shall close the menu. The theme button shall also toggle the theme. | Must | Avoid an obscuring overlay | Tapping "Contact" in the open menu closes it and scrolls to `#contact`. Tapping the theme button closes it and flips `data-theme`. | QT |
| FR-NAV-011 | The hamburger button shall expose its state to assistive technology through `aria-expanded` and `aria-controls` pointing at the mobile menu id. | Should | WCAG 4.1.2 (enhancement over baseline) | `aria-expanded` is "false" when closed and "true" when open, and `aria-controls` references an existing element id. | QT |

#### 3.1.2 Hero (HERO)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-HERO-001 | The system shall render a Hero section (`section#hero[data-section=hero].hero`, min-height 100vh) laid out as a 3-column grid `1fr 360px 260px` on desktop: text content, speedometer widget, profile card. | Must | First impression | At 1366x800, `#hero` contains `.hero-content`, `.hero-center` and `.hero-right` in that order and is at least as tall as the viewport. | QT |
| FR-HERO-002 | The hero shall show the tag line "Senior HMI Engineer · Chennai, India" with icon `developer_board`, and a single `<h1>` reading "S. Jeevanandham B.ECE" with "Jeevanandham" wrapped in `<em>` (amber) and a line break before "B.ECE". | Must | Identity and the page's only h1 | Exactly one `h1` on the page. Its text matches, and `h1 em` text is "Jeevanandham". | QT |
| FR-HERO-003 | The hero shall show a typewriter line that cycles through the roles "Qt / QML Developer", "Embedded HMI Engineer", "UX / UI Engineer", "Instrument Cluster Dev" and "Medical Device HMI Eng", in that order, wrapping to the first after the last. It shall be followed by a blinking amber "\|" cursor. | Must | Communicates the breadth of roles | Over about 25 s, the observed fully typed strings appear in the listed order and then repeat. | QT, UT |
| FR-HERO-004 | Typewriter timing shall be: initial delay 900 ms; type 1 character every 65 ms plus a random 0 to 30 ms; pause 1800 ms when the word is complete; delete 1 character every 35 ms; wait 300 ms before the next word. Timers shall be cleared on unmount. | Should | Behavioural parity | UT with fake timers (random stubbed to 0): "Q" appears at t = 900 ms, the full first word (18 chars) at 900 + 17x65 = 2005 ms, deletion starts 1800 ms later, and no timers remain after unmount. | UT |
| FR-HERO-005 | The hero shall show the bio paragraph that starts "Senior Software Engineer with **4.9+ years** in Automotive HMI…", with "4.9+ years" and "Qt/QML, Embedded C++, and real-time UI engineering" in `<strong>`. | Must | Value proposition | `.hero-bio` text equals the baseline text and has 2 `strong` children. | QT |
| FR-HERO-006 | The hero shall show 8 skill badges in this order: Qt / QML, Embedded C++, LVGL, CAN Bus, A-SPICE, Linux HMI, SQLite3, FreeRTOS. | Must | Fast skill scan (UC-1) | `.hero-badges .badge` texts equal the list. | QT |
| FR-HERO-007 | The hero shall show 3 call-to-action links: "View Projects" (`btn-amber`, `#projects`, icon rocket_launch), "Get In Touch" (`btn-outline`, `#contact`, icon mail) and "Resume" (`btn-green`, `Jeevanandham_Resume.pdf` with the `download` attribute, icon download). | Must | Primary conversions | The three anchors exist with these classes, hrefs and attributes. The resume link returns HTTP 200 with `application/pdf`. | QT |
| FR-HERO-008 | The hero shall stagger its entry animation: tag, name, typewriter, bio, badges and CTA fade up with delays of 0.15, 0.28, 0.42, 0.52, 0.62 and 0.72 s. | Could | Polished first paint | CSS inspection shows `.hero-tag` through `.hero-cta` with `animation: fadeUp` and these delays. | I |
| FR-HERO-009 | The centre column shall show a gauge widget containing the label "⚡ Live HMI Cluster Demo", the animated speedometer (FR-HERO-010/011), a row of 3 mini-stats ("4.9+" Yrs Exp in #f59e0b, "8+" Projects in #22d3ee, "2" Domains in #34d399) and 5 stack tags: Qt/QML, LVGL, C++, CAN, UART. | Must | Signature HMI showcase | At 1366x800, `.gauge-widget` contains an `svg`, 3 `.gauge-stat` with these values and labels, and 5 `.gauge-stack-tag`. | QT |
| FR-HERO-010 | The speedometer shall be an SVG (viewBox 0 0 260 260, max width 320 px) with centre (130,130) and the following parts: a speed arc of radius 100 sweeping -215° to +35° (250°) scaled 0 to 180 km/h, filled with a #34d399 to #22d3ee gradient; an outer RPM arc of radius 112 over the same sweep scaled 0 to 8000 RPM, filled #f59e0b to #fb7185; 19 tick marks with every 3rd one major (length 18 vs 10); a needle of length 84; the rounded speed value with the unit "km/h"; the label "HMI CLUSTER DEMO"; and "<n> RPM". | Must | Showcase of HMI craft | The DOM contains these texts. The SVG has 19 tick `line`s, 7 of them with stroke-width 2. At speed 0 the needle endpoint is at angle -215°. | QT, UT |
| FR-HERO-011 | The speedometer shall animate on `requestAnimationFrame`, advancing t by 0.006 per frame, with speed = 45·sin(0.5t) + 88 + 22·sin(1.4t) (clamped to 180 for the angle) and rpm = 1200·sin(0.7t + 1) + 2800 + 500·cos(1.1t) (clamped to 8000). The animation frame shall be cancelled on unmount. When the user prefers reduced motion, the loop shall not run and the gauge shall show a static frame. | Must | Deterministic, leak-free animation that respects users | UT: the pure function at t = 0 gives speed 88 and rpm ≈ 4309.7, and `cancelAnimationFrame` is called on unmount. QT (reduced motion): the speed text does not change over 2 s. | UT, QT |
| FR-HERO-012 | The right column shall show a profile card with the photo `profile.webp` (alt "S. Jeevanandham", width 600, height 900, `decoding="async"`), animated scan line, 4 corner brackets, and an info panel showing "S. JEEVANANDHAM", "SENIOR HMI ENGINEER", a pulsing green dot with "OPEN TO OPPORTUNITIES", and tags Automotive HMI, Medical HMI, Qt/QML, UX Design. | Must | Personal presence and availability | At 1366x800 the image is loaded (naturalWidth > 0) with the correct alt, and the panel texts match. | QT |
| FR-HERO-013 | If the profile image fails to load, it shall be hidden (`display: none`) and the rest of the card left intact. | Should | Graceful degradation | With `profile.webp` routed to 404, no broken-image icon shows and `.profile-info-panel` is still visible. | QT |
| FR-HERO-014 | On pointer movement, the profile card shall tilt with a 3D parallax effect: `perspective(900px) rotateY(x) rotateX(-y) translateZ(8px)`, where x and y = (pointer / viewport − 0.5) × 14 degrees (range ±7°), with a 0.15 s ease-out transition. It shall be disabled under reduced motion. | Could | Interactive depth | Moving the mouse to the right edge gives `.profile-card` a transform with rotateY ≈ 7deg. Under reduced motion the transform stays empty. | QT, UT |
| FR-HERO-015 | At viewport widths up to 900 px, the hero shall collapse to one column (padding 80px 24px 60px) and hide the speedometer and profile columns. At widths up to 540 px, the CTA buttons shall stack vertically at full width. | Must | Mobile layout (UC-4) | At 390x844: `.hero-center` and `.hero-right` are not displayed, `.hero-cta` has flex-direction column, and each `.btn` is as wide as its container. | QT |

#### 3.1.3 About (ABOUT)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-ABOUT-001 | The system shall render `section#about[data-section=about]` with the section label "01 — About" (icon person) and the `h2` title "Who I Am". | Must | Section identity | Label and `h2.section-title` texts match. | QT |
| FR-ABOUT-002 | The About section shall show 4 bio paragraphs with baseline text. Highlighted phrases use `.hl`: "Senior Software Engineer", "automotive and medical device industries", "Qt/QML and Embedded C++", "engineering rigour and UX design sensibility", "A-SPICE aligned development". | Must | Narrative profile | `.about-text p` count = 4, `.hl` texts match in order. | QT |
| FR-ABOUT-003 | The About section shall show a 2x2 grid of 4 stat cards: "4.9+" Years Experience (schedule, #f59e0b), "8+" Projects Shipped (rocket_launch, #22d3ee), "2" Domains — Auto & Med (devices, #34d399), "C++" Primary Language (code, #a78bfa). Each value shall be coloured with its stat colour. | Must | At-a-glance credibility | 4 `.stat-card` with these num/label pairs. Computed colour of each `.stat-num` matches. | QT |
| FR-ABOUT-004 | On hover, a stat card shall lift 5 px and take a border of `<color>66` and a box-shadow `0 16px 48px <color>22`, and revert on mouse out. | Could | Interaction feedback | Hovering card 1 sets border-color to rgba(245,158,11,0.4). Moving away clears the inline style. | QT |
| FR-ABOUT-005 | At widths up to 900 px, the About grid shall become a single column with a 40 px gap. | Must | Mobile layout | At 390x844, `.about-grid` has one column track. | QT |

#### 3.1.4 Experience (EXP)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-EXP-001 | The system shall render `#experience[data-section=experience]` as a full-width band (`.exp-band.full-band`) with the label "02 — Experience" (icon work) and the title "Career". | Must | Section identity | Element, label and title exist. | QT |
| FR-EXP-002 | The Experience section shall render all Experience entries (section 4.5) as a vertical timeline in data order (newest first). Each item shows a timeline dot, an icon tile (amber Material Symbol), the role, the company, the period, the location and the description. | Must | Career history (UC-2) | 4 `.exp-item` elements. Item 1 shows "Senior Software Engineer", "PixelExpert Technology & Services Pvt. Ltd.", "SEP 2024 — JAN 2026", "Chennai, Tamil Nadu". Item 4 shows "Graphics Designer Trainee" at "Lapiz Digital Services Pvt. Ltd.". | QT, IT |
| FR-EXP-003 | Timeline items shall reveal with stagger classes `d0`, `d1`, `d2`, `d3` (index capped at 3). | Could | Polish/parity | Item classes are `exp-item reveal d0` through `d3`. | IT |
| FR-EXP-004 | In day theme, the band shall use background rgba(255,255,255,0.42) with a 20 px backdrop blur. In night theme it shall use `var(--surf)`. | Should | Theme-consistent surface | The computed background of `.exp-band` differs between themes as specified. | QT |

#### 3.1.5 Skills (SKILL)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-SKILL-001 | The system shall render `section#skills[data-section=skills]` with the label "03 — Skills" (icon build) and the title "Toolbox". | Must | Section identity | Label and title match. | QT |
| FR-SKILL-002 | The Skills section shall render the 9 skill categories in order: Primary Language (9), HMI Frameworks (10), Embedded & OS (7), Communication Interfaces (5), Tools & DevOps (10), Testing & Debugging (5), Database (1), Design & UX (8), Methodologies (3), for 58 skills in total. Each category shows a pill badge (text and border in the header colour, background `headerBg`), a gradient rule line, and its skill chips. | Must | Complete skill inventory | 9 `.skill-cat`, 58 `.skill-chip`, and badge texts and per-category chip counts match. | QT, IT |
| FR-SKILL-003 | Each skill chip shall show a 22 px tech icon and the skill name. The icon is resolved from the tech icon spec: `si:<slug>` loads `https://cdn.simpleicons.org/<slug>` as `<img alt=slug>`; `svg:<key>` renders the built-in SVG from the custom registry (30 keys, e.g. oop, lvgl, uart, aspice) stroked in the skill colour; `ms:<name>` renders a Material Symbol in the skill colour. | Must | Recognisable brand cues | UT: the resolver returns `img[src$="/cplusplus"]` for `si:cplusplus`, an `svg` for `svg:lvgl` and a Material Symbol span for `ms:code`. QT: the chip "Git" contains `img[alt=git]`. | UT, QT |
| FR-SKILL-004 | Tech icon resolution shall fall back to the Material Symbol `code` for (a) an `si:` image that fails to load, (b) an unknown `svg:` key and (c) an unrecognised prefix. | Must | No broken icons when the CDN is down (A-1) | UT: `svg:unknown` and `foo:bar` render the `code` symbol, and firing `error` on the `si:` img replaces it with the `code` symbol. QT: with the CDN blocked, no chip shows a broken-image icon. | UT, QT |
| FR-SKILL-005 | On hover, a skill chip shall lift (translateY −2 px, scale 1.02), take the border colour `<catColor>66` and a shadow `0 6px 24px <catColor>18`, and colour its label with the skill colour (or the category colour if the skill has none). | Could | Interaction feedback | Hovering the "Qt / QML" chip turns the label colour to rgb(65,205,82). | QT |
| FR-SKILL-006 | Category blocks shall reveal with stagger classes `d(index mod 3)`. | Could | Parity | Category class names follow the pattern. | IT |
| FR-SKILL-007 | After the categories, the Skills section shall show the "ISO 26262 Awareness" strip with a shield/verified_user icon, the baseline description and 5 chips: Safety-Aware UI, Deterministic Performance, Structured Validation, FMEA Awareness, Fail-Safe Patterns. | Must | Safety credibility for automotive (UC-2) | `.iso-strip` title text and the 5 `.iso-chip` texts match. | QT |
| FR-SKILL-008 | In night theme, `si:` chip images shall use `filter: brightness(1.5) saturate(1.1)`. In day theme they shall use `brightness(0.85) saturate(1.05)`. | Should | Icon legibility on both backgrounds | The computed `filter` on `.chip-icon-wrap img` matches for each theme. | QT |

#### 3.1.6 Projects (PROJ)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-PROJ-001 | The system shall render `section#projects[data-section=projects]` (background `var(--bg2)`) with the label "04 — Engineering Projects" (icon rocket_launch) and the title "Selected Work". | Must | Section identity | Label and title match. | QT |
| FR-PROJ-002 | The Projects section shall render all 6 Project entries (section 4.7) in data order as cards in a 2-column grid. Cards with `wide: true` (PROJECT_03 SUV Infotainment, R&D ADAS Demonstrator) span both columns. Each card shows the period, an icon tile (bg/border in project colours), the number (in project colour), the domain, the title, the description and the tag chips (colour/bg/border from the project). | Must | Portfolio evidence (UC-2) | 6 `.project-card`, 2 of which have `.wide`. Card 1 title is "Physiotherapy Laser Therapy HMI" with 5 tags. Card 3 has 8 tags. | QT, IT |
| FR-PROJ-003 | On hover, a project card shall lift 5 px, show its 2 px top gradient line (`line` field, scaleX 0→1 over 0.42 s) and set its border colour to `<color>99`, restoring the `border` value on mouse out. | Could | Interaction feedback | Hovering card 1 sets the inline border-color from rgba(52,211,153,0.2) to #34d39999 and back. | QT |
| FR-PROJ-004 | At widths up to 900 px, the projects grid shall be single column, with wide cards spanning column 1 only. | Must | Mobile layout | At 390x844, `.projects-grid` has one column track. | QT |

#### 3.1.7 Design portfolio (DESIGN)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-DESIGN-001 | The system shall render `#design[data-section=design]` (full band, background `var(--bg2)`, top border) with the label "05 — Design Portfolio" (icon brush) and the title "Creative Work". | Must | Section identity | Label and title match. | QT |
| FR-DESIGN-002 | The Design section shall render the 5 DesignCards (section 4.8) in a 2-column grid: Automotive Instrument Clusters, Medical Device HMI Design, Infotainment UI Modules (wide), Multi-Platform UI/UX Designs, and Jeevanandham S — Full Design Portfolio. Each card has an inline SVG artwork background, a dark gradient overlay, a coloured tag with icon, a title, a description and a "View on Behance" call to action. | Must | Showcase of UX/visual work | 5 `.behance-card`, of which exactly 1 is `.wide`. Titles and tags match. Each card has an `svg` in `.behance-card-bg`. | QT |
| FR-DESIGN-003 | Each design card shall be an anchor to `https://behance.net/s_jeevanandham` opening in a new tab (`target=_blank`, `rel="noopener noreferrer"`). | Must | Route to the full portfolio | All 5 cards have this href, target and rel. | QT |
| FR-DESIGN-004 | On hover, a design card shall lift 5 px, strengthen its shadow, and widen the CTA gap from 6 to 10 px. | Could | Interaction feedback | Hover changes the computed `gap` of `.bc-cta` to 10 px. | QT |

#### 3.1.8 Education (EDU)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-EDU-001 | The system shall render `section#education[data-section=education]` with the label "06 — Education" (icon school) and the title "Academic Background". | Must | Section identity | Label and title match. | QT |
| FR-EDU-002 | The Education section shall show the degree card: "B.E. — Electronics & Communication Engineering", "Adhiparasakthi College of Engineering (Anna University), Tamil Nadu", and tags "2015 – 2020", "CGPA: 6.34 / 10" and "ECE" (cyan `.edu-tag`). | Must | Formal qualification | Texts match in the first `.edu-card`. | QT |
| FR-EDU-003 | The Education section shall show a second card, "Key Domain Expertise" (icon military_tech, amber), with the baseline sentence and 5 amber chips: Automotive HMI, Medical Device HMI, Instrument Clusters, Infotainment, ADAS / 3D Viz. | Must | Domain summary | Second card title and 5 chip texts match. | QT |
| FR-EDU-004 | Education content shall come from the `data/education.js` model instances, not from markup literals. | Should | Data-driven rendering ([R1]) | Inspection: `sections/Education.jsx` contains no degree or school string literals. IT: rendering with substituted data shows the substituted text. | I, IT |

#### 3.1.9 Certifications (CERT)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-CERT-001 | The system shall render `#certifications[data-section=certifications]` (full band, background `var(--surf)`, top and bottom borders) with the label "07 — Certifications" (icon verified) and the title "Credentials". | Must | Section identity | Label and title match. | QT |
| FR-CERT-002 | The Certifications section shall render 3 certification cards in a 3-column grid: "Qt 6 Core — Beginner, Intermediate & Advanced" (UDEMY, icon school), "QML for Beginners" (UDEMY, school) and "Google UX Design Professional Certificate" (COURSERA — CREDLY VERIFIED, verified_user). Columns: 2 at ≤ 900 px, 1 at ≤ 540 px. | Must | Credentials (UC-1) | 3 `.cert-card` with matching name and org. Column counts at 1366, 800 and 390 px widths are 3, 2 and 1. | QT |

#### 3.1.10 Resume (RES)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-RES-001 | The system shall render `#resume[data-section=resume]` with the label "08 — Resume" (icon description), the `h3` "Download My Resume" and the baseline explanatory paragraph. | Must | Section identity | Texts match. | QT |
| FR-RES-002 | The Resume section shall offer a "Download PDF" button (`btn-green`) linking to `Jeevanandham_Resume.pdf` with `download="Jeevanandham_SeniorHMIEngineer_Resume.pdf"`, and a "View Online" button (`btn-outline`) opening the same PDF in a new tab (`rel="noopener noreferrer"`). | Must | Primary recruiter action (UC-1) | The attributes match. A Playwright download event yields the suggested filename `Jeevanandham_SeniorHMIEngineer_Resume.pdf` with non-zero size. | QT |
| FR-RES-003 | The Resume section shall show a resume preview card with: the header "JEEVANANDHAM_RESUME.PDF · 3 PAGES"; the name "S. JEEVANANDHAM"; the role line "SENIOR SOFTWARE ENGINEER – AUTOMOTIVE & MEDICAL HMI \| UI/UX \| QT/QML \| EMBEDDED C++"; location, email and phone rows; "KEY SKILLS" with 4 bars (Qt / QML 92%, Embedded C++ 88%, LVGL / HMI 85%, UX / Figma 78%) with gradient fills; and small "Download" and "View" links to the same PDF. | Must | Preview before download | 4 `.rdp-skill-row` elements whose fill widths are 92%, 88%, 85% and 78%. The texts match. | QT |
| FR-RES-004 | The resume PDF shall be served from the site root at `/Jeevanandham_Resume.pdf` with content type `application/pdf`. | Must | Link integrity | HTTP GET on the preview server returns 200 with `application/pdf`. | QT |

#### 3.1.11 Contact (CONT)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-CONT-001 | The system shall render `section#contact[data-section=contact]` (centred) with the label "09 — Contact" (icon mail), the title "Let's Work Together" and the baseline sub-paragraph about open roles. | Must | Section identity | Texts match. | QT |
| FR-CONT-002 | The Contact section shall provide two primary links: email `mailto:jeevanandhamsivashankaran@gmail.com` (`.c-email`, amber, icon mail) and phone `tel:+918111010315` shown as "+91 8111010315" (`.c-phone`, green, icon phone). | Must | Direct contact (UC-1, UC-4) | The anchors have exact hrefs and visible texts. | QT |
| FR-CONT-003 | The Contact section shall provide three profile links opening in new tabs with `rel="noopener noreferrer"`: LinkedIn `https://linkedin.com/in/jeevanandhamsivashankaran/` (`.c-li`, icon open_in_new), Behance `https://behance.net/s_jeevanandham` ("Behance Portfolio", `.c-bh`, icon brush) and GitHub `https://github.com/jeevanandhamsivasankar` (`.c-gh`, icon terminal). | Must | Social proof | The anchors have exact hrefs, target and rel. | QT |
| FR-CONT-004 | The Contact section shall show the location line "Chennai, Tamil Nadu, India" with icon location_on. | Should | Locality for recruiters | `.contact-loc` text matches. | QT |
| FR-CONT-005 | Each contact link shall have a hover state: lift 2 px, a tinted background, and a border and glow in its own colour. | Could | Interaction feedback | Hovering `.c-email` sets its computed background to rgba(245,158,11,0.12). | QT |

#### 3.1.12 Theme (THEME)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-THEME-001 | The system shall support two themes, `night` (default `:root` tokens) and `day` (`[data-theme="day"]` token overrides), applied by setting the `data-theme` attribute on `document.documentElement`. | Must | Core visual identity | `<html data-theme>` is always `day` or `night` after mount, and the computed `--bg` is #060c18 (night) or #fef9f0 (day). | QT, IT |
| FR-THEME-002 | On load, the initial theme shall be chosen automatically from the current time in IST compared with the approximate sunrise and sunset in Chennai (lat 13.08° N, lon 80.27° E). The algorithm (to be preserved exactly for parity, implemented as a pure function in `lib/solar.js`) is: (1) convert now to IST wall-clock; (2) dayOfYear = round((istDate − Jan 0 local) / 86 400 000); (3) dec = −23.45·cos(2π/365·(dayOfYear + 10)); (4) cosHA = −tan(13.08°)·tan(dec), clamped to [−1, 1]; HA = acos(cosHA) in degrees; (5) sunrise = 12 − HA/15 and sunset = 12 + HA/15; (6) correction = 80.27/15 − 5.5 (≈ −0.1487 h); (7) theme = `day` if sunrise + correction ≤ hourIST < sunset + correction, otherwise `night`. | Must | Distinctive "lives in Chennai time" behaviour | UT with injected dates: dayOfYear 172 gives a day window of about 05:28 to 18:14 IST, and dayOfYear 355 gives about 06:14 to 17:28 IST. 12:00 IST is `day`, 23:00 IST is `night`, and the window boundaries are inclusive at the start and exclusive at the end. The result is independent of the browser time zone. | UT, QT |
| FR-THEME-003 | While no manual override is active, the theme shall be re-evaluated every 60 s, and the interval shall be cleared on unmount or once a manual override begins. | Must | Auto-switch at sunrise/sunset during a visit | UT with fake timers: advancing the clock across the sunset boundary and 60 s of timers flips the theme to `night`. After toggle, further time advances do not change it. | UT |
| FR-THEME-004 | The nav shall contain a theme toggle button (`.theme-btn`, `title="Toggle day/night theme"`) whose icon and label show the target theme: "Night" with icon dark_mode when in day, and "Day" with icon light_mode when in night. Activating it shall flip the theme and set a manual override for the rest of the page session. | Must | User control | Clicking the button flips `data-theme` and the label. After a mocked clock passes sunrise or sunset, the theme stays as chosen. | QT, UT |
| FR-THEME-005 | The nav shall show a theme badge with the icon wb_sunny (day) or nights_stay (night), the text "DAY" or "NIGHT", " · ", and the visitor's local time formatted with `toLocaleTimeString("en-IN", {hour:"2-digit", minute:"2-digit", hour12:true})`. The badge shall be hidden at widths up to 900 px. | Should | Explains the automatic theme | At 1366 px, the badge text matches /^(DAY\|NIGHT) · \d{2}:\d{2} (am\|pm)$/i. At 390 px it is not displayed. | QT |
| FR-THEME-006 | Theme changes shall transition smoothly (html/body background 1.2 s, colour 0.6 s; cards and controls background 0.8 s, border 0.5 s, colour 0.4 s, shadow 0.5 s), with no reload. | Should | Polished switch | CSS inspection of the transition declarations. | I |
| FR-THEME-007 | Theme state shall be provided to components through a React Context (`ThemeProvider` / `useThemeContext`) rather than by passing props down. | Must | Provider pattern ([R1]) | Inspection. IT: a consumer under the provider receives `theme` and `toggle`, and using the hook outside the provider throws a descriptive error or returns a documented default. | I, IT |

#### 3.1.13 Visual effects (FX)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-FX-001 | The system shall render 4 fixed, non-interactive gradient orbs (`.orbs-wrap`, `aria-hidden="true"`) with sizes 700, 600, 500 and 400 px, blur 60 to 80 px, and float animations of 20 s, 25 s, 18 s and 28 s. Colours and positions shall change per theme as in the baseline CSS. | Should | Ambient depth | 4 `.orb` elements exist with `pointer-events: none`, and the container has `aria-hidden`. | QT |
| FR-FX-002 | The system shall render a cursor glow (`.cursor-glow`, 380 px radial, `aria-hidden`) that follows the pointer (`left`/`top` = clientX/clientY), starts off-screen at (−500, −500) and uses a 60 ms linear transition. It shall be hidden under reduced motion. | Could | Interactive ambience | Moving the mouse to (400, 300) sets the glow's left/top to 400px/300px. Under reduced motion it is `display: none`. | QT |
| FR-FX-003 | The hero shall render 18 particles (fixed, 1.5 to 4 px, colours from {#f59e0b, #22d3ee, #34d399, #a78bfa, #fb7185}, duration 4 to 9 s, delay 0 to 6 s, horizontal drift ±30 px, opacity 0.3 to 0.8, x 0 to 100 %, y 20 to 90 %). Values shall come from a seeded deterministic PRNG (`lib/random.js`) so renders and visual snapshots are reproducible. Particles shall be hidden under reduced motion. | Should | Stable visuals and testability | UT: the same seed produces the same particle array and every value is within range. QT: 18 `.particle` elements exist, none visible under reduced motion. | UT, QT |
| FR-FX-004 | The hero shall render 4 concentric decorative rings (580, 440, 300 dashed and 180 px) that rotate alternately at 80 s, 55 s, 36 s and 24 s per turn. | Could | HMI dial motif | 4 `.hring` elements exist with the specified sizes. | QT |
| FR-FX-005 | Elements with the `.reveal` class shall start hidden (opacity 0, translateY 30 px) and get the `visible` class when at least 6 % of the element intersects the viewport (IntersectionObserver threshold 0.06). They shall then stop being observed. Stagger classes `d1`/`d2`/`d3` add 0.1, 0.2 and 0.3 s delays. Elements rendered later (e.g. lazy sections) shall also be observed. | Must | Progressive disclosure without hiding content permanently | UT: mocked IO entries with isIntersecting add `visible` and call `unobserve`. QT: after scrolling to each section, all its `.reveal` elements have `visible`, including those in lazily loaded sections. | UT, QT |
| FR-FX-006 | The page background shall show a fixed 56 px amber grid and a radial glow (pseudo-elements on `body`), recoloured for day theme. | Could | Visual identity | CSS inspection. Visual snapshot. | I, QT |
| FR-FX-007 | Glass cards and buttons shall show a diagonal sheen sweep on hover (pseudo-element moves from left −100 % to 140 % over 0.5 to 0.6 s). | Could | Parity polish | CSS inspection. | I |

#### 3.1.14 General (GEN)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| FR-GEN-001 | The system shall render the sections in this order: hero, about, experience, skills, projects, design, education, certifications, resume, contact. Each section shall have a unique `id` equal to its `data-section`, and a `.divider` element shall separate each pair of sections. | Must | Information architecture | The `[data-section]` ids in DOM order equal the list, and there are 9 `.divider` elements inside `main`. | QT, IT |
| FR-GEN-002 | The section order, ids, nav labels and icons shall be defined once in the section registry. Adding a section shall require only a registry entry and its component. | Must | Maintainability ([R1]) | IT: a test registry with an extra entry renders that section and its nav link. | IT, I |
| FR-GEN-003 | Every content section except Hero shall show a section label (`.section-label`, Material Symbol 13 px plus "NN — Name") and an `h2.section-title`. The exception is Resume, which uses an `h3` heading and no `h2`, as in the baseline. | Must | Consistent structure | Label texts are "01 — About" through "09 — Contact". There are 8 `h2.section-title` elements. | QT |
| FR-GEN-004 | The system shall render a footer showing developer_board icons on both sides of the text "© 2026 S. JEEVANANDHAM — SENIOR HMI ENGINEER — BUILT WITH PRECISION". | Must | Ownership notice | `footer` text matches (icon ligatures aside). | QT |
| FR-GEN-005 | Below-the-fold sections (About through Contact) shall load lazily (React.lazy + Suspense), and Nav and Hero shall render eagerly. Section anchors (`#id`) and active-section tracking shall still work for a section that has not loaded yet when a nav link is activated. | Must | Smaller initial bundle ([R1]) without broken navigation | Build output contains separate chunks for lazy sections. QT: on a fresh load, clicking "Contact" lands on `#contact` with the section rendered. Loading `/#resume` directly scrolls to the resume section. | QT, A |
| FR-GEN-006 | All content shall come from data modules built with model factories that validate required fields and freeze the resulting objects (`Object.freeze`). Invalid content shall fail fast at module load with a message naming the entity and field. | Must | Explicit domain model ([R1]) | UT: `createProject({})` throws an error naming the missing `title`. Created objects are frozen (`Object.isFrozen`). All shipped data modules load without throwing. | UT |
| FR-GEN-007 | The application shall be wrapped in an ErrorBoundary that, on a render error in a subtree, shows a graceful fallback message instead of a blank page. Below-the-fold sections should be isolated so that one failing section does not blank the others. | Must | Resilience | IT: a child that throws renders the fallback text, and sibling sections stay rendered. | IT |
| FR-GEN-008 | The layout shall be responsive with breakpoints at 900 px and 540 px as in the baseline. At ≤ 900 px: nav links hidden and hamburger shown; single-column hero, about, projects, design, education and resume; 2-column skills and certifications; 24 px horizontal section padding. At ≤ 540 px: 1-column skills and certifications; full-width stacked buttons. | Must | Mobile support (UC-4) | QT screenshots at 1366x800 and 390x844 match the baselines, and the grid column counts match. | QT |
| FR-GEN-009 | When JavaScript is disabled, the page shall show "This portfolio needs JavaScript enabled to display." | Should | Clear failure mode | With JavaScript disabled, the `noscript` text is visible. | QT |

### 3.2 Non-functional requirements

#### 3.2.1 Performance (PERF)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| NFR-PERF-001 | The initial (entry) JS chunk, gzipped, shall not exceed the baseline single-bundle size measured from `vite build` of the pre-refactor commit. | Must | [R1]: initial JS must not grow | A size check of `dist/assets/index-*.js` (gzip) shows ≤ the baseline value recorded in the STP. | A |
| NFR-PERF-002 | Lazy sections shall be emitted as separate chunks that are not fetched before first render of the hero. | Should | Faster first paint | The build manifest lists separate chunks. The network log at load (before scroll) is analysed. | A, QT |
| NFR-PERF-003 | The profile image shall be preloaded (`<link rel="preload" as="image" href="/profile.webp" type="image/webp">`) and carry explicit width and height to avoid layout shift. | Should | LCP and CLS | `index.html` inspection. CLS < 0.1 in Lighthouse (mobile). | I, A |
| NFR-PERF-004 | Scroll and pointer listeners shall be registered as `passive`, and all listeners, intervals, timeouts, rAF loops and observers shall be released on unmount (no leaks under React StrictMode double mount). | Must | Smooth scrolling and no leaks | UT: spies confirm add/remove pairs and `cancelAnimationFrame`/`clearInterval`/`disconnect` are called on unmount. | UT |
| NFR-PERF-005 | The production build shall achieve a Lighthouse mobile Performance score of at least 80. | Should | Recruiter experience on phones | Lighthouse report on the preview build. | A |

#### 3.2.2 Accessibility (A11Y)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| NFR-A11Y-001 | When `prefers-reduced-motion: reduce` is set, CSS animations and transitions shall be reduced to 0.01 ms with one iteration, smooth scrolling shall be disabled, and particles and the cursor glow shall be hidden. | Must | WCAG 2.3.3, user safety | QT with `reducedMotion: 'reduce'`: `.particle` and `.cursor-glow` are not displayed, and `html` has `scroll-behavior: auto`. | QT |
| NFR-A11Y-002 | When reduced motion is preferred, JS-driven motion (speedometer rAF loop, typewriter cycling, profile parallax) shall be disabled via `usePrefersReducedMotion`. The typewriter shall show the first role statically. | Must | CSS cannot stop JS animation ([R1]) | QT (reduced motion): the speed text and the typewriter text do not change over 3 s, and the profile card has no transform after mouse movement. | QT, UT |
| NFR-A11Y-003 | The page shall use semantic landmarks: one `nav`, one `main` and one `footer`, a single `h1` and logical heading levels. `<html lang="en">` shall be set. | Must | Screen-reader navigation | Automated landmark and heading check (QT). | QT |
| NFR-A11Y-004 | Every informative image shall have meaningful alt text (profile photo "S. Jeevanandham"; `si:` icons alt = slug). Decorative layers (orbs, cursor glow, particles, rings) shall be `aria-hidden="true"` or carry no semantics. | Must | WCAG 1.1.1 | QT: no `img` without `alt`, and decorative containers are aria-hidden. | QT |
| NFR-A11Y-005 | All interactive elements (nav links, CTA buttons, theme toggle, hamburger, cards that are links, contact links) shall be reachable and operable by keyboard in a logical order, with a visible focus indicator. | Must | WCAG 2.1.1, 2.4.7 | QT: tabbing reaches the theme toggle and all 9 nav links. Enter on a nav link scrolls to its section. The focused element has a non-none outline or box-shadow. | QT |
| NFR-A11Y-006 | Body text and interactive text shall meet WCAG 2.1 AA contrast (4.5:1 normal, 3:1 large) in both themes. Purely decorative labels are exempt. | Should | Readability | axe-core contrast check (or equivalent) in both themes reports no serious or critical violations on body text. | QT, A |
| NFR-A11Y-007 | Material Symbols icons used beside text shall not be announced as their ligature names (e.g. "rocket_launch") by screen readers (`aria-hidden="true"` on the icon span). | Should | Noise-free announcements | QT: the accessible name of the "View Projects" button is "View Projects". | QT |

#### 3.2.3 Security (SEC)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| NFR-SEC-001 | Every link with `target="_blank"` shall have `rel="noopener noreferrer"`. | Must | Prevent reverse tabnabbing | QT/IT: query all `a[target=_blank]` and assert rel. | QT |
| NFR-SEC-002 | The site shall load no third-party scripts. Third-party origins shall be limited to fonts.googleapis.com, fonts.gstatic.com (CSS/fonts) and cdn.simpleicons.org (images). | Must | Minimal attack surface and privacy | QT: the network log contains no script requests to non-self origins. Request origins are a subset of the allowlist. | QT |
| NFR-SEC-003 | The source shall not use `dangerouslySetInnerHTML`, `eval` or user-supplied HTML. The site shall collect no personal data and set no cookies. | Must | XSS safety, privacy | Grep inspection. `document.cookie` is empty after load. | I, QT |
| NFR-SEC-004 | Content factories shall validate URL fields: only `https:`, `mailto:`, `tel:`, `#` anchors and relative asset paths are allowed. | Should | Defence against content mistakes (`javascript:` URLs) | UT: `createContactLink({href:"javascript:alert(1)"})` throws. | UT |
| NFR-SEC-005 | `npm audit --omit=dev` shall report no high or critical vulnerabilities in runtime dependencies. | Should | Supply chain | `npm audit` output analysed. | A |

#### 3.2.4 Maintainability (MAINT)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| NFR-MAINT-001 | The source shall follow the module layout in [R1] (config, models, data, context, hooks, lib, components/{ui,tech,effects,widgets,layout}, sections, styles). `src/App.jsx` shall be only a composition root. | Must | Modularity | Inspection of the tree. `App.jsx` contains no content data and no CSS. | I |
| NFR-MAINT-002 | Dependencies shall flow one way: models/data/config → hooks/context → components/sections → App. Models and lib shall not import React. | Must | Layered architecture | Static import analysis (grep or a lint rule) finds no reverse imports and no `react` import in `models/` or `lib/`. | A |
| NFR-MAINT-003 | The CSS shall move unchanged in rules and values into `styles/tokens.css`, `base.css`, `components.css` and `sections.css`, imported once via `styles/index.css` from `main.jsx`. No runtime `<style>` injection shall remain. | Must | Separation of concerns with parity | A normalised diff of the concatenated CSS against the baseline CSS string shows only ordering and whitespace changes. | A |
| NFR-MAINT-004 | `npm run lint` shall pass with zero errors (ESLint 9 flat config including react-hooks rules). | Must | Code quality gate | CI lint step passes. | A |
| NFR-MAINT-005 | Unit and integration test coverage shall be at least 90 % lines for `models/`, `lib/` and `hooks/`, and at least 80 % lines overall (`npm run test:coverage`). | Must | Testability ([R1]) | Coverage report thresholds are enforced in the Vitest config. | A |
| NFR-MAINT-006 | Every domain model shall have a JSDoc `@typedef` in `models/types.js`, and every factory a JSDoc signature. | Should | Self-documenting domain | Inspection. | I |
| NFR-MAINT-007 | No runtime dependencies shall be added beyond `react` and `react-dom`. | Must | Constraint C-2 | `package.json` `dependencies` has exactly these two keys. | I |
| NFR-MAINT-008 | Visual and behavioural parity: the refactored site shall match the baseline in rendered markup class names, text content and screenshots at both reference viewports. Differences are allowed only for animation frames and for the explicitly listed enhancements (FR-NAV-011, NFR-A11Y-002, NFR-A11Y-007, FR-FX-003 seeding). | Must | Acceptance bar ([R1]) | QT visual regression: screenshots with animations disabled and a fixed clock and theme stay within the agreed pixel threshold (defined in the STP). A text-content snapshot is identical. | QT |

#### 3.2.5 Portability (PORT)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| NFR-PORT-001 | The site shall work in the last 2 major versions of Chrome, Edge, Firefox and Safari, iOS Safari 16+ and Android Chrome. Backdrop blur shall include the `-webkit-backdrop-filter` prefix. | Must | Audience browsers | QT on Chromium is automated. Other browsers are demonstrated by a manual smoke check before release. | QT, D |
| NFR-PORT-002 | No horizontal page scroll shall occur at viewport widths from 320 px to 2560 px. | Must | Mobile usability | QT at 320, 390 and 1366 widths: `document.documentElement.scrollWidth <= innerWidth`. | QT |
| NFR-PORT-003 | Theme decisions shall be independent of the visitor's time zone (computed in IST per FR-THEME-002). | Must | Consistent behaviour worldwide | UT with TZ = America/New_York and Asia/Kolkata at the same instant gives the same theme. | UT |

#### 3.2.6 Usability (USAB)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| NFR-USAB-001 | A first-time visitor shall reach the resume download and the contact email within 2 interactions from the landing view, on desktop and mobile. | Must | Recruiter efficiency (UC-1) | QT: the Hero "Resume" link is visible on load (desktop and mobile). The Contact section is reached via one nav or menu action. | QT |
| NFR-USAB-002 | Section anchors shall not be hidden under the fixed nav after navigation; the section label shall be visible. | Should | Wayfinding | QT: after clicking each nav link, the target `.section-label` bounding box top is at or below the nav bottom. | QT |
| NFR-USAB-003 | Touch targets in the mobile menu and contact links shall be at least 44 x 44 CSS px (mobile menu links are 11 px x 14 px padding at 12 px text). | Should | WCAG 2.5.5 (AAA advisory) and mobile ergonomics | QT at 390 px: bounding boxes are at least 44 px high (measured). Any shortfall is recorded. | QT |

#### 3.2.7 Reliability (RELI)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| NFR-RELI-001 | The page shall load with no uncaught JS errors and no React warnings in the console in the production build. | Must | Stability | QT: `page.on('pageerror')` and console errors are empty after a full scroll-through. | QT |
| NFR-RELI-002 | Content and layout shall stay usable when Google Fonts is unreachable. Fonts fall back to the generic families (monospace and sans-serif). | Must | Offline-safe CI and degraded networks ([R1]) | QT runs with fonts.googleapis.com and fonts.gstatic.com blocked, and all section headings are visible. | QT |
| NFR-RELI-003 | When the Simple Icons CDN is unreachable, the skill chips shall show fallback icons (FR-SKILL-004) and the layout shall stay intact. | Must | Third-party resilience | QT with cdn.simpleicons.org blocked: 58 chips are visible and there are no broken `img` elements. | QT |
| NFR-RELI-004 | The theme and section logic shall behave correctly under React StrictMode (double-invoked effects). | Must | `main.jsx` uses StrictMode | IT renders under StrictMode: a single interval and observer are active. | IT |

#### 3.2.8 Search engine and sharing (SEO)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| NFR-SEO-001 | `index.html` shall define `<title>` "S. Jeevanandham · Senior HMI Engineer", a meta description, meta author, `theme-color` #060c18 and canonical `https://jeevanandhamsivasankar.github.io/`. | Must | Discoverability | QT reads the head elements and checks their values. | QT |
| NFR-SEO-002 | `index.html` shall define Open Graph tags (`og:type` website, `og:url`, `og:title`, `og:description`, `og:image` = absolute URL of `/profile-og.jpg`) and `twitter:card` summary. The OG image shall exist at the site root. | Must | Link previews (UC-6) | QT checks the meta values, and GET on `/profile-og.jpg` returns 200 with an image type. | QT |
| NFR-SEO-003 | An SVG favicon shall be served at `/favicon.svg`. | Should | Branding | GET returns 200 with `image/svg+xml`. | QT |

#### 3.2.9 Build, CI and deployment (DEPLOY)

| ID | Requirement | Pri | Rationale | Acceptance criterion | Ver |
|---|---|---|---|---|---|
| NFR-DEPLOY-001 | `npm run build` shall produce a static `dist/` using Vite `base: '/'`, including all `public/` assets at the root. | Must | GitHub Pages user site at root | Build succeeds, and `dist/` contains `index.html`, `Jeevanandham_Resume.pdf`, `profile.webp`, `profile-og.jpg` and `favicon.svg`. | A |
| NFR-DEPLOY-002 | `npm run deploy` shall publish `dist/` to the `gh-pages` branch (`gh-pages -d dist`). This procedure shall stay unchanged. | Must | Constraint C-5 | `package.json` script inspection. | I |
| NFR-DEPLOY-003 | CI (`.github/workflows/ci.yml`) shall run on pushes to `main` and on pull requests, using Node 22 with `npm ci`, then `npm run lint`, `npm test` and `npm run build`, and fail on any non-zero exit. | Must | Quality gate ([R1]) | Workflow inspection. A deliberately failing test fails the job. | I, A |
| NFR-DEPLOY-004 | Qualification tests (`npm run test:qualification`) shall run against `vite preview` of the production build, either in CI (with the Playwright Chromium install step) or as a documented pre-release gate. | Should | SWE.6 evidence on the shipped artefact | Workflow or release checklist inspection. Test report artefact. | I |
| NFR-DEPLOY-005 | Internal anchors and asset links shall resolve on the deployed (preview) build: every `href="#id"` targets an existing id, and every same-origin asset link returns 200. | Must | Link integrity | QT link-integrity suite. | QT |

---

## 4 Data / domain requirements

All content is static, built through factory functions (`models/createModels.js`) that validate fields (`models/validate.js`) and return frozen objects (FR-GEN-006). Types: `string`, `number`, `boolean`, `Color` (CSS colour string), `MsIcon` (Material Symbols ligature name), `TechIconSpec` (`si:` / `ms:` / `svg:` string), `Url` (see NFR-SEC-004). R = required, O = optional.

### 4.1 Profile (`data/profile.js`)

| Field | Type | R/O | Baseline value / notes |
|---|---|---|---|
| name | string | R | "S. Jeevanandham" (hero h1 splits "S." / "Jeevanandham", suffix "B.ECE") |
| displayName | string | R | "S. JEEVANANDHAM" (profile panel, resume preview) |
| title | string | R | "Senior HMI Engineer" |
| location | string | R | "Chennai, Tamil Nadu, India" (hero tag uses "Chennai, India") |
| heroTag | string | R | "Senior HMI Engineer · Chennai, India" |
| roles | string[] (≥1) | R | 5 typewriter roles (FR-HERO-003) |
| bio | rich text segments | R | Hero bio with strong spans (FR-HERO-005) |
| badges | string[] | R | 8 hero badges (FR-HERO-006) |
| gaugeStats | Stat[] | R | 3 mini stats (FR-HERO-009) |
| stackTags | string[] | R | Qt/QML, LVGL, C++, CAN, UART |
| profileTags | string[] | R | Automotive HMI, Medical HMI, Qt/QML, UX Design |
| status | string | R | "OPEN TO OPPORTUNITIES" |
| photo | {src, alt, width, height} | R | profile.webp, "S. Jeevanandham", 600, 900 |
| aboutParagraphs | rich text[] | R | 4 paragraphs with highlight spans (FR-ABOUT-002) |
| resumeRole | string | R | Resume preview role line (FR-RES-003) |
| email / phone | string | R | jeevanandhamsivashankaran@gmail.com / +91 8111010315 |

### 4.2 Stat

| Field | Type | R/O | Notes |
|---|---|---|---|
| icon | MsIcon | R for About stats, O for gauge stats | schedule, rocket_launch, devices, code |
| num | string | R | Display value; not numeric ("4.9+", "C++") |
| label | string | R | e.g. "Years Experience" |
| color | Color | R | #f59e0b, #22d3ee, #34d399, #a78bfa |

Instances: 4 About stats (FR-ABOUT-003) and 3 gauge stats (FR-HERO-009).

### 4.3 NavItem / Section (section registry, `config/sections.js`)

| Field | Type | R/O | Notes |
|---|---|---|---|
| id | string (unique, slug) | R | DOM id and `data-section`; hero, about, experience, skills, projects, design, education, certifications, resume, contact |
| label | string | R for showInNav | Nav text (e.g. "Certs" for certifications) |
| icon | MsIcon | R for showInNav | person, work, build, rocket_launch, brush, school, verified, description, mail |
| component | React component (eager or lazy) | R | Hero eager; others lazy (FR-GEN-005) |
| showInNav | boolean | R | false for hero only |
| eager | boolean | O | true for hero |
| number / sectionLabel | string | O | "01"…"09" and label text for `.section-label`, if centralised |

Invariant: ids are unique, and order defines render order and nav order.

### 4.4 Section heading (per section, presentational)

`{ icon: MsIcon, text: "NN — Name", title: string }`. See FR-GEN-003 for the baseline values.

### 4.5 Experience (`data/experience.js`)

| Field | Type | R/O | Notes |
|---|---|---|---|
| icon | MsIcon | R | medical_services, directions_car, school, palette |
| role | string | R | e.g. "Senior Software Engineer" |
| company | string | R | |
| period | string | R | Display text, e.g. "SEP 2024 — JAN 2026" (uppercase month, em dash) |
| location | string | R | "Chennai, Tamil Nadu" |
| desc | string | R | Paragraph |

4 instances, newest first.

### 4.6 SkillCategory and Skill (`data/skills.js`)

SkillCategory:

| Field | Type | R/O | Notes |
|---|---|---|---|
| label | string (unique) | R | Used as React key |
| headerColor | Color (hex #rrggbb) | R | Must be 7-char hex because alpha suffixes are appended (`44`, `55`, `66`, `18`) |
| headerBg | Color | R | rgba tint |
| skills | Skill[] (≥1) | R | |

Skill:

| Field | Type | R/O | Notes |
|---|---|---|---|
| name | string (unique within category) | R | Used as React key |
| icon | TechIconSpec | R | `si:<slug>`, `ms:<name>` or `svg:<key>`. A `svg:` key should exist in the CUSTOM_SVGS registry (30 keys), otherwise the fallback applies |
| color | Color | O | Falls back to the category headerColor |

9 categories, 58 skills (FR-SKILL-002). The ISO strip (title, description, 5 chips) is static Skills-section content.

### 4.7 Project (`data/projects.js`)

| Field | Type | R/O | Notes |
|---|---|---|---|
| num | string (unique) | R | "PROJECT_01"…"PROJECT_05", "R&D"; React key |
| period | string | R | e.g. "OCT 2024 — JAN 2026", "R&D / INTERNAL" |
| domain | string | R | e.g. "Automotive · Infotainment · OEM" |
| icon | MsIcon | R | medical_services, speed, radio, two_wheeler, sensors |
| color | Color (hex) | R | Alpha suffix `99` appended on hover |
| bg | Color | R | rgba tint |
| border | Color | R | rgba border |
| wide | boolean | R (default false) | Spans 2 columns |
| title | string | R | |
| desc | string | R | |
| tags | string[] (≥1, unique) | R | |
| line | CSS gradient string | R | Hover top line |

6 instances.

### 4.8 DesignCard (`data/design.js`)

| Field | Type | R/O | Notes |
|---|---|---|---|
| tag | string | R | AUTOMOTIVE, MEDICAL HMI, INFOTAINMENT · OEM, MULTI-PLATFORM, DESIGNER PROFILE |
| icon | MsIcon | R | |
| color | Color | R | |
| title | string (unique) | R | React key |
| desc | string | R | |
| wide | boolean | R | true only for "Infotainment UI Modules" |
| art | React element / art key | R | Inline SVG artwork (580x280 or 1160x300 viewBox) |
| href | Url | R | `https://behance.net/s_jeevanandham` for all 5 |

### 4.9 Education (`data/education.js`)

| Field | Type | R/O | Notes |
|---|---|---|---|
| icon | MsIcon | R | school / military_tech |
| iconColor | Color | R | #22d3ee / #f59e0b |
| title | string | R | Degree or "Key Domain Expertise" |
| subtitle | string | R | School or description |
| tags | string[] | R | Degree tags (cyan `.edu-tag`) or domain chips (amber inline style) |
| tagVariant | "edu" \| "domain" | R | Selects the chip styling for parity |

2 instances.

### 4.10 Certification (`data/certifications.js`)

| Field | Type | R/O | Notes |
|---|---|---|---|
| icon | MsIcon | R | school, verified_user |
| name | string (unique) | R | React key |
| org | string | R | Upper-case issuer label |

3 instances.

### 4.11 ContactLink (`data/contact.js`)

| Field | Type | R/O | Notes |
|---|---|---|---|
| kind | "email" \| "phone" \| "linkedin" \| "behance" \| "github" | R | Maps to CSS variant `c-email`, `c-phone`, `c-li`, `c-bh`, `c-gh` |
| label | string | R | Visible text |
| href | Url | R | mailto:, tel:, https: |
| icon | MsIcon | R | mail, phone, open_in_new, brush, terminal |
| external | boolean | R | true opens a new tab with `rel="noopener noreferrer"` |
| group | "primary" \| "social" | R | Row 1 (email, phone) vs row 2 (LinkedIn, Behance, GitHub) |

5 instances.

### 4.12 Resume (`config/site.js` + `data/profile.js`)

| Field | Type | R/O | Notes |
|---|---|---|---|
| resumePath | string | R | "Jeevanandham_Resume.pdf" |
| resumeDownloadName | string | R | "Jeevanandham_SeniorHMIEngineer_Resume.pdf" (Resume section button) |
| resumePages | number | R | 3 |
| keySkillBars | {label, w (percent string), g (gradient)}[] | R | 4 bars (FR-RES-003) |

### 4.13 Site config (`config/site.js`)

Owner name, title, location, canonical URL, resume path, footer text ("© 2026 S. JEEVANANDHAM — SENIOR HMI ENGINEER — BUILT WITH PRECISION"), Behance/LinkedIn/GitHub URLs, theme location (lat 13.08, lon 80.27, UTC offset 5.5 h).

---

## 5 External interface requirements

### 5.1 User interfaces

- A single scrolling page with a fixed glass nav. Typography: Barlow (body, 300 weight), Barlow Condensed (display headings), Share Tech Mono (labels/mono) and Material Symbols Outlined (icons; variation FILL 0/1, wght 200 to 300, GRAD −25, opsz 48).
- Colour tokens follow the baseline `:root` and `[data-theme="day"]` CSS (night: bg #060c18, amber #f59e0b, cyan #22d3ee, green #34d399, rose #fb7185, violet #a78bfa, text #e2e8f0; day: bg #fef9f0, amber #b45309, cyan #0369a1, green #15803d, rose #be123c, violet #6d28d9, text #1e293b).
- Breakpoints: 900 px and 540 px (FR-GEN-008).
- Reference viewports for qualification: 1366x800 (desktop) and 390x844 (mobile).

### 5.2 Hardware interfaces

None. Pointer (mouse) input drives the optional effects (cursor glow, parallax). Touch devices get the same content without them.

### 5.3 Software / communication interfaces

| ID | Interface | Direction | Protocol / format | Failure behaviour |
|---|---|---|---|---|
| EI-1 | Google Fonts CSS2 API (`fonts.googleapis.com`, `fonts.gstatic.com`), with preconnect and `display=swap` | Inbound CSS/WOFF2 | HTTPS GET | Fallback system fonts. Icon ligatures appear as text (accepted degradation; NFR-RELI-002) |
| EI-2 | Simple Icons CDN `https://cdn.simpleicons.org/<slug>` (slugs: cplusplus, qt, lua, linux, yoctoproject, ubuntu, stmicroelectronics, git, jira, cmake, jenkins, sqlite, figma, adobeillustrator, adobexd, adobephotoshop, gimp, affinity, miro) | Inbound SVG image | HTTPS GET via `<img>` | `onError` swaps to the Material Symbol `code` (FR-SKILL-004) |
| EI-3 | Behance `https://behance.net/s_jeevanandham` | Outbound link | New tab, noopener | n/a |
| EI-4 | LinkedIn `https://linkedin.com/in/jeevanandhamsivashankaran/` | Outbound link | New tab, noopener | n/a |
| EI-5 | GitHub `https://github.com/jeevanandhamsivasankar` | Outbound link | New tab, noopener | n/a |
| EI-6 | Email client `mailto:jeevanandhamsivashankaran@gmail.com` | Outbound URI | OS handler | n/a |
| EI-7 | Phone dialer `tel:+918111010315` | Outbound URI | OS handler | n/a |
| EI-8 | Resume PDF `/Jeevanandham_Resume.pdf` (same origin, about 4 MB) | Static asset | HTTPS GET; `download` attribute or new tab | 404 must not occur (NFR-DEPLOY-005) |
| EI-9 | Static images `/profile.webp`, `/profile-og.jpg`, `/favicon.svg` | Static assets | HTTPS GET | Profile image hidden on error (FR-HERO-013) |
| EI-10 | Browser APIs: IntersectionObserver, requestAnimationFrame, matchMedia, `Date`/`Intl` (`toLocaleTimeString("en-IN")`), scroll/mousemove events | Runtime | DOM | If IntersectionObserver is missing, reveal elements should be shown (made visible) rather than stay hidden (Should; a recommended robustness measure for the reveal hook) |
| EI-11 | GitHub Pages hosting (`gh-pages` branch) and GitHub Actions CI | Deployment | git push / workflow | n/a |

---

## 6 Verification approach

Verification follows the ASPICE-aligned levels fixed in [R1] (Test strategy). Qualification testing (SWE.6) verifies SRS requirements on the production build. Unit (SWE.4) and integration (SWE.5) tests verify SUDS units and SADS elements and give supporting evidence for requirements whose logic is not observable deterministically in a browser (timers, solar maths, PRNG, validation). Inspection (I) and analysis (A) cover structural, build and process requirements.

### 6.1 Test levels

| Level | ASPICE | Tooling | Location | Test IDs | Verifies |
|---|---|---|---|---|---|
| Unit | SWE.4 | Vitest + @testing-library/react + jsdom | `tests/unit/**` | `UT-<UNIT>-NNN` | SUDS units; supporting evidence for FR/NFR logic |
| Integration | SWE.5 | Vitest + @testing-library/react + jsdom | `tests/integration/**` | `IT-NNN` | SADS elements and interfaces (registry → Nav/App, ThemeProvider → consumers, ErrorBoundary, data → sections) |
| Qualification | SWE.6 | Playwright (`@playwright/test`, Chromium) against `vite preview` of the production build | `tests/qualification/**` | `QT-NNN` | SRS `FR-*` and `NFR-*` (user-observable behaviour) |

Qualification test conditions (from [R1]): runs at the desktop (1366x800) and mobile (390x844) viewports, with Google Fonts requests blocked (offline-safe). It includes accessibility checks (landmarks, alt text, keyboard navigation, reduced motion), SEO meta checks, link integrity (internal anchors and resume asset) and screenshot-based visual regression. Every test title starts with its ID. Time-dependent behaviour (theme, badge clock) is made deterministic in QT through Playwright clock control (`page.clock`) or an injected time source, and screenshots use a fixed theme with animations disabled.

### 6.2 Verification per requirement class

| Requirement class | Primary level / method | Supporting | Notes |
|---|---|---|---|
| FR-NAV | QT (both viewports: link list, active highlight on scroll, scrolled class, hamburger/mobile menu, keyboard) | UT (`useActiveSection`, `useScrolled`), IT (registry → Nav) | Active-section boundary checked at offset 140 px |
| FR-HERO | QT (texts, CTAs, resume link, layout collapse, image fallback via route abort, reduced-motion static gauge) | UT (`useTypewriter` with fake timers; speedometer pure maths; `useParallax`) | Typewriter order observed in QT over the real cycle; exact timings in UT |
| FR-ABOUT, FR-EXP, FR-PROJ, FR-DESIGN, FR-EDU, FR-CERT | QT (content, counts, link attributes, hover styles, grid columns) | IT (data → section rendering), I (no literals in section components) | Content compared with baseline text snapshots |
| FR-SKILL | QT (58 chips, CDN-blocked fallback, theme filters) | UT (`TechIcon` strategy resolution and fallbacks, custom SVG registry) | Simple Icons CDN blocked in one QT run |
| FR-RES | QT (download event filename, new-tab link, PDF 200/content type, preview bars) | — | Link integrity suite |
| FR-CONT | QT (exact hrefs, target/rel) | UT (ContactLink factory URL validation) | |
| FR-THEME | UT (`lib/solar.js` boundary cases across the year and time zones; `useTheme` interval and manual override with fake timers) | QT (toggle flips `data-theme`, badge format, auto theme under a fixed clock), IT (ThemeProvider), I (transitions) | Parity of the formula is the acceptance basis, not astronomical accuracy (A-3) |
| FR-FX | QT (presence, aria-hidden, reduced-motion hiding, reveal after scroll including lazy sections), visual regression | UT (`useReveal` with mocked IntersectionObserver, `lib/random.js` determinism and ranges), I (CSS) | |
| FR-GEN | QT (section order, footer, responsive layout, noscript, lazy-section navigation), IT (registry extensibility, ErrorBoundary isolation) | UT (model factories, freeze, validation), A (build chunk analysis) | |
| NFR-PERF | A (bundle size against baseline, chunk manifest, Lighthouse) | UT (cleanup of listeners/rAF/timers), QT (network log before scroll) | Baseline size recorded in the STP |
| NFR-A11Y | QT (landmarks, headings, alt text, keyboard order and focus, reduced motion, contrast via axe if added as dev tooling) | UT (`usePrefersReducedMotion`), A (manual screen-reader spot check) | |
| NFR-SEC | QT (rel attributes, third-party origin allowlist, no cookies), I (grep for unsafe APIs) | UT (URL validation), A (`npm audit`) | |
| NFR-MAINT | I (module layout, JSDoc, dependencies), A (import-direction analysis, CSS diff, lint, coverage thresholds) | QT (visual parity, NFR-MAINT-008) | |
| NFR-PORT | QT (no horizontal scroll at 320/390/1366) | UT (time-zone independence), D (manual cross-browser smoke check) | Automated QT is Chromium-only per [R1] |
| NFR-USAB | QT (reachability of resume and contact, anchor offset, touch-target measurement) | — | |
| NFR-RELI | QT (no console/page errors, fonts blocked, CDN blocked) | IT (StrictMode single interval/observer) | |
| NFR-SEO | QT (head meta checks, OG image and favicon fetch) | I (`index.html`) | |
| NFR-DEPLOY | A (build output, CI run results), I (workflow and scripts) | QT (link integrity on preview build) | |

### 6.3 Pass criteria

- Every `Must` requirement has at least one passing QT or, where marked I or A only, a recorded inspection or analysis result. Every `Should` requirement is verified or has a documented deviation.
- `npm run lint`, `npm test` (unit and integration, with coverage thresholds per NFR-MAINT-005), `npm run build` and `npm run test:qualification` all exit 0.
- Traceability: each FR and NFR maps to at least one `ARC-*`, `UNIT-*` and test ID in the STP matrix.

---

## Appendix A: Baseline observations relevant to requirements

These are behaviours of the baseline that downstream documents must handle on purpose: either preserve them for parity or treat them as listed enhancements.

| # | Observation | Disposition |
|---|---|---|
| OBS-1 | In `useTheme`, the comment says the correction is "≈ +0.18h", but `80.27/15 − 5.5` evaluates to ≈ −0.1487 h. That shifts the day window about 9 minutes earlier. | Preserve the computed value (FR-THEME-002); correct the comment |
| OBS-2 | `dayOfYear` is computed from an IST wall-clock Date and rounded, so it advances at about 12:00 IST, not at midnight. | Preserve (FR-THEME-002) |
| OBS-3 | The manual theme override is not persisted; a reload returns to the automatic theme. | Preserve (FR-THEME-004 "for the page session") |
| OBS-4 | The theme badge time is computed at render, so it updates only when Nav re-renders (e.g. on scroll or theme change), not every minute. | Preserve. A ticking clock is optional and must not break parity |
| OBS-5 | Particles use `Math.random()` at module load. | Replace with a seeded PRNG (FR-FX-003) |
| OBS-6 | JS animations (speedometer, typewriter, parallax) ignore `prefers-reduced-motion`. | Enhancement (NFR-A11Y-002) |
| OBS-7 | The hamburger lacks `aria-expanded`/`aria-controls`, and Material Symbol ligature text is exposed to screen readers. | Enhancements (FR-NAV-011, NFR-A11Y-007) |
| OBS-8 | `useReveal` runs its effect after every App render without dependencies. Lazy sections need re-observation after they mount. | Redesign while keeping the behaviour (FR-FX-005) |
| OBS-9 | Stat cards use class `d0` (not defined in CSS). Harmless. | Preserve class names |
| OBS-10 | The mobile menu is fixed at `top: 64px` even when the nav shrinks to 54 px. | Preserve (parity) |
| OBS-11 | `Ms` receives a `className` prop in Nav that it ignores. | Preserve the output markup |
| OBS-12 | The Hero "Resume" CTA uses a bare `download` attribute (file saves as `Jeevanandham_Resume.pdf`). The Resume section uses `download="Jeevanandham_SeniorHMIEngineer_Resume.pdf"`. | Preserve both (FR-HERO-007, FR-RES-002) |
| OBS-13 | Education markup is hard-coded rather than data-driven. | Move to data (FR-EDU-004) |
| OBS-14 | Gauge mini-stats duplicate the About stats, with different labels. | Model as separate Stat lists (section 4.2) |
