import { test, expect, only, gotoHome, freshPage, press, revealAll, collectErrors } from './helpers.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

test('QT-118 No uncaught errors or console errors after a full scroll-through', async ({ page }, testInfo) => {
  const errors = collectErrors(page)
  await gotoHome(page)
  await revealAll(page)
  await press(page.locator('nav .theme-btn'))
  await page.waitForTimeout(200)
  if (testInfo.project.name === 'mobile-chromium') {
    await press(page.locator('.hamburger'))
    await page.waitForTimeout(200)
    await press(page.locator('.mobile-menu a[href="#about"]'))
    await page.waitForTimeout(500)
  }
  expect(errors.pageErrors).toEqual([])
  expect(errors.consoleErrors).toEqual([])
  expect(errors.consoleWarnings.filter((w) => /react|warning:/i.test(w))).toEqual([])
})

test('QT-119 Usable with Google Fonts blocked', async ({ page }) => {
  const failedFonts = []
  page.on('requestfailed', (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) failedFonts.push(r.url())
  })
  await gotoHome(page)
  await revealAll(page)
  expect(failedFonts.length, 'font requests attempted and aborted').toBeGreaterThan(0)
  const headings = page.locator('h1, h2.section-title, #resume h3')
  await expect(headings).toHaveCount(10)
  for (let i = 0; i < 10; i++) {
    await expect(headings.nth(i)).toBeVisible()
    const b = await headings.nth(i).boundingBox()
    expect(b.width).toBeGreaterThan(0)
    expect(b.height).toBeGreaterThan(0)
  }
  await expect(page.locator('nav.nav')).toBeVisible()
  const fontLoaded = await page.evaluate(() => document.fonts.check('300 16px Barlow') && Array.from(document.fonts).some((f) => f.status === 'loaded'))
  expect(fontLoaded, 'web fonts must not be loaded').toBe(false)
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  expect(m.sw).toBeLessThanOrEqual(m.iw)
})

test('QT-120 Layout intact with Simple Icons CDN blocked', async ({ page, browser }, testInfo) => {
  const layout = (p) =>
    p.evaluate(() =>
      Array.from(document.querySelectorAll('.skill-cat')).map((cat) => {
        const chips = Array.from(cat.querySelectorAll('.skill-chip')).map((c) => c.getBoundingClientRect())
        return {
          rows: new Set(chips.map((r) => Math.round(r.top))).size,
          heights: chips.map((r) => Math.round(r.height)),
          n: chips.length,
        }
      }),
    )
  await gotoHome(page)
  await revealAll(page)
  const ok = await layout(page)
  const { page: bp, context } = await freshPage(browser, testInfo)
  await bp.route(/^https:\/\/cdn\.simpleicons\.org\//, (r) => r.abort('failed'))
  await gotoHome(bp)
  await revealAll(bp)
  await expect(bp.locator('.skill-chip')).toHaveCount(58)
  const chips = bp.locator('.skill-chip')
  for (let i = 0; i < 58; i++) await expect(chips.nth(i)).toBeVisible()
  await expect.poll(() => bp.locator('.skill-chip img').count(), { timeout: 15_000 }).toBe(0)
  const broken = await bp.evaluate(() => Array.from(document.querySelectorAll('img')).filter((i) => i.complete && i.naturalWidth === 0).length)
  expect(broken).toBe(0)
  const blocked = await layout(bp)
  for (const cat of blocked) {
    const min = Math.min(...cat.heights)
    const max = Math.max(...cat.heights)
    expect.soft(max - min, `chip heights ${cat.heights}`).toBeLessThanOrEqual(1)
  }
  expect(blocked.map((c) => c.rows)).toEqual(ok.map((c) => c.rows))
  await context.close()
})

test('QT-122 Content visible when IntersectionObserver is missing', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  const errors = collectErrors(page)
  await page.addInitScript(() => {
    delete window.IntersectionObserver
  })
  await gotoHome(page, { at: null })
  await expect
    .poll(() => page.evaluate(() => Array.from(document.querySelectorAll('.reveal')).filter((e) => !e.classList.contains('visible')).length))
    .toBe(0)
  expect(errors.pageErrors).toEqual([])
  const frames = () => page.locator('.gauge-widget .cluster-can pre').textContent() // CAN ticker advances from the first frame
  const a = await frames()
  await page.waitForTimeout(1500)
  expect(await frames()).not.toBe(a)
})
