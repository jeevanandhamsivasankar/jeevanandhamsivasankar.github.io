# Changelog

All notable changes are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org/).

## [2.0.1] - 2026-10-12

### Changed
- Ignition intro (US-208) enabled for visitors: plays once per browser session for at most 1.2 s, skippable (button, key, click), never under reduced motion.

## [2.0.0] - 2026-10-12

### Added
- Sprint 2 design upgrade (US-201..213): tokens v2, motion tokens, Hero v2, instrument cluster v2, day/night illumination, micro-interactions, case-study project cards, MediaSlot, responsive images, OG card, icons and manifest, media budget CI.

## [1.0.0] - 2026-10-12

### Added
- Modular architecture: `config`, `data`, `models`, `lib`, `hooks`, `context`, `components`, `sections`, `styles` (replaces the single-file `App.jsx`).
- Section registry, model factories with validation, theme provider, strategy-based tech icons, lazy-loaded sections and an error boundary.
- Accessibility: skip-to-content link (NFR-A11Y-008), `:focus-visible` outlines (NFR-A11Y-009), Escape closes the mobile menu and returns focus (FR-NAV-012), decorative effects hidden from assistive tech.
- Manual theme choice persists across reloads (FR-THEME-008); theme set before first paint (FR-THEME-001).
- Build-time Content-Security-Policy meta tag (ADR-013).
- Page fallback with job title and mailto link when JavaScript is unavailable.
- Software Requirements Specification (v1.1), architecture and unit design, test plan with traceability, test report, code review, design specs.
- Test suite: unit (SWE.4), integration (SWE.5) and Playwright qualification (SWE.6) tests, coverage thresholds, CI workflow.
- `CONTRIBUTING.md`, release notes and this changelog.

### Changed
- Theme calculation (PO decisions, SRS v1.1): day-of-year rolls over at 00:00 IST, IST derived independent of browser time zone, correct longitude-correction sign; switch times move about 18 minutes later. Sun phase now has second resolution.
- Speedometer animation loop runs only while the gauge is visible (NFR-PERF-006); pointer and scroll handlers are coalesced with `requestAnimationFrame` and cancelled on unmount.
- Sections read labels and titles from the registry `meta`.
- Reading order and active-section tracking: at page bottom the last section (Contact) is active.

### Fixed
- DEF-001..022 from round-1 testing, including: `Button` default variant (DEF-005), `showInNav:false` filter (DEF-009), mobile-menu active link (DEF-013), horizontal overflow at 390 px when the icon font is unavailable (DEF-020), low contrast of `.exp-company-loc` and `.contact-loc` (DEF-021), missing `-webkit-backdrop-filter` prefixes (DEF-012), `.skip-link` z-index (DEF-011), `createPhoto` accepting zero dimensions (DEF-003), `loading="lazy"` on icon images (DEF-006).

### Deferred
- Print stylesheet (OBS-19, backlog).

## [0.1.0] - 2026-10-11

### Changed
- Performance and SEO cleanup of the original single-page site (PR #1).
