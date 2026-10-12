import { test, expect, gotoHome, freshPage } from './helpers.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

const secs = (v) => v.split(',').map((x) => (x.trim().endsWith('ms') ? parseFloat(x) / 1000 : parseFloat(x)))

test('QT-133 button feedback uses --dur-fast and scales on :active', async ({ page }) => {
  await gotoHome(page)
  const btn = page.locator('a.btn').first()
  const tr = await btn.evaluate((el) => getComputedStyle(el).transitionDuration)
  for (const d of secs(tr)) expect(d).toBeCloseTo(0.14, 2)
  await btn.scrollIntoViewIfNeeded()
  const box = await btn.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(200)
  const m = await btn.evaluate((el) => ({ t: getComputedStyle(el).transform, d: getComputedStyle(el).transitionDuration }))
  await page.mouse.up()
  const scale = parseFloat(m.t.match(/matrix\(([^,]+)/)[1])
  expect(scale).toBeGreaterThanOrEqual(0.96)
  expect(scale).toBeLessThanOrEqual(0.98)
  for (const d of secs(m.d)) expect(d).toBeCloseTo(0.08, 2)
})

test('QT-133 reduced motion: all --dur-* resolve to 0.01ms and no animation keeps running', async ({ browser }, testInfo) => {
  const { page, context } = await freshPage(browser, testInfo, { reducedMotion: 'reduce' })
  await gotoHome(page, { at: null })
  const durs = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement)
    return ['instant', 'fast', 'base', 'slow', 'deliberate', 'theme', 'intro-max'].map((k) => cs.getPropertyValue(`--dur-${k}`).trim())
  })
  for (const d of durs) expect(parseFloat(d)).toBe(0.01)
  await page.waitForTimeout(300)
  const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getComputedTiming().iterations === Infinity).length)
  expect(running).toBe(0)
  await context.close()
})
