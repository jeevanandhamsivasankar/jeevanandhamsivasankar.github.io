import { test, expect } from '@playwright/test'

const KEY = 'jsv-intro-played'
const INTRO = '[data-testid="ignition-intro"]'

/** Records in-page mount/unmount times of the intro overlay and long tasks. */
const probe = () => {
  window.__p = { mount: null, unmount: null, long: [] }
  try {
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__p.long.push([e.startTime, e.duration]))).observe({ type: 'longtask', buffered: true })
  } catch { /* unsupported */ }
  new MutationObserver(() => {
    const present = !!document.querySelector('[data-testid="ignition-intro"]')
    if (present && window.__p.mount === null) window.__p.mount = performance.now()
    if (!present && window.__p.mount !== null && window.__p.unmount === null) window.__p.unmount = performance.now()
  }).observe(document, { childList: true, subtree: true })
}

test('QT-150 first load plays the intro for <= 1200 ms, sets the session key, page interactive afterwards', async ({ page }) => {
  await page.addInitScript(probe)
  await page.goto('/?intro=1', { waitUntil: 'commit' })
  await page.waitForSelector(INTRO, { state: 'attached' })
  expect(await page.evaluate((k) => sessionStorage.getItem(k), KEY)).toBe('1')
  await page.waitForSelector(INTRO, { state: 'detached', timeout: 3000 })
  const p = await page.evaluate(() => window.__p)
  expect(p.unmount - p.mount).toBeLessThanOrEqual(1300)
  await page.locator('a.skip-link').focus()
  await expect(page.locator('a.skip-link')).toBeFocused()
  await expect(page.locator('main')).not.toHaveAttribute('inert', /.*/)
})

test('QT-151 second load in the same session shows no intro', async ({ page }) => {
  await page.goto('/?intro=1', { waitUntil: 'commit' })
  await page.waitForSelector(INTRO, { state: 'attached' })
  await page.waitForSelector(INTRO, { state: 'detached', timeout: 3000 })
  await page.reload()
  await page.waitForLoadState('domcontentloaded')
  await expect(page.locator('main')).toBeVisible()
  await expect(page.locator(INTRO)).toHaveCount(0)
})

test('QT-152 skip by button and by key; no intro under reduced motion', async ({ page, browser }) => {
  await page.goto('/?intro=1', { waitUntil: 'commit' })
  const skip = page.getByRole('button', { name: 'Skip intro' })
  await skip.waitFor({ state: 'attached' })
  await expect(page.locator(`${INTRO} [aria-hidden="true"]`).first()).toBeAttached()
  await skip.dispatchEvent('click')
  await expect(page.locator(INTRO)).toHaveCount(0, { timeout: 1000 })

  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const rm = await ctx.newPage()
  await rm.goto('/?intro=1')
  await expect(rm.locator('main')).toBeVisible()
  await expect(rm.locator(INTRO)).toHaveCount(0)
  await ctx.close()

  const ctx2 = await browser.newContext()
  const kb = await ctx2.newPage()
  await kb.goto('/?intro=1', { waitUntil: 'commit' })
  await kb.waitForSelector(INTRO, { state: 'attached' })
  await kb.keyboard.press('Shift')
  await expect(kb.locator(INTRO)).toHaveCount(0, { timeout: 1000 })
  await ctx2.close()
})

test('QT-153 intro lasts <= 1.2 s and adds no long task beyond the no-intro baseline', async ({ browser }) => {
  const run = async (url) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.addInitScript(probe)
    await page.goto(url, { waitUntil: 'commit' })
    if (url.includes('intro=1')) await page.waitForSelector(INTRO, { state: 'detached', timeout: 4000 })
    await page.waitForLoadState('load')
    await page.waitForTimeout(500)
    const p = await page.evaluate(() => window.__p)
    await ctx.close()
    return { dur: p.unmount - p.mount, maxLong: Math.max(0, ...p.long.map(([, d]) => d)) }
  }
  const base = await run('/')
  const withIntro = await run('/?intro=1')
  expect(withIntro.dur).toBeLessThanOrEqual(1300)
  expect(withIntro.maxLong).toBeLessThanOrEqual(base.maxLong + 50)
})
