import { test as base, expect } from '@playwright/test'

/**
 * Shared qualification-test fixture. Every page blocks Google Fonts requests
 * (offline-safe and deterministic rendering for visual regression).
 * Import `test` and `expect` from this file instead of '@playwright/test'.
 */
const BLOCKED_HOSTS = /^https?:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\//

export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(BLOCKED_HOSTS, (route) => route.abort())
    await use(context)
  },
})

export { expect }
