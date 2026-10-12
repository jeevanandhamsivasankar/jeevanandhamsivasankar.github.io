# Release Notes — 1.0.0

## Summary

Version 1.0.0 re-architects the portfolio from a single-file React app into a layered, documented and fully tested codebase, with no intended visual change for pointer users beyond the approved differences listed below. It also delivers accessibility, performance, security and theme fixes decided in the SRS v1.1 Product Owner review.

## Changes by area

- **Architecture**: layered modules; section registry; model factories; theme provider; strategy icons; lazy sections; error boundary.
- **Accessibility**: skip link, focus-visible outlines, Escape closes mobile menu, `aria-hidden` on decorative effects, contrast fixes (`.exp-company-loc`, `.contact-loc`) in both themes.
- **Performance**: gauge loop only while visible; rAF-coalesced pointer/scroll handlers; lazy sections; lazy-loaded icon images.
- **Theme**: IST-based calculation independent of browser time zone, day-of-year and longitude fixes (switch about 18 min later), second-resolution sun phase, persisted manual override, theme set before first paint.
- **Security/Compatibility**: build-time CSP meta; `-webkit-backdrop-filter` prefixes; fixed-size icon box prevents overflow without the icon font.
- **Documentation**: SRS v1.1, SADS, SUDS, STP, TEST_REPORT, reviews, design specs, README, CONTRIBUTING, CHANGELOG.
- **Tests and CI**: Vitest unit and integration, Playwright qualification, coverage thresholds, CI pipeline.

## Verification

| Check | Result |
|---|---|
| Lint | TBD |
| Unit tests (UT) | TBD |
| Integration tests (IT) | TBD |
| Qualification tests (QT) | TBD |
| Coverage (lines overall / models, lib, hooks) | TBD / TBD |
| Build | TBD |
| Open defects | TBD |

Details: `docs/TEST_REPORT.md`.

## Known limitations

- Automated qualification tests run on Chromium only; other browsers need the manual smoke check (NFR-PORT-001).
- Sunrise/sunset is an approximation, not an astronomical reference (SRS A-3).
- No print stylesheet (OBS-19, deferred); use the resume PDF.

## Deploy steps

1. Merge the PR to `main` with CI green.
2. `git checkout main && git pull && npm ci`
3. `npm run test:all && npm run build`
4. `npm run deploy` (publishes `dist/` to `gh-pages`).
5. Smoke check https://jeevanandhamsivasankar.github.io in light and dark themes at desktop and 390 px widths.
6. Tag `v1.0.0`.
