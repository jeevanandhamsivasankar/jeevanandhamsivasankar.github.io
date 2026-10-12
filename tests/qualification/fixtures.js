import { test as base, expect } from '@playwright/test'

/**
 * Shared qualification-test fixture. Every page blocks Google Fonts requests
 * (offline-safe and deterministic rendering for visual regression).
 * Import `test` and `expect` from this file instead of '@playwright/test'.
 */
const BLOCKED_HOSTS = /^https?:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//

/**
 * The ignition intro (US-208) plays once per session. Mark it played so tests see the page itself;
 * intro tests opt in with `?intro=1` on a fresh session.
 */
export const SKIP_INTRO = () => {
  try { if (!location.search.includes('intro=1')) sessionStorage.setItem('jsv-intro-played', '1') } catch { /* no storage */ }
}

export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(BLOCKED_HOSTS, (route) => route.abort())
    await context.addInitScript(SKIP_INTRO)
    await use(context)
  },
})

export { expect }
