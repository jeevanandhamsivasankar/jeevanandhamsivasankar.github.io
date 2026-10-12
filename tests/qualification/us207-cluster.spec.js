import { test, expect, gotoHome, only, scrollToY } from './helpers.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

// Count rAF calls made by the page.
const countRaf = (page) =>
  page.addInitScript(() => {
    window.__raf = 0
    const orig = window.requestAnimationFrame.bind(window)
    window.requestAnimationFrame = (cb) => { window.__raf += 1; return orig(cb) }
  })
const rafCount = (page) => page.evaluate(() => window.__raf)
const snap = (page) => page.evaluate(() => [
  document.querySelector('.cl-speed').textContent,
  document.querySelector('.cl-gear').textContent,
  document.querySelector('.cluster pre').textContent,
  document.querySelector('.cluster [class*="cl-arc"]').getAttribute('stroke-dasharray'),
].join('|'))

test('QT-144 cluster renders with HMI CLUSTER DEMO and SIMULATED labels', async ({ page }, ti) => {
  only(ti, 'D')
  await gotoHome(page, { at: null })
  const c = page.locator('.hero-center .cluster')
  await expect(c).toBeVisible()
  await expect(c).toHaveAttribute('role', 'img')
  await expect(c.locator('svg')).toBeVisible()
  await expect(c).toContainText('HMI CLUSTER DEMO')
  await expect(c).toContainText('SIMULATED')
  await page.waitForTimeout(1500)
  expect(await c.locator('g[transform^="rotate"]').count()).toBeGreaterThanOrEqual(2)
})

test('QT-145 rAF is not scheduled while the cluster is off-screen and resumes in view', async ({ page }, ti) => {
  only(ti, 'D')
  await countRaf(page)
  await gotoHome(page, { at: null })
  await page.waitForTimeout(500)
  await scrollToY(page, 2500)
  await page.waitForTimeout(600)
  const before = await rafCount(page)
  await page.waitForTimeout(2000)
  // other effects may use rAF; the cluster loop must not contribute (allow tiny slack for in-flight callbacks)
  const idle = (await rafCount(page)) - before
  await scrollToY(page, 0)
  await page.waitForTimeout(300)
  const b2 = await rafCount(page)
  await page.waitForTimeout(1500)
  expect((await rafCount(page)) - b2).toBeGreaterThan(5)
  expect(idle).toBeLessThan(5)
})

test('QT-146 reduced motion shows a static frame', async ({ browser }, ti) => {
  only(ti, 'D')
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1366, height: 800 }, timezoneId: 'Asia/Kolkata' })
  const page = await ctx.newPage()
  await countRaf(page)
  await gotoHome(page, { at: null })
  const a = await snap(page)
  await page.waitForTimeout(3000)
  expect(await snap(page)).toBe(a)
  expect(a.split('|')[0]).not.toBe('0')
  await ctx.close()
})

test('QT-147 mobile: compact cluster below hero text, no horizontal scroll, paused until in view', async ({ page }, ti) => {
  only(ti, 'M')
  await countRaf(page)
  await gotoHome(page, { at: null })
  const c = page.locator('.hero-center .cluster')
  await expect(c).toBeVisible()
  const [cb, hb] = [await c.boundingBox(), await page.locator('.hero-content').boundingBox()]
  expect(cb.y).toBeGreaterThanOrEqual(hb.y + hb.height - 2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  const w = page.viewportSize().width
  expect(cb.x).toBeGreaterThanOrEqual(0)
  expect(cb.x + cb.width).toBeLessThanOrEqual(w)
  await page.waitForTimeout(500)
  const b = await rafCount(page)
  await page.waitForTimeout(1000)
  const below = (await c.boundingBox()).y > 844
  if (below) expect((await rafCount(page)) - b).toBeLessThan(5)
})

test('QT-148 hidden tab stops the loop', async ({ page }, ti) => {
  only(ti, 'D')
  await countRaf(page)
  await gotoHome(page, { at: null })
  await page.waitForTimeout(500)
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.waitForTimeout(300)
  const b = await rafCount(page)
  await page.waitForTimeout(2000)
  expect((await rafCount(page)) - b).toBeLessThan(5)
  const x = await snap(page)
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.waitForTimeout(1500)
  expect(await snap(page)).not.toBe(x)
})

test('QT-144 frame cost stays under 4 ms (needle loop)', async ({ page }, ti) => {
  only(ti, 'D')
  await gotoHome(page, { at: null })
  const avg = await page.evaluate(() => new Promise((res) => {
    const costs = []
    const orig = window.requestAnimationFrame.bind(window)
    window.requestAnimationFrame = (cb) => orig((t) => { const s = performance.now(); cb(t); costs.push(performance.now() - s) })
    setTimeout(() => res(costs.length > 20 ? costs.reduce((a, b) => a + b, 0) / costs.length : 999), 2500)
  }))
  expect(avg).toBeLessThan(4)
})
