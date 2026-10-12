# Release 1.0.0: modular re-architecture, accessibility/performance/theme fixes, docs and test suite

## Summary

Re-architects the portfolio into layered modules and adds a V-model documentation set and a three-level automated test suite. Includes the fixes decided in the SRS v1.1 PO review and round-1 defect triage (DEF-001..022).

## Changes

- **Architecture**: config/data/models/lib/hooks/context/components/sections/styles; section registry, model factories, theme provider, strategy icons, lazy sections, error boundary.
- **Accessibility**: skip link, focus-visible, Escape closes mobile menu, aria-hidden decorative effects, contrast fixes.
- **Performance**: gauge loop only while visible, rAF-coalesced handlers, lazy sections and images.
- **Theme**: IST-based, time-zone independent, corrected day-of-year/longitude (switch about 18 min later), persisted override.
- **Security/compat**: build-time CSP, `-webkit-backdrop-filter`, no overflow without icon font.
- **Docs**: SRS, SADS, SUDS, STP, TEST_REPORT, reviews, README, CONTRIBUTING, CHANGELOG, release notes.
- **Tests/CI**: UT (SWE.4), IT (SWE.5), QT (SWE.6), coverage thresholds, CI.

## Verification

| Check | Result |
|---|---|
| Lint | clean |
| UT + IT (Vitest) | 700 / 700 pass |
| QT | 188 pass, 0 fail, 73 viewport-specific skips (desktop + mobile Chromium) |
| Coverage | thresholds met (≥90% models/lib/hooks, ≥80% overall) |
| Build | OK; initial JS 74 KB gzip (was 85 KB) |

Visual baselines re-captured for DEF-020 with owner approval (see `docs/TEST_REPORT.md`).

## Known limitations

- QT automated on Chromium only; manual cross-browser smoke check required.
- Sunrise/sunset is approximate (SRS A-3); no print stylesheet (deferred).

## Deploy steps

After merge and green CI: `npm ci && npm run test:all && npm run build && npm run deploy`, then smoke check the live site and tag `v1.0.0`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01NKXokHzfjZV1efgEVtaruw
