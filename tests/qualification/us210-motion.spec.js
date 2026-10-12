import { test, expect } from './fixtures.js'

test('QT-158 reveal uses --dur-slow with a <= 60 ms stagger and runs once', async ({ page }) => {
  await page.goto('/')
  // the section slot is swapped when its lazy chunk loads; scroll by script and let the card appear (race fix, as QT-159)
  await page.evaluate(() => document.getElementById('about')?.scrollIntoView())
  const card = page.locator('#about .stat-card').nth(2)
  await expect(card).toBeAttached()
  await card.scrollIntoViewIfNeeded()
  await expect(card).toHaveClass(/visible/)
  const t = await card.evaluate((el) => {
    const cs = getComputedStyle(el)
    return { dur: cs.transitionDuration, delay: cs.transitionDelay }
  })
  expect(t.dur).toContain('0.36s')
  expect(parseFloat(t.delay.split(',')[0])).toBeLessThanOrEqual(0.18 + 1e-6)
  await page.locator('#contact').scrollIntoViewIfNeeded()
  await page.locator('#about').scrollIntoViewIfNeeded()
  await expect(card).toHaveClass(/visible/)
})

test('QT-159 hover lifts <= 4 px on hover devices; reduced motion shows sections with no reveal transform', async ({ page, browser }) => {
  await page.goto('/')
  // the section slot is swapped when its lazy chunk loads; scroll by script and let the card appear (race fix)
  await page.evaluate(() => document.getElementById('education')?.scrollIntoView())
  await expect(page.locator('#education .edu-card').first()).toBeAttached()
  await page.evaluate(() => document.getElementById('education')?.scrollIntoView())
  const card = page.locator('#education .edu-card').first()
  await expect(card).toHaveClass(/visible/)
  const hasHover = await page.evaluate(() => matchMedia('(hover: hover)').matches)
  if (hasHover) {
    await card.hover()
    await page.waitForTimeout(400)
    const ty = await card.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42)
    expect(Math.abs(ty)).toBeLessThanOrEqual(4.01)
  }
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const rm = await ctx.newPage()
  await rm.goto('/')
  await rm.waitForSelector('#about .reveal')
  const r = await rm.evaluate(async () => {
    await new Promise((res) => setTimeout(res, 300))
    const el = document.querySelector('#about .reveal')
    const cs = getComputedStyle(el)
    return { opacity: cs.opacity, transform: cs.transform }
  })
  expect(r.opacity).toBe('1')
  expect(r.transform === 'none' || r.transform === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true)
  await ctx.close()
})
