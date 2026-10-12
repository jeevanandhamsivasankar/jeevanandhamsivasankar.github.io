import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test, expect, only, gotoHome, scrollToSection, scrollToY, distAssets, ROOT } from './helpers.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

const SECTION_CHUNK = /\/assets\/(About|Experience|Skills|Projects|Design|Education|Certifications|Resume|Contact)-[^/]+\.js$/

test('QT-083 Lazy chunks are separate and not needed for the first hero render', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  const chunks = distAssets().filter((f) => f.endsWith('.js') && SECTION_CHUNK.test(`/assets/${f}`))
  expect(chunks).toHaveLength(9)
  const log = []
  await page.route(/\/assets\/(About|Experience|Skills|Projects|Design|Education|Certifications|Resume|Contact|Section)-[^/]+\.js$/, async (route) => {
    log.push({ url: route.request().url(), t: Date.now() })
    await new Promise((r) => setTimeout(r, 3000))
    await route.continue().catch(() => {})
  })
  const responded = []
  page.on('response', (r) => {
    if (SECTION_CHUNK.test(r.url())) responded.push(r.url())
  })
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('nav.nav')).toBeVisible()
  const respondedAtH1 = responded.length
  expect(respondedAtH1, 'section chunk responses already delivered when the hero h1 is visible').toBe(0)
  testInfo.annotations.push({ type: 'chunk-requests', description: `${log.length} section/shared chunk requests delayed by 3 s while h1 was already visible` })
  expect(log.length).toBeGreaterThan(0)
})

test('QT-084 Profile image preload, explicit size and CLS', async ({ page }, testInfo) => {
  only(testInfo, 'M')
  const html = readFileSync(join(ROOT, 'dist/index.html'), 'utf8')
  const link = [...html.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]).find((l) => /rel="preload"/.test(l))
  expect(link, 'preload link').toBeTruthy()
  expect(link).toMatch(/as="image"/)
  expect(link).toMatch(/href="\/profile\.webp"/)
  expect(link).toMatch(/type="image\/webp"/)
  await page.addInitScript(() => {
    window.__cls = 0
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await gotoHome(page, { at: null })
  await page.waitForTimeout(3000)
  const img = page.locator('img.profile-photo')
  await expect(img).toHaveAttribute('width', '600')
  await expect(img).toHaveAttribute('height', '900')
  const cls = await page.evaluate(() => window.__cls)
  testInfo.annotations.push({ type: 'CLS', description: String(cls) })
  expect(cls).toBeLessThan(0.1)
})

test('QT-085 Passive listeners and cleanup', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await page.addInitScript(() => {
    window.__listeners = []
    const orig = EventTarget.prototype.addEventListener
    EventTarget.prototype.addEventListener = function (type, fn, opts) {
      if (['scroll', 'wheel', 'touchmove', 'mousemove'].includes(type)) {
        const passive = typeof opts === 'object' && opts !== null ? opts.passive === true : false
        const t = this === window ? 'window' : this === document ? 'document' : this.nodeName || String(this)
        window.__listeners.push({ type, passive, target: t })
      }
      return orig.call(this, type, fn, opts)
    }
  })
  await gotoHome(page, { at: null })
  await page.mouse.move(300, 300)
  const list = await page.evaluate(() => window.__listeners)
  expect(list.length).toBeGreaterThan(0)
  // React's own root-level delegation listeners are excluded (target is the #root container or document, registered by react-dom)
  const bad = list.filter((l) => !l.passive && !['DIV', 'document'].includes(l.target))
  expect(bad, `non-passive app listeners: ${JSON.stringify(bad)}`).toEqual([])
  testInfo.annotations.push({ type: 'listeners', description: JSON.stringify(list).slice(0, 800) })
})

test('QT-086 Lighthouse mobile performance score', async (_fixtures, testInfo) => {
  only(testInfo, 'M')
  test.skip(true, 'Manual pre-release gate (STP): npx lighthouse@12 http://localhost:4173 --form-factor=mobile --only-categories=performance; score >= 80. Not automated (network/CPU variance).')
})

async function rafCount(page) {
  return page.evaluate(() => window.__raf)
}

test('QT-087 Speedometer loop runs only when visible', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.__raf = 0
    const orig = window.requestAnimationFrame.bind(window)
    window.requestAnimationFrame = (cb) => {
      window.__raf++
      return orig(cb)
    }
  })
  await gotoHome(page, { at: null })
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)
  if (testInfo.project.name === 'mobile-chromium') {
    const a = await rafCount(page)
    await page.waitForTimeout(2000)
    expect(await rafCount(page) - a, 'new rAF calls over 2 s while the gauge is hidden').toBe(0)
    return
  }
  const speed = () => page.locator('.gauge-widget svg text').first().textContent()
  let a = await rafCount(page)
  await page.waitForTimeout(1000)
  expect(await rafCount(page)).toBeGreaterThan(a)
  await page.waitForTimeout(1500)
  const before = Number(await speed())
  await scrollToSection(page, 'contact')
  await page.waitForTimeout(300)
  a = await rafCount(page)
  await page.waitForTimeout(2000)
  expect(await rafCount(page) - a, 'rAF calls while scrolled away').toBe(0)
  // hidden tab (visibility emulated; CDP lifecycle freezing is not needed for the hook's visibilitychange path)
  await scrollToY(page, 0)
  await page.waitForTimeout(600)
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.waitForTimeout(300)
  a = await rafCount(page)
  await page.waitForTimeout(1500)
  expect(await rafCount(page) - a, 'rAF calls while the tab is hidden').toBe(0)
  const hiddenSpeed = Number(await speed())
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.waitForTimeout(300)
  expect(await rafCount(page)).toBeGreaterThan(a)
  const after = Number(await speed())
  // resumes from the current t: continues near the last value instead of restarting at the t=0 frame (88)
  expect(Math.abs(after - hiddenSpeed)).toBeLessThan(15)
  testInfo.annotations.push({ type: 'speed', description: `before ${before}, hidden ${hiddenSpeed}, resumed ${after}` })
})
