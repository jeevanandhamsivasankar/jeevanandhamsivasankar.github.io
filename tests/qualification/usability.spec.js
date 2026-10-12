import { test, expect, only, gotoHome, press, settleScroll } from './helpers.js'
import { NAV } from './expected.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

test('QT-115 Resume and contact within two interactions', async ({ page }, testInfo) => {
  await gotoHome(page)
  const resume = page.locator('.hero-cta a', { hasText: 'Resume' })
  await expect(resume).toBeInViewport()
  if (testInfo.project.name === 'mobile-chromium') {
    await press(page.locator('.hamburger'))
    await press(page.locator('.mobile-menu a[href="#contact"]'))
  } else {
    await press(page.locator('.nav-links a[href="#contact"]'))
  }
  await expect(page.locator('.c-email')).toBeInViewport({ timeout: 10_000 })
})

test('QT-116 Section label not hidden under the fixed nav after navigation', async ({ page }, testInfo) => {
  only(testInfo, 'D')
  await gotoHome(page)
  for (const { id } of NAV) {
    await press(page.locator(`.nav-links a[href="#${id}"]`))
    await page.waitForTimeout(250)
    await settleScroll(page)
    const m = await page.evaluate((sid) => ({
      label: document.querySelector(`#${sid} .section-label`).getBoundingClientRect().top,
      nav: document.querySelector('nav.nav').getBoundingClientRect().bottom,
    }), id)
    expect(m.label, `${id}: label top ${m.label} vs nav bottom ${m.nav}`).toBeGreaterThanOrEqual(m.nav)
  }
})

test('QT-117 Touch target sizes', async ({ page }, testInfo) => {
  only(testInfo, 'M')
  await gotoHome(page)
  await press(page.locator('.hamburger'))
  await expect(page.locator('.mobile-menu.open')).toBeVisible()
  const targets = {
    'menu links': page.locator('.mobile-menu a.nav-link'),
    'menu theme button': page.locator('.mobile-menu .theme-btn'),
    hamburger: page.locator('.hamburger'),
    'nav theme button': page.locator('nav .theme-btn'),
    'contact links': page.locator('.contact-item'),
  }
  const small = []
  for (const [name, loc] of Object.entries(targets)) {
    const n = await loc.count()
    expect(n, name).toBeGreaterThan(0)
    if (name === 'contact links') expect(n).toBe(5)
    for (let i = 0; i < n; i++) {
      const b = await loc.nth(i).boundingBox()
      expect.soft(b.width, `${name}[${i}] width`).toBeGreaterThanOrEqual(24)
      expect.soft(b.height, `${name}[${i}] height`).toBeGreaterThanOrEqual(24)
      if (b.width < 44 || b.height < 44) small.push(`${name}[${i}] ${Math.round(b.width)}x${Math.round(b.height)}`)
    }
  }
  testInfo.annotations.push({ type: 'below-44px (informational)', description: small.join('; ').slice(0, 1500) })
})
