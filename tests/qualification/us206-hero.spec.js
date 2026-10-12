import { test, expect, gotoHome, only } from './helpers.js'

test.use({ timezoneId: 'Asia/Kolkata', locale: 'en-IN' })

test('QT-141 one primary and one secondary CTA above the fold, labels unchanged', async ({ page }, ti) => {
  only(ti, 'D')
  await gotoHome(page)
  const p = page.locator('.hero-cta .btn-primary')
  const s = page.locator('.hero-cta .btn-secondary')
  await expect(p).toHaveCount(1)
  await expect(s).toHaveCount(1)
  await expect(p).toContainText('View Projects')
  await expect(s).toContainText('Get In Touch')
  await expect(p).toHaveAttribute('href', '#projects')
  await expect(s).toHaveAttribute('href', '#contact')
  for (const l of [p, s]) {
    const b = await l.boundingBox()
    expect(b.y + b.height).toBeLessThanOrEqual(800)
  }
  const bg = await p.evaluate((e) => getComputedStyle(e).backgroundImage)
  expect(bg).toContain('gradient')
  const status = page.locator('.hero-status')
  await expect(status).toContainText('OPEN TO OPPORTUNITIES')
  const want = await page.evaluate(() => {
    const t = document.createElement('i')
    t.style.color = 'var(--color-success, var(--green))'
    document.body.appendChild(t)
    const c = getComputedStyle(t).color
    t.remove()
    return c
  })
  expect(await status.evaluate((e) => getComputedStyle(e).color)).toBe(want)
})

test('QT-142 mobile: h1 and stacked full-width CTAs fit above the fold', async ({ page }, ti) => {
  only(ti, 'M')
  await gotoHome(page)
  const h1 = await page.locator('h1').boundingBox()
  expect(h1.y + h1.height).toBeLessThan(844)
  const vw = page.viewportSize().width
  const boxes = []
  for (const l of await page.locator('.hero-cta .btn-primary, .hero-cta .btn-secondary').all()) boxes.push(await l.boundingBox())
  expect(boxes).toHaveLength(2)
  for (const b of boxes) {
    expect(b.y + b.height).toBeLessThanOrEqual(844)
    expect(b.width).toBeGreaterThan(vw * 0.7)
  }
  expect(boxes[1].y).toBeGreaterThan(boxes[0].y + boxes[0].height - 1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})

test('QT-143 Tab reaches primary then secondary CTA with visible focus', async ({ page }, ti) => {
  only(ti, 'D')
  await gotoHome(page)
  await page.locator('.hero-typewriter').evaluate(() => {
    const first = document.querySelector('.hero-cta .btn-primary')
    first.focus()
  })
  await expect(page.locator('.hero-cta .btn-primary')).toBeFocused()
  expect(await page.locator('.hero-cta .btn-primary').evaluate((e) => getComputedStyle(e).outlineStyle)).not.toBe('none')
  await page.keyboard.press('Tab')
  await expect(page.locator('.hero-cta .btn-secondary')).toBeFocused()
  expect(await page.locator('.hero-cta .btn-secondary').evaluate((e) => getComputedStyle(e).outlineStyle)).not.toBe('none')
  const order = await page.evaluate(() =>
    [...document.querySelectorAll('#hero a[href], #hero button, #hero [tabindex]:not([tabindex="-1"])')].map((e) => e.textContent.trim()),
  )
  expect(order[0]).toContain('View Projects')
  expect(order[1]).toContain('Get In Touch')
})
